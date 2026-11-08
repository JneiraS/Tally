# Modèle de domaine

> **Documentation humaine, non normative.** En cas de divergence, le code et
> `AGENTS.md` font foi. Ce document décrit les règles telles qu'elles sont
> implémentées dans `src/protab/domain/`.

Le domaine est indépendant de FastAPI, de PostgreSQL et de toute autre
technologie. Il contient les entités, les value objects, les exceptions et les
invariants métier. Les cas d'usage les orchestrent ; les adaptateurs les
persistent.

---

## 1. Vue d'ensemble

Deux entités suffisent à comprendre le métier :

```text
ScopeMonitoring (agrégat racine)
├── id: str
├── name: str
├── knowledge: KnowledgeBase
├── officials: Officials
├── billing_code: str | None
├── note: str | None
├── schedule: MonitoringSchedule
└── daily_activities: dict[date, DailyActivity]
     └── une seule activité par jour

DailyActivity (entité, dans l'agrégat)
├── day: date
├── errors_reported: int
├── incidents_created: int
├── feai: list[str]
├── status: DayStatus
└── ko_reason: str | None
```

`Day` n'est **pas** une classe : un jour n'a ni identité propre ni cycle de vie,
seulement une valeur. La clé du dictionnaire d'activités est la date, et la base
impose la même unicité par `PRIMARY KEY (scope_id, day)`.

Le **projet** (tenant) n'appartient pas au domaine : c'est un contexte
d'infrastructure, porté par un `ContextVar` et filtré par les adaptateurs. Voir
[`database.md`](database.md) et [`architecture.md`](architecture.md).

---

## 2. Entités et value objects

| Élément | Fichier | Rôle |
| --- | --- | --- |
| `ScopeMonitoring` | `entities/scope_monitoring.py` | Agrégat racine ; porte l'identité, les responsables, la note, la périodicité et les activités |
| `DailyActivity` | `entities/daily_activity.py` | Valeurs d'une journée ; `update()` écrit les compteurs, `apply_status()` écrit le statut |
| `KnowledgeBase` | `entities/scope_monitoring.py` | Identifiant de base de connaissances, au moins 9 caractères |
| `Officials` | `entities/scope_monitoring.py` | Responsable et suppléant, tous deux non vides |
| `DayStatus` | `entities/day_status.py` | `pending`, `completed`, `ko` ; relit une valeur inconnue comme `pending` |
| `MonitoringSchedule` | `value_objects/monitoring_schedule.py` | Jours attendus, intervalle de semaines, ancre de phase |
| `NonWorkingDays` | `value_objects/non_working_days.py` | Calendrier ouvré du projet (jours récurrents et dates ponctuelles) |
| `OfficialCode` | `value_objects/official_code.py` | Forme scalaire d'un quadrigramme administrateur |
| `AuditEvent`, `build_changes()` | `entities/audit_event.py` | Événement immuable ; ne conserve que les champs réellement modifiés |

Deux constantes de borne vivent dans le domaine et sont reprises par les schémas
Pydantic, jamais recopiées :

| Constante | Valeur | Portée |
| --- | --- | --- |
| `NOTE_MAX_LENGTH` | 2000 | note libre d'un périmètre |
| `KO_REASON_MAX_LENGTH` | 500 | motif d'une journée KO |

---

## 3. Invariants d'un périmètre

### Identité et nom

- `id` est nettoyé (`strip`) et ne peut pas être vide
  (`InvalidScopeMonitoringIdError`).
- `name` est **unique globalement**, pas par projet. La contrainte est en base
  (`UNIQUE`), et les deux adaptateurs la traduisent en
  `ScopeMonitoringNameAlreadyExistsError`.
- `knowledge.id` doit contenir au moins 9 caractères
  (`InvalidKnowledgeBaseIdError`).

### Responsables

`Officials` refuse un responsable ou un suppléant vide
(`EmptyOfficialsError`). Les deux champs sont nettoyés.

