from dataclasses import dataclass, field
from datetime import date

from protab.domain.entities.daily_activity import DailyActivity
from protab.domain.exceptions import (
    DuplicateDailyActivityError,
    EmptyBillingCodeError,
    EmptyOfficialsError,
    InvalidKnowledgeBaseIdError,
    InvalidScopeMonitoringIdError,
    NoteTooLongError,
)

#: Longest accepted scope note. Declared once, here, and reused by the inbound
#: schema: a boundary that re-declared the number would silently drift.
NOTE_MAX_LENGTH = 2000


@dataclass
class KnowledgeBase:
    id: str

    def __post_init__(self) -> None:
        if len(self.id) < 9:
            raise InvalidKnowledgeBaseIdError(
                "KnowledgeBase id must be at least 9 characters long."
            )


@dataclass
class Officials:
    main: str
    backup: str

    def __post_init__(self) -> None:
        if not self.main.strip() or not self.backup.strip():
            raise EmptyOfficialsError(
                "Both main and backup officials must be provided."
            )
        self.main = self.main.strip()
        self.backup = self.backup.strip()


@dataclass
class ScopeMonitoring:
    id: str
    name: str
    knowledge: KnowledgeBase
    officials: Officials
    billing_code: str | None = None
    note: str | None = None
    daily_activities: dict[date, DailyActivity] = field(default_factory=dict)

    def __post_init__(self) -> None:
        self.id = self.id.strip()
        if not self.id:
            raise InvalidScopeMonitoringIdError("ScopeMonitoring id must not be empty.")
        # ``billing_code`` is mandatory at creation but not on already-persisted
        # rows: it was introduced after the first ones were written, and the
        # constructor is also the hydration path used by the repositories. So a
        # missing code is normalised, never rejected, here.
        if self.billing_code is not None:
            self.billing_code = self.billing_code.strip() or None
        # Same rule for a free-text note, and the same reason: a blank note means
        # "no note", and reading a row must never fail. The length bound lives in
        # ``set_note`` — it is a write invariant, not a read one.
        if self.note is not None:
            self.note = self.note.strip() or None

    @classmethod
    def create(
        cls,
        *,
        id: str,
        name: str,
        knowledge: KnowledgeBase,
        officials: Officials,
        billing_code: str,
    ) -> "ScopeMonitoring":
        if billing_code is None or not billing_code.strip():
            raise EmptyBillingCodeError(
                "ScopeMonitoring billing code must be provided."
            )
        return cls(
            id=id,
            name=name,
            knowledge=knowledge,
            officials=officials,
            billing_code=billing_code,
        )

    def set_note(self, note: str | None) -> None:
        """Replace the free-text note of the scope.

        A blank note is stored as "no note" rather than an empty string, so the
        column has a single absent state to read back.
        """
        cleaned = note.strip() if note is not None else None
        if cleaned is not None and len(cleaned) > NOTE_MAX_LENGTH:
            raise NoteTooLongError(
                f"ScopeMonitoring note must be at most {NOTE_MAX_LENGTH} "
                f"characters; got {len(cleaned)}."
            )
        self.note = cleaned or None

    def add_daily_activity(self, activity: DailyActivity) -> None:
        if activity.day in self.daily_activities:
            raise DuplicateDailyActivityError(
                f"ScopeMonitoring already has a DailyActivity for day {activity.day!r}."
            )
        self.daily_activities[activity.day] = activity

    def daily_activity_for(self, day: date) -> DailyActivity | None:
        return self.daily_activities.get(day)
