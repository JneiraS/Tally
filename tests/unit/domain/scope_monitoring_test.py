from datetime import date

import pytest

from protab.domain.entities.daily_activity import DailyActivity
from protab.domain.entities.scope_monitoring import (
    NOTE_MAX_LENGTH,
    KnowledgeBase,
    Officials,
    ScopeMonitoring,
)
from protab.domain.exceptions import (
    DuplicateDailyActivityError,
    EmptyBillingCodeError,
    EmptyOfficialsError,
    InvalidKnowledgeBaseIdError,
    InvalidScopeMonitoringIdError,
    NoteTooLongError,
)


@pytest.fixture
def fixture_scope_monitoring():
    knowledge_base = KnowledgeBase(id="Test Knowledge")
    officials = Officials(main="Official", backup="Secondary Official")
    monitoring = ScopeMonitoring(
        id="scope-001",
        name="Test Monitoring",
        knowledge=knowledge_base,
        officials=officials,
    )
    return monitoring


def test_scope_monitoring_creation(fixture_scope_monitoring):
    monitoring = fixture_scope_monitoring
    assert monitoring.id == "scope-001"
    assert monitoring.name == "Test Monitoring"
    assert isinstance(monitoring.knowledge.id, str)
    assert monitoring.officials.main == "Official"
    assert monitoring.officials.backup == "Secondary Official"


def test_scope_monitoring_empty_id():
    with pytest.raises(InvalidScopeMonitoringIdError):
        ScopeMonitoring(
            id="",
            name="Test",
            knowledge=KnowledgeBase(id="Test Knowledge"),
            officials=Officials(main="Main", backup="Backup"),
        )
    with pytest.raises(InvalidScopeMonitoringIdError):
        ScopeMonitoring(
            id="   ",
            name="Test",
            knowledge=KnowledgeBase(id="Test Knowledge"),
            officials=Officials(main="Main", backup="Backup"),
        )


# test pour les exceptions
def test_knowledge_base_id_length():
    with pytest.raises(InvalidKnowledgeBaseIdError) as excinfo:
        KnowledgeBase(id="short")
    assert "KnowledgeBase id must be at least 9 characters long." in str(excinfo.value)


def test_knowledge_base_id_valid_boundary():
    # exactly 9 chars should pass
    kb = KnowledgeBase(id="a" * 9)
    assert kb.id == "a" * 9


def test_officials_empty_main():
    with pytest.raises(EmptyOfficialsError) as excinfo:
        Officials(main="", backup="Backup")
    assert "Both main and backup officials must be provided." in str(excinfo.value)


def test_officials_empty_backup():
    with pytest.raises(EmptyOfficialsError) as excinfo:
        Officials(main="Main", backup="")
    assert "Both main and backup officials must be provided." in str(excinfo.value)


def test_officials_blank_strings_rejected():
    # whitespace-only strings should be treated as empty
    with pytest.raises(EmptyOfficialsError):
        Officials(main=" ", backup="Backup")
    with pytest.raises(EmptyOfficialsError):
        Officials(main="Main", backup=" ")


def build_scope(**overrides):
    payload = {
        "id": "scope-001",
        "name": "Test Monitoring",
        "knowledge": KnowledgeBase(id="Test Knowledge"),
        "officials": Officials(main="Main", backup="Backup"),
        "billing_code": "FACT-2026-PAI",
    }
    payload.update(overrides)
    return ScopeMonitoring.create(**payload)


def test_create_stores_the_billing_code():
    assert build_scope().billing_code == "FACT-2026-PAI"


def test_create_strips_the_billing_code():
    assert build_scope(billing_code="  FACT-2026-PAI \n").billing_code == (
        "FACT-2026-PAI"
    )


@pytest.mark.parametrize("blank", [None, "", "   ", "\t\n"])
def test_create_rejects_a_blank_billing_code(blank):
    with pytest.raises(EmptyBillingCodeError):
        build_scope(billing_code=blank)


