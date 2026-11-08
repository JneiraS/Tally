# Authentification et autorisations

> **Documentation humaine, non normative.** En cas de divergence, le code et
> `AGENTS.md` font foi. Ce document décrit `adapters/inbound/api/auth.py`,
> `adapters/inbound/api/app.py` et `adapters/outbound/persistence/postgres_auth_repository.py`.

Tally distingue deux identités :

- le **projet** (le tenant), protégé par un mot de passe partagé ;
- le **quadrigramme** (la personne), qui doit être reconnu par le projet.

Une session réussie porte les deux. Le projet décide de ce qui est visible ; le
quadrigramme décide de qui agit, et signe le journal d'audit.

---

## 1. La connexion

`POST /auth/login` reçoit :

```json
{
  "project_id": "protab",
  "quadrigramme": "MLOZ",
  "password": "mot-de-passe-du-projet"
}
```

La vérification se fait en deux temps :

1. **le mot de passe du projet** est comparé au hash `scrypt` stocké dans
   `projects.password_hash` ;
2. **le quadrigramme** est accepté s'il figure dans `project_admins` **ou**
   dans un `official_main` / `official_backup` d'un périmètre du projet.

L'union est volontaire : nommer un administrateur ne retire aucun droit aux
responsables déjà déclarés dans les périmètres.

Un échec renvoie `401` avec un message unique — « Projet, quadrigramme ou mot de
passe invalide » — qui ne distingue pas les trois causes.

### La fenêtre de bootstrap

Tant qu'un projet n'a **aucun périmètre**, `authenticate()` accepte n'importe quel
quadrigramme dont le mot de passe de projet est correct. C'est ce qui permet de
créer le premier périmètre sans avoir à déclarer d'avance un responsable.

Cette fenêtre se referme définitivement dès le premier périmètre enregistré. À
partir de là, un quadrigramme doit être dans `project_admins` ou dans un
périmètre. Sans administrateur nommé, la personne qui crée le premier périmètre
perd son accès : c'est pourquoi `PROTAB_DEFAULT_PROJECT_ADMIN_CODE` est
obligatoire au premier démarrage.

### Le quadrigramme n'est pas validé au login

Le schéma accepte une chaîne de 2 à 20 caractères. Le login ne resserre pas ce
format : un projet sans périmètre doit pouvoir accepter n'importe quelle saisie
pour amorcer le premier périmètre. Une contrainte stricte risquerait de
verrouiller des saisies manuelles déjà en base.

En revanche, la CLI qui nomme un administrateur utilise `OfficialCode`, plus
strict (voir §5).

---

## 2. La session

`create_session()` produit un jeton opaque (`secrets.token_urlsafe(32)`) et
stocke **son hash SHA-256** dans `auth_sessions.token_hash`. Le jeton en clair
n'existe que dans le cookie du navigateur.

| Propriété | Valeur |
| --- | --- |
| Cookie | `protab_session` |
| `HttpOnly` | oui |
| `SameSite` | `Lax` |
| `Secure` | seulement si `PROTAB_COOKIE_SECURE` est actif |
| Durée | `SESSION_DURATION = 12 heures` |
| `Max-Age` | dérivé de `SESSION_DURATION`, jamais redéclaré |

La session est valide tant que `expires_at > NOW()`. `find_session()` vérifie
cette condition à chaque requête protégée.

### `401` signifie « session perdue »

Dans le frontend, un `401` global ramène à la page de connexion : c'est une
session absente, expirée ou révoquée, pas une panne réseau. L'exception est
`POST /auth/login`, où un `401` signifie « mot de passe erroné » et doit rester
une erreur de formulaire.

### Déconnexion

`POST /auth/logout` supprime la ligne `auth_sessions` si le jeton existe, puis
efface le cookie. La route répond `204` même sans session : un utilisateur sans
cookie doit pouvoir nettoyer son navigateur.

---

## 3. Qui peut se connecter

| Source | Portée |
| --- | --- |
| `project_admins` | accès permanent au projet, quel que soit le contenu des périmètres |
| `official_main` d'un périmètre | responsable principal |
| `official_backup` d'un périmètre | responsable suppléant |
| fenêtre de bootstrap | n'importe quel quadrigramme, tant qu'aucun périmètre n'existe |

Les deux colonnes `officials` sont des **listes** de codes séparés par `/`. Le
parseur commun ignore la casse, les espaces et toute partie sans caractère
alphanumérique : le `?` des données réelles signifie « pas de suppléant » et
n'est jamais un code utilisable.

Le statut est **strictement par projet**. `GET /projects` est public, mais
`authenticate()` filtre sur le `project_id` demandé : un administrateur d'un
projet n'ouvre aucun autre tenant.

---

## 4. Isolation multi-tenant

Le projet de la session est posé dans un `ContextVar` par la dépendance
`project_context`, puis lu par les adaptateurs PostgreSQL. Aucun repli sur un
projet par défaut : sans contexte, l'adaptateur lève
`MissingProjectContextError` plutôt que de lire tous les tenants.

Conséquences :

- toute route métier doit dépendre de `project_context` ;
- `tests/integration/adapters/route_authorization_test.py` vérifie que seules
  les routes de `PUBLIC_ROUTES` peuvent être non authentifiées ;
- une ressource d'un autre projet est **introuvable** (`404`), jamais
  « interdite » (`403`), pour ne pas servir de détecteur d'identifiants.

