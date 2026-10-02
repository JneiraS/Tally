"""Integration tests for the PostgreSQL repository adapter.

These tests exercise the real PostgreSQL wiring (schema, transactions,
constraint translation) and are skipped when ``PROTAB_TEST_DATABASE_URL``
is not set, so the default test suite stays green without a database.
"""

import os
from datetime import date

import psycopg
import pytest
from fastapi.testclient import TestClient

from protab.adapters.inbound.api.app import create_app
from protab.adapters.outbound.persistence.postgres_scope_monitoring_repository import (
    MissingProjectContextError,
    PostgresScopeMonitoringRepository,
    reset_current_project,
    set_current_project,
)
from protab.domain.entities.daily_activity import DailyActivity
from protab.domain.entities.scope_monitoring import (
    KnowledgeBase,
    Officials,
    ScopeMonitoring,
)
from protab.domain.exceptions import (
    DailyActivityNotFoundError,
    DuplicateDailyActivityError,
    ScopeMonitoringNameAlreadyExistsError,
    ScopeMonitoringNotFoundError,
)

TEST_DATABASE_URL = os.getenv("PROTAB_TEST_DATABASE_URL")

pytestmark = pytest.mark.skipif(
    not TEST_DATABASE_URL,
    reason="PROTAB_TEST_DATABASE_URL not set: PostgreSQL integration tests are skipped.",
)

VALID_ITEM = {
    "name": "Scope A",
    "knowledge_base_id": "KB-00000001",
    "official_main": "Main",
    "official_backup": "Backup",
    "billing_code": "FACT-2026-PAI",
}

TEST_PROJECT_ID = "protab"


def make_scope(
    scope_id: str = "scope-001",
    name: str = "Scope A",
    day: date | None = None,
    billing_code: str | None = "FACT-2026-PAI",
    note: str | None = None,
) -> ScopeMonitoring:
    scope = ScopeMonitoring(
        id=scope_id,
        name=name,
        knowledge=KnowledgeBase(id="KB-00000001"),
        officials=Officials(main="Main", backup="Backup"),
        billing_code=billing_code,
        note=note,
    )
    if day is not None:
        scope.add_daily_activity(
            DailyActivity(
                day=day,
                errors_reported=2,
                incidents_created=1,
                feai=["INC000000001"],
            )
        )
    return scope


def truncate_all() -> None:
    assert TEST_DATABASE_URL is not None
    with psycopg.connect(TEST_DATABASE_URL, autocommit=True) as conn:
        conn.execute(
            "TRUNCATE daily_activities, scope_monitorings RESTART IDENTITY CASCADE"
        )
        conn.execute(
            "INSERT INTO projects (id, name, password_hash) VALUES (%s, %s, %s) "
            "ON CONFLICT (id) DO NOTHING",
            (TEST_PROJECT_ID, "Test project", "test-hash"),
        )


@pytest.fixture
def repo():
    assert TEST_DATABASE_URL is not None
    repository = PostgresScopeMonitoringRepository(TEST_DATABASE_URL)
    repository.connect()
    truncate_all()
    yield repository
    repository.close()


@pytest.fixture(autouse=True)
def project_context():
    """Every read and write is tenant-scoped: name the project under test.

    The adapters fail closed when no project context is established, so the
    tests must declare which tenant they operate in rather than relying on a
    default. Teardown restores the previous (empty) context.
    """
    token = set_current_project(TEST_PROJECT_ID)
    yield token
    reset_current_project(token)


# --- Round-trip ------------------------------------------------------------


def test_save_and_find_by_id_roundtrip(repo):
    scope = make_scope(day=date(2026, 9, 19))
    scope.daily_activities[date(2026, 9, 18)] = DailyActivity(
        day=date(2026, 9, 18),
        errors_reported=1,
        incidents_created=0,
        feai=[],
        handled=True,
        completed=True,
    )
    repo.save(scope)

    loaded = repo.find_by_id("scope-001")
    assert loaded is not None
    assert loaded.id == scope.id
    assert loaded.name == scope.name
    assert loaded.knowledge.id == "KB-00000001"
    assert loaded.officials.main == "Main"
    assert loaded.officials.backup == "Backup"
    assert loaded.billing_code == "FACT-2026-PAI"
    assert set(loaded.daily_activities.keys()) == {date(2026, 9, 18), date(2026, 9, 19)}
    activity = loaded.daily_activity_for(date(2026, 9, 19))
    assert activity.errors_reported == 2
    assert activity.incidents_created == 1
    assert activity.feai == ["INC000000001"]
    assert activity.handled is False
    assert activity.completed is False


