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

/** Nombre maximal de libellés de date visibles sur la ligne d'en-tête. */
const MAX_VISIBLE_DAY_LABELS = 12;

/**
 * Grille de supervision : une ligne par périmètre, une colonne par jour.
 *
 * L'état d'une journée ne peut pas être porté par la seule couleur : la pastille
 * est décorative et porte un libellé pour les lecteurs d'écran, et la ligne
 * entière est un lien vers le détail du périmètre. La grille reste un `<table>`
 * plutôt qu'une suite de div, pour que la navigation au clavier suive les jours.
 *
 * **La largeur appartient au tableau, pas à son contenu** : `table-fixed` répartit
 * les colonnes de jours sur l'espace restant, donc la grille ne peut pas déborder
 * quelle que soit la longueur de la période. Un `min-w-max` — l'autre solution,
 * celle qui affiche une barre de défilement dès une quinzaine de jours — ne
 * ferait que repousser le problème à la période suivante, en perdant en route la
 * première colonne. La contrepartie est assumée : les cellules rétrécissent, et
 * au-delà d'une centaine de jours elles ne sont plus qu'un ruban de couleur. C'est
 * pourquoi l'agrégat semaine existe.
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
      <div className="bg-white dark:bg-nord-1 p-12 text-center rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs">
        <p className="text-sm text-slate-500 dark:text-nord-4">
          {days.length === 0
            ? "Aucune journée sur cette période"
            : "Aucun périmètre sélectionné"}
        </p>
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

  // Un libellé sur N colonnes : au-delà, ils se chevauchent et l'en-tête devient
  // illisible. Les colonnes muettes gardent un nom accessible, donc la grille
  // reste complète pour un lecteur d'écran comme pour la comparaison visuelle.
  const labelStride = Math.max(
    1,
    Math.ceil(grid.jours.length / MAX_VISIBLE_DAY_LABELS),
  );

  return (
    <div className="bg-white dark:bg-nord-1 rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs overflow-hidden">
      <p
        id={captionId}
        role="img"
        aria-label={summary}
        className="sr-only"
      />
      <table
        aria-describedby={captionId}
        className="w-full table-fixed border-collapse text-sm text-slate-600 dark:text-nord-5"
      >
        <caption className="sr-only">
          Grille de supervision par périmètre et par {granularity}
        </caption>
        <colgroup>
          <col className="w-44" />
          {grid.jours.map((day) => (
            <col key={day} />
          ))}
          <col className="w-20" />
        </colgroup>
        <thead className="bg-slate-50/80 dark:bg-nord-0/60 border-b border-slate-200 dark:border-nord-2">
          <tr className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-nord-4">
            <th scope="col" className="px-3 py-2 text-left">
              Périmètre
            </th>
            {grid.jours.map((day, index) => {
              const visible =
                index % labelStride === 0 ||
                index === grid.jours.length - 1;
              const label =
                granularity === "jour" ? formatDateFr(day) : weekLabel(day);
              return (
                <th
                  key={day}
                  scope="col"
                  title={label}
                  className="px-0 py-2 text-center font-semibold"
                >
                  {visible ? (
                    <span className="block truncate text-[10px] leading-tight">
                      {label}
                    </span>
                  ) : (
                    <span className="sr-only">{label}</span>
                  )}
                </th>
              );
            })}
            <th scope="col" className="px-3 py-2 text-right">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-nord-2">
          {grid.rows.map((row) => (
            <tr key={row.id}>
              <th
                scope="row"
                className="sticky left-0 z-10 bg-white px-3 py-1.5 text-left font-normal dark:bg-nord-1"
              >
                <span className="flex items-center gap-1.5">
                  <Link
                    to={`/scopes/${row.id}`}
                    aria-label={`Ouvrir le détail de ${row.name}`}
                    className="min-w-0 truncate text-blue-600 hover:underline dark:text-nord-8"
                  >
                    {row.name}
                  </Link>
                  <BillingCodeBadge code={row.billing_code} />
                </span>
              </th>
              {row.cells.map((cell) => (
                <td key={cell.day} className="p-0 text-center">
                  <span
                    role="img"
                    aria-label={cellLabel(row.name, cell, granularity)}
                    title={cellLabel(row.name, cell, granularity)}
                    className={CELL_CLASS[cell.etat][cell.niveau]}
                  />
                </td>
              ))}
              <td className="px-3 py-1.5 text-right text-xs tabular-nums text-slate-700 dark:text-nord-3">
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
    granularity === "jour"
      ? formatFullDateFr(cell.day)
      : `semaine ${weekLabel(cell.day)}`;
  if (cell.etat === "nonSaisi") return `${scopeName}, ${jour} : non saisi`;
  const etat = cell.etat === "traite" ? "traité" : "en cours";
  const attente = cell.arriere > 0 ? `, ${cell.arriere} en attente` : "";
  return `${scopeName}, ${jour} : ${etat}${attente}`;
}

/**
 * Classes complètes plutôt qu'interpolées : Tailwind extrait les noms de classes
 * par analyse statique du source, une clé construite ne serait jamais générée.
 *
 * La pastille occupe toute la largeur de sa colonne — d'où l'absence de `w-4` :
 * une largeur fixe la ferait déborder de sa cellule dès que la colonne rétrécit.
 */
const CELL_CLASS: Record<string, Record<number, string>> = {
  traite: {
    0: "mx-0.5 block h-3 rounded-sm bg-emerald-600/40",
    1: "mx-0.5 block h-3 rounded-sm bg-emerald-600/70",
    2: "mx-0.5 block h-3 rounded-sm bg-emerald-600",
  },
  encours: {
    0: "mx-0.5 block h-3 rounded-sm bg-amber-400/50",
    1: "mx-0.5 block h-3 rounded-sm bg-amber-400/80",
    2: "mx-0.5 block h-3 rounded-sm bg-amber-500",
  },
  nonSaisi: {
    0: "mx-0.5 block h-3 rounded-sm border border-dashed border-slate-200 dark:border-nord-2",
    1: "mx-0.5 block h-3 rounded-sm border border-dashed border-slate-200 dark:border-nord-2",
    2: "mx-0.5 block h-3 rounded-sm border border-dashed border-slate-200 dark:border-nord-2",
  },
};
