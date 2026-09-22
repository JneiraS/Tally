/**
 * Types TypeScript pour l'application ProTab (Scope Monitoring)
 * Dérivés des contrats de l'API REST FastAPI.
 */

export interface DailyActivity {
  day: string; // Format strict "YYYY-MM-DD"
  errors_reported: number; // Entier >= 0
  incidents_created: number; // Entier >= 0, <= errors_reported
  feai: string[]; // Liste de références au format "INC" + 9 chiffres (ex: INC000000001), sans doublon
  handled: boolean; // Statut traité
  completed: boolean; // Statut complété (completed => handled)
}

export interface ScopeMonitoring {
  id: string; // UUID v4
  name: string;
  knowledge_base_id: string; // Doit contenir au moins 10 caractères
  official_main: string;
  official_backup: string;
  daily_activities: DailyActivity[];
}

export interface NonWorkingDays {
  excluded_weekdays: number[];
  excluded_dates: string[];
}

export interface CreateScopeInput {
  name: string;
  knowledge_base_id: string;
  official_main: string;
  official_backup: string;
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

export type AuditAction =
  | "scope_created"
  | "scope_imported"
  | "activity_created"
  | "activity_updated"
  | "activity_completed";

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
  scope_id?: string;
  actor?: string;
  action?: AuditAction;
  from_date?: string;
  to_date?: string;
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
