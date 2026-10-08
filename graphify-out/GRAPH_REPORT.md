# Graph Report - ProTab  (2026-10-08)

## Corpus Check
- 223 files · ~137,503 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: (none) 9, .example 1, .conf 1)

## Summary
- 1863 nodes · 4591 edges · 136 communities (88 shown, 48 thin omitted)
- Extraction: 80% EXTRACTED · 20% INFERRED · 0% AMBIGUOUS · INFERRED: 925 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9ef52f85`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- index.ts
- PostgresScopeMonitoringRepository
- package.json
- react
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
- 3. Tests d'intégration — `tests/integration/adapters/`
- SetActivitiesStatusUseCase
- protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository
- App.tsx
- postgres_scope_monitoring_repository_test.py
- pytest
- compilerOptions
- protab_application_use_cases_complete_daily_activity
- FakeAuthRepository
- datetime
- Rule Categories by Priority (1-10)
- La CLI `protab-project`
- Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring)
- postgres_auth_repository.py
- Process
- FastAPI & PostgreSQL Performance Optimizer Skill
- .from_raw
- Hexagonal Architecture (Ports and Adapters)
- makeScope
- api Service (FastAPI backend)
- project_admin_test.py
- analytics.ts
- Development Workflow (9 Steps)
- 7. Les adaptateurs sortants
- opencode.json
- RecordingScopeMonitoringRepository
- Application Layer / Use Cases
- protab
- build_connection_pool
- AuditEvent
- postgres_auth_repository_test.py
- graphify.js
- project_admin.py
- ProTab Project Documentation
- ScopeListPage.tsx
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
- queries_test.py
- add_scope
- Architecture
- project_admin_cli_test.py
- kpi.ts
- AnalyticsFilterBar.tsx
- update_daily_activity_test.py
- empty_database
- exceptions/scope_monitoring.py
- AuditEventQuery
- seed_three_days
- ActivityFormModal.tsx
- AnalyticsHeatmap.tsx
- InMemoryScopeMonitoringRepository
- 3. Le domaine
- scope_monitoring_repository_contract_test.py
- PostgresScopeMonitoringRepository
- search.test.ts
- Ressources consommées par la stack
- Frontend
- route_authorization_test.py
- 6. Tests frontend
- ScopeMonitoringNotFoundError
- build_changes
- repository
- require_current_project
- PostgresAuthRepository
- _official_codes
- test_main_split_form_auths_both_codes
- test_backup_placeholder_is_not_a_login_code
- test_non_working_days_survive_the_column_round_trip
- test_admin_authenticates_although_it_belongs_to_no_scope
- test_admins_disappear_with_their_project
- CreateScopeMonitoringUseCase
- postgres_audit_trail_repository_test.py
- .from_raw
- non_working_days.py
- test_the_status_write_creates_a_day_once_per_day
- .set_activities_status
- post-checkout
- post-commit
- .daily_activity_for
- .insert_daily_activity
- .update_daily_activity
- test_admin_alongside_scope_officials
- .set_activities_status

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

## Communities (136 total, 48 thin omitted)

### Community 0 - "index.ts"
Cohesion: 0.10
Nodes (25): AuditActivityHeatmap(), AuditActivityHeatmapProps, HOURS, intensityClass(), WEEKDAYS, DayStatusPanelProps, DayStatus, ApiError (+17 more)

### Community 1 - "PostgresScopeMonitoringRepository"
Cohesion: 0.24
Nodes (6): PostgresScopeMonitoringRepository, Connection, date, Persist ``ScopeMonitoring`` aggregates in PostgreSQL. The schema is applied…, Close the connection pool, releasing database connections., Replace the two completion booleans by the single ``status`` column.…

### Community 2 - "package.json"
Cohesion: 0.05
Nodes (39): jsdom, recharts, tailwindcss, @tailwindcss/vite, @types/node, @types/react, @types/react-dom, typescript (+31 more)

### Community 3 - "react"
Cohesion: 0.18
Nodes (15): react, BillingCodeBadge(), BillingCodeBadgeProps, CsvImportModal(), CsvImportModalProps, Modal(), ModalProps, ScopeFormModal() (+7 more)

### Community 4 - "parse_scope_monitorings_csv"
Cohesion: 0.16
Nodes (26): CSV — `adapters/inbound/csv/scope_monitoring_csv_reader.py`, fastapi_responses, JSONResponse, Path, pathlib, protab_adapters_inbound_csv_scope_monitoring_csv_reader, bad_request(), conflict() (+18 more)

### Community 5 - "OfficialCode"
Cohesion: 0.12
Nodes (23): OfficialCode, A single official identity, normalized the way login normalizes it.…, ``OfficialCode`` is the single-code form of an official identity. A project…, Only the ends are noise; a space inside is part of the identity., ``LoginRequest.quadrigramme`` allows two characters, so we must too., ``A/B`` is the Officials form; as an admin code it could never be typed back as…, ``?`` means "no backup official" in the scope columns; it is not a code., ``LoginRequest.quadrigramme`` caps at 20; a longer admin could never be typed… (+15 more)

### Community 6 - "DomainError"
Cohesion: 0.15
Nodes (21): canonical_feai(), Ramène une référence à sa forme canonique ``FE-INC000000001``. La saisie est…, DuplicateFeaiReferenceError, IncidentsExceedErrorsError, InvalidFeaiReferenceError, InvalidKoReasonError, KoReasonTooLongError, NegativeErrorsCountError (+13 more)

### Community 7 - "DailyActivity"
Cohesion: 0.12
Nodes (34): Enum, DailyActivity, DayStatus, The one status of a scope monitoring on a given day. This replaces a pair of…, str, parametrize, test_daily_activity_apply_status_is_idempotent(), test_daily_activity_apply_status_marks_a_ko_with_its_reason() (+26 more)

### Community 8 - "AuditLogPage.tsx"
Cohesion: 0.19
Nodes (16): activeFilterCount(), AuditLogFilterBar(), AuditLogFilterBarProps, AuditLogFilters, DateInput(), EMPTY_FILTERS, ACTION_ICONS, ACTION_LABELS (+8 more)

### Community 9 - "ScopeMonitoring"
Cohesion: 0.11
Nodes (29): KnowledgeBase, Officials, ScopeMonitoring, build_scope(), fixture_scope_monitoring(), fixture, parametrize, Adding a DailyActivity for a new day should succeed. (+21 more)

### Community 10 - "api_test.py"
Cohesion: 0.06
Nodes (34): client(), create_scope_via_api(), make_scope_with_activity(), fixture, The route has to accept a KO on a day that has no row yet. That is the…, Setting a status is not an entry: it must not insert a row on its own. Only the…, 422, not 400: the bound is refused by the request schema itself. The domain's…, test_a_blank_ko_reason_is_stored_as_no_reason() (+26 more)

### Community 11 - "create_app"
Cohesion: 0.11
Nodes (29): BaseModel, field_validator, model_validator, pydantic, _activity_to_response(), _audit_event_to_response(), create_app(), create_scope_monitorings() (+21 more)

### Community 12 - "ScopeDetailPage.tsx"
Cohesion: 0.12
Nodes (30): Le détail est mono-jour lui aussi, lucide-react, ActivityRow(), Badge(), BadgeProps, BatchKoModal(), BatchKoModalProps, CompleteActivitiesModal() (+22 more)

### Community 13 - "current_user"
Cohesion: 0.14
Nodes (19): fastapi, protab_adapters_inbound_api_config, protab_adapters_outbound_persistence_postgres_auth_repository, Response, get_project_settings(), list_projects(), login(), logout() (+11 more)

### Community 14 - "vitest"
Cohesion: 0.07
Nodes (27): @testing-library/jest-dom, @testing-library/react, vitest, ToastContainer(), ToastAction, ToastActionsContext, ToastActionsType, ToastContextType (+19 more)

### Community 15 - "3. Tests d'intégration — `tests/integration/adapters/`"
Cohesion: 0.67
Nodes (3): 3. Tests d'intégration — `tests/integration/adapters/`, Contre l'API, sans base, Contre PostgreSQL réel

### Community 16 - "SetActivitiesStatusUseCase"
Cohesion: 0.28
Nodes (21): set_daily_activities_status(), SetActivitiesStatusCommand, Set the status of one or more days of a scope. One rule lives here rather than…, SetActivitiesStatusUseCase, make_activity(), make_scope(), A day can be reported as blocked, but it cannot be *completed*. Completing…, The whole point of the KO: nobody could enter anything. Requiring an activity… (+13 more)

### Community 17 - "protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository"
Cohesion: 0.21
Nodes (12): protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository, test_daily_activity_full_flow_over_http(), make_scope(), ``save`` must refuse what the SQL adapter refuses. Both adapters implement…, Same refusal as the SQL adapter, or the two are not interchangeable. An empty…, Reporting a blocked day is what makes the status usable at all. Nobody could…, test_a_refused_save_leaves_the_stored_scope_untouched(), test_save_refuses_a_name_already_stored() (+4 more)

### Community 18 - "App.tsx"
Cohesion: 0.08
Nodes (31): 3. Client HTTP — `services/api.ts`, 4. Chemins et routage, 5. Providers et état, react-dom, react-router-dom, App(), AppContent(), src_frontend_src_assets_layered_waves_dark (+23 more)

### Community 19 - "postgres_scope_monitoring_repository_test.py"
Cohesion: 0.09
Nodes (27): make_scope(), Integration tests for the PostgreSQL repository adapter. These tests exercise…, ``save`` creates a row; it never rewrites one. A second ``save`` used to…, No project context must raise, never fall back to a default tenant., The write must name the rows it changes, like the activity writes. A full…, The refusal happens before any write, not after a partial merge. ``save`` used…, test_a_refused_save_leaves_a_concurrent_note_intact(), test_adapters_refuse_to_read_or_write_without_project_context() (+19 more)

### Community 20 - "pytest"
Cohesion: 0.12
Nodes (20): 3. Configuration, dotenv, os, pytest, cookie_secure_from_env(), host_port_from_env(), InvalidPortError, Exception (+12 more)

### Community 21 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 23 - "FakeAuthRepository"
Cohesion: 0.12
Nodes (16): protab_adapters_inbound_api_app, AuthSession, FakeAuthRepository, login_and_read_session_cookie(), Le refus porte sur la semaine entière, pas sur le week-end : un projet qui…, Le cookie et la ligne ``auth_sessions`` doivent tomber ensemble : un cookie…, test_authenticated_routes_require_a_valid_session(), test_in_memory_application_remains_unauthenticated_for_existing_fixtures() (+8 more)

### Community 24 - "datetime"
Cohesion: 0.14
Nodes (16): dataclasses, datetime, protab_domain_entities_day_status, re, Domain model for the audit trail. An :class:`AuditEvent` records *who* (actor)…, make_command(), make_scope(), make_scope_daily_activity() (+8 more)

### Community 25 - "Rule Categories by Priority (1-10)"
Cohesion: 0.20
Nodes (12): Design Dials (variance / motion / density), Design System Generation (--design-system), Design System Persistence (Master + Overrides), Pre-Delivery UI Checklist, Search Query Contract, Rule Categories by Priority (1-10), ui-ux-pro-max Search Script, Stack Detection Step (+4 more)

### Community 26 - "La CLI `protab-project`"
Cohesion: 0.12
Nodes (17): 10. En Docker, 11. Voir aussi, 1. Ce que la CLI fait, et ce qu'elle ne fait pas, 2. Prérequis, 3. Inventaire des commandes, 4. Les mots de passe, 5. Qui peut se connecter, 6. Pourquoi nommer un administrateur (+9 more)

### Community 27 - "Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring)"
Cohesion: 0.20
Nodes (11): Avoid Premature Abstraction, SOLID Principles, Aggregate Owns DailyActivities Indexed by Day, Atomic ScopeMonitoring Creation, CSV Import Inbound Adapter, DailyActivity (Entity), Day Is Not a Class (datetime.date as value object), Domain Invariants (counters, FEAI format, completion implication) (+3 more)

### Community 28 - "postgres_auth_repository.py"
Cohesion: 0.15
Nodes (10): hashlib, hmac, protab_domain_value_objects_non_working_days, psycopg_types_json, secrets, _check_password(), _normalize_code(), PostgreSQL persistence for projects and login sessions. (+2 more)

### Community 29 - "Process"
Cohesion: 0.25
Nodes (7): 1. Pin the fixed point, 2. Identify the spec source, 3. Identify the standards sources, 4. Spawn both sub-agents in parallel, 5. Aggregate, Process, Why two axes

### Community 30 - "FastAPI & PostgreSQL Performance Optimizer Skill"
Cohesion: 0.22
Nodes (10): Caching Layer & Background Task Offloading, Connection Pooling Parameters, Database Indexing Strategy, Diagnostic & Audit Checklist, Event Loop Stall Detection, FastAPI & PostgreSQL Performance Optimizer Skill, N+1 Query Pattern Detection, Payload & Serialization Optimization (+2 more)

### Community 31 - ".from_raw"
Cohesion: 0.12
Nodes (21): Rebuild a calendar from an untyped ``projects.non_working_days`` value. Lenient…, ``NonWorkingDays`` is the project's working calendar. A row of…, Order and duplicates must not hide the fault., ``update_non_working_days`` normalizes, writes, then re-reads the row: the…, Unticking every day in the modal is a legitimate configuration: it makes every…, The frontend sends ISO numbers only; a hand-edited row may hold 0 or 8., JSONB round-trips happily through strings when a row is edited by hand., ``str.isdigit`` accepts "²" while ``int("²")`` raises: the naive guard turned a… (+13 more)

### Community 32 - "Hexagonal Architecture (Ports and Adapters)"
Cohesion: 0.17
Nodes (13): Adapters (Inbound / Outbound), Dependency Injection and Composition Root, Dependency Rule (Adapters → Ports → Application → Domain), Domain Layer, Domain Error Handling and Adapter Translation, Framework Isolation, Hexagonal Architecture (Ports and Adapters), Ports (Inbound and Outbound Contracts) (+5 more)

### Community 33 - "makeScope"
Cohesion: 0.15
Nodes (21): ExportModal(), ScopeBase, scope(), scope(), scope(), defaultFrom, renderModal(), scope() (+13 more)

### Community 34 - "api Service (FastAPI backend)"
Cohesion: 0.19
Nodes (13): api Healthcheck (/healthz), api Service (FastAPI backend), db Healthcheck (pg_isready), db Service (postgres:17-alpine), Default Project Seeding Env Vars, ProTab Development Docker Stack, frontend Service (React/nginx build), pgdata Named Volume (+5 more)

### Community 35 - "project_admin_test.py"
Cohesion: 0.12
Nodes (28): Integration tests for the ``protab-project`` administrative command. The…, The whole point: the code belongs to the project, not to a scope., ``MLOZ/MRAM`` is the scope list form; as an admin it could never be matched by…, The command must close the sessions it orphans. Whether a removed administrator…, Removing it would leave nobody able to open the project again., The historical form stays valid, but it must not fail silently., Rotating a leaked password must not leave old sessions usable., run() (+20 more)

### Community 36 - "analytics.ts"
Cohesion: 0.11
Nodes (35): Les trois conséquences sur le reste de l'application, Sparklines sur `/analyse` — pas de recharts, applyPreset(), AnalyticsErrorHeatmap(), AnalyticsKpiCards(), AnalyticsPage(), formatPeriod(), GRANULARITIES (+27 more)

### Community 37 - "Development Workflow (9 Steps)"
Cohesion: 0.40
Nodes (6): Definition of Done Checklist, Development Workflow (9 Steps), Documentation Synchronization Requirement, Graphify Knowledge Graph Workflow, Test-Driven Development (RED/GREEN/REFACTOR), Testing Strategy (Test Pyramid)

### Community 38 - "7. Les adaptateurs sortants"
Cohesion: 0.15
Nodes (10): 7. Les adaptateurs sortants, Exception, DuplicateDailyActivityError, Raised when a ScopeMonitoring already has a DailyActivity for the given day., Raised when a ScopeMonitoring with the same name already exists., Raised when a creation targets a ScopeMonitoring id that is already taken.…, ScopeMonitoringAlreadyExistsError, ScopeMonitoringNameAlreadyExistsError (+2 more)

### Community 40 - "RecordingScopeMonitoringRepository"
Cohesion: 0.09
Nodes (11): 1. Vue d'ensemble, 2. Tests unitaires — `tests/unit/`, 4. Test E2E — `tests/e2e/`, 5. Ce que ces tests ne prouvent pas, 7. Écrire un nouveau test, 8. Documents voisins, Adaptateurs — `tests/unit/adapters/`, Application — `tests/unit/application/` (+3 more)

### Community 72 - "build_connection_pool"
Cohesion: 0.15
Nodes (9): ConnectionPool, psycopg_pool, build_connection_pool(), ping_check(), Connection, Shared PostgreSQL connection-pool configuration for persistence adapters., Check connectivity and leave the connection outside a transaction., Build a tuned, initially closed synchronous PostgreSQL pool. (+1 more)

### Community 73 - "AuditEvent"
Cohesion: 0.15
Nodes (10): PostgresAuditTrailRepository, Open the connection pool and apply the (idempotent) schema., Close the connection pool, releasing database connections., ListAuditEventsUseCase, CreateDailyActivityUseCase, AuditEvent, AuditTrailRepository, Protocol (+2 more)

### Community 74 - "postgres_auth_repository_test.py"
Cohesion: 0.13
Nodes (7): Integration tests for the PostgreSQL auth repository rule: the quadrigramme…, Reusing a project code is the likeliest CLI mistake, and it must not reach the…, Naming an administrator is what makes creating the first scope safe. The…, A code the login screen refuses would lock the administrator out., test_add_admin_rejects_an_unusable_code(), test_admin_authenticates_before_the_first_scope_is_created(), test_creating_a_project_twice_reports_the_duplicate()

### Community 75 - "graphify.js"
Cohesion: 0.40
Nodes (3): IMPORTANT: keep the reminder string free of backticks and $(...) constructs., ref_fs, ref_path

### Community 76 - "project_admin.py"
Cohesion: 0.22
Nodes (17): argparse, getpass, protab_domain_value_objects_official_code, _add_admin(), _create_project(), _list_admins(), main(), _open_existing_project() (+9 more)

### Community 78 - "ScopeListPage.tsx"
Cohesion: 0.11
Nodes (24): 7. Le statut d'une journée : `pending`, `completed`, `ko`, Le lot, depuis l'historique, AnalyticsFilterBarProps, CompleteTodayButton(), CompleteTodayButtonProps, DashboardCharts(), DashboardChartsProps, ExportModalProps (+16 more)

### Community 79 - "postgres_auth_bootstrap_test.py"
Cohesion: 0.21
Nodes (13): Return the quadrigramme seeding the first project's administrator. Same fail-…, Return the password seeding the first project, or refuse to start. Called only…, resolve_bootstrap_admin_code(), resolve_bootstrap_password(), The bootstrap secrets must never fall back to a hardcoded default. A missing…, test_admin_code_trims_surrounding_whitespace(), test_blank_admin_code_raises(), test_blank_variable_raises() (+5 more)

### Community 80 - "set_current_project"
Cohesion: 0.16
Nodes (17): Token, reset_current_project(), set_current_project(), project(), test_list_isolated_by_project(), add_scope_for(), project(), Give one project a scope, switching the tenant the adapter reads. Both tenants… (+9 more)

### Community 81 - "measure-usage.sh"
Cohesion: 0.23
Nodes (14): container_writable(), image_on_disk(), image_uncompressed(), print_containers(), print_devenv_guard(), print_disk_totals(), print_host(), print_images() (+6 more)

### Community 82 - "Tally plutôt qu'un tableur de production"
Cohesion: 0.29
Nodes (6): Ce qu'un tableur continue de mieux faire, Ce que le Cloud a réglé… et ce que le tableur ne réglera jamais, Ce que Tally apporte, En résumé, Quand conserver le tableur ?, Tally plutôt qu'un tableur de production

### Community 83 - "ScopeMonitoringRepository"
Cohesion: 0.09
Nodes (12): build_repository(), Select the persistence adapter from configuration. PostgreSQL is required for…, database_url_from_env(), Return the PostgreSQL DSN from DATABASE_URL, or None when unset., Protocol, Return all ScopeMonitorings., Return a mapping of scope ids to names., Create the given ScopeMonitoring and its activities. Creation only: an already… (+4 more)

### Community 84 - "Développement"
Cohesion: 0.14
Nodes (13): 11. Où aller quand…, 10. Publier une modification — liste de contrôle, 11. Problèmes fréquents, 12. Documents voisins, 1. Prérequis, 2. Installation, 5. Base de données : pas d'outil de migration, 6. Tests (+5 more)

### Community 85 - "NonWorkingDays"
Cohesion: 0.15
Nodes (19): NonWorkingDays, A project's working calendar: recurring weekdays and one-off dates. Both…, The calendar of a project that never configured one., Un calendrier sans jour ouvré n'a rien à afficher : la page principale…, test_project_settings_reject_a_calendar_without_any_working_day(), Une ligne historique illisible ne doit pas vider le calendrier : elle est…, test_an_unreadable_column_reads_as_the_default_calendar(), test_project_non_working_days_default_and_update() (+11 more)

### Community 86 - "fixture"
Cohesion: 0.50
Nodes (4): bootstrap_password(), fixture, The bootstrap secrets are mandatory: no default is provided.…, scopes()

### Community 87 - "app.py"
Cohesion: 0.10
Nodes (26): collections_abc, csv, protab_adapters_inbound_api_auth, protab_adapters_inbound_api_errors, protab_adapters_inbound_api_schemas, protab_adapters_outbound_persistence_postgres_pool, protab_adapters_outbound_persistence_postgres_scope_monitoring_repository, protab_application_actor_context (+18 more)

### Community 88 - "L'architecture Docker de ProTab"
Cohesion: 0.12
Nodes (17): 1. Vue d'ensemble à l'exécution, 2. Ordre de démarrage : ce que les dépendances garantissent, 3. Chaîne de construction des images, 4. Le premier démarrage : une fenêtre, pas une configuration, 5. Requêtes : le rôle de nginx est plus qu'un serveur de fichiers, 6. Sécurité : ce que la topologie garantit, et ce qu'elle ne garantit pas, 7. Commandes de la stack, Ce que le diagramme dit des ports publiés (+9 more)

### Community 89 - "queries_test.py"
Cohesion: 0.14
Nodes (14): protab_application_queries_get_daily_activity, protab_application_queries_get_scope, protab_application_queries_list_scopes, GetDailyActivityUseCase, GetScopeUseCase, ListScopesUseCase, make_scope(), test_get_daily_activity_day_not_found_raises() (+6 more)

### Community 90 - "add_scope"
Cohesion: 0.14
Nodes (14): add_scope(), Permanent access is not a password bypass: the admin is one factor., An administrator of A is nobody in B. ``GET /projects`` is unauthenticated, so…, ``authenticate()`` only runs at login, so a removed administrator would keep a…, test_a_code_in_no_scope_and_no_admin_list_is_refused(), test_admin_code_is_normalized_like_a_scope_code(), test_admin_is_scoped_to_its_own_project(), test_admin_still_needs_the_project_password() (+6 more)

### Community 91 - "Architecture"
Cohesion: 0.13
Nodes (15): 12. Documents voisins, 1. Ce que fait l'application, 4. Les ports, 6. Les adaptateurs entrants, 9. Modèle de données, Absence de port pour l'authentification, API — `adapters/inbound/api/`, Architecture (+7 more)

### Community 92 - "project_admin_cli_test.py"
Cohesion: 0.20
Nodes (14): protab, parametrize, ``protab-project --help`` must list the subcommands. The dispatcher resolves…, ``protab-project <code> <nom>`` predates the subcommands and stays valid., A bare invocation is still an error. Turning it into a success would make a…, The inventory must not swallow the per-subcommand argparse help., run_cli(), test_a_subcommand_without_its_arguments_still_errors() (+6 more)

### Community 93 - "kpi.ts"
Cohesion: 0.13
Nodes (28): 6. Le modèle mono-jour, 9. La page d'analyse — `/analyse`, Chaque bloc mesure une chose différente, Le reste de la page, DEFAULT_EXCLUDED_WEEKDAYS, DEFAULT_NON_WORKING_DAYS, ISO_MONDAY, ISO_SATURDAY (+20 more)

### Community 94 - "AnalyticsFilterBar.tsx"
Cohesion: 0.13
Nodes (17): ANALYTICS_PATH, AnalyticsFilterBar(), AnalyticsFilters, billingCodeKey(), formatRange(), SCOPE_DETAIL_PATH, SCOPE_LIST_PATH, scopeCountLabel() (+9 more)

### Community 95 - "update_daily_activity_test.py"
Cohesion: 0.35
Nodes (11): 10. Cycle de vie d'une écriture, protab_application_use_cases_update_daily_activity, UpdateDailyActivityCommand, UpdateDailyActivityUseCase, make_scope_with_activity(), A PATCH must not rewrite the whole scope. Rewriting the aggregate persists…, test_update_daily_activity(), test_update_day_without_activity_raises() (+3 more)

### Community 96 - "empty_database"
Cohesion: 0.15
Nodes (13): empty_database(), A project must never be created without someone able to enter it. Once it owns…, Both secrets are missing: the message must name the one resolved first.…, The secrets are only needed to seed; a restart must not require them. Requiring…, The seeded administrator must be usable as a login right away., Create the schema, then drop every project so a bootstrap is pending., Seeding the first project demands an explicit, non-guessable password. No…, test_bootstrap_grants_the_configured_admin_code() (+5 more)

### Community 97 - "exceptions/scope_monitoring.py"
Cohesion: 0.18
Nodes (8): EmptyBillingCodeError, EmptyOfficialsError, InvalidKnowledgeBaseIdError, InvalidScopeMonitoringIdError, Raised when a ScopeMonitoring is created without a billing code., Raised when a ScopeMonitoring id is empty or blank., Raised when a KnowledgeBase id does not meet the minimum length requirement., Raised when main or backup officials are not provided or are blank.

### Community 98 - "AuditEventQuery"
Cohesion: 0.06
Nodes (66): contextvars, protab_adapters_outbound_persistence_in_memory_audit_trail_repository, project_context(), InMemoryAuditTrailRepository, current_project_id(), Token, Per-request audit context. Mirrors the ``_CURRENT_PROJECT_ID`` ContextVar…, reset_current_actor() (+58 more)

### Community 99 - "seed_three_days"
Cohesion: 0.13
Nodes (15): The upsert writes two columns; the counters of a stored row are not read. A day…, Une liste vide ne doit pas être rapportée « périmètre introuvable ». Le `WHERE…, The tenant filter is not optional, even on a targeted write.…, A database written by the previous schema must keep its completed days. The…, seed_three_days(), test_completing_a_ko_day_clears_its_reason_in_the_database(), test_insert_daily_activity_leaves_other_days_untouched(), test_set_activities_status_creates_a_ko_day_without_touching_the_counters() (+7 more)

