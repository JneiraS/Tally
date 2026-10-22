# Graph Report - ProTab  (2026-10-22)

## Corpus Check
- 218 files · ~134,709 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: (none) 9, .example 1, .conf 1)

## Summary
- 1831 nodes · 4556 edges · 133 communities (85 shown, 48 thin omitted)
- Extraction: 80% EXTRACTED · 20% INFERRED · 0% AMBIGUOUS · INFERRED: 920 edges (avg confidence: 0.93)
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
- vitest
- Tests
- SetActivitiesStatusUseCase
- InMemoryScopeMonitoringRepository
- App.tsx
- postgres_scope_monitoring_repository_test.py
- api_config_test.py
- compilerOptions
- protab_application_use_cases_complete_daily_activity
- FakeAuthRepository
- datetime
- useTheme.tsx
- La CLI `protab-project`
- Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring)
- PostgresAuthRepository
- AuditEvent
- build_connection_pool
- pytest
- Hexagonal Architecture (Ports and Adapters)
- ScopeMonitoring
- api Service (FastAPI backend)
- project_admin_test.py
- analytics.ts
- Development Workflow (9 Steps)
- 7. Les adaptateurs sortants
- project_admin_cli_test.py
- RecordingScopeMonitoringRepository
- Application Layer / Use Cases
- protab
- audit_trail_test.py
- create_daily_activity_test.py
- postgres_auth_repository_test.py
- ref_fs
- nonWorkingDays.ts
- AuditActivityHeatmap.tsx
- useToast.tsx
- postgres_auth_bootstrap_test.py
- postgres_audit_trail_repository_test.py
- measure-usage.sh
- Tally plutôt qu'un tableur de production
- ScopeMonitoringRepository
- Développement
- NonWorkingDays
- project
- app.py
- L'architecture Docker de ProTab
- queries_test.py
- add_scope
- create_default_app
- exceptions/scope_monitoring.py
- ScopeListPage.tsx
- AnalyticsFilterBar.tsx
- update_daily_activity_test.py
- empty_database
- 5. La couche application
- AuditEventQuery
- add_scope_for
- ActivityFormModal.tsx
- AnalyticsHeatmap.tsx
- update_scope_note_test.py
- canonical_feai
- Frontend
- PostgresScopeMonitoringRepository
- search.test.ts
- Ressources consommées par la stack
- CreateScopeMonitoringUseCase
- protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository
- makeScope
- ScopeMonitoringNotFoundError
- build_changes
- ProTab Project Documentation
- Architecture
- _scope_to_response
- _official_codes
- test_main_split_form_auths_both_codes
- test_backup_placeholder_is_not_a_login_code
- test_non_working_days_survive_the_column_round_trip
- test_admin_authenticates_although_it_belongs_to_no_scope
- test_admins_disappear_with_their_project
- repository
- 4. Les ports
- DayStatus
- non_working_days.py
- .validate_weekdays
- .validate_ko_reason
- post-checkout
- post-commit
- test_remove_admin_refuses_the_last_administrator
- ref_path

## God Nodes (most connected - your core abstractions)
1. `InMemoryScopeMonitoringRepository` - 89 edges
2. `DailyActivity` - 86 edges
3. `create_app()` - 77 edges
4. `DayStatus` - 74 edges
5. `ScopeMonitoring` - 56 edges
6. `AuditEventQuery` - 40 edges
7. `vitest` - 38 edges
8. `react` - 37 edges
9. `ScopeMonitoringRepository` - 35 edges
10. `PostgresAuthRepository` - 34 edges

## Surprising Connections (you probably didn't know these)
- `Le lot, depuis l'historique` --references--> `BatchKoModal()`  [INFERRED]
  docs/frontend.md → src/FrontEnd/src/components/BatchKoModal.tsx
- `Le reste de la page` --references--> `Modal()`  [INFERRED]
  docs/frontend.md → src/FrontEnd/src/components/Modal.tsx
- `La note du périmètre — un brouillon, pas un autosave` --references--> `ScopeNoteCard()`  [INFERRED]
  docs/frontend.md → src/FrontEnd/src/components/ScopeNoteCard.tsx
- `Un fond clair a toujours son pendant sombre` --references--> `expectDoesNotClip()`  [INFERRED]
  docs/frontend.md → src/FrontEnd/src/test/overflowGuard.ts
