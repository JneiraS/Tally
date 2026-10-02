# Graph Report - ProTab  (2026-10-02)

## Corpus Check
- 170 files · ~77,856 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 8, .example 1, .conf 1)

## Summary
- 1356 nodes · 3023 edges · 110 communities (72 shown, 38 thin omitted)
- Extraction: 80% EXTRACTED · 20% INFERRED · 0% AMBIGUOUS · INFERRED: 614 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f7f2b80c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.tsx
- PostgresScopeMonitoringRepository
- package.json
- ScopeMonitoringRepository
- parse_scope_monitorings_csv
- OfficialCode
- DomainError
- api.ts
- AuditEvent
- Officials
- api_test.py
- schemas.py
- empty_database
- FakeAuthRepository
- useToast.tsx
- ExportModal.tsx
- protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository
- vitest
- DailyActivity
- postgres_scope_monitoring_repository_test.py
- api_config_test.py
- compilerOptions
- queries_test.py
- ScopeListPage.tsx
- InMemoryScopeMonitoringRepository
- Rule Categories by Priority (1-10)
- La CLI `protab-project`
- Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring)
- pytest
- update_daily_activity_test.py
- FastAPI & PostgreSQL Performance Optimizer Skill
- complete_daily_activity_test.py
- Hexagonal Architecture (Ports and Adapters)
- PostgresScopeMonitoringRepository
- api Service (FastAPI backend)
- project_admin_test.py
- create_app
- Development Workflow (9 Steps)
- add_scope
- opencode.json
- CreateScopeMonitoringUseCase
- Application Layer / Use Cases
- protab
- build_connection_pool
- PostgresAuthRepository
- postgres_auth_repository_test.py
- app.py
- _official_codes
- architecture.md
- add_scope_for
- postgres_auth_bootstrap_test.py
- _normalize_code
- current_user
- Tally plutôt qu'un tableur
- ScopeDetailPage.tsx
- ScopeMonitoring
- datetime
- project
- project_admin_cli_test.py
- InlineActivityCounters.tsx
- Développement
- test_creating_a_project_twice_reports_the_duplicate
- test_admin_alongside_scope_officials
- Architecture
- Tests
- Frontend
- dependencies
- AppSessionLoss.test.tsx
- devDependencies
- test_admin_authenticates_although_it_belongs_to_no_scope
- test_admin_still_needs_the_project_password
- postgres_auth_repository.py
- graphify.js
- Audit Trail (best-effort mutation journal)
- scripts
- NonWorkingDays
- DailyActivityNotFoundError
- repository
- 4. Les ports
- MissingProjectContextError
- InvalidKnowledgeBaseIdError

## God Nodes (most connected - your core abstractions)
1. `DailyActivity` - 74 edges
2. `create_app()` - 70 edges
3. `InMemoryScopeMonitoringRepository` - 63 edges
4. `ScopeMonitoring` - 51 edges
5. `PostgresAuthRepository` - 33 edges
6. `PostgresScopeMonitoringRepository` - 28 edges
7. `ScopeMonitoringRepository` - 28 edges
8. `react` - 26 edges
9. `Officials` - 26 edges
10. `AuditEvent` - 25 edges

## Surprising Connections (you probably didn't know these)
- `4. Démarrage en développement` --references--> `create_default_app()`  [INFERRED]
  docs/development.md → src/protab/adapters/inbound/api/app.py
- `5. Ce que ces tests ne prouvent pas` --references--> `InMemoryScopeMonitoringRepository`  [INFERRED]
  docs/testing.md → src/protab/adapters/outbound/persistence/in_memory_scope_monitoring_repository.py
- `Application — `tests/unit/application/`` --references--> `InMemoryScopeMonitoringRepository`  [INFERRED]
  docs/testing.md → src/protab/adapters/outbound/persistence/in_memory_scope_monitoring_repository.py
- `Absence de port pour l'authentification` --references--> `PostgresAuthRepository`  [INFERRED]
  docs/architecture.md → src/protab/adapters/outbound/persistence/postgres_auth_repository.py
