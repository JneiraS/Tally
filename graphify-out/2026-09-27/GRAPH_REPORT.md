# Graph Report - ProTab  (2026-09-27)

## Corpus Check
- 152 files · ~51,105 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: (none) 8, .example 1, .conf 1)

## Summary
- 1031 nodes · 2360 edges · 89 communities (57 shown, 32 thin omitted)
- Extraction: 81% EXTRACTED · 19% INFERRED · 0% AMBIGUOUS · INFERRED: 455 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8941adc3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ScopeDetailPage.tsx
- project_admin_test.py
- package.json
- App.tsx
- scope_monitoring_csv_reader_test.py
- api.ts
- DomainError
- ScopeFormModal.tsx
- AuditEvent
- Officials
- api_test.py
- create_app
- app.py
- AppSessionLoss.test.tsx
- InMemoryScopeMonitoringRepository
- ExportModal.tsx
- route_authorization_test.py
- vitest
- dependencies
- postgres_scope_monitoring_repository_test.py
- project_admin.py
- compilerOptions
- ScopeMonitoringRepository
- kpi.ts
- CreateDailyActivityUseCase
- Rule Categories by Priority (1-10)
- devDependencies
- ProTab Project Documentation
- audit_log_api_test.py
- UpdateDailyActivityUseCase
- FastAPI & PostgreSQL Performance Optimizer Skill
- CompleteDailyActivityUseCase
- Hexagonal Architecture (Ports and Adapters)
- PostgresScopeMonitoringRepository
- api Service (FastAPI backend)
- psycopg
- Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring)
- Development Workflow (9 Steps)
- Project Authentication with Quadrigramme Restriction
- opencode.json
- AuditLogPage.tsx
- Application Layer / Use Cases
- protab
- DailyActivity
- PostgresAuthRepository
- postgres_auth_repository_test.py
- FakeAuthRepository
- _official_codes
- graphify.js
- scripts
- resolve_bootstrap_password
- postgres_auth_repository.py
- protab_adapters_outbound_persistence_postgres_auth_repository
- PostgresScopeMonitoringRepository
- ScopeListPage.tsx
- ScopeMonitoring
- pytest
- build_changes
- current_user
- project_context

## God Nodes (most connected - your core abstractions)
1. `create_app()` - 69 edges
2. `DailyActivity` - 52 edges
3. `InMemoryScopeMonitoringRepository` - 48 edges
4. `ScopeMonitoring` - 41 edges
5. `AuditEvent` - 25 edges
6. `react` - 24 edges
7. `ScopeMonitoringRepository` - 24 edges
8. `useToast()` - 23 edges
9. `PostgresScopeMonitoringRepository` - 23 edges
10. `PostgresAuthRepository` - 22 edges

## Surprising Connections (you probably didn't know these)
- `Centralized PostgreSQL Pool Configuration` --semantically_similar_to--> `Connection Pooling Parameters`  [INFERRED] [semantically similar]
  AGENTS.md → .opencode/skills/improve-performances/SKILL.md
- `test_api_flow_persists_in_postgres()` --calls--> `create_app()`  [INFERRED]
  tests/integration/adapters/postgres_scope_monitoring_repository_test.py → src/protab/adapters/inbound/api/app.py
- `test_complete_unknown_day_does_not_partially_persist()` --calls--> `create_app()`  [INFERRED]
  tests/integration/adapters/postgres_scope_monitoring_repository_test.py → src/protab/adapters/inbound/api/app.py
- `test_duplicate_name_via_api_returns_409()` --calls--> `create_app()`  [INFERRED]
  tests/integration/adapters/postgres_scope_monitoring_repository_test.py → src/protab/adapters/inbound/api/app.py
- `test_build_connection_pool_uses_tuned_configuration()` --calls--> `build_connection_pool()`  [INFERRED]
  tests/unit/adapters/postgres_pool_test.py → src/protab/adapters/outbound/persistence/postgres_pool.py

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **ProTab Mutation → Audit Trail Flow** — readme_mutation_use_cases, readme_audit_trail, readme_domain_invariants, readme_domain_error_http_mapping, readme_rest_routes_table [INFERRED 0.85]
- **ProTab PostgreSQL Persistence Path (port → adapter → pool → container)** — agents_scopemonitoringrepository_port, agents_postgres_scopemonitoringrepository, agents_idempotent_schema_bootstrap, agents_postgres_pool_configuration, readme_postgres_persistence, readme_scope_monitorings_index, docker_compose_db_service, docker_compose_api_service [INFERRED 0.85]
- **ProTab Hexagonal Core and Its Adapters** — agents_hexagonal_architecture, readme_scope_monitoring_aggregate, readme_mutation_use_cases, agents_scopemonitoringrepository_port, readme_http_api_adapter, readme_csv_import_adapter, readme_postgres_persistence [INFERRED 0.95]

