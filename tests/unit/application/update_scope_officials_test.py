"""Édition des responsables d'un périmètre :use case et autorisation.

Le droit d'éditer ``official_main`` / ``official_backup`` est réservé aux
administrateurs du projet (table ``project_admins``), vérifiés **à chaque
appel** par une porte dédiée : l'§28.3 bis interdit un drapeau de rôle en
session (il serait périmé pendant 12 h), et la CLI peut révoquer un
administrateur à tout instant.
"""

from datetime import date

import pytest

from protab.adapters.outbound.persistence.in_memory_audit_trail_repository import (
    InMemoryAuditTrailRepository,
)
from protab.adapters.outbound.persistence.in_memory_scope_monitoring_repository import (
    InMemoryScopeMonitoringRepository,
)
from protab.application.actor_context import reset_current_actor, set_current_actor
from protab.application.commands.scope_monitoring import UpdateScopeOfficialsCommand
from protab.application.use_cases.update_scope_officials import (
    UpdateScopeOfficialsUseCase,
)
from protab.domain.entities.daily_activity import DailyActivity
from protab.domain.entities.scope_monitoring import (
    KnowledgeBase,
    Officials,
    ScopeMonitoring,
)
from protab.domain.exceptions import NotProjectAdminError, ScopeMonitoringNotFoundError
from tests.unit.application.recording_repository import (
    RecordingScopeMonitoringRepository,
)


class FakeAdminDirectory:
    """Administrateurs de la base de test, normalisés comme le fait le SQL."""

    def __init__(self, admins: set[str] | None = None) -> None:
        self.admins = {code.strip().upper() for code in (admins or set())}
        self.queries: list[str] = []

    def is_current_project_admin(self, code: str) -> bool:
        self.queries.append(code)
        return (code or "").strip().upper() in self.admins


@pytest.fixture(autouse=True)
def clean_actor():
    yield
    reset_current_actor(set_current_actor(None))


def make_scope(scope_id="scope-001", main="Main", backup="Backup"):
    scope = ScopeMonitoring(
        id=scope_id,
        name="Scope A",
        knowledge=KnowledgeBase(id="KB-00000001"),
        officials=Officials(main=main, backup=backup),
        billing_code="FACT-2026-PAI",
    )
    for day, errors in ((date(2026, 9, 18), 7), (date(2026, 9, 19), 2)):
        scope.add_daily_activity(
            DailyActivity(
                day=day,
                errors_reported=errors,
                incidents_created=1,
                feai=[f"INC{day.day:09d}"],
            )
        )
    return scope


def admin_edit(repo, admin_directory, audit=None, scope_id="scope-001",
               main="NewMain", backup="NewBackup"):
    UpdateScopeOfficialsUseCase(repo, admin_directory, audit).execute(
        UpdateScopeOfficialsCommand(
            scope_id=scope_id, official_main=main, official_backup=backup
        )
    )


def test_a_non_admin_is_refused():
    repo = InMemoryScopeMonitoringRepository()
    repo.save(make_scope())

    with pytest.raises(NotProjectAdminError):
        admin_edit(repo, FakeAdminDirectory(admins={"SOMA"}))


def test_the_refusal_precedes_the_lookup():
    """Un non-admin ne doit pas pouvoir sonder l'existence d'un périmètre : la
    permission est jugée avant la lecture, un id inconnu répond 403 et non 404.
    """
    repo = InMemoryScopeMonitoringRepository()
    audit = InMemoryAuditTrailRepository()

    with pytest.raises(NotProjectAdminError):
        admin_edit(
            repo,
            FakeAdminDirectory(admins=set()),
            audit,
            scope_id="scope-qui-n-existe-pas",
        )

    assert audit.events == []


def test_a_refusal_writes_nothing_and_audits_nothing():
    repo = InMemoryScopeMonitoringRepository()
    audit = InMemoryAuditTrailRepository()
    repo.save(make_scope())

    with pytest.raises(NotProjectAdminError):
        admin_edit(repo, FakeAdminDirectory(admins=set()), audit)

    assert repo.find_by_id("scope-001").officials.main == "Main"
    assert audit.events == []


def test_an_admin_edit_updates_both_officials():
    repo = InMemoryScopeMonitoringRepository()
    repo.save(make_scope())

    admin_edit(repo, FakeAdminDirectory(admins={"ABCD"}))

    scope = repo.find_by_id("scope-001")
    assert scope.officials.main == "NewMain"
    assert scope.officials.backup == "NewBackup"


