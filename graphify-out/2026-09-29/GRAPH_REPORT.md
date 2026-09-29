# Graph Report - ProTab  (2026-09-29)

## Corpus Check
- 160 files · ~61,554 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 8, .example 1, .conf 1)

## Summary
- 1209 nodes · 2737 edges · 89 communities (53 shown, 36 thin omitted)
- Extraction: 81% EXTRACTED · 19% INFERRED · 0% AMBIGUOUS · INFERRED: 522 edges (avg confidence: 0.92)
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
- OfficialCode
- PostgresScopeMonitoringRepository
- api.ts
- AuditEvent
- Officials
- api_test.py
- create_app
- PostgresAuthRepository
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
- set_current_project
- _official_codes
- postgres_audit_trail_repository_test.py
- current_user
- postgres_auth_bootstrap_test.py
- postgres_auth_repository.py
- protab_adapters_outbound_persistence_postgres_auth_repository
- Tally plutôt qu'un tableur
- ScopeDetailPage.tsx
- ScopeMonitoring
- datetime
- build_changes
- pytest
- .daily_activity_for

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

## Communities (89 total, 36 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.11
Nodes (30): lucide-react, react, react-dom, react-router-dom, App(), AuditShortcut(), CsvImportModal(), CsvImportModalProps (+22 more)

### Community 1 - "app.py"
Cohesion: 0.15
Nodes (12): protab_adapters_inbound_api_auth, protab_adapters_inbound_api_errors, protab_adapters_inbound_api_schemas, protab_application_queries_get_daily_activity, protab_application_queries_get_scope, protab_application_queries_list_audit_events, protab_application_queries_list_scopes, protab_application_use_cases_complete_daily_activity (+4 more)

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
Cohesion: 0.12
Nodes (23): OfficialCode, A single official identity, normalized the way login normalizes it.…, ``OfficialCode`` is the single-code form of an official identity. A project…, Only the ends are noise; a space inside is part of the identity., ``LoginRequest.quadrigramme`` allows two characters, so we must too., ``A/B`` is the Officials form; as an admin code it could never be typed back as…, ``?`` means "no backup official" in the scope columns; it is not a code., ``LoginRequest.quadrigramme`` caps at 20; a longer admin could never be typed… (+15 more)

### Community 6 - "PostgresScopeMonitoringRepository"
Cohesion: 0.06
Nodes (44): RuntimeError, MissingProjectContextError, PostgresScopeMonitoringRepository, Connection, date, Exception, Persist ``ScopeMonitoring`` aggregates in PostgreSQL. The schema is applied…, Open the connection pool and apply the (idempotent) schema. (+36 more)

### Community 7 - "api.ts"
Cohesion: 0.12
Nodes (23): AuditActivityHeatmap(), AuditActivityHeatmapProps, HOURS, intensityClass(), WEEKDAYS, ApiError, AuthSession, notifyUnauthorized() (+15 more)

### Community 8 - "AuditEvent"
Cohesion: 0.13
Nodes (18): InMemoryAuditTrailRepository, PostgresAuditTrailRepository, Open the connection pool and apply the (idempotent) schema., Close the connection pool, releasing database connections., current_project_id(), ListAuditEventsUseCase, AuditEvent, AuditEventQuery (+10 more)

### Community 9 - "Officials"
Cohesion: 0.13
Nodes (18): KnowledgeBase, Officials, fixture_scope_monitoring(), fixture, Adding a second DailyActivity for the same day should raise…, Multiple DailyActivities for different days should be allowed., Different ScopeMonitoring instances can have activities on the same day., Adding a DailyActivity for a new day should succeed. (+10 more)

### Community 10 - "api_test.py"
Cohesion: 0.09
Nodes (16): client(), create_scope_via_api(), make_scope_with_activity(), fixture, test_complete_daily_activities_returns_204(), test_complete_day_without_activity_returns_404(), test_create_daily_activity_duplicate_day_returns_409(), test_create_daily_activity_invalid_invariant_returns_400() (+8 more)

### Community 11 - "create_app"
Cohesion: 0.13
Nodes (28): BaseModel, field_validator, pydantic, _activity_to_response(), create_app(), create_scope_monitorings(), get_scope_daily_activity(), get_scope_monitoring() (+20 more)

