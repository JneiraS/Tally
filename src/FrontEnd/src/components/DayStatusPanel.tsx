/**
 * Statut de la journée affichée, dans la carte « Saisie du {date} ».
 *
 * Le statut est écrit ici et **pas** dans l'éditeur de compteurs : celui-ci fait
 * un autosave à 800 ms, et lui faire porter un clic sur « Signaler un KO »
 * mettrait deux mécanismes d'écriture en concurrence sur la même ligne. Le
 * composant est donc rendu dans la carte de saisie, sous son en-tête — le même
 * jour que celui qu'elle édite, donc la même portée.
 *
 * Le motif du KO est un **brouillon**, pour la même raison que la note du
 * périmètre : un autosave enverrait une requête par frappe, donc un événement
 * d'audit par caractère tapé. Rien n'est écrit avant « Enregistrer ».
 */
import { useEffect, useState } from 'react';
import { Loader2, OctagonX, RotateCcw, ShieldCheck } from 'lucide-react';
import {
  DAY_STATUS_DESCRIPTIONS,
  DAY_STATUS_ICONS,
  DAY_STATUS_LABELS,
  KO_REASON_MAX_LENGTH,
  type DayStatus,
} from '../constants/dayStatus';
import { Badge } from './Badge';
import { useToastActions } from '../hooks/useToast';
import { protabApi } from '../services/api';

interface DayStatusPanelProps {
  scopeId: string;
  /** Jour affiché, au format ISO. */
  day: string;
  /** Statut déjà enregistré pour ce jour. */
  status: DayStatus;
  /** Motif déjà enregistré, ou `null`. */
  koReason: string | null;
  /** Rappelle le statut enregistré, pour que le parent ne recharge rien. */
  onChanged: (day: string, status: DayStatus, koReason: string | null) => void;
}

const STATUS_CHIP_CLASS: Record<DayStatus, string> = {
  pending:
    'bg-amber-100/60 dark:bg-nord-13/20 text-amber-700 dark:text-nord-13 border-amber-200/60 dark:border-nord-13/30',
  completed:
    'bg-emerald-100/60 dark:bg-nord-14/20 text-emerald-700 dark:text-nord-14 border-emerald-200/60 dark:border-nord-14/30',
  ko: 'bg-rose-100/60 dark:bg-nord-11/20 text-rose-700 dark:text-nord-11 border-rose-200/60 dark:border-nord-11/30',
};

