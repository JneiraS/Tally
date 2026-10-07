# ProTab

Projection et suivi d'activité quotidienne par périmètre de supervision (scope monitoring).

## Domain model

Architecture hexagonale. Le domaine ne dépend d'aucune technologie externe.

```text
ScopeMonitoring (agrégat racine)                      DailyActivity (entité)
├── id: str                                            ├── day: date            ← datetime.date (pas de classe Day)
├── name: str                                         ├── errors_reported: int ← >= 0
├── knowledge: KnowledgeBase                          ├── incidents_created: int ← >= 0 et <= errors_reported
├── officials: Officials                              ├── feai: list[str]      ← format (PREFIXE-)?INC\d{9}, sans doublon
├── billing_code: str | None                          ├── handled: bool
└── daily_activities: dict[date, DailyActivity]       └── completed: bool      ← completed ⇒ handled
     └── clé = jour → une seule activité par jour
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
- Références FEAI : code `INC` suivi d'exactement 9 chiffres, précédé d'un préfixe facultatif de 2 à 5
  lettres (`^(?:[A-Z]{2,5}-)?INC\d{9}$`, ex. `INC000000001` ou `FE-INC000000001`), aucun doublon. La saisie
  tolère une espace, un slash ou un préfixe collé au code ; la forme stockée porte toujours le tiret.
- Une seule `DailyActivity` par `ScopeMonitoring` et par jour.
- `mark_completed()` force `handled = True` (`completed` ⇒ `handled`).
- Un `ScopeMonitoring` **créé** porte un `billing_code` non vide, de format libre : c'est
  `ScopeMonitoring.create()` qui l'exige, via `EmptyBillingCodeError`. Le constructeur direct, que les
  repositories utilisent pour réhydrater, accepte l'absence : le champ a été introduit après les
  premiers périmètres enregistrés.
- Une `note` libre et nullable, au plus `NOTE_MAX_LENGTH` (2000) caractères à l'écriture. `set_note()`
  normalise une note blanche en `None` ; la route `PATCH /scope-monitorings/{id}` est la seule qui modifie
  un périmètre existant, et elle ne touche qu'à elle.

## Use cases (couche application)

Les use cases dépendent uniquement du port outbound `ScopeMonitoringRepository`
(`ports/outbound/`) — la persistance concrète est branchée par un adapter.

| Use case                       | Commande                                                                                | Comportement                                                                                                                         |
| ------------------------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `CreateScopeMonitoringUseCase` | `CreateScopeMonitoringCommand(name, knowledge_base_id, official_main, official_backup, billing_code)` | Crée plusieurs `ScopeMonitoring` (id = uuid4) ; **atomique** : doublon de nom ou ligne invalide ⇒ rien n'est persisté.               |
| `CreateDailyActivityUseCase`   | `CreateDailyActivityCommand(scope_id, day, errors_reported, incidents_created, feai)`   | Crée une `DailyActivity` pour un jour donné ; doublon ⇒ `DuplicateDailyActivityError`.                                               |
| `CompleteDailyActivityUseCase` | `CompleteDailyActivityCommand(scope_id, days)`                                          | Marque `completed` (et `handled`) pour une ou plusieurs journées d'un périmètre ; jour sans activité ⇒ `DailyActivityNotFoundError`. |
| `UpdateDailyActivityUseCase`   | `UpdateDailyActivityCommand(scope_id, day, errors_reported, incidents_created, feai)`   | Modifie compteurs/FEAI d'une journée via la validation domaine ; invariants appliqués.                                               |
| `UpdateScopeNoteUseCase`       | `UpdateScopeNoteCommand(scope_id, note)`                                                 | Remplace la note libre du périmètre (texte blanc ⇒ `None`) ; écriture ciblée, sans toucher aux activités.                            |

Lectures (`application/queries/`) : `ListScopesUseCase`, `GetScopeUseCase`, `GetDailyActivityUseCase`,
`ListAuditEventsUseCase` — retournent les entités ; les erreurs `*NotFoundError` sont levées côté application.

Chaque use case de mutation enregistre un événement d'audit via le port `AuditTrailRepository` (voir
« Journal d'audit »).

## Import CSV

Adapter inbound `adapters/inbound/csv/scope_monitoring_csv_reader.py` : transforme les lignes du fichier
(colonnes `name, knowledge_base_id, official_main, official_backup, billing_code`) en
`CreateScopeMonitoringCommand`. Le code de facturation étant obligatoire, un fichier qui ne le
contient pas est rejeté (400 « Invalid headers ») : il faut ajouter la colonne aux CSV préparés avant
cette évolution.
En-têtes et nombre de colonnes sont vérifiés structurellement ; les règles métier sont levées par le domaine.

## API HTTP (FastAPI)

Adapter inbound `adapters/inbound/api/` : expose les use cases via REST. Aucune logique métier dans les
routes — traduction HTTP ↔ commandes, la validation reste dans le domaine/application.

Démarrage : `make run` (ou `uv run protab`) → serveur uvicorn sur `http://0.0.0.0:8000`. Documentation
interactive : `/docs` (Swagger). Healthcheck : `GET /healthz` → `{"status": "ok"}`.

