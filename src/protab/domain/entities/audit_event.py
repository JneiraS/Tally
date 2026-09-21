"""Domain model for the audit trail.

An :class:`AuditEvent` records *who* (actor) did *what* (action) on *which*
entity (scope/day) *when* (created_at), plus the ``before``/``after`` values
of the changed fields so that any suspicious edit can be inspected.
"""

from dataclasses import dataclass, field
from datetime import date, datetime, timezone
from uuid import uuid4


def build_changes(before: dict, after: dict) -> dict:
    """Return only the fields whose value differs between ``before`` and ``after``.

    Each differing field is exposed as ``{field: {"old": ..., "new": ...}}``.
    Keys present on one side only are included with ``None`` on the missing side.
    """
    changes: dict = {}
    for key in set(before) | set(after):
        old = before.get(key)
        new = after.get(key)
        if old != new:
            changes[key] = {"old": old, "new": new}
    return changes


@dataclass(frozen=True)
class AuditEvent:
    action: str
    actor: str | None = None
    project_id: str | None = None
    scope_id: str | None = None
    day: date | None = None
    changes: dict = field(default_factory=dict)
    id: str = field(default_factory=lambda: str(uuid4()))
    created_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )