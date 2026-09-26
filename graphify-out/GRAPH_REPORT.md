# Graph Report - ProTab  (2026-09-26)

## Corpus Check
- Corpus is ~45,723 words - fits in a single context window. You may not need a graph.

## Summary
- 935 nodes · 2164 edges · 72 communities (39 shown, 33 thin omitted)
- Extraction: 80% EXTRACTED · 19% INFERRED · 0% AMBIGUOUS · INFERRED: 421 edges (avg confidence: 0.92)
- Token cost: 10,136 input · 18,656 output

## Community Hubs (Navigation)
- Postgres Scope Monitoring Repository
- Connection Pool and Shared Infrastructure
- Graphify Plugin and Frontend Dependencies
- Modal and Layout UI Components
- API Configuration and Composition Root
- Audit Log Page and Activity Heatmap
- Daily Activity Invariants and Errors
- Activity Forms and Feai Input
- Audit Trail Persistence and Query
- Domain Entities and Repository Adapters
- Scope Monitoring API Tests
- FastAPI App Factory and Schemas
- Application Core Wiring
- Frontend Testing and Date Navigation
- Create ScopeMonitoring Use Case
- CSV Export and Date Utilities
- Auth Repository and Password Hashing
- Dashboard Charts with Recharts
- Query Use Cases
- PostgreSQL Integration Tests
- Auth Session and HTTP Flow Tests
- TypeScript Compiler Config
- Authentication HTTP Routes
- KPI Computation
- Create DailyActivity Use Case
- UI/UX Design System Skill
- Domain Commands and Port Interfaces
- ProTab Domain Model
- HTTP Error Mapping
- Update DailyActivity Use Case
- Performance Optimization Skill
- Complete DailyActivity Use Case
- Hexagonal Architecture Rules
- Persistence and Infrastructure Notes
- Docker Development Stack
- Audit Event Change Diffing
- API Surface and Audit Trail
- Development Workflow Rules
- Project Settings and Auth Rules
- opencode Plugin Config
- Weekday Field Validator
- Application Layer Overview
- Package Marker

## God Nodes (most connected - your core abstractions)
1. `create_app()` - 66 edges
2. `DailyActivity` - 52 edges
3. `InMemoryScopeMonitoringRepository` - 45 edges
4. `ScopeMonitoring` - 41 edges
5. `AuditEvent` - 25 edges
6. `react` - 24 edges
7. `ScopeMonitoringRepository` - 24 edges
8. `useToast()` - 23 edges
9. `PostgresScopeMonitoringRepository` - 23 edges
10. `lucide-react` - 21 edges

## Surprising Connections (you probably didn't know these)
- `Centralized PostgreSQL Pool Configuration` --semantically_similar_to--> `Connection Pooling Parameters`  [INFERRED] [semantically similar]
  AGENTS.md → .opencode/skills/improve-performances/SKILL.md
- `test_api_flow_persists_in_postgres()` --calls--> `create_app()`  [INFERRED]
  tests/integration/adapters/postgres_scope_monitoring_repository_test.py → src/protab/adapters/inbound/api/app.py
- `test_duplicate_name_via_api_returns_409()` --calls--> `create_app()`  [INFERRED]
  tests/integration/adapters/postgres_scope_monitoring_repository_test.py → src/protab/adapters/inbound/api/app.py
- `test_build_connection_pool_uses_tuned_configuration()` --calls--> `build_connection_pool()`  [INFERRED]
  tests/unit/adapters/postgres_pool_test.py → src/protab/adapters/outbound/persistence/postgres_pool.py
- `test_audit_event_defaults()` --uses--> `AuditEvent`  [INFERRED]
  tests/unit/domain/audit_event_test.py → src/protab/domain/entities/audit_event.py

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **ProTab Hexagonal Core and Its Adapters** — agents_hexagonal_architecture, readme_scope_monitoring_aggregate, readme_mutation_use_cases, agents_scopemonitoringrepository_port, readme_http_api_adapter, readme_csv_import_adapter, readme_postgres_persistence [INFERRED 0.95]
- **ProTab PostgreSQL Persistence Path (port → adapter → pool → container)** — agents_scopemonitoringrepository_port, agents_postgres_scopemonitoringrepository, agents_idempotent_schema_bootstrap, agents_postgres_pool_configuration, readme_postgres_persistence, readme_scope_monitorings_index, docker_compose_db_service, docker_compose_api_service [INFERRED 0.85]
- **ProTab Mutation → Audit Trail Flow** — readme_mutation_use_cases, readme_audit_trail, readme_domain_invariants, readme_domain_error_http_mapping, readme_rest_routes_table [INFERRED 0.85]

## Communities (72 total, 33 thin omitted)

### Community 0 - "Postgres Scope Monitoring Repository"
Cohesion: 0.05
Nodes (38): current_project_id(), PostgresScopeMonitoringRepository, Connection, date, Exception, Persist ``ScopeMonitoring`` aggregates in PostgreSQL. The schema is applied…, Open the connection pool and apply the (idempotent) schema., Close the connection pool, releasing database connections. (+30 more)

### Community 1 - "Connection Pool and Shared Infrastructure"
Cohesion: 0.05
Nodes (41): ConnectionPool, contextvars, protab_adapters_outbound_persistence_postgres_audit_trail_repository, psycopg, psycopg_pool, project_context(), build_connection_pool(), ping_check() (+33 more)

### Community 2 - "Graphify Plugin and Frontend Dependencies"
Cohesion: 0.04
Nodes (44): IMPORTANT: keep the reminder string free of backticks and $(...) constructs., ref_fs, jsdom, ref_path, react-dom, tailwindcss, @tailwindcss/vite, @types/node (+36 more)

### Community 3 - "Modal and Layout UI Components"
Cohesion: 0.09
Nodes (29): lucide-react, react-router-dom, AuditShortcut(), CompleteActivitiesModal(), CsvImportModal(), CsvImportModalProps, Modal(), ModalProps (+21 more)

### Community 4 - "API Configuration and Composition Root"
Cohesion: 0.08
Nodes (35): argparse, dotenv, getpass, os, Path, pathlib, protab_adapters_inbound_api_config, pytest (+27 more)

### Community 5 - "Audit Log Page and Activity Heatmap"
Cohesion: 0.11
Nodes (27): AuditActivityHeatmap(), AuditActivityHeatmapProps, HOURS, intensityClass(), WEEKDAYS, ToastProvider(), ACTION_ICONS, ACTION_LABELS (+19 more)

### Community 6 - "Daily Activity Invariants and Errors"
Cohesion: 0.11
Nodes (28): date, DuplicateFeaiReferenceError, IncidentsExceedErrorsError, InvalidFeaiReferenceError, NegativeErrorsCountError, NegativeIncidentsCountError, Raised when incidents_created exceeds errors_reported., Raised when a FEAI reference does not match the expected format. (+20 more)

### Community 7 - "Activity Forms and Feai Input"
Cohesion: 0.12
Nodes (26): react, ActivityFormModal(), ActivityFormModalProps, CompleteActivitiesModalProps, FeaiTagInput(), FeaiTagInputProps, InlineActivityCounters(), InlineActivityCountersProps (+18 more)

### Community 8 - "Audit Trail Persistence and Query"
Cohesion: 0.13
Nodes (20): _audit_event_to_response(), list_scope_audit_log(), InMemoryAuditTrailRepository, PostgresAuditTrailRepository, Open the connection pool and apply the (idempotent) schema., Close the connection pool, releasing database connections., CreateScopeMonitoringCommand, CreateScopeMonitoringUseCase (+12 more)

### Community 9 - "Domain Entities and Repository Adapters"
Cohesion: 0.11
Nodes (23): protab_adapters_outbound_persistence_in_memory_audit_trail_repository, protab_adapters_outbound_persistence_postgres_pool, protab_domain_entities_daily_activity, protab_domain_entities_scope_monitoring, PostgreSQL outbound adapter for the ScopeMonitoringRepository port. The…, KnowledgeBase, Officials, all_events() (+15 more)

### Community 10 - "Scope Monitoring API Tests"
Cohesion: 0.09
Nodes (16): client(), create_scope_via_api(), make_scope_with_activity(), fixture, test_complete_daily_activities_returns_204(), test_complete_day_without_activity_returns_404(), test_create_daily_activity_duplicate_day_returns_409(), test_create_daily_activity_invalid_invariant_returns_400() (+8 more)

