from datetime import date

from protab.domain.entities.daily_activity import DailyActivity
from protab.domain.entities.day_status import DayStatus
from protab.domain.entities.scope_monitoring import ScopeMonitoring
from protab.domain.exceptions import (
    DailyActivityNotFoundError,
    ScopeMonitoringAlreadyExistsError,
    ScopeMonitoringNameAlreadyExistsError,
    ScopeMonitoringNotFoundError,
)


class InMemoryScopeMonitoringRepository:
    def __init__(self) -> None:
        self._by_id: dict[str, ScopeMonitoring] = {}
        self._by_name: dict[str, ScopeMonitoring] = {}

    def save(self, scope: ScopeMonitoring) -> None:
        # Creation only, exactly like the SQL adapter: an existing row must not
        # be merged into, and a taken name must not be shadowed in the index.
        if scope.id in self._by_id:
            raise ScopeMonitoringAlreadyExistsError(
                f"ScopeMonitoring {scope.id!r} already exists."
            )
        if scope.name in self._by_name:
            raise ScopeMonitoringNameAlreadyExistsError(
                f"ScopeMonitoring with name {scope.name!r} already exists."
            )
        self._by_id[scope.id] = scope
        self._by_name[scope.name] = scope

    def insert_daily_activity(self, scope_id: str, activity: DailyActivity) -> None:
        scope = self._require(scope_id)
        scope.add_daily_activity(activity)

    def update_daily_activity(self, scope_id: str, activity: DailyActivity) -> None:
        stored = self._activity_for(scope_id, activity.day)
        # Reassign the validated values rather than keeping the caller's
        # object, so this adapter behaves like the SQL one instead of relying
        # on the shared reference it happens to hand out.
        stored.update(
            errors_reported=activity.errors_reported,
            incidents_created=activity.incidents_created,
            feai=list(activity.feai),
        )

    def set_activities_status(
        self,
        scope_id: str,
        days: list[date],
        status: DayStatus,
        *,
        ko_reason: str | None = None,
    ) -> None:
        scope = self._require(scope_id)
        if not days:
            raise ValueError("set_activities_status requires at least one day.")
        # Resolve every day before mutating any of them, so the request stays
        # all-or-none exactly as the single SQL statement is.
        resolved: list[DailyActivity] = []
        for day in dict.fromkeys(days):
            activity = scope.daily_activity_for(day)
            if activity is None:
                activity = DailyActivity(
                    day=day, errors_reported=0, incidents_created=0, feai=[]
                )
            resolved.append(activity)
        for activity in resolved:
            activity.apply_status(status, ko_reason=ko_reason)
            scope.daily_activities[activity.day] = activity

    def update_note(self, scope_id: str, note: str | None) -> None:
        self._require(scope_id).set_note(note)

    def update_officials(
        self, scope_id: str, official_main: str, official_backup: str
    ) -> None:
        # ``set_officials`` re-validates, so both adapters refuse the same
        # blank pair with the same domain exception (§28.1).
        self._require(scope_id).set_officials(official_main, official_backup)

    def find_by_id(self, scope_id: str) -> ScopeMonitoring | None:
        return self._by_id.get(scope_id)

    def find_by_name(self, name: str) -> ScopeMonitoring | None:
        return self._by_name.get(name)

    def find_all(self) -> list[ScopeMonitoring]:
        return list(self._by_id.values())

    def find_all_scope_names(self) -> dict[str, str]:
        return {scope.id: scope.name for scope in self._by_id.values()}

    def _require(self, scope_id: str) -> ScopeMonitoring:
        scope = self._by_id.get(scope_id)
        if scope is None:
            raise ScopeMonitoringNotFoundError(
                f"ScopeMonitoring {scope_id!r} not found."
            )
        return scope

    def _activity_for(self, scope_id: str, day: date) -> DailyActivity:
        activity = self._require(scope_id).daily_activity_for(day)
        if activity is None:
            raise DailyActivityNotFoundError(
                f"No DailyActivity for day {day!r} on scope {scope_id!r}."
            )
        return activity
