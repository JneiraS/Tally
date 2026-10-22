"""Édition des responsables d'un périmètre, réservée aux administrateurs.

La permission est jugée **avant** la lecture du périmètre : un non-admin ne
doit pas pouvoir sonder l'existence d'un identifiant (404), et la garantie de
non-divulgation passe avant le confort d'un message précis. La porte
``AdminDirectory`` est consultée à chaque appel — jamais un rôle mémorisé au
login (voir §28.3 bis) —, et ``admin_directory=None`` est le mode dégradé
volontaire de l'instance sans authentification, cohérent avec la permissivité de
``project_context``.
"""

from protab.application.actor_context import current_actor
from protab.application.commands.scope_monitoring import UpdateScopeOfficialsCommand
from protab.domain.entities.audit_event import AuditEvent
from protab.domain.exceptions import NotProjectAdminError, ScopeMonitoringNotFoundError
from protab.ports.outbound.admin_directory import AdminDirectory
from protab.ports.outbound.audit_trail_repository import AuditTrailRepository
from protab.ports.outbound.scope_monitoring_repository import ScopeMonitoringRepository


class UpdateScopeOfficialsUseCase:
    """Overwrite the officials of an existing scope, admins only.

    Written through the repository's targeted write rather than ``save``: a
    scope edit must not repersist the activities and the note it did not read,
    exactly like the note review of §28.1.
    """

    def __init__(
        self,
        repository: ScopeMonitoringRepository,
        admin_directory: AdminDirectory | None = None,
        audit_trail: AuditTrailRepository | None = None,
    ):
        self.repository = repository
        self.admin_directory = admin_directory
        self.audit_trail = audit_trail

    def execute(self, command: UpdateScopeOfficialsCommand) -> None:
        if self.admin_directory is not None and not self.admin_directory.is_current_project_admin(
            current_actor() or ""
        ):
            raise NotProjectAdminError(
                "Seuls les administrateurs du projet peuvent modifier les "
                "responsables d'un périmètre."
            )

        scope = self.repository.find_by_id(command.scope_id)
        if scope is None:
            raise ScopeMonitoringNotFoundError(
                f"ScopeMonitoring {command.scope_id!r} not found."
            )

        before = scope.officials
        # ``set_officials`` validates before mutating, so a blank field leaves
        # the aggregate untouched: nothing is written and nothing is audited.
        scope.set_officials(command.official_main, command.official_backup)

        self.repository.update_officials(
            command.scope_id, scope.officials.main, scope.officials.backup
        )

        changes = {
            field: {"old": getattr(before, field), "new": getattr(scope.officials, field)}
            for field in ("main", "backup")
            if getattr(before, field) != getattr(scope.officials, field)
        }
        if self.audit_trail is not None and changes:
            self.audit_trail.record(
                AuditEvent(
                    action="scope_officials_updated",
                    actor=current_actor(),
                    scope_id=command.scope_id,
                    changes={f"official_{name}": diff for name, diff in changes.items()},
                )
            )
