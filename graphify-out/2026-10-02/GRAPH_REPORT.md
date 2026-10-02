# Graph Report - ProTab  (2026-10-02)

## Corpus Check
- 192 files · ~100,204 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 8, .example 1, .conf 1)

## Summary
- 1595 nodes · 3731 edges · 110 communities (70 shown, 40 thin omitted)
- Extraction: 80% EXTRACTED · 20% INFERRED · 0% AMBIGUOUS · INFERRED: 736 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `eb8701de`
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
- AnalyticsFilterBar.test.tsx
- Officials
- api_test.py
- create_app
- empty_database
- current_user
- useToast.tsx
- pytest
- route_authorization_test.py
- ._activity_for
- App.tsx
- postgres_scope_monitoring_repository_test.py
- api_config_test.py
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
- analytics.ts
- Development Workflow (9 Steps)
- ScopeMonitoring
- opencode.json
- RecordingScopeMonitoringRepository
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
- set_current_project
- add_scope
- Tally plutôt qu'un tableur de production
- ScopeMonitoringRepository
- Développement
- app.py
- fixture
- project_admin_cli_test.py
- L'architecture Docker de ProTab
- ScopeMonitoringNotFoundError
- create_default_app
- AppSessionLoss.test.tsx
- repository
- kpi.ts
- build_repository
- add_scope_for
- Tests
- test_main_split_form_auths_both_codes
- postgres_audit_trail_repository_test.py
- test_admin_still_needs_the_project_password
- ActivityFormModal.tsx
- test_creating_a_project_twice_reports_the_duplicate
- InMemoryScopeMonitoringRepository
- build_changes
- test_admin_alongside_scope_officials
- test_admins_disappear_with_their_project
- test_remove_admin_refuses_the_last_administrator
- Architecture
- non_working_days.py
- PostgresAuthRepository

## God Nodes (most connected - your core abstractions)
1. `DailyActivity` - 80 edges
2. `create_app()` - 76 edges
3. `InMemoryScopeMonitoringRepository` - 74 edges
4. `ScopeMonitoring` - 55 edges
5. `PostgresAuthRepository` - 34 edges
6. `react` - 31 edges
7. `ScopeMonitoringRepository` - 31 edges
8. `vitest` - 29 edges
9. `PostgresScopeMonitoringRepository` - 29 edges
10. `Officials` - 29 edges

## Surprising Connections (you probably didn't know these)
- `La note du périmètre — un brouillon, pas un autosave` --references--> `ScopeNoteCard()`  [INFERRED]
  docs/frontend.md → src/FrontEnd/src/components/ScopeNoteCard.tsx
- `3. Configuration` --references--> `InvalidPortError`  [INFERRED]
  docs/development.md → src/protab/adapters/inbound/api/config.py
- `5. Ce que ces tests ne prouvent pas` --references--> `InMemoryScopeMonitoringRepository`  [INFERRED]
  docs/testing.md → src/protab/adapters/outbound/persistence/in_memory_scope_monitoring_repository.py
- `Application — `tests/unit/application/`` --references--> `InMemoryScopeMonitoringRepository`  [INFERRED]
  docs/testing.md → src/protab/adapters/outbound/persistence/in_memory_scope_monitoring_repository.py
- `6. Sécurité : ce que la topologie garantit, et ce qu'elle ne garantit pas` --references--> `MissingProjectContextError`  [INFERRED]
  docs/docker-architecture.md → src/protab/adapters/outbound/persistence/postgres_scope_monitoring_repository.py

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **ProTab Mutation → Audit Trail Flow** — readme_mutation_use_cases, readme_audit_trail, readme_domain_invariants, readme_domain_error_http_mapping, readme_rest_routes_table [INFERRED 0.85]
- **ProTab PostgreSQL Persistence Path (port → adapter → pool → container)** — agents_scopemonitoringrepository_port, agents_postgres_scopemonitoringrepository, agents_idempotent_schema_bootstrap, agents_postgres_pool_configuration, readme_postgres_persistence, readme_scope_monitorings_index, docker_compose_db_service, docker_compose_api_service [INFERRED 0.85]
- **ProTab Hexagonal Core and Its Adapters** — agents_hexagonal_architecture, readme_scope_monitoring_aggregate, readme_mutation_use_cases, agents_scopemonitoringrepository_port, readme_http_api_adapter, readme_csv_import_adapter, readme_postgres_persistence [INFERRED 0.95]

