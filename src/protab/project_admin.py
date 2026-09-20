"""Administrative command for creating ProTab projects."""

import argparse
import getpass

from protab.adapters.inbound.api.config import database_url_from_env
from protab.adapters.outbound.persistence.postgres_auth_repository import (
    PostgresAuthRepository,
)


def main() -> None:
    parser = argparse.ArgumentParser(description="Créer un projet ProTab.")
    parser.add_argument("code", help="Code interne du projet")
    parser.add_argument("name", help="Nom affiché du projet")
    args = parser.parse_args()

    dsn = database_url_from_env()
    if dsn is None:
        raise SystemExit("DATABASE_URL est obligatoire.")
    password = getpass.getpass("Mot de passe du projet : ")
    repository = PostgresAuthRepository(dsn)
    try:
        repository.connect()
        project = repository.create_project(args.code, args.name, password)
    finally:
        repository.close()
    print(f"Projet créé : {project.id} ({project.name})")
