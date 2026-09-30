# Graph Report - ProTab  (2026-09-30)

## Corpus Check
- 178 files · ~86,379 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 8, .example 1, .conf 1)

## Summary
- 1433 nodes · 3289 edges · 109 communities (65 shown, 44 thin omitted)
- Extraction: 81% EXTRACTED · 19% INFERRED · 0% AMBIGUOUS · INFERRED: 618 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f7f2b80c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.tsx
- PostgresScopeMonitoringRepository
- package.json
- useTheme.tsx
- parse_scope_monitorings_csv
- OfficialCode
- DomainError
- ScopeFormModal.tsx
- AuditEvent
- Officials
- api_test.py
- create_app
- empty_database
- FakeAuthRepository
- useToast.tsx
- ExportModal.tsx
- protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository
- ScopeListPage.tsx
- DailyActivity
- postgres_scope_monitoring_repository_test.py
- Architecture
- compilerOptions
- queries_test.py
- kpi.ts
- InMemoryScopeMonitoringRepository
- Rule Categories by Priority (1-10)
- La CLI `protab-project`
- Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring)
- analytics.ts
- update_daily_activity_test.py
- FastAPI & PostgreSQL Performance Optimizer Skill
- complete_daily_activity_test.py
- Hexagonal Architecture (Ports and Adapters)
- PostgresScopeMonitoringRepository
- api Service (FastAPI backend)
- project_admin_test.py
- AnalyticsPage.tsx
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
- architecture.md
- add_scope_for
- postgres_auth_bootstrap_test.py
- postgres_auth_repository.py
- protab_adapters_outbound_persistence_postgres_auth_repository
- Tally plutôt qu'un tableur
- ScopeDetailPage.tsx
- ScopeMonitoring
- app.py
- project
- index.ts
- L'architecture Docker de ProTab
- project_admin.py
- test_creating_a_project_twice_reports_the_duplicate
- test_admin_alongside_scope_officials
- project_admin_cli_test.py
- Tests
- Frontend
- SupervisionGrid.tsx
- AnalyticsCharts.tsx
- seed_three_days
- test_admin_authenticates_although_it_belongs_to_no_scope
- test_admin_still_needs_the_project_password
- auth_api_test.py
- repository
- .daily_activity_for
- client
- test_add_admin_grants_access_although_no_scope_declares_it
- test_add_admin_rejects_a_code_no_one_could_type
- test_scope_monitoring_add_daily_activity
- test_scope_monitoring_rejects_duplicate_day
- test_scope_monitoring_multiple_activities_different_days

## God Nodes (most connected - your core abstractions)
1. `DailyActivity` - 74 edges
2. `create_app()` - 70 edges
3. `InMemoryScopeMonitoringRepository` - 63 edges
4. `ScopeMonitoring` - 51 edges
5. `PostgresAuthRepository` - 33 edges
6. `react` - 29 edges
7. `PostgresScopeMonitoringRepository` - 28 edges
8. `ScopeMonitoringRepository` - 28 edges
9. `Officials` - 26 edges
10. `ScopeMonitoring` - 25 edges

## Surprising Connections (you probably didn't know these)
- `5. Ce que ces tests ne prouvent pas` --references--> `InMemoryScopeMonitoringRepository`  [INFERRED]
  docs/testing.md → src/protab/adapters/outbound/persistence/in_memory_scope_monitoring_repository.py
- `Application — `tests/unit/application/`` --references--> `InMemoryScopeMonitoringRepository`  [INFERRED]
  docs/testing.md → src/protab/adapters/outbound/persistence/in_memory_scope_monitoring_repository.py
- `Absence de port pour l'authentification` --references--> `PostgresAuthRepository`  [INFERRED]
  docs/architecture.md → src/protab/adapters/outbound/persistence/postgres_auth_repository.py
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

## Communities (109 total, 44 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.15
Nodes (14): 4. Chemins et routage, react-router-dom, App(), AuditShortcut(), Navbar(), NavbarProps, ITEMS, PageNav() (+6 more)

