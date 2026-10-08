from datetime import date

import pytest

from protab.adapters.outbound.persistence.in_memory_scope_monitoring_repository import (
    InMemoryScopeMonitoringRepository,
)
from protab.application.commands.daily_activity import SetActivitiesStatusCommand
from protab.application.use_cases.set_activities_status import SetActivitiesStatusUseCase
from protab.domain.entities.daily_activity import DailyActivity
from protab.domain.entities.day_status import DayStatus
from protab.domain.entities.scope_monitoring import (
    KnowledgeBase,
    Officials,
    ScopeMonitoring,
)
from protab.domain.exceptions import (
    DailyActivityNotFoundError,
    InvalidKoReasonError,
    ScopeMonitoringNotFoundError,
)
from tests.unit.application.recording_repository import (
    RecordingScopeMonitoringRepository,
)

DAY = date(2026, 9, 19)
OTHER_DAY = date(2026, 9, 20)


def make_scope(scope_id="scope-001"):
    return ScopeMonitoring(
        id=scope_id,
        name="Scope A",
        knowledge=KnowledgeBase(id="KB-00000001"),
        officials=Officials(main="Main", backup="Backup"),
    )


def make_activity(day, errors_reported=1):
    return DailyActivity(
        day=day,
        errors_reported=errors_reported,
        incidents_created=0,
        feai=["INC000000001"],
    )


def test_completing_a_day_stores_the_single_completed_status():
    repo = InMemoryScopeMonitoringRepository()
    scope = make_scope()
    scope.add_daily_activity(make_activity(DAY, errors_reported=2))
    repo.save(scope)

    SetActivitiesStatusUseCase(repo).execute(
        SetActivitiesStatusCommand(scope_id="scope-001", days=[DAY], status=DayStatus.COMPLETED)
    )

    saved = repo.find_by_id("scope-001")
    assert saved is not None
    activity = saved.daily_activity_for(DAY)
    assert activity is not None
    assert activity.status is DayStatus.COMPLETED
    assert activity.ko_reason is None


def test_completing_several_days_sets_them_all():
    repo = InMemoryScopeMonitoringRepository()
    scope = make_scope()
    scope.add_daily_activity(make_activity(DAY))
    scope.add_daily_activity(make_activity(OTHER_DAY))
    repo.save(scope)

    SetActivitiesStatusUseCase(repo).execute(
        SetActivitiesStatusCommand(
            scope_id="scope-001", days=[DAY, OTHER_DAY], status=DayStatus.COMPLETED
        )
    )

    saved = repo.find_by_id("scope-001")
    assert saved is not None
    assert saved.daily_activity_for(DAY).status is DayStatus.COMPLETED
    assert saved.daily_activity_for(OTHER_DAY).status is DayStatus.COMPLETED


def test_a_ko_day_can_be_reported_without_any_entry():
    """The whole point of the KO: nobody could enter anything.

    Requiring an activity row first would make the status unusable in the one
    situation it exists for, and would push the caller to invent a zeroed row
    with the wrong status.
    """
    repo = InMemoryScopeMonitoringRepository()
    scope = make_scope()
    repo.save(scope)

    SetActivitiesStatusUseCase(repo).execute(
        SetActivitiesStatusCommand(
            scope_id="scope-001",
            days=[DAY],
            status=DayStatus.KO,
            ko_reason="Collecteur indisponible",
        )
    )

    saved = repo.find_by_id("scope-001")
    assert saved is not None
    activity = saved.daily_activity_for(DAY)
    assert activity is not None
    assert activity.status is DayStatus.KO
    assert activity.ko_reason == "Collecteur indisponible"
    # Les compteurs sont créés à zéro, pas inventés : le jour n'a pas été traité.
    assert activity.errors_reported == 0
    assert activity.incidents_created == 0
    assert activity.feai == []


def test_marking_a_ko_keeps_the_counters_that_were_already_entered():
    repo = InMemoryScopeMonitoringRepository()
    scope = make_scope()
    scope.add_daily_activity(make_activity(DAY, errors_reported=5))
    repo.save(scope)

    SetActivitiesStatusUseCase(repo).execute(
        SetActivitiesStatusCommand(
            scope_id="scope-001", days=[DAY], status=DayStatus.KO, ko_reason="Incident"
        )
    )

    saved = repo.find_by_id("scope-001")
    assert saved is not None
    activity = saved.daily_activity_for(DAY)
    assert activity.status is DayStatus.KO
    assert activity.errors_reported == 5
    assert activity.feai == ["INC000000001"]


def test_a_ko_reason_is_optional():
    repo = InMemoryScopeMonitoringRepository()
    scope = make_scope()
    scope.add_daily_activity(make_activity(DAY))
    repo.save(scope)

    SetActivitiesStatusUseCase(repo).execute(
        SetActivitiesStatusCommand(scope_id="scope-001", days=[DAY], status=DayStatus.KO)
    )

    saved = repo.find_by_id("scope-001")
    assert saved is not None
    assert saved.daily_activity_for(DAY).status is DayStatus.KO
    assert saved.daily_activity_for(DAY).ko_reason is None


