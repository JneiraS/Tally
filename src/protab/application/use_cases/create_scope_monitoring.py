from uuid import uuid4

from protab.application.commands.create_scope_monitoring import (
    CreateScopeMonitoringCommand,
)
from protab.domain.entities.scope_monitoring import (
    KnowledgeBase,
    Officials,
    ScopeMonitoring,
)
from protab.domain.exceptions import ScopeMonitoringNameAlreadyExistsError
from protab.ports.outbound.scope_monitoring_repository import ScopeMonitoringRepository


class CreateScopeMonitoringUseCase:
    def __init__(self, repository: ScopeMonitoringRepository):
        self.repository = repository

    def execute(self, commands: list[CreateScopeMonitoringCommand]) -> list[str]:
        created: list[ScopeMonitoring] = []
        for command in commands:
            if self.repository.find_by_name(command.name) is not None:
                raise ScopeMonitoringNameAlreadyExistsError(
                    f"ScopeMonitoring with name {command.name!r} already exists."
                )
            created.append(self._build(command))

        for scope in created:
            self.repository.save(scope)

        return [scope.id for scope in created]

    def _build(self, command: CreateScopeMonitoringCommand) -> ScopeMonitoring:
        return ScopeMonitoring(
            id=str(uuid4()),
            name=command.name,
            knowledge=KnowledgeBase(id=command.knowledge_base_id),
            officials=Officials(
                main=command.official_main,
                backup=command.official_backup,
            ),
        )