from datetime import date

import pytest

from protab.adapters.outbound.persistence.in_memory_scope_monitoring_repository import (
    InMemoryScopeMonitoringRepository,
)
from protab.application.commands.daily_activity import UpdateDailyActivityCommand
from protab.application.use_cases.update_daily_activity import (
    UpdateDailyActivityUseCase,
)
from protab.domain.entities.daily_activity import DailyActivity
from protab.domain.entities.scope_monitoring import (
    KnowledgeBase,
    Officials,
    ScopeMonitoring,
)
from protab.domain.exceptions import (
    DailyActivityNotFoundError,
    IncidentsExceedErrorsError,
    ScopeMonitoringNotFoundError,
)
from tests.unit.application.recording_repository import (
    RecordingScopeMonitoringRepository,
)


def make_scope_with_activity(scope_id="scope-001", day=date(2026, 9, 19)):
    scope = ScopeMonitoring(
        id=scope_id,
        name="Scope A",
        knowledge=KnowledgeBase(id="KB-00000001"),
        officials=Officials(main="Main", backup="Backup"),
    )
    scope.add_daily_activity(
        DailyActivity(
            day=day,
            errors_reported=2,
            incidents_created=1,
            feai=["INC000000001"],
        )
    )
    return scope


def test_update_daily_activity():
    repo = InMemoryScopeMonitoringRepository()
    repo.save(make_scope_with_activity())

    UpdateDailyActivityUseCase(repo).execute(
        UpdateDailyActivityCommand(
            scope_id="scope-001",
            day=date(2026, 9, 19),
            errors_reported=5,
            incidents_created=3,
            feai=["INC000000001", "INC000000002"],
        )
    )

    saved = repo.find_by_id("scope-001")
    activity = saved.daily_activity_for(date(2026, 9, 19))
    assert activity.errors_reported == 5
    assert activity.incidents_created == 3
    assert activity.feai == ["INC000000001", "INC000000002"]


def test_update_writes_only_the_targeted_day():
    """A PATCH must not rewrite the whole scope.

    Rewriting the aggregate persists every day read earlier, so a concurrent
    edit to another day of the same scope is silently overwritten. Only the
    targeted day may be written.
    """
    repo = RecordingScopeMonitoringRepository(InMemoryScopeMonitoringRepository())
    repo.save(make_scope_with_activity())
    repo.reset()

    UpdateDailyActivityUseCase(repo).execute(
        UpdateDailyActivityCommand(
            scope_id="scope-001",
            day=date(2026, 9, 19),
            errors_reported=5,
            incidents_created=3,
            feai=["INC000000001"],
        )
    )

    assert repo.writes == [("update_daily_activity", "scope-001", date(2026, 9, 19))]


def test_update_scope_not_found():
    repo = InMemoryScopeMonitoringRepository()
    with pytest.raises(ScopeMonitoringNotFoundError):
        UpdateDailyActivityUseCase(repo).execute(
            UpdateDailyActivityCommand(
                scope_id="unknown",
                day=date(2026, 9, 19),
                errors_reported=1,
                incidents_created=0,
                feai=["INC000000001"],
            )
        )


def test_update_day_without_activity_raises():
    repo = InMemoryScopeMonitoringRepository()
    repo.save(make_scope_with_activity())

    with pytest.raises(DailyActivityNotFoundError):
        UpdateDailyActivityUseCase(repo).execute(
            UpdateDailyActivityCommand(
                scope_id="scope-001",
                day=date(2026, 9, 20),
                errors_reported=1,
                incidents_created=0,
                feai=["INC000000001"],
            )
        )


def test_update_invalid_invariant_raises_and_does_not_modify():
    repo = InMemoryScopeMonitoringRepository()
    repo.save(make_scope_with_activity())

    with pytest.raises(IncidentsExceedErrorsError):
        UpdateDailyActivityUseCase(repo).execute(
            UpdateDailyActivityCommand(
                scope_id="scope-001",
                day=date(2026, 9, 19),
                errors_reported=1,
                incidents_created=2,
                feai=["INC000000001"],
            )
        )

    saved = repo.find_by_id("scope-001")
    activity = saved.daily_activity_for(date(2026, 9, 19))
    assert activity.errors_reported == 2
    assert activity.incidents_created == 1