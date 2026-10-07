# Graph Report - ProTab  (2026-10-07)

## Corpus Check
- 209 files · ~112,002 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 8, .example 1, .conf 1)

## Summary
- 1711 nodes · 4085 edges · 111 communities (72 shown, 39 thin omitted)
- Extraction: 80% EXTRACTED · 19% INFERRED · 0% AMBIGUOUS · INFERRED: 796 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2e76d2ae`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- index.ts
- PostgresScopeMonitoringRepository
- package.json
- nonWorkingDays.ts
- parse_scope_monitorings_csv
- OfficialCode
- DomainError
- DailyActivity
- AuditLogPage.tsx
- ScopeMonitoring
- api_test.py
- create_app
- analytics.ts
- current_user
- vitest
- Tests
- protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository
- ._activity_for
- App.tsx
- postgres_scope_monitoring_repository_test.py
- api_config_test.py
- compilerOptions
- app.py
- FakeAuthRepository
- create_daily_activity_test.py
- Rule Categories by Priority (1-10)
- La CLI `protab-project`
- Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring)
- postgres_auth_repository.py
- Process
- FastAPI & PostgreSQL Performance Optimizer Skill
- NonWorkingDays
- Hexagonal Architecture (Ports and Adapters)
- Sparkline.tsx
- api Service (FastAPI backend)
- project_admin_test.py
- AnalyticsPage.tsx
- Development Workflow (9 Steps)
- 7. Les adaptateurs sortants
- opencode.json
- RecordingScopeMonitoringRepository
- Application Layer / Use Cases
- protab
- build_connection_pool
- build_repository
- postgres_auth_repository_test.py
- graphify.js
- _official_codes
- ProTab Project Documentation
- ScopeListPage.tsx
- postgres_auth_bootstrap_test.py
- set_current_project
- repo
- Tally plutôt qu'un tableur de production
- ScopeMonitoringRepository
- Développement
- canonical_feai
- fixture
- datetime
- L'architecture Docker de ProTab
- InMemoryScopeMonitoringRepository
- create_default_app
- useTheme.tsx
- test_scope_monitoring_add_daily_activity
- kpi.ts
- AnalyticsFilterBar.tsx
- test_scope_monitoring_rejects_duplicate_day
- test_scope_monitoring_multiple_activities_different_days
- AuditEventQuery
- audit_log_api_test.py
- react
- AnalyticsHeatmap.tsx
- update_scope_note_test.py
- complete_daily_activity_test.py
- pytest
- search.test.ts
- Frontend
- seed_three_days
- .validate_weekdays
- Architecture
- PostgresAuthRepository

## God Nodes (most connected - your core abstractions)
1. `InMemoryScopeMonitoringRepository` - 80 edges
2. `DailyActivity` - 80 edges
3. `create_app()` - 77 edges
4. `ScopeMonitoring` - 56 edges
5. `AuditEventQuery` - 36 edges
6. `react` - 35 edges
7. `vitest` - 34 edges
8. `PostgresAuthRepository` - 34 edges
9. `ScopeMonitoringRepository` - 34 edges
10. `ScopeMonitoring` - 33 edges

## Surprising Connections (you probably didn't know these)
- `Le reste de la page` --references--> `Modal()`  [INFERRED]
  docs/frontend.md → src/FrontEnd/src/components/Modal.tsx
- `5. Ce que ces tests ne prouvent pas` --references--> `InMemoryScopeMonitoringRepository`  [INFERRED]
  docs/testing.md → src/protab/adapters/outbound/persistence/in_memory_scope_monitoring_repository.py
- `Application — `tests/unit/application/`` --references--> `InMemoryScopeMonitoringRepository`  [INFERRED]
  docs/testing.md → src/protab/adapters/outbound/persistence/in_memory_scope_monitoring_repository.py
- `6. Sécurité : ce que la topologie garantit, et ce qu'elle ne garantit pas` --references--> `MissingProjectContextError`  [INFERRED]
  docs/docker-architecture.md → src/protab/adapters/outbound/persistence/postgres_scope_monitoring_repository.py