### Community 1 - "PostgresScopeMonitoringRepository"
Cohesion: 0.13
Nodes (14): 8. Multi-tenant : le mécanisme à comprendre avant toute modification, pytest, RuntimeError, MissingProjectContextError, PostgresScopeMonitoringRepository, Connection, date, Return the current project id, or refuse to touch the database. Every read and… (+6 more)

### Community 2 - "package.json"
Cohesion: 0.04
Nodes (42): IMPORTANT: keep the reminder string free of backticks and $(...) constructs., ref_fs, jsdom, ref_path, react-dom, tailwindcss, @tailwindcss/vite, @types/node (+34 more)

### Community 3 - "useTheme.tsx"
Cohesion: 0.17
Nodes (14): 3. Client HTTP — `services/api.ts`, 5. Providers et état, AppContent(), src_frontend_src_assets_layered_waves_dark, src_frontend_src_assets_layered_waves_light, LoginBackground(), Theme, ThemeContext (+6 more)

### Community 4 - "parse_scope_monitorings_csv"
Cohesion: 0.16
Nodes (26): CSV — `adapters/inbound/csv/scope_monitoring_csv_reader.py`, fastapi_responses, JSONResponse, Path, pathlib, protab_adapters_inbound_csv_scope_monitoring_csv_reader, bad_request(), conflict() (+18 more)

### Community 5 - "OfficialCode"
Cohesion: 0.12
Nodes (23): OfficialCode, A single official identity, normalized the way login normalizes it.…, ``OfficialCode`` is the single-code form of an official identity. A project…, Only the ends are noise; a space inside is part of the identity., ``LoginRequest.quadrigramme`` allows two characters, so we must too., ``A/B`` is the Officials form; as an admin code it could never be typed back as…, ``?`` means "no backup official" in the scope columns; it is not a code., ``LoginRequest.quadrigramme`` caps at 20; a longer admin could never be typed… (+15 more)

### Community 6 - "DomainError"
Cohesion: 0.08
Nodes (35): 7. Les adaptateurs sortants, Exception, date, DuplicateFeaiReferenceError, IncidentsExceedErrorsError, InvalidFeaiReferenceError, NegativeErrorsCountError, NegativeIncidentsCountError (+27 more)

### Community 7 - "ScopeFormModal.tsx"
Cohesion: 0.09
Nodes (31): 7. Saisie et autosave, 6. Tests frontend, Pièges propres à cette suite, ActivityFormModalProps, CompleteActivitiesModalProps, FeaiTagInput(), FeaiTagInputProps, UndoEntry (+23 more)

### Community 8 - "AuditEvent"
Cohesion: 0.09
Nodes (31): protab_adapters_outbound_persistence_postgres_audit_trail_repository, _audit_event_to_response(), handle_create_daily_activity(), list_scope_audit_log(), InMemoryAuditTrailRepository, PostgresAuditTrailRepository, Open the connection pool and apply the (idempotent) schema., Close the connection pool, releasing database connections. (+23 more)

### Community 9 - "Officials"
Cohesion: 0.17
Nodes (19): KnowledgeBase, Officials, build_scope(), fixture_scope_monitoring(), fixture, parametrize, Different ScopeMonitoring instances can have activities on the same day., test_blank_billing_code_is_normalised_to_none() (+11 more)

### Community 10 - "api_test.py"
Cohesion: 0.09
Nodes (14): create_scope_via_api(), make_scope_with_activity(), test_complete_daily_activities_returns_204(), test_complete_day_without_activity_returns_404(), test_create_daily_activity_duplicate_day_returns_409(), test_create_daily_activity_invalid_invariant_returns_400(), test_create_daily_activity_returns_201(), test_get_daily_activity_returns_detail() (+6 more)

### Community 11 - "create_app"
Cohesion: 0.07
Nodes (53): BaseModel, contextvars, API — `adapters/inbound/api/`, 4. Démarrage en développement, field_validator, pydantic, _activity_to_response(), build_repository() (+45 more)