### Community 100 - "ActivityFormModal.tsx"
Cohesion: 0.12
Nodes (30): 8. Saisie et autosave, La note du périmètre — un brouillon, pas un autosave, Où le statut est écrit, Saisie d'une référence FEAI, Suppression et annulation, Un piège que le ref de statut referme, ActivityFormModal(), ActivityFormModalProps (+22 more)

### Community 101 - "AnalyticsHeatmap.tsx"
Cohesion: 0.12
Nodes (18): columnLabels(), ErrorCell(), ErrorMatrix(), getHeatmapStep(), AnalyticsKpiCardsProps, KpiCardProps, buildPath(), Sparkline() (+10 more)

### Community 102 - "InMemoryScopeMonitoringRepository"
Cohesion: 0.16
Nodes (16): handle_update_scope_note(), InMemoryScopeMonitoringRepository, date, UpdateScopeNoteCommand, Overwrite the free-text note of an existing scope. The note is written through…, UpdateScopeNoteUseCase, make_scope(), A note edit must not rewrite the whole scope. Rewriting the aggregate persists… (+8 more)

### Community 103 - "3. Le domaine"
Cohesion: 0.17
Nodes (8): 3. Le domaine, Domaine — `tests/unit/domain/`, _normalise_ko_reason(), Set the day's status — the only way to write it. A reason belongs to a KO and…, Reduce a reason to the one shape a day can hold. A blank reason and no reason…, Replace the free-text note of the scope. A blank note is stored as "no note"…, NoteTooLongError, Raised when a scope note exceeds the maximum accepted length.

