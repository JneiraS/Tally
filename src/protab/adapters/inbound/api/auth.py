from dataclasses import dataclass

from fastapi import HTTPException, Request, Response, status

from protab.adapters.outbound.persistence.postgres_auth_repository import (
    AuthSession,
    PostgresAuthRepository,
    Project,
)

SESSION_COOKIE = "protab_session"


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
        secure=False,
        max_age=12 * 60 * 60,
    )


def clear_session_cookie(response: Response) -> None:
    response.delete_cookie(SESSION_COOKIE)
