/**
 * Jetons de style partagés.
 *
 * Le même arbitrage que `routes.ts` : une valeur dupliquée finit par dériver,
 * et ici la dérive était déjà mesurée — deux tailles, deux mécanismes de
 * couleur (`text-*` contre `accent-*`), deux jetons de bordure et deux
 * traitements de focus pour six cases à cocher.
 *
 * `accent-*` et non `text-*` : c'est `accent-color` qui colore une case à cocher
 * native. La couleur de texte n'est qu'un contournement, dont le rendu dépend du
 * navigateur — deux cases identiques n'affichaient donc pas la même couleur.
 *
 * **La classe doit rester une chaîne littérale complète.** Tailwind extrait les
 * noms de classes par analyse statique du source : une clé construite par
 * concaténation ne serait jamais générée, et le style disparaît sans erreur de
 * compilation. La preuve se fait dans le CSS compilé, pas seulement dans les
 * tests jsdom, qui ne calculent pas les couleurs natives.
 */
export const CHECKBOX_CLASS =
  "h-3.5 w-3.5 rounded border-slate-300 accent-blue-600 cursor-pointer focus:ring-2 focus:ring-blue-500 dark:border-nord-3 dark:bg-nord-0 dark:accent-nord-8 dark:focus:ring-nord-8";

/**
 * Primitives de carte — surface, padding, titres.
 *
 * La classe de carte était recopiée 14 fois dans le dépôt. Cette déclaration unique
 * ne couvre **que les 5 usages de la page `/analyse`** pour l'instant ; la migration
 * des 9 autres occurrences est un suivi séparé. Ne pas présenter cette constante
 * comme si elle était déjà utilisée partout — `AGENTS.md` §23 l'interdit.
 */
export const CARD_CLASS =
  "bg-white dark:bg-nord-1 rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs";

export const CARD_PADDING_CLASS = "p-4 sm:p-5";

export const CARD_TITLE_CLASS =
  "text-sm font-semibold text-slate-800 dark:text-nord-5";

export const CARD_SUBTITLE_CLASS =
  "text-xs text-slate-500 dark:text-nord-4";

/**
 * Échelle de la heatmap — 5 paliers, chacun conforme ≥4,5:1 pour le texte `text-xs`.
 *
 * La palette `index.css` ne fournit que 5 paliers utilisables en clair
 * (`blue-100`, `blue-200`, `blue-300`, `blue-700`, `blue-900`) et 5 en sombre
 * (`nord-2`, `nord-3`, `nord-7`, `nord-8`, `nord-9`) — `blue-400/500/600`
 * et `nord-10` ne portent **aucun** texte à 4,5:1 (mesuré).
 *
 * Chaque entrée contient `cell` (la classe complète de la cellule),
 * `legend` (la pastille de la légende) et `plain` (sans texte, pour la légende).
 * Tailwind v4 exige des chaînes littérales complètes : pas d'interpolation.
 */
export const HEATMAP_SCALE = [
  {
    max: 0,
    cell: "bg-slate-50 text-slate-600 dark:bg-nord-2 dark:text-nord-4",
    legend: "bg-slate-50 dark:bg-nord-2",
    plain: "bg-slate-50 dark:bg-nord-2",
  },
  {
    max: 0.2,
    cell: "bg-blue-100 text-slate-700 dark:bg-nord-3 dark:text-nord-6",
    legend: "bg-blue-100 dark:bg-nord-3",
    plain: "bg-blue-100 dark:bg-nord-3",
  },
  {
    max: 0.4,
    cell: "bg-blue-200 text-slate-900 dark:bg-nord-7 dark:text-nord-0",
    legend: "bg-blue-200 dark:bg-nord-7",
    plain: "bg-blue-200 dark:bg-nord-7",
  },
  {
    max: 0.6,
    cell: "bg-blue-300 text-slate-900 dark:bg-nord-8 dark:text-nord-0",
    legend: "bg-blue-300 dark:bg-nord-8",
    plain: "bg-blue-300 dark:bg-nord-8",
  },
  {
    max: 1,
    cell: "bg-blue-900 text-white dark:bg-nord-9 dark:text-nord-0",
    legend: "bg-blue-900 dark:bg-nord-9",
    plain: "bg-blue-900 dark:bg-nord-9",
  },
] as const;

export type HeatmapScaleStep = (typeof HEATMAP_SCALE)[number];