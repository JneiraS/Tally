/**
 * Types TypeScript pour l'application ProTab (Scope Monitoring)
 * Dérivés des contrats de l'API REST FastAPI.
 */

import type { DayStatus } from "../constants/dayStatus";
import type { IsoWeekday } from "../constants/nonWorkingDays";

export type { DayStatus, IsoWeekday };

export interface DailyActivity {
  day: string; // Format strict "YYYY-MM-DD"
  errors_reported: number; // Entier >= 0
  incidents_created: number; // Entier >= 0, <= errors_reported
  feai: string[]; // Références canoniques "[PREFIXE-]INC" + 9 chiffres (ex: FE-INC000000001), sans doublon
  // Un seul champ et non deux drapeaux : « terminée et KO » n'est pas un état
  // représentable, donc pas un état à désamorcer. Voir `constants/dayStatus.ts`.
  status: DayStatus;
  // Motif du blocage, présent uniquement sur un jour KO et `null` sinon. Une
  // journée terminée n'en porte pas : le motif survit dans le journal d'audit.
  ko_reason: string | null;
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
  // Périodicité du périmètre : sur quels jours ouvrés il est **attendu**. Elle
  // ne retire jamais le droit de saisir un autre jour ; elle décide seulement
  // du backlog et du dénominateur de la couverture.
  schedule: MonitoringSchedule;
  daily_activities: DailyActivity[];
}

/**
 * Périodicité d'un périmètre, telle que l'API la renvoie et l'accepte.
 *
 * `weekdays` vide = « tous les jours ouvrés du projet », le comportement de
 * tous les périmètres créés avant la périodicité — donc jamais « jamais dû ».
 *
 * `anchor_date` est une **référence de phase**, pas une date de début : le
 * rythme s'applique aussi aux jours antérieurs. Le serveur compte les semaines
 * depuis cette ancre et non depuis le numéro de semaine ISO, qu'une année à 53
 * semaines ferait changer de parité.
 */
export interface MonitoringSchedule {
  /** Jours ISO attendus (1 = lundi … 7 = dimanche), triés et sans doublon. */
  weekdays: IsoWeekday[];
  /** Une semaine sur `interval_weeks`. 1 = chaque semaine. */
  interval_weeks: number;
  /** Lundi de référence du cycle, "YYYY-MM-DD", ou `null` pour l'ancre fixe. */
  anchor_date: string | null;
}

export type UpdateScopeScheduleInput = MonitoringSchedule;

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
  /** Omis = « tous les jours ouvrés », comme un périmètre créé avant la périodicité. */
  schedule?: MonitoringSchedule;
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

export interface SetActivitiesStatusInput {
  days: string[];
  status: DayStatus;
  // Rejeté en 422 si le statut n'est pas « ko », et normalisé en `null` si le
  // motif est blanc : une seule façon de dire « pas de motif ».
  ko_reason?: string | null;
}

export interface UpdateScopeNoteInput {
  note: string | null;
}

export interface UpdateScopeOfficialsInput {
  official_main: string;
  official_backup: string;
}

export type AuditAction =
  | "scope_created"
  | "scope_imported"
  | "activity_created"
  | "activity_updated"
  | "activity_completed"
  | "activity_ko"
  | "scope_note_updated"
  | "scope_officials_updated"
  | "scope_schedule_updated";

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
