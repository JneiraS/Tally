import { useId, useMemo } from "react";
import { Link } from "react-router-dom";
import { buildErrorHeatmap, weekLabel } from "../utils/analytics";
import type {
  ErrorHeatmapCell,
  ErrorHeatmapRow,
  Granularity,
} from "../utils/analytics";
import { ScopeMonitoring } from "../types";
import { formatDateFr } from "../utils/date";
import { BillingCodeBadge } from "./BillingCodeBadge";

/**
 * Nombre maximal de libellés de colonne lisibles sur la ligne d'en-tête.
 *
 * Au-delà, les en-têtes se chevauchent. Un libellé sur N colonnes suffit : chaque
 * en-tête garde un `title` et chaque cellule son libellé complet, donc la lecture
 * au survol et celle d'un lecteur d'écran restent complètes.
 */
const MAX_VISIBLE_COLUMN_LABELS = 12;

/** Erreurs brutes par périmètre et par colonne, avec classement de la période. */
export function AnalyticsErrorHeatmap({
  scopes,
  days,
  granularity = "semaine",
}: {
  scopes: ScopeMonitoring[];
  days: string[];
  granularity?: Granularity;
}) {
  const titleId = useId();
  const heatmap = useMemo(
    () => buildErrorHeatmap(scopes, days, granularity),
    [scopes, days, granularity],
  );
  const perColumn = granularity === "jour" ? "jour" : "semaine";

  return (
    <section
      aria-labelledby={titleId}
      className="bg-white dark:bg-nord-1 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs"
    >
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 id={titleId} className="text-sm font-semibold text-slate-800 dark:text-nord-5">
          Erreurs par {perColumn} et par périmètre
        </h3>
        <p className="text-xs text-slate-500 dark:text-nord-4">
          Volume total d'erreurs · {perColumn}s ISO · — : aucune saisie
        </p>
      </div>

      {heatmap.columns.length === 0 || heatmap.rows.length === 0 ? (
        <p className="p-8 text-center text-sm text-slate-500 dark:text-nord-4">
          Aucune {perColumn} ou aucun périmètre sur la période.
        </p>
      ) : (
        <>
          <ErrorMatrix heatmap={heatmap} />
          <ErrorRanking rows={heatmap.rows} />
        </>
      )}
    </section>
  );
}

/**
 * La matrice est un `overflow-x-auto` et non un `overflow-hidden` : en vue
 * journalière, une période de 120 jours représente 120 colonnes d'au moins 2 rem,
 * soit plusieurs fois la largeur de l'écran. Masquer ce qui dépasse laisserait
 * des colonnes hors d'atteinte — visuellement et pour le clavier — ce qui est pire
 * qu'une barre de défilement. La colonne des noms reste `sticky` pour que les
 * lignes restent identifiables pendant le défilement, et la région devient
 * focusable quand elle déborde réellement, faute de quoi le conteneur serait
 * inatteignable au clavier (WCAG 2.1.1).
 */
function ErrorMatrix({ heatmap }: { heatmap: ReturnType<typeof buildErrorHeatmap> }) {
  const labelStride = Math.max(
    1,
    Math.ceil(heatmap.columns.length / MAX_VISIBLE_COLUMN_LABELS),
  );
  const scrolls = heatmap.columns.length > MAX_VISIBLE_COLUMN_LABELS;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-nord-2">
      <div
        role="region"
        aria-label={
          scrolls
            ? "Heatmap des erreurs par période, défilement horizontal"
            : "Heatmap des erreurs par période"
        }
        tabIndex={scrolls ? 0 : undefined}
        className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-blue-600"
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: `minmax(7rem, 1.5fr) repeat(${heatmap.columns.length}, minmax(2rem, 1fr))`,
          }}
        >
          <div className="sticky left-0 z-10 bg-slate-50/80 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:bg-nord-0/60 dark:text-nord-4">
            Périmètre
          </div>
          {heatmap.columns.map((column, index) => {
            const { full, short } = columnLabels(column, heatmap.granularity);
            const visible = index % labelStride === 0;
            return (
              <div
                key={column}
                title={full}
                className="bg-slate-50/80 px-1 py-2 text-center text-xs font-semibold uppercase tracking-wider text-slate-600 dark:bg-nord-0/60 dark:text-nord-4"
              >
                {visible ? (
                  <span className="block truncate text-[10px] leading-tight">
                    {short}
                  </span>
                ) : (
                  <span className="sr-only">{full}</span>
                )}
              </div>
            );
          })}
          {heatmap.rows.map((row) => (
            <ErrorRow key={row.id} row={row} heatmap={heatmap} />
          ))}
        </div>
      </div>
      <p className="border-t border-slate-100 px-3 py-2 text-xs text-slate-500 dark:border-nord-2 dark:text-nord-4">
        Intensité proportionnelle au volume d'erreurs. La variation compare chaque
        {heatmap.granularity === "jour" ? " jour" : " semaine"} au précédent.
      </p>
    </div>
  );
}

