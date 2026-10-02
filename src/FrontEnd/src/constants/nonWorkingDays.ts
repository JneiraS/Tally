import type { NonWorkingDays } from "../types";

/**
 * L'échelle ISO des jours, source unique côté front.
 *
 * Le même arbitrage que `routes.ts` et `ui.ts` : une valeur dupliquée dérive,
 * et ici la dérive est mesurée — `[6, 7]` écrit en dur dans le défaut, les bornes
 * réécrites dans le validateur de l'API, et deux conversions dimanche → ISO
 * handwritten dans `kpi.ts` et dans `analytics.ts`. Une seule de ces copies dit
 * quoi est un jour ouvré, donc une seule doit exister.
 *
 * `getDay()` et `getUTCDay()` numérotent tous deux **à partir du dimanche**, et
 * l'ISO à partir du lundi : d'où les deux conversions ci-dessous. Elles
 * prennent le numéro du jour et non la date, pour que l'appelant reste maître
 * de l'horloge qu'il manipule — `kpi.ts` raisonne en UTC sur des dates ISO,
 * `auditStats.ts` en heure locale parce que son audience est locale. Le
 * confondre ici uniformiserait un affichage qui ne doit pas l'être.
 */
export const ISO_WEEKDAY_MIN = 1;
export const ISO_WEEKDAY_MAX = 7;

/** Un jour de l'échelle ISO : 1 = lundi … 7 = dimanche. */
export type IsoWeekday =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7;

export const ISO_MONDAY: IsoWeekday = 1;
export const ISO_SUNDAY: IsoWeekday = 7;
export const ISO_SATURDAY: IsoWeekday = 6;

/** Taille de la semaine ISO : le nombre de jours entre deux occurrences d'un même jour. */
export const ISO_WEEKDAY_COUNT: number = ISO_WEEKDAY_MAX - ISO_WEEKDAY_MIN + 1;

/**
 * Libellés de la semaine, dans l'ordre ISO.
 *
 * La table est ici plutôt que dans la modale de réglages : elle indexe
 * l'échelle, donc elle partage sa source.
 */
export const WEEKDAY_LABELS: ReadonlyArray<readonly [IsoWeekday, string]> = [
  [1, "Lun"],
  [2, "Mar"],
  [3, "Mer"],
  [4, "Jeu"],
  [5, "Ven"],
  [6, "Sam"],
  [7, "Dim"],
];

/** Week-end écarté par défaut : la semaine ISO ouvrée est du lundi au vendredi. */
export const DEFAULT_EXCLUDED_WEEKDAYS: readonly IsoWeekday[] = [
  ISO_SATURDAY,
  ISO_SUNDAY,
];

export const DEFAULT_NON_WORKING_DAYS: NonWorkingDays = {
  excluded_weekdays: [...DEFAULT_EXCLUDED_WEEKDAYS],
  excluded_dates: [],
};

/** Numéro ISO (1 = lundi) d'un numéro JS (0 = dimanche). */
export function toIsoWeekday(sundayBasedDay: number): IsoWeekday {
  return (sundayBasedDay === 0 ? ISO_WEEKDAY_MAX : sundayBasedDay) as IsoWeekday;
}

/** Index lundi-premier (0 = lundi) d'un numéro JS (0 = dimanche). */
export function toMondayFirstIndex(sundayBasedDay: number): number {
  return (sundayBasedDay + 6) % 7;
}