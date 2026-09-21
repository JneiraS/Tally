from dataclasses import dataclass
from datetime import date
from typing import Protocol

from protab.domain.entities.audit_event import AuditEvent


@dataclass(frozen=True)
class AuditEventQuery:
    scope_id: str | None = None
    actor: str | None = None
    action: str | None = None
    from_date: date | None = None
    to_date: date | None = None
    limit: int = 200


class AuditTrailRepository(Protocol):
    def record(self, event: AuditEvent) -> None:
        """Persist an audit event."""
        ...

    def list(self, query: AuditEventQuery) -> list[AuditEvent]:
        """Return audit events matching the query, most recent first."""
        ...