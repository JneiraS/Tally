from dataclasses import dataclass

from fastapi import HTTPException, Request, Response, status

from protab.adapters.inbound.api.config import cookie_secure_from_env
from protab.adapters.outbound.persistence.postgres_auth_repository import (
    SESSION_DURATION,
    AuthSession,
    PostgresAuthRepository,
    Project,
)

SESSION_COOKIE = "protab_session"
SESSION_COOKIE_MAX_AGE_SECONDS: int = int(SESSION_DURATION.total_seconds())


@dataclass(frozen=True)
class CurrentUser:
    project: Project
    session: AuthSession


def current_user(request: Request, auth: PostgresAuthRepository) -> CurrentUser:
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentification requise."
        )
    session = auth.find_session(token)
    if session is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session invalide ou expirée.",
        )
    project = auth.get_project(session.project_id)
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Projet inactif."
        )
    return CurrentUser(project, session)


def set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        SESSION_COOKIE,
        token,
        httponly=True,
        samesite="lax",
        secure=cookie_secure_from_env(),
        max_age=SESSION_COOKIE_MAX_AGE_SECONDS,
    )


def clear_session_cookie(response: Response) -> None:
    response.delete_cookie(SESSION_COOKIE)
