# Graph Report - ProTab  (2026-09-30)

## Corpus Check
- 180 files · ~91,354 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 8, .example 1, .conf 1)

## Summary
- 1447 nodes · 3323 edges · 116 communities (77 shown, 39 thin omitted)
- Extraction: 81% EXTRACTED · 19% INFERRED · 0% AMBIGUOUS · INFERRED: 619 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bb635484`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Frontend
- ScopeMonitoring
- package.json
- RecordingScopeMonitoringRepository
- parse_scope_monitorings_csv
- OfficialCode
- DomainError
- isValidIsoDate
- InMemoryScopeMonitoringRepository
- Officials
- api_test.py
- schemas.py
- empty_database
- PostgresAuthRepository
- vitest
- Développement
- protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository
- useToast.tsx
- App.tsx
- postgres_scope_monitoring_repository_test.py
- config.py
- compilerOptions
- ScopeMonitoringNotFoundError
- FakeAuthRepository
- create_daily_activity_test.py
- Rule Categories by Priority (1-10)
- La CLI `protab-project`
- Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring)
- postgres_scope_monitoring_repository.py
- update_daily_activity_test.py
- FastAPI & PostgreSQL Performance Optimizer Skill
- Architecture
- Hexagonal Architecture (Ports and Adapters)
- PostgresScopeMonitoringRepository
- api Service (FastAPI backend)
- project_admin_test.py
- analytics.ts
- Development Workflow (9 Steps)
- add_scope
- opencode.json
- CreateScopeMonitoringUseCase
- Application Layer / Use Cases
- protab
- build_connection_pool
- project_admin.py
- postgres_auth_repository_test.py
- ._translate_unique_violation
- _official_codes
- architecture.md
- ScopeDetailPage.tsx
- postgres_auth_bootstrap_test.py
- postgres_auth_repository.py
- create_app
- Tally plutôt qu'un tableur
- AuditEvent
- ScopeMonitoringRepository
- datetime
- fixture
- AuditLogPage.tsx
- L'architecture Docker de ProTab
- AnalyticsPage.tsx
- AnalyticsFilterBar.tsx
- app.py
- DailyActivity
- ScopeListPage.tsx
- current_user
- date.ts
- Tests
- index.ts
- ScopeMonitoring
- 4. Les ports
- ActivityFormModal.tsx
- api_config_test.py
- repo
- pytest
- postgres_audit_trail_repository_test.py
- set_current_actor
- ._activity_for
- _scope_to_response
- Design System Generation (--design-system)
- build_repository
- test_main_split_form_auths_both_codes
- test_backup_placeholder_is_not_a_login_code
- add_scope_for
- .add_admin
- test_creating_a_project_twice_reports_the_duplicate
- test_admin_alongside_scope_officials

## God Nodes (most connected - your core abstractions)
1. `DailyActivity` - 74 edges
2. `create_app()` - 70 edges
3. `InMemoryScopeMonitoringRepository` - 63 edges
4. `ScopeMonitoring` - 51 edges
5. `PostgresAuthRepository` - 33 edges
6. `react` - 30 edges
7. `PostgresScopeMonitoringRepository` - 28 edges
8. `ScopeMonitoringRepository` - 28 edges
9. `ScopeMonitoring` - 26 edges
10. `Officials` - 26 edges

## Surprising Connections (you probably didn't know these)
- `4. Démarrage en développement` --references--> `create_default_app()`  [INFERRED]
  docs/development.md → src/protab/adapters/inbound/api/app.py
- `5. Ce que ces tests ne prouvent pas` --references--> `InMemoryScopeMonitoringRepository`  [INFERRED]
  docs/testing.md → src/protab/adapters/outbound/persistence/in_memory_scope_monitoring_repository.py
- `Application — `tests/unit/application/`` --references--> `InMemoryScopeMonitoringRepository`  [INFERRED]
  docs/testing.md → src/protab/adapters/outbound/persistence/in_memory_scope_monitoring_repository.py
- `Absence de port pour l'authentification` --references--> `PostgresAuthRepository`  [INFERRED]
  docs/architecture.md → src/protab/adapters/outbound/persistence/postgres_auth_repository.py
