import { useMemo } from "react";
import { AuditEvent } from "../types";
import { buildHeatmapMatrix } from "../utils/auditStats";

interface AuditActivityHeatmapProps {
  events: AuditEvent[];
}

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const HOURS = [0, 4, 8, 12, 16, 20, 23];

function intensityClass(value: number, maximum: number): string {
  if (value === 0 || maximum === 0) return "bg-slate-100 dark:bg-nord-0";
  const ratio = value / maximum;
  if (ratio <= 0.25) return "bg-blue-100 dark:bg-nord-9/35";
  if (ratio <= 0.5) return "bg-blue-200 dark:bg-nord-9/50";
  if (ratio <= 0.75) return "bg-blue-400 dark:bg-nord-8/75";
  return "bg-blue-600 dark:bg-nord-8";
}

export function AuditActivityHeatmap({ events }: AuditActivityHeatmapProps) {
  const matrix = useMemo(() => buildHeatmapMatrix(events), [events]);
  const maximum = Math.max(...matrix.flat(), 0);

  return (
    <section
      aria-labelledby="audit-activity-heatmap-title"
      className="bg-white dark:bg-nord-1 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs"
    >
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-1 mb-4">
        <div>
          <h2 id="audit-activity-heatmap-title" className="text-sm font-semibold text-slate-800 dark:text-nord-5">
            Activité par heure de la semaine
          </h2>
          <p className="text-xs text-slate-500 dark:text-nord-4 mt-1">
            Nombre d&apos;événements d&apos;audit par jour et heure locale
          </p>
        </div>
        {maximum > 0 && (
          <span className="text-[11px] text-slate-400 dark:text-nord-3">
            Pic : {maximum} événement{maximum > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {maximum > 0 ? (
        <>
          <div className="overflow-x-auto pb-1">
            <div className="min-w-[560px]">
              <div className="grid grid-cols-[2.5rem_repeat(24,minmax(0,1fr))] gap-1 mb-1">
                <span aria-hidden="true" />
                {Array.from({ length: 24 }, (_, hour) => (
                  <span key={hour} className="text-[9px] text-center text-slate-400 dark:text-nord-3">
                    {HOURS.includes(hour) ? hour : ""}
                  </span>
                ))}
              </div>
              {matrix.map((row, weekday) => (
                <div key={WEEKDAYS[weekday]} className="grid grid-cols-[2.5rem_repeat(24,minmax(0,1fr))] gap-1 mb-1">
                  <span className="text-[10px] leading-3 text-slate-500 dark:text-nord-4 self-center">
                    {WEEKDAYS[weekday]}
                  </span>
                  {row.map((count, hour) => (
                    <span
                      key={`${weekday}-${hour}`}
                      title={`${WEEKDAYS[weekday]} ${hour}h — ${count} événement${count > 1 ? "s" : ""}`}
                      aria-label={`${WEEKDAYS[weekday]} ${hour} heures : ${count} événement${count > 1 ? "s" : ""}`}
                      className={`h-5 rounded-sm ${intensityClass(count, maximum)}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 mt-3 text-[10px] text-slate-400 dark:text-nord-3">
            <span>Faible</span>
            <span className="w-3 h-3 rounded-sm bg-blue-100 dark:bg-nord-9/35" />
            <span className="w-3 h-3 rounded-sm bg-blue-200 dark:bg-nord-9/50" />
            <span className="w-3 h-3 rounded-sm bg-blue-400 dark:bg-nord-8/75" />
            <span className="w-3 h-3 rounded-sm bg-blue-600 dark:bg-nord-8" />
            <span>Élevée</span>
          </div>
        </>
      ) : (
        <p className="py-8 text-center text-xs text-slate-400 dark:text-nord-3">
          Aucun événement d&apos;audit à représenter.
        </p>
      )}
    </section>
  );
}
