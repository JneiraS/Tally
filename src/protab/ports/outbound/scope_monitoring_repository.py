from datetime import date
from typing import Protocol

from protab.domain.entities.daily_activity import DailyActivity
from protab.domain.entities.scope_monitoring import ScopeMonitoring


class ScopeMonitoringRepository(Protocol):
    def save(self, scope: ScopeMonitoring) -> None:
        """Persist the given ScopeMonitoring.

        Replaces the whole aggregate: the scope row and every one of its
        activities. Reserved for aggregate creation (scope import); a use case
        that mutates an existing scope must use the targeted methods below, or
        it will rewrite days it never read after a concurrent edit.
        """
        ...

    def insert_daily_activity(self, scope_id: str, activity: DailyActivity) -> None:
        """Add one activity to an existing scope.

        Raises:
            DuplicateDailyActivityError: the scope already has an activity for
                that day.
        """
        ...

    def update_daily_activity(self, scope_id: str, activity: DailyActivity) -> None:
        """Overwrite the counters of a single day, leaving the others alone.

        The completion flags are not part of the write: they are owned by
        ``mark_activities_completed``.

        Raises:
            DailyActivityNotFoundError: the scope has no activity for that day.
        """
        ...

    def mark_activities_completed(self, scope_id: str, days: list[date]) -> None:
        """Flag the given days as handled and completed.

        Counters are never modified, and the days are written in a single
        statement so the request stays all-or-nothing.

        Raises:
            DailyActivityNotFoundError: the scope has no activity for one of
                the given days.
        """
        ...

    def find_by_id(self, scope_id: str) -> ScopeMonitoring | None:
        """Return the ScopeMonitoring with the given id, or None."""
        ...

    def find_by_name(self, name: str) -> ScopeMonitoring | None:
        """Return the ScopeMonitoring with the given name, or None."""
        ...

    def find_all(self) -> list[ScopeMonitoring]:
        """Return all ScopeMonitorings."""
        ...

    def find_all_scope_names(self) -> dict[str, str]:
        """Return a mapping of scope ids to names."""
        ...
