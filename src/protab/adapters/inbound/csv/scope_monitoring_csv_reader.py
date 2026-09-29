from protab.application.commands.create_scope_monitoring import (
    CreateScopeMonitoringCommand,
)

REQUIRED_HEADERS = (
    "name",
    "knowledge_base_id",
    "official_main",
    "official_backup",
    "billing_code",
)


class ScopeMonitoringCsvError(Exception):
    pass


def parse_scope_monitorings_csv(
    rows: list[list[str]],
) -> list[CreateScopeMonitoringCommand]:
    """Convert raw CSV rows (already split, header first) into commands.

    Only structural checks live here: required headers and column count.
    Business rules (id length, officials) are enforced by the domain.
    """
    if not rows:
        raise ScopeMonitoringCsvError("CSV is empty: no header row.")

    header = [cell.strip() for cell in rows[0]]
    if header != list(REQUIRED_HEADERS):
        raise ScopeMonitoringCsvError(
            f"Invalid headers {header!r}; expected {list(REQUIRED_HEADERS)!r}."
        )

    commands: list[CreateScopeMonitoringCommand] = []
    for idx, raw_row in enumerate(rows[1:], start=2):
        row = [cell.strip() for cell in raw_row]
        if len(row) != len(REQUIRED_HEADERS):
            raise ScopeMonitoringCsvError(
                f"Row {idx} has {len(row)} columns; expected {len(REQUIRED_HEADERS)}."
            )
        commands.append(
            CreateScopeMonitoringCommand(
                name=row[0],
                knowledge_base_id=row[1],
                official_main=row[2],
                official_backup=row[3],
                billing_code=row[4],
            )
        )
    return commands
