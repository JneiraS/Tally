import { useMemo, useState } from "react";
import { Download, AlertCircle } from "lucide-react";
import { Modal } from "./Modal";
import { ScopeMonitoring } from "../types";
import { addDaysIso, getTodayIsoDate, isValidIsoDate } from "../utils/date";
import {
  buildExportRows,
  downloadFile,
  exportFilename,
  toCsv,
  toJson,
  CsvSeparator,
  ExportFormat,
} from "../utils/export";
import { useToast } from "../hooks/useToast";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  scopes: ScopeMonitoring[];
  filteredScopes: ScopeMonitoring[];
  filteredCount: number;
}

type ScopeBase = "all" | "filtered";

export function ExportModal({
  isOpen,
  onClose,
  scopes,
  filteredScopes,
  filteredCount,
}: ExportModalProps) {
  const { success, error: toastError } = useToast();

  const today = getTodayIsoDate();
  const [from, setFrom] = useState(addDaysIso(today, -29));
  const [to, setTo] = useState(today);
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [separator, setSeparator] = useState<CsvSeparator>(";");
  const [scopeBase, setScopeBase] = useState<ScopeBase>("all");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const periodValid = useMemo(() => {
    return (
      isValidIsoDate(from) &&
      isValidIsoDate(to) &&
      from <= to &&
      to <= today
    );
  }, [from, to, today]);

  const baseScopes = useMemo(
    () => (scopeBase === "filtered" ? filteredScopes : scopes),
    [scopeBase, scopes, filteredScopes],
  );

  const rows = useMemo(() => buildExportRows(baseScopes, from, to), [
    baseScopes,
    from,
    to,
  ]);

  const scopeCount = scopeBase === "filtered" ? filteredCount : scopes.length;

  const handleExport = () => {
    setErrorMessage(null);
    if (!periodValid) {
      setErrorMessage(
        "La date de début doit être antérieure ou égale à la date de fin.",
      );
      return;
    }

    try {
      const filename = exportFilename(from, to, format);
      if (format === "csv") {
        downloadFile(toCsv(rows, separator), filename, "text/csv;charset=utf-8;");
      } else {
        downloadFile(toJson(rows), filename, "application/json;charset=utf-8;");
      }
      success(
        "Export réussi",
        `${rows.length} relevé(s) d'activité exporté(s) (${format.toUpperCase()}).`,
      );
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as Error)?.message || "Échec de la génération du fichier.";
      setErrorMessage(msg);
      toastError("Échec de l'export", msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Exporter les données"
      subtitle="Extraction des activités quotidiennes sur une plage de dates"
      maxWidth="md"
    >
      <div className="space-y-5">
        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 dark:bg-nord-11/15 border border-rose-200 dark:border-nord-11/30 text-rose-800 dark:text-nord-11 rounded-xl text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-nord-11 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Erreur d'export :</span>{" "}
              {errorMessage}
            </div>
          </div>
        )}

        {/* Période */}
        <div>
          <span className="block text-xs font-medium text-slate-500 dark:text-nord-4 uppercase tracking-wider mb-2">
            Période
          </span>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-700 dark:text-nord-5">
                Du
              </span>
              <input
                type="date"
                value={from}
                max={to || today}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-nord-0 border border-slate-200 dark:border-nord-2 text-slate-900 dark:text-nord-5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-nord-8 transition-colors"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-700 dark:text-nord-5">
                Au
              </span>
              <input
                type="date"
                value={to}
                min={from}
                max={today}
                onChange={(e) => setTo(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-nord-0 border border-slate-200 dark:border-nord-2 text-slate-900 dark:text-nord-5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-nord-8 transition-colors"
              />
            </label>
          </div>
          {!periodValid && (
            <p className="mt-1.5 text-xs text-rose-600 dark:text-nord-11">
              La date « Du » doit être antérieure ou égale à « Au », sans
              dépasser aujourd'hui.
            </p>
          )}
        </div>

        {/* Format */}
        <div>
          <span className="block text-xs font-medium text-slate-500 dark:text-nord-4 uppercase tracking-wider mb-2">
            Format du fichier
          </span>
          <div className="inline-flex gap-1.5" role="group" aria-label="Format d'export">
            {(["csv", "json"] as ExportFormat[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFormat(option)}
                aria-pressed={format === option}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-nord-8 ${
                  format === option
                    ? "bg-blue-600 dark:bg-nord-10 text-white shadow-xs"
                    : "bg-slate-50 dark:bg-nord-0 text-slate-600 dark:text-nord-4 hover:bg-slate-100 dark:hover:bg-nord-2 border border-slate-200 dark:border-nord-2"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Séparateur CSV */}
        {format === "csv" && (
          <div>
            <span className="block text-xs font-medium text-slate-500 dark:text-nord-4 uppercase tracking-wider mb-2">
              Séparateur CSV
            </span>
            <div className="inline-flex gap-1.5" role="group" aria-label="Séparateur CSV">
              {(
                [
                  { value: ";", label: "; (Excel)" },
                  { value: ",", label: ", (standard)" },
                ] as { value: CsvSeparator; label: string }[]
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSeparator(option.value)}
                  aria-pressed={separator === option.value}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-nord-8 ${
                    separator === option.value
                      ? "bg-blue-600 dark:bg-nord-10 text-white shadow-xs"
                      : "bg-slate-50 dark:bg-nord-0 text-slate-600 dark:text-nord-4 hover:bg-slate-100 dark:hover:bg-nord-2 border border-slate-200 dark:border-nord-2"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Portée */}
        <div>
          <span className="block text-xs font-medium text-slate-500 dark:text-nord-4 uppercase tracking-wider mb-2">
            Portée des données
          </span>
          <div className="inline-flex gap-1.5" role="group" aria-label="Portée de l'export">
            <button
              type="button"
              onClick={() => setScopeBase("all")}
              aria-pressed={scopeBase === "all"}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-nord-8 ${
                scopeBase === "all"
                  ? "bg-blue-600 dark:bg-nord-10 text-white shadow-xs"
                  : "bg-slate-50 dark:bg-nord-0 text-slate-600 dark:text-nord-4 hover:bg-slate-100 dark:hover:bg-nord-2 border border-slate-200 dark:border-nord-2"
              }`}
            >
              Tous ({scopes.length})
            </button>
            <button
              type="button"
              onClick={() => setScopeBase("filtered")}
              aria-pressed={scopeBase === "filtered"}
              disabled={filteredCount === 0}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-nord-8 disabled:opacity-50 disabled:cursor-not-allowed ${
                scopeBase === "filtered"
                  ? "bg-blue-600 dark:bg-nord-10 text-white shadow-xs"
                  : "bg-slate-50 dark:bg-nord-0 text-slate-600 dark:text-nord-4 hover:bg-slate-100 dark:hover:bg-nord-2 border border-slate-200 dark:border-nord-2"
              }`}
            >
              Filtrés ({filteredCount})
            </button>
          </div>
        </div>

        {/* Synthèse */}
        <div className="bg-slate-50 dark:bg-nord-0 rounded-xl p-3.5 border border-slate-200 dark:border-nord-2 text-xs text-slate-600 dark:text-nord-4">
          {rows.length} relevé(s) d'activité sur la période · {scopeCount}{" "}
          périmètre(s) • fichier :{" "}
          <code className="font-mono text-blue-700 dark:text-nord-8">
            {exportFilename(from, to, format)}
          </code>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-nord-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-nord-5 bg-slate-100 dark:bg-nord-2 hover:bg-slate-200 dark:hover:bg-nord-3 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={!periodValid}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-nord-10 dark:hover:bg-nord-9 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>
      </div>
    </Modal>
  );
}