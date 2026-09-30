# Graph Report - ProTab  (2026-09-30)

## Corpus Check
- 180 files · ~89,819 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 8, .example 1, .conf 1)

## Summary
- 1453 nodes · 3335 edges · 116 communities (75 shown, 41 thin omitted)
- Extraction: 81% EXTRACTED · 19% INFERRED · 0% AMBIGUOUS · INFERRED: 618 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4655f964`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.tsx
- PostgresScopeMonitoringRepository
- package.json
- Frontend
- parse_scope_monitorings_csv
- OfficialCode
- DomainError
- react
- AuditEvent
- Officials
- api_test.py
- create_app
- empty_database
- FakeAuthRepository
- useToast.tsx
- AnalyticsPage.tsx
- protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository
- vitest
- DailyActivity
- postgres_scope_monitoring_repository_test.py
- api_config_test.py
- compilerOptions
- InMemoryScopeMonitoringRepository
- ScopeListPage.tsx
- create_daily_activity_test.py
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
- AnalyticsFilterBar.tsx
- Development Workflow (9 Steps)
- add_scope
- opencode.json
- CreateScopeMonitoringUseCase
- Application Layer / Use Cases
- protab
- build_connection_pool
- PostgresAuthRepository
- postgres_auth_repository_test.py
- postgres_scope_monitoring_repository.py
- protab_adapters_outbound_persistence_postgres_auth_repository
- architecture.md
- index.ts
- postgres_auth_bootstrap_test.py
- postgres_auth_repository.py
- current_user
- Tally plutôt qu'un tableur
- ScopeDetailPage.tsx
- ScopeMonitoring
- datetime
- fixture
- AuditLogPage.tsx
- L'architecture Docker de ProTab
- project_admin.py
- app.py
- audit_trail_test.py
- require_current_project
- Tests
- Développement
- SupervisionGrid.tsx
- AnalyticsCharts.tsx
- seed_three_days
- test_admin_authenticates_although_it_belongs_to_no_scope
- RecordingScopeMonitoringRepository
- dataclasses
- build_changes
- pytest
- project_context
- postgres_audit_trail_repository_test.py
- ._translate_unique_violation
- ScopeMonitoringNotFoundError
- create_default_app
- DateNavigator.tsx
- repo
- test_main_split_form_auths_both_codes
- test_backup_placeholder_is_not_a_login_code
- test_admin_authenticates_before_the_first_scope_is_created
- test_remove_admin_revokes_its_sessions
- test_admins_disappear_with_their_project
- test_adapters_refuse_to_read_or_write_without_project_context

## God Nodes (most connected - your core abstractions)
1. `DailyActivity` - 74 edges
2. `create_app()` - 70 edges
3. `InMemoryScopeMonitoringRepository` - 63 edges
4. `ScopeMonitoring` - 51 edges
5. `PostgresAuthRepository` - 33 edges
6. `react` - 30 edges
7. `PostgresScopeMonitoringRepository` - 28 edges
8. `ScopeMonitoringRepository` - 28 edges
9. `ScopeMonitoring` - 27 edges
10. `vitest` - 26 edges

## Surprising Connections (you probably didn't know these)
- `5. Ce que ces tests ne prouvent pas` --references--> `InMemoryScopeMonitoringRepository`  [INFERRED]
  docs/testing.md → src/protab/adapters/outbound/persistence/in_memory_scope_monitoring_repository.py
- `Application — `tests/unit/application/`` --references--> `InMemoryScopeMonitoringRepository`  [INFERRED]
  docs/testing.md → src/protab/adapters/outbound/persistence/in_memory_scope_monitoring_repository.py
- `6. Sécurité : ce que la topologie garantit, et ce qu'elle ne garantit pas` --references--> `MissingProjectContextError`  [INFERRED]
  docs/docker-architecture.md → src/protab/adapters/outbound/persistence/postgres_scope_monitoring_repository.py
- `Domaine — `tests/unit/domain/`` --references--> `build_changes()`  [INFERRED]
  docs/testing.md → src/protab/domain/entities/audit_event.py
