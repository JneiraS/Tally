from typing import Protocol

from protab.domain.entities.scope_monitoring import ScopeMonitoring


class ScopeMonitoringRepository(Protocol):
    def save(self, scope: ScopeMonitoring) -> None:
        """Persist the given ScopeMonitoring."""
        ...

    def find_by_id(self, scope_id: str) -> ScopeMonitoring | None:
        """Return the ScopeMonitoring with the given id, or None."""
        ...

    def find_by_name(self, name: str) -> ScopeMonitoring | None:
        """Return the ScopeMonitoring with the given name, or None."""
        ...

    def find_all(self) -> list[ScopeMonitoring]:
        """Return all ScopeMonitorings."""
        ...

    def find_all_scope_names(self) -> dict[str, str]:
        """Return a mapping of scope ids to names."""
        ...
