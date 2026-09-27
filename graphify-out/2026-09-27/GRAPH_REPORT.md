# Graph Report - ProTab  (2026-09-27)

## Corpus Check
- 153 files · ~52,922 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: (none) 8, .example 1, .conf 1)

## Summary
- 1078 nodes · 2496 edges · 86 communities (52 shown, 34 thin omitted)
- Extraction: 80% EXTRACTED · 20% INFERRED · 0% AMBIGUOUS · INFERRED: 488 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `67ce7854`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- react
- project_admin_test.py
- package.json
- App.tsx
- scope_monitoring_csv_reader_test.py
- api.ts
- DomainError
- TodayActivityEditor.tsx
- AuditEvent
- Officials
- api_test.py
- create_app
- datetime
- pytest
- queries_test.py
- ExportModal.tsx
- protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository
- vitest
- CreateScopeMonitoringUseCase
- DailyActivity
- project_admin.py
- compilerOptions
- ScopeMonitoringRepository
- ScopeListPage.tsx
- create_daily_activity_test.py
- Rule Categories by Priority (1-10)
- InMemoryScopeMonitoringRepository
- ProTab Project Documentation
- audit_log_api_test.py
- update_daily_activity_test.py
- FastAPI & PostgreSQL Performance Optimizer Skill
- complete_daily_activity_test.py
- Hexagonal Architecture (Ports and Adapters)
- PostgresScopeMonitoringRepository
- api Service (FastAPI backend)
- build_connection_pool
- Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring)
- Development Workflow (9 Steps)
- Project Authentication with Quadrigramme Restriction
- opencode.json
- ._translate_unique_violation
- Application Layer / Use Cases
- protab
- MissingProjectContextError
- PostgresAuthRepository
- postgres_auth_repository_test.py
- FakeAuthRepository
- _official_codes
- EmptyOfficialsError
- resolve_bootstrap_password
- postgres_auth_repository.py
- protab_adapters_outbound_persistence_postgres_auth_repository
- PostgresScopeMonitoringRepository
- ScopeDetailPage.tsx
- ScopeMonitoring
- app.py
- build_changes

## God Nodes (most connected - your core abstractions)
1. `DailyActivity` - 74 edges
2. `create_app()` - 69 edges
3. `InMemoryScopeMonitoringRepository` - 58 edges
4. `ScopeMonitoring` - 47 edges
5. `ScopeMonitoringRepository` - 28 edges
6. `PostgresScopeMonitoringRepository` - 26 edges
7. `AuditEvent` - 25 edges
8. `react` - 24 edges
9. `useToast()` - 23 edges
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

## Communities (86 total, 34 thin omitted)

### Community 0 - "react"
Cohesion: 0.12
Nodes (28): lucide-react, react, CompleteActivitiesModal(), CsvImportModal(), CsvImportModalProps, Modal(), ModalProps, ScopeFormModal() (+20 more)

### Community 1 - "project_admin_test.py"
Cohesion: 0.22
Nodes (13): protab, bootstrap_password(), fixture, Integration tests for the ``protab-project`` administrative command. The…, Rotating a leaked password must not leave old sessions usable., repository(), run(), stored_hash() (+5 more)

### Community 2 - "package.json"
Cohesion: 0.05
Nodes (41): IMPORTANT: keep the reminder string free of backticks and $(...) constructs., ref_fs, jsdom, ref_path, tailwindcss, @tailwindcss/vite, @types/node, @types/react (+33 more)

### Community 3 - "App.tsx"
Cohesion: 0.11
Nodes (16): react-dom, react-router-dom, App(), AuditShortcut(), Navbar(), NavbarProps, AUDIT_LOG_PATH, Theme (+8 more)

### Community 4 - "scope_monitoring_csv_reader_test.py"
Cohesion: 0.15
Nodes (26): csv, fastapi_responses, JSONResponse, Path, pathlib, protab_adapters_inbound_csv_scope_monitoring_csv_reader, protab_application_commands_create_scope_monitoring, bad_request() (+18 more)

### Community 5 - "api.ts"
Cohesion: 0.11
Nodes (27): AuditActivityHeatmap(), AuditActivityHeatmapProps, HOURS, intensityClass(), WEEKDAYS, ACTION_ICONS, ACTION_LABELS, AuditLogPage() (+19 more)

### Community 6 - "DomainError"
Cohesion: 0.14
Nodes (24): date, DuplicateFeaiReferenceError, IncidentsExceedErrorsError, InvalidFeaiReferenceError, NegativeErrorsCountError, NegativeIncidentsCountError, Raised when incidents_created exceeds errors_reported., Raised when a FEAI reference does not match the expected format. (+16 more)

