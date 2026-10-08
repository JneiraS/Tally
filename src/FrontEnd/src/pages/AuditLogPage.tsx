import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  History,
  RefreshCw,
  AlertCircle,
  UserRound,
} from "lucide-react";
import { AuditEvent, AuditLogQuery, ScopeMonitoring } from "../types";
import { protabApi, ApiError } from "../services/api";
import {
  formatDateFr,
  isoDateToLocalDayStart,
  isoDateToNextLocalDayStart,
} from "../utils/date";
import { useToast } from "../hooks/useToast";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { AuditActivityHeatmap } from "../components/AuditActivityHeatmap";
import {
  AuditLogFilterBar,
  EMPTY_FILTERS,
  activeFilterCount,
  type AuditLogFilters,
} from "../components/AuditLogFilterBar";
import { ACTION_ICONS, ACTION_LABELS } from "../constants/auditActions";
import { AUDIT_LOG_PATH } from "../constants/routes";

/**
 * The server refuses more than this, and there is no pagination: the page
 * therefore only ever holds the newest rows. The footer says so *only* when
 * the cap is actually reached, instead of claiming 500 events on a journal
 * holding three.
 */
const AUDIT_LOG_LIMIT = 500;

const ACTOR_DEBOUNCE_MS = 300;

function formatCreatedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) {
    if (value.length === 0) return "Aucun";
    return value.join(", ");
  }
  if (typeof value === "boolean") return value ? "oui" : "non";
  return String(value);
}

/**
 * Translate the calendar days into the instants the server filters on.
 *
 * The API takes a half-open window on `created_at`, so the upper bound is the
 * *next* day's local midnight rather than 23:59:59 of the selected day — a
 * bound that loses the last second, and one whose precision depends on the
 * database clock.
 */
function toQueryPeriod(filters: AuditLogFilters): {
  from_created_at?: string;
  to_created_at?: string;
} {
  const from = filters.fromDate ? isoDateToLocalDayStart(filters.fromDate) : "";
  const to = filters.toDate ? isoDateToNextLocalDayStart(filters.toDate) : "";
  return {
    from_created_at: from || undefined,
    to_created_at: to || undefined,
  };
}

