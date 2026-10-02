# Graph Report - ProTab  (2026-10-02)

## Corpus Check
- 187 files · ~96,591 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 8, .example 1, .conf 1)

## Summary
- 1529 nodes · 3539 edges · 98 communities (64 shown, 34 thin omitted)
- Extraction: 81% EXTRACTED · 19% INFERRED · 0% AMBIGUOUS · INFERRED: 675 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6d54286f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- index.ts
- PostgresScopeMonitoringRepository
- package.json
- react
- parse_scope_monitorings_csv
- OfficialCode
- DomainError
- DailyActivity
- AnalyticsFilterBar.tsx
- Officials
- api_test.py
- create_app
- PostgresAuthRepository
- analytics.ts
- useToast.tsx
- Frontend
- protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository
- InMemoryScopeMonitoringRepository
- App.tsx
- postgres_scope_monitoring_repository_test.py
- project_admin.py
- compilerOptions
- AuditEvent
- FakeAuthRepository
- create_daily_activity_test.py
- Rule Categories by Priority (1-10)
- La CLI `protab-project`
- Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring)
- postgres_auth_repository.py
- update_daily_activity_test.py
- FastAPI & PostgreSQL Performance Optimizer Skill
- NonWorkingDays
- Hexagonal Architecture (Ports and Adapters)
- PostgresScopeMonitoringRepository
- api Service (FastAPI backend)
- project_admin_test.py
- AnalyticsPage.tsx
- Development Workflow (9 Steps)
- AnalyticsCharts.tsx
- opencode.json
- complete_daily_activity_test.py
- Application Layer / Use Cases
- protab
- build_connection_pool
- CreateScopeMonitoringUseCase
- postgres_auth_repository_test.py
- graphify.js
- _official_codes
- architecture.md
- ScopeListPage.tsx
- postgres_auth_bootstrap_test.py
- search.test.ts
- Tally plutôt qu'un tableur de production
- ScopeMonitoringRepository
- Développement
- datetime
- fixture
- AuditActivityHeatmap.tsx
- L'architecture Docker de ProTab
- @testing-library/react
- kpi.ts
- Tests
- pytest
- lucide-react
- ScopeMonitoring
- audit_log_api_test.py
- Architecture
- non_working_days.py
- Project

## God Nodes (most connected - your core abstractions)
1. `DailyActivity` - 78 edges
2. `create_app()` - 72 edges
3. `InMemoryScopeMonitoringRepository` - 65 edges
4. `ScopeMonitoring` - 51 edges
5. `PostgresAuthRepository` - 34 edges
6. `react` - 30 edges
7. `NonWorkingDays` - 29 edges
8. `vitest` - 28 edges
9. `ScopeMonitoring` - 28 edges
10. `PostgresScopeMonitoringRepository` - 28 edges

## Surprising Connections (you probably didn't know these)
- `4. Démarrage en développement` --references--> `create_default_app()`  [INFERRED]
  docs/development.md → src/protab/adapters/inbound/api/app.py
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

## Communities (98 total, 34 thin omitted)

### Community 0 - "index.ts"
Cohesion: 0.09
Nodes (32): 3. Client HTTP — `services/api.ts`, WorkingDaysModal(), WorkingDaysModalProps, IsoWeekday, ACTION_ICONS, ACTION_LABELS, AuditLogPage(), formatCreatedAt() (+24 more)

### Community 1 - "PostgresScopeMonitoringRepository"
Cohesion: 0.17
Nodes (9): PostgresScopeMonitoringRepository, Connection, date, Exception, Return the current project id, or refuse to touch the database. Every read and…, Persist ``ScopeMonitoring`` aggregates in PostgreSQL. The schema is applied…, Close the connection pool, releasing database connections., require_current_project() (+1 more)

### Community 2 - "package.json"
Cohesion: 0.05
Nodes (38): jsdom, tailwindcss, @tailwindcss/vite, @types/node, @types/react, @types/react-dom, typescript, vite (+30 more)

### Community 3 - "react"
Cohesion: 0.17
Nodes (13): react, react-dom, CsvImportModal(), CsvImportModalProps, Modal(), ModalProps, ScopeFormModal(), ScopeFormModalProps (+5 more)

