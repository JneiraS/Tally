from datetime import date

import pytest
from fastapi.testclient import TestClient

from protab.adapters.inbound.api.app import create_app
from protab.adapters.outbound.persistence.in_memory_scope_monitoring_repository import (
    InMemoryScopeMonitoringRepository,
)
from protab.domain.entities.daily_activity import DailyActivity
from protab.domain.entities.scope_monitoring import (
    KnowledgeBase,
    Officials,
    ScopeMonitoring,
)


@pytest.fixture
def client():
    repo = InMemoryScopeMonitoringRepository()
    app = create_app(repo)
    return TestClient(app), repo


VALID_ITEM = {
    "name": "Scope A",
    "knowledge_base_id": "KB-00000001",
    "official_main": "Main",
    "official_backup": "Backup",
}


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
    return scope


# --- Health ---------------------------------------------------------------


def test_healthz_returns_ok(client):
    http, _ = client

    response = http.get("/healthz")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


# --- Create ---------------------------------------------------------------


def test_create_scope_monitorings_returns_ids(client):
    http, _ = client

    response = http.post(
        "/scope-monitorings",
        json=[
            VALID_ITEM,
            {**VALID_ITEM, "name": "Scope B"},
        ],
    )

    assert response.status_code == 201
    body = response.json()
    assert len(body["ids"]) == 2
    assert len(set(body["ids"])) == 2


def test_create_duplicate_name_returns_409(client):
    http, repo = client
    http.post("/scope-monitorings", json=[VALID_ITEM])

    response = http.post(
        "/scope-monitorings",
        json=[{**VALID_ITEM, "name": "Scope A"}],
    )

    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]


def test_create_invalid_item_returns_400(client):
    http, repo = client

    response = http.post(
        "/scope-monitorings",
        json=[{**VALID_ITEM, "knowledge_base_id": "short"}],
    )

    assert response.status_code == 400
    assert repo.find_by_name("Scope A") is None


def test_create_invalid_payload_returns_422(client):
    http, _ = client

    response = http.post("/scope-monitorings", json=[{}])

    assert response.status_code == 422


# --- CSV import -----------------------------------------------------------


def test_import_csv_creates_scopes(client):
    http, _ = client

    csv_content = (
        "name,knowledge_base_id,official_main,official_backup\n"
        "Scope A,KB-00000001,Main,Backup\n"
        "Scope B,KB-00000002,Paul,Jean\n"
    )
    response = http.post(
        "/scope-monitorings/import-csv",
        files={"csv_file": ("scopes.csv", csv_content, "text/csv")},
    )

    assert response.status_code == 201
    body = response.json()
    assert len(body["ids"]) == 2


def test_import_csv_invalid_headers_returns_400(client):
    http, _ = client

    response = http.post(
        "/scope-monitorings/import-csv",
        files={"csv_file": ("scopes.csv", "name,other\nScope A,x\n", "text/csv")},
    )

    assert response.status_code == 400
    assert "Invalid headers" in response.json()["detail"]


def test_import_csv_business_error_returns_400(client):
    http, _ = client

    csv_content = (
        "name,knowledge_base_id,official_main,official_backup\n"
        "Scope A,short,Main,Backup\n"
    )
    response = http.post(
        "/scope-monitorings/import-csv",
        files={"csv_file": ("scopes.csv", csv_content, "text/csv")},
    )

    assert response.status_code == 400


# --- Complete -------------------------------------------------------------


def test_complete_daily_activities_returns_204(client):
    http, repo = client
    make_scope_with_activity(repo)

    response = http.post(
        "/scope-monitorings/scope-001/activities/complete",
        json={"days": ["2026-09-19"]},
    )

    assert response.status_code == 204
    activity = repo.find_by_id("scope-001").daily_activity_for(date(2026, 9, 19))
    assert activity.completed is True
    assert activity.handled is True


def test_complete_unknown_scope_returns_404(client):
    http, _ = client

    response = http.post(
        "/scope-monitorings/unknown/activities/complete",
        json={"days": ["2026-09-19"]},
    )

    assert response.status_code == 404


def test_complete_day_without_activity_returns_404(client):
    http, repo = client
    make_scope_with_activity(repo)

    response = http.post(
        "/scope-monitorings/scope-001/activities/complete",
        json={"days": ["2026-09-20"]},
    )

    assert response.status_code == 404


# --- Update ---------------------------------------------------------------


def test_update_daily_activity_returns_204(client):
    http, repo = client
    make_scope_with_activity(repo)

    response = http.patch(
        "/scope-monitorings/scope-001/activities/2026-09-19",
        json={
            "errors_reported": 5,
            "incidents_created": 3,
            "feai": ["INC000000001", "INC000000002"],
        },
    )

    assert response.status_code == 204
    activity = repo.find_by_id("scope-001").daily_activity_for(date(2026, 9, 19))
    assert activity.errors_reported == 5
    assert activity.incidents_created == 3
    assert activity.feai == ["INC000000001", "INC000000002"]


def test_update_unknown_scope_returns_404(client):
    http, _ = client

    response = http.patch(
        "/scope-monitorings/unknown/activities/2026-09-19",
        json={
            "errors_reported": 5,
            "incidents_created": 3,
            "feai": ["INC000000001"],
        },
    )

    assert response.status_code == 404


