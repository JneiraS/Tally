import { isKo } from "../constants/dayStatus";
import {
  DEFAULT_NON_WORKING_DAYS,
  ISO_WEEKDAY_COUNT,
  toIsoWeekday,
  toMondayFirstIndex,
} from "../constants/nonWorkingDays";
import type {
  DailyActivity,
  IsoWeekday,
  MonitoringSchedule,
  NonWorkingDays,
  ScopeMonitoring,
} from "../types";
import { addDaysIso } from "./date";

/**
 * Profondeur des deux séries fondées sur les jours ouvrés : la tendance du
 * graphique et la baseline du delta. Unité en jours *ouvrés*, pas calendaires,
 * d'où le nom.
 */
const WORKING_DAYS_WINDOW = 7;

export interface BaselineDelta {
  deltaPct: number | null;
  direction: "up" | "down" | "flat";
  avg: number;
  todayTotal: number;
}

export interface DailyTrendPoint {
  day: string;
  erreurs: number;
  incidents: number;
}

export function lastNDays(today: string, n: number): string[] {
  const days: string[] = [];
  const date = new Date(today);
  for (let i = 0; i < n; i++) {
    days.push(date.toISOString().split("T")[0]);
    date.setDate(date.getDate() - 1);
  }
  return days;
}

export function isWorkingDay(
  isoDate: string,
  config: NonWorkingDays = DEFAULT_NON_WORKING_DAYS,
): boolean {
  const date = new Date(`${isoDate}T00:00:00Z`);
  const isoWeekday = toIsoWeekday(date.getUTCDay());
  return (
    !config.excluded_weekdays.includes(isoWeekday) &&
    !config.excluded_dates.includes(isoDate)
  );
}

/**
 * Bornes de la périodicité, alignées sur `MIN_INTERVAL_WEEKS` /
 * `MAX_INTERVAL_WEEKS` du domaine. Elles ne sont pas recopiées au hasard : le
 * serveur refuse hors bornes, et la lecture se protège de la même façon pour
 * qu'une valeur stockée à la main ne produise pas un cycle absurde.
 */
export const MIN_INTERVAL_WEEKS = 1;
export const MAX_INTERVAL_WEEKS = 12;

/** Lundi de référence quand le périmètre n'a pas d'ancre : 1970-01-05. */
const DEFAULT_SCHEDULE_ANCHOR = "1970-01-05";
const MS_PER_WEEK = 7 * 86_400_000;

function isoWeekdayOf(isoDate: string): IsoWeekday {
  return toIsoWeekday(new Date(`${isoDate}T00:00:00Z`).getUTCDay());
}

function mondayOf(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - toMondayFirstIndex(date.getUTCDay()));
  return date.toISOString().split("T")[0];
}

/**
 * Nombre de semaines entre l'ancre et le jour, négatif avant l'ancre.
 *
 * Le cycle se compte depuis l'ancre **normalisée au lundi** et non depuis le
 * numéro de semaine ISO : une année à 53 semaines décalerait la parité, et deux
 * semaines consécutives porteraient la même phase.
 */
function weekIndex(isoDate: string, anchorDate: string | null): number {
  const anchor = Date.parse(
    `${mondayOf(anchorDate ?? DEFAULT_SCHEDULE_ANCHOR)}T00:00:00Z`,
  );
  return Math.round(
    (Date.parse(`${mondayOf(isoDate)}T00:00:00Z`) - anchor) / MS_PER_WEEK,
  );
}

function effectiveInterval(schedule: MonitoringSchedule): number {
  return Math.min(
    Math.max(schedule.interval_weeks, MIN_INTERVAL_WEEKS),
    MAX_INTERVAL_WEEKS,
  );
}

