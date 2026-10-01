# Graph Report - ProTab  (2026-10-01)

## Corpus Check
- 180 files · ~89,570 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 8, .example 1, .conf 1)

## Summary
- 1435 nodes · 3297 edges · 105 communities (71 shown, 34 thin omitted)
- Extraction: 81% EXTRACTED · 19% INFERRED · 0% AMBIGUOUS · INFERRED: 619 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `95d93401`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- vitest
- PostgresScopeMonitoringRepository
- package.json
- RecordingScopeMonitoringRepository
- parse_scope_monitorings_csv
- OfficialCode
- DomainError
- DailyActivity
- useTheme.tsx
- ScopeMonitoring
- api_test.py
- schemas.py
- empty_database
- PostgresAuthRepository
- useToast.tsx
- Développement
- protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository
- queries_test.py
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
- datetime
- update_daily_activity_test.py
- FastAPI & PostgreSQL Performance Optimizer Skill
- require_current_project
- Hexagonal Architecture (Ports and Adapters)
- PostgresScopeMonitoringRepository
- api Service (FastAPI backend)
- project_admin_test.py
- analytics.ts
- Development Workflow (9 Steps)
- react
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
- DailyActivityNotFoundError
- current_user
- Tally plutôt qu'un tableur
- AuditEvent
- ScopeMonitoringRepository
- protab_domain_exceptions
- fixture
- index.ts
- L'architecture Docker de ProTab
- ExportModal.tsx
- AnalyticsFilterBar.tsx
- ._validate
- build_changes
- kpi.ts
- create_default_app
- AnalyticsPage.tsx
- Tests
- Frontend
- postgres_audit_trail_repository.py
- 4. Les ports
- ActivityFormModal.tsx
- pytest
- audit_log_api_test.py
- InMemoryScopeMonitoringRepository
- create_app

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
10. `Officials` - 26 edges

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

## Communities (105 total, 34 thin omitted)

### Community 0 - "vitest"
Cohesion: 0.10
Nodes (23): @testing-library/jest-dom, @testing-library/react, vitest, AuditActivityHeatmap(), AuditActivityHeatmapProps, HOURS, intensityClass(), WEEKDAYS (+15 more)

### Community 1 - "PostgresScopeMonitoringRepository"
Cohesion: 0.28
Nodes (5): PostgresScopeMonitoringRepository, Connection, date, Persist ``ScopeMonitoring`` aggregates in PostgreSQL. The schema is applied…, Close the connection pool, releasing database connections.

### Community 2 - "package.json"
Cohesion: 0.05
Nodes (38): jsdom, tailwindcss, @tailwindcss/vite, @types/node, @types/react, @types/react-dom, typescript, vite (+30 more)

### Community 4 - "parse_scope_monitorings_csv"
Cohesion: 0.14
Nodes (28): csv, CSV — `adapters/inbound/csv/scope_monitoring_csv_reader.py`, fastapi_responses, JSONResponse, Path, pathlib, protab_adapters_inbound_csv_scope_monitoring_csv_reader, protab_application_commands_create_scope_monitoring (+20 more)

### Community 5 - "OfficialCode"
Cohesion: 0.07
Nodes (43): argparse, getpass, protab_domain_value_objects_official_code, database_url_from_env(), Return the PostgreSQL DSN from DATABASE_URL, or None when unset., Grant permanent access to one project. Returns False if already set. The code…, OfficialCode, A single official identity, normalized the way login normalizes it.… (+35 more)

### Community 6 - "DomainError"
Cohesion: 0.15
Nodes (17): DomainError, Exception, Base exception for all domain-layer errors., InvalidOfficialCodeError, Raised when an official code cannot be used as a single login identity., EmptyBillingCodeError, EmptyOfficialsError, InvalidKnowledgeBaseIdError (+9 more)

### Community 7 - "DailyActivity"
Cohesion: 0.12
Nodes (21): 3. Le domaine, DailyActivity, date, test_daily_activity_creation_valid(), test_daily_activity_duplicate_feai_rejected(), test_daily_activity_errors_reported_negative(), test_daily_activity_incidents_created_negative(), test_daily_activity_incidents_exceed_errors() (+13 more)

### Community 8 - "useTheme.tsx"
Cohesion: 0.20
Nodes (11): src_frontend_src_assets_layered_waves_dark, src_frontend_src_assets_layered_waves_light, LoginBackground(), Theme, ThemeContext, ThemeContextType, ThemeProvider(), useTheme() (+3 more)