- `6. Sécurité : ce que la topologie garantit, et ce qu'elle ne garantit pas` --references--> `MissingProjectContextError`  [INFERRED]
  docs/docker-architecture.md → src/protab/adapters/outbound/persistence/postgres_scope_monitoring_repository.py

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **ProTab Mutation → Audit Trail Flow** — readme_mutation_use_cases, readme_audit_trail, readme_domain_invariants, readme_domain_error_http_mapping, readme_rest_routes_table [INFERRED 0.85]
- **ProTab PostgreSQL Persistence Path (port → adapter → pool → container)** — agents_scopemonitoringrepository_port, agents_postgres_scopemonitoringrepository, agents_idempotent_schema_bootstrap, agents_postgres_pool_configuration, readme_postgres_persistence, readme_scope_monitorings_index, docker_compose_db_service, docker_compose_api_service [INFERRED 0.85]
- **ProTab Hexagonal Core and Its Adapters** — agents_hexagonal_architecture, readme_scope_monitoring_aggregate, readme_mutation_use_cases, agents_scopemonitoringrepository_port, readme_http_api_adapter, readme_csv_import_adapter, readme_postgres_persistence [INFERRED 0.95]

## Communities (116 total, 39 thin omitted)

### Community 0 - "Frontend"
Cohesion: 0.11
Nodes (22): 10. Tests, 11. Ce qui n'existe pas, 12. Build et déploiement, 13. Documents voisins, 1. Pile technique, 2. Arborescence, 3. Client HTTP — `services/api.ts`, 5. Providers et état (+14 more)

### Community 1 - "ScopeMonitoring"
Cohesion: 0.21
Nodes (9): 11. Problèmes fréquents, PostgresScopeMonitoringRepository, Connection, date, Return the current project id, or refuse to touch the database. Every read and…, Persist ``ScopeMonitoring`` aggregates in PostgreSQL. The schema is applied…, Close the connection pool, releasing database connections., require_current_project() (+1 more)

### Community 2 - "package.json"
Cohesion: 0.05
Nodes (41): IMPORTANT: keep the reminder string free of backticks and $(...) constructs., ref_fs, jsdom, ref_path, tailwindcss, @tailwindcss/vite, @types/node, @types/react (+33 more)

### Community 3 - "RecordingScopeMonitoringRepository"
Cohesion: 0.14
Nodes (13): CompleteDailyActivityCommand, CompleteDailyActivityUseCase, make_activity(), make_scope(), All days are resolved before anything is written. Completing day 1 then failing…, test_complete_day_without_activity_raises(), test_complete_does_not_touch_earlier_days_when_a_later_day_is_missing(), test_complete_multiple_days() (+5 more)

### Community 4 - "parse_scope_monitorings_csv"
Cohesion: 0.14
Nodes (28): 6. Les adaptateurs entrants, CLI — `src/protab/project_admin.py`, CSV — `adapters/inbound/csv/scope_monitoring_csv_reader.py`, fastapi_responses, JSONResponse, Path, pathlib, protab_adapters_inbound_csv_scope_monitoring_csv_reader (+20 more)

### Community 5 - "OfficialCode"
Cohesion: 0.12
Nodes (23): OfficialCode, A single official identity, normalized the way login normalizes it.…, ``OfficialCode`` is the single-code form of an official identity. A project…, Only the ends are noise; a space inside is part of the identity., ``LoginRequest.quadrigramme`` allows two characters, so we must too., ``A/B`` is the Officials form; as an admin code it could never be typed back as…, ``?`` means "no backup official" in the scope columns; it is not a code., ``LoginRequest.quadrigramme`` caps at 20; a longer admin could never be typed… (+15 more)

### Community 6 - "DomainError"
Cohesion: 0.13
Nodes (23): DuplicateFeaiReferenceError, IncidentsExceedErrorsError, InvalidFeaiReferenceError, NegativeErrorsCountError, NegativeIncidentsCountError, Raised when incidents_created exceeds errors_reported., Raised when a FEAI reference does not match the expected format., Raised when a FEAI reference is duplicated within the same activity. (+15 more)