### Community 4 - "parse_scope_monitorings_csv"
Cohesion: 0.14
Nodes (28): 6. Les adaptateurs entrants, CLI — `src/protab/project_admin.py`, CSV — `adapters/inbound/csv/scope_monitoring_csv_reader.py`, fastapi_responses, JSONResponse, Path, pathlib, protab_adapters_inbound_csv_scope_monitoring_csv_reader (+20 more)

### Community 5 - "OfficialCode"
Cohesion: 0.12
Nodes (23): OfficialCode, A single official identity, normalized the way login normalizes it.…, ``OfficialCode`` is the single-code form of an official identity. A project…, Only the ends are noise; a space inside is part of the identity., ``LoginRequest.quadrigramme`` allows two characters, so we must too., ``A/B`` is the Officials form; as an admin code it could never be typed back as…, ``?`` means "no backup official" in the scope columns; it is not a code., ``LoginRequest.quadrigramme`` caps at 20; a longer admin could never be typed… (+15 more)

### Community 6 - "DomainError"
Cohesion: 0.10
Nodes (32): date, DuplicateFeaiReferenceError, IncidentsExceedErrorsError, InvalidFeaiReferenceError, NegativeErrorsCountError, NegativeIncidentsCountError, Raised when incidents_created exceeds errors_reported., Raised when a FEAI reference does not match the expected format. (+24 more)

### Community 7 - "DailyActivity"
Cohesion: 0.15
Nodes (22): DailyActivity, parametrize, test_daily_activity_canonicalises_a_prefixed_feai(), test_daily_activity_creation_valid(), test_daily_activity_duplicate_feai_rejected(), test_daily_activity_errors_reported_negative(), test_daily_activity_incidents_created_negative(), test_daily_activity_incidents_exceed_errors() (+14 more)

### Community 8 - "AnalyticsFilterBar.tsx"
Cohesion: 0.11
Nodes (23): ANALYTICS_PATH, AnalyticsFilterBar(), AnalyticsFilterBarProps, AnalyticsFilters, billingCodeKey(), formatRange(), SCOPE_DETAIL_PATH, SCOPE_LIST_PATH (+15 more)

### Community 9 - "Officials"
Cohesion: 0.12
Nodes (25): KnowledgeBase, Officials, build_scope(), fixture_scope_monitoring(), fixture, parametrize, Adding a DailyActivity for a new day should succeed., Adding a second DailyActivity for the same day should raise… (+17 more)

### Community 10 - "api_test.py"
Cohesion: 0.08
Nodes (18): client(), create_scope_via_api(), make_scope_with_activity(), fixture, test_complete_daily_activities_returns_204(), test_complete_day_without_activity_returns_404(), test_create_daily_activity_canonicalises_a_prefixed_feai(), test_create_daily_activity_duplicate_day_returns_409() (+10 more)

### Community 11 - "create_app"
Cohesion: 0.06
Nodes (59): BaseModel, csv, API — `adapters/inbound/api/`, fastapi, field_validator, protab_adapters_inbound_api_auth, protab_adapters_inbound_api_errors, protab_adapters_inbound_api_schemas (+51 more)

### Community 12 - "PostgresAuthRepository"
Cohesion: 0.10
Nodes (18): _hash_password(), PostgresAuthRepository, Store project credentials and opaque, expiring session tokens., Grant permanent access to one project. Returns False if already set. The code…, Replace the password of an existing project and drop its sessions. Rotating a…, empty_database(), A project must never be created without someone able to enter it. Once it owns…, Both secrets are missing: the message must name the one resolved first.… (+10 more)

### Community 13 - "analytics.ts"
Cohesion: 0.16
Nodes (18): CONFIG, aggregateByDay(), aggregateByWeek(), clampRange(), computePeriodSummary(), dayCount(), ErrorHeatmap, firstActivityDay() (+10 more)

### Community 14 - "useToast.tsx"
Cohesion: 0.10
Nodes (13): ToastContainer(), ToastAction, ToastActionsContext, ToastActionsType, ToastContextType, ToastMessage, ToastProvider(), ToastStateContext (+5 more)

### Community 15 - "Frontend"
Cohesion: 0.17
Nodes (12): 10. Tests, 11. Ce qui n'existe pas, 12. Build et déploiement, 13. Documents voisins, 1. Pile technique, 2. Arborescence, 8. La page d'analyse — `/analyse`, 9. Graphiques et styles (+4 more)

