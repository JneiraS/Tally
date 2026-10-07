from datetime import date

import pytest
from fastapi.testclient import TestClient

from protab.adapters.inbound.api.app import create_app
from protab.adapters.outbound.persistence.in_memory_audit_trail_repository import (
    InMemoryAuditTrailRepository,
)
from protab.adapters.outbound.persistence.in_memory_scope_monitoring_repository import (
    InMemoryScopeMonitoringRepository,
)
from protab.application.actor_context import reset_current_actor, set_current_actor
from protab.domain.entities.daily_activity import DailyActivity
from protab.domain.entities.scope_monitoring import (
    KnowledgeBase,
    Officials,
    ScopeMonitoring,
)
from protab.ports.outbound.audit_trail_repository import AuditEventQuery


@pytest.fixture(autouse=True)
def clear_actor():
    yield
    reset_current_actor(set_current_actor(None))


@pytest.fixture
def env():
    repo = InMemoryScopeMonitoringRepository()
    audit = InMemoryAuditTrailRepository()
    app = create_app(repo, None, audit)
    return TestClient(app), audit, repo


def make_scope_with_activity(
    repo: InMemoryScopeMonitoringRepository,
    scope_id="scope-001",
    day=date(2026, 9, 19),
):
    scope = ScopeMonitoring(
        id=scope_id,
        name="Scope A",
        knowledge=KnowledgeBase(id="KB-00000001"),
        officials=Officials(main="Main", backup="Backup"),
    )
    scope.add_daily_activity(
        DailyActivity(
            day=day,
            errors_reported=2,
            incidents_created=1,
            feai=["INC000000001"],
        )
    )
    repo.save(scope)
    return scope.id


def all_events(audit: InMemoryAuditTrailRepository):
    return audit.list(AuditEventQuery(limit=1000))


def record_activity(http, scope_id: str, day: str) -> None:
    """Record one ``activity_created`` event, as an authenticated actor would.

    Audit events are only written by use cases reached through HTTP, and the
    actor comes from the ``ContextVar`` the auth dependency sets — never from
    the request body. Writing the activity straight into the repository would
    therefore leave no trace at all.
    """
    token = set_current_actor("ABCD")
    try:
        assert (
            http.post(
                f"/scope-monitorings/{scope_id}/activities",
                json={
                    "day": day,
                    "errors_reported": 1,
                    "incidents_created": 0,
                    "feai": [],
                },
            ).status_code
            == 201
        )
    finally:
        reset_current_actor(token)


def test_create_scope_records_audit_via_api(env):
    http, audit, _ = env

    response = http.post(
        "/scope-monitorings",
        json=[
            {
                "name": "Scope API",
                "knowledge_base_id": "KB-00000001",
                "official_main": "Main",
                "official_backup": "Backup",
                "billing_code": "FACT-2026-PAI",
            }
        ],
    )

    assert response.status_code == 201
    events = all_events(audit)
    assert len(events) == 1
    assert events[0].action == "scope_created"
    assert events[0].scope_id == response.json()["ids"][0]


def test_activity_flow_records_audit_via_api(env):
    http, audit, repo = env
    make_scope_with_activity(repo)

    set_current_actor("ABCD")

    # Mise à jour (deux appels identiques : seuls les changements réels sont tracés)
    payload = {
        "errors_reported": 5,
        "incidents_created": 2,
        "feai": ["INC000000001", "INC000000002"],
    }
    assert (
        http.patch(
            "/scope-monitorings/scope-001/activities/2026-09-19", json=payload
        ).status_code
        == 204
    )
    assert (
        http.patch(
            "/scope-monitorings/scope-001/activities/2026-09-19", json=payload
        ).status_code
        == 204
    )

    # Création d'une activité sur un autre jour
    assert (
        http.post(
            "/scope-monitorings/scope-001/activities",
            json={
                "day": "2026-09-20",
                "errors_reported": 1,
                "incidents_created": 0,
                "feai": [],
            },
        ).status_code
        == 201
    )

    # Complétion d'un jour
    assert (
        http.post(
            "/scope-monitorings/scope-001/activities/complete",
            json={"days": ["2026-09-19"]},
        ).status_code
        == 204
    )

    events = all_events(audit)
    actions = [event.action for event in events]
    assert "activity_updated" in actions
    assert "activity_created" in actions
    assert "activity_completed" in actions

    # Le PATCH sans changement réel n'ajoute pas d'événement
    assert actions.count("activity_updated") == 1
    assert all(event.actor == "ABCD" for event in events)

    updated = next(event for event in events if event.action == "activity_updated")
    assert updated.changes["errors_reported"] == {"old": 2, "new": 5}
    assert updated.changes["feai"] == {
        "old": ["INC000000001"],
        "new": ["INC000000001", "INC000000002"],
    }