- `5. Ce que ces tests ne prouvent pas` --references--> `InMemoryScopeMonitoringRepository`  [INFERRED]
  docs/testing.md → src/protab/adapters/outbound/persistence/in_memory_scope_monitoring_repository.py

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **ProTab Mutation → Audit Trail Flow** — readme_mutation_use_cases, readme_audit_trail, readme_domain_invariants, readme_domain_error_http_mapping, readme_rest_routes_table [INFERRED 0.85]
- **ProTab PostgreSQL Persistence Path (port → adapter → pool → container)** — agents_scopemonitoringrepository_port, agents_postgres_scopemonitoringrepository, agents_idempotent_schema_bootstrap, agents_postgres_pool_configuration, readme_postgres_persistence, readme_scope_monitorings_index, docker_compose_db_service, docker_compose_api_service [INFERRED 0.85]
- **ProTab Hexagonal Core and Its Adapters** — agents_hexagonal_architecture, readme_scope_monitoring_aggregate, readme_mutation_use_cases, agents_scopemonitoringrepository_port, readme_http_api_adapter, readme_csv_import_adapter, readme_postgres_persistence [INFERRED 0.95]

## Communities (133 total, 48 thin omitted)

### Community 0 - "index.ts"
Cohesion: 0.15
Nodes (21): ScopeFormModal(), ScopeFormModalProps, ScopeItemState, ApiError, AuthSession, notifyUnauthorized(), parseFastApiErrorMessage(), request() (+13 more)

### Community 1 - "PostgresScopeMonitoringRepository"
Cohesion: 0.14
Nodes (13): 8. Multi-tenant : le mécanisme à comprendre avant toute modification, RuntimeError, MissingProjectContextError, PostgresScopeMonitoringRepository, Connection, date, No authenticated request established the project to read or write., Return the current project id, or refuse to touch the database. Every read and… (+5 more)

### Community 2 - "package.json"
Cohesion: 0.05
Nodes (38): jsdom, tailwindcss, @tailwindcss/vite, @types/node, @types/react, @types/react-dom, typescript, vite (+30 more)

### Community 3 - "audit_log_api_test.py"
Cohesion: 0.12
Nodes (25): contextvars, project_context(), Token, Per-request audit context. Mirrors the ``_CURRENT_PROJECT_ID`` ContextVar…, reset_current_actor(), set_current_actor(), all_events(), clear_actor() (+17 more)

### Community 4 - "parse_scope_monitorings_csv"
Cohesion: 0.14
Nodes (28): csv, CSV — `adapters/inbound/csv/scope_monitoring_csv_reader.py`, fastapi_responses, JSONResponse, Path, pathlib, protab_adapters_inbound_csv_scope_monitoring_csv_reader, protab_application_commands_create_scope_monitoring (+20 more)

### Community 5 - "OfficialCode"
Cohesion: 0.07
Nodes (43): argparse, getpass, protab_domain_value_objects_official_code, database_url_from_env(), Return the PostgreSQL DSN from DATABASE_URL, or None when unset., Grant permanent access to one project. Returns False if already set. The code…, OfficialCode, A single official identity, normalized the way login normalizes it.… (+35 more)

### Community 6 - "DomainError"
Cohesion: 0.17
Nodes (19): DuplicateFeaiReferenceError, IncidentsExceedErrorsError, InvalidFeaiReferenceError, InvalidKoReasonError, KoReasonTooLongError, NegativeErrorsCountError, NegativeIncidentsCountError, Raised when incidents_created exceeds errors_reported. (+11 more)

### Community 7 - "DailyActivity"
Cohesion: 0.11
Nodes (31): DailyActivity, date, parametrize, test_daily_activity_apply_status_is_idempotent(), test_daily_activity_apply_status_marks_a_ko_with_its_reason(), test_daily_activity_canonicalises_a_prefixed_feai(), test_daily_activity_completion_drops_the_ko_reason(), test_daily_activity_creation_valid() (+23 more)

### Community 8 - "AuditLogPage.tsx"
Cohesion: 0.13
Nodes (27): activeFilterCount(), AuditLogFilterBar(), AuditLogFilterBarProps, AuditLogFilters, DateInput(), EMPTY_FILTERS, DateNavigator(), DateNavigatorProps (+19 more)

### Community 9 - "ScopeMonitoring"
Cohesion: 0.11
Nodes (29): KnowledgeBase, Officials, ScopeMonitoring, build_scope(), fixture_scope_monitoring(), fixture, parametrize, Adding a DailyActivity for a new day should succeed. (+21 more)

### Community 10 - "api_test.py"
Cohesion: 0.06
Nodes (34): client(), create_scope_via_api(), make_scope_with_activity(), fixture, The route has to accept a KO on a day that has no row yet. That is the…, Setting a status is not an entry: it must not insert a row on its own. Only the…, 422, not 400: the bound is refused by the request schema itself. The domain's…, test_a_blank_ko_reason_is_stored_as_no_reason() (+26 more)

### Community 11 - "create_app"
Cohesion: 0.14
Nodes (26): BaseModel, pydantic, _audit_event_to_response(), create_app(), create_scope_monitorings(), handle_update_scope_note(), import_scope_monitorings_csv(), list_scope_audit_log() (+18 more)

### Community 12 - "ScopeDetailPage.tsx"
Cohesion: 0.15
Nodes (18): Le détail est mono-jour lui aussi, Où le statut est écrit, Un piège que le ref de statut referme, ActivityRow(), Badge(), BadgeProps, BillingCodeBadge(), BillingCodeBadgeProps (+10 more)

