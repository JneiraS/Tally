import { AuditEvent } from "../types";

export type HeatmapMatrix = number[][];

export function buildHeatmapMatrix(
  events: Pick<AuditEvent, "created_at">[],
): HeatmapMatrix {
  const matrix = Array.from({ length: 7 }, () => Array<number>(24).fill(0));

  events.forEach((event) => {
    const date = new Date(event.created_at);
    if (Number.isNaN(date.getTime())) return;

    const sundayBasedDay = date.getDay();
    const weekday = sundayBasedDay === 0 ? 6 : sundayBasedDay - 1;
    matrix[weekday][date.getHours()] += 1;
  });

  return matrix;
}
