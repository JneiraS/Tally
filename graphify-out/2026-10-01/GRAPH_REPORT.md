# Graph Report - ProTab  (2026-10-01)

## Corpus Check
- 178 files · ~89,045 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 8, .example 1, .conf 1)

## Summary
- 1430 nodes · 3272 edges · 100 communities (67 shown, 33 thin omitted)
- Extraction: 81% EXTRACTED · 19% INFERRED · 0% AMBIGUOUS · INFERRED: 619 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `501b0bf0`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- audit_trail_test.py
- PostgresScopeMonitoringRepository
- package.json
- ScopeMonitoring
- parse_scope_monitorings_csv
- OfficialCode
- DomainError
- DailyActivity
- Navbar.tsx
- Officials
- api_test.py
- schemas.py
- empty_database
- PostgresAuthRepository
- useToast.tsx
- Développement
- protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository
- pytest
- App.tsx
- postgres_scope_monitoring_repository_test.py
- project_admin.py
- compilerOptions
- app.py
- FakeAuthRepository
- create_daily_activity_test.py
- Rule Categories by Priority (1-10)
- La CLI `protab-project`
- Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring)
- dataclasses
- update_daily_activity_test.py
- FastAPI & PostgreSQL Performance Optimizer Skill
- require_current_project
- Hexagonal Architecture (Ports and Adapters)
- PostgresScopeMonitoringRepository
- api Service (FastAPI backend)
- project_admin_test.py
- analytics.ts
- Development Workflow (9 Steps)
- postgres_audit_trail_repository_test.py
- opencode.json
- complete_daily_activity_test.py
- Application Layer / Use Cases
- protab
- build_connection_pool
- ._translate_unique_violation
- postgres_auth_repository_test.py
- graphify.js
- _official_codes
- architecture.md
- ScopeListPage.tsx
- postgres_auth_bootstrap_test.py
- ScopeMonitoringNotFoundError
- current_user
- Tally plutôt qu'un tableur
- AuditEvent
- ScopeMonitoringRepository
- datetime
- auth
- index.ts
- L'architecture Docker de ProTab
- AnalyticsPage.tsx
- AnalyticsFilterBar.tsx
- kpi.ts
- AnalyticsCharts.tsx
- Tests
- Frontend
- 4. Les ports
- react
- audit_log_api_test.py
- InMemoryScopeMonitoringRepository
- create_app

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
10. `AuditEvent` - 25 edges

## Surprising Connections (you probably didn't know these)
- `5. Ce que ces tests ne prouvent pas` --references--> `InMemoryScopeMonitoringRepository`  [INFERRED]
  docs/testing.md → src/protab/adapters/outbound/persistence/in_memory_scope_monitoring_repository.py
- `Application — `tests/unit/application/`` --references--> `InMemoryScopeMonitoringRepository`  [INFERRED]
  docs/testing.md → src/protab/adapters/outbound/persistence/in_memory_scope_monitoring_repository.py
- `Absence de port pour l'authentification` --references--> `PostgresAuthRepository`  [INFERRED]
  docs/architecture.md → src/protab/adapters/outbound/persistence/postgres_auth_repository.py
- `6. Sécurité : ce que la topologie garantit, et ce qu'elle ne garantit pas` --references--> `MissingProjectContextError`  [INFERRED]
  docs/docker-architecture.md → src/protab/adapters/outbound/persistence/postgres_scope_monitoring_repository.py
- `Domaine — `tests/unit/domain/`` --references--> `build_changes()`  [INFERRED]
  docs/testing.md → src/protab/domain/entities/audit_event.py

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **ProTab Mutation → Audit Trail Flow** — readme_mutation_use_cases, readme_audit_trail, readme_domain_invariants, readme_domain_error_http_mapping, readme_rest_routes_table [INFERRED 0.85]
- **ProTab PostgreSQL Persistence Path (port → adapter → pool → container)** — agents_scopemonitoringrepository_port, agents_postgres_scopemonitoringrepository, agents_idempotent_schema_bootstrap, agents_postgres_pool_configuration, readme_postgres_persistence, readme_scope_monitorings_index, docker_compose_db_service, docker_compose_api_service [INFERRED 0.85]
- **ProTab Hexagonal Core and Its Adapters** — agents_hexagonal_architecture, readme_scope_monitoring_aggregate, readme_mutation_use_cases, agents_scopemonitoringrepository_port, readme_http_api_adapter, readme_csv_import_adapter, readme_postgres_persistence [INFERRED 0.95]

