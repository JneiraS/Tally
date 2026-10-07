"""``list`` must select the same events in both audit trail adapters.

``InMemoryAuditTrailRepository`` and ``PostgresAuditTrailRepository`` implement
``AuditTrailRepository`` and are therefore interchangeable (AGENTS.md §11). The
original three defects of the filter all lived in the gap between them: the
scope filter demanded a pasted UUID, the actor filter compared an exact
uppercase code, and the period filtered ``day`` — a column that is ``NULL`` for
every ``scope_created`` / ``scope_imported`` / ``scope_note_updated`` event.

The matrix below is written against the **in-memory** adapter so it runs with
no database. ``postgres_audit_trail_repository_test.py`` mirrors it against real
SQL; the assertions here are the spec, not a re-implementation of it.
"""

from datetime import datetime, timezone

from protab.adapters.outbound.persistence.in_memory_audit_trail_repository import (
    InMemoryAuditTrailRepository,
)
from protab.domain.entities.audit_event import AuditEvent
from protab.ports.outbound.audit_trail_repository import AuditEventQuery

BASE = datetime(2026, 9, 19, 8, 0, tzinfo=timezone.utc)


def make_event(**kw) -> AuditEvent:
    return AuditEvent(
        action=kw.get("action", "activity_updated"),
        actor=kw.get("actor", "ABCD"),
        scope_id=kw.get("scope_id", "scope-1"),
        day=kw.get("day"),
        changes=kw.get("changes", {}),
        created_at=kw.get("created_at", BASE),
    )


def recorded(events: list[AuditEvent]) -> InMemoryAuditTrailRepository:
    """Return a repository holding ``events``.

    ``InMemoryAuditTrailRepository.record`` stamps the current project and
    ``list`` only returns rows of that project; with no context set both fall
    back to the same default, so the rows written here are the rows read back.
    """
    repo = InMemoryAuditTrailRepository()
    for event in events:
        repo.record(event)
    return repo


def actions(repo: InMemoryAuditTrailRepository, query: AuditEventQuery) -> list[str]:
    return [event.action for event in repo.list(query)]


def test_an_empty_query_returns_every_event():
    repo = recorded([make_event(), make_event(scope_id="scope-2")])

    assert len(repo.list(AuditEventQuery())) == 2


def test_scope_ids_matches_any_of_the_given_scopes():
    repo = recorded(
        [
            make_event(scope_id="scope-1"),
            make_event(scope_id="scope-2"),
            make_event(scope_id="scope-3"),
        ]
    )

    assert actions(repo, AuditEventQuery(scope_ids=("scope-1",))) == ["activity_updated"]
    assert actions(repo, AuditEventQuery(scope_ids=("scope-1", "scope-3"))) == [
        "activity_updated",
        "activity_updated",
    ]
    assert repo.list(AuditEventQuery(scope_ids=("scope-1",))) [0].scope_id == "scope-1"


def test_an_empty_scope_ids_does_not_filter():
    repo = recorded([make_event(scope_id="scope-1"), make_event(scope_id="scope-2")])

    assert len(repo.list(AuditEventQuery(scope_ids=()))) == 2


def test_actor_matches_a_prefix_and_ignores_case():
    """The defect this pins: ``abcd`` and ``AB`` used to return nothing."""
    repo = recorded(
        [
            make_event(actor="ABCD"),
            make_event(actor="ABEF"),
            make_event(actor="XYZW"),
            make_event(actor=None),
        ]
    )

    assert len(repo.list(AuditEventQuery(actor="ABCD"))) == 1
    assert len(repo.list(AuditEventQuery(actor="abcd"))) == 1
    assert len(repo.list(AuditEventQuery(actor="AB"))) == 2
    assert len(repo.list(AuditEventQuery(actor="Z"))) == 0


def test_actor_ignores_surrounding_whitespace():
    repo = recorded([make_event(actor="ABCD")])

    assert len(repo.list(AuditEventQuery(actor="  abcd  "))) == 1


def test_the_period_filters_on_created_at_not_on_day():
    """A ``day IS NULL`` event must survive a period: this is the silent loss."""
    repo = recorded(
        [
            make_event(action="scope_created", day=None, created_at=BASE),
            make_event(action="activity_updated", day=BASE.date(), created_at=BASE),
        ]
    )

    inside = repo.list(
        AuditEventQuery(
            from_created_at=BASE,
            to_created_at=BASE.replace(hour=9),
        )
    )
    assert [event.action for event in inside] == ["scope_created", "activity_updated"]


def test_the_period_window_is_half_open():
    repo = recorded(
        [
            make_event(action="before", created_at=BASE.replace(hour=7)),
            make_event(action="lower-bound", created_at=BASE),
            make_event(action="upper-bound", created_at=BASE.replace(hour=9)),
        ]
    )

    found = repo.list(
        AuditEventQuery(
            from_created_at=BASE,
            to_created_at=BASE.replace(hour=9),
        )
    )

    assert [event.action for event in found] == ["lower-bound"]


def test_filters_combine_as_a_conjunction():
    repo = recorded(
        [
            make_event(actor="ABCD", scope_id="scope-1"),
            make_event(actor="ABEF", scope_id="scope-1"),
            make_event(actor="ABCD", scope_id="scope-2"),
        ]
    )

    found = repo.list(AuditEventQuery(actor="ABCD", scope_ids=("scope-1",)))

    assert [event.scope_id for event in found] == ["scope-1"]


def test_limit_bounds_the_rows():
    repo = recorded([make_event() for _ in range(3)])

    assert len(repo.list(AuditEventQuery(limit=2))) == 2


def test_events_come_back_most_recent_first():
    repo = recorded(
        [
            make_event(created_at=BASE.replace(hour=7)),
            make_event(created_at=BASE),
        ]
    )

    found = repo.list(AuditEventQuery())

    assert [event.created_at for event in found] == [BASE, BASE.replace(hour=7)]