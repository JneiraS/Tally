"""Business routes must be authenticated by default (allowlist, not denylist).

Tenant isolation is enforced by the ``project_context`` dependency, which is
attached per route. That makes it opt-in: a new route that forgets the
dependency would read and write across every tenant. This test inverts the
polarity — only the routes listed in ``PUBLIC_ROUTES`` may be unauthenticated,
so any new route is required to opt *in* to being public and a forgotten
dependency fails here instead of leaking data.
"""

from fastapi.routing import APIRoute
from fastapi.testclient import TestClient

from protab.adapters.inbound.api.app import create_app
from protab.adapters.outbound.persistence.in_memory_scope_monitoring_repository import (
    InMemoryScopeMonitoringRepository,
)
from tests.integration.adapters.auth_api_test import FakeAuthRepository

# The only routes allowed to serve a request without an authenticated project.
# Documented in README.md ("Routes publiques"). Keep this list explicit.
PUBLIC_ROUTES = {
    "/healthz",
    "/projects",
    "/auth/login",
    "/auth/me",
    "/auth/logout",
    "/openapi.json",
    "/docs",
    "/docs/oauth2-redirect",
    "/redoc",
}


def business_routes() -> list[APIRoute]:
    app = create_app(InMemoryScopeMonitoringRepository())
    return [
        route
        for route in app.routes
        if isinstance(route, APIRoute) and route.path not in PUBLIC_ROUTES
    ]


def test_business_routes_are_discovered():
    """Guards against a silent rename making this test vacuously pass."""
    paths = {route.path for route in business_routes()}
    assert "/scope-monitorings" in paths
    assert "/project/settings" in paths


def test_every_business_route_depends_on_project_context():
    unprotected = []
    for route in business_routes():
        dependencies = {
            getattr(dependency.dependency, "__name__", "")
            for dependency in route.dependencies
        }
        if "project_context" not in dependencies:
            methods = ",".join(sorted(route.methods or []))
            unprotected.append(f"{methods} {route.path}")

    assert unprotected == []


def test_public_routes_stay_unauthenticated():
    """A public route answers an anonymous caller; a business route does not.

    Uses a real auth repository so the ``project_context`` dependency has to
    reject the request, rather than falling back to a default tenant the way
    the in-memory fixtures do.
    """
    client = TestClient(
        create_app(InMemoryScopeMonitoringRepository(), FakeAuthRepository())
    )

    assert client.get("/healthz").status_code == 200
    assert client.get("/scope-monitorings").status_code == 401
    assert client.get("/project/settings").status_code == 401
    assert client.get("/api/audit-log").status_code == 401


def test_old_audit_log_path_is_not_an_api_route():
    """The old /audit-log endpoint was moved to /api/audit-log so that
    the SPA route /audit-log serves index.html on hard refresh.
    """
    client = TestClient(
        create_app(InMemoryScopeMonitoringRepository(), FakeAuthRepository())
    )

    # The old path must NOT be an API route (404, not 401 or 200)
    r = client.get("/audit-log")
    assert r.status_code == 404, (
        "GET /audit-log must return 404 so the SPA owns this path; "
        f"got {r.status_code}"
    )