- `Port d'audit — `ports/outbound/audit_trail_repository.py`` --references--> `AuditEventQuery`  [INFERRED]
  docs/architecture.md → src/protab/ports/outbound/audit_trail_repository.py

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **ProTab Mutation → Audit Trail Flow** — readme_mutation_use_cases, readme_audit_trail, readme_domain_invariants, readme_domain_error_http_mapping, readme_rest_routes_table [INFERRED 0.85]
- **ProTab PostgreSQL Persistence Path (port → adapter → pool → container)** — agents_scopemonitoringrepository_port, agents_postgres_scopemonitoringrepository, agents_idempotent_schema_bootstrap, agents_postgres_pool_configuration, readme_postgres_persistence, readme_scope_monitorings_index, docker_compose_db_service, docker_compose_api_service [INFERRED 0.85]
- **ProTab Hexagonal Core and Its Adapters** — agents_hexagonal_architecture, readme_scope_monitoring_aggregate, readme_mutation_use_cases, agents_scopemonitoringrepository_port, readme_http_api_adapter, readme_csv_import_adapter, readme_postgres_persistence [INFERRED 0.95]

## Communities (116 total, 41 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.14
Nodes (15): 4. Chemins et routage, react-dom, react-router-dom, App(), AuditShortcut(), Navbar(), NavbarProps, ITEMS (+7 more)

### Community 1 - "PostgresScopeMonitoringRepository"
Cohesion: 0.28
Nodes (5): PostgresScopeMonitoringRepository, Connection, date, Persist ``ScopeMonitoring`` aggregates in PostgreSQL. The schema is applied…, Close the connection pool, releasing database connections.

### Community 2 - "package.json"
Cohesion: 0.05
Nodes (41): IMPORTANT: keep the reminder string free of backticks and $(...) constructs., ref_fs, jsdom, ref_path, tailwindcss, @tailwindcss/vite, @types/node, @types/react (+33 more)

### Community 3 - "Frontend"
Cohesion: 0.11
Nodes (22): 10. Tests, 11. Ce qui n'existe pas, 12. Build et déploiement, 13. Documents voisins, 1. Pile technique, 2. Arborescence, 3. Client HTTP — `services/api.ts`, 5. Providers et état (+14 more)

### Community 4 - "parse_scope_monitorings_csv"
Cohesion: 0.16
Nodes (26): CSV — `adapters/inbound/csv/scope_monitoring_csv_reader.py`, fastapi_responses, JSONResponse, Path, pathlib, protab_adapters_inbound_csv_scope_monitoring_csv_reader, bad_request(), conflict() (+18 more)

### Community 5 - "OfficialCode"
Cohesion: 0.12
Nodes (23): OfficialCode, A single official identity, normalized the way login normalizes it.…, ``OfficialCode`` is the single-code form of an official identity. A project…, Only the ends are noise; a space inside is part of the identity., ``LoginRequest.quadrigramme`` allows two characters, so we must too., ``A/B`` is the Officials form; as an admin code it could never be typed back as…, ``?`` means "no backup official" in the scope columns; it is not a code., ``LoginRequest.quadrigramme`` caps at 20; a longer admin could never be typed… (+15 more)

### Community 6 - "DomainError"
Cohesion: 0.13
Nodes (23): DuplicateFeaiReferenceError, IncidentsExceedErrorsError, InvalidFeaiReferenceError, NegativeErrorsCountError, NegativeIncidentsCountError, Raised when incidents_created exceeds errors_reported., Raised when a FEAI reference does not match the expected format., Raised when a FEAI reference is duplicated within the same activity. (+15 more)

### Community 7 - "react"
Cohesion: 0.11
Nodes (23): react, ActivityFormModal(), ActivityFormModalProps, CompleteActivitiesModalProps, FeaiTagInput(), FeaiTagInputProps, UndoEntry, undoTitle() (+15 more)

### Community 8 - "AuditEvent"
Cohesion: 0.15
Nodes (9): PostgresAuditTrailRepository, Open the connection pool and apply the (idempotent) schema., Close the connection pool, releasing database connections., ListAuditEventsUseCase, AuditEvent, AuditTrailRepository, Protocol, Persist an audit event. (+1 more)

### Community 9 - "Officials"
Cohesion: 0.11
Nodes (25): KnowledgeBase, Officials, build_scope(), fixture_scope_monitoring(), fixture, parametrize, Adding a DailyActivity for a new day should succeed., Adding a second DailyActivity for the same day should raise… (+17 more)

