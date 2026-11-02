"""``NonWorkingDays`` is the project's working calendar.

A row of ``projects.non_working_days`` is untyped JSONB, so rehydration has to
be lenient: an unreadable entry is dropped, never raised on, because one
historical row must not empty the calendar of every project on the instance.
"""

import dataclasses
from datetime import date

import pytest

from protab.domain.value_objects.non_working_days import (
    DEFAULT_EXCLUDED_WEEKDAYS,
    ISO_WEEKDAY_COUNT,
    MAX_ISO_WEEKDAY,
    MIN_ISO_WEEKDAY,
    IsoWeekday,
    NonWorkingDays,
)


def test_the_iso_scale_runs_from_monday_to_sunday():
    assert MIN_ISO_WEEKDAY == 1
    assert MAX_ISO_WEEKDAY == 7
    assert [day.value for day in IsoWeekday] == [1, 2, 3, 4, 5, 6, 7]
    assert MIN_ISO_WEEKDAY == IsoWeekday.MONDAY
    assert MAX_ISO_WEEKDAY == IsoWeekday.SUNDAY
    assert ISO_WEEKDAY_COUNT == len(IsoWeekday)


def test_the_default_excludes_the_week_end_only():
    assert DEFAULT_EXCLUDED_WEEKDAYS == (IsoWeekday.SATURDAY, IsoWeekday.SUNDAY)
    assert NonWorkingDays.default().excluded_weekdays == (6, 7)
    assert NonWorkingDays.default().excluded_dates == ()


def test_an_empty_calendar_is_not_the_default_one():
    """Unticking every day in the modal is a legitimate configuration: it makes
    every day a working day, and must stay distinguishable from the weekend."""
    assert NonWorkingDays().excluded_weekdays == ()


def test_a_missing_column_reads_as_the_default():
    """A project created before the column existed, or hand-edited to NULL, must
    still behave as a Monday-to-Friday project."""
    assert NonWorkingDays.from_raw(None) == NonWorkingDays.default()


def test_a_non_object_column_reads_as_the_default():
    assert NonWorkingDays.from_raw("2026-09-21") == NonWorkingDays.default()
    assert NonWorkingDays.from_raw([6, 7]) == NonWorkingDays.default()
    assert NonWorkingDays.from_raw(42) == NonWorkingDays.default()


def test_weekdays_outside_the_iso_scale_are_dropped():
    """The frontend sends ISO numbers only; a hand-edited row may hold 0 or 8."""
    assert NonWorkingDays.from_raw(
        {"excluded_weekdays": [0, 8, 6, 7]}
    ).excluded_weekdays == (6, 7)


def test_weekdays_are_sorted_and_deduplicated():
    assert NonWorkingDays.from_raw(
        {"excluded_weekdays": [7, 5, 7, 3]}
    ).excluded_weekdays == (3, 5, 7)


def test_a_numeric_string_is_accepted():
    """JSONB round-trips happily through strings when a row is edited by hand."""
    assert NonWorkingDays.from_raw(
        {"excluded_weekdays": ["6"]}
    ).excluded_weekdays == (6,)


def test_a_non_numeric_entry_is_dropped_rather_than_raising():
    """``str.isdigit`` accepts "²" while ``int("²")`` raises: the naive guard
    turned a junk character into a 500 on every project listing."""
    assert NonWorkingDays.from_raw(
        {"excluded_weekdays": ["²", "x", None, 6]}
    ).excluded_weekdays == (6,)


def test_a_fully_unreadable_weekday_list_reads_as_the_default():
    """A list that was there and lost every entry is corruption, not a choice:
    an empty one would claim « every day is a working day » and count week-ends
    into the coverage KPI of every project on the instance."""
    assert NonWorkingDays.from_raw(
        {"excluded_weekdays": ["nope", 0, 99]}
    ) == NonWorkingDays.default()


def test_an_explicitly_empty_weekday_list_is_respected():
    """Unticking every box in the modal stores ``[]``; that is the legitimate
    opposite of the default and must not be read back as a weekend project."""
    assert NonWorkingDays.from_raw(
        {"excluded_weekdays": [], "excluded_dates": []}
    ) == NonWorkingDays()


