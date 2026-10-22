# Graph Report - ProTab  (2026-10-22)

## Corpus Check
- 225 files · ~139,568 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: (none) 9, .example 1, .conf 1)

## Summary
- 1953 nodes · 4822 edges · 130 communities (84 shown, 46 thin omitted)
- Extraction: 80% EXTRACTED · 20% INFERRED · 0% AMBIGUOUS · INFERRED: 965 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `59c8f035`
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
- react
- scope_monitoring_test.py
- api_test.py
- create_app
- ScopeDetailPage.tsx
- current_user
- useToast.tsx
- Tests
- protabApi
- InMemoryScopeMonitoringRepository
- App.tsx
- postgres_scope_monitoring_repository_test.py
- api_config_test.py
- compilerOptions
- protab_application_use_cases_complete_daily_activity
- FakeAuthRepository
- protab_domain_exceptions
- update_scope_officials_test.py
- La CLI `protab-project`
- Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring)
- postgres_auth_repository.py
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
- ScopeMonitoring
- Application Layer / Use Cases
- protab
- project_admin_cli_test.py
- create_daily_activity_test.py
- postgres_auth_repository_test.py
- ref_fs
- audit_trail_filter_test.py
- AuditActivityHeatmap.tsx
- UpdateScopeOfficialsUseCase
- postgres_auth_bootstrap_test.py
- set_current_project
- measure-usage.sh
- Tally plutôt qu'un tableur de production
- ScopeMonitoringRepository
- Développement
- NonWorkingDays
- project
- app.py
- L'architecture Docker de ProTab
- AnalyticsFilterBar.test.tsx
- seed_three_days
- CreateScopeMonitoringUseCase
- Audit Trail (best-effort mutation journal)
- kpi.ts
- AnalyticsFilterBar.tsx
- update_daily_activity_test.py
- PostgresAuthRepository
- ProTab Project Documentation
- AuditEventQuery
- scope_monitoring_repository_contract_test.py
- ActivityFormModal.tsx
- AnalyticsHeatmap.tsx
- update_scope_note_test.py
- NotProjectAdminError
- ScopeMonitoringNotFoundError
- PostgresScopeMonitoringRepository
- Frontend
- Ressources consommées par la stack
- Project
- protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository
- search.ts
- repository
- build_changes
- count_activity_rows
- require_current_project
- build_repository
- _official_codes
- repo
- canonical_feai
- test_update_officials_touches_its_own_row_only
- test_update_officials_refuses_another_project
- test_a_refused_save_leaves_a_concurrent_note_intact
- Request
- Connection
- datetime
- Token
- post-checkout
- post-commit
- ref_path

## God Nodes (most connected - your core abstractions)
1. `InMemoryScopeMonitoringRepository` - 111 edges
2. `create_app()` - 80 edges
3. `DailyActivity` - 68 edges
4. `ScopeMonitoring` - 58 edges
5. `DayStatus` - 52 edges
6. `AuditEventQuery` - 39 edges
7. `vitest` - 39 edges
8. `react` - 38 edges
9. `ScopeMonitoringRepository` - 36 edges
10. `PostgresAuthRepository` - 34 edges

## Surprising Connections (you probably didn't know these)
- `Port d'audit — `ports/outbound/audit_trail_repository.py`` --references--> `AuditEventQuery`  [INFERRED]
  docs/architecture.md → src/protab/ports/outbound/audit_trail_repository.py
- `Le reste de la page` --references--> `Modal()`  [INFERRED]
  docs/frontend.md → src/FrontEnd/src/components/Modal.tsx
- `Application — `tests/unit/application/`` --references--> `InMemoryScopeMonitoringRepository`  [INFERRED]
  docs/testing.md → src/protab/adapters/outbound/persistence/in_memory_scope_monitoring_repository.py
- `Adaptateurs — `tests/unit/adapters/`` --references--> `AuditEventQuery`  [INFERRED]
  docs/testing.md → src/protab/ports/outbound/audit_trail_repository.py
- `Ports — `tests/unit/ports/`` --references--> `ScopeMonitoringRepository`  [INFERRED]
  docs/testing.md → src/protab/ports/outbound/scope_monitoring_repository.py

## Import Cycles
- None detected.

## Communities (130 total, 46 thin omitted)

### Community 0 - "index.ts"
Cohesion: 0.09
Nodes (36): 3. Client HTTP — `services/api.ts`, CsvImportModal(), CsvImportModalProps, DashboardChartsProps, Modal(), ModalProps, ScopeFormModal(), ScopeFormModalProps (+28 more)