### Community 10 - "api_test.py"
Cohesion: 0.08
Nodes (16): client(), create_scope_via_api(), make_scope_with_activity(), fixture, test_complete_daily_activities_returns_204(), test_complete_day_without_activity_returns_404(), test_create_daily_activity_duplicate_day_returns_409(), test_create_daily_activity_invalid_invariant_returns_400() (+8 more)

### Community 11 - "create_app"
Cohesion: 0.15
Nodes (24): BaseModel, field_validator, pydantic, _activity_to_response(), create_app(), create_scope_monitorings(), get_scope_daily_activity(), get_scope_monitoring() (+16 more)

### Community 12 - "empty_database"
Cohesion: 0.15
Nodes (13): empty_database(), A project must never be created without someone able to enter it. Once it owns…, Both secrets are missing: the message must name the one resolved first.…, The secrets are only needed to seed; a restart must not require them. Requiring…, The seeded administrator must be usable as a login right away., Create the schema, then drop every project so a bootstrap is pending., Seeding the first project demands an explicit, non-guessable password. No…, test_bootstrap_grants_the_configured_admin_code() (+5 more)

### Community 13 - "FakeAuthRepository"
Cohesion: 0.16
Nodes (11): AuthSession, FakeAuthRepository, login_and_read_session_cookie(), test_authenticated_routes_require_a_valid_session(), test_in_memory_application_remains_unauthenticated_for_existing_fixtures(), test_login_rejects_invented_quadrigramme_when_known_codes_exist(), test_project_settings_are_authenticated_and_project_scoped(), test_project_settings_reject_invalid_weekday() (+3 more)

### Community 14 - "useToast.tsx"
Cohesion: 0.10
Nodes (22): 7. Saisie et autosave, Suppression et annulation, CsvImportModal(), CsvImportModalProps, Modal(), ModalProps, ToastContainer(), WEEKDAYS (+14 more)

### Community 15 - "AnalyticsPage.tsx"
Cohesion: 0.11
Nodes (28): ExportModal(), ScopeBase, AnalyticsPage(), GRANULARITIES, NON_WORKING_DAYS, SCOPES, defaultFrom, renderModal() (+20 more)

### Community 16 - "protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository"
Cohesion: 0.17
Nodes (13): APIRoute, fastapi_routing, fastapi_testclient, protab_adapters_inbound_api_app, protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository, test_daily_activity_full_flow_over_http(), business_routes(), Business routes must be authenticated by default (allowlist, not denylist).… (+5 more)

### Community 17 - "vitest"
Cohesion: 0.18
Nodes (11): @testing-library/jest-dom, @testing-library/react, vitest, ToastProvider(), json(), PROJECT, SESSION, stubFetch() (+3 more)

### Community 18 - "DailyActivity"
Cohesion: 0.11
Nodes (21): 3. Le domaine, DailyActivity, date, Add one activity to an existing scope. Raises: DuplicateDailyActivityError: the…, Overwrite the counters of a single day, leaving the others alone. The…, test_daily_activity_creation_valid(), test_daily_activity_duplicate_feai_rejected(), test_daily_activity_errors_reported_negative() (+13 more)

### Community 19 - "postgres_scope_monitoring_repository_test.py"
Cohesion: 0.12
Nodes (19): make_scope(), date, Integration tests for the PostgreSQL repository adapter. These tests exercise…, test_api_flow_persists_in_postgres(), test_complete_unknown_day_does_not_partially_persist(), test_duplicate_name_via_api_returns_409(), test_find_all_loads_activities_for_all_scopes(), test_find_all_returns_scopes_ordered_by_name() (+11 more)

### Community 20 - "api_config_test.py"
Cohesion: 0.13
Nodes (19): 3. Configuration, dotenv, os, cookie_secure_from_env(), host_port_from_env(), InvalidPortError, Exception, Resolve host/port from env values, falling back to defaults. (+11 more)

### Community 21 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+11 more)

### Community 22 - "InMemoryScopeMonitoringRepository"
Cohesion: 0.20
Nodes (11): InMemoryScopeMonitoringRepository, date, GetDailyActivityUseCase, make_scope(), test_get_daily_activity_day_not_found_raises(), test_get_daily_activity_found(), test_get_daily_activity_scope_not_found_raises(), test_get_scope_found() (+3 more)

