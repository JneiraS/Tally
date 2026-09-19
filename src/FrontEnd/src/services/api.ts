/**
 * Service API centralisé pour ProTab
 * Gère les appels fetch vers l'API REST FastAPI, les statuts HTTP et les erreurs typées.
 */

import {
  CompleteActivitiesInput,
  CreateActivityInput,
  CreateScopeInput,
  CreateScopeResponse,
  DailyActivity,
  FastApiErrorResponse,
  FastApiValidationErrorItem,
  ImportCsvResponse,
  ScopeMonitoring,
  UpdateActivityInput,
} from '../types';

/**
 * Erreur personnalisée pour les retours API non réussis
 */
export class ApiError extends Error {
  public status: number;
  public details?: string | FastApiValidationErrorItem[];

  constructor(status: number, message: string, details?: string | FastApiValidationErrorItem[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

// Configuration de l'URL de base
// Par défaut utilise le proxy Vite (/scope-monitorings) ou l'URL spécifiée via variable d'environnement
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Traduit et formate les erreurs FastAPI (dont 422) en français clair
 */
function parseFastApiErrorMessage(status: number, data: FastApiErrorResponse | null, defaultMsg: string): string {
  if (!data) return defaultMsg;

  if (typeof data.detail === 'string') {
    return data.detail;
  }

  if (Array.isArray(data.detail) && data.detail.length > 0) {
    const errorMessages = data.detail.map((err) => {
      const field = err.loc ? err.loc.filter((part) => part !== 'body').join('.') : 'champ';
      let msg = err.msg || 'Valeur invalide';
      if (msg.includes('field required')) msg = 'Ce champ est obligatoire';
      if (msg.includes('greater than')) msg = 'La valeur doit être plus grande';
      return `${field ? `[${field}] ` : ''}${msg}`;
    });
    return errorMessages.join(' — ');
  }

  switch (status) {
    case 400:
      return 'Données invalides ou règle métier violée.';
    case 404:
      return 'Périmètre ou ressource demandée introuvable.';
    case 409:
      return 'Conflit : cette ressource ou cette date existe déjà.';
    case 422:
      return 'Erreur de validation des données envoyées.';
    case 500:
      return 'Erreur interne du serveur backend.';
    default:
      return defaultMsg;
  }
}

/**
 * Envoie une requête fetch typée avec gestion des erreurs
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Cas 204 No Content
    if (response.status === 204) {
      return undefined as unknown as T;
    }

    let data: unknown = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
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
      const errorDetail = data as FastApiErrorResponse;
      const message = parseFastApiErrorMessage(
        response.status,
        errorDetail,
        `Erreur serveur (${response.status})`
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
      (err.message.includes('Failed to fetch') ||
        err.message.includes('NetworkError') ||
        err.message.includes('fetch'));

    if (isNetworkError) {
      throw new ApiError(
        0,
        "Impossible de joindre le backend FastAPI (http://localhost:8000). Vérifiez que le serveur est lancé (make run)."
      );
    }

    throw new ApiError(500, (err as Error)?.message || 'Une erreur inattendue est survenue.');
  }
}

/**
 * Client API ProTab
 */
export const protabApi = {
  /**
   * Vérifie la disponibilité du backend FastAPI
   */
  async checkBackendHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/scope-monitorings`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * GET /scope-monitorings
   * Liste tous les périmètres avec leurs activités quotidiennes
   */
  async getScopeMonitorings(): Promise<ScopeMonitoring[]> {
    return request<ScopeMonitoring[]>('/scope-monitorings');
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
  async createScopeMonitorings(payload: CreateScopeInput[]): Promise<CreateScopeResponse> {
    return request<CreateScopeResponse>('/scope-monitorings', {
      method: 'POST',
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
    formData.append('csv_file', file);

    return request<ImportCsvResponse>('/scope-monitorings/import-csv', {
      method: 'POST',
      body: formData,
    });
  },

  /**
   * POST /scope-monitorings/{id}/activities
   * Crée une activité pour un jour donné
   * Réponse 201
   */
  async createActivity(scopeId: string, payload: CreateActivityInput): Promise<void> {
    await request<void>(`/scope-monitorings/${scopeId}/activities`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * GET /scope-monitorings/{id}/activities/{day}
   * Récupère le détail d'une activité pour un jour précis
   */
  async getActivity(scopeId: string, day: string): Promise<DailyActivity> {
    return request<DailyActivity>(`/scope-monitorings/${scopeId}/activities/${day}`);
  },

  /**
   * PATCH /scope-monitorings/{id}/activities/{day}
   * Met à jour les erreurs, incidents et références FEAI d'un jour
   * Réponse 204
   */
  async updateActivity(scopeId: string, day: string, payload: UpdateActivityInput): Promise<void> {
    await request<void>(`/scope-monitorings/${scopeId}/activities/${day}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  /**
   * POST /scope-monitorings/{id}/activities/complete
   * Complète une ou plusieurs journées d'un coup
   * Corps: { days: ["YYYY-MM-DD", ...] }
   * Réponse 204
   */
  async completeActivities(scopeId: string, payload: CompleteActivitiesInput): Promise<void> {
    await request<void>(`/scope-monitorings/${scopeId}/activities/complete`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
