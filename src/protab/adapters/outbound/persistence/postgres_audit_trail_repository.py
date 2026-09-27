"""PostgreSQL outbound adapter for the AuditTrailRepository port.

The schema is applied idempotently on :meth:`connect` (same convention as the
scope monitoring adapter). Each event is stamped with the current project id
so that reads are always scoped to the authenticated project.
"""

from dataclasses import replace

import psycopg
from psycopg.types.json import Jsonb

from protab.adapters.outbound.persistence.postgres_pool import (
    POOL_MAX_SIZE,
    POOL_MIN_SIZE,
    build_connection_pool,
)
from protab.adapters.outbound.persistence.postgres_scope_monitoring_repository import (
    require_current_project,
)
from protab.domain.entities.audit_event import AuditEvent
from protab.ports.outbound.audit_trail_repository import AuditEventQuery

_SCHEMA_STATEMENTS: tuple[str, ...] = (
    """
    CREATE TABLE IF NOT EXISTS audit_log (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        actor TEXT NULL,
        action TEXT NOT NULL,
        scope_id TEXT NULL,
        day DATE NULL,
        changes JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
    """,
    """
    CREATE INDEX IF NOT EXISTS idx_audit_log_project_created
        ON audit_log (project_id, created_at DESC)
    """,
    """
    CREATE INDEX IF NOT EXISTS idx_audit_log_scope ON audit_log (scope_id)
    """,
    """
    CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON audit_log (actor)
    """,
)

_AUDIT_SELECT = (
    "SELECT id, project_id, actor, action, scope_id, day, changes, created_at "
    "FROM audit_log"
)


class PostgresAuditTrailRepository:
    def __init__(
        self,
        dsn: str,
        *,
        min_size: int = POOL_MIN_SIZE,
        max_size: int = POOL_MAX_SIZE,
    ) -> None:
        self._pool = build_connection_pool(
            dsn,
            name="protab-audit",
            min_size=min_size,
            max_size=max_size,
        )

    def connect(self) -> None:
        """Open the connection pool and apply the (idempotent) schema."""
        self._pool.open(wait=True)
        with self._pool.connection() as conn:
            for statement in _SCHEMA_STATEMENTS:
                conn.execute(statement)

    def close(self) -> None:
        """Close the connection pool, releasing database connections."""
        self._pool.close()

    def record(self, event: AuditEvent) -> None:
        event = replace(event, project_id=require_current_project())
        with self._pool.connection() as conn:
            conn.execute(
                "INSERT INTO audit_log "
                "(id, project_id, actor, action, scope_id, day, changes, created_at) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
                (
                    event.id,
                    event.project_id,
                    event.actor,
                    event.action,
                    event.scope_id,
                    event.day,
                    Jsonb(event.changes),
                    event.created_at,
                ),
            )

    def list(self, query: AuditEventQuery) -> list[AuditEvent]:
        clauses = ["project_id = %s"]
        params: list = [require_current_project()]

        if query.scope_id:
            clauses.append("scope_id = %s")
            params.append(query.scope_id)
        if query.actor:
            clauses.append("actor = %s")
            params.append(query.actor)
        if query.action:
            clauses.append("action = %s")
            params.append(query.action)
        if query.from_date:
            clauses.append("day >= %s")
            params.append(query.from_date)
        if query.to_date:
            clauses.append("day <= %s")
            params.append(query.to_date)
        params.append(query.limit)

        with self._pool.connection() as conn:
            rows = conn.execute(
                f"{_AUDIT_SELECT} WHERE {' AND '.join(clauses)} "
                "ORDER BY created_at DESC LIMIT %s",
                params,
            ).fetchall()
            return [self._event_from_row(row) for row in rows]

    @staticmethod
    def _event_from_row(row: tuple) -> AuditEvent:
        event_id, project_id, actor, action, scope_id, day, changes, created_at = row
        return AuditEvent(
            id=event_id,
            project_id=project_id,
            actor=actor,
            action=action,
            scope_id=scope_id,
            day=day,
            changes=changes,
            created_at=created_at,
        )
