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
from protab.domain.value_objects.non_working_days import NonWorkingDays

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
    """The bootstrap secrets are mandatory: no default is provided.

    ``PostgresAuthRepository.connect()`` refuses to seed the first project
    without a password, nor to seed it without an administrator: a project
    that owns a scope and no administrator can be entered by nobody at all.
    """
    monkeypatch.setenv("PROTAB_DEFAULT_PROJECT_PASSWORD", "test-bootstrap-password")
    monkeypatch.setenv("PROTAB_DEFAULT_PROJECT_ADMIN_CODE", "BOOT")


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


def test_connect_refuses_to_bootstrap_without_admin_code(monkeypatch):
    """A project must never be created without someone able to enter it.

    Once it owns a scope, ``authenticate()`` only accepts a quadrigramme
    declared by that scope. Seeding the project without an administrator would
    therefore produce an instance nobody can ever open.
    """
    empty_database()
    monkeypatch.delenv("PROTAB_DEFAULT_PROJECT_ADMIN_CODE", raising=False)

    assert TEST_DATABASE_URL is not None
    repository = PostgresAuthRepository(TEST_DATABASE_URL)
    try:
        with pytest.raises(RuntimeError, match="PROTAB_DEFAULT_PROJECT_ADMIN_CODE"):
            repository.connect()
    finally:
        repository.close()


def test_connect_reports_the_password_before_the_admin_code(monkeypatch):
    """Both secrets are missing: the message must name the one resolved first.

    Resolving the administrator first would rename the failure of the existing
    password check and send an operator looking at the wrong variable.
    """
    empty_database()
    monkeypatch.delenv("PROTAB_DEFAULT_PROJECT_PASSWORD", raising=False)
    monkeypatch.delenv("PROTAB_DEFAULT_PROJECT_ADMIN_CODE", raising=False)

    assert TEST_DATABASE_URL is not None
    repository = PostgresAuthRepository(TEST_DATABASE_URL)
    try:
        with pytest.raises(RuntimeError, match="PROTAB_DEFAULT_PROJECT_PASSWORD"):
            repository.connect()
    finally:
        repository.close()


def test_connect_restarts_without_secrets_when_project_already_exists(monkeypatch):
    """The secrets are only needed to seed; a restart must not require them.

    Requiring them on every boot would break every existing deployment on
    upgrade, for values that are never used once the project exists.
    """
    empty_database()

    # Seed the project while the secrets are still available.
    assert TEST_DATABASE_URL is not None
    monkeypatch.setenv("PROTAB_DEFAULT_PROJECT_CODE", "protab")
    monkeypatch.setenv("PROTAB_DEFAULT_PROJECT_NAME", "Projet principal")
    seed = PostgresAuthRepository(TEST_DATABASE_URL)
    seed.connect()
    seed.close()

    monkeypatch.delenv("PROTAB_DEFAULT_PROJECT_PASSWORD", raising=False)
    monkeypatch.delenv("PROTAB_DEFAULT_PROJECT_ADMIN_CODE", raising=False)

    repository = PostgresAuthRepository(TEST_DATABASE_URL)
    try:
        repository.connect()
        assert repository.get_project("protab") is not None
    finally:
        repository.close()


def test_bootstrap_grants_the_configured_admin_code(monkeypatch):
    """The seeded administrator must be usable as a login right away."""
    empty_database()
    assert TEST_DATABASE_URL is not None
    monkeypatch.setenv("PROTAB_DEFAULT_PROJECT_CODE", "protab")
    monkeypatch.setenv("PROTAB_DEFAULT_PROJECT_NAME", "Projet principal")
    repository = PostgresAuthRepository(TEST_DATABASE_URL)
    try:
        repository.connect()
        assert repository.is_admin("protab", "BOOT") is True
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


def add_scope_for(
    project_id: str,
    scopes: PostgresScopeMonitoringRepository,
    main: str = "ABCD",
    backup: str = "WXYZ",
) -> None:
    """Give one project a scope, switching the tenant the adapter reads.

    Both tenants need one: a project without any scope still accepts every
    quadrigramme (the bootstrap window), which would mask any scoping check.
    """
    token = set_current_project(project_id)
    try:
        add_scope(scopes, main=main, backup=backup)
    finally:
        reset_current_project(token)


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
    assert project.non_working_days == NonWorkingDays.default()

    updated = auth.update_non_working_days(
        PROJECT_ID, [7, 6, 6], ["2026-12-25", "2026-12-25"]
    )
    assert updated is not None
    assert updated.non_working_days == NonWorkingDays(
        excluded_weekdays=(6, 7), excluded_dates=("2026-12-25",)
    )


def test_non_working_days_survive_the_column_round_trip(auth):
    """La colonne est du JSONB non typé : ce qui est écrit doit être relu à
    l'identique, sans quoi un réglage enregistrerait autre chose que le
    calendrier affiché."""
    auth.update_non_working_days(PROJECT_ID, [5, 6], ["2026-12-25", "2027-01-01"])

    reloaded = auth.get_project(PROJECT_ID)

    assert reloaded is not None
    assert reloaded.non_working_days.to_dict() == {
        "excluded_weekdays": [5, 6],
        "excluded_dates": ["2026-12-25", "2027-01-01"],
    }


def test_an_unreadable_column_reads_as_the_default_calendar(auth):
    """Une ligne historique illisible ne doit pas vider le calendrier : elle est
    ramenée au défaut, week-end exclu."""
    with psycopg.connect(TEST_DATABASE_URL) as conn:
        conn.execute(
            "UPDATE projects SET non_working_days = %s WHERE id = %s",
            ('{"excluded_weekdays": ["nope"], "excluded_dates": null}', PROJECT_ID),
        )
        conn.commit()

    project = auth.get_project(PROJECT_ID)

    assert project is not None
    assert project.non_working_days == NonWorkingDays.default()


# --- Project administrators ------------------------------------------------
#
# A scope declares who works there; an administrator belongs to the project
# itself and stays reachable once the project owns scopes, which is what keeps
# an installation openable.


def test_admin_authenticates_although_it_belongs_to_no_scope(auth, scopes):
    """The rule the whole feature exists for.

    Without an administrator, creating the first scope closes the bootstrap
    window and locks out whoever created it.
    """
    add_scope(scopes, main="ABCD", backup="WXYZ")
    auth.add_admin(PROJECT_ID, "MLOZ")

    assert auth.authenticate(PROJECT_ID, "MLOZ", "secret") is True


def test_admin_still_needs_the_project_password(auth, scopes):
    """Permanent access is not a password bypass: the admin is one factor."""
    add_scope(scopes, main="ABCD", backup="WXYZ")
    auth.add_admin(PROJECT_ID, "MLOZ")

    assert auth.authenticate(PROJECT_ID, "MLOZ", "wrong") is False


def test_creating_a_project_twice_reports_the_duplicate(auth):
    """Reusing a project code is the likeliest CLI mistake, and it must not
    reach the operator as a psycopg traceback.

    ``protab-project <code> <name>`` is documented as the way to add a project;
    running it a second time with the same code is an ordinary slip. AGENTS.md
    §15 puts the translation of a technical exception at the adapter boundary,
    not in front of the user. The ``auth`` fixture has already created
    ``PROJECT_ID``, so this single call is the duplicate.
    """
    with pytest.raises(ValueError) as excinfo:
        auth.create_project(PROJECT_ID, "Second", "autre-secret")

    assert PROJECT_ID in str(excinfo.value)
    assert not isinstance(excinfo.value, psycopg.errors.UniqueViolation)


def test_admin_is_scoped_to_its_own_project(auth, scopes):
    """An administrator of A is nobody in B.

    ``GET /projects`` is unauthenticated, so without the ``project_id`` filter
    one admin code would open every tenant of the instance.
    """
    other = "project-other"
    auth.create_project(other, "Autre Projet", "autre-secret")
    add_scope(scopes, main="ABCD", backup="WXYZ")
    add_scope_for(other, scopes, main="IJKL", backup="UVWX")
    auth.add_admin(PROJECT_ID, "MLOZ")
    auth.add_admin(other, "MRAM")

    assert auth.authenticate(PROJECT_ID, "MLOZ", "secret") is True
    assert auth.authenticate(other, "MRAM", "autre-secret") is True
    assert auth.authenticate(other, "MLOZ", "autre-secret") is False
    assert auth.authenticate(PROJECT_ID, "MRAM", "secret") is False


def test_admin_code_is_normalized_like_a_scope_code(auth, scopes):
    add_scope(scopes, main="ABCD", backup="WXYZ")
    auth.add_admin(PROJECT_ID, " mloz ")

    assert auth.authenticate(PROJECT_ID, "MLOZ", "secret") is True
    assert auth.authenticate(PROJECT_ID, "mloz", "secret") is True


def test_admin_code_is_stored_normalized(auth):
    auth.add_admin(PROJECT_ID, " mloz ")

    assert auth.list_admins(PROJECT_ID) == ["MLOZ"]


def test_admin_authenticates_before_the_first_scope_is_created(auth):
    """Naming an administrator is what makes creating the first scope safe.

    The administrator can get in, and still get back in afterwards, which the
    bootstrap window alone cannot guarantee: it closes on the first scope.
    """
    auth.add_admin(PROJECT_ID, "MLOZ")

    assert auth.authenticate(PROJECT_ID, "MLOZ", "secret") is True


