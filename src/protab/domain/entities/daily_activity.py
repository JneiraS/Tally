import re
from dataclasses import dataclass
from datetime import date

from protab.domain.entities.day_status import KO_REASON_MAX_LENGTH, DayStatus
from protab.domain.exceptions import (
    DuplicateFeaiReferenceError,
    IncidentsExceedErrorsError,
    InvalidFeaiReferenceError,
    InvalidKoReasonError,
    KoReasonTooLongError,
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
    status: DayStatus = DayStatus.PENDING
    ko_reason: str | None = None

    def __post_init__(self) -> None:
        self.feai = self._validate(
            self.errors_reported, self.incidents_created, self.feai
        )
        # Normalisation, pas refus : le constructeur est le chemin de
        # réhydratation des deux adapters, donc une ligne qui porterait un motif
        # résiduel alors qu'elle est terminée ne doit pas lever — une seule ligne
        # dégénérée viderait la liste des périmètres de l'instance. C'est le même
        # arbitrage que ``billing_code`` et ``NonWorkingDays.from_raw`` ; le refus,
        # lui, est une invariant d'écriture et vit dans ``apply_status``.
        self.ko_reason = _normalise_ko_reason(self.status, self.ko_reason)

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

    def apply_status(
        self, status: DayStatus, *, ko_reason: str | None = None
    ) -> None:
        """Set the day's status — the only way to write it.

        A reason belongs to a KO and to nothing else, so providing one for a day
        that is not KO is refused instead of being dropped: silently ignoring it
        would let the caller believe the reason was recorded. The counters are
        never touched here, which is what lets a KO day keep whatever was entered
        before the problem was discovered, and what makes lifting the KO
        lossless.
        """
        if ko_reason is not None and status is not DayStatus.KO:
            raise InvalidKoReasonError(
                "ko_reason can only be set on a KO day, not on "
                f"{status.value!r}."
            )
        if ko_reason is not None and len(ko_reason.strip()) > KO_REASON_MAX_LENGTH:
            raise KoReasonTooLongError(
                f"ko_reason must not exceed {KO_REASON_MAX_LENGTH} characters."
            )
        self.status = status
        self.ko_reason = _normalise_ko_reason(status, ko_reason)


def _normalise_ko_reason(status: DayStatus, ko_reason: str | None) -> str | None:
    """Reduce a reason to the one shape a day can hold.

    A blank reason and no reason are the same absence, and a reason attached to a
    day that is not KO is a contradiction rather than a second state.
    """
    if status is not DayStatus.KO or ko_reason is None:
        return None
    stripped = ko_reason.strip()
    return stripped or None
