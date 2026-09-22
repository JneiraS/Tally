"""PostgreSQL outbound adapter for the ScopeMonitoringRepository port.

The aggregate ``ScopeMonitoring`` is persisted across two tables:
``scope_monitorings`` (one row per scope) and ``daily_activities``
(one row per day, FK to the scope). A single ``save`` replaces the whole
aggregate inside one transaction, preserving the atomicity contract that
the in-memory adapter guarantees.
"""

from contextvars import ContextVar
from datetime import date

import psycopg

from protab.adapters.outbound.persistence.postgres_pool import (
    POOL_MAX_SIZE,
    POOL_MIN_SIZE,
    build_connection_pool,
)
from protab.domain.entities.daily_activity import DailyActivity
from protab.domain.entities.scope_monitoring import (
    KnowledgeBase,
    Officials,
    ScopeMonitoring,
)
from protab.domain.exceptions import (
    DuplicateDailyActivityError,
    ScopeMonitoringNameAlreadyExistsError,
)

_SCHEMA_STATEMENTS: tuple[str, ...] = (
    """
    CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        non_working_days JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS scope_monitorings (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        name TEXT NOT NULL UNIQUE,
        knowledge_base_id TEXT NOT NULL,
        official_main TEXT NOT NULL,
        official_backup TEXT NOT NULL
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS daily_activities (
        scope_id TEXT NOT NULL REFERENCES scope_monitorings(id) ON DELETE CASCADE,
        day DATE NOT NULL,
        errors_reported INTEGER NOT NULL,
        incidents_created INTEGER NOT NULL,
        feai TEXT[] NOT NULL DEFAULT '{}',
        handled BOOLEAN NOT NULL DEFAULT FALSE,
        completed BOOLEAN NOT NULL DEFAULT FALSE,
        PRIMARY KEY (scope_id, day)
    )
    """,
)

_CURRENT_PROJECT_ID: ContextVar[str | None] = ContextVar(
    "protab_current_project_id", default=None
)


def set_current_project(project_id: str | None):
    return _CURRENT_PROJECT_ID.set(project_id)


def reset_current_project(token) -> None:
    _CURRENT_PROJECT_ID.reset(token)


def current_project_id() -> str | None:
    return _CURRENT_PROJECT_ID.get()


_SCOPE_SELECT = (
    "SELECT id, name, knowledge_base_id, official_main, official_backup "
    "FROM scope_monitorings"
)

_ACTIVITIES_SELECT = (
    "SELECT day, errors_reported, incidents_created, feai, handled, completed "
    "FROM daily_activities"
)

_ACTIVITIES_BATCH_SELECT = (
    "SELECT scope_id, day, errors_reported, incidents_created, feai, handled, completed "
    "FROM daily_activities"
)


