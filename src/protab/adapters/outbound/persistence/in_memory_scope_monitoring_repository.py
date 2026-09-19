from protab.domain.entities.scope_monitoring import ScopeMonitoring
from protab.ports.outbound.scope_monitoring_repository import ScopeMonitoringRepository


class InMemoryScopeMonitoringRepository:
    def __init__(self) -> None:
        self._by_id: dict[str, ScopeMonitoring] = {}
        self._by_name: dict[str, ScopeMonitoring] = {}

    def save(self, scope: ScopeMonitoring) -> None:
        self._by_id[scope.id] = scope
        self._by_name[scope.name] = scope

    def find_by_id(self, scope_id: str) -> ScopeMonitoring | None:
        return self._by_id.get(scope_id)

    def find_by_name(self, name: str) -> ScopeMonitoring | None:
        return self._by_name.get(name)

    def find_all(self) -> list[ScopeMonitoring]:
        return list(self._by_id.values())