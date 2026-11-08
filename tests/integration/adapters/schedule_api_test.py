"""Périodicité d'un périmètre via l'API.

Deux règles à ne pas casser, et elles se contredisent en apparence :

- **tout le monde** peut éditer la périodicité (comme la note), contrairement aux
  responsables réservés aux administrateurs ;
- une périodicité qui ne tombe **jamais** un jour ouvré du projet est refusée en
  ``422``, parce que le périmètre disparaîtrait silencieusement du backlog et du
  dénominateur de couverture.

Le contrôle a besoin du calendrier du projet : il vit dans le use case, pas dans
le schéma Pydantic. En mode dégradé (``auth=None``), il n'y a pas de projet, donc
pas de calendrier à confronter, et l'édition reste permise comme le reste.
"""

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
from protab.domain.value_objects.monitoring_schedule import MonitoringSchedule
from protab.domain.value_objects.non_working_days import NonWorkingDays
from tests.integration.adapters.auth_api_test import FakeAuthRepository

SCHEDULE_PATH = "/scope-monitorings/scope-001/schedule"

#: Lundi et vendredi, une semaine sur deux, ancrés un lundi.
MONDAY_FRIDAY = {
    "weekdays": [1, 5],
    "interval_weeks": 2,
    "anchor_date": "2026-01-05",
}


def make_scope(repo, scope_id="scope-001", note=None):
    scope = ScopeMonitoring(
        id=scope_id,
        name="Scope A",
        knowledge=KnowledgeBase(id="KB-00000001"),
        officials=Officials(main="LAMA", backup="JMAB"),
        billing_code="FACT-2026-PAI",
        note=note,
    )
    scope.add_daily_activity(
        DailyActivity(
            day=date(2026, 9, 18),
            errors_reported=7,
            incidents_created=1,
            feai=["INC000000018"],
        )
    )
    repo.save(scope)


def logged_client(repo, auth, quadrigramme="jn01") -> TestClient:
    client = TestClient(create_app(repo, auth))
    login = client.post(
        "/auth/login",
        json={"project_id": "alpha", "quadrigramme": quadrigramme, "password": "secret"},
    )
    assert login.status_code == 200
    return client


def test_a_scope_is_created_with_its_schedule():
    repo = InMemoryScopeMonitoringRepository()
    client = TestClient(create_app(repo))

    response = client.post(
        "/scope-monitorings",
        json=[
            {
                "name": "Scope A",
                "knowledge_base_id": "KB-00000001",
                "official_main": "LAMA",
                "official_backup": "JMAB",
                "billing_code": "FACT-1",
                "schedule": MONDAY_FRIDAY,
            }
        ],
    )

    assert response.status_code == 201
    created = client.get("/scope-monitorings").json()[0]
    assert created["schedule"] == MONDAY_FRIDAY


def test_a_scope_created_without_a_schedule_reads_every_working_day():
    repo = InMemoryScopeMonitoringRepository()
    client = TestClient(create_app(repo))

    client.post(
        "/scope-monitorings",
        json=[
            {
                "name": "Scope A",
                "knowledge_base_id": "KB-00000001",
                "official_main": "LAMA",
                "official_backup": "JMAB",
                "billing_code": "FACT-1",
            }
        ],
    )

    created = client.get("/scope-monitorings").json()[0]
    assert created["schedule"] == {
        "weekdays": [],
        "interval_weeks": 1,
        "anchor_date": None,
    }


def test_the_schedule_is_editable_by_a_non_admin():
    """Comme la note, et à la différence des responsables : le binôme qui saisit
    le périmètre sait à quelle fréquence il se traite."""
    repo = InMemoryScopeMonitoringRepository()
    make_scope(repo)
    client = logged_client(repo, FakeAuthRepository(admin_codes=set()))

    response = client.patch(SCHEDULE_PATH, json=MONDAY_FRIDAY)

    assert response.status_code == 204
    assert repo.find_by_id("scope-001").schedule == MonitoringSchedule(
        weekdays=(1, 5), interval_weeks=2, anchor_date=date(2026, 1, 5)
    )


