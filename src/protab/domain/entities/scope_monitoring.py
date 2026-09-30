from dataclasses import dataclass, field
from datetime import date

from protab.domain.entities.daily_activity import DailyActivity
from protab.domain.exceptions import (
    DuplicateDailyActivityError,
    EmptyBillingCodeError,
    EmptyOfficialsError,
    InvalidKnowledgeBaseIdError,
    InvalidScopeMonitoringIdError,
)


@dataclass
class KnowledgeBase:
    id: str

    def __post_init__(self):
        if len(self.id) < 9:
            raise InvalidKnowledgeBaseIdError(
                "KnowledgeBase id must be at least 9 characters long."
            )


@dataclass
class Officials:
    main: str
    backup: str

    def __post_init__(self):
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
    daily_activities: dict[date, DailyActivity] = field(default_factory=dict)

    def __post_init__(self):
        self.id = self.id.strip()
        if not self.id:
            raise InvalidScopeMonitoringIdError("ScopeMonitoring id must not be empty.")
        # ``billing_code`` is mandatory at creation but not on already-persisted
        # rows: it was introduced after the first ones were written, and the
        # constructor is also the hydration path used by the repositories. So a
        # missing code is normalised, never rejected, here.
        if self.billing_code is not None:
            self.billing_code = self.billing_code.strip() or None

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

    def add_daily_activity(self, activity: DailyActivity) -> None:
        if activity.day in self.daily_activities:
            raise DuplicateDailyActivityError(
                f"ScopeMonitoring already has a DailyActivity for day {activity.day!r}."
            )
        self.daily_activities[activity.day] = activity

    def daily_activity_for(self, day: date) -> DailyActivity | None:
        return self.daily_activities.get(day)
