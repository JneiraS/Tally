# Graph Report - ProTab  (2026-11-08)

## Corpus Check
- 235 files · ~154,186 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: (none) 9, .example 1, .conf 1)

## Summary
- 2036 nodes · 5047 edges · 125 communities (82 shown, 43 thin omitted)
- Extraction: 79% EXTRACTED · 21% INFERRED · 0% AMBIGUOUS · INFERRED: 1071 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8ce5a189`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- index.ts
- PostgresScopeMonitoringRepository
- package.json
- audit_log_api_test.py
- parse_scope_monitorings_csv
- OfficialCode
- DomainError
- DailyActivity
- AuditLogPage.tsx
- Officials
- api_test.py
- schemas.py
- ScopeDetailPage.tsx
- auth
- search.test.ts
- Tests
- vitest
- protab_domain_entities_audit_event
- App.tsx
- postgres_scope_monitoring_repository_test.py
- api_config_test.py
- compilerOptions
- protab_application_use_cases_complete_daily_activity
- useToast.tsx
- datetime
- update_scope_officials_test.py
- La CLI `protab-project`
- Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring)
- PostgresAuthRepository
- build_connection_pool
- FakeAuthRepository
- ScopeListPage.tsx
- Hexagonal Architecture (Ports and Adapters)
- makeScope
- api Service (FastAPI backend)
- project_admin_test.py
- analytics.ts
- Development Workflow (9 Steps)
- ScopeMonitoringNameAlreadyExistsError
- postgres_auth_repository_test.py
- ScopeMonitoring
- Application Layer / Use Cases
- protab
- create_app
- create_daily_activity_test.py
- API REST
- ref_fs
- AuditEventQuery
- 6. Tests frontend
- project_admin.py
- postgres_auth_bootstrap_test.py
- set_current_project
- measure-usage.sh
- Tally plutôt qu'un tableur de production
- ScopeMonitoringRepository
- Développement
- NonWorkingDays
- audit_trail_filter_test.py
- queries_test.py
- L'architecture Docker de Tally
- InMemoryScopeMonitoringRepository
- .from_raw
- CreateScopeMonitoringUseCase
- Audit Trail (best-effort mutation journal)
- kpi.ts
- AnalyticsFilterBar.tsx
- update_daily_activity_test.py
- app.py
- architecture.md
- protab_application_use_cases_update_scope_schedule
- pytest
- ActivityFormModal.tsx
- AnalyticsHeatmap.tsx
- update_scope_note_test.py
- Base de données
- SetActivitiesStatusUseCase
- PostgresScopeMonitoringRepository
- Authentification et autorisations
- Ressources consommées par la stack
- 6. Le modèle mono-jour
- auth_api_test.py
- postgres_auth_repository.py
- Modèle de domaine
- build_changes
- non_working_days.py
- test_the_status_write_creates_a_day_once_per_day
- .add_admin
- _official_codes
- .daily_activity_for
- protab_domain_value_objects_monitoring_schedule
- post-checkout
- post-commit
- AuditEvent
- ref_path
- src_frontend_src_types_index_isoweekday

## God Nodes (most connected - your core abstractions)
1. `InMemoryScopeMonitoringRepository` - 113 edges
2. `DailyActivity` - 88 edges
3. `create_app()` - 87 edges
4. `DayStatus` - 74 edges
5. `ScopeMonitoring` - 59 edges
6. `AuditEventQuery` - 40 edges
7. `vitest` - 39 edges
8. `ScopeMonitoringRepository` - 38 edges
9. `react` - 38 edges
10. `PostgresAuthRepository` - 36 edges

## Surprising Connections (you probably didn't know these)
- `8. Codes d'erreur` --references--> `DomainError`  [INFERRED]
  docs/api.md → src/protab/domain/exceptions/domain_error.py
- `Port d'audit — `ports/outbound/audit_trail_repository.py`` --references--> `AuditEventQuery`  [INFERRED]
  docs/architecture.md → src/protab/ports/outbound/audit_trail_repository.py
- `Le quadrigramme n'est pas validé au login` --references--> `OfficialCode`  [INFERRED]
  docs/authentication.md → src/protab/domain/value_objects/official_code.py
- `4. Isolation multi-tenant` --references--> `MissingProjectContextError`  [INFERRED]
  docs/authentication.md → src/protab/adapters/outbound/persistence/postgres_scope_monitoring_repository.py
- `Gestion par la CLI` --references--> `OfficialCode`  [INFERRED]
  docs/authentication.md → src/protab/domain/value_objects/official_code.py

## Import Cycles
- None detected.

## Communities (125 total, 43 thin omitted)

