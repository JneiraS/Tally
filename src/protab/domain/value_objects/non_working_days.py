from dataclasses import dataclass
from datetime import date
from enum import IntEnum


class IsoWeekday(IntEnum):
    """The ISO 8601 weekday scale, which is what ``excluded_weekdays`` stores.

    JavaScript's ``getDay()`` and ``getUTCDay()`` number from Sunday as 0–6, so
    the raw value coming out of a date calculation has to be converted before it
    can be compared with a stored weekday. Declaring the scale once is what keeps
    the API, the frontend and the database on the same numbering.
    """

    MONDAY = 1
    TUESDAY = 2
    WEDNESDAY = 3
    THURSDAY = 4
    FRIDAY = 5
    SATURDAY = 6
    SUNDAY = 7


MIN_ISO_WEEKDAY: int = IsoWeekday.MONDAY
MAX_ISO_WEEKDAY: int = IsoWeekday.SUNDAY
ISO_WEEKDAY_COUNT: int = len(IsoWeekday)

DEFAULT_EXCLUDED_WEEKDAYS: tuple[int, ...] = (
    int(IsoWeekday.SATURDAY),
    int(IsoWeekday.SUNDAY),
)


@dataclass(frozen=True)
class NonWorkingDays:
    """A project's working calendar: recurring weekdays and one-off dates.

    Both members are tuples, which is what makes the default safe to share: an
    earlier ``dict.copy()`` handed every project the same weekday list, so one
    mutation anywhere would have rewritten the default of the whole process.

    Empty is not the same as default. ``NonWorkingDays()`` means every day is a
    working day — a legitimate configuration, obtained by unticking every box in
    the settings modal — whereas ``default()`` means the Monday-to-Friday
    project every installation starts from.
    """

    excluded_weekdays: tuple[int, ...] = ()
    excluded_dates: tuple[str, ...] = ()

    @classmethod
    def default(cls) -> "NonWorkingDays":
        """The calendar of a project that never configured one."""
        return cls(excluded_weekdays=DEFAULT_EXCLUDED_WEEKDAYS)

    @classmethod
    def from_raw(cls, value: object) -> "NonWorkingDays":
        """Rebuild a calendar from an untyped ``projects.non_working_days`` value.

        Lenient on purpose: the column is nullable JSONB, and a single
        unreadable entry is dropped instead of raising, because one historical
        row must not empty the calendar of every project on the instance. That
        is the same reason ``billing_code`` is nullable rather than constrained
        in the schema. A recurring-day list that loses *every* entry falls back to
        the default calendar rather than to "every day is a working day".
        """
        if not isinstance(value, dict):
            return cls.default()

        raw_weekdays = value.get("excluded_weekdays") or []
        weekdays = sorted({int(day) for day in raw_weekdays if is_iso_weekday(day)})
        # Deux situations retombent sur le défaut, pour deux raisons distinctes :
        # une liste présente dont il ne survit aucune entrée est une corruption,
        # et une liste qui couvre la semaine entière ne laisse aucun jour
        # ouvré — donc rien à ouvrir, rien à saisir, et une recherche de jour
        # ouvré qui ne se termine pas. Une liste réellement vide n'est ni l'un ni
        # l'autre : c'est un choix, et il est respecté.
        if len(weekdays) == ISO_WEEKDAY_COUNT or (raw_weekdays and not weekdays):
            weekdays = list(DEFAULT_EXCLUDED_WEEKDAYS)

        dates = sorted(
            {
                day.strip()
                for day in value.get("excluded_dates", []) or []
                if isinstance(day, str) and day.strip()
            }
        )
        return cls(excluded_weekdays=tuple(weekdays), excluded_dates=tuple(dates))

    def to_dict(self) -> dict[str, list]:
        """The column's stored shape, kept as plain lists for the JSON contract."""
        return {
            "excluded_weekdays": list(self.excluded_weekdays),
            "excluded_dates": list(self.excluded_dates),
        }

    def is_working_day(self, day: date) -> bool:
        """Whether the project works on ``day``.

        The single Python answer to "is this day open?", used by the schedule
        predicate. It reads the ISO scale through ``date.isoweekday`` — 1 is
        Monday, 7 is Sunday — which is the numbering the column stores, so no
        conversion can drift here.
        """
        return (
            day.isoweekday() not in self.excluded_weekdays
            and day.isoformat() not in self.excluded_dates
        )


def is_iso_weekday(day: object) -> bool:
    """Whether a raw entry names a weekday of the ISO scale.

    ``str.isdigit`` is not enough: it accepts "²", which ``int()`` refuses, so
    the naive guard turned a junk character into a 500 on every project listing.
    """
    if isinstance(day, bool):
        return False
    if isinstance(day, int):
        return MIN_ISO_WEEKDAY <= day <= MAX_ISO_WEEKDAY
    if isinstance(day, str) and day.isdecimal():
        return MIN_ISO_WEEKDAY <= int(day) <= MAX_ISO_WEEKDAY
    return False