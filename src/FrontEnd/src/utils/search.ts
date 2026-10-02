/**
 * Recherche de la page principale : prédicat de correspondance et priorité
 * d'affichage. Logique pure, testée dans `src/test/search.test.ts`.
 */

export interface SearchableScope {
  name: string;
  knowledge_base_id: string;
  official_main: string;
  official_backup: string;
  billing_code: string | null;
}

const SEARCHED_FIELDS = [
  "name",
  "knowledge_base_id",
  "official_main",
  "official_backup",
  "billing_code",
] as const;

/**
 * Champs par lesquels une recherche filtre, tous insensibles à la casse.
 *
 * `billing_code` est nullable sur les périmètres enregistrés avant son
 * introduction : l'absence est traitée comme une chaîne vide plutôt que
 * d'exclure le périmètre de la recherche.
 */
export function matchesSearchQuery(
  scope: SearchableScope,
  query: string,
): boolean {
  const needle = query.toLowerCase();
  return SEARCHED_FIELDS.some((field) =>
    (scope[field] ?? "").toLowerCase().includes(needle),
  );
}

export const OFFICIAL_MATCH_RANK = {
  main: 0,
  backup: 1,
  other: 2,
} as const;

/**
 * Rang d'un périmètre pour une recherche donnée : plus il est bas, plus le
 * résultat remonte.
 *
 * Le responsable (`official_main`) passe avant le suppléant
 * (`official_backup`), et un périmètre que la requête n'atteint qu'au nom,
 * à la base KB ou au code de facturation passe après les deux.
 *
 * La comparaison porte sur la chaîne entière, sans découper sur « / » : c'est
 * le `includes` de `matchesSearchQuery` qui décide de l'inclusion, donc c'est
 * lui qui doit décider du rang. Un découpage par code classerait différemment
 * de ce qui a filtré, et afficherait « sans correspondance » un périmètre
 * retenu à l'écran.
 */
export function officialMatchRank(
  scope: SearchableScope,
  query: string,
): number {
  const needle = query.toLowerCase();
  if (scope.official_main.toLowerCase().includes(needle)) {
    return OFFICIAL_MATCH_RANK.main;
  }
  if (scope.official_backup.toLowerCase().includes(needle)) {
    return OFFICIAL_MATCH_RANK.backup;
  }
  return OFFICIAL_MATCH_RANK.other;
}

/**
 * Range les résultats par priorité de correspondance, sans toucher à l'ordre
 * d'arrivée à rang égal.
 *
 * Le rang est décoré puis trié avec l'index d'origine en second critère :
 * l'ordre du serveur est alors une garantie structurelle et non une propriété
 * implicite de `Array.prototype.sort`. L'API renvoyant les périmètres par nom
 * (`ORDER BY name`), chaque groupe reste donc alphabétique.
 *
 * Une requête vide donne le même rang à tout le monde, donc ne déplace rien :
 * la liste reste celle du serveur tant qu'on ne filtre pas.
 */
export function sortByOfficialRelevance<T extends SearchableScope>(
  items: T[],
  query: string,
): T[] {
  return items
    .map((item, index) => ({ item, index, rank: officialMatchRank(item, query) }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map((entry) => entry.item);
}