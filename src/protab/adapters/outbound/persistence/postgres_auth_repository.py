"""PostgreSQL persistence for projects and login sessions."""

import hashlib
import hmac
import os
import secrets
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone

import psycopg
from psycopg.types.json import Jsonb

from protab.adapters.outbound.persistence.postgres_pool import (
    POOL_MAX_SIZE,
    POOL_MIN_SIZE,
    build_connection_pool,
)
from protab.domain.value_objects.non_working_days import NonWorkingDays
from protab.domain.value_objects.official_code import OfficialCode


@dataclass(frozen=True)
class Project:
    id: str
    name: str
    non_working_days: NonWorkingDays = field(default_factory=NonWorkingDays.default)


@dataclass(frozen=True)
class AuthSession:
    token: str
    project_id: str
    quadrigramme: str
    expires_at: datetime


# Durée de vie d'une session, source unique : la ligne ``auth_sessions`` et le
# ``Max-Age`` du cookie en découlent tous les deux. Les déclarer séparément
# laisserait un cookie survivre à sa session — invisible, et reproduit au
# moindre redémarrage.
SESSION_DURATION = timedelta(hours=12)

SALT_BYTES = 16
TOKEN_BYTES = 32
# Déclaration puis vérification doivent hacher avec les mêmes paramètres : un
# écart entre les deux listes ferait échouer tout mot de passe existant sans
# lever la moindre erreur.
SCRYPT_N = 2**14
SCRYPT_R = 8
SCRYPT_P = 1


def _hash_password(password: str, salt: bytes | None = None) -> str:
    salt = salt or secrets.token_bytes(SALT_BYTES)
    digest = hashlib.scrypt(
        password.encode(), salt=salt, n=SCRYPT_N, r=SCRYPT_R, p=SCRYPT_P
    )
    return f"scrypt${salt.hex()}${digest.hex()}"


def _check_password(password: str, encoded: str) -> bool:
    try:
        algorithm, salt_hex, digest_hex = encoded.split("$", 2)
        if algorithm != "scrypt":
            return False
        expected = bytes.fromhex(digest_hex)
        actual = hashlib.scrypt(
            password.encode(),
            salt=bytes.fromhex(salt_hex),
            n=SCRYPT_N,
            r=SCRYPT_R,
            p=SCRYPT_P,
        )
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


BOOTSTRAP_PASSWORD_ENV = "PROTAB_DEFAULT_PROJECT_PASSWORD"


def resolve_bootstrap_password() -> str:
    """Return the password seeding the first project, or refuse to start.

    Called only when the bootstrap project is genuinely absent, so restarting an
    existing deployment does not demand a secret it will never use.

    No default is provided on purpose: a well-known fallback would create a
    project reachable by anyone who guesses the project code, which is itself
    readable without authentication via ``GET /projects``.
    """
    password = (os.getenv(BOOTSTRAP_PASSWORD_ENV) or "").strip()
    if not password:
        raise RuntimeError(
            f"{BOOTSTRAP_PASSWORD_ENV} est obligatoire au premier démarrage de "
            "l'API : aucun mot de passe par défaut n'est fourni. "
            "Renseignez-la dans .env (voir .env.example)."
        )
    return password


BOOTSTRAP_ADMIN_CODE_ENV = "PROTAB_DEFAULT_PROJECT_ADMIN_CODE"


def resolve_bootstrap_admin_code() -> str:
    """Return the quadrigramme seeding the first project's administrator.

    Same fail-closed rule as the password, and consulted at the same moment:
    a project that owns a scope accepts nobody but the quadrigrammes its scopes
    declare, so a project created without an administrator could never be
    opened again by the person who created it.
    """
    code = (os.getenv(BOOTSTRAP_ADMIN_CODE_ENV) or "").strip()
    if not code:
        raise RuntimeError(
            f"{BOOTSTRAP_ADMIN_CODE_ENV} est obligatoire au premier démarrage de "
            "l'API : aucun administrateur par défaut n'est fourni. "
            "Renseignez-le dans .env (voir .env.example)."
        )
    return code


def _normalize_code(value: str | None) -> str:
    return (value or "").strip().upper()


