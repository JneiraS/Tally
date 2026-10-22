from datetime import date, datetime

from pydantic import BaseModel, Field, field_validator, model_validator

from protab.domain.entities.day_status import KO_REASON_MAX_LENGTH, DayStatus
from protab.domain.entities.scope_monitoring import NOTE_MAX_LENGTH
from protab.domain.value_objects.non_working_days import (
    ISO_WEEKDAY_COUNT,
    MAX_ISO_WEEKDAY,
    MIN_ISO_WEEKDAY,
)


class CreateScopeItem(BaseModel):
    name: str
    knowledge_base_id: str
    official_main: str
    official_backup: str
    billing_code: str = Field(min_length=1)


class UpdateScopeNoteRequest(BaseModel):
    # The bound is the domain's own constant: re-declaring 2000 here would let
    # the two drift, and the request schema is the only entry point where an
    # oversized note is refused before it reaches the entity.
    note: str | None = Field(default=None, max_length=NOTE_MAX_LENGTH)


class UpdateOfficialsRequest(BaseModel):
    # Pas de borne de longueur : le domaine n'en déclare aucune sur les
    # responsables (à la différence de la note), et resserrer ici inventerait
    # une règle que la création n'impose pas (§28.3).
    official_main: str = Field(min_length=1)
    official_backup: str = Field(min_length=1)


class SetStatusRequest(BaseModel):
    # The bound is the domain's own constant, like the note's: re-declaring it
    # here would let the two drift, and this is the one entry point where an
    # oversized reason is refused before it reaches the entity.
    days: list[date] = Field(min_length=1)
    status: DayStatus
    ko_reason: str | None = Field(default=None, max_length=KO_REASON_MAX_LENGTH)

    @model_validator(mode="after")
    def validate_ko_reason(self) -> "SetStatusRequest":
        # Refused at the boundary rather than only in the entity, so a caller that
        # does not go through HTTP is not the only one protected: the invariant is
        # the same, only the layer differs. A blank reason is no reason, so it is
        # normalised away instead of being turned into an error the domain would
        # have accepted.
        if self.ko_reason is not None and self.status is not DayStatus.KO:
            raise ValueError(
                "ko_reason ne peut être fourni que pour une journée KO, pas pour "
                f"le statut {self.status.value!r}."
            )
        if self.ko_reason is not None and not self.ko_reason.strip():
            self.ko_reason = None
        return self


class UpdateRequest(BaseModel):
    errors_reported: int
    incidents_created: int
    feai: list[str]


class CreateActivityRequest(BaseModel):
    day: date
    errors_reported: int
    incidents_created: int
    feai: list[str]


class CreatedResponse(BaseModel):
    ids: list[str]


class ProjectResponse(BaseModel):
    id: str
    name: str
    non_working_days: dict[str, list]


class NonWorkingDaysRequest(BaseModel):
    excluded_weekdays: list[int] = Field(default_factory=list)
    excluded_dates: list[date] = Field(default_factory=list)

    @field_validator("excluded_weekdays")
    @classmethod
    def validate_weekdays(cls, values: list[int]) -> list[int]:
        if any(day < MIN_ISO_WEEKDAY or day > MAX_ISO_WEEKDAY for day in values):
            raise ValueError(
                f"Les jours doivent être compris entre {MIN_ISO_WEEKDAY} "
                f"et {MAX_ISO_WEEKDAY}."
            )
        unique = sorted(set(values))
        # Un calendrier sans jour ouvré n'a rien à afficher : la vue mono-jour
        # chercherait un jour ouvré jusqu'à ne plus trouver de date. La modale ne
        # peut pas produire ce réglage — décocher tout donne une liste vide — mais
        # un appel HTTP direct si.
        if len(unique) == ISO_WEEKDAY_COUNT:
            raise ValueError(
                f"Au moins un jour doit rester ouvré : les sept jours de la "
                f"semaine ne peuvent pas tous être écartés."
            )
        return unique


class LoginRequest(BaseModel):
    project_id: str
    quadrigramme: str = Field(min_length=2, max_length=20)
    password: str = Field(min_length=1, max_length=256)


class LoginResponse(BaseModel):
    project: ProjectResponse
    quadrigramme: str
    is_admin: bool


class SessionResponse(BaseModel):
    project: ProjectResponse
    quadrigramme: str
    is_admin: bool


class ActivityResponse(BaseModel):
    day: date
    errors_reported: int
    incidents_created: int
    feai: list[str]
    status: DayStatus
    ko_reason: str | None


class ScopeResponse(BaseModel):
    id: str
    name: str
    knowledge_base_id: str
    official_main: str
    official_backup: str
    billing_code: str | None
    note: str | None
    daily_activities: list[ActivityResponse]


class AuditEventResponse(BaseModel):
    id: str
    actor: str | None
    action: str
    scope_id: str | None
    scope_name: str | None
    day: date | None
    created_at: datetime
    changes: dict
