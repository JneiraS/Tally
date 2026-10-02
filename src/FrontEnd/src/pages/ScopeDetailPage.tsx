import { useEffect, useState, useMemo, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Plus,
  ShieldCheck,
  Edit2,
  AlertCircle,
  Users,
  CheckSquare,
  Clock,
  RefreshCw,
  Tag,
  FileCheck2,
  AlertTriangle,
} from 'lucide-react';
import { DailyActivity, ScopeMonitoring } from '../types';
import { protabApi, ApiError } from '../services/api';
import { Badge } from '../components/Badge';
import { BillingCodeBadge } from '../components/BillingCodeBadge';
import { CHECKBOX_CLASS } from '../constants/ui';
import { formatDateFr, formatFullDateFr, compareIsoDatesDesc, getTodayIsoDate } from '../utils/date';
import { buildKnowledgeBaseUrl } from '../utils/knowledgeBase';
import { ActivityFormModal } from '../components/ActivityFormModal';
import { CompleteActivitiesModal } from '../components/CompleteActivitiesModal';
import { TodayActivityEditor } from '../components/TodayActivityEditor';
import { ScopeNoteCard } from '../components/ScopeNoteCard';
import { DateNavigator } from '../components/DateNavigator';
import { useToast } from '../hooks/useToast';

const ScopeDetailCharts = lazy(() =>
  import('../components/ScopeDetailCharts').then((module) => ({
    default: module.ScopeDetailCharts,
  }))
);