### Community 9 - "ScopeMonitoring"
Cohesion: 0.15
Nodes (24): KnowledgeBase, Officials, ScopeMonitoring, build_scope(), fixture_scope_monitoring(), fixture, parametrize, Adding a DailyActivity for a new day should succeed. (+16 more)

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
Cohesion: 0.11
Nodes (14): hashlib, hmac, secrets, _check_password(), _hash_password(), _normalize_code(), _normalize_non_working_days(), PostgresAuthRepository (+6 more)

### Community 14 - "useToast.tsx"
Cohesion: 0.08
Nodes (26): 5. Providers et état, 7. Saisie et autosave, Suppression et annulation, FeaiTagInput(), FeaiTagInputProps, UndoEntry, undoTitle(), ToastContainer() (+18 more)

### Community 15 - "Développement"
Cohesion: 0.17
Nodes (11): 10. Publier une modification — liste de contrôle, 12. Documents voisins, 1. Prérequis, 2. Installation, 5. Base de données : pas d'outil de migration, 6. Tests, 7. Administration d'hôte, 8. Docker (+3 more)

### Community 16 - "protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository"
Cohesion: 0.17
Nodes (13): APIRoute, fastapi_routing, fastapi_testclient, protab_adapters_inbound_api_app, protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository, test_daily_activity_full_flow_over_http(), business_routes(), Business routes must be authenticated by default (allowlist, not denylist).… (+5 more)

### Community 17 - "queries_test.py"
Cohesion: 0.14
Nodes (14): protab_application_queries_get_daily_activity, protab_application_queries_get_scope, protab_application_queries_list_scopes, GetDailyActivityUseCase, GetScopeUseCase, ListScopesUseCase, make_scope(), test_get_daily_activity_day_not_found_raises() (+6 more)

### Community 18 - "App.tsx"
Cohesion: 0.12
Nodes (21): 4. Chemins et routage, react-dom, react-router-dom, App(), AppContent(), CsvImportModal(), Navbar(), NavbarProps (+13 more)

### Community 19 - "postgres_scope_monitoring_repository_test.py"
Cohesion: 0.08
Nodes (35): reset_current_project(), set_current_project(), project(), project(), make_scope(), project_context(), date, fixture (+27 more)

### Community 20 - "api_config_test.py"
Cohesion: 0.13
Nodes (19): 3. Configuration, dotenv, os, cookie_secure_from_env(), host_port_from_env(), InvalidPortError, Exception, Resolve host/port from env values, falling back to defaults. (+11 more)

### Community 21 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 22 - "app.py"
Cohesion: 0.18
Nodes (15): protab_adapters_inbound_api_auth, protab_adapters_inbound_api_errors, protab_adapters_inbound_api_schemas, protab_adapters_outbound_persistence_postgres_audit_trail_repository, protab_application_queries_list_audit_events, protab_application_use_cases_complete_daily_activity, protab_application_use_cases_create_daily_activity, protab_application_use_cases_create_scope_monitoring (+7 more)

### Community 23 - "FakeAuthRepository"
Cohesion: 0.16
Nodes (11): AuthSession, FakeAuthRepository, login_and_read_session_cookie(), test_authenticated_routes_require_a_valid_session(), test_in_memory_application_remains_unauthenticated_for_existing_fixtures(), test_login_rejects_invented_quadrigramme_when_known_codes_exist(), test_project_settings_are_authenticated_and_project_scoped(), test_project_settings_reject_invalid_weekday() (+3 more)

### Community 24 - "create_daily_activity_test.py"
Cohesion: 0.36
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

### Community 28 - "datetime"
Cohesion: 0.23
Nodes (6): dataclasses, datetime, re, Domain model for the audit trail. An :class:`AuditEvent` records *who* (actor)…, typing, uuid

### Community 29 - "update_daily_activity_test.py"
Cohesion: 0.35
Nodes (11): 10. Cycle de vie d'une écriture, handle_update_daily_activity(), UpdateDailyActivityCommand, UpdateDailyActivityUseCase, make_scope_with_activity(), A PATCH must not rewrite the whole scope. Rewriting the aggregate persists…, test_update_daily_activity(), test_update_day_without_activity_raises() (+3 more)

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
Cohesion: 0.16
Nodes (22): AnalyticsPage(), CONFIG, aggregateByDay(), aggregateByWeek(), buildPeriodDays(), clampRange(), computePeriodSummary(), dayCount() (+14 more)