### Community 16 - "protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository"
Cohesion: 0.17
Nodes (13): APIRoute, fastapi_routing, fastapi_testclient, protab_adapters_inbound_api_app, protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository, test_daily_activity_full_flow_over_http(), business_routes(), Business routes must be authenticated by default (allowlist, not denylist).… (+5 more)

### Community 17 - "InMemoryScopeMonitoringRepository"
Cohesion: 0.16
Nodes (14): protab_application_queries_get_daily_activity, protab_application_queries_get_scope, protab_application_queries_list_scopes, InMemoryScopeMonitoringRepository, date, GetDailyActivityUseCase, make_scope(), test_get_daily_activity_day_not_found_raises() (+6 more)

### Community 18 - "App.tsx"
Cohesion: 0.13
Nodes (19): 4. Chemins et routage, react-router-dom, App(), AppContent(), Navbar(), NavbarProps, ITEMS, PageNav() (+11 more)

### Community 19 - "postgres_scope_monitoring_repository_test.py"
Cohesion: 0.07
Nodes (40): reset_current_project(), set_current_project(), project(), add_scope_for(), project(), Give one project a scope, switching the tenant the adapter reads. Both tenants…, make_scope(), project_context() (+32 more)

### Community 20 - "project_admin.py"
Cohesion: 0.08
Nodes (37): argparse, 3. Configuration, dotenv, getpass, os, protab_adapters_inbound_api_config, protab_domain_value_objects_official_code, cookie_secure_from_env() (+29 more)

### Community 21 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 22 - "AuditEvent"
Cohesion: 0.11
Nodes (21): 4. Les ports, Absence de port pour l'authentification, Port d'audit — `ports/outbound/audit_trail_repository.py`, Port de périmètre — `ports/outbound/scope_monitoring_repository.py`, InMemoryAuditTrailRepository, PostgresAuditTrailRepository, Open the connection pool and apply the (idempotent) schema., Close the connection pool, releasing database connections. (+13 more)

### Community 23 - "FakeAuthRepository"
Cohesion: 0.13
Nodes (15): AuthSession, FakeAuthRepository, login_and_read_session_cookie(), Le refus porte sur la semaine entière, pas sur le week-end : un projet qui…, Le cookie et la ligne ``auth_sessions`` doivent tomber ensemble : un cookie…, test_authenticated_routes_require_a_valid_session(), test_in_memory_application_remains_unauthenticated_for_existing_fixtures(), test_login_rejects_invented_quadrigramme_when_known_codes_exist() (+7 more)

### Community 24 - "create_daily_activity_test.py"
Cohesion: 0.31
Nodes (12): protab_application_use_cases_create_daily_activity, handle_create_daily_activity(), CreateDailyActivityCommand, CreateDailyActivityUseCase, make_command(), make_scope(), make_scope_daily_activity(), test_create_daily_activity() (+4 more)

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

### Community 29 - "update_daily_activity_test.py"
Cohesion: 0.16
Nodes (20): 10. Cycle de vie d'une écriture, 5. La couche application, handle_update_daily_activity(), current_actor(), UpdateDailyActivityCommand, UpdateDailyActivityUseCase, build_changes(), Return only the fields whose value differs between ``before`` and ``after``.… (+12 more)

### Community 30 - "FastAPI & PostgreSQL Performance Optimizer Skill"
Cohesion: 0.22
Nodes (10): Caching Layer & Background Task Offloading, Connection Pooling Parameters, Database Indexing Strategy, Diagnostic & Audit Checklist, Event Loop Stall Detection, FastAPI & PostgreSQL Performance Optimizer Skill, N+1 Query Pattern Detection, Payload & Serialization Optimization (+2 more)

### Community 31 - "NonWorkingDays"
Cohesion: 0.09
Nodes (40): NonWorkingDays, A project's working calendar: recurring weekdays and one-off dates. Both…, The calendar of a project that never configured one., Rebuild a calendar from an untyped ``projects.non_working_days`` value. Lenient…, Un calendrier sans jour ouvré n'a rien à afficher : la page principale…, test_project_settings_reject_a_calendar_without_any_working_day(), Une ligne historique illisible ne doit pas vider le calendrier : elle est…, test_an_unreadable_column_reads_as_the_default_calendar() (+32 more)

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
Cohesion: 0.07
Nodes (46): 2. Vue d'ensemble des couches, protab, bootstrap_password(), fixture, Integration tests for the ``protab-project`` administrative command. The…, The whole point: the code belongs to the project, not to a scope., ``MLOZ/MRAM`` is the scope list form; as an admin it could never be matched by…, The command must close the sessions it orphans. Whether a removed administrator… (+38 more)

