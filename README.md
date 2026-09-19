# ProTab

Projection et suivi d'activité quotidienne par périmètre de supervision (scope monitoring).

## Domain model

Architecture hexagonale. Le domaine ne dépend d'aucune technologie externe.

```text
ScopeMonitoring (agrégat racine)                      DailyActivity (entité)
├── id: str                                            ├── day: date            ← datetime.date (pas de classe Day)
├── name: str                                         ├── errors_reported: int ← >= 0
├── knowledge: KnowledgeBase                          ├── incidents_created: int ← >= 0 et <= errors_reported
├── officials: Officials                              ├── feai: list[str]      ← format INC\d{7}, sans doublon
└── daily_activities: dict[date, DailyActivity]       ├── handled: bool
     └── clé = jour → une seule activité par jour     └── completed: bool      ← completed ⇒ handled
```

### Décisions de modélisation

- `Day` n'est **pas** une classe : un jour n'a ni identité ni comportement métier propres au-delà de sa valeur ;
  `datetime.date` est déjà un value object immuable. « Toutes les activités d'un jour » est une requête
  (port outbound), pas une structure du domaine.
- `ScopeMonitoring` est l'agrégat racine. Il **possède** ses `DailyActivity`, indexées par jour
  (`dict[date, DailyActivity]`) : unicité d'une activité par périmètre et par jour, garantie par l'agrégat.
- Relation unidirectionnelle : une `DailyActivity` ne référence pas son `ScopeMonitoring`.

### Invariants

- `errors_reported >= 0`, `incidents_created >= 0`, `incidents_created <= errors_reported`.
- Références FEAI : format `INC` suivi d'exactement 7 chiffres (`^INC\d{7}$`), aucune doublon.
- Une seule `DailyActivity` par `ScopeMonitoring` et par jour.
- `mark_completed()` force `handled = True` (`completed` ⇒ `handled`).

## Use cases (couche application)

Les use cases dépendent uniquement du port outbound `ScopeMonitoringRepository`
(`ports/outbound/`) — la persistance concrète est branchée par un adapter.

| Use case | Commande | Comportement |
|---|---|---|
| `CreateScopeMonitoringUseCase` | `CreateScopeMonitoringCommand(name, knowledge_base_id, official_main, official_backup)` | Crée plusieurs `ScopeMonitoring` (id = uuid4) ; **atomique** : doublon de nom ou ligne invalide ⇒ rien n'est persisté. |
| `CompleteDailyActivityUseCase` | `CompleteDailyActivityCommand(scope_id, days)` | Marque `completed` (et `handled`) pour une ou plusieurs journées d'un périmètre ; jour sans activité ⇒ `DailyActivityNotFoundError`. |
| `UpdateDailyActivityUseCase` | `UpdateDailyActivityCommand(scope_id, day, errors_reported, incidents_created, feai)` | Modifie compteurs/FEAI d'une journée via la validation domaine ; invariants appliqués. |

## Import CSV

Adapter inbound `adapters/inbound/csv/scope_monitoring_csv_reader.py` : transforme les lignes du fichier
(colonnes `name, knowledge_base_id, official_main, official_backup`) en `CreateScopeMonitoringCommand`.
En-têtes et nombre de colonnes sont vérifiés structurellement ; les règles métier sont levées par le domaine.