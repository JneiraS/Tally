# Tally

**Tally** suit l'activité quotidienne d'une équipe de supervision : pour chaque
périmètre, une ligne par jour, avec les erreurs relevées, les incidents créés et
les références FEAI concernées. L'outil remplace le tableur de suivi et applique
les règles métier à la saisie au lieu de les laisser à la vigilance de chacun.

> **Nom affiché : Tally.** Le paquet Python et les commandes conservent leur nom
> historique : `protab`, `protab-project`.

---

## Présentation

Tally est une application web multi-tenant. Un **projet** représente une équipe :
il porte son calendrier ouvré, ses périmètres, ses administrateurs et son journal
d'audit. À l'intérieur d'un projet, un **périmètre de supervision** rassemble une
base de connaissances, des responsables et une périodicité ; son **activité
journalière** porte les compteurs, les références FEAI et le statut de la journée.

```text
Projet (tenant)
└── Périmètre de supervision
    ├── identité : nom, base de connaissances, responsables, code de facturation
    ├── cadence : jours attendus, toutes les N semaines
    └── activité journalière : erreurs, incidents, références FEAI, statut
```

Quatre garanties structurent l'outil :

- **une seule saisie par périmètre et par jour** — la base l'impose ;
- **des références FEAI normalisées** — une seule graphie est stockée ;
- **une trace de chaque modification** — le journal d'audit conserve l'auteur,
  l'action et les valeurs avant/après ;
- **une isolation stricte entre projets** — chaque requête est filtrée par le
  projet de la session.

---

## Fonctionnalités

**Suivi quotidien**

- vue mono-jour : à l'ouverture, la date du jour si elle est ouvrée, sinon le
  dernier jour ouvré ;
- saisie en autosave des compteurs et des références FEAI, avec annulation des
  suppressions ;
- statut de journée `pending`, `completed` ou `ko`, motif de KO facultatif,
  changement de statut à l'unité ou en lot ;
- historique complet par périmètre, totaux de période et sélection multiple.

**Périmètres**

- création manuelle ou import CSV, export CSV ;
- responsables principal et suppléant, note libre ;
- périodicité : jours attendus de la semaine, intervalle de 1 à 12 semaines,
  date d'ancrage ;
- calendrier ouvré du projet : jours récurrents et dates ponctuelles exclues ;
- recherche par nom, base de connaissances, code de facturation ou quadrigramme.

**Analyse et traçabilité**

- page `/analyse` : indicateurs de période, heatmap périmètre × jour ou semaine,
  classement des périmètres, tendances ;
- journal d'audit filtrable par période, acteur, action et périmètre ;
- export CSV de la liste et des activités filtrées.

**Accès et exploitation**

- connexion par quadrigramme et mot de passe de projet, session de 12 heures ;
- administrateurs de projet nommés par la CLI, en plus des responsables déclarés
  dans les périmètres ;
- API REST documentée automatiquement sur `/docs`, sonde `GET /healthz`.

---

## Stack technique

| Couche | Technologies |
| --- | --- |
| API | Python 3.13, FastAPI, Uvicorn |
| Persistance | PostgreSQL 17, `psycopg` 3 (synchrone), `psycopg_pool` |
| Frontend | React 19, TypeScript 7, Vite 8, Tailwind CSS 4, recharts 3, lucide-react |
| Tests | pytest 9, mypy ; vitest 5 et Testing Library côté frontend |
| Exécution | `uv` pour Python, `npm` pour le frontend, Docker Compose et nginx |

Les versions exactes sont déclarées dans `pyproject.toml` et
`src/FrontEnd/package.json`.

---

## Architecture

Le backend suit une **architecture hexagonale** : le domaine ne dépend d'aucune
technologie, l'application orchestre les cas d'usage, et les adaptateurs
(FastAPI, PostgreSQL, CSV, CLI) sont branchés sur des ports.

```text
Adaptateurs entrants          Application              Adaptateurs sortants
API, CSV, CLI        ──────▶  cas d'usage  ──────▶     PostgreSQL, mémoire
                                   │
                                   ▼
                            domaine (entités,
                            value objects, règles)
```

Le frontend est une application React indépendante qui consomme l'API REST. Le
projet courant n'est jamais passé aux cas d'usage : il voyage dans un
`ContextVar` posé par la couche HTTP et lu par les adaptateurs PostgreSQL.
Couches, ports et cycle d'une écriture sont détaillés dans
[`docs/architecture.md`](docs/architecture.md).