## Communities (110 total, 40 thin omitted)

### Community 0 - "index.ts"
Cohesion: 0.10
Nodes (33): AuditActivityHeatmap(), AuditActivityHeatmapProps, HOURS, intensityClass(), WEEKDAYS, ScopeFormModal(), ScopeFormModalProps, ScopeItemState (+25 more)

### Community 1 - "PostgresScopeMonitoringRepository"
Cohesion: 0.15
Nodes (13): 8. Multi-tenant : le mécanisme à comprendre avant toute modification, RuntimeError, MissingProjectContextError, PostgresScopeMonitoringRepository, Connection, date, Return the current project id, or refuse to touch the database. Every read and…, Persist ``ScopeMonitoring`` aggregates in PostgreSQL. The schema is applied… (+5 more)

### Community 2 - "package.json"
Cohesion: 0.05
Nodes (38): jsdom, tailwindcss, @tailwindcss/vite, @types/node, @types/react, @types/react-dom, typescript, vite (+30 more)

### Community 3 - "react"
Cohesion: 0.12
Nodes (16): Suppression et annulation, react, react-dom, AnalyticsFilterBarProps, CsvImportModal(), CsvImportModalProps, Modal(), ModalProps (+8 more)

### Community 4 - "parse_scope_monitorings_csv"
Cohesion: 0.14
Nodes (29): csv, 6. Les adaptateurs entrants, CLI — `src/protab/project_admin.py`, CSV — `adapters/inbound/csv/scope_monitoring_csv_reader.py`, fastapi_responses, JSONResponse, Path, pathlib (+21 more)

### Community 5 - "OfficialCode"
Cohesion: 0.07
Nodes (42): argparse, getpass, protab_adapters_outbound_persistence_postgres_auth_repository, protab_domain_value_objects_official_code, Grant permanent access to one project. Returns False if already set. The code…, OfficialCode, A single official identity, normalized the way login normalizes it.…, _add_admin() (+34 more)

### Community 6 - "DomainError"
Cohesion: 0.11
Nodes (29): canonical_feai(), Ramène une référence à sa forme canonique ``FE-INC000000001``. La saisie est…, DuplicateFeaiReferenceError, IncidentsExceedErrorsError, InvalidFeaiReferenceError, NegativeErrorsCountError, NegativeIncidentsCountError, Raised when incidents_created exceeds errors_reported. (+21 more)

### Community 7 - "DailyActivity"
Cohesion: 0.11
Nodes (25): DailyActivity, date, Add one activity to an existing scope. Raises: DuplicateDailyActivityError: the…, Overwrite the counters of a single day, leaving the others alone. The…, parametrize, test_daily_activity_canonicalises_a_prefixed_feai(), test_daily_activity_creation_valid(), test_daily_activity_duplicate_feai_rejected() (+17 more)

### Community 8 - "AnalyticsFilterBar.test.tsx"
Cohesion: 0.50
Nodes (3): FILTERS, MANY, scope()

### Community 9 - "Officials"
Cohesion: 0.10
Nodes (28): KnowledgeBase, Officials, build_scope(), fixture_scope_monitoring(), fixture, parametrize, Adding a DailyActivity for a new day should succeed., Adding a second DailyActivity for the same day should raise… (+20 more)

### Community 10 - "api_test.py"
Cohesion: 0.07
Nodes (24): client(), create_scope_via_api(), make_scope_with_activity(), fixture, 422, not 400: the bound is refused by the request schema itself. The domain's…, test_complete_daily_activities_returns_204(), test_complete_day_without_activity_returns_404(), test_create_daily_activity_canonicalises_a_prefixed_feai() (+16 more)

### Community 11 - "create_app"
Cohesion: 0.13
Nodes (28): BaseModel, field_validator, pydantic, _activity_to_response(), create_app(), create_scope_monitorings(), get_scope_daily_activity(), get_scope_monitoring() (+20 more)

### Community 12 - "empty_database"
Cohesion: 0.15
Nodes (13): empty_database(), A project must never be created without someone able to enter it. Once it owns…, Both secrets are missing: the message must name the one resolved first.…, The secrets are only needed to seed; a restart must not require them. Requiring…, The seeded administrator must be usable as a login right away., Create the schema, then drop every project so a bootstrap is pending., Seeding the first project demands an explicit, non-guessable password. No…, test_bootstrap_grants_the_configured_admin_code() (+5 more)