def test_scope_without_billing_code_roundtrips_as_none(repo):
    # Un périmètre créé avant l'introduction du code porte NULL en base. Il doit
    # rester lisible : find_all hydrate tout l'inventaire, une ligne illisible
    # viderait la page entière.
    repo.save(make_scope(billing_code=None))

    loaded = repo.find_by_id("scope-001")

    assert loaded is not None
    assert loaded.billing_code is None


def test_billing_code_column_is_nullable(repo):
    # L'obligation est portée par le domaine et le schéma Pydantic, pas par la
    # base : un NOT NULL ferait échouer l'ALTER sur une table déjà peuplée.
    with repo._pool.connection() as conn:
        conn.execute(
            "INSERT INTO scope_monitorings (id, project_id, name, "
            "knowledge_base_id, official_main, official_backup, billing_code) "
            "VALUES (%s, %s, %s, %s, %s, %s, NULL)",
            (
                "scope-legacy",
                TEST_PROJECT_ID,
                "Legacy Scope",
                "KB-00000002",
                "Main",
                "Backup",
            ),
        )

    loaded = repo.find_by_id("scope-legacy")

    assert loaded is not None
    assert loaded.billing_code is None


def test_save_replaces_aggregate_on_second_save(repo):
    scope = make_scope(day=date(2026, 9, 19))
    repo.save(scope)

    scope.daily_activities.clear()
    scope.add_daily_activity(
        DailyActivity(
            day=date(2026, 9, 20),
            errors_reported=0,
            incidents_created=0,
            feai=[],
        )
    )
    repo.save(scope)

    loaded = repo.find_by_id("scope-001")
    assert set(loaded.daily_activities.keys()) == {date(2026, 9, 20)}


# --- Targeted activity writes ---------------------------------------------
#
# The activity endpoints are hot paths: a user editing one day of a scope must
# not rewrite the other days. These tests pin that guarantee at the only level
# where it is observable, since the in-memory adapter shares object references
# and would pass even if every write rewrote the whole aggregate.


def seed_three_days(repo) -> None:
    scope = make_scope()
    for day, errors in (
        (date(2026, 9, 18), 1),
        (date(2026, 9, 19), 2),
        (date(2026, 9, 25), 11),
    ):
        scope.add_daily_activity(
            DailyActivity(
                day=day,
                errors_reported=errors,
                incidents_created=errors - 1,
                feai=[f"INC{day:%d}0000000"],
            )
        )
    repo.save(scope)


def test_update_daily_activity_leaves_other_days_untouched(repo):
    seed_three_days(repo)

    repo.update_daily_activity(
        "scope-001",
        DailyActivity(
            day=date(2026, 9, 19),
            errors_reported=42,
            incidents_created=7,
            feai=["INC000000099"],
        ),
    )

    loaded = repo.find_by_id("scope-001")
    assert loaded.daily_activity_for(date(2026, 9, 19)).errors_reported == 42
    assert loaded.daily_activity_for(date(2026, 9, 19)).feai == ["INC000000099"]
    for untouched, errors in ((date(2026, 9, 18), 1), (date(2026, 9, 25), 11)):
        activity = loaded.daily_activity_for(untouched)
        assert activity.errors_reported == errors
        assert activity.incidents_created == errors - 1


def test_update_daily_activity_preserves_the_completion_flags(repo):
    scope = make_scope(day=date(2026, 9, 19))
    scope.daily_activity_for(date(2026, 9, 19)).mark_completed()
    repo.save(scope)

    repo.update_daily_activity(
        "scope-001",
        DailyActivity(
            day=date(2026, 9, 19),
            errors_reported=9,
            incidents_created=1,
            feai=[],
        ),
    )

    activity = repo.find_by_id("scope-001").daily_activity_for(date(2026, 9, 19))
    assert activity.errors_reported == 9
    assert activity.handled is True
    assert activity.completed is True


def test_update_daily_activity_on_missing_day_raises(repo):
    repo.save(make_scope(day=date(2026, 9, 19)))

    with pytest.raises(DailyActivityNotFoundError):
        repo.update_daily_activity(
            "scope-001",
            DailyActivity(
                day=date(2026, 9, 22),
                errors_reported=1,
                incidents_created=0,
                feai=[],
            ),
        )