### Community 12 - "empty_database"
Cohesion: 0.15
Nodes (13): empty_database(), A project must never be created without someone able to enter it. Once it owns…, Both secrets are missing: the message must name the one resolved first.…, The secrets are only needed to seed; a restart must not require them. Requiring…, The seeded administrator must be usable as a login right away., Create the schema, then drop every project so a bootstrap is pending., Seeding the first project demands an explicit, non-guessable password. No…, test_bootstrap_grants_the_configured_admin_code() (+5 more)

### Community 13 - "FakeAuthRepository"
Cohesion: 0.16
Nodes (5): AuthSession, FakeAuthRepository, test_project_settings_are_authenticated_and_project_scoped(), A public route answers an anonymous caller; a business route does not. Uses a…, test_public_routes_stay_unauthenticated()

### Community 14 - "useToast.tsx"
Cohesion: 0.09
Nodes (25): @testing-library/jest-dom, @testing-library/react, vitest, ToastContainer(), ToastAction, ToastActionsContext, ToastActionsType, ToastContextType (+17 more)

### Community 15 - "ExportModal.tsx"
Cohesion: 0.24
Nodes (14): ExportModal(), ExportModalProps, ScopeBase, AnalyticsPage(), ScopeMonitoring, buildExportRows(), CsvSeparator, downloadFile() (+6 more)

### Community 16 - "protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository"
Cohesion: 0.21
Nodes (11): APIRoute, fastapi_routing, fastapi_testclient, protab_adapters_inbound_api_app, protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository, test_daily_activity_full_flow_over_http(), business_routes(), Business routes must be authenticated by default (allowlist, not denylist).… (+3 more)

### Community 17 - "ScopeListPage.tsx"
Cohesion: 0.10
Nodes (21): Badge(), BadgeProps, BillingCodeBadge(), BillingCodeBadgeProps, CompleteTodayButton(), CompleteTodayButtonProps, DashboardCharts(), DashboardChartsProps (+13 more)

### Community 18 - "DailyActivity"
Cohesion: 0.14
Nodes (18): 3. Le domaine, DailyActivity, test_daily_activity_creation_valid(), test_daily_activity_duplicate_feai_rejected(), test_daily_activity_errors_reported_negative(), test_daily_activity_incidents_created_negative(), test_daily_activity_incidents_exceed_errors(), test_daily_activity_invalid_feai_format() (+10 more)

### Community 19 - "postgres_scope_monitoring_repository_test.py"
Cohesion: 0.12
Nodes (19): make_scope(), date, Integration tests for the PostgreSQL repository adapter. These tests exercise…, test_api_flow_persists_in_postgres(), test_complete_unknown_day_does_not_partially_persist(), test_duplicate_name_via_api_returns_409(), test_find_all_loads_activities_for_all_scopes(), test_find_all_returns_scopes_ordered_by_name() (+11 more)

### Community 20 - "Architecture"
Cohesion: 0.05
Nodes (43): 11. Où aller quand…, 12. Documents voisins, 1. Ce que fait l'application, 4. Les ports, 6. Les adaptateurs entrants, 9. Modèle de données, Absence de port pour l'authentification, Architecture (+35 more)

### Community 21 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+11 more)

### Community 22 - "queries_test.py"
Cohesion: 0.19
Nodes (12): protab_application_queries_get_daily_activity, protab_application_queries_get_scope, protab_application_queries_list_scopes, GetDailyActivityUseCase, make_scope(), test_get_daily_activity_day_not_found_raises(), test_get_daily_activity_found(), test_get_daily_activity_scope_not_found_raises() (+4 more)

### Community 23 - "kpi.ts"
Cohesion: 0.20
Nodes (18): 6. Le modèle mono-jour, 8. La page d'analyse — `/analyse`, ScopeListPage(), computePeriodSummary(), baselineDelta, buildDailyTrend(), coverageRate(), CumulativeTrendPoint (+10 more)