- `6. Sécurité : ce que la topologie garantit, et ce qu'elle ne garantit pas` --references--> `MissingProjectContextError`  [INFERRED]
  docs/docker-architecture.md → src/protab/adapters/outbound/persistence/postgres_scope_monitoring_repository.py

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **ProTab Mutation → Audit Trail Flow** — readme_mutation_use_cases, readme_audit_trail, readme_domain_invariants, readme_domain_error_http_mapping, readme_rest_routes_table [INFERRED 0.85]
- **ProTab PostgreSQL Persistence Path (port → adapter → pool → container)** — agents_scopemonitoringrepository_port, agents_postgres_scopemonitoringrepository, agents_idempotent_schema_bootstrap, agents_postgres_pool_configuration, readme_postgres_persistence, readme_scope_monitorings_index, docker_compose_db_service, docker_compose_api_service [INFERRED 0.85]
- **ProTab Hexagonal Core and Its Adapters** — agents_hexagonal_architecture, readme_scope_monitoring_aggregate, readme_mutation_use_cases, agents_scopemonitoringrepository_port, readme_http_api_adapter, readme_csv_import_adapter, readme_postgres_persistence [INFERRED 0.95]

## Communities (110 total, 38 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.11
Nodes (32): 5. Providers et état, Suppression et annulation, lucide-react, react, AppContent(), src_frontend_src_assets_layered_waves_dark, src_frontend_src_assets_layered_waves_light, CompleteActivitiesModal() (+24 more)

### Community 1 - "PostgresScopeMonitoringRepository"
Cohesion: 0.22
Nodes (8): 11. Problèmes fréquents, PostgresScopeMonitoringRepository, Connection, date, Return the current project id, or refuse to touch the database. Every read and…, Persist ``ScopeMonitoring`` aggregates in PostgreSQL. The schema is applied…, Close the connection pool, releasing database connections., require_current_project()

### Community 2 - "package.json"
Cohesion: 0.17
Nodes (11): jsdom, tailwindcss, @types/node, @types/react, @types/react-dom, typescript, vite, name (+3 more)

### Community 3 - "ScopeMonitoringRepository"
Cohesion: 0.08
Nodes (14): GetScopeUseCase, AuditTrailRepository, Protocol, Persist an audit event., date, Protocol, Persist the given ScopeMonitoring. Replaces the whole aggregate: the scope row…, Add one activity to an existing scope. Raises: DuplicateDailyActivityError: the… (+6 more)

### Community 4 - "parse_scope_monitorings_csv"
Cohesion: 0.13
Nodes (30): csv, 6. Les adaptateurs entrants, CLI — `src/protab/project_admin.py`, CSV — `adapters/inbound/csv/scope_monitoring_csv_reader.py`, fastapi_responses, JSONResponse, Path, pathlib (+22 more)

### Community 5 - "OfficialCode"
Cohesion: 0.07
Nodes (41): argparse, getpass, protab_domain_value_objects_official_code, Grant permanent access to one project. Returns False if already set. The code…, OfficialCode, A single official identity, normalized the way login normalizes it.…, _add_admin(), _create_project() (+33 more)

### Community 6 - "DomainError"
Cohesion: 0.12
Nodes (25): DuplicateFeaiReferenceError, IncidentsExceedErrorsError, InvalidFeaiReferenceError, NegativeErrorsCountError, NegativeIncidentsCountError, Raised when incidents_created exceeds errors_reported., Raised when a FEAI reference does not match the expected format., Raised when a FEAI reference is duplicated within the same activity. (+17 more)

### Community 7 - "api.ts"
Cohesion: 0.09
Nodes (33): 3. Client HTTP — `services/api.ts`, AuditActivityHeatmap(), AuditActivityHeatmapProps, HOURS, intensityClass(), WEEKDAYS, SaveStatus, ValueSnapshot (+25 more)

### Community 8 - "AuditEvent"
Cohesion: 0.06
Nodes (45): contextvars, protab_adapters_outbound_persistence_in_memory_audit_trail_repository, protab_adapters_outbound_persistence_postgres_audit_trail_repository, project_context(), InMemoryAuditTrailRepository, PostgresAuditTrailRepository, Open the connection pool and apply the (idempotent) schema., Close the connection pool, releasing database connections. (+37 more)

### Community 9 - "Officials"
Cohesion: 0.12
Nodes (25): KnowledgeBase, Officials, build_scope(), fixture_scope_monitoring(), fixture, parametrize, Adding a DailyActivity for a new day should succeed., Adding a second DailyActivity for the same day should raise… (+17 more)