def test_insert_daily_activity_leaves_other_days_untouched(repo):
    seed_three_days(repo)

    repo.insert_daily_activity(
        "scope-001",
        DailyActivity(
            day=date(2026, 9, 21),
            errors_reported=3,
            incidents_created=3,
            feai=["INC000000003"],
        ),
    )

    loaded = repo.find_by_id("scope-001")
    assert set(loaded.daily_activities) == {
        date(2026, 9, 18),
        date(2026, 9, 19),
        date(2026, 9, 21),
        date(2026, 9, 25),
    }
    assert loaded.daily_activity_for(date(2026, 9, 25)).errors_reported == 11


def test_insert_daily_activity_on_duplicate_day_translates_to_domain_error(repo):
    repo.save(make_scope(day=date(2026, 9, 19)))

    with pytest.raises(DuplicateDailyActivityError):
        repo.insert_daily_activity(
            "scope-001",
            DailyActivity(
                day=date(2026, 9, 19),
                errors_reported=5,
                incidents_created=1,
                feai=[],
            ),
        )


def test_mark_activities_completed_flips_only_the_named_days(repo):
    seed_three_days(repo)

    repo.mark_activities_completed(
        "scope-001", [date(2026, 9, 19), date(2026, 9, 25)]
    )

    loaded = repo.find_by_id("scope-001")
    assert loaded.daily_activity_for(date(2026, 9, 19)).completed is True
    assert loaded.daily_activity_for(date(2026, 9, 25)).handled is True
    untouched = loaded.daily_activity_for(date(2026, 9, 18))
    assert untouched.completed is False
    assert untouched.handled is False
    assert untouched.errors_reported == 1


def test_activity_writes_are_tenant_scoped(repo):
    """A write must not reach across tenants, even on a known scope id."""
    seed_three_days(repo)
    other = set_current_project("other-project")
    try:
        with pytest.raises(DailyActivityNotFoundError):
            repo.update_daily_activity(
                "scope-001",
                DailyActivity(
                    day=date(2026, 9, 19),
                    errors_reported=0,
                    incidents_created=0,
                    feai=[],
                ),
            )
    finally:
        reset_current_project(other)


def test_find_by_name_returns_matching_scope(repo):
    repo.save(make_scope(day=date(2026, 9, 19)))

    loaded = repo.find_by_name("Scope A")
    assert loaded is not None
    assert loaded.id == "scope-001"

    assert repo.find_by_name("Missing") is None


def test_find_all_returns_scopes_ordered_by_name(repo):
    repo.save(make_scope(scope_id="scope-b", name="B-Step"))
    repo.save(make_scope(scope_id="scope-a", name="A-First"))

    scopes = repo.find_all()
    assert [s.name for s in scopes] == ["A-First", "B-Step"]


def test_find_all_loads_activities_for_all_scopes(repo):
    first = make_scope(scope_id="scope-first", name="First")
    first.add_daily_activity(
        DailyActivity(
            day=date(2026, 9, 18),
            errors_reported=1,
            incidents_created=0,
            feai=[],
        )
    )
    first.add_daily_activity(
        DailyActivity(
            day=date(2026, 9, 19),
            errors_reported=2,
            incidents_created=1,
            feai=["INC000000001"],
        )
    )
    second = make_scope(scope_id="scope-second", name="Second")
    second.add_daily_activity(
        DailyActivity(
            day=date(2026, 9, 20),
            errors_reported=3,
            incidents_created=2,
            feai=["INC000000002"],
        )
    )
    repo.save(first)
    repo.save(second)

    scopes = repo.find_all()

    assert [scope.name for scope in scopes] == ["First", "Second"]
    assert list(scopes[0].daily_activities) == [
        date(2026, 9, 18),
        date(2026, 9, 19),
    ]
    assert scopes[0].daily_activity_for(date(2026, 9, 19)).feai == [
        "INC000000001"
    ]
    assert scopes[1].daily_activity_for(date(2026, 9, 20)).errors_reported == 3


def test_find_all_scope_names_returns_id_to_name(repo):
    repo.save(make_scope(scope_id="scope-b", name="B-Step"))
    repo.save(make_scope(scope_id="scope-a", name="A-First"))

    assert repo.find_all_scope_names() == {
        "scope-a": "A-First",
        "scope-b": "B-Step",
    }