## Communities (100 total, 33 thin omitted)

### Community 0 - "audit_trail_test.py"
Cohesion: 0.28
Nodes (12): InMemoryAuditTrailRepository, current_project_id(), CreateScopeMonitoringCommand, AuditEventQuery, make_scope_with_activity(), test_complete_activity_records_audit_event_per_day(), test_create_activity_records_audit_event(), test_create_scope_from_csv_records_import_action() (+4 more)

### Community 1 - "PostgresScopeMonitoringRepository"
Cohesion: 0.28
Nodes (5): PostgresScopeMonitoringRepository, Connection, date, Persist ``ScopeMonitoring`` aggregates in PostgreSQL. The schema is applied…, Close the connection pool, releasing database connections.

### Community 2 - "package.json"
Cohesion: 0.05
Nodes (38): jsdom, tailwindcss, @tailwindcss/vite, @types/node, @types/react, @types/react-dom, typescript, vite (+30 more)

### Community 3 - "ScopeMonitoring"
Cohesion: 0.10
Nodes (6): date, ScopeMonitoring, Persist the given ScopeMonitoring. Replaces the whole aggregate: the scope row…, Return the ScopeMonitoring with the given name, or None., date, RecordingScopeMonitoringRepository

### Community 4 - "parse_scope_monitorings_csv"
Cohesion: 0.14
Nodes (28): 6. Les adaptateurs entrants, CLI — `src/protab/project_admin.py`, CSV — `adapters/inbound/csv/scope_monitoring_csv_reader.py`, fastapi_responses, JSONResponse, Path, pathlib, protab_adapters_inbound_csv_scope_monitoring_csv_reader (+20 more)

### Community 5 - "OfficialCode"
Cohesion: 0.11
Nodes (24): Grant permanent access to one project. Returns False if already set. The code…, OfficialCode, A single official identity, normalized the way login normalizes it.…, ``OfficialCode`` is the single-code form of an official identity. A project…, Only the ends are noise; a space inside is part of the identity., ``LoginRequest.quadrigramme`` allows two characters, so we must too., ``A/B`` is the Officials form; as an admin code it could never be typed back as…, ``?`` means "no backup official" in the scope columns; it is not a code. (+16 more)

### Community 6 - "DomainError"
Cohesion: 0.15
Nodes (23): DuplicateFeaiReferenceError, IncidentsExceedErrorsError, InvalidFeaiReferenceError, NegativeErrorsCountError, NegativeIncidentsCountError, Raised when incidents_created exceeds errors_reported., Raised when a FEAI reference does not match the expected format., Raised when a FEAI reference is duplicated within the same activity. (+15 more)

### Community 7 - "DailyActivity"
Cohesion: 0.15
Nodes (18): 3. Le domaine, DailyActivity, test_daily_activity_creation_valid(), test_daily_activity_duplicate_feai_rejected(), test_daily_activity_errors_reported_negative(), test_daily_activity_incidents_created_negative(), test_daily_activity_incidents_exceed_errors(), test_daily_activity_invalid_feai_format() (+10 more)

### Community 8 - "Navbar.tsx"
Cohesion: 0.16
Nodes (14): 3. Client HTTP — `services/api.ts`, src_frontend_src_assets_layered_waves_dark, src_frontend_src_assets_layered_waves_light, LoginBackground(), Navbar(), NavbarProps, Theme, ThemeContext (+6 more)

### Community 9 - "Officials"
Cohesion: 0.11
Nodes (25): KnowledgeBase, Officials, build_scope(), fixture_scope_monitoring(), fixture, parametrize, Adding a DailyActivity for a new day should succeed., Adding a second DailyActivity for the same day should raise… (+17 more)