### Community 1 - "PostgresScopeMonitoringRepository"
Cohesion: 0.22
Nodes (7): Connection, PostgresScopeMonitoringRepository, date, DayStatus, Persist ``ScopeMonitoring`` aggregates in PostgreSQL. The schema is applied…, Close the connection pool, releasing database connections., Replace the two completion booleans by the single ``status`` column.…

### Community 2 - "package.json"
Cohesion: 0.05
Nodes (39): jsdom, react-dom, tailwindcss, @tailwindcss/vite, @types/node, @types/react, @types/react-dom, typescript (+31 more)

### Community 3 - "audit_log_api_test.py"
Cohesion: 0.11
Nodes (27): contextvars, project_context(), Token, Per-request audit context. Mirrors the ``_CURRENT_PROJECT_ID`` ContextVar…, reset_current_actor(), set_current_actor(), all_events(), clear_actor() (+19 more)

### Community 4 - "parse_scope_monitorings_csv"
Cohesion: 0.14
Nodes (29): 6. Les adaptateurs entrants, CLI — `src/protab/project_admin.py`, CSV — `adapters/inbound/csv/scope_monitoring_csv_reader.py`, fastapi_responses, JSONResponse, Path, pathlib, protab_adapters_inbound_csv_scope_monitoring_csv_reader (+21 more)

### Community 5 - "OfficialCode"
Cohesion: 0.07
Nodes (41): argparse, getpass, protab_domain_value_objects_official_code, Grant permanent access to one project. Returns False if already set. The code…, OfficialCode, A single official identity, normalized the way login normalizes it.…, _add_admin(), _create_project() (+33 more)

### Community 6 - "DomainError"
Cohesion: 0.12
Nodes (29): DuplicateFeaiReferenceError, IncidentsExceedErrorsError, InvalidFeaiReferenceError, InvalidKoReasonError, KoReasonTooLongError, NegativeErrorsCountError, NegativeIncidentsCountError, Raised when incidents_created exceeds errors_reported. (+21 more)

### Community 7 - "DailyActivity"
Cohesion: 0.06
Nodes (69): Enum, set_daily_activities_status(), SetActivitiesStatusCommand, Set the status of one or more days of a scope. One rule lives here rather than…, SetActivitiesStatusUseCase, DailyActivity, _normalise_ko_reason(), Set the day's status — the only way to write it. A reason belongs to a KO and… (+61 more)

### Community 8 - "react"
Cohesion: 0.18
Nodes (18): react, activeFilterCount(), AuditLogFilterBar(), AuditLogFilterBarProps, AuditLogFilters, DateInput(), EMPTY_FILTERS, ACTION_ICONS (+10 more)

### Community 9 - "scope_monitoring_test.py"
Cohesion: 0.10
Nodes (25): 3. Le domaine, KnowledgeBase, Officials, build_scope(), fixture_scope_monitoring(), fixture, parametrize, Different ScopeMonitoring instances can have activities on the same day. (+17 more)

### Community 10 - "api_test.py"
Cohesion: 0.06
Nodes (34): client(), create_scope_via_api(), make_scope_with_activity(), fixture, The route has to accept a KO on a day that has no row yet. That is the…, Setting a status is not an entry: it must not insert a row on its own. Only the…, 422, not 400: the bound is refused by the request schema itself. The domain's…, test_a_blank_ko_reason_is_stored_as_no_reason() (+26 more)

### Community 11 - "create_app"
Cohesion: 0.10
Nodes (34): BaseModel, field_validator, model_validator, pydantic, _activity_to_response(), _audit_event_to_response(), create_app(), create_scope_monitorings() (+26 more)

### Community 12 - "ScopeDetailPage.tsx"
Cohesion: 0.09
Nodes (45): 7. Le statut d'une journée : `pending`, `completed`, `ko`, Le détail est mono-jour lui aussi, Le lot, depuis l'historique, Où le statut est écrit, lucide-react, recharts, ActivityRow(), Badge() (+37 more)

### Community 13 - "current_user"
Cohesion: 0.12
Nodes (22): API — `adapters/inbound/api/`, 4. Démarrage en développement, fastapi, protab_adapters_inbound_api_config, protab_adapters_outbound_persistence_postgres_auth_repository, Response, get_project_settings(), list_projects() (+14 more)

### Community 14 - "useToast.tsx"
Cohesion: 0.06
Nodes (41): 6. Tests frontend, Pièges propres à cette suite, @testing-library/jest-dom, @testing-library/react, vitest, ScopeDetailCharts(), ToastContainer(), ToastAction (+33 more)

### Community 15 - "Tests"
Cohesion: 0.15
Nodes (13): 1. Vue d'ensemble, 2. Tests unitaires — `tests/unit/`, 3. Tests d'intégration — `tests/integration/adapters/`, 4. Test E2E — `tests/e2e/`, 5. Ce que ces tests ne prouvent pas, 7. Écrire un nouveau test, 8. Documents voisins, Adaptateurs — `tests/unit/adapters/` (+5 more)

