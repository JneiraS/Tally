import type { NonWorkingDays, ScopeMonitoring } from "../types";
import { DEFAULT_NON_WORKING_DAYS, toIsoWeekday } from "../constants/nonWorkingDays";

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

export function lastWorkingDays(
  today: string,
  n: number,
  config: NonWorkingDays = DEFAULT_NON_WORKING_DAYS,
): string[] {
  const days: string[] = [];
  const date = new Date(`${today}T00:00:00Z`);
  while (days.length < n) {
    const isoDate = date.toISOString().split("T")[0];
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

export function coverageRate(
  scopes: ScopeMonitoring[],
  days: string[],
): number {
  if (scopes.length === 0 || days.length === 0) return 0;
  const daySet = new Set(days);
  const cellsWithActivity = scopes.reduce(
    (acc, scope) =>
      acc +
      (scope.daily_activities || []).filter((a) => daySet.has(a.day)).length,
    0,
  );
  return Math.round((cellsWithActivity / (scopes.length * days.length)) * 100);
}
