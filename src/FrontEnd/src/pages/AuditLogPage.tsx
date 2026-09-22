import { Fragment, useEffect, useState } from "react";
import {
  History,
  Search,
  RefreshCw,
  AlertCircle,
  UserRound,
  FileText,
  CheckCircle2,
  Pencil,
  Plus,
  UploadCloud,
} from "lucide-react";
import { AuditAction, AuditEvent } from "../types";
import { protabApi, ApiError } from "../services/api";
import { formatDateFr } from "../utils/date";
import { useToast } from "../hooks/useToast";

const ACTION_LABELS: Record<AuditAction, string> = {
  scope_created: "Création de périmètre",
  scope_imported: "Import CSV",
  activity_created: "Saisie d'activité",
  activity_updated: "Modification d'activité",
  activity_completed: "Validation d'activité",
};

const ACTION_ICONS: Record<AuditAction, typeof Plus> = {
  scope_created: Plus,
  scope_imported: UploadCloud,
  activity_created: FileText,
  activity_updated: Pencil,
  activity_completed: CheckCircle2,
};

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

export function AuditLogPage() {
  const { error: toastError } = useToast();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scopeFilter, setScopeFilter] = useState("");
  const [actorFilter, setActorFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchEvents = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await protabApi.getAuditLog({
        scope_id: scopeFilter || undefined,
        actor: actorFilter || undefined,
        action: (actionFilter as AuditAction) || undefined,
        limit: 500,
      });
      setEvents(data);
    } catch (err: unknown) {
      const msg =
        err instanceof ApiError
          ? err.message
          : (err as Error)?.message ||
            "Erreur lors du chargement de l'historique.";
      setErrorMessage(msg);
      toastError("Erreur de chargement", msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [scopeFilter, actorFilter, actionFilter]);

  return (
    <div className="space-y-6">
      {/* En-tête de page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-nord-6 flex items-center gap-2.5">
            <History className="w-6 h-6 text-blue-600 dark:text-nord-9" />
            Historique des modifications
          </h1>
          <p className="text-sm text-slate-500 dark:text-nord-4 mt-1">
            Journal d'audit : qui a modifié quoi, et quand
          </p>
        </div>

        <button
          type="button"
          onClick={fetchEvents}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-nord-5 bg-white dark:bg-nord-1 hover:bg-slate-50 dark:hover:bg-nord-2 border border-slate-300 dark:border-nord-2 rounded-lg shadow-2xs transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-nord-8"
          title="Rafraîchir l'historique"
        >
          <RefreshCw
            className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-600 dark:text-nord-8" : ""}`}
          />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Barre de filtres */}
      <div className="bg-white dark:bg-nord-1 p-3.5 rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 dark:text-nord-3 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filtrer par périmètre (scope_id)..."
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 dark:bg-nord-0 border border-slate-200 dark:border-nord-2 text-slate-900 dark:text-nord-5 placeholder:text-slate-400 dark:placeholder:text-nord-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-nord-8 focus:bg-white dark:focus:bg-nord-0 transition-colors"
          />
        </div>
        <div className="relative flex-1">
          <UserRound className="w-4 h-4 text-slate-400 dark:text-nord-3 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filtrer par acteur (quadrigramme)..."
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 dark:bg-nord-0 border border-slate-200 dark:border-nord-2 text-slate-900 dark:text-nord-5 placeholder:text-slate-400 dark:placeholder:text-nord-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-nord-8 focus:bg-white dark:focus:bg-nord-0 transition-colors"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-1.5 text-sm bg-slate-50 dark:bg-nord-0 border border-slate-200 dark:border-nord-2 text-slate-900 dark:text-nord-5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-nord-8 transition-colors"
        >
          <option value="">Toutes les actions</option>
          {Object.entries(ACTION_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* État d'erreur */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-nord-11/15 border border-rose-200 dark:border-nord-11/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-nord-11 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-rose-900 dark:text-nord-11">
              Échec du chargement de l'API
            </h3>
            <p className="text-xs text-rose-700 dark:text-nord-4 mt-0.5">
              {errorMessage}
            </p>
            <button
              type="button"
              onClick={fetchEvents}
              className="mt-2 text-xs font-semibold text-rose-800 dark:text-nord-11 hover:underline"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      {/* État de chargement */}
      {isLoading ? (
        <div className="bg-white dark:bg-nord-1 rounded-xl border border-slate-200 dark:border-nord-2 p-12 text-center shadow-2xs">
          <div className="w-8 h-8 border-3 border-blue-600 dark:border-nord-8 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-700 dark:text-nord-5">
            Chargement de l'historique en cours...
          </p>
          <p className="text-xs text-slate-400 dark:text-nord-3 mt-1">
            Interrogation de GET /audit-log
          </p>
        </div>
      ) : events.length === 0 ? (
        /* État vide */
        <div className="bg-white dark:bg-nord-1 rounded-xl border border-slate-200 dark:border-nord-2 p-12 text-center shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-nord-0 text-blue-600 dark:text-nord-8 flex items-center justify-center mx-auto">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 dark:text-nord-6">
            Aucun événement d'audit
          </h3>
          <p className="text-xs text-slate-500 dark:text-nord-4 max-w-sm mx-auto">
            Aucune modification enregistrée pour le moment. Essayer d'élargir
            les filtres ou consultez à nouveau plus tard.
          </p>
        </div>
      ) : (
        /* Tableau des événements */
        <div className="bg-white dark:bg-nord-1 rounded-xl border border-slate-200 dark:border-nord-2 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-nord-5">
              <thead className="bg-slate-50/80 dark:bg-nord-0/60 border-b border-slate-200 dark:border-nord-2 text-xs font-semibold text-slate-700 dark:text-nord-4 uppercase tracking-wider">
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
                      <tr className="hover:bg-slate-50/70 dark:hover:bg-nord-2/50 transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-nord-4 font-mono">
                          {formatCreatedAt(event.created_at)}
                          {event.day ? (
                            <span className="block mt-0.5">
                              Jour : {formatDateFr(event.day)}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 font-mono font-medium text-slate-800 dark:text-nord-5">
                            <UserRound className="w-3.5 h-3.5 text-slate-400 dark:text-nord-3" />
                            {event.actor ?? "Système"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 text-slate-800 dark:text-nord-5">
                            <ActionIcon className="w-4 h-4 text-blue-600 dark:text-nord-9" />
                            {ACTION_LABELS[event.action]}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-mono text-slate-500 dark:text-nord-4">
                            {event.scope_name ?? event.scope_id ?? "—"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          {event.changes &&
                          Object.keys(event.changes).length > 0 ? (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedId(isExpanded ? null : event.id)
                              }
                              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-nord-8 hover:text-blue-800 dark:hover:text-nord-7 transition-colors"
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
                        <tr className="border-t border-slate-100 dark:border-nord-2 bg-slate-50/50 dark:bg-nord-0/40">
                          <td colSpan={5} className="px-5 py-4">
                            <div className="space-y-2">
                              {Object.entries(changes).map(([field, diff]) => (
                                <div
                                  key={field}
                                  className="text-xs grid grid-cols-1 sm:grid-cols-[180px_1fr_auto_1fr] gap-x-3 gap-y-1 items-center"
                                >
                                  <span className="font-mono font-semibold text-slate-700 dark:text-nord-5">
                                    {field}
                                  </span>
                                  <span className="line-through text-rose-600 dark:text-nord-11">
                                    {formatValue(diff.old)}
                                  </span>
                                  <span className="hidden sm:inline text-slate-400 dark:text-nord-3">
                                    →
                                  </span>
                                  <span className="text-emerald-700 dark:text-nord-14">
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

          <div className="px-5 py-3 border-t border-slate-100 dark:border-nord-2 bg-slate-50/50 dark:bg-nord-0/40 text-xs text-slate-500 dark:text-nord-4 flex items-center justify-between">
            <span>
              Affichage de {events.length} événement(s) sur les 500 plus récents
            </span>
            <span className="font-mono text-[11px] text-slate-500 dark:text-nord-3">
              GET /audit-log
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
