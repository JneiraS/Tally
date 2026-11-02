from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from protab.adapters.inbound.csv.scope_monitoring_csv_reader import (
    ScopeMonitoringCsvError,
)
from protab.domain.exceptions import (
    DailyActivityNotFoundError,
    DomainError,
    DuplicateDailyActivityError,
    NotProjectAdminError,
    ScheduleNeverDueError,
    ScopeMonitoringAlreadyExistsError,
    ScopeMonitoringNameAlreadyExistsError,
    ScopeMonitoringNotFoundError,
)


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(ScopeMonitoringNotFoundError, not_found)
    app.add_exception_handler(DailyActivityNotFoundError, not_found)
    app.add_exception_handler(ScopeMonitoringNameAlreadyExistsError, conflict)
    app.add_exception_handler(ScopeMonitoringAlreadyExistsError, conflict)
    app.add_exception_handler(DuplicateDailyActivityError, conflict)
    app.add_exception_handler(NotProjectAdminError, forbidden)
    # 422 et non 400 : la valeur est refusée parce qu'elle est inexploitable pour
    # ce projet, comme une note trop longue l'est par le schéma entrant. Le
    # contrôle a besoin du calendrier du projet, il ne peut donc pas vivre dans
    # le schéma Pydantic.
    app.add_exception_handler(ScheduleNeverDueError, unprocessable)
    app.add_exception_handler(ScopeMonitoringCsvError, bad_request)
    app.add_exception_handler(DomainError, bad_request)
    app.add_exception_handler(Exception, unexpected)


async def not_found(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": str(exc)})


async def conflict(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(status_code=409, content={"detail": str(exc)})


async def bad_request(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(status_code=400, content={"detail": str(exc)})


async def forbidden(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(status_code=403, content={"detail": str(exc)})


async def unprocessable(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(status_code=422, content={"detail": str(exc)})


async def unexpected(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error."},
    )
