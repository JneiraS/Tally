import csv
from collections.abc import AsyncIterator
from datetime import date

from fastapi import Depends, FastAPI, Request, Response, UploadFile

from protab.adapters.inbound.api.auth import (
    clear_session_cookie,
    current_user,
    set_session_cookie,
)
from protab.adapters.outbound.persistence.postgres_auth_repository import Project
from protab.adapters.inbound.api.config import database_url_from_env
from protab.adapters.inbound.api.errors import register_exception_handlers
from protab.adapters.inbound.api.schemas import (
    ActivityResponse,
    AuditEventResponse,
    CompleteRequest,
    CreateActivityRequest,
    CreatedResponse,
    CreateScopeItem,
    LoginRequest,
    LoginResponse,
    NonWorkingDaysRequest,
    ProjectResponse,
    ScopeResponse,
    SessionResponse,
    UpdateRequest,
    UpdateScopeNoteRequest,
)
from protab.adapters.inbound.csv.scope_monitoring_csv_reader import (
    parse_scope_monitorings_csv,
)
from protab.adapters.outbound.persistence.in_memory_audit_trail_repository import (
    InMemoryAuditTrailRepository,
)
from protab.adapters.outbound.persistence.postgres_audit_trail_repository import (
    PostgresAuditTrailRepository,
)
from protab.adapters.outbound.persistence.postgres_auth_repository import (
    PostgresAuthRepository,
)
from protab.adapters.outbound.persistence.postgres_scope_monitoring_repository import (
    PostgresScopeMonitoringRepository,
    reset_current_project,
    set_current_project,
)
from protab.application.actor_context import (
    reset_current_actor,
    set_current_actor,
)
from protab.application.commands.create_scope_monitoring import (
    CreateScopeMonitoringCommand,
)
from protab.application.commands.daily_activity import (
    CompleteDailyActivityCommand,
    CreateDailyActivityCommand,
    UpdateDailyActivityCommand,
)
from protab.application.commands.scope_monitoring import (
    UpdateScopeNoteCommand,
)
from protab.application.queries.get_daily_activity import GetDailyActivityUseCase
from protab.application.queries.get_scope import GetScopeUseCase
from protab.application.queries.list_audit_events import ListAuditEventsUseCase
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
from protab.application.use_cases.update_scope_note import (
    UpdateScopeNoteUseCase,
)
from protab.domain.entities.audit_event import AuditEvent
from protab.domain.entities.daily_activity import DailyActivity
from protab.domain.entities.scope_monitoring import ScopeMonitoring
from protab.ports.outbound.audit_trail_repository import (
    AuditEventQuery,
    AuditTrailRepository,
)
from protab.ports.outbound.scope_monitoring_repository import (
    ScopeMonitoringRepository,
)


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
        billing_code=scope.billing_code,
        note=scope.note,
        daily_activities=[
            _activity_to_response(activity)
            for activity in scope.daily_activities.values()
        ],
    )


def _project_to_response(project: Project) -> ProjectResponse:
    return ProjectResponse(
        id=project.id,
        name=project.name,
        non_working_days=project.non_working_days.to_dict(),
    )


def _audit_event_to_response(
    event: AuditEvent, scope_name: str | None = None
) -> AuditEventResponse:
    return AuditEventResponse(
        id=event.id,
        actor=event.actor,
        action=event.action,
        scope_id=event.scope_id,
        scope_name=scope_name,
        day=event.day,
        created_at=event.created_at,
        changes=event.changes,
    )


def build_repository() -> ScopeMonitoringRepository:
    """Select the persistence adapter from configuration.

    PostgreSQL is required for the running API. In-memory repositories can
    still be injected explicitly by tests through ``create_app``.
    """
    dsn = database_url_from_env()
    if dsn is None:
        raise RuntimeError(
            "DATABASE_URL est obligatoire : le backend ProTab nécessite PostgreSQL. "
            "Configurez cette variable avec les valeurs de .env.example."
        )

    repository = PostgresScopeMonitoringRepository(dsn)
    repository.connect()
    return repository


