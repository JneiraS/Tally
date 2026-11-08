# API REST

> **Documentation humaine, non normative.** En cas de divergence, le code et
> `AGENTS.md` font foi. Ce document décrit les routes telles qu'elles sont
> déclarées dans `src/protab/adapters/inbound/api/app.py` et `schemas.py`.

L'API est servie par FastAPI. En développement, la documentation interactive est
disponible sur `http://localhost:8000/docs` et le schéma OpenAPI sur
`/openapi.json`.

---

## 1. Conventions

- Toutes les routes répondent en JSON, sauf l'import CSV qui reçoit un fichier
  `multipart/form-data`.
- Les dates sont au format ISO `AAAA-MM-JJ`.
- Les horodatages sont des `datetime` ISO 8601 avec fuseau.
- L'authentification utilise un **cookie de session** `protab_session`, jamais un
  en-tête `Authorization`.
- Les chemins d'API sont déclarés une seule fois côté frontend dans
  `src/FrontEnd/src/constants/routes.ts` lorsqu'ils sont partagés avec la SPA.

### Routes publiques et routes protégées

La plupart des routes sont protégées par la dépendance `project_context`, qui
vérifie la session et pose le projet courant. Une route qui oublie cette
dépendance est réellement publique : `tests/integration/adapters/route_authorization_test.py`
vérifie que seules les routes de `PUBLIC_ROUTES` peuvent l'être.

| Route | Accès |
| --- | --- |
| `GET /healthz` | public |
| `GET /projects` | public — alimente l'écran de connexion |
| `POST /auth/login` | public |
| `GET /auth/me`, `POST /auth/logout` | gèrent eux-mêmes l'absence de session |
| `/docs`, `/openapi.json`, `/redoc` | public |
| Toutes les autres routes | session obligatoire |

`/auth/me` et `/auth/logout` sont dans la liste publique parce qu'ils doivent
pouvoir répondre proprement sans session : `me` renvoie `401`, `logout` efface le
cookie. Ce ne sont pas des routes ouvertes.

---

## 2. Inventaire des routes

| Méthode | Chemin | Rôle | Succès |
| --- | --- | --- | --- |
| `GET` | `/healthz` | sonde de disponibilité | `200` `{"status":"ok"}` |
| `GET` | `/projects` | liste des projets | `200` `ProjectResponse[]` |
| `POST` | `/auth/login` | ouvre une session, pose le cookie | `200` `LoginResponse` |
| `GET` | `/auth/me` | session courante | `200` `SessionResponse` |
| `POST` | `/auth/logout` | supprime la session et le cookie | `204` |
| `GET` | `/project/settings` | calendrier ouvré du projet | `200` `ProjectResponse` |
| `PUT` | `/project/settings` | remplace le calendrier ouvré | `200` `ProjectResponse` |
| `GET` | `/scope-monitorings` | liste les périmètres du projet | `200` `ScopeResponse[]` |
| `POST` | `/scope-monitorings` | crée un ou plusieurs périmètres | `201` `{"ids": [...]}` |
| `POST` | `/scope-monitorings/import-csv` | import CSV | `201` `{"ids": [...]}` |
| `GET` | `/scope-monitorings/{scope_id}` | détail d'un périmètre | `200` `ScopeResponse` |
| `PATCH` | `/scope-monitorings/{scope_id}` | modifie la note | `204` |
| `PATCH` | `/scope-monitorings/{scope_id}/officials` | modifie les responsables | `204` |
| `PATCH` | `/scope-monitorings/{scope_id}/schedule` | modifie la périodicité | `204` |
| `POST` | `/scope-monitorings/{scope_id}/activities` | crée une activité | `201` |
| `GET` | `/scope-monitorings/{scope_id}/activities/{day}` | activité d'un jour | `200` `ActivityResponse` |
| `PATCH` | `/scope-monitorings/{scope_id}/activities/{day}` | modifie les compteurs | `204` |
| `PATCH` | `/scope-monitorings/{scope_id}/activities/status` | statut d'un lot de jours | `204` |
| `GET` | `/api/audit-log` | journal d'audit filtré | `200` `AuditEventResponse[]` |

