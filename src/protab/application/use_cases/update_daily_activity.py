from protab.application.actor_context import current_actor
from protab.application.commands.daily_activity import UpdateDailyActivityCommand
from protab.domain.entities.audit_event import AuditEvent, build_changes
from protab.domain.exceptions import (
    DailyActivityNotFoundError,
    ScopeMonitoringNotFoundError,
)
from protab.ports.outbound.audit_trail_repository import AuditTrailRepository
from protab.ports.outbound.scope_monitoring_repository import ScopeMonitoringRepository


class UpdateDailyActivityUseCase:
    def __init__(
        self,
        repository: ScopeMonitoringRepository,
        audit_trail: AuditTrailRepository | None = None,
    ):
        self.repository = repository
        self.audit_trail = audit_trail

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

        before = {
            "errors_reported": activity.errors_reported,
            "incidents_created": activity.incidents_created,
            "feai": list(activity.feai),
        }

        activity.update(
            errors_reported=command.errors_reported,
            incidents_created=command.incidents_created,
            feai=command.feai,
        )

        self.repository.save(scope)

        if self.audit_trail is not None:
            after = {
                "errors_reported": activity.errors_reported,
                "incidents_created": activity.incidents_created,
                "feai": list(activity.feai),
            }
            changes = build_changes(before, after)
            if changes:
                self.audit_trail.record(
                    AuditEvent(
                        action="activity_updated",
                        actor=current_actor(),
                        scope_id=command.scope_id,
                        day=command.day,
                        changes=changes,
                    )
                )