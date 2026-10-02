from protab.application.actor_context import current_actor
from protab.application.commands.scope_monitoring import UpdateScopeNoteCommand
from protab.domain.entities.audit_event import AuditEvent
from protab.domain.exceptions import ScopeMonitoringNotFoundError
from protab.ports.outbound.audit_trail_repository import AuditTrailRepository
from protab.ports.outbound.scope_monitoring_repository import ScopeMonitoringRepository


class UpdateScopeNoteUseCase:
    """Overwrite the free-text note of an existing scope.

    The note is written through the repository's targeted write rather than
    ``save``: a scope edit must not repersist the activities it did not read.
    """

    def __init__(
        self,
        repository: ScopeMonitoringRepository,
        audit_trail: AuditTrailRepository | None = None,
    ):
        self.repository = repository
        self.audit_trail = audit_trail

    def execute(self, command: UpdateScopeNoteCommand) -> None:
        scope = self.repository.find_by_id(command.scope_id)
        if scope is None:
            raise ScopeMonitoringNotFoundError(
                f"ScopeMonitoring {command.scope_id!r} not found."
            )

        before = scope.note
        # ``set_note`` validates before mutating, so a too-long note leaves the
        # aggregate untouched: nothing is written and nothing is audited.
        scope.set_note(command.note)

        self.repository.update_note(command.scope_id, scope.note)

        if self.audit_trail is not None and before != scope.note:
            self.audit_trail.record(
                AuditEvent(
                    action="scope_note_updated",
                    actor=current_actor(),
                    scope_id=command.scope_id,
                    changes={"note": {"old": before, "new": scope.note}},
                )
            )