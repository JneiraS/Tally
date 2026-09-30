import { useId, useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  buildScopeRanking,
  buildStackSeries,
  Metric,
  stackToChartData,
} from "../utils/analytics";
import { trailingErrors } from "../utils/kpi";
import { ScopeMonitoring } from "../types";

const METRIC_LABEL: Record<Metric, string> = {
  arriere: "En attente",
  erreurs: "Erreurs",
  incidents: "Incidents",
  transformation: "Taux de transformation",
};

/**
 * Classement horizontal des périmètres sur la métrique choisie.
 *
 * Le tri est toujours « du plus dégradé au moins dégradé » : un superviseur
 * cherche qui traiter en premier, et un classement mélangeant sens de lecture
 * selon la métrique lui serait une faute plutôt qu'un choix.
 */
export function AnalyticsRanking({
  scopes,
  days,
  metric,
}: {
  scopes: ScopeMonitoring[];
  days: string[];
  metric: Metric;
}) {
  const titleId = useId();
  const rows = useMemo(
    () => buildScopeRanking(scopes, days, metric),
    [scopes, days, metric],
  );

  // Un graphique à 40 barres horizontales dans une page défilante est un mur ;
  // au-delà de 15, on renvoie vers la grille qui porte les valeurs exactes.
  const VISIBLE = 15;
  const visible = rows.slice(0, VISIBLE);
  const hidden = rows.length - visible.length;

  const data = visible.map((row) => ({
    name: row.name,
    valeur: row[metric === "arriere" ? "arriere" : metric],
  }));

  return (
    <section
      aria-labelledby={titleId}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-nord-2 dark:bg-nord-1"
    >
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3
          id={titleId}
          className="text-sm font-semibold text-slate-800 dark:text-nord-5"
        >
          Classement des périmètres
        </h3>
        <p className="text-xs text-slate-500 dark:text-nord-4">
          {METRIC_LABEL[metric]} · du plus dégradé au moins dégradé
        </p>
      </div>

      {data.length === 0 ? (
        <p className="py-8 text-center text-xs italic text-slate-400 dark:text-nord-3">
          Aucun périmètre sur cette période.
        </p>
      ) : (
        <>
          <div className="h-72 w-full [&_.recharts-surface]:outline-none [&_.recharts-surface]:focus-visible:outline-2 [&_.recharts-surface]:focus-visible:outline-offset-2 [&_.recharts-surface]:focus-visible:outline-solid">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  className="text-slate-200 dark:text-nord-2"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11 }}
                  stroke="currentColor"
                  className="text-slate-500 dark:text-nord-4"
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={140}
                  tick={{ fontSize: 11 }}
                  stroke="currentColor"
                  className="text-slate-500 dark:text-nord-4"
                />
                <Tooltip
                  contentStyle={{ fontSize: 12 }}
                  formatter={(value, name) => [
                    metric === "transformation"
                      ? `${value} %`
                      : Number(value).toLocaleString("fr-FR"),
                    typeof name === "string" ? name : METRIC_LABEL[metric],
                  ]}
                />
                <Bar dataKey="valeur" fill="#4c566a" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {hidden > 0 && (
            <p className="mt-2 text-xs text-slate-500 dark:text-nord-4">
              {hidden} périmètre{hidden === 1 ? "" : "s"} au-delà des 15
              plus dégradés : voir la grille de supervision pour les valeurs
              exactes.
            </p>
          )}
        </>
      )}
    </section>
  );
}

/**
 * Répartition de l'arriéré entre périmètres, empilée par jour ou par semaine.
 *
 * L'arriéré et non les erreurs brutes : la question du superviseur est « qui
 * n'a pas encore traité », pas « qui a le plus d'erreurs » — cette seconde
 * liste s'affiche déjà en tête sur la page des périmètres.
 */
