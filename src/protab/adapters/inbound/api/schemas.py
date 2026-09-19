from datetime import date

from pydantic import BaseModel, Field


class CreateScopeItem(BaseModel):
    name: str
    knowledge_base_id: str
    official_main: str
    official_backup: str


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
    daily_activities: list[ActivityResponse]