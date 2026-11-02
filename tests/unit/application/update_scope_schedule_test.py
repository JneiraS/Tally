"""Édition de la périodicité d'un périmètre.

La périodicité dit sur quels jours ouvrés un périmètre est **attendu** ; elle ne
retire jamais le droit de le saisir un autre jour. Comme la note et les
responsables, l'édition passe par une écriture ciblée du port (§28.1), jamais par
``save()``.

Le seul refus qui ne peut pas vivre dans le domaine est « cette périodicité ne
tombera jamais un jour ouvré » : il faut le calendrier du projet, que le domaine
ne connaît pas. Le use case l'injecte donc, et la vérification précède toute
mutation — l'adaptateur in-memory renvoie l'objet qu'il stocke, donc muter avant
de refuser corromprait la base de test.
"""

from datetime import date

import pytest

from protab.adapters.outbound.persistence.in_memory_audit_trail_repository import (
    InMemoryAuditTrailRepository,
)
from protab.adapters.outbound.persistence.in_memory_scope_monitoring_repository import (
    InMemoryScopeMonitoringRepository,
)
from protab.application.actor_context import reset_current_actor, set_current_actor
from protab.application.commands.scope_monitoring import UpdateScopeScheduleCommand
from protab.application.use_cases.update_scope_schedule import (
    UpdateScopeScheduleUseCase,
)
from protab.domain.entities.daily_activity import DailyActivity
from protab.domain.entities.scope_monitoring import (
    KnowledgeBase,
    Officials,
    ScopeMonitoring,
)
from protab.domain.exceptions import (
    ScheduleNeverDueError,
    ScopeMonitoringNotFoundError,
)
from protab.domain.value_objects.monitoring_schedule import MonitoringSchedule
from protab.domain.value_objects.non_working_days import IsoWeekday, NonWorkingDays
from tests.unit.application.recording_repository import (
    RecordingScopeMonitoringRepository,
)

MONDAY = int(IsoWeekday.MONDAY)
FRIDAY = int(IsoWeekday.FRIDAY)
SATURDAY = int(IsoWeekday.SATURDAY)

MONDAY_TO_FRIDAY = NonWorkingDays.default()
ANCHOR = date(2026, 1, 5)


@pytest.fixture(autouse=True)
def clean_actor():
    yield
    reset_current_actor(set_current_actor(None))


