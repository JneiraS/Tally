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
| Unitaire Python | `tests/unit/` | `make test` | 226 tests |
| Intégration Python | `tests/integration/` | `make test-db` | 170 tests, dont **98 ignorés** sans `PROTAB_TEST_DATABASE_URL` |
| E2E Python | `tests/e2e/` | `make test` | 1 test |
| Typage Python | `src/protab` | `make typecheck` | `mypy`, `disallow_untyped_defs` |
| Frontend | `src/FrontEnd/src/test/` | `npm test` | 292 tests (vitest) |

Trois exécutions, donc :

```bash
make test          # rapide, sans base de données
make test-db       # tout, y compris PostgreSQL
make typecheck     # annotations du cœur applicatif
```

**Reality check, chiffres mesurés sur ce dépôt :** `make test` sans
`PROTAB_TEST_DATABASE_URL` affiche `254 passed, 90 skipped`. C'est le piège
principal : **un quart de la suite n'a pas tourné**, et un « tout est vert »
local n'est pas une preuve de non-régression des adaptateurs. Seuls
`make test-db` et le compte `344 tests collected` distinguent les deux cas.

---

## 2. Tests unitaires — `tests/unit/`

Aucun `conftest.py` : le découpage repose sur les répertoires et sur des
helpers explicites. Chaque module déclare ses propres doublures.

### Domaine — `tests/unit/domain/`

| Fichier | Objet |
| --- | --- |
| `daily_activity_test.py` (39) | Mise à jour, contraintes et canonicalisation de `feai`, statut (`apply_status`), motif KO refusé hors KO, constructeur lenient |
| `day_status_test.py` (4) | Les trois états, et une valeur illisible relue comme `pending` |
| `official_code_test.py` (14) | Forme scalaire du quadrigramme : longueur, `/` refusé |
| `non_working_days_test.py` (19) | Calendrier ouvré : défaut, bornes ISO, relecture lenient, défaut non partagé, liste corrompue ramenée au défaut |
| `scope_monitoring_test.py` (28) | Accès à une activité par jour, agrégat, note libre (`set_note`, borne, relecture) |
| `audit_event_test.py` (5) | `build_changes` ne conserve que les champs modifiés |
| `exceptions_test.py` (1) | Hiérarchie des exceptions métier |

Ces tests s'exécutent sans aucune dépendance. Ils constituent la garantie la
plus solide du dépôt, et la seule qui reste valable si l'infrastructure change.

### Application — `tests/unit/application/`

Six fichiers de tests de cas d'usage (`create_scope_monitoring_test.py`,
`create_daily_activity_test.py`, `update_daily_activity_test.py`,
`set_activities_status_test.py`, `update_scope_note_test.py`,
`queries_test.py`) plus `audit_trail_test.py`. Ils utilisent
`InMemoryScopeMonitoringRepository` et un adaptateur d'audit mémoire.

`set_activities_status_test.py` verrouille l'asymétrie du domaine : un KO crée
la journée à compteurs nuls, `completed` sur un jour absent refuse **sans écrire**,
et l'audit porte la transition complète (`activity_ko` couvre le marquage *et*
le démarquage, qu'il faut pouvoir distinguer).

`update_scope_note_test.py` verrouille deux points qu'un adaptateur mémoire ne
peut pas montrer seul : l'écriture **ciblée** (`update_note`, pas `save` — d'où
le décorateur ci-dessous) et l'absence d'audit quand la note est inchangée.

**`tests/unit/application/recording_repository.py` n'est pas un test** : c'est
un décorateur qui enregistre les appels reçus au port, et il mérite qu'on
comprenne pourquoi il existe. Son propre docstring (`recording_repository.py:1-9`)
donne la raison : l'adaptateur en mémoire **rend les objets qu'il stocke**, donc
muter l'agrégat en place et le réécrire intégralement sont indiscernables de
l'extérieur. Observer *quelle* écriture le cas d'usage choisit est le seul moyen
de prouver qu'une mise à jour d'activité ne réécrit pas un périmètre entier.

### Adaptateurs — `tests/unit/adapters/`

