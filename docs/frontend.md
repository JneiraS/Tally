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
├── hooks/                useTheme, useToast
├── pages/                ScopeListPage, ScopeDetailPage, AnalyticsPage,
│                         AuditLogPage, LoginPage, NotFoundPage
├── components/           25 composants (modales, éditeurs, graphiques, toasts)
└── utils/                kpi, date, export, validation, knowledgeBase,
                          auditStats, analytics
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
`src/constants/routes.ts` (`AUDIT_LOG_PATH = "/audit-log"`) et repris
symétriquement dans `app.py`, `nginx.conf` et `vite.config.ts`. La sécurité ne
repose pas sur l'opacité du chemin mais sur le cookie de session : ne
rétablissez pas l'ancien chemin haché.

Le proxy de développement est déclaré dans `vite.config.ts` pour
`/scope-monitorings`, `/audit-log` et `/project/settings`, tous vers
`http://localhost:8000`. **Ajouter une route API en développement impose
d'ajouter son chemin ici**, sinon CORS.

Routage applicatif : `SCOPE_LIST_PATH`, `/scopes/:id`, `ANALYTICS_PATH`
(`/analyse`), `AUDIT_LOG_PATH`, et `*` → `NotFoundPage`. Les quatre chemins de la
SPA sont eux aussi des constantes de `routes.ts`, pour la même raison que les
chemins d'API : une page ajoutée avec un littéral dans `App.tsx` dérive de la
navigation d'un coup.

**`/analyse` n'a pas de location nginx.** Le `try_files … /index.html` de la
SPA sert déjà les routes inconnues ; un bloc dédié serait un no-op qui donnerait
l'illusion d'une étape nécessaire.

`PageNav` porte les trois liens (Périmètres · Analyse · Journal) et est monté
deux fois : dans l'en-tête (`md` et au-dessus) et dans le pied de page, qui n'est
visible qu'en dessous. Sur mobile l'en-tête se condense et la navigation doit
rester atteignable sans revenir par le logo.

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
vient de `defaultDisplayDay()` (`utils/kpi.ts:83`) : la date du jour si elle est
ouvrée, sinon le dernier jour ouvré.

Un jour non ouvré n'a rien à afficher ni à saisir. Deux règles d'affichage
complètent le tableau :

- Un bandeau `role="status"` « N périmètres non traités » sur le dernier jour
  ouvré : il **nomme** les périmètres concernés et filtre la liste sur eux.
- À défaut, une notice « aucune saisie » nommant la dernière saisie et
  proposant de l'afficher. Les deux ne doivent jamais coexister : deux
  `role="status"` simultanés rendraient l'un des deux inatteignable.

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

---

## 8. La page d'analyse — `/analyse`

**Toute la page dérive de `GET /scope-monitorings`.** Aucun appel supplémentaire :
la liste renvoie déjà les périmètres avec leur historique. Un endpoint
d'agrégation côté serveur n'aurait de sens qu'à partir du jour où la charge
dépasse ce que le navigateur tient — et il faudrait alors mesurer avant de le
créer, pas le supposer.

Toute la logique de calcul est **pure** et vit dans `utils/analytics.ts` :
presets de période, bornes, semaines ISO, agrégats, résumé, delta, classement,
séries empilées, grille. Elle compose `utils/kpi.ts` — `transformationRate`,
`trailingErrors`, `coverageRate`, `isWorkingDay`, `lastWorkingDays` — sans les
reimplémenter : deux définitions concurrentes d'un même chiffre sont un défaut,
pas une.extension. Les tests portent donc sur ce module, ce qui est le seul
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
- **Le tri du classement est toujours « du plus dégradé au moins dégradé »**, y
  compris pour le taux de transformation (croissant). C'est le seul ordre qui sert
  un superviseur ; faire varier le sens de lecture selon la métrique lui serait une
  faute. Un taux indéfini (aucune erreur) passe en dernier dans les deux sens
  plutôt que d'être traité comme un 0 %.

La barre de filtres expose aussi l'**indicateur du classement** (`En attente`,
`Erreurs`, `Incidents` ou `Transformation`). Le choix pilote le classement sans
changer les cartes KPI ni la série empilée : ces trois zones répondent à des
questions différentes et ne doivent pas changer de sens implicitement. Sous les
filtres, la page rappelle la période, le nombre de périmètres sélectionnés et la
granularité réellement affichée ; ce contexte reste visible quand les contrôles
ne sont plus dans le viewport.