### Community 23 - "ScopeListPage.tsx"
Cohesion: 0.10
Nodes (37): 6. Le modèle mono-jour, 8. La page d'analyse — `/analyse`, La grille tient dans la largeur, ou n'affiche pas, Le reste de la page, 6. Tests frontend, Pièges propres à cette suite, recharts, AnalyticsFilterBarProps (+29 more)

### Community 24 - "create_daily_activity_test.py"
Cohesion: 0.35
Nodes (11): handle_create_daily_activity(), CreateDailyActivityCommand, CreateDailyActivityUseCase, make_command(), make_scope(), make_scope_daily_activity(), test_create_daily_activity(), test_create_duplicate_day_raises_and_persists_nothing() (+3 more)

### Community 25 - "Rule Categories by Priority (1-10)"
Cohesion: 0.20
Nodes (12): Design Dials (variance / motion / density), Design System Generation (--design-system), Design System Persistence (Master + Overrides), Pre-Delivery UI Checklist, Search Query Contract, Rule Categories by Priority (1-10), ui-ux-pro-max Search Script, Stack Detection Step (+4 more)

### Community 26 - "La CLI `protab-project`"
Cohesion: 0.12
Nodes (17): 10. En Docker, 11. Voir aussi, 1. Ce que la CLI fait, et ce qu'elle ne fait pas, 2. Prérequis, 3. Inventaire des commandes, 4. Les mots de passe, 5. Qui peut se connecter, 6. Pourquoi nommer un administrateur (+9 more)

### Community 27 - "Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring)"
Cohesion: 0.20
Nodes (11): Avoid Premature Abstraction, SOLID Principles, Aggregate Owns DailyActivities Indexed by Day, Atomic ScopeMonitoring Creation, CSV Import Inbound Adapter, DailyActivity (Entity), Day Is Not a Class (datetime.date as value object), Domain Invariants (counters, FEAI format, completion implication) (+3 more)

### Community 28 - "analytics.ts"
Cohesion: 0.14
Nodes (20): CONFIG, aggregateByDay(), aggregateByWeek(), buildSupervisionGrid(), CellState, ChartRow, columnDaysFor(), computePeriodSummary() (+12 more)

### Community 29 - "update_daily_activity_test.py"
Cohesion: 0.35
Nodes (11): 10. Cycle de vie d'une écriture, handle_update_daily_activity(), UpdateDailyActivityCommand, UpdateDailyActivityUseCase, make_scope_with_activity(), A PATCH must not rewrite the whole scope. Rewriting the aggregate persists…, test_update_daily_activity(), test_update_day_without_activity_raises() (+3 more)

### Community 30 - "FastAPI & PostgreSQL Performance Optimizer Skill"
Cohesion: 0.22
Nodes (10): Caching Layer & Background Task Offloading, Connection Pooling Parameters, Database Indexing Strategy, Diagnostic & Audit Checklist, Event Loop Stall Detection, FastAPI & PostgreSQL Performance Optimizer Skill, N+1 Query Pattern Detection, Payload & Serialization Optimization (+2 more)

### Community 31 - "complete_daily_activity_test.py"
Cohesion: 0.35
Nodes (12): complete_daily_activities(), CompleteDailyActivityCommand, CompleteDailyActivityUseCase, make_activity(), make_scope(), All days are resolved before anything is written. Completing day 1 then failing…, test_complete_day_without_activity_raises(), test_complete_does_not_touch_earlier_days_when_a_later_day_is_missing() (+4 more)

### Community 32 - "Hexagonal Architecture (Ports and Adapters)"
Cohesion: 0.17
Nodes (13): Adapters (Inbound / Outbound), Dependency Injection and Composition Root, Dependency Rule (Adapters → Ports → Application → Domain), Domain Layer, Domain Error Handling and Adapter Translation, Framework Isolation, Hexagonal Architecture (Ports and Adapters), Ports (Inbound and Outbound Contracts) (+5 more)

### Community 33 - "PostgresScopeMonitoringRepository"
Cohesion: 0.24
Nodes (11): API Configuration via load_dotenv and os.getenv, Configuration and Secrets Management, Idempotent Schema Bootstrap (CREATE TABLE IF NOT EXISTS), InMemoryScopeMonitoringRepository, PostgreSQL Integration Tests (make test-db), Centralized PostgreSQL Pool Configuration, PostgresScopeMonitoringRepository, ProTab Infrastructure Notes (+3 more)