### Community 13 - "current_user"
Cohesion: 0.18
Nodes (15): fastapi, protab_adapters_outbound_persistence_postgres_auth_repository, Response, get_project_settings(), list_projects(), login(), me(), update_project_settings() (+7 more)

### Community 14 - "vitest"
Cohesion: 0.08
Nodes (19): @testing-library/jest-dom, @testing-library/react, vitest, ToastContainer(), KO_REASON_MAX_LENGTH, ToastProvider(), protabApi, DAYS (+11 more)

### Community 15 - "Tests"
Cohesion: 0.22
Nodes (9): 1. Vue d'ensemble, 3. Tests d'intégration — `tests/integration/adapters/`, 4. Test E2E — `tests/e2e/`, 5. Ce que ces tests ne prouvent pas, 7. Écrire un nouveau test, 8. Documents voisins, Contre l'API, sans base, Contre PostgreSQL réel (+1 more)

### Community 16 - "SetActivitiesStatusUseCase"
Cohesion: 0.33
Nodes (19): SetActivitiesStatusCommand, Set the status of one or more days of a scope. One rule lives here rather than…, SetActivitiesStatusUseCase, make_activity(), make_scope(), A day can be reported as blocked, but it cannot be *completed*. Completing…, The whole point of the KO: nobody could enter anything. Requiring an activity…, test_a_ko_day_can_be_reported_without_any_entry() (+11 more)

### Community 17 - "InMemoryScopeMonitoringRepository"
Cohesion: 0.14
Nodes (12): InMemoryScopeMonitoringRepository, date, make_scope(), ``save`` must refuse what the SQL adapter refuses. Both adapters implement…, Same refusal as the SQL adapter, or the two are not interchangeable. An empty…, Reporting a blocked day is what makes the status usable at all. Nobody could…, test_a_refused_save_leaves_the_stored_scope_untouched(), test_save_refuses_a_name_already_stored() (+4 more)

### Community 18 - "App.tsx"
Cohesion: 0.11
Nodes (22): 4. Chemins et routage, react-dom, react-router-dom, App(), AppContent(), Navbar(), NavbarProps, ITEMS (+14 more)

### Community 19 - "postgres_scope_monitoring_repository_test.py"
Cohesion: 0.05
Nodes (57): Token, reset_current_project(), set_current_project(), count_activity_rows(), make_scope(), project_context(), date, fixture (+49 more)

### Community 20 - "api_config_test.py"
Cohesion: 0.12
Nodes (20): 3. Configuration, dotenv, os, protab_adapters_inbound_api_config, cookie_secure_from_env(), host_port_from_env(), InvalidPortError, Exception (+12 more)

### Community 21 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 23 - "FakeAuthRepository"
Cohesion: 0.13
Nodes (15): AuthSession, FakeAuthRepository, login_and_read_session_cookie(), Le refus porte sur la semaine entière, pas sur le week-end : un projet qui…, Le cookie et la ligne ``auth_sessions`` doivent tomber ensemble : un cookie…, test_authenticated_routes_require_a_valid_session(), test_in_memory_application_remains_unauthenticated_for_existing_fixtures(), test_login_rejects_invented_quadrigramme_when_known_codes_exist() (+7 more)

### Community 24 - "datetime"
Cohesion: 0.11
Nodes (19): dataclasses, datetime, protab_adapters_outbound_persistence_postgres_pool, protab_application_actor_context, protab_application_commands_daily_activity, protab_domain_entities_audit_event, protab_domain_entities_daily_activity, protab_domain_entities_day_status (+11 more)

### Community 25 - "useTheme.tsx"
Cohesion: 0.18
Nodes (13): 3. Client HTTP — `services/api.ts`, 5. Providers et état, src_frontend_src_assets_layered_waves_dark, src_frontend_src_assets_layered_waves_light, LoginBackground(), Theme, ThemeContext, ThemeContextType (+5 more)

### Community 26 - "La CLI `protab-project`"
Cohesion: 0.12
Nodes (17): 10. En Docker, 11. Voir aussi, 1. Ce que la CLI fait, et ce qu'elle ne fait pas, 2. Prérequis, 3. Inventaire des commandes, 4. Les mots de passe, 5. Qui peut se connecter, 6. Pourquoi nommer un administrateur (+9 more)

### Community 27 - "Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring)"
Cohesion: 0.20
Nodes (11): Avoid Premature Abstraction, SOLID Principles, Aggregate Owns DailyActivities Indexed by Day, Atomic ScopeMonitoring Creation, CSV Import Inbound Adapter, DailyActivity (Entity), Day Is Not a Class (datetime.date as value object), Domain Invariants (counters, FEAI format, completion implication) (+3 more)

### Community 28 - "PostgresAuthRepository"
Cohesion: 0.09
Nodes (15): hashlib, hmac, protab_domain_value_objects_non_working_days, psycopg_types_json, secrets, _check_password(), _hash_password(), _normalize_code() (+7 more)