Le mécanisme complet est décrit dans [`architecture.md`](architecture.md).

---

## 5. Les administrateurs de projet

`project_admins` contient une ligne par administrateur :

```text
project_id, code, created_at
PRIMARY KEY (project_id, code)
FOREIGN KEY project_id → projects(id) ON DELETE CASCADE
```

La cascade est nécessaire : sans elle, un code de projet recyclé hériterait des
administrateurs du tenant précédent.

### Ce qu'un administrateur peut faire

Un administrateur obtient un **accès permanent**, pas un rôle applicatif :

- il se connecte même s'il n'est dans aucun périmètre ;
- une fois connecté, il a exactement les mêmes droits qu'un responsable ;
- il peut, en plus, modifier les **responsables** d'un périmètre
  (`PATCH /scope-monitorings/{id}/officials`).

Il n'existe ni écran de gestion des administrateurs, ni drapeau d'administration
en session. `is_admin` est recalculé en base à chaque `POST /auth/login` et
`GET /auth/me`, jamais mémorisé dans `auth_sessions` : un rôle mémorisé resterait
périmé pendant les 12 heures de la session.

### Gestion par la CLI

```bash
uv run protab-project add-admin <projet> <quadrigramme>
uv run protab-project remove-admin <projet> <quadrigramme>
uv run protab-project list-admins <projet>
```

`remove-admin` supprime aussi les sessions du quadrigramme dans la même
transaction. Sans cela, un administrateur révoqué resterait utilisable jusqu'à
l'expiration de sa session. La commande refuse de retirer le **dernier**
administrateur : le message indique la requête SQL de contournement.

`OfficialCode` borne un code administrateur à 2–20 caractères, refuse `/` et
exige un caractère alphanumérique. Un code que l'écran de connexion refuserait
serait un verrouillage déguisé en autorisation.

La référence complète de la CLI est [`cli.md`](cli.md).

---

## 6. Rotation du mot de passe et révocation

`protab-project set-password <projet>` remplace le hash **et supprime toutes les
sessions du projet**. Cette révocation n'est pas cosmétique : c'est le geste
correct quand un mot de passe a été divulgué.

Le mot de passe est saisi par `getpass`, jamais passé en argument de commande.

Le hachage utilise `scrypt` avec `N=2^14`, `r=8`, `p=1`. Les paramètres sont
partagés entre le calcul et la vérification : un écart entre les deux listes
ferait échouer tous les mots de passe existants sans lever d'erreur.

---

## 7. Secrets et démarrage fail-closed

Deux variables sont obligatoires **au premier démarrage seulement** :

| Variable | Rôle |
| --- | --- |
| `PROTAB_DEFAULT_PROJECT_PASSWORD` | mot de passe du projet initial |
| `PROTAB_DEFAULT_PROJECT_ADMIN_CODE` | administrateur du projet initial |

Elles sont lues par `resolve_bootstrap_password()` et
`resolve_bootstrap_admin_code()`, uniquement lorsque le projet initial est
absent. Aucune valeur par défaut devinable n'est fournie : l'absence lève une
`RuntimeError` explicite au lieu de créer un projet accessible à quiconque
connaît son code — et `GET /projects` rend ce code public.

Le mot de passe est résolu **avant** le code administrateur, pour que l'erreur
signale le premier manque sans ambiguïté.

Une installation déjà initialisée redémarre sans ces variables : exiger le
secret à chaque `connect()` casserait tout redémarrage pour une valeur qui ne
sera jamais utilisée.

`docker-compose.yml` transmet les deux variables sans garde (`${…:-}`) :
l'application est l'unique point d'application de la règle, Compose ne la rejoue
pas.

---

## 8. Déploiement

- En développement HTTP local, `PROTAB_COOKIE_SECURE=0` est acceptable.
- En production, TLS doit être terminé par un reverse proxy et
  `PROTAB_COOKIE_SECURE=1` doit être positionné. Les valeurs truthy acceptées
  sont `1`, `true`, `yes`, `on` (insensible à la casse et aux espaces).
- En Docker Compose, l'API n'est publiée que sur `127.0.0.1` : le cookie de
  session ne doit pas circuler en clair sur le réseau local.

Sans `Secure`, le jeton de session est envoyé en clair ; le cookie `HttpOnly`
protège seulement contre la lecture par JavaScript, pas contre l'interception
réseau.

---

## 9. Mode dégradé sans authentification

Quand `create_app()` est appelé sans `auth_repository` et sans repository
PostgreSQL, `auth` vaut `None` :

- `project_context` laisse passer la requête ;
- les routes métier restent utilisables, comme le reste de ce mode ;
- `GET /project/settings` et `PUT /project/settings` répondent `401` ;
- l'édition des responsables est permise, faute de porte d'administration ;
- `GET /projects` renvoie une liste vide ;
- le journal d'audit fonctionne, avec un acteur `None`.

Ce mode sert aux tests et au développement. Il n'est pas une configuration de
production : `build_repository()` refuse de démarrer sans `DATABASE_URL`.

---

## 10. Documents voisins

- [`api.md`](api.md) — routes, schémas et codes d'erreur ;
- [`cli.md`](cli.md) — création de projet, rotation, administrateurs ;
- [`database.md`](database.md) — tables `projects`, `auth_sessions`,
  `project_admins` ;
- [`architecture.md`](architecture.md) — contexte projet et ports ;
- [`frontend.md`](frontend.md) — traitement du `401` côté client.
