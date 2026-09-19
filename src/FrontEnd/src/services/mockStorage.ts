/**
 * Stockage mock/local respectant strictement les règles métier et les statuts HTTP de l'API FastAPI.
 * Permet d'utiliser l'application et de tester toutes les fonctionnalités dans l'environnement de prévisualisation
 * même si le backend FastAPI n'est pas démarré localement.
 */

import {
  CreateActivityInput,
  CreateScopeInput,
  DailyActivity,
  ScopeMonitoring,
  UpdateActivityInput,
} from '../types';
import { isValidFeai } from '../utils/validation';

const STORAGE_KEY = 'protab_scope_monitorings_data';

// Données initiales réalistes de démonstration
const INITIAL_MOCK_DATA: ScopeMonitoring[] = [
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'Périmètre Paiements & Facturation',
    knowledge_base_id: 'KB-PAYMENTS-001',
    official_main: 'Sophie Martin',
    official_backup: 'Marc Dupont',
    daily_activities: [
      {
        day: '2026-09-19',
        errors_reported: 4,
        incidents_created: 2,
        feai: ['INC0001245', 'INC0001246'],
        handled: true,
        completed: true,
      },
      {
        day: '2026-09-18',
        errors_reported: 6,
        incidents_created: 3,
        feai: ['INC0001230', 'INC0001231', 'INC0001232'],
        handled: false,
        completed: false,
      },
      {
        day: '2026-09-17',
        errors_reported: 1,
        incidents_created: 0,
        feai: [],
        handled: true,
        completed: true,
      },
    ],
  },
  {
    id: 'b1ffcd88-8b1a-3de7-aa5c-5aa8ac270b22',
    name: 'Périmètre Authentification & IAM',
    knowledge_base_id: 'KB-IAM-SECURITY-02',
    official_main: 'Karim Benali',
    official_backup: 'Élodie Bernard',
    daily_activities: [
      {
        day: '2026-09-19',
        errors_reported: 2,
        incidents_created: 1,
        feai: ['INC0004501'],
        handled: false,
        completed: false,
      },
      {
        day: '2026-09-18',
        errors_reported: 0,
        incidents_created: 0,
        feai: [],
        handled: true,
        completed: true,
      },
    ],
  },
  {
    id: 'c2eedf77-7a2b-2cd6-994b-49979b160c33',
    name: 'Périmètre Catalogue Produits',
    knowledge_base_id: 'KB-CATALOGUE-003',
    official_main: 'Claire Leroux',
    official_backup: 'Thomas Petit',
    daily_activities: [],
  },
];

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getStoredScopes(): ScopeMonitoring[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_DATA));
      return INITIAL_MOCK_DATA;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_MOCK_DATA;
  }
}

function saveStoredScopes(scopes: ScopeMonitoring[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scopes));
  } catch (err) {
    console.error('Erreur sauvegarde localStorage:', err);
  }
}