Il n'existe **aucune route de suppression** de périmètre ou d'activité, et aucune
route de modification du nom ou du code de facturation.

---

## 3. Schémas

### Projet et session

```json
{
  "id": "protab",
  "name": "Projet principal",
  "non_working_days": {
    "excluded_weekdays": [6, 7],
    "excluded_dates": ["2026-05-01"]
  }
}
```

```json
{
  "project": { "...": "ProjectResponse" },
  "quadrigramme": "MLOZ",
  "is_admin": true
}
```

`LoginResponse` et `SessionResponse` ont la même forme. `is_admin` est relu en
base à chaque appel : il ne provient pas d'un rôle mémorisé en session.

### Périmètre

```json
{
  "id": "3f1c…",
  "name": "Support niveau 1",
  "knowledge_base_id": "KB-SUPPORT-01",
  "official_main": "MLOZ/JMAB",
  "official_backup": "?",
  "billing_code": "FACT-2026-PAI",
  "note": "Pic de charge le lundi.",
  "schedule": {
    "weekdays": [1, 2, 3, 4, 5],
    "interval_weeks": 1,
    "anchor_date": null
  },
  "daily_activities": []
}
```

- `official_main` et `official_backup` peuvent contenir plusieurs quadrigrammes
  séparés par `/`.
- `billing_code` et `note` peuvent être `null`.
- `schedule` est toujours présent. `weekdays: []` signifie « tous les jours
  ouvrés » ; `interval_weeks` va de 1 à 12 ; `anchor_date` est une référence de
  phase, pas une date de début.

### Activité journalière

```json
{
  "day": "2026-11-06",
  "errors_reported": 12,
  "incidents_created": 3,
  "feai": ["FE-INC000000001", "INC000000002"],
  "status": "completed",
  "ko_reason": null
}
```

- `status` vaut `pending`, `completed` ou `ko`.
- `ko_reason` n'est renseigné que pour un statut `ko`, et vaut au plus 500
  caractères.
- Les références FEAI sont renvoyées sous leur forme canonique.

---

## 4. Authentification et projet

### `POST /auth/login`

```json
{
  "project_id": "protab",
  "quadrigramme": "MLOZ",
  "password": "mot-de-passe-du-projet"
}
```

Réponse `200` : `LoginResponse`, avec un cookie `protab_session` `HttpOnly`,
`SameSite=Lax` et `Max-Age` de 12 heures. Le cookie est `Secure` seulement si
`PROTAB_COOKIE_SECURE` est actif.

`401` si le projet, le quadrigramme ou le mot de passe est invalide. Le message
ne distingue pas les trois cas.

### `GET /auth/me`

Renvoie la session courante. `401` si le cookie est absent, inconnu ou expiré,
ou si le projet n'existe plus.

### `POST /auth/logout`

Supprime la session en base si elle existe, puis efface le cookie. Répond `204`
même sans session.

### `GET` et `PUT /project/settings`

`PUT` remplace le calendrier ouvré :

```json
{
  "excluded_weekdays": [6, 7],
  "excluded_dates": ["2026-05-01"]
}
```

`excluded_weekdays` utilise l'échelle ISO (1 = lundi … 7 = dimanche). Le schéma
refuse un jour hors bornes et une semaine entière exclue (`422`). Une liste
`[]` signifie « aucun jour récurrent exclu ».

`GET` et `PUT` répondent `401` en mode dégradé sans authentification, et `404`
si le projet n'existe pas.

---

## 5. Périmètres

### `POST /scope-monitorings`

Le corps est une **liste** d'objets :

```json
[
  {
    "name": "Support niveau 1",
    "knowledge_base_id": "KB-SUPPORT-01",
    "official_main": "MLOZ",
    "official_backup": "JMAB",
    "billing_code": "FACT-2026-PAI",
    "schedule": {
      "weekdays": [1, 2, 3, 4, 5],
      "interval_weeks": 1,
      "anchor_date": null
    }
  }
]
```

`billing_code` est obligatoire et non vide. `schedule` est facultatif ; son
absence vaut « tous les jours ouvrés ». Réponse `201` avec les identifiants
créés.

