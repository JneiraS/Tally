import { useId, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  buildWeeklyErrorHeatmap,
  weekLabel,
} from "../utils/analytics";
import type { WeeklyErrorCell, WeeklyErrorRow } from "../utils/analytics";
import { ScopeMonitoring } from "../types";
import { BillingCodeBadge } from "./BillingCodeBadge";

/** Erreurs brutes par périmètre et par semaine, avec classement de la période. */
export function AnalyticsWeeklyErrors({
  scopes,
  days,
}: {
  scopes: ScopeMonitoring[];
  days: string[];
}) {
  const titleId = useId();
  const heatmap = useMemo(() => buildWeeklyErrorHeatmap(scopes, days), [scopes, days]);

  return (
    <section
      aria-labelledby={titleId}
      className="bg-white dark:bg-nord-1 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs"
    >
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 id={titleId} className="text-sm font-semibold text-slate-800 dark:text-nord-5">
          Erreurs par semaine et par périmètre
        </h3>
        <p className="text-xs text-slate-500 dark:text-nord-4">
          Volume total d'erreurs · semaines ISO
        </p>
      </div>

      {heatmap.weeks.length === 0 || heatmap.rows.length === 0 ? (
        <p className="p-8 text-center text-sm text-slate-500 dark:text-nord-4">
          Aucune semaine ou aucun périmètre sur la période.
        </p>
      ) : (
        <>
          <WeeklyHeatmap heatmap={heatmap} />
          <ErrorRanking rows={heatmap.rows} />
        </>
      )}
    </section>
  );
}

function WeeklyHeatmap({ heatmap }: { heatmap: ReturnType<typeof buildWeeklyErrorHeatmap> }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-nord-2">
      <div>
        <div
          className="grid"
          style={{ gridTemplateColumns: `minmax(7rem, 1.5fr) repeat(${heatmap.weeks.length}, minmax(2rem, 1fr))` }}
        >
          <div className="bg-slate-50/80 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:bg-nord-0/60 dark:text-nord-4">
            Périmètre
          </div>
          {heatmap.weeks.map((week) => (
            <div key={week} className="bg-slate-50/80 px-1 py-2 text-center text-xs font-semibold uppercase tracking-wider text-slate-600 dark:bg-nord-0/60 dark:text-nord-4">
              {weekLabel(week)}
            </div>
          ))}
          {heatmap.rows.map((row) => (
            <HeatmapRow key={row.id} row={row} maxErrors={heatmap.maxErrors} />
          ))}
        </div>
      </div>
      <p className="border-t border-slate-100 px-3 py-2 text-xs text-slate-500 dark:border-nord-2 dark:text-nord-4">
        Intensité proportionnelle au volume d'erreurs. La variation compare chaque semaine à la précédente.
      </p>
    </div>
  );
}

function HeatmapRow({ row, maxErrors }: { row: WeeklyErrorRow; maxErrors: number }) {
  return (
    <>
      <div className="flex min-w-0 items-center gap-1.5 border-t border-slate-100 bg-white px-3 py-2 text-sm text-slate-700 dark:border-nord-2 dark:bg-nord-1 dark:text-nord-4">
        <Link to={`/scopes/${row.id}`} className="min-w-0 truncate text-blue-600 hover:underline dark:text-nord-8">
          {row.name}
        </Link>
        <BillingCodeBadge code={row.billing_code} />
      </div>
      {row.cells.map((cell) => (
        <HeatmapCell key={cell.week} cell={cell} scopeName={row.name} maxErrors={maxErrors} />
      ))}
    </>
  );
}

function HeatmapCell({
  cell,
  scopeName,
  maxErrors,
}: {
  cell: WeeklyErrorCell;
  scopeName: string;
  maxErrors: number;
}) {
  const intensity = maxErrors === 0 ? 0 : cell.errors / maxErrors;
  const week = weekLabel(cell.week);
  const change = cell.changePct === null ? "évolution indisponible" : `${cell.changePct >= 0 ? "+" : ""}${cell.changePct} %`;
  const label = `${scopeName}, ${week} : ${cell.errors} erreur${cell.errors === 1 ? "" : "s"}, ${change}`;

  return (
    <div
      role="img"
      aria-label={label}
      title={label}
      className={`flex min-h-10 items-center justify-center border-l border-t border-white/60 px-1 text-xs font-semibold tabular-nums dark:border-nord-1 ${heatmapClass(intensity)}`}
    >
      {cell.errors}
    </div>
  );
}

function ErrorRanking({ rows }: { rows: WeeklyErrorRow[] }) {
  const max = Math.max(...rows.map((row) => row.totalErrors), 1);
  return (
    <div className="mt-5 border-t border-slate-100 pt-4 dark:border-nord-2">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-800 dark:text-nord-5">Périmètres les plus exposés</h4>
        <p className="text-xs text-slate-500 dark:text-nord-4">Total d'erreurs sur la période</p>
      </div>
      <ol className="grid gap-x-6 gap-y-2 md:grid-cols-2">
        {rows.slice(0, 15).map((row) => (
          <li key={row.id}>
            <Link to={`/scopes/${row.id}`} className="block rounded-lg px-1 py-1 transition-colors hover:bg-slate-50 dark:hover:bg-nord-2">
              <div className="flex items-baseline justify-between gap-3">
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate text-sm text-blue-600 hover:underline dark:text-nord-8">{row.name}</span>
                  <BillingCodeBadge code={row.billing_code} />
                </span>
                <span className="shrink-0 text-sm font-medium tabular-nums text-slate-800 dark:text-nord-5">{row.totalErrors}</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-slate-100 dark:bg-nord-0">
                <span className="block h-1.5 rounded-full bg-blue-600 dark:bg-nord-9" style={{ width: `${Math.round((row.totalErrors / max) * 100)}%` }} aria-hidden="true" />
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

function heatmapClass(intensity: number): string {
  if (intensity === 0) {
    return "bg-slate-50 text-slate-400 dark:bg-nord-2 dark:text-nord-4";
  }
  if (intensity <= 0.25) {
    return "bg-sky-100 text-slate-700 dark:bg-nord-3 dark:text-nord-6";
  }
  if (intensity <= 0.55) {
    return "bg-sky-300 text-slate-900 dark:bg-nord-8 dark:text-nord-0";
  }
  return "bg-sky-600 text-white dark:bg-nord-9 dark:text-nord-0";
}