## Communities (89 total, 32 thin omitted)

### Community 0 - "ScopeDetailPage.tsx"
Cohesion: 0.17
Nodes (21): react, recharts, ActivityFormModal(), CompleteActivitiesModal(), CsvImportModal(), CsvImportModalProps, DashboardCharts(), Modal() (+13 more)

### Community 1 - "project_admin_test.py"
Cohesion: 0.22
Nodes (13): protab, bootstrap_password(), fixture, Integration tests for the ``protab-project`` administrative command. The…, Rotating a leaked password must not leave old sessions usable., repository(), run(), stored_hash() (+5 more)

### Community 2 - "package.json"
Cohesion: 0.17
Nodes (11): jsdom, tailwindcss, @types/node, @types/react, @types/react-dom, typescript, vite, name (+3 more)

### Community 3 - "App.tsx"
Cohesion: 0.12
Nodes (22): lucide-react, react-router-dom, AuditShortcut(), Navbar(), NavbarProps, ToastContainer(), WEEKDAYS, WorkingDaysModal() (+14 more)

### Community 4 - "scope_monitoring_csv_reader_test.py"
Cohesion: 0.17
Nodes (24): fastapi_responses, JSONResponse, Path, pathlib, protab_adapters_inbound_csv_scope_monitoring_csv_reader, bad_request(), conflict(), not_found() (+16 more)

### Community 5 - "api.ts"
Cohesion: 0.12
Nodes (23): ActivityFormModalProps, CompleteActivitiesModalProps, SaveStatus, TodayActivityEditorProps, ValueSnapshot, ApiError, notifyUnauthorized(), parseFastApiErrorMessage() (+15 more)

### Community 6 - "DomainError"
Cohesion: 0.12
Nodes (28): date, DuplicateFeaiReferenceError, IncidentsExceedErrorsError, InvalidFeaiReferenceError, NegativeErrorsCountError, NegativeIncidentsCountError, Raised when incidents_created exceeds errors_reported., Raised when a FEAI reference does not match the expected format. (+20 more)

### Community 7 - "ScopeFormModal.tsx"
Cohesion: 0.16
Nodes (17): FeaiTagInput(), FeaiTagInputProps, InlineActivityCounters(), InlineActivityCountersProps, SaveStatus, ValueSnapshot, ScopeFormModal(), ScopeFormModalProps (+9 more)

### Community 8 - "AuditEvent"
Cohesion: 0.10
Nodes (27): protab_adapters_outbound_persistence_in_memory_audit_trail_repository, protab_application_queries_list_audit_events, _audit_event_to_response(), list_scope_audit_log(), InMemoryAuditTrailRepository, PostgresAuditTrailRepository, Open the connection pool and apply the (idempotent) schema., Close the connection pool, releasing database connections. (+19 more)

### Community 9 - "Officials"
Cohesion: 0.13
Nodes (18): KnowledgeBase, Officials, fixture_scope_monitoring(), fixture, Adding a second DailyActivity for the same day should raise…, Multiple DailyActivities for different days should be allowed., Different ScopeMonitoring instances can have activities on the same day., Adding a DailyActivity for a new day should succeed. (+10 more)

### Community 10 - "api_test.py"
Cohesion: 0.09
Nodes (16): client(), create_scope_via_api(), make_scope_with_activity(), fixture, test_complete_daily_activities_returns_204(), test_complete_day_without_activity_returns_404(), test_create_daily_activity_duplicate_day_returns_409(), test_create_daily_activity_invalid_invariant_returns_400() (+8 more)

### Community 11 - "create_app"
Cohesion: 0.13
Nodes (27): BaseModel, field_validator, pydantic, _activity_to_response(), create_app(), create_scope_monitorings(), get_scope_daily_activity(), get_scope_monitoring() (+19 more)

### Community 12 - "app.py"
Cohesion: 0.12
Nodes (17): csv, datetime, protab_adapters_inbound_api_auth, protab_adapters_inbound_api_errors, protab_adapters_inbound_api_schemas, protab_application_actor_context, protab_application_commands_create_scope_monitoring, protab_application_commands_daily_activity (+9 more)

