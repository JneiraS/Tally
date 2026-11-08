/**
 * Périodicité du périmètre, éditée depuis la page de détail.
 *
 * Elle décide des jours où le périmètre est **attendu** — donc du backlog et du
 * dénominateur de la couverture — et ne retire jamais le droit de saisir un
 * autre jour. Comme la note (ScopeNoteCard), l'édition est un **brouillon** :
 * un autosave enverrait un PATCH par clic sur une case, donc un événement
 * d'audit par case cochée.
 *
 * La carte n'est pas réservée aux administrateurs, à la différence des
 * responsables : régler une cadence ne donne aucun droit d'accès.
 */
import { useEffect, useState } from 'react';
import { AlertTriangle, CalendarClock, Loader2 } from 'lucide-react';
import {
  DEFAULT_NON_WORKING_DAYS,
  WEEKDAY_LABELS,
  type IsoWeekday,
} from '../constants/nonWorkingDays';
import { CHECKBOX_CLASS } from '../constants/ui';
import { useToastActions } from '../hooks/useToast';
import { protabApi } from '../services/api';
import type { MonitoringSchedule, NonWorkingDays } from '../types';
import {
  MAX_INTERVAL_WEEKS,
  MIN_INTERVAL_WEEKS,
  isScheduleEverDue,
} from '../utils/kpi';

interface ScopeScheduleCardProps {
  scopeId: string;
  /** Périodicité enregistrée, telle que l'API la renvoie. */
  schedule: MonitoringSchedule;
  /** Calendrier du projet : une périodicité ne peut que le restreindre. */
  nonWorkingDays?: NonWorkingDays;
  /** Rappelle la périodicité enregistrée, sans que le parent ne recharge. */
  onSaved: (schedule: MonitoringSchedule) => void;
}

const INTERVAL_OPTIONS = Array.from(
  { length: MAX_INTERVAL_WEEKS - MIN_INTERVAL_WEEKS + 1 },
  (_, index) => MIN_INTERVAL_WEEKS + index,
);

function intervalLabel(weeks: number): string {
  return weeks === 1 ? 'Chaque semaine' : `Toutes les ${weeks} semaines`;
}