### Community 36 - "AnalyticsPage.tsx"
Cohesion: 0.13
Nodes (27): applyPreset(), ExportModal(), ScopeBase, AnalyticsPage(), formatPeriod(), GRANULARITIES, initialFilters(), defaultFrom (+19 more)

### Community 37 - "Development Workflow (9 Steps)"
Cohesion: 0.40
Nodes (6): Definition of Done Checklist, Development Workflow (9 Steps), Documentation Synchronization Requirement, Graphify Knowledge Graph Workflow, Test-Driven Development (RED/GREEN/REFACTOR), Testing Strategy (Test Pyramid)

### Community 38 - "AnalyticsCharts.tsx"
Cohesion: 0.24
Nodes (9): AnalyticsErrorHeatmap(), columnLabels(), ErrorCell(), ErrorMatrix(), heatmapClass(), buildErrorHeatmap(), ErrorHeatmapCell, ErrorHeatmapRow (+1 more)

### Community 40 - "complete_daily_activity_test.py"
Cohesion: 0.35
Nodes (12): complete_daily_activities(), CompleteDailyActivityCommand, CompleteDailyActivityUseCase, make_activity(), make_scope(), All days are resolved before anything is written. Completing day 1 then failing…, test_complete_day_without_activity_raises(), test_complete_does_not_touch_earlier_days_when_a_later_day_is_missing() (+4 more)

### Community 72 - "build_connection_pool"
Cohesion: 0.13
Nodes (11): ConnectionPool, protab_adapters_outbound_persistence_postgres_pool, psycopg, psycopg_pool, build_connection_pool(), ping_check(), Connection, Shared PostgreSQL connection-pool configuration for persistence adapters. (+3 more)

### Community 73 - "CreateScopeMonitoringUseCase"
Cohesion: 0.36
Nodes (9): CreateScopeMonitoringCommand, CreateScopeMonitoringUseCase, make_command(), test_create_blank_billing_code_raises_and_writes_nothing(), test_create_duplicate_name_raises_and_persists_nothing(), test_create_empty_official_raises(), test_create_invalid_knowledge_base_id_raises(), test_create_multiple_scope_monitorings() (+1 more)

### Community 74 - "postgres_auth_repository_test.py"
Cohesion: 0.07
Nodes (33): add_scope(), Integration tests for the PostgreSQL auth repository rule: the quadrigramme…, ``official_main`` encodes several codes just like ``official_backup``., ``?`` marks the absence of a backup official, it is not a code., La colonne est du JSONB non typé : ce qui est écrit doit être relu à…, The rule the whole feature exists for. Without an administrator, creating the…, Permanent access is not a password bypass: the admin is one factor., Reusing a project code is the likeliest CLI mistake, and it must not reach the… (+25 more)

### Community 75 - "graphify.js"
Cohesion: 0.40
Nodes (3): IMPORTANT: keep the reminder string free of backticks and $(...) constructs., ref_fs, ref_path

### Community 76 - "_official_codes"
Cohesion: 0.29
Nodes (9): _official_codes(), Quadrigrammes declared by one ``officials`` column (format « A/B »).…, Parsing of the officials columns that gate the quadrigramme. Both…, ``MRAM/ ?`` means "MRAM, no backup": ``?`` is not a quadrigramme., test_handles_empty_and_none(), test_ignores_punctuation_only_parts(), test_placeholder_is_not_a_code(), test_splits_multiple_codes() (+1 more)

### Community 78 - "ScopeListPage.tsx"
Cohesion: 0.13
Nodes (22): recharts, vitest, Badge(), BadgeProps, BillingCodeBadge(), BillingCodeBadgeProps, CompleteActivitiesModal(), CompleteTodayButton() (+14 more)