### Community 29 - "AuditEvent"
Cohesion: 0.16
Nodes (7): PostgresAuditTrailRepository, Open the connection pool and apply the (idempotent) schema., Close the connection pool, releasing database connections., current_project_id(), ListAuditEventsUseCase, AuditEvent, Return audit events matching the query, most recent first. ``scope_ids``…

### Community 30 - "build_connection_pool"
Cohesion: 0.14
Nodes (10): ConnectionPool, psycopg, psycopg_pool, build_connection_pool(), ping_check(), Connection, Shared PostgreSQL connection-pool configuration for persistence adapters., Check connectivity and leave the connection outside a transaction. (+2 more)

### Community 31 - "pytest"
Cohesion: 0.20
Nodes (11): inspect, protab_adapters_outbound_persistence_postgres_scope_monitoring_repository, pytest, In-memory adapter of the AuditTrailRepository port for tests. Every filter here…, Tenant isolation must fail closed when no project context is established. A…, port_methods(), parametrize, Every implementation must offer every method the port declares. Nothing in this… (+3 more)

### Community 32 - "Hexagonal Architecture (Ports and Adapters)"
Cohesion: 0.14
Nodes (15): Adapters (Inbound / Outbound), Dependency Injection and Composition Root, Dependency Rule (Adapters → Ports → Application → Domain), Domain Layer, Domain Error Handling and Adapter Translation, Framework Isolation, Hexagonal Architecture (Ports and Adapters), Ports (Inbound and Outbound Contracts) (+7 more)

### Community 33 - "ScopeMonitoring"
Cohesion: 0.22
Nodes (15): ExportModal(), ExportModalProps, ScopeBase, ScopePickerProps, EnrichedScope, ScopeMonitoring, buildExportRows(), CsvSeparator (+7 more)

### Community 34 - "api Service (FastAPI backend)"
Cohesion: 0.19
Nodes (13): api Healthcheck (/healthz), api Service (FastAPI backend), db Healthcheck (pg_isready), db Service (postgres:17-alpine), Default Project Seeding Env Vars, ProTab Development Docker Stack, frontend Service (React/nginx build), pgdata Named Volume (+5 more)

### Community 35 - "project_admin_test.py"
Cohesion: 0.12
Nodes (27): protab, Integration tests for the ``protab-project`` administrative command. The…, The whole point: the code belongs to the project, not to a scope., ``MLOZ/MRAM`` is the scope list form; as an admin it could never be matched by…, The command must close the sessions it orphans. Whether a removed administrator…, The historical form stays valid, but it must not fail silently., Rotating a leaked password must not leave old sessions usable., run() (+19 more)

### Community 36 - "analytics.ts"
Cohesion: 0.12
Nodes (33): Les trois conséquences sur le reste de l'application, Sparklines sur `/analyse` — pas de recharts, AnalyticsKpiCards(), toMondayFirstIndex(), AnalyticsPage(), formatPeriod(), GRANULARITIES, initialFilters() (+25 more)

### Community 37 - "Development Workflow (9 Steps)"
Cohesion: 0.40
Nodes (6): Definition of Done Checklist, Development Workflow (9 Steps), Documentation Synchronization Requirement, Graphify Knowledge Graph Workflow, Test-Driven Development (RED/GREEN/REFACTOR), Testing Strategy (Test Pyramid)

### Community 38 - "7. Les adaptateurs sortants"
Cohesion: 0.16
Nodes (10): 7. Les adaptateurs sortants, Exception, DuplicateDailyActivityError, Raised when a ScopeMonitoring already has a DailyActivity for the given day., Raised when a ScopeMonitoring with the same name already exists., Raised when a creation targets a ScopeMonitoring id that is already taken.…, ScopeMonitoringAlreadyExistsError, ScopeMonitoringNameAlreadyExistsError (+2 more)

### Community 39 - "project_admin_cli_test.py"
Cohesion: 0.22
Nodes (13): parametrize, ``protab-project --help`` must list the subcommands. The dispatcher resolves…, ``protab-project <code> <nom>`` predates the subcommands and stays valid., A bare invocation is still an error. Turning it into a success would make a…, The inventory must not swallow the per-subcommand argparse help., run_cli(), test_a_subcommand_without_its_arguments_still_errors(), test_help_exits_successfully() (+5 more)

### Community 72 - "audit_trail_test.py"
Cohesion: 0.22
Nodes (16): InMemoryAuditTrailRepository, CreateScopeMonitoringCommand, make_scope_with_activity(), ``activity_ko`` covers both directions, and ``changes`` disambiguates. A…, The KO reason is cleared from the row on completion — the trail keeps it. A…, test_complete_activity_records_audit_event_per_day(), test_create_activity_records_audit_event(), test_create_scope_from_csv_records_import_action() (+8 more)

