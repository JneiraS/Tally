from datetime import date

import pytest

from protab.adapters.outbound.persistence.in_memory_audit_trail_repository import (
    InMemoryAuditTrailRepository,
)
from protab.adapters.outbound.persistence.in_memory_scope_monitoring_repository import (
    InMemoryScopeMonitoringRepository,
)
from protab.application.actor_context import reset_current_actor, set_current_actor
from protab.application.commands.create_scope_monitoring import (
    CreateScopeMonitoringCommand,
)
from protab.application.commands.daily_activity import (
    CompleteDailyActivityCommand,
    CreateDailyActivityCommand,
    UpdateDailyActivityCommand,
)
from protab.application.queries.list_audit_events import ListAuditEventsUseCase
from protab.application.use_cases.complete_daily_activity import (
    CompleteDailyActivityUseCase,
)
from protab.application.use_cases.create_daily_activity import (
    CreateDailyActivityUseCase,
)
from protab.application.use_cases.create_scope_monitoring import (
    CreateScopeMonitoringUseCase,
)
from protab.application.use_cases.update_daily_activity import (
    UpdateDailyActivityUseCase,
)
from protab.domain.entities.daily_activity import DailyActivity
from protab.domain.entities.scope_monitoring import (
    KnowledgeBase,
    Officials,
    ScopeMonitoring,
)
from protab.ports.outbound.audit_trail_repository import AuditEventQuery


@pytest.fixture(autouse=True)
def clean_actor():
    yield
    reset_current_actor(set_current_actor(None))


def make_scope_with_activity(scope_id="scope-001", day=date(2026, 9, 19)):
    repo = InMemoryScopeMonitoringRepository()
    scope = ScopeMonitoring(
        id=scope_id,
        name="Scope A",
        knowledge=KnowledgeBase(id="KB-00000001"),
        officials=Officials(main="Main", backup="Backup"),
    )
    scope.add_daily_activity(
        DailyActivity(
            day=day,
            errors_reported=2,
            incidents_created=1,
            feai=["INC000000001"],
        )
    )
    repo.save(scope)
    return repo


def test_create_scope_records_audit_event_with_actor():
    repo = InMemoryScopeMonitoringRepository()
    audit = InMemoryAuditTrailRepository()
    set_current_actor("ABCD")

    ids = CreateScopeMonitoringUseCase(repo, audit).execute(
        [
            CreateScopeMonitoringCommand(
                name="Scope A",
                knowledge_base_id="KB-00000001",
                official_main="Main",
                official_backup="Backup",
                billing_code="FACT-2026-PAI",
            )
        ]
    )

    events = audit.list(AuditEventQuery())
    assert len(events) == 1
    event = events[0]
    assert event.action == "scope_created"
    assert event.actor == "ABCD"
    assert event.scope_id == ids[0]
    assert event.changes["name"]["new"] == "Scope A"
    assert event.changes["billing_code"]["new"] == "FACT-2026-PAI"


def test_create_scope_from_csv_records_import_action():
    repo = InMemoryScopeMonitoringRepository()
    audit = InMemoryAuditTrailRepository()

    CreateScopeMonitoringUseCase(repo, audit).execute(
        [
            CreateScopeMonitoringCommand(
                name="Scope CSV",
                knowledge_base_id="KB-00000002",
                official_main="Main",
                official_backup="Backup",
                billing_code="FACT-2026-PAI",
            )
        ],
        source="csv",
    )

    assert audit.list(AuditEventQuery())[0].action == "scope_imported"


def test_create_activity_records_audit_event():
    repo = make_scope_with_activity()
    audit = InMemoryAuditTrailRepository()

    CreateDailyActivityUseCase(repo, audit).execute(
        CreateDailyActivityCommand(
            scope_id="scope-001",
            day=date(2026, 9, 20),
            errors_reported=3,
            incidents_created=2,
            feai=["INC000000001"],
        )
    )

    events = audit.list(AuditEventQuery())
    assert len(events) == 1
    event = events[0]
    assert event.action == "activity_created"
    assert event.scope_id == "scope-001"
    assert event.day == date(2026, 9, 20)
    assert event.changes["errors_reported"] == {"old": None, "new": 3}