### `POST /scope-monitorings/import-csv`

Reçoit un fichier CSV en `multipart/form-data` (champ `csv_file`). L'en-tête doit
être exactement :

```text
name,knowledge_base_id,official_main,official_backup,billing_code
```

Un en-tête différent est refusé en `400 « Invalid headers »`. L'import passe par
le même cas d'usage que la création manuelle ; seul l'événement d'audit diffère
(`scope_imported` au lieu de `scope_created`). Réponse `201` avec les
identifiants créés.

### `GET /scope-monitorings` et `GET /scope-monitorings/{scope_id}`

Renvoient les périmètres du projet courant avec **tout leur historique**
d'activités. La page `/analyse` et la vue mono-jour dérivent de cette liste.
`404` si le périmètre n'existe pas dans le projet courant.

### `PATCH /scope-monitorings/{scope_id}`

Modifie uniquement la note :

```json
{ "note": "Nouvelle note" }
```

`note` peut être `null` ou une chaîne de 2000 caractères au plus. Une chaîne
blanche est enregistrée comme « pas de note ». `422` si la note est trop longue,
`404` si le périmètre est inconnu.

### `PATCH /scope-monitorings/{scope_id}/officials`

Modifie les deux responsables :

```json
{
  "official_main": "MLOZ",
  "official_backup": "JMAB"
}
```

Les deux champs sont obligatoires et non vides. La route est réservée aux
**administrateurs du projet** : `403` sinon, même si le périmètre est inconnu.
Un identifiant inconnu pour un administrateur reste `404`.

### `PATCH /scope-monitorings/{scope_id}/schedule`

Modifie la périodicité :

```json
{
  "weekdays": [1, 3, 5],
  "interval_weeks": 2,
  "anchor_date": "2026-01-05"
}
```

- `weekdays` : jours ISO triés et dédupliqués ; une liste vide vaut « tous les
  jours ouvrés » ;
- `interval_weeks` : 1 à 12 ;
- `anchor_date` : date facultative, référence de phase du cycle.

`400` si une valeur est hors bornes (`InvalidScheduleError`), `422` si la
périodicité ne tombe jamais un jour ouvré du projet (`ScheduleNeverDueError`),
`404` si le périmètre est inconnu.

---

## 6. Activités journalières

### `POST /scope-monitorings/{scope_id}/activities`

```json
{
  "day": "2026-11-06",
  "errors_reported": 12,
  "incidents_created": 3,
  "feai": ["FE INC000000001", "INC000000002"]
}
```

Les références sont normalisées avant stockage. `400` si un compteur est négatif,
si `incidents_created > errors_reported` ou si une référence est invalide ou en
double. `409` si une activité existe déjà pour ce jour. Réponse `201` sans corps.

### `GET /scope-monitorings/{scope_id}/activities/{day}`

Renvoie l'activité du jour, `404` si elle n'existe pas.

### `PATCH /scope-monitorings/{scope_id}/activities/{day}`

Réécrit les compteurs d'un jour existant :

```json
{
  "errors_reported": 15,
  "incidents_created": 4,
  "feai": ["FE-INC000000003"]
}
```

Le statut n'est **pas** modifiable ici : il appartient à la route suivante.
`404` si l'activité du jour n'existe pas.

### `PATCH /scope-monitorings/{scope_id}/activities/status`

Écrit le statut d'un lot de jours :

```json
{
  "days": ["2026-11-04", "2026-11-05"],
  "status": "ko",
  "ko_reason": "Panne de l'outil de supervision"
}
```

- `days` ne peut pas être vide ;
- `ko_reason` n'est accepté que pour `status: "ko"` et vaut au plus 500
  caractères ; une chaîne blanche devient `null` ;
- une journée peut être signalée **KO sans saisie** : elle est créée avec des
  compteurs nuls ;
- une journée ne peut pas être **terminée sans saisie** : `404` si l'un des jours
  n'existe pas. La commande est tout ou rien.

`404` si le périmètre ou une journée est inconnu, `422` si le motif accompagne un
statut autre que `ko`.

---

## 7. Journal d'audit

### `GET /api/audit-log`

