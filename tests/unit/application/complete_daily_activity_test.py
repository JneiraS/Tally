from datetime import date

import pytest

from protab.adapters.outbound.persistence.in_memory_scope_monitoring_repository import (
    InMemoryScopeMonitoringRepository,
)
from protab.application.commands.daily_activity import CompleteDailyActivityCommand
from protab.application.use_cases.complete_daily_activity import (
    CompleteDailyActivityUseCase,
)
from protab.domain.entities.daily_activity import DailyActivity
from protab.domain.entities.scope_monitoring import (
    KnowledgeBase,
    Officials,
    ScopeMonitoring,
)
from protab.domain.exceptions import (
    DailyActivityNotFoundError,
    ScopeMonitoringNotFoundError,
)


def make_scope(scope_id="scope-001"):
    return ScopeMonitoring(
        id=scope_id,
        name="Scope A",
        knowledge=KnowledgeBase(id="KB-00000001"),
        officials=Officials(main="Main", backup="Backup"),
    )


def test_complete_single_day():
    repo = InMemoryScopeMonitoringRepository()
    scope = make_scope()
    activity = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=2,
        incidents_created=1,
        feai=["INC000000001"],
    )
    scope.add_daily_activity(activity)
    repo.save(scope)

    CompleteDailyActivityUseCase(repo).execute(
        CompleteDailyActivityCommand(
            scope_id="scope-001", days=[date(2026, 9, 19)]
        )
    )

    saved = repo.find_by_id("scope-001")
    assert saved.daily_activity_for(date(2026, 9, 19)).completed is True
    assert saved.daily_activity_for(date(2026, 9, 19)).handled is True


def test_complete_multiple_days():
    repo = InMemoryScopeMonitoringRepository()
    scope = make_scope()
    for day in (date(2026, 9, 19), date(2026, 9, 20)):
        scope.add_daily_activity(
            DailyActivity(
                day=day,
                errors_reported=1,
                incidents_created=0,
                feai=["INC000000001"],
            )
        )
    repo.save(scope)

    CompleteDailyActivityUseCase(repo).execute(
        CompleteDailyActivityCommand(
            scope_id="scope-001",
            days=[date(2026, 9, 19), date(2026, 9, 20)],
        )
    )

    saved = repo.find_by_id("scope-001")
    assert saved.daily_activity_for(date(2026, 9, 19)).completed is True
    assert saved.daily_activity_for(date(2026, 9, 20)).completed is True


def test_complete_scope_not_found():
    repo = InMemoryScopeMonitoringRepository()
    with pytest.raises(ScopeMonitoringNotFoundError):
        CompleteDailyActivityUseCase(repo).execute(
            CompleteDailyActivityCommand(
                scope_id="unknown", days=[date(2026, 9, 19)]
            )
        )


def test_complete_day_without_activity_raises():
    repo = InMemoryScopeMonitoringRepository()
    scope = make_scope()
    scope.add_daily_activity(
        DailyActivity(
            day=date(2026, 9, 19),
            errors_reported=1,
            incidents_created=0,
            feai=["INC000000001"],
        )
    )
    repo.save(scope)

    with pytest.raises(DailyActivityNotFoundError):
        CompleteDailyActivityUseCase(repo).execute(
            CompleteDailyActivityCommand(
                scope_id="scope-001", days=[date(2026, 9, 21)]
            )
        )

    # Atomicity: the existing activity must not be completed
    saved = repo.find_by_id("scope-001")
    assert saved.daily_activity_for(date(2026, 9, 19)).completed is False