export function ScopeScheduleCard({
  scopeId,
  schedule,
  nonWorkingDays = DEFAULT_NON_WORKING_DAYS,
  onSaved,
}: ScopeScheduleCardProps) {
  const [weekdays, setWeekdays] = useState<IsoWeekday[]>(schedule.weekdays);
  const [intervalWeeks, setIntervalWeeks] = useState(schedule.interval_weeks);
  const [anchorDate, setAnchorDate] = useState(schedule.anchor_date ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const { success, error } = useToastActions();

  // Le brouillon ne se resynchronise que sur un changement de périmètre : un
  // rechargement après enregistrement renverrait la valeur qu'on vient d'écrire,
  // donc rien à rattraper.
  useEffect(() => {
    setWeekdays(schedule.weekdays);
    setIntervalWeeks(schedule.interval_weeks);
    setAnchorDate(schedule.anchor_date ?? '');
  }, [scopeId]);

  const sortedWeekdays = [...weekdays].sort((a, b) => a - b);
  const draft: MonitoringSchedule = {
    weekdays: sortedWeekdays,
    interval_weeks: intervalWeeks,
    anchor_date: anchorDate === '' ? null : anchorDate,
  };

  const isDirty =
    sortedWeekdays.join(',') !== [...schedule.weekdays].sort().join(',') ||
    intervalWeeks !== schedule.interval_weeks ||
    draft.anchor_date !== schedule.anchor_date;

  // Le serveur refusera en 422 : le dire avant l'aller-retour, et bloquer un
  // bouton dont on sait déjà qu'il ne peut pas aboutir.
  const neverDue = !isScheduleEverDue(draft, nonWorkingDays);

  // Un jour coché que le projet a déclaré non ouvré est inerte. Ce n'est pas une
  // erreur — le calendrier du projet fait foi — mais le taire laisserait croire
  // que la case produit un effet.
  const excludedWeekdays = sortedWeekdays.filter((day) =>
    nonWorkingDays.excluded_weekdays.includes(day),
  );

  const toggleWeekday = (weekday: IsoWeekday) => {
    setWeekdays((current) =>
      current.includes(weekday)
        ? current.filter((day) => day !== weekday)
        : [...current, weekday],
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await protabApi.updateScopeSchedule(scopeId, draft);
      onSaved(draft);
      success('Périodicité enregistrée', 'Le périmètre a bien été mis à jour.');
    } catch (err: unknown) {
      // Un 422 ou une session perdue : le brouillon reste intact.
      error("Échec de l'enregistrement", (err as Error)?.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-nord-1 rounded-2xl border border-slate-200 dark:border-nord-2 p-5 sm:p-6 shadow-2xs space-y-4">
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-nord-6 flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-blue-600 dark:text-nord-8" />
          Périodicité
        </h2>
        <p className="text-xs text-slate-500 dark:text-nord-4">
          Les jours où ce périmètre est attendu — à enregistrer explicitement
        </p>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-nord-4">
          Jours attendus
        </legend>
        <div className="flex flex-wrap gap-2">
          {WEEKDAY_LABELS.map(([value, label]) => (
            <label
              key={value}
              className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 px-2.5 text-sm text-slate-700 dark:border-nord-2 dark:text-nord-5"
            >
              <input
                type="checkbox"
                className={CHECKBOX_CLASS}
                checked={weekdays.includes(value)}
                onChange={() => toggleWeekday(value)}
                disabled={isSaving}
              />
              {label}
            </label>
          ))}
        </div>
        <p className="text-xs text-slate-500 dark:text-nord-4">
          Aucun jour coché = tous les jours ouvrés du projet. Un jour non ouvré
          n'est jamais attendu, même coché.
        </p>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="scope-schedule-interval"
            className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-nord-4"
          >
            Fréquence
          </label>
          <select
            id="scope-schedule-interval"
            value={intervalWeeks}
            onChange={(event) => setIntervalWeeks(Number(event.target.value))}
            disabled={isSaving}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-nord-2 dark:bg-nord-0 dark:text-nord-5 focus:outline-none focus:ring-1 focus:border-blue-500 dark:focus:border-nord-8 disabled:opacity-60"
          >
            {INTERVAL_OPTIONS.map((weeks) => (
              <option key={weeks} value={weeks}>
                {intervalLabel(weeks)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="scope-schedule-anchor"
            className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-nord-4"
          >
            Semaine de référence
          </label>
          <input
            id="scope-schedule-anchor"
            type="date"
            value={anchorDate}
            onChange={(event) => setAnchorDate(event.target.value)}
            disabled={isSaving || intervalWeeks === 1}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-nord-2 dark:bg-nord-0 dark:text-nord-5 focus:outline-none focus:ring-1 focus:border-blue-500 dark:focus:border-nord-8 disabled:opacity-60"
          />
          <p className="text-xs text-slate-500 dark:text-nord-4">
            Facultative. Elle fixe la phase du cycle, pas un début : le rythme
            s'applique aussi avant elle.
          </p>
        </div>
      </div>

      {excludedWeekdays.length > 0 && (
        <p className="text-xs text-slate-500 dark:text-nord-4">
          {excludedWeekdays
            .map(
              (day) =>
                WEEKDAY_LABELS.find(([value]) => value === day)?.[1] ?? day,
            )
            .join(', ')}{' '}
          {excludedWeekdays.length > 1 ? 'ne sont pas ouvrés' : "n'est pas ouvré"}{' '}
          dans ce projet : la sélection ne les rendra pas attendus.
        </p>
      )}

      {neverDue && (
        <p
          role="alert"
          className="flex items-start gap-2 text-xs text-amber-700 dark:text-nord-13"
        >
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Cette périodicité ne tombe jamais un jour ouvré : le périmètre ne
          serait jamais attendu. Choisissez au moins un jour ouvré.
        </p>
      )}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setWeekdays(schedule.weekdays);
            setIntervalWeeks(schedule.interval_weeks);
            setAnchorDate(schedule.anchor_date ?? '');
          }}
          disabled={!isDirty || isSaving}
          className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-nord-4 hover:text-slate-900 dark:hover:text-nord-6 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || neverDue || isSaving}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 dark:bg-nord-8 text-white hover:bg-blue-700 dark:hover:bg-nord-9 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Enregistrer
        </button>
      </div>
    </div>
  );
}
