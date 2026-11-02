import { useId, useMemo } from "react";
import { Link } from "react-router-dom";
import { buildErrorHeatmap, weekLabel, isoWeekKey } from "../utils/analytics";
import type {
  ErrorHeatmapCell,
  ErrorHeatmapRow,
  Granularity,
} from "../utils/analytics";
import { DEFAULT_NON_WORKING_DAYS } from "../constants/nonWorkingDays";
import type { NonWorkingDays, ScopeMonitoring } from "../types";
import { formatDateFr } from "../utils/date";
import { BillingCodeBadge } from "./BillingCodeBadge";
import { CARD_CLASS, CARD_PADDING_CLASS, CARD_TITLE_CLASS, CARD_SUBTITLE_CLASS, HEATMAP_SCALE } from "../constants/ui";

const MAX_VISIBLE_COLUMN_LABELS = 12;
const RANKING_LIMIT = 15;

function getHeatmapStep(intensity: number) {
  return HEATMAP_SCALE.find((step) => intensity <= step.max) ?? HEATMAP_SCALE[HEATMAP_SCALE.length - 1];
}

interface AnalyticsErrorHeatmapProps {
  scopes: ScopeMonitoring[];
  days: string[];
  granularity?: Granularity;
  /** Calendrier du projet : une périodicité ne peut que le restreindre. */
  nonWorkingDays?: NonWorkingDays;
}

export function AnalyticsErrorHeatmap({
  scopes,
  days,
  granularity = "semaine",
  nonWorkingDays = DEFAULT_NON_WORKING_DAYS,
}: AnalyticsErrorHeatmapProps) {
  const titleId = useId();
  const heatmap = useMemo(
    () => buildErrorHeatmap(scopes, days, granularity, nonWorkingDays),
    [scopes, days, granularity, nonWorkingDays],
  );
  const perColumn = granularity === "jour" ? "jour" : "semaine";

  return (
    <section
      aria-labelledby={titleId}
      className={`${CARD_CLASS} ${CARD_PADDING_CLASS}`}
    >
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 id={titleId} className={CARD_TITLE_CLASS}>
          Erreurs par {perColumn} et par périmètre
        </h3>
        <p className={CARD_SUBTITLE_CLASS}>
          Volume total d'erreurs · {perColumn}s ISO · — : aucune saisie · case
          pâle : non attendu
        </p>
      </div>

      {heatmap.columns.length === 0 || heatmap.rows.length === 0 ? (
        <p className="p-8 text-center text-sm text-slate-500 dark:text-nord-4">
          Aucune {perColumn} ou aucun périmètre sur la période.
        </p>
      ) : (
        <>
          <ErrorMatrix heatmap={heatmap} />
          <HeatmapLegend />
          <ErrorRanking rows={heatmap.rows} />
        </>
      )}
    </section>
  );
}

function ErrorMatrix({
  heatmap,
}: {
  heatmap: ReturnType<typeof buildErrorHeatmap>;
}) {
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
          className="grid gap-px rounded-[3px]"
          style={{
            gridTemplateColumns: `minmax(7rem, 1.5fr) repeat(${heatmap.columns.length}, minmax(2rem, 1fr))`,
          }}
        >
          <div className="sticky left-0 z-10 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:bg-nord-0 dark:text-nord-4">
            Périmètre
          </div>
          {heatmap.columns.map((column, index) => {
            const { full, short } = columnLabels(column, heatmap.granularity);
            const visible = index % labelStride === 0;
            const startsWeek =
              heatmap.granularity === "jour" &&
              index > 0 &&
              isoWeekKey(heatmap.columns[index - 1]) !== isoWeekKey(column);

            return (
              <div
                key={column}
                title={full}
                className={`bg-slate-50 px-1 py-2 text-center text-xs font-semibold uppercase tracking-wider text-slate-600 dark:bg-nord-0 dark:text-nord-4 ${startsWeek ? "border-l-2 border-slate-300 dark:border-nord-3" : ""}`}
              >
                {visible ? (
                  <span className="block truncate text-[10px] leading-tight">{short}</span>
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
        <span className="ml-auto shrink-0 tabular-nums text-xs text-slate-500 dark:text-nord-4" aria-hidden="true">
          Tot. {row.totalErrors}
        </span>
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
  // « non attendu » et « aucune saisie » s'affichent tous deux sans valeur, et
  // disent l'inverse l'un de l'autre : le premier ne manque à personne, le
  // second est un retard. La classe et le libellé portent la distinction, pas
  // seulement la couleur d'intensité.
  const value = !cell.attendu
    ? "non attendu"
    : cell.saisi
      ? `${cell.errors} erreur${cell.errors === 1 ? "" : "s"}`
      : "aucune saisie";
  const label = `${scopeName}, ${column} : ${value}, ${change}`;

  const step = getHeatmapStep(intensity);
  const tone = cell.attendu
    ? step.cell
    : "bg-slate-50 text-slate-300 dark:bg-nord-0 dark:text-nord-3";

  return (
    <div
      role="img"
      aria-label={label}
      title={label}
      className={`flex min-h-10 items-center justify-center border-l border-t border-slate-100 dark:border-nord-2 px-1 text-xs font-semibold tabular-nums ${tone}`}
    >
      {cell.attendu && cell.saisi ? cell.errors : "—"}
    </div>
  );
}

function HeatmapLegend() {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-nord-4">
      <span className="flex items-center gap-1.5">
        <span className="w-5 h-5 rounded border border-slate-200 dark:border-nord-2" aria-hidden="true" />
        <span>aucune saisie</span>
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-5 h-5 rounded bg-slate-50 border border-slate-200 dark:bg-nord-0 dark:border-nord-2" aria-hidden="true" />
        <span>non attendu</span>
      </span>
      <span className="flex items-center gap-1.5">
        <span className="flex items-center gap-1.5" aria-label="Intensité : faible">
          {HEATMAP_SCALE.slice(1).map((step, i) => (
            <span key={i} className={`w-5 h-5 rounded ${step.legend}`} aria-hidden="true" />
          ))}
        </span>
        <span>faible</span>
        <span className="mx-1" aria-hidden="true">▸</span>
        <span>élevée</span>
      </span>
    </div>
  );
}

function ErrorRanking({ rows }: { rows: ErrorHeatmapRow[] }) {
  const max = Math.max(...rows.map((row) => row.totalErrors), 1);
  const displayed = rows.slice(0, RANKING_LIMIT);
  const hasMore = rows.length > RANKING_LIMIT;

  return (
    <div className="mt-5 border-t border-slate-100 pt-4 dark:border-nord-2">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h4 className={CARD_TITLE_CLASS}>Périmètres les plus exposés</h4>
        <p className={CARD_SUBTITLE_CLASS}>Total d'erreurs sur la période</p>
      </div>
      <ol className="grid gap-x-6 gap-y-2 md:grid-cols-2">
        {displayed.map((row) => (
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
      {hasMore && (
        <p className="mt-3 text-xs text-slate-500 dark:text-nord-4">
          +{rows.length - RANKING_LIMIT} autres périmètres
        </p>
      )}
    </div>
  );
}