Deux plafonds de lisibilité, explicites parce qu'ils changent ce qui est affiché :
au-delà de **120 jours** l'agrégat passe en semaine (annoncé à l'utilisateur, car
son choix « par jour » est ignoré), et au-delà de **8 périmètres** l'aire empilée
garde le top 8 plus un « Autres (n) » en gris neutre. Le classement, lui, s'arrête
à 15 lignes et renvoie vers la grille pour le reste.

### La grille tient dans la largeur, ou n'affiche pas

La **grille de supervision** (ligne = périmètre, colonne = jour) est la signature
de la page : c'est ce qu'aucun graphique ne montre d'aussi bien. L'état d'une
cellule ne peut pas être porté par la seule couleur — chaque pastille porte un
`aria-label` complet (« Alpha, lundi 21 septembre 2026 : traité, 3 en attente »),
la ligne entière est un lien vers le détail, et un résumé `role="img"` porte les
totaux. En agrégat semaine, une colonne porte plusieurs jours et l'état retenu est
le plus dégradé de la semaine, sinon une semaine traitée mais inachevée
s'afficherait verte.

Elle reste un `<table>` : la navigation au clavier suit les jours, ce qu'une suite
de `div` ne ferait pas. Elle tient dans la largeur **par construction** — un
`<colgroup>` fixe la colonne de nom à 11 rem et un `<col>` par jour, le tableau est
en `table-fixed`, donc les colonnes se partagent l'espace restant et ne peuvent pas
déborder.

C'est un choix à contre-courant du réflexe « je mets un `overflow-x-auto` autour ».
Un conteneur défilant ne supprime pas le débordement, il le rend consultable — au
prix d'une barre de défilement permanente dès une quinzaine de jours, et d'une
première colonne que le lecteur doit faire glisser pour retrouver. Le `min-w-max`
qui va avec est la cause exacte : il confie la largeur au contenu, si bien que le
tableau déborde dès que le contenu est plus large que la fenêtre. Aucune des deux
classes ne doit revenir ; les tests le vérifient (`SupervisionGrid.test.tsx`).

Deux conséquences assumées :

- **Les libellés de date s'affichent un sur N** (12 au plus, soit environ tous les
  5 jours sur un trimestre), sinon ils se chevauchent. Les colonnes muettes gardent
  un nom accessible et un `title`, donc la grille reste complète pour un lecteur
  d'écran comme à la souris.
- **Les cellules rétrécissent** et finissent par n'être qu'un ruban de couleur.
  Aucune règle ne force la semaine au-delà d'un certain nombre de colonnes : ce
  serait ignorer un choix explicite de l'utilisateur, et l'agrégat semaine est
  accessible d'un clic. Le test compte les cellules pour garantir qu'aucun jour
  n'est *masqué* — la rétrécissement ne doit jamais se payer en données perdues.

### Le reste de la page

Le **classement** est une liste HTML de liens, pas un graphique à barres
horizontales : à quarante périmètres un graphique est un mur, son axe de noms de
140 px mangeait la moitié de la largeur sur mobile, et la seule façon d'y lire une
valeur était de passer la souris dessus. Chaque ligne porte la valeur **en texte** — la
barre est décorative, `aria-hidden` — et la barre est calée sur le pire périmètre,
faute de quoi elle ne comparerait rien. Pour le taux de transformation la barre est
**inversée** (`100 − taux`), sinon le périmètre le plus dégradé, en tête de liste,
recevrait la barre la plus courte. Un taux indéfini n'a aucune barre : une barre de
longueur nulle se lirait comme un 0 %.

La **sélection des périmètres** est une rangée de pastilles, avec les 12 premières
visibles et un bouton « +N autres » qui déploie la suite en ligne. La liste était
dans une boîte `max-h-28 overflow-y-auto` : cinq périmètres suffisaient à faire
apparaître une barre de défilement pour une sélection qui se lit d'un coup d'œil.
Le déploiement ne passe pas par une modale — son « Annuler » doublonnerait celui de
la page, et sa superposition masquerait le graphique qu'on est en train de filtrer.

---

## 9. Graphiques et styles

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

24 fichiers dans `src/test/`. `src/test/setup.ts` importe
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