### Community 7 - "isValidIsoDate"
Cohesion: 0.52
Nodes (6): DateNavigator(), DateNavigatorProps, formatDayMonthFr(), formatWeekdayFr(), shiftDay(), isValidIsoDate()

### Community 8 - "InMemoryScopeMonitoringRepository"
Cohesion: 0.16
Nodes (12): protab_application_queries_get_daily_activity, protab_application_queries_get_scope, protab_application_queries_list_scopes, InMemoryScopeMonitoringRepository, make_scope(), test_get_daily_activity_day_not_found_raises(), test_get_daily_activity_found(), test_get_daily_activity_scope_not_found_raises() (+4 more)

### Community 9 - "Officials"
Cohesion: 0.11
Nodes (26): 3. Le domaine, KnowledgeBase, Officials, build_scope(), fixture_scope_monitoring(), fixture, parametrize, Adding a DailyActivity for a new day should succeed. (+18 more)

### Community 10 - "api_test.py"
Cohesion: 0.08
Nodes (16): client(), create_scope_via_api(), make_scope_with_activity(), fixture, test_complete_daily_activities_returns_204(), test_complete_day_without_activity_returns_404(), test_create_daily_activity_duplicate_day_returns_409(), test_create_daily_activity_invalid_invariant_returns_400() (+8 more)

### Community 11 - "schemas.py"
Cohesion: 0.23
Nodes (12): BaseModel, field_validator, pydantic, AuditEventResponse, CompleteRequest, CreateActivityRequest, CreateScopeItem, LoginRequest (+4 more)

### Community 12 - "empty_database"
Cohesion: 0.15
Nodes (13): empty_database(), A project must never be created without someone able to enter it. Once it owns…, Both secrets are missing: the message must name the one resolved first.…, The secrets are only needed to seed; a restart must not require them. Requiring…, The seeded administrator must be usable as a login right away., Create the schema, then drop every project so a bootstrap is pending., Seeding the first project demands an explicit, non-guessable password. No…, test_bootstrap_grants_the_configured_admin_code() (+5 more)

### Community 13 - "PostgresAuthRepository"
Cohesion: 0.18
Nodes (6): _hash_password(), _normalize_non_working_days(), PostgresAuthRepository, Project, Store project credentials and opaque, expiring session tokens., Replace the password of an existing project and drop its sessions. Rotating a…

### Community 14 - "vitest"
Cohesion: 0.12
Nodes (14): @testing-library/jest-dom, @testing-library/react, vitest, ToastProvider(), json(), PROJECT, SESSION, stubFetch() (+6 more)

### Community 15 - "Développement"
Cohesion: 0.14
Nodes (13): 11. Où aller quand…, 10. Publier une modification — liste de contrôle, 12. Documents voisins, 1. Prérequis, 2. Installation, 4. Démarrage en développement, 5. Base de données : pas d'outil de migration, 6. Tests (+5 more)

### Community 16 - "protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository"
Cohesion: 0.17
Nodes (13): APIRoute, fastapi_routing, fastapi_testclient, protab_adapters_inbound_api_app, protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository, test_daily_activity_full_flow_over_http(), business_routes(), Business routes must be authenticated by default (allowlist, not denylist).… (+5 more)

### Community 17 - "useToast.tsx"
Cohesion: 0.11
Nodes (14): FeaiTagInput(), FeaiTagInputProps, UndoEntry, undoTitle(), ToastAction, ToastActionsContext, ToastActionsType, ToastContextType (+6 more)

### Community 18 - "App.tsx"
Cohesion: 0.18
Nodes (15): 4. Chemins et routage, react-dom, react-router-dom, App(), AuditShortcut(), Navbar(), NavbarProps, ITEMS (+7 more)

### Community 19 - "postgres_scope_monitoring_repository_test.py"
Cohesion: 0.11
Nodes (22): make_scope(), date, Integration tests for the PostgreSQL repository adapter. These tests exercise…, No project context must raise, never fall back to a default tenant., seed_three_days(), test_adapters_refuse_to_read_or_write_without_project_context(), test_find_all_loads_activities_for_all_scopes(), test_find_all_returns_scopes_ordered_by_name() (+14 more)