### Community 13 - "AppSessionLoss.test.tsx"
Cohesion: 0.25
Nodes (7): react-dom, App(), src_frontend_src_index, json(), PROJECT, SESSION, stubFetch()

### Community 14 - "InMemoryScopeMonitoringRepository"
Cohesion: 0.16
Nodes (19): protab_application_queries_get_daily_activity, protab_application_queries_get_scope, protab_application_queries_list_scopes, protab_application_use_cases_create_scope_monitoring, InMemoryScopeMonitoringRepository, GetDailyActivityUseCase, make_command(), test_create_duplicate_name_raises_and_persists_nothing() (+11 more)

### Community 15 - "ExportModal.tsx"
Cohesion: 0.15
Nodes (21): DashboardChartsProps, ExportModal(), ExportModalProps, ScopeBase, ToastProvider(), EnrichedScope, defaultFrom, renderModal() (+13 more)

### Community 16 - "route_authorization_test.py"
Cohesion: 0.24
Nodes (9): APIRoute, fastapi_routing, business_routes(), Business routes must be authenticated by default (allowlist, not denylist).…, Guards against a silent rename making this test vacuously pass., A public route answers an anonymous caller; a business route does not. Uses a…, test_business_routes_are_discovered(), test_every_business_route_depends_on_project_context() (+1 more)

### Community 17 - "vitest"
Cohesion: 0.16
Nodes (7): @testing-library/jest-dom, @testing-library/react, vitest, ScopeDetailCharts(), scope, buildKnowledgeBaseUrl(), KNOWLEDGE_BASE_URL

### Community 18 - "dependencies"
Cohesion: 0.20
Nodes (10): dependencies, lucide-react, react, react-dom, react-router-dom, recharts, tailwindcss, @tailwindcss/vite (+2 more)

### Community 19 - "postgres_scope_monitoring_repository_test.py"
Cohesion: 0.07
Nodes (40): protab_adapters_outbound_persistence_postgres_audit_trail_repository, RuntimeError, MissingProjectContextError, No authenticated request established the project to read or write., reset_current_project(), set_current_project(), make_event(), project() (+32 more)

### Community 20 - "project_admin.py"
Cohesion: 0.08
Nodes (32): argparse, dotenv, getpass, os, parametrize, protab_adapters_inbound_api_config, build_repository(), Select the persistence adapter from configuration. PostgreSQL is required for… (+24 more)

### Community 21 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+11 more)

### Community 22 - "ScopeMonitoringRepository"
Cohesion: 0.10
Nodes (9): GetScopeUseCase, ListScopesUseCase, Protocol, Return the ScopeMonitoring with the given id, or None., Return the ScopeMonitoring with the given name, or None., Return all ScopeMonitorings., Return a mapping of scope ids to names., Persist the given ScopeMonitoring. (+1 more)

### Community 23 - "kpi.ts"
Cohesion: 0.21
Nodes (17): ScopeListPage(), baselineDelta, buildCumulativeTrend(), buildDailyTrend(), coverageRate(), CumulativeTrendPoint, DailyTrendPoint, DEFAULT_NON_WORKING_DAYS (+9 more)

### Community 24 - "CreateDailyActivityUseCase"
Cohesion: 0.44
Nodes (9): protab_application_use_cases_create_daily_activity, CreateDailyActivityUseCase, make_command(), make_scope(), make_scope_daily_activity(), test_create_daily_activity(), test_create_duplicate_day_raises_and_persists_nothing(), test_create_invalid_invariant_raises() (+1 more)

### Community 25 - "Rule Categories by Priority (1-10)"
Cohesion: 0.20
Nodes (12): Design Dials (variance / motion / density), Design System Generation (--design-system), Design System Persistence (Master + Overrides), Pre-Delivery UI Checklist, Search Query Contract, Rule Categories by Priority (1-10), ui-ux-pro-max Search Script, Stack Detection Step (+4 more)

### Community 26 - "devDependencies"
Cohesion: 0.22
Nodes (9): devDependencies, jsdom, @testing-library/jest-dom, @testing-library/react, @types/node, @types/react, @types/react-dom, typescript (+1 more)

