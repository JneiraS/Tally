/**
 * Types TypeScript pour l'application ProTab (Scope Monitoring)
 * Dérivés des contrats de l'API REST FastAPI.
 */

import type { IsoWeekday } from "../constants/nonWorkingDays";

export type { IsoWeekday };

export interface DailyActivity {
  day: string; // Format strict "YYYY-MM-DD"
  errors_reported: number; // Entier >= 0
  incidents_created: number; // Entier >= 0, <= errors_reported
  feai: string[]; // Références canoniques "[PREFIXE-]INC" + 9 chiffres (ex: FE-INC000000001), sans doublon
  handled: boolean; // Statut traité
  completed: boolean; // Statut complété (completed => handled)
}

export interface ScopeMonitoring {
  id: string; // UUID v4
  name: string;
  knowledge_base_id: string; // Doit contenir au moins 9 caractères
  official_main: string;
  official_backup: string;
  // Obligatoire à la création, mais null sur les périmètres enregistrés avant
  // son introduction : le backend ne réécrit pas l'historique.
  billing_code: string | null;
  // Note libre, éditable depuis la page de détail uniquement. `null` est le
  // seul état absent : une note vidée est enregistrée comme `null`, jamais "".
  note: string | null;
  daily_activities: DailyActivity[];
}

export interface NonWorkingDays {
  /** Jours ISO (1 = lundi … 7 = dimanche), pas des index JS. */
  excluded_weekdays: IsoWeekday[];
  excluded_dates: string[]; // Dates ISO strictes "YYYY-MM-DD"
}

export interface CreateScopeInput {
  name: string;
  knowledge_base_id: string;
  official_main: string;
  official_backup: string;
  billing_code: string;
}

export interface CreateScopeResponse {
  ids: string[];
}

export interface ImportCsvResponse {
  ids: string[];
}

export interface CreateActivityInput {
  day: string; // "YYYY-MM-DD"
  errors_reported: number;
  incidents_created: number;
  feai: string[];
}

export interface UpdateActivityInput {
  errors_reported: number;
  incidents_created: number;
  feai: string[];
}

export interface CompleteActivitiesInput {
  days: string[];
}

export interface UpdateScopeNoteInput {
  note: string | null;
}

export type AuditAction =
  | "scope_created"
  | "scope_imported"
  | "activity_created"
  | "activity_updated"
  | "activity_completed"
  | "scope_note_updated";

export interface AuditEvent {
  id: string; // UUID v4
  actor: string | null; // Quadrigramme de l'utilisateur
  action: AuditAction;
  scope_id: string | null; // Périmètre concerné
  scope_name: string | null; // Nom du périmètre concerné (si connu)
  day: string | null; // "YYYY-MM-DD" associé si pertinent
  created_at: string; // Horodatage ISO 8601 de l'événement
  changes: Record<string, { old: unknown; new: unknown }> | null; // Diff avant/après
}

export interface AuditLogQuery {
  /** Sent as a repeated `scope_id`; an empty array means "no filter". */
  scope_ids?: string[];
  /** Case-insensitive prefix of the actor code, not an exact match. */
  actor?: string;
  action?: AuditAction;
  /** Inclusive lower bound on `created_at`, as an ISO instant. */
  from_created_at?: string;
  /** Exclusive upper bound on `created_at`, as an ISO instant. */
  to_created_at?: string;
  limit?: number;
}

/**
 * Erreurs standard FastAPI (Shape Pydantic)
 */
export interface FastApiValidationErrorItem {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface FastApiErrorResponse {
  detail?: string | FastApiValidationErrorItem[];
}
