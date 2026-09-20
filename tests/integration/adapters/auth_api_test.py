from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient

from protab.adapters.inbound.api.app import create_app
from protab.adapters.outbound.persistence.in_memory_scope_monitoring_repository import (
    InMemoryScopeMonitoringRepository,
)
from protab.adapters.outbound.persistence.postgres_auth_repository import (
    AuthSession,
    Project,
)


class FakeAuthRepository:
    def __init__(self) -> None:
        self.sessions: dict[str, AuthSession] = {}

    def list_projects(self) -> list[Project]:
        return [Project("alpha", "Projet Alpha")]

    def get_project(self, project_id: str) -> Project | None:
        return Project("alpha", "Projet Alpha") if project_id == "alpha" else None

    def authenticate(self, project_id: str, quadrigramme: str, password: str) -> bool:
        return project_id == "alpha" and password == "secret"

    def create_session(self, project_id: str, quadrigramme: str) -> AuthSession:
        session = AuthSession(
            "test-token",
            project_id,
            quadrigramme.upper(),
            datetime.now(timezone.utc) + timedelta(hours=1),
        )
        self.sessions[session.token] = session
        return session

    def find_session(self, token: str) -> AuthSession | None:
        return self.sessions.get(token)

    def delete_session(self, token: str) -> None:
        self.sessions.pop(token, None)


def test_authenticated_routes_require_a_valid_session():
    client = TestClient(
        create_app(InMemoryScopeMonitoringRepository(), FakeAuthRepository())
    )

    assert client.get("/projects").json() == [{"id": "alpha", "name": "Projet Alpha"}]
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