### Community 13 - "current_user"
Cohesion: 0.16
Nodes (17): API — `adapters/inbound/api/`, fastapi, protab_adapters_inbound_api_config, Response, get_project_settings(), list_projects(), login(), logout() (+9 more)

### Community 14 - "useToast.tsx"
Cohesion: 0.07
Nodes (30): @testing-library/jest-dom, @testing-library/react, vitest, ScopeNoteCard(), ScopeNoteCardProps, ToastContainer(), ToastAction, ToastActionsContext (+22 more)

### Community 15 - "pytest"
Cohesion: 0.17
Nodes (12): protab_adapters_inbound_api_app, protab_adapters_outbound_persistence_in_memory_audit_trail_repository, protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository, pytest, test_daily_activity_full_flow_over_http(), all_events(), make_scope_with_activity(), test_activity_flow_records_audit_via_api() (+4 more)

### Community 16 - "route_authorization_test.py"
Cohesion: 0.22
Nodes (10): APIRoute, fastapi_routing, fastapi_testclient, business_routes(), Business routes must be authenticated by default (allowlist, not denylist).…, Guards against a silent rename making this test vacuously pass., A public route answers an anonymous caller; a business route does not. Uses a…, test_business_routes_are_discovered() (+2 more)

### Community 18 - "App.tsx"
Cohesion: 0.10
Nodes (27): 3. Client HTTP — `services/api.ts`, 4. Chemins et routage, 5. Providers et état, react-router-dom, AppContent(), src_frontend_src_assets_layered_waves_dark, src_frontend_src_assets_layered_waves_light, LoginBackground() (+19 more)

### Community 19 - "postgres_scope_monitoring_repository_test.py"
Cohesion: 0.10
Nodes (26): make_scope(), date, Integration tests for the PostgreSQL repository adapter. These tests exercise…, The write must name the rows it changes, like the activity writes. A full…, ``save`` owns the aggregate, not the note. It may create a row from an…, seed_three_days(), test_find_all_loads_activities_for_all_scopes(), test_find_all_returns_scopes_ordered_by_name() (+18 more)

### Community 20 - "api_config_test.py"
Cohesion: 0.18
Nodes (15): dotenv, cookie_secure_from_env(), host_port_from_env(), InvalidPortError, Exception, Resolve host/port from env values, falling back to defaults., Whether the session cookie must carry the ``Secure`` attribute. Defaults to…, resolve_host_port() (+7 more)

### Community 21 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 22 - "AuditEvent"
Cohesion: 0.17
Nodes (11): _audit_event_to_response(), list_scope_audit_log(), PostgresAuditTrailRepository, Open the connection pool and apply the (idempotent) schema., Close the connection pool, releasing database connections., current_project_id(), ListAuditEventsUseCase, AuditEvent (+3 more)

### Community 23 - "FakeAuthRepository"
Cohesion: 0.12
Nodes (17): AuthSession, FakeAuthRepository, login_and_read_session_cookie(), Un calendrier sans jour ouvré n'a rien à afficher : la page principale…, Le refus porte sur la semaine entière, pas sur le week-end : un projet qui…, Le cookie et la ligne ``auth_sessions`` doivent tomber ensemble : un cookie…, test_authenticated_routes_require_a_valid_session(), test_in_memory_application_remains_unauthenticated_for_existing_fixtures() (+9 more)

### Community 24 - "create_daily_activity_test.py"
Cohesion: 0.28
Nodes (14): handle_create_daily_activity(), CreateDailyActivityCommand, CreateDailyActivityUseCase, make_scope_with_activity(), test_create_activity_records_audit_event(), test_no_repository_keeps_working_without_audit(), make_command(), make_scope() (+6 more)

### Community 25 - "Rule Categories by Priority (1-10)"
Cohesion: 0.20
Nodes (12): Design Dials (variance / motion / density), Design System Generation (--design-system), Design System Persistence (Master + Overrides), Pre-Delivery UI Checklist, Search Query Contract, Rule Categories by Priority (1-10), ui-ux-pro-max Search Script, Stack Detection Step (+4 more)