Sept modules qui testent de la logique d'adaptateur **sans base** :
`api_config_test.py` (14 : résolution hôte/port, `Secure`), `official_codes_test.py`
(5 : parseur de la liste séparée par `/`), `postgres_auth_bootstrap_test.py`
(8 : résolution fail-closed des secrets d'amorçage), `postgres_pool_test.py` (1),
`project_context_guard_test.py` (2 : le contexte projet ne doit jamais être un
repli), `scope_monitoring_repository_save_test.py` (4 : l'adapter mémoire doit
refuser ce que le SQL refuse, avec les mêmes exceptions) et
`audit_trail_filter_test.py` (10 : les deux adaptateurs d'audit doivent
sélectionner les mêmes événements).

Ce dernier est **la spécification** de `AuditEventQuery`, pas une
réimplémentation : il s'exécute sans base, et
`postgres_audit_trail_repository_test.py` en est le miroir SQL. Y figurent les
trois pièges qu'un filtre peut endurer sans base — le préfixe acteur insensible
à la casse, la fenêtre semi-ouverte, et l'événement `day IS NULL` qu'une période
ne doit pas perdre.

Un huitième module de logique d'adaptateur vit à côté, sans base lui non plus :
`tests/unit/project_admin_cli_test.py` (9 : validation d'arguments de la CLI,
pas d'accès base).

Ces tests sont trompeurs s'ils sont lus comme des tests d'intégration : voir §5.

### Ports — `tests/unit/ports/`

Un module, `scope_monitoring_repository_contract_test.py` (7 tests), qui compare
par réflexion les méthodes publiques du `Protocol` `ScopeMonitoringRepository`
à celles de ses **trois** implémentations — les deux adapters et le décorateur
`recording_repository.py` — puis l'ordre de leurs paramètres. Les classes sont
introspectées sans être instanciées : le pool PostgreSQL exigerait un DSN et la
garantie n'a rien à voir avec des données.

L'assertion est une **inclusion**, jamais une égalité : l'adapter PostgreSQL
possède `connect`/`close` qui n'appartiennent à aucun port.

Ce test est le filet que `mypy` ne peut pas être. `mypy` vérifie l'adapter de
production au point d'injection (`create_app(repository=...)`), mais ses
`files` ne couvrent que `src/protab` : l'adapter in-memory et le décorateur de
test lui sont invisibles. Un port qui gagne une méthode, oubliée dans l'un de ces
deux, ne serait rouge nulle part.

**Le vérifier en le cassant** : renommer une méthode d'un adapter doit faire
passer le test au rouge, sinon il ne prouve rien.

---

## 3. Tests d'intégration — `tests/integration/adapters/`

### Contre PostgreSQL réel

Quatre fichiers, tous ignorés sans `PROTAB_TEST_DATABASE_URL` via un
`pytestmark = pytest.mark.skipif(...)` au niveau du module :

| Fichier | Volume | Objet |
| --- | --- | --- |
| `postgres_scope_monitoring_repository_test.py` | 41 | Persistance de l'agrégat, **refus de `save()` sur un périmètre existant**, écritures ciblées (dont `update_note`), `set_activities_status` et son upsert, **migration `handled`/`completed` → `status`**, traduction des violations de contrainte, isolation par projet |
| `postgres_auth_repository_test.py` | 33 | Authentification, sessions, administrateurs, rotation de mot de passe, jours non ouvrés |
| `project_admin_test.py` | 19 | La CLI `protab-project` contre la vraie base (en patchant `getpass` et `sys.argv`) |
| `postgres_audit_trail_repository_test.py` | 5 | Écriture et lecture du journal d'audit, matrice de filtrage mirroring `audit_trail_filter_test.py`, **événement sans journée métier conservé par une période** |

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
| `api_test.py` | 36 | Routes métier avec un adaptateur en mémoire injecté, canonicalisation FEAI, note du périmètre |
| `auth_api_test.py` | 11 | Login, session, cookie `Secure`, expiration du cookie alignée sur la session |
| `audit_log_api_test.py` | 7 | Journal d'audit, `limit`, et les trois défauts du filtre : `actor` en préfixe insensible à la casse, `scope_id` répété, période `[from, to)` qui **conserve** un événement `day IS NULL` |
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
saisie d'une activité journalière, clôture, via `TestClient` et un adaptateur en
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
port et ne l'implémenter que dans `InMemoryScopeMonitoringRepository` laisserait
l'échec invisible jusqu'à l'exécution en production. Ce risque est maintenant
couvert par deux filets : `mypy` (`make typecheck`) vérifie l'adapter de
production au point d'injection, et `tests/unit/ports/scope_monitoring_repository_contract_test.py`
compare les trois implémentations par réflexion. **Aucun des deux ne remplace
l'autre** : mypy ne voit pas le code de test, le test de contrat ne vérifie pas
les types. Voir §2 Ports.

**Un test « passe » n'est pas un test « exécuté ».** Voir §1.

---

## 6. Tests frontend

```bash
cd src/FrontEnd
npm test            # vitest run
npm run lint        # tsc --noEmit — contrôle de types, pas de style
```

Vingt-sept fichiers dans `src/FrontEnd/src/test/`, plus `src/test/factories.ts`
qui n'en est pas un. `src/test/setup.ts` importe
`@testing-library/jest-dom/vitest` et allonge `asyncUtilTimeout` — une seconde,
le délai par défaut, ne suffit pas quand la suite crée un jsdom par fichier et
attend deux réponses d'API. En revanche ni `ResizeObserver` ni dimensions ne sont
mockés.

**Une seule fabrique de données de test.** `makeScope`, `makeActivity` et
`makeScopes` (`src/test/factories.ts`) portent la forme d'une réponse de l'API ;
les helpers locaux restants (`scope(id, name, days)` dans `kpi.test.ts`,
`analytics.test.ts`, `export.test.ts`, `DashboardCharts.test.tsx`,
`ExportModal.test.tsx`, `AnalyticsFilterBar.test.tsx`, `search.test.ts`)
délèguent à `makeScope` et ne redéclarent aucun défaut. La mesure qui justifie
le découpage : ajouter `note` au contrat TypeScript avait produit **40 erreurs**
de `tsc`, dont 35 dans `ScopeListPage.test.tsx` — une par littéral. Rendre le
champ optionnel aurait supprimé les erreurs au prix d'un `undefined` que l'API
n'a jamais renvoyé. Les défauts de la factory sont donc réalistes
(`billing_code: 'FACT-2026-PAI'`, `note: null`) : une fixture ne doit pas pouvoir
mentir sur la forme d'une réponse, et un test qui asserte sur un officiel doit
surcharger le champ explicitement.

`makeAuditEvent` suit la même règle : `actor: 'ABCD'` en majuscules comme la
colonne qui le stocke, `scope_name` renseigné, `changes` non vide.

Les tests se répartissent entre logique pure (`kpi.test.ts`, `export.test.ts`,
`validation.test.ts`, `knowledgeBase.test.ts`, `auditStats.test.ts`,
`analytics.test.ts`, `nonWorkingDays.test.ts`, `search.test.ts`),
sérialisation de requête (`auditLogQuery.test.ts`), bornes de journée locale
(`auditDateBounds.test.ts`) et invariant de rognage (`overflowGuard.ts`, appelé dans
`AuditLogFilterBar.test.tsx` et `AnalyticsFilterBar.test.tsx`), et composants (`ScopeListPage`,
`TodayActivityEditor`, `AuditLogPage`, `AuditLogFilterBar`, `FeaiTagInput`,
`ActivityFormModal`, `ScopeNoteCard`, `ExportModal`, `DateNavigator`,
`LoginBackground`, `AppSessionLoss`, `DashboardCharts`, `ScopeDetailCharts`,
`AuditActivityHeatmap`, `AuditShortcut`, `apiUnauthorized`, `AnalyticsPage`,
`AnalyticsFilterBar`, `ScopePicker`, `PageNav`, `PageShortcuts`).

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
| L'égalité entre un port et ses implémentations | `tests/unit/ports/` | `scope_monitoring_repository_contract_test.py`, ou une méthode de plus |
| Une annotation du cœur applicatif | le code lui-même | `make typecheck` : un paramètre ou un retour manquant échoue |
| Une donnée de test front | `src/FrontEnd/src/test/` | `makeScope` / `makeActivity`, jamais un littéral complet |
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
