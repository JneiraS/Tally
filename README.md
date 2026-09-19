# ProTab

Projection et suivi d'activité quotidienne par périmètre de supervision (scope monitoring).

## Domain model

Architecture hexagonale. Le domaine ne dépend d'aucune technologie externe.

```text
ScopeMonitoring (agrégat racine)                      DailyActivity (entité)
├── id: str                                            ├── day: date            ← datetime.date (pas de classe Day)
├── name: str                                         ├── errors_reported: int ← >= 0
├── knowledge: KnowledgeBase                          ├── incidents_created: int ← >= 0 et <= errors_reported
├── officials: Officials                              ├── feai: list[str]      ← format INC\d{7}, sans doublon
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
- Références FEAI : format `INC` suivi d'exactement 7 chiffres (`^INC\d{7}$`), aucune doublon.
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
`PROTAB_HOST` (défaut `0.0.0.0`) et `PROTAB_PORT` (défaut `8000`).

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