- `11. Problèmes fréquents` --references--> `require_current_project()`  [INFERRED]
  docs/development.md → src/protab/adapters/outbound/persistence/postgres_scope_monitoring_repository.py

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **ProTab Mutation → Audit Trail Flow** — readme_mutation_use_cases, readme_audit_trail, readme_domain_invariants, readme_domain_error_http_mapping, readme_rest_routes_table [INFERRED 0.85]
- **ProTab PostgreSQL Persistence Path (port → adapter → pool → container)** — agents_scopemonitoringrepository_port, agents_postgres_scopemonitoringrepository, agents_idempotent_schema_bootstrap, agents_postgres_pool_configuration, readme_postgres_persistence, readme_scope_monitorings_index, docker_compose_db_service, docker_compose_api_service [INFERRED 0.85]
- **ProTab Hexagonal Core and Its Adapters** — agents_hexagonal_architecture, readme_scope_monitoring_aggregate, readme_mutation_use_cases, agents_scopemonitoringrepository_port, readme_http_api_adapter, readme_csv_import_adapter, readme_postgres_persistence [INFERRED 0.95]

## Communities (111 total, 39 thin omitted)

### Community 0 - "index.ts"
Cohesion: 0.11
Nodes (24): AnalyticsFilterBarProps, DashboardChartsProps, WorkingDaysModalProps, IsoWeekday, LoginPageProps, ScopeListPageProps, AuthSession, notifyUnauthorized() (+16 more)

### Community 1 - "PostgresScopeMonitoringRepository"
Cohesion: 0.15
Nodes (12): PostgresScopeMonitoringRepository, Connection, date, Return the current project id, or refuse to touch the database. Every read and…, Persist ``ScopeMonitoring`` aggregates in PostgreSQL. The schema is applied…, Close the connection pool, releasing database connections., require_current_project(), date (+4 more)

### Community 2 - "package.json"
Cohesion: 0.05
Nodes (40): jsdom, react-dom, tailwindcss, @tailwindcss/vite, @types/node, @types/react, @types/react-dom, typescript (+32 more)

### Community 3 - "nonWorkingDays.ts"
Cohesion: 0.17
Nodes (13): DEFAULT_EXCLUDED_WEEKDAYS, DEFAULT_NON_WORKING_DAYS, ISO_MONDAY, ISO_SATURDAY, ISO_SUNDAY, ISO_WEEKDAY_COUNT, ISO_WEEKDAY_MAX, ISO_WEEKDAY_MIN (+5 more)

### Community 4 - "parse_scope_monitorings_csv"
Cohesion: 0.14
Nodes (28): 6. Les adaptateurs entrants, CLI — `src/protab/project_admin.py`, CSV — `adapters/inbound/csv/scope_monitoring_csv_reader.py`, fastapi_responses, JSONResponse, Path, pathlib, protab_adapters_inbound_csv_scope_monitoring_csv_reader (+20 more)

### Community 5 - "OfficialCode"
Cohesion: 0.07
Nodes (41): argparse, getpass, protab_adapters_outbound_persistence_postgres_auth_repository, protab_domain_value_objects_official_code, OfficialCode, A single official identity, normalized the way login normalizes it.…, _add_admin(), _create_project() (+33 more)

### Community 6 - "DomainError"
Cohesion: 0.12
Nodes (25): DuplicateFeaiReferenceError, IncidentsExceedErrorsError, InvalidFeaiReferenceError, NegativeErrorsCountError, NegativeIncidentsCountError, Raised when incidents_created exceeds errors_reported., Raised when a FEAI reference does not match the expected format., Raised when a FEAI reference is duplicated within the same activity. (+17 more)

### Community 7 - "DailyActivity"
Cohesion: 0.12
Nodes (23): DailyActivity, date, parametrize, test_daily_activity_canonicalises_a_prefixed_feai(), test_daily_activity_creation_valid(), test_daily_activity_duplicate_feai_rejected(), test_daily_activity_errors_reported_negative(), test_daily_activity_incidents_created_negative() (+15 more)

