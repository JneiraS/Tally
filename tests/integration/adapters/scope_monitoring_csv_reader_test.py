import csv
from pathlib import Path

import pytest

from protab.adapters.inbound.csv.scope_monitoring_csv_reader import (
    REQUIRED_HEADERS,
    ScopeMonitoringCsvError,
    parse_scope_monitorings_csv,
)


def write_csv(path: Path, rows: list[list[str]]) -> None:
    with open(path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerows(rows)


def read_rows(path: Path) -> list[list[str]]:
    with open(path, newline="") as f:
        return list(csv.reader(f))


def test_parse_valid_csv(tmp_path):
    path = tmp_path / "scope.csv"
    write_csv(
        path,
        [
            list(REQUIRED_HEADERS),
            ["Scope A", "KB-00000001", "Main", "Backup", "FACT-2026-PAI"],
            ["Scope B", "KB-00000002", "Paul", "Jean", "FACT-2026-BAT"],
        ],
    )

    commands = parse_scope_monitorings_csv(read_rows(path))

    assert len(commands) == 2
    assert commands[0].name == "Scope A"
    assert commands[0].knowledge_base_id == "KB-00000001"
    assert commands[0].official_main == "Main"
    assert commands[0].official_backup == "Backup"
    assert commands[0].billing_code == "FACT-2026-PAI"


def test_parse_csv_without_billing_code_header_raises(tmp_path):
    # Le code de facturation est obligatoire : un fichier antérieur à son
    # introduction doit être rejeté plutôt que de créer des périmètres incomplets.
    path = tmp_path / "scope.csv"
    write_csv(
        path,
        [
            ["name", "knowledge_base_id", "official_main", "official_backup"],
            ["Scope A", "KB-00000001", "Main", "Backup"],
        ],
    )

    with pytest.raises(ScopeMonitoringCsvError):
        parse_scope_monitorings_csv(read_rows(path))


def test_parse_trims_whitespace(tmp_path):
    path = tmp_path / "scope.csv"
    write_csv(
        path,
        [
            list(REQUIRED_HEADERS),
            ["  Scope A  ", " KB-00000001 ", " Main ", " Backup ", " FACT-2026-PAI "],
        ],
    )

    commands = parse_scope_monitorings_csv(read_rows(path))

    assert commands[0].name == "Scope A"
    assert commands[0].official_main == "Main"
    assert commands[0].billing_code == "FACT-2026-PAI"


def test_parse_empty_raises():
    with pytest.raises(ScopeMonitoringCsvError):
        parse_scope_monitorings_csv([])


def test_parse_missing_headers_raises(tmp_path):
    path = tmp_path / "scope.csv"
    write_csv(path, [["name", "other"], ["Scope A", "x"]])

    with pytest.raises(ScopeMonitoringCsvError):
        parse_scope_monitorings_csv(read_rows(path))


def test_parse_wrong_column_count_raises(tmp_path):
    path = tmp_path / "scope.csv"
    write_csv(
        path,
        [
            list(REQUIRED_HEADERS),
            ["Scope A", "KB-00000001", "Main"],
        ],
    )

    with pytest.raises(ScopeMonitoringCsvError):
        parse_scope_monitorings_csv(read_rows(path))