### Community 12 - "PostgresAuthRepository"
Cohesion: 0.13
Nodes (16): PostgresAuthRepository, Store project credentials and opaque, expiring session tokens., Grant permanent access to one project. Returns False if already set. The code…, empty_database(), A project must never be created without someone able to enter it. Once it owns…, Both secrets are missing: the message must name the one resolved first.…, The secrets are only needed to seed; a restart must not require them. Requiring…, The seeded administrator must be usable as a login right away. (+8 more)

### Community 13 - "FakeAuthRepository"
Cohesion: 0.16
Nodes (11): AuthSession, FakeAuthRepository, login_and_read_session_cookie(), test_authenticated_routes_require_a_valid_session(), test_in_memory_application_remains_unauthenticated_for_existing_fixtures(), test_login_rejects_invented_quadrigramme_when_known_codes_exist(), test_project_settings_are_authenticated_and_project_scoped(), test_project_settings_reject_invalid_weekday() (+3 more)

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
Cohesion: 0.12
Nodes (19): DailyActivity, Add one activity to an existing scope. Raises: DuplicateDailyActivityError: the…, Overwrite the counters of a single day, leaving the others alone. The…, test_daily_activity_creation_valid(), test_daily_activity_duplicate_feai_rejected(), test_daily_activity_errors_reported_negative(), test_daily_activity_incidents_created_negative(), test_daily_activity_incidents_exceed_errors() (+11 more)

### Community 19 - "postgres_scope_monitoring_repository_test.py"
Cohesion: 0.11
Nodes (22): make_scope(), date, Integration tests for the PostgreSQL repository adapter. These tests exercise…, seed_three_days(), test_api_flow_persists_in_postgres(), test_complete_unknown_day_does_not_partially_persist(), test_duplicate_name_via_api_returns_409(), test_find_all_loads_activities_for_all_scopes() (+14 more)

### Community 20 - "project_admin.py"
Cohesion: 0.07
Nodes (40): argparse, dotenv, getpass, os, parametrize, protab_adapters_inbound_api_config, protab_domain_value_objects_official_code, build_repository() (+32 more)

### Community 21 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+11 more)

### Community 22 - "ScopeMonitoringRepository"
Cohesion: 0.12
Nodes (10): GetScopeUseCase, AuditTrailRepository, Protocol, date, Protocol, Persist the given ScopeMonitoring. Replaces the whole aggregate: the scope row…, Flag the given days as handled and completed. Counters are never modified, and…, Return the ScopeMonitoring with the given id, or None. (+2 more)

### Community 23 - "ScopeListPage.tsx"
Cohesion: 0.11
Nodes (29): recharts, CompleteTodayButton(), CompleteTodayButtonProps, DashboardCharts(), DashboardChartsProps, ExportModalProps, ScopeDetailChartsProps, ScopeDetailCharts (+21 more)

### Community 24 - "create_daily_activity_test.py"
Cohesion: 0.36
Nodes (11): handle_create_daily_activity(), CreateDailyActivityCommand, CreateDailyActivityUseCase, make_command(), make_scope(), make_scope_daily_activity(), test_create_daily_activity(), test_create_duplicate_day_raises_and_persists_nothing() (+3 more)

### Community 25 - "Rule Categories by Priority (1-10)"
Cohesion: 0.20
Nodes (12): Design Dials (variance / motion / density), Design System Generation (--design-system), Design System Persistence (Master + Overrides), Pre-Delivery UI Checklist, Search Query Contract, Rule Categories by Priority (1-10), ui-ux-pro-max Search Script, Stack Detection Step (+4 more)

### Community 26 - "queries_test.py"
Cohesion: 0.22
Nodes (10): GetDailyActivityUseCase, ListScopesUseCase, make_scope(), test_get_daily_activity_day_not_found_raises(), test_get_daily_activity_found(), test_get_daily_activity_scope_not_found_raises(), test_get_scope_found(), test_get_scope_not_found_raises() (+2 more)

### Community 27 - "ProTab Project Documentation"
Cohesion: 0.18
Nodes (11): Avoid Premature Abstraction, PostgreSQL Integration Tests (make test-db), SOLID Principles, Aggregate Owns DailyActivities Indexed by Day, CSV Import Inbound Adapter, DailyActivity (Entity), Day Is Not a Class (datetime.date as value object), Domain Invariants (counters, FEAI format, completion implication) (+3 more)

