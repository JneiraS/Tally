import { useEffect, useMemo, useRef, useState } from "react";
import { BarChart3, Filter, Inbox } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { protabApi } from "../services/api";
import { NonWorkingDays, ScopeMonitoring } from "../types";
import { getTodayIsoDate } from "../utils/date";
import {
  aggregateByDay,
  aggregateByWeek,
  buildPeriodDays,
  computePeriodSummary,
  coverageByColumn,
  MAX_TRACKED_DAYS,
  normalizeRange,
  periodDelta,
  previousPeriod,
  resolvePresetRange,
} from "../utils/analytics";
import {
  AnalyticsFilterBar,
  type AnalyticsFilters,
} from "../components/AnalyticsFilterBar";
import {
  AnalyticsErrorHeatmap,
} from "../components/AnalyticsHeatmap";
import { AnalyticsKpiCards } from "../components/AnalyticsKpiCards";
import {
  buildExportRows,
  downloadFile,
  exportFilename,
  toCsv,
} from "../utils/export";

const GRANULARITIES = ["jour", "semaine"] as const;

const NO_SCOPE_SELECTION = "-";

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-nord-1 rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs p-4 animate-pulse space-y-3">
      <div className="h-4 w-3/4 bg-slate-200 dark:bg-nord-2 rounded" />
      <div className="h-8 w-1/2 bg-slate-200 dark:bg-nord-2 rounded" />
      <div className="h-8 w-full bg-slate-200 dark:bg-nord-2 rounded" />
    </div>
  );
}

function SkeletonHeatmap() {
  return (
    <div className="bg-white dark:bg-nord-1 rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs p-4 animate-pulse space-y-4">
      <div className="h-5 w-1/3 bg-slate-200 dark:bg-nord-2 rounded" />
      <div className="h-64 bg-slate-200 dark:bg-nord-2 rounded" />
    </div>
  );
}

function AnalyticsEmptyState({
  icon,
  title,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
}) {
  return (
    <div className="bg-white dark:bg-nord-1 rounded-xl border border-slate-200 dark:border-nord-2 p-12 text-center shadow-2xs space-y-3">
      <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-nord-0 text-blue-600 dark:text-nord-8 flex items-center justify-center mx-auto">
        {icon}
      </div>
      <h2 className="text-base font-semibold text-slate-800 dark:text-nord-6">
        {title}
      </h2>
      <p className="text-xs text-slate-500 dark:text-nord-4 max-w-sm mx-auto">
        {hint}
      </p>
    </div>
  );
}

function ContextPills({
  period,
  scopeCount,
  granularity,
  workingDaysOnly,
  billingCodes,
  compare,
}: {
  period: string;
  scopeCount: number;
  granularity: "jour" | "semaine";
  workingDaysOnly: boolean;
  billingCodes: string[];
  compare: boolean;
}) {
  const pills = [
    period,
    `${scopeCount} périmètre${scopeCount === 1 ? "" : "s"}`,
    granularity === "jour" ? "Par jour" : "Par semaine",
    workingDaysOnly ? "Jours ouvrés" : "Tous les jours",
  ];

  if (billingCodes.length > 0) {
    pills.push(`Codes : ${billingCodes.map((c) => (c === "__sans_code__" ? "Sans code" : c)).join(", ")}`);
  }
  if (compare) {
    pills.push("Comparaison à la période précédente");
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600 dark:text-nord-4 bg-slate-50 dark:bg-nord-1 rounded-lg border border-slate-200 dark:border-nord-2 p-2">
      {pills.map((pill, i) => (
        <span key={i} className="flex items-center gap-1.5 px-2 py-0.5 bg-white dark:bg-nord-0 rounded border border-slate-200 dark:border-nord-2">
          {pill}
        </span>
      ))}
    </div>
  );
}