### Community 8 - "AuditLogPage.tsx"
Cohesion: 0.13
Nodes (23): 6. Tests frontend, Pièges propres à cette suite, AuditActivityHeatmap(), AuditActivityHeatmapProps, HOURS, intensityClass(), WEEKDAYS, activeFilterCount() (+15 more)

### Community 9 - "ScopeMonitoring"
Cohesion: 0.15
Nodes (23): KnowledgeBase, Officials, ScopeMonitoring, build_scope(), fixture_scope_monitoring(), fixture, parametrize, Different ScopeMonitoring instances can have activities on the same day. (+15 more)

### Community 10 - "api_test.py"
Cohesion: 0.07
Nodes (24): client(), create_scope_via_api(), make_scope_with_activity(), fixture, 422, not 400: the bound is refused by the request schema itself. The domain's…, test_complete_daily_activities_returns_204(), test_complete_day_without_activity_returns_404(), test_create_daily_activity_canonicalises_a_prefixed_feai() (+16 more)

### Community 11 - "create_app"
Cohesion: 0.15
Nodes (26): BaseModel, pydantic, _activity_to_response(), _audit_event_to_response(), create_app(), create_scope_monitorings(), get_scope_daily_activity(), get_scope_monitoring() (+18 more)

### Community 12 - "analytics.ts"
Cohesion: 0.22
Nodes (9): ErrorMatrix(), aggregateByWeek(), ErrorHeatmap, isoWeekKey(), MAX_TRACKED_DAYS, pctChange(), periodDaysFor(), PeriodPoint (+1 more)

### Community 13 - "current_user"
Cohesion: 0.16
Nodes (17): API — `adapters/inbound/api/`, fastapi, protab_adapters_inbound_api_config, Response, get_project_settings(), list_projects(), login(), logout() (+9 more)

### Community 14 - "vitest"
Cohesion: 0.06
Nodes (36): 7. Écrire un nouveau test, @testing-library/jest-dom, @testing-library/react, vitest, ToastContainer(), ToastAction, ToastActionsContext, ToastActionsType (+28 more)

### Community 15 - "Tests"
Cohesion: 0.25
Nodes (8): 1. Vue d'ensemble, 3. Tests d'intégration — `tests/integration/adapters/`, 4. Test E2E — `tests/e2e/`, 5. Ce que ces tests ne prouvent pas, 8. Documents voisins, Contre l'API, sans base, Contre PostgreSQL réel, Tests

### Community 16 - "protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository"
Cohesion: 0.15
Nodes (15): APIRoute, fastapi_routing, fastapi_testclient, protab_adapters_inbound_api_app, protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository, test_daily_activity_full_flow_over_http(), business_routes(), Business routes must be authenticated by default (allowlist, not denylist).… (+7 more)

### Community 18 - "App.tsx"
Cohesion: 0.12
Nodes (20): 4. Chemins et routage, react-router-dom, App(), AppContent(), Navbar(), NavbarProps, ITEMS, PageNav() (+12 more)

### Community 19 - "postgres_scope_monitoring_repository_test.py"
Cohesion: 0.09
Nodes (26): make_scope(), date, Integration tests for the PostgreSQL repository adapter. These tests exercise…, ``save`` creates a row; it never rewrites one. A second ``save`` used to…, The write must name the rows it changes, like the activity writes. A full…, The refusal happens before any write, not after a partial merge. ``save`` used…, test_a_refused_save_leaves_a_concurrent_note_intact(), test_api_flow_persists_in_postgres() (+18 more)

### Community 20 - "api_config_test.py"
Cohesion: 0.13
Nodes (19): 3. Configuration, dotenv, os, cookie_secure_from_env(), host_port_from_env(), InvalidPortError, Exception, Resolve host/port from env values, falling back to defaults. (+11 more)

### Community 21 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 22 - "app.py"
Cohesion: 0.11
Nodes (26): collections_abc, csv, protab_adapters_inbound_api_auth, protab_adapters_inbound_api_errors, protab_adapters_inbound_api_schemas, protab_adapters_outbound_persistence_in_memory_audit_trail_repository, protab_application_commands_create_scope_monitoring, protab_application_commands_scope_monitoring (+18 more)

