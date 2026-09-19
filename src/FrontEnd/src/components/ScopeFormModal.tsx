import { useState } from 'react';
import { Plus, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';
import { Modal } from './Modal';
import { CreateScopeInput } from '../types';
import { validateScopeForm, ScopeValidationErrors } from '../utils/validation';
import { protabApi, ApiError } from '../services/api';
import { useToast } from '../hooks/useToast';

interface ScopeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (createdIds: string[]) => void;
}

interface ScopeItemState extends CreateScopeInput {
  errors?: ScopeValidationErrors;
}

export function ScopeFormModal({ isOpen, onClose, onSuccess }: ScopeFormModalProps) {
  const { success, error: toastError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const [scopes, setScopes] = useState<ScopeItemState[]>([
    {
      name: '',
      knowledge_base_id: '',
      official_main: '',
      official_backup: '',
      errors: {},
    },
  ]);

  const handleReset = () => {
    setScopes([
      {
        name: '',
        knowledge_base_id: '',
        official_main: '',
        official_backup: '',
        errors: {},
      },
    ]);
    setGeneralError(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleAddRow = () => {
    setScopes((prev) => [
      ...prev,
      {
        name: '',
        knowledge_base_id: '',
        official_main: '',
        official_backup: '',
        errors: {},
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (scopes.length <= 1) return;
    setScopes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = (
    index: number,
    field: keyof CreateScopeInput,
    value: string
  ) => {
    setScopes((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: value,
        errors: {
          ...next[index].errors,
          [field]: '',
        },
      };
      return next;
    });
    setGeneralError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    // Validation front de chaque ligne
    let hasValidationError = false;
    const validatedScopes = scopes.map((item) => {
      const { isValid, errors } = validateScopeForm({
        name: item.name,
        knowledge_base_id: item.knowledge_base_id,
        official_main: item.official_main,
        official_backup: item.official_backup,
      });

      if (!isValid) {
        hasValidationError = true;
      }
      return {
        ...item,
        errors,
      };
    });

    setScopes(validatedScopes);

    if (hasValidationError) {
      setGeneralError('Veuillez corriger les erreurs indiquées dans le formulaire avant de valider.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateScopeInput[] = scopes.map((s) => ({
        name: s.name.trim(),
        knowledge_base_id: s.knowledge_base_id.trim(),
        official_main: s.official_main.trim(),
        official_backup: s.official_backup.trim(),
      }));

      const res = await protabApi.createScopeMonitorings(payload);
      success(
        'Périmètre(s) créé(s) avec succès !',
        `${res.ids.length} périmètre(s) de supervision enregistré(s).`
      );
      handleReset();
      onSuccess(res.ids);
      onClose();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setGeneralError(
            `Conflit (409) : Un périmètre avec ce nom existe déjà. Le nom de chaque périmètre doit être unique.`
          );
        } else if (err.status === 400) {
          setGeneralError(`Erreur de validation domaine (400) : ${err.message}`);
        } else {
          setGeneralError(err.message);
        }
      } else {
        setGeneralError('Une erreur imprévue est survenue lors de la création.');
      }
      toastError('Échec de la création', (err as Error)?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nouveau périmètre de supervision"
      subtitle="Ajout d'un ou plusieurs périmètres de supervision (POST /scope-monitorings)"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {generalError && (
          <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 dark:bg-nord-11/15 border border-rose-200 dark:border-nord-11/30 text-rose-800 dark:text-nord-11 rounded-xl text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-nord-11 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Attention :</span> {generalError}
            </div>
          </div>
        )}

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {scopes.map((scope, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-50 dark:bg-nord-0 border border-slate-200 dark:border-nord-2 rounded-xl space-y-3 relative"
            >
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-nord-2 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-nord-4">
                  Périmètre #{idx + 1}
                </span>
                {scopes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(idx)}
                    className="text-slate-400 dark:text-nord-3 hover:text-rose-600 dark:hover:text-nord-11 p-1 rounded-md transition-colors"
                    title="Supprimer cette ligne"
                    aria-label={`Supprimer le périmètre #${idx + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Nom */}
                <div>
                  <label
                    htmlFor={`scope-name-${idx}`}
                    className="block text-xs font-medium text-slate-700 dark:text-nord-4 mb-1"
                  >
                    Nom du périmètre <span className="text-rose-500 dark:text-nord-11">*</span>
                  </label>
                  <input
                    id={`scope-name-${idx}`}
                    type="text"
                    value={scope.name}
                    onChange={(e) => handleChange(idx, 'name', e.target.value)}
                    placeholder="Ex: Scope Paiements"
                    className={`w-full px-3 py-2 text-sm bg-white dark:bg-nord-1 text-slate-900 dark:text-nord-5 border rounded-lg focus:outline-none focus:ring-2 ${
                      scope.errors?.name
                        ? 'border-rose-300 dark:border-nord-11/50 focus:ring-rose-500 bg-rose-50/20 dark:bg-nord-11/10'
                        : 'border-slate-300 dark:border-nord-2 focus:ring-blue-500 dark:focus:ring-nord-8'
                    }`}
                  />
                  {scope.errors?.name && (
                    <p className="mt-1 text-xs text-rose-600 dark:text-nord-11">{scope.errors.name}</p>
                  )}
                </div>

                {/* Knowledge Base ID */}
                <div>
                  <label
                    htmlFor={`scope-kb-${idx}`}
                    className="block text-xs font-medium text-slate-700 dark:text-nord-4 mb-1"
                  >
                    ID Base de connaissances (≥ 10 car.) <span className="text-rose-500 dark:text-nord-11">*</span>
                  </label>
                  <input
                    id={`scope-kb-${idx}`}
                    type="text"
                    value={scope.knowledge_base_id}
                    onChange={(e) => handleChange(idx, 'knowledge_base_id', e.target.value)}
                    placeholder="Ex: KB-PAYMENTS-001"
                    className={`w-full px-3 py-2 text-sm bg-white dark:bg-nord-1 text-slate-900 dark:text-nord-5 border rounded-lg focus:outline-none focus:ring-2 ${
                      scope.errors?.knowledge_base_id
                        ? 'border-rose-300 dark:border-nord-11/50 focus:ring-rose-500 bg-rose-50/20 dark:bg-nord-11/10'
                        : 'border-slate-300 dark:border-nord-2 focus:ring-blue-500 dark:focus:ring-nord-8'
                    }`}
                  />
                  {scope.errors?.knowledge_base_id && (
                    <p className="mt-1 text-xs text-rose-600 dark:text-nord-11">{scope.errors.knowledge_base_id}</p>
                  )}
                </div>

                {/* Responsable Principal */}
                <div>
                  <label
                    htmlFor={`scope-main-${idx}`}
                    className="block text-xs font-medium text-slate-700 dark:text-nord-4 mb-1"
                  >
                    Responsable principal <span className="text-rose-500 dark:text-nord-11">*</span>
                  </label>
                  <input
                    id={`scope-main-${idx}`}
                    type="text"
                    value={scope.official_main}
                    onChange={(e) => handleChange(idx, 'official_main', e.target.value)}
                    placeholder="Ex: Marie Curie"
                    className={`w-full px-3 py-2 text-sm bg-white dark:bg-nord-1 text-slate-900 dark:text-nord-5 border rounded-lg focus:outline-none focus:ring-2 ${
                      scope.errors?.official_main
                        ? 'border-rose-300 dark:border-nord-11/50 focus:ring-rose-500 bg-rose-50/20 dark:bg-nord-11/10'
                        : 'border-slate-300 dark:border-nord-2 focus:ring-blue-500 dark:focus:ring-nord-8'
                    }`}
                  />
                  {scope.errors?.official_main && (
                    <p className="mt-1 text-xs text-rose-600 dark:text-nord-11">{scope.errors.official_main}</p>
                  )}
                </div>

                {/* Responsable Suppléant */}
                <div>
                  <label
                    htmlFor={`scope-backup-${idx}`}
                    className="block text-xs font-medium text-slate-700 dark:text-nord-4 mb-1"
                  >
                    Responsable suppléant (backup) <span className="text-rose-500 dark:text-nord-11">*</span>
                  </label>
                  <input
                    id={`scope-backup-${idx}`}
                    type="text"
                    value={scope.official_backup}
                    onChange={(e) => handleChange(idx, 'official_backup', e.target.value)}
                    placeholder="Ex: Paul Valéry"
                    className={`w-full px-3 py-2 text-sm bg-white dark:bg-nord-1 text-slate-900 dark:text-nord-5 border rounded-lg focus:outline-none focus:ring-2 ${
                      scope.errors?.official_backup
                        ? 'border-rose-300 dark:border-nord-11/50 focus:ring-rose-500 bg-rose-50/20 dark:bg-nord-11/10'
                        : 'border-slate-300 dark:border-nord-2 focus:ring-blue-500 dark:focus:ring-nord-8'
                    }`}
                  />
                  {scope.errors?.official_backup && (
                    <p className="mt-1 text-xs text-rose-600 dark:text-nord-11">{scope.errors.official_backup}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bouton pour ajouter une autre ligne */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={handleAddRow}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-nord-8 hover:text-blue-700 dark:hover:text-nord-7 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter un autre périmètre dans le même envoi
          </button>
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-nord-2">
          <button
            type="button"
            onClick={handleClose}
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
                <span>Création en cours...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Créer le{scopes.length > 1 ? 's périmètres' : ' périmètre'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
