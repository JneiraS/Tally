.PHONY: help install test test-v test-failed clean

## help: Affiche les commandes disponibles
help:
	@echo "Commandes disponibles :"
	@sed -n 's/^## //p' $(MAKEFILE_LIST)

## install: Synchronise et installe toutes les dépendances (crée le .venv automatiquement)
install:
	uv sync

## test: Lance tous les tests en mode normal
test:
	uv run pytest

## test-v: Lance les tests en mode verbeux avec affichage des print()
test-v:
	uv run pytest -vv -s

## test-failed: Rejoue uniquement les derniers tests en échec
test-failed:
	uv run pytest --lf

## clean: Supprime l'environnement virtuel et les caches de test/python
clean:
	rm -rf .venv
	rm -rf .pytest_cache
	rm -rf .uv
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
