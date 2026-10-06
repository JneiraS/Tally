# Frontend

> **Documentation humaine, non normative.** Ce document facilite la maintenance.
> En cas de divergence, **le code et `AGENTS.md` font foi**. Aucune règle ne doit
> être appliquée sur la seule foi de ce document. Les invariants du frontend qui
> *doivent* être respectés sont en `AGENTS.md` §28.6 ; ici on décrit la
> structure, les commandes, et les pièges déjà payés une fois.

Ce document couvre l'application React de `src/FrontEnd/`. Pour l'API
consommée, voir [`docs/architecture.md`](architecture.md) ; pour la
configuration, [`docs/development.md`](development.md).

---

## 1. Pile technique

Dépendances déclarées dans `src/FrontEnd/package.json` :

| Élément | Version | Rôle |
| --- | --- | --- |
| React / React DOM | 19.0.1 | UI |
| react-router-dom | 7.18.4 | Routage |
| Vite | 8.3.0 | Serveur de dev et build |
| TypeScript | 7.0.2 | Typage |
| Tailwind CSS | 4.3.3 | Styles, via `@tailwindcss/vite` |
| recharts | 3.10.1 | Graphiques |
| lucide-react | 0.546.0 | Icônes |
| vitest + Testing Library | 5.0.1 | Tests |

Il n'y a **pas de champ `engines`** : la version de Node n'est pas contrainte par
le dépôt. En cas de problème d'installation, partez de la dernière LTS.

Scripts (`package.json:6-12`) :

```bash
npm run dev      # vite, port 5173
npm run build    # tsc -b && vite build
npm run lint     # tsc --noEmit  — contrôle de TYPES, pas de style
npm test         # vitest run
npm run preview  # sert le build
```

**`npm run lint` n'est pas un linter.** Aucun ESLint, aucun Prettier n'est
installé : la seule vérification automatique est le typage. Le style du code est
à la main, comme côté Python (`docs/development.md` §9).

---

## 2. Arborescence

```text
src/FrontEnd/src/
├── main.tsx              Point d'entrée, monte <App/>
├── App.tsx               Providers, état de session, routes
├── index.css             Tailwind + thème sombre
├── services/api.ts       Client HTTP unique (protabApi)
├── types/index.ts        Interfaces partagées avec l'API
├── constants/routes.ts   Chemins déclarés une seule fois (API + SPA)
├── constants/ui.ts       Classe de case à cocher partagée
├── constants/nonWorkingDays.ts  Échelle ISO des jours, source unique
├── hooks/                useTheme, useToast
├── pages/                ScopeListPage, ScopeDetailPage, AnalyticsPage,
│                         AuditLogPage, LoginPage, NotFoundPage
├── components/           26 composants (modales, éditeurs, graphiques, toasts)
└── utils/                kpi, date, export, validation, knowledgeBase,
                          auditStats, analytics, search
```

La séparation utile à un mainteneur : **`utils/` est de la logique pure**, sans
React — c'est ce qui la rend testable directement (`kpi.test.ts`,
`export.test.ts`, `validation.test.ts`). Tout comportement calculé qui peut
vivre dans `utils/` y est préférable.

---

## 3. Client HTTP — `services/api.ts`

**Un seul client, `protabApi`, pour toute l'application.** Les pages et les
composants ne construisent pas d'URL : ils appellent ses méthodes. Points à
connaître :

- `credentials: "include"` (`api.ts:145`) — le cookie de session doit voyager.
- `ApiError` (`api.ts:26`) porte le message d'erreur et le statut.
- `setUnauthorizedHandler(handler)` (`api.ts:216`) est branché dans `App.tsx` :
  un **401** signifie « session perdue » et ramène à `LoginPage`, au lieu
  d'afficher une boîte « Échec du chargement » dont « Réessayer » ne peut pas
  réussir.
- **Exception à conserver** : `POST /auth/login` est exclu de ce traitement
  global ; un 401 y signifie simplement « mot de passe erroné » et doit rester
  une erreur de formulaire. Tout nouveau client HTTP doit maintenir cette
  exclusion.

---

## 4. Chemins et routage

