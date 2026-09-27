"""Integration tests for the ``protab-project`` administrative command.

The command talks to PostgreSQL through the real repository, so these tests
exercise the actual SQL rather than a stub.
"""

import os

import psycopg
import pytest

from protab import project_admin
from protab.adapters.outbound.persistence.postgres_auth_repository import (
    PostgresAuthRepository,
    _check_password,
)

TEST_DATABASE_URL = os.getenv("PROTAB_TEST_DATABASE_URL")

pytestmark = pytest.mark.skipif(
    not TEST_DATABASE_URL,
    reason="PROTAB_TEST_DATABASE_URL not set: PostgreSQL integration tests are skipped.",
)

PROJECT_ID = "project-admin"


@pytest.fixture(autouse=True)
def bootstrap_password(monkeypatch):
    monkeypatch.setenv("PROTAB_DEFAULT_PROJECT_PASSWORD", "test-bootstrap-password")
    monkeypatch.setenv("DATABASE_URL", TEST_DATABASE_URL or "")


@pytest.fixture
def repository():
    assert TEST_DATABASE_URL is not None
    with psycopg.connect(TEST_DATABASE_URL, autocommit=True) as conn:
        conn.execute(
            "TRUNCATE auth_sessions, scope_monitorings, projects RESTART IDENTITY CASCADE"
        )
    repo = PostgresAuthRepository(TEST_DATABASE_URL)
    repo.connect()
    repo.create_project(PROJECT_ID, "Projet Admin", "original-secret")
    yield repo
    repo.close()


def stored_hash(project_id: str) -> str:
    assert TEST_DATABASE_URL is not None
    with psycopg.connect(TEST_DATABASE_URL) as conn:
        row = conn.execute(
            "SELECT password_hash FROM projects WHERE id = %s", (project_id,)
        ).fetchone()
    assert row is not None
    return row[0]


def run(monkeypatch, *argv: str, password: str) -> None:
    monkeypatch.setattr("getpass.getpass", lambda *a, **k: password)
    monkeypatch.setattr("sys.argv", ["protab-project", *argv])
    project_admin.main()


def test_set_password_replaces_the_hash(repository, monkeypatch, capsys):
    run(monkeypatch, "set-password", PROJECT_ID, password="brand-new-secret")

    assert _check_password("brand-new-secret", stored_hash(PROJECT_ID)) is True
    assert _check_password("original-secret", stored_hash(PROJECT_ID)) is False
    assert "set-password" not in capsys.readouterr().err


def test_set_password_allows_the_new_credentials(repository, monkeypatch):
    run(monkeypatch, "set-password", PROJECT_ID, password="brand-new-secret")

    assert repository.authenticate(PROJECT_ID, "ZZZZ", "brand-new-secret") is True
    assert repository.authenticate(PROJECT_ID, "ZZZZ", "original-secret") is False


def test_set_password_rejects_an_unknown_project(repository, monkeypatch):
    with pytest.raises(SystemExit) as excinfo:
        run(monkeypatch, "set-password", "does-not-exist", password="whatever")

    assert "does-not-exist" in str(excinfo.value)


def test_set_password_requires_a_non_empty_password(repository, monkeypatch):
    with pytest.raises(SystemExit) as excinfo:
        run(monkeypatch, "set-password", PROJECT_ID, password="   ")

    assert "mot de passe" in str(excinfo.value).lower()


def test_set_password_revokes_existing_sessions(repository, monkeypatch):
    """Rotating a leaked password must not leave old sessions usable."""
    session = repository.create_session(PROJECT_ID, "ZZZZ")
    assert repository.find_session(session.token) is not None

    run(monkeypatch, "set-password", PROJECT_ID, password="brand-new-secret")

    assert repository.find_session(session.token) is None