Chaque colonne peut contenir **plusieurs quadrigrammes séparés par `/`** —
`official_main` comme `official_backup`. Le parseur commun
(`postgres_auth_repository._official_codes()`) ignore la casse et les espaces,
et écarte toute partie sans caractère alphanumérique : le `?` des données réelles
signifie « pas de suppléant » et n'est jamais un code utilisable.

L'édition des responsables (`set_officials`) réutilise `Officials` : les mêmes
règles s'appliquent à la création et à la modification. Aucun format
supplémentaire n'est imposé, pour ne pas rendre non modifiable un code que
l'écran de connexion tolère.

### Code de facturation

- **Obligatoire à la création** (`ScopeMonitoring.create()` →
  `EmptyBillingCodeError`).
- **Nullable en base et à la relecture** : les lignes antérieures à son
  introduction n'en ont pas. Le constructeur normalise une valeur blanche en
  `None`, il ne refuse jamais une ligne lue.
- Format libre, nettoyé, **non unique** : deux périmètres peuvent partager un
  code.
- Aucune route ne permet de compléter un code manquant. La reprise se fait en
  SQL, hors journal d'audit (voir [`cli.md`](cli.md)).

### Note libre

- `set_note()` nettoie la valeur, transforme une chaîne blanche en `None` et
  refuse au-delà de `NOTE_MAX_LENGTH` (`NoteTooLongError`).
- Le constructeur ne refuse pas une note trop longue : il est le chemin de
  relecture des deux adaptateurs. Une seule ligne dégénérée ne doit pas vider la
  liste des périmètres.
- La borne est aussi appliquée par le schéma HTTP, qui répond `422` avant
  d'atteindre l'entité.
- Une note blanche n'a qu'un état : `None`. Il n'existe pas de « note vide »
  distincte de « pas de note ».

### Périodicité

`MonitoringSchedule` est un value object **gelé** :

- `weekdays` : jours ISO (1 = lundi … 7 = dimanche), triés et dédupliqués. Une
  liste vide signifie **tous les jours ouvrés du projet** — c'est le
  comportement de tous les périmètres créés avant la périodicité.
- `interval_weeks` : de 1 à 12. Au-delà, le cycle dépasse la mémoire des
  personnes qui le suivent.
- `anchor_date` : **référence de phase**, pas date de début. La cadence
  s'applique aussi aux dates antérieures, donc changer l'ancre ne laisse pas de
  trou dans la couverture passée. Sans ancre, la référence fixe est le lundi de
  la semaine du 1ᵉʳ janvier 1970.

Une périodicité **restreint** le calendrier du projet, elle ne l'élargit jamais :
un périmètre qui déclare un samedi dans un projet du lundi au vendredi n'est
simplement jamais attendu. Deux définitions concurrentes du « jour ouvré »
contrediraient le dénominateur de couverture.

Le refus « cette périodicité ne tombera jamais un jour ouvré » nécessite le
calendrier du projet, que le domaine ne connaît pas. Il vit donc dans
`UpdateScopeScheduleUseCase`, avant toute mutation, et devient `422`
(`ScheduleNeverDueError`).

`MonitoringSchedule.from_raw()` est **lenient** : une valeur non dictionnaire,
un intervalle illisible ou une liste dont aucune entrée n'est un jour ISO
retombent sur le défaut « tous les jours ouvrés ». Une liste réellement vide,
elle, est un choix et reste respectée.

---

## 4. Calendrier ouvré du projet

`NonWorkingDays` décrit les jours où l'équipe travaille :

```text
excluded_weekdays : jours ISO récurrents exclus (1 = lundi … 7 = dimanche)
excluded_dates    : dates ponctuelles exclues
```

Deux valeurs par défaut doivent être distinguées :

| Valeur | Sens |
| --- | --- |
| `NonWorkingDays()` | tous les jours sont ouvrés — aucune exclusion |
| `NonWorkingDays.default()` | week-end exclu (samedi et dimanche) — installation non configurée |