### Community 79 - "postgres_auth_bootstrap_test.py"
Cohesion: 0.21
Nodes (13): Return the quadrigramme seeding the first project's administrator. Same fail-…, Return the password seeding the first project, or refuse to start. Called only…, resolve_bootstrap_admin_code(), resolve_bootstrap_password(), The bootstrap secrets must never fall back to a hardcoded default. A missing…, test_admin_code_trims_surrounding_whitespace(), test_blank_admin_code_raises(), test_blank_variable_raises() (+5 more)

### Community 80 - "search.test.ts"
Cohesion: 0.33
Nodes (7): Recherche : le responsable passe avant le suppléant, matchesSearchQuery(), OFFICIAL_MATCH_RANK, officialMatchRank(), SearchableScope, SEARCHED_FIELDS, sortByOfficialRelevance()

### Community 82 - "Tally plutôt qu'un tableur de production"
Cohesion: 0.29
Nodes (6): Ce qu'un tableur continue de mieux faire, Ce que le Cloud a réglé… et ce que le tableur ne réglera jamais, Ce que Tally apporte, En résumé, Quand conserver le tableur ?, Tally plutôt qu'un tableur de production

### Community 83 - "ScopeMonitoringRepository"
Cohesion: 0.06
Nodes (16): GetScopeUseCase, ListScopesUseCase, AuditTrailRepository, Protocol, Persist an audit event., date, Protocol, Persist the given ScopeMonitoring. Replaces the whole aggregate: the scope row… (+8 more)

### Community 84 - "Développement"
Cohesion: 0.13
Nodes (14): 11. Où aller quand…, 10. Publier une modification — liste de contrôle, 11. Problèmes fréquents, 12. Documents voisins, 1. Prérequis, 2. Installation, 4. Démarrage en développement, 5. Base de données : pas d'outil de migration (+6 more)

### Community 85 - "datetime"
Cohesion: 0.10
Nodes (23): dataclasses, datetime, protab_adapters_outbound_persistence_postgres_scope_monitoring_repository, protab_application_actor_context, protab_application_commands_create_scope_monitoring, protab_application_commands_daily_activity, protab_domain_entities_audit_event, protab_domain_entities_daily_activity (+15 more)

### Community 86 - "fixture"
Cohesion: 0.50
Nodes (4): bootstrap_password(), fixture, The bootstrap secrets are mandatory: no default is provided.…, scopes()

### Community 87 - "AuditActivityHeatmap.tsx"
Cohesion: 0.27
Nodes (9): AuditActivityHeatmap(), AuditActivityHeatmapProps, HOURS, intensityClass(), WEEKDAYS, toMondayFirstIndex(), AuditEvent, buildHeatmapMatrix() (+1 more)

### Community 88 - "L'architecture Docker de ProTab"
Cohesion: 0.12
Nodes (17): 1. Vue d'ensemble à l'exécution, 2. Ordre de démarrage : ce que les dépendances garantissent, 3. Chaîne de construction des images, 4. Le premier démarrage : une fenêtre, pas une configuration, 5. Requêtes : le rôle de nginx est plus qu'un serveur de fichiers, 6. Sécurité : ce que la topologie garantit, et ce qu'elle ne garantit pas, 7. Commandes de la stack, Ce que le diagramme dit des ports publiés (+9 more)

### Community 92 - "@testing-library/react"
Cohesion: 0.12
Nodes (18): 6. Tests frontend, Pièges propres à cette suite, @testing-library/jest-dom, @testing-library/react, src_frontend_src_assets_layered_waves_dark, src_frontend_src_assets_layered_waves_light, DashboardCharts(), DateNavigator() (+10 more)

### Community 93 - "kpi.ts"
Cohesion: 0.15
Nodes (22): 6. Le modèle mono-jour, DEFAULT_EXCLUDED_WEEKDAYS, DEFAULT_NON_WORKING_DAYS, ISO_MONDAY, ISO_SATURDAY, ISO_SUNDAY, ISO_WEEKDAY_COUNT, ISO_WEEKDAY_MAX (+14 more)

### Community 96 - "Tests"
Cohesion: 0.15
Nodes (13): 1. Vue d'ensemble, 2. Tests unitaires — `tests/unit/`, 3. Tests d'intégration — `tests/integration/adapters/`, 4. Test E2E — `tests/e2e/`, 5. Ce que ces tests ne prouvent pas, 7. Écrire un nouveau test, 8. Documents voisins, Adaptateurs — `tests/unit/adapters/` (+5 more)