### Community 104 - "scope_monitoring_repository_contract_test.py"
Cohesion: 0.39
Nodes (7): inspect, port_methods(), parametrize, Every implementation must offer every method the port declares. Nothing in this…, test_implementation_offers_every_port_method(), test_port_methods_keep_their_signature(), test_the_port_declares_the_methods_the_application_calls()

### Community 105 - "PostgresScopeMonitoringRepository"
Cohesion: 0.24
Nodes (11): API Configuration via load_dotenv and os.getenv, Configuration and Secrets Management, Idempotent Schema Bootstrap (CREATE TABLE IF NOT EXISTS), InMemoryScopeMonitoringRepository, PostgreSQL Integration Tests (make test-db), Centralized PostgreSQL Pool Configuration, PostgresScopeMonitoringRepository, ProTab Infrastructure Notes (+3 more)

### Community 106 - "search.test.ts"
Cohesion: 0.33
Nodes (8): Recherche : le responsable passe avant le suppléant, scope(), matchesSearchQuery(), OFFICIAL_MATCH_RANK, officialMatchRank(), SearchableScope, SEARCHED_FIELDS, sortByOfficialRelevance()

### Community 107 - "Ressources consommées par la stack"
Cohesion: 0.18
Nodes (11): 10. Un défaut corrigé au cours de cette mesure, 1. Poids sur le disque, 2. Consommation mémoire et CPU au repos, 3. Comportement sous charge, 4. Débit et latence, 5. Ce qui n'appartient pas à la stack, 6. Configuration PostgreSQL et mémoire, 7. Dimensionnement (+3 more)

