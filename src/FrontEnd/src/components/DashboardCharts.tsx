import { useMemo } from 'react';
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
} from 'recharts';
import { ScopeMonitoring } from '../types';
import { getTodayIsoDate } from '../utils/date';

interface DashboardChartsProps {
  scopes: ScopeMonitoring[];
}

export function DashboardCharts({ scopes }: DashboardChartsProps) {
  const todayIso = getTodayIsoDate();

  // Agrégation pour le graphique de tendance (7 derniers jours)
  const trendData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const dailyMap = new Map(last7Days.map((d) => [d, { day: d, erreurs: 0, incidents: 0 }]));

    scopes.forEach((s) => {
      s.daily_activities.forEach((a) => {
        if (dailyMap.has(a.day)) {
          const entry = dailyMap.get(a.day)!;
          entry.erreurs += a.errors_reported;
          entry.incidents += a.incidents_created;
        }
      });
    });

    return Array.from(dailyMap.values());
  }, [scopes]);

  // Agrégation pour le graphique de statut (aujourd'hui)
  const statusData = useMemo(() => {
    let completed = 0;
    let inProgress = 0;
    let none = 0;

    scopes.forEach((s) => {
      const today = s.daily_activities.find((a) => a.day === todayIso);
      if (today) {
        if (today.completed) completed++;
        else inProgress++;
      } else {
        none++;
      }
    });

    return [
      { name: 'Terminé', value: completed, color: '#a3be8c' }, // nord-14
      { name: 'En cours', value: inProgress, color: '#ebcb8b' }, // nord-13
      { name: 'Non saisi', value: none, color: '#4c566a' }, // nord-3
    ].filter((item) => item.value > 0);
  }, [scopes, todayIso]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Tendance sur 7 jours */}
      <div className="bg-white dark:bg-nord-1 p-4 rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-nord-5 mb-4">
          Tendance hebdomadaire (Erreurs / Incidents)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#434c5e" opacity={0.3} />
              <XAxis dataKey="day" stroke="#d8dee9" tick={{ fontSize: 10 }} />
              <YAxis stroke="#d8dee9" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#2e3440', borderColor: '#434c5e' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="erreurs" stroke="#bf616a" strokeWidth={2} />
              <Line type="monotone" dataKey="incidents" stroke="#ebcb8b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Répartition des statuts */}
      <div className="bg-white dark:bg-nord-1 p-4 rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-nord-5 mb-4">
          Répartition des statuts (Aujourd'hui)
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