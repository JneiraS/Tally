from datetime import date

from protab.domain.entities.daily_activity import DailyActivity
from protab.domain.exceptions import (
    DailyActivityNotFoundError,
    ScopeMonitoringNotFoundError,
)
from protab.ports.outbound.scope_monitoring_repository import ScopeMonitoringRepository


class GetDailyActivityUseCase:
    def __init__(self, repository: ScopeMonitoringRepository):
        self.repository = repository

    def execute(self, scope_id: str, day: date) -> DailyActivity:
        scope = self.repository.find_by_id(scope_id)
        if scope is None:
            raise ScopeMonitoringNotFoundError(
                f"ScopeMonitoring {scope_id!r} not found."
            )

        activity = scope.daily_activity_for(day)
        if activity is None:
            raise DailyActivityNotFoundError(
                f"No DailyActivity for day {day!r} on scope {scope_id!r}."
            )
        return activity