export function AnalyticsStack({
  scopes,
  days,
  labelOf,
  granularityLabel,
}: {
  scopes: ScopeMonitoring[];
  days: string[];
  labelOf: (day: string) => string;
  granularityLabel: string;
}) {
  const titleId = useId();
  const { points, data, series } = useMemo(() => {
    const byLabel = new Map<string, { erreurs: number; incidents: number; arriere: number }>();
    scopes.forEach((scope) => {
      (scope.daily_activities || []).forEach((activity) => {
        const label = labelOf(activity.day);
        const entry = byLabel.get(label) ?? { erreurs: 0, incidents: 0, arriere: 0 };
        entry.erreurs += activity.errors_reported;
        entry.incidents += activity.incidents_created;
        entry.arriere += trailingErrors(
          activity.errors_reported,
          activity.incidents_created,
        );
        byLabel.set(label, entry);
      });
    });
    // Seules les étiquettes qui portent de la saisie entrent dans la série : une
    // colonne à zéro pour une journée sans saisie élargirait l'axe sans rien
    // raconter, et la grille reste le bon endroit pour voir ces trous.
    const pointList = days
      .filter((day) => byLabel.has(labelOf(day)))
      .map((day) => {
        const entry = byLabel.get(labelOf(day))!;
        return { label: labelOf(day), ...entry };
      });
    // `buildStackSeries` a besoin des points pour aligner ses valeurs : on le
    // branche sur la même liste que celle rendue, jamais sur les jours bruts,
    // sinon les séries seraient décalées d'un cran en agrégat semaine.
    const stacks = buildStackSeries(scopes, pointList, undefined, labelOf);
    return {
      points: pointList,
      data: stackToChartData(pointList, stacks),
      series: stacks,
    };
  }, [scopes, days, labelOf]);

  return (
    <section
      aria-labelledby={titleId}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-nord-2 dark:bg-nord-1"
    >
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3
          id={titleId}
          className="text-sm font-semibold text-slate-800 dark:text-nord-5"
        >
          Répartition de l'arriéré par périmètre
        </h3>
        <p className="text-xs text-slate-500 dark:text-nord-4">
          Erreurs non transformées · {granularityLabel}
        </p>
      </div>

      {points.length === 0 ? (
        <p className="py-8 text-center text-xs italic text-slate-400 dark:text-nord-3">
          Aucune saisie sur la période.
        </p>
      ) : (
        <ul className="mb-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-nord-4">
          {series.map((entry, index) => (
            <li key={entry.key} className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: colorFor(index, entry.isAutres) }}
              />
              {entry.name}
            </li>
          ))}
        </ul>
      )}
      {points.length > 0 && (
        <div className="h-72 w-full [&_.recharts-surface]:outline-none [&_.recharts-surface]:focus-visible:outline-2 [&_.recharts-surface]:focus-visible:outline-offset-2 [&_.recharts-surface]:focus-visible:outline-solid">
          <ResponsiveContainer width="100%" height="100%">
            <StackChart data={data} series={series} />
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

function StackChart({
  data,
  series,
}: {
  data: Record<string, number | string>[];
  series: { key: string; name: string; isAutres: boolean }[];
}) {
  return (
    <BarChart data={data} margin={{ top: 4, right: 16, bottom: 4, left: 4 }}>
      <CartesianGrid
        strokeDasharray="3 3"
        stroke="currentColor"
        className="text-slate-200 dark:text-nord-2"
        vertical={false}
      />
      <XAxis
        dataKey="label"
        tick={{ fontSize: 10 }}
        stroke="currentColor"
        className="text-slate-500 dark:text-nord-4"
        interval="preserveStartEnd"
      />
      <YAxis
        tick={{ fontSize: 11 }}
        stroke="currentColor"
        className="text-slate-500 dark:text-nord-4"
        allowDecimals={false}
      />
      <Tooltip contentStyle={{ fontSize: 12 }} />
      {series.map((entry, index) => (
        <Bar
          key={entry.key}
          dataKey={entry.key}
          stackId="arriere"
          fill={colorFor(index, entry.isAutres)}
          name={entry.name}
        />
      ))}
    </BarChart>
  );
}

// Palette Nord : déjà celle du thème, donc aucun nouveau jeton à définir. Les
// teintes sont espacées d'un cran pour que deux périmètres voisins restent
// distinguables en projection.
const PALETTE = [
  "#88c0d0",
  "#a3be8c",
  "#ebcb8b",
  "#bf616a",
  "#b48ead",
  "#d08770",
  "#8fbcbb",
  "#81a1c1",
];

function colorFor(index: number, isAutres: boolean): string {
  // « Autres » prend un gris neutre : ce n'est pas un périmètre, et lui donner
  // une couleur de série ferait croire qu'il en est un.
  if (isAutres) return "#4c566a";
  return PALETTE[index % PALETTE.length];
}

function trailing(errors: number, incidents: number): number {
  return Math.max(0, errors - incidents);
}