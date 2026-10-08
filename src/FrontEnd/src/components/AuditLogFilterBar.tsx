import { useId, useState } from "react";
import { ChevronDown, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { AUDIT_ACTIONS } from "../constants/auditActions";
import { getTodayIsoDate } from "../utils/date";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { ScopePicker } from "./ScopePicker";
import type { AuditAction, ScopeMonitoring } from "../types";

export interface AuditLogFilters {
  /** ISO `YYYY-MM-DD` calendar days, resolved to instants at query time. */
  fromDate: string;
  toDate: string;
  scopeIds: string[];
  /** Free text: a case-insensitive prefix of the actor code. */
  actor: string;
  action: AuditAction | "";
}

export const EMPTY_FILTERS: AuditLogFilters = {
  fromDate: "",
  toDate: "",
  scopeIds: [],
  actor: "",
  action: "",
};

/** How many filters differ from "show everything". Drives the reset affordance. */
export function activeFilterCount(filters: AuditLogFilters): number {
  return [
    filters.fromDate !== "",
    filters.toDate !== "",
    filters.scopeIds.length > 0,
    filters.actor.trim() !== "",
    filters.action !== "",
  ].filter(Boolean).length;
}

interface AuditLogFilterBarProps {
  filters: AuditLogFilters;
  onChange: (patch: Partial<AuditLogFilters>) => void;
  onReset: () => void;
  scopes: ScopeMonitoring[];
  /** The scope list could not be loaded, so the picker has nothing to offer. */
  scopesUnavailable?: boolean;
}

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      type="date"
      value={value}
      max={getTodayIsoDate()}
      aria-label={label}
      onChange={(event) => onChange(event.target.value)}
      className="min-h-9 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 dark:border-nord-3 dark:bg-nord-0 dark:text-nord-5"
    />
  );
}

export function AuditLogFilterBar({
  filters,
  onChange,
  onReset,
  scopes,
  scopesUnavailable = false,
}: AuditLogFilterBarProps) {
  const titleId = useId();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [expanded, setExpanded] = useState(!isMobile);
  const activeCount = activeFilterCount(filters);
  // A start after the end matches nothing, and the user would read the empty
  // journal as "no activity that day" rather than as an inverted range.
  const rangeInverted =
    filters.fromDate !== "" &&
    filters.toDate !== "" &&
    filters.fromDate > filters.toDate;

  return (
    <section
      aria-labelledby={titleId}
      // Pas de `overflow-*` ici : `ScopePicker` ouvre son popover en `absolute`
      // dans cette carte, et un rognage le couperait à son bord bas — sans
      // trace en console. Vérifié par `expectDoesNotClip`.
      className="rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-nord-2 dark:bg-nord-1"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-t-xl border-b border-slate-200 p-4 dark:border-nord-2">
        <div>
          <h2
            id={titleId}
            className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-nord-6"
          >
            <SlidersHorizontal
              className="h-4 w-4 text-blue-600 dark:text-nord-9"
              aria-hidden="true"
            />
            Filtres du journal
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-nord-4">
            Filtrez par période, périmètre, intervenant ou type d&apos;action.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            disabled={activeCount === 0}
            className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-nord-3 dark:text-nord-4 dark:hover:bg-nord-2 dark:focus:ring-nord-8"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Réinitialiser
          </button>
          {isMobile && (
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls="audit-filter-content"
              onClick={() => setExpanded((current) => !current)}
              className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-nord-2 dark:bg-nord-0 dark:text-nord-4 dark:focus:ring-nord-8"
            >
              {expanded ? (
                <>
                  <X className="h-4 w-4" aria-hidden="true" />
                  Masquer
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  Filtres
                  {activeCount > 0 && (
                    <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-blue-600 text-[10px] font-medium text-white">
                      {activeCount}
                    </span>
                  )}
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div
        id="audit-filter-content"
        className={`${expanded ? "" : "hidden"} md:block`}
      >
        <div className="space-y-4 p-4">
          <fieldset>
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-nord-4">
              Période de saisie
            </legend>
            <div className="flex flex-wrap items-center gap-2">
              <DateInput
                label="Journal : à partir du"
                value={filters.fromDate}
                onChange={(fromDate) => onChange({ fromDate })}
              />
              <span className="text-xs text-slate-500 dark:text-nord-4">au</span>
              <DateInput
                label="Journal : jusqu'au"
                value={filters.toDate}
                onChange={(toDate) => onChange({ toDate })}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-nord-4">
              La période porte sur la date d&apos;enregistrement de la
              modification, pas sur la journée métier concernée&nbsp;: une
              création de périmètre n&apos;a pas de journée et resterait sinon
              invisible.
            </p>
            {rangeInverted && (
              <p className="mt-2 rounded-lg border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-nord-3 dark:bg-nord-0 dark:text-nord-4">
                La date de début est postérieure à la date de fin&nbsp;: aucune
                date ne correspond à cette période.
              </p>
            )}
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-nord-4">
              Périmètres
            </legend>
            <ScopePicker
              scopes={scopes}
              selectedIds={filters.scopeIds}
              onChange={(scopeIds) => onChange({ scopeIds })}
              label="Périmètres du journal"
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-nord-4">
              Aucun périmètre sélectionné = tous les périmètres.
            </p>
            {scopesUnavailable && (
              <p className="mt-2 rounded-lg border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-nord-3 dark:bg-nord-0 dark:text-nord-4">
                La liste des périmètres n&apos;a pas pu être chargée : le filtre
                par périmètre est indisponible. Les autres filtres restent
                utilisables.
              </p>
            )}
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-nord-4">
              Intervenant et action
            </legend>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex-1">
                <label
                  htmlFor="audit-actor"
                  className="mb-1 block text-xs text-slate-600 dark:text-nord-4"
                >
                  Quadrigramme
                </label>
                <input
                  id="audit-actor"
                  type="text"
                  value={filters.actor}
                  onChange={(event) => onChange({ actor: event.target.value })}
                  aria-describedby="audit-actor-help"
                  placeholder="Tous les intervenants"
                  className="min-h-9 w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 placeholder:text-slate-400 dark:border-nord-3 dark:bg-nord-0 dark:text-nord-5 dark:placeholder:text-nord-3"
                />
                <p
                  id="audit-actor-help"
                  className="mt-1 text-xs text-slate-500 dark:text-nord-4"
                >
                  Début du code, sans tenir compte de la casse&nbsp;: «&nbsp;AB&nbsp;»
                  couvre tous les intervenants commençant par AB.
                </p>
              </div>
              <div className="flex-1">
                <label
                  htmlFor="audit-action"
                  className="mb-1 block text-xs text-slate-600 dark:text-nord-4"
                >
                  Type d&apos;action
                </label>
                <select
                  id="audit-action"
                  value={filters.action}
                  onChange={(event) =>
                    onChange({ action: event.target.value as AuditAction | "" })
                  }
                  className="min-h-9 w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 dark:border-nord-3 dark:bg-nord-0 dark:text-nord-5"
                >
                  <option value="">Toutes les actions</option>
                  {AUDIT_ACTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>
        </div>
      </div>
    </section>
  );
}