import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ScopeMonitoring } from "../types";
import { formatDateFr } from "../utils/date";

interface ScopeDetailChartsProps {
  scope: ScopeMonitoring;
}

export function ScopeDetailCharts({ scope }: ScopeDetailChartsProps) {
  const trendData = useMemo(
    () =>
      [...scope.daily_activities]
        .sort((a, b) => a.day.localeCompare(b.day))
        .map((activity) => ({
          day: activity.day,
          erreurs: activity.errors_reported,
          incidents: activity.incidents_created,
        })),
    [scope.daily_activities],
  );

  return (
    <div className="grid grid-cols-1 gap-4">
      <section
        aria-labelledby="scope-detail-trend-title"
        className="bg-white dark:bg-nord-1 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-1 mb-4">
          <div>
            <h2
              id="scope-detail-trend-title"
              className="text-sm font-semibold text-slate-800 dark:text-nord-5"
            >
              Tendance des erreurs et incidents
            </h2>
            <p className="text-xs text-slate-500 dark:text-nord-4 mt-1">
              Évolution quotidienne pour ce périmètre
            </p>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-nord-3">
            {trendData.length} journée{trendData.length > 1 ? "s" : ""}{" "}
            enregistrée{trendData.length > 1 ? "s" : ""}
          </span>
        </div>

        <div className="h-64 min-w-0 [&_.recharts-surface]:outline-none [&_.recharts-surface]:focus-visible:outline-2 [&_.recharts-surface]:focus-visible:outline-solid [&_.recharts-surface]:focus-visible:outline-offset-2 [&_.recharts-surface]:focus-visible:outline-blue-500 dark:[&_.recharts-surface]:focus-visible:outline-nord-8">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trendData}
              margin={{ top: 4, right: 8, left: -16, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--chart-grid)"
                opacity={0.3}
              />
              <XAxis
                dataKey="day"
                stroke="var(--chart-axis)"
                tick={{ fontSize: 10 }}
                tickFormatter={(day: string) =>
                  formatDateFr(day).replace(/\s+\d{4}$/, "")
                }
                minTickGap={24}
              />
              <YAxis
                stroke="var(--chart-axis)"
                tick={{ fontSize: 10 }}
                allowDecimals={false}
                width={32}
              />
              <Tooltip
                labelFormatter={(day) => formatDateFr(String(day))}
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
                dot={{ r: 3, strokeWidth: 1 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="incidents"
                name="Incidents"
                stroke="#f6ae2d"
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 1 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