def make_scope(scope_id="scope-001"):
    scope = ScopeMonitoring(
        id=scope_id,
        name="Scope A",
        knowledge=KnowledgeBase(id="KB-00000001"),
        officials=Officials(main="Main", backup="Backup"),
        billing_code="FACT-2026-PAI",
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


def set_schedule(repo, audit=None, scope_id="scope-001", schedule=None, calendar=MONDAY_TO_FRIDAY):
    UpdateScopeScheduleUseCase(repo, audit).execute(
        UpdateScopeScheduleCommand(
            scope_id=scope_id,
            schedule=schedule or MonitoringSchedule(weekdays=(MONDAY, FRIDAY)),
        ),
        calendar=calendar,
    )


def test_the_schedule_is_written_through_a_targeted_write():
    """§28.1 : jamais un ``save()``, qui réécrirait les journées relues avant une
    édition concurrente."""
    repo = RecordingScopeMonitoringRepository(InMemoryScopeMonitoringRepository())
    repo.save(make_scope())
    repo.reset()

    set_schedule(repo)

    assert repo.writes == [
        (
            "update_schedule",
            "scope-001",
            MonitoringSchedule(weekdays=(MONDAY, FRIDAY)),
        )
    ]


def test_the_edit_leaves_the_daily_activities_intact():
    repo = InMemoryScopeMonitoringRepository()
    repo.save(make_scope())

    set_schedule(repo)

    scope = repo.find_by_id("scope-001")
    assert scope.daily_activity_for(date(2026, 9, 18)).errors_reported == 7
    assert scope.daily_activity_for(date(2026, 9, 19)).feai == ["INC000000019"]


def test_the_edit_keeps_the_note_the_officials_and_the_billing_code():
    repo = InMemoryScopeMonitoringRepository()
    scope = make_scope()
    scope.set_note("à conserver")
    repo.save(scope)

    set_schedule(repo)

    stored = repo.find_by_id("scope-001")
    assert stored.note == "à conserver"
    assert stored.officials.main == "Main"
    assert stored.billing_code == "FACT-2026-PAI"


def test_an_unknown_scope_is_not_found():
    audit = InMemoryAuditTrailRepository()

    with pytest.raises(ScopeMonitoringNotFoundError):
        set_schedule(InMemoryScopeMonitoringRepository(), audit, scope_id="inconnu")

    assert audit.events == []


def test_the_edit_records_an_audit_event():
    repo = InMemoryScopeMonitoringRepository()
    audit = InMemoryAuditTrailRepository()
    repo.save(make_scope())
    set_current_actor("ABCD")

    set_schedule(repo, audit)

    assert len(audit.events) == 1
    event = audit.events[0]
    assert event.action == "scope_schedule_updated"
    assert event.actor == "ABCD"
    assert event.scope_id == "scope-001"
    assert event.day is None
    assert event.changes == {
        "schedule_weekdays": {"old": [], "new": [MONDAY, FRIDAY]},
    }


def test_the_audit_event_carries_only_the_changed_field():
    repo = InMemoryScopeMonitoringRepository()
    audit = InMemoryAuditTrailRepository()
    scope = make_scope()
    scope.set_schedule(MonitoringSchedule(weekdays=(MONDAY,)))
    repo.save(scope)

    set_schedule(
        repo,
        audit,
        schedule=MonitoringSchedule(weekdays=(MONDAY,), interval_weeks=2),
    )

    assert audit.events[0].changes == {
        "schedule_interval_weeks": {"old": 1, "new": 2},
    }


def test_the_audit_event_carries_the_anchor_when_it_moves():
    repo = InMemoryScopeMonitoringRepository()
    audit = InMemoryAuditTrailRepository()
    scope = make_scope()
    scope.set_schedule(MonitoringSchedule(weekdays=(MONDAY,), interval_weeks=2))
    repo.save(scope)

    set_schedule(
        repo,
        audit,
        schedule=MonitoringSchedule(
            weekdays=(MONDAY,), interval_weeks=2, anchor_date=ANCHOR
        ),
    )

    assert audit.events[0].changes == {
        "schedule_anchor_date": {"old": None, "new": "2026-01-05"},
    }


def test_the_edit_records_nothing_when_the_schedule_is_unchanged():
    repo = InMemoryScopeMonitoringRepository()
    audit = InMemoryAuditTrailRepository()
    scope = make_scope()
    scope.set_schedule(MonitoringSchedule(weekdays=(MONDAY, FRIDAY)))
    repo.save(scope)

    set_schedule(repo, audit)

    assert audit.events == []


def test_a_schedule_that_can_never_be_due_is_refused():
    """Un périmètre dû un samedi dans un projet lundi–vendredi disparaîtrait
    silencieusement du backlog et du dénominateur de couverture."""
    repo = InMemoryScopeMonitoringRepository()
    audit = InMemoryAuditTrailRepository()
    repo.save(make_scope())

    with pytest.raises(ScheduleNeverDueError):
        set_schedule(
            repo, audit, schedule=MonitoringSchedule(weekdays=(SATURDAY,))
        )

    assert audit.events == []


def test_a_refused_schedule_leaves_the_aggregate_untouched():
    """L'adaptateur in-memory renvoie l'objet qu'il stocke : muter avant de
    refuser corromprait la base, et le refus serait invisible."""
    repo = InMemoryScopeMonitoringRepository()
    repo.save(make_scope())

    with pytest.raises(ScheduleNeverDueError):
        set_schedule(repo, schedule=MonitoringSchedule(weekdays=(SATURDAY,)))

    assert repo.find_by_id("scope-001").schedule == MonitoringSchedule()


def test_without_a_calendar_the_check_is_skipped():
    """Mode dégradé sans authentification (dev/tests) : aucun projet, donc aucun
    calendrier à confronter, donc aucune raison de refuser."""
    repo = InMemoryScopeMonitoringRepository()
    repo.save(make_scope())

    set_schedule(repo, calendar=None, schedule=MonitoringSchedule(weekdays=(SATURDAY,)))

    assert repo.find_by_id("scope-001").schedule == MonitoringSchedule(
        weekdays=(SATURDAY,)
    )


def test_an_empty_schedule_is_accepted():
    repo = InMemoryScopeMonitoringRepository()
    repo.save(make_scope())

    set_schedule(repo, schedule=MonitoringSchedule())

    assert repo.find_by_id("scope-001").schedule == MonitoringSchedule()
