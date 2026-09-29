# Graph Report - ProTab  (2026-09-29)

## Corpus Check
- 162 files · ~64,326 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 8, .example 1, .conf 1)

## Summary
- 1242 nodes · 2778 edges · 92 communities (56 shown, 36 thin omitted)
- Extraction: 81% EXTRACTED · 19% INFERRED · 0% AMBIGUOUS · INFERRED: 522 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cd5da4f4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.tsx
- PostgresScopeMonitoringRepository
- package.json
- useTheme.tsx
- scope_monitoring_csv_reader_test.py
- OfficialCode
- DomainError
- api.ts
- AuditEvent
- Officials
- api_test.py
- create_app
- empty_database
- FakeAuthRepository
- ScopeFormModal.tsx
- ExportModal.tsx
- protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository
- useToast.tsx
- DailyActivity
- postgres_scope_monitoring_repository_test.py
- project_admin.py
- compilerOptions
- ScopeMonitoringRepository
- ScopeListPage.tsx
- create_daily_activity_test.py
- Rule Categories by Priority (1-10)
- La CLI `protab-project`
- DailyActivity (Entity)
- audit_log_api_test.py
- update_daily_activity_test.py
- FastAPI & PostgreSQL Performance Optimizer Skill
- complete_daily_activity_test.py
- Hexagonal Architecture (Ports and Adapters)
- PostgresScopeMonitoringRepository
- api Service (FastAPI backend)
- project_admin_test.py
- Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring)
- Development Workflow (9 Steps)
- add_scope
- opencode.json
- CreateScopeMonitoringUseCase
- Application Layer / Use Cases
- protab
- build_connection_pool
- PostgresAuthRepository
- postgres_auth_repository_test.py
- set_current_project
- _official_codes
- ProTab Project Documentation
- add_scope_for
- postgres_auth_bootstrap_test.py
- postgres_auth_repository.py
- protab_adapters_outbound_persistence_postgres_auth_repository
- Tally plutôt qu'un tableur
- ScopeDetailPage.tsx
- InMemoryScopeMonitoringRepository
- app.py
- fixture
- pytest
- test_main_split_form_auths_both_codes
- test_backup_placeholder_is_not_a_login_code
- test_creating_a_project_twice_reports_the_duplicate
- test_admin_alongside_scope_officials

