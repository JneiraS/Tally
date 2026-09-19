from protab.application.commands.daily_activity import UpdateDailyActivityCommand
from protab.domain.exceptions import (
    DailyActivityNotFoundError,
    ScopeMonitoringNotFoundError,
)
from protab.ports.outbound.scope_monitoring_repository import ScopeMonitoringRepository


class UpdateDailyActivityUseCase:
    def __init__(self, repository: ScopeMonitoringRepository):
        self.repository = repository

    def execute(self, command: UpdateDailyActivityCommand) -> None:
        scope = self.repository.find_by_id(command.scope_id)
        if scope is None:
            raise ScopeMonitoringNotFoundError(
                f"ScopeMonitoring {command.scope_id!r} not found."
            )

        activity = scope.daily_activity_for(command.day)
        if activity is None:
            raise DailyActivityNotFoundError(
                f"No DailyActivity for day {command.day!r} on scope {command.scope_id!r}."
            )

        activity.update(
            errors_reported=command.errors_reported,
            incidents_created=command.incidents_created,
            feai=command.feai,
        )

        self.repository.save(scope)