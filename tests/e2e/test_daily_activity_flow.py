from fastapi.testclient import TestClient

from protab.adapters.inbound.api.app import create_app
from protab.adapters.outbound.persistence.in_memory_scope_monitoring_repository import (
    InMemoryScopeMonitoringRepository,
)


def test_daily_activity_full_flow_over_http():
    repo = InMemoryScopeMonitoringRepository()
    http = TestClient(create_app(repo))

    create = http.post(
        "/scope-monitorings",
        json=[
            {
                "name": "Scope A",
                "knowledge_base_id": "KB-00000001",
                "official_main": "Main",
                "official_backup": "Backup",
                "billing_code": "FACT-2026-PAI",
            }
        ],
    )
    assert create.status_code == 201
    scope_id = create.json()["ids"][0]

    add_activity = http.post(
        f"/scope-monitorings/{scope_id}/activities",
        json={
            "day": "2026-09-19",
            "errors_reported": 2,
            "incidents_created": 1,
            "feai": ["INC000000001"],
        },
    )
    assert add_activity.status_code == 201

    update = http.patch(
        f"/scope-monitorings/{scope_id}/activities/2026-09-19",
        json={
            "errors_reported": 3,
            "incidents_created": 2,
            "feai": ["INC000000001"],
        },
    )
    assert update.status_code == 204

    complete = http.post(
        f"/scope-monitorings/{scope_id}/activities/complete",
        json={"days": ["2026-09-19"]},
    )
    assert complete.status_code == 204

    detail = http.get(f"/scope-monitorings/{scope_id}")
    assert detail.status_code == 200
    body = detail.json()
    assert body["name"] == "Scope A"
    assert body["knowledge_base_id"] == "KB-00000001"
    assert body["official_main"] == "Main"
    assert body["official_backup"] == "Backup"
    assert len(body["daily_activities"]) == 1

    activity = body["daily_activities"][0]
    assert activity["day"] == "2026-09-19"
    assert activity["errors_reported"] == 3
    assert activity["incidents_created"] == 2
    assert activity["feai"] == ["INC000000001"]
    assert activity["completed"] is True
    assert activity["handled"] is True