### Community 10 - "api_test.py"
Cohesion: 0.08
Nodes (16): client(), create_scope_via_api(), make_scope_with_activity(), fixture, test_complete_daily_activities_returns_204(), test_complete_day_without_activity_returns_404(), test_create_daily_activity_duplicate_day_returns_409(), test_create_daily_activity_invalid_invariant_returns_400() (+8 more)

### Community 11 - "schemas.py"
Cohesion: 0.22
Nodes (13): BaseModel, field_validator, pydantic, ActivityResponse, AuditEventResponse, CompleteRequest, CreateActivityRequest, CreateScopeItem (+5 more)

### Community 12 - "empty_database"
Cohesion: 0.15
Nodes (13): empty_database(), A project must never be created without someone able to enter it. Once it owns…, Both secrets are missing: the message must name the one resolved first.…, The secrets are only needed to seed; a restart must not require them. Requiring…, The seeded administrator must be usable as a login right away., Create the schema, then drop every project so a bootstrap is pending., Seeding the first project demands an explicit, non-guessable password. No…, test_bootstrap_grants_the_configured_admin_code() (+5 more)

### Community 13 - "FakeAuthRepository"
Cohesion: 0.16
Nodes (11): AuthSession, FakeAuthRepository, login_and_read_session_cookie(), test_authenticated_routes_require_a_valid_session(), test_in_memory_application_remains_unauthenticated_for_existing_fixtures(), test_login_rejects_invented_quadrigramme_when_known_codes_exist(), test_project_settings_are_authenticated_and_project_scoped(), test_project_settings_reject_invalid_weekday() (+3 more)

### Community 14 - "useToast.tsx"
Cohesion: 0.11
Nodes (14): FeaiTagInput(), FeaiTagInputProps, UndoEntry, undoTitle(), ToastAction, ToastActionsContext, ToastActionsType, ToastContextType (+6 more)

### Community 15 - "ExportModal.tsx"
Cohesion: 0.22
Nodes (14): ExportModal(), ExportModalProps, ScopeBase, ScopeDetailChartsProps, ScopeMonitoring, buildExportRows(), CsvSeparator, downloadFile() (+6 more)

### Community 16 - "protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository"
Cohesion: 0.17
Nodes (13): APIRoute, fastapi_routing, fastapi_testclient, protab_adapters_inbound_api_app, protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository, test_daily_activity_full_flow_over_http(), business_routes(), Business routes must be authenticated by default (allowlist, not denylist).… (+5 more)

### Community 17 - "vitest"
Cohesion: 0.10
Nodes (15): react-router-dom, @testing-library/jest-dom, @testing-library/react, vitest, AuditShortcut(), ToastProvider(), defaultFrom, renderModal() (+7 more)

### Community 18 - "DailyActivity"
Cohesion: 0.15
Nodes (18): 3. Le domaine, DailyActivity, test_daily_activity_creation_valid(), test_daily_activity_duplicate_feai_rejected(), test_daily_activity_errors_reported_negative(), test_daily_activity_incidents_created_negative(), test_daily_activity_incidents_exceed_errors(), test_daily_activity_invalid_feai_format() (+10 more)

### Community 19 - "postgres_scope_monitoring_repository_test.py"
Cohesion: 0.08
Nodes (33): reset_current_project(), set_current_project(), make_scope(), project_context(), date, fixture, Integration tests for the PostgreSQL repository adapter. These tests exercise…, Every read and write is tenant-scoped: name the project under test. The… (+25 more)

### Community 20 - "api_config_test.py"
Cohesion: 0.12
Nodes (20): 3. Configuration, dotenv, os, protab_adapters_inbound_api_config, cookie_secure_from_env(), host_port_from_env(), InvalidPortError, Exception (+12 more)

### Community 21 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+11 more)

### Community 22 - "queries_test.py"
Cohesion: 0.17
Nodes (13): protab_application_queries_get_daily_activity, protab_application_queries_get_scope, protab_application_queries_list_scopes, GetDailyActivityUseCase, ListScopesUseCase, make_scope(), test_get_daily_activity_day_not_found_raises(), test_get_daily_activity_found() (+5 more)

