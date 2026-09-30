/**
 * Jetons de style partagés.
 *
 * Le même arbitrage que `routes.ts` : une valeur dupliquée finit par dériver,
 * et ici la dérive était déjà mesurée — trois tailles, deux mécanismes de
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
 * compilation. Voir le même rappel dans `SupervisionGrid.tsx`.
 */
export const CHECKBOX_CLASS =
  "h-3.5 w-3.5 rounded border-slate-300 accent-blue-600 cursor-pointer focus:ring-2 focus:ring-blue-500 dark:border-nord-3 dark:bg-nord-0 dark:accent-nord-8 dark:focus:ring-nord-8";
