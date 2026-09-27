"""Integration tests for the PostgreSQL auth repository rule:
the quadrigramme must match an official_main or official_backup (or the project
has no scopes yet: bootstrap).

Skipped when ``PROTAB_TEST_DATABASE_URL`` is not set.
"""

import os

import psycopg
import pytest

from protab.adapters.outbound.persistence.postgres_auth_repository import (
    PostgresAuthRepository,
)
from protab.adapters.outbound.persistence.postgres_scope_monitoring_repository import (
    PostgresScopeMonitoringRepository,
    reset_current_project,
    set_current_project,
)
from protab.domain.entities.scope_monitoring import KnowledgeBase, Officials, ScopeMonitoring

TEST_DATABASE_URL = os.getenv("PROTAB_TEST_DATABASE_URL")

pytestmark = pytest.mark.skipif(
    not TEST_DATABASE_URL,
    reason="PROTAB_TEST_DATABASE_URL not set: PostgreSQL integration tests are skipped.",
)

PROJECT_ID = "project-auth"


def truncate_all() -> None:
    assert TEST_DATABASE_URL is not None
    with psycopg.connect(TEST_DATABASE_URL, autocommit=True) as conn:
        conn.execute(
            "TRUNCATE auth_sessions, scope_monitorings, projects RESTART IDENTITY CASCADE"
        )


@pytest.fixture(autouse=True)
def bootstrap_password(monkeypatch):
    """The bootstrap project password is mandatory: no default is provided.

    ``PostgresAuthRepository.connect()`` refuses to seed the first project
    without it, so the test suite must supply one explicitly.
    """
    monkeypatch.setenv("PROTAB_DEFAULT_PROJECT_PASSWORD", "test-bootstrap-password")


@pytest.fixture
def auth():
    assert TEST_DATABASE_URL is not None
    repository = PostgresAuthRepository(TEST_DATABASE_URL)
    repository.connect()
    truncate_all()
    repository.create_project(PROJECT_ID, "Projet Auth", "secret")
    yield repository
    repository.close()


@pytest.fixture
def scopes():
    assert TEST_DATABASE_URL is not None
    repository = PostgresScopeMonitoringRepository(TEST_DATABASE_URL)
    repository.connect()
    yield repository
    repository.close()


def empty_database() -> None:
    """Create the schema, then drop every project so a bootstrap is pending."""
    assert TEST_DATABASE_URL is not None
    seed = PostgresAuthRepository(TEST_DATABASE_URL)
    seed.connect()
    truncate_all()
    seed.close()


def test_connect_refuses_to_bootstrap_without_password(monkeypatch):
    """Seeding the first project demands an explicit, non-guessable password.

    No default is provided on purpose: ``GET /projects`` is unauthenticated, so
    a well-known fallback would hand the first project to anyone who guesses
    its code.
    """
    empty_database()
    monkeypatch.delenv("PROTAB_DEFAULT_PROJECT_PASSWORD", raising=False)

    assert TEST_DATABASE_URL is not None
    repository = PostgresAuthRepository(TEST_DATABASE_URL)
    try:
        with pytest.raises(RuntimeError, match="PROTAB_DEFAULT_PROJECT_PASSWORD"):
            repository.connect()
    finally:
        repository.close()


def test_connect_restarts_without_password_when_project_already_exists(monkeypatch):
    """The password is only needed to seed; a restart must not require it.

    Requiring the secret on every boot would break every existing deployment
    on upgrade, for a value that is never used once the project exists.
    """
    empty_database()

    # Seed the project while the secret is still available.
    assert TEST_DATABASE_URL is not None
    monkeypatch.setenv("PROTAB_DEFAULT_PROJECT_CODE", "protab")
    monkeypatch.setenv("PROTAB_DEFAULT_PROJECT_NAME", "Projet principal")
    seed = PostgresAuthRepository(TEST_DATABASE_URL)
    seed.connect()
    seed.close()

    monkeypatch.delenv("PROTAB_DEFAULT_PROJECT_PASSWORD", raising=False)

    repository = PostgresAuthRepository(TEST_DATABASE_URL)
    try:
        repository.connect()
        assert repository.get_project("protab") is not None
    finally:
        repository.close()


