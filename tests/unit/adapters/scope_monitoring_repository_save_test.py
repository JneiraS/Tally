"""``save`` must refuse what the SQL adapter refuses.

Both adapters implement ``ScopeMonitoringRepository`` and are therefore
interchangeable (AGENTS.md §11). A silent overwrite here would let a use case
erase a scope under test while the very same code raises against PostgreSQL, so
the refusals are pinned without a database.
"""

from datetime import date

import pytest

from protab.adapters.outbound.persistence.in_memory_scope_monitoring_repository import (
    InMemoryScopeMonitoringRepository,
)
from protab.domain.entities.day_status import DayStatus
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

def test_set_activities_status_refuses_an_empty_day_list():
    """Same refusal as the SQL adapter, or the two are not interchangeable.

    An empty list reaches the SQL as a statement that touches no row, so
    ``rowcount == 0`` would come back and be reported as a missing *scope* — a
    wrong cause. The adapter refuses it explicitly instead, and this pins that
    the in-memory one does the same rather than silently doing nothing.
    """
    repo = InMemoryScopeMonitoringRepository()
    repo.save(make_scope())

    with pytest.raises(ValueError):
        repo.set_activities_status("scope-1", [], DayStatus.KO)


def test_set_activities_status_creates_the_day_a_ko_reports():
    """Reporting a blocked day is what makes the status usable at all.

    Nobody could enter anything, so requiring a row first would leave the feature
    with no reachable path. Both adapters create the day at zeroed counters.
    """
    repo = InMemoryScopeMonitoringRepository()
    repo.save(make_scope())

    repo.set_activities_status(
        "scope-1", [date(2026, 9, 19)], DayStatus.KO, ko_reason="Collecteur HS"
    )

    activity = repo.find_by_id("scope-1").daily_activity_for(date(2026, 9, 19))
    assert activity.status is DayStatus.KO
    assert activity.ko_reason == "Collecteur HS"
    assert (activity.errors_reported, activity.incidents_created) == (0, 0)
