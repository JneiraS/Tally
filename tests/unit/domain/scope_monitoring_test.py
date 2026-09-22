from datetime import date

import pytest

from protab.domain.entities.daily_activity import DailyActivity
from protab.domain.entities.scope_monitoring import (
    KnowledgeBase,
    Officials,
    ScopeMonitoring,
)
from protab.domain.exceptions import (
    DuplicateDailyActivityError,
    EmptyOfficialsError,
    InvalidKnowledgeBaseIdError,
    InvalidScopeMonitoringIdError,
)


@pytest.fixture
def fixture_scope_monitoring():
    knowledge_base = KnowledgeBase(id="Test Knowledge")
    officials = Officials(main="Official", backup="Secondary Official")
    monitoring = ScopeMonitoring(
        id="scope-001",
        name="Test Monitoring",
        knowledge=knowledge_base,
        officials=officials,
    )
    return monitoring


def test_scope_monitoring_creation(fixture_scope_monitoring):
    monitoring = fixture_scope_monitoring
    assert monitoring.id == "scope-001"
    assert monitoring.name == "Test Monitoring"
    assert isinstance(monitoring.knowledge.id, str)
    assert monitoring.officials.main == "Official"
    assert monitoring.officials.backup == "Secondary Official"


def test_scope_monitoring_empty_id():
    with pytest.raises(InvalidScopeMonitoringIdError):
        ScopeMonitoring(
            id="",
            name="Test",
            knowledge=KnowledgeBase(id="Test Knowledge"),
            officials=Officials(main="Main", backup="Backup"),
        )
    with pytest.raises(InvalidScopeMonitoringIdError):
        ScopeMonitoring(
            id="   ",
            name="Test",
            knowledge=KnowledgeBase(id="Test Knowledge"),
            officials=Officials(main="Main", backup="Backup"),
        )


# test pour les exceptions
def test_knowledge_base_id_length():
    with pytest.raises(InvalidKnowledgeBaseIdError) as excinfo:
        KnowledgeBase(id="short")
    assert "KnowledgeBase id must be at least 10 characters long." in str(excinfo.value)


def test_knowledge_base_id_valid_boundary():
    # exactly 10 chars should pass
    kb = KnowledgeBase(id="a" * 10)
    assert kb.id == "a" * 10


def test_officials_empty_main():
    with pytest.raises(EmptyOfficialsError) as excinfo:
        Officials(main="", backup="Backup")
    assert "Both main and backup officials must be provided." in str(excinfo.value)


def test_officials_empty_backup():
    with pytest.raises(EmptyOfficialsError) as excinfo:
        Officials(main="Main", backup="")
    assert "Both main and backup officials must be provided." in str(excinfo.value)


def test_officials_blank_strings_rejected():
    # whitespace-only strings should be treated as empty
    with pytest.raises(EmptyOfficialsError):
        Officials(main=" ", backup="Backup")
    with pytest.raises(EmptyOfficialsError):
        Officials(main="Main", backup=" ")


# tests pour DailyActivity et ScopeMonitoring
def test_scope_monitoring_add_daily_activity(fixture_scope_monitoring):
    """Adding a DailyActivity for a new day should succeed."""
    monitoring = fixture_scope_monitoring
    activity = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=2,
        incidents_created=1,
        feai=["INC000000001"],
    )
    monitoring.add_daily_activity(activity)
    assert monitoring.daily_activity_for(date(2026, 9, 19)) is activity


def test_scope_monitoring_rejects_duplicate_day(fixture_scope_monitoring):
    """Adding a second DailyActivity for the same day should raise DuplicateDailyActivityError."""
    monitoring = fixture_scope_monitoring
    activity = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=1,
        incidents_created=0,
        feai=["INC000000001"],
    )
    monitoring.add_daily_activity(activity)
    activity2 = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=1,
        incidents_created=0,
        feai=["INC000000002"],
    )
    with pytest.raises(DuplicateDailyActivityError):
        monitoring.add_daily_activity(activity2)


def test_scope_monitoring_multiple_activities_different_days(fixture_scope_monitoring):
    """Multiple DailyActivities for different days should be allowed."""
    monitoring = fixture_scope_monitoring
    activity1 = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=2,
        incidents_created=1,
        feai=["INC000000001"],
    )
    activity2 = DailyActivity(
        day=date(2026, 9, 20),
        errors_reported=3,
        incidents_created=1,
        feai=["INC000000002"],
    )
    monitoring.add_daily_activity(activity1)
    monitoring.add_daily_activity(activity2)
    assert monitoring.daily_activity_for(date(2026, 9, 19)) is activity1
    assert monitoring.daily_activity_for(date(2026, 9, 20)) is activity2


def test_scope_monitoring_multiple_activities_same_day_different_monitorings(
    fixture_scope_monitoring,
):
    """Different ScopeMonitoring instances can have activities on the same day."""
    monitoring = fixture_scope_monitoring
    # Create a second monitoring (minimal)
    kb = KnowledgeBase(id="Other Knowledge")
    officials = Officials(main="Other", backup="Backup")
    monitoring2 = ScopeMonitoring(
        id="scope-002",
        name="Other Monitoring",
        knowledge=kb,
        officials=officials,
    )
    activity = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=1,
        incidents_created=0,
        feai=["INC000000001"],
    )
    activity2 = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=2,
        incidents_created=1,
        feai=["INC000000002"],
    )
    monitoring.add_daily_activity(activity2)
    monitoring2.add_daily_activity(activity)
    # Both monitorings should have their own activity for that same day
    assert monitoring.daily_activity_for(date(2026, 9, 19)) is activity2
    assert monitoring2.daily_activity_for(date(2026, 9, 19)) is activity
