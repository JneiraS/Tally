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
    monkeypatch.setenv("PROTAB_DEFAULT_PROJECT_ADMIN_CODE", "BOOT")
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


# --- Administrators --------------------------------------------------------
#
# This command is the only way back into a locked project: it needs the
# database, not a session.


def test_add_admin_grants_access(repository, monkeypatch, capsys):
    run(monkeypatch, "add-admin", PROJECT_ID, "MLOZ", password="")

    assert repository.list_admins(PROJECT_ID) == ["MLOZ"]
    assert "MLOZ" in capsys.readouterr().out


def test_add_admin_grants_access_although_no_scope_declares_it(
    repository, monkeypatch
):
    """The whole point: the code belongs to the project, not to a scope."""
    run(monkeypatch, "add-admin", PROJECT_ID, "MLOZ", password="")

    assert repository.authenticate(PROJECT_ID, "MLOZ", "original-secret") is True


def test_add_admin_normalizes_the_code(repository, monkeypatch):
    run(monkeypatch, "add-admin", PROJECT_ID, " mloz ", password="")

    assert repository.list_admins(PROJECT_ID) == ["MLOZ"]


def test_add_admin_reports_an_existing_administrator(repository, monkeypatch, capsys):
    run(monkeypatch, "add-admin", PROJECT_ID, "MLOZ", password="")
    capsys.readouterr()

    run(monkeypatch, "add-admin", PROJECT_ID, "MLOZ", password="")

    assert repository.list_admins(PROJECT_ID) == ["MLOZ"]
    assert "déjà" in capsys.readouterr().out


def test_add_admin_rejects_an_unknown_project(repository, monkeypatch):
    with pytest.raises(SystemExit) as excinfo:
        run(monkeypatch, "add-admin", "does-not-exist", "MLOZ", password="")

    assert "does-not-exist" in str(excinfo.value)


def test_add_admin_rejects_a_code_no_one_could_type(repository, monkeypatch):
    """``MLOZ/MRAM`` is the scope list form; as an admin it could never be
    matched by a login, so it must be refused rather than stored."""
    with pytest.raises(SystemExit) as excinfo:
        run(monkeypatch, "add-admin", PROJECT_ID, "MLOZ/MRAM", password="")

    assert repository.list_admins(PROJECT_ID) == []
    assert "MLOZ/MRAM" in str(excinfo.value)


def test_list_admins_shows_the_administrators(repository, monkeypatch, capsys):
    run(monkeypatch, "add-admin", PROJECT_ID, "MLOZ", password="")
    run(monkeypatch, "add-admin", PROJECT_ID, "MRAM", password="")
    capsys.readouterr()

    run(monkeypatch, "list-admins", PROJECT_ID, password="")

    out = capsys.readouterr().out
    assert "MLOZ" in out
    assert "MRAM" in out


def test_list_admins_reports_an_unknown_project(repository, monkeypatch):
    with pytest.raises(SystemExit) as excinfo:
        run(monkeypatch, "list-admins", "does-not-exist", password="")

    assert "does-not-exist" in str(excinfo.value)


def test_remove_admin_revokes_the_access(repository, monkeypatch):
    """The command must close the sessions it orphans.

    Whether a removed administrator can still log in is covered by
    ``postgres_auth_repository_test``: it needs a scope, otherwise the
    bootstrap window accepts every quadrigramme and would prove nothing.
    """
    run(monkeypatch, "add-admin", PROJECT_ID, "MLOZ", password="")
    run(monkeypatch, "add-admin", PROJECT_ID, "MRAM", password="")
    session = repository.create_session(PROJECT_ID, "MLOZ")

    run(monkeypatch, "remove-admin", PROJECT_ID, "MLOZ", password="")

    assert repository.list_admins(PROJECT_ID) == ["MRAM"]
    assert repository.find_session(session.token) is None


def test_remove_admin_reports_an_unknown_code(repository, monkeypatch):
    with pytest.raises(SystemExit) as excinfo:
        run(monkeypatch, "remove-admin", PROJECT_ID, "ZZZZ", password="")

    assert "ZZZZ" in str(excinfo.value)


def test_remove_admin_refuses_the_last_administrator(repository, monkeypatch, capsys):
    """Removing it would leave nobody able to open the project again."""
    run(monkeypatch, "add-admin", PROJECT_ID, "MLOZ", password="")
    capsys.readouterr()

    with pytest.raises(SystemExit) as excinfo:
        run(monkeypatch, "remove-admin", PROJECT_ID, "MLOZ", password="")

    assert "dernier" in str(excinfo.value).lower()
    assert repository.list_admins(PROJECT_ID) == ["MLOZ"]


def test_remove_admin_allows_a_non_last_administrator(repository, monkeypatch):
    run(monkeypatch, "add-admin", PROJECT_ID, "MLOZ", password="")
    run(monkeypatch, "add-admin", PROJECT_ID, "MRAM", password="")

    run(monkeypatch, "remove-admin", PROJECT_ID, "MLOZ", password="")

    assert repository.list_admins(PROJECT_ID) == ["MRAM"]


def test_create_project_can_named_its_first_administrator(repository, monkeypatch):
    run(
        monkeypatch,
        "projet-neuf",
        "Projet Neuf",
        "--admin",
        "MLOZ",
        password="new-secret",
    )

    assert repository.list_admins("projet-neuf") == ["MLOZ"]


def test_create_project_without_administrator_reminds_to_name_one(
    repository, monkeypatch, capsys
):
    """The historical form stays valid, but it must not fail silently."""
    run(monkeypatch, "projet-neuf", "Projet Neuf", password="new-secret")

    assert repository.list_admins("projet-neuf") == []
    assert "add-admin" in capsys.readouterr().out
