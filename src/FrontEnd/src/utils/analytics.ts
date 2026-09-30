import { NonWorkingDays, ScopeMonitoring } from "../types";
import { addDaysIso, isValidIsoDate } from "./date";
import {
  DEFAULT_NON_WORKING_DAYS,
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

export type CellState = "traite" | "encours" | "nonSaisi";

export interface GridCell {
  day: string;
  etat: CellState;
  erreurs: number;
  incidents: number;
  arriere: number;
  /** Palier d'intensité 0-2, à charge de la couleur seule. */
  niveau: number;
}

export interface GridRow {
  id: string;
  name: string;
  billing_code: string | null;
  cells: GridCell[];
  arriere: number;
  erreurs: number;
}

export interface SupervisionGrid {
  rows: GridRow[];
  jours: string[];
  maxArriere: number;
}

function dayCount(from: string, to: string): number {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  const diff = Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd);
  return Math.round(diff / 86_400_000) + 1;
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
  const mondayIndex = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - mondayIndex + 3);

  const isoYear = date.getUTCFullYear();
  const firstThursday = new Date(Date.UTC(isoYear, 0, 4));
  const firstThursdayIndex = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstThursdayIndex + 3);

  const week = 1 + Math.round((date.getTime() - firstThursday.getTime()) / 604_800_000);
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
    (scope.daily_activities || []).forEach((activity) => {
      if (!daySet.has(activity.day)) return;
      const column = labelOf(activity.day);
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

export function scaleBucket(value: number, max: number): number {
  if (value <= 0 || max <= 0) return 0;
  return value <= max / 2 ? 1 : 2;
}

export function buildSupervisionGrid(
  scopes: ScopeMonitoring[],
  days: string[],
  granularity: Granularity = "jour",
): SupervisionGrid {
  // En agrégat semaine, une colonne porte plusieurs jours : l'état retenu est
  // le plus dégradé de la semaine, sinon une semaine traitée mais inachevée
  // s'afficherait verte.
  const columnDays = columnDaysFor(days, granularity);
  let maxArriere = 0;
  const rows = scopes.map((scope): GridRow => {
    const byDay = new Map(
      (scope.daily_activities || []).map((activity) => [activity.day, activity]),
    );

    const cells = columnDays.map((column): GridCell => {
      const entries = column.days
        .map((day) => byDay.get(day))
        .filter((a): a is ScopeMonitoring["daily_activities"][number] => a !== undefined);
      if (entries.length === 0) {
        return {
          day: column.label,
          etat: "nonSaisi",
          erreurs: 0,
          incidents: 0,
          arriere: 0,
          niveau: 0,
        };
      }
      const erreurs = entries.reduce((acc, a) => acc + a.errors_reported, 0);
      const incidents = entries.reduce((acc, a) => acc + a.incidents_created, 0);
      const arriere = trailingErrors(erreurs, incidents);
      maxArriere = Math.max(maxArriere, arriere);
      return {
        day: column.label,
        etat: entries.some((a) => !a.completed) ? "encours" : "traite",
        erreurs,
        incidents,
        arriere,
        niveau: 0,
      };
    });

    return {
      id: scope.id,
      name: scope.name,
      billing_code: scope.billing_code,
      cells,
      arriere: cells.reduce((acc, cell) => acc + cell.arriere, 0),
      erreurs: cells.reduce((acc, cell) => acc + cell.erreurs, 0),
    };
  });

  // Le niveau se calcule une fois le maximum connu : une couleur comparée à une
  // échelle locale change de sens d'une ligne à l'autre.
  rows.forEach((row) => {
    row.cells.forEach((cell) => {
      cell.niveau = scaleBucket(cell.arriere, maxArriere);
    });
  });

  return {
    rows,
    jours: columnDays.map((column) => column.label),
    maxArriere,
  };
}

function columnDaysFor(
  days: string[],
  granularity: Granularity,
): { label: string; days: string[] }[] {
  if (granularity === "jour") {
    return days.map((day) => ({ label: day, days: [day] }));
  }

  const grouped = new Map<string, string[]>();
  days.forEach((day) => {
    const key = isoWeekKey(day);
    const bucket = grouped.get(key);
    if (bucket) bucket.push(day);
    else grouped.set(key, [day]);
  });
  return [...grouped.entries()].map(([label, weekDays]) => ({ label, days: weekDays }));
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