### Community 20 - "config.py"
Cohesion: 0.18
Nodes (12): 3. Configuration, dotenv, os, host_port_from_env(), InvalidPortError, Exception, Resolve host/port from env values, falling back to defaults., resolve_host_port() (+4 more)

### Community 21 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+11 more)

### Community 22 - "ScopeMonitoringNotFoundError"
Cohesion: 0.18
Nodes (6): date, GetScopeUseCase, DailyActivityNotFoundError, Raised when a ScopeMonitoring cannot be found for the given id., Raised when a DailyActivity cannot be found for the given day., ScopeMonitoringNotFoundError

### Community 23 - "FakeAuthRepository"
Cohesion: 0.16
Nodes (11): AuthSession, FakeAuthRepository, login_and_read_session_cookie(), test_authenticated_routes_require_a_valid_session(), test_in_memory_application_remains_unauthenticated_for_existing_fixtures(), test_login_rejects_invented_quadrigramme_when_known_codes_exist(), test_project_settings_are_authenticated_and_project_scoped(), test_project_settings_reject_invalid_weekday() (+3 more)

### Community 24 - "create_daily_activity_test.py"
Cohesion: 0.36
Nodes (11): handle_create_daily_activity(), CreateDailyActivityCommand, CreateDailyActivityUseCase, make_command(), make_scope(), make_scope_daily_activity(), test_create_daily_activity(), test_create_duplicate_day_raises_and_persists_nothing() (+3 more)

### Community 25 - "Rule Categories by Priority (1-10)"
Cohesion: 0.24
Nodes (11): Pre-Delivery UI Checklist, Search Query Contract, Rule Categories by Priority (1-10), UI/UX Pro Max Design Intelligence Skill, Zero-Result Fallback Policy, Audit Trail (best-effort mutation journal), Domain Error to HTTP Status Mapping, REST Routes and Status Codes Table (+3 more)

### Community 26 - "La CLI `protab-project`"
Cohesion: 0.12
Nodes (17): 10. En Docker, 11. Voir aussi, 1. Ce que la CLI fait, et ce qu'elle ne fait pas, 2. Prérequis, 3. Inventaire des commandes, 4. Les mots de passe, 5. Qui peut se connecter, 6. Pourquoi nommer un administrateur (+9 more)

### Community 27 - "Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring)"
Cohesion: 0.25
Nodes (9): Aggregate Owns DailyActivities Indexed by Day, Atomic ScopeMonitoring Creation, CSV Import Inbound Adapter, DailyActivity (Entity), Day Is Not a Class (datetime.date as value object), Domain Invariants (counters, FEAI format, completion implication), Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring), Query Use Cases (ListScopes, GetScope, GetDailyActivity, ListAuditEvents) (+1 more)

### Community 28 - "postgres_scope_monitoring_repository.py"
Cohesion: 0.21
Nodes (13): psycopg, project_context(), PostgreSQL outbound adapter for the ScopeMonitoringRepository port. The…, reset_current_project(), set_current_project(), project(), project(), project_context() (+5 more)

### Community 29 - "update_daily_activity_test.py"
Cohesion: 0.17
Nodes (20): 10. Cycle de vie d'une écriture, 5. La couche application, handle_update_daily_activity(), current_actor(), UpdateDailyActivityCommand, UpdateDailyActivityUseCase, build_changes(), Return only the fields whose value differs between ``before`` and ``after``.… (+12 more)

### Community 30 - "FastAPI & PostgreSQL Performance Optimizer Skill"
Cohesion: 0.22
Nodes (10): Caching Layer & Background Task Offloading, Connection Pooling Parameters, Database Indexing Strategy, Diagnostic & Audit Checklist, Event Loop Stall Detection, FastAPI & PostgreSQL Performance Optimizer Skill, N+1 Query Pattern Detection, Payload & Serialization Optimization (+2 more)

### Community 31 - "Architecture"
Cohesion: 0.25
Nodes (8): 12. Documents voisins, 1. Ce que fait l'application, 8. Multi-tenant : le mécanisme à comprendre avant toute modification, 9. Modèle de données, Architecture, RuntimeError, MissingProjectContextError, No authenticated request established the project to read or write.

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