class PostgresScopeMonitoringRepository:
    """Persist ``ScopeMonitoring`` aggregates in PostgreSQL.

    The schema is applied idempotently on :meth:`connect`, so no external
    migration tool is required. Depends on ``psycopg`` (sync) + connection
    pool; the outbound port contract remains synchronous, matching the
    existing in-memory adapter.
    """

    def __init__(
        self,
        dsn: str,
        *,
        min_size: int = POOL_MIN_SIZE,
        max_size: int = POOL_MAX_SIZE,
    ) -> None:
        self._dsn = dsn
        self._pool = build_connection_pool(
            dsn,
            name="protab-scope",
            min_size=min_size,
            max_size=max_size,
        )

    def connect(self) -> None:
        """Open the connection pool and apply the (idempotent) schema."""
        self._pool.open(wait=True)
        with self._pool.connection() as conn:
            self._apply_schema(conn)

    def close(self) -> None:
        """Close the connection pool, releasing database connections."""
        self._pool.close()

    def _apply_schema(self, conn: psycopg.Connection) -> None:
        for statement in _SCHEMA_STATEMENTS:
            conn.execute(statement)
        conn.execute(
            "ALTER TABLE scope_monitorings ADD COLUMN IF NOT EXISTS project_id TEXT"
        )
        conn.execute(
            "UPDATE scope_monitorings SET project_id = 'protab' WHERE project_id IS NULL"
        )
        conn.execute(
            "ALTER TABLE projects ADD COLUMN IF NOT EXISTS non_working_days JSONB"
        )
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_scope_monitorings_project_name "
            "ON scope_monitorings (project_id, name)"
        )

    @staticmethod
    def _scope_from_row(
        row: tuple,
        activities: dict[date, DailyActivity],
    ) -> ScopeMonitoring:
        scope_id, name, kb_id, main, backup = row[:5]
        scope = ScopeMonitoring(
            id=scope_id,
            name=name,
            knowledge=KnowledgeBase(id=kb_id),
            officials=Officials(main=main, backup=backup),
        )
        scope.daily_activities = activities
        return scope

    def _load_activities(
        self, conn: psycopg.Connection, scope_id: str
    ) -> dict[date, DailyActivity]:
        rows = conn.execute(
            f"{_ACTIVITIES_SELECT} WHERE scope_id = %s ORDER BY day",
            (scope_id,),
        ).fetchall()
        return {
            day: DailyActivity(
                day=day,
                errors_reported=errors_reported,
                incidents_created=incidents_created,
                feai=feai,
                handled=handled,
                completed=completed,
            )
            for day, errors_reported, incidents_created, feai, handled, completed in rows
        }

    def _load_activities_batched(
        self, conn: psycopg.Connection, scope_ids: list[str]
    ) -> dict[str, dict[date, DailyActivity]]:
        if not scope_ids:
            return {}

        rows = conn.execute(
            f"{_ACTIVITIES_BATCH_SELECT} WHERE scope_id = ANY(%s) ORDER BY day",
            (scope_ids,),
        ).fetchall()
        activities_by_scope = {scope_id: {} for scope_id in scope_ids}
        for (
            scope_id,
            day,
            errors_reported,
            incidents_created,
            feai,
            handled,
            completed,
        ) in rows:
            activities_by_scope[scope_id][day] = DailyActivity(
                day=day,
                errors_reported=errors_reported,
                incidents_created=incidents_created,
                feai=feai,
                handled=handled,
                completed=completed,
            )
        return activities_by_scope

    def save(self, scope: ScopeMonitoring) -> None:
        project_id = current_project_id() or "protab"
        with self._pool.connection() as conn:
            try:
                with conn.transaction():
                    conn.execute(
                        f"""
                        INSERT INTO scope_monitorings ({"id, project_id, name, knowledge_base_id, official_main, official_backup"})
                        VALUES (%s, %s, %s, %s, %s, %s)
                        ON CONFLICT (id) DO UPDATE SET
                            project_id = EXCLUDED.project_id,
                            name = EXCLUDED.name,
                            knowledge_base_id = EXCLUDED.knowledge_base_id,
                            official_main = EXCLUDED.official_main,
                            official_backup = EXCLUDED.official_backup
                        """,
                        (
                            scope.id,
                            project_id,
                            scope.name,
                            scope.knowledge.id,
                            scope.officials.main,
                            scope.officials.backup,
                        ),
                    )
                    conn.execute(
                        "DELETE FROM daily_activities WHERE scope_id = %s",
                        (scope.id,),
                    )
                    for activity in scope.daily_activities.values():
                        conn.execute(
                            f"""
                            INSERT INTO daily_activities ({"scope_id, day, errors_reported, incidents_created, feai, handled, completed"})
                            VALUES (%s, %s, %s, %s, %s, %s, %s)
                            """,
                            (
                                scope.id,
                                activity.day,
                                activity.errors_reported,
                                activity.incidents_created,
                                activity.feai,
                                activity.handled,
                                activity.completed,
                            ),
                        )
            except psycopg.errors.UniqueViolation as exc:
                raise self._translate_unique_violation(exc, scope) from exc

    @staticmethod
    def _translate_unique_violation(
        exc: psycopg.errors.UniqueViolation, scope: ScopeMonitoring
    ) -> Exception:
        constraint = exc.diag.constraint_name
        if constraint == "daily_activities_pkey":
            return DuplicateDailyActivityError(
                f"ScopeMonitoring already has a DailyActivity for the saved day."
            )
        return ScopeMonitoringNameAlreadyExistsError(
            f"ScopeMonitoring with name {scope.name!r} already exists."
        )

    def find_by_id(self, scope_id: str) -> ScopeMonitoring | None:
        with self._pool.connection() as conn:
            project_id = current_project_id()
            row = conn.execute(
                f"{_SCOPE_SELECT} WHERE id = %s"
                + (" AND project_id = %s" if project_id else ""),
                (scope_id, project_id) if project_id else (scope_id,),
            ).fetchone()
            if row is None:
                return None
            activities = self._load_activities(conn, scope_id)
            return self._scope_from_row(row, activities)

    def find_by_name(self, name: str) -> ScopeMonitoring | None:
        with self._pool.connection() as conn:
            project_id = current_project_id()
            row = conn.execute(
                f"{_SCOPE_SELECT} WHERE name = %s"
                + (" AND project_id = %s" if project_id else ""),
                (name, project_id) if project_id else (name,),
            ).fetchone()
            if row is None:
                return None
            activities = self._load_activities(conn, row[0])
            return self._scope_from_row(row, activities)

    def find_all(self) -> list[ScopeMonitoring]:
        with self._pool.connection() as conn:
            project_id = current_project_id()
            rows = conn.execute(
                f"{_SCOPE_SELECT}"
                + (" WHERE project_id = %s" if project_id else "")
                + " ORDER BY name",
                (project_id,) if project_id else (),
            ).fetchall()
            activities_by_scope = self._load_activities_batched(
                conn, [row[0] for row in rows]
            )
            return [
                self._scope_from_row(row, activities_by_scope[row[0]])
                for row in rows
            ]

    def find_all_scope_names(self) -> dict[str, str]:
        with self._pool.connection() as conn:
            project_id = current_project_id()
            rows = conn.execute(
                "SELECT id, name FROM scope_monitorings"
                + (" WHERE project_id = %s" if project_id else ""),
                (project_id,) if project_id else (),
            ).fetchall()
            return {scope_id: name for scope_id, name in rows}
