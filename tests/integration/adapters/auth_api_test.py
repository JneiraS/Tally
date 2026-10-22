from datetime import datetime, timezone

from fastapi.testclient import TestClient

from protab.adapters.inbound.api.app import create_app
from protab.adapters.outbound.persistence.in_memory_scope_monitoring_repository import (
    InMemoryScopeMonitoringRepository,
)
from protab.adapters.outbound.persistence.postgres_auth_repository import (
    SESSION_DURATION,
    AuthSession,
    Project,
)
from protab.domain.value_objects.non_working_days import NonWorkingDays


class FakeAuthRepository:
    def __init__(
        self, known_codes: set[str] | None = None, admin_codes: set[str] | None = None
    ) -> None:
        self.sessions: dict[str, AuthSession] = {}
        self.known_codes = known_codes or set()
        self.admin_codes = {code.strip().upper() for code in (admin_codes or set())}
        self.settings = NonWorkingDays.default()

    def list_projects(self) -> list[Project]:
        return [Project("alpha", "Projet Alpha")]

    def get_project(self, project_id: str) -> Project | None:
        if project_id != "alpha":
            return None
        return Project("alpha", "Projet Alpha", self.settings)

    def update_non_working_days(
        self, project_id: str, excluded_weekdays: list[int], excluded_dates: list[str]
    ) -> Project | None:
        self.settings = NonWorkingDays.from_raw(
            {
                "excluded_weekdays": excluded_weekdays,
                "excluded_dates": excluded_dates,
            }
        )
        return self.get_project(project_id)

    def authenticate(self, project_id: str, quadrigramme: str, password: str) -> bool:
        if not (project_id == "alpha" and password == "secret"):
            return False
        return not self.known_codes or quadrigramme.strip().upper() in self.known_codes

    def create_session(self, project_id: str, quadrigramme: str) -> AuthSession:
        session = AuthSession(
            "test-token",
            project_id,
            quadrigramme.upper(),
            datetime.now(timezone.utc) + SESSION_DURATION,
        )
        self.sessions[session.token] = session
        return session

    def find_session(self, token: str) -> AuthSession | None:
        return self.sessions.get(token)

    def delete_session(self, token: str) -> None:
        self.sessions.pop(token, None)

    def is_admin(self, project_id: str, quadrigramme: str) -> bool:
        return (quadrigramme or "").strip().upper() in self.admin_codes

    def is_current_project_admin(self, quadrigramme: str) -> bool:
        return self.is_admin(project_id="alpha", quadrigramme=quadrigramme)


def test_authenticated_routes_require_a_valid_session():
    client = TestClient(
        create_app(InMemoryScopeMonitoringRepository(), FakeAuthRepository())
    )

    assert client.get("/projects").json() == [{
        "id": "alpha",
        "name": "Projet Alpha",
        "non_working_days": {"excluded_weekdays": [6, 7], "excluded_dates": []},
    }]
    assert client.get("/scope-monitorings").status_code == 401
    assert client.post(
        "/auth/login",
        json={"project_id": "alpha", "quadrigramme": "jn01", "password": "secret"},
    ).status_code == 200
    assert client.get("/auth/me").json()["quadrigramme"] == "JN01"
    assert client.get("/scope-monitorings").status_code == 200
    assert client.post("/auth/logout").status_code == 204
    assert client.get("/auth/me").status_code == 401


def test_in_memory_application_remains_unauthenticated_for_existing_fixtures():
    client = TestClient(create_app(InMemoryScopeMonitoringRepository()))
    assert client.get("/scope-monitorings").status_code == 200


def test_login_rejects_invented_quadrigramme_when_known_codes_exist():
    client = TestClient(
        create_app(
            InMemoryScopeMonitoringRepository(),
            FakeAuthRepository(known_codes={"ABCD"}),
        )
    )

    assert client.post(
        "/auth/login",
        json={"project_id": "alpha", "quadrigramme": "abcd", "password": "secret"},
    ).status_code == 200

    assert client.post(
        "/auth/login",
        json={"project_id": "alpha", "quadrigramme": "ZZZZ", "password": "secret"},
    ).status_code == 401