### Community 24 - "InMemoryScopeMonitoringRepository"
Cohesion: 0.18
Nodes (11): InMemoryScopeMonitoringRepository, date, CreateDailyActivityUseCase, make_command(), make_scope(), make_scope_daily_activity(), test_create_daily_activity(), test_create_duplicate_day_raises_and_persists_nothing() (+3 more)

### Community 25 - "Rule Categories by Priority (1-10)"
Cohesion: 0.15
Nodes (16): Design Dials (variance / motion / density), Design System Generation (--design-system), Design System Persistence (Master + Overrides), Pre-Delivery UI Checklist, Search Query Contract, Rule Categories by Priority (1-10), ui-ux-pro-max Search Script, Stack Detection Step (+8 more)

### Community 26 - "La CLI `protab-project`"
Cohesion: 0.12
Nodes (17): 10. En Docker, 11. Voir aussi, 1. Ce que la CLI fait, et ce qu'elle ne fait pas, 2. Prérequis, 3. Inventaire des commandes, 4. Les mots de passe, 5. Qui peut se connecter, 6. Pourquoi nommer un administrateur (+9 more)

### Community 27 - "Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring)"
Cohesion: 0.25
Nodes (9): Aggregate Owns DailyActivities Indexed by Day, Atomic ScopeMonitoring Creation, CSV Import Inbound Adapter, DailyActivity (Entity), Day Is Not a Class (datetime.date as value object), Domain Invariants (counters, FEAI format, completion implication), Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring), Query Use Cases (ListScopes, GetScope, GetDailyActivity, ListAuditEvents) (+1 more)

### Community 28 - "analytics.ts"
Cohesion: 0.14
Nodes (23): CONFIG, aggregateByDay(), aggregateByWeek(), buildPeriodDays(), CellState, ChartRow, clampRange(), columnDaysFor() (+15 more)

### Community 29 - "update_daily_activity_test.py"
Cohesion: 0.16
Nodes (20): 10. Cycle de vie d'une écriture, 5. La couche application, handle_update_daily_activity(), current_actor(), UpdateDailyActivityCommand, UpdateDailyActivityUseCase, build_changes(), Return only the fields whose value differs between ``before`` and ``after``.… (+12 more)

### Community 30 - "FastAPI & PostgreSQL Performance Optimizer Skill"
Cohesion: 0.22
Nodes (10): Caching Layer & Background Task Offloading, Connection Pooling Parameters, Database Indexing Strategy, Diagnostic & Audit Checklist, Event Loop Stall Detection, FastAPI & PostgreSQL Performance Optimizer Skill, N+1 Query Pattern Detection, Payload & Serialization Optimization (+2 more)

### Community 31 - "complete_daily_activity_test.py"
Cohesion: 0.35
Nodes (12): complete_daily_activities(), CompleteDailyActivityCommand, CompleteDailyActivityUseCase, make_activity(), make_scope(), All days are resolved before anything is written. Completing day 1 then failing…, test_complete_day_without_activity_raises(), test_complete_does_not_touch_earlier_days_when_a_later_day_is_missing() (+4 more)

### Community 32 - "Hexagonal Architecture (Ports and Adapters)"
Cohesion: 0.18
Nodes (11): Adapters (Inbound / Outbound), Avoid Premature Abstraction, Dependency Injection and Composition Root, Dependency Rule (Adapters → Ports → Application → Domain), Domain Layer, Domain Error Handling and Adapter Translation, Framework Isolation, Hexagonal Architecture (Ports and Adapters) (+3 more)

### Community 33 - "PostgresScopeMonitoringRepository"
Cohesion: 0.24
Nodes (11): API Configuration via load_dotenv and os.getenv, Configuration and Secrets Management, Idempotent Schema Bootstrap (CREATE TABLE IF NOT EXISTS), InMemoryScopeMonitoringRepository, PostgreSQL Integration Tests (make test-db), Centralized PostgreSQL Pool Configuration, PostgresScopeMonitoringRepository, ProTab Infrastructure Notes (+3 more)

