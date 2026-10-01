import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { NonWorkingDays } from "../types";
import { IsoWeekday, WEEKDAY_LABELS } from "../constants/nonWorkingDays";
import { protabApi } from "../services/api";
import { useToast } from "../hooks/useToast";

interface WorkingDaysModalProps {
  isOpen: boolean;
  settings: NonWorkingDays;
  onClose: () => void;
  onSaved: (settings: NonWorkingDays) => void;
}

export function WorkingDaysModal({
  isOpen,
  settings,
  onClose,
  onSaved,
}: WorkingDaysModalProps) {
  const { success, error } = useToast();
  const [excludedWeekdays, setExcludedWeekdays] = useState<IsoWeekday[]>([]);
  const [excludedDates, setExcludedDates] = useState<string[]>([]);
  const [dateToAdd, setDateToAdd] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setExcludedWeekdays(settings.excluded_weekdays);
    setExcludedDates(settings.excluded_dates);
    setDateToAdd("");
  }, [isOpen, settings]);

  const toggleWeekday = (weekday: IsoWeekday) => {
    setExcludedWeekdays((current) =>
      current.includes(weekday)
        ? current.filter((day) => day !== weekday)
        : [...current, weekday].sort((a, b) => a - b),
    );
  };

  const addDate = () => {
    if (!dateToAdd || excludedDates.includes(dateToAdd)) return;
    setExcludedDates((current) => [...current, dateToAdd].sort());
    setDateToAdd("");
  };

  const save = async () => {
    setIsSaving(true);
    try {
      const saved = await protabApi.updateProjectSettings({
        excluded_weekdays: excludedWeekdays,
        excluded_dates: excludedDates,
      });
      onSaved(saved.non_working_days);
      success("Réglages enregistrés", "Les jours non travaillés sont à jour.");
      onClose();
    } catch (err) {
      error("Échec de l'enregistrement", (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Jours non travaillés"
      subtitle="Ils sont exclus des KPI de couverture et de baseline."
      maxWidth="md"
    >
      <div className="space-y-6">
        <fieldset>
          <legend className="text-sm font-semibold text-slate-800 dark:text-nord-5">
            Jours récurrents
          </legend>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mt-3">
            {WEEKDAY_LABELS.map(([value, label]) => {
              const selected = excludedWeekdays.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleWeekday(value)}
                  className={`rounded-lg border px-2 py-2 text-xs font-semibold transition-colors ${
                    selected
                      ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-nord-8 dark:bg-nord-10/25 dark:text-nord-8"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-nord-2 dark:text-nord-4 dark:hover:bg-nord-2"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label
            htmlFor="non-working-date"
            className="text-sm font-semibold text-slate-800 dark:text-nord-5"
          >
            Dates ponctuelles
          </label>
          <div className="flex gap-2 mt-3">
            <input
              id="non-working-date"
              type="date"
              value={dateToAdd}
              onChange={(event) => setDateToAdd(event.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-nord-2 dark:bg-nord-0"
            />
            <button
              type="button"
              onClick={addDate}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:border-nord-2 dark:hover:bg-nord-2"
            >
              Ajouter
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {excludedDates.length === 0 ? (
              <span className="text-xs text-slate-400 dark:text-nord-3">
                Aucune date ponctuelle.
              </span>
            ) : (
              excludedDates.map((date) => (
                <button
                  key={date}
                  type="button"
                  onClick={() =>
                    setExcludedDates((current) => current.filter((item) => item !== date))
                  }
                  className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700 hover:bg-rose-50 hover:text-rose-700 dark:bg-nord-2 dark:text-nord-5 dark:hover:bg-nord-11/20 dark:hover:text-nord-11"
                  title="Retirer cette date"
                >
                  {date} ×
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-nord-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium dark:border-nord-2"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={save}
            disabled={isSaving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-nord-10 dark:hover:bg-nord-9"
          >
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