Paramètres de requête, tous facultatifs :

| Paramètre | Sens |
| --- | --- |
| `scope_id` | répétable ; liste vide = pas de filtre |
| `actor` | préfixe insensible à la casse ; blanc = pas de filtre |
| `action` | action exacte (`activity_created`, `scope_note_updated`, …) |
| `from_created_at` | borne basse incluse, instant ISO 8601 |
| `to_created_at` | borne haute **exclue**, instant ISO 8601 |
| `limit` | 200 par défaut, ramené entre 1 et 1000 |

La période filtre **`created_at`**, pas `day` : les créations de périmètre, les
imports et les notes n'ont pas de journée métier. Le serveur n'a aucun fuseau :
le frontend convertit les minuits locaux en instants avant l'appel.

Réponse : liste de `AuditEventResponse` :

```json
{
  "id": "…",
  "actor": "MLOZ",
  "action": "activity_updated",
  "scope_id": "3f1c…",
  "scope_name": "Support niveau 1",
  "day": "2026-11-06",
  "created_at": "2026-11-06T14:32:00+00:00",
  "changes": {
    "errors_reported": { "old": 12, "new": 15 }
  }
}
```

`scope_name` est résolu à la lecture depuis `scope_monitorings` ; il n'est pas
dénormalisé dans `audit_log`.

---

## 8. Codes d'erreur

La traduction des exceptions est centralisée dans
`adapters/inbound/api/errors.py`. Aucun handler de route ne choisit un code HTTP.

| Code | Cause |
| --- | --- |
| `400` | autre `DomainError` (compteur négatif, FEAI invalide, responsables vides, note trop longue hors schéma…) ; erreur d'en-tête CSV |
| `401` | session absente, invalide, expirée, ou projet inactif |
| `403` | action réservée à un administrateur du projet |
| `404` | périmètre, activité ou projet introuvable |
| `409` | identifiant ou nom de périmètre déjà pris ; activité déjà existante pour ce jour |
| `422` | corps de requête invalide (Pydantic), note trop longue, motif KO incohérent, périodicité jamais due |
| `500` | exception inattendue ; le message est générique |

Le corps d'erreur est toujours `{"detail": "..."}`.

---

## 9. Import et export CSV

**Import** : route `POST /scope-monitorings/import-csv`, cinq colonnes
obligatoires dans l'ordre indiqué en §5. Un fichier préparé avant l'ajout de
`billing_code` est rejeté.

**Export** : construit côté frontend (`src/FrontEnd/src/utils/export.ts`), pas par
l'API. Colonnes, dans l'ordre :

```text
Périmètre, KB, Responsable principal, Responsable suppléant, Date,
Erreurs, Incidents, Références FEAI, Traité, Terminé, Code de facturation,
Statut, Motif KO
```

Les colonnes `Statut` et `Motif KO` sont ajoutées en fin de ligne pour ne pas
décaler un tableur configuré sur un export antérieur. `Traité` et `Terminé` sont
dérivés du statut et restent présents.

---

## 10. Exemples avec `curl`

```bash
# Connexion : le cookie est conservé dans cookies.txt
curl -c cookies.txt -X POST http://localhost:8000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"project_id":"protab","quadrigramme":"MLOZ","password":"secret"}'

# Liste des périmètres
curl -b cookies.txt http://localhost:8000/scope-monitorings

# Saisie d'une journée
curl -b cookies.txt -X PATCH \
  http://localhost:8000/scope-monitorings/$SCOPE/activities/2026-11-06 \
  -H 'Content-Type: application/json' \
  -d '{"errors_reported":12,"incidents_created":3,"feai":["INC000000001"]}'

# Périodicité : toutes les deux semaines, lundi et jeudi
curl -b cookies.txt -X PATCH \
  http://localhost:8000/scope-monitorings/$SCOPE/schedule \
  -H 'Content-Type: application/json' \
  -d '{"weekdays":[1,4],"interval_weeks":2,"anchor_date":"2026-01-05"}'
```

Les règles métier derrière ces routes sont dans
[`domain-model.md`](domain-model.md) ; l'authentification et les droits dans
[`authentication.md`](authentication.md).
