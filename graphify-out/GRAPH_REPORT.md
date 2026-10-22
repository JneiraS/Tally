# Graph Report - ProTab  (2026-10-22)

## Corpus Check
- 225 files · ~139,568 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: (none) 9, .example 1, .conf 1)

## Summary
- 1943 nodes · 4875 edges · 134 communities (80 shown, 54 thin omitted)
- Extraction: 79% EXTRACTED · 21% INFERRED · 0% AMBIGUOUS · INFERRED: 1005 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7addf4ba`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- index.ts
- PostgresScopeMonitoringRepository
- package.json
- audit_log_api_test.py
- parse_scope_monitorings_csv
- OfficialCode
- DomainError
- DailyActivity
- AuditLogPage.tsx
- ScopeMonitoring
- api_test.py
- create_app
- ScopeDetailPage.tsx
- current_user
- useToast.tsx
- Tests
- DayStatus
- protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository
- App.tsx
- postgres_scope_monitoring_repository_test.py
- api_config_test.py
- compilerOptions
- protab_application_use_cases_complete_daily_activity
- FakeAuthRepository
- datetime
- InMemoryScopeMonitoringRepository
- La CLI `protab-project`
- Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring)
- PostgresAuthRepository
- AuditEvent
- officials_api_test.py
- pytest
- Hexagonal Architecture (Ports and Adapters)
- ExportModal.tsx
- api Service (FastAPI backend)
- project_admin_test.py
- analytics.ts
- Development Workflow (9 Steps)
- 7. Les adaptateurs sortants
- build_connection_pool
- RecordingScopeMonitoringRepository
- Application Layer / Use Cases
- protab
- project_admin_cli_test.py
- CreateDailyActivityUseCase
- postgres_auth_repository_test.py
- ref_fs
- AnalyticsPage.tsx
- AuditActivityHeatmap.tsx
- AdminDirectory
- postgres_auth_bootstrap_test.py
- set_current_project
- measure-usage.sh
- Tally plutôt qu'un tableur de production
- ScopeMonitoringRepository
- Développement
- NonWorkingDays
- fixture
- app.py
- L'architecture Docker de ProTab
- ListScopesUseCase
- add_scope
- CreateScopeMonitoringUseCase
- Audit Trail (best-effort mutation journal)
- ScopeListPage.tsx
- AnalyticsFilterBar.tsx
- update_daily_activity_test.py
- empty_database
- ProTab Project Documentation
- AuditEventQuery
- scope_monitoring_repository_contract_test.py
- 6. Tests frontend
- AnalyticsHeatmap.tsx
- update_scope_note_test.py
- 5. La couche application
- isValidIsoDate
- PostgresScopeMonitoringRepository
- Sparkline.tsx
- Ressources consommées par la stack
- .apply_status
- route_authorization_test.py
- ScopeMonitoring
- repository
- build_changes
- .set_activities_status
- require_current_project
- .find_all
- protab_adapters_outbound_persistence_postgres_auth_repository
- test_main_split_form_auths_both_codes
- test_backup_placeholder_is_not_a_login_code
- test_non_working_days_survive_the_column_round_trip
- test_admin_authenticates_although_it_belongs_to_no_scope
- test_admins_disappear_with_their_project
- .find_all_scope_names
- .insert_daily_activity
- .from_raw
- .update_note
- test_admin_authenticates_before_the_first_scope_is_created
- test_admin_alongside_scope_officials
- post-checkout
- post-commit
- test_create_project_without_administrator_reminds_to_name_one
- test_set_password_revokes_existing_sessions
- ref_path

## God Nodes (most connected - your core abstractions)
1. `InMemoryScopeMonitoringRepository` - 113 edges
2. `DailyActivity` - 88 edges
3. `create_app()` - 85 edges
4. `DayStatus` - 74 edges
5. `ScopeMonitoring` - 59 edges
6. `AuditEventQuery` - 40 edges
7. `vitest` - 39 edges
8. `react` - 38 edges
9. `ScopeMonitoringRepository` - 38 edges
10. `PostgresAuthRepository` - 36 edges

## Surprising Connections (you probably didn't know these)
- `5. Ce que ces tests ne prouvent pas` --references--> `InMemoryScopeMonitoringRepository`  [INFERRED]
  docs/testing.md → src/protab/adapters/outbound/persistence/in_memory_scope_monitoring_repository.py
- `Application — `tests/unit/application/`` --references--> `InMemoryScopeMonitoringRepository`  [INFERRED]
  docs/testing.md → src/protab/adapters/outbound/persistence/in_memory_scope_monitoring_repository.py
- `6. Sécurité : ce que la topologie garantit, et ce qu'elle ne garantit pas` --references--> `MissingProjectContextError`  [INFERRED]
  docs/docker-architecture.md → src/protab/adapters/outbound/persistence/postgres_scope_monitoring_repository.py