### Community 11 - "FastAPI App Factory and Schemas"
Cohesion: 0.14
Nodes (27): BaseModel, pydantic, _activity_to_response(), create_app(), create_scope_monitorings(), get_scope_daily_activity(), get_scope_monitoring(), import_scope_monitorings_csv() (+19 more)

### Community 12 - "Application Core Wiring"
Cohesion: 0.12
Nodes (19): csv, protab_adapters_inbound_api_auth, protab_adapters_inbound_api_errors, protab_adapters_inbound_api_schemas, protab_adapters_inbound_csv_scope_monitoring_csv_reader, protab_adapters_outbound_persistence_postgres_scope_monitoring_repository, protab_application_actor_context, protab_application_commands_create_scope_monitoring (+11 more)

### Community 13 - "Frontend Testing and Date Navigation"
Cohesion: 0.12
Nodes (17): @testing-library/jest-dom, @testing-library/react, vitest, DashboardCharts(), DateNavigator(), DateNavigatorProps, formatDayMonthFr(), formatWeekdayFr() (+9 more)

### Community 14 - "Create ScopeMonitoring Use Case"
Cohesion: 0.13
Nodes (18): protab_application_queries_get_daily_activity, protab_application_queries_get_scope, protab_application_queries_list_scopes, protab_application_use_cases_create_scope_monitoring, InMemoryScopeMonitoringRepository, make_command(), test_create_duplicate_name_raises_and_persists_nothing(), test_create_empty_official_raises() (+10 more)

### Community 15 - "CSV Export and Date Utilities"
Cohesion: 0.17
Nodes (19): ExportModal(), ScopeBase, defaultFrom, renderModal(), scope(), today, addDaysIso(), formatFullDateFr() (+11 more)

### Community 16 - "Auth Repository and Password Hashing"
Cohesion: 0.13
Nodes (12): hashlib, hmac, secrets, _backup_codes(), _check_password(), _hash_password(), _normalize_non_working_days(), PostgresAuthRepository (+4 more)

### Community 17 - "Dashboard Charts with Recharts"
Cohesion: 0.14
Nodes (18): recharts, Badge(), BadgeProps, CompleteTodayButton(), CompleteTodayButtonProps, DashboardChartsProps, ExportModalProps, ScopeDetailCharts() (+10 more)

### Community 18 - "Query Use Cases"
Cohesion: 0.11
Nodes (10): GetDailyActivityUseCase, GetScopeUseCase, ListAuditEventsUseCase, ListScopesUseCase, AuditTrailRepository, Protocol, Persist an audit event., Protocol (+2 more)

### Community 19 - "PostgreSQL Integration Tests"
Cohesion: 0.13
Nodes (17): make_scope(), date, fixture, Integration tests for the PostgreSQL repository adapter. These tests exercise…, repo(), test_api_flow_persists_in_postgres(), test_duplicate_name_via_api_returns_409(), test_find_all_loads_activities_for_all_scopes() (+9 more)

### Community 20 - "Auth Session and HTTP Flow Tests"
Cohesion: 0.14
Nodes (11): fastapi_testclient, protab_adapters_inbound_api_app, protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository, AuthSession, test_daily_activity_full_flow_over_http(), FakeAuthRepository, test_authenticated_routes_require_a_valid_session(), test_in_memory_application_remains_unauthenticated_for_existing_fixtures() (+3 more)

### Community 21 - "TypeScript Compiler Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+11 more)

### Community 22 - "Authentication HTTP Routes"
Cohesion: 0.16
Nodes (17): fastapi, protab_adapters_outbound_persistence_postgres_auth_repository, Response, get_project_settings(), list_projects(), login(), logout(), me() (+9 more)

### Community 23 - "KPI Computation"
Cohesion: 0.22
Nodes (13): baselineDelta, buildDailyTrend(), coverageRate(), CumulativeTrendPoint, DailyTrendPoint, DEFAULT_NON_WORKING_DAYS, isWorkingDay(), lastNDays() (+5 more)

