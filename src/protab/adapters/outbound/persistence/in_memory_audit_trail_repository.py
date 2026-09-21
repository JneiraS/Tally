"""In-memory adapter of the AuditTrailRepository port for tests."""

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

        if query.scope_id:
            events = [event for event in events if event.scope_id == query.scope_id]
        if query.actor:
            events = [event for event in events if event.actor == query.actor]
        if query.action:
            events = [event for event in events if event.action == query.action]
        if query.from_date:
            events = [event for event in events if event.day and event.day >= query.from_date]
        if query.to_date:
            events = [event for event in events if event.day and event.day <= query.to_date]

        events.sort(key=lambda event: event.created_at, reverse=True)
        return events[: query.limit]