- `11. Problèmes fréquents` --references--> `require_current_project()`  [INFERRED]
  docs/development.md → src/protab/adapters/outbound/persistence/postgres_scope_monitoring_repository.py
- `Port d'audit — `ports/outbound/audit_trail_repository.py`` --references--> `AuditEventQuery`  [INFERRED]
  docs/architecture.md → src/protab/ports/outbound/audit_trail_repository.py

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **ProTab Mutation → Audit Trail Flow** — readme_mutation_use_cases, readme_audit_trail, readme_domain_invariants, readme_domain_error_http_mapping, readme_rest_routes_table [INFERRED 0.85]
- **ProTab PostgreSQL Persistence Path (port → adapter → pool → container)** — agents_scopemonitoringrepository_port, agents_postgres_scopemonitoringrepository, agents_idempotent_schema_bootstrap, agents_postgres_pool_configuration, readme_postgres_persistence, readme_scope_monitorings_index, docker_compose_db_service, docker_compose_api_service [INFERRED 0.85]
- **ProTab Hexagonal Core and Its Adapters** — agents_hexagonal_architecture, readme_scope_monitoring_aggregate, readme_mutation_use_cases, agents_scopemonitoringrepository_port, readme_http_api_adapter, readme_csv_import_adapter, readme_postgres_persistence [INFERRED 0.95]

## Communities (134 total, 54 thin omitted)

### Community 0 - "index.ts"
Cohesion: 0.12
Nodes (26): 3. Client HTTP — `services/api.ts`, ScopeFormModal(), ScopeFormModalProps, ScopeItemState, LoginPage(), LoginPageProps, ApiError, AuthSession (+18 more)

### Community 1 - "PostgresScopeMonitoringRepository"
Cohesion: 0.17
Nodes (9): 10. Publier une modification — liste de contrôle, 5. Base de données : pas d'outil de migration, PostgresScopeMonitoringRepository, Connection, date, Persist ``ScopeMonitoring`` aggregates in PostgreSQL. The schema is applied…, Open the connection pool and apply the (idempotent) schema., Close the connection pool, releasing database connections. (+1 more)

### Community 2 - "package.json"
Cohesion: 0.05
Nodes (39): jsdom, recharts, tailwindcss, @tailwindcss/vite, @types/node, @types/react, @types/react-dom, typescript (+31 more)

### Community 3 - "audit_log_api_test.py"
Cohesion: 0.12
Nodes (26): contextvars, Token, Per-request audit context. Mirrors the ``_CURRENT_PROJECT_ID`` ContextVar…, reset_current_actor(), set_current_actor(), all_events(), clear_actor(), env() (+18 more)

### Community 4 - "parse_scope_monitorings_csv"
Cohesion: 0.16
Nodes (27): CSV — `adapters/inbound/csv/scope_monitoring_csv_reader.py`, fastapi_responses, JSONResponse, Path, pathlib, protab_adapters_inbound_csv_scope_monitoring_csv_reader, bad_request(), conflict() (+19 more)

### Community 5 - "OfficialCode"
Cohesion: 0.06
Nodes (45): argparse, getpass, protab_domain_value_objects_official_code, build_repository(), Select the persistence adapter from configuration. PostgreSQL is required for…, database_url_from_env(), Return the PostgreSQL DSN from DATABASE_URL, or None when unset., Grant permanent access to one project. Returns False if already set. The code… (+37 more)

### Community 6 - "DomainError"
Cohesion: 0.09
Nodes (35): canonical_feai(), Ramène une référence à sa forme canonique ``FE-INC000000001``. La saisie est…, NotProjectAdminError, Raised when a quadrigramme that is not a project administrator attempts an…, DuplicateFeaiReferenceError, IncidentsExceedErrorsError, InvalidFeaiReferenceError, InvalidKoReasonError (+27 more)

### Community 7 - "DailyActivity"
Cohesion: 0.11
Nodes (31): DailyActivity, date, parametrize, test_daily_activity_apply_status_is_idempotent(), test_daily_activity_apply_status_marks_a_ko_with_its_reason(), test_daily_activity_canonicalises_a_prefixed_feai(), test_daily_activity_completion_drops_the_ko_reason(), test_daily_activity_creation_valid() (+23 more)

### Community 8 - "AuditLogPage.tsx"
Cohesion: 0.11
Nodes (29): 10. Graphiques et styles, 11. Tests, 12. Ce qui n'existe pas, 13. Build et déploiement, 14. Documents voisins, 1. Pile technique, 2. Arborescence, 6. Le modèle mono-jour (+21 more)

### Community 9 - "ScopeMonitoring"
Cohesion: 0.08
Nodes (34): 3. Le domaine, KnowledgeBase, Officials, ScopeMonitoring, build_scope(), fixture_scope_monitoring(), fixture, parametrize (+26 more)