### Community 34 - "api Service (FastAPI backend)"
Cohesion: 0.19
Nodes (13): api Healthcheck (/healthz), api Service (FastAPI backend), db Healthcheck (pg_isready), db Service (postgres:17-alpine), Default Project Seeding Env Vars, ProTab Development Docker Stack, frontend Service (React/nginx build), pgdata Named Volume (+5 more)

### Community 35 - "project_admin_test.py"
Cohesion: 0.14
Nodes (24): Integration tests for the ``protab-project`` administrative command. The…, The command must close the sessions it orphans. Whether a removed administrator…, Removing it would leave nobody able to open the project again., The historical form stays valid, but it must not fail silently., Rotating a leaked password must not leave old sessions usable., run(), stored_hash(), test_add_admin_grants_access() (+16 more)

### Community 36 - "AnalyticsPage.tsx"
Cohesion: 0.13
Nodes (15): ANALYTICS_PATH, AnalyticsFilterBar(), AnalyticsFilterBarProps, AnalyticsFilters, SCOPE_DETAIL_PATH, SCOPE_LIST_PATH, scopeCountLabel(), GRANULARITIES (+7 more)

### Community 37 - "Development Workflow (9 Steps)"
Cohesion: 0.40
Nodes (6): Definition of Done Checklist, Development Workflow (9 Steps), Documentation Synchronization Requirement, Graphify Knowledge Graph Workflow, Test-Driven Development (RED/GREEN/REFACTOR), Testing Strategy (Test Pyramid)

### Community 38 - "add_scope"
Cohesion: 0.14
Nodes (14): add_scope(), ``official_main`` encodes several codes just like ``official_backup``., ``?`` marks the absence of a backup official, it is not a code., ``authenticate()`` only runs at login, so a removed administrator would keep a…, test_a_code_in_no_scope_and_no_admin_list_is_refused(), test_admin_code_is_normalized_like_a_scope_code(), test_backup_placeholder_is_not_a_login_code(), test_backup_split_form_auths_both_codes() (+6 more)

### Community 40 - "CreateScopeMonitoringUseCase"
Cohesion: 0.36
Nodes (9): CreateScopeMonitoringCommand, CreateScopeMonitoringUseCase, make_command(), test_create_blank_billing_code_raises_and_writes_nothing(), test_create_duplicate_name_raises_and_persists_nothing(), test_create_empty_official_raises(), test_create_invalid_knowledge_base_id_raises(), test_create_multiple_scope_monitorings() (+1 more)

### Community 72 - "build_connection_pool"
Cohesion: 0.17
Nodes (9): ConnectionPool, psycopg, psycopg_pool, build_connection_pool(), ping_check(), Connection, Shared PostgreSQL connection-pool configuration for persistence adapters., Check connectivity and leave the connection outside a transaction. (+1 more)

### Community 73 - "PostgresAuthRepository"
Cohesion: 0.18
Nodes (7): _hash_password(), _normalize_non_working_days(), PostgresAuthRepository, Project, Store project credentials and opaque, expiring session tokens., Grant permanent access to one project. Returns False if already set. The code…, Replace the password of an existing project and drop its sessions. Rotating a…

### Community 74 - "postgres_auth_repository_test.py"
Cohesion: 0.12
Nodes (7): Integration tests for the PostgreSQL auth repository rule: the quadrigramme…, Naming an administrator is what makes creating the first scope safe. The…, A code the login screen refuses would lock the administrator out., ``project_admins`` cascades, or a recycled project code would inherit the…, test_add_admin_rejects_an_unusable_code(), test_admin_authenticates_before_the_first_scope_is_created(), test_admins_disappear_with_their_project()

### Community 75 - "set_current_project"
Cohesion: 0.16
Nodes (15): reset_current_project(), set_current_project(), project(), fixture, project_context(), fixture, Every read and write is tenant-scoped: name the project under test. The…, A write must not reach across tenants, even on a known scope id. (+7 more)

