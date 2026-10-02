# Graph Report - ProTab  (2026-10-02)

## Corpus Check
- 186 files · ~94,738 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 8, .example 1, .conf 1)

## Summary
- 1512 nodes · 3489 edges · 102 communities (66 shown, 36 thin omitted)
- Extraction: 81% EXTRACTED · 19% INFERRED · 0% AMBIGUOUS · INFERRED: 665 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9a438244`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- index.ts
- PostgresScopeMonitoringRepository
- package.json
- AppSessionLoss.test.tsx
- parse_scope_monitorings_csv
- OfficialCode
- DomainError
- DailyActivity
- useTheme.tsx
- Officials
- api_test.py
- create_app
- empty_database
- Audit Trail (best-effort mutation journal)
- useToast.tsx
- 3. Tests d'intégration — `tests/integration/adapters/`
- route_authorization_test.py
- queries_test.py
- App.tsx
- postgres_scope_monitoring_repository_test.py
- api_config_test.py
- compilerOptions
- AuditEvent
- FakeAuthRepository
- create_daily_activity_test.py
- Rule Categories by Priority (1-10)
- La CLI `protab-project`
- Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring)
- PostgresAuthRepository
- update_daily_activity_test.py
- FastAPI & PostgreSQL Performance Optimizer Skill
- NonWorkingDays
- Hexagonal Architecture (Ports and Adapters)
- PostgresScopeMonitoringRepository
- api Service (FastAPI backend)
- project_admin_test.py
- analytics.ts
- Development Workflow (9 Steps)
- test_an_empty_calendar_is_not_the_default_one
- opencode.json
- complete_daily_activity_test.py
- Application Layer / Use Cases
- protab
- build_connection_pool
- postgres_auth_repository_test.py
- graphify.js
- _official_codes
- architecture.md
- ScopeDetailPage.tsx
- postgres_auth_bootstrap_test.py
- .validate_weekdays
- current_user
- Tally plutôt qu'un tableur de production
- ScopeMonitoring
- Développement
- app.py
- fixture
- AuditLogPage.tsx
- L'architecture Docker de ProTab
- ScopeListPage.tsx
- kpi.ts
- create_default_app
- InMemoryScopeMonitoringRepository
- pytest
- ScopeFormModal.tsx
- 7. Les adaptateurs sortants
- project_context
- audit_log_api_test.py
- ScopeMonitoringNotFoundError
- require_current_project
- non_working_days.py
- Project
- build_repository

## God Nodes (most connected - your core abstractions)
1. `DailyActivity` - 74 edges
2. `create_app()` - 72 edges
3. `InMemoryScopeMonitoringRepository` - 65 edges
4. `ScopeMonitoring` - 51 edges
5. `PostgresAuthRepository` - 34 edges
6. `react` - 30 edges
7. `NonWorkingDays` - 29 edges
8. `ScopeMonitoring` - 28 edges
9. `PostgresScopeMonitoringRepository` - 28 edges
10. `ScopeMonitoringRepository` - 28 edges

## Surprising Connections (you probably didn't know these)
- `6. Sécurité : ce que la topologie garantit, et ce qu'elle ne garantit pas` --references--> `MissingProjectContextError`  [INFERRED]
  docs/docker-architecture.md → src/protab/adapters/outbound/persistence/postgres_scope_monitoring_repository.py
- `Domaine — `tests/unit/domain/`` --references--> `build_changes()`  [INFERRED]
  docs/testing.md → src/protab/domain/entities/audit_event.py
- `Port d'audit — `ports/outbound/audit_trail_repository.py`` --references--> `AuditEventQuery`  [INFERRED]
  docs/architecture.md → src/protab/ports/outbound/audit_trail_repository.py
- `Contre l'API, sans base` --references--> `FakeAuthRepository`  [INFERRED]
  docs/testing.md → tests/integration/adapters/auth_api_test.py