### Community 7 - "TodayActivityEditor.tsx"
Cohesion: 0.13
Nodes (21): ActivityFormModalProps, CompleteActivitiesModalProps, FeaiTagInput(), FeaiTagInputProps, InlineActivityCounters(), InlineActivityCountersProps, SaveStatus, ValueSnapshot (+13 more)

### Community 8 - "AuditEvent"
Cohesion: 0.12
Nodes (18): InMemoryAuditTrailRepository, PostgresAuditTrailRepository, Open the connection pool and apply the (idempotent) schema., Close the connection pool, releasing database connections., current_project_id(), ListAuditEventsUseCase, AuditEvent, AuditEventQuery (+10 more)

### Community 9 - "Officials"
Cohesion: 0.14
Nodes (18): KnowledgeBase, Officials, fixture_scope_monitoring(), fixture, Adding a second DailyActivity for the same day should raise…, Multiple DailyActivities for different days should be allowed., Different ScopeMonitoring instances can have activities on the same day., Adding a DailyActivity for a new day should succeed. (+10 more)

### Community 10 - "api_test.py"
Cohesion: 0.09
Nodes (16): client(), create_scope_via_api(), make_scope_with_activity(), fixture, test_complete_daily_activities_returns_204(), test_complete_day_without_activity_returns_404(), test_create_daily_activity_duplicate_day_returns_409(), test_create_daily_activity_invalid_invariant_returns_400() (+8 more)

### Community 11 - "create_app"
Cohesion: 0.09
Nodes (43): BaseModel, field_validator, pydantic, Response, _activity_to_response(), _audit_event_to_response(), create_app(), create_scope_monitorings() (+35 more)

### Community 12 - "datetime"
Cohesion: 0.12
Nodes (14): dataclasses, datetime, protab_adapters_outbound_persistence_postgres_pool, protab_domain_entities_daily_activity, protab_domain_entities_scope_monitoring, protab_domain_exceptions, protab_ports_outbound_scope_monitoring_repository, psycopg (+6 more)

### Community 13 - "pytest"
Cohesion: 0.16
Nodes (16): protab_adapters_outbound_persistence_postgres_audit_trail_repository, pytest, reset_current_project(), make_event(), project(), fixture, Integration tests for the PostgreSQL audit trail adapter. Skipped when…, repo() (+8 more)

### Community 14 - "queries_test.py"
Cohesion: 0.18
Nodes (11): GetDailyActivityUseCase, GetScopeUseCase, ListScopesUseCase, make_scope(), test_get_daily_activity_day_not_found_raises(), test_get_daily_activity_found(), test_get_daily_activity_scope_not_found_raises(), test_get_scope_found() (+3 more)

### Community 15 - "ExportModal.tsx"
Cohesion: 0.27
Nodes (11): ExportModal(), ScopeBase, buildExportRows(), CsvSeparator, downloadFile(), exportFilename(), ExportFormat, ExportRow (+3 more)

### Community 16 - "protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository"
Cohesion: 0.17
Nodes (13): APIRoute, fastapi_routing, fastapi_testclient, protab_adapters_inbound_api_app, protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository, test_daily_activity_full_flow_over_http(), business_routes(), Business routes must be authenticated by default (allowlist, not denylist).… (+5 more)

### Community 17 - "vitest"
Cohesion: 0.14
Nodes (16): @testing-library/jest-dom, @testing-library/react, vitest, ScopeDetailCharts(), ToastProvider(), json(), PROJECT, SESSION (+8 more)

### Community 18 - "CreateScopeMonitoringUseCase"
Cohesion: 0.38
Nodes (8): protab_application_use_cases_create_scope_monitoring, CreateScopeMonitoringCommand, CreateScopeMonitoringUseCase, make_command(), test_create_duplicate_name_raises_and_persists_nothing(), test_create_empty_official_raises(), test_create_invalid_knowledge_base_id_raises(), test_create_multiple_scope_monitorings()

### Community 19 - "DailyActivity"
Cohesion: 0.05
Nodes (53): set_current_project(), DailyActivity, date, Add one activity to an existing scope. Raises: DuplicateDailyActivityError: the…, Overwrite the counters of a single day, leaving the others alone. The…, make_scope(), project_context(), date (+45 more)

### Community 20 - "project_admin.py"
Cohesion: 0.08
Nodes (32): argparse, dotenv, getpass, os, parametrize, protab_adapters_inbound_api_config, build_repository(), Select the persistence adapter from configuration. PostgreSQL is required for… (+24 more)

