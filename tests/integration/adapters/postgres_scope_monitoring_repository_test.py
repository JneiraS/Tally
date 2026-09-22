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
    PostgresScopeMonitoringRepository,
)
from protab.domain.entities.daily_activity import DailyActivity
from protab.domain.entities.scope_monitoring import (
    KnowledgeBase,
    Officials,
    ScopeMonitoring,
)
from protab.domain.exceptions import ScopeMonitoringNameAlreadyExistsError

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
}


def make_scope(
    scope_id: str = "scope-001",
    name: str = "Scope A",
    day: date | None = None,
) -> ScopeMonitoring:
    scope = ScopeMonitoring(
        id=scope_id,
        name=name,
        knowledge=KnowledgeBase(id="KB-00000001"),
        officials=Officials(main="Main", backup="Backup"),
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


@pytest.fixture
def repo():
    assert TEST_DATABASE_URL is not None
    repository = PostgresScopeMonitoringRepository(TEST_DATABASE_URL)
    repository.connect()
    truncate_all()
    yield repository
    repository.close()


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
    assert set(loaded.daily_activities.keys()) == {date(2026, 9, 18), date(2026, 9, 19)}
    activity = loaded.daily_activity_for(date(2026, 9, 19))
    assert activity.errors_reported == 2
    assert activity.incidents_created == 1
    assert activity.feai == ["INC000000001"]
    assert activity.handled is False
    assert activity.completed is False


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

    listing = http.get("/scope-monitorings").json()
    assert len(listing) == 1
    assert listing[0]["name"] == "Scope A"


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
