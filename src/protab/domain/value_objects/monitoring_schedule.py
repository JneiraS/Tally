"""A scope's own cadence: which working days it is expected on.

The project's :class:`NonWorkingDays` says which days the team works; this value
object says which of those days a given scope is due on. It therefore *narrows*
the calendar and never widens it: a scope listing a Saturday in a
Monday-to-Friday project is simply never due, rather than forcing work on a day
nobody works. Two definitions of "working day" would contradict each other in the
coverage denominator.

Why not a cron expression: cron has no "every other week" field, it combines
day-of-month and day-of-week with an *or* when both are restricted, and it has no
phase reference — "every other week" is undefined without one. The three fields
below express the same need with no parser and no grammar.

The cycle is counted from an anchor date, never from the ISO week number: a
53-week year shifts the parity of every following week number, so a rule of
``week % 2`` would move the phase once a year.
"""

from dataclasses import dataclass
from datetime import date, timedelta

from protab.domain.exceptions import InvalidScheduleError
from protab.domain.value_objects.non_working_days import (
    ISO_WEEKDAY_COUNT,
    MAX_ISO_WEEKDAY,
    MIN_ISO_WEEKDAY,
    NonWorkingDays,
    is_iso_weekday,
)

MIN_INTERVAL_WEEKS: int = 1
#: A quarter. Bounds the "is this schedule ever due?" proof to 84 iterations and
#: keeps the cadence readable: beyond that, the cycle is longer than the memory
#: of the people following it.
MAX_INTERVAL_WEEKS: int = 12

#: Monday of the week that contains 1970-01-01, used when no anchor is stored.
#: It is a phase reference only, so any Monday would do — but it must be fixed,
#: or a schedule without an anchor would change phase between two reads.
_DEFAULT_ANCHOR: date = date(1970, 1, 5)


@dataclass(frozen=True)
class MonitoringSchedule:
    """The days a scope is expected on.

    ``weekdays`` empty means "every working day of the project", which is the
    behaviour of every scope created before this value object existed — the
    default therefore reads the past correctly and never marks a scope as never
    due.

    ``anchor_date`` is a *phase reference*, not a start date: the cadence also
    applies to the dates before it, so changing the reference never leaves a hole
    in the coverage of a past period.
    """

    weekdays: tuple[int, ...] = ()
    interval_weeks: int = MIN_INTERVAL_WEEKS
    anchor_date: date | None = None

    def __post_init__(self) -> None:
        weekdays = tuple(sorted({int(day) for day in self.weekdays}))
        for weekday in weekdays:
            if not MIN_ISO_WEEKDAY <= weekday <= MAX_ISO_WEEKDAY:
                raise InvalidScheduleError(
                    f"Un jour de la semaine doit être compris entre "
                    f"{MIN_ISO_WEEKDAY} et {MAX_ISO_WEEKDAY} ; reçu {weekday}."
                )
        if not MIN_INTERVAL_WEEKS <= self.interval_weeks <= MAX_INTERVAL_WEEKS:
            raise InvalidScheduleError(
                f"La périodicité doit être comprise entre {MIN_INTERVAL_WEEKS} et "
                f"{MAX_INTERVAL_WEEKS} semaines ; reçu {self.interval_weeks}."
            )
        object.__setattr__(self, "weekdays", weekdays)

    @classmethod
    def from_raw(cls, value: object) -> "MonitoringSchedule":
        """Rebuild a schedule from an untyped ``scope_monitorings.schedule`` value.

        Lenient on purpose, exactly like ``NonWorkingDays.from_raw``: the column
        is nullable JSONB, and one unreadable row must not empty the list of
        scopes. The fallback is always "every working day", never "never due" —
        the second would silently remove the scope from the backlog and from the
        coverage denominator, which is the failure this project refuses most.
        """
        if not isinstance(value, dict):
            return cls()

        raw_weekdays = value.get("weekdays") or []
        weekdays = (
            tuple(int(day) for day in raw_weekdays if is_iso_weekday(day))
            if isinstance(raw_weekdays, list)
            else ()
        )
        # A list present whose every entry was unreadable is a corruption, not a
        # choice: the whole schedule reads as the default rather than keeping a
        # cadence nobody can explain. An actually empty list *is* a choice — "every
        # working day, but one week out of two" — and is respected.
        if raw_weekdays and not weekdays:
            return cls()

        try:
            interval_weeks = int(value.get("interval_weeks", MIN_INTERVAL_WEEKS))
        except (TypeError, ValueError):
            return cls()

        anchor_date = _parse_anchor(value.get("anchor_date"))
        try:
            return cls(
                weekdays=weekdays,
                interval_weeks=interval_weeks,
                anchor_date=anchor_date,
            )
        except InvalidScheduleError:
            return cls()

    def to_dict(self) -> dict[str, object]:
        """The column's stored shape, kept as plain JSON values."""
        return {
            "weekdays": list(self.weekdays),
            "interval_weeks": self.interval_weeks,
            "anchor_date": (
                self.anchor_date.isoformat() if self.anchor_date is not None else None
            ),
        }

    def is_due(self, day: date, calendar: NonWorkingDays) -> bool:
        """Whether this scope is expected to be filled on ``day``."""
        if not calendar.is_working_day(day):
            return False
        if self.weekdays and day.isoweekday() not in self.weekdays:
            return False
        return self._week_index(day) % self.interval_weeks == 0

    def has_any_due_day(self, calendar: NonWorkingDays) -> bool:
        """Whether the schedule can ever be due, given the project calendar.

        A bounded proof rather than a search: the pattern repeats every
        ``interval_weeks`` weeks, so one cycle is enough. Walking dates until one
        is found would hang on a schedule that never matches — the same freeze the
        "calendar with no working day" guard of §28.1 refuses.
        """
        start = self._reference_monday()
        for offset in range(ISO_WEEKDAY_COUNT * self.interval_weeks):
            if self.is_due(start + timedelta(days=offset), calendar):
                return True
        return False

    def _reference_monday(self) -> date:
        anchor = self.anchor_date or _DEFAULT_ANCHOR
        return anchor - timedelta(days=anchor.weekday())

    def _week_index(self, day: date) -> int:
        day_monday = day - timedelta(days=day.weekday())
        return (day_monday - self._reference_monday()).days // 7


def _parse_anchor(value: object) -> date | None:
    if not isinstance(value, str) or not value.strip():
        return None
    try:
        return date.fromisoformat(value.strip())
    except ValueError:
        return None