### Community 0 - "index.ts"
Cohesion: 0.11
Nodes (25): AuditActivityHeatmap(), AuditActivityHeatmapProps, HOURS, intensityClass(), WEEKDAYS, ApiError, notifyUnauthorized(), parseFastApiErrorMessage() (+17 more)

### Community 1 - "PostgresScopeMonitoringRepository"
Cohesion: 0.09
Nodes (24): 11. Où aller quand…, 12. Documents voisins, 1. Ce que fait l'application, 8. Multi-tenant : le mécanisme à comprendre avant toute modification, 9. Modèle de données, Architecture, 6. Filtrage par tenant, 10. Publier une modification — liste de contrôle (+16 more)

### Community 2 - "package.json"
Cohesion: 0.05
Nodes (40): jsdom, react-dom, recharts, tailwindcss, @tailwindcss/vite, @types/node, @types/react, @types/react-dom (+32 more)

### Community 3 - "audit_log_api_test.py"
Cohesion: 0.14
Nodes (24): Token, reset_current_actor(), set_current_actor(), all_events(), clear_actor(), env(), make_scope_with_activity(), fixture (+16 more)

### Community 4 - "parse_scope_monitorings_csv"
Cohesion: 0.16
Nodes (27): CSV — `adapters/inbound/csv/scope_monitoring_csv_reader.py`, fastapi_responses, JSONResponse, Path, pathlib, protab_adapters_inbound_csv_scope_monitoring_csv_reader, bad_request(), conflict() (+19 more)

### Community 5 - "OfficialCode"
Cohesion: 0.12
Nodes (23): OfficialCode, A single official identity, normalized the way login normalizes it.…, ``OfficialCode`` is the single-code form of an official identity. A project…, Only the ends are noise; a space inside is part of the identity., ``LoginRequest.quadrigramme`` allows two characters, so we must too., ``A/B`` is the Officials form; as an admin code it could never be typed back as…, ``?`` means "no backup official" in the scope columns; it is not a code., ``LoginRequest.quadrigramme`` caps at 20; a longer admin could never be typed… (+15 more)

### Community 6 - "DomainError"
Cohesion: 0.10
Nodes (34): 5. Invariants d'une activité journalière, Compteurs, Identité et nom, Références FEAI, Statut et motif KO, canonical_feai(), Ramène une référence à sa forme canonique ``FE-INC000000001``. La saisie est…, DuplicateFeaiReferenceError (+26 more)

### Community 7 - "DailyActivity"
Cohesion: 0.11
Nodes (35): Enum, DailyActivity, DayStatus, The one status of a scope monitoring on a given day. This replaces a pair of…, str, date, parametrize, test_daily_activity_apply_status_is_idempotent() (+27 more)

### Community 8 - "AuditLogPage.tsx"
Cohesion: 0.12
Nodes (21): AuditLogFilterBarProps, AuditLogFilters, DateInput(), EMPTY_FILTERS, ScopePicker(), ScopePickerProps, ACTION_ICONS, ACTION_LABELS (+13 more)

### Community 9 - "Officials"
Cohesion: 0.08
Nodes (34): 3. Le domaine, 2. Entités et value objects, KnowledgeBase, Officials, build_scope(), fixture_scope_monitoring(), fixture, parametrize (+26 more)

### Community 10 - "api_test.py"
Cohesion: 0.06
Nodes (34): client(), create_scope_via_api(), make_scope_with_activity(), fixture, The route has to accept a KO on a day that has no row yet. That is the…, Setting a status is not an entry: it must not insert a row on its own. Only the…, 422, not 400: the bound is refused by the request schema itself. The domain's…, test_a_blank_ko_reason_is_stored_as_no_reason() (+26 more)

### Community 11 - "schemas.py"
Cohesion: 0.11
Nodes (26): BaseModel, 2. Inventaire des routes, 3. Schémas, 7. Journal d'audit, Activité journalière, `GET /api/audit-log`, `POST /auth/login`, Projet et session (+18 more)

### Community 12 - "ScopeDetailPage.tsx"
Cohesion: 0.12
Nodes (28): 8. Saisie et autosave, Le détail est mono-jour lui aussi, Les champs en brouillon — note et responsables, pas un autosave, Les responsables — un brouillon réservé aux administrateurs, Où le statut est écrit, Suppression et annulation, lucide-react, ActivityRow() (+20 more)

### Community 13 - "auth"
Cohesion: 0.15
Nodes (19): 1. Conventions, Routes publiques et routes protégées, fastapi, protab_adapters_outbound_persistence_postgres_auth_repository, Response, get_project_settings(), list_projects(), login() (+11 more)