def test_get_audit_log_endpoint_filters_and_orders(env):
    http, audit, repo = env
    make_scope_with_activity(repo)

    http.post(
        "/scope-monitorings",
        json=[
            {
                "name": "Scope Alpha",
                "knowledge_base_id": "KB-00000001",
                "official_main": "Main",
                "official_backup": "Backup",
                "billing_code": "FACT-2026-PAI",
            }
        ],
    )

    get_body = http.get(
        "/api/audit-log"
    )
    assert get_body.status_code == 200
    events = get_body.json()
    assert len(events) == 1
    assert events[0]["action"] == "scope_created"
    assert events[0]["scope_name"] == "Scope Alpha"
    assert {"scope_id", "action", "actor", "day", "changes", "created_at", "id"} <= set(
        events[0].keys()
    )

    filtered = http.get(
        "/api/audit-log",
        params={"action": "activity_created"},
    )
    assert filtered.status_code == 200
    assert filtered.json() == []

    assert (
        http.get(
            "/api/audit-log",
            params={"actor": "ZZZZ"},
        ).json()
        == []
    )


def test_get_audit_log_actor_is_a_case_insensitive_prefix(env):
    """``abcd`` and ``AB`` used to return nothing: the filter looked broken."""
    http, audit, repo = env
    make_scope_with_activity(repo)
    token = set_current_actor("ABCD")
    try:
        http.post(
            "/scope-monitorings/scope-001/activities",
            json={
                "day": "2026-09-21",
                "errors_reported": 1,
                "incidents_created": 0,
                "feai": [],
            },
        )
    finally:
        reset_current_actor(token)

    for actor in ("ABCD", "abcd", "AbCd"):
        body = http.get("/api/audit-log", params={"actor": actor})
        assert body.status_code == 200
        assert [event["action"] for event in body.json()] == ["activity_created"], actor

    # A prefix widens rather than clearing: no list of valid actors has to be
    # known in advance to find them.
    body = http.get("/api/audit-log", params={"actor": "AB"})
    assert body.status_code == 200
    assert [event["action"] for event in body.json()] == ["activity_created"]

    # A blank filter is "no filter", not "match the empty prefix".
    assert len(http.get("/api/audit-log", params={"actor": "   "}).json()) == 1


def test_get_audit_log_filters_by_repeated_scope_id(env):
    http, audit, repo = env
    make_scope_with_activity(repo)
    record_activity(http, "scope-001", "2026-09-21")
    other = http.post(
        "/scope-monitorings",
        json=[
            {
                "name": "Scope Beta",
                "knowledge_base_id": "KB-00000002",
                "official_main": "Main",
                "official_backup": "Backup",
                "billing_code": "FACT-2026-BETA",
            }
        ],
    ).json()["ids"][0]

    picked = http.get("/api/audit-log", params=[("scope_id", other)]).json()
    assert [event["scope_id"] for event in picked] == [other]

    both = http.get(
        "/api/audit-log",
        params=[("scope_id", other), ("scope_id", "scope-001")],
    ).json()
    assert len(both) == 2

    # No scope_id at all is not an empty selection.
    assert len(http.get("/api/audit-log").json()) == 2


def test_get_audit_log_period_keeps_events_without_a_business_day(env):
    """`day` is NULL for scope_created; filtering on it hid the event."""
    http, audit, repo = env
    make_scope_with_activity(repo)
    # The scope is created first, so the day-less scope_created event is the
    # OLDER of the two — the window below has to reach back past the activity
    # to prove it still keeps the day-less event.
    http.post(
        "/scope-monitorings",
        json=[
            {
                "name": "Scope Gamma",
                "knowledge_base_id": "KB-00000003",
                "official_main": "Main",
                "official_backup": "Backup",
                "billing_code": "FACT-2026-GAMMA",
            }
        ],
    )
    record_activity(http, "scope-001", "2026-09-21")

    everything = http.get("/api/audit-log").json()
    assert [event["action"] for event in everything] == [
        "activity_created",
        "scope_created",
    ]
    scope_created = next(
        event for event in everything if event["action"] == "scope_created"
    )
    assert scope_created["day"] is None

    kept = http.get(
        "/api/audit-log",
        params={
            "from_created_at": scope_created["created_at"],
            "to_created_at": "2999-01-01T00:00:00Z",
        },
    ).json()
    assert [event["action"] for event in kept] == [
        "activity_created",
        "scope_created",
    ]

    # Half-open: an instant equal to the upper bound is excluded, so this
    # window drops the newest event and keeps only the older one.
    newest = everything[0]
    assert [
        event["action"]
        for event in http.get(
            "/api/audit-log",
            params={"to_created_at": newest["created_at"]},
        ).json()
    ] == ["scope_created"]


def test_get_audit_log_limit(env):
    http, _, _ = env
    for i in range(3):
        http.post(
            "/scope-monitorings",
            json=[
                {
                    "name": f"Scope {i}",
                    "knowledge_base_id": f"KB-0000000{i}",
                    "official_main": "Main",
                    "official_backup": "Backup",
                    "billing_code": f"FACT-2026-0{i}",
                }
            ],
        )

    events = http.get(
        "/api/audit-log",
        params={"limit": 2},
    ).json()
    assert len(events) == 2