### Community 16 - "protabApi"
Cohesion: 0.10
Nodes (11): ScopeNoteCard(), ScopeNoteCardProps, ScopeOfficials, ScopeOfficialsCardProps, protabApi, clickSave(), save(), textarea() (+3 more)

### Community 17 - "InMemoryScopeMonitoringRepository"
Cohesion: 0.16
Nodes (13): InMemoryScopeMonitoringRepository, date, DayStatus, make_scope(), ``save`` must refuse what the SQL adapter refuses. Both adapters implement…, Same refusal as the SQL adapter, or the two are not interchangeable. An empty…, Reporting a blocked day is what makes the status usable at all. Nobody could…, test_a_refused_save_leaves_the_stored_scope_untouched() (+5 more)

### Community 18 - "App.tsx"
Cohesion: 0.08
Nodes (29): 4. Chemins et routage, react-router-dom, App(), AppContent(), src_frontend_src_assets_layered_waves_dark, src_frontend_src_assets_layered_waves_light, LoginBackground(), Navbar() (+21 more)

### Community 19 - "postgres_scope_monitoring_repository_test.py"
Cohesion: 0.09
Nodes (23): make_scope(), Integration tests for the PostgreSQL repository adapter. These tests exercise…, ``save`` creates a row; it never rewrites one. A second ``save`` used to…, The write must name the rows it changes, like the activity writes. A full…, test_api_flow_persists_in_postgres(), test_complete_unknown_day_does_not_partially_persist(), test_duplicate_name_via_api_returns_409(), test_find_all_loads_activities_for_all_scopes() (+15 more)

### Community 20 - "api_config_test.py"
Cohesion: 0.13
Nodes (19): 3. Configuration, dotenv, os, cookie_secure_from_env(), host_port_from_env(), InvalidPortError, Exception, Resolve host/port from env values, falling back to defaults. (+11 more)

### Community 21 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 23 - "FakeAuthRepository"
Cohesion: 0.12
Nodes (16): AuthSession, FakeAuthRepository, login_and_read_session_cookie(), Un calendrier sans jour ouvré n'a rien à afficher : la page principale…, Le refus porte sur la semaine entière, pas sur le week-end : un projet qui…, Le cookie et la ligne ``auth_sessions`` doivent tomber ensemble : un cookie…, test_authenticated_routes_require_a_valid_session(), test_login_rejects_invented_quadrigramme_when_known_codes_exist() (+8 more)

### Community 24 - "protab_domain_exceptions"
Cohesion: 0.14
Nodes (16): protab_adapters_outbound_persistence_postgres_scope_monitoring_repository, protab_application_actor_context, protab_application_commands_create_scope_monitoring, protab_application_commands_daily_activity, protab_application_commands_scope_monitoring, protab_domain_entities_audit_event, protab_domain_exceptions, protab_ports_outbound_admin_directory (+8 more)

### Community 25 - "update_scope_officials_test.py"
Cohesion: 0.21
Nodes (21): admin_edit(), FakeAdminDirectory, make_scope(), Édition des responsables d'un périmètre :use case et autorisation. Le droit…, L'§28.1 : une édition passe par une écriture ciblée du port, jamais par…, Un champ inchangé ne doit pas figurer dans le diff : l'événement raconte ce qui…, Pour un **admin**, la permission est établie : un id inconnu remonte alors la…, Administrateurs de la base de test, normalisés comme le fait le SQL. (+13 more)

### Community 26 - "La CLI `protab-project`"
Cohesion: 0.12
Nodes (17): 10. En Docker, 11. Voir aussi, 1. Ce que la CLI fait, et ce qu'elle ne fait pas, 2. Prérequis, 3. Inventaire des commandes, 4. Les mots de passe, 5. Qui peut se connecter, 6. Pourquoi nommer un administrateur (+9 more)

### Community 27 - "Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring)"
Cohesion: 0.25
Nodes (9): Aggregate Owns DailyActivities Indexed by Day, Atomic ScopeMonitoring Creation, CSV Import Inbound Adapter, DailyActivity (Entity), Day Is Not a Class (datetime.date as value object), Domain Invariants (counters, FEAI format, completion implication), Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring), Query Use Cases (ListScopes, GetScope, GetDailyActivity, ListAuditEvents) (+1 more)

### Community 28 - "postgres_auth_repository.py"
Cohesion: 0.20
Nodes (8): hashlib, hmac, protab_domain_value_objects_non_working_days, secrets, _check_password(), _normalize_code(), PostgreSQL persistence for projects and login sessions., Revoke permanent access and drop the sessions it had opened. ``authenticate()``…