### Community 23 - "FakeAuthRepository"
Cohesion: 0.12
Nodes (17): AuthSession, FakeAuthRepository, login_and_read_session_cookie(), Un calendrier sans jour ouvré n'a rien à afficher : la page principale…, Le refus porte sur la semaine entière, pas sur le week-end : un projet qui…, Le cookie et la ligne ``auth_sessions`` doivent tomber ensemble : un cookie…, test_authenticated_routes_require_a_valid_session(), test_in_memory_application_remains_unauthenticated_for_existing_fixtures() (+9 more)

### Community 24 - "create_daily_activity_test.py"
Cohesion: 0.51
Nodes (9): CreateDailyActivityUseCase, make_command(), make_scope(), make_scope_daily_activity(), test_create_daily_activity(), test_create_duplicate_day_raises_and_persists_nothing(), test_create_inserts_a_single_row_instead_of_rewriting_the_scope(), test_create_invalid_invariant_raises() (+1 more)

### Community 25 - "Rule Categories by Priority (1-10)"
Cohesion: 0.15
Nodes (16): Design Dials (variance / motion / density), Design System Generation (--design-system), Design System Persistence (Master + Overrides), Pre-Delivery UI Checklist, Search Query Contract, Rule Categories by Priority (1-10), ui-ux-pro-max Search Script, Stack Detection Step (+8 more)

### Community 26 - "La CLI `protab-project`"
Cohesion: 0.12
Nodes (17): 10. En Docker, 11. Voir aussi, 1. Ce que la CLI fait, et ce qu'elle ne fait pas, 2. Prérequis, 3. Inventaire des commandes, 4. Les mots de passe, 5. Qui peut se connecter, 6. Pourquoi nommer un administrateur (+9 more)

### Community 27 - "Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring)"
Cohesion: 0.25
Nodes (9): Aggregate Owns DailyActivities Indexed by Day, Atomic ScopeMonitoring Creation, CSV Import Inbound Adapter, DailyActivity (Entity), Day Is Not a Class (datetime.date as value object), Domain Invariants (counters, FEAI format, completion implication), Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring), Query Use Cases (ListScopes, GetScope, GetDailyActivity, ListAuditEvents) (+1 more)

### Community 28 - "postgres_auth_repository.py"
Cohesion: 0.17
Nodes (9): hashlib, hmac, protab_domain_value_objects_non_working_days, secrets, _check_password(), _normalize_code(), PostgreSQL persistence for projects and login sessions., Whether a quadrigramme is an administrator of that one project. Normalization… (+1 more)

### Community 29 - "Process"
Cohesion: 0.25
Nodes (7): 1. Pin the fixed point, 2. Identify the spec source, 3. Identify the standards sources, 4. Spawn both sub-agents in parallel, 5. Aggregate, Process, Why two axes

### Community 30 - "FastAPI & PostgreSQL Performance Optimizer Skill"
Cohesion: 0.17
Nodes (16): Caching Layer & Background Task Offloading, Connection Pooling Parameters, Database Indexing Strategy, Diagnostic & Audit Checklist, Event Loop Stall Detection, FastAPI & PostgreSQL Performance Optimizer Skill, N+1 Query Pattern Detection, Payload & Serialization Optimization (+8 more)

### Community 31 - "NonWorkingDays"
Cohesion: 0.07
Nodes (46): enum, IntEnum, Project, _is_iso_weekday(), IsoWeekday, NonWorkingDays, A project's working calendar: recurring weekdays and one-off dates. Both…, The calendar of a project that never configured one. (+38 more)

### Community 32 - "Hexagonal Architecture (Ports and Adapters)"
Cohesion: 0.18
Nodes (11): Adapters (Inbound / Outbound), Avoid Premature Abstraction, Dependency Injection and Composition Root, Dependency Rule (Adapters → Ports → Application → Domain), Domain Layer, Domain Error Handling and Adapter Translation, Framework Isolation, Hexagonal Architecture (Ports and Adapters) (+3 more)

