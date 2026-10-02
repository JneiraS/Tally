from dataclasses import dataclass


@dataclass(frozen=True)
class UpdateScopeNoteCommand:
    scope_id: str
    note: str | None