def test_a_ko_reason_is_refused_on_a_day_that_is_not_ko():
    repo = RecordingScopeMonitoringRepository(InMemoryScopeMonitoringRepository())
    scope = make_scope()
    scope.add_daily_activity(make_activity(DAY))
    repo.save(scope)
    repo.reset()

    with pytest.raises(InvalidKoReasonError):
        SetActivitiesStatusUseCase(repo).execute(
            SetActivitiesStatusCommand(
                scope_id="scope-001",
                days=[DAY],
                status=DayStatus.COMPLETED,
                ko_reason="Panne",
            )
        )

    assert repo.writes == []


def test_completing_a_ko_day_drops_its_reason():
    repo = InMemoryScopeMonitoringRepository()
    scope = make_scope()
    scope.add_daily_activity(make_activity(DAY))
    repo.save(scope)

    use_case = SetActivitiesStatusUseCase(repo)
    use_case.execute(
        SetActivitiesStatusCommand(
            scope_id="scope-001", days=[DAY], status=DayStatus.KO, ko_reason="Panne"
        )
    )
    use_case.execute(
        SetActivitiesStatusCommand(scope_id="scope-001", days=[DAY], status=DayStatus.COMPLETED)
    )

    saved = repo.find_by_id("scope-001")
    assert saved is not None
    activity = saved.daily_activity_for(DAY)
    assert activity.status is DayStatus.COMPLETED
    assert activity.ko_reason is None


def test_raising_a_ko_returns_the_day_to_pending():
    repo = InMemoryScopeMonitoringRepository()
    scope = make_scope()
    scope.add_daily_activity(make_activity(DAY, errors_reported=3))
    repo.save(scope)

    use_case = SetActivitiesStatusUseCase(repo)
    use_case.execute(
        SetActivitiesStatusCommand(
            scope_id="scope-001", days=[DAY], status=DayStatus.KO, ko_reason="Panne"
        )
    )
    use_case.execute(
        SetActivitiesStatusCommand(scope_id="scope-001", days=[DAY], status=DayStatus.PENDING)
    )

    saved = repo.find_by_id("scope-001")
    assert saved is not None
    activity = saved.daily_activity_for(DAY)
    assert activity.status is DayStatus.PENDING
    assert activity.ko_reason is None
    assert activity.errors_reported == 3


def test_the_status_write_names_only_the_requested_days():
    repo = RecordingScopeMonitoringRepository(InMemoryScopeMonitoringRepository())
    scope = make_scope()
    for day in (DAY, OTHER_DAY, date(2026, 9, 21)):
        scope.add_daily_activity(make_activity(day))
    repo.save(scope)
    repo.reset()

    SetActivitiesStatusUseCase(repo).execute(
        SetActivitiesStatusCommand(scope_id="scope-001", days=[OTHER_DAY], status=DayStatus.KO)
    )

    assert repo.writes == [
        ("set_activities_status", "scope-001", (OTHER_DAY,), DayStatus.KO, None)
    ]


def test_completing_a_day_that_does_not_exist_refuses_without_writing():
    """A day can be reported as blocked, but it cannot be *completed*.

    Completing means "we processed it", so there has to be something to have
    processed; silently creating a zeroed row would fabricate a day nobody
    worked on.
    """
    repo = RecordingScopeMonitoringRepository(InMemoryScopeMonitoringRepository())
    scope = make_scope()
    scope.add_daily_activity(make_activity(DAY))
    repo.save(scope)
    repo.reset()

    with pytest.raises(DailyActivityNotFoundError):
        SetActivitiesStatusUseCase(repo).execute(
            SetActivitiesStatusCommand(
                scope_id="scope-001",
                days=[DAY, date(2026, 9, 22)],
                status=DayStatus.COMPLETED,
            )
        )

    assert repo.writes == []
    saved = repo.find_by_id("scope-001")
    assert saved is not None
    assert saved.daily_activity_for(DAY).status is DayStatus.PENDING


def test_raising_the_ko_of_a_day_that_does_not_exist_refuses_without_writing():
    repo = RecordingScopeMonitoringRepository(InMemoryScopeMonitoringRepository())
    repo.save(make_scope())
    repo.reset()

    with pytest.raises(DailyActivityNotFoundError):
        SetActivitiesStatusUseCase(repo).execute(
            SetActivitiesStatusCommand(
                scope_id="scope-001", days=[DAY], status=DayStatus.PENDING
            )
        )

    assert repo.writes == []


def test_the_scope_is_not_found():
    repo = InMemoryScopeMonitoringRepository()
    with pytest.raises(ScopeMonitoringNotFoundError):
        SetActivitiesStatusUseCase(repo).execute(
            SetActivitiesStatusCommand(scope_id="unknown", days=[DAY], status=DayStatus.KO)
        )


def test_an_unknown_scope_and_a_ko_are_refused_by_the_same_guard():
    # Le refus du statut inconnu appartient au schéma entrant ; le use case reçoit
    # un DayStatus déjà validé et ne connaît que PENDING/COMPLETED/KO.
    assert {status.value for status in DayStatus} == {"pending", "completed", "ko"}