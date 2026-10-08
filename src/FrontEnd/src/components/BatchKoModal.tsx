/**
 * Signalement d'une panne sur plusieurs journées d'un périmètre.
 *
 * Le motif est **un seul pour tout le lot** : une panne de collecteur a une
 * seule cause, et la répéter sur chaque ligne n'apporterait rien. Il reste
 * facultatif — un KO sans motif est recevable — donc la modale ne doit pas
 * bloquer sur un champ vide. Comme la note du périmètre et le motif du
 * panneau de statut, c'est un brouillon : rien n'est écrit avant confirmation.
 */
import { useEffect, useState } from 'react';
import { AlertCircle, Loader2, OctagonX } from 'lucide-react';
import { KO_REASON_MAX_LENGTH } from '../constants/dayStatus';
import { ApiError, protabApi } from '../services/api';
import { formatDateFr } from '../utils/date';
import { useToastActions } from '../hooks/useToast';
import { Modal } from './Modal';

interface BatchKoModalProps {
  isOpen: boolean;
  onClose: () => void;
  scopeId: string;
  scopeName: string;
  /** Journées retenues, au format ISO. */
  days: string[];
  /** Rappelle le statut et le motif enregistrés, sans rien recharger. */
  onConfirmed: (days: string[], koReason: string | null) => void;
}

export function BatchKoModal({
  isOpen,
  onClose,
  scopeId,
  scopeName,
  days,
  onConfirmed,
}: BatchKoModalProps) {
  const { success, error: toastError } = useToastActions();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Le brouillon repart à vide à chaque ouverture : après un signalement annulé,
  // on ne veut pas la confusion d'un motif resté dans le champ.
  useEffect(() => {
    if (isOpen) {
      setReason('');
      setErrorMessage(null);
    }
  }, [isOpen]);

  const cleaned = reason.trim();
  const isTooLong = cleaned.length > KO_REASON_MAX_LENGTH;
  const sorted = [...days].sort();
  const from = sorted[0];
  const to = sorted[sorted.length - 1];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (days.length === 0) return;

    const koReason = cleaned === '' ? null : cleaned;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await protabApi.setActivitiesStatus(scopeId, {
        days,
        status: 'ko',
        ko_reason: koReason,
      });
      success(
        'Journées signalées KO',
        `${days.length} journée(s) écartée(s) du traitement en attente${
          koReason ? ` — ${koReason}` : ''
        }.`,
      );
      onConfirmed(days, koReason);
      onClose();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(
          (err as Error)?.message ||
            'Une erreur est survenue lors du signalement.',
        );
      }
      toastError('Échec du signalement', (err as Error)?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Signaler des journées KO"
      subtitle={`Périmètre : ${scopeName}`}
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

        <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 dark:bg-nord-11/15 border border-rose-200 dark:border-nord-11/30 text-rose-800 dark:text-nord-11 rounded-xl text-xs">
          <OctagonX className="w-5 h-5 shrink-0 mt-0.5" />
          <p>
            Ces journées seront écartées du traitement en attente : elles ont été
            regardées et n'ont pas pu l'être pour un problème technique. Elles
            sortiront aussi des taux de couverture de la page d'analyse.
          </p>
        </div>

        <p className="text-xs text-slate-600 dark:text-nord-4">
          <span className="font-semibold text-slate-800 dark:text-nord-5">
            {days.length} journée{days.length > 1 ? 's' : ''}
          </span>{' '}
          {from === to ? (
            <>le {formatDateFr(from)}</>
          ) : (
            <>
              du {formatDateFr(from)} au {formatDateFr(to)}
            </>
          )}
        </p>

        <div className="space-y-1.5">
          <label htmlFor="batch-ko-reason" className="sr-only">
            Motif du KO (facultatif)
          </label>
          <textarea
            id="batch-ko-reason"
            aria-label="Motif du KO (facultatif)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isSubmitting}
            rows={3}
            placeholder="Panne du collecteur, incident réseau, maintenance… (facultatif)"
            className="w-full px-3 py-2 text-sm text-slate-900 dark:text-nord-5 bg-white dark:bg-nord-0 border border-slate-200 dark:border-nord-2 rounded-lg resize-y focus:outline-none focus:ring-1 focus:border-rose-400 dark:focus:border-nord-11 disabled:opacity-60"
          />
          <p className="text-xs text-slate-500 dark:text-nord-4 text-right">
            {cleaned.length} / {KO_REASON_MAX_LENGTH}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-nord-4 hover:text-slate-900 dark:hover:text-nord-6 disabled:opacity-40 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isTooLong || days.length === 0}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg bg-rose-600 dark:bg-nord-11 text-white hover:bg-rose-700 dark:hover:bg-nord-12 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Signaler {days.length > 1 ? `${days.length} journées` : 'la journée'}
          </button>
        </div>
      </form>
    </Modal>
  );
}