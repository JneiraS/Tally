import { useId, useMemo } from "react";
import { Link } from "react-router-dom";
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
import type { RankingRow } from "../utils/analytics";
import { trailingErrors } from "../utils/kpi";
import { ScopeMonitoring } from "../types";
import { BillingCodeBadge } from "./BillingCodeBadge";

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
 *
 * Une liste HTML plutôt qu'un graphique à barres horizontales : à quarante
 * périmètres, un graphique est un mur, et son axe de noms de 140 px mangeait la
 * moitié de la largeur sur mobile. Une barre alignée sur une grille CSS est
 * lisible au premier regard, se parcourt au clavier, et n'a pas d'infobulle dont
 * dépendrait la seule lecture possible.
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

  const VISIBLE = 15;
  const visible = rows.slice(0, VISIBLE);
  const hidden = rows.length - visible.length;

  // La barre est comparée au pire périmètre : c'est ce que la page cherche à
  // faire ressortir, et une échelle sur le maximum rendrait les deux premiers
  // indiscernables.
  const peak = Math.max(
    1,
    ...visible
      .map((row) => rankingValue(row, metric))
      .filter((value): value is number => value !== null),
  );

  return (
    <section
      aria-labelledby={titleId}
      className="bg-white dark:bg-nord-1 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs"
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

      {visible.length === 0 ? (
        <p className="p-8 text-center text-sm text-slate-500 dark:text-nord-4">
          Aucun périmètre sur cette période.
        </p>
      ) : (
        <>
          <ol className="space-y-2">
            {visible.map((row) => (
              <li key={row.id}>
                <RankingLink row={row} metric={metric} peak={peak} />
              </li>
            ))}
          </ol>
          {hidden > 0 && (
            <p className="mt-3 text-xs text-slate-500 dark:text-nord-4">
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

/** Valeur classée d'une ligne, dans l'unité de la métrique. */
function rankingValue(row: RankingRow, metric: Metric): number | null {
  return row[metric];
}

/**
 * Barre proportionnelle à la dégradation.
 *
 * La métrique « en attente » est rapportée au pire périmètre : c'est ce que la
 * page cherche à faire ressortir, et une échelle sur le maximum rendrait les deux
 * premiers indiscernables.
 *
 * Le taux de transformation est inversé : sa valeur est « plus elle est haute,
 * mieux c'est », alors que le tri de la page — et donc l'ordre des lignes — est
 * « du plus dégradé au moins dégradé ». Sans inversion, le premier périmètre se
 * verrait attribuer la barre la plus courte, à l'opposé de ce que la page
 * cherche à faire lire. Un taux indéfini n'a aucune barre : il n'est ni dégradé
 * ni excellent, et une barre de longueur nulle se lirait comme un zéro.
 */
function barRatio(
  row: RankingRow,
  metric: Metric,
  peak: number,
): number | null {
  const value = rankingValue(row, metric);
  if (value === null) return null;
  if (metric === "transformation") {
    return Math.round(Math.min(100, Math.max(0, 100 - value)));
  }
  return Math.round(Math.min(100, (value / peak) * 100));
}

function RankingLink({
  row,
  metric,
  peak,
}: {
  row: RankingRow;
  metric: Metric;
  peak: number;
}) {
  const raw = rankingValue(row, metric);
  const ratio = barRatio(row, metric, peak);
  const value =
    raw === null ? "—" : metric === "transformation" ? `${raw} %` : raw.toLocaleString("fr-FR");

  return (
    <Link
      to={`/scopes/${row.id}`}
      className="block rounded-lg px-1 py-1 transition-colors hover:bg-slate-50 dark:hover:bg-nord-2"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-sm text-blue-600 hover:underline dark:text-nord-8">
            {row.name}
          </span>
          <BillingCodeBadge code={row.billing_code} />
        </span>
        <span className="shrink-0 text-sm font-medium tabular-nums text-slate-800 dark:text-nord-5">
          {value}
        </span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-slate-100 dark:bg-nord-0">
        {ratio !== null && (
          <span
            data-bar={ratio}
            aria-hidden="true"
            className="block h-1.5 rounded-full bg-blue-600 dark:bg-nord-9"
            style={{ width: `${ratio}%` }}
          />
        )}
      </div>
    </Link>
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
      className="bg-white dark:bg-nord-1 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs"
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
        <p className="p-8 text-center text-sm text-slate-500 dark:text-nord-4">
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
        <div
          className="h-64 min-w-0 w-full [&_.recharts-surface]:outline-none [&_.recharts-surface]:focus-visible:outline-2 [&_.recharts-surface]:focus-visible:outline-offset-2 [&_.recharts-surface]:focus-visible:outline-solid [&_.recharts-surface]:focus-visible:outline-blue-500 dark:[&_.recharts-surface]:focus-visible:outline-nord-8"
        >
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
      {/* `var(--chart-axis)` / `var(--chart-grid)` plutôt que `currentColor` :
          les jetons portent la couleur dans les deux thèmes, où `currentColor`
          peindrait l'axe avec la couleur du texte environnant. */}
      <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" opacity={0.3} vertical={false} />
      <XAxis
        dataKey="label"
        stroke="var(--chart-axis)"
        tick={{ fontSize: 10 }}
        interval="preserveStartEnd"
        minTickGap={24}
      />
      <YAxis
        stroke="var(--chart-axis)"
        tick={{ fontSize: 11 }}
        allowDecimals={false}
        width={32}
      />
      <Tooltip
        labelStyle={{ color: "#eceff4", fontSize: "12px" }}
        itemStyle={{ fontSize: "12px" }}
        contentStyle={{ backgroundColor: "#2e3440", borderColor: "#434c5e" }}
      />
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