from protab.application.actor_context import current_actor
from protab.application.commands.daily_activity import CreateDailyActivityCommand
from protab.domain.entities.audit_event import AuditEvent, build_changes
from protab.domain.entities.daily_activity import DailyActivity
from protab.domain.exceptions import ScopeMonitoringNotFoundError
from protab.ports.outbound.audit_trail_repository import AuditTrailRepository
from protab.ports.outbound.scope_monitoring_repository import ScopeMonitoringRepository


class CreateDailyActivityUseCase:
    def __init__(
        self,
        repository: ScopeMonitoringRepository,
        audit_trail: AuditTrailRepository | None = None,
    ):
        self.repository = repository
        self.audit_trail = audit_trail

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

        if self.audit_trail is not None:
            self.audit_trail.record(
                AuditEvent(
                    action="activity_created",
                    actor=current_actor(),
                    scope_id=command.scope_id,
                    day=command.day,
                    changes=build_changes(
                        {},
                        {
                            "errors_reported": command.errors_reported,
                            "incidents_created": command.incidents_created,
                            "feai": command.feai,
                        },
                    ),
                )
            )