### Community 33 - "Sparkline.tsx"
Cohesion: 0.60
Nodes (3): buildPath(), Sparkline(), SparklineProps

### Community 34 - "api Service (FastAPI backend)"
Cohesion: 0.15
Nodes (16): API Configuration via load_dotenv and os.getenv, Configuration and Secrets Management, ProTab Infrastructure Notes, api Healthcheck (/healthz), api Service (FastAPI backend), db Healthcheck (pg_isready), db Service (postgres:17-alpine), Default Project Seeding Env Vars (+8 more)

### Community 35 - "project_admin_test.py"
Cohesion: 0.07
Nodes (46): 2. Vue d'ensemble des couches, protab, bootstrap_password(), fixture, Integration tests for the ``protab-project`` administrative command. The…, The whole point: the code belongs to the project, not to a scope., ``MLOZ/MRAM`` is the scope list form; as an admin it could never be matched by…, The command must close the sessions it orphans. Whether a removed administrator… (+38 more)

### Community 36 - "AnalyticsPage.tsx"
Cohesion: 0.12
Nodes (29): Sparklines sur `/analyse` — pas de recharts, ExportModal(), ExportModalProps, ScopeBase, AnalyticsPage(), formatPeriod(), GRANULARITIES, initialFilters() (+21 more)

### Community 37 - "Development Workflow (9 Steps)"
Cohesion: 0.40
Nodes (6): Definition of Done Checklist, Development Workflow (9 Steps), Documentation Synchronization Requirement, Graphify Knowledge Graph Workflow, Test-Driven Development (RED/GREEN/REFACTOR), Testing Strategy (Test Pyramid)

### Community 38 - "7. Les adaptateurs sortants"
Cohesion: 0.21
Nodes (9): 7. Les adaptateurs sortants, Exception, DuplicateDailyActivityError, Raised when a ScopeMonitoring already has a DailyActivity for the given day., Raised when a ScopeMonitoring with the same name already exists., Raised when a creation targets a ScopeMonitoring id that is already taken.…, ScopeMonitoringAlreadyExistsError, ScopeMonitoringNameAlreadyExistsError (+1 more)

### Community 40 - "RecordingScopeMonitoringRepository"
Cohesion: 0.11
Nodes (14): 10. Cycle de vie d'une écriture, handle_update_daily_activity(), UpdateDailyActivityCommand, UpdateDailyActivityUseCase, date, A ScopeMonitoringRepository decorator that records the calls it receives.…, RecordingScopeMonitoringRepository, make_scope_with_activity() (+6 more)

### Community 72 - "build_connection_pool"
Cohesion: 0.13
Nodes (11): ConnectionPool, protab_adapters_outbound_persistence_postgres_pool, psycopg, psycopg_pool, build_connection_pool(), ping_check(), Connection, Shared PostgreSQL connection-pool configuration for persistence adapters. (+3 more)

### Community 73 - "build_repository"
Cohesion: 0.50
Nodes (4): build_repository(), Select the persistence adapter from configuration. PostgreSQL is required for…, database_url_from_env(), Return the PostgreSQL DSN from DATABASE_URL, or None when unset.

### Community 74 - "postgres_auth_repository_test.py"
Cohesion: 0.07
Nodes (33): add_scope(), Integration tests for the PostgreSQL auth repository rule: the quadrigramme…, ``official_main`` encodes several codes just like ``official_backup``., ``?`` marks the absence of a backup official, it is not a code., La colonne est du JSONB non typé : ce qui est écrit doit être relu à…, The rule the whole feature exists for. Without an administrator, creating the…, Permanent access is not a password bypass: the admin is one factor., Reusing a project code is the likeliest CLI mistake, and it must not reach the… (+25 more)

### Community 75 - "graphify.js"
Cohesion: 0.40
Nodes (3): IMPORTANT: keep the reminder string free of backticks and $(...) constructs., ref_fs, ref_path

