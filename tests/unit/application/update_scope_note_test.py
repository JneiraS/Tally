from datetime import date

import pytest

from protab.adapters.outbound.persistence.in_memory_audit_trail_repository import (
    InMemoryAuditTrailRepository,
)
from protab.adapters.outbound.persistence.in_memory_scope_monitoring_repository import (
    InMemoryScopeMonitoringRepository,
)
from protab.application.actor_context import reset_current_actor, set_current_actor
from protab.application.commands.scope_monitoring import UpdateScopeNoteCommand
from protab.application.use_cases.update_scope_note import UpdateScopeNoteUseCase
from protab.domain.entities.daily_activity import DailyActivity
from protab.domain.entities.scope_monitoring import (
    NOTE_MAX_LENGTH,
    KnowledgeBase,
    Officials,
    ScopeMonitoring,
)
from protab.domain.exceptions import (
    NoteTooLongError,
    ScopeMonitoringNotFoundError,
)
from tests.unit.application.recording_repository import (
    RecordingScopeMonitoringRepository,
)


@pytest.fixture(autouse=True)
def clean_actor():
    yield
    reset_current_actor(set_current_actor(None))


def make_scope(scope_id="scope-001", note=None):
    scope = ScopeMonitoring(
        id=scope_id,
        name="Scope A",
        knowledge=KnowledgeBase(id="KB-00000001"),
        officials=Officials(main="Main", backup="Backup"),
        note=note,
    )
    for day, errors in ((date(2026, 9, 18), 7), (date(2026, 9, 19), 2)):
        scope.add_daily_activity(
            DailyActivity(
                day=day,
                errors_reported=errors,
                incidents_created=1,
                feai=[f"INC{day.day:09d}"],
            )
        )
    return scope


def test_update_note_stores_the_value():
    repo = InMemoryScopeMonitoringRepository()
    repo.save(make_scope())

    UpdateScopeNoteUseCase(repo).execute(
        UpdateScopeNoteCommand(scope_id="scope-001", note="Facturation à vérifier")
    )

    assert repo.find_by_id("scope-001").note == "Facturation à vérifier"


def test_update_note_writes_only_the_note():
    """A note edit must not rewrite the whole scope.

    Rewriting the aggregate persists every day read earlier, so a concurrent
    edit to another day of the same scope is silently overwritten.
    """
    repo = RecordingScopeMonitoringRepository(InMemoryScopeMonitoringRepository())
    repo.save(make_scope())
    repo.reset()

    UpdateScopeNoteUseCase(repo).execute(
        UpdateScopeNoteCommand(scope_id="scope-001", note="Facturation à vérifier")
    )

    assert repo.writes == [
        ("update_note", "scope-001", "Facturation à vérifier"),
    ]


def test_update_note_leaves_the_daily_activities_intact():
    repo = InMemoryScopeMonitoringRepository()
    repo.save(make_scope())

    UpdateScopeNoteUseCase(repo).execute(
        UpdateScopeNoteCommand(scope_id="scope-001", note="Note")
    )

    scope = repo.find_by_id("scope-001")
    assert scope.daily_activity_for(date(2026, 9, 18)).errors_reported == 7
    assert scope.daily_activity_for(date(2026, 9, 19)).errors_reported == 2
    assert scope.daily_activity_for(date(2026, 9, 19)).feai == ["INC000000019"]


def test_update_note_records_an_audit_event():
    repo = InMemoryScopeMonitoringRepository()
    audit = InMemoryAuditTrailRepository()
    repo.save(make_scope(note="ancienne note"))
    set_current_actor("ABCD")

    UpdateScopeNoteUseCase(repo, audit).execute(
        UpdateScopeNoteCommand(scope_id="scope-001", note="nouvelle note")
    )

    assert len(audit.events) == 1
    event = audit.events[0]
    assert event.action == "scope_note_updated"
    assert event.actor == "ABCD"
    assert event.scope_id == "scope-001"
    assert event.day is None
    assert event.changes == {"note": {"old": "ancienne note", "new": "nouvelle note"}}


def test_update_note_records_nothing_when_the_note_is_unchanged():
    repo = InMemoryScopeMonitoringRepository()
    audit = InMemoryAuditTrailRepository()
    repo.save(make_scope(note="inchangée"))

    UpdateScopeNoteUseCase(repo, audit).execute(
        UpdateScopeNoteCommand(scope_id="scope-001", note="  inchangée  ")
    )

    assert audit.events == []


def test_update_note_clears_the_note_when_emptied():
    repo = InMemoryScopeMonitoringRepository()
    audit = InMemoryAuditTrailRepository()
    repo.save(make_scope(note="à supprimer"))

    UpdateScopeNoteUseCase(repo, audit).execute(
        UpdateScopeNoteCommand(scope_id="scope-001", note="   ")
    )

    assert repo.find_by_id("scope-001").note is None
    assert audit.events[0].changes == {
        "note": {"old": "à supprimer", "new": None},
    }


def test_update_note_unknown_scope_raises():
    repo = InMemoryScopeMonitoringRepository()

    with pytest.raises(ScopeMonitoringNotFoundError):
        UpdateScopeNoteUseCase(repo).execute(
            UpdateScopeNoteCommand(scope_id="unknown", note="Note")
        )


def test_update_note_too_long_raises_and_changes_nothing():
    repo = InMemoryScopeMonitoringRepository()
    audit = InMemoryAuditTrailRepository()
    repo.save(make_scope(note="avant"))

    with pytest.raises(NoteTooLongError):
        UpdateScopeNoteUseCase(repo, audit).execute(
            UpdateScopeNoteCommand(
                scope_id="scope-001", note="n" * (NOTE_MAX_LENGTH + 1)
            )
        )

    assert repo.find_by_id("scope-001").note == "avant"
    assert audit.events == []