def test_connect_creates_project_name_index(repo):
    with repo._pool.connection() as conn:
        row = conn.execute(
            "SELECT indexdef FROM pg_indexes "
            "WHERE schemaname = current_schema() "
            "AND tablename = 'scope_monitorings' "
            "AND indexname = 'idx_scope_monitorings_project_name'"
        ).fetchone()

    assert row is not None
    assert "(project_id, name)" in row[0]


def test_connect_creates_project_foreign_key(repo):
    with repo._pool.connection() as conn:
        row = conn.execute(
            "SELECT 1 FROM pg_constraint "
            "WHERE conrelid = 'scope_monitorings'::regclass "
            "AND conname = 'scope_monitorings_project_id_fkey'"
        ).fetchone()

    assert row is not None


def test_connect_is_idempotent_for_project_name_index(repo):
    repo.connect()

    with repo._pool.connection() as conn:
        count = conn.execute(
            "SELECT COUNT(*) FROM pg_indexes "
            "WHERE schemaname = current_schema() "
            "AND tablename = 'scope_monitorings' "
            "AND indexname = 'idx_scope_monitorings_project_name'"
        ).fetchone()[0]

    assert count == 1


def test_pool_applies_tuned_parameters(repo):
    assert repo._pool.min_size == 2
    assert repo._pool.max_size == 10
    assert repo._pool.timeout == 30.0
    assert repo._pool.max_lifetime == 1800.0
    assert repo._pool.max_idle == 600.0
    assert repo._pool._check is not None
    assert repo._pool.kwargs["connect_timeout"] == 5
    assert repo._pool.kwargs["application_name"] == "protab-scope"


def test_pool_recovers_after_backend_termination(repo):
    scope = make_scope()
    repo.save(scope)

    with repo._pool.connection() as conn:
        conn.execute(
            "SELECT pg_terminate_backend(pid) "
            "FROM pg_stat_activity "
            "WHERE datname = current_database() AND pid <> pg_backend_pid()"
        ).fetchall()

    loaded = repo.find_by_id(scope.id)

    assert loaded is not None
    assert loaded.name == scope.name


def test_find_by_id_returns_none_when_absent(repo):
    assert repo.find_by_id("missing") is None


# --- Constraint translation ------------------------------------------------


def test_save_duplicate_name_raises_domain_error(repo):
    repo.save(make_scope())

    duplicate = make_scope(scope_id="scope-other", name="Scope A")
    with pytest.raises(ScopeMonitoringNameAlreadyExistsError):
        repo.save(duplicate)


def test_save_without_constraint_conflict_roundtrips_two_scopes(repo):
    repo.save(make_scope(scope_id="scope-1", name="Scope One"))
    repo.save(make_scope(scope_id="scope-2", name="Scope Two"))

    assert len(repo.find_all()) == 2


# --- API flow on top of PostgreSQL -----------------------------------------


def test_api_flow_persists_in_postgres(repo):
    app = create_app(repo)
    http = TestClient(app)

    created = http.post("/scope-monitorings", json=[VALID_ITEM])
    assert created.status_code == 201
    scope_id = created.json()["ids"][0]

    added = http.post(
        f"/scope-monitorings/{scope_id}/activities",
        json={
            "day": "2026-09-19",
            "errors_reported": 2,
            "incidents_created": 1,
            "feai": ["INC000000001"],
        },
    )
    assert added.status_code == 201

    completed = http.post(
        f"/scope-monitorings/{scope_id}/activities/complete",
        json={"days": ["2026-09-19"]},
    )
    assert completed.status_code == 204

    scope = repo.find_by_id(scope_id)
    activity = scope.daily_activity_for(date(2026, 9, 19))
    assert activity.completed is True
    assert activity.handled is True
    assert scope.billing_code == "FACT-2026-PAI"

    listing = http.get("/scope-monitorings").json()
    assert len(listing) == 1
    assert listing[0]["name"] == "Scope A"
    assert listing[0]["billing_code"] == "FACT-2026-PAI"


