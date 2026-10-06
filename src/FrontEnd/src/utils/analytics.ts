import { NonWorkingDays, ScopeMonitoring } from "../types";
import {
  DEFAULT_NON_WORKING_DAYS,
  toMondayFirstIndex,
} from "../constants/nonWorkingDays";
import { addDaysIso, isValidIsoDate } from "./date";
import {
  coverageRate,
  isWorkingDay,
  lastWorkingDays,
  transformationRate,
  trailingErrors,
} from "./kpi";

/**
 * Agrégations de la page d'analyse.
 *
 * Tout est ici pur et sans horloge : la période arrive en paramètre, ce qui rend
 * chaque calcul testable et évite qu'un `new Date()` glissé dans une formule
 * rende un résultat non reproductible.
 *
 * Ces fonctions ne réimplémentent rien de `kpi.ts` : le taux de
 * transformation, l'arriéré d'une journée et la couverture de saisie ont déjà
 * un sens établi, et le dupliquer créerait deux définitions concurrentes du même
 * chiffre.
 */

export type Granularity = "jour" | "semaine";
export type RangePreset = "7j" | "30j" | "mois" | "tout" | "perso";

/** Nombre de jours au-delà duquel la série n'est plus lisible jour par jour. */
export const MAX_TRACKED_DAYS = 120;

const MS_PER_DAY = 86_400_000;
const MS_PER_WEEK = 7 * MS_PER_DAY;
/** Jour de janvier qui tombe toujours dans la semaine ISO 1. */
const ISO_WEEK_ANCHOR_DAY = 4;
/** Le jeudi décide de l'année ISO : on l'atteint depuis le lundi. */
const ISO_WEEK_ANCHOR_OFFSET_DAYS = 3;


export interface PeriodPoint {
  /** Jour ISO pour une granularité « jour », clé ISO (« 2026-W39 ») pour « semaine ». */
  label: string;
  erreurs: number;
  incidents: number;
  arriere: number;
}

export interface PeriodSummary {
  scopes: number;
  jours: number;
  erreurs: number;
  incidents: number;
  arriere: number;
  /** null quand la période ne contient aucune erreur : un 0 % serait un mensonge. */
  transformation: number | null;
  /** Part des cellules périmètre × jour qui portent une saisie, en %. */
  couverture: number;
  /** Cellules effectivement saisies, tous périmètres confondus. */
  traitees: number;
}

export interface PeriodDelta {
  erreursPct: number | null;
  incidentsPct: number | null;
  arrierePct: number | null;
  couverturePct: number | null;
}

export interface ErrorHeatmapCell {
  /** Jour ISO en granularité « jour », clé ISO (« 2026-W39 ») en « semaine ». */
  column: string;
  errors: number;
  /** Distingue une absence de saisie d'une saisie sans erreur. */
  saisi: boolean;
  changePct: number | null;
}

export interface ErrorHeatmapRow {
  id: string;
  name: string;
  billing_code: string | null;
  cells: ErrorHeatmapCell[];
  totalErrors: number;
}

export interface ErrorHeatmap {
  /** Colonnes de l'axe, triées, partagées par toutes les lignes. */
  columns: string[];
  rows: ErrorHeatmapRow[];
  maxErrors: number;
  granularity: Granularity;
}

function dayCount(from: string, to: string): number {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  const diff = Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd);
  return Math.round(diff / MS_PER_DAY) + 1;
}

/**
 * Rend une plage exploitable : bornes échangées si inversées, borne haute
 * ramenée à la date du jour. Un `from` postérieur à `to` vient d'une saisie
 * manuelle des deux champs, pas d'une intention — l'inverser vaut mieux qu'un
 * graphique vide.
 */
export function normalizeRange(
  from: string,
  to: string,
  max?: string,
): { from: string; to: string } {
  let start = from;
  let end = to;
  if (start > end) [start, end] = [end, start];
  if (max && isValidIsoDate(max)) {
    if (end > max) end = max;
    if (start > max) start = max;
  }
  return { from: start, to: end };
}

/**
 * Ramène une plage aux `maxDays` jours les plus récents, en gardant sa fin.
 *
 * La fin est sacrifiée en premier : c'est l'information la plus fraîche, et
 * c'est le début qu'un utilisateur willing de faire défiler loin à gauche.
 */
export function clampRange(
  from: string,
  to: string,
  maxDays: number,
): { from: string; to: string } {
  const range = normalizeRange(from, to);
  if (dayCount(range.from, range.to) <= maxDays) return range;
  return { from: addDaysIso(range.to, -(maxDays - 1)), to: range.to };
}

