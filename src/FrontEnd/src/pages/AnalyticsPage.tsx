import { useEffect, useMemo, useRef, useState } from "react";
import { BarChart3, Filter, Inbox } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { protabApi } from "../services/api";
import { NonWorkingDays, ScopeMonitoring } from "../types";
import { getTodayIsoDate } from "../utils/date";
import {
  buildPeriodDays,
  computePeriodSummary,
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
} from "../components/AnalyticsCharts";
import { SupervisionGrid } from "../components/SupervisionGrid";
import {
  buildExportRows,
  downloadFile,
  exportFilename,
  toCsv,
} from "../utils/export";

const GRANULARITIES = ["jour", "semaine"] as const;

/** Valeur de `scopeIds` signifiant « périmètre désélectionné ». */
const NO_SCOPE_SELECTION = "-";

/**
 * Page d'analyse, entièrement dérivée de `GET /scope-monitorings`.
 *
 * Aucun appel supplémentaire : la liste renvoie déjà tous les périmètres avec
 * leur historique. Un endpoint d'agrégation côté serveur n'aurait de sens qu'à
 * partir du jour où la charge dépasse ce que le navigateur peut tenir, ce qui
 * n'est pas le cas ici — et il faudrait alors mesurer avant de le créer.
 */
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

  // La sélection par défaut est « tous les périmètres », ce qui n'est connu
  // qu'après le chargement. Une URL partagée est résolue à ce moment-là, une
  // seule fois : la réappliquer à chaque changement de `allScopeIds` écraserait
  // une décoche faite entre-temps.
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

  // Le retour arrière du navigateur doit resynchroniser la période affichée,
  // sinon l'URL annonce une plage que la page ne montre pas. Seules les clés
  // pilotées par l'URL sont reprises, pour ne pas écraser les réglages purement
  // locaux (métrique, comparaison, exclusion des jours non ouvrés).
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

  /**
   * Une seule source de vérité pour les filtres : l'état local, l'URL en étant
   * le reflet. Écrire l'URL depuis le `setState` aurait deux défauts — un effet de
   * bord dans un updater (React peut l'appeler deux fois en mode strict) et une
   * URL qui repart de l'ancienne sélection à chaque frappe.
   */
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("from", filters.from);
    params.set("to", filters.to);
    params.set("granularity", filters.granularity);
    // Toujours écrit, y compris vide : une clé absente se lit « tous les
    // périmètres », donc l'URL d'une sélection vide ramènerait l'utilisateur à
    // la vue complète sans qu'il l'ait demandée.
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

  // Au-delà du plafond, l'agrégat journalier devient illisible : on force la
  // semaine plutôt que de laisser un standard qui tient 120 points et un qui en
  // affiche 300 dans le même composant.
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
      <p className="py-12 text-center text-sm text-slate-500 dark:text-nord-4">
        Chargement de l'analyse...
      </p>
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

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-nord-4">
        <p>
          {formatPeriod(filters.from, filters.to)} · {selected.length} périmètre
          {selected.length === 1 ? "" : "s"} sélectionné
          {selected.length === 1 ? "" : "s"}
        </p>
        <p>
          {granularity === "jour" ? "Vue quotidienne" : "Vue hebdomadaire"}
          {filters.workingDaysOnly ? " · jours ouvrés" : " · tous les jours"}
        </p>
      </div>

      {selected.length === 0 ? (
        <AnalyticsEmptyState
          icon={<Filter className="w-6 h-6" />}
          title="Sélectionnez au moins un périmètre"
          hint="Cochez un ou plusieurs périmètres ci-dessus : l'analyse porte sur eux seuls."
        />
      ) : (
        <>
          <SummaryCards summary={summary} delta={delta} compare={filters.compare} />

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
            <>
              <AnalyticsErrorHeatmap
                scopes={selected}
                days={days}
                granularity={granularity}
              />
              <section aria-labelledby="analytics-grid-title">
                <h3
                  id="analytics-grid-title"
                  className="mb-2 text-sm font-semibold text-slate-800 dark:text-nord-5"
                >
                  Grille de supervision
                </h3>
                {/*
                  La heatmap qui précède est une matrice colorée elle aussi, mais
                  elle mesure le volume d'erreurs en semaines ISO. Sans cette
                  légende, les deux se lisent comme la même vue deux fois : elle
                  nomme la seconde métrique et la légende de couleurs, qui ne
                  peuvent pas être déduites de la couleur seule.
                */}
                <p className="mb-2 text-xs text-slate-500 dark:text-nord-4">
                  État du traitement et erreurs en attente, par jour ou par semaine
                  selon l'affichage choisi. Vert : traité · ambre : en cours ·
                  pointillé : non saisi. L'intensité suit le nombre d'erreurs en
                  attente.
                </p>
                <SupervisionGrid
                  scopes={selected}
                  days={days}
                  granularity={granularity}
                />
              </section>
            </>
          )}
        </>
      )}
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

function SummaryCards({
  summary,
  delta,
  compare,
}: {
  summary: ReturnType<typeof computePeriodSummary>;
  delta: ReturnType<typeof periodDelta> | null;
  compare: boolean;
}) {
  const cards = [
    { label: "Erreurs", value: summary.erreurs, key: "erreursPct" as const },
    { label: "Incidents", value: summary.incidents, key: "incidentsPct" as const },
    { label: "En attente", value: summary.arriere, key: "arrierePct" as const },
    {
      label: "Couverture de saisie",
      value: Math.round(summary.couverture),
      suffix: " %",
      key: "couverturePct" as const,
    },
  ];

  return (
    <section aria-label="Résumé de la période">
      <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-nord-1 p-4 rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs"
          >
            <dt className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-nord-4">
              {card.label}
            </dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums text-slate-900 dark:text-nord-6">
              {card.value.toLocaleString("fr-FR")}
              {card.suffix}
            </dd>
            {compare && (
              <p className="mt-0.5 text-xs text-slate-500 dark:text-nord-4">
                <DeltaText value={delta ? delta[card.key] : null} />
              </p>
            )}
          </div>
        ))}
      </dl>
    </section>
  );
}

function DeltaText({ value }: { value: number | null }) {
  // Une base nulle n'a pas de pourcentage : afficher « +∞ % » ou « 0 % »
  // transformerait une absence de référence en chiffre, ce qui est pire que
  // de ne rien montrer.
  if (value === null) return <span>— vs période précédente</span>;
  const sign = value > 0 ? "+" : "";
  const signClass =
    value > 0
      ? "text-red-600 dark:text-nord-11"
      : value < 0
        ? "text-emerald-700 dark:text-nord-14"
        : "";
  return (
    <span className={signClass}>
      {sign}
      {value} % vs période précédente
    </span>
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
  // Un lien partagé peut citer un périmètre supprimé : on ne garde que ceux qui
  // existent encore, sinon la page s'ouvrirait sur une sélection vide.
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

function formatShort(iso: string): string {
  const [, month, day] = iso.split("-");
  return `${day}/${month}`;
}