def test_hydration_accepts_a_scope_without_billing_code():
    # Les périmètres créés avant l'introduction du code sont relus avec un
    # code absent : ils doivent rester chargeables, sinon find_all échoue.
    scope = ScopeMonitoring(
        id="scope-legacy",
        name="Legacy",
        knowledge=KnowledgeBase(id="Test Knowledge"),
        officials=Officials(main="Main", backup="Backup"),
    )
    assert scope.billing_code is None


def test_blank_billing_code_is_normalised_to_none():
    scope = ScopeMonitoring(
        id="scope-legacy",
        name="Legacy",
        knowledge=KnowledgeBase(id="Test Knowledge"),
        officials=Officials(main="Main", backup="Backup"),
        billing_code="   ",
    )
    assert scope.billing_code is None


# --- Note libre ------------------------------------------------------------


def test_hydration_reads_a_note():
    scope = ScopeMonitoring(
        id="scope-001",
        name="Scope A",
        knowledge=KnowledgeBase(id="Test Knowledge"),
        officials=Officials(main="Main", backup="Backup"),
        note="  Incident de facturation à suivre.  ",
    )
    assert scope.note == "Incident de facturation à suivre."


def test_set_note_stores_the_trimmed_text(fixture_scope_monitoring):
    fixture_scope_monitoring.set_note("  contexte utile \n")

    assert fixture_scope_monitoring.note == "contexte utile"


@pytest.mark.parametrize("blank", [None, "", "   ", "\t\n"])
def test_set_note_normalises_a_blank_note_to_none(fixture_scope_monitoring, blank):
    # Une note vide est « pas de note » : sans cela la colonne stocke une
    # chaîne vide et la page doit distinguer deux absents.
    fixture_scope_monitoring.set_note("avant")
    fixture_scope_monitoring.set_note(blank)

    assert fixture_scope_monitoring.note is None


def test_set_note_accepts_a_note_at_the_limit(fixture_scope_monitoring):
    fixture_scope_monitoring.set_note("n" * NOTE_MAX_LENGTH)

    assert fixture_scope_monitoring.note == "n" * NOTE_MAX_LENGTH


def test_set_note_rejects_a_note_above_the_limit(fixture_scope_monitoring):
    with pytest.raises(NoteTooLongError):
        fixture_scope_monitoring.set_note("n" * (NOTE_MAX_LENGTH + 1))

    assert fixture_scope_monitoring.note is None


def test_hydration_never_rejects_a_note_above_the_limit():
    # Le constructeur est aussi le chemin de relecture : une ligne trop longue
    # ne doit pas vider la liste des périmètres. La borne est un invariant
    # d'écriture (set_note), pas de lecture.
    scope = ScopeMonitoring(
        id="scope-001",
        name="Scope A",
        knowledge=KnowledgeBase(id="Test Knowledge"),
        officials=Officials(main="Main", backup="Backup"),
        note="n" * (NOTE_MAX_LENGTH + 1),
    )
    assert len(scope.note) == NOTE_MAX_LENGTH + 1


# --- Officiels (responsable principal / suppléant) --------------------------


def test_set_officials_stores_both_values(fixture_scope_monitoring):
    fixture_scope_monitoring.set_officials("LAMA/JMAB", "  MLOZ  ")

    assert fixture_scope_monitoring.officials.main == "LAMA/JMAB"
    assert fixture_scope_monitoring.officials.backup == "MLOZ"


def test_set_officials_keeps_the_billing_code_and_the_note(fixture_scope_monitoring):
    # Une édition des officiels ne doit pas effacer les autres champs du
    # périmètre : le constructeur est le chemin de réhydratation, la mutation
    # l'écriture ciblée, et le domaine n'a pas à savoir ce que le port persiste.
    fixture_scope_monitoring.billing_code = "FACT-2026-PAI"
    fixture_scope_monitoring.set_note("note à conserver")
    fixture_scope_monitoring.set_officials("NewMain", "NewBackup")

    assert fixture_scope_monitoring.billing_code == "FACT-2026-PAI"
    assert fixture_scope_monitoring.note == "note à conserver"


