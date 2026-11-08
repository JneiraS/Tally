from dataclasses import dataclass

from protab.domain.value_objects.monitoring_schedule import MonitoringSchedule


@dataclass(frozen=True)
class UpdateScopeNoteCommand:
    scope_id: str
    note: str | None


@dataclass(frozen=True)
class UpdateScopeOfficialsCommand:
    scope_id: str
    official_main: str
    official_backup: str

@dataclass(frozen=True)
class UpdateScopeScheduleCommand:
    scope_id: str
    # The value object rather than its fields: it is frozen and validates on
    # construction, so carrying it here is what stops a use case from receiving
    # an out-of-range interval that only the HTTP boundary refused.
    schedule: MonitoringSchedule