Les chemins d'API sont déclarés **une seule fois** dans
`src/constants/routes.ts` (`AUDIT_LOG_PATH = "/api/audit-log"`) et repris
symétriquement dans `app.py`, `nginx.conf` et `vite.config.ts`. La route SPA
associée (`AUDIT_LOG_PAGE_PATH = "/audit-log"`) est déclarée dans le même fichier
mais **absente** des couches serveur. La sécurité ne repose pas sur l'opacité
du chemin mais sur le cookie de session : ne rétablissez pas l'ancien chemin
haché.

Le proxy de développement est déclaré dans `vite.config.ts` pour
`/scope-monitorings`, `/api/audit-log` et `/project/settings`, tous vers
`http://localhost:8000`. **Ajouter une route API en développement impose
d'ajouter son chemin ici**, sinon CORS.

Routage applicatif : `SCOPE_LIST_PATH`, `/scopes/:id`, `ANALYTICS_PATH`
(`/analyse`), `AUDIT_LOG_PAGE_PATH`, et `*` → `NotFoundPage`. Les cinq chemins de la
SPA sont eux aussi des constantes de `routes.ts`, pour la même raison que les
chemins d'API : une page ajoutée avec un littéral dans `App.tsx` dérive de la
navigation d'un coup.

**`/analyse` n'a pas de location nginx.** Le `try_files … /index.html` de la
SPA sert déjà les routes inconnues ; un bloc dédié serait un no-op qui donnerait
l'illusion d'une étape nécessaire.

`PageNav` porte les trois liens (Périmètres · Analyse · Journal) et n'est monté
que dans le **pied de page**. L'en-tête ne le porte plus : « Périmètres » y ferait
doublon avec le logo, qui pointe déjà sur `SCOPE_LIST_PATH`. Au-dessus de `lg`,
Analyse et Journal s'atteignent donc par `Ctrl+Alt+G` et `Ctrl+Alt+L`, gérés par
un seul composant `PageShortcuts` monté dans `App.tsx` — une liaison et un chemin
par entrée, et `shiftKey` explicitement refusé pour ne pas capter une mainlevée
que le bureau envoie pour autre chose.

**Le pied de page n'est pas un doublon, c'est le seul chemin de ces deux pages sur
mobile**, où Ctrl+Alt n'existe pas. Le retirer de `App.tsx` les rendrait
inatteignables sur téléphone : c'est la contrainte qui a fait retirer `PageNav`
de l'en-tête plutôt que ses deux entrées.

Le raccourci navigue même modale ouverte, ce qui démonte une saisie en cours. Il
est global, il ne consulte donc pas l'état des modales qui vit dans `AppContent` ;
C'est un choix assumé, pas un oubli.

---

## 5. Providers et état

`App.tsx` n'est qu'une coquille : `ThemeProvider` enveloppe **toute**
l'application, `AppContent` étant tout ce qui est dessous (`App.tsx:22-30`).
C'est délibéré — une branche rendue hors du provider (chargement de session,
`LoginPage`) n'aurait aucun contexte, donc aucune classe `dark:` ne pourrait
s'activer et la préférence enregistrée ne s'appliquerait qu'**après**
connexion, soit un flash de thème à chaque login.

Tout composant dépendant du thème passe par `useTheme()`. **Ne jamais dupliquer
l'état de thème ni lire `localStorage` directement** (`useTheme.tsx:19,39` est le
seul endroit autorisé).

Le toast a **deux contextes distincts** (`useToast.tsx:55-56`) :

- `useToastActions()` — valeur stable, pour un composant qui n'**émet** que des
  toasts. C'est le cas de `FeaiTagInput` (`FeaiTagInput.tsx:29`).
- `useToast()` — pour qui doit **lire** la liste des toasts.

Un composant qui émet seulement des toasts et s'abonne à `useToast()` re-rend à
chaque toast de l'application ; il y a deux instances de `FeaiTagInput` par
périmètre (table et carte mobile), toutes deux au DOM. Le découpage des contextes
règle le coût de rendu ; `React.memo` n'y changerait rien, le parent recréant une
nouvelle fonction `onChange` à chaque rendu.