@pytest.mark.parametrize("blank_main", [None, "", "   "])
def test_set_officials_rejects_a_blank_main(fixture_scope_monitoring, blank_main):
    # Même règle que le constructeur : les deux responsables sont obligatoires.
    # Le refus renvoie au value object, pour que création et édition ne puissent
    # jamais dévier.
    with pytest.raises(EmptyOfficialsError):
        fixture_scope_monitoring.set_officials(blank_main, "Backup")

    assert fixture_scope_monitoring.officials.main == "Official"


@pytest.mark.parametrize("blank_backup", [None, "", "   "])
def test_set_officials_rejects_a_blank_backup(fixture_scope_monitoring, blank_backup):
    with pytest.raises(EmptyOfficialsError):
        fixture_scope_monitoring.set_officials("Main", blank_backup)

    assert fixture_scope_monitoring.officials.backup == "Secondary Official"


def test_set_officials_leaves_the_daily_activities_intact(fixture_scope_monitoring):
    """L'invariant du §28.1 : la mutation ne touche que les champs nommés."""
    day = date(2026, 9, 19)
    activity = DailyActivity(
        day=day,
        errors_reported=7,
        incidents_created=1,
        feai=["INC000000019"],
    )
    fixture_scope_monitoring.add_daily_activity(activity)
    fixture_scope_monitoring.set_officials("NewMain", "NewBackup")

    assert fixture_scope_monitoring.daily_activity_for(day).errors_reported == 7
    assert fixture_scope_monitoring.daily_activity_for(day).feai == ["INC000000019"]


# tests pour DailyActivity et ScopeMonitoring
def test_scope_monitoring_add_daily_activity(fixture_scope_monitoring):
    """Adding a DailyActivity for a new day should succeed."""
    monitoring = fixture_scope_monitoring
    activity = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=2,
        incidents_created=1,
        feai=["INC000000001"],
    )
    monitoring.add_daily_activity(activity)
    assert monitoring.daily_activity_for(date(2026, 9, 19)) is activity


def test_scope_monitoring_rejects_duplicate_day(fixture_scope_monitoring):
    """Adding a second DailyActivity for the same day should raise DuplicateDailyActivityError."""
    monitoring = fixture_scope_monitoring
    activity = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=1,
        incidents_created=0,
        feai=["INC000000001"],
    )
    monitoring.add_daily_activity(activity)
    activity2 = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=1,
        incidents_created=0,
        feai=["INC000000002"],
    )
    with pytest.raises(DuplicateDailyActivityError):
        monitoring.add_daily_activity(activity2)


def test_scope_monitoring_multiple_activities_different_days(fixture_scope_monitoring):
    """Multiple DailyActivities for different days should be allowed."""
    monitoring = fixture_scope_monitoring
    activity1 = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=2,
        incidents_created=1,
        feai=["INC000000001"],
    )
    activity2 = DailyActivity(
        day=date(2026, 9, 20),
        errors_reported=3,
        incidents_created=1,
        feai=["INC000000002"],
    )
    monitoring.add_daily_activity(activity1)
    monitoring.add_daily_activity(activity2)
    assert monitoring.daily_activity_for(date(2026, 9, 19)) is activity1
    assert monitoring.daily_activity_for(date(2026, 9, 20)) is activity2


def test_scope_monitoring_multiple_activities_same_day_different_monitorings(
    fixture_scope_monitoring,
):
    """Different ScopeMonitoring instances can have activities on the same day."""
    monitoring = fixture_scope_monitoring
    # Create a second monitoring (minimal)
    kb = KnowledgeBase(id="Other Knowledge")
    officials = Officials(main="Other", backup="Backup")
    monitoring2 = ScopeMonitoring(
        id="scope-002",
        name="Other Monitoring",
        knowledge=kb,
        officials=officials,
    )
    activity = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=1,
        incidents_created=0,
        feai=["INC000000001"],
    )
    activity2 = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=2,
        incidents_created=1,
        feai=["INC000000002"],
    )
    monitoring.add_daily_activity(activity2)
    monitoring2.add_daily_activity(activity)
    # Both monitorings should have their own activity for that same day
    assert monitoring.daily_activity_for(date(2026, 9, 19)) is activity2
    assert monitoring2.daily_activity_for(date(2026, 9, 19)) is activity