### Community 37 - "Development Workflow (9 Steps)"
Cohesion: 0.40
Nodes (6): Definition of Done Checklist, Development Workflow (9 Steps), Documentation Synchronization Requirement, Graphify Knowledge Graph Workflow, Test-Driven Development (RED/GREEN/REFACTOR), Testing Strategy (Test Pyramid)

### Community 38 - "react"
Cohesion: 0.19
Nodes (11): lucide-react, react, AnalyticsScopePicker(), CsvImportModalProps, Modal(), ModalProps, CHECKBOX_CLASS, FILTERS (+3 more)

### Community 40 - "complete_daily_activity_test.py"
Cohesion: 0.40
Nodes (11): CompleteDailyActivityCommand, CompleteDailyActivityUseCase, make_activity(), make_scope(), All days are resolved before anything is written. Completing day 1 then failing…, test_complete_day_without_activity_raises(), test_complete_does_not_touch_earlier_days_when_a_later_day_is_missing(), test_complete_multiple_days() (+3 more)

### Community 72 - "build_connection_pool"
Cohesion: 0.17
Nodes (9): ConnectionPool, psycopg, psycopg_pool, build_connection_pool(), ping_check(), Connection, Shared PostgreSQL connection-pool configuration for persistence adapters., Check connectivity and leave the connection outside a transaction. (+1 more)

### Community 73 - "._translate_unique_violation"
Cohesion: 0.25
Nodes (5): 7. Les adaptateurs sortants, Exception, DuplicateDailyActivityError, Raised when a ScopeMonitoring already has a DailyActivity for the given day., UniqueViolation

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
Cohesion: 0.08
Nodes (40): 6. Tests frontend, Pièges propres à cette suite, recharts, columnLabels(), ErrorCell(), ErrorMatrix(), heatmapClass(), AnalyticsFilterBarProps (+32 more)

### Community 79 - "postgres_auth_bootstrap_test.py"
Cohesion: 0.21
Nodes (13): Return the quadrigramme seeding the first project's administrator. Same fail-…, Return the password seeding the first project, or refuse to start. Called only…, resolve_bootstrap_admin_code(), resolve_bootstrap_password(), The bootstrap secrets must never fall back to a hardcoded default. A missing…, test_admin_code_trims_surrounding_whitespace(), test_blank_admin_code_raises(), test_blank_variable_raises() (+5 more)

### Community 80 - "DailyActivityNotFoundError"
Cohesion: 0.40
Nodes (3): date, DailyActivityNotFoundError, Raised when a DailyActivity cannot be found for the given day.

### Community 81 - "current_user"
Cohesion: 0.14
Nodes (19): fastapi, protab_adapters_inbound_api_config, protab_adapters_outbound_persistence_postgres_auth_repository, Response, get_project_settings(), list_projects(), login(), logout() (+11 more)

### Community 82 - "Tally plutôt qu'un tableur"
Cohesion: 0.29
Nodes (6): Ce qu'un tableur fait mieux, Ce que coûte un tableur partagé, Ce que Tally change, En résumé, Quand ne pas migrer, Tally plutôt qu'un tableur

### Community 83 - "AuditEvent"
Cohesion: 0.10
Nodes (22): _audit_event_to_response(), list_scope_audit_log(), InMemoryAuditTrailRepository, PostgresAuditTrailRepository, Open the connection pool and apply the (idempotent) schema., Close the connection pool, releasing database connections., current_project_id(), CreateScopeMonitoringCommand (+14 more)

### Community 84 - "ScopeMonitoringRepository"
Cohesion: 0.08
Nodes (14): AuditTrailRepository, Protocol, Persist an audit event., date, Protocol, Persist the given ScopeMonitoring. Replaces the whole aggregate: the scope row…, Add one activity to an existing scope. Raises: DuplicateDailyActivityError: the…, Overwrite the counters of a single day, leaving the others alone. The… (+6 more)

### Community 85 - "protab_domain_exceptions"
Cohesion: 0.18
Nodes (11): protab_application_actor_context, protab_application_commands_daily_activity, protab_domain_entities_audit_event, protab_domain_entities_daily_activity, protab_domain_entities_scope_monitoring, protab_domain_exceptions, protab_ports_outbound_audit_trail_repository, protab_ports_outbound_scope_monitoring_repository (+3 more)