### Community 73 - "create_daily_activity_test.py"
Cohesion: 0.51
Nodes (9): CreateDailyActivityUseCase, make_command(), make_scope(), make_scope_daily_activity(), test_create_daily_activity(), test_create_duplicate_day_raises_and_persists_nothing(), test_create_inserts_a_single_row_instead_of_rewriting_the_scope(), test_create_invalid_invariant_raises() (+1 more)

### Community 74 - "postgres_auth_repository_test.py"
Cohesion: 0.13
Nodes (7): Integration tests for the PostgreSQL auth repository rule: the quadrigramme…, Reusing a project code is the likeliest CLI mistake, and it must not reach the…, Naming an administrator is what makes creating the first scope safe. The…, A code the login screen refuses would lock the administrator out., test_add_admin_rejects_an_unusable_code(), test_admin_authenticates_before_the_first_scope_is_created(), test_creating_a_project_twice_reports_the_duplicate()

### Community 76 - "nonWorkingDays.ts"
Cohesion: 0.22
Nodes (9): DEFAULT_EXCLUDED_WEEKDAYS, DEFAULT_NON_WORKING_DAYS, ISO_MONDAY, ISO_SATURDAY, ISO_SUNDAY, ISO_WEEKDAY_COUNT, ISO_WEEKDAY_MAX, ISO_WEEKDAY_MIN (+1 more)

### Community 77 - "AuditActivityHeatmap.tsx"
Cohesion: 0.29
Nodes (8): AuditActivityHeatmap(), AuditActivityHeatmapProps, HOURS, intensityClass(), WEEKDAYS, AuditEvent, buildHeatmapMatrix(), HeatmapMatrix

### Community 78 - "useToast.tsx"
Cohesion: 0.12
Nodes (24): lucide-react, react, BatchKoModal(), BatchKoModalProps, CompleteActivitiesModal(), CsvImportModal(), CsvImportModalProps, Modal() (+16 more)

### Community 79 - "postgres_auth_bootstrap_test.py"
Cohesion: 0.21
Nodes (13): Return the quadrigramme seeding the first project's administrator. Same fail-…, Return the password seeding the first project, or refuse to start. Called only…, resolve_bootstrap_admin_code(), resolve_bootstrap_password(), The bootstrap secrets must never fall back to a hardcoded default. A missing…, test_admin_code_trims_surrounding_whitespace(), test_blank_admin_code_raises(), test_blank_variable_raises() (+5 more)

### Community 80 - "postgres_audit_trail_repository_test.py"
Cohesion: 0.17
Nodes (14): protab_adapters_outbound_persistence_postgres_audit_trail_repository, make_event(), project(), fixture, Integration tests for the PostgreSQL audit trail adapter. Skipped when…, Mirrors tests/unit/adapters/audit_trail_filter_test.py against real SQL., ``day`` is NULL for scope_created/scope_imported/scope_note_updated. Filtering…, repo() (+6 more)

### Community 81 - "measure-usage.sh"
Cohesion: 0.23
Nodes (14): container_writable(), image_on_disk(), image_uncompressed(), print_containers(), print_devenv_guard(), print_disk_totals(), print_host(), print_images() (+6 more)

### Community 82 - "Tally plutôt qu'un tableur de production"
Cohesion: 0.29
Nodes (6): Ce qu'un tableur continue de mieux faire, Ce que le Cloud a réglé… et ce que le tableur ne réglera jamais, Ce que Tally apporte, En résumé, Quand conserver le tableur ?, Tally plutôt qu'un tableur de production

### Community 83 - "ScopeMonitoringRepository"
Cohesion: 0.08
Nodes (15): AuditTrailRepository, Protocol, Persist an audit event., date, Protocol, Return all ScopeMonitorings., Return a mapping of scope ids to names., Create the given ScopeMonitoring and its activities. Creation only: an already… (+7 more)

### Community 84 - "Développement"
Cohesion: 0.14
Nodes (13): 11. Où aller quand…, 10. Publier une modification — liste de contrôle, 11. Problèmes fréquents, 12. Documents voisins, 1. Prérequis, 2. Installation, 5. Base de données : pas d'outil de migration, 6. Tests (+5 more)

### Community 85 - "NonWorkingDays"
Cohesion: 0.10
Nodes (39): NonWorkingDays, A project's working calendar: recurring weekdays and one-off dates. Both…, The calendar of a project that never configured one., Rebuild a calendar from an untyped ``projects.non_working_days`` value. Lenient…, Un calendrier sans jour ouvré n'a rien à afficher : la page principale…, test_project_settings_reject_a_calendar_without_any_working_day(), Une ligne historique illisible ne doit pas vider le calendrier : elle est…, test_an_unreadable_column_reads_as_the_default_calendar() (+31 more)

### Community 86 - "project"
Cohesion: 0.40
Nodes (5): bootstrap_password(), project(), fixture, The bootstrap secrets are mandatory: no default is provided.…, scopes()

