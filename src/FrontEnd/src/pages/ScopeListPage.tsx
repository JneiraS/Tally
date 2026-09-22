import { useEffect, useState, useMemo, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import {
  Layers,
  Search,
  RefreshCw,
  Plus,
  UploadCloud,
  ChevronRight,
  AlertCircle,
  ShieldCheck,
  Clock,
  FileSpreadsheet,
  Users,
  Activity as ActivityIcon,
} from "lucide-react";
import { NonWorkingDays, ScopeMonitoring, DailyActivity } from "../types";
import { protabApi, ApiError } from "../services/api";
import { Badge } from "../components/Badge";
import { TodayActivityEditor } from "../components/TodayActivityEditor";
import { CompleteTodayButton } from "../components/CompleteTodayButton";
import { formatDateFr, getTodayIsoDate } from "../utils/date";
import { buildKnowledgeBaseUrl } from "../utils/knowledgeBase";
import {
  baselineDelta,
  coverageRate,
  lastWorkingDays,
  trailingErrors,
  transformationRate,
} from "../utils/kpi";
import { useToast } from "../hooks/useToast";
import { DateNavigator } from "../components/DateNavigator";

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

export function ScopeListPage({
  onOpenCreateScope,
  onOpenImportCsv,
  refreshTrigger,
  nonWorkingDays,
}: ScopeListPageProps) {
  const { success: toastSuccess, error: toastError } = useToast();
  const [scopes, setScopes] = useState<ScopeMonitoring[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "in_progress" | "completed" | "none"
  >("all");
  const [completingIds, setCompletingIds] = useState<string[]>([]);

  const todayIso = getTodayIsoDate();
  const [selectedDay, setSelectedDay] = useState(todayIso);
  const isSelectedDayToday = selectedDay === todayIso;
  const selectedDayLabel = isSelectedDayToday
    ? "du jour"
    : `du ${formatDateFr(selectedDay)}`;
  const selectedDayValidationLabel = isSelectedDayToday
    ? "aujourd'hui"
    : `le ${formatDateFr(selectedDay)}`;

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

  // Calculs dérivés par périmètre
  const enrichedScopes = useMemo(() => {
    return scopes.map((scope) => {
      const activities = scope.daily_activities || [];
      const selectedActivity = activities.find((a) => a.day === selectedDay);
      const hasSelectedDay = !!selectedActivity;
      const selectedDayCompleted = selectedActivity?.completed ?? false;
      const selectedDayHandled = selectedActivity?.handled ?? false;

      // Détermination du statut global du jour ou de suivi
      let status: "completed" | "in_progress" | "none" = "none";
      if (selectedActivity) {
        status = selectedDayCompleted ? "completed" : "in_progress";
      }

      const totalErrors = activities.reduce(
        (acc, a) => acc + (a.errors_reported || 0),
        0,
      );
      const totalIncidents = activities.reduce(
        (acc, a) => acc + (a.incidents_created || 0),
        0,
      );

      return {
        ...scope,
        selectedActivity,
        hasSelectedDay,
        selectedDayCompleted,
        selectedDayHandled,
        status,
        totalErrors,
        totalIncidents,
      };
    });
  }, [scopes, selectedDay]);

  // Filtrage selon recherche et statut
  const filteredScopes = useMemo(() => {
    return enrichedScopes.filter((scope) => {
      const matchesSearch =
        scope.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scope.knowledge_base_id
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        scope.official_main.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scope.official_backup.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === "completed") {
        return scope.status === "completed";
      }
      if (statusFilter === "in_progress") {
        return scope.status === "in_progress";
      }
      if (statusFilter === "none") {
        return scope.status === "none";
      }
      return true;
    });
  }, [enrichedScopes, searchQuery, statusFilter]);

  // Statistiques pour le bandeau supérieur
  const stats = useMemo(() => {
    const total = scopes.length;
    const completedCount = enrichedScopes.filter(
      (s) => s.selectedDayCompleted,
    ).length;
    const pendingCount = total - completedCount;
    const selectedDayErrors = enrichedScopes.reduce(
      (acc, s) => acc + (s.selectedActivity?.errors_reported || 0),
      0,
    );
    const selectedDayIncidents = enrichedScopes.reduce(
      (acc, s) => acc + (s.selectedActivity?.incidents_created || 0),
      0,
    );
    const selectedDayFeai = enrichedScopes.reduce(
      (acc, s) => acc + (s.selectedActivity?.feai.length || 0),
      0,
    );
    const rate = transformationRate(selectedDayIncidents, selectedDayErrors);
    const trailing = trailingErrors(selectedDayErrors, selectedDayIncidents);

    return {
      total,
      completedCount,
      pendingCount,
      selectedDayErrors,
      selectedDayIncidents,
      selectedDayFeai,
      rate,
      trailing,
      delta: baselineDelta(scopes, selectedDay, nonWorkingDays),
      coverage: coverageRate(
        scopes,
        lastWorkingDays(selectedDay, 7, nonWorkingDays),
      ),
    };
  }, [scopes, enrichedScopes, selectedDay, nonWorkingDays]);

  return (
    <div className="space-y-6">
      {/* En-tête de page & Titre */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

        <div className="flex items-center gap-2">
          <DateNavigator
            value={selectedDay}
            today={todayIso}
            onChange={setSelectedDay}
          />
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

      {/* Cartes de synthèse / Statistiques du jour */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-nord-1 p-4 rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-nord-4">
            <span className="text-xs font-medium uppercase tracking-wider">
              Périmètres totaux
            </span>
            <Layers className="w-4 h-4 text-blue-600 dark:text-nord-9" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-nord-6 mt-2">
            {stats.total}
          </p>
          <p className="text-xs text-slate-500 dark:text-nord-4 mt-1">
            Couverture 7 j ouvrés : {stats.coverage} %
          </p>
        </div>

        <div className="bg-white dark:bg-nord-1 p-4 rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-nord-4">
            <span className="text-xs font-medium uppercase tracking-wider">
              {isSelectedDayToday
                ? "validé aujourd'hui"
                : `Terminé ${selectedDayValidationLabel}`}
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-nord-14" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-nord-14 mt-2">
            {stats.completedCount}
          </p>
          <p className="text-xs text-slate-500 dark:text-nord-4 mt-1">
            {stats.pendingCount} en cours ou en attente
          </p>
        </div>

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
                Δ baseline (7 j ouvrés) : —
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
                Δ baseline (7 j ouvrés) : {stats.delta.direction === "up" ? "▲" : "▼"}{" "}
                {Math.abs(stats.delta.deltaPct)} %
              </span>
            )}
          </p>
        </div>

        <div className="bg-white dark:bg-nord-1 p-4 rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-nord-4">
            <span className="text-xs font-medium uppercase tracking-wider">
              {`Incidents créés ${selectedDayLabel}`}
            </span>
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-nord-11" />
          </div>
          <p className="text-2xl font-bold text-rose-600 dark:text-nord-11 mt-2">
            {stats.selectedDayIncidents}
          </p>
          <p className="text-xs text-slate-500 dark:text-nord-4 mt-1">
            {stats.rate === null
              ? "Aucune erreur du jour"
              : `${stats.rate} % des erreurs · ${stats.trailing} non transformée${stats.trailing > 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* Graphiques KPI */}
      {scopes.length > 0 && (
        <Suspense
          fallback={
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-nord-1 p-4 rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs h-80 animate-pulse" />
              <div className="bg-white dark:bg-nord-1 p-4 rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs h-80 animate-pulse" />
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

      {/* Barre d'outils (Recherche & Filtres) */}
      <div className="bg-white dark:bg-nord-1 p-3.5 rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 dark:text-nord-3 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher par nom, KB-ID, responsable..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 dark:bg-nord-0 border border-slate-200 dark:border-nord-2 text-slate-900 dark:text-nord-5 placeholder:text-slate-400 dark:placeholder:text-nord-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-nord-8 focus:bg-white dark:focus:bg-nord-0 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-nord-2 p-0.5 bg-slate-50 dark:bg-nord-0 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                statusFilter === "all"
                  ? "bg-white dark:bg-nord-2 text-slate-900 dark:text-nord-6 shadow-2xs"
                  : "text-slate-600 dark:text-nord-4 hover:text-slate-900 dark:hover:text-nord-6"
              }`}
            >
              Tous ({enrichedScopes.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("in_progress")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                statusFilter === "in_progress"
                  ? "bg-white dark:bg-nord-2 text-slate-900 dark:text-nord-6 shadow-2xs"
                  : "text-slate-600 dark:text-nord-4 hover:text-slate-900 dark:hover:text-nord-6"
              }`}
            >
              En cours (
              {enrichedScopes.filter((s) => s.status === "in_progress").length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("none")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                statusFilter === "none"
                  ? "bg-white dark:bg-nord-2 text-slate-900 dark:text-nord-6 shadow-2xs"
                  : "text-slate-600 dark:text-nord-4 hover:text-slate-900 dark:hover:text-nord-6"
              }`}
            >
              Non saisi (
              {enrichedScopes.filter((s) => s.status === "none").length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("completed")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                statusFilter === "completed"
                  ? "bg-white dark:bg-nord-2 text-slate-900 dark:text-nord-6 shadow-2xs"
                  : "text-slate-600 dark:text-nord-4 hover:text-slate-900 dark:hover:text-nord-6"
              }`}
            >
              Terminés (
              {enrichedScopes.filter((s) => s.selectedDayCompleted).length})
            </button>
          </div>
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
        /* Tableau des périmètres */
        <div className="bg-white dark:bg-nord-1 rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-nord-5">
              <thead className="bg-slate-50/80 dark:bg-nord-0/60 border-b border-slate-200 dark:border-nord-2 text-xs font-semibold text-slate-700 dark:text-nord-4 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-5 py-3.5">
                    Périmètre & Base KB
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Responsable Principal
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Responsable Suppléant
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left w-80">
                    {`Activité ${selectedDayLabel}`}
                    <span className="block text-[10px] font-medium text-slate-400 dark:text-nord-3 normal-case tracking-normal mt-0.5">
                      Saisie en ligne — sauvegarde auto • Σ FEAI :{' '}
                      {stats.selectedDayFeai}
                    </span>
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
                {filteredScopes.map((scope) => {
                  const selectedActivity = scope.selectedActivity;

                  return (
                    <tr
                      key={scope.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-nord-2/50 transition-colors group"
                    >
                      {/* Nom & KB-ID */}
                      <td className="px-5 py-4">
                        <Link
                          to={`/scopes/${scope.id}`}
                          className="font-semibold text-slate-900 dark:text-nord-6 group-hover:text-blue-600 dark:group-hover:text-nord-8 transition-colors block"
                        >
                          {scope.name}
                        </Link>
                        <a
                          href={buildKnowledgeBaseUrl(scope.knowledge_base_id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Ouvrir l'article KB"
                          className="inline-block mt-0.5 text-xs font-mono text-slate-500 dark:text-nord-4 bg-slate-100 dark:bg-nord-0 px-1.5 py-0.5 rounded border border-slate-200 dark:border-nord-2 hover:text-blue-600 dark:hover:text-nord-8 hover:border-blue-400 dark:hover:border-nord-9/60 transition-colors"
                        >
                          {scope.knowledge_base_id}
                        </a>
                      </td>

                      {/* Responsable Principal */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400 dark:text-nord-3" />
                          <span className="text-slate-800 dark:text-nord-5 font-medium">
                            {scope.official_main}
                          </span>
                        </div>
                      </td>

                      {/* Responsable Backup */}
                      <td className="px-5 py-4">
                        <span className="text-slate-600 dark:text-nord-4">
                          {scope.official_backup}
                        </span>
                      </td>

                      {/* Saisie en ligne de l'activité du jour */}
                      <td className="px-3 py-2">
                        <TodayActivityEditor
                          key={`${scope.id}-${selectedDay}`}
                          scopeId={scope.id}
                          day={selectedDay}
                          initialActivity={selectedActivity}
                          onChanged={handleActivityChanged}
                        />
                      </td>

                      {/* Statut (en-cours / terminé) */}
                      <td className="px-5 py-4 text-center">
                        {scope.selectedDayCompleted ? (
                          <Badge type="completed" label="Terminé" />
                        ) : (
                          <div className="flex flex-col items-center gap-1.5">
                            {selectedActivity ? (
                              <Badge type="in_progress" label="En cours" />
                            ) : (
                              <Badge type="neutral" label="Non saisi" />
                            )}
                            <CompleteTodayButton
                              onClick={() => handleCompleteSelectedDay(scope)}
                              dayLabel={selectedDayLabel}
                              disabled={completingIds.includes(scope.id)}
                              pending={completingIds.includes(scope.id)}
                            />
                          </div>
                        )}
                      </td>

                      {/* Action Détail */}
                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/scopes/${scope.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-nord-8 hover:text-blue-800 dark:hover:text-nord-7 group-hover:translate-x-0.5 transition-transform"
                        >
                          <span>Détail</span>
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
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
      )}
    </div>
  );
}
