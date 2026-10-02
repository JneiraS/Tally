"""``save`` must refuse what the SQL adapter refuses.

Both adapters implement ``ScopeMonitoringRepository`` and are therefore
interchangeable (AGENTS.md §11). A silent overwrite here would let a use case
erase a scope under test while the very same code raises against PostgreSQL, so
the refusals are pinned without a database.
"""

import pytest

from protab.adapters.outbound.persistence.in_memory_scope_monitoring_repository import (
    InMemoryScopeMonitoringRepository,
)
from protab.domain.entities.scope_monitoring import (
    KnowledgeBase,
    Officials,
    ScopeMonitoring,
)
from protab.domain.exceptions import (
    ScopeMonitoringAlreadyExistsError,
    ScopeMonitoringNameAlreadyExistsError,
)


def make_scope(
    scope_id: str = "scope-1",
    name: str = "Scope A",
) -> ScopeMonitoring:
    return ScopeMonitoring(
        id=scope_id,
        name=name,
        knowledge=KnowledgeBase(id="KB-00000001"),
        officials=Officials(main="Main", backup="Backup"),
        billing_code="FACT-2026-PAI",
    )


def test_save_stores_a_new_scope():
    repo = InMemoryScopeMonitoringRepository()
    scope = make_scope()

    repo.save(scope)

    assert repo.find_by_id("scope-1") is scope
    assert repo.find_by_name("Scope A") is scope


def test_save_refuses_an_id_already_stored():
    repo = InMemoryScopeMonitoringRepository()
    repo.save(make_scope())

    with pytest.raises(ScopeMonitoringAlreadyExistsError):
        repo.save(make_scope(name="Scope B"))


def test_save_refuses_a_name_already_stored():
    repo = InMemoryScopeMonitoringRepository()
    repo.save(make_scope())

    with pytest.raises(ScopeMonitoringNameAlreadyExistsError):
        repo.save(make_scope(scope_id="scope-2"))


def test_a_refused_save_leaves_the_stored_scope_untouched():
    # The name index must not gain the rejected scope either, or a later
    # ``find_by_name`` would return a row that was never stored.
    repo = InMemoryScopeMonitoringRepository()
    stored = make_scope()
    repo.save(stored)

    with pytest.raises(ScopeMonitoringAlreadyExistsError):
        repo.save(make_scope(name="Scope B"))

    assert repo.find_by_id("scope-1") is stored
    assert repo.find_by_name("Scope A") is stored
    assert repo.find_by_name("Scope B") is None