def test_an_admin_edit_writes_only_the_officials():
    """L'§28.1 : une édition passe par une écriture ciblée du port, jamais par
    ``save()`` — qui réécrirait les journées relues avant l'édition concurrente.
    """
    repo = RecordingScopeMonitoringRepository(InMemoryScopeMonitoringRepository())
    repo.save(make_scope())
    repo.reset()

    admin_edit(repo, FakeAdminDirectory(admins={"ABCD"}))

    assert repo.writes == [
        ("update_officials", "scope-001", "NewMain", "NewBackup"),
    ]


def test_an_admin_edit_leaves_the_daily_activities_intact():
    repo = InMemoryScopeMonitoringRepository()
    repo.save(make_scope())

    admin_edit(repo, FakeAdminDirectory(admins={"ABCD"}))

    scope = repo.find_by_id("scope-001")
    assert scope.daily_activity_for(date(2026, 9, 18)).errors_reported == 7
    assert scope.daily_activity_for(date(2026, 9, 19)).feai == ["INC000000019"]


def test_an_admin_edit_keeps_the_billing_code_and_the_note():
    repo = InMemoryScopeMonitoringRepository()
    scope = make_scope()
    scope.set_note("à conserver")
    repo.save(scope)

    admin_edit(repo, FakeAdminDirectory(admins={"ABCD"}))

    stored = repo.find_by_id("scope-001")
    assert stored.billing_code == "FACT-2026-PAI"
    assert stored.note == "à conserver"


def test_the_edit_records_an_audit_event():
    repo = InMemoryScopeMonitoringRepository()
    audit = InMemoryAuditTrailRepository()
    repo.save(make_scope(main="Ancien", backup="Guerde"))
    set_current_actor("ABCD")

    admin_edit(repo, FakeAdminDirectory(admins={"ABCD"}), audit)

    assert len(audit.events) == 1
    event = audit.events[0]
    assert event.action == "scope_officials_updated"
    assert event.actor == "ABCD"
    assert event.scope_id == "scope-001"
    assert event.day is None
    assert event.changes == {
        "official_main": {"old": "Ancien", "new": "NewMain"},
        "official_backup": {"old": "Guerde", "new": "NewBackup"},
    }


def test_the_audit_event_carries_only_the_changed_field():
    """Un champ inchangé ne doit pas figurer dans le diff : l'événement raconte
    ce qui a été édité, pas l'état complet relu.
    """
    repo = InMemoryScopeMonitoringRepository()
    audit = InMemoryAuditTrailRepository()
    repo.save(make_scope(main="NewMain"))
    set_current_actor("ABCD")

    admin_edit(repo, FakeAdminDirectory(admins={"ABCD"}), audit)

    assert audit.events[0].changes == {
        "official_backup": {"old": "Backup", "new": "NewBackup"},
    }


def test_the_edit_records_nothing_when_officials_are_unchanged():
    repo = InMemoryScopeMonitoringRepository()
    audit = InMemoryAuditTrailRepository()
    repo.save(make_scope())

    admin_edit(
        repo, FakeAdminDirectory(admins={"ABCD"}), audit, main="Main", backup="Backup"
    )

    assert audit.events == []


def test_an_admin_without_scope_permission_on_an_unknown_scope_gets_a_404():
    """Pour un **admin**, la permission est établie : un id inconnu remonte
    alors la 404 métier, comme les autres écritures ciblées.
    """
    audit = InMemoryAuditTrailRepository()

    with pytest.raises(ScopeMonitoringNotFoundError):
        admin_edit(
            InMemoryScopeMonitoringRepository(),
            FakeAdminDirectory(admins={"ABCD"}),
            audit,
            scope_id="inconnu",
        )

    assert audit.events == []


def test_without_an_admin_directory_the_edit_is_permitted():
    """Mode dégradé sans authentification (dev/tests, ``auth=None``) : la
    seule cohérence possible avec ``project_context``, qui y est permissif.
    """
    repo = InMemoryScopeMonitoringRepository()
    repo.save(make_scope())

    UpdateScopeOfficialsUseCase(repo).execute(
        UpdateScopeOfficialsCommand(
            scope_id="scope-001", official_main="N1", official_backup="B1"
        )
    )

    assert repo.find_by_id("scope-001").officials.main == "N1"
    assert repo.find_by_id("scope-001").officials.backup == "B1"


def test_a_blank_official_is_refused_and_schedule_untouched():
    repo = InMemoryScopeMonitoringRepository()
    audit = InMemoryAuditTrailRepository()
    repo.save(make_scope())

    with pytest.raises(Exception):
        admin_edit(
            repo, FakeAdminDirectory(admins={"ABCD"}), audit, main="   "
        )

    assert repo.find_by_id("scope-001").officials.main == "Main"
    assert audit.events == []