### Community 108 - "Frontend"
Cohesion: 0.20
Nodes (10): 10. Graphiques et styles, 11. Tests, 12. Ce qui n'existe pas, 13. Build et déploiement, 14. Documents voisins, 1. Pile technique, 2. Arborescence, Frontend (+2 more)

### Community 109 - "route_authorization_test.py"
Cohesion: 0.18
Nodes (12): APIRoute, fastapi_routing, fastapi_testclient, business_routes(), Business routes must be authenticated by default (allowlist, not denylist).…, Guards against a silent rename making this test vacuously pass., A public route answers an anonymous caller; a business route does not. Uses a…, The old /audit-log endpoint was moved to /api/audit-log so that the SPA route… (+4 more)

### Community 110 - "6. Tests frontend"
Cohesion: 0.12
Nodes (15): 6. Tests frontend, Pièges propres à cette suite, ScopeDetailCharts(), ScopePicker(), ScopeDetailCharts, NON_WORKING_DAYS, SCOPES, setup() (+7 more)

### Community 111 - "ScopeMonitoringNotFoundError"
Cohesion: 0.20
Nodes (7): date, _audit_action(), ``activity_completed`` keeps its meaning; everything else is ``activity_ko``.…, DailyActivityNotFoundError, Raised when a ScopeMonitoring cannot be found for the given id., Raised when a DailyActivity cannot be found for the given day., ScopeMonitoringNotFoundError