L'état applicatif (session, modales, `refreshTrigger`) vit dans `AppContent` et
descend par props. Il n'y a pas de bibliothèque de gestion d'état global.

---

## 6. Le modèle mono-jour

**`ScopeListPage` affiche un seul jour, pas un cumul.** Le jour à l'ouverture
vient de `defaultDisplayDay()` (`utils/kpi.ts`) : la date du jour si elle est
ouvrée, sinon le dernier jour ouvré.

**« Jour ouvré » se décide dans `constants/nonWorkingDays.ts`, nulle part
ailleurs.** `getUTCDay()` et `getDay()` numérotent à partir du dimanche alors
que l'ISO part du lundi : `toIsoWeekday()` fait la conversion, et
`toMondayFirstIndex()` indexe les lignes de la heatmap d'audit. Ces deux
fonctions prennent le **numéro** du jour et non la date, pour que l'appelant
reste maître de son horloge — `kpi.ts` raisonne en UTC sur des dates ISO,
`auditStats.ts` en heure locale parce que son audience est locale. Les
confondre uniformiserait un affichage qui ne doit pas l'être. Les bornes 1–7,
les libellés `Lun`…`Dim` et le défaut « week-end exclu » (`ISO_SATURDAY`,
`ISO_SUNDAY`, aligné sur `NonWorkingDays.default()` côté API) en découlent :
n'en réécrivez aucune.

**La recherche d'un jour ouvré est bornée, et sa borne est dérivée.**
`lastWorkingDays()` ne peut pas boucler indéfiniment : il faut une semaine par
jour cherché, plus une semaine par date ponctuelle exclue, car une date exclue qui
tombe sur le seul jour ouvrable coûte sept jours de recherche. La borne est
donc `ISO_WEEKDAY_COUNT * (n + excluded_dates.length)`. Sans elle, un calendrier
sans aucun jour ouvré ferait tourner la boucle jusqu'à la limite de `Date` : un
gel du rendu, pas un écran vide. Un calendrier de ce genre est refusé à
l'écriture par l'API (`422`) et réparé à la lecture par le défaut — mais la borne
reste, parce qu'elle est ce qui rend la fonction totale, indépendamment de ce que
contient la configuration.

Un jour non ouvré n'a rien à afficher ni à saisir. Deux règles d'affichage
complètent le tableau :

- Un bandeau `role="status"` « N périmètres non traités » sur le dernier jour
  ouvré : il **nomme** les périmètres concernés et filtre la liste sur eux.
- À défaut, une notice « aucune saisie » nommant la dernière saisie et
  proposant de l'afficher. Les deux ne doivent jamais coexister : deux
  `role="status"` simultanés rendraient l'un des deux inatteignable.

### Recherche : le responsable passe avant le suppléant

Une recherche par quadrigramme classe ses résultats par **où la requête a
porté** : `official_main` (responsable) d'abord, `official_backup` (suppléant)
ensuite, et en dernier les périmètres que la requête n'atteint qu'au nom, à la
base KB ou au code de facturation.

Les deux règles vivent dans `utils/search.ts` — `matchesSearchQuery()` pour le
prédicat, `officialMatchRank()` et `sortByOfficialRelevance()` pour le
réordonnancement — et `ScopeListPage.tsx:250` ne fait que les composer. **Ne pas
reintroduire un second prédicat de filtre dans la page** : un rang calculé sur
une autre règle que celle qui a filtré afficherait « sans correspondance » un
périmètre pourtant retenu à l'écran.

L'ordre d'arrivée est conservé à rang égal (index d'origine en second critère
de tri, donc pas de dépendance à la stabilité implicite de `sort`). L'API
renvoyant les périmètres par nom (`ORDER BY name`), chaque groupe reste donc
alphabétique. Une recherche vide donne le même rang à tout le monde : la liste
est alors celle du serveur, intacte.

---

## 7. Saisie et autosave

`InlineActivityCounters` est un éditeur en ligne à autosave. Son invariant
structurel : **ses `useState` sont initialisés au montage seulement, et
`existsRef` (`InlineActivityCounters.tsx:50`) n'est jamais resynchronisé.**

