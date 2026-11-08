"""Édition de la périodicité d'un périmètre.

La périodicité est écrite par une écriture ciblée du port, jamais par ``save()``
(§28.1) : un ``save`` réécrirait les journées relues avant une édition
concurrente.

Le refus « cette périodicité ne tombera jamais un jour ouvré » est le seul
contrôle qui ne peut pas vivre dans le domaine : il faut le calendrier du projet,
que le domaine ne connaît pas. Le use case le reçoit donc en paramètre, et la
vérification précède toute mutation — l'adaptateur in-memory renvoie l'objet
qu'il stocke, donc muter puis refuser corromprait la base au lieu de la laisser
intacte. Le refus est un ``422`` à la frontière, et non un ``400`` : c'est une
valeur inexploitable pour ce projet, comme une note trop longue l'est pour le
schéma entrant.
"""

from protab.application.actor_context import current_actor
from protab.application.commands.scope_monitoring import UpdateScopeScheduleCommand
from protab.domain.entities.audit_event import AuditEvent
from protab.domain.exceptions import ScheduleNeverDueError, ScopeMonitoringNotFoundError
from protab.domain.value_objects.monitoring_schedule import MonitoringSchedule
from protab.domain.value_objects.non_working_days import NonWorkingDays
from protab.ports.outbound.audit_trail_repository import AuditTrailRepository
from protab.ports.outbound.scope_monitoring_repository import ScopeMonitoringRepository


class UpdateScopeScheduleUseCase:
    """Replace the cadence of an existing scope.

    ``calendar`` is the project's working calendar. It is ``None`` in the
    degraded mode without authentication, where no project exists to confront
    the schedule with — the edit is then permitted, like the rest of that mode.
    """

    def __init__(
        self,
        repository: ScopeMonitoringRepository,
        audit_trail: AuditTrailRepository | None = None,
    ):
        self.repository = repository
        self.audit_trail = audit_trail

    def execute(
        self,
        command: UpdateScopeScheduleCommand,
        *,
        calendar: NonWorkingDays | None = None,
    ) -> None:
        scope = self.repository.find_by_id(command.scope_id)
        if scope is None:
            raise ScopeMonitoringNotFoundError(
                f"ScopeMonitoring {command.scope_id!r} not found."
            )

        if calendar is not None and not command.schedule.has_any_due_day(calendar):
            raise ScheduleNeverDueError(
                "Cette périodicité ne tombe jamais un jour ouvré du projet : "
                "le périmètre ne serait jamais attendu."
            )

        before = scope.schedule
        scope.set_schedule(command.schedule)
        self.repository.update_schedule(command.scope_id, scope.schedule)

        changes = _schedule_changes(before, scope.schedule)
        if self.audit_trail is not None and changes:
            self.audit_trail.record(
                AuditEvent(
                    action="scope_schedule_updated",
                    actor=current_actor(),
                    scope_id=command.scope_id,
                    changes=changes,
                )
            )


def _schedule_changes(
    before: MonitoringSchedule, after: MonitoringSchedule
) -> dict[str, dict[str, object]]:
    """The fields that actually moved, so the event says what was edited.

    The values are the stored shape — lists, ints, ISO dates — rather than the
    value object, because ``audit_log.changes`` is JSON and the journal renders
    each diff as a plain before/after.
    """
    old = before.to_dict()
    new = after.to_dict()
    return {
        f"schedule_{field}": {"old": old[field], "new": new[field]}
        for field in ("weekdays", "interval_weeks", "anchor_date")
        if old[field] != new[field]
    }
