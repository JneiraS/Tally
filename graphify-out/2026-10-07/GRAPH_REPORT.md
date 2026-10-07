# Graph Report - ProTab  (2026-10-02)

## Corpus Check
- 196 files · ~102,349 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 8, .example 1, .conf 1)

## Summary
- 1623 nodes · 3832 edges · 117 communities (75 shown, 42 thin omitted)
- Extraction: 80% EXTRACTED · 20% INFERRED · 0% AMBIGUOUS · INFERRED: 757 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e0cfc176`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- index.ts
- PostgresScopeMonitoringRepository
- package.json
- ScopeListPage.tsx
- parse_scope_monitorings_csv
- OfficialCode
- DomainError
- DailyActivity
- 6. Tests frontend
- Officials
- api_test.py
- create_app
- empty_database
- current_user
- useToast.tsx
- audit_log_api_test.py
- route_authorization_test.py
- ._activity_for
- App.tsx
- postgres_scope_monitoring_repository_test.py
- project_admin.py
- compilerOptions
- audit_trail_test.py
- FakeAuthRepository
- create_daily_activity_test.py
- Rule Categories by Priority (1-10)
- La CLI `protab-project`
- Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring)
- postgres_auth_repository.py
- AuditEvent
- FastAPI & PostgreSQL Performance Optimizer Skill
- NonWorkingDays
- Hexagonal Architecture (Ports and Adapters)
- PostgresScopeMonitoringRepository
- api Service (FastAPI backend)
- project_admin_test.py
- analytics.ts
- Development Workflow (9 Steps)
- 7. Les adaptateurs sortants
- opencode.json
- ScopeMonitoring
- Application Layer / Use Cases
- protab
- build_connection_pool
- CreateScopeMonitoringUseCase
- postgres_auth_repository_test.py
- graphify.js
- _official_codes
- architecture.md
- ScopeDetailPage.tsx
- postgres_auth_bootstrap_test.py
- set_current_project
- add_scope
- Tally plutôt qu'un tableur de production
- ScopeMonitoringRepository
- Architecture
- app.py
- project
- datetime
- L'architecture Docker de ProTab
- InMemoryScopeMonitoringRepository
- create_default_app
- Navbar.tsx
- ExportModal.tsx
- kpi.ts
- AnalyticsFilterBar.tsx
- add_scope_for
- complete_daily_activity_test.py
- test_main_split_form_auths_both_codes
- postgres_audit_trail_repository_test.py
- set_current_actor
- ActivityFormModal.tsx
- AnalyticsCharts.tsx
- update_scope_note_test.py
- build_changes
- pytest
- test_admins_disappear_with_their_project
- search.test.ts
- date.ts
- Frontend
- seed_three_days
- .validate_weekdays
- 3. Le domaine
- test_backup_placeholder_is_not_a_login_code
- test_non_working_days_survive_the_column_round_trip
- test_admin_authenticates_although_it_belongs_to_no_scope
- PostgresAuthRepository

## God Nodes (most connected - your core abstractions)
1. `DailyActivity` - 80 edges
2. `InMemoryScopeMonitoringRepository` - 79 edges
3. `create_app()` - 76 edges
4. `ScopeMonitoring` - 56 edges
5. `PostgresAuthRepository` - 34 edges
6. `ScopeMonitoringRepository` - 34 edges
7. `react` - 31 edges
8. `Officials` - 30 edges
9. `vitest` - 29 edges
10. `ScopeMonitoring` - 29 edges

## Surprising Connections (you probably didn't know these)
- `La note du périmètre — un brouillon, pas un autosave` --references--> `ScopeNoteCard()`  [INFERRED]
  docs/frontend.md → src/FrontEnd/src/components/ScopeNoteCard.tsx
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

## Communities (117 total, 42 thin omitted)

### Community 0 - "index.ts"
Cohesion: 0.10
Nodes (30): AuditActivityHeatmap(), AuditActivityHeatmapProps, HOURS, intensityClass(), WEEKDAYS, ACTION_ICONS, ACTION_LABELS, AuditLogPage() (+22 more)

### Community 1 - "PostgresScopeMonitoringRepository"
Cohesion: 0.16
Nodes (12): 8. Multi-tenant : le mécanisme à comprendre avant toute modification, RuntimeError, MissingProjectContextError, PostgresScopeMonitoringRepository, Connection, date, Return the current project id, or refuse to touch the database. Every read and…, Persist ``ScopeMonitoring`` aggregates in PostgreSQL. The schema is applied… (+4 more)

### Community 2 - "package.json"
Cohesion: 0.05
Nodes (39): jsdom, recharts, tailwindcss, @tailwindcss/vite, @types/node, @types/react, @types/react-dom, typescript (+31 more)

### Community 3 - "ScopeListPage.tsx"
Cohesion: 0.22
Nodes (13): AnalyticsFilterBarProps, CompleteTodayButton(), CompleteTodayButtonProps, DashboardCharts(), DashboardChartsProps, ExportModalProps, DashboardCharts, EnrichedScope (+5 more)

### Community 4 - "parse_scope_monitorings_csv"
Cohesion: 0.16
Nodes (26): CSV — `adapters/inbound/csv/scope_monitoring_csv_reader.py`, fastapi_responses, JSONResponse, Path, pathlib, protab_adapters_inbound_csv_scope_monitoring_csv_reader, bad_request(), conflict() (+18 more)

### Community 5 - "OfficialCode"
Cohesion: 0.12
Nodes (23): OfficialCode, A single official identity, normalized the way login normalizes it.…, ``OfficialCode`` is the single-code form of an official identity. A project…, Only the ends are noise; a space inside is part of the identity., ``LoginRequest.quadrigramme`` allows two characters, so we must too., ``A/B`` is the Officials form; as an admin code it could never be typed back as…, ``?`` means "no backup official" in the scope columns; it is not a code., ``LoginRequest.quadrigramme`` caps at 20; a longer admin could never be typed… (+15 more)

### Community 6 - "DomainError"
Cohesion: 0.09
Nodes (34): date, canonical_feai(), Ramène une référence à sa forme canonique ``FE-INC000000001``. La saisie est…, DuplicateFeaiReferenceError, IncidentsExceedErrorsError, InvalidFeaiReferenceError, NegativeErrorsCountError, NegativeIncidentsCountError (+26 more)

### Community 7 - "DailyActivity"
Cohesion: 0.12
Nodes (24): DailyActivity, Add one activity to an existing scope. Raises: DuplicateDailyActivityError: the…, Overwrite the counters of a single day, leaving the others alone. The…, parametrize, test_daily_activity_canonicalises_a_prefixed_feai(), test_daily_activity_creation_valid(), test_daily_activity_duplicate_feai_rejected(), test_daily_activity_errors_reported_negative() (+16 more)

### Community 8 - "6. Tests frontend"
Cohesion: 0.11
Nodes (20): 6. Tests frontend, 7. Écrire un nouveau test, Pièges propres à cette suite, ScopeDetailCharts(), ScopeDetailChartsProps, TodayActivityEditor(), ScopeDetailCharts, scope() (+12 more)

### Community 9 - "Officials"
Cohesion: 0.10
Nodes (28): KnowledgeBase, Officials, build_scope(), fixture_scope_monitoring(), fixture, parametrize, Adding a DailyActivity for a new day should succeed., Adding a second DailyActivity for the same day should raise… (+20 more)

### Community 10 - "api_test.py"
Cohesion: 0.07
Nodes (24): client(), create_scope_via_api(), make_scope_with_activity(), fixture, 422, not 400: the bound is refused by the request schema itself. The domain's…, test_complete_daily_activities_returns_204(), test_complete_day_without_activity_returns_404(), test_create_daily_activity_canonicalises_a_prefixed_feai() (+16 more)

### Community 11 - "create_app"
Cohesion: 0.15
Nodes (26): BaseModel, pydantic, _activity_to_response(), _audit_event_to_response(), create_app(), create_scope_monitorings(), get_scope_daily_activity(), get_scope_monitoring() (+18 more)

### Community 12 - "empty_database"
Cohesion: 0.15
Nodes (13): empty_database(), A project must never be created without someone able to enter it. Once it owns…, Both secrets are missing: the message must name the one resolved first.…, The secrets are only needed to seed; a restart must not require them. Requiring…, The seeded administrator must be usable as a login right away., Create the schema, then drop every project so a bootstrap is pending., Seeding the first project demands an explicit, non-guessable password. No…, test_bootstrap_grants_the_configured_admin_code() (+5 more)

### Community 13 - "current_user"
Cohesion: 0.18
Nodes (15): fastapi, protab_adapters_outbound_persistence_postgres_auth_repository, Response, get_project_settings(), list_projects(), login(), me(), update_project_settings() (+7 more)

### Community 14 - "useToast.tsx"
Cohesion: 0.08
Nodes (24): @testing-library/jest-dom, @testing-library/react, vitest, ScopeNoteCard(), ScopeNoteCardProps, ToastContainer(), ToastAction, ToastActionsContext (+16 more)

### Community 15 - "audit_log_api_test.py"
Cohesion: 0.29
Nodes (8): protab_adapters_outbound_persistence_in_memory_audit_trail_repository, all_events(), env(), make_scope_with_activity(), fixture, test_activity_flow_records_audit_via_api(), test_create_scope_records_audit_via_api(), test_get_audit_log_endpoint_filters_and_orders()

### Community 16 - "route_authorization_test.py"
Cohesion: 0.20
Nodes (11): APIRoute, fastapi_routing, fastapi_testclient, protab_adapters_inbound_api_app, business_routes(), Business routes must be authenticated by default (allowlist, not denylist).…, Guards against a silent rename making this test vacuously pass., A public route answers an anonymous caller; a business route does not. Uses a… (+3 more)

### Community 18 - "App.tsx"
Cohesion: 0.12
Nodes (19): 4. Chemins et routage, react-dom, react-router-dom, App(), AppContent(), ITEMS, PageNav(), PageShortcuts() (+11 more)

### Community 19 - "postgres_scope_monitoring_repository_test.py"
Cohesion: 0.09
Nodes (26): make_scope(), date, Integration tests for the PostgreSQL repository adapter. These tests exercise…, ``save`` creates a row; it never rewrites one. A second ``save`` used to…, The write must name the rows it changes, like the activity writes. A full…, The refusal happens before any write, not after a partial merge. ``save`` used…, test_a_refused_save_leaves_a_concurrent_note_intact(), test_api_flow_persists_in_postgres() (+18 more)

### Community 20 - "project_admin.py"
Cohesion: 0.07
Nodes (41): argparse, 3. Configuration, dotenv, getpass, os, protab_adapters_inbound_api_config, protab_domain_value_objects_official_code, build_repository() (+33 more)

### Community 21 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 22 - "audit_trail_test.py"
Cohesion: 0.15
Nodes (16): protab_application_queries_list_audit_events, protab_application_use_cases_complete_daily_activity, protab_application_use_cases_create_daily_activity, protab_application_use_cases_create_scope_monitoring, protab_application_use_cases_update_daily_activity, InMemoryAuditTrailRepository, current_project_id(), ListAuditEventsUseCase (+8 more)

### Community 23 - "FakeAuthRepository"
Cohesion: 0.13
Nodes (15): AuthSession, FakeAuthRepository, login_and_read_session_cookie(), Le refus porte sur la semaine entière, pas sur le week-end : un projet qui…, Le cookie et la ligne ``auth_sessions`` doivent tomber ensemble : un cookie…, test_authenticated_routes_require_a_valid_session(), test_in_memory_application_remains_unauthenticated_for_existing_fixtures(), test_login_rejects_invented_quadrigramme_when_known_codes_exist() (+7 more)

### Community 24 - "create_daily_activity_test.py"
Cohesion: 0.35
Nodes (11): handle_create_daily_activity(), CreateDailyActivityCommand, CreateDailyActivityUseCase, make_command(), make_scope(), make_scope_daily_activity(), test_create_daily_activity(), test_create_duplicate_day_raises_and_persists_nothing() (+3 more)

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

### Community 29 - "AuditEvent"
Cohesion: 0.15
Nodes (16): 10. Cycle de vie d'une écriture, handle_update_daily_activity(), PostgresAuditTrailRepository, Open the connection pool and apply the (idempotent) schema., Close the connection pool, releasing database connections., current_actor(), UpdateDailyActivityCommand, UpdateDailyActivityUseCase (+8 more)

### Community 30 - "FastAPI & PostgreSQL Performance Optimizer Skill"
Cohesion: 0.22
Nodes (10): Caching Layer & Background Task Offloading, Connection Pooling Parameters, Database Indexing Strategy, Diagnostic & Audit Checklist, Event Loop Stall Detection, FastAPI & PostgreSQL Performance Optimizer Skill, N+1 Query Pattern Detection, Payload & Serialization Optimization (+2 more)

### Community 31 - "NonWorkingDays"
Cohesion: 0.07
Nodes (47): enum, IntEnum, Project, _is_iso_weekday(), IsoWeekday, NonWorkingDays, A project's working calendar: recurring weekdays and one-off dates. Both…, The calendar of a project that never configured one. (+39 more)

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
Cohesion: 0.15
Nodes (25): AnalyticsPage(), formatPeriod(), GRANULARITIES, initialFilters(), CONFIG, aggregateByDay(), aggregateByWeek(), buildPeriodDays() (+17 more)

### Community 37 - "Development Workflow (9 Steps)"
Cohesion: 0.40
Nodes (6): Definition of Done Checklist, Development Workflow (9 Steps), Documentation Synchronization Requirement, Graphify Knowledge Graph Workflow, Test-Driven Development (RED/GREEN/REFACTOR), Testing Strategy (Test Pyramid)

### Community 38 - "7. Les adaptateurs sortants"
Cohesion: 0.15
Nodes (8): 7. Les adaptateurs sortants, Exception, DuplicateDailyActivityError, Raised when a ScopeMonitoring already has a DailyActivity for the given day., Raised when a ScopeMonitoring with the same name already exists., ScopeMonitoringNameAlreadyExistsError, The column's stored shape, kept as plain lists for the JSON contract., UniqueViolation

### Community 40 - "ScopeMonitoring"
Cohesion: 0.08
Nodes (8): date, ScopeMonitoring, Create the given ScopeMonitoring and its activities. Creation only: an already…, Return the ScopeMonitoring with the given id, or None., Return the ScopeMonitoring with the given name, or None., Return all ScopeMonitorings., date, RecordingScopeMonitoringRepository

### Community 72 - "build_connection_pool"
Cohesion: 0.13
Nodes (11): ConnectionPool, protab_adapters_outbound_persistence_postgres_pool, psycopg, psycopg_pool, build_connection_pool(), ping_check(), Connection, Shared PostgreSQL connection-pool configuration for persistence adapters. (+3 more)

### Community 73 - "CreateScopeMonitoringUseCase"
Cohesion: 0.39
Nodes (11): CreateScopeMonitoringCommand, CreateScopeMonitoringUseCase, test_create_scope_from_csv_records_import_action(), make_command(), test_create_blank_billing_code_raises_and_writes_nothing(), test_create_duplicate_name_raises_and_persists_nothing(), test_create_empty_official_raises(), test_create_invalid_knowledge_base_id_raises() (+3 more)

### Community 74 - "postgres_auth_repository_test.py"
Cohesion: 0.13
Nodes (7): Integration tests for the PostgreSQL auth repository rule: the quadrigramme…, Reusing a project code is the likeliest CLI mistake, and it must not reach the…, Naming an administrator is what makes creating the first scope safe. The…, A code the login screen refuses would lock the administrator out., test_add_admin_rejects_an_unusable_code(), test_admin_authenticates_before_the_first_scope_is_created(), test_creating_a_project_twice_reports_the_duplicate()

### Community 75 - "graphify.js"
Cohesion: 0.40
Nodes (3): IMPORTANT: keep the reminder string free of backticks and $(...) constructs., ref_fs, ref_path

### Community 76 - "_official_codes"
Cohesion: 0.29
Nodes (9): _official_codes(), Quadrigrammes declared by one ``officials`` column (format « A/B »).…, Parsing of the officials columns that gate the quadrigramme. Both…, ``MRAM/ ?`` means "MRAM, no backup": ``?`` is not a quadrigramme., test_handles_empty_and_none(), test_ignores_punctuation_only_parts(), test_placeholder_is_not_a_code(), test_splits_multiple_codes() (+1 more)

### Community 78 - "ScopeDetailPage.tsx"
Cohesion: 0.10
Nodes (28): lucide-react, react, AnalyticsScopePickerProps, Badge(), BadgeProps, BillingCodeBadge(), BillingCodeBadgeProps, CompleteActivitiesModal() (+20 more)

### Community 79 - "postgres_auth_bootstrap_test.py"
Cohesion: 0.21
Nodes (13): Return the quadrigramme seeding the first project's administrator. Same fail-…, Return the password seeding the first project, or refuse to start. Called only…, resolve_bootstrap_admin_code(), resolve_bootstrap_password(), The bootstrap secrets must never fall back to a hardcoded default. A missing…, test_admin_code_trims_surrounding_whitespace(), test_blank_admin_code_raises(), test_blank_variable_raises() (+5 more)

### Community 80 - "set_current_project"
Cohesion: 0.16
Nodes (15): Token, reset_current_project(), set_current_project(), project_context(), fixture, Every read and write is tenant-scoped: name the project under test. The…, A write must not reach across tenants, even on a known scope id., No project context must raise, never fall back to a default tenant. (+7 more)

### Community 81 - "add_scope"
Cohesion: 0.14
Nodes (14): add_scope(), Permanent access is not a password bypass: the admin is one factor., Being an administrator never removes the scope officials' access., ``authenticate()`` only runs at login, so a removed administrator would keep a…, test_a_code_in_no_scope_and_no_admin_list_is_refused(), test_admin_alongside_scope_officials(), test_admin_code_is_normalized_like_a_scope_code(), test_admin_still_needs_the_project_password() (+6 more)

### Community 82 - "Tally plutôt qu'un tableur de production"
Cohesion: 0.29
Nodes (6): Ce qu'un tableur continue de mieux faire, Ce que le Cloud a réglé… et ce que le tableur ne réglera jamais, Ce que Tally apporte, En résumé, Quand conserver le tableur ?, Tally plutôt qu'un tableur de production

### Community 83 - "ScopeMonitoringRepository"
Cohesion: 0.08
Nodes (12): GetScopeUseCase, ListScopesUseCase, AuditTrailRepository, Protocol, Persist an audit event., Return audit events matching the query, most recent first., date, Protocol (+4 more)

### Community 84 - "Architecture"
Cohesion: 0.11
Nodes (17): 11. Où aller quand…, 12. Documents voisins, 1. Ce que fait l'application, 9. Modèle de données, Architecture, 10. Publier une modification — liste de contrôle, 11. Problèmes fréquents, 12. Documents voisins (+9 more)

### Community 85 - "app.py"
Cohesion: 0.13
Nodes (20): collections_abc, csv, protab_adapters_inbound_api_auth, protab_adapters_inbound_api_errors, protab_adapters_inbound_api_schemas, protab_adapters_outbound_persistence_postgres_scope_monitoring_repository, protab_application_actor_context, protab_application_commands_create_scope_monitoring (+12 more)

### Community 86 - "project"
Cohesion: 0.40
Nodes (5): bootstrap_password(), project(), fixture, The bootstrap secrets are mandatory: no default is provided.…, scopes()

### Community 87 - "datetime"
Cohesion: 0.14
Nodes (11): dataclasses, datetime, protab_domain_entities_daily_activity, protab_domain_entities_scope_monitoring, protab_domain_exceptions, re, PostgreSQL outbound adapter for the ScopeMonitoringRepository port. The…, Domain model for the audit trail. An :class:`AuditEvent` records *who* (actor)… (+3 more)

### Community 88 - "L'architecture Docker de ProTab"
Cohesion: 0.12
Nodes (17): 1. Vue d'ensemble à l'exécution, 2. Ordre de démarrage : ce que les dépendances garantissent, 3. Chaîne de construction des images, 4. Le premier démarrage : une fenêtre, pas une configuration, 5. Requêtes : le rôle de nginx est plus qu'un serveur de fichiers, 6. Sécurité : ce que la topologie garantit, et ce qu'elle ne garantit pas, 7. Commandes de la stack, Ce que le diagramme dit des ports publiés (+9 more)

### Community 89 - "InMemoryScopeMonitoringRepository"
Cohesion: 0.17
Nodes (18): protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository, InMemoryScopeMonitoringRepository, GetDailyActivityUseCase, test_daily_activity_full_flow_over_http(), make_scope(), ``save`` must refuse what the SQL adapter refuses. Both adapters implement…, test_a_refused_save_leaves_the_stored_scope_untouched(), test_save_refuses_a_name_already_stored() (+10 more)

### Community 90 - "create_default_app"
Cohesion: 0.25
Nodes (8): 6. Les adaptateurs entrants, API — `adapters/inbound/api/`, CLI — `src/protab/project_admin.py`, 4. Démarrage en développement, logout(), create_default_app(), FastAPI, Create the production app using the configured PostgreSQL repository.

### Community 91 - "Navbar.tsx"
Cohesion: 0.16
Nodes (15): 3. Client HTTP — `services/api.ts`, 5. Providers et état, src_frontend_src_assets_layered_waves_dark, src_frontend_src_assets_layered_waves_light, LoginBackground(), Navbar(), NavbarProps, Theme (+7 more)

### Community 92 - "ExportModal.tsx"
Cohesion: 0.21
Nodes (15): ExportModal(), ScopeBase, defaultFrom, renderModal(), scope(), today, buildExportRows(), CsvSeparator (+7 more)

### Community 93 - "kpi.ts"
Cohesion: 0.14
Nodes (27): 6. Le modèle mono-jour, 8. La page d'analyse — `/analyse`, Chaque bloc mesure une chose différente, Le reste de la page, DEFAULT_EXCLUDED_WEEKDAYS, DEFAULT_NON_WORKING_DAYS, ISO_MONDAY, ISO_SATURDAY (+19 more)

### Community 94 - "AnalyticsFilterBar.tsx"
Cohesion: 0.18
Nodes (15): ANALYTICS_PATH, AnalyticsFilterBar(), AnalyticsFilters, applyPreset(), billingCodeKey(), formatRange(), SCOPE_DETAIL_PATH, SCOPE_LIST_PATH (+7 more)

### Community 95 - "add_scope_for"
Cohesion: 0.50
Nodes (4): add_scope_for(), Give one project a scope, switching the tenant the adapter reads. Both tenants…, An administrator of A is nobody in B. ``GET /projects`` is unauthenticated, so…, test_admin_is_scoped_to_its_own_project()

### Community 96 - "complete_daily_activity_test.py"
Cohesion: 0.38
Nodes (12): complete_daily_activities(), CompleteDailyActivityCommand, CompleteDailyActivityUseCase, make_activity(), make_scope(), All days are resolved before anything is written. Completing day 1 then failing…, test_complete_day_without_activity_raises(), test_complete_does_not_touch_earlier_days_when_a_later_day_is_missing() (+4 more)

### Community 98 - "postgres_audit_trail_repository_test.py"
Cohesion: 0.24
Nodes (11): protab_adapters_outbound_persistence_postgres_audit_trail_repository, make_event(), project(), fixture, Integration tests for the PostgreSQL audit trail adapter. Skipped when…, repo(), test_list_filters_by_scope_actor_action_and_dates(), test_list_isolated_by_project() (+3 more)

### Community 99 - "set_current_actor"
Cohesion: 0.24
Nodes (11): contextvars, project_context(), Token, Per-request audit context. Mirrors the ``_CURRENT_PROJECT_ID`` ContextVar…, reset_current_actor(), set_current_actor(), clear_actor(), clean_actor() (+3 more)

### Community 100 - "ActivityFormModal.tsx"
Cohesion: 0.13
Nodes (27): 7. Saisie et autosave, La note du périmètre — un brouillon, pas un autosave, Saisie d'une référence FEAI, Suppression et annulation, ActivityFormModal(), ActivityFormModalProps, CompleteActivitiesModalProps, FeaiTagInput() (+19 more)

### Community 101 - "AnalyticsCharts.tsx"
Cohesion: 0.24
Nodes (9): AnalyticsErrorHeatmap(), columnLabels(), ErrorCell(), ErrorMatrix(), heatmapClass(), buildErrorHeatmap(), ErrorHeatmapCell, ErrorHeatmapRow (+1 more)

### Community 102 - "update_scope_note_test.py"
Cohesion: 0.34
Nodes (14): handle_update_scope_note(), UpdateScopeNoteCommand, Overwrite the free-text note of an existing scope. The note is written through…, UpdateScopeNoteUseCase, make_scope(), A note edit must not rewrite the whole scope. Rewriting the aggregate persists…, test_update_note_clears_the_note_when_emptied(), test_update_note_leaves_the_daily_activities_intact() (+6 more)

### Community 103 - "build_changes"
Cohesion: 0.10
Nodes (22): 5. La couche application, 1. Vue d'ensemble, 2. Tests unitaires — `tests/unit/`, 3. Tests d'intégration — `tests/integration/adapters/`, 4. Test E2E — `tests/e2e/`, 5. Ce que ces tests ne prouvent pas, 8. Documents voisins, Adaptateurs — `tests/unit/adapters/` (+14 more)

### Community 104 - "pytest"
Cohesion: 0.25
Nodes (9): inspect, pytest, Tenant isolation must fail closed when no project context is established. A…, port_methods(), parametrize, Every implementation must offer every method the port declares. Nothing in this…, test_implementation_offers_every_port_method(), test_port_methods_keep_their_signature() (+1 more)

### Community 106 - "search.test.ts"
Cohesion: 0.33
Nodes (8): Recherche : le responsable passe avant le suppléant, scope(), matchesSearchQuery(), OFFICIAL_MATCH_RANK, officialMatchRank(), SearchableScope, SEARCHED_FIELDS, sortByOfficialRelevance()

### Community 107 - "date.ts"
Cohesion: 0.42
Nodes (7): DateNavigator(), DateNavigatorProps, formatDayMonthFr(), formatWeekdayFr(), shiftDay(), formatFullDateFr(), isValidIsoDate()

### Community 108 - "Frontend"
Cohesion: 0.25
Nodes (8): 10. Tests, 11. Ce qui n'existe pas, 12. Build et déploiement, 13. Documents voisins, 1. Pile technique, 2. Arborescence, 9. Graphiques et styles, Frontend

### Community 109 - "seed_three_days"
Cohesion: 0.50
Nodes (4): seed_three_days(), test_insert_daily_activity_leaves_other_days_untouched(), test_mark_activities_completed_flips_only_the_named_days(), test_update_daily_activity_leaves_other_days_untouched()

### Community 115 - "PostgresAuthRepository"
Cohesion: 0.14
Nodes (9): 4. Les ports, Absence de port pour l'authentification, Port d'audit — `ports/outbound/audit_trail_repository.py`, Port de périmètre — `ports/outbound/scope_monitoring_repository.py`, _hash_password(), PostgresAuthRepository, Store project credentials and opaque, expiring session tokens., Grant permanent access to one project. Returns False if already set. The code… (+1 more)

## Ambiguous Edges - Review These
- `React Root Mount (#root)` → `Audit Trail (best-effort mutation journal)`  [AMBIGUOUS]
  src/FrontEnd/index.html · relation: conceptually_related_to

## Knowledge Gaps
- **196 isolated node(s):** `$schema`, `plugin`, `protab`, `name`, `private` (+191 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 525 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **42 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `React Root Mount (#root)` and `Audit Trail (best-effort mutation journal)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `RecordingScopeMonitoringRepository` connect `ScopeMonitoring` to `complete_daily_activity_test.py`, `update_scope_note_test.py`, `DailyActivity`, `6. Tests frontend`, `CreateScopeMonitoringUseCase`, `pytest`, `datetime`, `create_daily_activity_test.py`, `AuditEvent`?**
  _High betweenness centrality (0.142) - this node is a cross-community bridge._
- **Why does `7. Écrire un nouveau test` connect `6. Tests frontend` to `ScopeMonitoring`, `build_changes`?**
  _High betweenness centrality (0.139) - this node is a cross-community bridge._
- **Why does `6. Le modèle mono-jour` connect `kpi.ts` to `search.test.ts`, `Frontend`, `NonWorkingDays`?**
  _High betweenness centrality (0.131) - this node is a cross-community bridge._
- **Are the 59 inferred relationships involving `DailyActivity` (e.g. with `_activity_to_response()` and `InMemoryScopeMonitoringRepository`) actually correct?**
  _`DailyActivity` has 59 INFERRED edges - model-reasoned connections that need verification._
- **Are the 66 inferred relationships involving `InMemoryScopeMonitoringRepository` (e.g. with `2. Vue d'ensemble des couches` and `5. Ce que ces tests ne prouvent pas`) actually correct?**
  _`InMemoryScopeMonitoringRepository` has 66 INFERRED edges - model-reasoned connections that need verification._
- **Are the 55 inferred relationships involving `create_app()` (e.g. with `API — `adapters/inbound/api/`` and `close_persistence()`) actually correct?**
  _`create_app()` has 55 INFERRED edges - model-reasoned connections that need verification._