def test_update_day_without_activity_returns_404(client):
    http, repo = client
    make_scope_with_activity(repo)

    response = http.patch(
        "/scope-monitorings/scope-001/activities/2026-09-20",
        json={
            "errors_reported": 5,
            "incidents_created": 3,
            "feai": ["INC000000001"],
        },
    )

    assert response.status_code == 404


def test_update_invalid_invariant_returns_400(client):
    http, repo = client
    make_scope_with_activity(repo)

    response = http.patch(
        "/scope-monitorings/scope-001/activities/2026-09-19",
        json={
            "errors_reported": 1,
            "incidents_created": 2,
            "feai": ["INC000000001"],
        },
    )

    assert response.status_code == 400
    activity = repo.find_by_id("scope-001").daily_activity_for(date(2026, 9, 19))
    assert activity.errors_reported == 2
    assert activity.incidents_created == 1


# --- Create activity -------------------------------------------------------


def create_scope_via_api(http, name="Scope A"):
    response = http.post("/scope-monitorings", json=[{**VALID_ITEM, "name": name}])
    assert response.status_code == 201
    return response.json()["ids"][0]


def test_create_daily_activity_returns_201(client):
    http, repo = client
    scope_id = create_scope_via_api(http)

    response = http.post(
        f"/scope-monitorings/{scope_id}/activities",
        json={
            "day": "2026-09-19",
            "errors_reported": 2,
            "incidents_created": 1,
            "feai": ["INC000000001"],
        },
    )

    assert response.status_code == 201
    scope = repo.find_by_id(scope_id)
    assert scope.daily_activity_for(date(2026, 9, 19)) is not None


def test_create_daily_activity_unknown_scope_returns_404(client):
    http, _ = client

    response = http.post(
        "/scope-monitorings/unknown/activities",
        json={
            "day": "2026-09-19",
            "errors_reported": 2,
            "incidents_created": 1,
            "feai": ["INC000000001"],
        },
    )

    assert response.status_code == 404


def test_create_daily_activity_duplicate_day_returns_409(client):
    http, repo = client
    scope_id = create_scope_via_api(http)
    payload = {
        "day": "2026-09-19",
        "errors_reported": 2,
        "incidents_created": 1,
        "feai": ["INC000000001"],
    }
    assert http.post(f"/scope-monitorings/{scope_id}/activities", json=payload).status_code == 201

    response = http.post(f"/scope-monitorings/{scope_id}/activities", json=payload)

    assert response.status_code == 409


def test_create_daily_activity_invalid_invariant_returns_400(client):
    http, repo = client
    scope_id = create_scope_via_api(http)

    response = http.post(
        f"/scope-monitorings/{scope_id}/activities",
        json={
            "day": "2026-09-19",
            "errors_reported": 1,
            "incidents_created": 2,
            "feai": ["INC000000001"],
        },
    )

    assert response.status_code == 400
    scope = repo.find_by_id(scope_id)
    assert scope.daily_activity_for(date(2026, 9, 19)) is None


# --- Reads ----------------------------------------------------------------


def test_list_scopes_returns_scopes_with_activities(client):
    http, _ = client
    scope_id = create_scope_via_api(http)
    http.post(
        f"/scope-monitorings/{scope_id}/activities",
        json={
            "day": "2026-09-19",
            "errors_reported": 2,
            "incidents_created": 1,
            "feai": ["INC000000001"],
        },
    )

    response = http.get("/scope-monitorings")

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["name"] == "Scope A"
    assert len(body[0]["daily_activities"]) == 1
    assert body[0]["daily_activities"][0]["day"] == "2026-09-19"
    assert body[0]["daily_activities"][0]["completed"] is False


def test_list_scopes_empty(client):
    http, _ = client

    response = http.get("/scope-monitorings")

    assert response.status_code == 200
    assert response.json() == []


def test_get_scope_returns_detail(client):
    http, _ = client
    scope_id = create_scope_via_api(http)

    response = http.get(f"/scope-monitorings/{scope_id}")

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == scope_id
    assert body["knowledge_base_id"] == "KB-00000001"
    assert body["official_main"] == "Main"
    assert body["official_backup"] == "Backup"


def test_get_scope_unknown_returns_404(client):
    http, _ = client

    response = http.get("/scope-monitorings/unknown")

    assert response.status_code == 404


def test_get_daily_activity_returns_detail(client):
    http, _ = client
    scope_id = create_scope_via_api(http)
    http.post(
        f"/scope-monitorings/{scope_id}/activities",
        json={
            "day": "2026-09-19",
            "errors_reported": 2,
            "incidents_created": 1,
            "feai": ["INC000000001"],
        },
    )

    response = http.get(
        f"/scope-monitorings/{scope_id}/activities/2026-09-19"
    )

    assert response.status_code == 200
    body = response.json()
    assert body["errors_reported"] == 2
    assert body["incidents_created"] == 1
    assert body["feai"] == ["INC000000001"]
    assert body["handled"] is False
    assert body["completed"] is False


def test_get_daily_activity_unknown_scope_returns_404(client):
    http, _ = client

    response = http.get("/scope-monitorings/unknown/activities/2026-09-19")

    assert response.status_code == 404


def test_get_daily_activity_unknown_day_returns_404(client):
    http, _ = client
    scope_id = create_scope_via_api(http)

    response = http.get(
        f"/scope-monitorings/{scope_id}/activities/2026-09-19"
    )

    assert response.status_code == 404