def test_project_settings_are_authenticated_and_project_scoped():
    auth = FakeAuthRepository()
    client = TestClient(create_app(InMemoryScopeMonitoringRepository(), auth))

    assert client.get("/project/settings").status_code == 401
    client.post(
        "/auth/login",
        json={"project_id": "alpha", "quadrigramme": "jn01", "password": "secret"},
    )

    response = client.put(
        "/project/settings",
        json={"excluded_weekdays": [5, 6], "excluded_dates": ["2026-12-25"]},
    )
    assert response.status_code == 200
    assert response.json()["non_working_days"] == {
        "excluded_weekdays": [5, 6],
        "excluded_dates": ["2026-12-25"],
    }
    assert client.get("/project/settings").json()["non_working_days"] == response.json()[
        "non_working_days"
    ]


def test_project_settings_reject_invalid_weekday():
    client = TestClient(create_app(InMemoryScopeMonitoringRepository(), FakeAuthRepository()))
    client.post(
        "/auth/login",
        json={"project_id": "alpha", "quadrigramme": "jn01", "password": "secret"},
    )

    response = client.put(
        "/project/settings",
        json={"excluded_weekdays": [0], "excluded_dates": []},
    )
    assert response.status_code == 422


def test_project_settings_reject_a_calendar_without_any_working_day():
    """Un calendrier sans jour ouvré n'a rien à afficher : la page principale
    chercherait un jour ouvré jusqu'à geler. Un client HTTP peut demander ce que
    la modale ne peut pas produire, donc la porte est ici."""
    auth = FakeAuthRepository()
    client = TestClient(create_app(InMemoryScopeMonitoringRepository(), auth))
    client.post(
        "/auth/login",
        json={"project_id": "alpha", "quadrigramme": "jn01", "password": "secret"},
    )

    response = client.put(
        "/project/settings",
        json={"excluded_weekdays": [1, 2, 3, 4, 5, 6, 7], "excluded_dates": []},
    )

    assert response.status_code == 422
    assert auth.settings == NonWorkingDays.default()


def test_project_settings_still_accept_a_calendar_without_a_weekday():
    """Le refus porte sur la semaine entière, pas sur le week-end : un projet qui
    travaille le samedi reste saisissable."""
    client = TestClient(create_app(InMemoryScopeMonitoringRepository(), FakeAuthRepository()))
    client.post(
        "/auth/login",
        json={"project_id": "alpha", "quadrigramme": "jn01", "password": "secret"},
    )

    response = client.put(
        "/project/settings",
        json={"excluded_weekdays": [6, 7], "excluded_dates": []},
    )

    assert response.status_code == 200


def login_and_read_session_cookie() -> str:
    client = TestClient(
        create_app(InMemoryScopeMonitoringRepository(), FakeAuthRepository())
    )
    response = client.post(
        "/auth/login",
        json={"project_id": "alpha", "quadrigramme": "jn01", "password": "secret"},
    )
    assert response.status_code == 200
    return response.headers["set-cookie"]


def test_session_cookie_is_httponly_and_samesite_lax():
    cookie = login_and_read_session_cookie()

    assert "httponly" in cookie.lower()
    assert "samesite=lax" in cookie.lower()


def test_session_cookie_expires_with_the_session_it_carries():
    """Le cookie et la ligne ``auth_sessions`` doivent tomber ensemble : un
    cookie plus long laisserait un Max-Age qui promet une session morte, et la
    dérive serait invisible jusqu'au premier redémarrage du navigateur."""
    cookie = login_and_read_session_cookie()

    assert f"max-age={int(SESSION_DURATION.total_seconds())}" in cookie.lower()


def test_session_cookie_omits_secure_over_plain_http(monkeypatch):
    monkeypatch.delenv("PROTAB_COOKIE_SECURE", raising=False)

    assert "secure" not in login_and_read_session_cookie().lower()


def test_session_cookie_is_secure_when_configured(monkeypatch):
    monkeypatch.setenv("PROTAB_COOKIE_SECURE", "1")

    assert "secure" in login_and_read_session_cookie().lower()
