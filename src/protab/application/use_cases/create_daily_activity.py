from protab.application.commands.daily_activity import CreateDailyActivityCommand
from protab.domain.entities.daily_activity import DailyActivity
from protab.domain.exceptions import ScopeMonitoringNotFoundError
from protab.ports.outbound.scope_monitoring_repository import ScopeMonitoringRepository


class CreateDailyActivityUseCase:
    def __init__(self, repository: ScopeMonitoringRepository):
        self.repository = repository

    def execute(self, command: CreateDailyActivityCommand) -> None:
        scope = self.repository.find_by_id(command.scope_id)
        if scope is None:
            raise ScopeMonitoringNotFoundError(
                f"ScopeMonitoring {command.scope_id!r} not found."
            )

        scope.add_daily_activity(
            DailyActivity(
                day=command.day,
                errors_reported=command.errors_reported,
                incidents_created=command.incidents_created,
                feai=command.feai,
            )
        )

        self.repository.save(scope)