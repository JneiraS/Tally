import os

from dotenv import load_dotenv

load_dotenv()

DEFAULT_HOST = "0.0.0.0"
DEFAULT_PORT = 8000


class InvalidPortError(Exception):
    pass


def resolve_host_port(
    host_env: str | None = None,
    port_env: str | None = None,
) -> tuple[str, int]:
    """Resolve host/port from env values, falling back to defaults."""
    host = host_env if host_env else DEFAULT_HOST

    raw_port = port_env if port_env else str(DEFAULT_PORT)
    try:
        port = int(raw_port)
    except ValueError:
        raise InvalidPortError(f"Invalid PORT value: {raw_port!r}.")

    return host, port


def host_port_from_env() -> tuple[str, int]:
    return resolve_host_port(
        host_env=os.getenv("PROTAB_HOST"),
        port_env=os.getenv("PROTAB_PORT"),
    )


def database_url_from_env() -> str | None:
    """Return the PostgreSQL DSN from DATABASE_URL, or None when unset.

    None selects the in-memory repository (default for tests/demo).
    """
    value = os.getenv("DATABASE_URL")
    return value.strip() if value and value.strip() else None