### Community 76 - "_official_codes"
Cohesion: 0.29
Nodes (9): _official_codes(), Quadrigrammes declared by one ``officials`` column (format « A/B »).…, Parsing of the officials columns that gate the quadrigramme. Both…, ``MRAM/ ?`` means "MRAM, no backup": ``?`` is not a quadrigramme., test_handles_empty_and_none(), test_ignores_punctuation_only_parts(), test_placeholder_is_not_a_code(), test_splits_multiple_codes() (+1 more)

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
Cohesion: 0.33
Nodes (6): fastapi, protab_adapters_outbound_persistence_postgres_auth_repository, Response, clear_session_cookie(), CurrentUser, set_session_cookie()

### Community 82 - "Tally plutôt qu'un tableur"
Cohesion: 0.29
Nodes (6): Ce qu'un tableur fait mieux, Ce que coûte un tableur partagé, Ce que Tally change, En résumé, Quand ne pas migrer, Tally plutôt qu'un tableur

### Community 83 - "ScopeDetailPage.tsx"
Cohesion: 0.19
Nodes (20): Suppression et annulation, lucide-react, react, ActivityFormModal(), CompleteActivitiesModal(), CsvImportModal(), CsvImportModalProps, Modal() (+12 more)

### Community 84 - "ScopeMonitoring"
Cohesion: 0.06
Nodes (18): GetScopeUseCase, ListScopesUseCase, ScopeMonitoring, AuditTrailRepository, Protocol, date, Protocol, Persist the given ScopeMonitoring. Replaces the whole aggregate: the scope row… (+10 more)

### Community 85 - "app.py"
Cohesion: 0.07
Nodes (38): csv, dataclasses, datetime, protab_adapters_inbound_api_auth, protab_adapters_inbound_api_errors, protab_adapters_inbound_api_schemas, protab_adapters_outbound_persistence_in_memory_audit_trail_repository, protab_adapters_outbound_persistence_postgres_pool (+30 more)

### Community 86 - "project"
Cohesion: 0.40
Nodes (5): bootstrap_password(), project(), fixture, The bootstrap secrets are mandatory: no default is provided.…, scopes()

### Community 87 - "index.ts"
Cohesion: 0.09
Nodes (31): AuditActivityHeatmap(), AuditActivityHeatmapProps, HOURS, intensityClass(), WEEKDAYS, ACTION_ICONS, ACTION_LABELS, AuditLogPage() (+23 more)

### Community 88 - "L'architecture Docker de ProTab"
Cohesion: 0.12
Nodes (17): 1. Vue d'ensemble à l'exécution, 2. Ordre de démarrage : ce que les dépendances garantissent, 3. Chaîne de construction des images, 4. Le premier démarrage : une fenêtre, pas une configuration, 5. Requêtes : le rôle de nginx est plus qu'un serveur de fichiers, 6. Sécurité : ce que la topologie garantit, et ce qu'elle ne garantit pas, 7. Commandes de la stack, Ce que le diagramme dit des ports publiés (+9 more)

### Community 89 - "project_admin.py"
Cohesion: 0.24
Nodes (16): argparse, getpass, _add_admin(), _create_project(), _list_admins(), main(), _open_existing_project(), _open_repository() (+8 more)

### Community 92 - "project_admin_cli_test.py"
Cohesion: 0.20
Nodes (14): protab, parametrize, ``protab-project --help`` must list the subcommands. The dispatcher resolves…, ``protab-project <code> <nom>`` predates the subcommands and stays valid., A bare invocation is still an error. Turning it into a success would make a…, The inventory must not swallow the per-subcommand argparse help., run_cli(), test_a_subcommand_without_its_arguments_still_errors() (+6 more)

### Community 93 - "Tests"
Cohesion: 0.15
Nodes (13): 1. Vue d'ensemble, 2. Tests unitaires — `tests/unit/`, 3. Tests d'intégration — `tests/integration/adapters/`, 4. Test E2E — `tests/e2e/`, 5. Ce que ces tests ne prouvent pas, 7. Écrire un nouveau test, 8. Documents voisins, Adaptateurs — `tests/unit/adapters/` (+5 more)

### Community 94 - "Frontend"
Cohesion: 0.25
Nodes (8): 10. Tests, 11. Ce qui n'existe pas, 12. Build et déploiement, 13. Documents voisins, 1. Pile technique, 2. Arborescence, 9. Graphiques et styles, Frontend

