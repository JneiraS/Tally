import { useId } from "react";
import { Check, Download, SlidersHorizontal } from "lucide-react";
import { CHECKBOX_CLASS } from "../constants/ui";
import { firstActivityDay, resolvePresetRange } from "../utils/analytics";
import { getTodayIsoDate } from "../utils/date";
import type { NonWorkingDays, ScopeMonitoring } from "../types";
import type { Granularity, RangePreset } from "../utils/analytics";
import { AnalyticsScopePicker } from "./AnalyticsScopePicker";

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
  scopeIds: string[];
  billingCodes: string[];
}

export interface AnalyticsFilterBarProps {
  filters: AnalyticsFilters;
  onChange: (patch: Partial<AnalyticsFilters>) => void;
  scopes: ScopeMonitoring[];
  nonWorkingDays: NonWorkingDays;
  onExport: () => void;
}

const NO_BILLING_CODE = "__sans_code__";
const BILLING_CODE_LIMIT = 12;

export function AnalyticsFilterBar({
  filters,
  onChange,
  scopes,
  nonWorkingDays,
  onExport,
}: AnalyticsFilterBarProps) {
  const titleId = useId();
  const billingOptions = uniqueBillingCodes(scopes);
  const visibleScopes = scopes.filter(
    (scope) =>
      filters.billingCodes.length === 0 ||
      filters.billingCodes.includes(billingCodeKey(scope.billing_code)),
  );
  const visibleScopeIds = new Set(visibleScopes.map((scope) => scope.id));
  const selectedVisibleCount = filters.scopeIds.filter((id) => visibleScopeIds.has(id)).length;

  return (
    <section
      aria-labelledby={titleId}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-nord-2 dark:bg-nord-1 sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id={titleId} className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-nord-6">
            <SlidersHorizontal className="h-4 w-4 text-blue-600 dark:text-nord-9" aria-hidden="true" />
            Filtres d'analyse
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-nord-4">
            Affinez la période et les périmètres affichés.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 dark:border-nord-2 lg:grid-cols-[minmax(0,1.6fr)_minmax(12rem,0.8fr)]">
        <fieldset>
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-nord-4">
            Période
          </legend>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Période prédéfinie">
            <SegmentButton label="7 jours ouvrés" active={filters.preset === "7j"} onClick={() => applyPreset("7j", onChange, scopes, nonWorkingDays)} />
            <SegmentButton label="30 jours" active={filters.preset === "30j"} onClick={() => applyPreset("30j", onChange, scopes, nonWorkingDays)} />
            <SegmentButton label="Mois en cours" active={filters.preset === "mois"} onClick={() => applyPreset("mois", onChange, scopes, nonWorkingDays)} />
            <SegmentButton label="Tout" active={filters.preset === "tout"} onClick={() => applyPreset("tout", onChange, scopes, nonWorkingDays)} />
            <SegmentButton label="Personnalisée" active={filters.preset === "perso"} onClick={() => onChange({ preset: "perso" })} />
          </div>
          {filters.preset === "perso" ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <DateInput label="Période : début" value={filters.from} onChange={(from) => onChange({ from, preset: "perso" })} />
              <span className="text-xs text-slate-500 dark:text-nord-4">au</span>
              <DateInput label="Période : fin" value={filters.to} onChange={(to) => onChange({ to, preset: "perso" })} />
            </div>
          ) : (
            <p className="mt-2 text-xs text-slate-500 dark:text-nord-4">
              {formatRange(filters.from, filters.to)}
            </p>
          )}
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-nord-4">
            Granularité
          </legend>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Granularité">
            <SegmentButton label="Par jour" active={filters.granularity === "jour"} onClick={() => onChange({ granularity: "jour" })} />
            <SegmentButton label="Par semaine" active={filters.granularity === "semaine"} onClick={() => onChange({ granularity: "semaine" })} />
          </div>
        </fieldset>
      </div>

      <fieldset className="mt-4 border-t border-slate-100 pt-4 dark:border-nord-2">
        <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-nord-4">
          Périmètres analysés
        </legend>
        <AnalyticsScopePicker
          scopes={visibleScopes}
          selectedIds={filters.scopeIds}
          onChange={(scopeIds) => onChange({ scopeIds })}
        />
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="font-medium text-slate-700 dark:text-nord-3">
            {scopeCountLabel(selectedVisibleCount, visibleScopes.length)}
          </span>
          <span className="text-slate-400 dark:text-nord-3">La sélection est appliquée immédiatement.</span>
        </div>
        {selectedVisibleCount === 0 && (
          <p className="mt-3 rounded-lg border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-nord-3 dark:bg-nord-0 dark:text-nord-4">
            Aucun périmètre sélectionné. Sélectionnez au moins un périmètre pour afficher l'analyse.
          </p>
        )}
      </fieldset>

      <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 dark:border-nord-2 lg:grid-cols-2">
        <fieldset>
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-nord-4">
            Codes de facturation
          </legend>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Codes de facturation">
            <SegmentButton
              label="Tous"
              active={filters.billingCodes.length === 0}
              onClick={() => onChange({ billingCodes: [] })}
            />
            {billingOptions.slice(0, BILLING_CODE_LIMIT).map((code) => (
              <SegmentButton
                key={code}
                label={code === NO_BILLING_CODE ? "Sans code" : code}
                active={filters.billingCodes.includes(code)}
                onClick={() => toggleBillingCode(code, filters.billingCodes, onChange)}
              />
            ))}
            {billingOptions.length > BILLING_CODE_LIMIT && (
              <span className="self-center text-xs text-slate-500 dark:text-nord-4">
                +{billingOptions.length - BILLING_CODE_LIMIT} autres
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-nord-4">
            Plusieurs codes peuvent être sélectionnés.
          </p>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-nord-4">
            Options
          </legend>
          <div className="flex flex-col gap-1">
            <label className="flex min-h-9 items-center gap-2 text-sm text-slate-600 dark:text-nord-4">
              <input
                type="checkbox"
                checked={filters.workingDaysOnly}
                onChange={(event) => onChange({ workingDaysOnly: event.target.checked })}
                className={CHECKBOX_CLASS}
              />
              Jours ouvrés uniquement
            </label>
            <label className="flex min-h-9 items-center gap-2 text-sm text-slate-600 dark:text-nord-4">
              <input
                type="checkbox"
                checked={filters.compare}
                onChange={(event) => onChange({ compare: event.target.checked })}
                className={CHECKBOX_CLASS}
              />
              Comparer à la période précédente
            </label>
          </div>
        </fieldset>
      </div>

      <div className="mt-4 flex justify-end border-t border-slate-100 pt-4 dark:border-nord-2">
        <button
          type="button"
          onClick={onExport}
          className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-nord-3 dark:text-nord-4 dark:hover:bg-nord-2 dark:focus:ring-nord-8"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Exporter la sélection
        </button>
      </div>
    </section>
  );
}

function SegmentButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-nord-8 ${
        active
          ? "border-blue-600 bg-blue-600 text-white shadow-xs dark:border-nord-9 dark:bg-nord-9 dark:text-nord-0"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-nord-2 dark:bg-nord-0 dark:text-nord-4 dark:hover:bg-nord-2 dark:hover:text-nord-6"
      }`}
    >
      {active && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
      {label}
    </button>
  );
}

function DateInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex items-center gap-1.5 text-sm">
      <input
        type="date"
        value={value}
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-9 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 dark:border-nord-3 dark:bg-nord-0 dark:text-nord-5"
      />
    </label>
  );
}

function applyPreset(
  preset: Exclude<RangePreset, "perso">,
  onChange: (patch: Partial<AnalyticsFilters>) => void,
  scopes: ScopeMonitoring[],
  nonWorkingDays: NonWorkingDays,
) {
  const range = resolvePresetRange(
    preset,
    getTodayIsoDate(),
    nonWorkingDays,
    firstActivityDay(scopes),
  );
  onChange({ preset, ...range });
}

function scopeCountLabel(selected: number, total: number): string {
  return `${selected} périmètre${selected === 1 ? "" : "s"} sélectionné${selected === 1 ? "" : "s"} sur ${total}`;
}

function formatRange(from: string, to: string): string {
  const [fromYear, fromMonth, fromDay] = from.split("-");
  const [toYear, toMonth, toDay] = to.split("-");
  if (fromYear === toYear && fromMonth === toMonth) {
    return `${fromDay}–${toDay}/${toMonth}/${toYear}`;
  }
  return `${fromDay}/${fromMonth}/${fromYear}–${toDay}/${toMonth}/${toYear}`;
}

function billingCodeKey(code: string | null): string {
  return code ?? NO_BILLING_CODE;
}

function uniqueBillingCodes(scopes: ScopeMonitoring[]): string[] {
  return [...new Set(scopes.map((scope) => billingCodeKey(scope.billing_code)))].sort((a, b) => {
    if (a === NO_BILLING_CODE) return 1;
    if (b === NO_BILLING_CODE) return -1;
    return a.localeCompare(b);
  });
}

function toggleBillingCode(
  code: string,
  selectedCodes: string[],
  onChange: (patch: Partial<AnalyticsFilters>) => void,
) {
  onChange({
    billingCodes: selectedCodes.includes(code)
      ? selectedCodes.filter((current) => current !== code)
      : [...selectedCodes, code],
  });
}