/**
 * Le périmètre est-il **attendu** ce jour-là ?
 *
 * La périodicité restreint le calendrier du projet, elle ne l'élargit jamais :
 * un samedi déclaré dans un projet lundi–vendredi n'est pas attendu, sinon un
 * périmètre forcerait un jour que le projet a déclaré non ouvré.
 *
 * `weekdays` vide = tous les jours ouvrés, et non « jamais attendu » : c'est le
 * comportement des périmètres créés avant la périodicité.
 *
 * Un jour non attendu reste saisissable — il ne compte simplement ni dans le
 * backlog, ni dans la couverture.
 */
export function isScopeDue(
  scope: ScopeMonitoring,
  day: string,
  config: NonWorkingDays = DEFAULT_NON_WORKING_DAYS,
): boolean {
  return isDueForSchedule(scope.schedule, day, config);
}

function isDueForSchedule(
  schedule: MonitoringSchedule | undefined,
  day: string,
  config: NonWorkingDays,
): boolean {
  if (!isWorkingDay(day, config)) return false;

  // Une réponse d'API antérieure à la périodicité n'a pas le champ : on ne peut
  // pas pour autant retirer le périmètre du backlog, ce qui le rendrait
  // invisible. Il est attendu, comme avant.
  if (!schedule) return true;

  if (
    schedule.weekdays.length > 0 &&
    !schedule.weekdays.includes(isoWeekdayOf(day))
  ) {
    return false;
  }

  const interval = effectiveInterval(schedule);
  if (interval === 1) return true;

  const index = weekIndex(day, schedule.anchor_date);
  // `%` de JavaScript rend un reste négatif pour une date antérieure à l'ancre.
  return ((index % interval) + interval) % interval === 0;
}

/**
 * Existe-t-il au moins un jour attendu, sur un cycle complet ?
 *
 * La preuve est bornée par construction : au-delà de `7 × interval_weeks` jours
 * on a vu toutes les combinaisons jour de semaine × phase, donc une périodicité
 * qui n'a rien trouvé n'en trouvera jamais. Une recherche « jusqu'à en trouver
 * un » n'aurait pas de terme pour une cadence morte.
 */
export function hasAnyDueDay(
  scope: ScopeMonitoring,
  config: NonWorkingDays = DEFAULT_NON_WORKING_DAYS,
): boolean {
  return isScheduleEverDue(scope.schedule, config);
}

/**
 * Même preuve bornée, sur un brouillon de périodicité : c'est ce qui permet à
 * la carte d'édition d'avertir **avant** l'enregistrement, et de désactiver un
 * « Enregistrer » qui se solderait par un 422.
 */
export function isScheduleEverDue(
  schedule: MonitoringSchedule | undefined,
  config: NonWorkingDays = DEFAULT_NON_WORKING_DAYS,
): boolean {
  const interval = schedule ? effectiveInterval(schedule) : 1;
  const start = mondayOf(schedule?.anchor_date ?? DEFAULT_SCHEDULE_ANCHOR);
  const horizon = ISO_WEEKDAY_COUNT * interval;

  for (let offset = 0; offset < horizon; offset += 1) {
    if (isDueForSchedule(schedule, addDaysIso(start, offset), config)) {
      return true;
    }
  }
  return false;
}

/**
 * Jours ouvrés les plus récents, du plus récent au plus ancien.
 *
 * La recherche est bornée, et la borne est déduite du calendrier : il faut une
 * semaine par jour cherché, plus une semaine par date ponctuelle exclue, car une
 * date exclue qui tombe sur le seul jour ouvrable coûte sept jours de recherche.
 * Sans cette borne, un calendrier sans aucun jour ouvré ferait tourner la
 * boucle jusqu'à la limite de `Date` : un gel du rendu, pas un écran vide.
 */
export function lastWorkingDays(
  today: string,
  n: number,
  config: NonWorkingDays = DEFAULT_NON_WORKING_DAYS,
): string[] {
  const days: string[] = [];
  const date = new Date(`${today}T00:00:00Z`);
  const maxLookbackDays =
    ISO_WEEKDAY_COUNT * (n + config.excluded_dates.length);
  for (
    let back = 0;
    back < maxLookbackDays && days.length < n;
    back += 1
  ) {
    const isoDate = date.toISOString().split('T')[0];
    if (isWorkingDay(isoDate, config)) days.push(isoDate);
    date.setUTCDate(date.getUTCDate() - 1);
  }
  return days;
}