---

## Installation et démarrage

Prérequis : Python 3.13, [`uv`](https://docs.astral.sh/uv/), Node.js avec npm,
Docker et Docker Compose.

```bash
cp .env.example .env
make install
cd src/FrontEnd && npm ci && cd -
```

Trois variables sont **obligatoires au démarrage** :

| Variable | Rôle |
| --- | --- |
| `DATABASE_URL` | DSN PostgreSQL de l'API |
| `PROTAB_DEFAULT_PROJECT_PASSWORD` | mot de passe du projet initial |
| `PROTAB_DEFAULT_PROJECT_ADMIN_CODE` | quadrigramme administrateur du projet initial |

Les deux dernières ne servent qu'à la création du projet initial : une
installation déjà initialisée redémarre sans elles. La liste complète des
variables et leurs valeurs par défaut sont dans
[`docs/development.md`](docs/development.md#3-configuration).

**Développement**

```bash
make db-up       # PostgreSQL local
make run         # API sur http://localhost:8000 — Swagger sur /docs
make frontend    # frontend Vite sur http://localhost:5173
```

**Stack complète**

```bash
make docker-up
# frontend : http://localhost:5173
# API      : http://127.0.0.1:8874 — Swagger sur /docs
make docker-down
```

En Docker, l'API n'est publiée que sur la boucle locale ; TLS doit être terminé
par un reverse proxy, avec `PROTAB_COOKIE_SECURE=1`. La topologie est décrite
dans [`docs/docker-architecture.md`](docs/docker-architecture.md).

---

## Administration

L'administration d'hôte passe par la CLI `protab-project`, qui demande la base de
données et jamais un cookie. C'est la voie de secours d'un projet verrouillé.

```bash
uv run protab-project --help
uv run protab-project projet-alpha "Projet Alpha" --admin MLOZ
uv run protab-project set-password projet-alpha
uv run protab-project add-admin projet-alpha MLOZ
uv run protab-project list-admins projet-alpha
```

Dans la stack Docker, `make project-admin ARGS="list-admins protab"` relaie la
commande dans le conteneur API. L'inventaire complet, les messages d'erreur et
les procédures de dépannage sont dans [`docs/cli.md`](docs/cli.md).

---

## Documentation

| Je veux… | Document |
| --- | --- |
| Comprendre le domaine et ses règles | [`docs/domain-model.md`](docs/domain-model.md) |
| Comprendre le code et les couches | [`docs/architecture.md`](docs/architecture.md) |
| Appeler l'API REST | [`docs/api.md`](docs/api.md) |
| Comprendre la connexion et les droits | [`docs/authentication.md`](docs/authentication.md) |
| Connaître le schéma PostgreSQL | [`docs/database.md`](docs/database.md) |
| Administrer un projet | [`docs/cli.md`](docs/cli.md) |
| Modifier le frontend | [`docs/frontend.md`](docs/frontend.md) |
| Installer, configurer, dépanner | [`docs/development.md`](docs/development.md) |
| Lancer et écrire des tests | [`docs/testing.md`](docs/testing.md) |
| Déployer avec Docker | [`docs/docker-architecture.md`](docs/docker-architecture.md) |
| Dimensionner un serveur | [`docs/ressources.md`](docs/ressources.md) |
| Comparer Tally à un tableur | [`docs/tally-vs-excel.md`](docs/tally-vs-excel.md) |
| Lire les règles normatives du dépôt | [`AGENTS.md`](AGENTS.md) |

---

## Développement

```bash
make test          # tests Python rapides, sans base
make test-db       # tests Python complets, PostgreSQL inclus
make typecheck     # mypy sur src/protab
cd src/FrontEnd && npm test      # vitest
cd src/FrontEnd && npm run lint  # tsc --noEmit — types, pas de style
```

`make help` liste toutes les cibles ; leur inventaire complet est dans
[`docs/development.md`](docs/development.md#cibles-makefile).

Le workflow attendu (TDD, SOLID, architecture, documentation) est défini dans
[`AGENTS.md`](AGENTS.md). Les détails d'installation, de configuration et de
qualité sont dans [`docs/development.md`](docs/development.md).