### Community 87 - "app.py"
Cohesion: 0.14
Nodes (13): collections_abc, protab_adapters_inbound_api_auth, protab_adapters_inbound_api_errors, protab_adapters_inbound_api_schemas, protab_adapters_outbound_persistence_in_memory_audit_trail_repository, protab_application_commands_scope_monitoring, protab_application_queries_list_audit_events, protab_application_use_cases_create_daily_activity (+5 more)

### Community 88 - "L'architecture Docker de ProTab"
Cohesion: 0.12
Nodes (17): 1. Vue d'ensemble à l'exécution, 2. Ordre de démarrage : ce que les dépendances garantissent, 3. Chaîne de construction des images, 4. Le premier démarrage : une fenêtre, pas une configuration, 5. Requêtes : le rôle de nginx est plus qu'un serveur de fichiers, 6. Sécurité : ce que la topologie garantit, et ce qu'elle ne garantit pas, 7. Commandes de la stack, Ce que le diagramme dit des ports publiés (+9 more)

### Community 89 - "queries_test.py"
Cohesion: 0.14
Nodes (14): protab_application_queries_get_daily_activity, protab_application_queries_get_scope, protab_application_queries_list_scopes, GetDailyActivityUseCase, GetScopeUseCase, ListScopesUseCase, make_scope(), test_get_daily_activity_day_not_found_raises() (+6 more)

### Community 90 - "add_scope"
Cohesion: 0.14
Nodes (14): add_scope(), Permanent access is not a password bypass: the admin is one factor., Being an administrator never removes the scope officials' access., ``authenticate()`` only runs at login, so a removed administrator would keep a…, test_a_code_in_no_scope_and_no_admin_list_is_refused(), test_admin_alongside_scope_officials(), test_admin_code_is_normalized_like_a_scope_code(), test_admin_still_needs_the_project_password() (+6 more)

### Community 91 - "create_default_app"
Cohesion: 0.25
Nodes (8): 6. Les adaptateurs entrants, API — `adapters/inbound/api/`, CLI — `src/protab/project_admin.py`, 4. Démarrage en développement, logout(), create_default_app(), FastAPI, Create the production app using the configured PostgreSQL repository.

### Community 92 - "exceptions/scope_monitoring.py"
Cohesion: 0.17
Nodes (8): EmptyBillingCodeError, EmptyOfficialsError, InvalidKnowledgeBaseIdError, InvalidScopeMonitoringIdError, Raised when a ScopeMonitoring is created without a billing code., Raised when a ScopeMonitoring id is empty or blank., Raised when a KnowledgeBase id does not meet the minimum length requirement., Raised when main or backup officials are not provided or are blank.

### Community 93 - "ScopeListPage.tsx"
Cohesion: 0.11
Nodes (36): 6. Le modèle mono-jour, 7. Le statut d'une journée : `pending`, `completed`, `ko`, 9. La page d'analyse — `/analyse`, Chaque bloc mesure une chose différente, Le lot, depuis l'historique, Le reste de la page, AnalyticsFilterBarProps, CompleteTodayButton() (+28 more)

### Community 94 - "AnalyticsFilterBar.tsx"
Cohesion: 0.12
Nodes (19): ANALYTICS_PATH, AnalyticsFilterBar(), AnalyticsFilters, applyPreset(), billingCodeKey(), formatRange(), SCOPE_DETAIL_PATH, SCOPE_LIST_PATH (+11 more)

### Community 95 - "update_daily_activity_test.py"
Cohesion: 0.31
Nodes (12): 10. Cycle de vie d'une écriture, protab_application_use_cases_update_daily_activity, handle_update_daily_activity(), UpdateDailyActivityCommand, UpdateDailyActivityUseCase, make_scope_with_activity(), A PATCH must not rewrite the whole scope. Rewriting the aggregate persists…, test_update_daily_activity() (+4 more)

### Community 96 - "empty_database"
Cohesion: 0.15
Nodes (13): empty_database(), A project must never be created without someone able to enter it. Once it owns…, Both secrets are missing: the message must name the one resolved first.…, The secrets are only needed to seed; a restart must not require them. Requiring…, The seeded administrator must be usable as a login right away., Create the schema, then drop every project so a bootstrap is pending., Seeding the first project demands an explicit, non-guessable password. No…, test_bootstrap_grants_the_configured_admin_code() (+5 more)

### Community 97 - "5. La couche application"
Cohesion: 0.20
Nodes (9): 5. La couche application, 2. Tests unitaires — `tests/unit/`, Adaptateurs — `tests/unit/adapters/`, Application — `tests/unit/application/`, Domaine — `tests/unit/domain/`, Ports — `tests/unit/ports/`, Replace the free-text note of the scope. A blank note is stored as "no note"…, NoteTooLongError (+1 more)

