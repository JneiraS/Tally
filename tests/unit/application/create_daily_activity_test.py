from datetime import date

import pytest

from protab.adapters.outbound.persistence.in_memory_scope_monitoring_repository import (
    InMemoryScopeMonitoringRepository,
)
from protab.application.commands.daily_activity import CreateDailyActivityCommand
from protab.application.use_cases.create_daily_activity import (
    CreateDailyActivityUseCase,
)
from protab.domain.entities.scope_monitoring import (
    KnowledgeBase,
    Officials,
    ScopeMonitoring,
)
from protab.domain.exceptions import (
    DuplicateDailyActivityError,
    IncidentsExceedErrorsError,
    ScopeMonitoringNotFoundError,
)


def make_scope(scope_id="scope-001"):
    return ScopeMonitoring(
        id=scope_id,
        name="Scope A",
        knowledge=KnowledgeBase(id="KB-00000001"),
        officials=Officials(main="Main", backup="Backup"),
    )


def make_command(
    scope_id="scope-001",
    day=date(2026, 9, 19),
    errors_reported=2,
    incidents_created=1,
    feai=("INC000000001",),
):
    return CreateDailyActivityCommand(
        scope_id=scope_id,
        day=day,
        errors_reported=errors_reported,
        incidents_created=incidents_created,
        feai=list(feai),
    )


def test_create_daily_activity():
    repo = InMemoryScopeMonitoringRepository()
    repo.save(make_scope())

    CreateDailyActivityUseCase(repo).execute(make_command())

    saved = repo.find_by_id("scope-001")
    activity = saved.daily_activity_for(date(2026, 9, 19))
    assert activity is not None
    assert activity.errors_reported == 2
    assert activity.incidents_created == 1
    assert activity.feai == ["INC000000001"]
    assert activity.handled is False
    assert activity.completed is False


def test_create_scope_not_found_raises():
    repo = InMemoryScopeMonitoringRepository()
    with pytest.raises(ScopeMonitoringNotFoundError):
        CreateDailyActivityUseCase(repo).execute(make_command(scope_id="unknown"))


def test_create_duplicate_day_raises_and_persists_nothing():
    repo = InMemoryScopeMonitoringRepository()
    scope = make_scope()
    scope.add_daily_activity(
        make_scope_daily_activity()
    )
    repo.save(scope)

    with pytest.raises(DuplicateDailyActivityError):
        CreateDailyActivityUseCase(repo).execute(
            make_command(errors_reported=5, incidents_created=4)
        )

    saved = repo.find_by_id("scope-001")
    activity = saved.daily_activity_for(date(2026, 9, 19))
    assert activity.errors_reported == 2
    assert activity.incidents_created == 1


def test_create_invalid_invariant_raises():
    repo = InMemoryScopeMonitoringRepository()
    repo.save(make_scope())

    with pytest.raises(IncidentsExceedErrorsError):
        CreateDailyActivityUseCase(repo).execute(
            make_command(errors_reported=1, incidents_created=2)
        )


def make_scope_daily_activity():
    from protab.domain.entities.daily_activity import DailyActivity

    return DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=2,
        incidents_created=1,
        feai=["INC000000001"],
    )