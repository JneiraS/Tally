"""``MonitoringSchedule`` answers one question: is this scope due on this day?

The schedule never widens the project's calendar — it only narrows it. That
ordering is the whole point of the value object: the project says which days the
team works, the scope says which of those days it is expected on, and a scope
that lists a Saturday in a Monday-to-Friday project is simply never due.

The cycle is anchored on a date rather than on the ISO week number, because a
year with 53 weeks shifts the parity of every following week number. A schedule
whose phase moves once a year is worse than no schedule at all.
"""

from datetime import date, timedelta

import pytest

from protab.domain.exceptions import InvalidScheduleError
from protab.domain.value_objects.monitoring_schedule import (
    MAX_INTERVAL_WEEKS,
    MIN_INTERVAL_WEEKS,
    MonitoringSchedule,
)
from protab.domain.value_objects.non_working_days import IsoWeekday, NonWorkingDays

MONDAY = int(IsoWeekday.MONDAY)
TUESDAY = int(IsoWeekday.TUESDAY)
WEDNESDAY = int(IsoWeekday.WEDNESDAY)
THURSDAY = int(IsoWeekday.THURSDAY)
FRIDAY = int(IsoWeekday.FRIDAY)
SATURDAY = int(IsoWeekday.SATURDAY)

MONDAY_TO_FRIDAY = NonWorkingDays.default()
EVERY_DAY = NonWorkingDays()

#: A Monday, used as the phase reference of the cycle tests.
ANCHOR = date(2026, 1, 5)


def test_an_empty_schedule_is_due_on_every_working_day():
    schedule = MonitoringSchedule()

    assert schedule.is_due(date(2026, 9, 21), MONDAY_TO_FRIDAY)  # lundi
    assert schedule.is_due(date(2026, 9, 25), MONDAY_TO_FRIDAY)  # vendredi
    assert not schedule.is_due(date(2026, 9, 26), MONDAY_TO_FRIDAY)  # samedi


def test_a_schedule_is_due_only_on_the_weekdays_it_lists():
    schedule = MonitoringSchedule(weekdays=(MONDAY, FRIDAY))

    assert schedule.is_due(date(2026, 9, 21), MONDAY_TO_FRIDAY)
    assert schedule.is_due(date(2026, 9, 25), MONDAY_TO_FRIDAY)
    assert not schedule.is_due(date(2026, 9, 22), MONDAY_TO_FRIDAY)
    assert not schedule.is_due(date(2026, 9, 23), MONDAY_TO_FRIDAY)


def test_a_schedule_never_wins_against_the_project_calendar():
    """A scope listing a day the project does not work is never due that day.

    The alternative — letting the scope force a Saturday — would give the
    instance two definitions of "working day", and the KPI denominator would
    count a day nobody could fill.
    """
    saturday_only = MonitoringSchedule(weekdays=(SATURDAY,))

    assert not saturday_only.is_due(date(2026, 9, 26), MONDAY_TO_FRIDAY)
    assert saturday_only.is_due(date(2026, 9, 26), EVERY_DAY)


def test_a_two_week_cycle_skips_every_other_week():
    schedule = MonitoringSchedule(
        weekdays=(MONDAY,), interval_weeks=2, anchor_date=ANCHOR
    )

    assert schedule.is_due(ANCHOR, MONDAY_TO_FRIDAY)
    assert not schedule.is_due(ANCHOR + timedelta(days=7), MONDAY_TO_FRIDAY)
    assert schedule.is_due(ANCHOR + timedelta(days=14), MONDAY_TO_FRIDAY)
    assert not schedule.is_due(ANCHOR + timedelta(days=21), MONDAY_TO_FRIDAY)


def test_the_cycle_phase_survives_a_fifty_three_week_year():
    """The phase is counted from the anchor, never from the ISO week number.

    2026 is a 53-week year: 2026-12-28 is W53 and 2027-01-04 is W01, so a rule
    of ``week % 2`` would declare two consecutive weeks off — a three-week gap
    instead of two. Counting weeks from the anchor keeps the cadence.
    """
    schedule = MonitoringSchedule(
        weekdays=(MONDAY,), interval_weeks=2, anchor_date=ANCHOR
    )

    assert not schedule.is_due(date(2026, 12, 28), MONDAY_TO_FRIDAY)
    assert schedule.is_due(date(2027, 1, 4), MONDAY_TO_FRIDAY)


def test_the_anchor_is_normalised_to_its_monday():
    """A Wednesday anchor describes the same cycle as its own Monday."""
    wednesday = date(2026, 1, 7)
    from_wednesday = MonitoringSchedule(
        weekdays=(MONDAY,), interval_weeks=2, anchor_date=wednesday
    )
    from_monday = MonitoringSchedule(
        weekdays=(MONDAY,), interval_weeks=2, anchor_date=ANCHOR
    )

    for offset in range(0, 29):
        day = ANCHOR + timedelta(days=offset)
        assert from_wednesday.is_due(day, MONDAY_TO_FRIDAY) == from_monday.is_due(
            day, MONDAY_TO_FRIDAY
        )


