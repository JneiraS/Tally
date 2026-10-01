import { describe, it, expect } from 'vitest';
import {
  DEFAULT_NON_WORKING_DAYS,
  WEEKDAY_LABELS,
  toIsoWeekday,
  toMondayFirstIndex,
} from '../constants/nonWorkingDays';
import { isWorkingDay } from '../utils/kpi';

/**
 * L'échelle ISO est le seul endroit où « quel jour est-ce ? » se décide côté
 * front. Ces tests verrouillent la conversion dimanche → 7, parce qu'elle n'est
 * pas exercised ailleurs : `getUTCDay()` vaut 0 pour dimanche alors que l'ISO
 * vaut 7, et une régression de cette ligne rendrait le dimanche ouvré sans
 * qu'aucun autre test ne change de résultat.
 */
describe('échelle ISO des jours', () => {
  it('convertit le numéro JavaScript en numéro ISO', () => {
    expect(toIsoWeekday(0)).toBe(7); // dimanche
    expect(toIsoWeekday(1)).toBe(1); // lundi
    expect(toIsoWeekday(6)).toBe(6); // samedi
  });

  it('branche la conversion sur une vraie date', () => {
    expect(toIsoWeekday(new Date('2026-09-27T00:00:00Z').getUTCDay())).toBe(7);
    expect(toIsoWeekday(new Date('2026-09-21T00:00:00Z').getUTCDay())).toBe(1);
  });

  it('indexe les lignes de la heatmap du lundi au dimanche', () => {
    expect(toMondayFirstIndex(0)).toBe(6); // dimanche = dernière ligne
    expect(toMondayFirstIndex(1)).toBe(0); // lundi = première ligne
  });

  it('expose les sept libellés dans l’ordre ISO', () => {
    expect(WEEKDAY_LABELS.map(([, label]) => label)).toEqual([
      'Lun',
      'Mar',
      'Mer',
      'Jeu',
      'Ven',
      'Sam',
      'Dim',
    ]);
  });
});

describe('jours non travaillés par défaut', () => {
  it('écarte le week-end, comme le défaut de l’API', () => {
    // Must stay aligned with ``NonWorkingDays.default()`` côté Python : les deux
    // décrivent l'installation qui n'a rien configuré.
    expect(DEFAULT_NON_WORKING_DAYS.excluded_weekdays).toEqual([6, 7]);
    expect(DEFAULT_NON_WORKING_DAYS.excluded_dates).toEqual([]);
  });

  it('rend le dimanche non ouvré, samedi compris', () => {
    // 2026-09-19 est un samedi, 2026-09-20 un dimanche, 2026-09-21 un lundi.
    expect(isWorkingDay('2026-09-19')).toBe(false);
    expect(isWorkingDay('2026-09-20')).toBe(false);
    expect(isWorkingDay('2026-09-21')).toBe(true);
  });
});