@pytest.fixture(autouse=True)
def project():
    token = set_current_project(PROJECT_ID)
    yield
    reset_current_project(token)


def add_scope(
    scopes: PostgresScopeMonitoringRepository,
    main: str = "ABCD",
    backup: str = "WXYZ",
) -> None:
    scope = ScopeMonitoring(
        id=f"scope-{main}",
        name=f"Scope {main}",
        knowledge=KnowledgeBase(id="KB-00000001"),
        officials=Officials(main=main, backup=backup),
    )
    scopes.save(scope)


def test_bootstrap_allows_any_quadrigramme_when_no_scope(auth):
    assert auth.authenticate(PROJECT_ID, "ZZZZ", "secret") is True
    assert auth.authenticate(PROJECT_ID, "toto", "secret") is True


def test_wrong_password_is_rejected(auth):
    assert auth.authenticate(PROJECT_ID, "ABCD", "badpass") is False


def test_official_main_and_backup_authenticate(auth, scopes):
    add_scope(scopes, main="ABCD", backup="WXYZ")

    assert auth.authenticate(PROJECT_ID, "ABCD", "secret") is True
    assert auth.authenticate(PROJECT_ID, "WXYZ", "secret") is True
    assert auth.authenticate(PROJECT_ID, "ZZZZ", "secret") is False


def test_lowercase_quadrigramme_is_normalized(auth, scopes):
    add_scope(scopes, main="ABCD", backup="WXYZ")

    assert auth.authenticate(PROJECT_ID, "abcd", "secret") is True
    assert auth.authenticate(PROJECT_ID, "wxyz", "secret") is True


def test_backup_split_form_auths_both_codes(auth, scopes):
    add_scope(scopes, main="ABCD", backup="MLOZ/MRAM")

    assert auth.authenticate(PROJECT_ID, "MLOZ", "secret") is True
    assert auth.authenticate(PROJECT_ID, "MRAM", "secret") is True
    assert auth.authenticate(PROJECT_ID, "MLOZ/MRAM", "secret") is False


def test_backup_split_tolerates_spaces(auth, scopes):
    add_scope(scopes, main="ABCD", backup="MLOZ / MRAM")

    assert auth.authenticate(PROJECT_ID, "mloz", "secret") is True
    assert auth.authenticate(PROJECT_ID, "mram", "secret") is True


def test_main_split_form_auths_both_codes(auth, scopes):
    """``official_main`` encodes several codes just like ``official_backup``."""
    add_scope(scopes, main="ABCD/EFGH", backup="WXYZ")

    assert auth.authenticate(PROJECT_ID, "ABCD", "secret") is True
    assert auth.authenticate(PROJECT_ID, "EFGH", "secret") is True
    assert auth.authenticate(PROJECT_ID, "ABCD/EFGH", "secret") is False


def test_backup_placeholder_is_not_a_login_code(auth, scopes):
    """``?`` marks the absence of a backup official, it is not a code."""
    add_scope(scopes, main="ABCD", backup="MRAM/ ?")

    assert auth.authenticate(PROJECT_ID, "MRAM", "secret") is True
    assert auth.authenticate(PROJECT_ID, "?", "secret") is False


def test_project_non_working_days_default_and_update(auth):
    project = auth.get_project(PROJECT_ID)
    assert project is not None
    assert project.non_working_days == {
        "excluded_weekdays": [6, 7],
        "excluded_dates": [],
    }

    updated = auth.update_non_working_days(
        PROJECT_ID, [7, 6, 6], ["2026-12-25", "2026-12-25"]
    )
    assert updated is not None
    assert updated.non_working_days == {
        "excluded_weekdays": [6, 7],
        "excluded_dates": ["2026-12-25"],
    }