### Community 76 - "_official_codes"
Cohesion: 0.29
Nodes (9): _official_codes(), Quadrigrammes declared by one ``officials`` column (format « A/B »).…, Parsing of the officials columns that gate the quadrigramme. Both…, ``MRAM/ ?`` means "MRAM, no backup": ``?`` is not a quadrigramme., test_handles_empty_and_none(), test_ignores_punctuation_only_parts(), test_placeholder_is_not_a_code(), test_splits_multiple_codes() (+1 more)

### Community 77 - "ProTab Project Documentation"
Cohesion: 0.47
Nodes (3): PostgreSQL Integration Tests (make test-db), Makefile Targets (db-up, docker-up, db-shell, test-db), ProTab Project Documentation

### Community 78 - "ScopeListPage.tsx"
Cohesion: 0.10
Nodes (32): lucide-react, recharts, Badge(), BadgeProps, BillingCodeBadge(), BillingCodeBadgeProps, CompleteActivitiesModal(), CompleteTodayButton() (+24 more)

### Community 79 - "postgres_auth_bootstrap_test.py"
Cohesion: 0.21
Nodes (13): Return the quadrigramme seeding the first project's administrator. Same fail-…, Return the password seeding the first project, or refuse to start. Called only…, resolve_bootstrap_admin_code(), resolve_bootstrap_password(), The bootstrap secrets must never fall back to a hardcoded default. A missing…, test_admin_code_trims_surrounding_whitespace(), test_blank_admin_code_raises(), test_blank_variable_raises() (+5 more)

### Community 80 - "set_current_project"
Cohesion: 0.16
Nodes (18): project_context(), Token, reset_current_project(), set_current_project(), project(), test_list_isolated_by_project(), add_scope_for(), project() (+10 more)

### Community 81 - "repo"
Cohesion: 0.67
Nodes (3): fixture, repo(), truncate_all()

### Community 82 - "Tally plutôt qu'un tableur de production"
Cohesion: 0.29
Nodes (6): Ce qu'un tableur continue de mieux faire, Ce que le Cloud a réglé… et ce que le tableur ne réglera jamais, Ce que Tally apporte, En résumé, Quand conserver le tableur ?, Tally plutôt qu'un tableur de production

### Community 83 - "ScopeMonitoringRepository"
Cohesion: 0.07
Nodes (17): GetScopeUseCase, ListScopesUseCase, AuditTrailRepository, Protocol, Persist an audit event., date, Protocol, Create the given ScopeMonitoring and its activities. Creation only: an already… (+9 more)

### Community 84 - "Développement"
Cohesion: 0.14
Nodes (13): 11. Où aller quand…, 10. Publier une modification — liste de contrôle, 11. Problèmes fréquents, 12. Documents voisins, 1. Prérequis, 2. Installation, 5. Base de données : pas d'outil de migration, 6. Tests (+5 more)

### Community 86 - "fixture"
Cohesion: 0.50
Nodes (4): bootstrap_password(), fixture, The bootstrap secrets are mandatory: no default is provided.…, scopes()

### Community 87 - "datetime"
Cohesion: 0.10
Nodes (19): dataclasses, datetime, protab_adapters_outbound_persistence_postgres_scope_monitoring_repository, protab_application_actor_context, protab_application_commands_daily_activity, protab_domain_entities_audit_event, protab_domain_entities_daily_activity, protab_domain_entities_scope_monitoring (+11 more)

### Community 88 - "L'architecture Docker de ProTab"
Cohesion: 0.12
Nodes (17): 1. Vue d'ensemble à l'exécution, 2. Ordre de démarrage : ce que les dépendances garantissent, 3. Chaîne de construction des images, 4. Le premier démarrage : une fenêtre, pas une configuration, 5. Requêtes : le rôle de nginx est plus qu'un serveur de fichiers, 6. Sécurité : ce que la topologie garantit, et ce qu'elle ne garantit pas, 7. Commandes de la stack, Ce que le diagramme dit des ports publiés (+9 more)