### Community 21 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+11 more)

### Community 22 - "ScopeMonitoringRepository"
Cohesion: 0.11
Nodes (11): AuditTrailRepository, Protocol, date, Protocol, Persist the given ScopeMonitoring. Replaces the whole aggregate: the scope row…, Flag the given days as handled and completed. Counters are never modified, and…, Return the ScopeMonitoring with the given id, or None., Return the ScopeMonitoring with the given name, or None. (+3 more)

### Community 23 - "ScopeListPage.tsx"
Cohesion: 0.16
Nodes (21): Badge(), BadgeProps, CompleteTodayButton(), CompleteTodayButtonProps, QuickFilter, ScopeListPage(), baselineDelta, buildCumulativeTrend() (+13 more)

### Community 24 - "create_daily_activity_test.py"
Cohesion: 0.29
Nodes (12): handle_create_daily_activity(), current_actor(), CreateDailyActivityCommand, CreateDailyActivityUseCase, make_command(), make_scope(), make_scope_daily_activity(), test_create_daily_activity() (+4 more)

### Community 25 - "Rule Categories by Priority (1-10)"
Cohesion: 0.20
Nodes (12): Design Dials (variance / motion / density), Design System Generation (--design-system), Design System Persistence (Master + Overrides), Pre-Delivery UI Checklist, Search Query Contract, Rule Categories by Priority (1-10), ui-ux-pro-max Search Script, Stack Detection Step (+4 more)

### Community 27 - "ProTab Project Documentation"
Cohesion: 0.18
Nodes (11): Avoid Premature Abstraction, PostgreSQL Integration Tests (make test-db), SOLID Principles, Aggregate Owns DailyActivities Indexed by Day, CSV Import Inbound Adapter, DailyActivity (Entity), Day Is Not a Class (datetime.date as value object), Domain Invariants (counters, FEAI format, completion implication) (+3 more)

### Community 28 - "audit_log_api_test.py"
Cohesion: 0.16
Nodes (15): contextvars, protab_adapters_outbound_persistence_in_memory_audit_trail_repository, Per-request audit context. Mirrors the ``_CURRENT_PROJECT_ID`` ContextVar…, reset_current_actor(), set_current_actor(), all_events(), clear_actor(), env() (+7 more)

### Community 29 - "update_daily_activity_test.py"
Cohesion: 0.38
Nodes (10): handle_update_daily_activity(), UpdateDailyActivityCommand, UpdateDailyActivityUseCase, make_scope_with_activity(), A PATCH must not rewrite the whole scope. Rewriting the aggregate persists…, test_update_daily_activity(), test_update_day_without_activity_raises(), test_update_invalid_invariant_raises_and_does_not_modify() (+2 more)

### Community 30 - "FastAPI & PostgreSQL Performance Optimizer Skill"
Cohesion: 0.22
Nodes (10): Caching Layer & Background Task Offloading, Connection Pooling Parameters, Database Indexing Strategy, Diagnostic & Audit Checklist, Event Loop Stall Detection, FastAPI & PostgreSQL Performance Optimizer Skill, N+1 Query Pattern Detection, Payload & Serialization Optimization (+2 more)

### Community 31 - "complete_daily_activity_test.py"
Cohesion: 0.35
Nodes (12): complete_daily_activities(), CompleteDailyActivityCommand, CompleteDailyActivityUseCase, make_activity(), make_scope(), All days are resolved before anything is written. Completing day 1 then failing…, test_complete_day_without_activity_raises(), test_complete_does_not_touch_earlier_days_when_a_later_day_is_missing() (+4 more)

### Community 32 - "Hexagonal Architecture (Ports and Adapters)"
Cohesion: 0.22
Nodes (9): Adapters (Inbound / Outbound), Dependency Injection and Composition Root, Dependency Rule (Adapters → Ports → Application → Domain), Domain Layer, Domain Error Handling and Adapter Translation, Framework Isolation, Hexagonal Architecture (Ports and Adapters), Ports (Inbound and Outbound Contracts) (+1 more)

### Community 33 - "PostgresScopeMonitoringRepository"
Cohesion: 0.31
Nodes (9): API Configuration via load_dotenv and os.getenv, Configuration and Secrets Management, Idempotent Schema Bootstrap (CREATE TABLE IF NOT EXISTS), InMemoryScopeMonitoringRepository, Centralized PostgreSQL Pool Configuration, PostgresScopeMonitoringRepository, ProTab Infrastructure Notes, ScopeMonitoringRepository Outbound Port (+1 more)