### Community 98 - "AuditEventQuery"
Cohesion: 0.26
Nodes (19): AuditEventQuery, Filters selecting a slice of the audit trail. Two decisions here are load-…, actions(), make_event(), ``list`` must select the same events in both audit trail adapters.…, A ``day IS NULL`` event must survive a period: this is the silent loss., Return a repository holding ``events``. ``InMemoryAuditTrailRepository.record``…, The defect this pins: ``abcd`` and ``AB`` used to return nothing. (+11 more)

### Community 99 - "add_scope_for"
Cohesion: 0.50
Nodes (4): add_scope_for(), Give one project a scope, switching the tenant the adapter reads. Both tenants…, An administrator of A is nobody in B. ``GET /projects`` is unauthenticated, so…, test_admin_is_scoped_to_its_own_project()

### Community 100 - "ActivityFormModal.tsx"
Cohesion: 0.13
Nodes (27): 8. Saisie et autosave, La note du périmètre — un brouillon, pas un autosave, Saisie d'une référence FEAI, Suppression et annulation, ActivityFormModal(), ActivityFormModalProps, ActivityRowProps, CompleteActivitiesModalProps (+19 more)

### Community 101 - "AnalyticsHeatmap.tsx"
Cohesion: 0.10
Nodes (21): AnalyticsErrorHeatmap(), AnalyticsErrorHeatmapProps, columnLabels(), ErrorCell(), ErrorMatrix(), getHeatmapStep(), AnalyticsKpiCardsProps, KpiCardProps (+13 more)

### Community 102 - "update_scope_note_test.py"
Cohesion: 0.35
Nodes (13): UpdateScopeNoteCommand, Overwrite the free-text note of an existing scope. The note is written through…, UpdateScopeNoteUseCase, make_scope(), A note edit must not rewrite the whole scope. Rewriting the aggregate persists…, test_update_note_clears_the_note_when_emptied(), test_update_note_leaves_the_daily_activities_intact(), test_update_note_records_an_audit_event() (+5 more)

### Community 104 - "Frontend"
Cohesion: 0.20
Nodes (10): 10. Graphiques et styles, 11. Tests, 12. Ce qui n'existe pas, 13. Build et déploiement, 14. Documents voisins, 1. Pile technique, 2. Arborescence, Frontend (+2 more)

### Community 105 - "PostgresScopeMonitoringRepository"
Cohesion: 0.21
Nodes (12): API Configuration via load_dotenv and os.getenv, Configuration and Secrets Management, Idempotent Schema Bootstrap (CREATE TABLE IF NOT EXISTS), InMemoryScopeMonitoringRepository, PostgreSQL Integration Tests (make test-db), Centralized PostgreSQL Pool Configuration, PostgresScopeMonitoringRepository, ProTab Infrastructure Notes (+4 more)

### Community 106 - "search.test.ts"
Cohesion: 0.33
Nodes (8): Recherche : le responsable passe avant le suppléant, scope(), matchesSearchQuery(), OFFICIAL_MATCH_RANK, officialMatchRank(), SearchableScope, SEARCHED_FIELDS, sortByOfficialRelevance()

### Community 107 - "Ressources consommées par la stack"
Cohesion: 0.18
Nodes (11): 10. Un défaut corrigé au cours de cette mesure, 1. Poids sur le disque, 2. Consommation mémoire et CPU au repos, 3. Comportement sous charge, 4. Débit et latence, 5. Ce qui n'appartient pas à la stack, 6. Configuration PostgreSQL et mémoire, 7. Dimensionnement (+3 more)

### Community 108 - "CreateScopeMonitoringUseCase"
Cohesion: 0.49
Nodes (9): CreateScopeMonitoringUseCase, make_command(), test_create_blank_billing_code_raises_and_writes_nothing(), test_create_duplicate_name_raises_and_persists_nothing(), test_create_empty_official_raises(), test_create_invalid_knowledge_base_id_raises(), test_create_multiple_scope_monitorings(), test_create_stores_the_billing_code() (+1 more)

### Community 109 - "protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository"
Cohesion: 0.15
Nodes (15): APIRoute, fastapi_routing, fastapi_testclient, protab_adapters_inbound_api_app, protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository, test_daily_activity_full_flow_over_http(), business_routes(), Business routes must be authenticated by default (allowlist, not denylist).… (+7 more)

### Community 110 - "makeScope"
Cohesion: 0.09
Nodes (21): 6. Tests frontend, Pièges propres à cette suite, recharts, ScopeDetailCharts(), ScopeDetailChartsProps, ScopePicker(), ScopeDetailCharts, scope() (+13 more)

### Community 111 - "ScopeMonitoringNotFoundError"
Cohesion: 0.22
Nodes (7): date, _audit_action(), ``activity_completed`` keeps its meaning; everything else is ``activity_ko``.…, DailyActivityNotFoundError, Raised when a ScopeMonitoring cannot be found for the given id., Raised when a DailyActivity cannot be found for the given day., ScopeMonitoringNotFoundError

