import { useEffect, useState, useMemo, lazy, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Layers,
  Search,
  RefreshCw,
  Plus,
  UploadCloud,
  ChevronRight,
  AlertCircle,
  ShieldCheck,
  Users,
  Activity as ActivityIcon,
  Inbox,
  Download,
  CalendarClock,
} from "lucide-react";
import { NonWorkingDays, ScopeMonitoring, DailyActivity } from "../types";
import { protabApi, ApiError } from "../services/api";
import { Badge } from "../components/Badge";
import { BillingCodeBadge } from "../components/BillingCodeBadge";
import { CompleteTodayButton } from "../components/CompleteTodayButton";
import { formatDateFr, getTodayIsoDate } from "../utils/date";
import { buildKnowledgeBaseUrl } from "../utils/knowledgeBase";
import { matchesSearchQuery, sortByOfficialRelevance } from "../utils/search";
import {
  baselineDelta,
  defaultDisplayDay,
  latestActivityDay,
  previousWorkingDays,
  trailingErrors,
  transformationRate,
} from "../utils/kpi";
import { useToast } from "../hooks/useToast";
import { DateNavigator } from "../components/DateNavigator";
import { InlineActivityCounters } from "../components/InlineActivityCounters";
import { ExportModal } from "../components/ExportModal";

const DashboardCharts = lazy(() =>
  import("../components/DashboardCharts").then((m) => ({
    default: m.DashboardCharts,
  })),
);

interface ScopeListPageProps {
  onOpenCreateScope: () => void;
  onOpenImportCsv: () => void;
  refreshTrigger?: number;
  nonWorkingDays?: NonWorkingDays;
}

type QuickFilter = "all" | "to_process" | "errors" | "incidents" | "completed";

interface EnrichedScope extends ScopeMonitoring {
  selectedActivity?: DailyActivity;
  hasSelectedDay: boolean;
  selectedDayCompleted: boolean;
  status: "completed" | "in_progress" | "none";
  selectedDayErrors: number;
  selectedDayIncidents: number;
}

