from dataclasses import dataclass, field

from protab.domain.value_objects.monitoring_schedule import MonitoringSchedule


@dataclass(frozen=True)
class CreateScopeMonitoringCommand:
    name: str
    knowledge_base_id: str
    official_main: str
    official_backup: str
    billing_code: str
    # Default = every working day, so a creation that does not mention a cadence
    # behaves exactly as before the schedule existed.
    schedule: MonitoringSchedule = field(default_factory=MonitoringSchedule)