### Community 23 - "ScopeListPage.tsx"
Cohesion: 0.11
Nodes (29): 6. Le modèle mono-jour, Recherche : le responsable passe avant le suppléant, Badge(), BadgeProps, CompleteTodayButton(), CompleteTodayButtonProps, QuickFilter, ScopeListPage() (+21 more)

### Community 24 - "InMemoryScopeMonitoringRepository"
Cohesion: 0.24
Nodes (11): InMemoryScopeMonitoringRepository, date, CreateDailyActivityUseCase, make_command(), make_scope(), make_scope_daily_activity(), test_create_daily_activity(), test_create_duplicate_day_raises_and_persists_nothing() (+3 more)

### Community 25 - "Rule Categories by Priority (1-10)"
Cohesion: 0.20
Nodes (12): Design Dials (variance / motion / density), Design System Generation (--design-system), Design System Persistence (Master + Overrides), Pre-Delivery UI Checklist, Search Query Contract, Rule Categories by Priority (1-10), ui-ux-pro-max Search Script, Stack Detection Step (+4 more)

### Community 26 - "La CLI `protab-project`"
Cohesion: 0.06
Nodes (34): 10. En Docker, 11. Voir aussi, 1. Ce que la CLI fait, et ce qu'elle ne fait pas, 2. Prérequis, 3. Inventaire des commandes, 4. Les mots de passe, 5. Qui peut se connecter, 6. Pourquoi nommer un administrateur (+26 more)

### Community 27 - "Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring)"
Cohesion: 0.20
Nodes (11): Avoid Premature Abstraction, SOLID Principles, Aggregate Owns DailyActivities Indexed by Day, Atomic ScopeMonitoring Creation, CSV Import Inbound Adapter, DailyActivity (Entity), Day Is Not a Class (datetime.date as value object), Domain Invariants (counters, FEAI format, completion implication) (+3 more)

### Community 28 - "pytest"
Cohesion: 0.50
Nodes (3): pytest, Tenant isolation must fail closed when no project context is established. A…, test_raises_when_no_context_is_established()

### Community 29 - "update_daily_activity_test.py"
Cohesion: 0.13
Nodes (22): 10. Cycle de vie d'une écriture, 5. La couche application, handle_create_daily_activity(), handle_update_daily_activity(), current_actor(), CreateDailyActivityCommand, UpdateDailyActivityCommand, UpdateDailyActivityUseCase (+14 more)

### Community 30 - "FastAPI & PostgreSQL Performance Optimizer Skill"
Cohesion: 0.22
Nodes (10): Caching Layer & Background Task Offloading, Connection Pooling Parameters, Database Indexing Strategy, Diagnostic & Audit Checklist, Event Loop Stall Detection, FastAPI & PostgreSQL Performance Optimizer Skill, N+1 Query Pattern Detection, Payload & Serialization Optimization (+2 more)

### Community 31 - "complete_daily_activity_test.py"
Cohesion: 0.40
Nodes (11): CompleteDailyActivityCommand, CompleteDailyActivityUseCase, make_activity(), make_scope(), All days are resolved before anything is written. Completing day 1 then failing…, test_complete_day_without_activity_raises(), test_complete_does_not_touch_earlier_days_when_a_later_day_is_missing(), test_complete_multiple_days() (+3 more)

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
Cohesion: 0.12
Nodes (28): Integration tests for the ``protab-project`` administrative command. The…, The whole point: the code belongs to the project, not to a scope., ``MLOZ/MRAM`` is the scope list form; as an admin it could never be matched by…, The command must close the sessions it orphans. Whether a removed administrator…, Removing it would leave nobody able to open the project again., The historical form stays valid, but it must not fail silently., Rotating a leaked password must not leave old sessions usable., run() (+20 more)

### Community 36 - "create_app"
Cohesion: 0.14
Nodes (17): API — `adapters/inbound/api/`, build_repository(), create_app(), complete_daily_activities(), create_scope_monitorings(), import_scope_monitorings_csv(), logout(), create_default_app() (+9 more)

### Community 37 - "Development Workflow (9 Steps)"
Cohesion: 0.40
Nodes (6): Definition of Done Checklist, Development Workflow (9 Steps), Documentation Synchronization Requirement, Graphify Knowledge Graph Workflow, Test-Driven Development (RED/GREEN/REFACTOR), Testing Strategy (Test Pyramid)