### Community 10 - "api_test.py"
Cohesion: 0.08
Nodes (16): client(), create_scope_via_api(), make_scope_with_activity(), fixture, test_complete_daily_activities_returns_204(), test_complete_day_without_activity_returns_404(), test_create_daily_activity_duplicate_day_returns_409(), test_create_daily_activity_invalid_invariant_returns_400() (+8 more)

### Community 11 - "schemas.py"
Cohesion: 0.20
Nodes (15): BaseModel, field_validator, pydantic, ActivityResponse, AuditEventResponse, CompleteRequest, CreateActivityRequest, CreateScopeItem (+7 more)

### Community 12 - "empty_database"
Cohesion: 0.17
Nodes (12): empty_database(), A project must never be created without someone able to enter it. Once it owns…, Both secrets are missing: the message must name the one resolved first.…, The secrets are only needed to seed; a restart must not require them. Requiring…, The seeded administrator must be usable as a login right away., Create the schema, then drop every project so a bootstrap is pending., Seeding the first project demands an explicit, non-guessable password. No…, test_bootstrap_grants_the_configured_admin_code() (+4 more)

### Community 13 - "PostgresAuthRepository"
Cohesion: 0.11
Nodes (13): hashlib, hmac, psycopg_types_json, secrets, _check_password(), _normalize_code(), _normalize_non_working_days(), PostgresAuthRepository (+5 more)

### Community 14 - "useToast.tsx"
Cohesion: 0.07
Nodes (27): @testing-library/jest-dom, @testing-library/react, vitest, ToastContainer(), ToastAction, ToastActionsContext, ToastActionsType, ToastContextType (+19 more)

### Community 15 - "Développement"
Cohesion: 0.17
Nodes (11): 10. Publier une modification — liste de contrôle, 12. Documents voisins, 1. Prérequis, 2. Installation, 5. Base de données : pas d'outil de migration, 6. Tests, 7. Administration d'hôte, 8. Docker (+3 more)

### Community 16 - "protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository"
Cohesion: 0.17
Nodes (13): APIRoute, fastapi_routing, fastapi_testclient, protab_adapters_inbound_api_app, protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository, test_daily_activity_full_flow_over_http(), business_routes(), Business routes must be authenticated by default (allowlist, not denylist).… (+5 more)

### Community 17 - "pytest"
Cohesion: 0.15
Nodes (15): protab_application_queries_get_daily_activity, protab_application_queries_get_scope, protab_application_queries_list_scopes, pytest, GetDailyActivityUseCase, Tenant isolation must fail closed when no project context is established. A…, test_raises_when_no_context_is_established(), make_scope() (+7 more)

### Community 18 - "App.tsx"
Cohesion: 0.15
Nodes (15): 4. Chemins et routage, react-dom, react-router-dom, App(), AppContent(), ITEMS, PageNav(), PageShortcuts() (+7 more)

### Community 19 - "postgres_scope_monitoring_repository_test.py"
Cohesion: 0.08
Nodes (33): reset_current_project(), set_current_project(), make_scope(), project_context(), date, fixture, Integration tests for the PostgreSQL repository adapter. These tests exercise…, Every read and write is tenant-scoped: name the project under test. The… (+25 more)

### Community 20 - "project_admin.py"
Cohesion: 0.06
Nodes (46): argparse, 3. Configuration, dotenv, fastapi, getpass, os, protab_adapters_inbound_api_config, protab_adapters_outbound_persistence_postgres_auth_repository (+38 more)

### Community 21 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 22 - "app.py"
Cohesion: 0.15
Nodes (12): csv, protab_adapters_inbound_api_auth, protab_adapters_inbound_api_errors, protab_adapters_inbound_api_schemas, protab_application_commands_create_scope_monitoring, protab_application_queries_list_audit_events, protab_application_use_cases_complete_daily_activity, protab_application_use_cases_create_daily_activity (+4 more)

### Community 23 - "FakeAuthRepository"
Cohesion: 0.16
Nodes (11): AuthSession, FakeAuthRepository, login_and_read_session_cookie(), test_authenticated_routes_require_a_valid_session(), test_in_memory_application_remains_unauthenticated_for_existing_fixtures(), test_login_rejects_invented_quadrigramme_when_known_codes_exist(), test_project_settings_are_authenticated_and_project_scoped(), test_project_settings_reject_invalid_weekday() (+3 more)

