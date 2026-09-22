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


def test_main_does_not_split(auth, scopes):
    add_scope(scopes, main="ABCD/EFGH", backup="WXYZ")

    assert auth.authenticate(PROJECT_ID, "ABCD", "secret") is False
    assert auth.authenticate(PROJECT_ID, "EFGH", "secret") is False