### Community 27 - "ProTab Project Documentation"
Cohesion: 0.18
Nodes (11): Avoid Premature Abstraction, PostgreSQL Integration Tests (make test-db), SOLID Principles, Aggregate Owns DailyActivities Indexed by Day, CSV Import Inbound Adapter, DailyActivity (Entity), Day Is Not a Class (datetime.date as value object), Domain Invariants (counters, FEAI format, completion implication) (+3 more)

### Community 28 - "audit_log_api_test.py"
Cohesion: 0.26
Nodes (9): fastapi_testclient, protab_adapters_inbound_api_app, protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository, test_daily_activity_full_flow_over_http(), all_events(), make_scope_with_activity(), test_activity_flow_records_audit_via_api(), test_create_scope_records_audit_via_api() (+1 more)

### Community 29 - "UpdateDailyActivityUseCase"
Cohesion: 0.38
Nodes (9): protab_application_use_cases_update_daily_activity, handle_update_daily_activity(), UpdateDailyActivityCommand, UpdateDailyActivityUseCase, make_scope_with_activity(), test_update_daily_activity(), test_update_day_without_activity_raises(), test_update_invalid_invariant_raises_and_does_not_modify() (+1 more)

### Community 30 - "FastAPI & PostgreSQL Performance Optimizer Skill"
Cohesion: 0.22
Nodes (10): Caching Layer & Background Task Offloading, Connection Pooling Parameters, Database Indexing Strategy, Diagnostic & Audit Checklist, Event Loop Stall Detection, FastAPI & PostgreSQL Performance Optimizer Skill, N+1 Query Pattern Detection, Payload & Serialization Optimization (+2 more)

### Community 31 - "CompleteDailyActivityUseCase"
Cohesion: 0.18
Nodes (14): contextvars, protab_application_use_cases_complete_daily_activity, complete_daily_activities(), handle_create_daily_activity(), current_actor(), Per-request audit context. Mirrors the ``_CURRENT_PROJECT_ID`` ContextVar…, CompleteDailyActivityCommand, CreateDailyActivityCommand (+6 more)

### Community 32 - "Hexagonal Architecture (Ports and Adapters)"
Cohesion: 0.22
Nodes (9): Adapters (Inbound / Outbound), Dependency Injection and Composition Root, Dependency Rule (Adapters → Ports → Application → Domain), Domain Layer, Domain Error Handling and Adapter Translation, Framework Isolation, Hexagonal Architecture (Ports and Adapters), Ports (Inbound and Outbound Contracts) (+1 more)

### Community 33 - "PostgresScopeMonitoringRepository"
Cohesion: 0.31
Nodes (9): API Configuration via load_dotenv and os.getenv, Configuration and Secrets Management, Idempotent Schema Bootstrap (CREATE TABLE IF NOT EXISTS), InMemoryScopeMonitoringRepository, Centralized PostgreSQL Pool Configuration, PostgresScopeMonitoringRepository, ProTab Infrastructure Notes, ScopeMonitoringRepository Outbound Port (+1 more)

### Community 34 - "api Service (FastAPI backend)"
Cohesion: 0.31
Nodes (9): api Healthcheck (/healthz), api Service (FastAPI backend), db Healthcheck (pg_isready), db Service (postgres:17-alpine), ProTab Development Docker Stack, frontend Service (React/nginx build), pgdata Named Volume, FastAPI HTTP Inbound Adapter (+1 more)

### Community 35 - "psycopg"
Cohesion: 0.17
Nodes (9): ConnectionPool, psycopg, psycopg_pool, build_connection_pool(), ping_check(), Connection, Shared PostgreSQL connection-pool configuration for persistence adapters., Check connectivity and leave the connection outside a transaction. (+1 more)

