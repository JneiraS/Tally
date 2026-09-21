# ProTab

Projection et suivi d'activité quotidienne par périmètre de supervision (scope monitoring).

## Domain model

Architecture hexagonale. Le domaine ne dépend d'aucune technologie externe.

```text
ScopeMonitoring (agrégat racine)                      DailyActivity (entité)
├── id: str                                            ├── day: date            ← datetime.date (pas de classe Day)
├── name: str                                         ├── errors_reported: int ← >= 0
├── knowledge: KnowledgeBase                          ├── incidents_created: int ← >= 0 et <= errors_reported
├── officials: Officials                              ├── feai: list[str]      ← format INC\d{9}, sans doublon
└── daily_activities: dict[date, DailyActivity]       ├── handled: bool
     └── clé = jour → une seule activité par jour     └── completed: bool      ← completed ⇒ handled
```

### Décisions de modélisation

- `Day` n'est **pas** une classe : un jour n'a ni identité ni comportement métier propres au-delà de sa valeur ;
  `datetime.date` est déjà un value object immuable. « Toutes les activités d'un jour » est une requête
  (port outbound), pas une structure du domaine.
- `ScopeMonitoring` est l'agrégat racine. Il **possède** ses `DailyActivity`, indexées par jour
  (`dict[date, DailyActivity]`) : unicité d'une activité par périmètre et par jour, garantie par l'agrégat.
- Relation unidirectionnelle : une `DailyActivity` ne référence pas son `ScopeMonitoring`.

### Invariants

- `errors_reported >= 0`, `incidents_created >= 0`, `incidents_created <= errors_reported`.
- Références FEAI : format `INC` suivi d'exactement 9 chiffres (`^INC\d{9}$`), aucune doublon.
- Une seule `DailyActivity` par `ScopeMonitoring` et par jour.
- `mark_completed()` force `handled = True` (`completed` ⇒ `handled`).

## Use cases (couche application)

Les use cases dépendent uniquement du port outbound `ScopeMonitoringRepository`
(`ports/outbound/`) — la persistance concrète est branchée par un adapter.

| Use case | Commande | Comportement |
|---|---|---|
| `CreateScopeMonitoringUseCase` | `CreateScopeMonitoringCommand(name, knowledge_base_id, official_main, official_backup)` | Crée plusieurs `ScopeMonitoring` (id = uuid4) ; **atomique** : doublon de nom ou ligne invalide ⇒ rien n'est persisté. |
| `CreateDailyActivityUseCase` | `CreateDailyActivityCommand(scope_id, day, errors_reported, incidents_created, feai)` | Crée une `DailyActivity` pour un jour donné ; doublon ⇒ `DuplicateDailyActivityError`. |
| `CompleteDailyActivityUseCase` | `CompleteDailyActivityCommand(scope_id, days)` | Marque `completed` (et `handled`) pour une ou plusieurs journées d'un périmètre ; jour sans activité ⇒ `DailyActivityNotFoundError`. |
| `UpdateDailyActivityUseCase` | `UpdateDailyActivityCommand(scope_id, day, errors_reported, incidents_created, feai)` | Modifie compteurs/FEAI d'une journée via la validation domaine ; invariants appliqués. |

Lectures (`application/queries/`) : `ListScopesUseCase`, `GetScopeUseCase`, `GetDailyActivityUseCase` —
retournent les entités ; les erreurs `*NotFoundError` sont levées côté application.

## Import CSV

Adapter inbound `adapters/inbound/csv/scope_monitoring_csv_reader.py` : transforme les lignes du fichier
(colonnes `name, knowledge_base_id, official_main, official_backup`) en `CreateScopeMonitoringCommand`.
En-têtes et nombre de colonnes sont vérifiés structurellement ; les règles métier sont levées par le domaine.

## API HTTP (FastAPI)

Adapter inbound `adapters/inbound/api/` : expose les use cases via REST. Aucune logique métier dans les
routes — traduction HTTP ↔ commandes, la validation reste dans le domaine/application.

Démarrage : `make run` (ou `uv run protab`) → serveur uvicorn sur `http://0.0.0.0:8000`. Documentation
interactive : `/docs` (Swagger). Healthcheck : `GET /healthz` → `{"status": "ok"}`.