/**
 * `short` est ce qui se lit dans la colonne, `full` ce que le survol et le nom
 * accessible doivent restituer. En vue journalière, « 21 sept. 2026 » ne tient
 * pas dans une colonne de 2 rem : `truncate` n'en montrerait que le premier
 * chiffre, ce qui alignerait des jours différents sous le même nombre. Seul le
 * jour est affiché, la date entière restant disponible.
 */
function columnLabels(
  column: string,
  granularity: Granularity,
): { full: string; short: string } {
  if (granularity === "semaine") {
    const label = weekLabel(column);
    return { full: label, short: label };
  }
  return { full: formatDateFr(column), short: column.slice(8, 10) };
}

function ErrorRow({
  row,
  heatmap,
}: {
  row: ErrorHeatmapRow;
  heatmap: ReturnType<typeof buildErrorHeatmap>;
}) {
  return (
    <>
      <div className="sticky left-0 z-10 flex min-w-0 items-center gap-1.5 border-t border-slate-100 bg-white px-3 py-2 text-sm text-slate-700 dark:border-nord-2 dark:bg-nord-1 dark:text-nord-4">
        <Link to={`/scopes/${row.id}`} className="min-w-0 truncate text-blue-600 hover:underline dark:text-nord-8">
          {row.name}
        </Link>
        <BillingCodeBadge code={row.billing_code} />
      </div>
      {row.cells.map((cell) => (
        <ErrorCell
          key={cell.column}
          cell={cell}
          scopeName={row.name}
          maxErrors={heatmap.maxErrors}
          granularity={heatmap.granularity}
        />
      ))}
    </>
  );
}

function ErrorCell({
  cell,
  scopeName,
  maxErrors,
  granularity,
}: {
  cell: ErrorHeatmapCell;
  scopeName: string;
  maxErrors: number;
  granularity: Granularity;
}) {
  const intensity = maxErrors === 0 ? 0 : cell.errors / maxErrors;
  const column =
    granularity === "jour" ? formatDateFr(cell.column) : weekLabel(cell.column);
  const change =
    cell.changePct === null
      ? "évolution indisponible"
      : `${cell.changePct >= 0 ? "+" : ""}${cell.changePct} %`;
  const value = cell.saisi
    ? `${cell.errors} erreur${cell.errors === 1 ? "" : "s"}`
    : "aucune saisie";
  const label = `${scopeName}, ${column} : ${value}, ${change}`;

  return (
    <div
      role="img"
      aria-label={label}
      title={label}
      className={`flex min-h-10 items-center justify-center border-l border-t border-white/60 px-1 text-xs font-semibold tabular-nums dark:border-nord-1 ${heatmapClass(intensity)}`}
    >
      {cell.saisi ? cell.errors : "—"}
    </div>
  );
}

function ErrorRanking({ rows }: { rows: ErrorHeatmapRow[] }) {
  const max = Math.max(...rows.map((row) => row.totalErrors), 1);
  return (
    <div className="mt-5 border-t border-slate-100 pt-4 dark:border-nord-2">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-800 dark:text-nord-5">Périmètres les plus exposés</h4>
        <p className="text-xs text-slate-500 dark:text-nord-4">Total d'erreurs sur la période</p>
      </div>
      <ol className="grid gap-x-6 gap-y-2 md:grid-cols-2">
        {rows.slice(0, 15).map((row) => (
          <li key={row.id}>
            <Link to={`/scopes/${row.id}`} className="block rounded-lg px-1 py-1 transition-colors hover:bg-slate-50 dark:hover:bg-nord-2">
              <div className="flex items-baseline justify-between gap-3">
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate text-sm text-blue-600 hover:underline dark:text-nord-8">{row.name}</span>
                  <BillingCodeBadge code={row.billing_code} />
                </span>
                <span className="shrink-0 text-sm font-medium tabular-nums text-slate-800 dark:text-nord-5">{row.totalErrors}</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-slate-100 dark:bg-nord-0">
                <span className="block h-1.5 rounded-full bg-blue-600 dark:bg-nord-9" style={{ width: `${Math.round((row.totalErrors / max) * 100)}%` }} aria-hidden="true" />
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

function heatmapClass(intensity: number): string {
  if (intensity === 0) {
    return "bg-slate-50 text-slate-600 dark:bg-nord-2 dark:text-nord-4";
  }
  if (intensity <= 0.25) {
    return "bg-blue-100 text-slate-700 dark:bg-nord-3 dark:text-nord-6";
  }
  if (intensity <= 0.55) {
    return "bg-blue-300 text-slate-900 dark:bg-nord-8 dark:text-nord-0";
  }
  return "bg-blue-700 text-white dark:bg-nord-9 dark:text-nord-0";
}
