import pytest

from protab.adapters.inbound.api.config import (
    InvalidPortError,
    cookie_secure_from_env,
    resolve_host_port,
)


def test_defaults():
    assert resolve_host_port(None, None) == ("0.0.0.0", 8000)


def test_uses_environment_when_provided():
    assert resolve_host_port("127.0.0.1", "9000") == ("127.0.0.1", 9000)


def test_invalid_port_raises():
    with pytest.raises(InvalidPortError):
        resolve_host_port(None, "not-a-number")


def test_cookie_secure_defaults_to_false_for_local_http():
    assert cookie_secure_from_env(None) is False


@pytest.mark.parametrize("value", ["1", "true", "True", "TRUE", "yes"])
def test_cookie_secure_truthy_values(value):
    assert cookie_secure_from_env(value) is True


@pytest.mark.parametrize("value", ["0", "false", "", "no", "off"])
def test_cookie_secure_falsy_values(value):
    assert cookie_secure_from_env(value) is False