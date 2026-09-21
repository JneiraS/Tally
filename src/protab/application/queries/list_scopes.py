from protab.domain.entities.scope_monitoring import ScopeMonitoring
from protab.ports.outbound.scope_monitoring_repository import ScopeMonitoringRepository


class ListScopesUseCase:
    def __init__(self, repository: ScopeMonitoringRepository):
        self.repository = repository

    def execute(self) -> list[ScopeMonitoring]:
        return self.repository.find_all()