export function ScopeListPage({
  onOpenCreateScope,
  onOpenImportCsv,
  refreshTrigger,
  nonWorkingDays,
}: ScopeListPageProps) {
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();
  const [scopes, setScopes] = useState<ScopeMonitoring[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [completingIds, setCompletingIds] = useState<string[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const todayIso = getTodayIsoDate();
  const [selectedDay, setSelectedDay] = useState(() =>
    defaultDisplayDay(todayIso, nonWorkingDays),
  );
  const isSelectedDayToday = selectedDay === todayIso;
  const selectedDayLabel = isSelectedDayToday
    ? "du jour"
    : `du ${formatDateFr(selectedDay)}`;
  const selectedDayValidationLabel = isSelectedDayToday
    ? "aujourd'hui"
    : `le ${formatDateFr(selectedDay)}`;

  const lastWorkingDay = useMemo(
    () => previousWorkingDays(todayIso, 1, nonWorkingDays)[0],
    [todayIso, nonWorkingDays],
  );

  const untreatedLastWorkingDayCount = useMemo(() => {
    if (!lastWorkingDay) return 0;
    return scopes.filter((scope) => {
      const activity = (scope.daily_activities || []).find(
        (item) => item.day === lastWorkingDay,
      );
      return !activity || !activity.handled;
    }).length;
  }, [scopes, lastWorkingDay]);

  const showUntreatedBacklog = () => {
    if (!lastWorkingDay) return;
    setSelectedDay(lastWorkingDay);
    setQuickFilter("to_process");
  };

  // Dernière journée réellement saisie : sert à pointer vers des données
  // existantes quand le jour affiché n'en contient aucune (historique
  // réimporté via un dump, ou journée du jour pas encore renseignée).
  const latestData = useMemo(() => {
    const day = latestActivityDay(scopes);
    if (!day) return null;
    return scopes.reduce(
      (acc, scope) => {
        const activity = (scope.daily_activities || []).find((a) => a.day === day);
        if (!activity) return acc;
        return {
          day,
          scopes: acc.scopes + 1,
          errors: acc.errors + (activity.errors_reported || 0),
          incidents: acc.incidents + (activity.incidents_created || 0),
        };
      },
      { day, scopes: 0, errors: 0, incidents: 0 },
    );
  }, [scopes]);

  // Deux informations peuvent concerner des journées différentes : le backlog
  // du dernier jour ouvré et l'absence de saisie sur la journée affichée. Le
  // backlog l'emporte car il nomme les périmètres concernés et filtre la liste
  // sur eux ; le message « aucune saisie » ne sert que de repli.
  const hasUntreatedBacklog = Boolean(
    lastWorkingDay &&
      untreatedLastWorkingDayCount > 0 &&
      selectedDay !== lastWorkingDay,
  );
  const showEmptyDayNotice =
    !hasUntreatedBacklog && latestData !== null && latestData.day !== selectedDay;

  const handleActivityChanged = (scopeId: string, activity: DailyActivity) => {
    setScopes((prev) =>
      prev.map((s) => {
        if (s.id !== scopeId) return s;
        const others = s.daily_activities.filter((a) => a.day !== activity.day);
        return { ...s, daily_activities: [...others, activity] };
      }),
    );
  };

  const handleCompleteSelectedDay = async (scope: ScopeMonitoring) => {
    if (completingIds.includes(scope.id)) return;
    setCompletingIds((prev) => [...prev, scope.id]);
    try {
      const selectedActivity = scope.daily_activities.find(
        (a) => a.day === selectedDay,
      );
      if (!selectedActivity) {
        await protabApi.createActivity(scope.id, {
          day: selectedDay,
          errors_reported: 0,
          incidents_created: 0,
          feai: [],
        });
      }
      await protabApi.completeActivities(scope.id, { days: [selectedDay] });
      const completedActivity: DailyActivity = selectedActivity
        ? { ...selectedActivity, completed: true, handled: true }
        : {
            day: selectedDay,
            errors_reported: 0,
            incidents_created: 0,
            feai: [],
            handled: true,
            completed: true,
          };
      handleActivityChanged(scope.id, completedActivity);
      toastSuccess(
        "Activité validée",
        `L'activité ${selectedDayLabel} de « ${scope.name} » a été marquée comme terminée.`,
      );
    } catch (err: unknown) {
      const msg =
        err instanceof ApiError
          ? err.message
          : (err as Error)?.message || "Erreur lors de la validation.";
      toastError("Échec de la validation", msg);
    } finally {
      setCompletingIds((prev) => prev.filter((id) => id !== scope.id));
    }
  };

  const fetchScopes = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await protabApi.getScopeMonitorings();
      setScopes(data);
    } catch (err: unknown) {
      const msg =
        err instanceof ApiError
          ? err.message
          : (err as Error)?.message ||
            "Erreur lors du chargement des périmètres.";
      setErrorMessage(msg);
      toastError("Erreur de chargement", msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScopes();
  }, [refreshTrigger]);

  // Données dérivées par périmètre pour le jour sélectionné
  const enrichedScopes = useMemo<EnrichedScope[]>(() => {
    return scopes.map((scope) => {
      const activities = scope.daily_activities || [];
      const selectedActivity = activities.find((a) => a.day === selectedDay);
      const hasSelectedDay = !!selectedActivity;
      const selectedDayCompleted = selectedActivity?.completed ?? false;

      let status: "completed" | "in_progress" | "none" = "none";
      if (selectedActivity) {
        status = selectedDayCompleted ? "completed" : "in_progress";
      }

      return {
        ...scope,
        selectedActivity,
        hasSelectedDay,
        selectedDayCompleted,
        status,
        selectedDayErrors: selectedActivity?.errors_reported || 0,
        selectedDayIncidents: selectedActivity?.incidents_created || 0,
      };
    });
  }, [scopes, selectedDay]);

  // Filtrage combiné recherche + filtre rapide action, puis priorité au
  // responsable : une recherche par quadrigramme remonte les périmètres dont il
  // est l'official_main avant ceux où il n'est que le suppléant.
  const filteredScopes = useMemo(() => {
    const matched = enrichedScopes.filter((scope) => {
      if (!matchesSearchQuery(scope, searchQuery)) return false;

      switch (quickFilter) {
        case "to_process":
          return scope.status !== "completed";
        case "errors":
          return scope.selectedDayErrors > 0;
        case "incidents":
          return scope.selectedDayIncidents > 0;
        case "completed":
          return scope.status === "completed";
        default:
          return true;
      }
    });

    return sortByOfficialRelevance(matched, searchQuery);
  }, [enrichedScopes, searchQuery, quickFilter]);

  // Statistiques action-first pour le bandeau KPI
  const stats = useMemo(() => {
    const total = scopes.length;
    const completedCount = enrichedScopes.filter(
      (s) => s.selectedDayCompleted,
    ).length;
    const inProgressCount = enrichedScopes.filter(
      (s) => s.status === "in_progress",
    ).length;
    const noneCount = enrichedScopes.filter((s) => s.status === "none").length;
    const toProcessCount = inProgressCount + noneCount;
    const selectedDayErrors = enrichedScopes.reduce(
      (acc, s) => acc + s.selectedDayErrors,
      0,
    );
    const selectedDayIncidents = enrichedScopes.reduce(
      (acc, s) => acc + s.selectedDayIncidents,
      0,
    );
    const rate = transformationRate(selectedDayIncidents, selectedDayErrors);
    const trailing = trailingErrors(selectedDayErrors, selectedDayIncidents);
    const delta = baselineDelta(scopes, selectedDay, nonWorkingDays);

    return {
      total,
      completedCount,
      toProcessCount,
      inProgressCount,
      noneCount,
      selectedDayErrors,
      selectedDayIncidents,
      rate,
      trailing,
      delta,
      completionPct: total === 0 ? 0 : Math.round((completedCount / total) * 100),
    };
  }, [scopes, enrichedScopes, selectedDay, nonWorkingDays]);

  const filterCounts = useMemo(() => {
    return {
      all: enrichedScopes.length,
      to_process: stats.toProcessCount,
      errors: enrichedScopes.filter((s) => s.selectedDayErrors > 0).length,
      incidents: enrichedScopes.filter((s) => s.selectedDayIncidents > 0)
        .length,
      completed: stats.completedCount,
    };
  }, [enrichedScopes, stats]);

  const quickFilterOptions: { key: QuickFilter; label: string }[] = [
    { key: "all", label: "Tous" },
    { key: "to_process", label: "À traiter" },
    { key: "errors", label: "Erreurs" },
    { key: "incidents", label: "Incidents" },
    { key: "completed", label: "Terminés" },
  ];

  const navigateToDetail = (scope: ScopeMonitoring) => {
    navigate(`/scopes/${scope.id}`);
  };

  return (
    <div className="space-y-6">
      {/* En-tête de page & Titre */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-nord-6 flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-blue-600 dark:text-nord-9" />
            Périmètres de Supervision
          </h1>
          <p className="text-sm text-slate-500 dark:text-nord-4 mt-1">
            Projection et suivi quotidien des activités par périmètre de
            surveillance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DateNavigator
            value={selectedDay}
            today={todayIso}
            onChange={setSelectedDay}
          />
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            disabled={scopes.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-nord-5 bg-white dark:bg-nord-1 hover:bg-slate-50 dark:hover:bg-nord-2 border border-slate-300 dark:border-nord-2 rounded-lg shadow-2xs transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-nord-8 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Exporter les données sur une plage de dates"
          >
            <Download className="w-4 h-4 text-blue-600 dark:text-nord-8" />
            <span>Exporter</span>
          </button>
          <button
            type="button"
            onClick={fetchScopes}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-nord-5 bg-white dark:bg-nord-1 hover:bg-slate-50 dark:hover:bg-nord-2 border border-slate-300 dark:border-nord-2 rounded-lg shadow-2xs transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-nord-8"
            title="Rafraîchir la liste"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-600 dark:text-nord-8" : ""}`}
            />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* KPI action-first : À traiter, Terminés, Erreurs, Incidents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI principal — À traiter */}
        <div className="bg-amber-50/60 dark:bg-nord-13/10 p-4 rounded-xl border-2 border-amber-300/70 dark:border-nord-13/40 shadow-2xs">
          <div className="flex items-center justify-between text-amber-800 dark:text-nord-13">
            <span className="text-xs font-semibold uppercase tracking-wider">
              À traiter
            </span>
            <Inbox className="w-4 h-4" />
          </div>
          <p className="text-3xl font-bold text-amber-900 dark:text-nord-13 mt-2">
            {stats.toProcessCount}
          </p>
          <p className="text-xs text-amber-800/90 dark:text-nord-4 mt-1">
            {stats.inProgressCount} en cours · {stats.noneCount} non saisis
          </p>
        </div>

        {/* KPI Terminés */}
        <div className="bg-white dark:bg-nord-1 p-4 rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-nord-4">
            <span className="text-xs font-medium uppercase tracking-wider">
              Terminés
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-nord-14" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-nord-6 mt-2">
            {stats.completedCount} / {stats.total}
          </p>
          <p className="text-xs text-slate-500 dark:text-nord-4 mt-1">
            {stats.completionPct} % {isSelectedDayToday ? "aujourd'hui" : selectedDayValidationLabel}
          </p>
        </div>

        {/* KPI Erreurs */}
        <div className="bg-white dark:bg-nord-1 p-4 rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-nord-4">
            <span className="text-xs font-medium uppercase tracking-wider">
              {`Erreurs ${selectedDayLabel}`}
            </span>
            <ActivityIcon className="w-4 h-4 text-amber-600 dark:text-nord-13" />
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-nord-13 mt-2">
            {stats.selectedDayErrors}
          </p>
          <p className="text-xs mt-1">
            {stats.delta.deltaPct === null ? (
              <span className="text-slate-400 dark:text-nord-3">
                vs baseline (7 j) : —
              </span>
            ) : (
              <span
                className={
                  stats.delta.direction === "up"
                    ? "text-rose-600 dark:text-nord-11"
                    : stats.delta.direction === "down"
                      ? "text-emerald-600 dark:text-nord-14"
                      : "text-slate-400 dark:text-nord-3"
                }
              >
                vs baseline (7 j) : {stats.delta.direction === "up" ? "▲" : "▼"}{" "}
                {Math.abs(stats.delta.deltaPct)} %
              </span>
            )}
          </p>
        </div>

        {/* KPI Incidents à suivre */}
        <div className="bg-white dark:bg-nord-1 p-4 rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-nord-4">
            <span className="text-xs font-medium uppercase tracking-wider">
              Incidents à suivre
            </span>
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-nord-11" />
          </div>
          <p className="text-2xl font-bold text-rose-600 dark:text-nord-11 mt-2">
            {stats.selectedDayIncidents}
          </p>
          <p className="text-xs text-slate-500 dark:text-nord-4 mt-1">
            {stats.rate === null
              ? "Aucune erreur du jour"
              : `${stats.trailing} non transformé${stats.trailing > 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {hasUntreatedBacklog && lastWorkingDay && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 dark:border-nord-13/30 dark:bg-nord-13/15"
          >
            <Inbox
              aria-hidden="true"
              className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-nord-13"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-950 dark:text-nord-13">
                {untreatedLastWorkingDayCount === 1
                  ? "1 périmètre non traité"
                  : `${untreatedLastWorkingDayCount} périmètres non traités`}
                {" "}
                le {formatDateFr(lastWorkingDay)}.
              </p>
              <p className="mt-0.5 text-xs text-amber-800 dark:text-nord-4">
                Certains périmètres du dernier jour ouvré n'ont pas encore été traités.
              </p>
              <button
                type="button"
                onClick={showUntreatedBacklog}
                aria-label={`Voir les ${untreatedLastWorkingDayCount} périmètres non traités du ${formatDateFr(lastWorkingDay)}`}
                className="mt-2 min-h-11 rounded-lg px-2 text-xs font-semibold text-amber-900 underline decoration-amber-300 underline-offset-2 hover:text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:text-nord-13 dark:decoration-nord-13/50 dark:hover:text-nord-6"
              >
                Voir ces périmètres
              </button>
            </div>
          </div>
        )}

      {/* Aucune saisie le jour affiché : pointer vers la dernière journée
          contenant des données, sinon un historique réimporté resterait
          invisible depuis la page principale. */}
      {showEmptyDayNotice && latestData && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 dark:border-nord-2 dark:bg-nord-1/40"
        >
          <CalendarClock
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0 text-slate-500 dark:text-nord-4"
          />
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800 dark:text-nord-6">
              {`Aucune saisie le ${formatDateFr(selectedDay)}`}
            </p>
            <p className="mt-0.5 text-xs text-slate-600 dark:text-nord-4">
              {`Les dernières données saisies datent du ${formatDateFr(latestData.day)} : `}
              {`${latestData.scopes} ${latestData.scopes > 1 ? "périmètres" : "périmètre"}, `}
              {`${latestData.errors} ${latestData.errors > 1 ? "erreurs" : "erreur"}, `}
              {`${latestData.incidents} ${latestData.incidents > 1 ? "incidents" : "incident"}.`}
            </p>
            <button
              type="button"
              onClick={() => setSelectedDay(latestData.day)}
              aria-label={`Voir les données du ${formatDateFr(latestData.day)}`}
              className="mt-2 min-h-11 rounded-lg px-2 text-xs font-semibold text-blue-700 underline decoration-blue-300 underline-offset-2 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-nord-8 dark:decoration-nord-8/50 dark:hover:text-nord-7"
            >
              Voir cette journée
            </button>
          </div>
        </div>
      )}

      {/* Graphique & état des périmètres */}
      {scopes.length > 0 && (
        <Suspense
          fallback={
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-nord-1 p-4 rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs h-52 animate-pulse" />
              <div className="bg-white dark:bg-nord-1 p-4 rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs h-52 animate-pulse" />
            </div>
          }
        >
          <DashboardCharts
            scopes={scopes}
            day={selectedDay}
            nonWorkingDays={nonWorkingDays}
          />
        </Suspense>
      )}

      {/* Barre de contrôle de la liste (recherche & filtres rapides) */}
      <div className="bg-white dark:bg-nord-1 p-3.5 rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 lg:max-w-md">
          <Search className="w-4 h-4 text-slate-400 dark:text-nord-3 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher un périmètre, KB, responsable..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Rechercher un périmètre, KB, responsable"
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 dark:bg-nord-0 border border-slate-200 dark:border-nord-2 text-slate-900 dark:text-nord-5 placeholder:text-slate-400 dark:placeholder:text-nord-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-nord-8 focus:bg-white dark:focus:bg-nord-0 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filtrer par action">
          {quickFilterOptions.map((option) => {
            const isActive = quickFilter === option.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => setQuickFilter(option.key)}
                aria-pressed={isActive}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-nord-8 ${
                  isActive
                    ? "bg-blue-600 dark:bg-nord-10 text-white shadow-xs"
                    : "bg-slate-50 dark:bg-nord-0 text-slate-600 dark:text-nord-4 hover:bg-slate-100 dark:hover:bg-nord-2 hover:text-slate-900 dark:hover:text-nord-6 border border-slate-200 dark:border-nord-2"
                }`}
              >
                {option.label}{" "}
                <span
                  className={
                    isActive
                      ? "text-blue-100 dark:text-nord-6"
                      : "text-slate-400 dark:text-nord-3"
                  }
                >
                  ({filterCounts[option.key]})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* État d'erreur */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-nord-11/15 border border-rose-200 dark:border-nord-11/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-nord-11 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-rose-900 dark:text-nord-11">
              Échec du chargement de l'API
            </h3>
            <p className="text-xs text-rose-700 dark:text-nord-4 mt-0.5">
              {errorMessage}
            </p>
            <button
              type="button"
              onClick={fetchScopes}
              className="mt-2 text-xs font-semibold text-rose-800 dark:text-nord-11 hover:underline"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      {/* État de chargement */}
      {isLoading ? (
        <div className="bg-white dark:bg-nord-1 rounded-xl border border-slate-200 dark:border-nord-2 p-12 text-center shadow-2xs">
          <div className="w-8 h-8 border-3 border-blue-600 dark:border-nord-8 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-700 dark:text-nord-5">
            Chargement des périmètres en cours...
          </p>
          <p className="text-xs text-slate-400 dark:text-nord-3 mt-1">
            Interrogation de GET /scope-monitorings
          </p>
        </div>
      ) : filteredScopes.length === 0 ? (
        /* État vide */
        <div className="bg-white dark:bg-nord-1 rounded-xl border border-slate-200 dark:border-nord-2 p-12 text-center shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-nord-0 text-blue-600 dark:text-nord-8 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 dark:text-nord-6">
            {searchQuery
              ? "Aucun résultat trouvé"
              : "Aucun périmètre de supervision"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-nord-4 max-w-sm mx-auto">
            {searchQuery
              ? `Aucun périmètre ne correspond à votre recherche "${searchQuery}". Essayez un autre mot-clé.`
              : "Commencez par créer votre premier périmètre de supervision ou importez un ensemble de périmètres via fichier CSV."}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onOpenCreateScope}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-nord-10 dark:hover:bg-nord-9 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Créer un périmètre
            </button>
            <button
              type="button"
              onClick={onOpenImportCsv}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-nord-5 bg-white dark:bg-nord-0 hover:bg-slate-50 dark:hover:bg-nord-2 border border-slate-300 dark:border-nord-2 rounded-lg transition-colors"
            >
              <UploadCloud className="w-4 h-4 text-slate-500 dark:text-nord-4" />
              Importer CSV
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Tableau des périmètres (desktop / tablette) */}
          <div className="hidden md:block bg-white dark:bg-nord-1 rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-nord-5">
                <thead className="bg-slate-50/80 dark:bg-nord-0/60 border-b border-slate-200 dark:border-nord-2 text-xs font-semibold text-slate-700 dark:text-nord-4 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">
                      Périmètre & Base KB
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Responsable
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      {`Activité ${selectedDayLabel}`}
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-center">
                      Statut
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-nord-2">
                  {filteredScopes.map((scope) => (
                    <tr
                      key={scope.id}
                      role="link"
                      tabIndex={0}
                      aria-label={`Ouvrir le détail de ${scope.name}`}
                      onClick={() => navigateToDetail(scope)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          navigateToDetail(scope);
                        }
                      }}
                      className="cursor-pointer group hover:bg-slate-50/70 dark:hover:bg-nord-2/50 focus-visible:bg-slate-50/70 dark:focus-visible:bg-nord-2/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 dark:focus-visible:ring-nord-8 transition-colors"
                    >
                      {/* Nom & KB-ID */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <BillingCodeBadge code={scope.billing_code} />
                          <Link
                            to={`/scopes/${scope.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="font-semibold text-slate-900 dark:text-nord-6 group-hover:text-blue-600 dark:group-hover:text-nord-8 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-nord-8 rounded"
                          >
                            {scope.name}
                          </Link>
                        </div>
                        <a
                          href={buildKnowledgeBaseUrl(scope.knowledge_base_id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Ouvrir l'article KB"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-block mt-0.5 text-xs font-mono text-slate-500 dark:text-nord-4 bg-slate-100 dark:bg-nord-0 px-1.5 py-0.5 rounded border border-slate-200 dark:border-nord-2 hover:text-blue-600 dark:hover:text-nord-8 hover:border-blue-400 dark:hover:border-nord-9/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-nord-8"
                        >
                        {scope.knowledge_base_id}
                      </a>
                    </td>

                      {/* Responsables */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400 dark:text-nord-3" />
                          <span className="text-slate-800 dark:text-nord-5 font-medium">
                            {scope.official_main}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Users className="w-3.5 h-3.5 text-slate-300 dark:text-nord-3" />
                          <span className="text-xs text-slate-500 dark:text-nord-4">
                            {scope.official_backup}
                          </span>
                        </div>
                      </td>

                      {/* Synthèse & saisie d'activité */}
                      <td className="px-5 py-4">
                        <InlineActivityCounters
                          key={`${scope.id}-${selectedDay}`}
                          scopeId={scope.id}
                          day={selectedDay}
                          initialActivity={scope.selectedActivity}
                          onChanged={handleActivityChanged}
                        />
                      </td>

                      {/* Statut & action de complétion */}
                      <td className="px-5 py-4 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          {scope.selectedDayCompleted ? (
                            <Badge type="completed" label="Terminé" />
                          ) : (
                            <>
                              {scope.hasSelectedDay ? (
                                <Badge type="in_progress" label="En cours" />
                              ) : (
                                <Badge type="none" label="Non saisi" />
                              )}
                              <CompleteTodayButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCompleteSelectedDay(scope);
                                }}
                                onKeyDown={(e) => e.stopPropagation()}
                                dayLabel={selectedDayLabel}
                                disabled={completingIds.includes(scope.id)}
                                pending={completingIds.includes(scope.id)}
                              />
                            </>
                          )}
                        </div>
                      </td>

                      {/* Action Détail */}
                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/scopes/${scope.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-nord-8 hover:text-blue-800 dark:hover:text-nord-7 group-hover:translate-x-0.5 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-nord-8 rounded"
                          aria-label={`Voir le détail de ${scope.name}`}
                        >
                          <span>Détail</span>
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 dark:border-nord-2 bg-slate-50/50 dark:bg-nord-0/40 text-xs text-slate-500 dark:text-nord-4 flex items-center justify-between">
              <span>
                Affichage de {filteredScopes.length} sur {scopes.length}{" "}
                périmètre(s)
              </span>
              <span className="font-mono text-[11px] text-slate-500 dark:text-nord-3">
                Jour affiché : {formatDateFr(selectedDay)}
              </span>
            </div>
          </div>

          {/* Cartes empilées (mobile) */}
          <ul
            className="md:hidden space-y-3"
            role="list"
            aria-label="Périmètres de supervision"
          >
            {filteredScopes.map((scope) => (
              <li
                key={scope.id}
                role="link"
                tabIndex={0}
                aria-label={`Ouvrir le détail de ${scope.name}`}
                onClick={() => navigateToDetail(scope)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigateToDetail(scope);
                  }
                }}
                className="bg-white dark:bg-nord-1 rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs p-4 cursor-pointer hover:border-blue-300 dark:hover:border-nord-9/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-nord-8 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <BillingCodeBadge code={scope.billing_code} />
                      <Link
                        to={`/scopes/${scope.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-semibold text-slate-900 dark:text-nord-6 truncate min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-nord-8 rounded"
                      >
                        {scope.name}
                      </Link>
                    </div>
                    <a
                      href={buildKnowledgeBaseUrl(scope.knowledge_base_id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Ouvrir l'article KB"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-block mt-1 text-xs font-mono text-slate-500 dark:text-nord-4 bg-slate-100 dark:bg-nord-0 px-1.5 py-0.5 rounded border border-slate-200 dark:border-nord-2"
                    >
                      {scope.knowledge_base_id}
                    </a>
                  </div>
                  {scope.selectedDayCompleted ? (
                    <Badge type="completed" label="Terminé" />
                  ) : scope.hasSelectedDay ? (
                    <Badge type="in_progress" label="En cours" />
                  ) : (
                    <Badge type="none" label="Non saisi" />
                  )}
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 dark:text-nord-4">
                  <Users className="w-3.5 h-3.5 text-slate-400 dark:text-nord-3" />
                  <span className="font-semibold text-slate-800 dark:text-nord-5">
                    {scope.official_main}
                  </span>
                  <span className="text-slate-300 dark:text-nord-2">/</span>
                  <span>{scope.official_backup}</span>
                </div>

                <div className="mt-3">
                  <InlineActivityCounters
                    key={`${scope.id}-${selectedDay}`}
                    scopeId={scope.id}
                    day={selectedDay}
                    initialActivity={scope.selectedActivity}
                    onChanged={handleActivityChanged}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-nord-2">
                  {scope.selectedDayCompleted ? (
                    <span className="text-xs text-slate-400 dark:text-nord-3">
                      Complété
                    </span>
                  ) : (
                    <CompleteTodayButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCompleteSelectedDay(scope);
                      }}
                      onKeyDown={(e) => e.stopPropagation()}
                      dayLabel={selectedDayLabel}
                      disabled={completingIds.includes(scope.id)}
                      pending={completingIds.includes(scope.id)}
                    />
                  )}
                  <Link
                    to={`/scopes/${scope.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-nord-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-nord-8 rounded"
                    aria-label={`Voir le détail de ${scope.name}`}
                  >
                    <span>Détail</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Modale d'export des données */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        scopes={scopes}
        filteredScopes={filteredScopes}
        filteredCount={filteredScopes.length}
      />
    </div>
  );
}
