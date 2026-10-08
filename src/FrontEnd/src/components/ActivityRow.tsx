/**
 * Une ligne d'activité quotidienne, partagée par le tableau mono-jour et par
 * l'historique.
 *
 * Deux occurrences sans extraction auraient divergé — c'est exactement ce qui
 * arrive quand une ligne dupliquée garde un bouton dans l'une et pas dans
 * l'autre. Les props distinguent l'usage : `onSelectDay` n'est fourni que par
 * l'historique, où la sélection multiple existe.
 */
import { Edit2, OctagonX, ShieldCheck, Tag } from 'lucide-react';
import { isCompleted, isKo } from '../constants/dayStatus';
import { CHECKBOX_CLASS } from '../constants/ui';
import { Badge } from './Badge';
import { formatDateFr } from '../utils/date';
import type { DailyActivity } from '../types';

interface ActivityRowProps {
  activity: DailyActivity;
  isToday?: boolean;
  /** Case de sélection multiple — historique uniquement. */
  onSelectDay?: (day: string) => void;
  isSelected?: boolean;
  onEdit?: (day: string) => void;
  onComplete?: (day: string) => void;
  /**
   * Signalement d'un blocage sur cette journée.
   *
   * Distinct de `onEdit` : le statut est un écrit du panneau, les compteurs en
   * sont un autre. Une ligne dont `onEdit` est absent reste saisissable par le
   * panneau du dessus, mais garde ces deux actions — le panneau ne couvre qu'un
   * jour, l'historique en a beaucoup.
   */
  onKo?: (day: string) => void;
  /** Masque la colonne « Actions » quand rien n'est possible sur la ligne. */
  showActions?: boolean;
}

export function ActivityRow({
  activity,
  isToday = false,
  onSelectDay,
  isSelected = false,
  onEdit,
  onComplete,
  onKo,
  showActions = true,
}: ActivityRowProps) {
  const completed = isCompleted(activity.status);

  return (
    <tr
      className={`hover:bg-slate-50/70 dark:hover:bg-nord-2/50 transition-colors ${
        isSelected
          ? 'bg-blue-50/40 dark:bg-nord-9/20'
          : isToday
            ? 'bg-amber-50/20 dark:bg-nord-13/10'
            : ''
      }`}
    >
      {/* Sélection multiple : absente du tableau mono-jour, qui n'a qu'une ligne. */}
      {onSelectDay && (
        <td className="px-4 py-3.5 text-center">
          {!completed ? (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelectDay(activity.day)}
              aria-label={`Sélectionner le jour ${activity.day}`}
              className={CHECKBOX_CLASS}
            />
          ) : (
            <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-nord-14 mx-auto" />
          )}
        </td>
      )}

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
              Aujourd&apos;hui
            </span>
          )}
        </div>
      </td>

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

      <td className="px-4 py-3.5 text-center">
        <div className="inline-flex flex-col items-center gap-1.5">
          {completed ? (
            <Badge type="completed" label="Terminé" />
          ) : isKo(activity.status) ? (
            <Badge type="ko" label="KO" />
          ) : (
            <Badge type="in_progress" label="En cours" />
          )}
          {activity.ko_reason && (
            <span className="max-w-48 text-xs text-slate-500 dark:text-nord-4">
              {activity.ko_reason}
            </span>
          )}
        </div>
      </td>

      {showActions && (
        <td className="px-4 py-3.5 text-right">
          <div className="flex items-center justify-end gap-1.5">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(activity.day)}
                className="p-1.5 text-slate-500 dark:text-nord-4 hover:text-blue-600 dark:hover:text-nord-8 hover:bg-blue-50 dark:hover:bg-nord-2 rounded-lg transition-colors"
                title={`Modifier l'activité du ${activity.day} (PATCH)`}
                aria-label={`Modifier l'activité du ${activity.day}`}
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {!completed && onComplete && (
              <button
                type="button"
                onClick={() => onComplete(activity.day)}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-700 dark:text-nord-14 bg-emerald-50 dark:bg-nord-14/15 hover:bg-emerald-100 dark:hover:bg-nord-14/25 border border-emerald-200 dark:border-nord-14/30 rounded-lg transition-colors"
                title="Marquer cette journée comme terminée"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Terminer</span>
              </button>
            )}
            {/* Un jour déjà KO n'a rien à signaler ; la ligne affiche son motif. */}
            {!completed && !isKo(activity.status) && onKo && (
              <button
                type="button"
                onClick={() => onKo(activity.day)}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-rose-700 dark:text-nord-11 bg-rose-50 dark:bg-nord-11/15 hover:bg-rose-100 dark:hover:bg-nord-11/25 border border-rose-200 dark:border-nord-11/30 rounded-lg transition-colors"
                title="Signaler un problème technique sur cette journée"
              >
                <OctagonX className="w-3.5 h-3.5" />
                <span className="hidden md:inline">KO</span>
              </button>
            )}
          </div>
        </td>
      )}
    </tr>
  );
}