### Community 24 - "create_daily_activity_test.py"
Cohesion: 0.31
Nodes (12): handle_create_daily_activity(), CreateDailyActivityCommand, CreateDailyActivityUseCase, make_command(), make_scope(), make_scope_daily_activity(), test_create_daily_activity(), test_create_duplicate_day_raises_and_persists_nothing() (+4 more)

### Community 25 - "Rule Categories by Priority (1-10)"
Cohesion: 0.20
Nodes (12): Design Dials (variance / motion / density), Design System Generation (--design-system), Design System Persistence (Master + Overrides), Pre-Delivery UI Checklist, Search Query Contract, Rule Categories by Priority (1-10), ui-ux-pro-max Search Script, Stack Detection Step (+4 more)

### Community 26 - "La CLI `protab-project`"
Cohesion: 0.12
Nodes (17): 10. En Docker, 11. Voir aussi, 1. Ce que la CLI fait, et ce qu'elle ne fait pas, 2. Prérequis, 3. Inventaire des commandes, 4. Les mots de passe, 5. Qui peut se connecter, 6. Pourquoi nommer un administrateur (+9 more)

### Community 27 - "Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring)"
Cohesion: 0.20
Nodes (11): Avoid Premature Abstraction, SOLID Principles, Aggregate Owns DailyActivities Indexed by Day, Atomic ScopeMonitoring Creation, CSV Import Inbound Adapter, DailyActivity (Entity), Day Is Not a Class (datetime.date as value object), Domain Invariants (counters, FEAI format, completion implication) (+3 more)

### Community 28 - "dataclasses"
Cohesion: 0.17
Nodes (7): dataclasses, protab_adapters_outbound_persistence_postgres_pool, protab_adapters_outbound_persistence_postgres_scope_monitoring_repository, In-memory adapter of the AuditTrailRepository port for tests., PostgreSQL outbound adapter for the AuditTrailRepository port. The schema is…, Domain model for the audit trail. An :class:`AuditEvent` records *who* (actor)…, uuid

### Community 29 - "update_daily_activity_test.py"
Cohesion: 0.15
Nodes (20): 10. Cycle de vie d'une écriture, 5. La couche application, handle_update_daily_activity(), current_actor(), UpdateDailyActivityCommand, UpdateDailyActivityUseCase, build_changes(), Return only the fields whose value differs between ``before`` and ``after``.… (+12 more)

### Community 30 - "FastAPI & PostgreSQL Performance Optimizer Skill"
Cohesion: 0.22
Nodes (10): Caching Layer & Background Task Offloading, Connection Pooling Parameters, Database Indexing Strategy, Diagnostic & Audit Checklist, Event Loop Stall Detection, FastAPI & PostgreSQL Performance Optimizer Skill, N+1 Query Pattern Detection, Payload & Serialization Optimization (+2 more)

### Community 31 - "require_current_project"
Cohesion: 0.18
Nodes (12): 11. Où aller quand…, 12. Documents voisins, 1. Ce que fait l'application, 8. Multi-tenant : le mécanisme à comprendre avant toute modification, 9. Modèle de données, Architecture, 11. Problèmes fréquents, RuntimeError (+4 more)

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

### Community 36 - "analytics.ts"
Cohesion: 0.18
Nodes (14): CONFIG, aggregateByDay(), aggregateByWeek(), clampRange(), dayCount(), ErrorHeatmap, isoWeekKey(), pctChange() (+6 more)

### Community 37 - "Development Workflow (9 Steps)"
Cohesion: 0.40
Nodes (6): Definition of Done Checklist, Development Workflow (9 Steps), Documentation Synchronization Requirement, Graphify Knowledge Graph Workflow, Test-Driven Development (RED/GREEN/REFACTOR), Testing Strategy (Test Pyramid)