export const MockStorage = {
  getScopes(): ScopeMonitoring[] {
    return getStoredScopes();
  },

  getScopeById(id: string): ScopeMonitoring | null {
    const scopes = getStoredScopes();
    return scopes.find((s) => s.id === id) || null;
  },

  createScopes(items: CreateScopeInput[]): { ids: string[] } {
    const scopes = getStoredScopes();
    const newIds: string[] = [];

    for (const item of items) {
      if (scopes.some((s) => s.name.toLowerCase() === item.name.trim().toLowerCase())) {
        const error = new Error(`Un périmètre avec le nom "${item.name}" existe déjà.`);
        (error as unknown as { status: number }).status = 409;
        throw error;
      }
      if (item.knowledge_base_id.trim().length < 10) {
        const error = new Error("L'identifiant de base de connaissances doit comporter au moins 10 caractères.");
        (error as unknown as { status: number }).status = 400;
        throw error;
      }

      const newId = generateUuid();
      scopes.push({
        id: newId,
        name: item.name.trim(),
        knowledge_base_id: item.knowledge_base_id.trim(),
        official_main: item.official_main.trim(),
        official_backup: item.official_backup.trim(),
        daily_activities: [],
      });
      newIds.push(newId);
    }

    saveStoredScopes(scopes);
    return { ids: newIds };
  },

  importCsv(csvText: string): { ids: string[] } {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length <= 1) {
      const err = new Error("Le fichier CSV est vide ou ne contient aucune ligne de données.");
      (err as unknown as { status: number }).status = 400;
      throw err;
    }

    const header = lines[0].toLowerCase().split(/[,;]/).map((h) => h.trim().replace(/^["']|["']$/g, ''));
    const expectedHeaders = ['name', 'knowledge_base_id', 'official_main', 'official_backup'];
    const hasValidHeaders = expectedHeaders.every((eh) => header.includes(eh));

    if (!hasValidHeaders) {
      const err = new Error("En-tête CSV non conforme. Colonnes obligatoires: name, knowledge_base_id, official_main, official_backup");
      (err as unknown as { status: number }).status = 400;
      throw err;
    }

    const nameIdx = header.indexOf('name');
    const kbIdx = header.indexOf('knowledge_base_id');
    const mainIdx = header.indexOf('official_main');
    const backupIdx = header.indexOf('official_backup');

    const scopesToCreate: CreateScopeInput[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(/[,;]/).map((p) => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length < expectedHeaders.length) {
        const err = new Error(`Ligne ${i + 1} non conforme : colonnes manquantes.`);
        (err as unknown as { status: number }).status = 400;
        throw err;
      }
      scopesToCreate.push({
        name: parts[nameIdx],
        knowledge_base_id: parts[kbIdx],
        official_main: parts[mainIdx],
        official_backup: parts[backupIdx],
      });
    }

    return this.createScopes(scopesToCreate);
  },

  getActivity(scopeId: string, day: string): DailyActivity | null {
    const scope = this.getScopeById(scopeId);
    if (!scope) return null;
    return scope.daily_activities.find((a) => a.day === day) || null;
  },

  createActivity(scopeId: string, input: CreateActivityInput): DailyActivity {
    const scopes = getStoredScopes();
    const scope = scopes.find((s) => s.id === scopeId);

    if (!scope) {
      const err = new Error("Périmètre de supervision introuvable.");
      (err as unknown as { status: number }).status = 404;
      throw err;
    }

    if (scope.daily_activities.some((a) => a.day === input.day)) {
      const err = new Error(`Une activité existe déjà pour le jour ${input.day}.`);
      (err as unknown as { status: number }).status = 409;
      throw err;
    }

    if (input.incidents_created > input.errors_reported) {
      const err = new Error("Invariant violé: les incidents créés ne peuvent pas excéder les erreurs signalées.");
      (err as unknown as { status: number }).status = 400;
      throw err;
    }

    for (const f of input.feai) {
      if (!isValidFeai(f)) {
        const err = new Error(`Référence FEAI invalide: ${f}. Format requis: INC + 7 chiffres.`);
        (err as unknown as { status: number }).status = 400;
        throw err;
      }
    }

    const uniqueFeai = new Set(input.feai);
    if (uniqueFeai.size !== input.feai.length) {
      const err = new Error("La liste FEAI contient des doublons.");
      (err as unknown as { status: number }).status = 400;
      throw err;
    }

    const newActivity: DailyActivity = {
      day: input.day,
      errors_reported: input.errors_reported,
      incidents_created: input.incidents_created,
      feai: input.feai,
      handled: false,
      completed: false,
    };

    scope.daily_activities.push(newActivity);
    saveStoredScopes(scopes);
    return newActivity;
  },

  updateActivity(scopeId: string, day: string, input: UpdateActivityInput): DailyActivity {
    const scopes = getStoredScopes();
    const scope = scopes.find((s) => s.id === scopeId);

    if (!scope) {
      const err = new Error("Périmètre introuvable.");
      (err as unknown as { status: number }).status = 404;
      throw err;
    }

    const activity = scope.daily_activities.find((a) => a.day === day);
    if (!activity) {
      const err = new Error(`Activité non trouvée pour le jour ${day}.`);
      (err as unknown as { status: number }).status = 404;
      throw err;
    }

    if (input.incidents_created > input.errors_reported) {
      const err = new Error("Invariant violé: les incidents créés ne peuvent pas excéder les erreurs signalées.");
      (err as unknown as { status: number }).status = 400;
      throw err;
    }

    for (const f of input.feai) {
      if (!isValidFeai(f)) {
        const err = new Error(`Référence FEAI invalide: ${f}. Format requis: INC + 7 chiffres.`);
        (err as unknown as { status: number }).status = 400;
        throw err;
      }
    }

    const uniqueFeai = new Set(input.feai);
    if (uniqueFeai.size !== input.feai.length) {
      const err = new Error("La liste FEAI contient des doublons.");
      (err as unknown as { status: number }).status = 400;
      throw err;
    }

    activity.errors_reported = input.errors_reported;
    activity.incidents_created = input.incidents_created;
    activity.feai = input.feai;

    saveStoredScopes(scopes);
    return activity;
  },

  completeActivities(scopeId: string, days: string[]): void {
    const scopes = getStoredScopes();
    const scope = scopes.find((s) => s.id === scopeId);

    if (!scope) {
      const err = new Error("Périmètre introuvable.");
      (err as unknown as { status: number }).status = 404;
      throw err;
    }

    for (const day of days) {
      const activity = scope.daily_activities.find((a) => a.day === day);
      if (!activity) {
        const err = new Error(`Jour ${day} introuvable dans le périmètre.`);
        (err as unknown as { status: number }).status = 404;
        throw err;
      }
      activity.completed = true;
      activity.handled = true; // Règle: completed => handled
    }

    saveStoredScopes(scopes);
  },

  resetDemoData(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_DATA));
  },
};
