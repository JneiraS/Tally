/**
 * Types TypeScript pour l'application ProTab (Scope Monitoring)
 * Dérivés des contrats de l'API REST FastAPI.
 */

export interface DailyActivity {
  day: string; // Format strict "YYYY-MM-DD"
  errors_reported: number; // Entier >= 0
  incidents_created: number; // Entier >= 0, <= errors_reported
  feai: string[]; // Liste de références au format "INC" + 7 chiffres (ex: INC0000001), sans doublon
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