### Community 34 - "api Service (FastAPI backend)"
Cohesion: 0.19
Nodes (13): api Healthcheck (/healthz), api Service (FastAPI backend), db Healthcheck (pg_isready), db Service (postgres:17-alpine), Default Project Seeding Env Vars, ProTab Development Docker Stack, frontend Service (React/nginx build), pgdata Named Volume (+5 more)

### Community 35 - "project_admin_test.py"
Cohesion: 0.07
Nodes (46): 2. Vue d'ensemble des couches, protab, bootstrap_password(), fixture, Integration tests for the ``protab-project`` administrative command. The…, The whole point: the code belongs to the project, not to a scope., ``MLOZ/MRAM`` is the scope list form; as an admin it could never be matched by…, The command must close the sessions it orphans. Whether a removed administrator… (+38 more)

### Community 36 - "AnalyticsFilterBar.tsx"
Cohesion: 0.14
Nodes (15): ANALYTICS_PATH, AnalyticsFilterBar(), AnalyticsFilters, SCOPE_DETAIL_PATH, SCOPE_LIST_PATH, scopeCountLabel(), initialFilters(), FILTERS (+7 more)

### Community 37 - "Development Workflow (9 Steps)"
Cohesion: 0.40
Nodes (6): Definition of Done Checklist, Development Workflow (9 Steps), Documentation Synchronization Requirement, Graphify Knowledge Graph Workflow, Test-Driven Development (RED/GREEN/REFACTOR), Testing Strategy (Test Pyramid)

### Community 38 - "add_scope"
Cohesion: 0.14
Nodes (14): add_scope(), Permanent access is not a password bypass: the admin is one factor., An administrator of A is nobody in B. ``GET /projects`` is unauthenticated, so…, Being an administrator never removes the scope officials' access., test_a_code_in_no_scope_and_no_admin_list_is_refused(), test_admin_alongside_scope_officials(), test_admin_code_is_normalized_like_a_scope_code(), test_admin_is_scoped_to_its_own_project() (+6 more)

### Community 40 - "CreateScopeMonitoringUseCase"
Cohesion: 0.53
Nodes (8): CreateScopeMonitoringUseCase, make_command(), test_create_blank_billing_code_raises_and_writes_nothing(), test_create_duplicate_name_raises_and_persists_nothing(), test_create_empty_official_raises(), test_create_invalid_knowledge_base_id_raises(), test_create_multiple_scope_monitorings(), test_create_stores_the_billing_code()

### Community 72 - "build_connection_pool"
Cohesion: 0.13
Nodes (11): ConnectionPool, protab_adapters_outbound_persistence_postgres_pool, psycopg, psycopg_pool, build_connection_pool(), ping_check(), Connection, Shared PostgreSQL connection-pool configuration for persistence adapters. (+3 more)

### Community 73 - "PostgresAuthRepository"
Cohesion: 0.11
Nodes (12): 4. Les ports, Absence de port pour l'authentification, Port d'audit — `ports/outbound/audit_trail_repository.py`, Port de périmètre — `ports/outbound/scope_monitoring_repository.py`, _check_password(), _normalize_code(), PostgresAuthRepository, Store project credentials and opaque, expiring session tokens. (+4 more)

### Community 74 - "postgres_auth_repository_test.py"
Cohesion: 0.14
Nodes (5): Integration tests for the PostgreSQL auth repository rule: the quadrigramme…, Reusing a project code is the likeliest CLI mistake, and it must not reach the…, A code the login screen refuses would lock the administrator out., test_add_admin_rejects_an_unusable_code(), test_creating_a_project_twice_reports_the_duplicate()

### Community 75 - "postgres_scope_monitoring_repository.py"
Cohesion: 0.21
Nodes (13): PostgreSQL outbound adapter for the ScopeMonitoringRepository port. The…, reset_current_project(), set_current_project(), project(), add_scope_for(), project(), Give one project a scope, switching the tenant the adapter reads. Both tenants…, project_context() (+5 more)

