import pytest
from datetime import date

from protab.domain.entities.daily_activity import DailyActivity
from protab.domain.exceptions import (
    NegativeErrorsCountError,
    NegativeIncidentsCountError,
    IncidentsExceedErrorsError,
    InvalidFeaiReferenceError,
    DuplicateFeaiReferenceError,
)


def test_daily_activity_creation_valid():
    activity = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=3,
        incidents_created=1,
        feai=["INC0000001", "INC0000002"],
    )
    assert activity.day == date(2026, 9, 19)
    assert activity.errors_reported == 3
    assert activity.incidents_created == 1
    assert activity.feai == ["INC0000001", "INC0000002"]
    assert activity.handled is False
    assert activity.completed is False


def test_daily_activity_errors_reported_negative():
    with pytest.raises(NegativeErrorsCountError):
        DailyActivity(
            day=date(2026, 9, 19),
            errors_reported=-1,
            incidents_created=0,
            feai=[],
        )


def test_daily_activity_incidents_created_negative():
    with pytest.raises(NegativeIncidentsCountError):
        DailyActivity(
            day=date(2026, 9, 19),
            errors_reported=0,
            incidents_created=-1,
            feai=[],
        )


def test_daily_activity_incidents_exceed_errors():
    with pytest.raises(IncidentsExceedErrorsError):
        DailyActivity(
            day=date(2026, 9, 19),
            errors_reported=2,
            incidents_created=3,
            feai=["INC0000001"],
        )


def test_daily_activity_valid_feai_accepted():
    activity = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=2,
        incidents_created=1,
        feai=["INC0000001", "INC1234567"],
    )
    assert activity.feai == ["INC0000001", "INC1234567"]


def test_daily_activity_invalid_feai_format():
    with pytest.raises(InvalidFeaiReferenceError):
        DailyActivity(
            day=date(2026, 9, 19),
            errors_reported=1,
            incidents_created=0,
            feai=["INVALID"],
        )


def test_daily_activity_duplicate_feai_rejected():
    with pytest.raises(DuplicateFeaiReferenceError):
        DailyActivity(
            day=date(2026, 9, 19),
            errors_reported=1,
            incidents_created=0,
            feai=["INC0000001", "INC0000001"],
        )


def test_daily_activity_mark_handled():
    activity = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=0,
        incidents_created=0,
        feai=[],
    )
    activity.mark_handled()
    assert activity.handled is True
    # Calling again should be idempotent (still True)
    activity.mark_handled()
    assert activity.handled is True


def test_daily_activity_mark_completed():
    activity = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=0,
        incidents_created=0,
        feai=[],
    )
    activity.mark_completed()
    assert activity.completed is True
    assert activity.handled is True  # completed implies handled

    # Calling mark_completed again should be idempotent
    activity.mark_completed()
    assert activity.completed is True
    assert activity.handled is True