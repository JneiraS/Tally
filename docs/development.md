# Développement

> **Documentation humaine, non normative.** Ce document facilite la maintenance.
> En cas de divergence, **le code et `AGENTS.md` font foi**. Aucune règle ne doit
> être appliquée sur la seule foi de ce document. Les exigences de qualité et de
> workflow sont définies dans `AGENTS.md` (§19, §25) ; ici on décrit ce que le
> dépôt offre réellement.

Ce document couvre l'installation, la configuration, l'exécution et les
contraintes du quotidien. Pour le fonctionnement interne du code, voir
[`docs/architecture.md`](architecture.md).

---

## 1. Prérequis

| Outil | Version | Rôle |
| --- | --- | --- |
| Python | **3.13** (`.python-version`, `requires-python >=3.13`) | API, tests |
| [uv](https://docs.astral.sh/uv/) | récent | Environnement, dépendances, exécution |
| Node.js + npm | supporté par Vite 8 | Frontend |
| Docker + Compose | — | Base de données locale, stack complète |

Aucune de ces versions n'est verrouillée par un gestionnaire au-delà de
`.python-version` et des `engines` absents de `package.json` : en cas de
problème d'installation, la référence est la version déclarée ci-dessus.

---

## 2. Installation

```bash
cp .env.example .env      # puis compléter les secrets, cf. §3
make install              # uv sync, crée .venv
cd src/FrontEnd && npm ci && cd -
```

`make install` est un simple `uv sync` (`Makefile:12-13`). Côté front, les
dépendances sont **résolues depuis `package-lock.json` avec `npm ci`** :
`node_modules` n'est jamais versionné (`.gitignore`).

---

## 3. Configuration

Toutes les variables sont lues par `load_dotenv()` puis `os.getenv`
(`adapters/inbound/api/config.py:5`). Le fichier `.env` n'est pas versionné ;
`.env.example` ne contient que des valeurs de développement.

| Variable | Obligatoire | Défaut | Effet |
| --- | --- | --- | --- |
| `DATABASE_URL` | **oui** | — | DSN PostgreSQL. Son absence fait échouer le démarrage de l'API (`app.py:143-148`). |
| `PROTAB_HOST` | non | `0.0.0.0` | Interface d'écoute (`config.py:7`). |
| `PROTAB_PORT` | non | `8000` | Port d'écoute ; une valeur non entière lève `InvalidPortError` (`config.py:25-28`). |
| `PROTAB_COOKIE_SECURE` | non | `0` | Attribut `Secure` du cookie de session. `1`, `true`, `yes`, `on` l'activent. |
| `PROTAB_TEST_DATABASE_URL` | non | — | Base des tests d'intégration ; **leur absence fait ignorer (`skip`) une partie des tests**. |
| `PROTAB_DEFAULT_PROJECT_CODE` | non | `protab` | Identifiant du projet amorcé. |
| `PROTAB_DEFAULT_PROJECT_NAME` | non | `Projet principal` | Nom affiché du projet amorcé. |
| `PROTAB_DEFAULT_PROJECT_PASSWORD` | **au 1er démarrage** | — | Mot de passe du projet amorcé. |
| `PROTAB_DEFAULT_PROJECT_ADMIN_CODE` | **au 1er démarrage** | — | Quadrigramme administrateur du projet amorcé. |

Les deux dernières variables ne sont lues **que si la ligne du projet amorcé est
absente** (`postgres_auth_repository.py:209-231`). Exiger le secret à chaque
démarrage casserait le redémarrage d'une installation déjà initialisée ; c'est
un choix délibéré, décrit en `AGENTS.md` §28.2. Il est donc normal de les
supprimer d'un `.env` de production une fois le premier démarrage passé.

La règle de conception à retenir : **aucun secret devinable n'a de valeur par
défaut**. Un secret manquant là où il sert provoque une `RuntimeError` ou un
`SystemExit` explicite, jamais un repli silencieux. Voir `AGENTS.md` §28.2 et
§28.3 bis.

---

## 4. Démarrage en développement

Trois terminaux, ou les commandes équivalentes :

```bash
make db-up        # PostgreSQL local (docker compose service db)
make run          # API sur PROTAB_HOST:PROTAB_PORT
make frontend     # Vite sur le port 5173
make help         # liste les cibles disponibles
```

`make run` exécute `uv run protab`, c'est-à-dire `protab:main`
(`src/protab/__init__.py`), qui instancie l'application via
`create_default_app()` et la confie à uvicorn.

Le premier démarrage crée le projet amorcé, son mot de passe et son
administrateur. Voir §7 pour la suite.

---

## 5. Base de données : pas d'outil de migration

C'est le point qui surprend le plus un nouveau contributeur : **il n'existe pas
de migration versionnée**. Le schéma est appliqué de façon idempotente à chaque
`connect()` — `CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN IF NOT
EXISTS`, et un ajout de contrainte sous `DO $$ ... $$`
(`postgres_scope_monitoring_repository.py:164-193`,
`postgres_auth_repository.py:171-208`).

Conséquences concrètes :

- **Ajouter une colonne** = ajouter une instruction `ADD COLUMN IF NOT EXISTS`
  dans `_apply_schema`. La table préexistante est alors conservée, et les
  installations existantes se mettent à niveau au prochain démarrage.
- **Modifier une contrainte** demande une attention particulière : `IF NOT
  EXISTS` n'existe pas pour les contraintes dans cette forme, d'où le bloc
  `DO $$` qui teste `pg_constraint` avant d'ajouter la clé étrangère.
- **Réparer des données à la main** doit rester compatible avec ce que le code
  fera au démarrage : `UPDATE scope_monitorings SET project_id = 'protab' ...`
  (`postgres_scope_monitoring_repository.py:170-172`) est precisely le genre de
  migration « fait main » qui existe déjà.
- Aucun outil tiers (Alembic…) n'est dans les dépendances ; en ajouter un
  serait un changement d'architecture, pas un simple raffinement.

Commandes utiles :

```bash
make db-shell    # psql sur la base de développement
make db-down     # arrête la stack
make test-db     # crée protab_test si besoin, puis lance les tests d'intégration
```

---

## 6. Tests

Commandes :

```bash
make test          # uv run pytest
make test-v        # -vv -s (montre les print)
make test-failed   # --lf
make test-db       # tests d'intégration PostgreSQL inclus
cd src/FrontEnd && npm test    # vitest run
cd src/FrontEnd && npm run lint  # tsc --noEmit
```

La stratégie, l'inventaire des suites et les tests conditionnés à une base sont
détaillés dans [`docs/testing.md`](testing.md).

---

## 7. Administration d'hôte

La gestion des projets (création, mot de passe, administrateurs) passe par la
CLI `protab-project`, installée comme point d'entrée
(`pyproject.toml:20`).

```bash
uv run protab-project <code> <nom> [--admin QUADRIGRAMME]
uv run protab-project set-password <code>
uv run protab-project add-admin <code> <quadrigramme>
uv run protab-project remove-admin <code> <quadrigramme>
uv run protab-project list-admins <code>

make project-admin ARGS="list-admins protab"   # dans le conteneur API
```

`make project-admin` est un relais vers `docker compose exec api` **sans `-T`**,
car `getpass` exige un terminal. Il ne dépend pas de `docker-up` : la stack doit
simplement être démarrée.

L'inventaire complet, les messages d'erreur et le dépannage d'un projet
verrouillé sont dans [`docs/cli.md`](cli.md), qui est la référence de cette CLI.

---

## 8. Docker

La topologie (services, ports publiés, healthchecks, construction des images,
blocs nginx de `nginx.conf`) est décrite dans
[`docs/docker-architecture.md`](docker-architecture.md). En résumé :

```bash
make docker-up     # build + db + api + frontend
make docker-down
```

L'API n'est publiée que sur la boucle locale ; TLS doit être terminé par le
reverse proxy, auquel cas `PROTAB_COOKIE_SECURE` doit valoir `1`.

---

## 9. Qualité : ce que le dépôt fait — et ce qu'il ne fait pas

Cette section est volontairement honnête sur les lacunes, parce qu'un mainteneur
doit savoir ce qu'il **ne** sera pas rattrapé automatiquement.

| Vérification | État | Commentaire |
| --- | --- | --- |
| Tests Python | ✅ `pytest` | Voir `docs/testing.md`. |
| Tests front | ✅ `vitest` | 116 tests. |
| Typage front | ✅ `npm run lint` | `tsc --noEmit` — vérifie les types, pas le style. |
| Build front | ✅ `npm run build` | `tsc -b && vite build`. |
| Linter Python | ❌ **absent** | Aucun `ruff`, `flake8` ou `pylint` ; le groupe `dev` ne contient que `pytest` et `httpx2` (`pyproject.toml:26-30`). |
| Typage Python | ❌ **absent** | Aucun `mypy`/`pyright` ; le code est annoté mais non vérifié automatiquement. |
| Formatage auto | ❌ **absent** | Ni `black` ni `ruff format`. Le style est appliqué à la main. |
| Linter front | ❌ **absent** | Ni ESLint ni Prettier. `npm run lint` est un contrôle de types. |
| Intégration continue | ❌ **absent** | Aucun workflow CI dans le dépôt. |
| Pré-commit | ❌ **absent** | Aucun hook. |

Conséquences à intégrer dans votre pratique :

- **Rien ne s'exécute tout seul.** La vérification avant commit est manuelle :
  `make test` et `npm test`, plus `npm run lint` si le front est touché.
- **Une régression peut être fusionnée sans être signalée.** L'absence de CI
  n'est pas une invitation : c'est une raison de lire le diff attentivement et
  de ne pas supposer qu'un test a été exécuté par un tiers.
- **Le typage Python n'est pas vérifié.** Les annotations sont présentes et
  utiles à la lecture, mais une annotation fausse ne sera pas détectée ; le
  runtime reste la seule autorité.
- `pyproject.toml:4` porte encore le `description` par défaut de l'outil de
  build. Sans effet sur le fonctionnement, mais visible à la publication du
  paquet.

Si l'équipe souhaite combler l'une de ces lacunes, c'est un choix d'outillage :
il appartient à `AGENTS.md` (§22 impose de le mettre à jour en même temps).

---

## 10. Publier une modification — liste de contrôle

1. Écrire ou adapter le test **avant** le code (TDD, `AGENTS.md` §9).
2. `make test` — la suite complète, pas seulement le fichier touché.
3. `cd src/FrontEnd && npm test` si le front est concerné.
4. `cd src/FrontEnd && npm run lint` si du TypeScript a été touché.
5. Vérifier les points d'architecture : pas de dépendance infrastructure
   introduite dans `domain/` ou `application/`, ports respectés
   (`AGENTS.md` §2, §4).
6. Si un adaptateur a changé, vérifier le test d'intégration correspondant —
   et **les deux** adaptateurs du port s'il y en a deux (§28.1).
7. Si une route a été ajoutée, penser à `PUBLIC_ROUTES` dans
   `tests/integration/adapters/route_authorization_test.py`.
8. Si le schéma a changé, vérifier la compatibilité de `_apply_schema` avec
   les installations existantes (§5 ci-dessus).
9. Documentation : `README.md` si c'est visible de l'utilisateur,
   `docs/cli.md` pour la CLI, `docs/docker-architecture.md` pour Compose, et
   `AGENTS.md` si une règle du dépôt a bougé.

---

## 11. Problèmes fréquents

| Symptôme | Cause probable | Où regarder |
| --- | --- | --- |
| `DATABASE_URL est obligatoire` au démarrage | `.env` absent ou DSN mal orthographié | `app.py:143-148` |
| `RuntimeError` sur le mot de passe du projet | premier démarrage sans `PROTAB_DEFAULT_PROJECT_PASSWORD` | `postgres_auth_repository.py:85-105`, `AGENTS.md` §28.2 |
| `Contexte projet absent` | requête SQL hors du flux authentifié (script, tâche de fond, test) | `require_current_project()`, `AGENTS.md` §28.1 |
| Les tests d'intégration sont ignorés | `PROTAB_TEST_DATABASE_URL` absente | `.env.example:35-37` |
| Un `PATCH` sans effet visible alors qu'il renvoie 200 | aucun champ n'a changé : aucun événement d'audit n'est écrit | `update_daily_activity.py:54-55` |
| Le mot de passe semble ignoré par `make project-admin` | `-T` retiré par erreur : `getpass` ne peut pas lire | `Makefile:60-65` |
| Un projet semble verrouillé | aucun administrateur et aucun périmètre déclarant le quadrigramme | `docs/cli.md` |

---

## 12. Documents voisins

- [`docs/architecture.md`](architecture.md) — couches, ports, modèle de données.
- [`docs/testing.md`](testing.md) — stratégie et suites de tests.
- [`docs/frontend.md`](frontend.md) — application React.
- [`docs/cli.md`](cli.md) — référence de `protab-project`.
- [`docs/docker-architecture.md`](docker-architecture.md) — topologie Docker.
- `AGENTS.md` — règles normatives du dépôt.