### Community 112 - "build_changes"
Cohesion: 0.21
Nodes (10): handle_create_daily_activity(), current_actor(), CreateDailyActivityCommand, build_changes(), Return only the fields whose value differs between ``before`` and ``after``.…, test_audit_event_defaults(), test_build_changes_empty_when_identical(), test_build_changes_from_empty_keeps_all_fields() (+2 more)

### Community 114 - "Architecture"
Cohesion: 0.33
Nodes (5): 12. Documents voisins, 1. Ce que fait l'application, 3. Le domaine, 9. Modèle de données, Architecture

### Community 115 - "_scope_to_response"
Cohesion: 0.40
Nodes (5): _activity_to_response(), get_scope_daily_activity(), get_scope_monitoring(), list_scope_monitorings(), _scope_to_response()

### Community 117 - "_official_codes"
Cohesion: 0.29
Nodes (9): _official_codes(), Quadrigrammes declared by one ``officials`` column (format « A/B »).…, Parsing of the officials columns that gate the quadrigramme. Both…, ``MRAM/ ?`` means "MRAM, no backup": ``?`` is not a quadrigramme., test_handles_empty_and_none(), test_ignores_punctuation_only_parts(), test_placeholder_is_not_a_code(), test_splits_multiple_codes() (+1 more)

### Community 123 - "repository"
Cohesion: 0.50
Nodes (4): 2. Vue d'ensemble des couches, bootstrap_password(), fixture, repository()

### Community 124 - "4. Les ports"
Cohesion: 0.50
Nodes (4): 4. Les ports, Absence de port pour l'authentification, Port d'audit — `ports/outbound/audit_trail_repository.py`, Port de périmètre — `ports/outbound/scope_monitoring_repository.py`

### Community 125 - "DayStatus"
Cohesion: 0.16
Nodes (13): Enum, _normalise_ko_reason(), Set the day's status — the only way to write it. A reason belongs to a KO and…, Reduce a reason to the one shape a day can hold. A blank reason and no reason…, DayStatus, Rebuild a status from an untyped ``daily_activities.status`` value. Lenient on…, The one status of a scope monitoring on a given day. This replaces a pair of…, str (+5 more)

### Community 126 - "non_working_days.py"
Cohesion: 0.29
Nodes (6): IntEnum, _is_iso_weekday(), IsoWeekday, The ISO 8601 weekday scale, which is what ``excluded_weekdays`` stores.…, Whether a raw entry names a weekday of the ISO scale. ``str.isdigit`` is not…, test_the_iso_scale_runs_from_monday_to_sunday()

## Ambiguous Edges - Review These
- `React Root Mount (#root)` → `Audit Trail (best-effort mutation journal)`  [AMBIGUOUS]
  src/FrontEnd/index.html · relation: conceptually_related_to

## Knowledge Gaps
- **204 isolated node(s):** `protab`, `name`, `private`, `version`, `type` (+199 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 581 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **48 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `React Root Mount (#root)` and `Audit Trail (best-effort mutation journal)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `RecordingScopeMonitoringRepository` connect `RecordingScopeMonitoringRepository` to `update_scope_note_test.py`, `DailyActivity`, `create_daily_activity_test.py`, `ScopeMonitoring`, `CreateScopeMonitoringUseCase`, `Tests`, `SetActivitiesStatusUseCase`, `datetime`, `pytest`, `DayStatus`, `update_daily_activity_test.py`?**
  _High betweenness centrality (0.175) - this node is a cross-community bridge._
- **Why does `7. Écrire un nouveau test` connect `Tests` to `RecordingScopeMonitoringRepository`, `makeScope`?**
  _High betweenness centrality (0.169) - this node is a cross-community bridge._
- **Why does `6. Le modèle mono-jour` connect `ScopeListPage.tsx` to `analytics.ts`, `AuditLogPage.tsx`, `Frontend`, `search.test.ts`, `ScopeDetailPage.tsx`, `makeScope`, `NonWorkingDays`, `AnalyticsFilterBar.tsx`?**
  _High betweenness centrality (0.153) - this node is a cross-community bridge._
- **Are the 76 inferred relationships involving `InMemoryScopeMonitoringRepository` (e.g. with `2. Vue d'ensemble des couches` and `5. Ce que ces tests ne prouvent pas`) actually correct?**
  _`InMemoryScopeMonitoringRepository` has 76 INFERRED edges - model-reasoned connections that need verification._
- **Are the 66 inferred relationships involving `DailyActivity` (e.g. with `_activity_to_response()` and `InMemoryScopeMonitoringRepository`) actually correct?**
  _`DailyActivity` has 66 INFERRED edges - model-reasoned connections that need verification._
- **Are the 56 inferred relationships involving `create_app()` (e.g. with `API — `adapters/inbound/api/`` and `close_persistence()`) actually correct?**
  _`create_app()` has 56 INFERRED edges - model-reasoned connections that need verification._