### Community 95 - "SupervisionGrid.tsx"
Cohesion: 0.21
Nodes (11): CELL_CLASS, cellLabel(), SupervisionGrid(), DAYS, SCOPES, buildSupervisionGrid(), GridCell, scaleBucket() (+3 more)

### Community 96 - "AnalyticsCharts.tsx"
Cohesion: 0.26
Nodes (11): recharts, AnalyticsRanking(), AnalyticsStack(), colorFor(), METRIC_LABEL, PALETTE, StackChart(), buildScopeRanking() (+3 more)

### Community 97 - "seed_three_days"
Cohesion: 0.50
Nodes (4): seed_three_days(), test_insert_daily_activity_leaves_other_days_untouched(), test_mark_activities_completed_flips_only_the_named_days(), test_update_daily_activity_leaves_other_days_untouched()

### Community 100 - "auth_api_test.py"
Cohesion: 0.31
Nodes (8): login_and_read_session_cookie(), test_authenticated_routes_require_a_valid_session(), test_in_memory_application_remains_unauthenticated_for_existing_fixtures(), test_login_rejects_invented_quadrigramme_when_known_codes_exist(), test_project_settings_reject_invalid_weekday(), test_session_cookie_is_httponly_and_samesite_lax(), test_session_cookie_is_secure_when_configured(), test_session_cookie_omits_secure_over_plain_http()

### Community 101 - "repository"
Cohesion: 0.50
Nodes (4): 2. Vue d'ensemble des couches, bootstrap_password(), fixture, repository()

## Ambiguous Edges - Review These
- `React Root Mount (#root)` → `Audit Trail (best-effort mutation journal)`  [AMBIGUOUS]
  src/FrontEnd/index.html · relation: conceptually_related_to

## Knowledge Gaps
- **194 isolated node(s):** `$schema`, `plugin`, `protab`, `name`, `private` (+189 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 474 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **44 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `React Root Mount (#root)` and `Audit Trail (best-effort mutation journal)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Tests` connect `Tests` to `architecture.md`, `ScopeFormModal.tsx`?**
  _High betweenness centrality (0.308) - this node is a cross-community bridge._
- **Why does `6. Tests frontend` connect `ScopeFormModal.tsx` to `App.tsx`, `useTheme.tsx`, `ExportModal.tsx`, `ScopeListPage.tsx`, `ScopeDetailPage.tsx`, `kpi.ts`, `index.ts`, `Tests`?**
  _High betweenness centrality (0.293) - this node is a cross-community bridge._
- **Why does `InMemoryScopeMonitoringRepository` connect `InMemoryScopeMonitoringRepository` to `auth_api_test.py`, `repository`, `client`, `AuditEvent`, `CreateScopeMonitoringUseCase`, `api_test.py`, `create_app`, `FakeAuthRepository`, `protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository`, `DailyActivity`, `update_daily_activity_test.py`, `ScopeMonitoring`, `app.py`, `queries_test.py`, `Tests`, `complete_daily_activity_test.py`?**
  _High betweenness centrality (0.184) - this node is a cross-community bridge._
- **Are the 53 inferred relationships involving `DailyActivity` (e.g. with `_activity_to_response()` and `InMemoryScopeMonitoringRepository`) actually correct?**
  _`DailyActivity` has 53 INFERRED edges - model-reasoned connections that need verification._
- **Are the 50 inferred relationships involving `create_app()` (e.g. with `API — `adapters/inbound/api/`` and `close_persistence()`) actually correct?**
  _`create_app()` has 50 INFERRED edges - model-reasoned connections that need verification._
- **Are the 51 inferred relationships involving `InMemoryScopeMonitoringRepository` (e.g. with `2. Vue d'ensemble des couches` and `5. Ce que ces tests ne prouvent pas`) actually correct?**
  _`InMemoryScopeMonitoringRepository` has 51 INFERRED edges - model-reasoned connections that need verification._