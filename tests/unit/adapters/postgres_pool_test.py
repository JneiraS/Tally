from protab.adapters.outbound.persistence.postgres_pool import (
    CONNECT_TIMEOUT,
    POOL_MAX_IDLE,
    POOL_MAX_LIFETIME,
    POOL_MAX_SIZE,
    POOL_MIN_SIZE,
    POOL_TIMEOUT,
    build_connection_pool,
    ping_check,
)


def test_build_connection_pool_uses_tuned_configuration():
    pool = build_connection_pool("postgresql://unused", name="protab-test")

    assert pool.name == "protab-test"
    assert pool.min_size == POOL_MIN_SIZE
    assert pool.max_size == POOL_MAX_SIZE
    assert pool.timeout == POOL_TIMEOUT
    assert pool.max_lifetime == POOL_MAX_LIFETIME
    assert pool.max_idle == POOL_MAX_IDLE
    assert pool._check is ping_check
    assert pool.kwargs == {
        "autocommit": False,
        "connect_timeout": CONNECT_TIMEOUT,
        "application_name": "protab-test",
    }

    pool.close()