def test_admin_alongside_scope_officials(auth, scopes):
    """Being an administrator never removes the scope officials' access."""
    add_scope(scopes, main="ABCD", backup="MLOZ/MRAM")
    auth.add_admin(PROJECT_ID, "MLOZ")

    assert auth.authenticate(PROJECT_ID, "MLOZ", "secret") is True
    assert auth.authenticate(PROJECT_ID, "ABCD", "secret") is True
    assert auth.authenticate(PROJECT_ID, "ZZZZ", "secret") is False


def test_a_code_in_no_scope_and_no_admin_list_is_refused(auth, scopes):
    add_scope(scopes, main="ABCD", backup="WXYZ")

    assert auth.authenticate(PROJECT_ID, "MLOZ", "secret") is False


def test_add_admin_is_idempotent(auth):
    assert auth.add_admin(PROJECT_ID, "MLOZ") is True
    assert auth.add_admin(PROJECT_ID, "mloz") is False

    assert auth.list_admins(PROJECT_ID) == ["MLOZ"]


def test_add_admin_rejects_an_unusable_code(auth):
    """A code the login screen refuses would lock the administrator out."""
    from protab.domain.exceptions import InvalidOfficialCodeError

    with pytest.raises(InvalidOfficialCodeError):
        auth.add_admin(PROJECT_ID, "MLOZ/MRAM")

    assert auth.list_admins(PROJECT_ID) == []


def test_add_admin_rejects_an_unknown_project(auth):
    from psycopg.errors import ForeignKeyViolation

    with pytest.raises(ForeignKeyViolation):
        auth.add_admin("does-not-exist", "MLOZ")


def test_remove_admin_revokes_its_sessions(auth, scopes):
    """``authenticate()`` only runs at login, so a removed administrator would
    keep a working session for the remaining twelve hours."""
    add_scope(scopes, main="ABCD", backup="WXYZ")
    auth.add_admin(PROJECT_ID, "MLOZ")
    session = auth.create_session(PROJECT_ID, "MLOZ")

    assert auth.remove_admin(PROJECT_ID, "MLOZ") is True

    assert auth.find_session(session.token) is None
    assert auth.authenticate(PROJECT_ID, "MLOZ", "secret") is False


def test_remove_admin_leaves_the_other_sessions_alone(auth, scopes):
    add_scope(scopes, main="ABCD", backup="WXYZ")
    auth.add_admin(PROJECT_ID, "MLOZ")
    admin_session = auth.create_session(PROJECT_ID, "MLOZ")
    official_session = auth.create_session(PROJECT_ID, "ABCD")

    auth.remove_admin(PROJECT_ID, "MLOZ")

    assert auth.find_session(admin_session.token) is None
    assert auth.find_session(official_session.token) is not None


def test_remove_admin_reports_an_unknown_code(auth):
    assert auth.remove_admin(PROJECT_ID, "ZZZZ") is False


def test_admins_are_listed_per_project(auth):
    auth.add_admin(PROJECT_ID, "MLOZ")
    auth.add_admin(PROJECT_ID, "MRAM")
    auth.create_project("project-other", "Autre Projet", "autre-secret")
    auth.add_admin("project-other", "ABCD")

    assert auth.list_admins(PROJECT_ID) == ["MLOZ", "MRAM"]
    assert auth.list_admins("project-other") == ["ABCD"]


def test_admins_disappear_with_their_project(auth):
    """``project_admins`` cascades, or a recycled project code would inherit
    the administrators of the tenant that used to own it."""
    assert TEST_DATABASE_URL is not None
    auth.add_admin(PROJECT_ID, "MLOZ")
    with psycopg.connect(TEST_DATABASE_URL, autocommit=True) as conn:
        conn.execute("DELETE FROM projects WHERE id = %s", (PROJECT_ID,))

    assert auth.list_admins(PROJECT_ID) == []


# --- AdminDirectory -----------------------------------------------------------


def test_is_current_project_admin_reads_the_tenant_in_context(auth):
    """The port resolves the project from the request context, not a value the
    caller could name: a code administered elsewhere is not an administrator."""
    auth.create_project("project-other", "Autre Projet", "autre-secret")
    auth.add_admin("project-other", "ABCD")

    assert auth.is_current_project_admin("WHOM") is False

    token = set_current_project("project-other")
    try:
        assert auth.is_current_project_admin("abcd") is True
    finally:
        reset_current_project(token)


def test_is_current_project_admin_is_normalized(auth):
    auth.add_admin(PROJECT_ID, "MLOZ")

    assert auth.is_current_project_admin("  mloz ") is True
    assert auth.is_current_project_admin("MRAM") is False


def test_is_current_project_admin_refuses_an_empty_context(auth):
    from protab.adapters.outbound.persistence.postgres_scope_monitoring_repository import (
        MissingProjectContextError,
    )

    token = set_current_project(None)
    try:
        with pytest.raises(MissingProjectContextError):
            auth.is_current_project_admin("MLOZ")
    finally:
        reset_current_project(token)