def test_the_edit_leaves_the_note_and_the_days_intact():
    repo = InMemoryScopeMonitoringRepository()
    make_scope(repo, note="contexte")
    client = logged_client(repo, FakeAuthRepository(admin_codes=set()))

    client.patch(SCHEDULE_PATH, json=MONDAY_FRIDAY)

    stored = repo.find_by_id("scope-001")
    assert stored.note == "contexte"
    assert stored.billing_code == "FACT-2026-PAI"
    assert stored.daily_activity_for(date(2026, 9, 18)).errors_reported == 7


def test_a_schedule_that_never_matches_a_working_day_is_a_422():
    """Un samedi dans un projet lundi–vendredi : le périmètre ne serait jamais
    attendu, et disparaîtrait sans le moindre signe."""
    repo = InMemoryScopeMonitoringRepository()
    make_scope(repo)
    client = logged_client(repo, FakeAuthRepository(admin_codes=set()))

    response = client.patch(SCHEDULE_PATH, json={"weekdays": [6]})

    assert response.status_code == 422
    assert repo.find_by_id("scope-001").schedule == MonitoringSchedule()


def test_a_calendar_change_can_make_a_stored_schedule_never_due():
    """Le refus est à l'écriture, pas une garantie éternelle : le calendrier
    peut changer après coup. Le périmètre reste alors lisible, avec sa
    périodicité intacte — on ne supprime rien en silence.
    """
    repo = InMemoryScopeMonitoringRepository()
    make_scope(repo)
    auth = FakeAuthRepository(admin_codes=set())
    # Le projet travaille d'abord tous les jours : le samedi est donc acceptable.
    auth.settings = NonWorkingDays()
    client = logged_client(repo, auth)
    assert client.patch(SCHEDULE_PATH, json={"weekdays": [6]}).status_code == 204

    # Puis le projet revient à la semaine de cinq jours : la périodicité stockée
    # ne tombe plus un jour ouvré, et reste pourtant en place.
    auth.settings = NonWorkingDays.default()
    stored = client.get("/scope-monitorings/scope-001").json()

    assert stored["schedule"]["weekdays"] == [6]


def test_without_authentication_the_check_is_skipped():
    """Mode dégradé ``auth=None`` : aucun projet, donc aucun calendrier."""
    repo = InMemoryScopeMonitoringRepository()
    make_scope(repo)
    client = TestClient(create_app(repo))

    response = client.patch(SCHEDULE_PATH, json={"weekdays": [6]})

    assert response.status_code == 204
    assert repo.find_by_id("scope-001").schedule == MonitoringSchedule(weekdays=(6,))


@pytest.mark.parametrize(
    "payload",
    [
        {"interval_weeks": 0},
        {"interval_weeks": 99},
        {"weekdays": [0]},
        {"weekdays": [8]},
    ],
)
def test_an_out_of_range_value_is_a_422(payload):
    repo = InMemoryScopeMonitoringRepository()
    make_scope(repo)
    client = TestClient(create_app(repo))

    response = client.patch(SCHEDULE_PATH, json=payload)

    assert response.status_code == 422
    assert repo.find_by_id("scope-001").schedule == MonitoringSchedule()


def test_an_unknown_scope_is_a_404():
    repo = InMemoryScopeMonitoringRepository()
    client = TestClient(create_app(repo))

    response = client.patch(
        "/scope-monitorings/inconnu/schedule", json={"weekdays": [1]}
    )

    assert response.status_code == 404


def test_the_schedule_route_requires_a_session():
    repo = InMemoryScopeMonitoringRepository()
    client = TestClient(create_app(repo, FakeAuthRepository()))

    response = client.patch(SCHEDULE_PATH, json={"weekdays": [1]})

    assert response.status_code == 401
