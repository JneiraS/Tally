import re
from dataclasses import dataclass
from datetime import date

from protab.domain.exceptions import (
    DuplicateFeaiReferenceError,
    IncidentsExceedErrorsError,
    InvalidFeaiReferenceError,
    NegativeErrorsCountError,
    NegativeIncidentsCountError,
)

_FEAI_PATTERN = re.compile(r"^(?:[A-Z]{2,5}-)?INC\d{9}$")
_SEPARATOR_PATTERN = re.compile(r"[\s\-/]+")
_PREFIX_PATTERN = re.compile(r"^([A-Z]{2,5})-?(INC)")


def canonical_feai(value: str) -> str:
    """Ramène une référence à sa forme canonique ``FE-INC000000001``.

    La saisie est tolérante (espace, tiret, slash, préfixe collé au code) mais
    une seule graphie est stockée : sans cela la même référence compterait
    plusieurs fois dans une même journée selon la façon dont elle a été tapée.
    """
    return _PREFIX_PATTERN.sub(
        r"\1-\2", _SEPARATOR_PATTERN.sub("-", value.strip())
    )


@dataclass
class DailyActivity:
    day: date
    errors_reported: int
    incidents_created: int
    feai: list[str]
    handled: bool = False
    completed: bool = False

    def __post_init__(self):
        self.feai = self._validate(
            self.errors_reported, self.incidents_created, self.feai
        )

    @staticmethod
    def _validate(
        errors_reported: int,
        incidents_created: int,
        feai: list[str],
    ) -> list[str]:
        if errors_reported < 0:
            raise NegativeErrorsCountError(
                "errors_reported must be a non-negative integer."
            )
        if incidents_created < 0:
            raise NegativeIncidentsCountError(
                "incidents_created must be a non-negative integer."
            )
        if incidents_created > errors_reported:
            raise IncidentsExceedErrorsError(
                "incidents_created must not exceed errors_reported."
            )
        canonical: list[str] = []
        seen: set[str] = set()
        for ref in feai:
            if not isinstance(ref, str):
                raise InvalidFeaiReferenceError(
                    f"Invalid FEAI reference: {ref!r}. Expected format: [PREFIX-]INC\\d{{9}}."
                )
            value = canonical_feai(ref)
            if _FEAI_PATTERN.fullmatch(value) is None:
                raise InvalidFeaiReferenceError(
                    f"Invalid FEAI reference: {ref!r}. Expected format: [PREFIX-]INC\\d{{9}}."
                )
            if value in seen:
                raise DuplicateFeaiReferenceError(f"Duplicate FEAI reference: {value!r}.")
            seen.add(value)
            canonical.append(value)
        return canonical

    def update(
        self,
        *,
        errors_reported: int,
        incidents_created: int,
        feai: list[str],
    ) -> None:
        self.feai = self._validate(errors_reported, incidents_created, feai)
        self.errors_reported = errors_reported
        self.incidents_created = incidents_created

    def mark_handled(self) -> None:
        self.handled = True

    def mark_completed(self) -> None:
        self.handled = True
        self.completed = True