### Community 14 - "search.test.ts"
Cohesion: 0.39
Nodes (7): Recherche : le responsable passe avant le suppléant, matchesSearchQuery(), OFFICIAL_MATCH_RANK, officialMatchRank(), SearchableScope, SEARCHED_FIELDS, sortByOfficialRelevance()

### Community 15 - "Tests"
Cohesion: 0.22
Nodes (9): 1. Vue d'ensemble, 3. Tests d'intégration — `tests/integration/adapters/`, 4. Test E2E — `tests/e2e/`, 5. Ce que ces tests ne prouvent pas, 7. Écrire un nouveau test, 8. Documents voisins, Contre l'API, sans base, Contre PostgreSQL réel (+1 more)

### Community 16 - "vitest"
Cohesion: 0.06
Nodes (23): @testing-library/jest-dom, @testing-library/react, vitest, ToastContainer(), ToastProvider(), protabApi, NON_WORKING_DAYS, SCOPES (+15 more)

### Community 17 - "protab_domain_entities_audit_event"
Cohesion: 0.20
Nodes (11): protab_application_actor_context, protab_application_commands_daily_activity, protab_application_commands_scope_monitoring, protab_domain_entities_audit_event, protab_ports_outbound_admin_directory, protab_ports_outbound_audit_trail_repository, protab_ports_outbound_scope_monitoring_repository, In-memory adapter of the AuditTrailRepository port for tests. Every filter here… (+3 more)

### Community 18 - "App.tsx"
Cohesion: 0.07
Nodes (35): 3. Client HTTP — `services/api.ts`, 4. Chemins et routage, 5. Providers et état, react-router-dom, App(), AppContent(), src_frontend_src_assets_layered_waves_dark, src_frontend_src_assets_layered_waves_light (+27 more)

