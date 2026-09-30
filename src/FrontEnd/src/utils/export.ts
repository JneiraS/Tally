import { ScopeMonitoring } from "../types";

export type ExportFormat = "csv" | "json";
export type CsvSeparator = "," | ";";

export interface ExportRow {
  perimetre: string;
  kb_id: string;
  responsable_principal: string;
  responsable_suppleant: string;
  date: string;
  erreurs: number;
  incidents: number;
  references_feai: string;
  traite: "Oui" | "Non";
  termine: "Oui" | "Non";
  // Ajoutée en fin de ligne : les colonnes existantes ne se décalent pas, donc
  // les tableurs et formules déjà configurés sur un export continuent de viser
  // les bonnes lettres.
  code_facturation: string;
}

const HEADERS: { key: keyof ExportRow; label: string }[] = [
  { key: "perimetre", label: "Périmètre" },
  { key: "kb_id", label: "KB" },
  { key: "responsable_principal", label: "Responsable principal" },
  { key: "responsable_suppleant", label: "Responsable suppléant" },
  { key: "date", label: "Date" },
  { key: "erreurs", label: "Erreurs" },
  { key: "incidents", label: "Incidents" },
  { key: "references_feai", label: "Références FEAI" },
  { key: "traite", label: "Traité" },
  { key: "termine", label: "Terminé" },
  { key: "code_facturation", label: "Code de facturation" },
];

/**
 * Construit les lignes d'export à partir des périmètres et de la plage de dates.
 * N'inclut que les activités enregistrées (aucun jour sans saisie).
 */
export function buildExportRows(
  scopes: ScopeMonitoring[],
  from: string,
  to: string,
): ExportRow[] {
  const rows: ExportRow[] = [];

  for (const scope of scopes) {
    for (const activity of scope.daily_activities || []) {
      if (activity.day < from || activity.day > to) continue;
      rows.push({
        perimetre: scope.name,
        kb_id: scope.knowledge_base_id,
        responsable_principal: scope.official_main,
        responsable_suppleant: scope.official_backup,
        date: activity.day,
        erreurs: activity.errors_reported,
        incidents: activity.incidents_created,
        references_feai: activity.feai.join(" | "),
        traite: activity.handled ? "Oui" : "Non",
        termine: activity.completed ? "Oui" : "Non",
        code_facturation: scope.billing_code ?? "",
      });
    }
  }

  // Tri déterministe : date croissante, puis nom de périmètre, puis KB.
  rows.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.perimetre !== b.perimetre) return a.perimetre.localeCompare(b.perimetre);
    return a.kb_id.localeCompare(b.kb_id);
  });

  return rows;
}

/**
 * Sérialise les lignes d'export au format CSV.
 * Prépare un BOM UTF-8 pour faciliter l'ouverture dans Excel et échappe
 * les champs contenant séparateur, guillemets ou saut de ligne.
 */
export function toCsv(rows: ExportRow[], separator: CsvSeparator = ";"): string {
  const escape = (value: string): string => {
    const needsQuotes =
      value.includes(separator) ||
      value.includes('"') ||
      value.includes("\n") ||
      value.includes("\r");
    return needsQuotes ? `"${value.replace(/"/g, '""')}"` : value;
  };

  const header = HEADERS.map((h) => escape(h.label)).join(separator);
  const body = rows.map((row) =>
    HEADERS.map((h) => escape(String(row[h.key]))).join(separator),
  );
  return "\uFEFF" + [header, ...body].join("\n");
}

/**
 * Sérialise les lignes d'export au format JSON (format lisible).
 */
export function toJson(rows: ExportRow[]): string {
  return JSON.stringify(rows, null, 2);
}

/**
 * Déclenche le téléchargement d'un fichier généré côté client.
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Construit le nom de fichier d'export.
 */
export function exportFilename(
  from: string,
  to: string,
  format: ExportFormat,
): string {
  return `supervision_${from}_${to}.${format}`;
}