from protab.application.actor_context import current_actor
from protab.application.commands.daily_activity import SetActivitiesStatusCommand
from protab.domain.entities.audit_event import AuditEvent, build_changes
from protab.domain.entities.daily_activity import DailyActivity
from protab.domain.entities.day_status import DayStatus
from protab.domain.exceptions import (
    DailyActivityNotFoundError,
    ScopeMonitoringNotFoundError,
)
from protab.ports.outbound.audit_trail_repository import AuditTrailRepository
from protab.ports.outbound.scope_monitoring_repository import ScopeMonitoringRepository


class SetActivitiesStatusUseCase:
    """Set the status of one or more days of a scope.

    One rule lives here rather than in the repository, and it is what lets the
    status write be an upsert: **a day can be reported as blocked, but it cannot
    be completed.** Completing says "we processed it", so there has to be
    something to have processed; reporting a KO is exactly what somebody does
    when they could not enter anything, so that creates the day at zero counters.
    """

    def __init__(
        self,
        repository: ScopeMonitoringRepository,
        audit_trail: AuditTrailRepository | None = None,
    ):
        self.repository = repository
        self.audit_trail = audit_trail

    def execute(self, command: SetActivitiesStatusCommand) -> None:
        scope = self.repository.find_by_id(command.scope_id)
        if scope is None:
            raise ScopeMonitoringNotFoundError(
                f"ScopeMonitoring {command.scope_id!r} not found."
            )

        days = list(dict.fromkeys(command.days))
        if not days:
            raise DailyActivityNotFoundError(f"No day given for scope {command.scope_id!r}.")

        # Resolve every day before mutating any of them, so a missing day cannot
        # leave the earlier ones written: the command is all-or-none.
        resolved: list[DailyActivity] = []
        before: list[tuple[DayStatus, str | None]] = []
        for day in days:
            activity = scope.daily_activity_for(day)
            if activity is None:
                if command.status is not DayStatus.KO:
                    raise DailyActivityNotFoundError(
                        f"No DailyActivity for day {day!r} on scope "
                        f"{command.scope_id!r}."
                    )
                # Built here rather than in the port: the port applies what it is
                # given and does not hold the rule, so the first day to be written
                # is also the first to carry its audit event.
                activity = DailyActivity(
                    day=day, errors_reported=0, incidents_created=0, feai=[]
                )
            resolved.append(activity)
            before.append((activity.status, activity.ko_reason))

        for activity in resolved:
            activity.apply_status(command.status, ko_reason=command.ko_reason)

        self.repository.set_activities_status(
            command.scope_id, days, command.status, ko_reason=command.ko_reason
        )

        if self.audit_trail is not None:
            for day, activity, (old_status, old_reason) in zip(days, resolved, before):
                if old_status is command.status and old_reason == activity.ko_reason:
                    continue
                self.audit_trail.record(
                    AuditEvent(
                        action=_audit_action(command.status),
                        actor=current_actor(),
                        scope_id=command.scope_id,
                        day=day,
                        changes=build_changes(
                            {"status": old_status.value, "ko_reason": old_reason},
                            {
                                "status": command.status.value,
                                # The normalised reason, not the raw command: a
                                # blank one is stored as no reason at all.
                                "ko_reason": activity.ko_reason,
                            },
                        ),
                    )
                )


def _audit_action(status: DayStatus) -> str:
    """``activity_completed`` keeps its meaning; everything else is ``activity_ko``.

    ``activity_ko`` therefore covers raising *and* lifting the KO, since ``changes``
    carries the full transition — ``ko`` → ``pending`` reads unambiguously. Two
    action names for one couple of values would make the journal harder to read,
    not more precise.
    """
    return "activity_completed" if status is DayStatus.COMPLETED else "activity_ko"