- `7. Écrire un nouveau test` --references--> `RecordingScopeMonitoringRepository`  [INFERRED]
  docs/testing.md → tests/unit/application/recording_repository.py

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **ProTab Mutation → Audit Trail Flow** — readme_mutation_use_cases, readme_audit_trail, readme_domain_invariants, readme_domain_error_http_mapping, readme_rest_routes_table [INFERRED 0.85]
- **ProTab PostgreSQL Persistence Path (port → adapter → pool → container)** — agents_scopemonitoringrepository_port, agents_postgres_scopemonitoringrepository, agents_idempotent_schema_bootstrap, agents_postgres_pool_configuration, readme_postgres_persistence, readme_scope_monitorings_index, docker_compose_db_service, docker_compose_api_service [INFERRED 0.85]
- **ProTab Hexagonal Core and Its Adapters** — agents_hexagonal_architecture, readme_scope_monitoring_aggregate, readme_mutation_use_cases, agents_scopemonitoringrepository_port, readme_http_api_adapter, readme_csv_import_adapter, readme_postgres_persistence [INFERRED 0.95]

## Communities (102 total, 36 thin omitted)

### Community 0 - "index.ts"
Cohesion: 0.11
Nodes (25): 3. Client HTTP — `services/api.ts`, DashboardChartsProps, WorkingDaysModal(), WorkingDaysModalProps, IsoWeekday, LoginPage(), LoginPageProps, ScopeListPageProps (+17 more)

### Community 1 - "PostgresScopeMonitoringRepository"
Cohesion: 0.28
Nodes (5): PostgresScopeMonitoringRepository, Connection, date, Persist ``ScopeMonitoring`` aggregates in PostgreSQL. The schema is applied…, Close the connection pool, releasing database connections.

### Community 2 - "package.json"
Cohesion: 0.05
Nodes (38): jsdom, tailwindcss, @tailwindcss/vite, @types/node, @types/react, @types/react-dom, typescript, vite (+30 more)

### Community 3 - "AppSessionLoss.test.tsx"
Cohesion: 0.25
Nodes (7): react-dom, App(), src_frontend_src_index, json(), PROJECT, SESSION, stubFetch()

### Community 4 - "parse_scope_monitorings_csv"
Cohesion: 0.13
Nodes (30): csv, 6. Les adaptateurs entrants, CLI — `src/protab/project_admin.py`, CSV — `adapters/inbound/csv/scope_monitoring_csv_reader.py`, fastapi_responses, JSONResponse, Path, pathlib (+22 more)

### Community 5 - "OfficialCode"
Cohesion: 0.07
Nodes (41): argparse, getpass, protab_domain_value_objects_official_code, Grant permanent access to one project. Returns False if already set. The code…, OfficialCode, A single official identity, normalized the way login normalizes it.…, _add_admin(), _create_project() (+33 more)

### Community 6 - "DomainError"
Cohesion: 0.13
Nodes (23): DuplicateFeaiReferenceError, IncidentsExceedErrorsError, InvalidFeaiReferenceError, NegativeErrorsCountError, NegativeIncidentsCountError, Raised when incidents_created exceeds errors_reported., Raised when a FEAI reference does not match the expected format., Raised when a FEAI reference is duplicated within the same activity. (+15 more)

### Community 7 - "DailyActivity"
Cohesion: 0.15
Nodes (18): 3. Le domaine, DailyActivity, test_daily_activity_creation_valid(), test_daily_activity_duplicate_feai_rejected(), test_daily_activity_errors_reported_negative(), test_daily_activity_incidents_created_negative(), test_daily_activity_incidents_exceed_errors(), test_daily_activity_invalid_feai_format() (+10 more)

### Community 8 - "useTheme.tsx"
Cohesion: 0.27
Nodes (8): src_frontend_src_assets_layered_waves_dark, src_frontend_src_assets_layered_waves_light, LoginBackground(), Theme, ThemeContext, ThemeContextType, ThemeProvider(), useTheme()

### Community 9 - "Officials"
Cohesion: 0.12
Nodes (25): KnowledgeBase, Officials, build_scope(), fixture_scope_monitoring(), fixture, parametrize, Adding a DailyActivity for a new day should succeed., Adding a second DailyActivity for the same day should raise… (+17 more)

### Community 10 - "api_test.py"
Cohesion: 0.08
Nodes (16): client(), create_scope_via_api(), make_scope_with_activity(), fixture, test_complete_daily_activities_returns_204(), test_complete_day_without_activity_returns_404(), test_create_daily_activity_duplicate_day_returns_409(), test_create_daily_activity_invalid_invariant_returns_400() (+8 more)

### Community 11 - "create_app"
Cohesion: 0.17
Nodes (23): BaseModel, pydantic, _activity_to_response(), create_app(), create_scope_monitorings(), get_scope_daily_activity(), get_scope_monitoring(), import_scope_monitorings_csv() (+15 more)