def test_complete_unknown_day_does_not_partially_persist(repo):
    app = create_app(repo)
    http = TestClient(app)

    scope_id = http.post("/scope-monitorings", json=[VALID_ITEM]).json()["ids"][0]
    http.post(
        f"/scope-monitorings/{scope_id}/activities",
        json={
            "day": "2026-09-19",
            "errors_reported": 2,
            "incidents_created": 1,
            "feai": ["INC000000001"],
        },
    )

    response = http.post(
        f"/scope-monitorings/{scope_id}/activities/complete",
        json={"days": ["2026-09-19", "2026-09-20"]},
    )
    assert response.status_code == 404

    scope = repo.find_by_id(scope_id)
    assert scope.daily_activity_for(date(2026, 9, 19)).completed is False


def test_duplicate_name_via_api_returns_409(repo):
    app = create_app(repo)
    http = TestClient(app)
    http.post("/scope-monitorings", json=[VALID_ITEM])

    response = http.post(
        "/scope-monitorings",
        json=[{**VALID_ITEM, "name": "Scope A"}],
    )
    assert response.status_code == 409


# --- Tenant isolation --------------------------------------------------------


def test_adapters_refuse_to_read_or_write_without_project_context(repo):
    """No project context must raise, never fall back to a default tenant."""
    set_current_project(None)

    with pytest.raises(MissingProjectContextError):
        repo.find_all()
    with pytest.raises(MissingProjectContextError):
        repo.find_all_scope_names()
    with pytest.raises(MissingProjectContextError):
        repo.find_by_id("scope-001")
    with pytest.raises(MissingProjectContextError):
        repo.find_by_name("Scope A")
    with pytest.raises(MissingProjectContextError):
        repo.save(make_scope())
    with pytest.raises(MissingProjectContextError):
        repo.update_note("scope-001", "Note")


def test_find_all_returns_only_the_requesting_project_scopes(repo):
    repo.save(make_scope(scope_id="scope-alpha", name="Scope Alpha"))
    set_current_project("other-project")

    assert repo.find_all() == []
    assert repo.find_by_id("scope-alpha") is None
    assert repo.find_by_name("Scope Alpha") is None
    assert repo.find_all_scope_names() == {}


# --- Targeted scope write (note) --------------------------------------------


def test_update_note_touches_its_own_row_only(repo):
    """The write must name the rows it changes, like the activity writes.

    A full rewrite would delete and reinsert every activity of the scope, so a
    concurrent edit to another day would be silently dropped.
    """
    scope = make_scope(day=date(2026, 9, 19))
    scope.daily_activities[date(2026, 9, 18)] = DailyActivity(
        day=date(2026, 9, 18),
        errors_reported=7,
        incidents_created=3,
        feai=["INC000000009"],
    )
    repo.save(scope)

    repo.update_note("scope-001", "Incident de facturation à suivre.")

    reloaded = repo.find_by_id("scope-001")
    assert reloaded.note == "Incident de facturation à suivre."
    assert reloaded.daily_activity_for(date(2026, 9, 19)).errors_reported == 2
    assert reloaded.daily_activity_for(date(2026, 9, 18)).errors_reported == 7
    assert reloaded.daily_activity_for(date(2026, 9, 18)).feai == ["INC000000009"]


def test_update_note_can_clear_the_note(repo):
    repo.save(make_scope(note="à supprimer"))
    repo.update_note("scope-001", None)

    assert repo.find_by_id("scope-001").note is None


def test_update_note_unknown_scope_raises(repo):
    with pytest.raises(ScopeMonitoringNotFoundError):
        repo.update_note("inconnu", "Note")


def test_update_note_refuses_another_project(repo):
    repo.save(make_scope())
    set_current_project("other-project")

    with pytest.raises(ScopeMonitoringNotFoundError):
        repo.update_note("scope-001", "Ne doit pas écrire")


def test_save_carries_a_note_on_creation(repo):
    repo.save(make_scope(note="contexte importé"))

    assert repo.find_by_id("scope-001").note == "contexte importé"


def test_save_does_not_erase_a_note_written_concurrently(repo):
    """``save`` owns the aggregate, not the note.

    It may create a row from an aggregate that carries a note, but it must not
    overwrite the stored one: it re-reads nothing, and a note edited between the
    read and the write would be lost without any trace.
    """
    scope = make_scope(day=date(2026, 9, 19))
    repo.save(scope)
    repo.update_note("scope-001", "écrite entre-temps")

    repo.save(scope)

    assert repo.find_by_id("scope-001").note == "écrite entre-temps"