def _official_codes(value: str | None) -> set[str]:
    """Quadrigrammes declared by one ``officials`` column (format « A/B »).

    ``official_main`` and ``official_backup`` both hold one or more codes
    separated by ``/``, and the real data writes ``?`` as a human placeholder
    for "no backup official" (e.g. ``MRAM/ ?``). A part without any alphanumeric
    character is such a placeholder and must never become a usable login code.
    """
    if not value:
        return set()
    codes = set()
    for part in value.split("/"):
        candidate = part.strip().upper()
        if candidate and any(char.isalnum() for char in candidate):
            codes.add(candidate)
    return codes


class PostgresAuthRepository:
    """Store project credentials and opaque, expiring session tokens."""

    def __init__(
        self,
        dsn: str,
        *,
        min_size: int = POOL_MIN_SIZE,
        max_size: int = POOL_MAX_SIZE,
    ) -> None:
        self._pool = build_connection_pool(
            dsn,
            name="protab-auth",
            min_size=min_size,
            max_size=max_size,
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
                    non_working_days JSONB,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
                """
            )
            conn.execute(
                "ALTER TABLE projects ADD COLUMN IF NOT EXISTS non_working_days JSONB"
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
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS project_admins (
                    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
                    code       TEXT NOT NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    PRIMARY KEY (project_id, code)
                )
                """
            )
            already_seeded = conn.execute(
                "SELECT 1 FROM projects WHERE id = %s",
                (self.default_project_id,),
            ).fetchone()
            if already_seeded is None:
                conn.execute(
                    """
                    INSERT INTO projects (id, name, password_hash)
                    VALUES (%s, %s, %s)
                    """,
                    (
                        self.default_project_id,
                        self.default_project_name,
                        _hash_password(resolve_bootstrap_password()),
                    ),
                )
                conn.execute(
                    "INSERT INTO project_admins (project_id, code) VALUES (%s, %s)",
                    (
                        self.default_project_id,
                        OfficialCode(resolve_bootstrap_admin_code()).value,
                    ),
                )

    def close(self) -> None:
        self._pool.close()

    def list_projects(self) -> list[Project]:
        with self._pool.connection() as conn:
            rows = conn.execute(
                "SELECT id, name, non_working_days FROM projects "
                "WHERE active = TRUE ORDER BY name"
            ).fetchall()
        return [
            Project(
                id=row[0],
                name=row[1],
                non_working_days=NonWorkingDays.from_raw(row[2]),
            )
            for row in rows
        ]

    def create_project(self, project_id: str, name: str, password: str) -> Project:
        project_id = project_id.strip()
        name = name.strip()
        if not project_id or not name or not password:
            raise ValueError(
                "Le code, le nom et le mot de passe du projet sont obligatoires."
            )
        with self._pool.connection() as conn:
            try:
                conn.execute(
                    "INSERT INTO projects (id, name, password_hash) VALUES (%s, %s, %s)",
                    (project_id, name, _hash_password(password)),
                )
            except psycopg.errors.UniqueViolation as exc:
                raise ValueError(
                    f"Le projet {project_id} existe déjà. "
                    "Choisissez un autre code, ou utilisez set-password pour "
                    "changer son mot de passe."
                ) from exc
        return Project(project_id, name, NonWorkingDays.default())

    def authenticate(self, project_id: str, quadrigramme: str, password: str) -> bool:
        with self._pool.connection() as conn:
            row = conn.execute(
                "SELECT password_hash FROM projects WHERE id = %s AND active = TRUE",
                (project_id,),
            ).fetchone()
            if row is None or not _check_password(password, row[0]):
                return False

            code = _normalize_code(quadrigramme)
            is_admin = (
                conn.execute(
                    "SELECT 1 FROM project_admins WHERE project_id = %s AND code = %s",
                    (project_id, code),
                ).fetchone()
                is not None
            )
            if is_admin:
                return True

            scopes = conn.execute(
                "SELECT official_main, official_backup FROM scope_monitorings WHERE project_id = %s",
                (project_id,),
            ).fetchall()

        # Bootstrap : tant que le projet n'a aucun périmètre, l'accès reste ouvert.
        if not scopes:
            return True

        return any(
            code in _official_codes(official_main)
            or code in _official_codes(official_backup)
            for official_main, official_backup in scopes
        )

    def is_admin(self, project_id: str, quadrigramme: str) -> bool:
        """Whether a quadrigramme is an administrator of that one project.

        Normalization only, no validation: this is a lookup, and a code the
        login screen would reject is simply not an administrator.
        """
        with self._pool.connection() as conn:
            row = conn.execute(
                "SELECT 1 FROM project_admins WHERE project_id = %s AND code = %s",
                (project_id, _normalize_code(quadrigramme)),
            ).fetchone()
        return row is not None

    def add_admin(self, project_id: str, quadrigramme: str) -> bool:
        """Grant permanent access to one project. Returns False if already set.

        The code is validated because an administrator the login screen refuses
        would be a lockout dressed as a grant.
        """
        project_id = project_id.strip()
        if not project_id:
            raise ValueError("Le code du projet est obligatoire.")
        code = OfficialCode(quadrigramme).value
        with self._pool.connection() as conn:
            row = conn.execute(
                "INSERT INTO project_admins (project_id, code) VALUES (%s, %s) "
                "ON CONFLICT (project_id, code) DO NOTHING",
                (project_id, code),
            )
            return row.rowcount > 0

    def remove_admin(self, project_id: str, quadrigramme: str) -> bool:
        """Revoke permanent access and drop the sessions it had opened.

        ``authenticate()`` only runs at login, so revoking an administrator
        without closing their sessions would leave the account working for the
        remaining twelve hours.
        """
        project_id = project_id.strip()
        code = _normalize_code(quadrigramme)
        with self._pool.connection() as conn:
            row = conn.execute(
                "DELETE FROM project_admins WHERE project_id = %s AND code = %s",
                (project_id, code),
            )
            conn.execute(
                "DELETE FROM auth_sessions WHERE project_id = %s AND quadrigramme = %s",
                (project_id, code),
            )
            return row.rowcount > 0

    def list_admins(self, project_id: str) -> list[str]:
        with self._pool.connection() as conn:
            rows = conn.execute(
                "SELECT code FROM project_admins WHERE project_id = %s ORDER BY code",
                (project_id.strip(),),
            ).fetchall()
        return [row[0] for row in rows]

    def get_project(self, project_id: str) -> Project | None:
        with self._pool.connection() as conn:
            row = conn.execute(
                "SELECT id, name, non_working_days FROM projects "
                "WHERE id = %s AND active = TRUE",
                (project_id,),
            ).fetchone()
        return (
            Project(
                id=row[0],
                name=row[1],
                non_working_days=NonWorkingDays.from_raw(row[2]),
            )
            if row
            else None
        )

    def update_non_working_days(
        self,
        project_id: str,
        excluded_weekdays: list[int],
        excluded_dates: list[str],
    ) -> Project | None:
        config = NonWorkingDays.from_raw(
            {
                "excluded_weekdays": excluded_weekdays,
                "excluded_dates": excluded_dates,
            }
        )
        with self._pool.connection() as conn:
            conn.execute(
                "UPDATE projects SET non_working_days = %s "
                "WHERE id = %s AND active = TRUE",
                (Jsonb(config.to_dict()), project_id),
            )
        return self.get_project(project_id)

    def set_project_password(self, project_id: str, password: str) -> None:
        """Replace the password of an existing project and drop its sessions.

        Rotating a password is what one does because it leaked, so the sessions
        opened with the old one must stop working immediately.
        """
        project_id = project_id.strip()
        if not project_id or not password:
            raise ValueError("Le code du projet et le mot de passe sont obligatoires.")
        with self._pool.connection() as conn:
            conn.execute(
                "UPDATE projects SET password_hash = %s WHERE id = %s",
                (_hash_password(password), project_id),
            )
            conn.execute(
                "DELETE FROM auth_sessions WHERE project_id = %s", (project_id,)
            )

    def create_session(self, project_id: str, quadrigramme: str) -> AuthSession:
        token = secrets.token_urlsafe(TOKEN_BYTES)
        expires_at = datetime.now(timezone.utc) + SESSION_DURATION
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