Configuration (fichier `.env` copié depuis `.env.example`) :
`PROTAB_HOST` (défaut `0.0.0.0`), `PROTAB_PORT` (défaut `8000`) et
`DATABASE_URL` (DSN PostgreSQL ; **obligatoire** pour démarrer l'API).

### Authentification par projet

L'application demande le projet, le quadrigramme de l'utilisateur et le mot de passe partagé du projet.
Les mots de passe sont stockés sous forme de hash et la session est conservée dans un cookie HTTP-only.
Les périmètres et activités sont filtrés côté backend par le projet authentifié.

Routes publiques : `GET /projects`, `POST /auth/login`, `GET /auth/me`, `POST /auth/logout`.
Les routes de supervision nécessitent une session valide.

Le projet initial est créé automatiquement avec `PROTAB_DEFAULT_PROJECT_CODE`,
`PROTAB_DEFAULT_PROJECT_NAME` et `PROTAB_DEFAULT_PROJECT_PASSWORD`. Les projets suivants se créent avec :

```bash
uv run protab-project projet-alpha "Projet Alpha"
```

| Méthode & path | Body | Succès | Erreurs |
|---|---|---|---|
| `POST /scope-monitorings` | `[{name, knowledge_base_id, official_main, official_backup}]` | `201 {ids: [...]}` | `409` nom existant, `400` validation domaine |
| `POST /scope-monitorings/import-csv` | multipart, champ `csv_file` | `201 {ids: [...]}` | `400` CSV invalide ou ligne non conforme |
| `POST /scope-monitorings/{id}/activities` | `{day, errors_reported, incidents_created, feai}` | `201` | `404` périmètre inconnu, `409` jour déjà enregistré, `400` invariant violé |
| `POST /scope-monitorings/{id}/activities/complete` | `{days: ["YYYY-MM-DD"]}` | `204` | `404` périmètre ou jour inconnu |
| `PATCH /scope-monitorings/{id}/activities/{day}` | `{errors_reported, incidents_created, feai}` | `204` | `404` périmètre ou jour inconnu, `400` invariant violé |
| `GET /scope-monitorings` | — | `200` liste des périmètres (id, name, knowledge, officials, activities) | — |
| `GET /scope-monitorings/{id}` | — | `200` périmètre| `404` |
| `GET /scope-monitorings/{id}/activities/{day}` | — | `200` activité | `404` périmètre ou jour inconnu |

Les exceptions de domaine sont mappées par des handlers (`adapters/inbound/api/errors.py`) :
`ScopeMonitoringNotFoundError`/`DailyActivityNotFoundError` → **404**, `ScopeMonitoringNameAlreadyExistsError`/
`DuplicateDailyActivityError` → **409**, toute autre `DomainError` et `ScopeMonitoringCsvError` → **400**.

## Persistance

Le port outbound `ScopeMonitoringRepository` possède un adapter PostgreSQL pour l'exécution de l'API.
Le repository mémoire reste disponible pour l'injection explicite dans les tests :

| Adapter | Fichier | Sélection |
|---|---|---|
| Mémoire | `adapters/outbound/persistence/in_memory_scope_monitoring_repository.py` | Tests uniquement, injecté explicitement |
| PostgreSQL | `adapters/outbound/persistence/postgres_scope_monitoring_repository.py` | Obligatoire pour l'API |

L'adapter **PostgreSQL** utilise `psycopg` (sync) + `psycopg_pool`. Deux tables :
`scope_monitorings` (`id`, `name` UNIQUE, `knowledge_base_id`, `official_main`, `official_backup`) et
`daily_activities` (`(scope_id, day)` PK/FK `ON DELETE CASCADE`, `errors_reported`, `incidents_created`,
`feai TEXT[]`, `handled`, `completed`). Le schéma est créé de façon **idempotente au démarrage**
(`CREATE TABLE IF NOT EXISTS`, aucun outil de migration). Un `save()` remplace tout l'agrégat dans une
**transaction** (atomicité préservée) ; les contraintes DB (nom unique, jour unique) traduisent les erreurs
en exceptions de domaine (→ `409`).

## Docker

La stack complète (`db` PostgreSQL + `api` FastAPI + `frontend` React/nginx) est définie dans
`docker-compose.yml`. Le frontend est servi par nginx (SPA) qui proxiie `/scope-monitorings` vers `api`
— même origine, aucun CORS requis.

```bash
make docker-up    # docker compose up -d --build
# → API :      http://localhost:8000   (Swagger : /docs)
# → Frontend : http://localhost:5173
```

| Cible Makefile | Effet |
|---|---|
| `db-up` / `db-down` | Démarre / arrête uniquement le service PostgreSQL |
| `docker-up` / `docker-down` | Construit et démarre / arrête toute la stack |
| `db-shell` | Shell `psql` dans le conteneur Postgres |
| `test-db` | Lance les tests d'intégration PostgreSQL (base `protab_test` créée si absente) |

Identifiants de développement (`POSTGRES_USER/PASSWORD/DB`, défauts `protab/protab/protab`) surchargeables
via variables d'environnement / fichier `.env`. Les données DB sont conservées dans un volume nommé (`pgdata`).
