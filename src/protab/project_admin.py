"""Administrative command for creating ProTab projects, rotating passwords and
naming project administrators.

These commands act on *projects* — this is host-level administration, not a
user role. The administrators it also names are quadrigrammes granted permanent
access to a single project; they hold no additional permission once logged in.
"""

import argparse
import getpass
import sys

from protab.adapters.inbound.api.config import database_url_from_env
from protab.adapters.outbound.persistence.postgres_auth_repository import (
    PostgresAuthRepository,
)
from protab.domain.exceptions import InvalidOfficialCodeError
from protab.domain.value_objects.official_code import OfficialCode

SET_PASSWORD = "set-password"
ADD_ADMIN = "add-admin"
REMOVE_ADMIN = "remove-admin"
LIST_ADMINS = "list-admins"


def _open_repository() -> PostgresAuthRepository:
    dsn = database_url_from_env()
    if dsn is None:
        raise SystemExit("DATABASE_URL est obligatoire.")
    repository = PostgresAuthRepository(dsn)
    repository.connect()
    return repository


def _open_existing_project(code: str) -> PostgresAuthRepository:
    """Open the repository, refusing a project that does not exist."""
    repository = _open_repository()
    if repository.get_project(code) is None:
        repository.close()
        raise SystemExit(f"Projet inconnu : {code}")
    return repository


def _read_password(prompt: str) -> str:
    password = getpass.getpass(prompt)
    if not password.strip():
        raise SystemExit("Le mot de passe du projet ne peut pas être vide.")
    return password


def _read_admin_code(value: str) -> str:
    """Refuse a code the login screen would reject, rather than storing it.

    An administrator nobody can type is a lockout presented as a grant.
    """
    try:
        return OfficialCode(value).value
    except InvalidOfficialCodeError as error:
        raise SystemExit(str(error)) from error


def _create_project(argv: list[str]) -> None:
    parser = argparse.ArgumentParser(
        prog="protab-project", description="Créer un projet ProTab."
    )
    parser.add_argument("code", help="Code interne du projet")
    parser.add_argument("name", help="Nom affiché du projet")
    parser.add_argument(
        "--admin",
        help=(
            "Quadrigramme autorisé sur ce projet même s'il ne fait partie "
            "d'aucun de ses périmètres"
        ),
    )
    args = parser.parse_args(argv)

    password = _read_password("Mot de passe du projet : ")
    admin = _read_admin_code(args.admin) if args.admin else None
    repository = _open_repository()
    try:
        project = repository.create_project(args.code, args.name, password)
        if admin is not None:
            repository.add_admin(project.id, admin)
    finally:
        repository.close()

    print(f"Projet créé : {project.id} ({project.name})")
    if admin is not None:
        print(f"Administrateur du projet : {admin}")
    else:
        print(
            "Aucun administrateur nommé : dès que ce projet possède un "
            "périmètre, plus aucun quadrigramme non déclaré par un périmètre ne "
            "pourra s'y connecter. Ajoutez-en un avec : "
            f"protab-project {ADD_ADMIN} {project.id} <quadrigramme>"
        )


def _set_password(argv: list[str]) -> None:
    parser = argparse.ArgumentParser(
        prog="protab-project set-password",
        description="Changer le mot de passe d'un projet ProTab.",
    )
    parser.add_argument("code", help="Code interne du projet")
    args = parser.parse_args(argv)

    password = _read_password("Nouveau mot de passe du projet : ")
    repository = _open_existing_project(args.code)
    try:
        repository.set_project_password(args.code, password)
    finally:
        repository.close()
    print(f"Mot de passe mis à jour : {args.code}")
    print("Les sessions ouvertes avec l'ancien mot de passe ont été révoquées.")


def _add_admin(argv: list[str]) -> None:
    parser = argparse.ArgumentParser(
        prog="protab-project add-admin",
        description=(
            "Autoriser un quadrigramme à se connecter à un projet, qu'il soit "
            "déclaré ou non dans un de ses périmètres."
        ),
    )
    parser.add_argument("code", help="Code interne du projet")
    parser.add_argument("quadrigramme", help="Quadrigramme de l'administrateur")
    args = parser.parse_args(argv)

    admin = _read_admin_code(args.quadrigramme)
    repository = _open_existing_project(args.code)
    try:
        created = repository.add_admin(args.code, admin)
    finally:
        repository.close()

    if created:
        print(f"Administrateur ajouté : {admin} ({args.code})")
    else:
        print(f"{admin} est déjà administrateur du projet {args.code}.")


def _remove_admin(argv: list[str]) -> None:
    parser = argparse.ArgumentParser(
        prog="protab-project remove-admin",
        description="Retirer l'accès permanent d'un quadrigramme à un projet.",
    )
    parser.add_argument("code", help="Code interne du projet")
    parser.add_argument("quadrigramme", help="Quadrigramme de l'administrateur")
    args = parser.parse_args(argv)

    admin = _read_admin_code(args.quadrigramme)
    repository = _open_existing_project(args.code)
    try:
        admins = repository.list_admins(args.code)
        if admin not in admins:
            remaining = ", ".join(admins) or "aucun"
            raise SystemExit(
                f"{admin} n'est pas administrateur de {args.code} "
                f"(administrateurs : {remaining})."
            )
        if admins == [admin]:
            raise SystemExit(
                f"{admin} est le dernier administrateur de {args.code} : le "
                "retirer laisserait le projet impossible à ouvrir si aucun "
                "périmètre ne déclare de quadrigramme. Ajoutez un autre "
                "administrateur d'abord, ou déclarez ce quadrigramme dans un "
                "périmètre. Pour passer outre : DELETE FROM project_admins "
                f"WHERE project_id = '{args.code}' AND code = '{admin}' ;"
            )
        repository.remove_admin(args.code, admin)
    finally:
        repository.close()

    print(f"Administrateur retiré : {admin} ({args.code})")
    print("Les sessions ouvertes avec ce quadrigramme ont été révoquées.")


def _list_admins(argv: list[str]) -> None:
    parser = argparse.ArgumentParser(
        prog="protab-project list-admins",
        description="Lister les administrateurs d'un projet ProTab.",
    )
    parser.add_argument("code", help="Code interne du projet")
    args = parser.parse_args(argv)

    repository = _open_existing_project(args.code)
    try:
        admins = repository.list_admins(args.code)
    finally:
        repository.close()

    if not admins:
        print(f"Aucun administrateur pour {args.code}.")
        return
    print(f"Administrateurs de {args.code} :")
    for admin in admins:
        print(f"  - {admin}")


def main() -> None:
    subcommands = {
        SET_PASSWORD: _set_password,
        ADD_ADMIN: _add_admin,
        REMOVE_ADMIN: _remove_admin,
        LIST_ADMINS: _list_admins,
    }
    argv = sys.argv[1:]
    handler = subcommands.get(argv[0]) if argv else None
    if handler is None:
        # Historical form: `protab-project <code> <name>`.
        _create_project(argv)
        return
    handler(argv[1:])