### Community 86 - "fixture"
Cohesion: 0.50
Nodes (4): bootstrap_password(), fixture, The bootstrap secrets are mandatory: no default is provided.…, scopes()

### Community 87 - "index.ts"
Cohesion: 0.12
Nodes (24): ScopeFormModalProps, ScopeItemState, WEEKDAYS, WorkingDaysModalProps, ScopeListPageProps, ApiError, AuthSession, notifyUnauthorized() (+16 more)

### Community 88 - "L'architecture Docker de ProTab"
Cohesion: 0.12
Nodes (17): 1. Vue d'ensemble à l'exécution, 2. Ordre de démarrage : ce que les dépendances garantissent, 3. Chaîne de construction des images, 4. Le premier démarrage : une fenêtre, pas une configuration, 5. Requêtes : le rôle de nginx est plus qu'un serveur de fichiers, 6. Sécurité : ce que la topologie garantit, et ce qu'elle ne garantit pas, 7. Commandes de la stack, Ce que le diagramme dit des ports publiés (+9 more)

### Community 89 - "ExportModal.tsx"
Cohesion: 0.24
Nodes (12): ExportModal(), ExportModalProps, ScopeBase, buildExportRows(), CsvSeparator, downloadFile(), exportFilename(), ExportFormat (+4 more)

### Community 90 - "AnalyticsFilterBar.tsx"
Cohesion: 0.19
Nodes (14): ANALYTICS_PATH, AnalyticsFilterBar(), AnalyticsFilters, applyPreset(), billingCodeKey(), formatRange(), SCOPE_DETAIL_PATH, SCOPE_LIST_PATH (+6 more)

### Community 91 - "._validate"
Cohesion: 0.23
Nodes (10): DuplicateFeaiReferenceError, IncidentsExceedErrorsError, InvalidFeaiReferenceError, NegativeErrorsCountError, NegativeIncidentsCountError, Raised when incidents_created exceeds errors_reported., Raised when a FEAI reference does not match the expected format., Raised when a FEAI reference is duplicated within the same activity. (+2 more)

### Community 92 - "build_changes"
Cohesion: 0.25
Nodes (9): 5. La couche application, current_actor(), build_changes(), Return only the fields whose value differs between ``before`` and ``after``.…, test_audit_event_defaults(), test_build_changes_empty_when_identical(), test_build_changes_from_empty_keeps_all_fields(), test_build_changes_handles_removed_fields() (+1 more)

### Community 93 - "kpi.ts"
Cohesion: 0.19
Nodes (20): 6. Le modèle mono-jour, 8. La page d'analyse — `/analyse`, Chaque bloc mesure une chose différente, Le reste de la page, ScopeListPage(), baselineDelta, buildCumulativeTrend(), buildDailyTrend() (+12 more)

### Community 94 - "create_default_app"
Cohesion: 0.29
Nodes (7): 6. Les adaptateurs entrants, API — `adapters/inbound/api/`, CLI — `src/protab/project_admin.py`, 4. Démarrage en développement, create_default_app(), FastAPI, Create the production app using the configured PostgreSQL repository.

### Community 95 - "AnalyticsPage.tsx"
Cohesion: 0.20
Nodes (7): AnalyticsErrorHeatmap(), formatPeriod(), GRANULARITIES, initialFilters(), buildErrorHeatmap(), MAX_TRACKED_DAYS, resolvePresetRange()

### Community 96 - "Tests"
Cohesion: 0.15
Nodes (13): 1. Vue d'ensemble, 2. Tests unitaires — `tests/unit/`, 3. Tests d'intégration — `tests/integration/adapters/`, 4. Test E2E — `tests/e2e/`, 5. Ce que ces tests ne prouvent pas, 7. Écrire un nouveau test, 8. Documents voisins, Adaptateurs — `tests/unit/adapters/` (+5 more)

### Community 97 - "Frontend"
Cohesion: 0.22
Nodes (9): 10. Tests, 11. Ce qui n'existe pas, 12. Build et déploiement, 13. Documents voisins, 1. Pile technique, 2. Arborescence, 3. Client HTTP — `services/api.ts`, 9. Graphiques et styles (+1 more)

### Community 98 - "postgres_audit_trail_repository.py"
Cohesion: 0.29
Nodes (5): protab_adapters_outbound_persistence_postgres_pool, protab_adapters_outbound_persistence_postgres_scope_monitoring_repository, psycopg_types_json, PostgreSQL outbound adapter for the AuditTrailRepository port. The schema is…, test_build_connection_pool_uses_tuned_configuration()

