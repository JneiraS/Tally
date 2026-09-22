"""Shared PostgreSQL connection-pool configuration for persistence adapters."""

import psycopg
from psycopg_pool import ConnectionPool

POOL_MIN_SIZE = 2
POOL_MAX_SIZE = 10
POOL_TIMEOUT = 30.0
POOL_MAX_LIFETIME = 1800.0
POOL_MAX_IDLE = 600.0
CONNECT_TIMEOUT = 5


def ping_check(conn: psycopg.Connection) -> None:
    """Check connectivity and leave the connection outside a transaction."""
    try:
        conn.execute("SELECT 1")
    except Exception:
        try:
            conn.rollback()
        except Exception:
            pass
        raise
    conn.rollback()


def build_connection_pool(
    dsn: str,
    *,
    name: str,
    min_size: int = POOL_MIN_SIZE,
    max_size: int = POOL_MAX_SIZE,
) -> ConnectionPool:
    """Build a tuned, initially closed synchronous PostgreSQL pool."""
    return ConnectionPool(
        dsn,
        name=name,
        min_size=min_size,
        max_size=max_size,
        open=False,
        timeout=POOL_TIMEOUT,
        max_lifetime=POOL_MAX_LIFETIME,
        max_idle=POOL_MAX_IDLE,
        check=ping_check,
        kwargs={
            "autocommit": False,
            "connect_timeout": CONNECT_TIMEOUT,
            "application_name": name,
        },
    )