### Community 28 - "audit_log_api_test.py"
Cohesion: 0.15
Nodes (16): contextvars, protab_adapters_outbound_persistence_in_memory_audit_trail_repository, current_actor(), Per-request audit context. Mirrors the ``_CURRENT_PROJECT_ID`` ContextVar…, reset_current_actor(), set_current_actor(), all_events(), clear_actor() (+8 more)

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

### Community 35 - "project_admin_test.py"
Cohesion: 0.06
Nodes (41): ConnectionPool, protab, psycopg, psycopg_pool, build_connection_pool(), ping_check(), Connection, Shared PostgreSQL connection-pool configuration for persistence adapters. (+33 more)

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
Cohesion: 0.33
Nodes (8): protab_application_use_cases_create_scope_monitoring, CreateScopeMonitoringCommand, CreateScopeMonitoringUseCase, make_command(), test_create_duplicate_name_raises_and_persists_nothing(), test_create_empty_official_raises(), test_create_invalid_knowledge_base_id_raises(), test_create_multiple_scope_monitorings()

### Community 74 - "postgres_auth_repository_test.py"
Cohesion: 0.07
Nodes (33): add_scope(), bootstrap_password(), fixture, Integration tests for the PostgreSQL auth repository rule: the quadrigramme…, ``official_main`` encodes several codes just like ``official_backup``., ``?`` marks the absence of a backup official, it is not a code., The rule the whole feature exists for. Without an administrator, creating the…, Permanent access is not a password bypass: the admin is one factor. (+25 more)

### Community 75 - "set_current_project"
Cohesion: 0.15
Nodes (17): reset_current_project(), set_current_project(), project(), add_scope_for(), project(), Give one project a scope, switching the tenant the adapter reads. Both tenants…, project_context(), fixture (+9 more)

### Community 76 - "_official_codes"
Cohesion: 0.29
Nodes (9): _official_codes(), Quadrigrammes declared by one ``officials`` column (format « A/B »).…, Parsing of the officials columns that gate the quadrigramme. Both…, ``MRAM/ ?`` means "MRAM, no backup": ``?`` is not a quadrigramme., test_handles_empty_and_none(), test_ignores_punctuation_only_parts(), test_placeholder_is_not_a_code(), test_splits_multiple_codes() (+1 more)

### Community 77 - "postgres_audit_trail_repository_test.py"
Cohesion: 0.25
Nodes (10): protab_adapters_outbound_persistence_postgres_audit_trail_repository, make_event(), fixture, Integration tests for the PostgreSQL audit trail adapter. Skipped when…, repo(), test_list_filters_by_scope_actor_action_and_dates(), test_list_isolated_by_project(), test_list_orders_most_recent_first() (+2 more)

### Community 78 - "current_user"
Cohesion: 0.36
Nodes (9): get_project_settings(), list_projects(), me(), project_context(), update_project_settings(), _project_to_response(), current_user(), Request (+1 more)

### Community 79 - "postgres_auth_bootstrap_test.py"
Cohesion: 0.16
Nodes (15): _hash_password(), Return the quadrigramme seeding the first project's administrator. Same fail-…, Replace the password of an existing project and drop its sessions. Rotating a…, Return the password seeding the first project, or refuse to start. Called only…, resolve_bootstrap_admin_code(), resolve_bootstrap_password(), The bootstrap secrets must never fall back to a hardcoded default. A missing…, test_admin_code_trims_surrounding_whitespace() (+7 more)

### Community 80 - "postgres_auth_repository.py"
Cohesion: 0.18
Nodes (8): hashlib, hmac, secrets, _check_password(), _normalize_code(), PostgreSQL persistence for projects and login sessions., Whether a quadrigramme is an administrator of that one project. Normalization…, Revoke permanent access and drop the sessions it had opened. ``authenticate()``…

### Community 81 - "protab_adapters_outbound_persistence_postgres_auth_repository"
Cohesion: 0.29
Nodes (7): fastapi, protab_adapters_outbound_persistence_postgres_auth_repository, Response, logout(), clear_session_cookie(), CurrentUser, set_session_cookie()

