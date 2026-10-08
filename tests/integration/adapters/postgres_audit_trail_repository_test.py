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
    """Mirrors tests/unit/adapters/audit_trail_filter_test.py against real SQL."""
    base = datetime(2026, 9, 19, 8, 0, tzinfo=timezone.utc)
    repo.record(
        AuditEvent(
            action="activity_created",
            actor="ABCD",
            scope_id="s1",
            day=date(2026, 9, 18),
            changes={},
            created_at=base,
        )
    )
    repo.record(
        AuditEvent(
            action="activity_updated",
            actor="ABEF",
            scope_id="s2",
            day=date(2026, 9, 19),
            changes={},
            created_at=base + timedelta(hours=1),
        )
    )
    repo.record(
        AuditEvent(
            action="activity_completed",
            actor="XYZW",
            scope_id="s1",
            day=date(2026, 9, 20),
            changes={},
            created_at=base + timedelta(hours=2),
        )
    )

    assert len(repo.list(AuditEventQuery(scope_ids=("s1",)))) == 2
    assert len(repo.list(AuditEventQuery(scope_ids=("s1", "s2")))) == 3
    assert len(repo.list(AuditEventQuery(scope_ids=()))) == 3
    assert repo.list(AuditEventQuery(scope_ids=("s2",)))[0].scope_id == "s2"
    assert len(repo.list(AuditEventQuery(action="activity_updated"))) == 1
    assert len(repo.list(AuditEventQuery(limit=1))) == 1

    # Actor: uppercased prefix, case-insensitive. The exact comparison this
    # replaced returned nothing for "abcd" or for the partial "AB".
    assert len(repo.list(AuditEventQuery(actor="ABCD"))) == 1
    assert len(repo.list(AuditEventQuery(actor="abcd"))) == 1
    assert len(repo.list(AuditEventQuery(actor="AB"))) == 2
    assert len(repo.list(AuditEventQuery(actor="ZZZZ"))) == 0

    # Period: half-open [from, to) on created_at.
    assert (
        len(
            repo.list(
                AuditEventQuery(
                    from_created_at=base + timedelta(hours=1),
                    to_created_at=base + timedelta(hours=2),
                )
            )
        )
        == 1
    )
    assert len(repo.list(AuditEventQuery(from_created_at=base))) == 3
    assert len(repo.list(AuditEventQuery(to_created_at=base))) == 0

    # Conjunction.
    assert len(repo.list(AuditEventQuery(actor="AB", scope_ids=("s2",)))) == 1


def test_list_period_keeps_events_without_a_business_day(repo, project):
    """``day`` is NULL for scope_created/scope_imported/scope_note_updated.

    Filtering on ``day`` silently dropped a third of the journal the moment a
    period was set; the period must read ``created_at`` and keep them.
    """
    base = datetime(2026, 9, 19, 8, 0, tzinfo=timezone.utc)
    repo.record(
        AuditEvent(
            action="scope_created",
            actor="ABCD",
            scope_id="s1",
            day=None,
            changes={},
            created_at=base,
        )
    )
    repo.record(
        AuditEvent(
            action="scope_note_updated",
            actor="ABCD",
            scope_id="s1",
            day=None,
            changes={},
            created_at=base + timedelta(hours=1),
        )
    )

    found = repo.list(
        AuditEventQuery(
            from_created_at=base,
            to_created_at=base + timedelta(hours=2),
        )
    )

    assert sorted(event.action for event in found) == [
        "scope_created",
        "scope_note_updated",
    ]


def test_list_isolated_by_project(repo, project):
    repo.record(make_event())

    other_token = set_current_project("another-project")
    try:
        assert repo.list(AuditEventQuery()) == []
    finally:
        reset_current_project(other_token)

    assert len(repo.list(AuditEventQuery())) == 1