### Community 34 - "api Service (FastAPI backend)"
Cohesion: 0.31
Nodes (9): api Healthcheck (/healthz), api Service (FastAPI backend), db Healthcheck (pg_isready), db Service (postgres:17-alpine), ProTab Development Docker Stack, frontend Service (React/nginx build), pgdata Named Volume, FastAPI HTTP Inbound Adapter (+1 more)

### Community 35 - "build_connection_pool"
Cohesion: 0.15
Nodes (9): ConnectionPool, psycopg_pool, build_connection_pool(), ping_check(), Connection, Shared PostgreSQL connection-pool configuration for persistence adapters., Check connectivity and leave the connection outside a transaction., Build a tuned, initially closed synchronous PostgreSQL pool. (+1 more)

### Community 36 - "Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring)"
Cohesion: 0.33
Nodes (7): Audit Trail (best-effort mutation journal), Atomic ScopeMonitoring Creation, Domain Error to HTTP Status Mapping, Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring), Query Use Cases (ListScopes, GetScope, GetDailyActivity, ListAuditEvents), REST Routes and Status Codes Table, React Root Mount (#root)

### Community 37 - "Development Workflow (9 Steps)"
Cohesion: 0.40
Nodes (6): Definition of Done Checklist, Development Workflow (9 Steps), Documentation Synchronization Requirement, Graphify Knowledge Graph Workflow, Test-Driven Development (RED/GREEN/REFACTOR), Testing Strategy (Test Pyramid)

### Community 38 - "Project Authentication with Quadrigramme Restriction"
Cohesion: 0.50
Nodes (4): Default Project Seeding Env Vars, Project Authentication with Quadrigramme Restriction, Per-Project Working Days Settings, Quadrigramme Bootstrap Exemption

### Community 40 - "._translate_unique_violation"
Cohesion: 0.29
Nodes (4): Exception, DuplicateDailyActivityError, Raised when a ScopeMonitoring already has a DailyActivity for the given day., UniqueViolation

### Community 72 - "MissingProjectContextError"
Cohesion: 0.67
Nodes (3): RuntimeError, MissingProjectContextError, No authenticated request established the project to read or write.

### Community 73 - "PostgresAuthRepository"
Cohesion: 0.21
Nodes (6): _hash_password(), _normalize_non_working_days(), PostgresAuthRepository, Project, Store project credentials and opaque, expiring session tokens., Replace the password of an existing project and drop its sessions. Rotating a…

### Community 74 - "postgres_auth_repository_test.py"
Cohesion: 0.11
Nodes (22): add_scope(), bootstrap_password(), empty_database(), project(), fixture, Integration tests for the PostgreSQL auth repository rule: the quadrigramme…, The password is only needed to seed; a restart must not require it. Requiring…, ``official_main`` encodes several codes just like ``official_backup``. (+14 more)

### Community 75 - "FakeAuthRepository"
Cohesion: 0.21
Nodes (10): FakeAuthRepository, login_and_read_session_cookie(), test_authenticated_routes_require_a_valid_session(), test_in_memory_application_remains_unauthenticated_for_existing_fixtures(), test_login_rejects_invented_quadrigramme_when_known_codes_exist(), test_project_settings_are_authenticated_and_project_scoped(), test_project_settings_reject_invalid_weekday(), test_session_cookie_is_httponly_and_samesite_lax() (+2 more)

### Community 76 - "_official_codes"
Cohesion: 0.29
Nodes (9): _official_codes(), Quadrigrammes declared by one ``officials`` column (format « A/B »).…, Parsing of the officials columns that gate the quadrigramme. Both…, ``MRAM/ ?`` means "MRAM, no backup": ``?`` is not a quadrigramme., test_handles_empty_and_none(), test_ignores_punctuation_only_parts(), test_placeholder_is_not_a_code(), test_splits_multiple_codes() (+1 more)

### Community 79 - "resolve_bootstrap_password"
Cohesion: 0.36
Nodes (7): Return the password seeding the first project, or refuse to start. Called only…, resolve_bootstrap_password(), The bootstrap project password must never fall back to a hardcoded default. A…, test_blank_variable_raises(), test_missing_variable_raises(), test_returns_the_configured_password(), test_trims_surrounding_whitespace()

### Community 80 - "postgres_auth_repository.py"
Cohesion: 0.25
Nodes (6): hashlib, hmac, psycopg_types_json, secrets, _check_password(), PostgreSQL persistence for projects and login sessions.

### Community 81 - "protab_adapters_outbound_persistence_postgres_auth_repository"
Cohesion: 0.22
Nodes (4): fastapi, protab_adapters_outbound_persistence_postgres_auth_repository, CurrentUser, AuthSession

### Community 82 - "PostgresScopeMonitoringRepository"
Cohesion: 0.19
Nodes (8): PostgresScopeMonitoringRepository, Connection, date, Persist ``ScopeMonitoring`` aggregates in PostgreSQL. The schema is applied…, Open the connection pool and apply the (idempotent) schema., Close the connection pool, releasing database connections., Return the current project id, or refuse to touch the database. Every read and…, require_current_project()

### Community 83 - "ScopeDetailPage.tsx"
Cohesion: 0.15
Nodes (21): recharts, ActivityFormModal(), DashboardCharts(), DashboardChartsProps, DateNavigator(), DateNavigatorProps, formatDayMonthFr(), formatWeekdayFr() (+13 more)

### Community 84 - "ScopeMonitoring"
Cohesion: 0.12
Nodes (3): ScopeMonitoring, date, RecordingScopeMonitoringRepository

### Community 85 - "app.py"
Cohesion: 0.14
Nodes (17): protab_adapters_inbound_api_auth, protab_adapters_inbound_api_errors, protab_adapters_inbound_api_schemas, protab_adapters_outbound_persistence_postgres_scope_monitoring_repository, protab_application_actor_context, protab_application_commands_daily_activity, protab_application_queries_get_daily_activity, protab_application_queries_get_scope (+9 more)

### Community 86 - "build_changes"
Cohesion: 0.36
Nodes (7): build_changes(), Return only the fields whose value differs between ``before`` and ``after``.…, test_audit_event_defaults(), test_build_changes_empty_when_identical(), test_build_changes_from_empty_keeps_all_fields(), test_build_changes_handles_removed_fields(), test_build_changes_keeps_only_different_fields()

## Ambiguous Edges - Review These
- `React Root Mount (#root)` → `Audit Trail (best-effort mutation journal)`  [AMBIGUOUS]
  src/FrontEnd/index.html · relation: conceptually_related_to

## Knowledge Gaps
- **111 isolated node(s):** `$schema`, `plugin`, `protab`, `name`, `private` (+106 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 324 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **34 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `React Root Mount (#root)` and `Audit Trail (best-effort mutation journal)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `create_app()` connect `create_app` to `scope_monitoring_csv_reader_test.py`, `AuditEvent`, `PostgresAuthRepository`, `api_test.py`, `FakeAuthRepository`, `queries_test.py`, `protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository`, `CreateScopeMonitoringUseCase`, `DailyActivity`, `project_admin.py`, `app.py`, `ScopeMonitoringRepository`, `create_daily_activity_test.py`, `audit_log_api_test.py`, `update_daily_activity_test.py`, `complete_daily_activity_test.py`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **Why does `DailyActivity` connect `DailyActivity` to `DomainError`, `._translate_unique_violation`, `AuditEvent`, `api_test.py`, `create_app`, `datetime`, `Officials`, `queries_test.py`, `PostgresScopeMonitoringRepository`, `ScopeMonitoring`, `ScopeMonitoringRepository`, `create_daily_activity_test.py`, `InMemoryScopeMonitoringRepository`, `audit_log_api_test.py`, `update_daily_activity_test.py`, `complete_daily_activity_test.py`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Why does `ScopeMonitoring` connect `ScopeMonitoring` to `._translate_unique_violation`, `AuditEvent`, `api_test.py`, `create_app`, `datetime`, `postgres_auth_repository_test.py`, `queries_test.py`, `Officials`, `PostgresScopeMonitoringRepository`, `CreateScopeMonitoringUseCase`, `DailyActivity`, `ScopeMonitoringRepository`, `create_daily_activity_test.py`, `InMemoryScopeMonitoringRepository`, `audit_log_api_test.py`, `update_daily_activity_test.py`, `complete_daily_activity_test.py`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Are the 53 inferred relationships involving `DailyActivity` (e.g. with `_activity_to_response()` and `InMemoryScopeMonitoringRepository`) actually correct?**
  _`DailyActivity` has 53 INFERRED edges - model-reasoned connections that need verification._
- **Are the 49 inferred relationships involving `create_app()` (e.g. with `close_persistence()` and `project_context()`) actually correct?**
  _`create_app()` has 49 INFERRED edges - model-reasoned connections that need verification._
- **Are the 46 inferred relationships involving `InMemoryScopeMonitoringRepository` (e.g. with `DailyActivity` and `ScopeMonitoring`) actually correct?**
  _`InMemoryScopeMonitoringRepository` has 46 INFERRED edges - model-reasoned connections that need verification._