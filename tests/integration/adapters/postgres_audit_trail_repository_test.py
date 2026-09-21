"""Integration tests for the PostgreSQL audit trail adapter.

Skipped when ``PROTAB_TEST_DATABASE_URL`` is not set, like the other
PostgreSQL integration tests.
"""

import os
from datetime import date, datetime, timedelta, timezone

import psycopg
import pytest

from protab.adapters.outbound.persistence.postgres_audit_trail_repository import (
    PostgresAuditTrailRepository,
)
from protab.adapters.outbound.persistence.postgres_scope_monitoring_repository import (
    reset_current_project,
    set_current_project,
)
from protab.domain.entities.audit_event import AuditEvent
from protab.ports.outbound.audit_trail_repository import AuditEventQuery

TEST_DATABASE_URL = os.getenv("PROTAB_TEST_DATABASE_URL")

pytestmark = pytest.mark.skipif(
    not TEST_DATABASE_URL,
    reason="PROTAB_TEST_DATABASE_URL not set: PostgreSQL integration tests are skipped.",
)


def truncate_audit() -> None:
    assert TEST_DATABASE_URL is not None
    with psycopg.connect(TEST_DATABASE_URL, autocommit=True) as conn:
        conn.execute("TRUNCATE audit_log")


@pytest.fixture
def repo():
    assert TEST_DATABASE_URL is not None
    repository = PostgresAuditTrailRepository(TEST_DATABASE_URL)
    repository.connect()
    truncate_audit()
    yield repository
    repository.close()


@pytest.fixture
def project():
    token = set_current_project("project-audit")
    yield
    reset_current_project(token)


def make_event(action="activity_updated", day=date(2026, 9, 19), **kw):
    return AuditEvent(
        action=action,
        actor=kw.get("actor", "ABCD"),
        scope_id=kw.get("scope_id", "scope-001"),
        day=day,
        changes=kw.get("changes", {"errors_reported": {"old": 1, "new": 2}}),
    )


def test_record_and_list_roundtrip(repo, project):
    event = make_event()
    repo.record(event)

    events = repo.list(AuditEventQuery())
    assert len(events) == 1
    stored = events[0]
    assert stored.action == "activity_updated"
    assert stored.actor == "ABCD"
    assert stored.scope_id == "scope-001"
    assert stored.day == date(2026, 9, 19)
    assert stored.project_id == "project-audit"
    assert stored.changes == {"errors_reported": {"old": 1, "new": 2}}
    assert stored.created_at is not None


def test_list_orders_most_recent_first(repo, project):
    base = datetime(2026, 9, 19, 12, 0, 0, tzinfo=timezone.utc)
    created_ats = [
        base - timedelta(minutes=30),
        base - timedelta(minutes=5),
        base - timedelta(minutes=10),
    ]
    for created_at in created_ats:
        repo.record(
            AuditEvent(
                action="activity_updated",
                actor="ABCD",
                scope_id="scope-001",
                day=date(2026, 9, 19),
                changes={},
                created_at=created_at,
            )
        )

    events = repo.list(AuditEventQuery())
    want = [
        base - timedelta(minutes=5),
        base - timedelta(minutes=10),
        base - timedelta(minutes=30),
    ]
    assert [event.created_at for event in events] == want


def test_list_filters_by_scope_actor_action_and_dates(repo, project):
    repo.record(make_event(action="activity_created", scope_id="s1", day=date(2026, 9, 18)))
    repo.record(make_event(action="activity_updated", scope_id="s2", day=date(2026, 9, 19)))
    repo.record(make_event(action="activity_completed", scope_id="s1", day=date(2026, 9, 20)))

    assert len(repo.list(AuditEventQuery(scope_id="s1"))) == 2
    assert len(repo.list(AuditEventQuery(action="activity_updated"))) == 1
    assert len(repo.list(AuditEventQuery(from_date=date(2026, 9, 19)))) == 2
    assert len(repo.list(AuditEventQuery(to_date=date(2026, 9, 18)))) == 1
    assert len(repo.list(AuditEventQuery(limit=1))) == 1
    assert len(repo.list(AuditEventQuery(actor="ZZZZ"))) == 0


def test_list_isolated_by_project(repo, project):
    repo.record(make_event())

    other_token = set_current_project("another-project")
    try:
        assert repo.list(AuditEventQuery()) == []
    finally:
        reset_current_project(other_token)

    assert len(repo.list(AuditEventQuery())) == 1