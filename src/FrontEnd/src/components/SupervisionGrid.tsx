import { useId } from "react";
import { Link } from "react-router-dom";
import {
  buildSupervisionGrid,
  SupervisionGrid as Grid,
  weekLabel,
} from "../utils/analytics";
import type { GridCell } from "../utils/analytics";
import { ScopeMonitoring } from "../types";
import { formatDateFr, formatFullDateFr } from "../utils/date";
import { BillingCodeBadge } from "./BillingCodeBadge";

/**
 * Grille de supervision : une ligne par périmètre, une colonne par jour.
 *
 * L'état d'une journée ne peut pas être porté par la seule couleur : la pastille
 * est décorative et porte un libellé pour les lecteurs d'écran, et la ligne
 * entière est un lien vers le détail du périmètre. La grille reste un `<table>`
 * plutôt qu'une suite de div, pour que la navigation au clavier suive les jours.
 */
export function SupervisionGrid({
  scopes,
  days,
  granularity = "jour",
}: {
  scopes: ScopeMonitoring[];
  days: string[];
  granularity?: "jour" | "semaine";
}) {
  const captionId = useId();
  const grid: Grid = buildSupervisionGrid(scopes, days, granularity);

  if (grid.rows.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 dark:border-nord-2 dark:bg-nord-1 dark:text-nord-4">
        {days.length === 0
          ? "Aucune journée sur cette période"
          : "Aucun périmètre sélectionné"}
      </div>
    );
  }

  const treated = grid.rows.reduce(
    (acc, row) => acc + row.cells.filter((cell) => cell.etat === "traite").length,
    0,
  );
  const pending = grid.rows.reduce(
    (acc, row) => acc + row.cells.filter((cell) => cell.etat === "encours").length,
    0,
  );
  const missing = grid.rows.reduce(
    (acc, row) => acc + row.cells.filter((cell) => cell.etat === "nonSaisi").length,
    0,
  );
  const summary = `${grid.rows.length} périmètre${
    grid.rows.length === 1 ? "" : "s"
  } sur ${grid.jours.length} jour${grid.jours.length === 1 ? "" : "s"}, ${treated} traité${
    treated === 1 ? "" : "s"
  }, ${pending} en cours, ${missing} non saisi${missing === 1 ? "" : "s"}`;

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-nord-2">
      <p
        id={captionId}
        role="img"
        aria-label={summary}
        className="sr-only"
      />
      <table
        aria-describedby={captionId}
        className="w-full min-w-max border-collapse text-sm"
      >
        <caption className="sr-only">
          Grille de supervision par périmètre et par jour
        </caption>
        <thead>
          <tr className="bg-slate-50 dark:bg-nord-2">
            <th
              scope="col"
              className="sticky left-0 z-10 bg-slate-50 px-3 py-2 text-left font-medium text-slate-600 dark:bg-nord-2 dark:text-nord-4"
            >
              Périmètre
            </th>
            {grid.jours.map((day) => (
              <th
                key={day}
                scope="col"
                className="px-2 py-2 text-center font-normal text-slate-500 dark:text-nord-4"
              >
                <span className="block text-xs">
                  {granularity === "jour" ? formatDateFr(day) : weekLabel(day)}
                </span>
              </th>
            ))}
            <th
              scope="col"
              className="px-3 py-2 text-right font-medium text-slate-600 dark:text-nord-4"
            >
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {grid.rows.map((row) => (
            <tr key={row.id} className="border-t border-slate-100 dark:border-nord-2">
              <th
                scope="row"
                className="sticky left-0 z-10 bg-white px-3 py-2 text-left font-normal dark:bg-nord-1"
              >
                <span className="flex items-center gap-1.5">
                  <Link
                    to={`/scopes/${row.id}`}
                    aria-label={`Ouvrir le détail de ${row.name}`}
                    className="truncate text-blue-600 hover:underline dark:text-nord-8"
                  >
                    {row.name}
                  </Link>
                  <BillingCodeBadge code={row.billing_code} />
                </span>
              </th>
              {row.cells.map((cell) => (
                <td key={cell.day} className="px-1 py-1 text-center">
                  <span
                    role="img"
                    aria-label={cellLabel(row.name, cell, granularity)}
                    title={cellLabel(row.name, cell, granularity)}
                    className={CELL_CLASS[cell.etat][cell.niveau]}
                  />
                </td>
              ))}
              <td className="px-3 py-2 text-right tabular-nums text-slate-700 dark:text-nord-3">
                {row.arriere > 0 ? row.arriere : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function cellLabel(
  scopeName: string,
  cell: GridCell,
  granularity: "jour" | "semaine",
): string {
  const jour =
    granularity === "jour" ? formatFullDateFr(cell.day) : `semaine ${weekLabel(cell.day)}`;
  if (cell.etat === "nonSaisi") return `${scopeName}, ${jour} : non saisi`;
  const etat = cell.etat === "traite" ? "traité" : "en cours";
  const attente = cell.arriere > 0 ? `, ${cell.arriere} en attente` : "";
  return `${scopeName}, ${jour} : ${etat}${attente}`;
}

/**
 * Classes complètes plutôt qu'interpolées : Tailwind extrait les noms de
 * classes par analyse statique du source, une clé construite ne serait jamais
 * générée.
 */
const CELL_CLASS: Record<string, Record<number, string>> = {
  traite: {
    0: "inline-block h-4 w-4 rounded-sm bg-emerald-600/50",
    1: "inline-block h-4 w-4 rounded-sm bg-emerald-600/70",
    2: "inline-block h-4 w-4 rounded-sm bg-emerald-600",
  },
  encours: {
    0: "inline-block h-4 w-4 rounded-sm bg-amber-400/50",
    1: "inline-block h-4 w-4 rounded-sm bg-amber-400/75",
    2: "inline-block h-4 w-4 rounded-sm bg-amber-500",
  },
  nonSaisi: {
    0: "inline-block h-4 w-4 rounded-sm border border-dashed border-slate-300 dark:border-nord-3",
    1: "inline-block h-4 w-4 rounded-sm border border-dashed border-slate-300 dark:border-nord-3",
    2: "inline-block h-4 w-4 rounded-sm border border-dashed border-slate-300 dark:border-nord-3",
  },
};