### Community 36 - "analytics.ts"
Cohesion: 0.14
Nodes (25): CONFIG, aggregateByDay(), aggregateByWeek(), buildPeriodDays(), buildSupervisionGrid(), CellState, clampRange(), columnDaysFor() (+17 more)

### Community 37 - "Development Workflow (9 Steps)"
Cohesion: 0.40
Nodes (6): Definition of Done Checklist, Development Workflow (9 Steps), Documentation Synchronization Requirement, Graphify Knowledge Graph Workflow, Test-Driven Development (RED/GREEN/REFACTOR), Testing Strategy (Test Pyramid)

### Community 38 - "add_scope"
Cohesion: 0.14
Nodes (14): add_scope(), The rule the whole feature exists for. Without an administrator, creating the…, Permanent access is not a password bypass: the admin is one factor., ``authenticate()`` only runs at login, so a removed administrator would keep a…, test_a_code_in_no_scope_and_no_admin_list_is_refused(), test_admin_authenticates_although_it_belongs_to_no_scope(), test_admin_code_is_normalized_like_a_scope_code(), test_admin_still_needs_the_project_password() (+6 more)

### Community 40 - "CreateScopeMonitoringUseCase"
Cohesion: 0.36
Nodes (9): CreateScopeMonitoringCommand, CreateScopeMonitoringUseCase, make_command(), test_create_blank_billing_code_raises_and_writes_nothing(), test_create_duplicate_name_raises_and_persists_nothing(), test_create_empty_official_raises(), test_create_invalid_knowledge_base_id_raises(), test_create_multiple_scope_monitorings() (+1 more)

### Community 72 - "build_connection_pool"
Cohesion: 0.14
Nodes (10): ConnectionPool, protab_adapters_outbound_persistence_postgres_pool, psycopg_pool, build_connection_pool(), ping_check(), Connection, Shared PostgreSQL connection-pool configuration for persistence adapters., Check connectivity and leave the connection outside a transaction. (+2 more)

### Community 73 - "project_admin.py"
Cohesion: 0.22
Nodes (16): argparse, getpass, protab_domain_value_objects_official_code, _add_admin(), _create_project(), _list_admins(), main(), _open_existing_project() (+8 more)

### Community 74 - "postgres_auth_repository_test.py"
Cohesion: 0.12
Nodes (7): Integration tests for the PostgreSQL auth repository rule: the quadrigramme…, Naming an administrator is what makes creating the first scope safe. The…, A code the login screen refuses would lock the administrator out., ``project_admins`` cascades, or a recycled project code would inherit the…, test_add_admin_rejects_an_unusable_code(), test_admin_authenticates_before_the_first_scope_is_created(), test_admins_disappear_with_their_project()

### Community 75 - "._translate_unique_violation"
Cohesion: 0.28
Nodes (7): 7. Les adaptateurs sortants, Exception, DuplicateDailyActivityError, Raised when a ScopeMonitoring already has a DailyActivity for the given day., Raised when a ScopeMonitoring with the same name already exists., ScopeMonitoringNameAlreadyExistsError, UniqueViolation

### Community 76 - "_official_codes"
Cohesion: 0.29
Nodes (9): _official_codes(), Quadrigrammes declared by one ``officials`` column (format « A/B »).…, Parsing of the officials columns that gate the quadrigramme. Both…, ``MRAM/ ?`` means "MRAM, no backup": ``?`` is not a quadrigramme., test_handles_empty_and_none(), test_ignores_punctuation_only_parts(), test_placeholder_is_not_a_code(), test_splits_multiple_codes() (+1 more)

### Community 78 - "ScopeDetailPage.tsx"
Cohesion: 0.12
Nodes (20): lucide-react, react, Badge(), BadgeProps, CompleteActivitiesModal(), CsvImportModal(), CsvImportModalProps, Modal() (+12 more)

### Community 79 - "postgres_auth_bootstrap_test.py"
Cohesion: 0.21
Nodes (13): Return the quadrigramme seeding the first project's administrator. Same fail-…, Return the password seeding the first project, or refuse to start. Called only…, resolve_bootstrap_admin_code(), resolve_bootstrap_password(), The bootstrap secrets must never fall back to a hardcoded default. A missing…, test_admin_code_trims_surrounding_whitespace(), test_blank_admin_code_raises(), test_blank_variable_raises() (+5 more)

