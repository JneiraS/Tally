import { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Modal } from './Modal';
import { DailyActivity } from '../types';
import { FEAI_MAX_LENGTH, isValidFeai, normalizeFeai, validateActivityForm } from '../utils/validation';
import { getTodayIsoDate, formatDateFr } from '../utils/date';
import { protabApi, ApiError } from '../services/api';
import { useToast } from '../hooks/useToast';

interface ActivityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  scopeId: string;
  scopeName: string;
  existingDays: string[];
  initialActivity?: DailyActivity | null; // Si présent => mode modification (PATCH), sinon création (POST)
  onSuccess: () => void;
}

export function ActivityFormModal({
  isOpen,
  onClose,
  scopeId,
  scopeName,
  existingDays,
  initialActivity,
  onSuccess,
}: ActivityFormModalProps) {
  const { success, error: toastError } = useToast();
  const isEditMode = !!initialActivity;

  const [day, setDay] = useState(getTodayIsoDate());
  const [errorsReported, setErrorsReported] = useState<number | string>(0);
  const [incidentsCreated, setIncidentsCreated] = useState<number | string>(0);
  const [feaiList, setFeaiList] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feaiItemErrors, setFeaiItemErrors] = useState<Record<number, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialisation du formulaire à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setGeneralError(null);
      setErrors({});
      setFeaiItemErrors({});

      if (initialActivity) {
        setDay(initialActivity.day);
        setErrorsReported(initialActivity.errors_reported);
        setIncidentsCreated(initialActivity.incidents_created);
        setFeaiList(initialActivity.feai ? [...initialActivity.feai] : []);
      } else {
        // En création, proposer une date par défaut qui n'est pas encore utilisée si possible
        const today = getTodayIsoDate();
        setDay(today);
        setErrorsReported(0);
        setIncidentsCreated(0);
        setFeaiList([]);
      }
    }
  }, [isOpen, initialActivity]);

  const handleAddFeai = () => {
    setFeaiList((prev) => [...prev, '']);
  };

  const handleRemoveFeai = (index: number) => {
    setFeaiList((prev) => prev.filter((_, i) => i !== index));
    setFeaiItemErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const handleFeaiChange = (index: number, val: string) => {
    // Majuscules seulement : le trim à la frappe effaçait la séparatrice que
    // l'utilisateur tape entre le préfixe et le code (« FE INC… »). La forme
    // canonique est obtenue à l'enregistrement, pas pendant la saisie.
    const upperVal = val.toUpperCase();
    setFeaiList((prev) => {
      const next = [...prev];
      next[index] = upperVal;
      return next;
    });

    // Effacer l'erreur de cet index
    if (feaiItemErrors[index]) {
      setFeaiItemErrors((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    }
    setGeneralError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    // Validation front
    const { isValid, errors: validationErrors } = validateActivityForm(
      {
        day,
        errors_reported: errorsReported,
        incidents_created: incidentsCreated,
        feai: feaiList,
      },
      {
        isCreation: !isEditMode,
        existingDays,
      }
    );

    const formErrors: Record<string, string> = {};
    if (validationErrors.day) formErrors.day = validationErrors.day;
    if (validationErrors.errors_reported) formErrors.errors_reported = validationErrors.errors_reported;
    if (validationErrors.incidents_created) formErrors.incidents_created = validationErrors.incidents_created;
    if (validationErrors.feai) formErrors.feai = validationErrors.feai;

    setErrors(formErrors);
    setFeaiItemErrors(validationErrors.feai_items || {});

    if (!isValid) {
      setGeneralError('Veuillez corriger les règles métier non respectées avant de valider.');
      return;
    }

    setIsSubmitting(true);
    try {
      const numErrors = Number(errorsReported);
      const numIncidents = Number(incidentsCreated);
      const cleanedFeai = feaiList.map((f) => normalizeFeai(f));

      if (isEditMode) {
        // PATCH /scope-monitorings/{id}/activities/{day}
        await protabApi.updateActivity(scopeId, day, {
          errors_reported: numErrors,
          incidents_created: numIncidents,
          feai: cleanedFeai,
        });
        success(
          'Activité mise à jour',
          `L'activité du ${formatDateFr(day)} a été modifiée avec succès.`
        );
      } else {
        // POST /scope-monitorings/{id}/activities
        await protabApi.createActivity(scopeId, {
          day,
          errors_reported: numErrors,
          incidents_created: numIncidents,
          feai: cleanedFeai,
        });
        success(
          'Activité enregistrée',
          `L'activité du ${formatDateFr(day)} a été créée pour ${scopeName}.`
        );
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setGeneralError(
            `Conflit (409) : Une activité existe déjà pour le jour ${day}. Vous ne pouvez pas enregistrer deux activités le même jour.`
          );
        } else if (err.status === 400) {
          setGeneralError(`Règle métier violée (400) : ${err.message}`);
        } else if (err.status === 404) {
          setGeneralError(`Introuvable (404) : ${err.message}`);
        } else {
          setGeneralError(err.message);
        }
      } else {
        setGeneralError((err as Error)?.message || 'Une erreur est survenue.');
      }
      toastError(
        isEditMode ? 'Échec de la modification' : 'Échec de la création',
        (err as Error)?.message
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? `Modifier l'activité du ${formatDateFr(day)}` : 'Nouvelle activité quotidienne'}
      subtitle={`Périmètre : ${scopeName} ${
        isEditMode
          ? '(PATCH /scope-monitorings/{id}/activities/{day})'
          : '(POST /scope-monitorings/{id}/activities)'
      }`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {generalError && (
          <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 dark:bg-nord-11/15 border border-rose-200 dark:border-nord-11/30 text-rose-800 dark:text-nord-11 rounded-xl text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-nord-11 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Erreur :</span> {generalError}
            </div>
          </div>
        )}

        {/* Champ Jour / Date */}
        <div>
          <label htmlFor="activity-day" className="block text-xs font-semibold text-slate-700 dark:text-nord-4 mb-1">
            Date d'activité (YYYY-MM-DD) <span className="text-rose-500 dark:text-nord-11">*</span>
          </label>
          <div className="relative">
            <input
              id="activity-day"
              type="date"
              value={day}
              onChange={(e) => {
                setDay(e.target.value);
                setErrors((prev) => ({ ...prev, day: '' }));
                setGeneralError(null);
              }}
              disabled={isEditMode || isSubmitting}
              className={`w-full px-3 py-2 text-sm bg-white dark:bg-nord-1 text-slate-900 dark:text-nord-5 border rounded-lg focus:outline-none focus:ring-2 disabled:bg-slate-100 dark:disabled:bg-nord-0 disabled:text-slate-500 dark:disabled:text-nord-3 disabled:cursor-not-allowed ${
                errors.day
                  ? 'border-rose-300 dark:border-nord-11/50 focus:ring-rose-500 bg-rose-50/20 dark:bg-nord-11/10'
                  : 'border-slate-300 dark:border-nord-2 focus:ring-blue-500 dark:focus:ring-nord-8'
              }`}
            />
            {isEditMode && (
              <span className="absolute right-3 top-2 text-xs font-medium text-slate-400 dark:text-nord-3">
                Non modifiable
              </span>
            )}
          </div>
          {errors.day && <p className="mt-1 text-xs text-rose-600 dark:text-nord-11">{errors.day}</p>}
          {!isEditMode && existingDays.includes(day) && (
            <p className="mt-1 text-xs text-amber-600 dark:text-nord-13 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Une activité est déjà enregistrée pour cette date.
            </p>
          )}
        </div>

        {/* Erreurs signalées & Incidents créés */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="activity-errors-reported"
              className="block text-xs font-semibold text-slate-700 dark:text-nord-4 mb-1"
            >
              Erreurs signalées (≥ 0) <span className="text-rose-500 dark:text-nord-11">*</span>
            </label>
            <input
              id="activity-errors-reported"
              type="number"
              min="0"
              step="1"
              value={errorsReported}
              onChange={(e) => {
                setErrorsReported(e.target.value);
                setErrors((prev) => ({ ...prev, errors_reported: '', incidents_created: '' }));
                setGeneralError(null);
              }}
              className={`w-full px-3 py-2 text-sm bg-white dark:bg-nord-1 text-slate-900 dark:text-nord-5 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.errors_reported
                  ? 'border-rose-300 dark:border-nord-11/50 focus:ring-rose-500 bg-rose-50/20 dark:bg-nord-11/10'
                  : 'border-slate-300 dark:border-nord-2 focus:ring-blue-500 dark:focus:ring-nord-8'
              }`}
            />
            {errors.errors_reported && (
              <p className="mt-1 text-xs text-rose-600 dark:text-nord-11">{errors.errors_reported}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="activity-incidents-created"
              className="block text-xs font-semibold text-slate-700 dark:text-nord-4 mb-1"
            >
              Incidents créés (≤ erreurs) <span className="text-rose-500 dark:text-nord-11">*</span>
            </label>
            <input
              id="activity-incidents-created"
              type="number"
              min="0"
              max={Number(errorsReported) || undefined}
              step="1"
              value={incidentsCreated}
              onChange={(e) => {
                setIncidentsCreated(e.target.value);
                setErrors((prev) => ({ ...prev, incidents_created: '' }));
                setGeneralError(null);
              }}
              className={`w-full px-3 py-2 text-sm bg-white dark:bg-nord-1 text-slate-900 dark:text-nord-5 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.incidents_created
                  ? 'border-rose-300 dark:border-nord-11/50 focus:ring-rose-500 bg-rose-50/20 dark:bg-nord-11/10'
                  : 'border-slate-300 dark:border-nord-2 focus:ring-blue-500 dark:focus:ring-nord-8'
              }`}
            />
            {errors.incidents_created && (
              <p className="mt-1 text-xs text-rose-600 dark:text-nord-11">{errors.incidents_created}</p>
            )}
          </div>
        </div>

        {/* Note d'invariant métier */}
        <div className="text-[11px] text-slate-500 dark:text-nord-4 bg-slate-50 dark:bg-nord-0 p-2.5 rounded-lg border border-slate-200/80 dark:border-nord-2">
          <span className="font-semibold text-slate-700 dark:text-nord-5">Règle d'intégrité :</span> Le nombre
          d'incidents créés ne peut jamais excéder le nombre d'erreurs signalées ({incidentsCreated} ≤ {errorsReported}).
        </div>

        {/* Section FEAI (Fiches d'Evénement / Incidents) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-700 dark:text-nord-4">
                Références FEAI ({feaiList.length})
              </span>
              <p className="text-[11px] text-slate-500 dark:text-nord-4">
                Format obligatoire : <code className="text-blue-700 dark:text-nord-8">INC + 9 chiffres</code>, précédé d'un préfixe facultatif de 2 à 5 lettres (ex: FE-INC000000001), sans doublon.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddFeai}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-nord-8 hover:text-blue-700 dark:hover:text-nord-7 bg-blue-50 dark:bg-nord-10/20 hover:bg-blue-100 dark:hover:bg-nord-10/30 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter une réf.
            </button>
          </div>

          {errors.feai && <p className="text-xs text-rose-600 dark:text-nord-11">{errors.feai}</p>}

          {feaiList.length === 0 ? (
            <div className="p-4 text-center border border-dashed border-slate-200 dark:border-nord-2 rounded-xl bg-slate-50/50 dark:bg-nord-0/40 text-xs text-slate-500 dark:text-nord-4">
              Aucune référence FEAI rattachée à cette journée. Cliquez sur « Ajouter une réf. » si des incidents ont été déclarés.
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {feaiList.map((code, idx) => {
                const itemError = feaiItemErrors[idx];
                const valid = isValidFeai(code);

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={code}
                          onChange={(e) => handleFeaiChange(idx, e.target.value)}
                          placeholder="FE-INC000000001"
                          maxLength={FEAI_MAX_LENGTH}
                          aria-label={`Référence FEAI ${idx + 1}`}
                          className={`w-full px-3 py-1.5 text-xs font-mono tracking-wider bg-white dark:bg-nord-1 text-slate-900 dark:text-nord-5 border rounded-lg focus:outline-none focus:ring-2 ${
                            itemError
                              ? 'border-rose-300 dark:border-nord-11/50 focus:ring-rose-500 bg-rose-50/20 dark:bg-nord-11/10'
                              : valid
                              ? 'border-emerald-400 dark:border-nord-14/50 focus:ring-emerald-500'
                              : 'border-slate-300 dark:border-nord-2 focus:ring-blue-500 dark:focus:ring-nord-8'
                          }`}
                        />
                        {valid && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-nord-14 absolute right-2.5 top-2" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeai(idx)}
                        className="p-1.5 touch-manipulation select-none text-slate-400 dark:text-nord-3 hover:text-rose-600 dark:hover:text-nord-11 hover:bg-rose-50 dark:hover:bg-nord-11/15 rounded-lg transition-colors"
                        title="Supprimer cette référence"
                        aria-label={`Supprimer la référence ${code.trim() || `n° ${idx + 1}`}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {itemError && (
                      <p className="text-[11px] text-rose-600 dark:text-nord-11 pl-1">{itemError}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-nord-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-nord-5 bg-slate-100 dark:bg-nord-2 hover:bg-slate-200 dark:hover:bg-nord-3 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-nord-10 dark:hover:bg-nord-9 active:bg-blue-800 disabled:opacity-50 rounded-lg shadow-xs transition-colors"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{isEditMode ? 'Enregistrer les modifications' : 'Créer l\'activité'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
