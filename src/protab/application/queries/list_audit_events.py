from protab.domain.entities.audit_event import AuditEvent
from protab.ports.outbound.audit_trail_repository import (
    AuditEventQuery,
    AuditTrailRepository,
)


class ListAuditEventsUseCase:
    def __init__(self, audit_trail: AuditTrailRepository):
        self.audit_trail = audit_trail

    def execute(self, query: AuditEventQuery) -> list[AuditEvent]:
        return self.audit_trail.list(query)