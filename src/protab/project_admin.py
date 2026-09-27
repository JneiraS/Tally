"""Administrative command for creating ProTab projects and rotating passwords."""

import argparse
import getpass
import sys

from protab.adapters.inbound.api.config import database_url_from_env
from protab.adapters.outbound.persistence.postgres_auth_repository import (
    PostgresAuthRepository,
)

SET_PASSWORD = "set-password"


def _open_repository() -> PostgresAuthRepository:
    dsn = database_url_from_env()
    if dsn is None:
        raise SystemExit("DATABASE_URL est obligatoire.")
    repository = PostgresAuthRepository(dsn)
    repository.connect()
    return repository


def _read_password(prompt: str) -> str:
    password = getpass.getpass(prompt)
    if not password.strip():
        raise SystemExit("Le mot de passe du projet ne peut pas être vide.")
    return password


def _create_project(argv: list[str]) -> None:
    parser = argparse.ArgumentParser(
        prog="protab-project", description="Créer un projet ProTab."
    )
    parser.add_argument("code", help="Code interne du projet")
    parser.add_argument("name", help="Nom affiché du projet")
    args = parser.parse_args(argv)

    password = _read_password("Mot de passe du projet : ")
    repository = _open_repository()
    try:
        project = repository.create_project(args.code, args.name, password)
    finally:
        repository.close()
    print(f"Projet créé : {project.id} ({project.name})")


def _set_password(argv: list[str]) -> None:
    parser = argparse.ArgumentParser(
        prog="protab-project set-password",
        description="Changer le mot de passe d'un projet ProTab.",
    )
    parser.add_argument("code", help="Code interne du projet")
    args = parser.parse_args(argv)

    password = _read_password("Nouveau mot de passe du projet : ")
    repository = _open_repository()
    try:
        if repository.get_project(args.code) is None:
            raise SystemExit(f"Projet inconnu : {args.code}")
        repository.set_project_password(args.code, password)
    finally:
        repository.close()
    print(f"Mot de passe mis à jour : {args.code}")
    print("Les sessions ouvertes avec l'ancien mot de passe ont été révoquées.")


def main() -> None:
    argv = sys.argv[1:]
    if argv and argv[0] == SET_PASSWORD:
        _set_password(argv[1:])
    else:
        _create_project(argv)
