import csv
from datetime import date

from fastapi import FastAPI, UploadFile

from protab.adapters.inbound.api.errors import register_exception_handlers
from protab.adapters.inbound.api.schemas import (
    ActivityResponse,
    CompleteRequest,
    CreateActivityRequest,
    CreatedResponse,
    CreateScopeItem,
    ScopeResponse,
    UpdateRequest,
)
from protab.adapters.inbound.csv.scope_monitoring_csv_reader import (
    parse_scope_monitorings_csv,
)
from protab.adapters.inbound.api.config import database_url_from_env
from protab.adapters.outbound.persistence.in_memory_scope_monitoring_repository import (
    InMemoryScopeMonitoringRepository,
)
from protab.adapters.outbound.persistence.postgres_scope_monitoring_repository import (
    PostgresScopeMonitoringRepository,
)
from protab.ports.outbound.scope_monitoring_repository import (
    ScopeMonitoringRepository,
)
from protab.application.commands.create_scope_monitoring import (
    CreateScopeMonitoringCommand,
)
from protab.application.commands.daily_activity import (
    CompleteDailyActivityCommand,
    CreateDailyActivityCommand,
    UpdateDailyActivityCommand,
)
from protab.application.queries.get_daily_activity import GetDailyActivityUseCase
from protab.application.queries.get_scope import GetScopeUseCase
from protab.application.queries.list_scopes import ListScopesUseCase
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
from protab.domain.entities.scope_monitoring import ScopeMonitoring


def _activity_to_response(activity: DailyActivity) -> ActivityResponse:
    return ActivityResponse(
        day=activity.day,
        errors_reported=activity.errors_reported,
        incidents_created=activity.incidents_created,
        feai=activity.feai,
        handled=activity.handled,
        completed=activity.completed,
    )


def _scope_to_response(scope: ScopeMonitoring) -> ScopeResponse:
    return ScopeResponse(
        id=scope.id,
        name=scope.name,
        knowledge_base_id=scope.knowledge.id,
        official_main=scope.officials.main,
        official_backup=scope.officials.backup,
        daily_activities=[
            _activity_to_response(activity)
            for activity in scope.daily_activities.values()
        ],
    )


def build_repository() -> ScopeMonitoringRepository:
    """Select the persistence adapter from configuration.

    A ``DATABASE_URL`` present in the environment selects PostgreSQL;
    otherwise the in-memory repository is used (default for tests/demo).
    """
    dsn = database_url_from_env()
    if dsn is not None:
        repository = PostgresScopeMonitoringRepository(dsn)
        repository.connect()
        return repository
    return InMemoryScopeMonitoringRepository()


def create_app(
    repository: ScopeMonitoringRepository | None = None,
) -> FastAPI:
    repo = repository if repository is not None else build_repository()
    create_scope_monitoring = CreateScopeMonitoringUseCase(repo)
    create_daily_activity = CreateDailyActivityUseCase(repo)
    complete_daily_activity = CompleteDailyActivityUseCase(repo)
    update_daily_activity = UpdateDailyActivityUseCase(repo)
    list_scopes = ListScopesUseCase(repo)
    get_scope = GetScopeUseCase(repo)
    get_daily_activity = GetDailyActivityUseCase(repo)

    app = FastAPI(title="ProTab API")
    register_exception_handlers(app)

    @app.get("/healthz")
    def healthz() -> dict[str, str]:
        return {"status": "ok"}

    @app.post("/scope-monitorings", response_model=CreatedResponse, status_code=201)
    def create_scope_monitorings(items: list[CreateScopeItem]) -> CreatedResponse:
        commands = [
            CreateScopeMonitoringCommand(
                name=item.name,
                knowledge_base_id=item.knowledge_base_id,
                official_main=item.official_main,
                official_backup=item.official_backup,
            )
            for item in items
        ]
        ids = create_scope_monitoring.execute(commands)
        return CreatedResponse(ids=ids)

    @app.post(
        "/scope-monitorings/import-csv",
        response_model=CreatedResponse,
        status_code=201,
    )
    async def import_scope_monitorings_csv(csv_file: UploadFile) -> CreatedResponse:
        raw = (await csv_file.read()).decode("utf-8")
        rows = list(csv.reader(raw.splitlines()))
        commands = parse_scope_monitorings_csv(rows)
        ids = create_scope_monitoring.execute(commands)
        return CreatedResponse(ids=ids)

    @app.post(
        "/scope-monitorings/{scope_id}/activities",
        status_code=201,
    )
    def handle_create_daily_activity(
        scope_id: str, request: CreateActivityRequest
    ) -> None:
        create_daily_activity.execute(
            CreateDailyActivityCommand(
                scope_id=scope_id,
                day=request.day,
                errors_reported=request.errors_reported,
                incidents_created=request.incidents_created,
                feai=request.feai,
            )
        )

    @app.post(
        "/scope-monitorings/{scope_id}/activities/complete",
        status_code=204,
    )
    def complete_daily_activities(scope_id: str, request: CompleteRequest) -> None:
        complete_daily_activity.execute(
            CompleteDailyActivityCommand(scope_id=scope_id, days=request.days)
        )

    @app.patch(
        "/scope-monitorings/{scope_id}/activities/{day}",
        status_code=204,
    )
    def handle_update_daily_activity(
        scope_id: str, day: date, request: UpdateRequest
    ) -> None:
        update_daily_activity.execute(
            UpdateDailyActivityCommand(
                scope_id=scope_id,
                day=day,
                errors_reported=request.errors_reported,
                incidents_created=request.incidents_created,
                feai=request.feai,
            )
        )

    @app.get("/scope-monitorings", response_model=list[ScopeResponse])
    def list_scope_monitorings() -> list[ScopeResponse]:
        return [_scope_to_response(scope) for scope in list_scopes.execute()]

    @app.get("/scope-monitorings/{scope_id}", response_model=ScopeResponse)
    def get_scope_monitoring(scope_id: str) -> ScopeResponse:
        return _scope_to_response(get_scope.execute(scope_id))

    @app.get(
        "/scope-monitorings/{scope_id}/activities/{day}",
        response_model=ActivityResponse,
    )
    def get_scope_daily_activity(scope_id: str, day: date) -> ActivityResponse:
        return _activity_to_response(get_daily_activity.execute(scope_id, day))

    return app


app = create_app()