export function AuditLogPage() {
  const { error: toastError } = useToast();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [scopes, setScopes] = useState<ScopeMonitoring[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filters, setFilters] = useState<AuditLogFilters>(EMPTY_FILTERS);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const debouncedActor = useDebouncedValue(
    filters.actor,
    ACTOR_DEBOUNCE_MS
  );

  /**
   * Only the newest request may write to state. Without this a slow response
   * for "AB" could land after the response for "ABCD" and leave the table
   * showing a result the filter no longer describes.
   */
  const requestIdRef = useRef(0);

  const patchFilters = useCallback((patch: Partial<AuditLogFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
  }, []);

  /**
   * The query the effect actually watches.
   *
   * It depends on the *debounced* actor, not on the filter object: typing
   * produces a new object identity on every keystroke, and an effect keyed on
   * that identity would fire once per keystroke — the debounce would be inert
   * while appearing to be in place. Discrete controls (dates, action, scopes)
   * keep firing immediately, and each field is listed by identity, so patching
   * the actor leaves the others untouched.
   */
  const query = useMemo<AuditLogQuery>(
    () => ({
      ...toQueryPeriod(filters),
      scope_ids: filters.scopeIds.length ? filters.scopeIds : undefined,
      actor: debouncedActor.trim() || undefined,
      action: filters.action || undefined,
      limit: AUDIT_LOG_LIMIT,
    }),
    [
      filters.fromDate,
      filters.toDate,
      filters.scopeIds,
      filters.action,
      debouncedActor,
    ]
  );

  const fetchEvents = useCallback(
    async (query: AuditLogQuery) => {
      const requestId = ++requestIdRef.current;
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const data = await protabApi.getAuditLog(query);
        if (requestId !== requestIdRef.current) return;
        setEvents(data);
      } catch (err: unknown) {
        if (requestId !== requestIdRef.current) return;
        const msg =
          err instanceof ApiError
            ? err.message
            : (err as Error)?.message ||
              "Erreur lors du chargement de l'historique.";
        setErrorMessage(msg);
        toastError("Erreur de chargement", msg);
      } finally {
        if (requestId === requestIdRef.current) setIsLoading(false);
      }
    },
    [toastError]
  );

  useEffect(() => {
    fetchEvents(query);
  }, [query, fetchEvents]);

  // The scope picker needs names, and the journal response carries only the
  // names of the scopes that matched. Deriving the list from the current
  // result would shrink it on every filter — selecting a scope would make
  // every other scope unreachable — so the full list is fetched once.
  const [scopesUnavailable, setScopesUnavailable] = useState(false);
  useEffect(() => {
    let cancelled = false;
    protabApi
      .getScopeMonitorings()
      .then((loaded) => {
        if (!cancelled) setScopes(loaded);
      })
      .catch(() => {
        // Reported rather than swallowed: a picker left empty reads as « this
        // project has no scopes », which is a lie — the other filters still
        // work and the journal is unrelated to the scope list.
        if (!cancelled) setScopesUnavailable(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const activeCount = activeFilterCount(filters);
  const truncated = events.length === AUDIT_LOG_LIMIT;

  return (
    <div className="space-y-6">
      {/* En-tête de page */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-nord-6">
            <History className="w-6 h-6 text-blue-600 dark:text-nord-9" />
            Historique des modifications
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-nord-4">
            Journal d&apos;audit : qui a modifié quoi, et quand
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchEvents(query)}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-nord-2 dark:bg-nord-1 dark:text-nord-5 dark:hover:bg-nord-2 dark:focus:ring-nord-8 sm:text-sm"
        >
          <RefreshCw
            className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-600 dark:text-nord-8" : ""}`}
            aria-hidden="true"
          />
          <span>Actualiser</span>
        </button>
      </div>

      <AuditLogFilterBar
        filters={filters}
        onChange={patchFilters}
        onReset={() => setFilters(EMPTY_FILTERS)}
        scopes={scopes}
        scopesUnavailable={scopesUnavailable}
      />

      {!isLoading && events.length > 0 && <AuditActivityHeatmap events={events} />}

      {/* État d'erreur */}
      {errorMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-nord-11/30 dark:bg-nord-11/15">
          <AlertCircle
            className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-nord-11"
            aria-hidden="true"
          />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-rose-900 dark:text-nord-11">
              Échec du chargement de l&apos;API
            </h3>
            <p className="mt-0.5 text-xs text-rose-700 dark:text-nord-4">
              {errorMessage}
            </p>
            <button
              type="button"
              onClick={() => fetchEvents(query)}
              className="mt-2 text-xs font-semibold text-rose-800 hover:underline dark:text-nord-11"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      {/* État de chargement */}
      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-2xs dark:border-nord-2 dark:bg-nord-1">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent dark:border-nord-8" />
          <p className="text-sm font-medium text-slate-700 dark:text-nord-5">
            Chargement de l&apos;historique en cours...
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-nord-3">
            Interrogation de GET {AUDIT_LOG_PATH}
          </p>
        </div>
      ) : events.length === 0 ? (
        /* État vide */
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-12 text-center shadow-2xs dark:border-nord-2 dark:bg-nord-1">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-nord-0 dark:text-nord-8">
            <History className="w-6 h-6" aria-hidden="true" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 dark:text-nord-6">
            {activeCount > 0
              ? "Aucun événement ne correspond à ces filtres"
              : "Aucun événement d'audit"}
          </h3>
          <p className="mx-auto max-w-sm text-xs text-slate-500 dark:text-nord-4">
            {activeCount > 0
              ? `${activeCount} filtre${activeCount === 1 ? "" : "s"} actif${activeCount === 1 ? "" : "s"}. Élargissez la période ou réinitialisez les filtres pour revoir l'historique complet.`
              : "Aucune modification enregistrée pour le moment. Essayez d'élargir les filtres ou consultez à nouveau plus tard."}
          </p>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="mt-1 inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-nord-3 dark:text-nord-4 dark:hover:bg-nord-2 dark:focus:ring-nord-8"
            >
              Réinitialiser les {activeCount} filtre
              {activeCount === 1 ? "" : "s"}
            </button>
          )}
        </div>
      ) : (
        /* Tableau des événements */
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-nord-2 dark:bg-nord-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-nord-5">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:border-nord-2 dark:bg-nord-0/60 dark:text-nord-4">
                <tr>
                  <th scope="col" className="px-5 py-3.5">
                    Date
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Acteur
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Action
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Périmètre
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-right">
                    Détail
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-nord-2">
                {events.map((event) => {
                  const ActionIcon = ACTION_ICONS[event.action];
                  const isExpanded = expandedId === event.id;
                  const changes =
                    event.changes && Object.keys(event.changes).length > 0
                      ? event.changes
                      : null;
                  return (
                    <Fragment key={event.id}>
                      <tr className="transition-colors hover:bg-slate-50/70 dark:hover:bg-nord-2/50">
                        <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-slate-500 dark:text-nord-4">
                          {formatCreatedAt(event.created_at)}
                          {event.day ? (
                            <span className="mt-0.5 block">
                              Jour : {formatDateFr(event.day)}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 font-mono font-medium text-slate-800 dark:text-nord-5">
                            <UserRound
                              className="h-3.5 w-3.5 text-slate-400 dark:text-nord-3"
                              aria-hidden="true"
                            />
                            {event.actor ?? "Système"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 text-slate-800 dark:text-nord-5">
                            <ActionIcon
                              className="h-4 w-4 text-blue-600 dark:text-nord-9"
                              aria-hidden="true"
                            />
                            {ACTION_LABELS[event.action]}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-mono text-xs text-slate-500 dark:text-nord-4">
                            {event.scope_name ?? event.scope_id ?? "—"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          {changes ? (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedId(isExpanded ? null : event.id)
                              }
                              className="inline-flex min-h-9 items-center gap-1 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-800 dark:text-nord-8 dark:hover:text-nord-7"
                            >
                              <span>
                                {isExpanded ? "Masquer" : "Voir le détail"}
                              </span>
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 dark:text-nord-3">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                      {isExpanded && changes && (
                        <tr className="border-t border-slate-100 bg-slate-50/50 dark:border-nord-2 dark:bg-nord-0/40">
                          <td colSpan={5} className="px-5 py-4">
                            <div className="space-y-2">
                              {Object.entries(changes).map(([field, diff]) => (
                                <div
                                  key={field}
                                  className="grid grid-cols-1 items-center gap-x-3 gap-y-1 text-xs sm:grid-cols-[180px_1fr_auto_1fr]"
                                >
                                  <span className="font-mono font-semibold text-slate-700 dark:text-nord-5">
                                    {field}
                                  </span>
                                  <span className="whitespace-pre-wrap break-words text-rose-600 line-through dark:text-nord-11">
                                    {formatValue(diff.old)}
                                  </span>
                                  <span className="hidden text-slate-400 dark:text-nord-3 sm:inline">
                                    →
                                  </span>
                                  <span className="whitespace-pre-wrap break-words text-emerald-700 dark:text-nord-14">
                                    {formatValue(diff.new)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs text-slate-500 dark:border-nord-2 dark:bg-nord-0/40 dark:text-nord-4">
            <span>
              Affichage de {events.length} événement{events.length === 1 ? "" : "s"}
              {truncated ? ` sur les ${AUDIT_LOG_LIMIT} plus récents` : ""}
              {activeCount > 0 ? ", filtres appliqués" : ""}
            </span>
            <span className="font-mono text-[11px] text-slate-500 dark:text-nord-3">
              GET {AUDIT_LOG_PATH}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}