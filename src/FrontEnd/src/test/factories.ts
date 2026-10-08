/**
 * Fabriques de données de test.
 *
 * Une fixture écrite à la main répète le contrat de l'API : le jour où
 * `ScopeMonitoring` gagne un champ, chaque littéral devient une erreur de
 * compilation, et le remède naturel — rendre le champ optionnel — réintroduirait
 * `undefined` là où l'API n'a qu'un état absent (`null` pour la note et le code
 * de facturation).
 *
 * Les valeurs par défaut sont donc volontairement réalistes : une fixture ne
 * doit pas pouvoir mentir sur la forme d'une réponse. Seul ce qu'un test observe
 * est surchargé.
 */

import type { AuditEvent, DailyActivity, ScopeMonitoring } from "../types";

/** Activité d'une journée, telle que la renvoie l'API. */
export function makeActivity(
  day: string,
  overrides: Partial<DailyActivity> = {},
): DailyActivity {
  return {
    day,
    errors_reported: 0,
    incidents_created: 0,
    feai: [],
    status: "pending",
    ko_reason: null,
    ...overrides,
  };
}

/**
 * Événement du journal d'audit, tel que la liste le renvoie.
 *
 * Les défauts sont réalistes : `scope_name` renseigné, `actor` en majuscules
 * comme la colonne qui le stocke, `changes` non vide. Un test qui veut
 * l'absence de note ou d'acteur le dit explicitement.
 */
export function makeAuditEvent(
  overrides: Partial<AuditEvent> = {},
): AuditEvent {
  return {
    id: "evt-0001",
    actor: "ABCD",
    action: "activity_updated",
    scope_id: "scope-1",
    scope_name: "Périmètre Alpha",
    day: "2026-09-19",
    created_at: "2026-09-19T14:32:00Z",
    changes: {
      errors_reported: { old: 2, new: 5 },
      feai: { old: ["INC000000001"], new: ["INC000000001", "INC000000002"] },
    },
    ...overrides,
  };
}

/** Périmètre tel que la liste ou le détail le renvoie. */
export function makeScope(
  overrides: Partial<ScopeMonitoring> = {},
): ScopeMonitoring {
  return {
    id: "scope-1",
    name: "Périmètre Alpha",
    knowledge_base_id: "KB-ALPHA-0001",
    official_main: "LAMA",
    official_backup: "JMAB",
    billing_code: "FACT-2026-PAI",
    note: null,
    daily_activities: [],
    ...overrides,
  };
}

/**
 * Périmètres nommés, pour les tests qui comparent des identifiants.
 *
 * Le nom reste lisible dans les assertions : un `scopeIds: ["a", "b"]` muet ne
 * dit pas quel périmètre est le plus dégradé.
 */
export function makeScopes(
  names: string[],
  overrides: Partial<ScopeMonitoring> = {},
): ScopeMonitoring[] {
  return names.map((name, index) =>
    makeScope({
      id: `scope-${index + 1}`,
      name,
      ...overrides,
    }),
  );
}