### Community 26 - "La CLI `protab-project`"
Cohesion: 0.12
Nodes (17): 10. En Docker, 11. Voir aussi, 1. Ce que la CLI fait, et ce qu'elle ne fait pas, 2. Prérequis, 3. Inventaire des commandes, 4. Les mots de passe, 5. Qui peut se connecter, 6. Pourquoi nommer un administrateur (+9 more)

### Community 27 - "Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring)"
Cohesion: 0.20
Nodes (11): Avoid Premature Abstraction, SOLID Principles, Aggregate Owns DailyActivities Indexed by Day, Atomic ScopeMonitoring Creation, CSV Import Inbound Adapter, DailyActivity (Entity), Day Is Not a Class (datetime.date as value object), Domain Invariants (counters, FEAI format, completion implication) (+3 more)

### Community 28 - "postgres_auth_repository.py"
Cohesion: 0.15
Nodes (10): hashlib, hmac, protab_domain_value_objects_non_working_days, psycopg_types_json, secrets, _check_password(), _normalize_code(), PostgreSQL persistence for projects and login sessions. (+2 more)

### Community 29 - "update_daily_activity_test.py"
Cohesion: 0.32
Nodes (12): 10. Cycle de vie d'une écriture, handle_update_daily_activity(), UpdateDailyActivityCommand, UpdateDailyActivityUseCase, test_update_activity_records_audit_event_with_diff(), make_scope_with_activity(), A PATCH must not rewrite the whole scope. Rewriting the aggregate persists…, test_update_daily_activity() (+4 more)

### Community 30 - "FastAPI & PostgreSQL Performance Optimizer Skill"
Cohesion: 0.22
Nodes (10): Caching Layer & Background Task Offloading, Connection Pooling Parameters, Database Indexing Strategy, Diagnostic & Audit Checklist, Event Loop Stall Detection, FastAPI & PostgreSQL Performance Optimizer Skill, N+1 Query Pattern Detection, Payload & Serialization Optimization (+2 more)

### Community 31 - "NonWorkingDays"
Cohesion: 0.10
Nodes (38): NonWorkingDays, A project's working calendar: recurring weekdays and one-off dates. Both…, The calendar of a project that never configured one., Rebuild a calendar from an untyped ``projects.non_working_days`` value. Lenient…, Une ligne historique illisible ne doit pas vider le calendrier : elle est…, test_an_unreadable_column_reads_as_the_default_calendar(), test_project_non_working_days_default_and_update(), ``NonWorkingDays`` is the project's working calendar. A row of… (+30 more)

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
Cohesion: 0.12
Nodes (27): protab, Integration tests for the ``protab-project`` administrative command. The…, The whole point: the code belongs to the project, not to a scope., ``MLOZ/MRAM`` is the scope list form; as an admin it could never be matched by…, The command must close the sessions it orphans. Whether a removed administrator…, The historical form stays valid, but it must not fail silently., Rotating a leaked password must not leave old sessions usable., run() (+19 more)

### Community 36 - "analytics.ts"
Cohesion: 0.06
Nodes (60): AnalyticsErrorHeatmap(), columnLabels(), ErrorCell(), ErrorMatrix(), heatmapClass(), ANALYTICS_PATH, AnalyticsFilterBar(), AnalyticsFilters (+52 more)

### Community 37 - "Development Workflow (9 Steps)"
Cohesion: 0.40
Nodes (6): Definition of Done Checklist, Development Workflow (9 Steps), Documentation Synchronization Requirement, Graphify Knowledge Graph Workflow, Test-Driven Development (RED/GREEN/REFACTOR), Testing Strategy (Test Pyramid)

### Community 38 - "ScopeMonitoring"
Cohesion: 0.14
Nodes (7): Exception, ScopeMonitoring, Persist the given ScopeMonitoring. Replaces the whole aggregate: the scope row…, Return the ScopeMonitoring with the given id, or None., Return the ScopeMonitoring with the given name, or None., Return all ScopeMonitorings., UniqueViolation

### Community 40 - "RecordingScopeMonitoringRepository"
Cohesion: 0.12
Nodes (15): complete_daily_activities(), CompleteDailyActivityCommand, CompleteDailyActivityUseCase, test_complete_activity_records_audit_event_per_day(), make_activity(), make_scope(), All days are resolved before anything is written. Completing day 1 then failing…, test_complete_day_without_activity_raises() (+7 more)