export function DayStatusPanel({
  scopeId,
  day,
  status,
  koReason,
  onChanged,
}: DayStatusPanelProps) {
  const { success, error } = useToastActions();
  const [isSaving, setIsSaving] = useState(false);
  // Le brouillon du motif ne s'ouvre que sur une demande explicite : garder un
  // champ en permanence visible ferait ressembler le KO à une saisie de plus.
  const [isReasonOpen, setIsReasonOpen] = useState(false);
  const [draftReason, setDraftReason] = useState(koReason ?? '');

  // Le panneau est remonté à chaque changement de jour (le parent le key), donc
  // le brouillon repart de la valeur enregistrée sans synchronisation manuelle.
  useEffect(() => {
    setDraftReason(koReason ?? '');
    setIsReasonOpen(false);
  }, [day, koReason]);

  const StatusIcon = DAY_STATUS_ICONS[status];
  const cleaned = draftReason.trim();
  const isReasonDirty = cleaned !== (koReason ?? '');

  const write = async (
    next: DayStatus,
    reason: string | null,
    message: string,
  ) => {
    setIsSaving(true);
    try {
      await protabApi.setActivitiesStatus(scopeId, {
        days: [day],
        status: next,
        ko_reason: reason,
      });
      onChanged(day, next, reason);
      setDraftReason(reason ?? '');
      setIsReasonOpen(false);
      success(message, `${DAY_STATUS_LABELS[next]} — ${day}`);
    } catch (err: unknown) {
      error('Échec du changement de statut', (err as Error)?.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section
      aria-label={`Statut de la journée ${day}`}
      className="rounded-xl border border-slate-200 dark:border-nord-2 bg-slate-50/70 dark:bg-nord-0/40 p-3 sm:p-3.5 space-y-3"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-lg border ${STATUS_CHIP_CLASS[status]}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{DAY_STATUS_LABELS[status]}</span>
          </span>
          <span className="text-xs text-slate-500 dark:text-nord-4 truncate">
            {DAY_STATUS_DESCRIPTIONS[status]}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {status !== 'completed' && (
            <button
              type="button"
              onClick={() => write('completed', null, 'Journée marquée terminée')}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 dark:bg-nord-14 text-white hover:bg-emerald-700 dark:hover:bg-nord-15 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5" />
              )}
              <span>Marquer terminée</span>
            </button>
          )}

          {status === 'ko' ? (
            <>
              <button
                type="button"
                onClick={() => setIsReasonOpen((open) => !open)}
                aria-expanded={isReasonOpen}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-600 dark:text-nord-4 hover:text-slate-900 dark:hover:text-nord-6 border border-slate-200 dark:border-nord-2 transition-colors"
              >
                {isReasonOpen ? 'Masquer le motif' : 'Modifier le motif'}
              </button>
              <button
                type="button"
                onClick={() => write('pending', null, 'Signalement KO levé')}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg text-rose-700 dark:text-nord-11 bg-rose-50 dark:bg-nord-11/15 hover:bg-rose-100 dark:hover:bg-nord-11/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Lever le KO</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsReasonOpen((open) => !open)}
              aria-expanded={isReasonOpen}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg text-rose-700 dark:text-nord-11 bg-rose-50 dark:bg-nord-11/15 hover:bg-rose-100 dark:hover:bg-nord-11/25 transition-colors"
            >
              <OctagonX className="w-3.5 h-3.5" />
              <span>Signaler un KO</span>
            </button>
          )}
        </div>
      </div>

      {status === 'ko' && koReason && !isReasonOpen && (
        <p className="text-xs text-slate-600 dark:text-nord-4">
          <span className="font-semibold">Motif :</span> {koReason}
        </p>
      )}

      {isReasonOpen && (
        <div className="space-y-2">
          <label htmlFor={`ko-reason-${day}`} className="sr-only">
            Motif du KO pour la journée {day}
          </label>
          <textarea
            id={`ko-reason-${day}`}
            aria-label="Motif du KO"
            value={draftReason}
            onChange={(e) => setDraftReason(e.target.value)}
            disabled={isSaving}
            rows={2}
            placeholder="Panne du collecteur, incident en cours, maintenance… (facultatif)"
            className="w-full px-3 py-2 text-sm text-slate-900 dark:text-nord-5 bg-white dark:bg-nord-0 border border-slate-200 dark:border-nord-2 rounded-lg resize-y focus:outline-none focus:ring-1 focus:border-rose-400 dark:focus:border-nord-11 disabled:opacity-60"
          />
          <div className="flex items-center justify-between gap-2">
            <p
              className={`text-xs ${cleaned.length > KO_REASON_MAX_LENGTH ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-nord-4'}`}
            >
              {cleaned.length} / {KO_REASON_MAX_LENGTH}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setDraftReason(koReason ?? '');
                  setIsReasonOpen(false);
                }}
                disabled={isSaving}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-nord-4 hover:text-slate-900 dark:hover:text-nord-6 disabled:opacity-40 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() =>
                  write(
                    'ko',
                    cleaned === '' ? null : cleaned,
                    'Journée signalée KO',
                  )
                }
                disabled={isSaving || cleaned.length > KO_REASON_MAX_LENGTH}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 dark:bg-nord-11 text-white hover:bg-rose-700 dark:hover:bg-nord-12 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {status === 'ko' && !isReasonOpen && (
        <Badge type="ko" label="Journée écartée du traitement en attente" />
      )}
    </section>
  );
}