### Community 29 - "AuditEvent"
Cohesion: 0.09
Nodes (21): protab_adapters_outbound_persistence_postgres_audit_trail_repository, PostgresAuditTrailRepository, Open the connection pool and apply the (idempotent) schema., Close the connection pool, releasing database connections., ListAuditEventsUseCase, AuditEvent, Persist an audit event., Return audit events matching the query, most recent first. ``scope_ids``… (+13 more)

### Community 30 - "officials_api_test.py"
Cohesion: 0.19
Nodes (17): TestClient, logged_client(), make_scope(), parametrize, Édition des responsables via l'API : réservée aux administrateurs. Le contrôle…, La permission précède la lecture : un id inconnu répond 403, pas 404, sinon le…, Seule l'édition des responsables est réservée aux admins : la note reste un…, Le front n'a pas le droit de deviner : ``is_admin`` est calculé à la demande,… (+9 more)

### Community 31 - "pytest"
Cohesion: 0.50
Nodes (3): pytest, Tenant isolation must fail closed when no project context is established. A…, test_raises_when_no_context_is_established()

### Community 32 - "Hexagonal Architecture (Ports and Adapters)"
Cohesion: 0.22
Nodes (9): Avoid Premature Abstraction, Dependency Injection and Composition Root, Dependency Rule (Adapters → Ports → Application → Domain), Domain Layer, Framework Isolation, Hexagonal Architecture (Ports and Adapters), Ports (Inbound and Outbound Contracts), SOLID Principles (+1 more)

### Community 33 - "ExportModal.tsx"
Cohesion: 0.27
Nodes (12): ExportModal(), ExportModalProps, ScopeBase, buildExportRows(), CsvSeparator, downloadFile(), exportFilename(), ExportFormat (+4 more)

### Community 34 - "api Service (FastAPI backend)"
Cohesion: 0.19
Nodes (13): api Healthcheck (/healthz), api Service (FastAPI backend), db Healthcheck (pg_isready), db Service (postgres:17-alpine), Default Project Seeding Env Vars, ProTab Development Docker Stack, frontend Service (React/nginx build), pgdata Named Volume (+5 more)

### Community 35 - "project_admin_test.py"
Cohesion: 0.11
Nodes (29): protab, Integration tests for the ``protab-project`` administrative command. The…, The whole point: the code belongs to the project, not to a scope., ``MLOZ/MRAM`` is the scope list form; as an admin it could never be matched by…, The command must close the sessions it orphans. Whether a removed administrator…, Removing it would leave nobody able to open the project again., The historical form stays valid, but it must not fail silently., Rotating a leaked password must not leave old sessions usable. (+21 more)

### Community 36 - "analytics.ts"
Cohesion: 0.13
Nodes (30): Sparklines sur `/analyse` — pas de recharts, applyPreset(), AnalyticsPage(), formatPeriod(), GRANULARITIES, initialFilters(), CONFIG, aggregateByDay() (+22 more)

### Community 37 - "Development Workflow (9 Steps)"
Cohesion: 0.40
Nodes (6): Definition of Done Checklist, Development Workflow (9 Steps), Documentation Synchronization Requirement, Graphify Knowledge Graph Workflow, Test-Driven Development (RED/GREEN/REFACTOR), Testing Strategy (Test Pyramid)

### Community 38 - "7. Les adaptateurs sortants"
Cohesion: 0.19
Nodes (9): 7. Les adaptateurs sortants, Exception, DuplicateDailyActivityError, Raised when a ScopeMonitoring already has a DailyActivity for the given day., Raised when a ScopeMonitoring with the same name already exists., Raised when a creation targets a ScopeMonitoring id that is already taken.…, ScopeMonitoringAlreadyExistsError, ScopeMonitoringNameAlreadyExistsError (+1 more)

### Community 39 - "build_connection_pool"
Cohesion: 0.13
Nodes (11): ConnectionPool, protab_adapters_outbound_persistence_postgres_pool, psycopg, psycopg_pool, build_connection_pool(), ping_check(), Connection, Shared PostgreSQL connection-pool configuration for persistence adapters. (+3 more)

### Community 40 - "ScopeMonitoring"
Cohesion: 0.10
Nodes (5): date, ScopeMonitoring, date, DayStatus, RecordingScopeMonitoringRepository

### Community 72 - "project_admin_cli_test.py"
Cohesion: 0.22
Nodes (13): parametrize, ``protab-project --help`` must list the subcommands. The dispatcher resolves…, ``protab-project <code> <nom>`` predates the subcommands and stays valid., A bare invocation is still an error. Turning it into a success would make a…, The inventory must not swallow the per-subcommand argparse help., run_cli(), test_a_subcommand_without_its_arguments_still_errors(), test_help_exits_successfully() (+5 more)