### Community 112 - "build_changes"
Cohesion: 0.25
Nodes (9): 5. La couche application, current_actor(), build_changes(), Return only the fields whose value differs between ``before`` and ``after``.…, test_audit_event_defaults(), test_build_changes_empty_when_identical(), test_build_changes_from_empty_keeps_all_fields(), test_build_changes_handles_removed_fields() (+1 more)

### Community 113 - "repository"
Cohesion: 0.50
Nodes (4): 2. Vue d'ensemble des couches, bootstrap_password(), fixture, repository()

### Community 114 - "require_current_project"
Cohesion: 0.24
Nodes (9): 8. Multi-tenant : le mécanisme à comprendre avant toute modification, RuntimeError, MissingProjectContextError, No authenticated request established the project to read or write., Return the current project id, or refuse to touch the database. Every read and…, require_current_project(), Tenant isolation must fail closed when no project context is established. A…, test_raises_when_no_context_is_established() (+1 more)

### Community 115 - "PostgresAuthRepository"
Cohesion: 0.16
Nodes (6): _hash_password(), PostgresAuthRepository, Project, Store project credentials and opaque, expiring session tokens., Grant permanent access to one project. Returns False if already set. The code…, Replace the password of an existing project and drop its sessions. Rotating a…

### Community 117 - "_official_codes"
Cohesion: 0.29
Nodes (9): _official_codes(), Quadrigrammes declared by one ``officials`` column (format « A/B »).…, Parsing of the officials columns that gate the quadrigramme. Both…, ``MRAM/ ?`` means "MRAM, no backup": ``?`` is not a quadrigramme., test_handles_empty_and_none(), test_ignores_punctuation_only_parts(), test_placeholder_is_not_a_code(), test_splits_multiple_codes() (+1 more)