### Community 24 - "Create DailyActivity Use Case"
Cohesion: 0.32
Nodes (11): handle_create_daily_activity(), current_actor(), CreateDailyActivityCommand, CreateDailyActivityUseCase, make_command(), make_scope(), make_scope_daily_activity(), test_create_daily_activity() (+3 more)

### Community 25 - "UI/UX Design System Skill"
Cohesion: 0.20
Nodes (12): Design Dials (variance / motion / density), Design System Generation (--design-system), Design System Persistence (Master + Overrides), Pre-Delivery UI Checklist, Search Query Contract, Rule Categories by Priority (1-10), ui-ux-pro-max Search Script, Stack Detection Step (+4 more)

### Community 26 - "Domain Commands and Port Interfaces"
Cohesion: 0.21
Nodes (6): dataclasses, datetime, re, Domain model for the audit trail. An :class:`AuditEvent` records *who* (actor)…, typing, uuid

### Community 27 - "ProTab Domain Model"
Cohesion: 0.18
Nodes (11): Avoid Premature Abstraction, PostgreSQL Integration Tests (make test-db), SOLID Principles, Aggregate Owns DailyActivities Indexed by Day, CSV Import Inbound Adapter, DailyActivity (Entity), Day Is Not a Class (datetime.date as value object), Domain Invariants (counters, FEAI format, completion implication) (+3 more)

### Community 28 - "HTTP Error Mapping"
Cohesion: 0.44
Nodes (10): fastapi_responses, JSONResponse, bad_request(), conflict(), not_found(), Exception, FastAPI, Request (+2 more)

### Community 29 - "Update DailyActivity Use Case"
Cohesion: 0.38
Nodes (9): protab_application_use_cases_update_daily_activity, handle_update_daily_activity(), UpdateDailyActivityCommand, UpdateDailyActivityUseCase, make_scope_with_activity(), test_update_daily_activity(), test_update_day_without_activity_raises(), test_update_invalid_invariant_raises_and_does_not_modify() (+1 more)

### Community 30 - "Performance Optimization Skill"
Cohesion: 0.22
Nodes (10): Caching Layer & Background Task Offloading, Connection Pooling Parameters, Database Indexing Strategy, Diagnostic & Audit Checklist, Event Loop Stall Detection, FastAPI & PostgreSQL Performance Optimizer Skill, N+1 Query Pattern Detection, Payload & Serialization Optimization (+2 more)

### Community 31 - "Complete DailyActivity Use Case"
Cohesion: 0.44
Nodes (8): complete_daily_activities(), CompleteDailyActivityCommand, CompleteDailyActivityUseCase, make_scope(), test_complete_day_without_activity_raises(), test_complete_multiple_days(), test_complete_scope_not_found(), test_complete_single_day()

### Community 32 - "Hexagonal Architecture Rules"
Cohesion: 0.22
Nodes (9): Adapters (Inbound / Outbound), Dependency Injection and Composition Root, Dependency Rule (Adapters → Ports → Application → Domain), Domain Layer, Domain Error Handling and Adapter Translation, Framework Isolation, Hexagonal Architecture (Ports and Adapters), Ports (Inbound and Outbound Contracts) (+1 more)

### Community 33 - "Persistence and Infrastructure Notes"
Cohesion: 0.31
Nodes (9): API Configuration via load_dotenv and os.getenv, Configuration and Secrets Management, Idempotent Schema Bootstrap (CREATE TABLE IF NOT EXISTS), InMemoryScopeMonitoringRepository, Centralized PostgreSQL Pool Configuration, PostgresScopeMonitoringRepository, ProTab Infrastructure Notes, ScopeMonitoringRepository Outbound Port (+1 more)

### Community 34 - "Docker Development Stack"
Cohesion: 0.31
Nodes (9): api Healthcheck (/healthz), api Service (FastAPI backend), db Healthcheck (pg_isready), db Service (postgres:17-alpine), ProTab Development Docker Stack, frontend Service (React/nginx build), pgdata Named Volume, FastAPI HTTP Inbound Adapter (+1 more)

