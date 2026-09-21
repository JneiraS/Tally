from protab.domain.entities.scope_monitoring import ScopeMonitoring
from protab.domain.exceptions import ScopeMonitoringNotFoundError
from protab.ports.outbound.scope_monitoring_repository import ScopeMonitoringRepository


class GetScopeUseCase:
    def __init__(self, repository: ScopeMonitoringRepository):
        self.repository = repository

    def execute(self, scope_id: str) -> ScopeMonitoring:
        scope = self.repository.find_by_id(scope_id)
        if scope is None:
            raise ScopeMonitoringNotFoundError(
                f"ScopeMonitoring {scope_id!r} not found."
            )
        return scope