### Community 123 - "CreateScopeMonitoringUseCase"
Cohesion: 0.49
Nodes (9): CreateScopeMonitoringUseCase, make_command(), test_create_blank_billing_code_raises_and_writes_nothing(), test_create_duplicate_name_raises_and_persists_nothing(), test_create_empty_official_raises(), test_create_invalid_knowledge_base_id_raises(), test_create_multiple_scope_monitorings(), test_create_stores_the_billing_code() (+1 more)

### Community 124 - "postgres_audit_trail_repository_test.py"
Cohesion: 0.28
Nodes (8): protab_adapters_outbound_persistence_postgres_audit_trail_repository, make_event(), fixture, Integration tests for the PostgreSQL audit trail adapter. Skipped when…, repo(), test_list_orders_most_recent_first(), test_record_and_list_roundtrip(), truncate_audit()

### Community 125 - ".from_raw"
Cohesion: 0.33
Nodes (5): Rebuild a status from an untyped ``daily_activities.status`` value. Lenient on…, test_a_day_status_is_a_closed_set_of_three_states(), test_a_day_status_reads_back_from_its_stored_value(), test_a_day_status_serialises_to_its_stored_value(), test_an_unreadable_status_reads_as_pending()

### Community 126 - "non_working_days.py"
Cohesion: 0.33
Nodes (5): IntEnum, _is_iso_weekday(), IsoWeekday, The ISO 8601 weekday scale, which is what ``excluded_weekdays`` stores.…, Whether a raw entry names a weekday of the ISO scale. ``str.isdigit`` is not…