### Community 35 - "Audit Event Change Diffing"
Cohesion: 0.36
Nodes (7): build_changes(), Return only the fields whose value differs between ``before`` and ``after``.…, test_audit_event_defaults(), test_build_changes_empty_when_identical(), test_build_changes_from_empty_keeps_all_fields(), test_build_changes_handles_removed_fields(), test_build_changes_keeps_only_different_fields()

### Community 36 - "API Surface and Audit Trail"
Cohesion: 0.33
Nodes (7): Audit Trail (best-effort mutation journal), Atomic ScopeMonitoring Creation, Domain Error to HTTP Status Mapping, Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring), Query Use Cases (ListScopes, GetScope, GetDailyActivity, ListAuditEvents), REST Routes and Status Codes Table, React Root Mount (#root)

### Community 37 - "Development Workflow Rules"
Cohesion: 0.40
Nodes (6): Definition of Done Checklist, Development Workflow (9 Steps), Documentation Synchronization Requirement, Graphify Knowledge Graph Workflow, Test-Driven Development (RED/GREEN/REFACTOR), Testing Strategy (Test Pyramid)

### Community 38 - "Project Settings and Auth Rules"
Cohesion: 0.50
Nodes (4): Default Project Seeding Env Vars, Project Authentication with Quadrigramme Restriction, Per-Project Working Days Settings, Quadrigramme Bootstrap Exemption

## Ambiguous Edges - Review These
- `Audit Trail (best-effort mutation journal)` → `React Root Mount (#root)`  [AMBIGUOUS]
  src/FrontEnd/index.html · relation: conceptually_related_to

## Knowledge Gaps
- **108 isolated node(s):** `$schema`, `plugin`, `protab`, `name`, `private` (+103 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 280 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Audit Trail (best-effort mutation journal)` and `React Root Mount (#root)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `create_app()` connect `FastAPI App Factory and Schemas` to `Connection Pool and Shared Infrastructure`, `API Configuration and Composition Root`, `Audit Trail Persistence and Query`, `Scope Monitoring API Tests`, `Application Core Wiring`, `Auth Repository and Password Hashing`, `Query Use Cases`, `PostgreSQL Integration Tests`, `Auth Session and HTTP Flow Tests`, `Authentication HTTP Routes`, `Create DailyActivity Use Case`, `HTTP Error Mapping`, `Update DailyActivity Use Case`, `Complete DailyActivity Use Case`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Why does `DailyActivity` connect `Postgres Scope Monitoring Repository` to `Daily Activity Invariants and Errors`, `Audit Trail Persistence and Query`, `Domain Entities and Repository Adapters`, `Scope Monitoring API Tests`, `FastAPI App Factory and Schemas`, `Create ScopeMonitoring Use Case`, `Query Use Cases`, `PostgreSQL Integration Tests`, `Create DailyActivity Use Case`, `Domain Commands and Port Interfaces`, `Update DailyActivity Use Case`, `Complete DailyActivity Use Case`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `ScopeMonitoring` connect `Postgres Scope Monitoring Repository` to `Connection Pool and Shared Infrastructure`, `Audit Trail Persistence and Query`, `Domain Entities and Repository Adapters`, `Scope Monitoring API Tests`, `FastAPI App Factory and Schemas`, `Create ScopeMonitoring Use Case`, `Query Use Cases`, `PostgreSQL Integration Tests`, `Create DailyActivity Use Case`, `Update DailyActivity Use Case`, `Complete DailyActivity Use Case`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Are the 46 inferred relationships involving `create_app()` (e.g. with `close_persistence()` and `project_context()`) actually correct?**
  _`create_app()` has 46 INFERRED edges - model-reasoned connections that need verification._
- **Are the 40 inferred relationships involving `DailyActivity` (e.g. with `_activity_to_response()` and `PostgresScopeMonitoringRepository`) actually correct?**
  _`DailyActivity` has 40 INFERRED edges - model-reasoned connections that need verification._
- **Are the 38 inferred relationships involving `InMemoryScopeMonitoringRepository` (e.g. with `ScopeMonitoring` and `test_daily_activity_full_flow_over_http()`) actually correct?**
  _`InMemoryScopeMonitoringRepository` has 38 INFERRED edges - model-reasoned connections that need verification._