### Community 38 - "postgres_audit_trail_repository_test.py"
Cohesion: 0.24
Nodes (11): protab_adapters_outbound_persistence_postgres_audit_trail_repository, make_event(), project(), fixture, Integration tests for the PostgreSQL audit trail adapter. Skipped when…, repo(), test_list_filters_by_scope_actor_action_and_dates(), test_list_isolated_by_project() (+3 more)

### Community 40 - "complete_daily_activity_test.py"
Cohesion: 0.44
Nodes (11): CompleteDailyActivityCommand, CompleteDailyActivityUseCase, make_activity(), make_scope(), All days are resolved before anything is written. Completing day 1 then failing…, test_complete_day_without_activity_raises(), test_complete_does_not_touch_earlier_days_when_a_later_day_is_missing(), test_complete_multiple_days() (+3 more)

### Community 72 - "build_connection_pool"
Cohesion: 0.14
Nodes (10): ConnectionPool, psycopg, psycopg_pool, build_connection_pool(), ping_check(), Connection, Shared PostgreSQL connection-pool configuration for persistence adapters., Check connectivity and leave the connection outside a transaction. (+2 more)

### Community 73 - "._translate_unique_violation"
Cohesion: 0.28
Nodes (7): 7. Les adaptateurs sortants, Exception, DuplicateDailyActivityError, Raised when a ScopeMonitoring already has a DailyActivity for the given day., Raised when a ScopeMonitoring with the same name already exists., ScopeMonitoringNameAlreadyExistsError, UniqueViolation

### Community 74 - "postgres_auth_repository_test.py"
Cohesion: 0.07
Nodes (33): add_scope(), add_scope_for(), Integration tests for the PostgreSQL auth repository rule: the quadrigramme…, Give one project a scope, switching the tenant the adapter reads. Both tenants…, ``official_main`` encodes several codes just like ``official_backup``., ``?`` marks the absence of a backup official, it is not a code., The rule the whole feature exists for. Without an administrator, creating the…, Permanent access is not a password bypass: the admin is one factor. (+25 more)

### Community 75 - "graphify.js"
Cohesion: 0.40
Nodes (3): IMPORTANT: keep the reminder string free of backticks and $(...) constructs., ref_fs, ref_path

### Community 76 - "_official_codes"
Cohesion: 0.29
Nodes (9): _official_codes(), Quadrigrammes declared by one ``officials`` column (format « A/B »).…, Parsing of the officials columns that gate the quadrigramme. Both…, ``MRAM/ ?`` means "MRAM, no backup": ``?`` is not a quadrigramme., test_handles_empty_and_none(), test_ignores_punctuation_only_parts(), test_placeholder_is_not_a_code(), test_splits_multiple_codes() (+1 more)

### Community 78 - "ScopeListPage.tsx"
Cohesion: 0.10
Nodes (34): 6. Tests frontend, Pièges propres à cette suite, recharts, ActivityFormModal(), Badge(), BadgeProps, BillingCodeBadge(), BillingCodeBadgeProps (+26 more)

### Community 79 - "postgres_auth_bootstrap_test.py"
Cohesion: 0.16
Nodes (15): _hash_password(), Return the quadrigramme seeding the first project's administrator. Same fail-…, Replace the password of an existing project and drop its sessions. Rotating a…, Return the password seeding the first project, or refuse to start. Called only…, resolve_bootstrap_admin_code(), resolve_bootstrap_password(), The bootstrap secrets must never fall back to a hardcoded default. A missing…, test_admin_code_trims_surrounding_whitespace() (+7 more)

### Community 80 - "ScopeMonitoringNotFoundError"
Cohesion: 0.25
Nodes (5): date, DailyActivityNotFoundError, Raised when a ScopeMonitoring cannot be found for the given id., Raised when a DailyActivity cannot be found for the given day., ScopeMonitoringNotFoundError

### Community 81 - "current_user"
Cohesion: 0.28
Nodes (9): get_project_settings(), list_projects(), login(), me(), update_project_settings(), _project_to_response(), current_user(), CurrentUser (+1 more)

