.PHONY: help install test test-v test-failed run frontend db-up db-down db-shell docker-up docker-down test-db clean

# URL de la base dédiée aux tests d'intégration PostgreSQL
TEST_DATABASE_URL ?= postgresql://protab:protab@localhost:5432/protab_test

## help: Affiche les commandes disponibles
help:
	@echo "Commandes disponibles :"
	@sed -n 's/^## //p' $(MAKEFILE_LIST)

## install: Synchronise et installe toutes les dépendances (crée le .venv automatiquement)
install:
	uv sync

## run: Démarre le serveur API (host/port configurables via .env)
run:
	uv run protab

## frontend: Démarre le frontend React/Vite (src/FrontEnd, port 5173)
frontend:
	cd src/FrontEnd && npm run dev

## test: Lance tous les tests en mode normal
test:
	uv run pytest

## test-v: Lance les tests en mode verbeux avec affichage des print()
test-v:
	uv run pytest -vv -s

## test-failed: Rejoue uniquement les derniers tests en échec
test-failed:
	uv run pytest --lf

## db-up: Démarre PostgreSQL (docker compose) pour le développement local
db-up:
	docker compose up -d db

## db-down: Arrête les services PostgreSQL (docker compose)
db-down:
	docker compose down

## db-shell: Ouvre un shell psql sur la base de développement
db-shell:
	docker compose exec db psql -U protab -d protab

## docker-up: Construit et démarre toute la stack (db + api + frontend)
docker-up:
	docker compose up -d --build

## docker-down: Arrête toute la stack conteneurisée
docker-down:
	docker compose down

## test-db: Crée la base de test si nécessaire puis lance TOUS les tests d'intégration PostgreSQL
test-db: db-up
	@docker compose exec -T db psql -U protab -d postgres -tc "SELECT 1 FROM pg_database WHERE datname='protab_test'" | grep -q 1 || docker compose exec -T db psql -U protab -d postgres -c "CREATE DATABASE protab_test"
	PROTAB_TEST_DATABASE_URL=$(TEST_DATABASE_URL) uv run pytest tests/integration

## clean: Supprime l'environnement virtuel et les caches de test/python
clean:
	rm -rf .venv
	rm -rf .pytest_cache
	rm -rf .uv
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