### Community 76 - "protab_adapters_outbound_persistence_postgres_auth_repository"
Cohesion: 0.25
Nodes (10): protab_adapters_outbound_persistence_postgres_auth_repository, _official_codes(), Quadrigrammes declared by one ``officials`` column (format « A/B »).…, Parsing of the officials columns that gate the quadrigramme. Both…, ``MRAM/ ?`` means "MRAM, no backup": ``?`` is not a quadrigramme., test_handles_empty_and_none(), test_ignores_punctuation_only_parts(), test_placeholder_is_not_a_code() (+2 more)

### Community 78 - "index.ts"
Cohesion: 0.16
Nodes (20): ScopeFormModal(), ScopeFormModalProps, ScopeItemState, ApiError, AuthSession, notifyUnauthorized(), parseFastApiErrorMessage(), request() (+12 more)

### Community 79 - "postgres_auth_bootstrap_test.py"
Cohesion: 0.21
Nodes (13): Return the quadrigramme seeding the first project's administrator. Same fail-…, Return the password seeding the first project, or refuse to start. Called only…, resolve_bootstrap_admin_code(), resolve_bootstrap_password(), The bootstrap secrets must never fall back to a hardcoded default. A missing…, test_admin_code_trims_surrounding_whitespace(), test_blank_admin_code_raises(), test_blank_variable_raises() (+5 more)

### Community 80 - "postgres_auth_repository.py"
Cohesion: 0.17
Nodes (8): hashlib, hmac, protab_domain_value_objects_official_code, secrets, _hash_password(), _normalize_non_working_days(), Project, PostgreSQL persistence for projects and login sessions.

### Community 81 - "current_user"
Cohesion: 0.17
Nodes (16): fastapi, protab_adapters_inbound_api_config, Response, get_project_settings(), list_projects(), login(), logout(), me() (+8 more)

### Community 82 - "Tally plutôt qu'un tableur"
Cohesion: 0.29
Nodes (6): Ce qu'un tableur fait mieux, Ce que coûte un tableur partagé, Ce que Tally change, En résumé, Quand ne pas migrer, Tally plutôt qu'un tableur

### Community 83 - "ScopeDetailPage.tsx"
Cohesion: 0.27
Nodes (8): lucide-react, Badge(), BadgeProps, CompleteActivitiesModal(), ScopeDetailPage(), protabApi, compareIsoDatesDesc(), formatDateFr()

### Community 84 - "ScopeMonitoring"
Cohesion: 0.09
Nodes (12): GetScopeUseCase, ListScopesUseCase, ScopeMonitoring, date, Protocol, Persist the given ScopeMonitoring. Replaces the whole aggregate: the scope row…, Flag the given days as handled and completed. Counters are never modified, and…, Return the ScopeMonitoring with the given id, or None. (+4 more)

### Community 85 - "datetime"
Cohesion: 0.17
Nodes (12): datetime, protab_application_actor_context, protab_application_commands_daily_activity, protab_domain_entities_audit_event, protab_domain_entities_daily_activity, protab_domain_entities_scope_monitoring, protab_domain_exceptions, protab_ports_outbound_audit_trail_repository (+4 more)

### Community 86 - "fixture"
Cohesion: 0.50
Nodes (4): bootstrap_password(), fixture, The bootstrap secrets are mandatory: no default is provided.…, scopes()

### Community 87 - "AuditLogPage.tsx"
Cohesion: 0.18
Nodes (14): AuditActivityHeatmap(), AuditActivityHeatmapProps, HOURS, intensityClass(), WEEKDAYS, ACTION_ICONS, ACTION_LABELS, AuditLogPage() (+6 more)

### Community 88 - "L'architecture Docker de ProTab"
Cohesion: 0.12
Nodes (17): 1. Vue d'ensemble à l'exécution, 2. Ordre de démarrage : ce que les dépendances garantissent, 3. Chaîne de construction des images, 4. Le premier démarrage : une fenêtre, pas une configuration, 5. Requêtes : le rôle de nginx est plus qu'un serveur de fichiers, 6. Sécurité : ce que la topologie garantit, et ce qu'elle ne garantit pas, 7. Commandes de la stack, Ce que le diagramme dit des ports publiés (+9 more)

