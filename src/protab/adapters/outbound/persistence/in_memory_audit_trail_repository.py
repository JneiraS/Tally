"""In-memory adapter of the AuditTrailRepository port for tests.

Every filter here mirrors ``PostgresAuditTrailRepository.list`` exactly: the two
are interchangeable (AGENTS.md §11), so a query that selects the right events
in memory must select the same ones in SQL.
"""

from dataclasses import replace

from protab.adapters.outbound.persistence.postgres_scope_monitoring_repository import (
    current_project_id,
)
from protab.domain.entities.audit_event import AuditEvent
from protab.ports.outbound.audit_trail_repository import AuditEventQuery


class InMemoryAuditTrailRepository:
    def __init__(self) -> None:
        self.events: list[AuditEvent] = []

    def record(self, event: AuditEvent) -> None:
        self.events.append(replace(event, project_id=current_project_id() or "protab"))

    def list(self, query: AuditEventQuery) -> list[AuditEvent]:
        project_id = current_project_id() or "protab"
        events = [event for event in self.events if event.project_id == project_id]

        if query.scope_ids:
            wanted = set(query.scope_ids)
            events = [event for event in events if event.scope_id in wanted]
        if query.action:
            events = [event for event in events if event.action == query.action]
        if query.actor:
            prefix = query.actor.strip().upper()
            events = [
                event
                for event in events
                if event.actor is not None and event.actor.upper().startswith(prefix)
            ]
        if query.from_created_at:
            events = [
                event for event in events if event.created_at >= query.from_created_at
            ]
        if query.to_created_at:
            events = [event for event in events if event.created_at < query.to_created_at]

        events.sort(key=lambda event: event.created_at, reverse=True)
        return events[: query.limit]