/**
 * Service API centralisé pour ProTab
 * Gère les appels fetch vers l'API REST FastAPI, les statuts HTTP et les erreurs typées.
 */

import {
  AuditEvent,
  AuditLogQuery,
  CreateActivityInput,
  CreateScopeInput,
  CreateScopeResponse,
  DailyActivity,
  FastApiErrorResponse,
  FastApiValidationErrorItem,
  ImportCsvResponse,
  NonWorkingDays,
  ScopeMonitoring,
  SetActivitiesStatusInput,
  UpdateActivityInput,
  UpdateScopeNoteInput,
  UpdateScopeOfficialsInput,
  UpdateScopeScheduleInput,
} from "../types";
import { AUDIT_LOG_PATH } from "../constants/routes";

/**
 * Erreur personnalisée pour les retours API non réussis
 */
export class ApiError extends Error {
  public status: number;
  public details?: string | FastApiValidationErrorItem[];

  constructor(
    status: number,
    message: string,
    details?: string | FastApiValidationErrorItem[],
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

// Configuration de l'URL de base
// Par défaut utilise le proxy Vite (/scope-monitorings) ou l'URL spécifiée via variable d'environnement
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

/** Notified when the API rejects a call for lack of a valid session. */
type UnauthorizedHandler = (() => void) | null;

let unauthorizedHandler: UnauthorizedHandler = null;

/**
 * Register the callback invoked when the session is lost.
 *
 * A 401 is a dead end for the caller: retrying cannot succeed, so the app must
 * fall back to the login screen instead of showing a generic API failure.
 * `POST /auth/login` is excluded, since a 401 there means a wrong password and
 * must remain a form error.
 */
function notifyUnauthorized(endpoint: string): void {
  if (endpoint.startsWith("/auth/login")) {
    return;
  }
  unauthorizedHandler?.();
}

export interface Project {
  id: string;
  name: string;
  non_working_days: NonWorkingDays;
}

export interface AuthSession {
  project: Project;
  quadrigramme: string;
  /**
   * Rôle administrateur du projet courant, tel que le serveur l'émet dans
   * `/auth/me` et `/auth/login` (`is_admin`, calculé contre `project_admins`
   * à chaque réponse). Jamais déduit côté client : une révocation via la CLI
   * est effective au prochain appel.
   */
  is_admin: boolean;
}

/**
 * Traduit et formate les erreurs FastAPI (dont 422) en français clair
 */
function parseFastApiErrorMessage(
  status: number,
  data: FastApiErrorResponse | null,
  defaultMsg: string,
): string {
  if (!data) return defaultMsg;

  if (typeof data.detail === "string") {
    return data.detail;
  }

  if (Array.isArray(data.detail) && data.detail.length > 0) {
    const errorMessages = data.detail.map((err) => {
      const field = err.loc
        ? err.loc.filter((part) => part !== "body").join(".")
        : "champ";
      let msg = err.msg || "Valeur invalide";
      if (msg.includes("field required")) msg = "Ce champ est obligatoire";
      if (msg.includes("greater than")) msg = "La valeur doit être plus grande";
      return `${field ? `[${field}] ` : ""}${msg}`;
    });
    return errorMessages.join(" — ");
  }

  switch (status) {
    case 400:
      return "Données invalides ou règle métier violée.";
    case 404:
      return "Périmètre ou ressource demandée introuvable.";
    case 409:
      return "Conflit : cette ressource ou cette date existe déjà.";
    case 422:
      return "Erreur de validation des données envoyées.";
    case 500:
      return "Erreur interne du serveur backend.";
    default:
      return defaultMsg;
  }
}

/**
 * Envoie une requête fetch typée avec gestion des erreurs
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers,
    });

    // Cas 204 No Content
    if (response.status === 204) {
      return undefined as unknown as T;
    }

    let data: unknown = null;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = { detail: text };
      }
    }

    if (!response.ok) {
      if (response.status === 401) {
        notifyUnauthorized(endpoint);
      }
      const errorDetail = data as FastApiErrorResponse;
      const message = parseFastApiErrorMessage(
        response.status,
        errorDetail,
        `Erreur serveur (${response.status})`,
      );
      throw new ApiError(response.status, message, errorDetail?.detail);
    }

    return data as T;
  } catch (err: unknown) {
    // Si c'est déjà une ApiError, on la propage
    if (err instanceof ApiError) {
      throw err;
    }

    // Erreur réseau (backend non démarré, CORS, etc.)
    const isNetworkError =
      err instanceof TypeError &&
      (err.message.includes("Failed to fetch") ||
        err.message.includes("NetworkError") ||
        err.message.includes("fetch"));

    if (isNetworkError) {
      throw new ApiError(
        0,
        "Impossible de joindre le backend FastAPI (http://localhost:8000). Vérifiez que le serveur est lancé (make run).",
      );
    }

    throw new ApiError(
      500,
      (err as Error)?.message || "Une erreur inattendue est survenue.",
    );
  }
}

/**
 * Client API ProTab
 */
export const protabApi = {
  /**
   * Enregistre le callback appelé quand la session est perdue (401).
   * Passer `null` pour le désactiver.
   */
  setUnauthorizedHandler(handler: UnauthorizedHandler): void {
    unauthorizedHandler = handler;
  },

  /**
   * Vérifie la disponibilité du backend FastAPI
   */
  async checkBackendHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/healthz`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async listProjects(): Promise<Project[]> {
    return request<Project[]>("/projects");
  },

  async login(
    projectId: string,
    quadrigramme: string,
    password: string,
  ): Promise<AuthSession> {
    return request<AuthSession>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ project_id: projectId, quadrigramme, password }),
    });
  },

  async getSession(): Promise<AuthSession> {
    return request<AuthSession>("/auth/me");
  },

  async updateProjectSettings(settings: NonWorkingDays): Promise<Project> {
    return request<Project>("/project/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  },

  async logout(): Promise<void> {
    await request<void>("/auth/logout", { method: "POST" });
  },

  /**
   * GET /scope-monitorings
   * Liste tous les périmètres avec leurs activités quotidiennes
   */
  async getScopeMonitorings(): Promise<ScopeMonitoring[]> {
    return request<ScopeMonitoring[]>("/scope-monitorings");
  },

  /**
   * GET /scope-monitorings/{id}
   * Récupère le détail d'un périmètre
   */
  async getScopeMonitoring(id: string): Promise<ScopeMonitoring> {
    return request<ScopeMonitoring>(`/scope-monitorings/${id}`);
  },

  /**
   * POST /scope-monitorings
   * Crée un ou plusieurs périmètres
   * Corps: [{ name, knowledge_base_id, official_main, official_backup }]
   * Réponse 201: { ids: [uuid...] }
   */
  async createScopeMonitorings(
    payload: CreateScopeInput[],
  ): Promise<CreateScopeResponse> {
    return request<CreateScopeResponse>("/scope-monitorings", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * POST /scope-monitorings/import-csv
   * Importation de périmètres par fichier CSV
   * multipart, champ csv_file
   * Réponse 201: { ids: [uuid...] }
   */
  async importCsv(file: File): Promise<ImportCsvResponse> {
    const formData = new FormData();
    formData.append("csv_file", file);

    return request<ImportCsvResponse>("/scope-monitorings/import-csv", {
      method: "POST",
      body: formData,
    });
  },

  /**
   * POST /scope-monitorings/{id}/activities
   * Crée une activité pour un jour donné
   * Réponse 201
   */
  async createActivity(
    scopeId: string,
    payload: CreateActivityInput,
  ): Promise<void> {
    await request<void>(`/scope-monitorings/${scopeId}/activities`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * GET /scope-monitorings/{id}/activities/{day}
   * Récupère le détail d'une activité pour un jour précis
   */
  async getActivity(scopeId: string, day: string): Promise<DailyActivity> {
    return request<DailyActivity>(
      `/scope-monitorings/${scopeId}/activities/${day}`,
    );
  },

  /**
   * PATCH /scope-monitorings/{id}/activities/{day}
   * Met à jour les erreurs, incidents et références FEAI d'un jour
   * Réponse 204
   */
  async updateActivity(
    scopeId: string,
    day: string,
    payload: UpdateActivityInput,
  ): Promise<void> {
    await request<void>(`/scope-monitorings/${scopeId}/activities/${day}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /**
   * PATCH /scope-monitorings/{id}/activities/status
   * Fixe le statut d'une ou plusieurs journées d'un coup.
   * Corps: { days: ["YYYY-MM-DD", ...], status: "completed" | "ko" | "pending", ko_reason?: string }
   * Réponse 204
   *
   * Une seule route pour les trois états : c'est ce qui garantit qu'aucun
   * appelant ne peut combiner un statut et un motif incohérents, et qu'ajouter
   * un état plus tard n'exige pas une seconde route.
   */
  async setActivitiesStatus(
    scopeId: string,
    payload: SetActivitiesStatusInput,
  ): Promise<void> {
    await request<void>(`/scope-monitorings/${scopeId}/activities/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /**
   * PATCH /scope-monitorings/{id}
   * Remplace la note libre du périmètre. `null` efface la note.
   * Réponse 204
   *
   * La note est le seul champ que cette route modifie : le détail est renvoyé
   * par le même GET que la liste, donc le parent ne recharge rien.
   */
  async updateScopeNote(scopeId: string, payload: UpdateScopeNoteInput): Promise<void> {
    await request<void>(`/scope-monitorings/${scopeId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /**
   * PATCH /scope-monitorings/{id}/officials
   * Remplace responsable principal et suppléant. Réservé aux administrateurs
   * du projet : le serveur répond 403 sinon.
   * Réponse 204
   *
   * Route dédiée plutôt qu'un champ de plus sur le PATCH de la note : le sens
   * du 403 reste sans ambiguïté, et une note tolère un champ qui change de
   * sujet sans changer d'autorisation.
   */
  async updateScopeOfficials(
    scopeId: string,
    payload: UpdateScopeOfficialsInput,
  ): Promise<void> {
    await request<void>(`/scope-monitorings/${scopeId}/officials`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /**
   * PATCH /scope-monitorings/{id}/schedule
   * Remplace la périodicité du périmètre. Ouvert à tout utilisateur connecté,
   * comme la note — à la différence des responsables, réservés aux
   * administrateurs. Une cadence qui ne tomberait jamais un jour ouvré du
   * projet est refusée en 422.
   * Réponse 204
   */
  async updateScopeSchedule(
    scopeId: string,
    payload: UpdateScopeScheduleInput,
  ): Promise<void> {
    await request<void>(`/scope-monitorings/${scopeId}/schedule`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /**
   * GET /api/audit-log
   * Liste les événements du journal d'audit, du plus récent au plus ancien.
   *
   * Paramètres filtres optionnels : `scope_ids` (répété, une occurrence par
   * périmètre), `actor` (préfixe insensible à la casse), `action`,
   * `from_created_at` / `to_created_at` (bornes inclusives/exclusives sur
   * `created_at`) et `limit`.
   */
  async getAuditLog(params: AuditLogQuery = {}): Promise<AuditEvent[]> {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      // The plural field name is front-end vocabulary; the wire keeps the
      // singular REST parameter, repeated once per scope.
      const wireKey = key === "scope_ids" ? "scope_id" : key;
      // Repeated, not joined: a comma-separated list would be read as a single
      // id by the server and silently match nothing.
      if (Array.isArray(value)) {
        value.forEach((item) => qs.append(wireKey, String(item)));
        return;
      }
      qs.set(wireKey, String(value));
    });
    const query = qs.toString();
    return request<AuditEvent[]>(
      `${AUDIT_LOG_PATH}${query ? `?${query}` : ""}`,
    );
  },
};