export function buildPeriodDays(
  from: string,
  to: string,
  config: NonWorkingDays = DEFAULT_NON_WORKING_DAYS,
  workingDaysOnly = true,
): string[] {
  const range = normalizeRange(from, to);
  if (!isValidIsoDate(range.from) || !isValidIsoDate(range.to)) return [];

  const days: string[] = [];
  for (let day = range.from; day <= range.to; day = addDaysIso(day, 1)) {
    if (!workingDaysOnly || isWorkingDay(day, config)) days.push(day);
  }
  return days;
}

/**
 * Clé de semaine ISO (`2026-W39`).
 *
 * Le jeudi de la semaine décide de l'année : sans lui, les derniers jours de
 * décembre tombent dans la semaine 1 de l'année suivante, ce qui dessinerait une
 * série qui remonte en plein décembre.
 */
export function isoWeekKey(day: string): string {
  const date = new Date(`${day}T00:00:00Z`);
  const mondayIndex = toMondayFirstIndex(date.getUTCDay());
  date.setUTCDate(date.getUTCDate() - mondayIndex + ISO_WEEK_ANCHOR_OFFSET_DAYS);

  const isoYear = date.getUTCFullYear();
  const firstThursday = new Date(Date.UTC(isoYear, 0, ISO_WEEK_ANCHOR_DAY));
  const firstThursdayIndex = toMondayFirstIndex(firstThursday.getUTCDay());
  firstThursday.setUTCDate(
    firstThursday.getUTCDate() - firstThursdayIndex + ISO_WEEK_ANCHOR_OFFSET_DAYS,
  );

  const elapsedWeeks = (date.getTime() - firstThursday.getTime()) / MS_PER_WEEK;
  const week = 1 + Math.round(elapsedWeeks);
  return `${isoYear}-W${String(week).padStart(2, "0")}`;
}

export function weekLabel(isoWeek: string): string {
  return isoWeek.replace(/^\d{4}-W/, "S");
}

export function aggregateByDay(
  scopes: ScopeMonitoring[],
  days: string[],
): PeriodPoint[] {
  return sumByLabel(scopes, days, (day) => day);
}

export function aggregateByWeek(
  scopes: ScopeMonitoring[],
  days: string[],
): PeriodPoint[] {
  const labelOf = (day: string) => isoWeekKey(day);
  return sumByLabel(scopes, days, labelOf);
}

/**
 * Prépare la heatmap d'erreurs : une ligne par périmètre et une colonne par
 * jour ou par semaine, selon la granularité demandée.
 *
 * Les colonnes sans activité restent présentes avec une valeur nulle afin que
 * toutes les lignes partagent le même axe. `changePct` compare chaque colonne à
 * la précédente **affichée** : en granularité jour, deux colonnes consécutives
 * peuvent être séparées par un week-end si les jours non ouvrés sont filtrés,
 * et la comparaison porte donc bien sur la colonne voisine, pas sur la veille
 * calendaire.
 */
export function buildErrorHeatmap(
  scopes: ScopeMonitoring[],
  days: string[],
  granularity: Granularity = "semaine",
): ErrorHeatmap {
  const labelOf = granularity === "jour" ? (day: string) => day : isoWeekKey;
  const columns = [...new Set(days.map(labelOf))].sort();
  const daySet = new Set(days);
  let maxErrors = 0;

  const rows = scopes.map((scope): ErrorHeatmapRow => {
    const errorsByColumn = new Map<string, number>();
    const saisiByColumn = new Set<string>();
    (scope.daily_activities || []).forEach((activity) => {
      if (!daySet.has(activity.day)) return;
      const column = labelOf(activity.day);
      saisiByColumn.add(column);
      errorsByColumn.set(
        column,
        (errorsByColumn.get(column) ?? 0) + activity.errors_reported,
      );
    });

    const cells = columns.map((column, index) => {
      const errors = errorsByColumn.get(column) ?? 0;
      maxErrors = Math.max(maxErrors, errors);
      const previous =
        index === 0 ? null : errorsByColumn.get(columns[index - 1]) ?? 0;
      return {
        column,
        errors,
        saisi: saisiByColumn.has(column),
        changePct: previous === null || previous === 0
          ? null
          : Math.round(((errors - previous) / previous) * 100),
      };
    });

    return {
      id: scope.id,
      name: scope.name,
      billing_code: scope.billing_code,
      cells,
      totalErrors: cells.reduce((total, cell) => total + cell.errors, 0),
    };
  });

  return {
    columns,
    rows: rows.sort(
      (a, b) => b.totalErrors - a.totalErrors || a.name.localeCompare(b.name),
    ),
    maxErrors,
    granularity,
  };
}

