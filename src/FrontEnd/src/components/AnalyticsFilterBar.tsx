import { Download } from "lucide-react";
import { firstActivityDay, resolvePresetRange } from "../utils/analytics";
import { getTodayIsoDate } from "../utils/date";
import type { NonWorkingDays, ScopeMonitoring } from "../types";
import type {
  Granularity,
  Metric,
  RangePreset,
} from "../utils/analytics";

export const SCOPE_LIST_PATH = "/";
export const SCOPE_DETAIL_PATH = "/scopes/:id";
export const ANALYTICS_PATH = "/analyse";

export interface AnalyticsFilters {
  from: string;
  to: string;
  preset: RangePreset;
  granularity: Granularity;
  workingDaysOnly: boolean;
  compare: boolean;
  metric: Metric;
  scopeIds: string[];
}

export interface AnalyticsFilterBarProps {
  filters: AnalyticsFilters;
  onChange: (patch: Partial<AnalyticsFilters>) => void;
  scopes: ScopeMonitoring[];
  nonWorkingDays: NonWorkingDays;
  onExport: () => void;
}

export function AnalyticsFilterBar({
  filters,
  onChange,
  scopes,
  nonWorkingDays,
  onExport,
}: AnalyticsFilterBarProps) {
  const { from, to, preset, granularity, workingDaysOnly, compare, scopeIds } =
    filters;

  const applyPreset = (next: Exclude<RangePreset, "perso">) => {
    const range = resolvePresetRange(
      next,
      getTodayIsoDate(),
      nonWorkingDays,
      firstActivityDay(scopes),
    );
    onChange({ preset: next, ...range });
  };

  const toggleScope = (id: string) => {
    onChange({
      scopeIds: scopeIds.includes(id)
        ? scopeIds.filter((current) => current !== id)
        : [...scopeIds, id],
    });
  };

  return (
    <section
      aria-label="Filtres d'analyse"
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-nord-2 dark:bg-nord-1"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="md:col-span-2">
          <div className="mb-1.5 flex justify-end">
            <button
              type="button"
              onClick={onExport}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:border-nord-3 dark:text-nord-4 dark:hover:bg-nord-2"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Exporter la sélection
            </button>
          </div>
          <span
            id="analytics-period-label"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-nord-3"
          >
            Période
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <div
              role="group"
              aria-labelledby="analytics-period-label"
              className="flex gap-1"
            >
              <PresetButton
                label="7 jours ouvrés"
                active={preset === "7j"}
                onClick={() => applyPreset("7j")}
              />
              <PresetButton
                label="30 jours"
                active={preset === "30j"}
                onClick={() => applyPreset("30j")}
              />
              <PresetButton
                label="Mois en cours"
                active={preset === "mois"}
                onClick={() => applyPreset("mois")}
              />
              <PresetButton
                label="Tout"
                active={preset === "tout"}
                onClick={() => applyPreset("tout")}
              />
            </div>
            <label className="flex items-center gap-1.5 text-sm">
              <span className="text-slate-500 dark:text-nord-4">du</span>
              <input
                type="date"
                value={from}
                aria-label="Période : début"
                onChange={(event) =>
                  onChange({ from: event.target.value, preset: "perso" })
                }
                className="rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-nord-3 dark:bg-nord-0 dark:text-nord-5"
              />
            </label>
            <label className="flex items-center gap-1.5 text-sm">
              <span className="text-slate-500 dark:text-nord-4">au</span>
              <input
                type="date"
                value={to}
                aria-label="Période : fin"
                onChange={(event) =>
                  onChange({ to: event.target.value, preset: "perso" })
                }
                className="rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-nord-3 dark:bg-nord-0 dark:text-nord-5"
              />
            </label>
          </div>
        </div>

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-slate-700 dark:text-nord-3">
            Agrégat
          </legend>
          <div className="flex gap-1">
            <ToggleButton
              label="Par jour"
              active={granularity === "jour"}
              onClick={() => onChange({ granularity: "jour" })}
            />
            <ToggleButton
              label="Par semaine"
              active={granularity === "semaine"}
              onClick={() => onChange({ granularity: "semaine" })}
            />
          </div>
          <label className="mt-2 flex items-center gap-2 text-sm text-slate-600 dark:text-nord-4">
            <input
              type="checkbox"
              checked={workingDaysOnly}
              onChange={(event) =>
                onChange({ workingDaysOnly: event.target.checked })
              }
              className="h-4 w-4 rounded border-slate-300 text-blue-600 dark:border-nord-3 dark:bg-nord-0"
            />
            Jours ouvrés uniquement
          </label>
          <label className="mt-1.5 flex items-center gap-2 text-sm text-slate-600 dark:text-nord-4">
            <input
              type="checkbox"
              checked={compare}
              onChange={(event) => onChange({ compare: event.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 dark:border-nord-3 dark:bg-nord-0"
            />
            Comparer à la période précédente
          </label>
        </fieldset>

        <div>
          <span
            id="analytics-scope-label"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-nord-3"
          >
            Périmètres
          </span>
          <div className="mb-1.5 flex items-center gap-2 text-xs text-slate-500 dark:text-nord-4">
            <span>{scopeCountLabel(scopeIds.length, scopes.length)}</span>
            <button
              type="button"
              onClick={() => onChange({ scopeIds: scopes.map((s) => s.id) })}
              className="font-medium text-blue-600 hover:underline dark:text-nord-8"
            >
              Tout cocher
            </button>
            <button
              type="button"
              onClick={() => onChange({ scopeIds: [] })}
              className="font-medium text-blue-600 hover:underline dark:text-nord-8"
            >
              Tout décocher
            </button>
          </div>
          <ul
            aria-labelledby="analytics-scope-label"
            className="max-h-28 space-y-1 overflow-y-auto rounded border border-slate-200 p-2 dark:border-nord-2"
          >
            {scopes.map((scope) => (
              <li key={scope.id}>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-nord-4">
                  <input
                    type="checkbox"
                    checked={scopeIds.includes(scope.id)}
                    onChange={() => toggleScope(scope.id)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 dark:border-nord-3 dark:bg-nord-0"
                  />
                  {scope.name}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function PresetButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded px-2.5 py-1 text-sm transition-colors ${
        active
          ? "bg-blue-600 text-white dark:bg-nord-9 dark:text-nord-0"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-nord-2 dark:text-nord-4 dark:hover:bg-nord-3"
      }`}
    >
      {label}
    </button>
  );
}

function ToggleButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded px-2.5 py-1 text-sm transition-colors ${
        active
          ? "bg-blue-600 text-white dark:bg-nord-9 dark:text-nord-0"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-nord-2 dark:text-nord-4 dark:hover:bg-nord-3"
      }`}
    >
      {label}
    </button>
  );
}


/**
 * Une seule chaîne interpolée : le nombre et son unité restent dans un seul
 * nœud de texte, ce qui garde la phrase adressable par `getByText` et lisible
 * telle quelle par un lecteur d'écran.
 */
function scopeCountLabel(selected: number, total: number): string {
  return `${selected} périmètre${selected === 1 ? "" : "s"} sur ${total}`;
}