## God Nodes (most connected - your core abstractions)
1. `DailyActivity` - 74 edges
2. `create_app()` - 69 edges
3. `InMemoryScopeMonitoringRepository` - 58 edges
4. `ScopeMonitoring` - 47 edges
5. `PostgresAuthRepository` - 31 edges
6. `ScopeMonitoringRepository` - 28 edges
7. `PostgresScopeMonitoringRepository` - 27 edges
8. `react` - 26 edges
9. `AuditEvent` - 25 edges
10. `useToast()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `Centralized PostgreSQL Pool Configuration` --semantically_similar_to--> `Connection Pooling Parameters`  [INFERRED] [semantically similar]
  AGENTS.md → .opencode/skills/improve-performances/SKILL.md
- `test_build_connection_pool_uses_tuned_configuration()` --calls--> `build_connection_pool()`  [INFERRED]
  tests/unit/adapters/postgres_pool_test.py → src/protab/adapters/outbound/persistence/postgres_pool.py
- `test_audit_event_defaults()` --uses--> `AuditEvent`  [INFERRED]
  tests/unit/domain/audit_event_test.py → src/protab/domain/entities/audit_event.py
- `Day Is Not a Class (datetime.date as value object)` --semantically_similar_to--> `Avoid Premature Abstraction`  [INFERRED] [semantically similar]
  README.md → AGENTS.md
- `scope_monitorings(project_id, name) Index` --semantically_similar_to--> `Database Indexing Strategy`  [INFERRED] [semantically similar]
  README.md → .opencode/skills/improve-performances/SKILL.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **ProTab Mutation → Audit Trail Flow** — readme_mutation_use_cases, readme_audit_trail, readme_domain_invariants, readme_domain_error_http_mapping, readme_rest_routes_table [INFERRED 0.85]
- **ProTab PostgreSQL Persistence Path (port → adapter → pool → container)** — agents_scopemonitoringrepository_port, agents_postgres_scopemonitoringrepository, agents_idempotent_schema_bootstrap, agents_postgres_pool_configuration, readme_postgres_persistence, readme_scope_monitorings_index, docker_compose_db_service, docker_compose_api_service [INFERRED 0.85]
- **ProTab Hexagonal Core and Its Adapters** — agents_hexagonal_architecture, readme_scope_monitoring_aggregate, readme_mutation_use_cases, agents_scopemonitoringrepository_port, readme_http_api_adapter, readme_csv_import_adapter, readme_postgres_persistence [INFERRED 0.95]

## Communities (92 total, 36 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.11
Nodes (30): lucide-react, react, react-dom, react-router-dom, App(), AuditShortcut(), CsvImportModal(), CsvImportModalProps (+22 more)

### Community 1 - "PostgresScopeMonitoringRepository"
Cohesion: 0.15
Nodes (10): PostgresScopeMonitoringRepository, Connection, date, Exception, Persist ``ScopeMonitoring`` aggregates in PostgreSQL. The schema is applied…, Open the connection pool and apply the (idempotent) schema., Close the connection pool, releasing database connections., Return the current project id, or refuse to touch the database. Every read and… (+2 more)

### Community 2 - "package.json"
Cohesion: 0.05
Nodes (41): IMPORTANT: keep the reminder string free of backticks and $(...) constructs., ref_fs, jsdom, ref_path, tailwindcss, @tailwindcss/vite, @types/node, @types/react (+33 more)

### Community 3 - "useTheme.tsx"
Cohesion: 0.27
Nodes (8): src_frontend_src_assets_layered_waves_dark, src_frontend_src_assets_layered_waves_light, LoginBackground(), Theme, ThemeContext, ThemeContextType, ThemeProvider(), useTheme()

### Community 4 - "scope_monitoring_csv_reader_test.py"
Cohesion: 0.15
Nodes (26): csv, fastapi_responses, JSONResponse, Path, pathlib, protab_adapters_inbound_csv_scope_monitoring_csv_reader, protab_application_commands_create_scope_monitoring, bad_request() (+18 more)

### Community 5 - "OfficialCode"
Cohesion: 0.11
Nodes (24): Grant permanent access to one project. Returns False if already set. The code…, OfficialCode, A single official identity, normalized the way login normalizes it.…, ``OfficialCode`` is the single-code form of an official identity. A project…, Only the ends are noise; a space inside is part of the identity., ``LoginRequest.quadrigramme`` allows two characters, so we must too., ``A/B`` is the Officials form; as an admin code it could never be typed back as…, ``?`` means "no backup official" in the scope columns; it is not a code. (+16 more)

### Community 6 - "DomainError"
Cohesion: 0.08
Nodes (38): current_actor(), date, build_changes(), Return only the fields whose value differs between ``before`` and ``after``.…, DuplicateFeaiReferenceError, IncidentsExceedErrorsError, InvalidFeaiReferenceError, NegativeErrorsCountError (+30 more)

### Community 7 - "api.ts"
Cohesion: 0.12
Nodes (23): AuditActivityHeatmap(), AuditActivityHeatmapProps, HOURS, intensityClass(), WEEKDAYS, ApiError, AuthSession, notifyUnauthorized() (+15 more)

### Community 8 - "AuditEvent"
Cohesion: 0.11
Nodes (20): protab_adapters_outbound_persistence_postgres_audit_trail_repository, InMemoryAuditTrailRepository, PostgresAuditTrailRepository, Open the connection pool and apply the (idempotent) schema., Close the connection pool, releasing database connections., current_project_id(), ListAuditEventsUseCase, AuditEvent (+12 more)

### Community 9 - "Officials"
Cohesion: 0.13
Nodes (18): KnowledgeBase, Officials, fixture_scope_monitoring(), fixture, Adding a second DailyActivity for the same day should raise…, Multiple DailyActivities for different days should be allowed., Different ScopeMonitoring instances can have activities on the same day., Adding a DailyActivity for a new day should succeed. (+10 more)

### Community 10 - "api_test.py"
Cohesion: 0.09
Nodes (16): client(), create_scope_via_api(), make_scope_with_activity(), fixture, test_complete_daily_activities_returns_204(), test_complete_day_without_activity_returns_404(), test_create_daily_activity_duplicate_day_returns_409(), test_create_daily_activity_invalid_invariant_returns_400() (+8 more)

### Community 11 - "create_app"
Cohesion: 0.08
Nodes (42): BaseModel, field_validator, pydantic, Response, _activity_to_response(), _audit_event_to_response(), create_app(), create_scope_monitorings() (+34 more)

### Community 12 - "empty_database"
Cohesion: 0.15
Nodes (13): empty_database(), A project must never be created without someone able to enter it. Once it owns…, Both secrets are missing: the message must name the one resolved first.…, The secrets are only needed to seed; a restart must not require them. Requiring…, The seeded administrator must be usable as a login right away., Create the schema, then drop every project so a bootstrap is pending., Seeding the first project demands an explicit, non-guessable password. No…, test_bootstrap_grants_the_configured_admin_code() (+5 more)

### Community 13 - "FakeAuthRepository"
Cohesion: 0.19
Nodes (11): Project, FakeAuthRepository, login_and_read_session_cookie(), test_authenticated_routes_require_a_valid_session(), test_in_memory_application_remains_unauthenticated_for_existing_fixtures(), test_login_rejects_invented_quadrigramme_when_known_codes_exist(), test_project_settings_are_authenticated_and_project_scoped(), test_project_settings_reject_invalid_weekday() (+3 more)

### Community 14 - "ScopeFormModal.tsx"
Cohesion: 0.29
Nodes (8): ScopeFormModal(), ScopeFormModalProps, ScopeItemState, CreateScopeInput, ActivityValidationErrors, FEAI_REGEX, ScopeValidationErrors, validateScopeForm()

### Community 15 - "ExportModal.tsx"
Cohesion: 0.13
Nodes (23): DateNavigator(), DateNavigatorProps, formatDayMonthFr(), formatWeekdayFr(), shiftDay(), ExportModal(), ScopeBase, defaultFrom (+15 more)

### Community 16 - "protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository"
Cohesion: 0.17
Nodes (13): APIRoute, fastapi_routing, fastapi_testclient, protab_adapters_inbound_api_app, protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository, test_daily_activity_full_flow_over_http(), business_routes(), Business routes must be authenticated by default (allowlist, not denylist).… (+5 more)

### Community 17 - "useToast.tsx"
Cohesion: 0.08
Nodes (22): @testing-library/jest-dom, @testing-library/react, vitest, ScopeDetailCharts(), ToastContainer(), ToastAction, ToastActionsContext, ToastActionsType (+14 more)

### Community 18 - "DailyActivity"
Cohesion: 0.11
Nodes (20): DailyActivity, date, Add one activity to an existing scope. Raises: DuplicateDailyActivityError: the…, Overwrite the counters of a single day, leaving the others alone. The…, test_daily_activity_creation_valid(), test_daily_activity_duplicate_feai_rejected(), test_daily_activity_errors_reported_negative(), test_daily_activity_incidents_created_negative() (+12 more)

### Community 19 - "postgres_scope_monitoring_repository_test.py"
Cohesion: 0.12
Nodes (22): make_scope(), date, Integration tests for the PostgreSQL repository adapter. These tests exercise…, No project context must raise, never fall back to a default tenant., seed_three_days(), test_adapters_refuse_to_read_or_write_without_project_context(), test_find_all_loads_activities_for_all_scopes(), test_find_all_returns_only_the_requesting_project_scopes() (+14 more)

### Community 20 - "project_admin.py"
Cohesion: 0.08
Nodes (39): argparse, dotenv, getpass, os, protab_adapters_inbound_api_config, build_repository(), Select the persistence adapter from configuration. PostgreSQL is required for…, cookie_secure_from_env() (+31 more)

### Community 21 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+11 more)

### Community 22 - "ScopeMonitoringRepository"
Cohesion: 0.09
Nodes (13): GetScopeUseCase, AuditTrailRepository, Protocol, Persist an audit event., date, Protocol, Persist the given ScopeMonitoring. Replaces the whole aggregate: the scope row…, Flag the given days as handled and completed. Counters are never modified, and… (+5 more)

### Community 23 - "ScopeListPage.tsx"
Cohesion: 0.11
Nodes (29): recharts, CompleteTodayButton(), CompleteTodayButtonProps, DashboardCharts(), DashboardChartsProps, ExportModalProps, ScopeDetailChartsProps, ScopeDetailCharts (+21 more)

### Community 24 - "create_daily_activity_test.py"
Cohesion: 0.35
Nodes (12): CreateDailyActivityUseCase, make_scope_with_activity(), test_create_activity_records_audit_event(), test_no_repository_keeps_working_without_audit(), make_command(), make_scope(), make_scope_daily_activity(), test_create_daily_activity() (+4 more)

### Community 25 - "Rule Categories by Priority (1-10)"
Cohesion: 0.20
Nodes (12): Design Dials (variance / motion / density), Design System Generation (--design-system), Design System Persistence (Master + Overrides), Pre-Delivery UI Checklist, Search Query Contract, Rule Categories by Priority (1-10), ui-ux-pro-max Search Script, Stack Detection Step (+4 more)

### Community 26 - "La CLI `protab-project`"
Cohesion: 0.12
Nodes (16): 10. Voir aussi, 1. Ce que la CLI fait, et ce qu'elle ne fait pas, 2. Prérequis, 3. Inventaire des commandes, 4. Les mots de passe, 5. Qui peut se connecter, 6. Pourquoi nommer un administrateur, 7. Erreurs et dépannage (+8 more)

### Community 27 - "DailyActivity (Entity)"
Cohesion: 0.33
Nodes (6): Avoid Premature Abstraction, SOLID Principles, CSV Import Inbound Adapter, DailyActivity (Entity), Day Is Not a Class (datetime.date as value object), Domain Invariants (counters, FEAI format, completion implication)

### Community 28 - "audit_log_api_test.py"
Cohesion: 0.16
Nodes (15): contextvars, Per-request audit context. Mirrors the ``_CURRENT_PROJECT_ID`` ContextVar…, reset_current_actor(), set_current_actor(), all_events(), clear_actor(), env(), make_scope_with_activity() (+7 more)

### Community 29 - "update_daily_activity_test.py"
Cohesion: 0.38
Nodes (11): handle_update_daily_activity(), UpdateDailyActivityCommand, UpdateDailyActivityUseCase, test_update_activity_records_audit_event_with_diff(), make_scope_with_activity(), A PATCH must not rewrite the whole scope. Rewriting the aggregate persists…, test_update_daily_activity(), test_update_day_without_activity_raises() (+3 more)

### Community 30 - "FastAPI & PostgreSQL Performance Optimizer Skill"
Cohesion: 0.22
Nodes (10): Caching Layer & Background Task Offloading, Connection Pooling Parameters, Database Indexing Strategy, Diagnostic & Audit Checklist, Event Loop Stall Detection, FastAPI & PostgreSQL Performance Optimizer Skill, N+1 Query Pattern Detection, Payload & Serialization Optimization (+2 more)

### Community 31 - "complete_daily_activity_test.py"
Cohesion: 0.35
Nodes (13): complete_daily_activities(), CompleteDailyActivityCommand, CompleteDailyActivityUseCase, test_complete_activity_records_audit_event_per_day(), make_activity(), make_scope(), All days are resolved before anything is written. Completing day 1 then failing…, test_complete_day_without_activity_raises() (+5 more)

### Community 32 - "Hexagonal Architecture (Ports and Adapters)"
Cohesion: 0.22
Nodes (9): Adapters (Inbound / Outbound), Dependency Injection and Composition Root, Dependency Rule (Adapters → Ports → Application → Domain), Domain Layer, Domain Error Handling and Adapter Translation, Framework Isolation, Hexagonal Architecture (Ports and Adapters), Ports (Inbound and Outbound Contracts) (+1 more)

### Community 33 - "PostgresScopeMonitoringRepository"
Cohesion: 0.31
Nodes (9): API Configuration via load_dotenv and os.getenv, Configuration and Secrets Management, Idempotent Schema Bootstrap (CREATE TABLE IF NOT EXISTS), InMemoryScopeMonitoringRepository, Centralized PostgreSQL Pool Configuration, PostgresScopeMonitoringRepository, ProTab Infrastructure Notes, ScopeMonitoringRepository Outbound Port (+1 more)

### Community 34 - "api Service (FastAPI backend)"
Cohesion: 0.19
Nodes (13): api Healthcheck (/healthz), api Service (FastAPI backend), db Healthcheck (pg_isready), db Service (postgres:17-alpine), Default Project Seeding Env Vars, ProTab Development Docker Stack, frontend Service (React/nginx build), pgdata Named Volume (+5 more)

### Community 35 - "project_admin_test.py"
Cohesion: 0.07
Nodes (45): protab, bootstrap_password(), fixture, Integration tests for the ``protab-project`` administrative command. The…, The whole point: the code belongs to the project, not to a scope., ``MLOZ/MRAM`` is the scope list form; as an admin it could never be matched by…, The command must close the sessions it orphans. Whether a removed administrator…, Removing it would leave nobody able to open the project again. (+37 more)

### Community 36 - "Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring)"
Cohesion: 0.33
Nodes (7): Audit Trail (best-effort mutation journal), Atomic ScopeMonitoring Creation, Domain Error to HTTP Status Mapping, Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring), Query Use Cases (ListScopes, GetScope, GetDailyActivity, ListAuditEvents), REST Routes and Status Codes Table, React Root Mount (#root)

### Community 37 - "Development Workflow (9 Steps)"
Cohesion: 0.40
Nodes (6): Definition of Done Checklist, Development Workflow (9 Steps), Documentation Synchronization Requirement, Graphify Knowledge Graph Workflow, Test-Driven Development (RED/GREEN/REFACTOR), Testing Strategy (Test Pyramid)

### Community 38 - "add_scope"
Cohesion: 0.14
Nodes (14): add_scope(), The rule the whole feature exists for. Without an administrator, creating the…, Permanent access is not a password bypass: the admin is one factor., ``authenticate()`` only runs at login, so a removed administrator would keep a…, test_a_code_in_no_scope_and_no_admin_list_is_refused(), test_admin_authenticates_although_it_belongs_to_no_scope(), test_admin_code_is_normalized_like_a_scope_code(), test_admin_still_needs_the_project_password() (+6 more)

### Community 40 - "CreateScopeMonitoringUseCase"
Cohesion: 0.40
Nodes (8): CreateScopeMonitoringCommand, CreateScopeMonitoringUseCase, test_create_scope_from_csv_records_import_action(), make_command(), test_create_duplicate_name_raises_and_persists_nothing(), test_create_empty_official_raises(), test_create_invalid_knowledge_base_id_raises(), test_create_multiple_scope_monitorings()

### Community 72 - "build_connection_pool"
Cohesion: 0.17
Nodes (9): ConnectionPool, psycopg, psycopg_pool, build_connection_pool(), ping_check(), Connection, Shared PostgreSQL connection-pool configuration for persistence adapters., Check connectivity and leave the connection outside a transaction. (+1 more)

### Community 73 - "PostgresAuthRepository"
Cohesion: 0.21
Nodes (5): _hash_password(), _normalize_non_working_days(), PostgresAuthRepository, Store project credentials and opaque, expiring session tokens., Replace the password of an existing project and drop its sessions. Rotating a…

### Community 74 - "postgres_auth_repository_test.py"
Cohesion: 0.12
Nodes (7): Integration tests for the PostgreSQL auth repository rule: the quadrigramme…, Naming an administrator is what makes creating the first scope safe. The…, A code the login screen refuses would lock the administrator out., ``project_admins`` cascades, or a recycled project code would inherit the…, test_add_admin_rejects_an_unusable_code(), test_admin_authenticates_before_the_first_scope_is_created(), test_admins_disappear_with_their_project()

### Community 75 - "set_current_project"
Cohesion: 0.22
Nodes (13): project_context(), reset_current_project(), set_current_project(), project(), project(), project_context(), fixture, A write must not reach across tenants, even on a known scope id. (+5 more)

### Community 76 - "_official_codes"
Cohesion: 0.29
Nodes (9): _official_codes(), Quadrigrammes declared by one ``officials`` column (format « A/B »).…, Parsing of the officials columns that gate the quadrigramme. Both…, ``MRAM/ ?`` means "MRAM, no backup": ``?`` is not a quadrigramme., test_handles_empty_and_none(), test_ignores_punctuation_only_parts(), test_placeholder_is_not_a_code(), test_splits_multiple_codes() (+1 more)

### Community 77 - "ProTab Project Documentation"
Cohesion: 0.33
Nodes (5): PostgreSQL Integration Tests (make test-db), Aggregate Owns DailyActivities Indexed by Day, Makefile Targets (db-up, docker-up, db-shell, test-db), ProTab Project Documentation, ScopeMonitoring (Root Aggregate)

### Community 78 - "add_scope_for"
Cohesion: 0.50
Nodes (4): add_scope_for(), Give one project a scope, switching the tenant the adapter reads. Both tenants…, An administrator of A is nobody in B. ``GET /projects`` is unauthenticated, so…, test_admin_is_scoped_to_its_own_project()

### Community 79 - "postgres_auth_bootstrap_test.py"
Cohesion: 0.21
Nodes (13): Return the quadrigramme seeding the first project's administrator. Same fail-…, Return the password seeding the first project, or refuse to start. Called only…, resolve_bootstrap_admin_code(), resolve_bootstrap_password(), The bootstrap secrets must never fall back to a hardcoded default. A missing…, test_admin_code_trims_surrounding_whitespace(), test_blank_admin_code_raises(), test_blank_variable_raises() (+5 more)

### Community 80 - "postgres_auth_repository.py"
Cohesion: 0.17
Nodes (9): hashlib, hmac, protab_domain_value_objects_official_code, secrets, _check_password(), _normalize_code(), PostgreSQL persistence for projects and login sessions., Whether a quadrigramme is an administrator of that one project. Normalization… (+1 more)

### Community 81 - "protab_adapters_outbound_persistence_postgres_auth_repository"
Cohesion: 0.20
Nodes (6): fastapi, protab_adapters_outbound_persistence_postgres_auth_repository, current_user(), CurrentUser, Request, AuthSession

### Community 82 - "Tally plutôt qu'un tableur"
Cohesion: 0.29
Nodes (6): Ce qu'un tableur fait mieux, Ce que coûte un tableur partagé, Ce que Tally change, En résumé, Quand ne pas migrer, Tally plutôt qu'un tableur

### Community 83 - "ScopeDetailPage.tsx"
Cohesion: 0.11
Nodes (29): ActivityFormModal(), ActivityFormModalProps, Badge(), BadgeProps, CompleteActivitiesModal(), CompleteActivitiesModalProps, FeaiTagInput(), FeaiTagInputProps (+21 more)

### Community 84 - "InMemoryScopeMonitoringRepository"
Cohesion: 0.07
Nodes (18): protab_application_queries_get_daily_activity, protab_application_queries_get_scope, protab_application_queries_list_scopes, InMemoryScopeMonitoringRepository, date, GetDailyActivityUseCase, ListScopesUseCase, ScopeMonitoring (+10 more)

### Community 85 - "app.py"
Cohesion: 0.07
Nodes (34): dataclasses, datetime, protab_adapters_inbound_api_auth, protab_adapters_inbound_api_errors, protab_adapters_inbound_api_schemas, protab_adapters_outbound_persistence_in_memory_audit_trail_repository, protab_adapters_outbound_persistence_postgres_pool, protab_adapters_outbound_persistence_postgres_scope_monitoring_repository (+26 more)

### Community 86 - "fixture"
Cohesion: 0.50
Nodes (4): bootstrap_password(), fixture, The bootstrap secrets are mandatory: no default is provided.…, scopes()

### Community 87 - "pytest"
Cohesion: 0.29
Nodes (6): pytest, RuntimeError, MissingProjectContextError, No authenticated request established the project to read or write., Tenant isolation must fail closed when no project context is established. A…, test_raises_when_no_context_is_established()

## Ambiguous Edges - Review These
- `React Root Mount (#root)` → `Audit Trail (best-effort mutation journal)`  [AMBIGUOUS]
  src/FrontEnd/index.html · relation: conceptually_related_to

## Knowledge Gaps
- **134 isolated node(s):** `$schema`, `plugin`, `protab`, `name`, `private` (+129 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 400 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **36 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `React Root Mount (#root)` and `Audit Trail (best-effort mutation journal)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `create_app()` connect `create_app` to `scope_monitoring_csv_reader_test.py`, `AuditEvent`, `PostgresAuthRepository`, `CreateScopeMonitoringUseCase`, `set_current_project`, `api_test.py`, `FakeAuthRepository`, `protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository`, `project_admin.py`, `app.py`, `InMemoryScopeMonitoringRepository`, `ScopeMonitoringRepository`, `create_daily_activity_test.py`, `audit_log_api_test.py`, `update_daily_activity_test.py`, `complete_daily_activity_test.py`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Why does `DailyActivity` connect `DailyActivity` to `PostgresScopeMonitoringRepository`, `DomainError`, `Officials`, `api_test.py`, `create_app`, `set_current_project`, `postgres_scope_monitoring_repository_test.py`, `InMemoryScopeMonitoringRepository`, `app.py`, `ScopeMonitoringRepository`, `create_daily_activity_test.py`, `audit_log_api_test.py`, `update_daily_activity_test.py`, `complete_daily_activity_test.py`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Why does `PostgresAuthRepository` connect `PostgresAuthRepository` to `project_admin_test.py`, `OfficialCode`, `build_connection_pool`, `create_app`, `empty_database`, `postgres_auth_repository.py`, `protab_adapters_outbound_persistence_postgres_auth_repository`, `project_admin.py`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Are the 53 inferred relationships involving `DailyActivity` (e.g. with `_activity_to_response()` and `InMemoryScopeMonitoringRepository`) actually correct?**
  _`DailyActivity` has 53 INFERRED edges - model-reasoned connections that need verification._
- **Are the 49 inferred relationships involving `create_app()` (e.g. with `close_persistence()` and `project_context()`) actually correct?**
  _`create_app()` has 49 INFERRED edges - model-reasoned connections that need verification._
- **Are the 46 inferred relationships involving `InMemoryScopeMonitoringRepository` (e.g. with `DailyActivity` and `ScopeMonitoring`) actually correct?**
  _`InMemoryScopeMonitoringRepository` has 46 INFERRED edges - model-reasoned connections that need verification._