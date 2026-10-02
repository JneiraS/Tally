"""A ScopeMonitoringRepository decorator that records the calls it receives.

``InMemoryScopeMonitoringRepository`` hands back the very objects it stores, so
two implementations that persist differently are indistinguishable from the
outside: mutating the aggregate in place and rewriting it wholesale both look
like a success. Observing *which* write the use case performs is therefore the
only way to assert the contract that an activity update must never rewrite a
whole scope. Reads and writes are delegated, so tests can seed and assert on
behaviour as usual.
"""

from datetime import date

from protab.domain.entities.daily_activity import DailyActivity
from protab.domain.entities.scope_monitoring import ScopeMonitoring


class RecordingScopeMonitoringRepository:
    def __init__(self, inner) -> None:
        self._inner = inner
        self.calls: list[tuple] = []

    def reset(self) -> None:
        self.calls.clear()

    @property
    def writes(self) -> list[tuple]:
        return [call for call in self.calls if call[0] != "find_by_id"]

    def save(self, scope: ScopeMonitoring) -> None:
        self.calls.append(("save", scope.id))
        self._inner.save(scope)

    def insert_daily_activity(
        self, scope_id: str, activity: DailyActivity
    ) -> None:
        self.calls.append(("insert_daily_activity", scope_id, activity.day))
        self._inner.insert_daily_activity(scope_id, activity)

    def update_daily_activity(
        self, scope_id: str, activity: DailyActivity
    ) -> None:
        self.calls.append(("update_daily_activity", scope_id, activity.day))
        self._inner.update_daily_activity(scope_id, activity)

    def mark_activities_completed(self, scope_id: str, days: list[date]) -> None:
        self.calls.append(("mark_activities_completed", scope_id, tuple(days)))
        self._inner.mark_activities_completed(scope_id, days)

    def update_note(self, scope_id: str, note: str | None) -> None:
        self.calls.append(("update_note", scope_id, note))
        self._inner.update_note(scope_id, note)

    def find_by_id(self, scope_id: str) -> ScopeMonitoring | None:
        return self._inner.find_by_id(scope_id)

    def find_by_name(self, name: str) -> ScopeMonitoring | None:
        return self._inner.find_by_name(name)

    def find_all(self) -> list[ScopeMonitoring]:
        return self._inner.find_all()

    def find_all_scope_names(self) -> dict[str, str]:
        return self._inner.find_all_scope_names()