export function AnalyticsPage({
  nonWorkingDays,
}: {
  nonWorkingDays: NonWorkingDays;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [scopes, setScopes] = useState<ScopeMonitoring[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    protabApi
      .getScopeMonitorings()
      .then(setScopes)
      .catch(() => setError("Impossible de charger les périmètres."))
      .finally(() => setLoading(false));
  }, []);

  const today = getTodayIsoDate();

  const allScopeIds = useMemo(() => scopes.map((scope) => scope.id), [scopes]);

  const [filters, setFilters] = useState<AnalyticsFilters>(() =>
    initialFilters(searchParams, today, nonWorkingDays),
  );

  const scopeIdsResolved = useRef(false);
  useEffect(() => {
    if (loading || scopeIdsResolved.current) return;
    scopeIdsResolved.current = true;
    const requested = searchParams.get("scopeIds");
    if (requested === null || requested === "") {
      setFilters((current) => ({ ...current, scopeIds: allScopeIds }));
      return;
    }
    setFilters((current) => ({
      ...current,
      scopeIds:
        requested === NO_SCOPE_SELECTION
          ? []
          : requested.split(",").filter((id) => allScopeIds.includes(id)),
    }));
  }, [loading, allScopeIds, searchParams]);

  const fromUrl = searchParams.get("from");
  const toUrl = searchParams.get("to");
  const granularityUrl = searchParams.get("granularity");
  useEffect(() => {
    if (loading || fromUrl === null || toUrl === null) return;
    const range = normalizeRange(fromUrl, toUrl, today);
    setFilters((current) => {
      const granularity = GRANULARITIES.includes(granularityUrl as never)
        ? (granularityUrl as "jour" | "semaine")
        : current.granularity;
      if (
        current.from === range.from &&
        current.to === range.to &&
        current.preset === "perso" &&
        current.granularity === granularity
      ) {
        return current;
      }
      return { ...current, ...range, preset: "perso", granularity };
    });
  }, [loading, fromUrl, toUrl, granularityUrl, today]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("from", filters.from);
    params.set("to", filters.to);
    params.set("granularity", filters.granularity);
    params.set("scopeIds", filters.scopeIds.join(","));
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const update = (patch: Partial<AnalyticsFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
  };

  const days = useMemo(
    () => buildPeriodDays(filters.from, filters.to, nonWorkingDays, filters.workingDaysOnly),
    [filters.from, filters.to, filters.workingDaysOnly, nonWorkingDays],
  );

  const selected = useMemo(
    () =>
      scopes.filter(
        (scope) =>
          filters.scopeIds.includes(scope.id) &&
          (filters.billingCodes.length === 0 ||
            filters.billingCodes.includes(scope.billing_code ?? "__sans_code__")),
      ),
    [scopes, filters.scopeIds, filters.billingCodes],
  );

  const granularity =
    days.length > MAX_TRACKED_DAYS ? "semaine" : filters.granularity;

  useEffect(() => {
    if (granularity !== filters.granularity) update({ granularity });
  }, [granularity, filters.granularity]);

  const summary = useMemo(
    () => computePeriodSummary(selected, days),
    [selected, days],
  );

  const delta = useMemo(() => {
    if (!filters.compare) return null;
    const previous = previousPeriod(filters.from, filters.to);
    const previousDays = buildPeriodDays(
      previous.from,
      previous.to,
      nonWorkingDays,
      filters.workingDaysOnly,
    );
    return periodDelta(
      summary,
      computePeriodSummary(selected, previousDays),
    );
  }, [filters.compare, filters.from, filters.to, filters.workingDaysOnly, nonWorkingDays, selected, summary]);

  const series = useMemo(() => {
    const agg = granularity === "jour"
      ? aggregateByDay(selected, days)
      : aggregateByWeek(selected, days);
    const couverture = coverageByColumn(selected, days, granularity);
    return {
      erreurs: agg.map((p) => p.erreurs),
      incidents: agg.map((p) => p.incidents),
      arriere: agg.map((p) => p.arriere),
      couverture,
    };
  }, [selected, days, granularity]);

  const exportSelection = () => {
    const rows = buildExportRows(selected, filters.from, filters.to);
    downloadFile(
      toCsv(rows),
      exportFilename(filters.from, filters.to, "csv"),
      "text/csv;charset=utf-8",
    );
  };

  if (loading) {
    return (
      <div className="space-y-6" role="status" aria-label="Chargement de l'analyse">
        <div className="h-8 w-48 bg-slate-200 dark:bg-nord-2 rounded animate-pulse" />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonHeatmap />
      </div>
    );
  }

  if (error) {
    return (
      <p role="alert" className="py-12 text-center text-sm text-red-600 dark:text-red-400">
        {error}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-nord-6 flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-blue-600 dark:text-nord-9" />
          Analyse
        </h1>
        <p className="text-sm text-slate-500 dark:text-nord-4 mt-1">
          Où en est le traitement des erreurs, périmètre par périmètre et jour par
          jour
        </p>
      </div>

      <AnalyticsFilterBar
        filters={filters}
        onChange={update}
        scopes={scopes}
        nonWorkingDays={nonWorkingDays}
        onExport={exportSelection}
      />

      <ContextPills
        period={formatPeriod(filters.from, filters.to)}
        scopeCount={selected.length}
        granularity={granularity}
        workingDaysOnly={filters.workingDaysOnly}
        billingCodes={filters.billingCodes}
        compare={filters.compare}
      />

      {selected.length === 0 ? (
        <AnalyticsEmptyState
          icon={<Filter className="w-6 h-6" />}
          title="Sélectionnez au moins un périmètre"
          hint="Cochez un ou plusieurs périmètres ci-dessus : l'analyse porte sur eux seuls."
        />
      ) : (
        <>
          <AnalyticsKpiCards
            summary={summary}
            delta={delta}
            compare={filters.compare}
            series={series}
          />

          {granularity !== filters.granularity && (
            <p
              role="status"
              className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-nord-3 dark:bg-nord-0 dark:text-nord-4"
            >
              Période trop longue pour un affichage journalier : l'agrégat est
              passé en semaine.
            </p>
          )}

          {summary.traitees === 0 ? (
            <AnalyticsEmptyState
              icon={<Inbox className="w-6 h-6" />}
              title="Aucune saisie sur la période choisie"
              hint="Aucun jour traité n'apparaît dans cette période. Élargissez la période, ou saisissez les compteurs depuis la page des périmètres."
            />
          ) : (
            <AnalyticsErrorHeatmap
              scopes={selected}
              days={days}
              granularity={granularity}
            />
          )}
        </>
      )}
    </div>
  );
}

function initialFilters(
  searchParams: URLSearchParams,
  today: string,
  nonWorkingDays: NonWorkingDays,
): AnalyticsFilters {
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const granularityParam = searchParams.get("granularity");
  const fallback = resolvePresetRange("mois", today, nonWorkingDays);
  return {
    from: from ?? fallback.from,
    to: to ?? fallback.to,
    granularity: GRANULARITIES.includes(granularityParam as never)
      ? (granularityParam as "jour" | "semaine")
      : "jour",
    workingDaysOnly: true,
    compare: false,
    preset: from && to ? "perso" : "mois",
    scopeIds: [],
    billingCodes: [],
  };
}

function formatPeriod(from: string, to: string): string {
  const [fromYear, fromMonth, fromDay] = from.split("-");
  const [toYear, toMonth, toDay] = to.split("-");
  if (fromYear === toYear && fromMonth === toMonth) {
    return `${fromDay}–${toDay}/${toMonth}/${toYear}`;
  }
  return `${fromDay}/${fromMonth}/${fromYear}–${toDay}/${toMonth}/${toYear}`;
}