def test_update_activity_records_audit_event_with_diff():
    repo = make_scope_with_activity()
    audit = InMemoryAuditTrailRepository()

    UpdateDailyActivityUseCase(repo, audit).execute(
        UpdateDailyActivityCommand(
            scope_id="scope-001",
            day=date(2026, 9, 19),
            errors_reported=5,
            incidents_created=1,
            feai=["INC000000001"],
        )
    )

    events = audit.list(AuditEventQuery())
    assert len(events) == 1
    event = events[0]
    assert event.action == "activity_updated"
    assert event.changes == {
        "errors_reported": {"old": 2, "new": 5},
    }

    # Pas d'événement si rien ne change
    audit.events.clear()
    UpdateDailyActivityUseCase(repo, audit).execute(
        UpdateDailyActivityCommand(
            scope_id="scope-001",
            day=date(2026, 9, 19),
            errors_reported=5,
            incidents_created=1,
            feai=["INC000000001"],
        )
    )
    assert audit.list(AuditEventQuery()) == []


def test_complete_activity_records_audit_event_per_day():
    repo = make_scope_with_activity()
    repo.insert_daily_activity(
        "scope-001",
        DailyActivity(
            day=date(2026, 9, 20),
            errors_reported=1,
            incidents_created=0,
            feai=[],
        ),
    )
    audit = InMemoryAuditTrailRepository()

    CompleteDailyActivityUseCase(repo, audit).execute(
        CompleteDailyActivityCommand(
            scope_id="scope-001",
            days=[date(2026, 9, 19), date(2026, 9, 20)],
        )
    )

    events = audit.list(AuditEventQuery())
    assert len(events) == 2
    assert all(event.action == "activity_completed" for event in events)
    assert {event.day for event in events} == {
        date(2026, 9, 19),
        date(2026, 9, 20),
    }
    assert events[0].changes["completed"] == {"old": False, "new": True}


def test_no_repository_keeps_working_without_audit():
    repo = make_scope_with_activity()
    CreateDailyActivityUseCase(repo).execute(
        CreateDailyActivityCommand(
            scope_id="scope-001",
            day=date(2026, 9, 21),
            errors_reported=0,
            incidents_created=0,
            feai=[],
        )
    )
    scope = repo.find_by_id("scope-001")
    assert scope is not None
    assert scope.daily_activity_for(date(2026, 9, 21)) is not None


def test_list_audit_events_applies_filters():
    repo = InMemoryScopeMonitoringRepository()
    audit = InMemoryAuditTrailRepository()
    use_case = CreateScopeMonitoringUseCase(repo, audit)

    ids = use_case.execute(
        [
            CreateScopeMonitoringCommand(
                name="Scope Alpha",
                knowledge_base_id="KB-00000001",
                official_main="Main",
                official_backup="Backup",
                billing_code="FACT-2026-PAI",
            ),
            CreateScopeMonitoringCommand(
                name="Scope Beta",
                knowledge_base_id="KB-00000002",
                official_main="Main",
                official_backup="Backup",
                billing_code="FACT-2026-PAI",
            ),
        ]
    )

    query = ListAuditEventsUseCase(audit)
    assert len(query.execute(AuditEventQuery())) == 2
    assert len(query.execute(AuditEventQuery(scope_ids=(ids[0],)))) == 1
    assert query.execute(AuditEventQuery(scope_ids=(ids[0],)))[0].scope_id == ids[0]
    assert len(query.execute(AuditEventQuery(action="scope_created"))) == 2
    assert len(query.execute(AuditEventQuery(action="activity_created"))) == 0
    assert len(query.execute(AuditEventQuery(limit=1))) == 1

    # Le use case ne filtre pas : il délègue au port. La sémantique du filtrage
    # acteur est verrouillée par tests/unit/adapters/audit_trail_filter_test.py.
    assert len(query.execute(AuditEventQuery(actor=None))) == 2
