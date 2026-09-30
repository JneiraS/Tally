from uuid import uuid4

from protab.application.actor_context import current_actor
from protab.application.commands.create_scope_monitoring import (
    CreateScopeMonitoringCommand,
)
from protab.domain.entities.audit_event import AuditEvent, build_changes
from protab.domain.entities.scope_monitoring import (
    KnowledgeBase,
    Officials,
    ScopeMonitoring,
)
from protab.domain.exceptions import ScopeMonitoringNameAlreadyExistsError
from protab.ports.outbound.audit_trail_repository import AuditTrailRepository
from protab.ports.outbound.scope_monitoring_repository import ScopeMonitoringRepository


class CreateScopeMonitoringUseCase:
    def __init__(
        self,
        repository: ScopeMonitoringRepository,
        audit_trail: AuditTrailRepository | None = None,
    ):
        self.repository = repository
        self.audit_trail = audit_trail

    def execute(
        self,
        commands: list[CreateScopeMonitoringCommand],
        source: str = "manual",
    ) -> list[str]:
        created: list[ScopeMonitoring] = []
        for command in commands:
            if self.repository.find_by_name(command.name) is not None:
                raise ScopeMonitoringNameAlreadyExistsError(
                    f"ScopeMonitoring with name {command.name!r} already exists."
                )
            created.append(self._build(command))

        for scope in created:
            self.repository.save(scope)

        if self.audit_trail is not None:
            for scope in created:
                self.audit_trail.record(
                    AuditEvent(
                        action=(
                            "scope_imported" if source == "csv" else "scope_created"
                        ),
                        actor=current_actor(),
                        scope_id=scope.id,
                        changes=build_changes(
                            {},
                            {
                                "name": scope.name,
                                "knowledge_base_id": scope.knowledge.id,
                                "official_main": scope.officials.main,
                                "official_backup": scope.officials.backup,
                                "billing_code": scope.billing_code,
                            },
                        ),
                    )
                )

        return [scope.id for scope in created]

    def _build(self, command: CreateScopeMonitoringCommand) -> ScopeMonitoring:
        return ScopeMonitoring.create(
            id=str(uuid4()),
            name=command.name,
            knowledge=KnowledgeBase(id=command.knowledge_base_id),
            officials=Officials(
                main=command.official_main,
                backup=command.official_backup,
            ),
            billing_code=command.billing_code,
        )