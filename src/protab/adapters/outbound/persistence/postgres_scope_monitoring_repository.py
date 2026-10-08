"""PostgreSQL outbound adapter for the ScopeMonitoringRepository port.

The aggregate ``ScopeMonitoring`` is persisted across two tables:
``scope_monitorings`` (one row per scope) and ``daily_activities``
(one row per day, FK to the scope).

``save`` inserts a whole new aggregate inside one transaction and refuses an id
that is already taken, so it cannot rewrite an existing scope. Mutating one goes
through the targeted ``insert_daily_activity`` / ``update_daily_activity`` /
``set_activities_status`` / ``update_note`` methods, which touch only the
rows they name: a full rewrite would persist every day read before the call and
silently drop a concurrent edit to another day of the same scope.

``set_activities_status`` is the one targeted write that upserts, because
reporting a day as KO has to work on a day nobody could enter anything on. It
still rewrites two named columns and nothing else.

``daily_activities`` carries no ``project_id`` of its own, so every targeted
write joins ``scope_monitorings`` and filters on the current project without
condition, as the multi-tenant invariant requires.
"""

from contextvars import ContextVar, Token
from datetime import date

import psycopg

from protab.adapters.outbound.persistence.postgres_pool import (
    POOL_MAX_SIZE,
    POOL_MIN_SIZE,
    build_connection_pool,
)
from protab.domain.entities.daily_activity import DailyActivity
from protab.domain.entities.day_status import DayStatus
from protab.domain.entities.scope_monitoring import (
    KnowledgeBase,
    Officials,
    ScopeMonitoring,
)
from protab.domain.exceptions import (
    DailyActivityNotFoundError,
    DuplicateDailyActivityError,
    ScopeMonitoringAlreadyExistsError,
    ScopeMonitoringNameAlreadyExistsError,
    ScopeMonitoringNotFoundError,
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
        project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
        name TEXT NOT NULL UNIQUE,
        knowledge_base_id TEXT NOT NULL,
        official_main TEXT NOT NULL,
        official_backup TEXT NOT NULL,
        billing_code TEXT,
        note TEXT
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS daily_activities (
        scope_id TEXT NOT NULL REFERENCES scope_monitorings(id) ON DELETE CASCADE,
        day DATE NOT NULL,
        errors_reported INTEGER NOT NULL,
        incidents_created INTEGER NOT NULL,
        feai TEXT[] NOT NULL DEFAULT '{}',
        status TEXT NOT NULL DEFAULT 'pending',
        ko_reason TEXT,
        PRIMARY KEY (scope_id, day)
    )
    """,
)

_CURRENT_PROJECT_ID: ContextVar[str | None] = ContextVar(
    "protab_current_project_id", default=None
)


def set_current_project(project_id: str | None) -> Token[str | None]:
    return _CURRENT_PROJECT_ID.set(project_id)


def reset_current_project(token: Token[str | None]) -> None:
    _CURRENT_PROJECT_ID.reset(token)


def current_project_id() -> str | None:
    return _CURRENT_PROJECT_ID.get()


class MissingProjectContextError(RuntimeError):
    """No authenticated request established the project to read or write."""


def require_current_project() -> str:
    """Return the current project id, or refuse to touch the database.

    Every read and write is scoped to a single tenant. Falling back to a
    default project, or emitting an unfiltered ``SELECT``, would silently
    expose every tenant's scopes, so the adapters fail closed instead.
    """
    project_id = current_project_id()
    if project_id is None:
        raise MissingProjectContextError(
            "Contexte projet absent : refusing to read or write scopes across "
            "tenants. The request must go through the project_context dependency."
        )
    return project_id


_SCOPE_SELECT = (
    "SELECT id, name, knowledge_base_id, official_main, official_backup, "
    "billing_code, note "
    "FROM scope_monitorings"
)

_ACTIVITIES_SELECT = (
    "SELECT day, errors_reported, incidents_created, feai, status, ko_reason "
    "FROM daily_activities"
)

_ACTIVITIES_BATCH_SELECT = (
    "SELECT scope_id, day, errors_reported, incidents_created, feai, status, "
    "ko_reason FROM daily_activities"
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
            "DO $$\n"
            "BEGIN\n"
            "    IF NOT EXISTS (\n"
            "        SELECT 1 FROM pg_constraint\n"
            "        WHERE conrelid = 'scope_monitorings'::regclass\n"
            "          AND conname = 'scope_monitorings_project_id_fkey'\n"
            "    ) THEN\n"
            "        ALTER TABLE scope_monitorings\n"
            "        ADD CONSTRAINT scope_monitorings_project_id_fkey\n"
            "        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;\n"
            "    END IF;\n"
            "END $$"
        )
        conn.execute(
            "ALTER TABLE projects ADD COLUMN IF NOT EXISTS non_working_days JSONB"
        )
        # ``billing_code`` est obligatoire pour un périmètre créé aujourd'hui
        # (invariant porté par le domaine et le schéma Pydantic) mais la colonne
        # reste nullable : les lignes antérieures à son introduction ne peuvent
        # pas porter de valeur inventée, et un NOT NULL ferait échouer cet ALTER
        # sur une table déjà peuplée.
        conn.execute(
            "ALTER TABLE scope_monitorings ADD COLUMN IF NOT EXISTS billing_code TEXT"
        )
        # La note libre est nullable et sans contrainte de format : une ligne
        # antérieure à son introduction vaut « pas de note ». Même raison que
        # ``billing_code``, un NOT NULL ferait échouer cet ALTER sur une table
        # déjà peuplée.
        conn.execute(
            "ALTER TABLE scope_monitorings ADD COLUMN IF NOT EXISTS note TEXT"
        )
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_scope_monitorings_project_name "
            "ON scope_monitorings (project_id, name)"
        )
        self._migrate_activity_status(conn)

    @staticmethod
    def _migrate_activity_status(conn: psycopg.Connection) -> None:
        """Replace the two completion booleans by the single ``status`` column.

        ``handled`` and ``completed`` were always equal in production — the only
        writer set both in one statement — so nothing is lost by dropping them
        once the value has been carried over. The order matters: the backfill
        reads ``completed`` and must therefore run before the ``DROP``.

        Every step is idempotent, like the rest of the startup schema, and no
        ``CHECK`` is added on ``status``: a constraint would have to be created by
        an ``ALTER TABLE`` that fails to start up against a row written by hand,
        which is the same trap ``billing_code`` avoids by leaving the constraint
        to the domain.

        The backfill and the drops share one guard on ``completed`` still being
        there. Without it the very first restart would fail — the second start
        reads a column the first start dropped — so a migration that only works
        once is a migration that breaks every deployment after its upgrade.
        """
        conn.execute(
            "ALTER TABLE daily_activities "
            "ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'"
        )
        conn.execute(
            "ALTER TABLE daily_activities ADD COLUMN IF NOT EXISTS ko_reason TEXT"
        )
        conn.execute(
            "DO $$\n"
            "BEGIN\n"
            "    IF EXISTS (\n"
            "        SELECT 1 FROM information_schema.columns\n"
            "        WHERE table_name = 'daily_activities'\n"
            "          AND column_name = 'completed'\n"
            "    ) THEN\n"
            "        UPDATE daily_activities SET status = 'completed'\n"
            "        WHERE completed AND status = 'pending';\n"
            "        ALTER TABLE daily_activities DROP COLUMN IF EXISTS handled;\n"
            "        ALTER TABLE daily_activities DROP COLUMN IF EXISTS completed;\n"
            "    END IF;\n"
            "END $$"
        )

    @staticmethod
    def _scope_from_row(
        row: tuple,
        activities: dict[date, DailyActivity],
    ) -> ScopeMonitoring:
        scope_id, name, kb_id, main, backup, billing_code, note = row[:7]
        scope = ScopeMonitoring(
            id=scope_id,
            name=name,
            knowledge=KnowledgeBase(id=kb_id),
            officials=Officials(main=main, backup=backup),
            billing_code=billing_code,
            note=note,
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
                status=DayStatus.from_raw(status),
                ko_reason=ko_reason,
            )
            for (
                day,
                errors_reported,
                incidents_created,
                feai,
                status,
                ko_reason,
            ) in rows
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
        activities_by_scope: dict[str, dict[date, DailyActivity]] = {
            scope_id: {} for scope_id in scope_ids
        }
        for (
            scope_id,
            day,
            errors_reported,
            incidents_created,
            feai,
            status,
            ko_reason,
        ) in rows:
            activities_by_scope[scope_id][day] = DailyActivity(
                day=day,
                errors_reported=errors_reported,
                incidents_created=incidents_created,
                feai=feai,
                status=DayStatus.from_raw(status),
                ko_reason=ko_reason,
            )
        return activities_by_scope

    def save(self, scope: ScopeMonitoring) -> None:
        project_id = require_current_project()
        with self._pool.connection() as conn:
            try:
                with conn.transaction():
                    # Insertion only. The clause absorbs a taken id instead of
                    # merging into the stored row: a second save would otherwise
                    # rewrite the fields it re-reads and reinsert every
                    # activity, silently dropping a concurrent edit. The name is
                    # a separate constraint, so it still raises and is
                    # translated below.
                    cursor = conn.execute(
                        f"""
                        INSERT INTO scope_monitorings ({"id, project_id, name, knowledge_base_id, official_main, official_backup, billing_code, note"})
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (id) DO NOTHING
                        """,
                        (
                            scope.id,
                            project_id,
                            scope.name,
                            scope.knowledge.id,
                            scope.officials.main,
                            scope.officials.backup,
                            scope.billing_code,
                            scope.note,
                        ),
                    )
                    if cursor.rowcount == 0:
                        raise ScopeMonitoringAlreadyExistsError(
                            f"ScopeMonitoring {scope.id!r} already exists."
                        )
                    for activity in scope.daily_activities.values():
                        conn.execute(
                            f"""
                            INSERT INTO daily_activities ({"scope_id, day, errors_reported, incidents_created, feai, status, ko_reason"})
                            VALUES (%s, %s, %s, %s, %s, %s, %s)
                            """,
                            (
                                scope.id,
                                activity.day,
                                activity.errors_reported,
                                activity.incidents_created,
                                activity.feai,
                                activity.status.value,
                                activity.ko_reason,
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
                "ScopeMonitoring already has a DailyActivity for the saved day."
            )
        return ScopeMonitoringNameAlreadyExistsError(
            f"ScopeMonitoring with name {scope.name!r} already exists."
        )

    def insert_daily_activity(self, scope_id: str, activity: DailyActivity) -> None:
        project_id = require_current_project()
        with self._pool.connection() as conn:
            try:
                with conn.transaction():
                    # The foreign key alone would happily accept another
                    # tenant's scope, so the insert is gated on the scope being
                    # visible in the current project.
                    cursor = conn.execute(
                        f"""
                        INSERT INTO daily_activities ({"scope_id, day, errors_reported, incidents_created, feai, status, ko_reason"})
                        SELECT %s, %s, %s, %s, %s, %s, %s
                        WHERE EXISTS (
                            SELECT 1 FROM scope_monitorings
                            WHERE id = %s AND project_id = %s
                        )
                        """,
                        (
                            scope_id,
                            activity.day,
                            activity.errors_reported,
                            activity.incidents_created,
                            activity.feai,
                            activity.status.value,
                            activity.ko_reason,
                            scope_id,
                            project_id,
                        ),
                    )
                    if cursor.rowcount == 0:
                        raise ScopeMonitoringNotFoundError(
                            f"ScopeMonitoring {scope_id!r} not found."
                        )
            except psycopg.errors.UniqueViolation as exc:
                raise DuplicateDailyActivityError(
                    f"ScopeMonitoring {scope_id!r} already has a DailyActivity "
                    f"for day {activity.day!r}."
                ) from exc

    def update_daily_activity(self, scope_id: str, activity: DailyActivity) -> None:
        project_id = require_current_project()
        with self._pool.connection() as conn, conn.transaction():
            cursor = conn.execute(
                """
                UPDATE daily_activities AS a
                SET errors_reported = %s, incidents_created = %s, feai = %s
                FROM scope_monitorings AS s
                WHERE a.scope_id = s.id
                  AND s.project_id = %s
                  AND a.scope_id = %s
                  AND a.day = %s
                """,
                (
                    activity.errors_reported,
                    activity.incidents_created,
                    activity.feai,
                    project_id,
                    scope_id,
                    activity.day,
                ),
            )
            if cursor.rowcount == 0:
                raise DailyActivityNotFoundError(
                    f"No DailyActivity for day {activity.day!r} on scope {scope_id!r}."
                )

    def set_activities_status(
        self,
        scope_id: str,
        days: list[date],
        status: DayStatus,
        *,
        ko_reason: str | None = None,
    ) -> None:
        project_id = require_current_project()
        wanted = list(dict.fromkeys(days))
        if not wanted:
            raise ValueError("set_activities_status requires at least one day.")
        with self._pool.connection() as conn, conn.transaction():
            # ``ON CONFLICT DO UPDATE`` belongs here and not on ``save``, because
            # this statement rewrites two named columns of named rows and nothing
            # else: it never merges counters a caller has not re-read, which was
            # the objection that removed the clause from ``save``. A day that has
            # no row yet is created with zeroed counters, which is what lets a day
            # be reported as KO without anybody having entered anything.
            cursor = conn.execute(
                """
                INSERT INTO daily_activities
                    (scope_id, day, errors_reported, incidents_created, feai,
                     status, ko_reason)
                SELECT %s, requested.day, 0, 0, '{}', %s, %s
                FROM unnest(%s::date[]) AS requested(day)
                WHERE EXISTS (
                    SELECT 1 FROM scope_monitorings
                    WHERE id = %s AND project_id = %s
                )
                ON CONFLICT (scope_id, day) DO UPDATE
                    SET status = EXCLUDED.status, ko_reason = EXCLUDED.ko_reason
                """,
                (
                    scope_id,
                    status.value,
                    ko_reason,
                    wanted,
                    scope_id,
                    project_id,
                ),
            )
            if cursor.rowcount == 0:
                # The scope is the only thing that can make the whole SELECT
                # produce nothing — the gate is on the statement, not per row. The
                # separate lookup exists only to tell a foreign scope from an
                # empty day list, which now raises above; without it the message
                # would name the wrong cause.
                visible = conn.execute(
                    "SELECT 1 FROM scope_monitorings WHERE id = %s AND project_id = %s",
                    (scope_id, project_id),
                ).fetchone()
                raise ScopeMonitoringNotFoundError(
                    f"ScopeMonitoring {scope_id!r} not found."
                    if visible is None
                    else f"ScopeMonitoring {scope_id!r} received no day to update."
                )

    def update_note(self, scope_id: str, note: str | None) -> None:
        project_id = require_current_project()
        with self._pool.connection() as conn, conn.transaction():
            cursor = conn.execute(
                """
                UPDATE scope_monitorings
                SET note = %s
                WHERE id = %s AND project_id = %s
                """,
                (note, scope_id, project_id),
            )
            if cursor.rowcount == 0:
                raise ScopeMonitoringNotFoundError(
                    f"ScopeMonitoring {scope_id!r} not found."
                )

    def find_by_id(self, scope_id: str) -> ScopeMonitoring | None:
        project_id = require_current_project()
        with self._pool.connection() as conn:
            row = conn.execute(
                f"{_SCOPE_SELECT} WHERE id = %s AND project_id = %s",
                (scope_id, project_id),
            ).fetchone()
            if row is None:
                return None
            activities = self._load_activities(conn, scope_id)
            return self._scope_from_row(row, activities)

    def find_by_name(self, name: str) -> ScopeMonitoring | None:
        project_id = require_current_project()
        with self._pool.connection() as conn:
            row = conn.execute(
                f"{_SCOPE_SELECT} WHERE name = %s AND project_id = %s",
                (name, project_id),
            ).fetchone()
            if row is None:
                return None
            activities = self._load_activities(conn, row[0])
            return self._scope_from_row(row, activities)

    def find_all(self) -> list[ScopeMonitoring]:
        project_id = require_current_project()
        with self._pool.connection() as conn:
            rows = conn.execute(
                f"{_SCOPE_SELECT} WHERE project_id = %s ORDER BY name",
                (project_id,),
            ).fetchall()
            activities_by_scope = self._load_activities_batched(
                conn, [row[0] for row in rows]
            )
            return [
                self._scope_from_row(row, activities_by_scope[row[0]]) for row in rows
            ]

    def find_all_scope_names(self) -> dict[str, str]:
        project_id = require_current_project()
        with self._pool.connection() as conn:
            rows = conn.execute(
                "SELECT id, name FROM scope_monitorings WHERE project_id = %s",
                (project_id,),
            ).fetchall()
            return {scope_id: name for scope_id, name in rows}