### Community 80 - "postgres_auth_repository.py"
Cohesion: 0.18
Nodes (8): hashlib, hmac, secrets, _check_password(), _normalize_code(), PostgreSQL persistence for projects and login sessions., Whether a quadrigramme is an administrator of that one project. Normalization…, Revoke permanent access and drop the sessions it had opened. ``authenticate()``…

### Community 81 - "create_app"
Cohesion: 0.16
Nodes (17): create_app(), complete_daily_activities(), create_scope_monitorings(), get_project_settings(), import_scope_monitorings_csv(), list_projects(), login(), me() (+9 more)

### Community 82 - "Tally plutôt qu'un tableur"
Cohesion: 0.29
Nodes (6): Ce qu'un tableur fait mieux, Ce que coûte un tableur partagé, Ce que Tally change, En résumé, Quand ne pas migrer, Tally plutôt qu'un tableur

### Community 83 - "AuditEvent"
Cohesion: 0.17
Nodes (9): PostgresAuditTrailRepository, Open the connection pool and apply the (idempotent) schema., Close the connection pool, releasing database connections., ListAuditEventsUseCase, AuditEvent, AuditTrailRepository, Protocol, Persist an audit event. (+1 more)

### Community 84 - "ScopeMonitoringRepository"
Cohesion: 0.08
Nodes (13): GetDailyActivityUseCase, ListScopesUseCase, date, Protocol, Persist the given ScopeMonitoring. Replaces the whole aggregate: the scope row…, Add one activity to an existing scope. Raises: DuplicateDailyActivityError: the…, Overwrite the counters of a single day, leaving the others alone. The…, Flag the given days as handled and completed. Counters are never modified, and… (+5 more)

### Community 85 - "datetime"
Cohesion: 0.11
Nodes (19): dataclasses, datetime, protab_adapters_outbound_persistence_postgres_scope_monitoring_repository, protab_application_actor_context, protab_application_commands_daily_activity, protab_domain_entities_audit_event, protab_domain_entities_daily_activity, protab_domain_entities_scope_monitoring (+11 more)

### Community 86 - "fixture"
Cohesion: 0.50
Nodes (4): bootstrap_password(), fixture, The bootstrap secrets are mandatory: no default is provided.…, scopes()

### Community 87 - "AuditLogPage.tsx"
Cohesion: 0.15
Nodes (17): 6. Tests frontend, Pièges propres à cette suite, AuditActivityHeatmap(), AuditActivityHeatmapProps, HOURS, intensityClass(), WEEKDAYS, TodayActivityEditor() (+9 more)

### Community 88 - "L'architecture Docker de ProTab"
Cohesion: 0.12
Nodes (17): 1. Vue d'ensemble à l'exécution, 2. Ordre de démarrage : ce que les dépendances garantissent, 3. Chaîne de construction des images, 4. Le premier démarrage : une fenêtre, pas une configuration, 5. Requêtes : le rôle de nginx est plus qu'un serveur de fichiers, 6. Sécurité : ce que la topologie garantit, et ce qu'elle ne garantit pas, 7. Commandes de la stack, Ce que le diagramme dit des ports publiés (+9 more)

### Community 89 - "AnalyticsPage.tsx"
Cohesion: 0.15
Nodes (17): ExportModal(), ScopeBase, AnalyticsPage(), formatPeriod(), GRANULARITIES, initialFilters(), MAX_TRACKED_DAYS, resolvePresetRange() (+9 more)

### Community 90 - "AnalyticsFilterBar.tsx"
Cohesion: 0.14
Nodes (16): ANALYTICS_PATH, AnalyticsFilterBar(), AnalyticsFilters, billingCodeKey(), SCOPE_DETAIL_PATH, SCOPE_LIST_PATH, scopeCountLabel(), toggleBillingCode() (+8 more)

