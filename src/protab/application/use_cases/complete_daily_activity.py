from protab.application.commands.daily_activity import (
    CompleteDailyActivityCommand,
)
from protab.domain.exceptions import (
    DailyActivityNotFoundError,
    ScopeMonitoringNotFoundError,
)
from protab.ports.outbound.scope_monitoring_repository import ScopeMonitoringRepository


class CompleteDailyActivityUseCase:
    def __init__(self, repository: ScopeMonitoringRepository):
        self.repository = repository

    def execute(self, command: CompleteDailyActivityCommand) -> None:
        scope = self.repository.find_by_id(command.scope_id)
        if scope is None:
            raise ScopeMonitoringNotFoundError(
                f"ScopeMonitoring {command.scope_id!r} not found."
            )

        for day in command.days:
            activity = scope.daily_activity_for(day)
            if activity is None:
                raise DailyActivityNotFoundError(
                    f"No DailyActivity for day {day!r} on scope {command.scope_id!r}."
                )
            activity.mark_completed()

        self.repository.save(scope)