export function previousWorkingDays(
  today: string,
  n: number,
  config: NonWorkingDays = DEFAULT_NON_WORKING_DAYS,
): string[] {
  const date = new Date(`${today}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return lastWorkingDays(date.toISOString().split("T")[0], n, config);
}

/**
 * Jour à afficher à l'ouverture d'une vue mono-jour.
 *
 * Un jour non ouvré ne peut pas être saisi : l'ouvrir sur la date du jour
 * offrirait une liste vide et inviterait à écrire un dimanche. On retombe
 * donc sur le dernier jour ouvré, qui est le seul état de travail utile.
 */
export function defaultDisplayDay(
  today: string,
  config: NonWorkingDays = DEFAULT_NON_WORKING_DAYS,
): string {
  if (isWorkingDay(today, config)) return today;
  return previousWorkingDays(today, 1, config)[0] ?? today;
}

/**
 * Jour le plus récent ayant au moins une activité, tous périmètres confondus.
 *
 * Sert à pointer vers des données existantes quand le jour affiché n'en
 * contient aucune (historique réimporté, jour non encore saisi).
 */
export function latestActivityDay(scopes: ScopeMonitoring[]): string | null {
  let latest: string | null = null;
  scopes.forEach((scope) => {
    (scope.daily_activities || []).forEach((activity) => {
      if (latest === null || activity.day > latest) latest = activity.day;
    });
  });
  return latest;
}

export function buildDailyTrend(
  scopes: ScopeMonitoring[],
  day: string,
  config: NonWorkingDays = DEFAULT_NON_WORKING_DAYS,
): DailyTrendPoint[] {
  const days = lastWorkingDays(day, WORKING_DAYS_WINDOW, config).reverse();
  const dailyMap = new Map<string, DailyTrendPoint>(
    days.map((date) => [date, { day: date, erreurs: 0, incidents: 0 }]),
  );

  scopes.forEach((scope) => {
    (scope.daily_activities || []).forEach((activity) => {
      const entry = dailyMap.get(activity.day);
      if (entry) {
        entry.erreurs += activity.errors_reported;
        entry.incidents += activity.incidents_created;
      }
    });
  });

  return days.map((date) => dailyMap.get(date)!);
}

export function sumFeai(scopes: ScopeMonitoring[], day: string): number {
  return scopes.reduce((acc, scope) => {
    const activity = (scope.daily_activities || []).find((a) => a.day === day);
    return acc + (activity ? activity.feai.length : 0);
  }, 0);
}

export function transformationRate(
  incidents: number,
  errors: number,
): number | null {
  if (errors <= 0) return null;
  return Math.round((incidents / errors) * 100);
}

export function trailingErrors(errors: number, incidents: number): number {
  return Math.max(errors - incidents, 0);
}

export function baselineDelta(
  scopes: ScopeMonitoring[],
  today: string,
  config: NonWorkingDays = DEFAULT_NON_WORKING_DAYS,
): BaselineDelta {
  const days = [today, ...previousWorkingDays(today, WORKING_DAYS_WINDOW, config)];
  const daily = new Map<string, { errors: number; incidents: number }>(
    days.map((d) => [d, { errors: 0, incidents: 0 }]),
  );

  scopes.forEach((scope) => {
    (scope.daily_activities || []).forEach((a) => {
      const entry = daily.get(a.day);
      if (entry) {
        entry.errors += a.errors_reported;
        entry.incidents += a.incidents_created;
      }
    });
  });

  const todayTotal = (() => {
    const t = daily.get(today) ?? { errors: 0, incidents: 0 };
    return t.errors + t.incidents;
  })();

  if (!isWorkingDay(today, config)) {
    return { deltaPct: null, direction: "flat", avg: 0, todayTotal };
  }

  const prevDays = days.slice(1);
  const avg =
    prevDays.reduce((acc, d) => {
      const t = daily.get(d) ?? { errors: 0, incidents: 0 };
      return acc + t.errors + t.incidents;
    }, 0) / prevDays.length;

  const deltaPct =
    avg > 0 ? Math.round(((todayTotal - avg) / avg) * 100) : null;

  return {
    deltaPct,
    direction: deltaPct === null || deltaPct === 0 ? "flat" : deltaPct > 0 ? "up" : "down",
    avg,
    todayTotal,
  };
}

/**
 * Cellules **attendues** sur la période : périmètre × jour où le périmètre est
 * dû. C'est le dénominateur de la couverture, et il n'est plus
 * `périmètres × jours` — un périmètre hebdomadaire ne peut pas être en retard
 * les quatre autres jours.
 */
export function dueCellCount(
  scopes: ScopeMonitoring[],
  days: string[],
  config: NonWorkingDays = DEFAULT_NON_WORKING_DAYS,
): number {
  return scopes.reduce(
    (acc, scope) =>
      acc + days.filter((day) => isScopeDue(scope, day, config)).length,
    0,
  );
}

/**
 * Cellules attendues **et** saisies.
 *
 * Une saisie faite un jour hors périodicité reste enregistrée, mais elle ne
 * compte pas : sinon elle gonflerait le numérateur d'un dénominateur qui ne la
 * contient pas, et la couverture dépasserait 100 %.
 */
export function filledDueCellCount(
  scopes: ScopeMonitoring[],
  days: string[],
  config: NonWorkingDays = DEFAULT_NON_WORKING_DAYS,
): number {
  const daySet = new Set(days);
  return scopes.reduce(
    (acc, scope) =>
      acc +
      measuredActivitiesIn(scope, daySet).filter((activity) =>
        isScopeDue(scope, activity.day, config),
      ).length,
    0,
  );
}

/**
 * Taux de couverture : cellules attendues et saisies / cellules attendues.
 *
 * Numérateur et dénominateur portent sur **les mêmes** jours, sans quoi un
 * périmètre attendu le lundi seulement, rempli lundi et mardi, afficherait
 * 200 %. Zéro quand rien n'est attendu : la carte KPI sait alors afficher « — ».
 */
export function coverageRate(
  scopes: ScopeMonitoring[],
  days: string[],
  config: NonWorkingDays = DEFAULT_NON_WORKING_DAYS,
): number {
  if (scopes.length === 0 || days.length === 0) return 0;
  const due = dueCellCount(scopes, days, config);
  if (due === 0) return 0;
  return Math.round((filledDueCellCount(scopes, days, config) / due) * 100);
}

/**
 * Les activités d'un périmètre qui portent une mesure exploitable.
 *
 * Un jour KO est une ligne de `daily_activities` comme une autre, donc le
 * compter gonflerait la couverture d'une journée que personne n'a pu traiter —
 * exactement l'inverse de ce qu'elle doit dire. Le filtre vit ici, en un seul
 * endroit, plutôt que dans chaque appelant qui réadditionne des cellules.
 */
export function measuredActivitiesIn(
  scope: ScopeMonitoring,
  daySet: Set<string>,
): DailyActivity[] {
  return (scope.daily_activities || []).filter(
    (a) => daySet.has(a.day) && a.status !== "ko",
  );
}

/**
 * Relevés KO — cellules périmètre × jour, **pas** un compte de journées.
 *
 * Deux périmètres bloqués le même jour en font deux. L'unité est celle du
 * dénominateur de `coverageRate`, sinon l'explication ne rapporterait pas au
 * chiffre qu'elle cherche à expliquer.
 */
export function countKoCells(
  scopes: ScopeMonitoring[],
  days: string[],
): number {
  const daySet = new Set(days);
  return scopes.reduce(
    (acc, scope) =>
      acc +
      (scope.daily_activities || []).filter((a) => daySet.has(a.day) && isKo(a.status))
        .length,
    0,
  );
}
