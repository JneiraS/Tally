from protab.domain.entities.audit_event import AuditEvent, build_changes


def test_build_changes_keeps_only_different_fields():
    before = {"errors_reported": 2, "incidents_created": 1, "feai": ["INC000000001"]}
    after = {"errors_reported": 5, "incidents_created": 1, "feai": ["INC000000001", "INC000000002"]}

    changes = build_changes(before, after)

    assert changes == {
        "errors_reported": {"old": 2, "new": 5},
        "feai": {
            "old": ["INC000000001"],
            "new": ["INC000000001", "INC000000002"],
        },
    }
    assert "incidents_created" not in changes


def test_build_changes_empty_when_identical():
    before = {"errors_reported": 2, "incidents_created": 1, "feai": []}
    assert build_changes(before, dict(before)) == {}


def test_build_changes_from_empty_keeps_all_fields():
    changes = build_changes({}, {"a": 1, "b": "x"})
    assert changes == {"a": {"old": None, "new": 1}, "b": {"old": None, "new": "x"}}


def test_build_changes_handles_removed_fields():
    changes = build_changes({"status": "completed", "ko_reason": "Panne"}, {})
    assert changes["status"] == {"old": "completed", "new": None}
    assert changes["ko_reason"] == {"old": "Panne", "new": None}


def test_audit_event_defaults():
    event = AuditEvent(action="activity_updated", actor="ABCD", scope_id="s1")
    assert event.id
    assert event.project_id is None
    assert event.day is None
    assert event.changes == {}
    assert event.created_at is not None