### Community 82 - "Tally plutôt qu'un tableur"
Cohesion: 0.29
Nodes (6): Ce qu'un tableur fait mieux, Ce que coûte un tableur partagé, Ce que Tally change, En résumé, Quand ne pas migrer, Tally plutôt qu'un tableur

### Community 83 - "ScopeDetailPage.tsx"
Cohesion: 0.11
Nodes (29): ActivityFormModal(), ActivityFormModalProps, Badge(), BadgeProps, CompleteActivitiesModal(), CompleteActivitiesModalProps, FeaiTagInput(), FeaiTagInputProps (+21 more)

### Community 84 - "ScopeMonitoring"
Cohesion: 0.13
Nodes (5): ScopeMonitoring, Return the ScopeMonitoring with the given name, or None., Return all ScopeMonitorings., date, RecordingScopeMonitoringRepository

### Community 85 - "datetime"
Cohesion: 0.10
Nodes (20): dataclasses, datetime, protab_adapters_outbound_persistence_postgres_pool, protab_adapters_outbound_persistence_postgres_scope_monitoring_repository, protab_application_actor_context, protab_application_commands_daily_activity, protab_domain_entities_audit_event, protab_domain_entities_daily_activity (+12 more)

### Community 86 - "build_changes"
Cohesion: 0.24
Nodes (9): build_changes(), Domain model for the audit trail. An :class:`AuditEvent` records *who* (actor)…, Return only the fields whose value differs between ``before`` and ``after``.…, test_audit_event_defaults(), test_build_changes_empty_when_identical(), test_build_changes_from_empty_keeps_all_fields(), test_build_changes_handles_removed_fields(), test_build_changes_keeps_only_different_fields() (+1 more)

## Ambiguous Edges - Review These
- `React Root Mount (#root)` → `Audit Trail (best-effort mutation journal)`  [AMBIGUOUS]
  src/FrontEnd/index.html · relation: conceptually_related_to

## Knowledge Gaps
- **121 isolated node(s):** `$schema`, `plugin`, `protab`, `name`, `private` (+116 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 382 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **36 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `React Root Mount (#root)` and `Audit Trail (best-effort mutation journal)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `create_app()` connect `create_app` to `app.py`, `scope_monitoring_csv_reader_test.py`, `AuditEvent`, `CreateScopeMonitoringUseCase`, `api_test.py`, `PostgresAuthRepository`, `FakeAuthRepository`, `current_user`, `protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository`, `protab_adapters_outbound_persistence_postgres_auth_repository`, `postgres_scope_monitoring_repository_test.py`, `project_admin.py`, `ScopeMonitoringRepository`, `create_daily_activity_test.py`, `queries_test.py`, `audit_log_api_test.py`, `update_daily_activity_test.py`, `complete_daily_activity_test.py`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **Why does `DailyActivity` connect `DailyActivity` to `PostgresScopeMonitoringRepository`, `InMemoryScopeMonitoringRepository`, `AuditEvent`, `api_test.py`, `create_app`, `set_current_project`, `Officials`, `postgres_scope_monitoring_repository_test.py`, `ScopeMonitoring`, `datetime`, `ScopeMonitoringRepository`, `create_daily_activity_test.py`, `queries_test.py`, `.daily_activity_for`, `audit_log_api_test.py`, `update_daily_activity_test.py`, `complete_daily_activity_test.py`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `PostgresAuthRepository` connect `PostgresAuthRepository` to `project_admin_test.py`, `OfficialCode`, `Project`, `create_app`, `FakeAuthRepository`, `current_user`, `postgres_auth_bootstrap_test.py`, `postgres_auth_repository.py`, `project_admin.py`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Are the 53 inferred relationships involving `DailyActivity` (e.g. with `_activity_to_response()` and `InMemoryScopeMonitoringRepository`) actually correct?**
  _`DailyActivity` has 53 INFERRED edges - model-reasoned connections that need verification._
- **Are the 49 inferred relationships involving `create_app()` (e.g. with `close_persistence()` and `project_context()`) actually correct?**
  _`create_app()` has 49 INFERRED edges - model-reasoned connections that need verification._
- **Are the 46 inferred relationships involving `InMemoryScopeMonitoringRepository` (e.g. with `DailyActivity` and `ScopeMonitoring`) actually correct?**
  _`InMemoryScopeMonitoringRepository` has 46 INFERRED edges - model-reasoned connections that need verification._