### Community 91 - "app.py"
Cohesion: 0.12
Nodes (26): csv, protab_adapters_inbound_api_auth, protab_adapters_inbound_api_errors, protab_adapters_inbound_api_schemas, protab_application_commands_create_scope_monitoring, protab_application_queries_list_audit_events, protab_application_use_cases_complete_daily_activity, protab_application_use_cases_create_daily_activity (+18 more)

### Community 92 - "DailyActivity"
Cohesion: 0.16
Nodes (18): DailyActivity, date, test_daily_activity_creation_valid(), test_daily_activity_duplicate_feai_rejected(), test_daily_activity_errors_reported_negative(), test_daily_activity_incidents_created_negative(), test_daily_activity_incidents_exceed_errors(), test_daily_activity_invalid_feai_format() (+10 more)

### Community 93 - "ScopeListPage.tsx"
Cohesion: 0.17
Nodes (22): 6. Le modèle mono-jour, 8. La page d'analyse — `/analyse`, La grille tient dans la largeur, ou n'affiche pas, Le reste de la page, CompleteTodayButton(), CompleteTodayButtonProps, QuickFilter, ScopeListPage() (+14 more)

### Community 94 - "current_user"
Cohesion: 0.24
Nodes (10): API — `adapters/inbound/api/`, fastapi, protab_adapters_outbound_persistence_postgres_auth_repository, Response, logout(), clear_session_cookie(), current_user(), CurrentUser (+2 more)

### Community 95 - "date.ts"
Cohesion: 0.12
Nodes (20): Chaque bloc mesure une chose différente, AnalyticsErrorHeatmap(), columnLabels(), ErrorCell(), ErrorMatrix(), heatmapClass(), BillingCodeBadge(), BillingCodeBadgeProps (+12 more)

### Community 96 - "Tests"
Cohesion: 0.15
Nodes (13): 1. Vue d'ensemble, 2. Tests unitaires — `tests/unit/`, 3. Tests d'intégration — `tests/integration/adapters/`, 4. Test E2E — `tests/e2e/`, 5. Ce que ces tests ne prouvent pas, 7. Écrire un nouveau test, 8. Documents voisins, Adaptateurs — `tests/unit/adapters/` (+5 more)

### Community 97 - "index.ts"
Cohesion: 0.16
Nodes (20): ScopeFormModal(), ScopeFormModalProps, ScopeItemState, ApiError, AuthSession, notifyUnauthorized(), parseFastApiErrorMessage(), request() (+12 more)

### Community 98 - "ScopeMonitoring"
Cohesion: 0.13
Nodes (19): recharts, AnalyticsFilterBarProps, DashboardCharts(), DashboardChartsProps, ExportModalProps, ScopeDetailCharts(), ScopeDetailChartsProps, ScopeDetailCharts (+11 more)

### Community 99 - "4. Les ports"
Cohesion: 0.50
Nodes (4): 4. Les ports, Absence de port pour l'authentification, Port d'audit — `ports/outbound/audit_trail_repository.py`, Port de périmètre — `ports/outbound/scope_monitoring_repository.py`

### Community 100 - "ActivityFormModal.tsx"
Cohesion: 0.16
Nodes (17): 7. Saisie et autosave, Suppression et annulation, ActivityFormModal(), ActivityFormModalProps, CompleteActivitiesModalProps, InlineActivityCounters(), InlineActivityCountersProps, SaveStatus (+9 more)

### Community 101 - "api_config_test.py"
Cohesion: 0.31
Nodes (8): protab_adapters_inbound_api_config, cookie_secure_from_env(), Whether the session cookie must carry the ``Secure`` attribute. Defaults to…, parametrize, test_cookie_secure_defaults_to_false_for_local_http(), test_cookie_secure_falsy_values(), test_cookie_secure_truthy_values(), test_defaults()

### Community 102 - "repo"
Cohesion: 0.67
Nodes (3): fixture, repo(), truncate_all()

### Community 103 - "pytest"
Cohesion: 0.19
Nodes (11): protab_adapters_outbound_persistence_in_memory_audit_trail_repository, pytest, all_events(), env(), make_scope_with_activity(), fixture, test_activity_flow_records_audit_via_api(), test_create_scope_records_audit_via_api() (+3 more)

