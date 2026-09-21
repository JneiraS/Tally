from protab.application.actor_context import current_actor
from protab.application.commands.daily_activity import (
    CompleteDailyActivityCommand,
)
from protab.domain.entities.audit_event import AuditEvent, build_changes
from protab.domain.exceptions import (
    DailyActivityNotFoundError,
    ScopeMonitoringNotFoundError,
)
from protab.ports.outbound.audit_trail_repository import AuditTrailRepository
from protab.ports.outbound.scope_monitoring_repository import ScopeMonitoringRepository


class CompleteDailyActivityUseCase:
    def __init__(
        self,
        repository: ScopeMonitoringRepository,
        audit_trail: AuditTrailRepository | None = None,
    ):
        self.repository = repository
        self.audit_trail = audit_trail

    def execute(self, command: CompleteDailyActivityCommand) -> None:
        scope = self.repository.find_by_id(command.scope_id)
        if scope is None:
            raise ScopeMonitoringNotFoundError(
                f"ScopeMonitoring {command.scope_id!r} not found."
            )

        completed_days: list = []
        for day in command.days:
            activity = scope.daily_activity_for(day)
            if activity is None:
                raise DailyActivityNotFoundError(
                    f"No DailyActivity for day {day!r} on scope {command.scope_id!r}."
                )
            before = {"handled": activity.handled, "completed": activity.completed}
            activity.mark_completed()
            completed_days.append((day, before))

        self.repository.save(scope)

        if self.audit_trail is not None:
            for day, before in completed_days:
                self.audit_trail.record(
                    AuditEvent(
                        action="activity_completed",
                        actor=current_actor(),
                        scope_id=command.scope_id,
                        day=day,
                        changes=build_changes(
                            before,
                            {"handled": True, "completed": True},
                        ),
                    )
                )