### Community 10 - "api_test.py"
Cohesion: 0.06
Nodes (34): client(), create_scope_via_api(), make_scope_with_activity(), fixture, The route has to accept a KO on a day that has no row yet. That is the…, Setting a status is not an entry: it must not insert a row on its own. Only the…, 422, not 400: the bound is refused by the request schema itself. The domain's…, test_a_blank_ko_reason_is_stored_as_no_reason() (+26 more)

### Community 11 - "create_app"
Cohesion: 0.12
Nodes (30): BaseModel, field_validator, model_validator, pydantic, _activity_to_response(), _audit_event_to_response(), create_app(), create_scope_monitorings() (+22 more)

### Community 12 - "ScopeDetailPage.tsx"
Cohesion: 0.10
Nodes (39): 7. Le statut d'une journée : `pending`, `completed`, `ko`, Le détail est mono-jour lui aussi, Le lot, depuis l'historique, Où le statut est écrit, lucide-react, react, ActivityRow(), Badge() (+31 more)

### Community 13 - "current_user"
Cohesion: 0.11
Nodes (22): 6. Les adaptateurs entrants, API — `adapters/inbound/api/`, CLI — `src/protab/project_admin.py`, 4. Démarrage en développement, fastapi, protab_adapters_inbound_api_config, Response, get_project_settings() (+14 more)

### Community 14 - "useToast.tsx"
Cohesion: 0.06
Nodes (30): @testing-library/jest-dom, @testing-library/react, vitest, ToastContainer(), ToastAction, ToastActionsContext, ToastActionsType, ToastContextType (+22 more)

### Community 15 - "Tests"
Cohesion: 0.22
Nodes (9): 1. Vue d'ensemble, 2. Tests unitaires — `tests/unit/`, 4. Test E2E — `tests/e2e/`, 5. Ce que ces tests ne prouvent pas, 8. Documents voisins, Adaptateurs — `tests/unit/adapters/`, Application — `tests/unit/application/`, Ports — `tests/unit/ports/` (+1 more)

### Community 16 - "DayStatus"
Cohesion: 0.20
Nodes (27): Enum, set_daily_activities_status(), SetActivitiesStatusCommand, _audit_action(), Set the status of one or more days of a scope. One rule lives here rather than…, ``activity_completed`` keeps its meaning; everything else is ``activity_ko``.…, SetActivitiesStatusUseCase, DayStatus (+19 more)

### Community 17 - "protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository"
Cohesion: 0.21
Nodes (12): protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository, test_daily_activity_full_flow_over_http(), make_scope(), ``save`` must refuse what the SQL adapter refuses. Both adapters implement…, Same refusal as the SQL adapter, or the two are not interchangeable. An empty…, Reporting a blocked day is what makes the status usable at all. Nobody could…, test_a_refused_save_leaves_the_stored_scope_untouched(), test_save_refuses_a_name_already_stored() (+4 more)

### Community 18 - "App.tsx"
Cohesion: 0.08
Nodes (30): 4. Chemins et routage, 5. Providers et état, react-dom, react-router-dom, App(), AppContent(), src_frontend_src_assets_layered_waves_dark, src_frontend_src_assets_layered_waves_light (+22 more)