### Community 89 - "project_admin.py"
Cohesion: 0.17
Nodes (20): argparse, getpass, build_repository(), Select the persistence adapter from configuration. PostgreSQL is required for…, database_url_from_env(), Return the PostgreSQL DSN from DATABASE_URL, or None when unset., _add_admin(), _create_project() (+12 more)

### Community 90 - "app.py"
Cohesion: 0.12
Nodes (15): csv, protab_adapters_inbound_api_auth, protab_adapters_inbound_api_errors, protab_adapters_inbound_api_schemas, protab_application_commands_create_scope_monitoring, protab_application_queries_get_daily_activity, protab_application_queries_get_scope, protab_application_queries_list_audit_events (+7 more)

### Community 91 - "audit_trail_test.py"
Cohesion: 0.28
Nodes (12): InMemoryAuditTrailRepository, current_project_id(), CreateScopeMonitoringCommand, AuditEventQuery, make_scope_with_activity(), test_complete_activity_records_audit_event_per_day(), test_create_activity_records_audit_event(), test_create_scope_from_csv_records_import_action() (+4 more)

### Community 92 - "require_current_project"
Cohesion: 0.18
Nodes (12): 11. Où aller quand…, 12. Documents voisins, 1. Ce que fait l'application, 8. Multi-tenant : le mécanisme à comprendre avant toute modification, 9. Modèle de données, Architecture, 11. Problèmes fréquents, RuntimeError (+4 more)

### Community 93 - "Tests"
Cohesion: 0.15
Nodes (13): 1. Vue d'ensemble, 2. Tests unitaires — `tests/unit/`, 3. Tests d'intégration — `tests/integration/adapters/`, 4. Test E2E — `tests/e2e/`, 5. Ce que ces tests ne prouvent pas, 7. Écrire un nouveau test, 8. Documents voisins, Adaptateurs — `tests/unit/adapters/` (+5 more)

### Community 94 - "Développement"
Cohesion: 0.17
Nodes (11): 10. Publier une modification — liste de contrôle, 12. Documents voisins, 1. Prérequis, 2. Installation, 5. Base de données : pas d'outil de migration, 6. Tests, 7. Administration d'hôte, 8. Docker (+3 more)

### Community 95 - "SupervisionGrid.tsx"
Cohesion: 0.17
Nodes (11): BillingCodeBadge(), BillingCodeBadgeProps, CELL_CLASS, cellLabel(), SupervisionGrid(), DAYS, SCOPES, GridCell (+3 more)

### Community 96 - "AnalyticsCharts.tsx"
Cohesion: 0.14
Nodes (16): AnalyticsRanking(), AnalyticsStack(), barRatio(), colorFor(), METRIC_LABEL, PALETTE, RankingLink(), rankingValue() (+8 more)

### Community 97 - "seed_three_days"
Cohesion: 0.50
Nodes (4): seed_three_days(), test_insert_daily_activity_leaves_other_days_untouched(), test_mark_activities_completed_flips_only_the_named_days(), test_update_daily_activity_leaves_other_days_untouched()

### Community 100 - "dataclasses"
Cohesion: 0.18
Nodes (7): dataclasses, protab_adapters_outbound_persistence_postgres_scope_monitoring_repository, psycopg_types_json, In-memory adapter of the AuditTrailRepository port for tests., PostgreSQL outbound adapter for the AuditTrailRepository port. The schema is…, Domain model for the audit trail. An :class:`AuditEvent` records *who* (actor)…, uuid

### Community 101 - "build_changes"
Cohesion: 0.24
Nodes (9): 5. La couche application, current_actor(), build_changes(), Return only the fields whose value differs between ``before`` and ``after``.…, test_audit_event_defaults(), test_build_changes_empty_when_identical(), test_build_changes_from_empty_keeps_all_fields(), test_build_changes_handles_removed_fields() (+1 more)

### Community 102 - "pytest"
Cohesion: 0.23
Nodes (9): protab_adapters_outbound_persistence_in_memory_audit_trail_repository, pytest, all_events(), make_scope_with_activity(), test_activity_flow_records_audit_via_api(), test_create_scope_records_audit_via_api(), test_get_audit_log_endpoint_filters_and_orders(), Tenant isolation must fail closed when no project context is established. A… (+1 more)