### Community 19 - "postgres_scope_monitoring_repository_test.py"
Cohesion: 0.06
Nodes (41): make_scope(), Integration tests for the PostgreSQL repository adapter. These tests exercise…, ``save`` creates a row; it never rewrites one. A second ``save`` used to…, The upsert writes two columns; the counters of a stored row are not read. A day…, Une liste vide ne doit pas être rapportée « périmètre introuvable ». Le `WHERE…, A database written by the previous schema must keep its completed days. The…, The write must name the rows it changes, like the activity writes. A full…, Édition ciblée des deux responsables, comme ``update_note`` : le reste de la… (+33 more)

### Community 20 - "api_config_test.py"
Cohesion: 0.12
Nodes (20): 3. Configuration, dotenv, os, protab_adapters_inbound_api_config, cookie_secure_from_env(), host_port_from_env(), InvalidPortError, Exception (+12 more)

### Community 21 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 23 - "useToast.tsx"
Cohesion: 0.13
Nodes (23): react, CompleteActivitiesModal(), CsvImportModal(), CsvImportModalProps, Modal(), ModalProps, ScopeFormModal(), ScopeFormModalProps (+15 more)

### Community 24 - "datetime"
Cohesion: 0.17
Nodes (10): dataclasses, datetime, protab_domain_entities_daily_activity, protab_domain_entities_day_status, protab_domain_entities_scope_monitoring, protab_domain_exceptions, re, PostgreSQL outbound adapter for the ScopeMonitoringRepository port. The… (+2 more)

### Community 25 - "update_scope_officials_test.py"
Cohesion: 0.18
Nodes (23): admin_edit(), FakeAdminDirectory, make_scope(), Édition des responsables d'un périmètre :use case et autorisation. Le droit…, L'§28.1 : une édition passe par une écriture ciblée du port, jamais par…, Un champ inchangé ne doit pas figurer dans le diff : l'événement raconte ce qui…, Pour un **admin**, la permission est établie : un id inconnu remonte alors la…, Mode dégradé sans authentification (dev/tests, ``auth=None``) : la seule… (+15 more)

### Community 26 - "La CLI `protab-project`"
Cohesion: 0.12
Nodes (17): 10. En Docker, 11. Voir aussi, 1. Ce que la CLI fait, et ce qu'elle ne fait pas, 2. Prérequis, 3. Inventaire des commandes, 4. Les mots de passe, 5. Qui peut se connecter, 6. Pourquoi nommer un administrateur (+9 more)

### Community 27 - "Mutation Use Cases (Create/Complete/Update DailyActivity, Create ScopeMonitoring)"
Cohesion: 0.20
Nodes (11): Avoid Premature Abstraction, SOLID Principles, Aggregate Owns DailyActivities Indexed by Day, Atomic ScopeMonitoring Creation, CSV Import Inbound Adapter, DailyActivity (Entity), Day Is Not a Class (datetime.date as value object), Domain Invariants (counters, FEAI format, completion implication) (+3 more)

### Community 28 - "PostgresAuthRepository"
Cohesion: 0.08
Nodes (22): 4. Les ports, Absence de port pour l'authentification, Port d'administrateurs — `ports/outbound/admin_directory.py`, Port d'audit — `ports/outbound/audit_trail_repository.py`, _hash_password(), PostgresAuthRepository, Project, Store project credentials and opaque, expiring session tokens. (+14 more)

### Community 29 - "build_connection_pool"
Cohesion: 0.17
Nodes (9): ConnectionPool, psycopg, psycopg_pool, build_connection_pool(), ping_check(), Connection, Shared PostgreSQL connection-pool configuration for persistence adapters., Check connectivity and leave the connection outside a transaction. (+1 more)

### Community 30 - "FakeAuthRepository"
Cohesion: 0.11
Nodes (23): AuthSession, TestClient, FakeAuthRepository, test_project_settings_are_authenticated_and_project_scoped(), test_project_settings_reject_invalid_weekday(), logged_client(), make_scope(), parametrize (+15 more)

### Community 31 - "ScopeListPage.tsx"
Cohesion: 0.13
Nodes (23): 7. Le statut d'une journée : `pending`, `completed`, `ko`, Le lot, depuis l'historique, AnalyticsFilterBarProps, CompleteTodayButton(), CompleteTodayButtonProps, DashboardCharts(), DashboardChartsProps, ExportModalProps (+15 more)

### Community 32 - "Hexagonal Architecture (Ports and Adapters)"
Cohesion: 0.22
Nodes (9): Adapters (Inbound / Outbound), Dependency Injection and Composition Root, Dependency Rule (Adapters → Ports → Application → Domain), Domain Layer, Domain Error Handling and Adapter Translation, Framework Isolation, Hexagonal Architecture (Ports and Adapters), Ports (Inbound and Outbound Contracts) (+1 more)

### Community 33 - "makeScope"
Cohesion: 0.14
Nodes (22): ExportModal(), ScopeBase, scope(), scope(), scope(), defaultFrom, fixtureDay, renderModal() (+14 more)

### Community 34 - "api Service (FastAPI backend)"
Cohesion: 0.19
Nodes (13): api Healthcheck (/healthz), api Service (FastAPI backend), db Healthcheck (pg_isready), db Service (postgres:17-alpine), Default Project Seeding Env Vars, ProTab Development Docker Stack, frontend Service (React/nginx build), pgdata Named Volume (+5 more)

### Community 35 - "project_admin_test.py"
Cohesion: 0.06
Nodes (48): 2. Vue d'ensemble des couches, 4. Démarrage en développement, Cibles Makefile, protab, bootstrap_password(), fixture, Integration tests for the ``protab-project`` administrative command. The…, The whole point: the code belongs to the project, not to a scope. (+40 more)

### Community 36 - "analytics.ts"
Cohesion: 0.13
Nodes (30): Sparklines sur `/analyse` — pas de recharts, toMondayFirstIndex(), AnalyticsPage(), formatPeriod(), GRANULARITIES, initialFilters(), CONFIG, aggregateByDay() (+22 more)

### Community 37 - "Development Workflow (9 Steps)"
Cohesion: 0.40
Nodes (6): Definition of Done Checklist, Development Workflow (9 Steps), Documentation Synchronization Requirement, Graphify Knowledge Graph Workflow, Test-Driven Development (RED/GREEN/REFACTOR), Testing Strategy (Test Pyramid)

### Community 38 - "ScopeMonitoringNameAlreadyExistsError"
Cohesion: 0.17
Nodes (13): 7. Les adaptateurs sortants, 5. Traduction des erreurs SQL, 6. Écritures ciblées et cohérence, Unicité, Exception, DuplicateDailyActivityError, Raised when a ScopeMonitoring already has a DailyActivity for the given day., Raised when a ScopeMonitoring with the same name already exists. (+5 more)

### Community 39 - "postgres_auth_repository_test.py"
Cohesion: 0.06
Nodes (37): add_scope(), bootstrap_password(), fixture, Integration tests for the PostgreSQL auth repository rule: the quadrigramme…, ``official_main`` encodes several codes just like ``official_backup``., ``?`` marks the absence of a backup official, it is not a code., La colonne est du JSONB non typé : ce qui est écrit doit être relu à…, The rule the whole feature exists for. Without an administrator, creating the… (+29 more)

### Community 40 - "ScopeMonitoring"
Cohesion: 0.10
Nodes (5): ScopeMonitoring, Return the ScopeMonitoring with the given id, or None., Return the ScopeMonitoring with the given name, or None., Return all ScopeMonitorings., RecordingScopeMonitoringRepository

### Community 72 - "create_app"
Cohesion: 0.10
Nodes (23): 6. Les adaptateurs entrants, API — `adapters/inbound/api/`, CLI — `src/protab/project_admin.py`, 9. Mode dégradé sans authentification, _activity_to_response(), build_repository(), create_app(), create_scope_monitorings() (+15 more)

### Community 73 - "create_daily_activity_test.py"
Cohesion: 0.32
Nodes (11): handle_create_daily_activity(), CreateDailyActivityCommand, CreateDailyActivityUseCase, make_command(), make_scope(), make_scope_daily_activity(), test_create_daily_activity(), test_create_duplicate_day_raises_and_persists_nothing() (+3 more)

### Community 74 - "API REST"
Cohesion: 0.10
Nodes (20): 10. Exemples avec `curl`, 4. Authentification et projet, 5. Périmètres, 6. Activités journalières, 8. Codes d'erreur, 9. Import et export CSV, API REST, `GET /auth/me` (+12 more)

### Community 76 - "AuditEventQuery"
Cohesion: 0.21
Nodes (19): InMemoryAuditTrailRepository, current_project_id(), CreateScopeMonitoringCommand, AuditEventQuery, Filters selecting a slice of the audit trail. Two decisions here are load-…, make_scope_with_activity(), ``activity_ko`` covers both directions, and ``changes`` disambiguates. A…, The KO reason is cleared from the row on completion — the trail keeps it. A… (+11 more)

### Community 77 - "6. Tests frontend"
Cohesion: 0.20
Nodes (10): 6. Tests frontend, Pièges propres à cette suite, DateNavigator(), DateNavigatorProps, formatDayMonthFr(), formatWeekdayFr(), shiftDay(), ScopeDetailCharts() (+2 more)

### Community 78 - "project_admin.py"
Cohesion: 0.22
Nodes (17): argparse, getpass, protab_domain_value_objects_official_code, _add_admin(), _create_project(), _list_admins(), main(), _open_existing_project() (+9 more)

### Community 79 - "postgres_auth_bootstrap_test.py"
Cohesion: 0.21
Nodes (13): Return the quadrigramme seeding the first project's administrator. Same fail-…, Return the password seeding the first project, or refuse to start. Called only…, resolve_bootstrap_admin_code(), resolve_bootstrap_password(), The bootstrap secrets must never fall back to a hardcoded default. A missing…, test_admin_code_trims_surrounding_whitespace(), test_blank_admin_code_raises(), test_blank_variable_raises() (+5 more)

### Community 80 - "set_current_project"
Cohesion: 0.10
Nodes (26): Token, reset_current_project(), set_current_project(), project(), test_list_isolated_by_project(), add_scope_for(), project(), Give one project a scope, switching the tenant the adapter reads. Both tenants… (+18 more)

### Community 81 - "measure-usage.sh"
Cohesion: 0.23
Nodes (14): container_writable(), image_on_disk(), image_uncompressed(), print_containers(), print_devenv_guard(), print_disk_totals(), print_host(), print_images() (+6 more)

### Community 82 - "Tally plutôt qu'un tableur de production"
Cohesion: 0.29
Nodes (6): Ce qu'un tableur continue de mieux faire, Ce que le Cloud a réglé… et ce que le tableur ne réglera jamais, Ce que Tally apporte, En résumé, Quand conserver le tableur ?, Tally plutôt qu'un tableur de production

### Community 83 - "ScopeMonitoringRepository"
Cohesion: 0.08
Nodes (18): Overwrite the officials of an existing scope, admins only. Written through the…, UpdateScopeOfficialsUseCase, AdminDirectory, Protocol, Who may act as a project administrator. ``project_admins`` is the storage; this…, Whether ``code`` is an administrator of the current project. The project is…, AuditTrailRepository, Protocol (+10 more)

### Community 84 - "Développement"
Cohesion: 0.22
Nodes (9): 11. Problèmes fréquents, 12. Documents voisins, 1. Prérequis, 2. Installation, 6. Tests, 7. Administration d'hôte, 8. Docker, 9. Qualité : ce que le dépôt fait — et ce qu'il ne fait pas (+1 more)

### Community 85 - "NonWorkingDays"
Cohesion: 0.09
Nodes (40): NonWorkingDays, A project's working calendar: recurring weekdays and one-off dates. Both…, The calendar of a project that never configured one., Rebuild a calendar from an untyped ``projects.non_working_days`` value. Lenient…, The column's stored shape, kept as plain lists for the JSON contract., Un calendrier sans jour ouvré n'a rien à afficher : la page principale…, test_project_settings_reject_a_calendar_without_any_working_day(), Une ligne historique illisible ne doit pas vider le calendrier : elle est… (+32 more)

### Community 86 - "audit_trail_filter_test.py"
Cohesion: 0.25
Nodes (17): actions(), make_event(), ``list`` must select the same events in both audit trail adapters.…, A ``day IS NULL`` event must survive a period: this is the silent loss., Return a repository holding ``events``. ``InMemoryAuditTrailRepository.record``…, The defect this pins: ``abcd`` and ``AB`` used to return nothing., recorded(), test_actor_ignores_surrounding_whitespace() (+9 more)

### Community 87 - "queries_test.py"
Cohesion: 0.14
Nodes (14): protab_application_queries_get_daily_activity, protab_application_queries_get_scope, protab_application_queries_list_scopes, GetDailyActivityUseCase, GetScopeUseCase, ListScopesUseCase, make_scope(), test_get_daily_activity_day_not_found_raises() (+6 more)

### Community 88 - "L'architecture Docker de Tally"
Cohesion: 0.12
Nodes (17): 1. Vue d'ensemble à l'exécution, 2. Ordre de démarrage : ce que les dépendances garantissent, 3. Chaîne de construction des images, 4. Le premier démarrage : une fenêtre, pas une configuration, 5. Requêtes : le rôle de nginx est plus qu'un serveur de fichiers, 6. Sécurité : ce que la topologie garantit, et ce qu'elle ne garantit pas, 7. Commandes de la stack, Ce que le diagramme dit des ports publiés (+9 more)

### Community 89 - "InMemoryScopeMonitoringRepository"
Cohesion: 0.17
Nodes (12): InMemoryScopeMonitoringRepository, date, make_scope(), ``save`` must refuse what the SQL adapter refuses. Both adapters implement…, Same refusal as the SQL adapter, or the two are not interchangeable. An empty…, Reporting a blocked day is what makes the status usable at all. Nobody could…, test_a_refused_save_leaves_the_stored_scope_untouched(), test_save_refuses_a_name_already_stored() (+4 more)

### Community 90 - ".from_raw"
Cohesion: 0.33
Nodes (5): Rebuild a status from an untyped ``daily_activities.status`` value. Lenient on…, test_a_day_status_is_a_closed_set_of_three_states(), test_a_day_status_reads_back_from_its_stored_value(), test_a_day_status_serialises_to_its_stored_value(), test_an_unreadable_status_reads_as_pending()

### Community 91 - "CreateScopeMonitoringUseCase"
Cohesion: 0.42
Nodes (10): protab_application_commands_create_scope_monitoring, CreateScopeMonitoringUseCase, make_command(), test_create_blank_billing_code_raises_and_writes_nothing(), test_create_duplicate_name_raises_and_persists_nothing(), test_create_empty_official_raises(), test_create_invalid_knowledge_base_id_raises(), test_create_multiple_scope_monitorings() (+2 more)

### Community 92 - "Audit Trail (best-effort mutation journal)"
Cohesion: 0.40
Nodes (6): Audit Trail (best-effort mutation journal), Domain Error to HTTP Status Mapping, REST Routes and Status Codes Table, React Root Mount (#root), React SPA HTML Entry Point, Tailwind Dark Theme Utility Tokens

### Community 93 - "kpi.ts"
Cohesion: 0.13
Nodes (28): 9. La page d'analyse — `/analyse`, Chaque bloc mesure une chose différente, Le reste de la page, DEFAULT_EXCLUDED_WEEKDAYS, DEFAULT_NON_WORKING_DAYS, ISO_MONDAY, ISO_SATURDAY, ISO_SUNDAY (+20 more)

### Community 94 - "AnalyticsFilterBar.tsx"
Cohesion: 0.13
Nodes (18): ANALYTICS_PATH, AnalyticsFilterBar(), AnalyticsFilters, applyPreset(), billingCodeKey(), formatRange(), SCOPE_DETAIL_PATH, SCOPE_LIST_PATH (+10 more)

### Community 95 - "update_daily_activity_test.py"
Cohesion: 0.35
Nodes (11): 10. Cycle de vie d'une écriture, handle_update_daily_activity(), UpdateDailyActivityCommand, UpdateDailyActivityUseCase, make_scope_with_activity(), A PATCH must not rewrite the whole scope. Rewriting the aggregate persists…, test_update_daily_activity(), test_update_day_without_activity_raises() (+3 more)

### Community 96 - "app.py"
Cohesion: 0.12
Nodes (15): collections_abc, csv, protab_adapters_inbound_api_auth, protab_adapters_inbound_api_errors, protab_adapters_inbound_api_schemas, protab_adapters_outbound_persistence_in_memory_audit_trail_repository, protab_application_queries_list_audit_events, protab_application_use_cases_create_daily_activity (+7 more)

### Community 99 - "pytest"
Cohesion: 0.14
Nodes (14): inspect, protab_adapters_outbound_persistence_postgres_pool, protab_adapters_outbound_persistence_postgres_scope_monitoring_repository, psycopg_types_json, pytest, PostgreSQL outbound adapter for the AuditTrailRepository port. The schema is…, test_build_connection_pool_uses_tuned_configuration(), Tenant isolation must fail closed when no project context is established. A… (+6 more)

### Community 100 - "ActivityFormModal.tsx"
Cohesion: 0.14
Nodes (26): Saisie d'une référence FEAI, Un piège que le ref de statut referme, ActivityFormModal(), ActivityFormModalProps, ActivityRowProps, CompleteActivitiesModalProps, FeaiTagInput(), FeaiTagInputProps (+18 more)

### Community 101 - "AnalyticsHeatmap.tsx"
Cohesion: 0.08
Nodes (25): Les trois conséquences sur le reste de l'application, AnalyticsErrorHeatmap(), AnalyticsErrorHeatmapProps, columnLabels(), ErrorCell(), ErrorMatrix(), getHeatmapStep(), AnalyticsKpiCards() (+17 more)

### Community 102 - "update_scope_note_test.py"
Cohesion: 0.32
Nodes (14): handle_update_scope_note(), UpdateScopeNoteCommand, Overwrite the free-text note of an existing scope. The note is written through…, UpdateScopeNoteUseCase, make_scope(), A note edit must not rewrite the whole scope. Rewriting the aggregate persists…, test_update_note_clears_the_note_when_emptied(), test_update_note_leaves_the_daily_activities_intact() (+6 more)

### Community 103 - "Base de données"
Cohesion: 0.10
Nodes (19): 10. Documents voisins, 1. Modèle relationnel, 2. Tables et contraintes, 3. Pas d'outil de migration, 4. Écritures ciblées, 8. Connexions et pool, 9. Tests et base de test, `audit_log` (+11 more)

### Community 104 - "SetActivitiesStatusUseCase"
Cohesion: 0.24
Nodes (22): SetActivitiesStatusCommand, _audit_action(), Set the status of one or more days of a scope. One rule lives here rather than…, ``activity_completed`` keeps its meaning; everything else is ``activity_ko``.…, SetActivitiesStatusUseCase, make_activity(), make_scope(), A day can be reported as blocked, but it cannot be *completed*. Completing… (+14 more)

### Community 105 - "PostgresScopeMonitoringRepository"
Cohesion: 0.21
Nodes (12): API Configuration via load_dotenv and os.getenv, Configuration and Secrets Management, Idempotent Schema Bootstrap (CREATE TABLE IF NOT EXISTS), InMemoryScopeMonitoringRepository, PostgreSQL Integration Tests (make test-db), Centralized PostgreSQL Pool Configuration, PostgresScopeMonitoringRepository, ProTab Infrastructure Notes (+4 more)

### Community 106 - "Authentification et autorisations"
Cohesion: 0.12
Nodes (16): 10. Documents voisins, 1. La connexion, 2. La session, 3. Qui peut se connecter, `401` signifie « session perdue », 4. Isolation multi-tenant, 5. Les administrateurs de projet, 6. Rotation du mot de passe et révocation (+8 more)

### Community 107 - "Ressources consommées par la stack"
Cohesion: 0.18
Nodes (11): 10. Un défaut corrigé au cours de cette mesure, 1. Poids sur le disque, 2. Consommation mémoire et CPU au repos, 3. Comportement sous charge, 4. Débit et latence, 5. Ce qui n'appartient pas à la stack, 6. Configuration PostgreSQL et mémoire, 7. Dimensionnement (+3 more)

### Community 108 - "6. Le modèle mono-jour"
Cohesion: 0.14
Nodes (15): 10. Graphiques et styles, 11. Tests, 12. Ce qui n'existe pas, 13. Build et déploiement, 14. Documents voisins, 1. Pile technique, 2. Arborescence, 6. Le modèle mono-jour (+7 more)

### Community 109 - "auth_api_test.py"
Cohesion: 0.10
Nodes (26): APIRoute, fastapi_routing, fastapi_testclient, protab_adapters_inbound_api_app, protab_adapters_outbound_persistence_in_memory_scope_monitoring_repository, test_daily_activity_full_flow_over_http(), login_and_read_session_cookie(), Le refus porte sur la semaine entière, pas sur le week-end : un projet qui… (+18 more)

### Community 110 - "postgres_auth_repository.py"
Cohesion: 0.14
Nodes (10): hashlib, hmac, protab_domain_value_objects_non_working_days, secrets, _check_password(), _normalize_code(), PostgreSQL persistence for projects and login sessions., Whether a quadrigramme is an administrator of that one project. Normalization… (+2 more)

### Community 111 - "Modèle de domaine"
Cohesion: 0.18
Nodes (11): 1. Vue d'ensemble, 3. Invariants d'un périmètre, 4. Calendrier ouvré du projet, 7. Journal d'audit, 8. Où lire les règles dans le code, Code de facturation, Modèle de domaine, Note libre (+3 more)

### Community 112 - "build_changes"
Cohesion: 0.07
Nodes (26): contextvars, 5. La couche application, Port de périmètre — `ports/outbound/scope_monitoring_repository.py`, 7. Colonnes nullables et relecture lenient, Responsables, 2. Tests unitaires — `tests/unit/`, Adaptateurs — `tests/unit/adapters/`, Application — `tests/unit/application/` (+18 more)

### Community 113 - "non_working_days.py"
Cohesion: 0.29
Nodes (6): IntEnum, _is_iso_weekday(), IsoWeekday, The ISO 8601 weekday scale, which is what ``excluded_weekdays`` stores.…, Whether a raw entry names a weekday of the ISO scale. ``str.isdigit`` is not…, test_the_iso_scale_runs_from_monday_to_sunday()

### Community 114 - "test_the_status_write_creates_a_day_once_per_day"
Cohesion: 0.40
Nodes (5): count_activity_rows(), date, A duplicated day must not create a second row. The use case de-duplicates the…, Count the stored rows for one day, without going through the aggregate., test_the_status_write_creates_a_day_once_per_day()

### Community 117 - "_official_codes"
Cohesion: 0.29
Nodes (9): _official_codes(), Quadrigrammes declared by one ``officials`` column (format « A/B »).…, Parsing of the officials columns that gate the quadrigramme. Both…, ``MRAM/ ?`` means "MRAM, no backup": ``?`` is not a quadrigramme., test_handles_empty_and_none(), test_ignores_punctuation_only_parts(), test_placeholder_is_not_a_code(), test_splits_multiple_codes() (+1 more)

### Community 132 - "AuditEvent"
Cohesion: 0.10
Nodes (18): protab_adapters_outbound_persistence_postgres_audit_trail_repository, PostgresAuditTrailRepository, Open the connection pool and apply the (idempotent) schema., Close the connection pool, releasing database connections., ListAuditEventsUseCase, AuditEvent, Return audit events matching the query, most recent first. ``scope_ids``…, make_event() (+10 more)

## Ambiguous Edges - Review These
- `React Root Mount (#root)` → `Audit Trail (best-effort mutation journal)`  [AMBIGUOUS]
  src/FrontEnd/index.html · relation: conceptually_related_to

## Knowledge Gaps
- **246 isolated node(s):** `Périmètre`, `Activité journalière`, ``GET /auth/me``, ``POST /auth/logout``, ``GET` et `PUT /project/settings`` (+241 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 667 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **43 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `React Root Mount (#root)` and `Audit Trail (best-effort mutation journal)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `6. Le modèle mono-jour` connect `6. Le modèle mono-jour` to `analytics.ts`, `AuditLogPage.tsx`, `ScopeDetailPage.tsx`, `search.test.ts`, `NonWorkingDays`, `kpi.ts`?**
  _High betweenness centrality (0.148) - this node is a cross-community bridge._
- **Why does `RecordingScopeMonitoringRepository` connect `ScopeMonitoring` to `pytest`, `update_scope_note_test.py`, `DailyActivity`, `SetActivitiesStatusUseCase`, `create_daily_activity_test.py`, `Tests`, `datetime`, `update_scope_officials_test.py`, `CreateScopeMonitoringUseCase`, `update_daily_activity_test.py`?**
  _High betweenness centrality (0.141) - this node is a cross-community bridge._
- **Why does `7. Écrire un nouveau test` connect `Tests` to `vitest`, `makeScope`, `ScopeMonitoring`?**
  _High betweenness centrality (0.140) - this node is a cross-community bridge._
- **Are the 99 inferred relationships involving `InMemoryScopeMonitoringRepository` (e.g. with `2. Vue d'ensemble des couches` and `5. Ce que ces tests ne prouvent pas`) actually correct?**
  _`InMemoryScopeMonitoringRepository` has 99 INFERRED edges - model-reasoned connections that need verification._
- **Are the 68 inferred relationships involving `DailyActivity` (e.g. with `_activity_to_response()` and `InMemoryScopeMonitoringRepository`) actually correct?**
  _`DailyActivity` has 68 INFERRED edges - model-reasoned connections that need verification._
- **Are the 65 inferred relationships involving `create_app()` (e.g. with `API — `adapters/inbound/api/`` and `9. Mode dégradé sans authentification`) actually correct?**
  _`create_app()` has 65 INFERRED edges - model-reasoned connections that need verification._