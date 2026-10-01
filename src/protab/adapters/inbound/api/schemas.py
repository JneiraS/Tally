from datetime import date, datetime

from pydantic import BaseModel, Field, field_validator

from protab.domain.value_objects.non_working_days import (
    MAX_ISO_WEEKDAY,
    MIN_ISO_WEEKDAY,
)


class CreateScopeItem(BaseModel):
    name: str
    knowledge_base_id: str
    official_main: str
    official_backup: str
    billing_code: str = Field(min_length=1)


class CompleteRequest(BaseModel):
    days: list[date] = Field(min_length=1)


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
        return sorted(set(values))


class LoginRequest(BaseModel):
    project_id: str
    quadrigramme: str = Field(min_length=2, max_length=20)
    password: str = Field(min_length=1, max_length=256)


class LoginResponse(BaseModel):
    project: ProjectResponse
    quadrigramme: str


class SessionResponse(BaseModel):
    project: ProjectResponse
    quadrigramme: str


class ActivityResponse(BaseModel):
    day: date
    errors_reported: int
    incidents_created: int
    feai: list[str]
    handled: bool
    completed: bool


class ScopeResponse(BaseModel):
    id: str
    name: str
    knowledge_base_id: str
    official_main: str
    official_backup: str
    billing_code: str | None
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
