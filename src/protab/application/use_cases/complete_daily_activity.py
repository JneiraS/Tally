from protab.application.actor_context import current_actor
from protab.application.commands.daily_activity import (
    CompleteDailyActivityCommand,
)
from protab.domain.entities.audit_event import AuditEvent, build_changes
from protab.domain.entities.daily_activity import DailyActivity
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

        # Resolve every day before mutating any of them, so a missing day
        # cannot leave the earlier ones completed: the command is all-or-none.
        activities: list[DailyActivity] = []
        completed_days: list = []
        for day in command.days:
            activity = scope.daily_activity_for(day)
            if activity is None:
                raise DailyActivityNotFoundError(
                    f"No DailyActivity for day {day!r} on scope {command.scope_id!r}."
                )
            before = {"handled": activity.handled, "completed": activity.completed}
            activities.append(activity)
            completed_days.append((day, before))

        for activity in activities:
            activity.mark_completed()

        self.repository.mark_activities_completed(command.scope_id, list(command.days))

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