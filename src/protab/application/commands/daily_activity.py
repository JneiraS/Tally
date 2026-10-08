from dataclasses import dataclass
from datetime import date

from protab.domain.entities.day_status import DayStatus


@dataclass(frozen=True)
class UpdateDailyActivityCommand:
    scope_id: str
    day: date
    errors_reported: int
    incidents_created: int
    feai: list[str]


@dataclass(frozen=True)
class CreateDailyActivityCommand:
    scope_id: str
    day: date
    errors_reported: int
    incidents_created: int
    feai: list[str]


@dataclass(frozen=True)
class SetActivitiesStatusCommand:
    scope_id: str
    days: list[date]
    status: DayStatus
    ko_reason: str | None = None
