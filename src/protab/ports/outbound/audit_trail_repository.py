from dataclasses import dataclass
from datetime import datetime
from typing import Protocol

from protab.domain.entities.audit_event import AuditEvent


@dataclass(frozen=True)
class AuditEventQuery:
    """Filters selecting a slice of the audit trail.

    Two decisions here are load-bearing, and both adapters must honour them
    identically (AGENTS.md §11 — the in-memory and SQL adapters are
    interchangeable, not merely compatible).

    **The period filters on ``created_at``, not on ``day``.** ``day`` is the
    business day an activity concerns, and it is ``None`` for ``scope_created``,
    ``scope_imported`` and ``scope_note_updated``. Filtering the journal by
    ``day`` would therefore silently drop a third of its events the moment a
    period was set. ``created_at`` is when the change was *recorded*, which is
    the question this journal answers: who changed what, and when.

    **The window is half-open** — ``from_created_at`` inclusive,
    ``to_created_at`` exclusive. The server holds no timezone, so the caller
    resolves local midnight into instants before building the query; an
    exclusive upper bound is the only way to express "the whole of that day"
    without a sub-second fudge factor.

    ``actor`` is a **case-insensitive prefix**, not an equality. The column
    stores ``quadrigramme.strip().upper()``, so an exact comparison would
    return nothing for ``abcd`` or for the partial ``AB``: a filter that empties
    the table as you type is indistinguishable from a broken one. A prefix
    widens instead of clearing, and no list of valid actors has to be known in
    advance to find them.
    """

    scope_ids: tuple[str, ...] = ()
    actor: str | None = None
    action: str | None = None
    from_created_at: datetime | None = None
    to_created_at: datetime | None = None
    limit: int = 200


class AuditTrailRepository(Protocol):
    def record(self, event: AuditEvent) -> None:
        """Persist an audit event."""
        ...

    def list(self, query: AuditEventQuery) -> list[AuditEvent]:
        """Return audit events matching the query, most recent first.

        ``scope_ids`` matches any of the given scopes when non-empty. ``actor``
        matches an uppercased prefix, case-insensitively. The ``created_at``
        window is half-open. ``limit`` bounds the number of rows.
        """
        ...