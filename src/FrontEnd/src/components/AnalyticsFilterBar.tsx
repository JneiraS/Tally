import { useState } from "react";
import { Check, Download, SlidersHorizontal } from "lucide-react";
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

/** Pastilles de périmètre affichées avant de renvoyer le reste derrière « +N autres ». */
const SCOPE_CHIP_LIMIT = 12;

export function AnalyticsFilterBar({
  filters,
  onChange,
  scopes,
  nonWorkingDays,
  onExport,
}: AnalyticsFilterBarProps) {
  const { from, to, preset, granularity, workingDaysOnly, compare, scopeIds } =
    filters;
  const [expanded, setExpanded] = useState(false);
  const shownScopes = expanded ? scopes : scopes.slice(0, SCOPE_CHIP_LIMIT);
  const hiddenCount = scopes.length - shownScopes.length;
  const allScopesSelected = scopes.length > 0 && scopeIds.length === scopes.length;
  const noScopesSelected = scopeIds.length === 0;

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
      className="bg-white dark:bg-nord-1 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-nord-6">
            <SlidersHorizontal className="h-4 w-4 text-blue-600 dark:text-nord-9" aria-hidden="true" />
            Paramètres de l'analyse
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-nord-4">
            Choisissez une période et les périmètres à comparer.
          </p>
        </div>
        <div className="mt-3 sm:mt-0">
            <button
              type="button"
              onClick={onExport}
              className="inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-nord-3 dark:text-nord-4 dark:hover:bg-nord-2 dark:focus:ring-nord-8 sm:w-auto"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Exporter la sélection
            </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 border-t border-slate-100 pt-4 dark:border-nord-2 md:grid-cols-2">
        <fieldset>
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-nord-4">
            Période
          </legend>
          <div className="flex flex-wrap items-center gap-1.5">
            <div
              role="group"
              aria-label="Période prédéfinie"
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
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-nord-4">
            Affichage
          </legend>
          <div className="flex flex-wrap gap-1">
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
          <label className="mt-2 flex min-h-9 items-center gap-2 text-sm text-slate-600 dark:text-nord-4">
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
          <label className="flex min-h-9 items-center gap-2 text-sm text-slate-600 dark:text-nord-4">
            <input
              type="checkbox"
              checked={compare}
              onChange={(event) => onChange({ compare: event.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 dark:border-nord-3 dark:bg-nord-0"
            />
            Comparer à la période précédente
          </label>
          <div className="mt-1.5">
            <span className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-nord-4">
              Classement
            </span>
            <div className="flex flex-wrap gap-1" role="group" aria-label="Indicateur du classement">
              <ToggleButton
                label="En attente"
                active={filters.metric === "arriere"}
                onClick={() => onChange({ metric: "arriere" })}
              />
              <ToggleButton
                label="Erreurs"
                active={filters.metric === "erreurs"}
                onClick={() => onChange({ metric: "erreurs" })}
              />
              <ToggleButton
                label="Incidents"
                active={filters.metric === "incidents"}
                onClick={() => onChange({ metric: "incidents" })}
              />
              <ToggleButton
                label="Transformation"
                active={filters.metric === "transformation"}
                onClick={() => onChange({ metric: "transformation" })}
              />
            </div>
          </div>
        </fieldset>
      </div>

      <fieldset className="mt-5 border-t border-slate-100 pt-4 dark:border-nord-2">
        <legend className="text-sm font-semibold text-slate-900 dark:text-nord-6">
          Périmètres comparés
        </legend>
        <p className="mt-1 text-xs text-slate-500 dark:text-nord-4">
          Les graphiques et la grille portent uniquement sur ces périmètres.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500 dark:text-nord-4">
          <span className="font-medium text-slate-700 dark:text-nord-3">
            {scopeCountLabel(scopeIds.length, scopes.length)}
          </span>
          <button
            type="button"
            disabled={allScopesSelected}
            onClick={() => onChange({ scopeIds: scopes.map((s) => s.id) })}
            className="font-medium text-blue-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline dark:text-nord-8 dark:disabled:text-nord-3"
          >
            Tout sélectionner
          </button>
          <button
            type="button"
            disabled={noScopesSelected}
            onClick={() => onChange({ scopeIds: [] })}
            className="font-medium text-blue-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline dark:text-nord-8 dark:disabled:text-nord-3"
          >
            Tout désélectionner
          </button>
        </div>
          {/*
            Des pastilles, pas une liste dans une boîte défilante : la zone
            défilante imposait une barre dès cinq périmètres, pour une sélection
            qui se lit d'un coup d'œil. Le reste est renvoyé derrière un bouton
            « +N autres » qui le déploie en ligne — une modale n'aurait ici qu'un
            « Annuler » en doublon de celui de la page.
          */}
          <ul
            aria-label="Périmètres comparés"
            className="mt-3 flex flex-wrap gap-1.5"
          >
            {shownScopes.map((scope) => (
              <li key={scope.id}>
                <label
                  className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2 py-1 text-xs transition-colors ${
                    scopeIds.includes(scope.id)
                      ? "border-blue-600 bg-blue-50 text-blue-900 shadow-xs dark:border-nord-8 dark:bg-nord-9/20 dark:text-nord-6"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-nord-2 dark:bg-nord-0 dark:text-nord-4 dark:hover:bg-nord-2 dark:hover:text-nord-6"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={scopeIds.includes(scope.id)}
                    onChange={() => toggleScope(scope.id)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 accent-blue-600 dark:border-nord-3 dark:bg-nord-0 dark:accent-nord-8"
                  />
                  {scopeIds.includes(scope.id) && (
                    <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  )}
                  <span className="max-w-40 truncate">{scope.name}</span>
                </label>
              </li>
            ))}
            {scopes.length > SCOPE_CHIP_LIMIT && (
              <li>
                <button
                  type="button"
                  onClick={() => setExpanded((open) => !open)}
                  aria-expanded={expanded}
                  className="rounded-lg border border-dashed border-slate-300 px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-nord-3 dark:text-nord-4 dark:hover:bg-nord-2"
                >
                  {expanded ? "− replier" : `+${hiddenCount} autres`}
                </button>
              </li>
            )}
          </ul>
        {noScopesSelected && (
          <p className="mt-3 rounded-lg border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-nord-3 dark:bg-nord-0 dark:text-nord-4">
            Aucun périmètre sélectionné. Sélectionnez au moins un périmètre pour afficher l'analyse.
          </p>
        )}
      </fieldset>
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