def test_the_cycle_runs_backwards_too():
    """The anchor is a phase reference, not a start date.

    A date before the anchor still follows the cadence, so changing the
    reference never leaves a hole in the coverage of a past period.
    """
    schedule = MonitoringSchedule(
        weekdays=(MONDAY,), interval_weeks=2, anchor_date=ANCHOR
    )

    assert schedule.is_due(ANCHOR - timedelta(days=14), MONDAY_TO_FRIDAY)
    assert not schedule.is_due(ANCHOR - timedelta(days=7), MONDAY_TO_FRIDAY)


def test_the_weekdays_are_sorted_and_deduplicated():
    schedule = MonitoringSchedule(weekdays=(FRIDAY, MONDAY, FRIDAY))

    assert schedule.weekdays == (MONDAY, FRIDAY)


@pytest.mark.parametrize("weekday", [0, 8, -1])
def test_a_weekday_outside_the_iso_scale_is_refused(weekday):
    with pytest.raises(InvalidScheduleError):
        MonitoringSchedule(weekdays=(weekday,))


@pytest.mark.parametrize("interval", [0, -1, MAX_INTERVAL_WEEKS + 1])
def test_an_interval_outside_the_bounds_is_refused(interval):
    with pytest.raises(InvalidScheduleError):
        MonitoringSchedule(interval_weeks=interval)


def test_the_interval_bounds_are_the_declared_ones():
    assert MIN_INTERVAL_WEEKS == 1
    MonitoringSchedule(interval_weeks=MAX_INTERVAL_WEEKS)


def test_a_schedule_with_no_working_day_is_detected_before_it_is_stored():
    """``has_any_due_day`` is a bounded proof, not a search.

    The pattern is periodic, so one cycle is enough: if no day of the cycle is
    due, none ever will be. Without that bound, a schedule that can never be due
    would be discovered by walking dates — the same freeze the calendar guard of
    §28.1 already refuses.
    """
    saturday_only = MonitoringSchedule(weekdays=(SATURDAY,))
    monday_only = MonitoringSchedule(weekdays=(MONDAY,))

    assert not saturday_only.has_any_due_day(MONDAY_TO_FRIDAY)
    assert monday_only.has_any_due_day(MONDAY_TO_FRIDAY)


def test_a_cycle_with_no_working_day_is_detected_too():
    # Tuesday and Thursday, every other week, in a project that only works
    # Monday and Wednesday: no week of the cycle can ever be due.
    calendar = NonWorkingDays(
        excluded_weekdays=(
            TUESDAY,
            THURSDAY,
            FRIDAY,
            SATURDAY,
            int(IsoWeekday.SUNDAY),
        )
    )
    schedule = MonitoringSchedule(
        weekdays=(TUESDAY, THURSDAY),
        interval_weeks=2,
        anchor_date=ANCHOR,
    )

    assert not schedule.has_any_due_day(calendar)


def test_the_schedule_round_trips_through_its_stored_shape():
    schedule = MonitoringSchedule(
        weekdays=(MONDAY, FRIDAY), interval_weeks=2, anchor_date=ANCHOR
    )

    assert MonitoringSchedule.from_raw(schedule.to_dict()) == schedule


def test_a_null_column_reads_as_every_working_day():
    assert MonitoringSchedule.from_raw(None) == MonitoringSchedule()


def test_an_unreadable_column_reads_as_every_working_day():
    """One degenerate row must not empty the list of scopes (§28.1).

    The safe fallback is "every working day", never "never due": the second
    would silently remove the scope from the backlog and from the coverage
    denominator.
    """
    assert MonitoringSchedule.from_raw("nope") == MonitoringSchedule()
    assert MonitoringSchedule.from_raw({"weekdays": ["nope"]}) == MonitoringSchedule()
    assert MonitoringSchedule.from_raw({"interval_weeks": "nope"}) == MonitoringSchedule()
    assert MonitoringSchedule.from_raw({"interval_weeks": 99}) == MonitoringSchedule()


def test_an_empty_weekday_list_in_the_column_means_every_working_day():
    assert MonitoringSchedule.from_raw({"weekdays": [], "interval_weeks": 2}) == (
        MonitoringSchedule(interval_weeks=2)
    )


def test_an_unreadable_anchor_keeps_the_rest_of_the_schedule():
    schedule = MonitoringSchedule.from_raw(
        {"weekdays": [MONDAY], "interval_weeks": 2, "anchor_date": "not-a-date"}
    )

    assert schedule.weekdays == (MONDAY,)
    assert schedule.interval_weeks == 2
    assert schedule.anchor_date is None


def test_the_stored_shape_is_plain_json():
    schedule = MonitoringSchedule(
        weekdays=(MONDAY,), interval_weeks=2, anchor_date=ANCHOR
    )

    assert schedule.to_dict() == {
        "weekdays": [MONDAY],
        "interval_weeks": 2,
        "anchor_date": "2026-01-05",
    }
