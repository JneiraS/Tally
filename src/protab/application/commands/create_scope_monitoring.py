from dataclasses import dataclass


@dataclass(frozen=True)
class CreateScopeMonitoringCommand:
    name: str
    knowledge_base_id: str
    official_main: str
    official_backup: str