### Community 103 - "project_context"
Cohesion: 0.24
Nodes (10): contextvars, project_context(), Per-request audit context. Mirrors the ``_CURRENT_PROJECT_ID`` ContextVar…, reset_current_actor(), set_current_actor(), clear_actor(), env(), fixture (+2 more)

### Community 104 - "postgres_audit_trail_repository_test.py"
Cohesion: 0.25
Nodes (10): protab_adapters_outbound_persistence_postgres_audit_trail_repository, make_event(), fixture, Integration tests for the PostgreSQL audit trail adapter. Skipped when…, repo(), test_list_filters_by_scope_actor_action_and_dates(), test_list_isolated_by_project(), test_list_orders_most_recent_first() (+2 more)

### Community 105 - "._translate_unique_violation"
Cohesion: 0.24
Nodes (7): 7. Les adaptateurs sortants, Exception, DuplicateDailyActivityError, Raised when a ScopeMonitoring already has a DailyActivity for the given day., Raised when a ScopeMonitoring with the same name already exists., ScopeMonitoringNameAlreadyExistsError, UniqueViolation

### Community 106 - "ScopeMonitoringNotFoundError"
Cohesion: 0.25
Nodes (5): date, DailyActivityNotFoundError, Raised when a ScopeMonitoring cannot be found for the given id., Raised when a DailyActivity cannot be found for the given day., ScopeMonitoringNotFoundError

### Community 107 - "create_default_app"
Cohesion: 0.29
Nodes (7): 6. Les adaptateurs entrants, API — `adapters/inbound/api/`, CLI — `src/protab/project_admin.py`, 4. Démarrage en développement, create_default_app(), FastAPI, Create the production app using the configured PostgreSQL repository.

### Community 108 - "DateNavigator.tsx"
Cohesion: 0.53
Nodes (5): DateNavigator(), DateNavigatorProps, formatDayMonthFr(), formatWeekdayFr(), shiftDay()

### Community 109 - "repo"
Cohesion: 0.67
Nodes (3): fixture, repo(), truncate_all()

## Ambiguous Edges - Review These
- `React Root Mount (#root)` → `Audit Trail (best-effort mutation journal)`  [AMBIGUOUS]
  src/FrontEnd/index.html · relation: conceptually_related_to

## Knowledge Gaps
- **198 isolated node(s):** `$schema`, `plugin`, `protab`, `name`, `private` (+193 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 485 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **41 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `React Root Mount (#root)` and `Audit Trail (best-effort mutation journal)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Tests` connect `Tests` to `architecture.md`, `ScopeListPage.tsx`?**
  _High betweenness centrality (0.319) - this node is a cross-community bridge._
- **Why does `6. Tests frontend` connect `ScopeListPage.tsx` to `App.tsx`, `Frontend`, `react`, `DateNavigator.tsx`, `AnalyticsPage.tsx`, `AuditLogPage.tsx`, `Tests`?**
  _High betweenness centrality (0.309) - this node is a cross-community bridge._
- **Why does `InMemoryScopeMonitoringRepository` connect `InMemoryScopeMonitoringRepository` to `project_admin_test.py`, `pytest`, `project_context`, `CreateScopeMonitoringUseCase`, `api_test.py`, `FakeAuthRepository`, `protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository`, `DailyActivity`, `update_daily_activity_test.py`, `ScopeMonitoring`, `datetime`, `create_daily_activity_test.py`, `audit_trail_test.py`, `Tests`, `complete_daily_activity_test.py`?**
  _High betweenness centrality (0.170) - this node is a cross-community bridge._
- **Are the 53 inferred relationships involving `DailyActivity` (e.g. with `_activity_to_response()` and `InMemoryScopeMonitoringRepository`) actually correct?**
  _`DailyActivity` has 53 INFERRED edges - model-reasoned connections that need verification._
- **Are the 50 inferred relationships involving `create_app()` (e.g. with `API — `adapters/inbound/api/`` and `close_persistence()`) actually correct?**
  _`create_app()` has 50 INFERRED edges - model-reasoned connections that need verification._
- **Are the 51 inferred relationships involving `InMemoryScopeMonitoringRepository` (e.g. with `2. Vue d'ensemble des couches` and `5. Ce que ces tests ne prouvent pas`) actually correct?**
  _`InMemoryScopeMonitoringRepository` has 51 INFERRED edges - model-reasoned connections that need verification._