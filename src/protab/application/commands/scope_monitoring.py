from dataclasses import dataclass


@dataclass(frozen=True)
class UpdateScopeNoteCommand:
    scope_id: str
    note: str | None


@dataclass(frozen=True)
class UpdateScopeOfficialsCommand:
    scope_id: str
    official_main: str
    official_backup: str