### Community 38 - "add_scope"
Cohesion: 0.14
Nodes (14): add_scope(), ``official_main`` encodes several codes just like ``official_backup``., ``?`` marks the absence of a backup official, it is not a code., ``authenticate()`` only runs at login, so a removed administrator would keep a…, test_a_code_in_no_scope_and_no_admin_list_is_refused(), test_admin_code_is_normalized_like_a_scope_code(), test_backup_placeholder_is_not_a_login_code(), test_backup_split_form_auths_both_codes() (+6 more)

### Community 40 - "CreateScopeMonitoringUseCase"
Cohesion: 0.53
Nodes (8): CreateScopeMonitoringUseCase, make_command(), test_create_blank_billing_code_raises_and_writes_nothing(), test_create_duplicate_name_raises_and_persists_nothing(), test_create_empty_official_raises(), test_create_invalid_knowledge_base_id_raises(), test_create_multiple_scope_monitorings(), test_create_stores_the_billing_code()

### Community 72 - "build_connection_pool"
Cohesion: 0.17
Nodes (9): ConnectionPool, psycopg, psycopg_pool, build_connection_pool(), ping_check(), Connection, Shared PostgreSQL connection-pool configuration for persistence adapters., Check connectivity and leave the connection outside a transaction. (+1 more)

### Community 73 - "PostgresAuthRepository"
Cohesion: 0.18
Nodes (6): _hash_password(), _normalize_non_working_days(), PostgresAuthRepository, Project, Store project credentials and opaque, expiring session tokens., Replace the password of an existing project and drop its sessions. Rotating a…

### Community 74 - "postgres_auth_repository_test.py"
Cohesion: 0.12
Nodes (7): Integration tests for the PostgreSQL auth repository rule: the quadrigramme…, Naming an administrator is what makes creating the first scope safe. The…, A code the login screen refuses would lock the administrator out., ``project_admins`` cascades, or a recycled project code would inherit the…, test_add_admin_rejects_an_unusable_code(), test_admin_authenticates_before_the_first_scope_is_created(), test_admins_disappear_with_their_project()

### Community 75 - "app.py"
Cohesion: 0.13
Nodes (15): protab_adapters_inbound_api_auth, protab_adapters_inbound_api_errors, protab_adapters_inbound_api_schemas, protab_application_queries_list_audit_events, protab_application_use_cases_complete_daily_activity, protab_application_use_cases_create_daily_activity, protab_application_use_cases_create_scope_monitoring, protab_application_use_cases_update_daily_activity (+7 more)

### Community 76 - "_official_codes"
Cohesion: 0.29
Nodes (9): _official_codes(), Quadrigrammes declared by one ``officials`` column (format « A/B »).…, Parsing of the officials columns that gate the quadrigramme. Both…, ``MRAM/ ?`` means "MRAM, no backup": ``?`` is not a quadrigramme., test_handles_empty_and_none(), test_ignores_punctuation_only_parts(), test_placeholder_is_not_a_code(), test_splits_multiple_codes() (+1 more)

### Community 78 - "add_scope_for"
Cohesion: 0.50
Nodes (4): add_scope_for(), Give one project a scope, switching the tenant the adapter reads. Both tenants…, An administrator of A is nobody in B. ``GET /projects`` is unauthenticated, so…, test_admin_is_scoped_to_its_own_project()

### Community 79 - "postgres_auth_bootstrap_test.py"
Cohesion: 0.21
Nodes (13): Return the quadrigramme seeding the first project's administrator. Same fail-…, Return the password seeding the first project, or refuse to start. Called only…, resolve_bootstrap_admin_code(), resolve_bootstrap_password(), The bootstrap secrets must never fall back to a hardcoded default. A missing…, test_admin_code_trims_surrounding_whitespace(), test_blank_admin_code_raises(), test_blank_variable_raises() (+5 more)

### Community 80 - "_normalize_code"
Cohesion: 0.29
Nodes (4): _check_password(), _normalize_code(), Whether a quadrigramme is an administrator of that one project. Normalization…, Revoke permanent access and drop the sessions it had opened. ``authenticate()``…

### Community 81 - "current_user"
Cohesion: 0.16
Nodes (17): fastapi, protab_adapters_outbound_persistence_postgres_auth_repository, Response, get_project_settings(), list_projects(), login(), me(), update_project_settings() (+9 more)