### Community 73 - "create_daily_activity_test.py"
Cohesion: 0.36
Nodes (11): handle_create_daily_activity(), CreateDailyActivityCommand, CreateDailyActivityUseCase, make_command(), make_scope(), make_scope_daily_activity(), test_create_daily_activity(), test_create_duplicate_day_raises_and_persists_nothing() (+3 more)

### Community 74 - "postgres_auth_repository_test.py"
Cohesion: 0.06
Nodes (35): add_scope(), add_scope_for(), Integration tests for the PostgreSQL auth repository rule: the quadrigramme…, Give one project a scope, switching the tenant the adapter reads. Both tenants…, ``official_main`` encodes several codes just like ``official_backup``., ``?`` marks the absence of a backup official, it is not a code., La colonne est du JSONB non typé : ce qui est écrit doit être relu à…, The rule the whole feature exists for. Without an administrator, creating the… (+27 more)

### Community 76 - "audit_trail_filter_test.py"
Cohesion: 0.25
Nodes (17): actions(), make_event(), ``list`` must select the same events in both audit trail adapters.…, A ``day IS NULL`` event must survive a period: this is the silent loss., Return a repository holding ``events``. ``InMemoryAuditTrailRepository.record``…, The defect this pins: ``abcd`` and ``AB`` used to return nothing., recorded(), test_actor_ignores_surrounding_whitespace() (+9 more)

### Community 77 - "AuditActivityHeatmap.tsx"
Cohesion: 0.27
Nodes (9): AuditActivityHeatmap(), AuditActivityHeatmapProps, HOURS, intensityClass(), WEEKDAYS, toMondayFirstIndex(), AuditEvent, buildHeatmapMatrix() (+1 more)

### Community 78 - "UpdateScopeOfficialsUseCase"
Cohesion: 0.21
Nodes (9): UpdateScopeOfficialsCommand, AuditTrailRepository, Overwrite the officials of an existing scope, admins only. Written through the…, UpdateScopeOfficialsUseCase, AdminDirectory, Protocol, Whether ``code`` is an administrator of the current project. The project is…, Mode dégradé sans authentification (dev/tests, ``auth=None``) : la seule… (+1 more)

### Community 79 - "postgres_auth_bootstrap_test.py"
Cohesion: 0.15
Nodes (15): _hash_password(), Return the quadrigramme seeding the first project's administrator. Same fail-…, Replace the password of an existing project and drop its sessions. Rotating a…, Return the password seeding the first project, or refuse to start. Called only…, resolve_bootstrap_admin_code(), resolve_bootstrap_password(), The bootstrap secrets must never fall back to a hardcoded default. A missing…, test_admin_code_trims_surrounding_whitespace() (+7 more)

### Community 80 - "set_current_project"
Cohesion: 0.18
Nodes (15): reset_current_project(), set_current_project(), The port resolves the project from the request context, not a value the caller…, test_is_current_project_admin_reads_the_tenant_in_context(), test_is_current_project_admin_refuses_an_empty_context(), project_context(), Every read and write is tenant-scoped: name the project under test. The…, A write must not reach across tenants, even on a known scope id. (+7 more)

### Community 81 - "measure-usage.sh"
Cohesion: 0.23
Nodes (14): container_writable(), image_on_disk(), image_uncompressed(), print_containers(), print_devenv_guard(), print_disk_totals(), print_host(), print_images() (+6 more)

### Community 82 - "Tally plutôt qu'un tableur de production"
Cohesion: 0.29
Nodes (6): Ce qu'un tableur continue de mieux faire, Ce que le Cloud a réglé… et ce que le tableur ne réglera jamais, Ce que Tally apporte, En résumé, Quand conserver le tableur ?, Tally plutôt qu'un tableur de production

### Community 83 - "ScopeMonitoringRepository"
Cohesion: 0.06
Nodes (18): GetScopeUseCase, ListScopesUseCase, AuditTrailRepository, Protocol, date, DayStatus, Protocol, Create the given ScopeMonitoring and its activities. Creation only: an already… (+10 more)

### Community 84 - "Développement"
Cohesion: 0.15
Nodes (12): 10. Publier une modification — liste de contrôle, 11. Problèmes fréquents, 12. Documents voisins, 1. Prérequis, 2. Installation, 5. Base de données : pas d'outil de migration, 6. Tests, 7. Administration d'hôte (+4 more)

### Community 85 - "NonWorkingDays"
Cohesion: 0.08
Nodes (44): IntEnum, _is_iso_weekday(), IsoWeekday, NonWorkingDays, A project's working calendar: recurring weekdays and one-off dates. Both…, The calendar of a project that never configured one., Rebuild a calendar from an untyped ``projects.non_working_days`` value. Lenient…, The ISO 8601 weekday scale, which is what ``excluded_weekdays`` stores.… (+36 more)