### Community 19 - "postgres_scope_monitoring_repository_test.py"
Cohesion: 0.05
Nodes (51): count_activity_rows(), make_scope(), date, Integration tests for the PostgreSQL repository adapter. These tests exercise…, ``save`` creates a row; it never rewrites one. A second ``save`` used to…, The upsert writes two columns; the counters of a stored row are not read. A day…, Une liste vide ne doit pas être rapportée « périmètre introuvable ». Le `WHERE…, A duplicated day must not create a second row. The use case de-duplicates the… (+43 more)

### Community 20 - "api_config_test.py"
Cohesion: 0.13
Nodes (19): 3. Configuration, dotenv, os, cookie_secure_from_env(), host_port_from_env(), InvalidPortError, Exception, Resolve host/port from env values, falling back to defaults. (+11 more)

### Community 21 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 23 - "FakeAuthRepository"
Cohesion: 0.12
Nodes (17): AuthSession, FakeAuthRepository, login_and_read_session_cookie(), Un calendrier sans jour ouvré n'a rien à afficher : la page principale…, Le refus porte sur la semaine entière, pas sur le week-end : un projet qui…, Le cookie et la ligne ``auth_sessions`` doivent tomber ensemble : un cookie…, test_authenticated_routes_require_a_valid_session(), test_in_memory_application_remains_unauthenticated_for_existing_fixtures() (+9 more)

### Community 24 - "datetime"
Cohesion: 0.10
Nodes (22): dataclasses, datetime, protab_application_actor_context, protab_application_commands_daily_activity, protab_application_commands_scope_monitoring, protab_domain_entities_audit_event, protab_domain_entities_daily_activity, protab_domain_entities_day_status (+14 more)

### Community 25 - "InMemoryScopeMonitoringRepository"
Cohesion: 0.14
Nodes (25): InMemoryScopeMonitoringRepository, date, admin_edit(), FakeAdminDirectory, make_scope(), Édition des responsables d'un périmètre :use case et autorisation. Le droit…, L'§28.1 : une édition passe par une écriture ciblée du port, jamais par…, Un champ inchangé ne doit pas figurer dans le diff : l'événement raconte ce qui… (+17 more)

### Community 26 - "La CLI `protab-project`"
Cohesion: 0.12
Nodes (17): 10. En Docker, 11. Voir aussi, 1. Ce que la CLI fait, et ce qu'elle ne fait pas, 2. Prérequis, 3. Inventaire des commandes, 4. Les mots de passe, 5. Qui peut se connecter, 6. Pourquoi nommer un administrateur (+9 more)

### Community 27 - "Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring)"
Cohesion: 0.20
Nodes (11): Avoid Premature Abstraction, SOLID Principles, Aggregate Owns DailyActivities Indexed by Day, Atomic ScopeMonitoring Creation, CSV Import Inbound Adapter, DailyActivity (Entity), Day Is Not a Class (datetime.date as value object), Domain Invariants (counters, FEAI format, completion implication) (+3 more)

### Community 28 - "PostgresAuthRepository"
Cohesion: 0.08
Nodes (19): 4. Les ports, Absence de port pour l'authentification, Port d'administrateurs — `ports/outbound/admin_directory.py`, Port d'audit — `ports/outbound/audit_trail_repository.py`, hashlib, hmac, protab_domain_value_objects_non_working_days, secrets (+11 more)

### Community 29 - "AuditEvent"
Cohesion: 0.12
Nodes (14): handle_update_scope_officials(), PostgresAuditTrailRepository, Open the connection pool and apply the (idempotent) schema., Close the connection pool, releasing database connections., current_actor(), UpdateScopeOfficialsCommand, ListAuditEventsUseCase, Overwrite the officials of an existing scope, admins only. Written through the… (+6 more)

### Community 30 - "officials_api_test.py"
Cohesion: 0.16
Nodes (19): TestClient, logged_client(), make_scope(), parametrize, Édition des responsables via l'API : réservée aux administrateurs. Le contrôle…, La permission précède la lecture : un id inconnu répond 403, pas 404, sinon le…, Seule l'édition des responsables est réservée aux admins : la note reste un…, Le front n'a pas le droit de deviner : ``is_admin`` est calculé à la demande,… (+11 more)

### Community 31 - "pytest"
Cohesion: 0.12
Nodes (16): protab_adapters_outbound_persistence_postgres_audit_trail_repository, protab_adapters_outbound_persistence_postgres_scope_monitoring_repository, pytest, In-memory adapter of the AuditTrailRepository port for tests. Every filter here…, make_event(), fixture, Integration tests for the PostgreSQL audit trail adapter. Skipped when…, Mirrors tests/unit/adapters/audit_trail_filter_test.py against real SQL. (+8 more)

### Community 32 - "Hexagonal Architecture (Ports and Adapters)"
Cohesion: 0.22
Nodes (9): Adapters (Inbound / Outbound), Dependency Injection and Composition Root, Dependency Rule (Adapters → Ports → Application → Domain), Domain Layer, Domain Error Handling and Adapter Translation, Framework Isolation, Hexagonal Architecture (Ports and Adapters), Ports (Inbound and Outbound Contracts) (+1 more)

### Community 33 - "ExportModal.tsx"
Cohesion: 0.27
Nodes (12): ExportModal(), ScopeBase, scope(), buildExportRows(), CsvSeparator, downloadFile(), exportFilename(), ExportFormat (+4 more)

### Community 34 - "api Service (FastAPI backend)"
Cohesion: 0.19
Nodes (13): api Healthcheck (/healthz), api Service (FastAPI backend), db Healthcheck (pg_isready), db Service (postgres:17-alpine), Default Project Seeding Env Vars, ProTab Development Docker Stack, frontend Service (React/nginx build), pgdata Named Volume (+5 more)

### Community 35 - "project_admin_test.py"
Cohesion: 0.14
Nodes (24): Integration tests for the ``protab-project`` administrative command. The…, The whole point: the code belongs to the project, not to a scope., ``MLOZ/MRAM`` is the scope list form; as an admin it could never be matched by…, The command must close the sessions it orphans. Whether a removed administrator…, Removing it would leave nobody able to open the project again., run(), stored_hash(), test_add_admin_grants_access() (+16 more)

### Community 36 - "analytics.ts"
Cohesion: 0.15
Nodes (27): Sparklines sur `/analyse` — pas de recharts, AnalyticsPage(), CONFIG, scope(), aggregateByDay(), aggregateByWeek(), buildPeriodDays(), clampRange() (+19 more)

### Community 37 - "Development Workflow (9 Steps)"
Cohesion: 0.40
Nodes (6): Definition of Done Checklist, Development Workflow (9 Steps), Documentation Synchronization Requirement, Graphify Knowledge Graph Workflow, Test-Driven Development (RED/GREEN/REFACTOR), Testing Strategy (Test Pyramid)

### Community 38 - "7. Les adaptateurs sortants"
Cohesion: 0.15
Nodes (10): 7. Les adaptateurs sortants, Exception, DuplicateDailyActivityError, Raised when a ScopeMonitoring already has a DailyActivity for the given day., Raised when a ScopeMonitoring with the same name already exists., Raised when a creation targets a ScopeMonitoring id that is already taken.…, ScopeMonitoringAlreadyExistsError, ScopeMonitoringNameAlreadyExistsError (+2 more)

### Community 39 - "build_connection_pool"
Cohesion: 0.13
Nodes (11): ConnectionPool, protab_adapters_outbound_persistence_postgres_pool, psycopg, psycopg_pool, build_connection_pool(), ping_check(), Connection, Shared PostgreSQL connection-pool configuration for persistence adapters. (+3 more)

### Community 72 - "project_admin_cli_test.py"
Cohesion: 0.20
Nodes (14): protab, parametrize, ``protab-project --help`` must list the subcommands. The dispatcher resolves…, ``protab-project <code> <nom>`` predates the subcommands and stays valid., A bare invocation is still an error. Turning it into a success would make a…, The inventory must not swallow the per-subcommand argparse help., run_cli(), test_a_subcommand_without_its_arguments_still_errors() (+6 more)

### Community 73 - "CreateDailyActivityUseCase"
Cohesion: 0.30
Nodes (11): handle_create_daily_activity(), CreateDailyActivityCommand, CreateDailyActivityUseCase, make_command(), make_scope(), make_scope_daily_activity(), test_create_daily_activity(), test_create_duplicate_day_raises_and_persists_nothing() (+3 more)

### Community 74 - "postgres_auth_repository_test.py"
Cohesion: 0.14
Nodes (5): Integration tests for the PostgreSQL auth repository rule: the quadrigramme…, Reusing a project code is the likeliest CLI mistake, and it must not reach the…, A code the login screen refuses would lock the administrator out., test_add_admin_rejects_an_unusable_code(), test_creating_a_project_twice_reports_the_duplicate()

### Community 76 - "AnalyticsPage.tsx"
Cohesion: 0.20
Nodes (6): Les trois conséquences sur le reste de l'application, AnalyticsKpiCards(), formatPeriod(), GRANULARITIES, initialFilters(), resolvePresetRange()

### Community 77 - "AuditActivityHeatmap.tsx"
Cohesion: 0.27
Nodes (9): AuditActivityHeatmap(), AuditActivityHeatmapProps, HOURS, intensityClass(), WEEKDAYS, toMondayFirstIndex(), AuditEvent, buildHeatmapMatrix() (+1 more)

### Community 78 - "AdminDirectory"
Cohesion: 0.20
Nodes (7): 3. Tests d'intégration — `tests/integration/adapters/`, Contre l'API, sans base, Contre PostgreSQL réel, AdminDirectory, Protocol, Who may act as a project administrator. ``project_admins`` is the storage; this…, Whether ``code`` is an administrator of the current project. The project is…

### Community 79 - "postgres_auth_bootstrap_test.py"
Cohesion: 0.21
Nodes (13): Return the quadrigramme seeding the first project's administrator. Same fail-…, Return the password seeding the first project, or refuse to start. Called only…, resolve_bootstrap_admin_code(), resolve_bootstrap_password(), The bootstrap secrets must never fall back to a hardcoded default. A missing…, test_admin_code_trims_surrounding_whitespace(), test_blank_admin_code_raises(), test_blank_variable_raises() (+5 more)

### Community 80 - "set_current_project"
Cohesion: 0.13
Nodes (22): project_context(), Token, reset_current_project(), set_current_project(), project(), test_list_isolated_by_project(), add_scope_for(), project() (+14 more)

### Community 81 - "measure-usage.sh"
Cohesion: 0.23
Nodes (14): container_writable(), image_on_disk(), image_uncompressed(), print_containers(), print_devenv_guard(), print_disk_totals(), print_host(), print_images() (+6 more)

### Community 82 - "Tally plutôt qu'un tableur de production"
Cohesion: 0.29
Nodes (6): Ce qu'un tableur continue de mieux faire, Ce que le Cloud a réglé… et ce que le tableur ne réglera jamais, Ce que Tally apporte, En résumé, Quand conserver le tableur ?, Tally plutôt qu'un tableur de production

### Community 83 - "ScopeMonitoringRepository"
Cohesion: 0.11
Nodes (8): GetScopeUseCase, Protocol, Create the given ScopeMonitoring and its activities. Creation only: an already…, Return the ScopeMonitoring with the given id, or None., Return the ScopeMonitoring with the given name, or None., Overwrite the counters of a single day, leaving the others alone. The status is…, Overwrite the two officials of one scope, leaving everything else alone.…, ScopeMonitoringRepository

### Community 84 - "Développement"
Cohesion: 0.22
Nodes (9): 11. Problèmes fréquents, 12. Documents voisins, 1. Prérequis, 2. Installation, 6. Tests, 7. Administration d'hôte, 8. Docker, 9. Qualité : ce que le dépôt fait — et ce qu'il ne fait pas (+1 more)

### Community 85 - "NonWorkingDays"
Cohesion: 0.08
Nodes (43): IntEnum, _is_iso_weekday(), IsoWeekday, NonWorkingDays, A project's working calendar: recurring weekdays and one-off dates. Both…, The calendar of a project that never configured one., Rebuild a calendar from an untyped ``projects.non_working_days`` value. Lenient…, The ISO 8601 weekday scale, which is what ``excluded_weekdays`` stores.… (+35 more)

### Community 86 - "fixture"
Cohesion: 0.50
Nodes (4): bootstrap_password(), fixture, The bootstrap secrets are mandatory: no default is provided.…, scopes()

### Community 87 - "app.py"
Cohesion: 0.09
Nodes (26): collections_abc, csv, protab_adapters_inbound_api_auth, protab_adapters_inbound_api_errors, protab_adapters_inbound_api_schemas, protab_adapters_outbound_persistence_in_memory_audit_trail_repository, protab_application_commands_create_scope_monitoring, protab_application_queries_get_daily_activity (+18 more)

### Community 88 - "L'architecture Docker de ProTab"
Cohesion: 0.12
Nodes (17): 1. Vue d'ensemble à l'exécution, 2. Ordre de démarrage : ce que les dépendances garantissent, 3. Chaîne de construction des images, 4. Le premier démarrage : une fenêtre, pas une configuration, 5. Requêtes : le rôle de nginx est plus qu'un serveur de fichiers, 6. Sécurité : ce que la topologie garantit, et ce qu'elle ne garantit pas, 7. Commandes de la stack, Ce que le diagramme dit des ports publiés (+9 more)

### Community 90 - "add_scope"
Cohesion: 0.14
Nodes (14): add_scope(), Permanent access is not a password bypass: the admin is one factor., An administrator of A is nobody in B. ``GET /projects`` is unauthenticated, so…, ``authenticate()`` only runs at login, so a removed administrator would keep a…, test_a_code_in_no_scope_and_no_admin_list_is_refused(), test_admin_code_is_normalized_like_a_scope_code(), test_admin_is_scoped_to_its_own_project(), test_admin_still_needs_the_project_password() (+6 more)

### Community 91 - "CreateScopeMonitoringUseCase"
Cohesion: 0.49
Nodes (9): CreateScopeMonitoringUseCase, make_command(), test_create_blank_billing_code_raises_and_writes_nothing(), test_create_duplicate_name_raises_and_persists_nothing(), test_create_empty_official_raises(), test_create_invalid_knowledge_base_id_raises(), test_create_multiple_scope_monitorings(), test_create_stores_the_billing_code() (+1 more)

### Community 92 - "Audit Trail (best-effort mutation journal)"
Cohesion: 0.40
Nodes (6): Audit Trail (best-effort mutation journal), Domain Error to HTTP Status Mapping, REST Routes and Status Codes Table, React Root Mount (#root), React SPA HTML Entry Point, Tailwind Dark Theme Utility Tokens

### Community 93 - "ScopeListPage.tsx"
Cohesion: 0.08
Nodes (41): 9. La page d'analyse — `/analyse`, Chaque bloc mesure une chose différente, Le reste de la page, AnalyticsFilterBarProps, CompleteTodayButton(), CompleteTodayButtonProps, DashboardChartsProps, Modal() (+33 more)

### Community 94 - "AnalyticsFilterBar.tsx"
Cohesion: 0.16
Nodes (17): ANALYTICS_PATH, AnalyticsFilterBar(), AnalyticsFilters, applyPreset(), billingCodeKey(), formatRange(), SCOPE_DETAIL_PATH, SCOPE_LIST_PATH (+9 more)

### Community 95 - "update_daily_activity_test.py"
Cohesion: 0.35
Nodes (11): 10. Cycle de vie d'une écriture, handle_update_daily_activity(), UpdateDailyActivityCommand, UpdateDailyActivityUseCase, make_scope_with_activity(), A PATCH must not rewrite the whole scope. Rewriting the aggregate persists…, test_update_daily_activity(), test_update_day_without_activity_raises() (+3 more)

### Community 96 - "empty_database"
Cohesion: 0.15
Nodes (13): empty_database(), A project must never be created without someone able to enter it. Once it owns…, Both secrets are missing: the message must name the one resolved first.…, The secrets are only needed to seed; a restart must not require them. Requiring…, The seeded administrator must be usable as a login right away., Create the schema, then drop every project so a bootstrap is pending., Seeding the first project demands an explicit, non-guessable password. No…, test_bootstrap_grants_the_configured_admin_code() (+5 more)

### Community 98 - "AuditEventQuery"
Cohesion: 0.13
Nodes (36): InMemoryAuditTrailRepository, current_project_id(), CreateScopeMonitoringCommand, AuditEventQuery, Filters selecting a slice of the audit trail. Two decisions here are load-…, actions(), make_event(), ``list`` must select the same events in both audit trail adapters.… (+28 more)

### Community 99 - "scope_monitoring_repository_contract_test.py"
Cohesion: 0.39
Nodes (7): inspect, port_methods(), parametrize, Every implementation must offer every method the port declares. Nothing in this…, test_implementation_offers_every_port_method(), test_port_methods_keep_their_signature(), test_the_port_declares_the_methods_the_application_calls()

### Community 100 - "6. Tests frontend"
Cohesion: 0.10
Nodes (34): 8. Saisie et autosave, Les champs en brouillon — note et responsables, pas un autosave, Les responsables — un brouillon réservé aux administrateurs, Saisie d'une référence FEAI, Suppression et annulation, Un piège que le ref de statut referme, 6. Tests frontend, Pièges propres à cette suite (+26 more)

### Community 101 - "AnalyticsHeatmap.tsx"
Cohesion: 0.14
Nodes (16): AnalyticsErrorHeatmap(), columnLabels(), ErrorCell(), ErrorMatrix(), getHeatmapStep(), AnalyticsKpiCardsProps, KpiCardProps, CARD_CLASS (+8 more)

### Community 102 - "update_scope_note_test.py"
Cohesion: 0.32
Nodes (14): handle_update_scope_note(), UpdateScopeNoteCommand, Overwrite the free-text note of an existing scope. The note is written through…, UpdateScopeNoteUseCase, make_scope(), A note edit must not rewrite the whole scope. Rewriting the aggregate persists…, test_update_note_clears_the_note_when_emptied(), test_update_note_leaves_the_daily_activities_intact() (+6 more)

### Community 103 - "5. La couche application"
Cohesion: 0.33
Nodes (5): 5. La couche application, Port de périmètre — `ports/outbound/scope_monitoring_repository.py`, Domaine — `tests/unit/domain/`, Replace the officials of the scope. The :class:`Officials` value object re-runs…, Replace the free-text note of the scope. A blank note is stored as "no note"…

### Community 104 - "isValidIsoDate"
Cohesion: 0.52
Nodes (6): DateNavigator(), DateNavigatorProps, formatDayMonthFr(), formatWeekdayFr(), shiftDay(), isValidIsoDate()

### Community 105 - "PostgresScopeMonitoringRepository"
Cohesion: 0.21
Nodes (12): API Configuration via load_dotenv and os.getenv, Configuration and Secrets Management, Idempotent Schema Bootstrap (CREATE TABLE IF NOT EXISTS), InMemoryScopeMonitoringRepository, PostgreSQL Integration Tests (make test-db), Centralized PostgreSQL Pool Configuration, PostgresScopeMonitoringRepository, ProTab Infrastructure Notes (+4 more)

### Community 106 - "Sparkline.tsx"
Cohesion: 0.60
Nodes (3): buildPath(), Sparkline(), SparklineProps

### Community 107 - "Ressources consommées par la stack"
Cohesion: 0.18
Nodes (11): 10. Un défaut corrigé au cours de cette mesure, 1. Poids sur le disque, 2. Consommation mémoire et CPU au repos, 3. Comportement sous charge, 4. Débit et latence, 5. Ce qui n'appartient pas à la stack, 6. Configuration PostgreSQL et mémoire, 7. Dimensionnement (+3 more)

### Community 108 - ".apply_status"
Cohesion: 0.40
Nodes (3): _normalise_ko_reason(), Set the day's status — the only way to write it. A reason belongs to a KO and…, Reduce a reason to the one shape a day can hold. A blank reason and no reason…

### Community 109 - "route_authorization_test.py"
Cohesion: 0.16
Nodes (13): APIRoute, fastapi_routing, fastapi_testclient, protab_adapters_inbound_api_app, business_routes(), Business routes must be authenticated by default (allowlist, not denylist).…, Guards against a silent rename making this test vacuously pass., A public route answers an anonymous caller; a business route does not. Uses a… (+5 more)

### Community 110 - "ScopeMonitoring"
Cohesion: 0.07
Nodes (35): Recherche : le responsable passe avant le suppléant, 7. Écrire un nouveau test, AuditLogFilterBarProps, ExportModalProps, ScopeDetailCharts(), ScopeDetailChartsProps, ScopeDetailCharts, FILTERS (+27 more)

### Community 111 - "repository"
Cohesion: 0.50
Nodes (4): 2. Vue d'ensemble des couches, bootstrap_password(), fixture, repository()

### Community 112 - "build_changes"
Cohesion: 0.36
Nodes (7): build_changes(), Return only the fields whose value differs between ``before`` and ``after``.…, test_audit_event_defaults(), test_build_changes_empty_when_identical(), test_build_changes_from_empty_keeps_all_fields(), test_build_changes_handles_removed_fields(), test_build_changes_keeps_only_different_fields()

### Community 114 - "require_current_project"
Cohesion: 0.11
Nodes (15): 11. Où aller quand…, 12. Documents voisins, 1. Ce que fait l'application, 8. Multi-tenant : le mécanisme à comprendre avant toute modification, 9. Modèle de données, Architecture, RuntimeError, MissingProjectContextError (+7 more)

### Community 117 - "protab_adapters_outbound_persistence_postgres_auth_repository"
Cohesion: 0.25
Nodes (10): protab_adapters_outbound_persistence_postgres_auth_repository, _official_codes(), Quadrigrammes declared by one ``officials`` column (format « A/B »).…, Parsing of the officials columns that gate the quadrigramme. Both…, ``MRAM/ ?`` means "MRAM, no backup": ``?`` is not a quadrigramme., test_handles_empty_and_none(), test_ignores_punctuation_only_parts(), test_placeholder_is_not_a_code() (+2 more)

### Community 125 - ".from_raw"
Cohesion: 0.33
Nodes (5): Rebuild a status from an untyped ``daily_activities.status`` value. Lenient on…, test_a_day_status_is_a_closed_set_of_three_states(), test_a_day_status_reads_back_from_its_stored_value(), test_a_day_status_serialises_to_its_stored_value(), test_an_unreadable_status_reads_as_pending()

## Ambiguous Edges - Review These
- `React Root Mount (#root)` → `Audit Trail (best-effort mutation journal)`  [AMBIGUOUS]
  src/FrontEnd/index.html · relation: conceptually_related_to

## Knowledge Gaps
- **205 isolated node(s):** `protab`, `name`, `private`, `version`, `type` (+200 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 623 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **54 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `React Root Mount (#root)` and `Audit Trail (best-effort mutation journal)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `RecordingScopeMonitoringRepository` connect `RecordingScopeMonitoringRepository` to `scope_monitoring_repository_contract_test.py`, `update_scope_note_test.py`, `DailyActivity`, `CreateDailyActivityUseCase`, `ScopeMonitoring`, `ScopeMonitoring`, `DayStatus`, `datetime`, `InMemoryScopeMonitoringRepository`, `CreateScopeMonitoringUseCase`, `update_daily_activity_test.py`?**
  _High betweenness centrality (0.181) - this node is a cross-community bridge._
- **Why does `7. Écrire un nouveau test` connect `ScopeMonitoring` to `RecordingScopeMonitoringRepository`, `Tests`?**
  _High betweenness centrality (0.164) - this node is a cross-community bridge._
- **Why does `6. Le modèle mono-jour` connect `AuditLogPage.tsx` to `analytics.ts`, `ScopeDetailPage.tsx`, `AuditActivityHeatmap.tsx`, `ScopeMonitoring`, `NonWorkingDays`, `ScopeListPage.tsx`?**
  _High betweenness centrality (0.142) - this node is a cross-community bridge._
- **Are the 99 inferred relationships involving `InMemoryScopeMonitoringRepository` (e.g. with `2. Vue d'ensemble des couches` and `5. Ce que ces tests ne prouvent pas`) actually correct?**
  _`InMemoryScopeMonitoringRepository` has 99 INFERRED edges - model-reasoned connections that need verification._
- **Are the 68 inferred relationships involving `DailyActivity` (e.g. with `_activity_to_response()` and `InMemoryScopeMonitoringRepository`) actually correct?**
  _`DailyActivity` has 68 INFERRED edges - model-reasoned connections that need verification._
- **Are the 63 inferred relationships involving `create_app()` (e.g. with `API — `adapters/inbound/api/`` and `close_persistence()`) actually correct?**
  _`create_app()` has 63 INFERRED edges - model-reasoned connections that need verification._