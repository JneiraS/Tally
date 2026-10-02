/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { ScopeMonitoring } from '../types';
import {
  matchesSearchQuery,
  officialMatchRank,
  sortByOfficialRelevance,
} from '../utils/search';

function scope(overrides: Partial<ScopeMonitoring> & { id: string }): ScopeMonitoring {
  return {
    name: `Scope ${overrides.id}`,
    knowledge_base_id: 'KB-00000001',
    official_main: 'MAMA',
    official_backup: 'LOTO',
    billing_code: 'FACT-2026-PAI',
    note: null,
    daily_activities: [],
    ...overrides,
  };
}

describe('matchesSearchQuery', () => {
  it('retient un périmètre qui correspond sur n\'importe quel champ indexé', () => {
    const target = scope({ id: '1', name: 'Référentiel client' });
    expect(matchesSearchQuery(target, 'client')).toBe(true);
    expect(matchesSearchQuery(target, 'KB-00000001')).toBe(true);
    expect(matchesSearchQuery(target, 'MAMA')).toBe(true);
    expect(matchesSearchQuery(target, 'LOTO')).toBe(true);
    expect(matchesSearchQuery(target, 'FACT-2026-PAI')).toBe(true);
    expect(matchesSearchQuery(target, 'introuvable')).toBe(false);
  });

  it('ignore la casse dans les deux sens', () => {
    const target = scope({ id: '2', name: 'Référentiel client', official_main: 'MAMA' });
    expect(matchesSearchQuery(target, 'mama')).toBe(true);
    expect(matchesSearchQuery(target, 'MAMA')).toBe(true);
    expect(matchesSearchQuery(target, 'référentiel')).toBe(true);
  });

  it('ne lève pas sur un code de facturation absent', () => {
    const target = scope({ id: '3', billing_code: null, official_main: 'NANA' });
    expect(matchesSearchQuery(target, 'NANA')).toBe(true);
    expect(matchesSearchQuery(target, 'FACT')).toBe(false);
  });

  it('retient tout le monde sur une requête vide', () => {
    expect(matchesSearchQuery(scope({ id: '4' }), '')).toBe(true);
  });
});

describe('officialMatchRank', () => {
  it('classe le responsable avant le suppléant', () => {
    expect(officialMatchRank(scope({ id: '1', official_main: 'MAMA' }), 'MAMA')).toBe(0);
    expect(
      officialMatchRank(
        scope({ id: '2', official_main: 'NANA', official_backup: 'MAMA' }),
        'MAMA',
      ),
    ).toBe(1);
  });

  it('classe en dernier un périmètre qui ne porte la requête que sur un autre champ', () => {
    expect(
      officialMatchRank(
        scope({ id: '3', name: 'MAMA Prod', official_main: 'NANA', official_backup: 'LOTO' }),
        'MAMA',
      ),
    ).toBe(2);
  });

  it('traite une liste d\'officials comme la chaîne affichée', () => {
    // official_main peut contenir plusieurs codes séparés par « / » : c'est
    // l'inclusion de la chaîne entière qui décide du filtrage, donc du rang.
    expect(
      officialMatchRank(scope({ id: '4', official_main: 'NANA/MAMA' }), 'MAMA'),
    ).toBe(0);
  });
});

describe('sortByOfficialRelevance', () => {
  it('place les hits responsable avant les hits suppléant et les hits nom', () => {
    const items = [
      scope({ id: 'a', name: 'MAMA Prod', official_main: 'NANA', official_backup: 'LOTO' }),
      scope({ id: 'b', name: 'Périmètre B', official_main: 'NANA', official_backup: 'MAMA' }),
      scope({ id: 'c', name: 'Périmètre C', official_main: 'MAMA', official_backup: 'LOTO' }),
    ];

    expect(sortByOfficialRelevance(items, 'MAMA').map((s) => s.id)).toEqual(['c', 'b', 'a']);
  });

  it('préserve l\'ordre d\'arrivée à rang égal', () => {
    const items = [
      scope({ id: 'a', name: 'Zeta', official_main: 'MAMA' }),
      scope({ id: 'b', name: 'Alpha', official_main: 'NANA/MAMA' }),
      scope({ id: 'c', name: 'Mue', official_main: 'LOTO', official_backup: 'MAMA' }),
    ];

    expect(sortByOfficialRelevance(items, 'MAMA').map((s) => s.id)).toEqual(['a', 'b', 'c']);
  });

  it('laisse l\'ordre intact sur une requête vide', () => {
    const items = [
      scope({ id: 'a', name: 'Zeta', official_main: 'NANA' }),
      scope({ id: 'b', name: 'Alpha', official_main: 'MAMA' }),
    ];

    expect(sortByOfficialRelevance(items, '').map((s) => s.id)).toEqual(['a', 'b']);
  });

  it('ne mute pas le tableau reçu', () => {
    const items = [
      scope({ id: 'a', name: 'Alpha', official_main: 'NANA', official_backup: 'MAMA' }),
      scope({ id: 'b', name: 'Zeta', official_main: 'MAMA' }),
    ];

    sortByOfficialRelevance(items, 'MAMA');

    expect(items.map((s) => s.id)).toEqual(['a', 'b']);
  });
});