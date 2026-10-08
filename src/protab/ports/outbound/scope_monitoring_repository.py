from datetime import date
from typing import Protocol

from protab.domain.entities.daily_activity import DailyActivity
from protab.domain.entities.day_status import DayStatus
from protab.domain.entities.scope_monitoring import ScopeMonitoring


class ScopeMonitoringRepository(Protocol):
    def save(self, scope: ScopeMonitoring) -> None:
        """Create the given ScopeMonitoring and its activities.

        Creation only: an already stored scope is never merged into, because the
        aggregate was read before someone else may have edited it. A use case
        that mutates an existing scope must use the targeted methods below.

        Raises:
            ScopeMonitoringAlreadyExistsError: the id is already taken.
            ScopeMonitoringNameAlreadyExistsError: the name is already taken.
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

        The status is not part of the write: it is owned by
        ``set_activities_status``, so a counters edit can never finish a day.

        Raises:
            DailyActivityNotFoundError: the scope has no activity for that day.
        """
        ...

    def set_activities_status(
        self,
        scope_id: str,
        days: list[date],
        status: DayStatus,
        *,
        ko_reason: str | None = None,
    ) -> None:
        """Set the status of the given days of one scope.

        One statement for the whole list, so the request is all-or-none. A day
        that has no activity yet is created with zeroed counters: reporting a day
        as KO is precisely what somebody does when they could not enter anything,
        so requiring a row first would make the status unusable exactly where it
        is needed.

        The upsert rewrites ``status`` and ``ko_reason`` and nothing else — it
        never merges counters a caller has not re-read. Its consequence is that
        ``rowcount`` cannot tell a missing day from an updated one, so the
        refusal of a day that does not exist is the use case's business, not this
        method's; what it does still raise is a scope the current project cannot
        see.

        ``ko_reason`` is written verbatim: refusing a reason on a day that is not
        KO is the domain entity's invariant, so that every implementation rejects
        it the same way.

        Raises:
            ScopeMonitoringNotFoundError: the scope does not exist in the current
                project.
        """
        ...

    def update_note(self, scope_id: str, note: str | None) -> None:
        """Overwrite the free-text note of one scope, leaving everything else alone.

        ``None`` means "no note"; the repository stores it as SQL ``NULL``.

        Raises:
            ScopeMonitoringNotFoundError: the scope does not exist in the
                current project.
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
