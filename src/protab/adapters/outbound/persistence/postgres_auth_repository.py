"""PostgreSQL persistence for projects and login sessions."""

import hashlib
import hmac
import os
import secrets
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

import psycopg
from psycopg_pool import ConnectionPool


@dataclass(frozen=True)
class Project:
    id: str
    name: str


@dataclass(frozen=True)
class AuthSession:
    token: str
    project_id: str
    quadrigramme: str
    expires_at: datetime


def _hash_password(password: str, salt: bytes | None = None) -> str:
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1)
    return f"scrypt${salt.hex()}${digest.hex()}"


def _check_password(password: str, encoded: str) -> bool:
    try:
        algorithm, salt_hex, digest_hex = encoded.split("$", 2)
        if algorithm != "scrypt":
            return False
        expected = bytes.fromhex(digest_hex)
        actual = hashlib.scrypt(
            password.encode(), salt=bytes.fromhex(salt_hex), n=2**14, r=8, p=1
        )
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


class PostgresAuthRepository:
    """Store project credentials and opaque, expiring session tokens."""

    def __init__(self, dsn: str, *, min_size: int = 1, max_size: int = 10) -> None:
        self._pool = ConnectionPool(
            dsn,
            min_size=min_size,
            max_size=max_size,
            open=False,
            kwargs={"autocommit": False},
        )
        self.default_project_id = os.getenv(
            "PROTAB_DEFAULT_PROJECT_CODE", "protab"
        ).strip()
        self.default_project_name = os.getenv(
            "PROTAB_DEFAULT_PROJECT_NAME", "Projet principal"
        ).strip()

    def connect(self) -> None:
        self._pool.open(wait=True)
        with self._pool.connection() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS projects (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    password_hash TEXT NOT NULL,
                    active BOOLEAN NOT NULL DEFAULT TRUE,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS auth_sessions (
                    token_hash TEXT PRIMARY KEY,
                    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
                    quadrigramme TEXT NOT NULL,
                    expires_at TIMESTAMPTZ NOT NULL
                )
                """
            )
            password = os.getenv("PROTAB_DEFAULT_PROJECT_PASSWORD", "protab")
            conn.execute(
                """
                INSERT INTO projects (id, name, password_hash)
                VALUES (%s, %s, %s)
                ON CONFLICT (id) DO NOTHING
                """,
                (
                    self.default_project_id,
                    self.default_project_name,
                    _hash_password(password),
                ),
            )

    def close(self) -> None:
        self._pool.close()

    def list_projects(self) -> list[Project]:
        with self._pool.connection() as conn:
            rows = conn.execute(
                "SELECT id, name FROM projects WHERE active = TRUE ORDER BY name"
            ).fetchall()
        return [Project(id=row[0], name=row[1]) for row in rows]

    def create_project(self, project_id: str, name: str, password: str) -> Project:
        project_id = project_id.strip()
        name = name.strip()
        if not project_id or not name or not password:
            raise ValueError(
                "Le code, le nom et le mot de passe du projet sont obligatoires."
            )
        with self._pool.connection() as conn:
            conn.execute(
                "INSERT INTO projects (id, name, password_hash) VALUES (%s, %s, %s)",
                (project_id, name, _hash_password(password)),
            )
        return Project(project_id, name)

    def authenticate(self, project_id: str, quadrigramme: str, password: str) -> bool:
        with self._pool.connection() as conn:
            row = conn.execute(
                "SELECT password_hash FROM projects WHERE id = %s AND active = TRUE",
                (project_id,),
            ).fetchone()
        return row is not None and _check_password(password, row[0])

    def get_project(self, project_id: str) -> Project | None:
        with self._pool.connection() as conn:
            row = conn.execute(
                "SELECT id, name FROM projects WHERE id = %s AND active = TRUE",
                (project_id,),
            ).fetchone()
        return Project(id=row[0], name=row[1]) if row else None

    def create_session(self, project_id: str, quadrigramme: str) -> AuthSession:
        token = secrets.token_urlsafe(32)
        expires_at = datetime.now(timezone.utc) + timedelta(hours=12)
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        with self._pool.connection() as conn:
            conn.execute(
                "INSERT INTO auth_sessions (token_hash, project_id, quadrigramme, expires_at) VALUES (%s, %s, %s, %s)",
                (token_hash, project_id, quadrigramme.strip().upper(), expires_at),
            )
        return AuthSession(token, project_id, quadrigramme.strip().upper(), expires_at)

    def find_session(self, token: str) -> AuthSession | None:
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        with self._pool.connection() as conn:
            row = conn.execute(
                """
                SELECT project_id, quadrigramme, expires_at
                FROM auth_sessions
                WHERE token_hash = %s AND expires_at > NOW()
                """,
                (token_hash,),
            ).fetchone()
        if row is None:
            return None
        return AuthSession(token, row[0], row[1], row[2])

    def delete_session(self, token: str) -> None:
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        with self._pool.connection() as conn:
            conn.execute(
                "DELETE FROM auth_sessions WHERE token_hash = %s", (token_hash,)
            )