### Community 86 - "project"
Cohesion: 0.40
Nodes (5): bootstrap_password(), project(), fixture, The bootstrap secrets are mandatory: no default is provided.…, scopes()

### Community 87 - "app.py"
Cohesion: 0.09
Nodes (25): collections_abc, csv, protab_adapters_inbound_api_auth, protab_adapters_inbound_api_errors, protab_adapters_inbound_api_schemas, protab_adapters_outbound_persistence_in_memory_audit_trail_repository, protab_application_queries_get_daily_activity, protab_application_queries_get_scope (+17 more)

### Community 88 - "L'architecture Docker de ProTab"
Cohesion: 0.12
Nodes (17): 1. Vue d'ensemble à l'exécution, 2. Ordre de démarrage : ce que les dépendances garantissent, 3. Chaîne de construction des images, 4. Le premier démarrage : une fenêtre, pas une configuration, 5. Requêtes : le rôle de nginx est plus qu'un serveur de fichiers, 6. Sécurité : ce que la topologie garantit, et ce qu'elle ne garantit pas, 7. Commandes de la stack, Ce que le diagramme dit des ports publiés (+9 more)

### Community 89 - "AnalyticsFilterBar.test.tsx"
Cohesion: 0.17
Nodes (10): 10. Graphiques et styles, 6. Le modèle mono-jour, Le graphique du détail, Un fond clair a toujours son pendant sombre, FILTERS, MANY, scope(), expectDoesNotClip() (+2 more)