### Community 36 - "Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring)"
Cohesion: 0.33
Nodes (7): Audit Trail (best-effort mutation journal), Atomic ScopeMonitoring Creation, Domain Error to HTTP Status Mapping, Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring), Query Use Cases (ListScopes, GetScope, GetDailyActivity, ListAuditEvents), REST Routes and Status Codes Table, React Root Mount (#root)

### Community 37 - "Development Workflow (9 Steps)"
Cohesion: 0.40
Nodes (6): Definition of Done Checklist, Development Workflow (9 Steps), Documentation Synchronization Requirement, Graphify Knowledge Graph Workflow, Test-Driven Development (RED/GREEN/REFACTOR), Testing Strategy (Test Pyramid)

### Community 38 - "Project Authentication with Quadrigramme Restriction"
Cohesion: 0.50
Nodes (4): Default Project Seeding Env Vars, Project Authentication with Quadrigramme Restriction, Per-Project Working Days Settings, Quadrigramme Bootstrap Exemption

### Community 40 - "AuditLogPage.tsx"
Cohesion: 0.18
Nodes (14): AuditActivityHeatmap(), AuditActivityHeatmapProps, HOURS, intensityClass(), WEEKDAYS, ACTION_ICONS, ACTION_LABELS, AuditLogPage() (+6 more)

### Community 72 - "DailyActivity"
Cohesion: 0.16
Nodes (17): DailyActivity, test_daily_activity_creation_valid(), test_daily_activity_duplicate_feai_rejected(), test_daily_activity_errors_reported_negative(), test_daily_activity_incidents_created_negative(), test_daily_activity_incidents_exceed_errors(), test_daily_activity_invalid_feai_format(), test_daily_activity_mark_completed() (+9 more)

### Community 73 - "PostgresAuthRepository"
Cohesion: 0.16
Nodes (6): _hash_password(), _normalize_non_working_days(), PostgresAuthRepository, Project, Store project credentials and opaque, expiring session tokens., Replace the password of an existing project and drop its sessions. Rotating a…

### Community 74 - "postgres_auth_repository_test.py"
Cohesion: 0.11
Nodes (21): add_scope(), bootstrap_password(), empty_database(), fixture, Integration tests for the PostgreSQL auth repository rule: the quadrigramme…, The password is only needed to seed; a restart must not require it. Requiring…, ``official_main`` encodes several codes just like ``official_backup``., ``?`` marks the absence of a backup official, it is not a code. (+13 more)

### Community 75 - "FakeAuthRepository"
Cohesion: 0.19
Nodes (11): AuthSession, FakeAuthRepository, login_and_read_session_cookie(), test_authenticated_routes_require_a_valid_session(), test_in_memory_application_remains_unauthenticated_for_existing_fixtures(), test_login_rejects_invented_quadrigramme_when_known_codes_exist(), test_project_settings_are_authenticated_and_project_scoped(), test_project_settings_reject_invalid_weekday() (+3 more)

### Community 76 - "_official_codes"
Cohesion: 0.29
Nodes (9): _official_codes(), Quadrigrammes declared by one ``officials`` column (format « A/B »).…, Parsing of the officials columns that gate the quadrigramme. Both…, ``MRAM/ ?`` means "MRAM, no backup": ``?`` is not a quadrigramme., test_handles_empty_and_none(), test_ignores_punctuation_only_parts(), test_placeholder_is_not_a_code(), test_splits_multiple_codes() (+1 more)

### Community 77 - "graphify.js"
Cohesion: 0.25
Nodes (5): IMPORTANT: keep the reminder string free of backticks and $(...) constructs., ref_fs, ref_path, @tailwindcss/vite, @vitejs/plugin-react

### Community 78 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, preview, test

### Community 79 - "resolve_bootstrap_password"
Cohesion: 0.36
Nodes (7): Return the password seeding the first project, or refuse to start. Called only…, resolve_bootstrap_password(), The bootstrap project password must never fall back to a hardcoded default. A…, test_blank_variable_raises(), test_missing_variable_raises(), test_returns_the_configured_password(), test_trims_surrounding_whitespace()

### Community 80 - "postgres_auth_repository.py"
Cohesion: 0.20
Nodes (7): hashlib, hmac, protab_adapters_outbound_persistence_postgres_pool, secrets, _check_password(), PostgreSQL persistence for projects and login sessions., test_build_connection_pool_uses_tuned_configuration()

### Community 81 - "protab_adapters_outbound_persistence_postgres_auth_repository"
Cohesion: 0.33
Nodes (6): fastapi, protab_adapters_outbound_persistence_postgres_auth_repository, Response, logout(), clear_session_cookie(), set_session_cookie()

### Community 82 - "PostgresScopeMonitoringRepository"
Cohesion: 0.20
Nodes (8): PostgresScopeMonitoringRepository, Connection, date, Persist ``ScopeMonitoring`` aggregates in PostgreSQL. The schema is applied…, Open the connection pool and apply the (idempotent) schema., Close the connection pool, releasing database connections., Return the current project id, or refuse to touch the database. Every read and…, require_current_project()

### Community 83 - "ScopeListPage.tsx"
Cohesion: 0.18
Nodes (12): Badge(), BadgeProps, CompleteTodayButton(), CompleteTodayButtonProps, DateNavigator(), DateNavigatorProps, formatDayMonthFr(), formatWeekdayFr() (+4 more)

### Community 84 - "ScopeMonitoring"
Cohesion: 0.17
Nodes (4): Exception, date, ScopeMonitoring, UniqueViolation

### Community 85 - "pytest"
Cohesion: 0.18
Nodes (8): dataclasses, protab_adapters_outbound_persistence_postgres_scope_monitoring_repository, psycopg_types_json, pytest, In-memory adapter of the AuditTrailRepository port for tests., PostgreSQL outbound adapter for the AuditTrailRepository port. The schema is…, Tenant isolation must fail closed when no project context is established. A…, test_raises_when_no_context_is_established()

### Community 86 - "build_changes"
Cohesion: 0.24
Nodes (9): build_changes(), Domain model for the audit trail. An :class:`AuditEvent` records *who* (actor)…, Return only the fields whose value differs between ``before`` and ``after``.…, test_audit_event_defaults(), test_build_changes_empty_when_identical(), test_build_changes_from_empty_keeps_all_fields(), test_build_changes_handles_removed_fields(), test_build_changes_keeps_only_different_fields() (+1 more)

### Community 87 - "current_user"
Cohesion: 0.29
Nodes (10): get_project_settings(), list_projects(), me(), update_project_settings(), _project_to_response(), current_user(), CurrentUser, Request (+2 more)

### Community 88 - "project_context"
Cohesion: 0.32
Nodes (8): project_context(), reset_current_actor(), set_current_actor(), clear_actor(), env(), fixture, clean_actor(), fixture

## Ambiguous Edges - Review These
- `React Root Mount (#root)` → `Audit Trail (best-effort mutation journal)`  [AMBIGUOUS]
  src/FrontEnd/index.html · relation: conceptually_related_to

## Knowledge Gaps
- **111 isolated node(s):** `$schema`, `plugin`, `protab`, `name`, `private` (+106 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 311 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `React Root Mount (#root)` and `Audit Trail (best-effort mutation journal)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `create_app()` connect `create_app` to `scope_monitoring_csv_reader_test.py`, `AuditEvent`, `PostgresAuthRepository`, `api_test.py`, `FakeAuthRepository`, `app.py`, `InMemoryScopeMonitoringRepository`, `route_authorization_test.py`, `protab_adapters_outbound_persistence_postgres_auth_repository`, `postgres_scope_monitoring_repository_test.py`, `project_admin.py`, `ScopeMonitoringRepository`, `current_user`, `project_context`, `CreateDailyActivityUseCase`, `audit_log_api_test.py`, `UpdateDailyActivityUseCase`, `CompleteDailyActivityUseCase`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Why does `DailyActivity` connect `DailyActivity` to `DomainError`, `AuditEvent`, `Officials`, `api_test.py`, `create_app`, `app.py`, `InMemoryScopeMonitoringRepository`, `PostgresScopeMonitoringRepository`, `postgres_scope_monitoring_repository_test.py`, `ScopeMonitoring`, `CreateDailyActivityUseCase`, `audit_log_api_test.py`, `UpdateDailyActivityUseCase`, `CompleteDailyActivityUseCase`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `ScopeMonitoring` connect `ScopeMonitoring` to `AuditEvent`, `DailyActivity`, `api_test.py`, `create_app`, `app.py`, `postgres_auth_repository_test.py`, `InMemoryScopeMonitoringRepository`, `Officials`, `PostgresScopeMonitoringRepository`, `postgres_scope_monitoring_repository_test.py`, `ScopeMonitoringRepository`, `CreateDailyActivityUseCase`, `audit_log_api_test.py`, `UpdateDailyActivityUseCase`, `CompleteDailyActivityUseCase`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Are the 49 inferred relationships involving `create_app()` (e.g. with `close_persistence()` and `project_context()`) actually correct?**
  _`create_app()` has 49 INFERRED edges - model-reasoned connections that need verification._
- **Are the 40 inferred relationships involving `DailyActivity` (e.g. with `_activity_to_response()` and `PostgresScopeMonitoringRepository`) actually correct?**
  _`DailyActivity` has 40 INFERRED edges - model-reasoned connections that need verification._
- **Are the 41 inferred relationships involving `InMemoryScopeMonitoringRepository` (e.g. with `ScopeMonitoring` and `test_daily_activity_full_flow_over_http()`) actually correct?**
  _`InMemoryScopeMonitoringRepository` has 41 INFERRED edges - model-reasoned connections that need verification._