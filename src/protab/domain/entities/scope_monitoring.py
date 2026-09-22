from dataclasses import dataclass, field
from datetime import date

from protab.domain.entities.daily_activity import DailyActivity
from protab.domain.exceptions import (
    DuplicateDailyActivityError,
    EmptyOfficialsError,
    InvalidKnowledgeBaseIdError,
    InvalidScopeMonitoringIdError,
)


@dataclass
class KnowledgeBase:
    id: str

    def __post_init__(self):
        if len(self.id) < 10:
            raise InvalidKnowledgeBaseIdError(
                "KnowledgeBase id must be at least 10 characters long."
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
    daily_activities: dict[date, DailyActivity] = field(default_factory=dict)

    def __post_init__(self):
        self.id = self.id.strip()
        if not self.id:
            raise InvalidScopeMonitoringIdError("ScopeMonitoring id must not be empty.")

    def add_daily_activity(self, activity: DailyActivity) -> None:
        if activity.day in self.daily_activities:
            raise DuplicateDailyActivityError(
                f"ScopeMonitoring already has a DailyActivity for day {activity.day!r}."
            )
        self.daily_activities[activity.day] = activity

    def daily_activity_for(self, day: date) -> DailyActivity | None:
        return self.daily_activities.get(day)
