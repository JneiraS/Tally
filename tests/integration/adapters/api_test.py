from datetime import date

import pytest
from fastapi.testclient import TestClient

from protab.adapters.inbound.api.app import create_app
from protab.adapters.outbound.persistence.in_memory_scope_monitoring_repository import (
    InMemoryScopeMonitoringRepository,
)
from protab.domain.entities.daily_activity import DailyActivity
from protab.domain.entities.day_status import KO_REASON_MAX_LENGTH, DayStatus
from protab.domain.entities.scope_monitoring import (
    NOTE_MAX_LENGTH,
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
    "billing_code": "FACT-2026-PAI",
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


def test_create_missing_billing_code_returns_422(client):
    http, repo = client
    payload = {k: v for k, v in VALID_ITEM.items() if k != "billing_code"}

    response = http.post("/scope-monitorings", json=[payload])

    assert response.status_code == 422
    assert repo.find_by_name("Scope A") is None


def test_create_empty_billing_code_returns_400(client):
    # Pydantic's min_length counts characters, so a whitespace-only code
    # passes the boundary and is caught by the domain rule instead.
    http, repo = client

    response = http.post(
        "/scope-monitorings",
        json=[{**VALID_ITEM, "billing_code": "   "}],
    )

    assert response.status_code == 400
    assert repo.find_by_name("Scope A") is None


# --- CSV import -----------------------------------------------------------


def test_import_csv_creates_scopes(client):
    http, _ = client

    csv_content = (
        "name,knowledge_base_id,official_main,official_backup,billing_code\n"
        "Scope A,KB-00000001,Main,Backup,FACT-2026-PAI\n"
        "Scope B,KB-00000002,Paul,Jean,FACT-2026-BAT\n"
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
        "name,knowledge_base_id,official_main,official_backup,billing_code\n"
        "Scope A,short,Main,Backup,FACT-2026-PAI\n"
    )
    response = http.post(
        "/scope-monitorings/import-csv",
        files={"csv_file": ("scopes.csv", csv_content, "text/csv")},
    )

    assert response.status_code == 400


# --- Status ---------------------------------------------------------------


def test_complete_daily_activities_returns_204(client):
    http, repo = client
    make_scope_with_activity(repo)

    response = http.patch(
        "/scope-monitorings/scope-001/activities/status",
        json={"days": ["2026-09-19"], "status": "completed"},
    )

    assert response.status_code == 204
    activity = repo.find_by_id("scope-001").daily_activity_for(date(2026, 9, 19))
    assert activity.status is DayStatus.COMPLETED
    assert activity.ko_reason is None


def test_complete_unknown_scope_returns_404(client):
    http, _ = client

    response = http.patch(
        "/scope-monitorings/unknown/activities/status",
        json={"days": ["2026-09-19"], "status": "completed"},
    )

    assert response.status_code == 404


def test_complete_day_without_activity_returns_404(client):
    http, repo = client
    make_scope_with_activity(repo)

    response = http.patch(
        "/scope-monitorings/scope-001/activities/status",
        json={"days": ["2026-09-20"], "status": "completed"},
    )

    assert response.status_code == 404


def test_a_ko_can_be_reported_on_a_day_nobody_entered_anything_on(client):
    """The route has to accept a KO on a day that has no row yet.

    That is the situation the status exists for: the daily report could not be
    produced, so nothing could be entered. Refusing here would leave the feature
    with no reachable path.
    """
    http, repo = client
    make_scope_with_activity(repo)

    response = http.patch(
        "/scope-monitorings/scope-001/activities/status",
        json={
            "days": ["2026-09-20"],
            "status": "ko",
            "ko_reason": "Collecteur indisponible",
        },
    )

    assert response.status_code == 204
    activity = repo.find_by_id("scope-001").daily_activity_for(date(2026, 9, 20))
    assert activity.status is DayStatus.KO
    assert activity.ko_reason == "Collecteur indisponible"
    assert activity.errors_reported == 0


def test_a_ko_reason_survives_the_round_trip(client):
    http, _ = client
    scope_id = create_scope_via_api(http)
    http.patch(
        f"/scope-monitorings/{scope_id}/activities/status",
        json={"days": ["2026-09-19"], "status": "ko", "ko_reason": "Panne collecteur"},
    )

    body = http.get(f"/scope-monitorings/{scope_id}/activities/2026-09-19").json()
    assert body["status"] == "ko"
    assert body["ko_reason"] == "Panne collecteur"


def test_a_ko_reason_longer_than_the_domain_bound_returns_422(client):
    http, _ = client
    scope_id = create_scope_via_api(http)

    response = http.patch(
        f"/scope-monitorings/{scope_id}/activities/status",
        json={
            "days": ["2026-09-19"],
            "status": "ko",
            "ko_reason": "x" * (KO_REASON_MAX_LENGTH + 1),
        },
    )

    assert response.status_code == 422


def test_a_ko_reason_on_a_day_that_is_not_ko_returns_422(client):
    http, repo = client
    make_scope_with_activity(repo)

    response = http.patch(
        "/scope-monitorings/scope-001/activities/status",
        json={"days": ["2026-09-19"], "status": "completed", "ko_reason": "Panne"},
    )

    assert response.status_code == 422
    activity = repo.find_by_id("scope-001").daily_activity_for(date(2026, 9, 19))
    assert activity.status is DayStatus.PENDING


def test_an_unknown_status_returns_422(client):
    http, _ = client
    scope_id = create_scope_via_api(http)

    response = http.patch(
        f"/scope-monitorings/{scope_id}/activities/status",
        json={"days": ["2026-09-19"], "status": "termine"},
    )

    assert response.status_code == 422


def test_an_empty_day_list_returns_422(client):
    http, _ = client
    scope_id = create_scope_via_api(http)

    response = http.patch(
        f"/scope-monitorings/{scope_id}/activities/status",
        json={"days": [], "status": "ko"},
    )

    assert response.status_code == 422


def test_a_blank_ko_reason_is_stored_as_no_reason(client):
    http, repo = client
    make_scope_with_activity(repo)

    response = http.patch(
        "/scope-monitorings/scope-001/activities/status",
        json={"days": ["2026-09-19"], "status": "ko", "ko_reason": "   "},
    )

    assert response.status_code == 204
    activity = repo.find_by_id("scope-001").daily_activity_for(date(2026, 9, 19))
    assert activity.status is DayStatus.KO
    assert activity.ko_reason is None


def test_a_status_write_does_not_create_an_activity(client):
    """Setting a status is not an entry: it must not insert a row on its own.

    Only the KO path creates a day, and only the use case asks for it. Asserting
    the count keeps an accidental blanket insert visible here too, where the
    repository is in-memory and cannot prove anything about targeted writes.
    """
    http, repo = client
    make_scope_with_activity(repo)

    http.patch(
        "/scope-monitorings/scope-001/activities/status",
        json={"days": ["2026-09-19"], "status": "completed"},
    )

    saved = repo.find_by_id("scope-001")
    assert sorted(saved.daily_activities) == [date(2026, 9, 19)]


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


def test_create_daily_activity_canonicalises_a_prefixed_feai(client):
    http, repo = client
    scope_id = create_scope_via_api(http)

    response = http.post(
        f"/scope-monitorings/{scope_id}/activities",
        json={
            "day": "2026-09-19",
            "errors_reported": 2,
            "incidents_created": 1,
            "feai": ["FE INC000000001", "FEAIINC000000002"],
        },
    )

    assert response.status_code == 201
    scope = repo.find_by_id(scope_id)
    assert scope.daily_activity_for(date(2026, 9, 19)).feai == [
        "FE-INC000000001",
        "FEAI-INC000000002",
    ]


def test_create_daily_activity_rejects_a_duplicate_written_with_another_separator(client):
    http, _ = client
    scope_id = create_scope_via_api(http)

    response = http.post(
        f"/scope-monitorings/{scope_id}/activities",
        json={
            "day": "2026-09-19",
            "errors_reported": 2,
            "incidents_created": 1,
            "feai": ["FE INC000000001", "FE/INC000000001"],
        },
    )

    assert response.status_code == 400


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
    assert body[0]["daily_activities"][0]["status"] == "pending"
    assert body[0]["daily_activities"][0]["ko_reason"] is None


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
    assert body["billing_code"] == "FACT-2026-PAI"
    assert body["note"] is None


# --- Note du périmètre ------------------------------------------------------


def test_patch_scope_note_is_stored_and_read_back(client):
    http, _ = client
    scope_id = create_scope_via_api(http)

    response = http.patch(
        f"/scope-monitorings/{scope_id}",
        json={"note": "  Incident de facturation à suivre.  "},
    )

    assert response.status_code == 204
    assert http.get(f"/scope-monitorings/{scope_id}").json()["note"] == (
        "Incident de facturation à suivre."
    )


def test_patch_scope_note_clears_the_note_when_emptied(client):
    http, _ = client
    scope_id = create_scope_via_api(http)
    http.patch(f"/scope-monitorings/{scope_id}", json={"note": "à supprimer"})

    response = http.patch(f"/scope-monitorings/{scope_id}", json={"note": "   "})

    assert response.status_code == 204
    assert http.get(f"/scope-monitorings/{scope_id}").json()["note"] is None


def test_patch_scope_note_too_long_returns_422(client):
    """422, not 400: the bound is refused by the request schema itself.

    The domain's ``NoteTooLongError`` stays the invariant for every other
    caller, but over HTTP the note never reaches the entity.
    """
    http, _ = client
    scope_id = create_scope_via_api(http)

    response = http.patch(
        f"/scope-monitorings/{scope_id}",
        json={"note": "n" * (NOTE_MAX_LENGTH + 1)},
    )

    assert response.status_code == 422
    assert http.get(f"/scope-monitorings/{scope_id}").json()["note"] is None


def test_patch_scope_note_unknown_scope_returns_404(client):
    http, _ = client

    response = http.patch("/scope-monitorings/unknown", json={"note": "Note"})

    assert response.status_code == 404


def test_patch_scope_note_leaves_the_daily_activities_intact(client):
    http, _ = client
    scope_id = create_scope_via_api(http)
    http.post(
        f"/scope-monitorings/{scope_id}/activities",
        json={
            "day": "2026-09-19",
            "errors_reported": 4,
            "incidents_created": 2,
            "feai": ["INC000000004"],
        },
    )

    response = http.patch(
        f"/scope-monitorings/{scope_id}", json={"note": "suivre la facturation"}
    )

    assert response.status_code == 204
    body = http.get(f"/scope-monitorings/{scope_id}").json()
    assert body["note"] == "suivre la facturation"
    assert body["daily_activities"][0]["errors_reported"] == 4
    assert body["daily_activities"][0]["feai"] == ["INC000000004"]


def test_patch_scope_note_is_listed_with_the_scopes(client):
    http, _ = client
    scope_id = create_scope_via_api(http)
    http.patch(f"/scope-monitorings/{scope_id}", json={"note": "visible partout"})

    body = http.get("/scope-monitorings").json()

    assert body[0]["note"] == "visible partout"


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
    assert body["status"] == "pending"
    assert body["ko_reason"] is None


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