### Community 90 - "seed_three_days"
Cohesion: 0.13
Nodes (15): The upsert writes two columns; the counters of a stored row are not read. A day…, Une liste vide ne doit pas être rapportée « périmètre introuvable ». Le `WHERE…, The tenant filter is not optional, even on a targeted write.…, A database written by the previous schema must keep its completed days. The…, seed_three_days(), test_completing_a_ko_day_clears_its_reason_in_the_database(), test_insert_daily_activity_leaves_other_days_untouched(), test_set_activities_status_creates_a_ko_day_without_touching_the_counters() (+7 more)

### Community 91 - "CreateScopeMonitoringUseCase"
Cohesion: 0.49
Nodes (9): CreateScopeMonitoringUseCase, make_command(), test_create_blank_billing_code_raises_and_writes_nothing(), test_create_duplicate_name_raises_and_persists_nothing(), test_create_empty_official_raises(), test_create_invalid_knowledge_base_id_raises(), test_create_multiple_scope_monitorings(), test_create_stores_the_billing_code() (+1 more)

### Community 92 - "Audit Trail (best-effort mutation journal)"
Cohesion: 0.29
Nodes (8): Adapters (Inbound / Outbound), Domain Error Handling and Adapter Translation, Audit Trail (best-effort mutation journal), Domain Error to HTTP Status Mapping, REST Routes and Status Codes Table, React Root Mount (#root), React SPA HTML Entry Point, Tailwind Dark Theme Utility Tokens

### Community 93 - "kpi.ts"
Cohesion: 0.13
Nodes (27): 9. La page d'analyse — `/analyse`, Chaque bloc mesure une chose différente, Le reste de la page, DEFAULT_EXCLUDED_WEEKDAYS, DEFAULT_NON_WORKING_DAYS, ISO_MONDAY, ISO_SATURDAY, ISO_SUNDAY (+19 more)

### Community 94 - "AnalyticsFilterBar.tsx"
Cohesion: 0.12
Nodes (20): ANALYTICS_PATH, AnalyticsFilterBar(), AnalyticsFilterBarProps, AnalyticsFilters, billingCodeKey(), formatRange(), SCOPE_DETAIL_PATH, SCOPE_LIST_PATH (+12 more)

### Community 95 - "update_daily_activity_test.py"
Cohesion: 0.35
Nodes (11): 10. Cycle de vie d'une écriture, handle_update_daily_activity(), UpdateDailyActivityCommand, UpdateDailyActivityUseCase, make_scope_with_activity(), A PATCH must not rewrite the whole scope. Rewriting the aggregate persists…, test_update_daily_activity(), test_update_day_without_activity_raises() (+3 more)

### Community 96 - "PostgresAuthRepository"
Cohesion: 0.12
Nodes (17): PostgresAuthRepository, Store project credentials and opaque, expiring session tokens., Whether a quadrigramme is an administrator of that one project. Normalization…, Whether the actor is an administrator of the current tenant. Satisfies the…, empty_database(), A project must never be created without someone able to enter it. Once it owns…, Both secrets are missing: the message must name the one resolved first.…, The secrets are only needed to seed; a restart must not require them. Requiring… (+9 more)

### Community 98 - "AuditEventQuery"
Cohesion: 0.24
Nodes (18): InMemoryAuditTrailRepository, CreateScopeMonitoringCommand, AuditEventQuery, Filters selecting a slice of the audit trail. Two decisions here are load-…, make_scope_with_activity(), ``activity_ko`` covers both directions, and ``changes`` disambiguates. A…, The KO reason is cleared from the row on completion — the trail keeps it. A…, test_complete_activity_records_audit_event_per_day() (+10 more)

### Community 99 - "scope_monitoring_repository_contract_test.py"
Cohesion: 0.39
Nodes (7): inspect, port_methods(), parametrize, Every implementation must offer every method the port declares. Nothing in this…, test_implementation_offers_every_port_method(), test_port_methods_keep_their_signature(), test_the_port_declares_the_methods_the_application_calls()

### Community 100 - "ActivityFormModal.tsx"
Cohesion: 0.10
Nodes (34): 5. Providers et état, 8. Saisie et autosave, Les champs en brouillon — note et responsables, pas un autosave, Les responsables — un brouillon réservé aux administrateurs, Saisie d'une référence FEAI, Suppression et annulation, Un piège que le ref de statut referme, ActivityFormModal() (+26 more)

### Community 101 - "AnalyticsHeatmap.tsx"
Cohesion: 0.09
Nodes (24): Les trois conséquences sur le reste de l'application, AnalyticsErrorHeatmap(), AnalyticsErrorHeatmapProps, columnLabels(), ErrorCell(), ErrorMatrix(), getHeatmapStep(), AnalyticsKpiCards() (+16 more)

### Community 102 - "update_scope_note_test.py"
Cohesion: 0.32
Nodes (14): handle_update_scope_note(), UpdateScopeNoteCommand, Overwrite the free-text note of an existing scope. The note is written through…, UpdateScopeNoteUseCase, make_scope(), A note edit must not rewrite the whole scope. Rewriting the aggregate persists…, test_update_note_clears_the_note_when_emptied(), test_update_note_leaves_the_daily_activities_intact() (+6 more)

### Community 103 - "NotProjectAdminError"
Cohesion: 0.25
Nodes (8): 4. Les ports, Absence de port pour l'authentification, Port d'administrateurs — `ports/outbound/admin_directory.py`, Port d'audit — `ports/outbound/audit_trail_repository.py`, Port de périmètre — `ports/outbound/scope_monitoring_repository.py`, DomainError, NotProjectAdminError, Raised when a quadrigramme that is not a project administrator attempts an…

### Community 104 - "ScopeMonitoringNotFoundError"
Cohesion: 0.22
Nodes (5): date, DailyActivityNotFoundError, Raised when a ScopeMonitoring cannot be found for the given id., Raised when a DailyActivity cannot be found for the given day., ScopeMonitoringNotFoundError

### Community 105 - "PostgresScopeMonitoringRepository"
Cohesion: 0.21
Nodes (12): API Configuration via load_dotenv and os.getenv, Configuration and Secrets Management, Idempotent Schema Bootstrap (CREATE TABLE IF NOT EXISTS), InMemoryScopeMonitoringRepository, PostgreSQL Integration Tests (make test-db), Centralized PostgreSQL Pool Configuration, PostgresScopeMonitoringRepository, ProTab Infrastructure Notes (+4 more)

### Community 106 - "Frontend"
Cohesion: 0.29
Nodes (7): 11. Tests, 12. Ce qui n'existe pas, 13. Build et déploiement, 14. Documents voisins, 1. Pile technique, 2. Arborescence, Frontend

### Community 107 - "Ressources consommées par la stack"
Cohesion: 0.18
Nodes (11): 10. Un défaut corrigé au cours de cette mesure, 1. Poids sur le disque, 2. Consommation mémoire et CPU au repos, 3. Comportement sous charge, 4. Débit et latence, 5. Ce qui n'appartient pas à la stack, 6. Configuration PostgreSQL et mémoire, 7. Dimensionnement (+3 more)

### Community 109 - "protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository"
Cohesion: 0.15
Nodes (15): APIRoute, fastapi_routing, fastapi_testclient, protab_adapters_inbound_api_app, protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository, test_daily_activity_full_flow_over_http(), business_routes(), Business routes must be authenticated by default (allowlist, not denylist).… (+7 more)

### Community 110 - "search.ts"
Cohesion: 0.38
Nodes (6): Recherche : le responsable passe avant le suppléant, OFFICIAL_MATCH_RANK, officialMatchRank(), SearchableScope, SEARCHED_FIELDS, sortByOfficialRelevance()

### Community 111 - "repository"
Cohesion: 0.50
Nodes (4): 2. Vue d'ensemble des couches, bootstrap_password(), fixture, repository()

### Community 112 - "build_changes"
Cohesion: 0.17
Nodes (12): 5. La couche application, Domaine — `tests/unit/domain/`, current_actor(), build_changes(), Return only the fields whose value differs between ``before`` and ``after``.…, Replace the officials of the scope. The :class:`Officials` value object re-runs…, Replace the free-text note of the scope. A blank note is stored as "no note"…, test_audit_event_defaults() (+4 more)

### Community 113 - "count_activity_rows"
Cohesion: 0.40
Nodes (5): count_activity_rows(), date, A duplicated day must not create a second row. The use case de-duplicates the…, Count the stored rows for one day, without going through the aggregate., test_the_status_write_creates_a_day_once_per_day()

### Community 114 - "require_current_project"
Cohesion: 0.17
Nodes (13): 11. Où aller quand…, 12. Documents voisins, 1. Ce que fait l'application, 8. Multi-tenant : le mécanisme à comprendre avant toute modification, 9. Modèle de données, Architecture, RuntimeError, current_project_id() (+5 more)

### Community 115 - "build_repository"
Cohesion: 0.50
Nodes (4): build_repository(), Select the persistence adapter from configuration. PostgreSQL is required for…, database_url_from_env(), Return the PostgreSQL DSN from DATABASE_URL, or None when unset.

### Community 117 - "_official_codes"
Cohesion: 0.29
Nodes (9): _official_codes(), Quadrigrammes declared by one ``officials`` column (format « A/B »).…, Parsing of the officials columns that gate the quadrigramme. Both…, ``MRAM/ ?`` means "MRAM, no backup": ``?`` is not a quadrigramme., test_handles_empty_and_none(), test_ignores_punctuation_only_parts(), test_placeholder_is_not_a_code(), test_splits_multiple_codes() (+1 more)

### Community 118 - "repo"
Cohesion: 0.67
Nodes (3): fixture, repo(), truncate_all()

### Community 125 - "datetime"
Cohesion: 0.13
Nodes (13): dataclasses, datetime, protab_domain_entities_daily_activity, protab_domain_entities_day_status, protab_domain_entities_scope_monitoring, re, Domain model for the audit trail. An :class:`AuditEvent` records *who* (actor)…, Who may act as a project administrator. ``project_admins`` is the storage; this… (+5 more)

## Ambiguous Edges - Review These
- `React Root Mount (#root)` → `Audit Trail (best-effort mutation journal)`  [AMBIGUOUS]
  src/FrontEnd/index.html · relation: conceptually_related_to

## Knowledge Gaps
- **205 isolated node(s):** `1. Ce que fait l'application`, `CLI — `src/protab/project_admin.py``, `12. Documents voisins`, `1. Pile technique`, `2. Arborescence` (+200 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 635 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **46 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `React Root Mount (#root)` and `Audit Trail (best-effort mutation journal)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `6. Le modèle mono-jour` connect `AnalyticsFilterBar.test.tsx` to `analytics.ts`, `react`, `Frontend`, `ScopeDetailPage.tsx`, `AuditActivityHeatmap.tsx`, `search.ts`, `NonWorkingDays`, `kpi.ts`, `AnalyticsFilterBar.tsx`?**
  _High betweenness centrality (0.130) - this node is a cross-community bridge._
- **Why does `7. Écrire un nouveau test` connect `Tests` to `ScopeMonitoring`, `useToast.tsx`?**
  _High betweenness centrality (0.115) - this node is a cross-community bridge._
- **Why does `RecordingScopeMonitoringRepository` connect `ScopeMonitoring` to `scope_monitoring_repository_contract_test.py`, `update_scope_note_test.py`, `DailyActivity`, `create_daily_activity_test.py`, `Tests`, `update_scope_officials_test.py`, `CreateScopeMonitoringUseCase`, `datetime`, `update_daily_activity_test.py`?**
  _High betweenness centrality (0.115) - this node is a cross-community bridge._
- **Are the 97 inferred relationships involving `InMemoryScopeMonitoringRepository` (e.g. with `2. Vue d'ensemble des couches` and `5. Ce que ces tests ne prouvent pas`) actually correct?**
  _`InMemoryScopeMonitoringRepository` has 97 INFERRED edges - model-reasoned connections that need verification._
- **Are the 57 inferred relationships involving `create_app()` (e.g. with `API — `adapters/inbound/api/`` and `close_persistence()`) actually correct?**
  _`create_app()` has 57 INFERRED edges - model-reasoned connections that need verification._
- **Are the 62 inferred relationships involving `DailyActivity` (e.g. with `GetDailyActivityUseCase` and `CreateDailyActivityUseCase`) actually correct?**
  _`DailyActivity` has 62 INFERRED edges - model-reasoned connections that need verification._