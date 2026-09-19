import pytest

from protab.adapters.inbound.api.config import (
    InvalidPortError,
    resolve_host_port,
)


def test_defaults():
    assert resolve_host_port(None, None) == ("0.0.0.0", 8000)


def test_uses_environment_when_provided():
    assert resolve_host_port("127.0.0.1", "9000") == ("127.0.0.1", 9000)


def test_invalid_port_raises():
    with pytest.raises(InvalidPortError):
        resolve_host_port(None, "not-a-number")