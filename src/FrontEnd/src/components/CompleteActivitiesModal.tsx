import { useState } from 'react';
import { ShieldCheck, CheckSquare, Square, AlertCircle } from 'lucide-react';
import { Modal } from './Modal';
import { DailyActivity } from '../types';
import { formatDateFr } from '../utils/date';
import { protabApi, ApiError } from '../services/api';
import { useToast } from '../hooks/useToast';

interface CompleteActivitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  scopeId: string;
  scopeName: string;
  activities: DailyActivity[];
  onSuccess: () => void;
}

export function CompleteActivitiesModal({
  isOpen,
  onClose,
  scopeId,
  scopeName,
  activities,
  onSuccess,
}: CompleteActivitiesModalProps) {
  const { success, error: toastError } = useToast();
  // Filtrer uniquement les journées non encore complétées
  const uncompletedActivities = activities.filter((a) => !a.completed);

  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleToggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSelectAll = () => {
    if (selectedDays.length === uncompletedActivities.length) {
      setSelectedDays([]);
    } else {
      setSelectedDays(uncompletedActivities.map((a) => a.day));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDays.length === 0) {
      setErrorMessage('Veuillez sélectionner au moins une journée à compléter.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await protabApi.completeActivities(scopeId, { days: selectedDays });
      success(
        'Journées marquées comme terminées !',
        `${selectedDays.length} journée(s) d'activité validée(s) pour ${scopeName}.`
      );
      setSelectedDays([]);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage((err as Error)?.message || 'Une erreur est survenue lors de la validation.');
      }
      toastError('Échec de la validation', (err as Error)?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Compléter des journées d'activité"
      subtitle={`Périmètre : ${scopeName} (POST /scope-monitorings/{id}/activities/complete)`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 dark:bg-nord-11/15 border border-rose-200 dark:border-nord-11/30 text-rose-800 dark:text-nord-11 rounded-xl text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-nord-11 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Erreur :</span> {errorMessage}
            </div>
          </div>
        )}

        {uncompletedActivities.length === 0 ? (
          <div className="p-6 text-center bg-slate-50 dark:bg-nord-0 border border-slate-200 dark:border-nord-2 rounded-xl">
            <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-nord-14 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800 dark:text-nord-6">
              Toutes les journées sont déjà terminées !
            </p>
            <p className="text-xs text-slate-500 dark:text-nord-4 mt-1">
              Aucune activité en attente de complétion sur ce périmètre.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-nord-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-nord-4">
                Journées en attente ({uncompletedActivities.length})
              </span>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs font-medium text-blue-600 dark:text-nord-8 hover:text-blue-700 dark:hover:text-nord-7 hover:underline"
              >
                {selectedDays.length === uncompletedActivities.length
                  ? 'Tout désélectionner'
                  : 'Tout sélectionner'}
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {uncompletedActivities.map((act) => {
                const isSelected = selectedDays.includes(act.day);
                return (
                  <label
                    key={act.day}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50/60 dark:bg-nord-9/20 border-blue-300 dark:border-nord-9 text-blue-900 dark:text-nord-6'
                        : 'bg-white dark:bg-nord-1 border-slate-200 dark:border-nord-2 hover:bg-slate-50 dark:hover:bg-nord-2/50 text-slate-800 dark:text-nord-5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleDay(act.day)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-nord-2 dark:bg-nord-0 focus:ring-blue-500"
                      />
                      <div>
                        <p className="text-sm font-semibold">{formatDateFr(act.day)}</p>
                        <p className="text-xs text-slate-500 dark:text-nord-4">
                          {act.errors_reported} erreur{act.errors_reported > 1 ? 's' : ''} •{' '}
                          {act.incidents_created} incident{act.incidents_created > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-mono text-slate-400 dark:text-nord-3">{act.day}</span>
                  </label>
                );
              })}
            </div>

            {/* Avertissement / Info confirmation */}
            <div className="text-[11px] text-slate-600 dark:text-nord-4 bg-amber-50/70 dark:bg-nord-13/15 p-3 rounded-xl border border-amber-200/60 dark:border-nord-13/30">
              <span className="font-semibold text-amber-900 dark:text-nord-13">Information :</span> En marquant ces
              journées comme terminées (completed), elles seront automatiquement considérées comme
              traitées (handled).
            </div>
          </>
        )}

        {/* Boutons d'action */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-nord-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-nord-5 bg-slate-100 dark:bg-nord-2 hover:bg-slate-200 dark:hover:bg-nord-3 rounded-lg transition-colors"
          >
            Fermer
          </button>
          {uncompletedActivities.length > 0 && (
            <button
              type="submit"
              disabled={selectedDays.length === 0 || isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 dark:bg-nord-14/90 dark:hover:bg-nord-14 dark:text-nord-0 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Validation en cours...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    Marquer {selectedDays.length > 0 ? `(${selectedDays.length})` : ''} comme terminé
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}
