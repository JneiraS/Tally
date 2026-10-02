# Tests

> **Documentation humaine, non normative.** Ce document facilite la maintenance.
> En cas de divergence, **le code et `AGENTS.md` font foi**. Aucune règle ne doit
> être appliquée sur la seule foi de ce document. La stratégie de test et le TDD
> sont normatifs dans `AGENTS.md` (§9, §10) ; ici on décrit la suite existante,
> ce qu'elle prouve — et ce qu'elle ne prouve pas.

Ce document inventorie les tests de ProTab (Python et TypeScript) et explique
où placer un nouveau test, et surtout ce qu'un test donné peut réellement
démontrer. Cette dernière partie est la plus utile en pratique : plusieurs
façades de test de ce dépôt donnent une fausse assurance si on les lit trop vite.

---

## 1. Vue d'ensemble

| Suite | Emplacement | Commande | Volume |
| --- | --- | --- | --- |
| Unitaire Python | `tests/unit/` | `make test` | 164 tests |
| Intégration Python | `tests/integration/` | `make test-db` | 138 tests, dont **84 ignorés** sans `PROTAB_TEST_DATABASE_URL` |
| E2E Python | `tests/e2e/` | `make test` | 1 test |
| Frontend | `src/FrontEnd/src/test/` | `npm test` | 218 tests (vitest) |

Deux exécutions, donc :

```bash
make test          # rapide, sans base de données
make test-db       # tout, y compris PostgreSQL
```

**Reality check, chiffres mesurés sur ce dépôt :** `make test` sans
`PROTAB_TEST_DATABASE_URL` affiche `219 passed, 84 skipped`. C'est le piège
principal : **un tiers de la suite n'a pas tourné**, et un « tout est vert »
local n'est pas une preuve de non-régression des adaptateurs. Seuls
`make test-db` et le compte `303 tests collected` distinguent les deux cas.

---

## 2. Tests unitaires — `tests/unit/`

Aucun `conftest.py` : le découpage repose sur les répertoires et sur des
helpers explicites. Chaque module déclare ses propres doublures.

### Domaine — `tests/unit/domain/`

| Fichier | Objet |
| --- | --- |
| `daily_activity_test.py` (31) | Mise à jour, clôture, contraintes et canonicalisation de `feai` |
| `official_code_test.py` (14) | Forme scalaire du quadrigramme : longueur, `/` refusé |
| `non_working_days_test.py` (17) | Calendrier ouvré : défaut, bornes ISO, relecture lenient, défaut non partagé, liste corrompue ramenée au défaut |
| `scope_monitoring_test.py` (11) | Accès à une activité par jour, agrégat |
| `audit_event_test.py` (5) | `build_changes` ne conserve que les champs modifiés |
| `exceptions_test.py` (1) | Hiérarchie des exceptions métier |

Ces tests s'exécutent sans aucune dépendance. Ils constituent la garantie la
plus solide du dépôt, et la seule qui reste valable si l'infrastructure change.

### Application — `tests/unit/application/`

Cinq fichiers de tests de cas d'usage (`create_scope_monitoring_test.py`,
`create_daily_activity_test.py`, `update_daily_activity_test.py`,
`complete_daily_activity_test.py`, `queries_test.py`) plus
`audit_trail_test.py`. Ils utilisent
`InMemoryScopeMonitoringRepository` et un adaptateur d'audit mémoire.

**`tests/unit/application/recording_repository.py` n'est pas un test** : c'est
un décorateur qui enregistre les appels reçus au port, et il mérite qu'on
comprenne pourquoi il existe. Son propre docstring (`recording_repository.py:1-9`)
donne la raison : l'adaptateur en mémoire **rend les objets qu'il stocke**, donc
muter l'agrégat en place et le réécrire intégralement sont indiscernables de
l'extérieur. Observer *quelle* écriture le cas d'usage choisit est le seul moyen
de prouver qu'une mise à jour d'activité ne réécrit pas un périmètre entier.

### Adaptateurs — `tests/unit/adapters/`

