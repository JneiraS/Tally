from datetime import date

import pytest

from protab.adapters.outbound.persistence.in_memory_scope_monitoring_repository import (
    InMemoryScopeMonitoringRepository,
)
from protab.application.queries.get_daily_activity import GetDailyActivityUseCase
from protab.application.queries.get_scope import GetScopeUseCase
from protab.application.queries.list_scopes import ListScopesUseCase
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


def make_scope(scope_id="scope-001", name="Scope A"):
    return ScopeMonitoring(
        id=scope_id,
        name=name,
        knowledge=KnowledgeBase(id="KB-00000001"),
        officials=Officials(main="Main", backup="Backup"),
    )


def test_list_scopes():
    repo = InMemoryScopeMonitoringRepository()
    repo.save(make_scope(scope_id="scope-001", name="Scope A"))
    repo.save(make_scope(scope_id="scope-002", name="Scope B"))

    scopes = ListScopesUseCase(repo).execute()

    assert [s.id for s in scopes] == ["scope-001", "scope-002"]


def test_list_scopes_empty_repo():
    repo = InMemoryScopeMonitoringRepository()

    assert ListScopesUseCase(repo).execute() == []


def test_get_scope_found():
    repo = InMemoryScopeMonitoringRepository()
    repo.save(make_scope())

    scope = GetScopeUseCase(repo).execute("scope-001")

    assert scope.name == "Scope A"


def test_get_scope_not_found_raises():
    repo = InMemoryScopeMonitoringRepository()
    with pytest.raises(ScopeMonitoringNotFoundError):
        GetScopeUseCase(repo).execute("unknown")


def test_get_daily_activity_found():
    repo = InMemoryScopeMonitoringRepository()
    scope = make_scope()
    scope.add_daily_activity(
        DailyActivity(
            day=date(2026, 9, 19),
            errors_reported=2,
            incidents_created=1,
            feai=["INC0000001"],
        )
    )
    repo.save(scope)

    activity = GetDailyActivityUseCase(repo).execute(
        "scope-001", date(2026, 9, 19)
    )

    assert activity.errors_reported == 2


def test_get_daily_activity_scope_not_found_raises():
    repo = InMemoryScopeMonitoringRepository()
    with pytest.raises(ScopeMonitoringNotFoundError):
        GetDailyActivityUseCase(repo).execute("unknown", date(2026, 9, 19))


def test_get_daily_activity_day_not_found_raises():
    repo = InMemoryScopeMonitoringRepository()
    repo.save(make_scope())

    with pytest.raises(DailyActivityNotFoundError):
        GetDailyActivityUseCase(repo).execute(
            "scope-001", date(2026, 9, 19)
        )