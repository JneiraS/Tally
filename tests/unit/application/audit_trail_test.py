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
    SetActivitiesStatusCommand,
    CreateDailyActivityCommand,
    UpdateDailyActivityCommand,
)
from protab.application.queries.list_audit_events import ListAuditEventsUseCase
from protab.application.use_cases.set_activities_status import (
    SetActivitiesStatusUseCase,
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
from protab.domain.entities.day_status import DayStatus
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

    SetActivitiesStatusUseCase(repo, audit).execute(
        SetActivitiesStatusCommand(
            scope_id="scope-001",
            days=[date(2026, 9, 19), date(2026, 9, 20)],
            status=DayStatus.COMPLETED,
        )
    )

    events = audit.list(AuditEventQuery())
    assert len(events) == 2
    assert all(event.action == "activity_completed" for event in events)
    assert {event.day for event in events} == {
        date(2026, 9, 19),
        date(2026, 9, 20),
    }
    assert events[0].changes["status"] == {"old": "pending", "new": "completed"}


def test_marking_a_ko_records_the_reason_it_erased_completion_kept():
    repo = make_scope_with_activity()
    audit = InMemoryAuditTrailRepository()

    SetActivitiesStatusUseCase(repo, audit).execute(
        SetActivitiesStatusCommand(
            scope_id="scope-001",
            days=[date(2026, 9, 19)],
            status=DayStatus.KO,
            ko_reason="Collecteur indisponible",
        )
    )

    events = audit.list(AuditEventQuery())
    assert len(events) == 1
    assert events[0].action == "activity_ko"
    assert events[0].changes == {
        "status": {"old": "pending", "new": "ko"},
        "ko_reason": {"old": None, "new": "Collecteur indisponible"},
    }


def test_lifting_a_ko_is_audited_as_the_transition_it_is():
    """``activity_ko`` covers both directions, and ``changes`` disambiguates.

    A separate action name for lifting would give two rows for one couple of
    values and leave a reader guessing which of them unblocked the day.
    """
    repo = make_scope_with_activity()
    audit = InMemoryAuditTrailRepository()
    use_case = SetActivitiesStatusUseCase(repo, audit)

    use_case.execute(
        SetActivitiesStatusCommand(
            scope_id="scope-001",
            days=[date(2026, 9, 19)],
            status=DayStatus.KO,
            ko_reason="Collecteur indisponible",
        )
    )
    use_case.execute(
        SetActivitiesStatusCommand(
            scope_id="scope-001",
            days=[date(2026, 9, 19)],
            status=DayStatus.PENDING,
        )
    )

    events = audit.list(AuditEventQuery())
    # The trail returns the newest event first, so index 0 is the lift and index 1
    # the marking — which is also why the assertion is written in that order.
    assert [event.action for event in events] == ["activity_ko", "activity_ko"]
    assert events[0].changes == {
        "status": {"old": "ko", "new": "pending"},
        "ko_reason": {"old": "Collecteur indisponible", "new": None},
    }
    assert events[1].changes == {
        "status": {"old": "pending", "new": "ko"},
        "ko_reason": {"old": None, "new": "Collecteur indisponible"},
    }


def test_the_reason_a_completion_erased_stays_in_the_audit_trail():
    """The KO reason is cleared from the row on completion — the trail keeps it.

    A completed day must not carry a blocking reason, but that is exactly the
    case where a reader will ask "what happened?", so the information has to
    survive somewhere.
    """
    repo = make_scope_with_activity()
    audit = InMemoryAuditTrailRepository()
    use_case = SetActivitiesStatusUseCase(repo, audit)

    use_case.execute(
        SetActivitiesStatusCommand(
            scope_id="scope-001",
            days=[date(2026, 9, 19)],
            status=DayStatus.KO,
            ko_reason="Collecteur indisponible",
        )
    )
    use_case.execute(
        SetActivitiesStatusCommand(
            scope_id="scope-001",
            days=[date(2026, 9, 19)],
            status=DayStatus.COMPLETED,
        )
    )

    activity = repo.find_by_id("scope-001").daily_activity_for(date(2026, 9, 19))
    assert activity.ko_reason is None
    reasons = [
        event.changes.get("ko_reason", {}).get("old")
        for event in audit.list(AuditEventQuery())
    ]
    assert "Collecteur indisponible" in reasons


def test_setting_the_status_it_already_has_records_nothing():
    repo = make_scope_with_activity()
    audit = InMemoryAuditTrailRepository()

    SetActivitiesStatusUseCase(repo, audit).execute(
        SetActivitiesStatusCommand(
            scope_id="scope-001",
            days=[date(2026, 9, 19)],
            status=DayStatus.KO,
            ko_reason="Panne",
        )
    )
    SetActivitiesStatusUseCase(repo, audit).execute(
        SetActivitiesStatusCommand(
            scope_id="scope-001",
            days=[date(2026, 9, 19)],
            status=DayStatus.KO,
            ko_reason="Panne",
        )
    )

    events = audit.list(AuditEventQuery())
    assert len(events) == 1


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