function sumByLabel(
  scopes: ScopeMonitoring[],
  days: string[],
  labelOf: (day: string) => string,
): PeriodPoint[] {
  const totals = new Map<string, PeriodPoint>();
  // Les points sont triés à la fin plutôt que dans l'ordre de `days` : un
  // appelant qui passe les jours dans le désordre obtiendrait un axe temporel
  // qui recule, ce qui se lit comme des données corrompues.
  days.forEach((day) => {
    const label = labelOf(day);
    if (!totals.has(label)) {
      totals.set(label, { label, erreurs: 0, incidents: 0, arriere: 0 });
    }
  });

  scopes.forEach((scope) => {
    (scope.daily_activities || []).forEach((activity) => {
      const entry = totals.get(labelOf(activity.day));
      if (!entry) return;
      entry.erreurs += activity.errors_reported;
      entry.incidents += activity.incidents_created;
      entry.arriere += trailingErrors(
        activity.errors_reported,
        activity.incidents_created,
      );
    });
  });

  return [...totals.values()].sort((a, b) => a.label.localeCompare(b.label));
}

export function computePeriodSummary(
  scopes: ScopeMonitoring[],
  days: string[],
): PeriodSummary {
  const totals = sumByLabel(scopes, days, (day) => day).reduce(
    (acc, point) => ({
      erreurs: acc.erreurs + point.erreurs,
      incidents: acc.incidents + point.incidents,
      arriere: acc.arriere + point.arriere,
    }),
    { erreurs: 0, incidents: 0, arriere: 0 },
  );

  const daySet = new Set(days);
  const traitees = scopes.reduce(
    (acc, scope) =>
      acc +
      (scope.daily_activities || []).filter((a) => daySet.has(a.day)).length,
    0,
  );

  return {
    scopes: scopes.length,
    jours: days.length,
    erreurs: totals.erreurs,
    incidents: totals.incidents,
    arriere: totals.arriere,
    transformation: transformationRate(totals.incidents, totals.erreurs),
    couverture: coverageRate(scopes, days),
    traitees,
  };
}

/** Période de même longueur immédiatement antérieure, bornes incluses. */
export function previousPeriod(from: string, to: string): { from: string; to: string } {
  const length = dayCount(from, to);
  const end = addDaysIso(normalizeRange(from, to).from, -1);
  return { from: addDaysIso(end, -(length - 1)), to: end };
}

function pctChange(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export function periodDelta(
  current: PeriodSummary,
  previous: PeriodSummary,
): PeriodDelta {
  return {
    erreursPct: pctChange(current.erreurs, previous.erreurs),
    incidentsPct: pctChange(current.incidents, previous.incidents),
    arrierePct: pctChange(current.arriere, previous.arriere),
    couverturePct: pctChange(current.couverture, previous.couverture),
  };
}

export function firstActivityDay(scopes: ScopeMonitoring[]): string | null {
  let first: string | null = null;
  scopes.forEach((scope) => {
    (scope.daily_activities || []).forEach((activity) => {
      if (first === null || activity.day < first) first = activity.day;
    });
  });
  return first;
}

export function resolvePresetRange(
  preset: Exclude<RangePreset, "perso">,
  today: string,
  config: NonWorkingDays = DEFAULT_NON_WORKING_DAYS,
  firstDay?: string | null,
): { from: string; to: string } {
  switch (preset) {
    case "7j":
      return { from: lastWorkingDays(today, 7, config).at(-1) ?? today, to: today };
    case "30j":
      return { from: addDaysIso(today, -29), to: today };
    case "mois":
      return { from: `${today.slice(0, 7)}-01`, to: today };
    case "tout":
      return { from: firstDay ?? today, to: today };
  }
}

export function periodDaysFor(
  from: string,
  to: string,
  granularity: Granularity,
  config: NonWorkingDays = DEFAULT_NON_WORKING_DAYS,
  workingDaysOnly = true,
): string[] {
  return buildPeriodDays(from, to, config, workingDaysOnly);
}

/**
 * Couverture de saisie par colonne (jour ou semaine), en %.
 *
 * Réutilise `coverageRate` de `kpi.ts` par groupe de jours : on ne réimplémente
 * pas le taux — deux définitions concurrentes d'un même chiffre sont un défaut,
 * pas une extension (§28.6).
 */
export function coverageByColumn(
  scopes: ScopeMonitoring[],
  days: string[],
  granularity: Granularity,
): number[] {
  if (days.length === 0 || scopes.length === 0) return [];

  const labelOf = granularity === "jour" ? (day: string) => day : isoWeekKey;
  const columns = [...new Set(days.map(labelOf))].sort();

  return columns.map((column) => {
    const columnDays = days.filter((day) => labelOf(day) === column);
    return coverageRate(scopes, columnDays);
  });
}
