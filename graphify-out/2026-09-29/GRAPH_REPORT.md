# Graph Report - ProTab  (2026-09-28)

## Corpus Check
- 157 files · ~57,977 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 8, .example 1, .conf 1)

## Summary
- 1106 nodes · 2554 edges · 87 communities (52 shown, 35 thin omitted)
- Extraction: 81% EXTRACTED · 19% INFERRED · 0% AMBIGUOUS · INFERRED: 488 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ce32f7db`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.tsx
- app.py
- package.json
- useTheme.tsx
- scope_monitoring_csv_reader_test.py
- AuditLogPage.tsx
- DomainError
- api.ts
- AuditEvent
- Officials
- api_test.py
- create_app
- datetime
- FakeAuthRepository
- ScopeFormModal.tsx
- ExportModal.tsx
- protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository
- useToast.tsx
- DailyActivity
- postgres_scope_monitoring_repository_test.py
- api_config_test.py
- compilerOptions
- ScopeMonitoringRepository
- kpi.ts
- create_daily_activity_test.py
- Rule Categories by Priority (1-10)
- queries_test.py
- ProTab Project Documentation
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
- Project Authentication with Quadrigramme Restriction
- opencode.json
- CreateScopeMonitoringUseCase
- Application Layer / Use Cases
- protab
- InMemoryScopeMonitoringRepository
- Project
- postgres_auth_repository_test.py
- PostgresScopeMonitoringRepository
- _official_codes
- DateNavigator.tsx
- ._translate_unique_violation
- resolve_bootstrap_password
- PostgresAuthRepository
- .mark_activities_completed
- Tally plutôt qu'un tableur
- ScopeListPage.tsx
- ScopeMonitoring
- protab_domain_exceptions
- build_changes

## God Nodes (most connected - your core abstractions)
1. `DailyActivity` - 74 edges
2. `create_app()` - 69 edges
3. `InMemoryScopeMonitoringRepository` - 58 edges
4. `ScopeMonitoring` - 47 edges
5. `ScopeMonitoringRepository` - 28 edges
6. `react` - 26 edges
7. `PostgresScopeMonitoringRepository` - 26 edges
8. `AuditEvent` - 25 edges
9. `useToast()` - 23 edges
10. `PostgresAuthRepository` - 22 edges

## Surprising Connections (you probably didn't know these)
- `Centralized PostgreSQL Pool Configuration` --semantically_similar_to--> `Connection Pooling Parameters`  [INFERRED] [semantically similar]
  AGENTS.md → .opencode/skills/improve-performances/SKILL.md
- `test_duplicate_name_via_api_returns_409()` --calls--> `create_app()`  [INFERRED]
  tests/integration/adapters/postgres_scope_monitoring_repository_test.py → src/protab/adapters/inbound/api/app.py
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

## Communities (87 total, 35 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.12
Nodes (13): react-dom, react-router-dom, App(), AuditShortcut(), Navbar(), NavbarProps, AUDIT_LOG_PATH, src_frontend_src_index (+5 more)

### Community 1 - "app.py"
Cohesion: 0.18
Nodes (14): protab_adapters_inbound_api_auth, protab_adapters_inbound_api_errors, protab_adapters_inbound_api_schemas, protab_adapters_outbound_persistence_postgres_audit_trail_repository, protab_application_commands_create_scope_monitoring, protab_application_queries_list_audit_events, protab_application_use_cases_create_daily_activity, protab_application_use_cases_update_daily_activity (+6 more)

### Community 2 - "package.json"
Cohesion: 0.05
Nodes (41): IMPORTANT: keep the reminder string free of backticks and $(...) constructs., ref_fs, jsdom, ref_path, tailwindcss, @tailwindcss/vite, @types/node, @types/react (+33 more)

### Community 3 - "useTheme.tsx"
Cohesion: 0.27
Nodes (8): src_frontend_src_assets_layered_waves_dark, src_frontend_src_assets_layered_waves_light, LoginBackground(), Theme, ThemeContext, ThemeContextType, ThemeProvider(), useTheme()

### Community 4 - "scope_monitoring_csv_reader_test.py"
Cohesion: 0.16
Nodes (25): csv, fastapi_responses, JSONResponse, Path, pathlib, protab_adapters_inbound_csv_scope_monitoring_csv_reader, bad_request(), conflict() (+17 more)

### Community 5 - "AuditLogPage.tsx"
Cohesion: 0.11
Nodes (22): @testing-library/jest-dom, @testing-library/react, vitest, AuditActivityHeatmap(), AuditActivityHeatmapProps, HOURS, intensityClass(), WEEKDAYS (+14 more)

### Community 6 - "DomainError"
Cohesion: 0.12
Nodes (26): date, DuplicateFeaiReferenceError, IncidentsExceedErrorsError, InvalidFeaiReferenceError, NegativeErrorsCountError, NegativeIncidentsCountError, Raised when incidents_created exceeds errors_reported., Raised when a FEAI reference does not match the expected format. (+18 more)

### Community 7 - "api.ts"
Cohesion: 0.10
Nodes (29): ActivityFormModalProps, CompleteActivitiesModalProps, InlineActivityCounters(), InlineActivityCountersProps, SaveStatus, ValueSnapshot, SaveStatus, TodayActivityEditor() (+21 more)

### Community 8 - "AuditEvent"
Cohesion: 0.11
Nodes (21): _audit_event_to_response(), list_scope_audit_log(), InMemoryAuditTrailRepository, PostgresAuditTrailRepository, Open the connection pool and apply the (idempotent) schema., Close the connection pool, releasing database connections., current_project_id(), ListAuditEventsUseCase (+13 more)

### Community 9 - "Officials"
Cohesion: 0.13
Nodes (18): KnowledgeBase, Officials, fixture_scope_monitoring(), fixture, Adding a second DailyActivity for the same day should raise…, Multiple DailyActivities for different days should be allowed., Different ScopeMonitoring instances can have activities on the same day., Adding a DailyActivity for a new day should succeed. (+10 more)

### Community 10 - "api_test.py"
Cohesion: 0.09
Nodes (16): client(), create_scope_via_api(), make_scope_with_activity(), fixture, test_complete_daily_activities_returns_204(), test_complete_day_without_activity_returns_404(), test_create_daily_activity_duplicate_day_returns_409(), test_create_daily_activity_invalid_invariant_returns_400() (+8 more)

### Community 11 - "create_app"
Cohesion: 0.06
Nodes (59): argparse, BaseModel, fastapi, field_validator, getpass, protab_adapters_inbound_api_config, protab_adapters_outbound_persistence_postgres_auth_repository, pydantic (+51 more)

### Community 12 - "datetime"
Cohesion: 0.21
Nodes (7): dataclasses, datetime, re, Domain model for the audit trail. An :class:`AuditEvent` records *who* (actor)…, A ScopeMonitoringRepository decorator that records the calls it receives.…, typing, uuid

### Community 13 - "FakeAuthRepository"
Cohesion: 0.23
Nodes (10): FakeAuthRepository, login_and_read_session_cookie(), test_authenticated_routes_require_a_valid_session(), test_in_memory_application_remains_unauthenticated_for_existing_fixtures(), test_login_rejects_invented_quadrigramme_when_known_codes_exist(), test_project_settings_are_authenticated_and_project_scoped(), test_project_settings_reject_invalid_weekday(), test_session_cookie_is_httponly_and_samesite_lax() (+2 more)

### Community 14 - "ScopeFormModal.tsx"
Cohesion: 0.27
Nodes (10): ScopeFormModal(), ScopeFormModalProps, ScopeItemState, CreateScopeInput, ActivityValidationErrors, FEAI_REGEX, isValidFeai(), ScopeValidationErrors (+2 more)

### Community 15 - "ExportModal.tsx"
Cohesion: 0.17
Nodes (17): ExportModal(), ScopeBase, ToastProvider(), defaultFrom, renderModal(), scope(), today, addDaysIso() (+9 more)

### Community 16 - "protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository"
Cohesion: 0.17
Nodes (13): APIRoute, fastapi_routing, fastapi_testclient, protab_adapters_inbound_api_app, protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository, test_daily_activity_full_flow_over_http(), business_routes(), Business routes must be authenticated by default (allowlist, not denylist).… (+5 more)

### Community 17 - "useToast.tsx"
Cohesion: 0.10
Nodes (17): FeaiTagInput(), FeaiTagInputProps, UndoEntry, undoTitle(), ToastContainer(), ToastAction, ToastActionsContext, ToastActionsType (+9 more)

### Community 18 - "DailyActivity"
Cohesion: 0.16
Nodes (17): DailyActivity, test_daily_activity_creation_valid(), test_daily_activity_duplicate_feai_rejected(), test_daily_activity_errors_reported_negative(), test_daily_activity_incidents_created_negative(), test_daily_activity_incidents_exceed_errors(), test_daily_activity_invalid_feai_format(), test_daily_activity_mark_completed() (+9 more)

### Community 19 - "postgres_scope_monitoring_repository_test.py"
Cohesion: 0.07
Nodes (41): pytest, RuntimeError, MissingProjectContextError, No authenticated request established the project to read or write., reset_current_project(), set_current_project(), project(), project() (+33 more)

### Community 20 - "api_config_test.py"
Cohesion: 0.14
Nodes (18): dotenv, os, parametrize, cookie_secure_from_env(), host_port_from_env(), InvalidPortError, Exception, Resolve host/port from env values, falling back to defaults. (+10 more)

### Community 21 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+11 more)

### Community 22 - "ScopeMonitoringRepository"
Cohesion: 0.09
Nodes (12): AuditTrailRepository, Protocol, Persist an audit event., Protocol, Persist the given ScopeMonitoring. Replaces the whole aggregate: the scope row…, Add one activity to an existing scope. Raises: DuplicateDailyActivityError: the…, Overwrite the counters of a single day, leaving the others alone. The…, Return the ScopeMonitoring with the given id, or None. (+4 more)

### Community 23 - "kpi.ts"
Cohesion: 0.21
Nodes (17): ScopeListPage(), baselineDelta, buildCumulativeTrend(), buildDailyTrend(), coverageRate(), CumulativeTrendPoint, DailyTrendPoint, DEFAULT_NON_WORKING_DAYS (+9 more)

### Community 24 - "create_daily_activity_test.py"
Cohesion: 0.36
Nodes (11): handle_create_daily_activity(), CreateDailyActivityCommand, CreateDailyActivityUseCase, make_command(), make_scope(), make_scope_daily_activity(), test_create_daily_activity(), test_create_duplicate_day_raises_and_persists_nothing() (+3 more)

### Community 25 - "Rule Categories by Priority (1-10)"
Cohesion: 0.20
Nodes (12): Design Dials (variance / motion / density), Design System Generation (--design-system), Design System Persistence (Master + Overrides), Pre-Delivery UI Checklist, Search Query Contract, Rule Categories by Priority (1-10), ui-ux-pro-max Search Script, Stack Detection Step (+4 more)

### Community 26 - "queries_test.py"
Cohesion: 0.15
Nodes (14): protab_application_queries_get_daily_activity, protab_application_queries_get_scope, protab_application_queries_list_scopes, GetDailyActivityUseCase, GetScopeUseCase, ListScopesUseCase, make_scope(), test_get_daily_activity_day_not_found_raises() (+6 more)

### Community 27 - "ProTab Project Documentation"
Cohesion: 0.18
Nodes (11): Avoid Premature Abstraction, PostgreSQL Integration Tests (make test-db), SOLID Principles, Aggregate Owns DailyActivities Indexed by Day, CSV Import Inbound Adapter, DailyActivity (Entity), Day Is Not a Class (datetime.date as value object), Domain Invariants (counters, FEAI format, completion implication) (+3 more)

### Community 28 - "audit_log_api_test.py"
Cohesion: 0.16
Nodes (16): contextvars, protab_adapters_outbound_persistence_in_memory_audit_trail_repository, project_context(), Per-request audit context. Mirrors the ``_CURRENT_PROJECT_ID`` ContextVar…, reset_current_actor(), set_current_actor(), all_events(), clear_actor() (+8 more)

### Community 29 - "update_daily_activity_test.py"
Cohesion: 0.38
Nodes (10): handle_update_daily_activity(), UpdateDailyActivityCommand, UpdateDailyActivityUseCase, make_scope_with_activity(), A PATCH must not rewrite the whole scope. Rewriting the aggregate persists…, test_update_daily_activity(), test_update_day_without_activity_raises(), test_update_invalid_invariant_raises_and_does_not_modify() (+2 more)

### Community 30 - "FastAPI & PostgreSQL Performance Optimizer Skill"
Cohesion: 0.22
Nodes (10): Caching Layer & Background Task Offloading, Connection Pooling Parameters, Database Indexing Strategy, Diagnostic & Audit Checklist, Event Loop Stall Detection, FastAPI & PostgreSQL Performance Optimizer Skill, N+1 Query Pattern Detection, Payload & Serialization Optimization (+2 more)

### Community 31 - "complete_daily_activity_test.py"
Cohesion: 0.31
Nodes (13): protab_application_use_cases_complete_daily_activity, complete_daily_activities(), CompleteDailyActivityCommand, CompleteDailyActivityUseCase, make_activity(), make_scope(), All days are resolved before anything is written. Completing day 1 then failing…, test_complete_day_without_activity_raises() (+5 more)

### Community 32 - "Hexagonal Architecture (Ports and Adapters)"
Cohesion: 0.22
Nodes (9): Adapters (Inbound / Outbound), Dependency Injection and Composition Root, Dependency Rule (Adapters → Ports → Application → Domain), Domain Layer, Domain Error Handling and Adapter Translation, Framework Isolation, Hexagonal Architecture (Ports and Adapters), Ports (Inbound and Outbound Contracts) (+1 more)

### Community 33 - "PostgresScopeMonitoringRepository"
Cohesion: 0.31
Nodes (9): API Configuration via load_dotenv and os.getenv, Configuration and Secrets Management, Idempotent Schema Bootstrap (CREATE TABLE IF NOT EXISTS), InMemoryScopeMonitoringRepository, Centralized PostgreSQL Pool Configuration, PostgresScopeMonitoringRepository, ProTab Infrastructure Notes, ScopeMonitoringRepository Outbound Port (+1 more)

### Community 34 - "api Service (FastAPI backend)"
Cohesion: 0.31
Nodes (9): api Healthcheck (/healthz), api Service (FastAPI backend), db Healthcheck (pg_isready), db Service (postgres:17-alpine), ProTab Development Docker Stack, frontend Service (React/nginx build), pgdata Named Volume, FastAPI HTTP Inbound Adapter (+1 more)

### Community 35 - "project_admin_test.py"
Cohesion: 0.09
Nodes (23): ConnectionPool, protab, psycopg, psycopg_pool, build_connection_pool(), ping_check(), Connection, Shared PostgreSQL connection-pool configuration for persistence adapters. (+15 more)

### Community 36 - "Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring)"
Cohesion: 0.33
Nodes (7): Audit Trail (best-effort mutation journal), Atomic ScopeMonitoring Creation, Domain Error to HTTP Status Mapping, Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring), Query Use Cases (ListScopes, GetScope, GetDailyActivity, ListAuditEvents), REST Routes and Status Codes Table, React Root Mount (#root)

### Community 37 - "Development Workflow (9 Steps)"
Cohesion: 0.40
Nodes (6): Definition of Done Checklist, Development Workflow (9 Steps), Documentation Synchronization Requirement, Graphify Knowledge Graph Workflow, Test-Driven Development (RED/GREEN/REFACTOR), Testing Strategy (Test Pyramid)

### Community 38 - "Project Authentication with Quadrigramme Restriction"
Cohesion: 0.50
Nodes (4): Default Project Seeding Env Vars, Project Authentication with Quadrigramme Restriction, Per-Project Working Days Settings, Quadrigramme Bootstrap Exemption

### Community 40 - "CreateScopeMonitoringUseCase"
Cohesion: 0.28
Nodes (10): protab_application_use_cases_create_scope_monitoring, current_actor(), CreateScopeMonitoringCommand, CreateScopeMonitoringUseCase, test_create_scope_records_audit_event_with_actor(), make_command(), test_create_duplicate_name_raises_and_persists_nothing(), test_create_empty_official_raises() (+2 more)

### Community 74 - "postgres_auth_repository_test.py"
Cohesion: 0.11
Nodes (21): add_scope(), bootstrap_password(), empty_database(), fixture, Integration tests for the PostgreSQL auth repository rule: the quadrigramme…, The password is only needed to seed; a restart must not require it. Requiring…, ``official_main`` encodes several codes just like ``official_backup``., ``?`` marks the absence of a backup official, it is not a code. (+13 more)

### Community 75 - "PostgresScopeMonitoringRepository"
Cohesion: 0.17
Nodes (8): PostgresScopeMonitoringRepository, Connection, date, Persist ``ScopeMonitoring`` aggregates in PostgreSQL. The schema is applied…, Open the connection pool and apply the (idempotent) schema., Close the connection pool, releasing database connections., Return the current project id, or refuse to touch the database. Every read and…, require_current_project()

### Community 76 - "_official_codes"
Cohesion: 0.29
Nodes (9): _official_codes(), Quadrigrammes declared by one ``officials`` column (format « A/B »).…, Parsing of the officials columns that gate the quadrigramme. Both…, ``MRAM/ ?`` means "MRAM, no backup": ``?`` is not a quadrigramme., test_handles_empty_and_none(), test_ignores_punctuation_only_parts(), test_placeholder_is_not_a_code(), test_splits_multiple_codes() (+1 more)

### Community 77 - "DateNavigator.tsx"
Cohesion: 0.52
Nodes (6): DateNavigator(), DateNavigatorProps, formatDayMonthFr(), formatWeekdayFr(), shiftDay(), isValidIsoDate()

### Community 78 - "._translate_unique_violation"
Cohesion: 0.33
Nodes (4): Exception, DuplicateDailyActivityError, Raised when a ScopeMonitoring already has a DailyActivity for the given day., UniqueViolation

### Community 79 - "resolve_bootstrap_password"
Cohesion: 0.36
Nodes (7): Return the password seeding the first project, or refuse to start. Called only…, resolve_bootstrap_password(), The bootstrap project password must never fall back to a hardcoded default. A…, test_blank_variable_raises(), test_missing_variable_raises(), test_returns_the_configured_password(), test_trims_surrounding_whitespace()

### Community 80 - "PostgresAuthRepository"
Cohesion: 0.12
Nodes (11): hashlib, hmac, psycopg_types_json, secrets, AuthSession, _check_password(), _hash_password(), PostgresAuthRepository (+3 more)

### Community 82 - "Tally plutôt qu'un tableur"
Cohesion: 0.29
Nodes (6): Ce qu'un tableur fait mieux, Ce que coûte un tableur partagé, Ce que Tally change, En résumé, Quand ne pas migrer, Tally plutôt qu'un tableur

### Community 83 - "ScopeListPage.tsx"
Cohesion: 0.12
Nodes (33): lucide-react, react, recharts, ActivityFormModal(), Badge(), BadgeProps, CompleteActivitiesModal(), CompleteTodayButton() (+25 more)

### Community 84 - "ScopeMonitoring"
Cohesion: 0.16
Nodes (4): date, ScopeMonitoring, date, RecordingScopeMonitoringRepository

### Community 85 - "protab_domain_exceptions"
Cohesion: 0.15
Nodes (13): protab_adapters_outbound_persistence_postgres_pool, protab_adapters_outbound_persistence_postgres_scope_monitoring_repository, protab_application_actor_context, protab_application_commands_daily_activity, protab_domain_entities_audit_event, protab_domain_entities_daily_activity, protab_domain_entities_scope_monitoring, protab_domain_exceptions (+5 more)

### Community 86 - "build_changes"
Cohesion: 0.36
Nodes (7): build_changes(), Return only the fields whose value differs between ``before`` and ``after``.…, test_audit_event_defaults(), test_build_changes_empty_when_identical(), test_build_changes_from_empty_keeps_all_fields(), test_build_changes_handles_removed_fields(), test_build_changes_keeps_only_different_fields()

## Ambiguous Edges - Review These
- `React Root Mount (#root)` → `Audit Trail (best-effort mutation journal)`  [AMBIGUOUS]
  src/FrontEnd/index.html · relation: conceptually_related_to

## Knowledge Gaps
- **121 isolated node(s):** `$schema`, `plugin`, `protab`, `name`, `private` (+116 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 343 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **35 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `React Root Mount (#root)` and `Audit Trail (best-effort mutation journal)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `create_app()` connect `create_app` to `app.py`, `scope_monitoring_csv_reader_test.py`, `AuditEvent`, `CreateScopeMonitoringUseCase`, `api_test.py`, `FakeAuthRepository`, `PostgresAuthRepository`, `protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository`, `postgres_scope_monitoring_repository_test.py`, `ScopeMonitoringRepository`, `create_daily_activity_test.py`, `queries_test.py`, `audit_log_api_test.py`, `update_daily_activity_test.py`, `complete_daily_activity_test.py`?**
  _High betweenness centrality (0.101) - this node is a cross-community bridge._
- **Why does `DailyActivity` connect `DailyActivity` to `app.py`, `DomainError`, `InMemoryScopeMonitoringRepository`, `Officials`, `api_test.py`, `PostgresScopeMonitoringRepository`, `create_app`, `datetime`, `._translate_unique_violation`, `postgres_scope_monitoring_repository_test.py`, `ScopeMonitoring`, `ScopeMonitoringRepository`, `create_daily_activity_test.py`, `queries_test.py`, `audit_log_api_test.py`, `update_daily_activity_test.py`, `complete_daily_activity_test.py`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Why does `PostgresAuthRepository` connect `PostgresAuthRepository` to `Project`, `postgres_auth_repository_test.py`, `create_app`, `project_admin_test.py`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Are the 53 inferred relationships involving `DailyActivity` (e.g. with `_activity_to_response()` and `InMemoryScopeMonitoringRepository`) actually correct?**
  _`DailyActivity` has 53 INFERRED edges - model-reasoned connections that need verification._
- **Are the 49 inferred relationships involving `create_app()` (e.g. with `close_persistence()` and `project_context()`) actually correct?**
  _`create_app()` has 49 INFERRED edges - model-reasoned connections that need verification._
- **Are the 46 inferred relationships involving `InMemoryScopeMonitoringRepository` (e.g. with `DailyActivity` and `ScopeMonitoring`) actually correct?**
  _`InMemoryScopeMonitoringRepository` has 46 INFERRED edges - model-reasoned connections that need verification._