### Community 82 - "Tally plutôt qu'un tableur"
Cohesion: 0.29
Nodes (6): Ce qu'un tableur fait mieux, Ce que coûte un tableur partagé, Ce que Tally change, En résumé, Quand ne pas migrer, Tally plutôt qu'un tableur

### Community 83 - "AuditEvent"
Cohesion: 0.20
Nodes (6): PostgresAuditTrailRepository, Open the connection pool and apply the (idempotent) schema., Close the connection pool, releasing database connections., ListAuditEventsUseCase, AuditEvent, Return audit events matching the query, most recent first.

### Community 84 - "ScopeMonitoringRepository"
Cohesion: 0.08
Nodes (14): GetScopeUseCase, ListScopesUseCase, AuditTrailRepository, Protocol, Persist an audit event., date, Protocol, Add one activity to an existing scope. Raises: DuplicateDailyActivityError: the… (+6 more)

### Community 85 - "datetime"
Cohesion: 0.16
Nodes (12): datetime, protab_application_actor_context, protab_application_commands_daily_activity, protab_domain_entities_audit_event, protab_domain_entities_daily_activity, protab_domain_entities_scope_monitoring, protab_domain_exceptions, protab_ports_outbound_audit_trail_repository (+4 more)

### Community 86 - "auth"
Cohesion: 0.29
Nodes (7): auth(), bootstrap_password(), project(), fixture, The bootstrap secrets are mandatory: no default is provided.…, scopes(), truncate_all()

### Community 87 - "index.ts"
Cohesion: 0.10
Nodes (29): AuditActivityHeatmap(), AuditActivityHeatmapProps, HOURS, intensityClass(), WEEKDAYS, ACTION_ICONS, ACTION_LABELS, AuditLogPage() (+21 more)

### Community 88 - "L'architecture Docker de ProTab"
Cohesion: 0.12
Nodes (17): 1. Vue d'ensemble à l'exécution, 2. Ordre de démarrage : ce que les dépendances garantissent, 3. Chaîne de construction des images, 4. Le premier démarrage : une fenêtre, pas une configuration, 5. Requêtes : le rôle de nginx est plus qu'un serveur de fichiers, 6. Sécurité : ce que la topologie garantit, et ce qu'elle ne garantit pas, 7. Commandes de la stack, Ce que le diagramme dit des ports publiés (+9 more)

### Community 89 - "AnalyticsPage.tsx"
Cohesion: 0.15
Nodes (22): ExportModal(), ScopeBase, AnalyticsPage(), formatPeriod(), GRANULARITIES, initialFilters(), buildPeriodDays(), MAX_TRACKED_DAYS (+14 more)

### Community 90 - "AnalyticsFilterBar.tsx"
Cohesion: 0.12
Nodes (20): ANALYTICS_PATH, AnalyticsFilterBar(), AnalyticsFilterBarProps, AnalyticsFilters, billingCodeKey(), SCOPE_DETAIL_PATH, SCOPE_LIST_PATH, scopeCountLabel() (+12 more)

### Community 93 - "kpi.ts"
Cohesion: 0.17
Nodes (19): 8. La page d'analyse — `/analyse`, Chaque bloc mesure une chose différente, Le reste de la page, computePeriodSummary(), baselineDelta, buildCumulativeTrend(), buildDailyTrend(), coverageRate() (+11 more)

### Community 95 - "AnalyticsCharts.tsx"
Cohesion: 0.24
Nodes (9): AnalyticsErrorHeatmap(), columnLabels(), ErrorCell(), ErrorMatrix(), heatmapClass(), buildErrorHeatmap(), ErrorHeatmapCell, ErrorHeatmapRow (+1 more)

### Community 96 - "Tests"
Cohesion: 0.15
Nodes (13): 1. Vue d'ensemble, 2. Tests unitaires — `tests/unit/`, 3. Tests d'intégration — `tests/integration/adapters/`, 4. Test E2E — `tests/e2e/`, 5. Ce que ces tests ne prouvent pas, 7. Écrire un nouveau test, 8. Documents voisins, Adaptateurs — `tests/unit/adapters/` (+5 more)