def create_app(
    repository: ScopeMonitoringRepository | None = None,
    auth_repository: PostgresAuthRepository | None = None,
    audit_repository: AuditTrailRepository | None = None,
) -> FastAPI:
    owns_repository = repository is None
    owns_auth_repository = auth_repository is None and repository is None
    owns_audit_repository = audit_repository is None and repository is None
    repo = repository if repository is not None else build_repository()
    auth = auth_repository
    if auth is None and repository is None:
        dsn = database_url_from_env()
        assert dsn is not None
        auth = PostgresAuthRepository(dsn)
        auth.connect()
    audit = audit_repository
    if audit is None:
        if repository is None:
            dsn = database_url_from_env()
            assert dsn is not None
            audit = PostgresAuditTrailRepository(dsn)
            audit.connect()
        else:
            audit = InMemoryAuditTrailRepository()
    managed_repositories = [
        persistence
        for persistence, owned in (
            (repo, owns_repository),
            (auth, owns_auth_repository),
            (audit, owns_audit_repository),
        )
        if owned and persistence is not None
    ]
    create_scope_monitoring = CreateScopeMonitoringUseCase(repo, audit)
    create_daily_activity = CreateDailyActivityUseCase(repo, audit)
    complete_daily_activity = CompleteDailyActivityUseCase(repo, audit)
    update_daily_activity = UpdateDailyActivityUseCase(repo, audit)
    update_scope_note = UpdateScopeNoteUseCase(repo, audit)
    list_audit_events = ListAuditEventsUseCase(audit)
    list_scopes = ListScopesUseCase(repo)
    get_scope = GetScopeUseCase(repo)
    get_daily_activity = GetDailyActivityUseCase(repo)

    app = FastAPI(title="ProTab API")
    register_exception_handlers(app)

    def close_persistence() -> None:
        for persistence in managed_repositories:
            close = getattr(persistence, "close", None)
            if callable(close):
                close()

    app.router.on_shutdown.append(close_persistence)

    async def project_context(request: Request) -> AsyncIterator[None]:
        if auth is None:
            yield
            return
        user = current_user(request, auth)
        token = set_current_project(user.project.id)
        actor_token = set_current_actor(user.session.quadrigramme)
        try:
            yield
        finally:
            reset_current_actor(actor_token)
            reset_current_project(token)

    @app.get("/healthz")
    def healthz() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/projects", response_model=list[ProjectResponse])
    def list_projects() -> list[ProjectResponse]:
        if auth is None:
            return []
        return [_project_to_response(project) for project in auth.list_projects()]

    @app.post("/auth/login", response_model=LoginResponse)
    def login(payload: LoginRequest, response: Response) -> LoginResponse:
        if auth is None or not auth.authenticate(
            payload.project_id, payload.quadrigramme, payload.password
        ):
            from fastapi import HTTPException

            raise HTTPException(
                status_code=401, detail="Projet, quadrigramme ou mot de passe invalide."
            )
        session = auth.create_session(payload.project_id, payload.quadrigramme)
        project = auth.get_project(payload.project_id)
        assert project is not None
        set_session_cookie(response, session.token)
        return LoginResponse(
            project=_project_to_response(project),
            quadrigramme=session.quadrigramme,
        )

    @app.get("/auth/me", response_model=SessionResponse)
    def me(request: Request) -> SessionResponse:
        if auth is None:
            from fastapi import HTTPException

            raise HTTPException(status_code=401, detail="Authentification requise.")
        user = current_user(request, auth)
        return SessionResponse(
            project=_project_to_response(user.project),
            quadrigramme=user.session.quadrigramme,
        )

    @app.get(
        "/project/settings",
        response_model=ProjectResponse,
        dependencies=[Depends(project_context)],
    )
    def get_project_settings(request: Request) -> ProjectResponse:
        if auth is None:
            from fastapi import HTTPException

            raise HTTPException(status_code=401, detail="Authentification requise.")
        user = current_user(request, auth)
        project = auth.get_project(user.project.id)
        if project is None:
            from fastapi import HTTPException

            raise HTTPException(status_code=404, detail="Projet introuvable.")
        return _project_to_response(project)

    @app.put(
        "/project/settings",
        response_model=ProjectResponse,
        dependencies=[Depends(project_context)],
    )
    def update_project_settings(
        request: Request, payload: NonWorkingDaysRequest
    ) -> ProjectResponse:
        if auth is None:
            from fastapi import HTTPException

            raise HTTPException(status_code=401, detail="Authentification requise.")
        user = current_user(request, auth)
        project = auth.update_non_working_days(
            user.project.id,
            payload.excluded_weekdays,
            [day.isoformat() for day in payload.excluded_dates],
        )
        if project is None:
            from fastapi import HTTPException

            raise HTTPException(status_code=404, detail="Projet introuvable.")
        return _project_to_response(project)

    @app.post("/auth/logout", status_code=204)
    def logout(request: Request, response: Response) -> None:
        if auth is not None:
            token = request.cookies.get("protab_session")
            if token:
                auth.delete_session(token)
        clear_session_cookie(response)

    @app.post(
        "/scope-monitorings",
        response_model=CreatedResponse,
        status_code=201,
        dependencies=[Depends(project_context)],
    )
    def create_scope_monitorings(items: list[CreateScopeItem]) -> CreatedResponse:
        commands = [
            CreateScopeMonitoringCommand(
                name=item.name,
                knowledge_base_id=item.knowledge_base_id,
                official_main=item.official_main,
                official_backup=item.official_backup,
                billing_code=item.billing_code,
            )
            for item in items
        ]
        ids = create_scope_monitoring.execute(commands, source="manual")
        return CreatedResponse(ids=ids)

    @app.post(
        "/scope-monitorings/import-csv",
        response_model=CreatedResponse,
        status_code=201,
        dependencies=[Depends(project_context)],
    )
    async def import_scope_monitorings_csv(csv_file: UploadFile) -> CreatedResponse:
        raw = (await csv_file.read()).decode("utf-8")
        rows = list(csv.reader(raw.splitlines()))
        commands = parse_scope_monitorings_csv(rows)
        ids = create_scope_monitoring.execute(commands, source="csv")
        return CreatedResponse(ids=ids)

    @app.post(
        "/scope-monitorings/{scope_id}/activities",
        status_code=201,
        dependencies=[Depends(project_context)],
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
        dependencies=[Depends(project_context)],
    )
    def complete_daily_activities(scope_id: str, request: CompleteRequest) -> None:
        complete_daily_activity.execute(
            CompleteDailyActivityCommand(scope_id=scope_id, days=request.days)
        )

    @app.patch(
        "/scope-monitorings/{scope_id}/activities/{day}",
        status_code=204,
        dependencies=[Depends(project_context)],
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

    @app.patch(
        "/scope-monitorings/{scope_id}",
        status_code=204,
        dependencies=[Depends(project_context)],
    )
    def handle_update_scope_note(
        scope_id: str, request: UpdateScopeNoteRequest
    ) -> None:
        update_scope_note.execute(
            UpdateScopeNoteCommand(scope_id=scope_id, note=request.note)
        )

    @app.get(
        "/scope-monitorings",
        response_model=list[ScopeResponse],
        dependencies=[Depends(project_context)],
    )
    def list_scope_monitorings() -> list[ScopeResponse]:
        return [_scope_to_response(scope) for scope in list_scopes.execute()]

    @app.get(
        "/scope-monitorings/{scope_id}",
        response_model=ScopeResponse,
        dependencies=[Depends(project_context)],
    )
    def get_scope_monitoring(scope_id: str) -> ScopeResponse:
        return _scope_to_response(get_scope.execute(scope_id))

    @app.get(
        "/scope-monitorings/{scope_id}/activities/{day}",
        response_model=ActivityResponse,
        dependencies=[Depends(project_context)],
    )
    def get_scope_daily_activity(scope_id: str, day: date) -> ActivityResponse:
        return _activity_to_response(get_daily_activity.execute(scope_id, day))

    @app.get(
        "/api/audit-log",
        response_model=list[AuditEventResponse],
        dependencies=[Depends(project_context)],
    )
    def list_scope_audit_log(
        scope_id: str | None = None,
        actor: str | None = None,
        action: str | None = None,
        from_date: date | None = None,
        to_date: date | None = None,
        limit: int = 200,
    ) -> list[AuditEventResponse]:
        events = list_audit_events.execute(
            AuditEventQuery(
                scope_id=scope_id,
                actor=actor,
                action=action,
                from_date=from_date,
                to_date=to_date,
                limit=max(1, min(limit, 1000)),
            )
        )
        scope_names = repo.find_all_scope_names()
        return [
            _audit_event_to_response(
                event,
                scope_name=(
                    scope_names.get(event.scope_id)
                    if event.scope_id is not None
                    else None
                ),
            )
            for event in events
        ]

    return app


def create_default_app() -> FastAPI:
    """Create the production app using the configured PostgreSQL repository."""
    return create_app()
