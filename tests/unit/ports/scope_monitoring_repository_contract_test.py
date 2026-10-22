"""Every implementation must offer every method the port declares.

Nothing in this repository checks that the adapters match
``ScopeMonitoringRepository``: the annotations are documentation, not a
contract the test suite enforces, and a method added to the port yesterday
would only surface as an ``AttributeError`` in the adapter that was forgotten —
in production, on the first write.

The check is a subset on purpose. ``PostgresScopeMonitoringRepository`` owns
``connect`` and ``close``, which are its own business and belong to no port, so
equality would be wrong. What must hold is the other direction: nothing the
application may call is missing.

The classes are introspected, never instantiated: the pool of the PostgreSQL
adapter would demand a DSN, and this guarantee has nothing to do with data.
"""

import inspect

import pytest

from protab.adapters.outbound.persistence.in_memory_scope_monitoring_repository import (
    InMemoryScopeMonitoringRepository,
)
from protab.adapters.outbound.persistence.postgres_scope_monitoring_repository import (
    PostgresScopeMonitoringRepository,
)
from protab.ports.outbound.scope_monitoring_repository import ScopeMonitoringRepository

from tests.unit.application.recording_repository import (
    RecordingScopeMonitoringRepository,
)

IMPLEMENTATIONS = [
    InMemoryScopeMonitoringRepository,
    PostgresScopeMonitoringRepository,
    RecordingScopeMonitoringRepository,
]


def port_methods() -> set[str]:
    return {
        name
        for name, member in vars(ScopeMonitoringRepository).items()
        if not name.startswith("_") and callable(member)
    }


def test_the_port_declares_the_methods_the_application_calls():
    # Guards the subset below from silently degrading into an empty check if
    # the Protocol is ever emptied or renamed.
    assert port_methods() >= {
        "save",
        "insert_daily_activity",
        "update_daily_activity",
        "set_activities_status",
        "update_note",
        "update_officials",
        "find_by_id",
        "find_by_name",
        "find_all",
        "find_all_scope_names",
    }


@pytest.mark.parametrize("implementation", IMPLEMENTATIONS, ids=lambda cls: cls.__name__)
def test_implementation_offers_every_port_method(implementation):
    missing = port_methods() - {
        name for name in dir(implementation) if not name.startswith("_")
    }

    assert not missing, f"{implementation.__name__} is missing {sorted(missing)}"


@pytest.mark.parametrize("implementation", IMPLEMENTATIONS, ids=lambda cls: cls.__name__)
def test_port_methods_keep_their_signature(implementation):
    # A decorator that drops a parameter or reorders the days is substitutable
    # in name only; the call itself would fail at run time.
    for name in port_methods():
        member = getattr(implementation, name, None)
        assert member is not None, f"{implementation.__name__} is missing {name}"
        expected = inspect.signature(getattr(ScopeMonitoringRepository, name))
        actual = inspect.signature(member)
        assert list(actual.parameters) == list(expected.parameters), (
            f"{implementation.__name__}.{name} takes "
            f"{list(actual.parameters)}, the port declares {list(expected.parameters)}"
        )