### Community 98 - "pytest"
Cohesion: 0.17
Nodes (13): protab_adapters_outbound_persistence_postgres_audit_trail_repository, pytest, make_event(), fixture, Integration tests for the PostgreSQL audit trail adapter. Skipped when…, repo(), test_list_filters_by_scope_actor_action_and_dates(), test_list_isolated_by_project() (+5 more)

### Community 100 - "lucide-react"
Cohesion: 0.12
Nodes (30): 5. Providers et état, 7. Saisie et autosave, Saisie d'une référence FEAI, Suppression et annulation, lucide-react, ActivityFormModal(), ActivityFormModalProps, CompleteActivitiesModalProps (+22 more)

### Community 102 - "ScopeMonitoring"
Cohesion: 0.11
Nodes (4): date, ScopeMonitoring, date, RecordingScopeMonitoringRepository

### Community 103 - "audit_log_api_test.py"
Cohesion: 0.16
Nodes (15): contextvars, protab_adapters_outbound_persistence_in_memory_audit_trail_repository, Per-request audit context. Mirrors the ``_CURRENT_PROJECT_ID`` ContextVar…, reset_current_actor(), set_current_actor(), all_events(), clear_actor(), env() (+7 more)

### Community 111 - "Architecture"
Cohesion: 0.14
Nodes (11): 12. Documents voisins, 1. Ce que fait l'application, 3. Le domaine, 7. Les adaptateurs sortants, 8. Multi-tenant : le mécanisme à comprendre avant toute modification, 9. Modèle de données, Architecture, RuntimeError (+3 more)

### Community 113 - "non_working_days.py"
Cohesion: 0.29
Nodes (6): enum, IntEnum, _is_iso_weekday(), IsoWeekday, The ISO 8601 weekday scale, which is what ``excluded_weekdays`` stores.…, Whether a raw entry names a weekday of the ISO scale. ``str.isdigit`` is not…

## Ambiguous Edges - Review These
- `React Root Mount (#root)` → `Audit Trail (best-effort mutation journal)`  [AMBIGUOUS]
  src/FrontEnd/index.html · relation: conceptually_related_to

## Knowledge Gaps
- **195 isolated node(s):** `$schema`, `plugin`, `protab`, `name`, `private` (+190 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 506 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **34 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `React Root Mount (#root)` and `Audit Trail (best-effort mutation journal)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `6. Le modèle mono-jour` connect `kpi.ts` to `search.test.ts`, `NonWorkingDays`, `Frontend`, `AuditActivityHeatmap.tsx`?**
  _High betweenness centrality (0.200) - this node is a cross-community bridge._
- **Why does `create_app()` connect `create_app` to `parse_scope_monitorings_csv`, `audit_log_api_test.py`, `complete_daily_activity_test.py`, `CreateScopeMonitoringUseCase`, `api_test.py`, `PostgresAuthRepository`, `protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository`, `InMemoryScopeMonitoringRepository`, `ScopeMonitoringRepository`, `postgres_scope_monitoring_repository_test.py`, `AuditEvent`, `FakeAuthRepository`, `create_daily_activity_test.py`, `update_daily_activity_test.py`, `NonWorkingDays`?**
  _High betweenness centrality (0.138) - this node is a cross-community bridge._
- **Why does `ProTab Project Documentation` connect `architecture.md` to `Hexagonal Architecture (Ports and Adapters)`, `PostgresScopeMonitoringRepository`, `api Service (FastAPI backend)`, `Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring)`?**
  _High betweenness centrality (0.107) - this node is a cross-community bridge._
- **Are the 57 inferred relationships involving `DailyActivity` (e.g. with `_activity_to_response()` and `InMemoryScopeMonitoringRepository`) actually correct?**
  _`DailyActivity` has 57 INFERRED edges - model-reasoned connections that need verification._
- **Are the 52 inferred relationships involving `create_app()` (e.g. with `API — `adapters/inbound/api/`` and `close_persistence()`) actually correct?**
  _`create_app()` has 52 INFERRED edges - model-reasoned connections that need verification._
- **Are the 53 inferred relationships involving `InMemoryScopeMonitoringRepository` (e.g. with `2. Vue d'ensemble des couches` and `5. Ce que ces tests ne prouvent pas`) actually correct?**
  _`InMemoryScopeMonitoringRepository` has 53 INFERRED edges - model-reasoned connections that need verification._