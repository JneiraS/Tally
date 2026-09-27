# Graph Report - ProTab  (2026-09-26)

## Corpus Check
- 152 files · ~49,490 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: (none) 8, .example 1, .conf 1)

## Summary
- 1028 nodes · 2349 edges · 80 communities (48 shown, 32 thin omitted)
- Extraction: 81% EXTRACTED · 19% INFERRED · 0% AMBIGUOUS · INFERRED: 455 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0e6db542`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ScopeFormModal.tsx
- project_admin_test.py
- package.json
- App.tsx
- scope_monitoring_csv_reader_test.py
- api.ts
- DailyActivity
- react
- AuditEvent
- datetime
- api_test.py
- create_app
- protab_domain_exceptions
- AppSessionLoss.test.tsx
- InMemoryScopeMonitoringRepository
- ExportModal.tsx
- protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository
- ScopeListPage.tsx
- dependencies
- postgres_scope_monitoring_repository_test.py
- project_admin.py
- compilerOptions
- audit_trail_test.py
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
- dataclasses
- Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring)
- Development Workflow (9 Steps)
- Project Authentication with Quadrigramme Restriction
- opencode.json
- AuditLogPage.tsx
- Application Layer / Use Cases
- protab
- ScopeMonitoring
- PostgresAuthRepository
- postgres_auth_repository_test.py
- FakeAuthRepository
- _official_codes
- graphify.js
- scripts
- resolve_bootstrap_password

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
- `test_audit_event_defaults()` --uses--> `AuditEvent`  [INFERRED]
  tests/unit/domain/audit_event_test.py → src/protab/domain/entities/audit_event.py

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **ProTab Mutation → Audit Trail Flow** — readme_mutation_use_cases, readme_audit_trail, readme_domain_invariants, readme_domain_error_http_mapping, readme_rest_routes_table [INFERRED 0.85]
- **ProTab PostgreSQL Persistence Path (port → adapter → pool → container)** — agents_scopemonitoringrepository_port, agents_postgres_scopemonitoringrepository, agents_idempotent_schema_bootstrap, agents_postgres_pool_configuration, readme_postgres_persistence, readme_scope_monitorings_index, docker_compose_db_service, docker_compose_api_service [INFERRED 0.85]
- **ProTab Hexagonal Core and Its Adapters** — agents_hexagonal_architecture, readme_scope_monitoring_aggregate, readme_mutation_use_cases, agents_scopemonitoringrepository_port, readme_http_api_adapter, readme_csv_import_adapter, readme_postgres_persistence [INFERRED 0.95]

## Communities (80 total, 32 thin omitted)

### Community 0 - "ScopeFormModal.tsx"
Cohesion: 0.22
Nodes (10): CsvImportModal(), CsvImportModalProps, Modal(), ModalProps, ScopeFormModal(), ScopeFormModalProps, ScopeItemState, CreateScopeInput (+2 more)

### Community 1 - "project_admin_test.py"
Cohesion: 0.08
Nodes (26): ConnectionPool, protab, protab_adapters_outbound_persistence_postgres_pool, psycopg, psycopg_pool, psycopg_types_json, PostgreSQL outbound adapter for the AuditTrailRepository port. The schema is…, build_connection_pool() (+18 more)

### Community 2 - "package.json"
Cohesion: 0.17
Nodes (11): jsdom, tailwindcss, @types/node, @types/react, @types/react-dom, typescript, vite, name (+3 more)

### Community 3 - "App.tsx"
Cohesion: 0.11
Nodes (17): react-router-dom, AuditShortcut(), Navbar(), NavbarProps, ToastContainer(), AUDIT_LOG_PATH, Theme, ThemeContext (+9 more)

### Community 4 - "scope_monitoring_csv_reader_test.py"
Cohesion: 0.15
Nodes (26): csv, fastapi_responses, JSONResponse, Path, pathlib, protab_adapters_inbound_csv_scope_monitoring_csv_reader, protab_application_commands_create_scope_monitoring, bad_request() (+18 more)

### Community 5 - "api.ts"
Cohesion: 0.12
Nodes (22): WEEKDAYS, WorkingDaysModal(), WorkingDaysModalProps, LoginPage(), LoginPageProps, ScopeListPageProps, ApiError, notifyUnauthorized() (+14 more)

### Community 6 - "DailyActivity"
Cohesion: 0.06
Nodes (51): date, DailyActivity, DuplicateFeaiReferenceError, IncidentsExceedErrorsError, InvalidFeaiReferenceError, NegativeErrorsCountError, NegativeIncidentsCountError, Raised when incidents_created exceeds errors_reported. (+43 more)

### Community 7 - "react"
Cohesion: 0.13
Nodes (24): lucide-react, react, ActivityFormModal(), ActivityFormModalProps, CompleteActivitiesModalProps, FeaiTagInput(), FeaiTagInputProps, InlineActivityCounters() (+16 more)

### Community 8 - "AuditEvent"
Cohesion: 0.16
Nodes (9): PostgresAuditTrailRepository, Open the connection pool and apply the (idempotent) schema., Close the connection pool, releasing database connections., ListAuditEventsUseCase, AuditEvent, AuditTrailRepository, Protocol, Persist an audit event. (+1 more)

### Community 9 - "datetime"
Cohesion: 0.22
Nodes (13): datetime, KnowledgeBase, Officials, fixture_scope_monitoring(), fixture, Different ScopeMonitoring instances can have activities on the same day., test_knowledge_base_id_length(), test_knowledge_base_id_valid_boundary() (+5 more)

### Community 10 - "api_test.py"
Cohesion: 0.09
Nodes (16): client(), create_scope_via_api(), make_scope_with_activity(), fixture, test_complete_daily_activities_returns_204(), test_complete_day_without_activity_returns_404(), test_create_daily_activity_duplicate_day_returns_409(), test_create_daily_activity_invalid_invariant_returns_400() (+8 more)

### Community 11 - "create_app"
Cohesion: 0.07
Nodes (50): BaseModel, fastapi, field_validator, protab_adapters_inbound_api_auth, protab_adapters_inbound_api_errors, protab_adapters_inbound_api_schemas, protab_adapters_outbound_persistence_postgres_auth_repository, pydantic (+42 more)

### Community 12 - "protab_domain_exceptions"
Cohesion: 0.17
Nodes (10): protab_application_actor_context, protab_application_commands_daily_activity, protab_domain_entities_audit_event, protab_domain_entities_daily_activity, protab_domain_entities_scope_monitoring, protab_domain_exceptions, protab_ports_outbound_audit_trail_repository, protab_ports_outbound_scope_monitoring_repository (+2 more)

### Community 13 - "AppSessionLoss.test.tsx"
Cohesion: 0.25
Nodes (7): react-dom, App(), src_frontend_src_index, json(), PROJECT, SESSION, stubFetch()

### Community 14 - "InMemoryScopeMonitoringRepository"
Cohesion: 0.19
Nodes (12): protab_application_use_cases_create_scope_monitoring, InMemoryScopeMonitoringRepository, CreateScopeMonitoringCommand, CreateScopeMonitoringUseCase, test_create_scope_from_csv_records_import_action(), test_create_scope_records_audit_event_with_actor(), test_list_audit_events_applies_filters(), make_command() (+4 more)

### Community 15 - "ExportModal.tsx"
Cohesion: 0.16
Nodes (19): ExportModal(), ExportModalProps, ScopeBase, ScopeDetailChartsProps, ToastProvider(), defaultFrom, renderModal(), scope() (+11 more)

### Community 16 - "protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository"
Cohesion: 0.17
Nodes (13): APIRoute, fastapi_routing, fastapi_testclient, protab_adapters_inbound_api_app, protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository, test_daily_activity_full_flow_over_http(), business_routes(), Business routes must be authenticated by default (allowlist, not denylist).… (+5 more)

### Community 17 - "ScopeListPage.tsx"
Cohesion: 0.10
Nodes (32): recharts, @testing-library/jest-dom, @testing-library/react, vitest, Badge(), BadgeProps, CompleteActivitiesModal(), CompleteTodayButton() (+24 more)

### Community 18 - "dependencies"
Cohesion: 0.20
Nodes (10): dependencies, lucide-react, react, react-dom, react-router-dom, recharts, tailwindcss, @tailwindcss/vite (+2 more)

### Community 19 - "postgres_scope_monitoring_repository_test.py"
Cohesion: 0.06
Nodes (45): protab_adapters_outbound_persistence_postgres_audit_trail_repository, protab_adapters_outbound_persistence_postgres_scope_monitoring_repository, pytest, RuntimeError, In-memory adapter of the AuditTrailRepository port for tests., MissingProjectContextError, No authenticated request established the project to read or write., reset_current_project() (+37 more)

### Community 20 - "project_admin.py"
Cohesion: 0.09
Nodes (30): argparse, dotenv, getpass, os, parametrize, protab_adapters_inbound_api_config, cookie_secure_from_env(), database_url_from_env() (+22 more)

### Community 21 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+11 more)

### Community 22 - "audit_trail_test.py"
Cohesion: 0.20
Nodes (13): protab_adapters_outbound_persistence_in_memory_audit_trail_repository, protab_application_queries_list_audit_events, protab_application_use_cases_complete_daily_activity, protab_application_use_cases_create_daily_activity, protab_application_use_cases_update_daily_activity, InMemoryAuditTrailRepository, current_project_id(), AuditEventQuery (+5 more)

### Community 23 - "kpi.ts"
Cohesion: 0.21
Nodes (14): baselineDelta, buildCumulativeTrend(), buildDailyTrend(), coverageRate(), CumulativeTrendPoint, DailyTrendPoint, DEFAULT_NON_WORKING_DAYS, isWorkingDay() (+6 more)

### Community 24 - "CreateDailyActivityUseCase"
Cohesion: 0.36
Nodes (10): handle_create_daily_activity(), CreateDailyActivityCommand, CreateDailyActivityUseCase, make_command(), make_scope(), make_scope_daily_activity(), test_create_daily_activity(), test_create_duplicate_day_raises_and_persists_nothing() (+2 more)

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
Cohesion: 0.16
Nodes (16): contextvars, project_context(), current_actor(), Per-request audit context. Mirrors the ``_CURRENT_PROJECT_ID`` ContextVar…, reset_current_actor(), set_current_actor(), all_events(), clear_actor() (+8 more)

### Community 29 - "UpdateDailyActivityUseCase"
Cohesion: 0.44
Nodes (8): handle_update_daily_activity(), UpdateDailyActivityCommand, UpdateDailyActivityUseCase, make_scope_with_activity(), test_update_daily_activity(), test_update_day_without_activity_raises(), test_update_invalid_invariant_raises_and_does_not_modify(), test_update_scope_not_found()

### Community 30 - "FastAPI & PostgreSQL Performance Optimizer Skill"
Cohesion: 0.22
Nodes (10): Caching Layer & Background Task Offloading, Connection Pooling Parameters, Database Indexing Strategy, Diagnostic & Audit Checklist, Event Loop Stall Detection, FastAPI & PostgreSQL Performance Optimizer Skill, N+1 Query Pattern Detection, Payload & Serialization Optimization (+2 more)

### Community 31 - "CompleteDailyActivityUseCase"
Cohesion: 0.44
Nodes (8): complete_daily_activities(), CompleteDailyActivityCommand, CompleteDailyActivityUseCase, make_scope(), test_complete_day_without_activity_raises(), test_complete_multiple_days(), test_complete_scope_not_found(), test_complete_single_day()

### Community 32 - "Hexagonal Architecture (Ports and Adapters)"
Cohesion: 0.22
Nodes (9): Adapters (Inbound / Outbound), Dependency Injection and Composition Root, Dependency Rule (Adapters → Ports → Application → Domain), Domain Layer, Domain Error Handling and Adapter Translation, Framework Isolation, Hexagonal Architecture (Ports and Adapters), Ports (Inbound and Outbound Contracts) (+1 more)

### Community 33 - "PostgresScopeMonitoringRepository"
Cohesion: 0.31
Nodes (9): API Configuration via load_dotenv and os.getenv, Configuration and Secrets Management, Idempotent Schema Bootstrap (CREATE TABLE IF NOT EXISTS), InMemoryScopeMonitoringRepository, Centralized PostgreSQL Pool Configuration, PostgresScopeMonitoringRepository, ProTab Infrastructure Notes, ScopeMonitoringRepository Outbound Port (+1 more)

### Community 34 - "api Service (FastAPI backend)"
Cohesion: 0.31
Nodes (9): api Healthcheck (/healthz), api Service (FastAPI backend), db Healthcheck (pg_isready), db Service (postgres:17-alpine), ProTab Development Docker Stack, frontend Service (React/nginx build), pgdata Named Volume, FastAPI HTTP Inbound Adapter (+1 more)

### Community 35 - "dataclasses"
Cohesion: 0.15
Nodes (11): dataclasses, re, build_changes(), Domain model for the audit trail. An :class:`AuditEvent` records *who* (actor)…, Return only the fields whose value differs between ``before`` and ``after``.…, test_audit_event_defaults(), test_build_changes_empty_when_identical(), test_build_changes_from_empty_keeps_all_fields() (+3 more)

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

### Community 72 - "ScopeMonitoring"
Cohesion: 0.06
Nodes (33): protab_application_queries_get_daily_activity, protab_application_queries_get_scope, protab_application_queries_list_scopes, PostgresScopeMonitoringRepository, Connection, date, Exception, Persist ``ScopeMonitoring`` aggregates in PostgreSQL. The schema is applied… (+25 more)

### Community 73 - "PostgresAuthRepository"
Cohesion: 0.16
Nodes (11): hashlib, hmac, secrets, _check_password(), _hash_password(), _normalize_non_working_days(), PostgresAuthRepository, Project (+3 more)

### Community 74 - "postgres_auth_repository_test.py"
Cohesion: 0.11
Nodes (22): add_scope(), bootstrap_password(), empty_database(), project(), fixture, Integration tests for the PostgreSQL auth repository rule: the quadrigramme…, The password is only needed to seed; a restart must not require it. Requiring…, ``official_main`` encodes several codes just like ``official_backup``. (+14 more)

### Community 75 - "FakeAuthRepository"
Cohesion: 0.14
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

## Ambiguous Edges - Review These
- `React Root Mount (#root)` → `Audit Trail (best-effort mutation journal)`  [AMBIGUOUS]
  src/FrontEnd/index.html · relation: conceptually_related_to

## Knowledge Gaps
- **111 isolated node(s):** `$schema`, `plugin`, `protab`, `name`, `private` (+106 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 310 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `React Root Mount (#root)` and `Audit Trail (best-effort mutation journal)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `create_app()` connect `create_app` to `scope_monitoring_csv_reader_test.py`, `AuditEvent`, `PostgresAuthRepository`, `ScopeMonitoring`, `api_test.py`, `FakeAuthRepository`, `InMemoryScopeMonitoringRepository`, `protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository`, `postgres_scope_monitoring_repository_test.py`, `project_admin.py`, `audit_trail_test.py`, `CreateDailyActivityUseCase`, `audit_log_api_test.py`, `UpdateDailyActivityUseCase`, `CompleteDailyActivityUseCase`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Why does `ScopeMonitoring` connect `ScopeMonitoring` to `DailyActivity`, `datetime`, `api_test.py`, `create_app`, `postgres_auth_repository_test.py`, `InMemoryScopeMonitoringRepository`, `postgres_scope_monitoring_repository_test.py`, `audit_trail_test.py`, `CreateDailyActivityUseCase`, `audit_log_api_test.py`, `UpdateDailyActivityUseCase`, `CompleteDailyActivityUseCase`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `DailyActivity` connect `DailyActivity` to `dataclasses`, `ScopeMonitoring`, `datetime`, `api_test.py`, `create_app`, `postgres_scope_monitoring_repository_test.py`, `audit_trail_test.py`, `CreateDailyActivityUseCase`, `audit_log_api_test.py`, `UpdateDailyActivityUseCase`, `CompleteDailyActivityUseCase`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Are the 49 inferred relationships involving `create_app()` (e.g. with `close_persistence()` and `project_context()`) actually correct?**
  _`create_app()` has 49 INFERRED edges - model-reasoned connections that need verification._
- **Are the 40 inferred relationships involving `DailyActivity` (e.g. with `_activity_to_response()` and `PostgresScopeMonitoringRepository`) actually correct?**
  _`DailyActivity` has 40 INFERRED edges - model-reasoned connections that need verification._
- **Are the 41 inferred relationships involving `InMemoryScopeMonitoringRepository` (e.g. with `ScopeMonitoring` and `test_daily_activity_full_flow_over_http()`) actually correct?**
  _`InMemoryScopeMonitoringRepository` has 41 INFERRED edges - model-reasoned connections that need verification._