### Community 82 - "Tally plutôt qu'un tableur"
Cohesion: 0.29
Nodes (6): Ce qu'un tableur fait mieux, Ce que coûte un tableur partagé, Ce que Tally change, En résumé, Quand ne pas migrer, Tally plutôt qu'un tableur

### Community 83 - "ScopeDetailPage.tsx"
Cohesion: 0.12
Nodes (29): 6. Tests frontend, Pièges propres à cette suite, recharts, ActivityFormModal(), BillingCodeBadge(), BillingCodeBadgeProps, DashboardCharts(), DateNavigator() (+21 more)

### Community 84 - "ScopeMonitoring"
Cohesion: 0.10
Nodes (5): date, ScopeMonitoring, Return the ScopeMonitoring with the given name, or None., date, RecordingScopeMonitoringRepository

### Community 85 - "datetime"
Cohesion: 0.10
Nodes (20): dataclasses, datetime, protab_adapters_outbound_persistence_postgres_scope_monitoring_repository, protab_application_actor_context, protab_application_commands_daily_activity, protab_domain_entities_audit_event, protab_domain_entities_daily_activity, protab_domain_entities_scope_monitoring (+12 more)

### Community 86 - "project"
Cohesion: 0.40
Nodes (5): bootstrap_password(), project(), fixture, The bootstrap secrets are mandatory: no default is provided.…, scopes()

### Community 87 - "project_admin_cli_test.py"
Cohesion: 0.20
Nodes (14): protab, parametrize, ``protab-project --help`` must list the subcommands. The dispatcher resolves…, ``protab-project <code> <nom>`` predates the subcommands and stays valid., A bare invocation is still an error. Turning it into a success would make a…, The inventory must not swallow the per-subcommand argparse help., run_cli(), test_a_subcommand_without_its_arguments_still_errors() (+6 more)

### Community 88 - "InlineActivityCounters.tsx"
Cohesion: 0.20
Nodes (10): 7. Saisie et autosave, ActivityFormModalProps, CompleteActivitiesModalProps, InlineActivityCounters(), InlineActivityCountersProps, SaveStatus, ValueSnapshot, TodayActivityEditorProps (+2 more)

### Community 89 - "Développement"
Cohesion: 0.14
Nodes (13): 11. Où aller quand…, 10. Publier une modification — liste de contrôle, 12. Documents voisins, 1. Prérequis, 2. Installation, 4. Démarrage en développement, 5. Base de données : pas d'outil de migration, 6. Tests (+5 more)

### Community 92 - "Architecture"
Cohesion: 0.18
Nodes (9): 12. Documents voisins, 1. Ce que fait l'application, 7. Les adaptateurs sortants, 9. Modèle de données, Architecture, Exception, DuplicateDailyActivityError, Raised when a ScopeMonitoring already has a DailyActivity for the given day. (+1 more)

### Community 93 - "Tests"
Cohesion: 0.15
Nodes (13): 1. Vue d'ensemble, 2. Tests unitaires — `tests/unit/`, 3. Tests d'intégration — `tests/integration/adapters/`, 4. Test E2E — `tests/e2e/`, 5. Ce que ces tests ne prouvent pas, 7. Écrire un nouveau test, 8. Documents voisins, Adaptateurs — `tests/unit/adapters/` (+5 more)

### Community 94 - "Frontend"
Cohesion: 0.22
Nodes (9): 10. Ce qui n'existe pas, 11. Build et déploiement, 12. Documents voisins, 1. Pile technique, 2. Arborescence, 4. Chemins et routage, 8. Graphiques et styles, 9. Tests (+1 more)

### Community 95 - "dependencies"
Cohesion: 0.20
Nodes (10): dependencies, lucide-react, react, react-dom, react-router-dom, recharts, tailwindcss, @tailwindcss/vite (+2 more)

### Community 96 - "AppSessionLoss.test.tsx"
Cohesion: 0.25
Nodes (7): react-dom, App(), src_frontend_src_index, json(), PROJECT, SESSION, stubFetch()

### Community 97 - "devDependencies"
Cohesion: 0.22
Nodes (9): devDependencies, jsdom, @testing-library/jest-dom, @testing-library/react, @types/node, @types/react, @types/react-dom, typescript (+1 more)