### Community 72 - "build_connection_pool"
Cohesion: 0.14
Nodes (10): ConnectionPool, psycopg, psycopg_pool, build_connection_pool(), ping_check(), Connection, Shared PostgreSQL connection-pool configuration for persistence adapters., Check connectivity and leave the connection outside a transaction. (+2 more)

### Community 73 - "CreateScopeMonitoringUseCase"
Cohesion: 0.35
Nodes (11): CreateScopeMonitoringCommand, CreateScopeMonitoringUseCase, test_create_scope_from_csv_records_import_action(), test_create_scope_records_audit_event_with_actor(), make_command(), test_create_blank_billing_code_raises_and_writes_nothing(), test_create_duplicate_name_raises_and_persists_nothing(), test_create_empty_official_raises() (+3 more)

### Community 74 - "postgres_auth_repository_test.py"
Cohesion: 0.13
Nodes (7): Integration tests for the PostgreSQL auth repository rule: the quadrigramme…, La colonne est du JSONB non typé : ce qui est écrit doit être relu à…, Naming an administrator is what makes creating the first scope safe. The…, A code the login screen refuses would lock the administrator out., test_add_admin_rejects_an_unusable_code(), test_admin_authenticates_before_the_first_scope_is_created(), test_non_working_days_survive_the_column_round_trip()

### Community 75 - "graphify.js"
Cohesion: 0.40
Nodes (3): IMPORTANT: keep the reminder string free of backticks and $(...) constructs., ref_fs, ref_path

### Community 76 - "_official_codes"
Cohesion: 0.29
Nodes (9): _official_codes(), Quadrigrammes declared by one ``officials`` column (format « A/B »).…, Parsing of the officials columns that gate the quadrigramme. Both…, ``MRAM/ ?`` means "MRAM, no backup": ``?`` is not a quadrigramme., test_handles_empty_and_none(), test_ignores_punctuation_only_parts(), test_placeholder_is_not_a_code(), test_splits_multiple_codes() (+1 more)

### Community 78 - "ScopeListPage.tsx"
Cohesion: 0.10
Nodes (33): lucide-react, recharts, AnalyticsScopePicker(), AnalyticsScopePickerProps, Badge(), BadgeProps, BillingCodeBadge(), BillingCodeBadgeProps (+25 more)

### Community 79 - "postgres_auth_bootstrap_test.py"
Cohesion: 0.21
Nodes (13): Return the quadrigramme seeding the first project's administrator. Same fail-…, Return the password seeding the first project, or refuse to start. Called only…, resolve_bootstrap_admin_code(), resolve_bootstrap_password(), The bootstrap secrets must never fall back to a hardcoded default. A missing…, test_admin_code_trims_surrounding_whitespace(), test_blank_admin_code_raises(), test_blank_variable_raises() (+5 more)

### Community 80 - "set_current_project"
Cohesion: 0.16
Nodes (15): reset_current_project(), set_current_project(), project(), project_context(), fixture, Every read and write is tenant-scoped: name the project under test. The…, A write must not reach across tenants, even on a known scope id., No project context must raise, never fall back to a default tenant. (+7 more)

### Community 81 - "add_scope"
Cohesion: 0.14
Nodes (14): add_scope(), ``?`` marks the absence of a backup official, it is not a code., The rule the whole feature exists for. Without an administrator, creating the…, ``authenticate()`` only runs at login, so a removed administrator would keep a…, test_a_code_in_no_scope_and_no_admin_list_is_refused(), test_admin_authenticates_although_it_belongs_to_no_scope(), test_admin_code_is_normalized_like_a_scope_code(), test_backup_placeholder_is_not_a_login_code() (+6 more)

### Community 82 - "Tally plutôt qu'un tableur de production"
Cohesion: 0.29
Nodes (6): Ce qu'un tableur continue de mieux faire, Ce que le Cloud a réglé… et ce que le tableur ne réglera jamais, Ce que Tally apporte, En résumé, Quand conserver le tableur ?, Tally plutôt qu'un tableur de production

### Community 83 - "ScopeMonitoringRepository"
Cohesion: 0.09
Nodes (20): GetDailyActivityUseCase, GetScopeUseCase, ListScopesUseCase, AuditTrailRepository, Protocol, Persist an audit event., date, Protocol (+12 more)