### Community 97 - "Frontend"
Cohesion: 0.22
Nodes (9): 10. Tests, 11. Ce qui n'existe pas, 12. Build et déploiement, 13. Documents voisins, 1. Pile technique, 2. Arborescence, 6. Le modèle mono-jour, 9. Graphiques et styles (+1 more)

### Community 99 - "4. Les ports"
Cohesion: 0.50
Nodes (4): 4. Les ports, Absence de port pour l'authentification, Port d'audit — `ports/outbound/audit_trail_repository.py`, Port de périmètre — `ports/outbound/scope_monitoring_repository.py`

### Community 100 - "react"
Cohesion: 0.09
Nodes (40): 5. Providers et état, 7. Saisie et autosave, Suppression et annulation, lucide-react, react, ActivityFormModalProps, CompleteActivitiesModalProps, CsvImportModal() (+32 more)

### Community 103 - "audit_log_api_test.py"
Cohesion: 0.16
Nodes (16): contextvars, protab_adapters_outbound_persistence_in_memory_audit_trail_repository, project_context(), Per-request audit context. Mirrors the ``_CURRENT_PROJECT_ID`` ContextVar…, reset_current_actor(), set_current_actor(), all_events(), clear_actor() (+8 more)

### Community 106 - "InMemoryScopeMonitoringRepository"
Cohesion: 0.21
Nodes (10): InMemoryScopeMonitoringRepository, date, CreateScopeMonitoringUseCase, make_command(), test_create_blank_billing_code_raises_and_writes_nothing(), test_create_duplicate_name_raises_and_persists_nothing(), test_create_empty_official_raises(), test_create_invalid_knowledge_base_id_raises() (+2 more)

### Community 107 - "create_app"
Cohesion: 0.13
Nodes (19): API — `adapters/inbound/api/`, 4. Démarrage en développement, _activity_to_response(), create_app(), complete_daily_activities(), create_scope_monitorings(), get_scope_daily_activity(), get_scope_monitoring() (+11 more)

## Ambiguous Edges - Review These
- `React Root Mount (#root)` → `Audit Trail (best-effort mutation journal)`  [AMBIGUOUS]
  src/FrontEnd/index.html · relation: conceptually_related_to

## Knowledge Gaps
- **187 isolated node(s):** `$schema`, `plugin`, `protab`, `name`, `private` (+182 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 470 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `React Root Mount (#root)` and `Audit Trail (best-effort mutation journal)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Tests` connect `Tests` to `architecture.md`, `ScopeListPage.tsx`?**
  _High betweenness centrality (0.303) - this node is a cross-community bridge._
- **Why does `6. Tests frontend` connect `ScopeListPage.tsx` to `Tests`, `react`, `Navbar.tsx`, `index.ts`, `AnalyticsPage.tsx`?**
  _High betweenness centrality (0.298) - this node is a cross-community bridge._
- **Why does `InMemoryScopeMonitoringRepository` connect `InMemoryScopeMonitoringRepository` to `Tests`, `audit_trail_test.py`, `ScopeMonitoring`, `project_admin_test.py`, `DailyActivity`, `audit_log_api_test.py`, `complete_daily_activity_test.py`, `api_test.py`, `protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository`, `pytest`, `datetime`, `FakeAuthRepository`, `create_daily_activity_test.py`, `update_daily_activity_test.py`?**
  _High betweenness centrality (0.192) - this node is a cross-community bridge._
- **Are the 53 inferred relationships involving `DailyActivity` (e.g. with `_activity_to_response()` and `InMemoryScopeMonitoringRepository`) actually correct?**
  _`DailyActivity` has 53 INFERRED edges - model-reasoned connections that need verification._
- **Are the 50 inferred relationships involving `create_app()` (e.g. with `API — `adapters/inbound/api/`` and `close_persistence()`) actually correct?**
  _`create_app()` has 50 INFERRED edges - model-reasoned connections that need verification._
- **Are the 51 inferred relationships involving `InMemoryScopeMonitoringRepository` (e.g. with `2. Vue d'ensemble des couches` and `5. Ce que ces tests ne prouvent pas`) actually correct?**
  _`InMemoryScopeMonitoringRepository` has 51 INFERRED edges - model-reasoned connections that need verification._