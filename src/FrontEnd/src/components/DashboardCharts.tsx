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
  PieChart,
  Pie,
  Cell,
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
  // Agrégation sur les 7 derniers jours ouvrés, selon le jour sélectionné.
  const trendData = useMemo(() => {
    return buildDailyTrend(scopes, day, nonWorkingDays);
  }, [scopes, day, nonWorkingDays]);

  // Agrégation pour le graphique de statut (aujourd'hui)
  const statusData = useMemo(() => {
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

    return [
      { name: "Terminé", value: completed, color: "#499167" }, // nord-14
      { name: "En cours", value: inProgress, color: "#f6ae2d" }, // nord-13
      { name: "Non saisi", value: none, color: "#4c566a" }, // nord-3
    ].filter((item) => item.value > 0);
  }, [scopes, day]);

  const dayLabel =
    day === getTodayIsoDate() ? "Aujourd'hui" : `le ${formatDateFr(day)}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Tendance sur 7 jours */}
      <div className="bg-white dark:bg-nord-1 p-4 rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-nord-5 mb-4">
          Tendance hebdomadaire (7 jours ouvrés : Erreurs / Incidents)
        </h3>
        <div className="h-64">
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
              />
              <YAxis stroke="var(--chart-axis)" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#2e3440",
                  borderColor: "#434c5e",
                }}
                itemStyle={{ fontSize: "12px" }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Line
                type="monotone"
                dataKey="erreurs"
                stroke="#bf616a"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="incidents"
                stroke="#f6ae2d"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Répartition des statuts */}
      <div className="bg-white dark:bg-nord-1 p-4 rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-nord-5 mb-4">
          Répartition des statuts ({dayLabel})
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