Une colonne `NULL` lit le défaut, jamais le vide. Trois règles de relecture :

- une entrée illisible est écartée, jamais signalée : une seule ligne ancienne ne
  doit pas vider le calendrier de tous les projets ;
- une liste non vide dont **aucune** entrée ne survit à la normalisation retombe
  sur le défaut ; une liste `[]` reste un choix ;
- une semaine entière exclue (`[1,2,3,4,5,6,7]`) ne laisse aucun jour ouvré :
  elle est illisible et retombe sur le défaut. La modale ne peut pas produire ce
  réglage, mais un appel HTTP direct le pourrait, d'où le refus en `422` à la
  frontière d'écriture.

Le format stocké est `{"excluded_weekdays": [...], "excluded_dates": [...]}`.
La lecture n'élève jamais : le constructeur est le chemin de réhydratation.

---

## 5. Invariants d'une activité journalière

### Compteurs

- `errors_reported >= 0` (`NegativeErrorsCountError`) ;
- `incidents_created >= 0` (`NegativeIncidentsCountError`) ;
- `incidents_created <= errors_reported` (`IncidentsExceedErrorsError`).

La dernière règle est appliquée par l'entité elle-même, à la création comme à la
mise à jour. Elle n'est donc pas une simple convention de saisie.

### Références FEAI

La forme canonique est `[PREFIXE-]INC\d{9}`, avec un préfixe facultatif de 2 à 5
lettres : `FE-INC000000001`, `INC000000001`.

La saisie est tolérante — espaces, tirets, slashs, préfixe collé au code — mais
**une seule graphie est stockée**. `canonical_feai()` réduit les séparateurs à un
tiret unique et insère le tiret d'un préfixe collé.

Le doublon se juge sur la forme canonique, jamais sur la chaîne saisie : sans
cela, `FE INC000000001` et `FE-INC000000001` seraient deux références distinctes
dans la même journée. Une référence invalide lève `InvalidFeaiReferenceError` ;
un doublon lève `DuplicateFeaiReferenceError`.

La casse n'est pas normalisée : `inc000000001` reste invalide.

### Unicité

Un périmètre ne peut avoir qu'une activité par jour. `add_daily_activity()` lève
`DuplicateDailyActivityError`, et la base impose la même contrainte par sa clé
primaire.

### Statut et motif KO

`DayStatus` remplace deux booléens (`handled` et `completed`) qui étaient
toujours égaux en production. Une seule valeur rend la combinaison interdite
« terminée et KO » **inexprimable**.

- `pending` : journée non traitée ;
- `completed` : journée traitée ;
- `ko` : journée traitée, mais impossible à mesurer pour une raison technique.

`ko` compte donc comme **traité** : il retire la journée de l'arriéré sans
prétendre qu'une mesure a été faite.

`apply_status()` est le seul écrivain du statut :

- un motif fourni pour un statut autre que `ko` est **refusé**
  (`InvalidKoReasonError`), jamais ignoré ;
- un motif dépassant `KO_REASON_MAX_LENGTH` est refusé
  (`KoReasonTooLongError`) ;
- une chaîne blanche devient `None` ;
- les compteurs ne sont jamais touchés : une journée KO conserve ce qui avait été
  saisi avant la découverte du problème, et lever le KO ne perd rien.

Le constructeur, lui, **normalise sans refuser** : un motif résiduel sur une
journée non-KO devient `None`. C'est le chemin de relecture, il ne doit pas
lever sur une ligne dégénérée.

Compléter une journée KO **efface le motif de la ligne** : une journée terminée
ne porte pas de motif de blocage. L'information reste dans
`audit_log.changes`.

---

## 6. Écritures ciblées et cohérence

`ScopeMonitoringRepository.save()` **crée, il ne réécrit rien**. Un `save()` sur
un id déjà pris lève `ScopeMonitoringAlreadyExistsError` ; sur un nom déjà pris,
`ScopeMonitoringNameAlreadyExistsError`.