Six modules qui testent de la logique d'adaptateur **sans base** :
`api_config_test.py` (résolution hôte/port, `Secure`), `official_codes_test.py`
(parseur de la liste séparée par `/`), `postgres_auth_bootstrap_test.py`
(résolution fail-closed des secrets d'amorçage), `postgres_pool_test.py`,
`project_context_guard_test.py` (2 tests : le contexte projet ne doit jamais
être un repli), et `tests/unit/project_admin_cli_test.py` (7 tests : validation
d'arguments de la CLI, pas d'accès base).

Ces tests sont trompeurs s'ils sont lus comme des tests d'intégration : voir §5.

---

## 3. Tests d'intégration — `tests/integration/adapters/`

### Contre PostgreSQL réel

Quatre fichiers, tous ignorés sans `PROTAB_TEST_DATABASE_URL` via un
`pytestmark = pytest.mark.skipif(...)` au niveau du module :

| Fichier | Volume | Objet |
| --- | --- | --- |
| `postgres_scope_monitoring_repository_test.py` | 28 | Persistance de l'agrégat, écritures ciblées, traduction des violations de contrainte, isolation par projet |
| `postgres_auth_repository_test.py` | 33 | Authentification, sessions, administrateurs, rotation de mot de passe, jours non ouvrés |
| `project_admin_test.py` | 19 | La CLI `protab-project` contre la vraie base (en patchant `getpass` et `sys.argv`) |
| `postgres_audit_trail_repository_test.py` | 4 | Écriture et lecture du journal d'audit |

Deux détails qui font gagner du temps :

- Ces fichiers fournissent eux-mêmes `PROTAB_DEFAULT_PROJECT_PASSWORD` et
  `PROTAB_DEFAULT_PROJECT_ADMIN_CODE` par `monkeypatch`
  (`postgres_auth_repository_test.py:49-50`), puisque l'amorçage refuse de
  démarrer sans.
- Les fixtures `truncate_all()` sont **locales à chaque fichier** :
  `TRUNCATE ... RESTART IDENTITY CASCADE`, puis réinsertion du projet de test
  (`postgres_scope_monitoring_repository_test.py:74-84`). `project_admins`
  n'y figure pas : le `TRUNCATE projects ... CASCADE` l'emporte.

### Contre l'API, sans base

| Fichier | Volume | Objet |
| --- | --- | --- |
| `api_test.py` | 30 | Routes métier avec un adaptateur en mémoire injecté, canonicalisation FEAI |
| `auth_api_test.py` | 9 | Login, session, cookie `Secure`, expiration du cookie alignée sur la session |
| `audit_log_api_test.py` | 4 | Journal d'audit et sa pagination |
| `scope_monitoring_csv_reader_test.py` | 6 | Lecture et rejet de CSV |
| `route_authorization_test.py` | 3 | **Polarité inversée** sur l'authentification |

`route_authorization_test.py` mérite une attention particulière : il liste les
seules routes qui peuvent être non authentifiées (`PUBLIC_ROUTES`,
`route_authorization_test.py:22-32`) et échoue si une route hors de cette liste
n'a pas la dépendance `project_context`. Ajouter une route publique impose donc
d'ajouter son chemin à cette liste. Le raisonnement est en `AGENTS.md` §28.1.

`auth_api_test.py` fournit un `FakeAuthRepository` réutilisé par d'autres
fichiers d'intégration : c'est une doublure, pas une base.

---

## 4. Test E2E — `tests/e2e/`

Un seul test, `test_daily_activity_flow.py` : création d'un périmètre, puis
saisie d'une activité journalière, via `TestClient` et un adaptateur en
mémoire. Il prouve que l'API et un cas d'usage s'accordent sur un parcours
minimal. Il ne prouve rien de la persistance, de l'authentification ni du
multi-tenant.

---

## 5. Ce que ces tests ne prouvent pas

C'est la section à lire avant de conclure qu'une garantie est acquise.

**Un test à double ne prouve pas l'écriture ciblée.** La garantie « les autres
jours sont intacts après une mise à jour » est vérifiable **uniquement** dans
`postgres_scope_monitoring_repository_test.py`. Avec l'adaptateur en mémoire,
muter en place et tout réécrire produisent le même résultat observable. C'est
précisément ce que `recording_repository.py` existe pour pallier — et même là,
seule la méthode appelée est prouvée, pas l'effet SQL.

**Un test d'API ne prouve pas l'isolation entre tenants.** `api_test.py`
s'exécute dans un contexte projet unique ; un `SELECT` sans filtre passerait.
Seuls les tests PostgreSQL qui font coexister deux projets distinguent une
requête
correcte d'une fuite inter-tenant (`AGENTS.md` §28.1).

**Un port ajouté n'est souvent couvert que par un seul adaptateur.** Le dépôt
n'a pas de CI
et les tests unitaires utilisent l'adaptateur en mémoire : ajouter une méthode au
port et ne l'implémenter que dans `InMemoryScopeMonitoringRepository` laisse
l'échec invisible jusqu'à l'exécution en production. **Les deux adaptateurs
doivent être vérifiés à la main** à chaque ajout de méthode de port
(`AGENTS.md` §11, Liskov).

**Un test « passe » n'est pas un test « exécuté ».** Voir §1.

---

## 6. Tests frontend

```bash
cd src/FrontEnd
npm test            # vitest run
npm run lint        # tsc --noEmit — contrôle de types, pas de style
```

Vingt-six fichiers dans `src/FrontEnd/src/test/`. `src/test/setup.ts` importe
`@testing-library/jest-dom/vitest` et allonge `asyncUtilTimeout` — une seconde,
le délai par défaut, ne suffit pas quand la suite crée un jsdom par fichier et
attend deux réponses d'API. En revanche ni `ResizeObserver` ni dimensions ne sont
mockés.

Les tests se répartissent entre logique pure (`kpi.test.ts`, `export.test.ts`,
`validation.test.ts`, `knowledgeBase.test.ts`, `auditStats.test.ts`,
`analytics.test.ts`, `nonWorkingDays.test.ts`, `search.test.ts`) et rendu de
composants (`ScopeListPage`, `TodayActivityEditor`, `AuditLogPage`,
`FeaiTagInput`, `ActivityFormModal`, `ExportModal`, `DateNavigator`, `LoginBackground`,
`AppSessionLoss`, `DashboardCharts`, `ScopeDetailCharts`, `AuditActivityHeatmap`,
`AuditShortcut`, `apiUnauthorized`, `AnalyticsPage`, `AnalyticsFilterBar`,
`AnalyticsScopePicker`, `PageNav`, `PageShortcuts`).

### Pièges propres à cette suite

- **La date du jour est une dépendance implicite.** Le `beforeEach` de
  `ScopeListPage.test.tsx` fixe la date du jour, et elle doit être un **jour
  ouvré** : sinon la page s'ouvre sur le jour ouvré précédent et tous les
  scénarios se décalent.
- **Un test de saisie doit changer de jour.** Un test qui n'affiche que la
  journée courante passe même avec des compteurs périmés — voir `AGENTS.md`
  §28.6.
- **Un test jsdom ne prouve pas un style calculé.** Le rendu des graphiques
  recharts n'a pas lieu en dessous de 0×0, donc `RootSurface` renvoie `null` et
  le `<svg>` n'est jamais monté : de tels tests vérifient une classe, pas un
  rendu (`AGENTS.md` §28.6).

---

## 7. Écrire un nouveau test

**Arbre de décision :**

| Le comportement concerne… | Où l'écrire | Ce qu'il faut |
| --- | --- | --- |
| Une règle métier pure | `tests/unit/domain/` | rien d'infrastructure |
| L'enchaînement d'un cas d'usage | `tests/unit/application/` | un port doublé, et `RecordingScopeMonitoringRepository` si l'écriture compte |
| Une règle d'adaptateur sans base | `tests/unit/adapters/` | une fonction dont on veut la règle |
| Du SQL, des contraintes, du multi-tenant | `tests/integration/adapters/postgres_*` | `PROTAB_TEST_DATABASE_URL` |
| Un code HTTP, un schéma | `tests/integration/adapters/api_test.py` | un adaptateur injecté |
| Une route et son authentification | `route_authorization_test.py` | mettre à jour `PUBLIC_ROUTES` si publique |
| Un parcours complet | `tests/e2e/` | à utiliser avec parcimonie |
| Un composant ou une fonction front | `src/FrontEnd/src/test/` | un jour ouvré si la date intervient |

**Rappel de méthode** : le test d'abord, et il doit échouer pour la bonne
raison avant d'écrire l'implémentation (`AGENTS.md` §9). Un test écrit après le
code, qui passe immédiatement, ne prouve souvent rien.

---

## 8. Documents voisins

- [`docs/architecture.md`](architecture.md) — ports, couches, invariants.
- [`docs/development.md`](development.md) — commandes et configuration.
- [`docs/frontend.md`](frontend.md) — architecture React.
- `AGENTS.md` §9, §10, §11, §28.1, §28.6 — règles normatives de test.