def test_a_calendar_without_any_working_day_reads_as_the_default():
    """Every day excluded leaves nothing to open, nothing to type into and
    nothing to chart: the front would search a working day until ``Date`` itself
    gave up. The API refuses to store such a calendar, so reaching this means a
    row written elsewhere — repair it on read rather than hand the UI a trap."""
    assert NonWorkingDays.from_raw(
        {"excluded_weekdays": [1, 2, 3, 4, 5, 6, 7]}
    ) == NonWorkingDays.default()


def test_a_weekday_list_covering_the_whole_week_reads_as_the_default():
    """Order and duplicates must not hide the fault."""
    assert NonWorkingDays.from_raw(
        {"excluded_weekdays": [7, 3, 5, 1, 6, 2, 4, 3]}
    ) == NonWorkingDays.default()


def test_dates_are_sorted_deduplicated_and_compacted_of_blanks():
    assert NonWorkingDays.from_raw(
        {"excluded_dates": ["2026-12-25", "", None, "2026-01-01", "2026-12-25"]}
    ).excluded_dates == ("2026-01-01", "2026-12-25")


def test_missing_keys_read_as_empty_lists():
    assert NonWorkingDays.from_raw({}) == NonWorkingDays()
    assert NonWorkingDays.from_raw({"excluded_weekdays": [6]}).excluded_dates == ()


def test_a_value_object_built_from_another_one_is_a_no_op():
    """``update_non_working_days`` normalizes, writes, then re-reads the row: the
    round trip through JSON must not shift the stored configuration."""
    once = NonWorkingDays.from_raw({"excluded_weekdays": [7, 5], "excluded_dates": ["2026-12-25"]})

    assert NonWorkingDays.from_raw(once.to_dict()) == once


def test_to_dict_keeps_the_json_contract_of_the_column():
    config = NonWorkingDays.from_raw({"excluded_weekdays": [6, 7]})

    assert config.to_dict() == {
        "excluded_weekdays": [6, 7],
        "excluded_dates": [],
    }


def test_two_defaults_share_no_mutable_state():
    """The regression this value object exists for: a shallow ``dict.copy()``
    handed every project the very same weekday list, so one mutation anywhere
    would silently rewrite the default of the whole process."""
    first = NonWorkingDays.default().to_dict()
    second = NonWorkingDays.default().to_dict()

    first["excluded_weekdays"].append(1)

    assert second["excluded_weekdays"] == [6, 7]
    assert NonWorkingDays.default().to_dict()["excluded_weekdays"] == [6, 7]


def test_the_value_object_is_immutable():
    with pytest.raises(dataclasses.FrozenInstanceError):
        NonWorkingDays.default().excluded_weekdays = (1,)

def test_a_weekday_of_the_default_calendar_is_a_working_day():
    assert NonWorkingDays.default().is_working_day(date(2026, 9, 21))  # lundi
    assert NonWorkingDays.default().is_working_day(date(2026, 9, 25))  # vendredi


def test_the_default_calendar_closes_the_week_end():
    assert not NonWorkingDays.default().is_working_day(date(2026, 9, 26))  # samedi
    # dimanche : c'est l'entrée 7 de l'échelle ISO, pas l'index 0 de `getDay()`.
    assert not NonWorkingDays.default().is_working_day(date(2026, 9, 27))


def test_a_one_off_excluded_date_is_not_a_working_day():
    calendar = NonWorkingDays(excluded_dates=("2026-12-25",))

    assert not calendar.is_working_day(date(2026, 12, 25))
    assert calendar.is_working_day(date(2026, 12, 24))


def test_an_empty_calendar_opens_every_day():
    """``NonWorkingDays()`` is a choice, not a default: every day is worked."""
    assert NonWorkingDays().is_working_day(date(2026, 9, 26))  # samedi
    assert NonWorkingDays().is_working_day(date(2026, 9, 27))  # dimanche