export function ScopeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { success, error: toastError } = useToast();

  const [scope, setScope] = useState<ScopeMonitoring | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modales
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<DailyActivity | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  // Sélection rapide pour validation par lot
  const [selectedDayCheckboxes, setSelectedDayCheckboxes] = useState<string[]>([]);
  const [isCompletingBatch, setIsCompletingBatch] = useState(false);

  const todayIso = getTodayIsoDate();

  // Jour affiché dans l'éditeur d'activité en ligne
  const [editorDay, setEditorDay] = useState(todayIso);

  const editorActivity = useMemo(() => {
    return scope?.daily_activities.find((a) => a.day === editorDay) ?? null;
  }, [scope?.daily_activities, editorDay]);

  const handleActivityChanged = (
    _scopeId: string,
    activity: DailyActivity,
  ) => {
    setScope((prev) => {
      if (!prev) return prev;
      const others = prev.daily_activities.filter((a) => a.day !== activity.day);
      return { ...prev, daily_activities: [...others, activity] };
    });
  };

  const handleNoteSaved = (note: string | null) => {
    // La carte renvoie la note enregistrée : la page se met à jour sans
    // recharger le détail, sinon le changement de jour en cours serait perdu.
    setScope((prev) => (prev ? { ...prev, note } : prev));
  };

  const fetchScopeDetail = async () => {
    if (!id) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await protabApi.getScopeMonitoring(id);
      setScope(data);
    } catch (err: unknown) {
      const msg =
        err instanceof ApiError
          ? err.message
          : (err as Error)?.message || 'Impossible de charger le périmètre.';
      setErrorMessage(msg);
      toastError('Erreur', msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScopeDetail();
  }, [id]);

  // Activités triées par date décroissante
  const sortedActivities = useMemo(() => {
    if (!scope?.daily_activities) return [];
    return [...scope.daily_activities].sort((a, b) => compareIsoDatesDesc(a.day, b.day));
  }, [scope?.daily_activities]);

  const existingDays = useMemo(() => {
    return sortedActivities.map((a) => a.day);
  }, [sortedActivities]);

  const uncompletedDays = useMemo(() => {
    return sortedActivities.filter((a) => !a.completed).map((a) => a.day);
  }, [sortedActivities]);

  // Statistiques de synthèse
  const totalErrors = useMemo(() => {
    return sortedActivities.reduce((acc, a) => acc + a.errors_reported, 0);
  }, [sortedActivities]);

  const totalIncidents = useMemo(() => {
    return sortedActivities.reduce((acc, a) => acc + a.incidents_created, 0);
  }, [sortedActivities]);

  const totalFeai = useMemo(() => {
    return sortedActivities.reduce((acc, a) => acc + a.feai.length, 0);
  }, [sortedActivities]);

  const completedActivitiesCount = useMemo(() => {
    return sortedActivities.filter((a) => a.completed).length;
  }, [sortedActivities]);

  const handleOpenCreateActivity = () => {
    setEditingActivity(null);
    setIsActivityModalOpen(true);
  };

  const handleOpenEditActivity = async (day: string) => {
    if (!id) return;
    try {
      // Interroge explicitement la route GET /scope-monitorings/{id}/activities/{day}
      const activityData = await protabApi.getActivity(id, day);
      setEditingActivity(activityData);
      setIsActivityModalOpen(true);
    } catch (err) {
      // Repli sur les données déjà en mémoire si échec
      const fallback = sortedActivities.find((a) => a.day === day);
      if (fallback) {
        setEditingActivity(fallback);
        setIsActivityModalOpen(true);
      } else {
        toastError('Erreur', (err as Error)?.message || 'Impossible de récupérer l\'activité.');
      }
    }
  };

  const handleToggleSelectDay = (day: string) => {
    setSelectedDayCheckboxes((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSelectAllUncompleted = () => {
    if (selectedDayCheckboxes.length === uncompletedDays.length) {
      setSelectedDayCheckboxes([]);
    } else {
      setSelectedDayCheckboxes(uncompletedDays);
    }
  };

  const handleBatchComplete = async () => {
    if (!id || selectedDayCheckboxes.length === 0) return;
    setIsCompletingBatch(true);
    try {
      await protabApi.completeActivities(id, { days: selectedDayCheckboxes });
      success(
        'Journées complétées !',
        `${selectedDayCheckboxes.length} journée(s) marquée(s) comme terminée(s).`
      );
      setSelectedDayCheckboxes([]);
      fetchScopeDetail();
    } catch (err: unknown) {
      toastError('Échec de la validation', (err as Error)?.message);
    } finally {
      setIsCompletingBatch(false);
    }
  };

  const hasActivityToday = existingDays.includes(todayIso);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-nord-1 rounded-xl border border-slate-200 dark:border-nord-2 p-16 text-center shadow-2xs">
        <div className="w-8 h-8 border-3 border-blue-600 dark:border-nord-8 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-700 dark:text-nord-5">Chargement du périmètre...</p>
        <p className="text-xs text-slate-400 dark:text-nord-3 mt-1">Interrogation de GET /scope-monitorings/{id}</p>
      </div>
    );
  }

  if (errorMessage || !scope) {
    return (
      <div className="space-y-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-nord-8 hover:text-blue-800 dark:hover:text-nord-7"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste des périmètres
        </Link>
        <div className="bg-white dark:bg-nord-1 rounded-xl border border-rose-200 dark:border-nord-11/40 p-8 text-center shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-nord-11/20 text-rose-600 dark:text-nord-11 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-nord-6">Périmètre non trouvé</h2>
          <p className="text-sm text-slate-500 dark:text-nord-4 max-w-md mx-auto">
            {errorMessage || `Aucun périmètre de supervision ne correspond à l'identifiant ${id}.`}
          </p>
          <button
            type="button"
            onClick={fetchScopeDetail}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-nord-10 dark:hover:bg-nord-9 rounded-lg shadow-xs transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation retour */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-nord-4 hover:text-blue-600 dark:hover:text-nord-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux périmètres</span>
        </Link>

        <button
          type="button"
          onClick={fetchScopeDetail}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-nord-4 bg-white dark:bg-nord-1 hover:bg-slate-50 dark:hover:bg-nord-2 border border-slate-200 dark:border-nord-2 rounded-lg shadow-2xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Carte d'identité du périmètre */}
      <div className="bg-white dark:bg-nord-1 rounded-2xl border border-slate-200 dark:border-nord-2 p-6 shadow-2xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-nord-2 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <BillingCodeBadge code={scope.billing_code} />
                <h1 className="text-2xl font-bold text-slate-900 dark:text-nord-6">{scope.name}</h1>
              </div>
              <a
                href={buildKnowledgeBaseUrl(scope.knowledge_base_id)}
                target="_blank"
                rel="noopener noreferrer"
                title="Ouvrir l'article KB"
                className="text-xs font-mono font-semibold bg-blue-50 dark:bg-nord-10/25 text-blue-700 dark:text-nord-8 border border-blue-200 dark:border-nord-9/40 px-2 py-0.5 rounded-md hover:bg-blue-100 dark:hover:bg-nord-10/40 hover:border-blue-400 dark:hover:border-nord-8/60 transition-colors"
              >
                {scope.knowledge_base_id}
              </a>
            </div>
            <p className="text-xs text-slate-400 dark:text-nord-3 font-mono mt-1">ID: {scope.id}</p>
          </div>

          {/* Boutons d'action pour le périmètre */}
          <div className="flex flex-wrap items-center gap-2">
            {uncompletedDays.length > 0 && (
              <button
                type="button"
                onClick={() => setIsCompleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-nord-14 bg-emerald-50 dark:bg-nord-14/15 hover:bg-emerald-100 dark:hover:bg-nord-14/25 border border-emerald-200 dark:border-nord-14/30 rounded-lg transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Compléter des journées ({uncompletedDays.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenCreateActivity}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-nord-10 dark:hover:bg-nord-9 active:bg-blue-800 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Saisir une activité</span>
            </button>
          </div>
        </div>

        {/* Détails responsables et métriques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3.5 bg-slate-50 dark:bg-nord-0 rounded-xl border border-slate-200/80 dark:border-nord-2">
            <span className="text-xs text-slate-500 dark:text-nord-4 font-medium block mb-1">
              Responsable Principal
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-nord-6 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600 dark:text-nord-8" />
              {scope.official_main}
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-nord-0 rounded-xl border border-slate-200/80 dark:border-nord-2">
            <span className="text-xs text-slate-500 dark:text-nord-4 font-medium block mb-1">
              Responsable Suppléant (Backup)
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-nord-6 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-400 dark:text-nord-3" />
              {scope.official_backup}
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-nord-0 rounded-xl border border-slate-200/80 dark:border-nord-2">
            <span className="text-xs text-slate-500 dark:text-nord-4 font-medium block mb-1">
              Statut du jour ({todayIso})
            </span>
            {hasActivityToday ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-nord-14 bg-emerald-100/60 dark:bg-nord-14/20 px-2 py-0.5 rounded">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-600 dark:text-nord-14" />
                Activité saisie
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-nord-13 bg-amber-100/60 dark:bg-nord-13/20 px-2 py-0.5 rounded">
                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-nord-13" />
                En attente de saisie
              </span>
            )}
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-nord-0 rounded-xl border border-slate-200/80 dark:border-nord-2">
            <span className="text-xs text-slate-500 dark:text-nord-4 font-medium block mb-1">
              Complétion globale
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-nord-6">
              {completedActivitiesCount} / {sortedActivities.length} terminée(s)
            </p>
          </div>
        </div>
      </div>

      {/* Note libre du périmètre — brouillon, enregistré explicitement */}
      <ScopeNoteCard
        scopeId={scope.id}
        note={scope.note}
        onSaved={handleNoteSaved}
      />

      {/* Activité du jour — édition en ligne  */}
      <div className="bg-white dark:bg-nord-1 rounded-2xl border border-slate-200 dark:border-nord-2 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-nord-6 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-blue-600 dark:text-nord-8" />
              Activité du jour
            </h2>
            <p className="text-xs text-slate-500 dark:text-nord-4">
              Saisie en ligne — sauvegarde automatique de l'activité quotidienne
            </p>
          </div>
          <DateNavigator
            value={editorDay}
            today={todayIso}
            onChange={setEditorDay}
          />
        </div>

        <TodayActivityEditor
          key={editorDay}
          scopeId={scope.id}
          day={editorDay}
          initialActivity={editorActivity}
          onChanged={handleActivityChanged}
        />
      </div>

      {/* Tendance du périmètre, placée avant le détail jour par jour */}
      {sortedActivities.length > 0 && (
        <Suspense
          fallback={
            <div
              aria-label="Chargement du graphique"
              className="h-80 bg-white dark:bg-nord-1 rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs animate-pulse"
            />
          }
        >
          <ScopeDetailCharts scope={scope} />
        </Suspense>
      )}

      {/* Barre d'actions groupées si des lignes sont sélectionnées */}
      {selectedDayCheckboxes.length > 0 && (
        <div className="bg-blue-600 dark:bg-nord-10 text-white p-3.5 rounded-xl shadow-md flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
            <CheckSquare className="w-5 h-5 text-blue-200 dark:text-nord-8" />
            <span>
              {selectedDayCheckboxes.length} journée(s) sélectionnée(s) pour validation
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedDayCheckboxes([])}
              className="px-3 py-1 text-xs font-medium text-blue-100 hover:text-white bg-blue-700 dark:bg-nord-9 hover:bg-blue-800 rounded-lg transition-colors"
            >
              Désélectionner
            </button>
            <button
              type="button"
              onClick={handleBatchComplete}
              disabled={isCompletingBatch}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs sm:text-sm font-semibold text-blue-900 bg-white hover:bg-blue-50 rounded-lg shadow-xs transition-colors"
            >
              {isCompletingBatch ? (
                <span>Validation...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-nord-14" />
                  <span>Marquer comme terminé</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Calendrier & Liste des activités quotidiennes */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-nord-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-nord-8" />
              Activités quotidiennes par jour
            </h2>
            <p className="text-xs text-slate-500 dark:text-nord-4">
              Historique des erreurs, incidents créés et fiches FEAI (1 seule activité par jour)
            </p>
          </div>

          {uncompletedDays.length > 0 && (
            <button
              type="button"
              onClick={handleSelectAllUncompleted}
              className="text-xs font-medium text-blue-600 dark:text-nord-8 hover:text-blue-700 dark:hover:text-nord-7 hover:underline self-start sm:self-auto"
            >
              {selectedDayCheckboxes.length === uncompletedDays.length
                ? 'Tout désélectionner'
                : `Sélectionner les non terminés (${uncompletedDays.length})`}
            </button>
          )}
        </div>

        {sortedActivities.length === 0 ? (
          <div className="bg-white dark:bg-nord-1 rounded-xl border border-slate-200 dark:border-nord-2 p-12 text-center shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-nord-0 text-slate-500 dark:text-nord-4 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-nord-6">
              Aucune activité enregistrée
            </h3>
            <p className="text-xs text-slate-500 dark:text-nord-4 max-w-sm mx-auto">
              Ce périmètre ne dispose pas encore de relevé d'activité quotidienne.
            </p>
            <button
              type="button"
              onClick={handleOpenCreateActivity}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-nord-10 dark:hover:bg-nord-9 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Créer la première activité
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-nord-1 rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-nord-5">
                <thead className="bg-slate-50/80 dark:bg-nord-0/60 border-b border-slate-200 dark:border-nord-2 text-xs font-semibold text-slate-700 dark:text-nord-4 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-center w-10">
                      <span className="sr-only">Sélection</span>
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Jour (Date)
                    </th>
                    <th scope="col" className="px-4 py-3 text-center">
                      Erreurs signalées
                    </th>
                    <th scope="col" className="px-4 py-3 text-center">
                      Incidents créés
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Fiches FEAI
                    </th>
                    <th scope="col" className="px-4 py-3 text-center">
                      Statuts (Traité / Terminé)
                    </th>
                    <th scope="col" className="px-4 py-3 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-nord-2">
                  {sortedActivities.map((activity) => {
                    const isToday = activity.day === todayIso;
                    const isSelected = selectedDayCheckboxes.includes(activity.day);

                    return (
                      <tr
                        key={activity.day}
                        className={`hover:bg-slate-50/70 dark:hover:bg-nord-2/50 transition-colors ${
                          isSelected
                            ? 'bg-blue-50/40 dark:bg-nord-9/20'
                            : isToday
                            ? 'bg-amber-50/20 dark:bg-nord-13/10'
                            : ''
                        }`}
                      >
                        {/* Checkbox de sélection pour complétion */}
                        <td className="px-4 py-3.5 text-center">
                          {!activity.completed ? (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectDay(activity.day)}
                              aria-label={`Sélectionner le jour ${activity.day}`}
                              className={CHECKBOX_CLASS}
                            />
                          ) : (
                            <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-nord-14 mx-auto" />
                          )}
                        </td>

                        {/* Jour / Date */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div>
                              <span className="font-semibold text-slate-900 dark:text-nord-6 block">
                                {formatDateFr(activity.day)}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-nord-4 font-mono">
                                {activity.day}
                              </span>
                            </div>
                            {isToday && (
                              <span className="text-[10px] font-bold bg-amber-100 dark:bg-nord-13/20 text-amber-800 dark:text-nord-13 px-1.5 py-0.5 rounded border border-amber-200 dark:border-nord-13/40">
                                Aujourd'hui
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Erreurs signalées */}
                        <td className="px-4 py-3.5 text-center">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                              activity.errors_reported > 0
                                ? 'bg-amber-100 dark:bg-nord-13/20 text-amber-900 dark:text-nord-13'
                                : 'bg-slate-100 dark:bg-nord-0 text-slate-600 dark:text-nord-4'
                            }`}
                          >
                            {activity.errors_reported}
                          </span>
                        </td>

                        {/* Incidents créés */}
                        <td className="px-4 py-3.5 text-center">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                              activity.incidents_created > 0
                                ? 'bg-rose-100 dark:bg-nord-11/20 text-rose-900 dark:text-nord-11'
                                : 'bg-slate-100 dark:bg-nord-0 text-slate-600 dark:text-nord-4'
                            }`}
                          >
                            {activity.incidents_created}
                          </span>
                        </td>

                        {/* FEAI */}
                        <td className="px-4 py-3.5">
                          {activity.feai && activity.feai.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {activity.feai.map((code) => (
                                <span
                                  key={code}
                                  className="inline-flex items-center gap-1 text-[11px] font-mono bg-slate-100 dark:bg-nord-0 text-slate-800 dark:text-nord-5 px-1.5 py-0.5 rounded border border-slate-200 dark:border-nord-2"
                                >
                                  <Tag className="w-2.5 h-2.5 text-slate-400 dark:text-nord-3" />
                                  {code}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 dark:text-nord-3 italic">Aucune</span>
                          )}
                        </td>

                        {/* Badges Handled & Completed */}
                        <td className="px-4 py-3.5 text-center">
                          <div className="inline-flex flex-wrap justify-center gap-1.5">
                            {activity.completed ? (
                              <Badge type="completed" label="Terminé" />
                            ) : (
                              <Badge type="in_progress" label="En cours" />
                            )}

                            {activity.handled ? (
                              <Badge type="handled" label="Traité" />
                            ) : (
                              <span className="text-xs text-slate-400 dark:text-nord-3 italic">Non traité</span>
                            )}
                          </div>
                        </td>

                        {/* Actions par jour */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Modifier l'activité (PATCH) */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditActivity(activity.day)}
                              className="p-1.5 text-slate-500 dark:text-nord-4 hover:text-blue-600 dark:hover:text-nord-8 hover:bg-blue-50 dark:hover:bg-nord-2 rounded-lg transition-colors"
                              title={`Modifier l'activité du ${activity.day} (PATCH)`}
                              aria-label={`Modifier l'activité du ${activity.day}`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Compléter l'activité individuellement (POST complete) */}
                            {!activity.completed && (
                              <button
                                type="button"
                                onClick={async () => {
                                  if (!id) return;
                                  try {
                                    await protabApi.completeActivities(id, {
                                      days: [activity.day],
                                    });
                                    success('Activité complétée', `Journée du ${activity.day} validée.`);
                                    fetchScopeDetail();
                                  } catch (err) {
                                    toastError('Erreur', (err as Error)?.message);
                                  }
                                }}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-700 dark:text-nord-14 bg-emerald-50 dark:bg-nord-14/15 hover:bg-emerald-100 dark:hover:bg-nord-14/25 border border-emerald-200 dark:border-nord-14/30 rounded-lg transition-colors"
                                title="Marquer cette journée comme terminée"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span className="hidden md:inline">Terminer</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 dark:border-nord-2 bg-slate-50/50 dark:bg-nord-0/40 text-xs text-slate-500 dark:text-nord-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>
                Total : {sortedActivities.length} relevé(s) d'activité • {totalErrors} erreur(s) •{' '}
                {totalIncidents} incident(s) • {totalFeai} réf(s) FEAI
              </span>
              <span className="text-slate-400 dark:text-nord-3">
                Règle : Un jour complété (completed) est forcément traité (handled)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Modale de création / modification d'activité */}
      <ActivityFormModal
        isOpen={isActivityModalOpen}
        onClose={() => {
          setIsActivityModalOpen(false);
          setEditingActivity(null);
        }}
        scopeId={scope.id}
        scopeName={scope.name}
        existingDays={existingDays}
        initialActivity={editingActivity}
        onSuccess={fetchScopeDetail}
      />

      {/* Modale de complétion par lot */}
      <CompleteActivitiesModal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        scopeId={scope.id}
        scopeName={scope.name}
        activities={sortedActivities}
        onSuccess={fetchScopeDetail}
      />
    </div>
  );
}