### Community 100 - "postgres_auth_repository.py"
Cohesion: 0.25
Nodes (6): hashlib, hmac, protab_adapters_outbound_persistence_postgres_pool, secrets, PostgreSQL persistence for projects and login sessions., test_build_connection_pool_uses_tuned_configuration()

### Community 101 - "graphify.js"
Cohesion: 0.25
Nodes (5): IMPORTANT: keep the reminder string free of backticks and $(...) constructs., ref_fs, ref_path, @tailwindcss/vite, @vitejs/plugin-react

### Community 102 - "Audit Trail (best-effort mutation journal)"
Cohesion: 0.40
Nodes (6): Adapters (Inbound / Outbound), Domain Error Handling and Adapter Translation, Audit Trail (best-effort mutation journal), Domain Error to HTTP Status Mapping, REST Routes and Status Codes Table, React Root Mount (#root)

### Community 103 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, preview, test

### Community 104 - "NonWorkingDays"
Cohesion: 0.33
Nodes (6): DashboardChartsProps, WorkingDaysModalProps, LoginPageProps, ScopeListPageProps, Project, NonWorkingDays

### Community 105 - "DailyActivityNotFoundError"
Cohesion: 0.40
Nodes (3): date, DailyActivityNotFoundError, Raised when a DailyActivity cannot be found for the given day.

### Community 106 - "repository"
Cohesion: 0.50
Nodes (4): 2. Vue d'ensemble des couches, bootstrap_password(), fixture, repository()

### Community 107 - "4. Les ports"
Cohesion: 0.50
Nodes (4): 4. Les ports, Absence de port pour l'authentification, Port d'audit — `ports/outbound/audit_trail_repository.py`, Port de périmètre — `ports/outbound/scope_monitoring_repository.py`

### Community 108 - "MissingProjectContextError"
Cohesion: 0.50
Nodes (4): 8. Multi-tenant : le mécanisme à comprendre avant toute modification, RuntimeError, MissingProjectContextError, No authenticated request established the project to read or write.

## Ambiguous Edges - Review These
- `React Root Mount (#root)` → `Audit Trail (best-effort mutation journal)`  [AMBIGUOUS]
  src/FrontEnd/index.html · relation: conceptually_related_to

## Knowledge Gaps
- **175 isolated node(s):** `$schema`, `plugin`, `protab`, `name`, `private` (+170 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 445 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **38 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `React Root Mount (#root)` and `Audit Trail (best-effort mutation journal)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Tests` connect `Tests` to `ScopeDetailPage.tsx`, `architecture.md`?**
  _High betweenness centrality (0.293) - this node is a cross-community bridge._
- **Why does `6. Tests frontend` connect `ScopeDetailPage.tsx` to `App.tsx`, `api.ts`, `useToast.tsx`, `ExportModal.tsx`, `vitest`, `ScopeListPage.tsx`, `Tests`?**
  _High betweenness centrality (0.286) - this node is a cross-community bridge._
- **Why does `InMemoryScopeMonitoringRepository` connect `InMemoryScopeMonitoringRepository` to `AuditEvent`, `CreateScopeMonitoringUseCase`, `repository`, `api_test.py`, `FakeAuthRepository`, `protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository`, `DailyActivity`, `update_daily_activity_test.py`, `ScopeMonitoring`, `datetime`, `queries_test.py`, `Tests`, `complete_daily_activity_test.py`?**
  _High betweenness centrality (0.167) - this node is a cross-community bridge._
- **Are the 53 inferred relationships involving `DailyActivity` (e.g. with `_activity_to_response()` and `InMemoryScopeMonitoringRepository`) actually correct?**
  _`DailyActivity` has 53 INFERRED edges - model-reasoned connections that need verification._
- **Are the 50 inferred relationships involving `create_app()` (e.g. with `API — `adapters/inbound/api/`` and `close_persistence()`) actually correct?**
  _`create_app()` has 50 INFERRED edges - model-reasoned connections that need verification._
- **Are the 51 inferred relationships involving `InMemoryScopeMonitoringRepository` (e.g. with `2. Vue d'ensemble des couches` and `5. Ce que ces tests ne prouvent pas`) actually correct?**
  _`InMemoryScopeMonitoringRepository` has 51 INFERRED edges - model-reasoned connections that need verification._