### Community 127 - "test_the_status_write_creates_a_day_once_per_day"
Cohesion: 0.40
Nodes (5): count_activity_rows(), date, A duplicated day must not create a second row. The use case de-duplicates the…, Count the stored rows for one day, without going through the aggregate., test_the_status_write_creates_a_day_once_per_day()

## Ambiguous Edges - Review These
- `React Root Mount (#root)` → `Audit Trail (best-effort mutation journal)`  [AMBIGUOUS]
  src/FrontEnd/index.html · relation: conceptually_related_to

## Knowledge Gaps
- **216 isolated node(s):** `$schema`, `plugin`, `protab`, `name`, `private` (+211 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 595 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **48 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `React Root Mount (#root)` and `Audit Trail (best-effort mutation journal)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `RecordingScopeMonitoringRepository` connect `RecordingScopeMonitoringRepository` to `InMemoryScopeMonitoringRepository`, `.set_activities_status`, `DailyActivity`, `ScopeMonitoring`, `scope_monitoring_repository_contract_test.py`, `SetActivitiesStatusUseCase`, `datetime`, `CreateScopeMonitoringUseCase`, `update_daily_activity_test.py`?**
  _High betweenness centrality (0.161) - this node is a cross-community bridge._
- **Why does `7. Écrire un nouveau test` connect `RecordingScopeMonitoringRepository` to `makeScope`, `6. Tests frontend`?**
  _High betweenness centrality (0.157) - this node is a cross-community bridge._
- **Why does `6. Le modèle mono-jour` connect `kpi.ts` to `analytics.ts`, `AuditLogPage.tsx`, `search.test.ts`, `ScopeDetailPage.tsx`, `Frontend`, `6. Tests frontend`, `NonWorkingDays`, `AnalyticsFilterBar.tsx`?**
  _High betweenness centrality (0.153) - this node is a cross-community bridge._
- **Are the 76 inferred relationships involving `InMemoryScopeMonitoringRepository` (e.g. with `2. Vue d'ensemble des couches` and `5. Ce que ces tests ne prouvent pas`) actually correct?**
  _`InMemoryScopeMonitoringRepository` has 76 INFERRED edges - model-reasoned connections that need verification._
- **Are the 66 inferred relationships involving `DailyActivity` (e.g. with `_activity_to_response()` and `InMemoryScopeMonitoringRepository`) actually correct?**
  _`DailyActivity` has 66 INFERRED edges - model-reasoned connections that need verification._
- **Are the 56 inferred relationships involving `create_app()` (e.g. with `API — `adapters/inbound/api/`` and `close_persistence()`) actually correct?**
  _`create_app()` has 56 INFERRED edges - model-reasoned connections that need verification._