D'où la règle qui en découle : toute occurrence rendue pour un jour de données
doit porter une `key` incluant le jour. Sans remontage, changer de jour
laisserait les compteurs affichés sur la journée précédente **et** l'autosave
`PATCH` réécrirait alors la journée affichée avec ces valeurs périmées — perte de
données silencieuse, d'autant plus grave qu'elle n'apparaît que dans le journal
d'audit. C'est fait aujourd'hui par `key={editorDay}` dans
`ScopeDetailPage.tsx:361`. Le flush de la saisie en cours au unmount reste ainsi
correct.

Si vous ajoutez une troisième occurrence de cet éditeur, respectez cette clé.

### Suppression et annulation

La croix FEAI supprime immédiatement et propose « Annuler », **sans
confirmation** : ces éditeurs sont en ligne et à autosave, il n'y a pas de
brouillon à annuler. C'est **l'annulation** qui rend acceptable une cible de
24 px ; si l'on retirait l'annulation, il faudrait remonter la cible, pas
ajouter une modale.

`ActivityFormModal` est le contre-exemple volontaire : là la liste est un
brouillon avec « Annuler » et « Enregistrer », la suppression est donc
réversible gratuitement — ni modale, ni toast d'annulation. Et `Modal` est en
`z-50` comme `ToastContainer` : un toast flotterait à côté du bouton « Annuler »
qui jette toute la saisie en cours.

L'annulation porte sur **toute la rafale**, pas sur la seule dernière
suppression : `undoBurstRef` (`FeaiTagInput.tsx:34`) accumule les retraits tant
qu'ils tombent dans `UNDO_DURATION_MS` (6000 ms, `useToast.tsx:49`), et l'action
rejoue les entrées **à l'envers**. Le debounce rend les rafales plus fréquentes
qu'on ne le croit : deux suppressions à 1,5 s s'effacent en un seul `PATCH`, donc
en un seul écrasement.

### La note du périmètre — un brouillon, pas un autosave

`ScopeNoteCard` est le seul champ éditable de la page de détail qui ne soit pas
un compteur d'activité, et il ne se comporte pas comme eux : c'est un
**brouillon** avec « Enregistrer » / « Annuler ». Un autosave y enverrait un
`PATCH` par frappe au clavier, donc **un événement d'audit par caractère tapé**.

Deux détails qu'il ne faut pas « simplifier » :

- le bouton compare la valeur **nettoyée** à la valeur enregistrée, donc
  « note » et «  note  » ne sont pas considérés comme un brouillon modifié ;
- la carte renvoie la note enregistrée via `onSaved(note)` et la page ne
  recharge rien : un `fetchScopeDetail()` au retour du `PATCH` remettrait
  `isLoading` à vrai et effacerait la journée sélectionnée.

La note est éditable **depuis la page de détail uniquement** : ni la liste, ni la
recherche, ni l'export CSV n'en tiennent compte. Elle est au plus
`NOTE_MAX_LENGTH` (2000) caractères — le serveur refuse au-delà, le champ n'a pas
de `maxLength` pour ne pas tronquer la frappe.

### Saisie d'une référence FEAI

La forme canonique est `[PREFIXE-]INC` + 9 chiffres, préfixe facultatif de 2 à 5
lettres (`FE-INC000000001`). La saisie est tolérante — espace, tiret, slash,
préfixe collé au code — et `normalizeFeai` (`utils/validation.ts`) ramène tout à
la forme stockée, au moment de l'enregistrement et non à la frappe : retransformer
la frappe ferait sauter le curseur, et le `trim()` appliqué à chaque touche rendait
la forme avec espace impossible à saisir.

Les deux éditeurs (`FeaiTagInput` en ligne, `ActivityFormModal` en brouillon) ne
partagent que les règles — `normalizeFeai`, `isValidFeai` et
`FEAI_MAX_LENGTH = 18`. Le doublon se juge donc sur la forme canonique : `FE
INC000000001` et `FE/INC000000001` sont **la même** référence. Le domaine
applique la même canonicalisation (`canonical_feai()`), donc la garantie vaut quel
que soit l'écrivain, `curl` compris.

---

## 8. La page d'analyse — `/analyse`