Une fois le périmètre créé, les mutations passent par des écritures ciblées :

| Méthode | Effet |
| --- | --- |
| `insert_daily_activity` | ajoute une journée |
| `update_daily_activity` | réécrit les compteurs d'une journée nommée |
| `set_activities_status` | écrit le statut d'un lot de jours |
| `update_note` | réécrit la note seule |
| `update_officials` | réécrit les deux responsables seuls |
| `update_schedule` | réécrit la périodicité seule |

La raison est la concurrence : un agrégat relu avant l'édition d'un autre
utilisateur ne doit pas être réécrit en entier. Un `save()` fusionnant
réécrirait des journées ou une note qu'il n'a pas relues.

**`set_activities_status` est le seul upsert du dépôt.** Sa clause
`ON CONFLICT DO UPDATE` ne réécrit que `status` et `ko_reason` de lignes
nommées ; elle ne fusionne aucun compteur. Un jour sans ligne est créé à
compteurs nuls, ce qui rend le KO atteignable là où il est utile : une journée
que personne n'a pu traiter.

Conséquence : `rowcount` ne distingue plus un jour absent d'un jour mis à jour.
Le refus de terminer un jour inexistant vit donc dans
`SetActivitiesStatusUseCase`, pas dans l'adaptateur. Une journée peut être
signalée KO sans saisie, mais pas être terminée sans saisie.

---

## 7. Journal d'audit

`AuditEvent` conserve :

- `action`, `actor`, `project_id`, `scope_id`, `day`, `created_at` ;
- `changes`, un dictionnaire `{champ: {"old": ..., "new": ...}}`.

`build_changes()` ne retient que les champs dont la valeur diffère. Un `PATCH`
sans changement réel n'écrit aucun événement.

Neuf actions existent :

| Action | Déclencheur |
| --- | --- |
| `scope_created` | création manuelle d'un périmètre |
| `scope_imported` | import CSV |
| `activity_created` | création d'une activité |
| `activity_updated` | modification des compteurs |
| `activity_completed` | passage à `completed` |
| `activity_ko` | passage à `ko` ou retour depuis `ko` |
| `scope_note_updated` | modification de la note |
| `scope_officials_updated` | modification des responsables |
| `scope_schedule_updated` | modification de la périodicité |

Le journal enregistre **le moment de l'écriture** (`created_at`) et, quand elle
existe, la journée métier concernée (`day`). Les créations de périmètre, imports
et notes n'ont pas de `day`.

Pour les responsables et la périodicité, l'événement ne porte que les champs
réellement modifiés ; des valeurs identiques n'ajoutent aucun événement.

Le journal n'est **pas** best-effort : `record()` n'avale aucune exception, donc
un échec d'écriture de l'audit remonte en `500`. En revanche, l'écriture métier
est validée dans sa propre transaction **avant** l'appel à `record()` : un échec
d'audit ne l'annule pas. Les deux écritures ne sont donc pas atomiques.

Le journal est une trace d'audit, pas une source de vérité métier : la
consultation, ses filtres et son plafond sont décrits dans [`api.md`](api.md).

---

## 8. Où lire les règles dans le code

| Question | Fichier |
| --- | --- |
| Compteurs, FEAI, statut d'une journée | `src/protab/domain/entities/daily_activity.py` |
| Statut, borne du motif KO | `src/protab/domain/entities/day_status.py` |
| Périmètre, responsables, note, code de facturation | `src/protab/domain/entities/scope_monitoring.py` |
| Périodicité | `src/protab/domain/value_objects/monitoring_schedule.py` |
| Calendrier ouvré | `src/protab/domain/value_objects/non_working_days.py` |
| Exceptions métier | `src/protab/domain/exceptions/` |
| Événement et diff d'audit | `src/protab/domain/entities/audit_event.py` |

Les règles de persistance sont dans [`database.md`](database.md), les routes et
codes HTTP dans [`api.md`](api.md), et les règles normatives du dépôt dans
`AGENTS.md` (§28.1 notamment).
