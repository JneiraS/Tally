import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { NonWorkingDays, ScopeMonitoring } from "../types";
import { formatDateFr, getTodayIsoDate } from "../utils/date";
import { buildDailyTrend } from "../utils/kpi";

interface DashboardChartsProps {
  scopes: ScopeMonitoring[];
  day?: string;
  nonWorkingDays?: NonWorkingDays;
}

export function DashboardCharts({
  scopes,
  day = getTodayIsoDate(),
  nonWorkingDays,
}: DashboardChartsProps) {
  const trendData = useMemo(() => {
    return buildDailyTrend(scopes, day, nonWorkingDays);
  }, [scopes, day, nonWorkingDays]);

  // Totaux du jour affiché (1 seule source : activités existantes du jour)
  const dayTotals = useMemo(() => {
    return scopes.reduce(
      (acc, s) => {
        const activity = s.daily_activities.find((a) => a.day === day);
        return {
          erreurs: acc.erreurs + (activity?.errors_reported || 0),
          incidents: acc.incidents + (activity?.incidents_created || 0),
        };
      },
      { erreurs: 0, incidents: 0 },
    );
  }, [scopes, day]);

  // Répartition compacte des statuts pour le jour affiché
  const statusSummary = useMemo(() => {
    let completed = 0;
    let inProgress = 0;
    let none = 0;

    scopes.forEach((s) => {
      const activity = s.daily_activities.find((a) => a.day === day);
      if (activity) {
        if (activity.completed) completed++;
        else inProgress++;
      } else {
        none++;
      }
    });

    const total = Math.max(scopes.length, 1);
    return {
      completed,
      inProgress,
      none,
      completedWidth: `${(completed / total) * 100}%`,
      inProgressWidth: `${(inProgress / total) * 100}%`,
      noneWidth: `${(none / total) * 100}%`,
    };
  }, [scopes, day]);

  const dayLabel =
    day === getTodayIsoDate() ? "Aujourd'hui" : `le ${formatDateFr(day)}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Activité — 7 derniers jours */}
      <section
        aria-labelledby="dashboard-activity-title"
        className="bg-white dark:bg-nord-1 p-4 rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-3">
          <h3
            id="dashboard-activity-title"
            className="text-sm font-semibold text-slate-800 dark:text-nord-5"
          >
            Activité — 7 derniers jours
          </h3>
          <p className="text-xs text-slate-500 dark:text-nord-4">
            <span className="font-semibold text-rose-600 dark:text-nord-11">
              {dayTotals.erreurs} erreurs
            </span>{" "}
            ·{" "}
            <span className="font-semibold text-amber-600 dark:text-nord-13">
              {dayTotals.incidents} incidents
            </span>{" "}
            <span className="text-slate-400 dark:text-nord-3">({dayLabel})</span>
          </p>
        </div>
        <div className="h-40 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--chart-grid)"
                opacity={0.3}
              />
              <XAxis
                dataKey="day"
                stroke="var(--chart-axis)"
                tick={{ fontSize: 10 }}
                tickFormatter={(d: string) =>
                  formatDateFr(d).replace(/\s+\d{4}$/, "")
                }
                minTickGap={24}
              />
              <YAxis stroke="var(--chart-axis)" tick={{ fontSize: 10 }} />
              <Tooltip
                labelFormatter={(d) => formatDateFr(String(d))}
                contentStyle={{
                  backgroundColor: "#2e3440",
                  borderColor: "#434c5e",
                }}
                labelStyle={{ color: "#eceff4", fontSize: "12px" }}
                itemStyle={{ fontSize: "12px" }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Line
                type="monotone"
                dataKey="erreurs"
                name="Erreurs"
                stroke="#bf616a"
                strokeWidth={2}
                dot={{ r: 2.5, strokeWidth: 1 }}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="incidents"
                name="Incidents"
                stroke="#f6ae2d"
                strokeWidth={2}
                dot={{ r: 2.5, strokeWidth: 1 }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* État des périmètres (résumé compact) */}
      <section
        aria-labelledby="dashboard-status-title"
        className="bg-white dark:bg-nord-1 p-4 rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs"
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3
            id="dashboard-status-title"
            className="text-sm font-semibold text-slate-800 dark:text-nord-5"
          >
            État des périmètres
          </h3>
          <span className="text-xs text-slate-400 dark:text-nord-3">
            {dayLabel}
          </span>
        </div>

        {scopes.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-nord-3 italic py-8 text-center">
            Aucun périmètre à synthétiser.
          </p>
        ) : (
          <div className="space-y-4">
            {/* Barre horizontale segmentée */}
            <div
              role="img"
              aria-label={`${statusSummary.completed} terminés, ${statusSummary.inProgress} en cours, ${statusSummary.none} non saisis`}
              className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-nord-0"
            >
              {statusSummary.completed > 0 && (
                <div
                  className="h-full bg-emerald-600 dark:bg-nord-14"
                  style={{ width: statusSummary.completedWidth }}
                />
              )}
              {statusSummary.inProgress > 0 && (
                <div
                  className="h-full bg-amber-500 dark:bg-nord-13"
                  style={{ width: statusSummary.inProgressWidth }}
                />
              )}
              {statusSummary.none > 0 && (
                <div
                  className="h-full bg-slate-400 dark:bg-nord-3"
                  style={{ width: statusSummary.noneWidth }}
                />
              )}
            </div>

            {/* Légende textuelle (jamais couleur seule) */}
            <ul className="grid grid-cols-3 gap-2 text-center">
              <li className="flex flex-col items-center gap-0.5 rounded-lg bg-emerald-50 dark:bg-nord-14/15 p-2">
                <span className="text-lg font-bold text-emerald-700 dark:text-nord-14">
                  {statusSummary.completed}
                </span>
                <span className="text-[11px] font-medium text-emerald-800 dark:text-nord-14 capitalize">
                  Terminés
                </span>
              </li>
              <li className="flex flex-col items-center gap-0.5 rounded-lg bg-amber-50 dark:bg-nord-13/15 p-2">
                <span className="text-lg font-bold text-amber-700 dark:text-nord-13">
                  {statusSummary.inProgress}
                </span>
                <span className="text-[11px] font-medium text-amber-800 dark:text-nord-13 capitalize">
                  En cours
                </span>
              </li>
              <li className="flex flex-col items-center gap-0.5 rounded-lg bg-slate-100 dark:bg-nord-2 p-2">
                <span className="text-lg font-bold text-slate-700 dark:text-nord-4">
                  {statusSummary.none}
                </span>
                <span className="text-[11px] font-medium text-slate-700 dark:text-nord-4 capitalize">
                  Non saisis
                </span>
              </li>
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}