### Community 89 - "InMemoryScopeMonitoringRepository"
Cohesion: 0.12
Nodes (22): protab_application_queries_get_daily_activity, protab_application_queries_get_scope, protab_application_queries_list_scopes, InMemoryScopeMonitoringRepository, GetDailyActivityUseCase, CreateScopeMonitoringUseCase, make_command(), test_create_blank_billing_code_raises_and_writes_nothing() (+14 more)

### Community 90 - "create_default_app"
Cohesion: 0.50
Nodes (4): 4. Démarrage en développement, create_default_app(), FastAPI, Create the production app using the configured PostgreSQL repository.

### Community 91 - "useTheme.tsx"
Cohesion: 0.27
Nodes (8): src_frontend_src_assets_layered_waves_dark, src_frontend_src_assets_layered_waves_light, LoginBackground(), Theme, ThemeContext, ThemeContextType, ThemeProvider(), useTheme()

### Community 93 - "kpi.ts"
Cohesion: 0.20
Nodes (21): 6. Le modèle mono-jour, 8. La page d'analyse — `/analyse`, Chaque bloc mesure une chose différente, Le reste de la page, ScopeListPage(), scope(), computePeriodSummary(), sumByLabel() (+13 more)

### Community 94 - "AnalyticsFilterBar.tsx"
Cohesion: 0.13
Nodes (19): ANALYTICS_PATH, AnalyticsFilterBar(), AnalyticsFilters, applyPreset(), billingCodeKey(), formatRange(), SCOPE_DETAIL_PATH, SCOPE_LIST_PATH (+11 more)

### Community 98 - "AuditEventQuery"
Cohesion: 0.08
Nodes (38): protab_adapters_outbound_persistence_postgres_audit_trail_repository, PostgresAuditTrailRepository, Open the connection pool and apply the (idempotent) schema., Close the connection pool, releasing database connections., current_project_id(), ListAuditEventsUseCase, AuditEvent, AuditEventQuery (+30 more)

### Community 99 - "audit_log_api_test.py"
Cohesion: 0.13
Nodes (24): contextvars, Token, Per-request audit context. Mirrors the ``_CURRENT_PROJECT_ID`` ContextVar…, reset_current_actor(), set_current_actor(), all_events(), clear_actor(), env() (+16 more)

### Community 100 - "react"
Cohesion: 0.07
Nodes (49): 3. Client HTTP — `services/api.ts`, 5. Providers et état, 7. Saisie et autosave, La note du périmètre — un brouillon, pas un autosave, Saisie d'une référence FEAI, Suppression et annulation, react, ActivityFormModal() (+41 more)

### Community 101 - "AnalyticsHeatmap.tsx"
Cohesion: 0.12
Nodes (19): AnalyticsErrorHeatmap(), AnalyticsErrorHeatmapProps, columnLabels(), ErrorCell(), getHeatmapStep(), AnalyticsKpiCards(), AnalyticsKpiCardsProps, KpiCardProps (+11 more)

### Community 102 - "update_scope_note_test.py"
Cohesion: 0.32
Nodes (14): handle_update_scope_note(), UpdateScopeNoteCommand, Overwrite the free-text note of an existing scope. The note is written through…, UpdateScopeNoteUseCase, make_scope(), A note edit must not rewrite the whole scope. Rewriting the aggregate persists…, test_update_note_clears_the_note_when_emptied(), test_update_note_leaves_the_daily_activities_intact() (+6 more)

### Community 103 - "complete_daily_activity_test.py"
Cohesion: 0.11
Nodes (27): 5. La couche application, 2. Tests unitaires — `tests/unit/`, Adaptateurs — `tests/unit/adapters/`, Application — `tests/unit/application/`, Domaine — `tests/unit/domain/`, Ports — `tests/unit/ports/`, complete_daily_activities(), current_actor() (+19 more)

### Community 104 - "pytest"
Cohesion: 0.15
Nodes (16): inspect, pytest, Tenant isolation must fail closed when no project context is established. A…, test_raises_when_no_context_is_established(), make_scope(), ``save`` must refuse what the SQL adapter refuses. Both adapters implement…, test_a_refused_save_leaves_the_stored_scope_untouched(), test_save_refuses_a_name_already_stored() (+8 more)

