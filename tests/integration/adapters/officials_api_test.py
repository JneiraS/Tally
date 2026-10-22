"""Édition des responsables via l'API : réservée aux administrateurs.

Le contrôle se fait en base **à chaque requête** contre ``project_admins`` :
une session ouverte avant une révocation CLI doit perdre le droit immédiatement
(§28.3 bis interdit précisément un rôle mémorisé au login). Sans
authentification (``auth=None``, dev/tests), la règle suit ``project_context``
et l'édition reste permise.

La réplique d'authentification ``FakeAuthRepository`` vit dans
``auth_api_test.py`` ; son paramètre ``admin_codes`` rejoue ``project_admins``.
"""

import pytest
from fastapi.testclient import TestClient

from protab.adapters.inbound.api.app import create_app
from protab.adapters.outbound.persistence.in_memory_scope_monitoring_repository import (
    InMemoryScopeMonitoringRepository,
)
from protab.domain.entities.scope_monitoring import (
    KnowledgeBase,
    Officials,
    ScopeMonitoring,
)
from tests.integration.adapters.auth_api_test import FakeAuthRepository


UPDATE_OFFICIALS = {"official_main": "MLOZ", "official_backup": "MRAM"}


def make_scope(repo, scope_id="scope-001", main="LAMA", backup="JMAB"):
    repo.save(
        ScopeMonitoring(
            id=scope_id,
            name="Scope A",
            knowledge=KnowledgeBase(id="KB-00000001"),
            officials=Officials(main=main, backup=backup),
        )
    )


def logged_client(repo, auth, quadrigramme="jn01") -> TestClient:
    client = TestClient(create_app(repo, auth))
    login = client.post(
        "/auth/login",
        json={"project_id": "alpha", "quadrigramme": quadrigramme, "password": "secret"},
    )
    assert login.status_code == 200
    return client


def test_without_authentication_the_edit_stays_permitted():
    """Mode dégradé ``auth=None`` : cohérent avec le reste des routes métier."""
    repo = InMemoryScopeMonitoringRepository()
    make_scope(repo)
    client = TestClient(create_app(repo))

    response = client.patch("/scope-monitorings/scope-001/officials", json=UPDATE_OFFICIALS)

    assert response.status_code == 204
    assert repo.find_by_id("scope-001").officials.main == "MLOZ"


def test_a_non_admin_is_refused_with_403():
    repo = InMemoryScopeMonitoringRepository()
    make_scope(repo)
    client = logged_client(repo, FakeAuthRepository(admin_codes=set()))

    response = client.patch(
        "/scope-monitorings/scope-001/officials", json=UPDATE_OFFICIALS
    )

    assert response.status_code == 403
    assert repo.find_by_id("scope-001").officials.main == "LAMA"


def test_an_admin_edits_the_officials():
    repo = InMemoryScopeMonitoringRepository()
    make_scope(repo)
    client = logged_client(repo, FakeAuthRepository(admin_codes={"ABCD"}), quadrigramme="abcd")

    response = client.patch(
        "/scope-monitorings/scope-001/officials", json=UPDATE_OFFICIALS
    )

    assert response.status_code == 204
    officials = repo.find_by_id("scope-001").officials
    assert (officials.main, officials.backup) == ("MLOZ", "MRAM")


def test_an_unknown_scope_is_a_404_for_an_admin():
    repo = InMemoryScopeMonitoringRepository()
    client = logged_client(
        repo, FakeAuthRepository(admin_codes={"ABCD"}), quadrigramme="abcd"
    )

    response = client.patch(
        "/scope-monitorings/inconnu/officials", json=UPDATE_OFFICIALS
    )

    assert response.status_code == 404


def test_a_non_admin_cannot_probe_an_unknown_scope():
    """La permission précède la lecture : un id inconnu répond 403, pas 404,
    sinon le refus serve de détecteur d'identifiants.
    """
    repo = InMemoryScopeMonitoringRepository()
    client = logged_client(repo, FakeAuthRepository(admin_codes=set()))

    response = client.patch(
        "/scope-monitorings/inconnu/officials", json=UPDATE_OFFICIALS
    )

    assert response.status_code == 403


def test_a_blank_official_is_a_400_and_writes_nothing():
    repo = InMemoryScopeMonitoringRepository()
    make_scope(repo)
    client = logged_client(
        repo, FakeAuthRepository(admin_codes={"ABCD"}), quadrigramme="abcd"
    )

    response = client.patch(
        "/scope-monitorings/scope-001/officials",
        json={"official_main": "   ", "official_backup": "MRAM"},
    )

    assert response.status_code == 400
    assert repo.find_by_id("scope-001").officials.main == "LAMA"


def test_the_note_stays_editable_by_a_non_admin():
    """Seule l'édition des responsables est réservée aux admins : la note
    reste un droit de tout officiel.
    """
    repo = InMemoryScopeMonitoringRepository()
    make_scope(repo)
    client = logged_client(repo, FakeAuthRepository(admin_codes=set()))

    response = client.patch(
        "/scope-monitorings/scope-001", json={"note": "Contexte de facturation"}
    )

    assert response.status_code == 204
    assert repo.find_by_id("scope-001").note == "Contexte de facturation"


def test_the_officials_route_requires_a_session():
    repo = InMemoryScopeMonitoringRepository()
    client = TestClient(create_app(repo, FakeAuthRepository(admin_codes={"ABCD"})))

    response = client.patch(
        "/scope-monitorings/scope-001/officials", json=UPDATE_OFFICIALS
    )

    assert response.status_code == 401


@pytest.mark.parametrize("admin_codes,expected", [({"JN01"}, True), (set(), False)])
def test_auth_me_reports_the_admin_status(admin_codes, expected):
    """Le front n'a pas le droit de deviner : ``is_admin`` est calculé à la
    demande, pas stocké dans la session.
    """
    repo = InMemoryScopeMonitoringRepository()
    client = logged_client(repo, FakeAuthRepository(admin_codes=admin_codes))

    assert client.get("/auth/me").json()["is_admin"] is expected


def test_the_login_response_reports_the_admin_status():
    auth = FakeAuthRepository(admin_codes={"ABCD"})
    client = TestClient(create_app(InMemoryScopeMonitoringRepository(), auth))

    response = client.post(
        "/auth/login",
        json={"project_id": "alpha", "quadrigramme": "abcd", "password": "secret"},
    )

    assert response.json()["is_admin"] is True