**Toute la page dérive de `GET /scope-monitorings`.** Aucun appel supplémentaire :
la liste renvoie déjà les périmètres avec leur historique. Un endpoint
d'agrégation côté serveur n'aurait de sens qu'à partir du jour où la charge
dépasse ce que le navigateur tient — et il faudrait alors mesurer avant de le
créer, pas le supposer.

Toute la logique de calcul est **pure** et vit dans `utils/analytics.ts` :
presets de période, bornes, semaines ISO, agrégats, résumé, delta, classement,
**sparklines** et séries. Elle compose `utils/kpi.ts` — `transformationRate`,
`trailingErrors`, `coverageRate`, `isWorkingDay`, `lastWorkingDays` — sans les
reimplémenter : deux définitions concurrentes d'un même chiffre sont un défaut,
pas une extension. Les tests portent donc sur ce module, ce qui est le seul
endroit où ils sont déterministes.

Trois règles qu'un coup d'œil au rendu ne donne pas :

- **Une seule source de vérité pour les filtres**, l'état local ; l'URL en est le
  reflet via un `useEffect`. Écrire l'URL depuis le `setState` placerait un effet
  de bord dans un updater (React peut l'appeler deux fois en mode strict).
- **`scopeIds` s'écrit toujours dans l'URL**, y compris la valeur sentinelle `-`
  pour une sélection vide. Une clé *absente* se lit « tous les périmètres » à la
  résolution : l'URL d'une sélection vide ramènerait l'utilisateur à la vue
  complète sans qu'il l'ait demandée. L'écriture est suspendue pendant le
  chargement, sinon elle figerait une liste vide que le partageur ne retrouverait
  pas.
- **Le chargement affiche un squelette** (`animate-pulse`) au lieu d'un texte nu,
  pour éviter le flash de contenu.

Sous les filtres, la page rappelle la période, le nombre de périmètres sélectionnés,
la granularité réellement affichée, les codes retenus, les jours inclus et la
comparaison éventuelle sous forme de **pills** (badges) au lieu d'un chapelet de
middots ; ce contexte reste visible quand les contrôles ne sont plus dans le
viewport.

La section principale de l'analyse affiche une **heatmap des erreurs** : une ligne
par périmètre, une colonne par jour ou par semaine selon le réglage *Par jour /
Par semaine*, et une cellule dont l'intensité suit le nombre d'erreurs brutes
(`errors_reported`). La valeur est visible dans la cellule, et le libellé
accessible expose aussi l'évolution par rapport à la colonne précédente. Le
classement sous la heatmap est indépendant : il trie les périmètres sur le total
d'erreurs de la période sélectionnée. Les incidents ne sont pas soustraits : cette
vue répond à « combien d'erreurs ont été observées ? ». Une activité à zéro erreur
affiche `0`, alors qu'une période sans activité affiche `—` et porte le libellé
accessible « aucune saisie ».

La **carte de filtres** est compacte et organisée selon la décision à prendre :
**Période** et **Granularité** en chips sur la première ligne, puis **Périmètres
analysés** sur toute la largeur. Les périmètres sont choisis dans un multi-select :
la carte affiche uniquement le déclencheur, la recherche et le compteur `N
périmètres sélectionnés sur M`. La liste complète ouvre un popover desktop, ou la
`Modal` existante sur mobile ; elle contient de vraies cases à cocher, la
recherche, les actions globales et `Terminé`. Les cochages sont appliqués
immédiatement. Une sélection vide reste possible et affiche un message directement
dans la carte au lieu de laisser l'utilisateur deviner pourquoi les graphiques ont
disparu. **Sur mobile (< 768 px), la carte se replie** derrière un bouton
« Filtres » qui affiche le nombre de réglages actifs ; l'export reste accessible
dans l'en-tête même repliée.

Le bloc **Codes de facturation** propose une sélection multiple en chips, y
compris `Sans code` pour les anciens périmètres qui n'ont pas encore de code.
**Tous les codes sont accessibles** (plus de `+N autres` non cliquable) ; le
filtre réduit les périmètres analysés sans effacer leur sélection : retirer le
filtre restaure donc les périmètres précédemment retenus. Les actions `Tout
cocher` et `Tout décocher` s'appliquent uniquement aux périmètres actuellement
visibles après filtrage.

### Chaque bloc mesure une chose différente

La page rassemble les indicateurs de période, la heatmap et le classement :

| Bloc | Résolution | Métrique |
| --- | --- | --- |
| Compteurs de période (+ sparklines) | période entière | erreurs, incidents, en attente, couverture |
| Heatmap | jour ou semaine, selon le réglage | volume d'erreurs observées |
| Classement | période entière | total d'erreurs par périmètre |
| Cellule sans saisie | jour ou semaine | aucune activité distinguée de zéro erreur |

Les **cartes KPI** affichent chacune : une icône, la valeur en `text-3xl` colorée
selon la sévérité (amber pour erreurs/en attente, rose pour incidents, emerald
pour couverture), une **sparkline SVG** (tendance sur la période, domaine fixe
`[0,100]` pour la couverture), et un delta unique « +N % » avec note de bas de
page « Écarts calculés vs période précédente de même longueur » quand la
comparaison est active — plus de répétition « vs période précédente » sur chaque
carte.

La heatmap suit le réglage *Par jour / Par semaine*, et ses en-têtes nomment la
résolution réellement affichée. La heatmap
a un titre et un sous-titre par granularité (« Erreurs par jour et par
périmètre · jours ISO »), ce qui évite qu'un utilisateur lise un détail
journalier là où il n'y a qu'une semaine.

En vue journalière, la heatmap est un `overflow-x-auto` et non un
`overflow-hidden` : 120 jours représentent 120 colonnes d'au moins 2 rem, soit
plusieurs fois la largeur de l'écran. Masquer le débordement laisserait des
colonnes hors d'atteinte, ce qui est pire qu'une barre de défilement. La
colonne des noms est `sticky` pour que les lignes restent identifiables, et la
région devient focusable quand elle déborde réellement, faute de quoi elle
serait inatteignable au clavier. **Le coin `sticky` de l'en-tête est opaque**
(`bg-slate-50` au lieu de `bg-slate-50/80`) pour éviter l'artefact de
superposition au défilement. Les filets blancs entre cellules sont remplacés par
un filet neutre `gap-px` + `rounded-[3px]` + `border-slate-100/60 dark:border-nord-2`,
les paliers d'intensité passent de 3 non contigus à **5 paliers continus
AA-conformes** (`blue-100` → `blue-200` → `blue-300` → `blue-700` → `blue-900` en
clair, `nord-2` → `nord-3` → `nord-7` → `nord-8` → `nord-9` en sombre), chaque
palier portant son texte `text-xs` à ≥4,5:1. Une **légende visuelle** (5 pastilles
+ « `—` : aucune saisie ») est rendue sous la matrice depuis le même tableau
unique `HEATMAP_SCALE`. En vue journalière, un **séparateur de semaine** (filet
`border-l-2`) marque le changement de semaine ISO. Le **total par périmètre**
apparaît dans la cellule de nom (droite, `ml-auto tabular-nums`), évitant une
colonne supplémentaire qui dupliquerait le classement.

Deux plafonds de lisibilité restent explicites parce qu'ils changent ce qui est
affiché : au-delà de **120 jours** l'agrégat passe en semaine — annoncé par un
bandeau, car le choix « par jour » de l'utilisateur est alors ignoré et l'URL
réécrite — et le classement s'arrête aux **15** périmètres les plus exposés,
**avec la mention `+N autres périmètres`**. La heatmap affiche toutes les lignes
sélectionnées : une troncature y ferait disparaître un périmètre sans indiquer
pourquoi.

La heatmap porte aussi la distinction entre une saisie sans erreur et une absence
de saisie : une activité à zéro erreur affiche `0`, tandis qu'une colonne sans
activité affiche `—` et porte le libellé accessible « aucune saisie ». Cette
distinction ne repose donc pas sur la couleur seule. La légende indique également
que la variation compare chaque jour ou semaine à la colonne précédente.

La matrice reste un `overflow-x-auto` : en vue journalière, 120 jours représentent
120 colonnes d'au moins 2 rem. La colonne des noms reste `sticky` et la région
devient focusable lorsqu'elle déborde, afin que le défilement reste accessible au
clavier. Les libellés de date s'affichent un sur N (12 au plus), tandis que chaque
en-tête conserve un `title` et chaque cellule son libellé complet.

### Le reste de la page

Le **classement** est une liste HTML de liens, pas un graphique à barres
horizontales : à quarante périmètres un graphique est un mur, son axe de noms de
140 px mangeait la moitié de la largeur sur mobile, et la seule façon d'y lire une
valeur était de passer la souris dessus. Chaque ligne porte la valeur **en texte** — la
barre est décorative, `aria-hidden` — et la barre est calée sur le pire périmètre,
faute de quoi elle ne comparerait rien. **Le taux de transformation n'est plus
inversé** (la barre suit `totalErrors`, un taux indéfini n'a pas de barre). Un
taux indéfini n'a aucune barre : une barre de longueur nulle se lirait comme un 0 %.

La **sélection des périmètres** utilise un **multi-select compact** (déclencheur
+ popover desktop / `Modal` mobile) avec vraies cases à cocher, recherche, « Tout
cocher » / « Tout décocher » et « Terminé » — plus de rangée de pastilles
`max-h-28`. L'export a été **remonté dans l'en-tête** de la carte de filtres.

---

## 9. Graphiques et styles

La page de détail d'un périmètre (`ScopeDetailCharts.tsx`) ne porte **qu'un**
graphique, « Tendance des erreurs et incidents », en valeurs quotidiennes. C'est
délibéré : c'est la seule échelle qui répond à une question actionnable — quel
jour a eu des erreurs sans incident. Un graphique cumulé y avait sa place, puis
a été retiré (`buildCumulativeTrend`) parce qu'un cumul ne fait qu'augmenter — il
répond « combien depuis le début ? », ce qui ne bouge plus après quelques semaines —
et parce que son arriéré valait `erreurs - incidents` : empiler `incidents` +
`arriéré` reconstruisait `erreurs`, donc la courbe du dessus reproduisait
exactement le haut de son propre empilement. Le même total s'affichait deux fois,
dans deux registres visuels, lisibles comme deux mesures distinctes. L'arriéré
reste lisible comme valeur dans les KPI. Voir `AGENTS.md` §28.6.

### Sparklines sur `/analyse` — pas de recharts

La page `/analyse` n'utilise **pas** `recharts`. Les tendances des 4 métriques
(erreurs, incidents, en attente, couverture) sont rendues par des **sparklines
SVG maison** (`components/Sparkline.tsx`) dans les cartes KPI. Raisons :

- Poids : pas de dépendance lourde (365 kB gzippé pour `LineChart` + deps) pour 4
  micro-courbes.
- Accessibilité : pas de problème d'outline sur `<svg>` (recharts n'a pas
  d'`accessibilityLayer` stable, l'outline nécessite des hacks `className` sur
  le wrapper qui ne marchent pas en production).
- Simplicité : chaque sparkline est un `<svg viewBox>` + un `<path>` avec
  `vector-effect="non-scaling-stroke"`, couleur via `currentColor` héritée du
  texte de la carte (pas de hex en dur). Le domaine est auto-scalé sauf pour la
  couverture (`[0, 100]` fixe).
- Tests : jsdom rend l'inline SVG sans layout, donc le `d` du path est testable
  (contrairement à recharts qui ne monte aucun `<svg>` sous jsdom).

La donnée vient de `aggregateByDay` / `aggregateByWeek` (`utils/analytics.ts:184-197`)
et `coverageByColumn` (nouveau, même fichier) — **code pur déjà testé et jamais
rendu avant ce changement**. Pas de nouvelle logique métier, seulement de la
visualisation.

Deux pièges liés aux recharts, documentés en `AGENTS.md` §28.6 et utiles à
rappeler :

- **L'outline d'un graphique se retire sur le `<svg>`, pas sur le wrapper.**
  `rootTabIndex` vaut `undefined` tant que recharts n'a pas d'`accessibilityLayer`,
  et le `className` de `<LineChart>` atterrit sur le `.recharts-wrapper`, pas
  sur le `<svg>` : le `outline: none` y serait un no-op.
- **`outline-none` sans `outline-solid` supprime au lieu de remplacer.**
  `focus-visible:outline-2` compile en `outline-style: var(--tw-outline-style)`,
  et c'est `outline-none` qui met cette variable à `none` sur le même élément.
  Toujours les associer. `ring-*` ne convient pas ici : Tailwind l'implémente en
  `box-shadow`, que le `<svg>` ne peint pas.

Pour les images : les importer depuis `src/assets/`, jamais par une URL
`public/` — l'import laisse Vite hasher le fichier et valide le chemin à la
compilation. En test, ne comparez le `src` qu'à l'asset importé : Vite *inline*
en `data:` URI ce qui est sous 4 Ko et sert l'autre en fichier.

Pour un fond décoratif : `alt=""` + `aria-hidden="true"`, et sur une page en
`flex`, le conteneur `relative` avec la carte `relative z-10` — un enfant
`absolute` sans `z-index` est peint au-dessus du contenu non positionné.

---

## 10. Tests

```bash
npm test
```

26 fichiers dans `src/test/` (218 tests). `src/test/setup.ts` importe
`@testing-library/jest-dom/vitest` et allonge le délai des assertions asynchrones
(`asyncUtilTimeout`) : une seconde, le défaut, ne suffit pas quand la suite lance un
environnement jsdom par fichier en parallèle et qu'un rendu attend deux réponses
d'API. Ni `ResizeObserver` ni dimensions ne sont mockés, ce qui a des conséquences
(voir `docs/testing.md` §6).

`vite.config.ts` impose `pool: "threads"`. Chaque fichier ouvre son propre jsdom ;
en `forks`, le défaut, cela veut dire un processus node par cœur, et la suite se
faisait tuer par l'OOM sur une machine déjà chargée — l'échec qui en résultait était
un worker mort, pas une régression. Les threads partagent un seul processus, pour
une durée inchangée.

Trois pièges à connaître avant d'écrire un test :

1. La date du jour est une dépendance implicite. Le `beforeEach` de
   `ScopeListPage.test.tsx` la fixe, et elle doit être un **jour ouvré**, sinon
   la page s'ouvre sur le jour ouvré précédent.
2. Un test de correction de saisie doit **changer de jour** ; sinon il passe
   même avec des compteurs périmés.
3. Un test jsdom ne prouve pas un style calculé : sous 0×0, `RootSurface`
   renvoie `null` et le `<svg>` n'est jamais monté.

---

## 11. Ce qui n'existe pas

Par honnêteté, et parce qu'un mainteneur ne doit pas les chercher :

- **Pas de ESLint, pas de Prettier** — `npm run lint` est `tsc --noEmit`.
- **Pas de test end-to-end navigateur** (Playwright, Cypress) : la seule
  couverture automatisée est vitest sur des composants rendus.
- **Pas de gestion d'état globale** ; pas de couche de service abstraite au-delà
  de `protabApi`.
- **Pas d'i18n** : l'interface est en français, en dur dans les composants.
- **Pas de tests de non-régression visuelle**.
- **Pas d'intégration continue** : rien n'exécute `npm test` automatiquement.

---

## 12. Build et déploiement

`npm run build` produit `dist/`, servi par nginx dans l'image `frontend`
(détails dans [`docs/docker-architecture.md`](docker-architecture.md)). Les
artefacts `*.tsbuildinfo` sont régénérés par `tsc -b` et ignorés par
`src/FrontEnd/.gitignore` — pas par celui de la racine, puisque le contexte de
build de l'image `frontend` est `./src/FrontEnd` : seul
`src/FrontEnd/.dockerignore` filtre ce que `COPY . .` embarque.

Si vous ajoutez un type de fichier généré, pensez aux deux `.gitignore` **et**
`.dockerignore`.

---

## 13. Documents voisins

- [`docs/architecture.md`](architecture.md) — l'API consommée par ce frontend.
- [`docs/development.md`](development.md) — commandes et variables.
- [`docs/testing.md`](testing.md) — stratégie et pièges de test.
- `AGENTS.md` §28.6 — invariants normatifs du frontend.
