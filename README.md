# ProTab

Projection et suivi d'activité quotidienne par périmètre de supervision (scope monitoring).

## Domain model

Architecture hexagonale. Le domaine ne dépend d'aucune technologie externe.

```text
ScopeMonitoring (agrégat racine)                      DailyActivity (entité)
├── name: str                                         ├── day: date            ← datetime.date (pas de classe Day)
├── knowledge: KnowledgeBase                          ├── errors_reported: int ← >= 0
├── officials: Officials                              ├── incidents_created: int ← >= 0 et <= errors_reported
└── daily_activities: dict[date, DailyActivity]       ├── feai: list[str]      ← format INC\d{7}, sans doublon
     └── clé = jour → une seule activité par jour     ├── handled: bool
                                                      └── completed: bool      ← completed ⇒ handled
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