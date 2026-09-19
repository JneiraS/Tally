import re
from dataclasses import dataclass
from datetime import date

from protab.domain.exceptions import (
    NegativeErrorsCountError,
    NegativeIncidentsCountError,
    IncidentsExceedErrorsError,
    InvalidFeaiReferenceError,
    DuplicateFeaiReferenceError,
)

_FEAI_PATTERN = re.compile(r"^INC\d{7}$")


@dataclass
class DailyActivity:
    day: date
    errors_reported: int
    incidents_created: int
    feai: list[str]
    handled: bool = False
    completed: bool = False

    def __post_init__(self):
        if self.errors_reported < 0:
            raise NegativeErrorsCountError(
                "errors_reported must be a non-negative integer."
            )
        if self.incidents_created < 0:
            raise NegativeIncidentsCountError(
                "incidents_created must be a non-negative integer."
            )
        if self.incidents_created > self.errors_reported:
            raise IncidentsExceedErrorsError(
                "incidents_created must not exceed errors_reported."
            )
        seen = set()
        for ref in self.feai:
            if not isinstance(ref, str) or _FEAI_PATTERN.fullmatch(ref) is None:
                raise InvalidFeaiReferenceError(
                    f"Invalid FEAI reference: {ref!r}. Expected format: INC\\d{{7}}."
                )
            if ref in seen:
                raise DuplicateFeaiReferenceError(
                    f"Duplicate FEAI reference: {ref!r}."
                )
            seen.add(ref)

    def mark_handled(self) -> None:
        self.handled = True

    def mark_completed(self) -> None:
        self.handled = True
        self.completed = True