### Community 104 - "postgres_audit_trail_repository_test.py"
Cohesion: 0.25
Nodes (10): protab_adapters_outbound_persistence_postgres_audit_trail_repository, make_event(), fixture, Integration tests for the PostgreSQL audit trail adapter. Skipped when…, repo(), test_list_filters_by_scope_actor_action_and_dates(), test_list_isolated_by_project(), test_list_orders_most_recent_first() (+2 more)

### Community 105 - "set_current_actor"
Cohesion: 0.32
Nodes (7): contextvars, Per-request audit context. Mirrors the ``_CURRENT_PROJECT_ID`` ContextVar…, reset_current_actor(), set_current_actor(), clear_actor(), clean_actor(), fixture

### Community 107 - "_scope_to_response"
Cohesion: 0.33
Nodes (6): _activity_to_response(), get_scope_daily_activity(), get_scope_monitoring(), list_scope_monitorings(), _scope_to_response(), ActivityResponse

### Community 108 - "Design System Generation (--design-system)"
Cohesion: 0.40
Nodes (5): Design Dials (variance / motion / density), Design System Generation (--design-system), Design System Persistence (Master + Overrides), ui-ux-pro-max Search Script, Stack Detection Step

### Community 109 - "build_repository"
Cohesion: 0.40
Nodes (5): build_repository(), Select the persistence adapter from configuration. PostgreSQL is required for…, database_url_from_env(), Return the PostgreSQL DSN from DATABASE_URL, or None when unset., _open_repository()

### Community 112 - "add_scope_for"
Cohesion: 0.50
Nodes (4): add_scope_for(), Give one project a scope, switching the tenant the adapter reads. Both tenants…, An administrator of A is nobody in B. ``GET /projects`` is unauthenticated, so…, test_admin_is_scoped_to_its_own_project()

## Ambiguous Edges - Review These
- `React Root Mount (#root)` → `Audit Trail (best-effort mutation journal)`  [AMBIGUOUS]
  src/FrontEnd/index.html · relation: conceptually_related_to

## Knowledge Gaps
- **192 isolated node(s):** `$schema`, `plugin`, `protab`, `name`, `private` (+187 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 476 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **39 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `React Root Mount (#root)` and `Audit Trail (best-effort mutation journal)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Tests` connect `Tests` to `architecture.md`, `AuditLogPage.tsx`?**
  _High betweenness centrality (0.316) - this node is a cross-community bridge._
- **Why does `6. Tests frontend` connect `AuditLogPage.tsx` to `Frontend`, `Tests`, `ScopeMonitoring`, `isValidIsoDate`, `useToast.tsx`, `App.tsx`, `AnalyticsPage.tsx`, `ScopeListPage.tsx`?**
  _High betweenness centrality (0.299) - this node is a cross-community bridge._
- **Why does `InMemoryScopeMonitoringRepository` connect `InMemoryScopeMonitoringRepository` to `Tests`, `ScopeMonitoring`, `project_admin_test.py`, `RecordingScopeMonitoringRepository`, `pytest`, `CreateScopeMonitoringUseCase`, `._activity_for`, `api_test.py`, `protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository`, `datetime`, `FakeAuthRepository`, `create_daily_activity_test.py`, `app.py`, `DailyActivity`, `update_daily_activity_test.py`?**
  _High betweenness centrality (0.178) - this node is a cross-community bridge._
- **Are the 53 inferred relationships involving `DailyActivity` (e.g. with `_activity_to_response()` and `InMemoryScopeMonitoringRepository`) actually correct?**
  _`DailyActivity` has 53 INFERRED edges - model-reasoned connections that need verification._
- **Are the 50 inferred relationships involving `create_app()` (e.g. with `API — `adapters/inbound/api/`` and `close_persistence()`) actually correct?**
  _`create_app()` has 50 INFERRED edges - model-reasoned connections that need verification._
- **Are the 51 inferred relationships involving `InMemoryScopeMonitoringRepository` (e.g. with `2. Vue d'ensemble des couches` and `5. Ce que ces tests ne prouvent pas`) actually correct?**
  _`InMemoryScopeMonitoringRepository` has 51 INFERRED edges - model-reasoned connections that need verification._