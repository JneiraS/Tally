import { AuditEvent } from "../types";
import { toMondayFirstIndex } from "../constants/nonWorkingDays";

export type HeatmapMatrix = number[][];

/** Lignes de la matrice : les sept jours, du lundi au dimanche. */
const WEEKDAYS_PER_WEEK = 7;
const HOURS_PER_DAY = 24;

export function buildHeatmapMatrix(
  events: Pick<AuditEvent, "created_at">[],
): HeatmapMatrix {
  const matrix = Array.from({ length: WEEKDAYS_PER_WEEK }, () =>
    Array<number>(HOURS_PER_DAY).fill(0),
  );

  events.forEach((event) => {
    const date = new Date(event.created_at);
    if (Number.isNaN(date.getTime())) return;

    // Heure locale, et non UTC : l'heure affichée est celle du lecteur, donc
    // l'index doit venir de `getDay()` et non de `getUTCDay()`.
    const weekday = toMondayFirstIndex(date.getDay());
    matrix[weekday][date.getHours()] += 1;
  });

  return matrix;
}