### Community 12 - "empty_database"
Cohesion: 0.15
Nodes (13): empty_database(), A project must never be created without someone able to enter it. Once it owns…, Both secrets are missing: the message must name the one resolved first.…, The secrets are only needed to seed; a restart must not require them. Requiring…, The seeded administrator must be usable as a login right away., Create the schema, then drop every project so a bootstrap is pending., Seeding the first project demands an explicit, non-guessable password. No…, test_bootstrap_grants_the_configured_admin_code() (+5 more)

### Community 13 - "Audit Trail (best-effort mutation journal)"
Cohesion: 0.40
Nodes (6): Adapters (Inbound / Outbound), Domain Error Handling and Adapter Translation, Audit Trail (best-effort mutation journal), Domain Error to HTTP Status Mapping, REST Routes and Status Codes Table, React Root Mount (#root)

### Community 14 - "useToast.tsx"
Cohesion: 0.11
Nodes (12): ToastAction, ToastActionsContext, ToastActionsType, ToastContextType, ToastMessage, ToastProvider(), ToastStateContext, ToastStateType (+4 more)

### Community 15 - "3. Tests d'intégration — `tests/integration/adapters/`"
Cohesion: 0.67
Nodes (3): 3. Tests d'intégration — `tests/integration/adapters/`, Contre l'API, sans base, Contre PostgreSQL réel

### Community 16 - "route_authorization_test.py"
Cohesion: 0.22
Nodes (10): APIRoute, fastapi_routing, protab_adapters_inbound_api_app, business_routes(), Business routes must be authenticated by default (allowlist, not denylist).…, Guards against a silent rename making this test vacuously pass., A public route answers an anonymous caller; a business route does not. Uses a…, test_business_routes_are_discovered() (+2 more)

### Community 17 - "queries_test.py"
Cohesion: 0.16
Nodes (13): protab_application_queries_get_daily_activity, protab_application_queries_get_scope, protab_application_queries_list_scopes, GetDailyActivityUseCase, ListScopesUseCase, make_scope(), test_get_daily_activity_day_not_found_raises(), test_get_daily_activity_found() (+5 more)

### Community 18 - "App.tsx"
Cohesion: 0.17
Nodes (14): 4. Chemins et routage, react-router-dom, AppContent(), Navbar(), NavbarProps, ITEMS, PageNav(), PageShortcuts() (+6 more)

### Community 19 - "postgres_scope_monitoring_repository_test.py"
Cohesion: 0.07
Nodes (40): reset_current_project(), set_current_project(), project(), add_scope_for(), project(), Give one project a scope, switching the tenant the adapter reads. Both tenants…, make_scope(), project_context() (+32 more)

### Community 20 - "api_config_test.py"
Cohesion: 0.15
Nodes (17): 3. Configuration, dotenv, os, protab_adapters_inbound_api_config, cookie_secure_from_env(), InvalidPortError, Exception, Resolve host/port from env values, falling back to defaults. (+9 more)

### Community 21 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 22 - "AuditEvent"
Cohesion: 0.12
Nodes (20): _audit_event_to_response(), list_scope_audit_log(), InMemoryAuditTrailRepository, PostgresAuditTrailRepository, Open the connection pool and apply the (idempotent) schema., Close the connection pool, releasing database connections., current_project_id(), CreateScopeMonitoringCommand (+12 more)

### Community 23 - "FakeAuthRepository"
Cohesion: 0.12
Nodes (17): AuthSession, FakeAuthRepository, login_and_read_session_cookie(), Un calendrier sans jour ouvré n'a rien à afficher : la page principale…, Le refus porte sur la semaine entière, pas sur le week-end : un projet qui…, Le cookie et la ligne ``auth_sessions`` doivent tomber ensemble : un cookie…, test_authenticated_routes_require_a_valid_session(), test_in_memory_application_remains_unauthenticated_for_existing_fixtures() (+9 more)

### Community 24 - "create_daily_activity_test.py"
Cohesion: 0.35
Nodes (11): handle_create_daily_activity(), CreateDailyActivityCommand, CreateDailyActivityUseCase, make_command(), make_scope(), make_scope_daily_activity(), test_create_daily_activity(), test_create_duplicate_day_raises_and_persists_nothing() (+3 more)

### Community 25 - "Rule Categories by Priority (1-10)"
Cohesion: 0.20
Nodes (12): Design Dials (variance / motion / density), Design System Generation (--design-system), Design System Persistence (Master + Overrides), Pre-Delivery UI Checklist, Search Query Contract, Rule Categories by Priority (1-10), ui-ux-pro-max Search Script, Stack Detection Step (+4 more)

### Community 26 - "La CLI `protab-project`"
Cohesion: 0.12
Nodes (17): 10. En Docker, 11. Voir aussi, 1. Ce que la CLI fait, et ce qu'elle ne fait pas, 2. Prérequis, 3. Inventaire des commandes, 4. Les mots de passe, 5. Qui peut se connecter, 6. Pourquoi nommer un administrateur (+9 more)

### Community 27 - "Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring)"
Cohesion: 0.20
Nodes (11): Avoid Premature Abstraction, SOLID Principles, Aggregate Owns DailyActivities Indexed by Day, Atomic ScopeMonitoring Creation, CSV Import Inbound Adapter, DailyActivity (Entity), Day Is Not a Class (datetime.date as value object), Domain Invariants (counters, FEAI format, completion implication) (+3 more)

### Community 28 - "PostgresAuthRepository"
Cohesion: 0.09
Nodes (17): 4. Les ports, Absence de port pour l'authentification, Port d'audit — `ports/outbound/audit_trail_repository.py`, Port de périmètre — `ports/outbound/scope_monitoring_repository.py`, hashlib, hmac, protab_domain_value_objects_non_working_days, secrets (+9 more)

### Community 29 - "update_daily_activity_test.py"
Cohesion: 0.35
Nodes (11): 10. Cycle de vie d'une écriture, handle_update_daily_activity(), UpdateDailyActivityCommand, UpdateDailyActivityUseCase, make_scope_with_activity(), A PATCH must not rewrite the whole scope. Rewriting the aggregate persists…, test_update_daily_activity(), test_update_day_without_activity_raises() (+3 more)

### Community 30 - "FastAPI & PostgreSQL Performance Optimizer Skill"
Cohesion: 0.22
Nodes (10): Caching Layer & Background Task Offloading, Connection Pooling Parameters, Database Indexing Strategy, Diagnostic & Audit Checklist, Event Loop Stall Detection, FastAPI & PostgreSQL Performance Optimizer Skill, N+1 Query Pattern Detection, Payload & Serialization Optimization (+2 more)

### Community 31 - "NonWorkingDays"
Cohesion: 0.11
Nodes (36): NonWorkingDays, A project's working calendar: recurring weekdays and one-off dates. Both…, The calendar of a project that never configured one., Rebuild a calendar from an untyped ``projects.non_working_days`` value. Lenient…, Une ligne historique illisible ne doit pas vider le calendrier : elle est…, test_an_unreadable_column_reads_as_the_default_calendar(), test_project_non_working_days_default_and_update(), ``NonWorkingDays`` is the project's working calendar. A row of… (+28 more)

### Community 32 - "Hexagonal Architecture (Ports and Adapters)"
Cohesion: 0.29
Nodes (7): Dependency Injection and Composition Root, Dependency Rule (Adapters → Ports → Application → Domain), Domain Layer, Framework Isolation, Hexagonal Architecture (Ports and Adapters), Ports (Inbound and Outbound Contracts), Type Safety and Protocol-based Interfaces

### Community 33 - "PostgresScopeMonitoringRepository"
Cohesion: 0.24
Nodes (11): API Configuration via load_dotenv and os.getenv, Configuration and Secrets Management, Idempotent Schema Bootstrap (CREATE TABLE IF NOT EXISTS), InMemoryScopeMonitoringRepository, PostgreSQL Integration Tests (make test-db), Centralized PostgreSQL Pool Configuration, PostgresScopeMonitoringRepository, ProTab Infrastructure Notes (+3 more)

### Community 34 - "api Service (FastAPI backend)"
Cohesion: 0.19
Nodes (13): api Healthcheck (/healthz), api Service (FastAPI backend), db Healthcheck (pg_isready), db Service (postgres:17-alpine), Default Project Seeding Env Vars, ProTab Development Docker Stack, frontend Service (React/nginx build), pgdata Named Volume (+5 more)

### Community 35 - "project_admin_test.py"
Cohesion: 0.07
Nodes (46): 2. Vue d'ensemble des couches, protab, bootstrap_password(), fixture, Integration tests for the ``protab-project`` administrative command. The…, The whole point: the code belongs to the project, not to a scope., ``MLOZ/MRAM`` is the scope list form; as an admin it could never be matched by…, The command must close the sessions it orphans. Whether a removed administrator… (+38 more)

### Community 36 - "analytics.ts"
Cohesion: 0.05
Nodes (70): AnalyticsErrorHeatmap(), columnLabels(), ErrorCell(), ErrorMatrix(), heatmapClass(), ANALYTICS_PATH, AnalyticsFilterBar(), AnalyticsFilterBarProps (+62 more)

### Community 37 - "Development Workflow (9 Steps)"
Cohesion: 0.40
Nodes (6): Definition of Done Checklist, Development Workflow (9 Steps), Documentation Synchronization Requirement, Graphify Knowledge Graph Workflow, Test-Driven Development (RED/GREEN/REFACTOR), Testing Strategy (Test Pyramid)

### Community 40 - "complete_daily_activity_test.py"
Cohesion: 0.16
Nodes (21): 5. La couche application, complete_daily_activities(), current_actor(), CompleteDailyActivityCommand, CompleteDailyActivityUseCase, build_changes(), Return only the fields whose value differs between ``before`` and ``after``.…, make_activity() (+13 more)

### Community 72 - "build_connection_pool"
Cohesion: 0.17
Nodes (9): ConnectionPool, psycopg, psycopg_pool, build_connection_pool(), ping_check(), Connection, Shared PostgreSQL connection-pool configuration for persistence adapters., Check connectivity and leave the connection outside a transaction. (+1 more)

### Community 74 - "postgres_auth_repository_test.py"
Cohesion: 0.07
Nodes (33): add_scope(), Integration tests for the PostgreSQL auth repository rule: the quadrigramme…, ``official_main`` encodes several codes just like ``official_backup``., ``?`` marks the absence of a backup official, it is not a code., La colonne est du JSONB non typé : ce qui est écrit doit être relu à…, The rule the whole feature exists for. Without an administrator, creating the…, Permanent access is not a password bypass: the admin is one factor., Reusing a project code is the likeliest CLI mistake, and it must not reach the… (+25 more)

### Community 75 - "graphify.js"
Cohesion: 0.40
Nodes (3): IMPORTANT: keep the reminder string free of backticks and $(...) constructs., ref_fs, ref_path

### Community 76 - "_official_codes"
Cohesion: 0.29
Nodes (9): _official_codes(), Quadrigrammes declared by one ``officials`` column (format « A/B »).…, Parsing of the officials columns that gate the quadrigramme. Both…, ``MRAM/ ?`` means "MRAM, no backup": ``?`` is not a quadrigramme., test_handles_empty_and_none(), test_ignores_punctuation_only_parts(), test_placeholder_is_not_a_code(), test_splits_multiple_codes() (+1 more)

### Community 78 - "ScopeDetailPage.tsx"
Cohesion: 0.13
Nodes (25): Suppression et annulation, lucide-react, react, recharts, ActivityFormModal(), AnalyticsScopePicker(), Badge(), BadgeProps (+17 more)

### Community 79 - "postgres_auth_bootstrap_test.py"
Cohesion: 0.21
Nodes (13): Return the quadrigramme seeding the first project's administrator. Same fail-…, Return the password seeding the first project, or refuse to start. Called only…, resolve_bootstrap_admin_code(), resolve_bootstrap_password(), The bootstrap secrets must never fall back to a hardcoded default. A missing…, test_admin_code_trims_surrounding_whitespace(), test_blank_admin_code_raises(), test_blank_variable_raises() (+5 more)

### Community 81 - "current_user"
Cohesion: 0.16
Nodes (17): API — `adapters/inbound/api/`, fastapi, protab_adapters_outbound_persistence_postgres_auth_repository, Response, get_project_settings(), list_projects(), login(), logout() (+9 more)

### Community 82 - "Tally plutôt qu'un tableur de production"
Cohesion: 0.29
Nodes (6): Ce qu'un tableur continue de mieux faire, Ce que le Cloud a réglé… et ce que le tableur ne réglera jamais, Ce que Tally apporte, En résumé, Quand conserver le tableur ?, Tally plutôt qu'un tableur de production

### Community 83 - "ScopeMonitoring"
Cohesion: 0.05
Nodes (19): GetScopeUseCase, date, ScopeMonitoring, AuditTrailRepository, Protocol, Persist an audit event., date, Protocol (+11 more)

### Community 84 - "Développement"
Cohesion: 0.17
Nodes (11): 10. Publier une modification — liste de contrôle, 12. Documents voisins, 1. Prérequis, 2. Installation, 5. Base de données : pas d'outil de migration, 6. Tests, 7. Administration d'hôte, 8. Docker (+3 more)

### Community 85 - "app.py"
Cohesion: 0.08
Nodes (30): dataclasses, datetime, protab_adapters_inbound_api_auth, protab_adapters_inbound_api_errors, protab_adapters_inbound_api_schemas, protab_adapters_outbound_persistence_postgres_pool, protab_adapters_outbound_persistence_postgres_scope_monitoring_repository, protab_application_actor_context (+22 more)

### Community 86 - "fixture"
Cohesion: 0.50
Nodes (4): bootstrap_password(), fixture, The bootstrap secrets are mandatory: no default is provided.…, scopes()

### Community 87 - "AuditLogPage.tsx"
Cohesion: 0.17
Nodes (15): AuditActivityHeatmap(), AuditActivityHeatmapProps, HOURS, intensityClass(), WEEKDAYS, toMondayFirstIndex(), ACTION_ICONS, ACTION_LABELS (+7 more)

### Community 88 - "L'architecture Docker de ProTab"
Cohesion: 0.12
Nodes (17): 1. Vue d'ensemble à l'exécution, 2. Ordre de démarrage : ce que les dépendances garantissent, 3. Chaîne de construction des images, 4. Le premier démarrage : une fenêtre, pas une configuration, 5. Requêtes : le rôle de nginx est plus qu'un serveur de fichiers, 6. Sécurité : ce que la topologie garantit, et ce qu'elle ne garantit pas, 7. Commandes de la stack, Ce que le diagramme dit des ports publiés (+9 more)

### Community 92 - "ScopeListPage.tsx"
Cohesion: 0.11
Nodes (20): @testing-library/jest-dom, @testing-library/react, vitest, CompleteTodayButton(), CompleteTodayButtonProps, DashboardCharts(), DateNavigator(), DateNavigatorProps (+12 more)

### Community 93 - "kpi.ts"
Cohesion: 0.07
Nodes (43): 10. Tests, 11. Ce qui n'existe pas, 12. Build et déploiement, 13. Documents voisins, 1. Pile technique, 2. Arborescence, 6. Le modèle mono-jour, 8. La page d'analyse — `/analyse` (+35 more)

### Community 94 - "create_default_app"
Cohesion: 0.25
Nodes (7): 4. Démarrage en développement, create_default_app(), FastAPI, Create the production app using the configured PostgreSQL repository., host_port_from_env(), main(), Run the ProTab HTTP API server.

### Community 96 - "InMemoryScopeMonitoringRepository"
Cohesion: 0.13
Nodes (20): 1. Vue d'ensemble, 2. Tests unitaires — `tests/unit/`, 4. Test E2E — `tests/e2e/`, 5. Ce que ces tests ne prouvent pas, 7. Écrire un nouveau test, 8. Documents voisins, Adaptateurs — `tests/unit/adapters/`, Application — `tests/unit/application/` (+12 more)

### Community 98 - "pytest"
Cohesion: 0.17
Nodes (13): protab_adapters_outbound_persistence_postgres_audit_trail_repository, pytest, make_event(), fixture, Integration tests for the PostgreSQL audit trail adapter. Skipped when…, repo(), test_list_filters_by_scope_actor_action_and_dates(), test_list_isolated_by_project() (+5 more)

### Community 100 - "ScopeFormModal.tsx"
Cohesion: 0.09
Nodes (32): 5. Providers et état, 7. Saisie et autosave, 6. Tests frontend, Pièges propres à cette suite, ActivityFormModalProps, CompleteActivitiesModalProps, FeaiTagInput(), FeaiTagInputProps (+24 more)

### Community 102 - "7. Les adaptateurs sortants"
Cohesion: 0.20
Nodes (8): 7. Les adaptateurs sortants, Exception, DuplicateDailyActivityError, Raised when a ScopeMonitoring already has a DailyActivity for the given day., Raised when a ScopeMonitoring with the same name already exists., ScopeMonitoringNameAlreadyExistsError, The column's stored shape, kept as plain lists for the JSON contract., UniqueViolation

### Community 103 - "project_context"
Cohesion: 0.24
Nodes (10): contextvars, project_context(), Per-request audit context. Mirrors the ``_CURRENT_PROJECT_ID`` ContextVar…, reset_current_actor(), set_current_actor(), clear_actor(), env(), fixture (+2 more)

### Community 108 - "audit_log_api_test.py"
Cohesion: 0.24
Nodes (9): fastapi_testclient, protab_adapters_outbound_persistence_in_memory_audit_trail_repository, protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository, test_daily_activity_full_flow_over_http(), all_events(), make_scope_with_activity(), test_activity_flow_records_audit_via_api(), test_create_scope_records_audit_via_api() (+1 more)

### Community 110 - "ScopeMonitoringNotFoundError"
Cohesion: 0.25
Nodes (5): date, DailyActivityNotFoundError, Raised when a ScopeMonitoring cannot be found for the given id., Raised when a DailyActivity cannot be found for the given day., ScopeMonitoringNotFoundError

### Community 111 - "require_current_project"
Cohesion: 0.18
Nodes (12): 11. Où aller quand…, 12. Documents voisins, 1. Ce que fait l'application, 8. Multi-tenant : le mécanisme à comprendre avant toute modification, 9. Modèle de données, Architecture, 11. Problèmes fréquents, RuntimeError (+4 more)

### Community 113 - "non_working_days.py"
Cohesion: 0.29
Nodes (6): enum, IntEnum, _is_iso_weekday(), IsoWeekday, The ISO 8601 weekday scale, which is what ``excluded_weekdays`` stores.…, Whether a raw entry names a weekday of the ISO scale. ``str.isdigit`` is not…

### Community 116 - "build_repository"
Cohesion: 0.50
Nodes (4): build_repository(), Select the persistence adapter from configuration. PostgreSQL is required for…, database_url_from_env(), Return the PostgreSQL DSN from DATABASE_URL, or None when unset.

## Ambiguous Edges - Review These
- `React Root Mount (#root)` → `Audit Trail (best-effort mutation journal)`  [AMBIGUOUS]
  src/FrontEnd/index.html · relation: conceptually_related_to

## Knowledge Gaps
- **195 isolated node(s):** `$schema`, `plugin`, `protab`, `name`, `private` (+190 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 501 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **36 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `React Root Mount (#root)` and `Audit Trail (best-effort mutation journal)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `6. Le modèle mono-jour` connect `kpi.ts` to `NonWorkingDays`, `AuditLogPage.tsx`?**
  _High betweenness centrality (0.233) - this node is a cross-community bridge._
- **Why does `create_app()` connect `create_app` to `parse_scope_monitorings_csv`, `api_test.py`, `route_authorization_test.py`, `queries_test.py`, `postgres_scope_monitoring_repository_test.py`, `AuditEvent`, `FakeAuthRepository`, `create_daily_activity_test.py`, `PostgresAuthRepository`, `update_daily_activity_test.py`, `complete_daily_activity_test.py`, `current_user`, `ScopeMonitoring`, `app.py`, `create_default_app`, `InMemoryScopeMonitoringRepository`, `project_context`, `audit_log_api_test.py`, `build_repository`?**
  _High betweenness centrality (0.151) - this node is a cross-community bridge._
- **Why does `Tests` connect `InMemoryScopeMonitoringRepository` to `ScopeFormModal.tsx`, `architecture.md`, `3. Tests d'intégration — `tests/integration/adapters/``?**
  _High betweenness centrality (0.121) - this node is a cross-community bridge._
- **Are the 53 inferred relationships involving `DailyActivity` (e.g. with `_activity_to_response()` and `InMemoryScopeMonitoringRepository`) actually correct?**
  _`DailyActivity` has 53 INFERRED edges - model-reasoned connections that need verification._
- **Are the 52 inferred relationships involving `create_app()` (e.g. with `API — `adapters/inbound/api/`` and `close_persistence()`) actually correct?**
  _`create_app()` has 52 INFERRED edges - model-reasoned connections that need verification._
- **Are the 53 inferred relationships involving `InMemoryScopeMonitoringRepository` (e.g. with `2. Vue d'ensemble des couches` and `5. Ce que ces tests ne prouvent pas`) actually correct?**
  _`InMemoryScopeMonitoringRepository` has 53 INFERRED edges - model-reasoned connections that need verification._