from dataclasses import dataclass
from datetime import date


@dataclass(frozen=True)
class UpdateDailyActivityCommand:
    scope_id: str
    day: date
    errors_reported: int
    incidents_created: int
    feai: list[str]


@dataclass(frozen=True)
class CompleteDailyActivityCommand:
    scope_id: str
    days: list[date]