### Community 84 - "Développement"
Cohesion: 0.13
Nodes (14): 11. Où aller quand…, 10. Publier une modification — liste de contrôle, 11. Problèmes fréquents, 12. Documents voisins, 1. Prérequis, 2. Installation, 3. Configuration, 5. Base de données : pas d'outil de migration (+6 more)

### Community 85 - "app.py"
Cohesion: 0.07
Nodes (35): contextvars, dataclasses, datetime, protab_adapters_inbound_api_auth, protab_adapters_inbound_api_errors, protab_adapters_inbound_api_schemas, protab_adapters_outbound_persistence_postgres_pool, protab_adapters_outbound_persistence_postgres_scope_monitoring_repository (+27 more)

### Community 86 - "fixture"
Cohesion: 0.50
Nodes (4): bootstrap_password(), fixture, The bootstrap secrets are mandatory: no default is provided.…, scopes()

### Community 87 - "project_admin_cli_test.py"
Cohesion: 0.22
Nodes (13): parametrize, ``protab-project --help`` must list the subcommands. The dispatcher resolves…, ``protab-project <code> <nom>`` predates the subcommands and stays valid., A bare invocation is still an error. Turning it into a success would make a…, The inventory must not swallow the per-subcommand argparse help., run_cli(), test_a_subcommand_without_its_arguments_still_errors(), test_help_exits_successfully() (+5 more)

### Community 88 - "L'architecture Docker de ProTab"
Cohesion: 0.12
Nodes (17): 1. Vue d'ensemble à l'exécution, 2. Ordre de démarrage : ce que les dépendances garantissent, 3. Chaîne de construction des images, 4. Le premier démarrage : une fenêtre, pas une configuration, 5. Requêtes : le rôle de nginx est plus qu'un serveur de fichiers, 6. Sécurité : ce que la topologie garantit, et ce qu'elle ne garantit pas, 7. Commandes de la stack, Ce que le diagramme dit des ports publiés (+9 more)

### Community 89 - "ScopeMonitoringNotFoundError"
Cohesion: 0.20
Nodes (5): date, DuplicateDailyActivityError, Raised when a ScopeMonitoring already has a DailyActivity for the given day., Raised when a ScopeMonitoring cannot be found for the given id., ScopeMonitoringNotFoundError

### Community 90 - "create_default_app"
Cohesion: 0.29
Nodes (6): 4. Démarrage en développement, create_default_app(), FastAPI, Create the production app using the configured PostgreSQL repository., main(), Run the ProTab HTTP API server.

### Community 91 - "AppSessionLoss.test.tsx"
Cohesion: 0.40
Nodes (5): App(), json(), PROJECT, SESSION, stubFetch()

### Community 92 - "repository"
Cohesion: 0.50
Nodes (4): 2. Vue d'ensemble des couches, bootstrap_password(), fixture, repository()

### Community 93 - "kpi.ts"
Cohesion: 0.07
Nodes (46): 10. Tests, 11. Ce qui n'existe pas, 12. Build et déploiement, 13. Documents voisins, 1. Pile technique, 2. Arborescence, 6. Le modèle mono-jour, 8. La page d'analyse — `/analyse` (+38 more)

### Community 94 - "build_repository"
Cohesion: 0.50
Nodes (4): build_repository(), Select the persistence adapter from configuration. PostgreSQL is required for…, database_url_from_env(), Return the PostgreSQL DSN from DATABASE_URL, or None when unset.

### Community 95 - "add_scope_for"
Cohesion: 0.50
Nodes (4): add_scope_for(), Give one project a scope, switching the tenant the adapter reads. Both tenants…, An administrator of A is nobody in B. ``GET /projects`` is unauthenticated, so…, test_admin_is_scoped_to_its_own_project()

### Community 96 - "Tests"
Cohesion: 0.22
Nodes (9): 1. Vue d'ensemble, 3. Tests d'intégration — `tests/integration/adapters/`, 4. Test E2E — `tests/e2e/`, 5. Ce que ces tests ne prouvent pas, 7. Écrire un nouveau test, 8. Documents voisins, Contre l'API, sans base, Contre PostgreSQL réel (+1 more)

### Community 98 - "postgres_audit_trail_repository_test.py"
Cohesion: 0.22
Nodes (12): os, protab_adapters_outbound_persistence_postgres_audit_trail_repository, make_event(), project(), fixture, Integration tests for the PostgreSQL audit trail adapter. Skipped when…, repo(), test_list_filters_by_scope_actor_action_and_dates() (+4 more)