### Community 106 - "search.test.ts"
Cohesion: 0.33
Nodes (8): Recherche : le responsable passe avant le suppléant, scope(), matchesSearchQuery(), OFFICIAL_MATCH_RANK, officialMatchRank(), SearchableScope, SEARCHED_FIELDS, sortByOfficialRelevance()

### Community 108 - "Frontend"
Cohesion: 0.25
Nodes (8): 10. Tests, 11. Ce qui n'existe pas, 12. Build et déploiement, 13. Documents voisins, 1. Pile technique, 2. Arborescence, 9. Graphiques et styles, Frontend

### Community 109 - "seed_three_days"
Cohesion: 0.50
Nodes (4): seed_three_days(), test_insert_daily_activity_leaves_other_days_untouched(), test_mark_activities_completed_flips_only_the_named_days(), test_update_daily_activity_leaves_other_days_untouched()

### Community 111 - "Architecture"
Cohesion: 0.18
Nodes (9): 12. Documents voisins, 1. Ce que fait l'application, 3. Le domaine, 8. Multi-tenant : le mécanisme à comprendre avant toute modification, 9. Modèle de données, Architecture, RuntimeError, MissingProjectContextError (+1 more)

### Community 115 - "PostgresAuthRepository"
Cohesion: 0.09
Nodes (22): 4. Les ports, Absence de port pour l'authentification, Port d'audit — `ports/outbound/audit_trail_repository.py`, Port de périmètre — `ports/outbound/scope_monitoring_repository.py`, _hash_password(), PostgresAuthRepository, Store project credentials and opaque, expiring session tokens., Grant permanent access to one project. Returns False if already set. The code… (+14 more)

## Ambiguous Edges - Review These
- `React Root Mount (#root)` → `Audit Trail (best-effort mutation journal)`  [AMBIGUOUS]
  src/FrontEnd/index.html · relation: conceptually_related_to

## Knowledge Gaps
- **202 isolated node(s):** `$schema`, `plugin`, `protab`, `name`, `private` (+197 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 548 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **39 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `React Root Mount (#root)` and `Audit Trail (best-effort mutation journal)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `RecordingScopeMonitoringRepository` connect `RecordingScopeMonitoringRepository` to `update_scope_note_test.py`, `DailyActivity`, `complete_daily_activity_test.py`, `ScopeMonitoring`, `pytest`, `vitest`, `create_daily_activity_test.py`, `InMemoryScopeMonitoringRepository`?**
  _High betweenness centrality (0.173) - this node is a cross-community bridge._
- **Why does `7. Écrire un nouveau test` connect `vitest` to `RecordingScopeMonitoringRepository`, `Tests`?**
  _High betweenness centrality (0.165) - this node is a cross-community bridge._
- **Why does `makeScope()` connect `vitest` to `index.ts`, `AnalyticsPage.tsx`, `AuditLogPage.tsx`, `search.test.ts`, `kpi.ts`, `AnalyticsFilterBar.tsx`?**
  _High betweenness centrality (0.156) - this node is a cross-community bridge._
- **Are the 67 inferred relationships involving `InMemoryScopeMonitoringRepository` (e.g. with `2. Vue d'ensemble des couches` and `5. Ce que ces tests ne prouvent pas`) actually correct?**
  _`InMemoryScopeMonitoringRepository` has 67 INFERRED edges - model-reasoned connections that need verification._
- **Are the 59 inferred relationships involving `DailyActivity` (e.g. with `_activity_to_response()` and `InMemoryScopeMonitoringRepository`) actually correct?**
  _`DailyActivity` has 59 INFERRED edges - model-reasoned connections that need verification._
- **Are the 56 inferred relationships involving `create_app()` (e.g. with `API — `adapters/inbound/api/`` and `close_persistence()`) actually correct?**
  _`create_app()` has 56 INFERRED edges - model-reasoned connections that need verification._