Configuration (fichier `.env` copié depuis `.env.example`) :
`PROTAB_HOST` (défaut `0.0.0.0`), `PROTAB_PORT` (défaut `8000`),
`DATABASE_URL` (DSN PostgreSQL ; **obligatoire** pour démarrer l'API) et
`PROTAB_COOKIE_SECURE` (`0`/`1`, défaut `0` : à passer à `1` derrière HTTPS).
`PROTAB_DEFAULT_PROJECT_PASSWORD` et `PROTAB_DEFAULT_PROJECT_ADMIN_CODE` sont **obligatoires au tout premier
démarrage**, c'est-à-dire au moment où le projet bootstrap doit être créé. L'API refuse alors de démarrer
(aucun mot de passe ni administrateur par défaut n'est fourni) : un projet créé sans administrateur serait,
une fois son premier périmètre enregistré, impossible à ouvrir par quiconque. Une fois le projet créé, les
variables ne sont plus consultées : redémarrer une installation déjà initialisée n'exige aucun secret.

L'API écoute sur `0.0.0.0` *à l'intérieur* du conteneur, mais Docker Compose ne
publie son port que sur la boucleback (`127.0.0.1:8874:8000`) : elle n'est donc
pas joignable depuis le réseau local. Pour l'exposer volontairement, adapte le
mapping `ports:` de `docker-compose.yml` et mets `PROTAB_COOKIE_SECURE=1`.

### Authentification par projet

L'application demande le projet, le quadrigramme de l'utilisateur et le mot de passe partagé du projet.
Les mots de passe sont stockés sous forme de hash et la session est conservée dans un cookie HTTP-only.
Les périmètres et activités sont filtrés côté backend par le projet authentifié.

Routes publiques : `GET /healthz`, `GET /projects`, `POST /auth/login`, `GET /auth/me`,
`POST /auth/logout` et la documentation interactive. Toute autre route exige une session
valide et un contexte de projet : les adaptateurs PostgreSQL lèvent une erreur explicite
plutôt que de retomber sur un projet par défaut si le contexte est absent.
`tests/integration/adapters/route_authorization_test.py` verrouille cette liste : toute
nouvelle route doit être explicitement déclarée publique, sinon le test échoue.

La session expire au bout de 12 h. Un `401` n'est jamais une panne réseau : le frontend le
traite globalement (`protabApi.setUnauthorizedHandler`) et revient à l'écran de connexion, au
lieu d'afficher une erreur « Échec du chargement » que « Réessayer » ne pourrait pas
réparer. Seul `POST /auth/login` est exclu de ce traitement : un `401` y signifie mot de
passe erroné et reste une erreur de formulaire.
Les jours non travaillés sont configurables par projet via `GET /project/settings` et
`PUT /project/settings`. Par défaut, samedi et dimanche sont exclus ; les dates ponctuelles
peuvent également être ajoutées.

La page principale est une vue **mono-jour** : elle affiche les compteurs du jour sélectionné, et
non un cumul. Le jour à l'ouverture est la date du jour s'il est ouvré, sinon le **dernier jour
ouvré** — un dimanche n'a rien à faire afficher et n'a rien à faire saisir. Si le jour affiché
ne contient aucune activité alors qu'une autre journée en contient, un bandeau indique la dernière
saisie et propose d'y accéder d'un clic ; sans ce point de repère, un historique réimporté
(restauration d'un dump) resterait invisible depuis la page principale, les données n'étant
visibles que dans le détail de chaque périmètre.

Restriction du quadrigramme : une fois qu'un projet possède au moins un périmètre, le quadrigramme fourni au
login doit correspondre exactement à l'un des quadrigrammes déclarés par un périmètre du projet. Les colonnes
`official_main` et `official_backup` sont toutes deux interpretées comme une liste : un ou plusieurs
quadrigrammes séparés par `/` (ex. `MLOZ/MRAM`), la casse et les espaces étant ignorés. Une partie qui ne
contient aucun caractère alphanumérique est un substitut de saisie et n'est jamais un code valide — c'est ainsi
que le `?` utilisé pour « pas de suppléant » est écarté. La chaîne entière n'est pas un code : avec
`official_main = "LAMA/JMAB"`, les codes acceptés sont `LAMA` et `JMAB`, pas `"LAMA/JMAB"`. Tant qu'un projet
n'a encore aucun périmètre (bootstrap), tout quadrigramme est accepté afin de permettre la création du premier
périmètre. Cette fenêtre n'est pas collante : dès le premier périmètre, seul un administrateur nommé ou un
official de ce périmètre peut se connecter.

Le projet initial est créé automatiquement avec `PROTAB_DEFAULT_PROJECT_CODE`,
`PROTAB_DEFAULT_PROJECT_NAME`, `PROTAB_DEFAULT_PROJECT_PASSWORD` et
`PROTAB_DEFAULT_PROJECT_ADMIN_CODE`. Les deux dernières sont **obligatoires au tout premier démarrage** :
l'API refuse alors de démarrer plutôt que de créer un projet que personne ne pourrait rouvrir. Les projets
suivants se créent avec :

```bash
uv run protab-project projet-alpha "Projet Alpha" --admin MLOZ
```

Le mot de passe d'un projet se change avec la sous-commande `set-password` (le nouveau mot de passe est saisi
sans écho, jamais en argument) :

```bash
uv run protab-project set-password projet-alpha
```

Cette commande remplace le hash stocké et **révoque toutes les sessions** ouvertes sur le projet : c'est le
geste à faire quand un mot de passe a été divulgué, sinon les sessions déjà ouvertes survivraient à la
rotation. Elle **ne vous sauverait pas** d'un projet verrouillé, puisqu'elle ferme au lieu d'ouvrir.

### Administrateurs de projet

Un administrateur est un quadrigramme autorisé à se connecter à **un seul projet**, qu'il soit déclaré ou
non dans l'un de ses périmètres. Sans lui, un projet qui possède des périmètres n'est plus ouvert que par les
officials de ces périmètres : la personne qui crée le premier périmètre perd son accès à l'instant où elle
l'enregistre. L'administrateur n'a aucun pouvoir supplémentaire une fois connecté ; c'est un accès permanent,
pas un rôle. Il donne un accès **par projet** : un code administrateur d'un projet n'ouvre aucun autre projet,
même avec le bon mot de passe.

```bash
uv run protab-project add-admin projet-alpha MLOZ   # autorise MLOZ sur ce projet
uv run protab-project list-admins projet-alpha      # liste les administrateurs
uv run protab-project remove-admin projet-alpha MLOZ # retire l'accès
```

Ces commandes demandent la base de données, pas une session : c'est la seule voie de secours quand un projet
est verrouillé. `add-admin` refuse un code que l'écran de connexion ne pourrait pas saisir (liste `A/B`,
caractère seul, hors 2–20 caractères) — un administrateur que personne ne peut taper serait un verrouillage
présenté comme une autorisation. `remove-admin` refuse de retirer le dernier administrateur.

### Administration d'hôte : `protab-project`

La gestion des projets, des mots de passe et des administrateurs passe par la CLI `protab-project`. Son
inventaire, ses arguments, ses messages d'erreur, la procédure de dépannage d'un projet verrouillé et son
usage dans Docker sont documentés dans **[`docs/cli.md`](docs/cli.md)** :

```bash
uv run protab-project --help                              # liste les cinq formes
make project-admin ARGS="list-admins protab"             # dans le conteneur api
```

| Méthode & path                                                                                              | Body                                                                                        | Succès                                                                     | Erreurs                                                                    |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `POST /scope-monitorings`                                                                                   | `[{name, knowledge_base_id, official_main, official_backup, billing_code}]`                               | `201 {ids: [...]}`                                                         | `409` nom existant, `400` validation domaine                               |
| `POST /scope-monitorings/import-csv`                                                                        | multipart, champ `csv_file`                                                                 | `201 {ids: [...]}`                                                         | `400` CSV invalide ou ligne non conforme                                   |
| `POST /scope-monitorings/{id}/activities`                                                                   | `{day, errors_reported, incidents_created, feai}`                                           | `201`                                                                      | `404` périmètre inconnu, `409` jour déjà enregistré, `400` invariant violé |
| `POST /scope-monitorings/{id}/activities/complete`                                                          | `{days: ["YYYY-MM-DD"]}`                                                                    | `204`                                                                      | `404` périmètre ou jour inconnu                                            |
| `PATCH /scope-monitorings/{id}/activities/{day}`                                                            | `{errors_reported, incidents_created, feai}`                                                | `204`                                                                      | `404` périmètre ou jour inconnu, `400` invariant violé                     |
| `GET /scope-monitorings`                                                                                    | —                                                                                           | `200` liste des périmètres (id, name, knowledge, officials, activities)    | —                                                                          |
| `PATCH /scope-monitorings/{id}`                                                                              | `{note}` (2000 caractères max)                                                              | `204`                                                                      | `404` périmètre inconnu, `422` note trop longue                           |
| `GET /scope-monitorings/{id}`                                                                               | —                                                                                           | `200` périmètre                                                            | `404`                                                                      |
| `GET /scope-monitorings/{id}/activities/{day}`                                                              | —                                                                                           | `200` activité                                                             | `404` périmètre ou jour inconnu                                            |
| `GET /api/audit-log`                                                                  | query : `scope_id` (répété), `actor` (préfixe, insensible à la casse), `action`, `from_created_at`, `to_created_at` (instants ISO, bornes inclusives/exclusives sur `created_at`), `limit` (1–1000, défaut 200) | `200` journal desc (id, actor, action, scope_id, day, created_at, changes) | —                                                                          |
| `GET /project/settings`                                                                                     | —                                                                                           | `200` réglages du projet courant                                           | `401` session absente                                                      |
| `PUT /project/settings`                                                                                     | `{excluded_weekdays: [1..7], excluded_dates: ["YYYY-MM-DD"]}`                               | `200` réglages mis à jour                                                  | `401` session absente, `422` payload invalide                              |

Les exceptions de domaine sont mappées par des handlers (`adapters/inbound/api/errors.py`) :
`ScopeMonitoringNotFoundError`/`DailyActivityNotFoundError` → **404**, `ScopeMonitoringNameAlreadyExistsError`/
`DuplicateDailyActivityError` → **409**, toute autre `DomainError` et `ScopeMonitoringCsvError` → **400**.

### Journal d'audit

Chaque mutation (création/import de périmètre, création/mise à jour/validation d'activité) est tracée dans un
journal `audit_log` : acteur (quadrigramme de session), action, périmètre, jour concerné et diff avant/après
(`changes`, champ par champ). Les modifications sans changement effectif ne sont pas journalisées. L'écriture
du journal est best-effort : un échec d'audit ne fait pas échouer la requête métier. Lecture via
`GET /api/audit-log` (filtrée par projet comme le reste). Page frontend « Historique » sur `/audit-log`.

## Persistance

Le port outbound `ScopeMonitoringRepository` possède un adapter PostgreSQL pour l'exécution de l'API.
Le repository mémoire reste disponible pour l'injection explicite dans les tests :

| Adapter    | Fichier                                                                  | Sélection                               |
| ---------- | ------------------------------------------------------------------------ | --------------------------------------- |
| Mémoire    | `adapters/outbound/persistence/in_memory_scope_monitoring_repository.py` | Tests uniquement, injecté explicitement |
| PostgreSQL | `adapters/outbound/persistence/postgres_scope_monitoring_repository.py`  | Obligatoire pour l'API                  |

L'adapter **PostgreSQL** utilise `psycopg` (sync) + `psycopg_pool`. Deux tables :
`scope_monitorings` (`id`, `name` UNIQUE, `knowledge_base_id`, `official_main`, `official_backup`,
`billing_code` **nullable**) et
`daily_activities` (`(scope_id, day)` PK/FK `ON DELETE CASCADE`, `errors_reported`, `incidents_created`,
`feai TEXT[]`, `handled`, `completed`). Le schéma est créé de façon **idempotente au démarrage**
(`CREATE TABLE IF NOT EXISTS`, index `scope_monitorings(project_id, name)`, aucun outil de migration).
L'index couvre le filtrage par projet et l'ordre par nom des listes de périmètres. Les contraintes DB
(nom unique, jour unique) traduisent les erreurs en exceptions de domaine (→ `409`).

L'écriture d'une activité est **ciblée** : `insert_daily_activity`, `update_daily_activity` et
`mark_activities_completed` ne touchent que les lignes nommées, et `rowcount == 0` devient
`DailyActivityNotFoundError`. `save()` **crée** et ne réécrit rien : son insertion est en
`ON CONFLICT (id) DO NOTHING`, donc un id déjà pris lève `ScopeMonitoringAlreadyExistsError` (`409`)
avant toute écriture. Les deux adapters sont d'ailleurs interchangeables, pas seulement compatibles :
l'in-memory refuse les mêmes collisions avec les mêmes exceptions. Comme
`daily_activities` ne porte pas de `project_id`, chaque écriture ciblée joint `scope_monitorings` et
filtre le projet courant sans condition.

`billing_code` est obligatoire pour un périmètre créé aujourd'hui — invariant porté par le domaine et
par le schéma Pydantic — mais la colonne reste **nullable** : les lignes antérieures ne peuvent pas
porter de valeur inventée, et un `NOT NULL` ferait échouer l'`ALTER TABLE` idempotent du démarrage sur
une table déjà peuplée. Ces lignes sont donc lues avec un code absent, affiché « — », et se complètent
en SQL direct (`docs/cli.md`).
Les adaptateurs utilisent des pools `psycopg_pool` paramétrés (`min_size=2`, `max_size=10`, attente maximale de 30 s),
avec pré-ping `SELECT 1`, recyclage des connexions après 1800 s et délai de connexion de 5 s.

## Frontend

Trois vues : la liste des périmètres (saisie du jour, `/`), l'analyse (`/analyse`, agrégats et heatmap de
supervision sur une période) et le journal d'audit (`/audit-log`). L'analyse est **en lecture seule** et dérive
entièrement de `GET /scope-monitorings` — aucun appel supplémentaire. Toute sa logique de calcul est pure et
vit dans `src/FrontEnd/src/utils/analytics.ts`, ce qui la rend testable sans rendu.

Le détail du frontend — arborescence, routage, pièges recharts, tests — est dans
**[`docs/frontend.md`](docs/frontend.md)**.

## Docker

La stack complète (`db` PostgreSQL + `api` FastAPI + `frontend` React/nginx) est définie dans
`docker-compose.yml`. Le frontend est servi par nginx (SPA) qui relaie les routes métier vers `api` —
même origine, aucun CORS requis.

L'architecture elle-même — réseau, ports publiés, ordre de démarrage encodé par les healthchecks, chaîne
de construction des deux images et flux de requêtes à travers nginx — est décrite dans
**[`docs/docker-architecture.md`](docs/docker-architecture.md)**.

```bash
make docker-up    # docker compose up -d --build
# → Frontend : http://localhost:5173
# → API :      http://127.0.0.1:8874   (Swagger : /docs) — boucle locale seulement
```

| Cible Makefile              | Effet                                                                          |
| --------------------------- | ------------------------------------------------------------------------------ |
| `db-up` / `db-down`         | Démarre / arrête uniquement le service PostgreSQL                              |
| `docker-up` / `docker-down` | Construit et démarre / arrête toute la stack                                   |
| `db-shell`                  | Shell `psql` dans le conteneur Postgres                                        |
| `test-db`                   | Lance les tests d'intégration PostgreSQL (base `protab_test` créée si absente) |
| `project-admin`             | Lance `protab-project` dans le conteneur `api` (`make project-admin ARGS="…"`)  |

Identifiants de développement (`POSTGRES_USER/PASSWORD/DB`, défauts `protab/protab/protab`) surchargeables
via variables d'environnement / fichier `.env`. Les données DB sont conservées dans un volume nommé (`pgdata`).