### Community 100 - "ActivityFormModal.tsx"
Cohesion: 0.12
Nodes (29): 7. Saisie et autosave, La note du périmètre — un brouillon, pas un autosave, Saisie d'une référence FEAI, 6. Tests frontend, Pièges propres à cette suite, ActivityFormModal(), ActivityFormModalProps, CompleteActivitiesModalProps (+21 more)

### Community 102 - "InMemoryScopeMonitoringRepository"
Cohesion: 0.18
Nodes (17): handle_update_scope_note(), InMemoryAuditTrailRepository, InMemoryScopeMonitoringRepository, UpdateScopeNoteCommand, Overwrite the free-text note of an existing scope. The note is written through…, UpdateScopeNoteUseCase, env(), make_scope() (+9 more)

### Community 103 - "build_changes"
Cohesion: 0.10
Nodes (24): 5. La couche application, 2. Tests unitaires — `tests/unit/`, Adaptateurs — `tests/unit/adapters/`, Application — `tests/unit/application/`, Domaine — `tests/unit/domain/`, project_context(), current_actor(), Per-request audit context. Mirrors the ``_CURRENT_PROJECT_ID`` ContextVar… (+16 more)

### Community 111 - "Architecture"
Cohesion: 0.29
Nodes (5): 12. Documents voisins, 1. Ce que fait l'application, 3. Le domaine, 9. Modèle de données, Architecture

### Community 113 - "non_working_days.py"
Cohesion: 0.29
Nodes (6): enum, IntEnum, _is_iso_weekday(), IsoWeekday, The ISO 8601 weekday scale, which is what ``excluded_weekdays`` stores.…, Whether a raw entry names a weekday of the ISO scale. ``str.isdigit`` is not…

### Community 115 - "PostgresAuthRepository"
Cohesion: 0.11
Nodes (11): 4. Les ports, 7. Les adaptateurs sortants, Absence de port pour l'authentification, Port d'audit — `ports/outbound/audit_trail_repository.py`, Port de périmètre — `ports/outbound/scope_monitoring_repository.py`, _hash_password(), PostgresAuthRepository, Project (+3 more)

## Ambiguous Edges - Review These
- `React Root Mount (#root)` → `Audit Trail (best-effort mutation journal)`  [AMBIGUOUS]
  src/FrontEnd/index.html · relation: conceptually_related_to

## Knowledge Gaps
- **196 isolated node(s):** `$schema`, `plugin`, `protab`, `name`, `private` (+191 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 523 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **40 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `React Root Mount (#root)` and `Audit Trail (best-effort mutation journal)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `6. Le modèle mono-jour` connect `kpi.ts` to `NonWorkingDays`?**
  _High betweenness centrality (0.185) - this node is a cross-community bridge._
- **Why does `Tests` connect `Tests` to `ActivityFormModal.tsx`, `architecture.md`, `build_changes`?**
  _High betweenness centrality (0.113) - this node is a cross-community bridge._
- **Why does `create_app()` connect `create_app` to `parse_scope_monitorings_csv`, `InMemoryScopeMonitoringRepository`, `build_changes`, `RecordingScopeMonitoringRepository`, `CreateScopeMonitoringUseCase`, `api_test.py`, `current_user`, `pytest`, `route_authorization_test.py`, `PostgresAuthRepository`, `ScopeMonitoringRepository`, `app.py`, `AuditEvent`, `FakeAuthRepository`, `create_daily_activity_test.py`, `create_default_app`, `update_daily_activity_test.py`, `build_repository`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **Are the 59 inferred relationships involving `DailyActivity` (e.g. with `_activity_to_response()` and `InMemoryScopeMonitoringRepository`) actually correct?**
  _`DailyActivity` has 59 INFERRED edges - model-reasoned connections that need verification._
- **Are the 55 inferred relationships involving `create_app()` (e.g. with `API — `adapters/inbound/api/`` and `close_persistence()`) actually correct?**
  _`create_app()` has 55 INFERRED edges - model-reasoned connections that need verification._
- **Are the 61 inferred relationships involving `InMemoryScopeMonitoringRepository` (e.g. with `2. Vue d'ensemble des couches` and `5. Ce que ces tests ne prouvent pas`) actually correct?**
  _`InMemoryScopeMonitoringRepository` has 61 INFERRED edges - model-reasoned connections that need verification._