### Community 99 - "4. Les ports"
Cohesion: 0.50
Nodes (4): 4. Les ports, Absence de port pour l'authentification, Port d'audit — `ports/outbound/audit_trail_repository.py`, Port de périmètre — `ports/outbound/scope_monitoring_repository.py`

### Community 100 - "ActivityFormModal.tsx"
Cohesion: 0.17
Nodes (16): ActivityFormModal(), ActivityFormModalProps, CompleteActivitiesModalProps, InlineActivityCounters(), InlineActivityCountersProps, SaveStatus, ValueSnapshot, SaveStatus (+8 more)

### Community 101 - "pytest"
Cohesion: 0.50
Nodes (3): pytest, Tenant isolation must fail closed when no project context is established. A…, test_raises_when_no_context_is_established()

### Community 103 - "audit_log_api_test.py"
Cohesion: 0.15
Nodes (17): contextvars, protab_adapters_outbound_persistence_in_memory_audit_trail_repository, project_context(), Per-request audit context. Mirrors the ``_CURRENT_PROJECT_ID`` ContextVar…, reset_current_actor(), set_current_actor(), all_events(), clear_actor() (+9 more)

### Community 106 - "InMemoryScopeMonitoringRepository"
Cohesion: 0.18
Nodes (10): InMemoryScopeMonitoringRepository, date, CreateScopeMonitoringUseCase, make_command(), test_create_blank_billing_code_raises_and_writes_nothing(), test_create_duplicate_name_raises_and_persists_nothing(), test_create_empty_official_raises(), test_create_invalid_knowledge_base_id_raises() (+2 more)

### Community 107 - "create_app"
Cohesion: 0.14
Nodes (16): _activity_to_response(), build_repository(), create_app(), complete_daily_activities(), create_scope_monitorings(), get_scope_daily_activity(), get_scope_monitoring(), import_scope_monitorings_csv() (+8 more)

## Ambiguous Edges - Review These
- `React Root Mount (#root)` → `Audit Trail (best-effort mutation journal)`  [AMBIGUOUS]
  src/FrontEnd/index.html · relation: conceptually_related_to

## Knowledge Gaps
- **188 isolated node(s):** `$schema`, `plugin`, `protab`, `name`, `private` (+183 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 470 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **34 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `React Root Mount (#root)` and `Audit Trail (best-effort mutation journal)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Tests` connect `Tests` to `architecture.md`, `ScopeListPage.tsx`?**
  _High betweenness centrality (0.307) - this node is a cross-community bridge._
- **Why does `6. Tests frontend` connect `ScopeListPage.tsx` to `vitest`, `Tests`, `useTheme.tsx`, `useToast.tsx`, `ExportModal.tsx`, `kpi.ts`?**
  _High betweenness centrality (0.296) - this node is a cross-community bridge._
- **Why does `InMemoryScopeMonitoringRepository` connect `InMemoryScopeMonitoringRepository` to `Tests`, `project_admin_test.py`, `DailyActivity`, `audit_log_api_test.py`, `ScopeMonitoring`, `api_test.py`, `complete_daily_activity_test.py`, `protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository`, `queries_test.py`, `AuditEvent`, `protab_domain_exceptions`, `app.py`, `FakeAuthRepository`, `create_daily_activity_test.py`, `update_daily_activity_test.py`?**
  _High betweenness centrality (0.186) - this node is a cross-community bridge._
- **Are the 53 inferred relationships involving `DailyActivity` (e.g. with `_activity_to_response()` and `InMemoryScopeMonitoringRepository`) actually correct?**
  _`DailyActivity` has 53 INFERRED edges - model-reasoned connections that need verification._
- **Are the 50 inferred relationships involving `create_app()` (e.g. with `API — `adapters/inbound/api/`` and `close_persistence()`) actually correct?**
  _`create_app()` has 50 INFERRED edges - model-reasoned connections that need verification._
- **Are the 51 inferred relationships involving `InMemoryScopeMonitoringRepository` (e.g. with `2. Vue d'ensemble des couches` and `5. Ce que ces tests ne prouvent pas`) actually correct?**
  _`InMemoryScopeMonitoringRepository` has 51 INFERRED edges - model-reasoned connections that need verification._