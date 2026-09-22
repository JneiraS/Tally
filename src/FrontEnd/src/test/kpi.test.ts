/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { ScopeMonitoring, DailyActivity } from '../types';
import {
  baselineDelta,
  buildDailyTrend,
  coverageRate,
  isWorkingDay,
  lastNDays,
  lastWorkingDays,
  sumFeai,
  trailingErrors,
  transformationRate,
} from '../utils/kpi';

const TODAY = '2026-09-18';

function activity(
  day: string,
  errors: number,
  incidents: number,
  feai: string[] = [],
): DailyActivity {
  return { day, errors_reported: errors, incidents_created: incidents, feai, handled: false, completed: false };
}

function scope(
  id: string,
  name: string,
  daily_activities: DailyActivity[],
): ScopeMonitoring {
  return {
    id,
    name,
    knowledge_base_id: 'KB-00000001',
    official_main: 'MAIN',
    official_backup: 'BACK',
    daily_activities,
  };
}

describe('lastNDays', () => {
  it('renvoie les n derniers jours depuis today inclus', () => {
    const days = lastNDays(TODAY, 7);
    expect(days).toHaveLength(7);
    expect(days[0]).toBe(TODAY);
    expect(days[6]).toBe('2026-09-12');
  });
});

describe('jours ouvrés', () => {
  it('exclut le weekend par défaut et les dates ponctuelles configurées', () => {
    expect(isWorkingDay('2026-09-19')).toBe(false);
    expect(isWorkingDay('2026-09-18')).toBe(true);
    expect(
      isWorkingDay('2026-09-18', {
        excluded_weekdays: [6, 7],
        excluded_dates: ['2026-09-18'],
      }),
    ).toBe(false);
  });

  it('retourne les derniers jours ouvrés, même si la date courante est un samedi', () => {
    expect(lastWorkingDays('2026-09-19', 3)).toEqual([
      '2026-09-18',
      '2026-09-17',
      '2026-09-16',
    ]);
  });
});

describe('buildDailyTrend', () => {
  it('agrège les 7 derniers jours ouvrés sans afficher le weekend', () => {
    const scopes = [
      scope('a', 'A', [
        activity('2026-09-19', 99, 99),
        activity('2026-09-18', 4, 2),
        activity('2026-09-17', 3, 1),
      ]),
      scope('b', 'B', [activity('2026-09-18', 1, 1)]),
    ];

    const trend = buildDailyTrend(scopes, '2026-09-19');

    expect(trend).toHaveLength(7);
    expect(trend.map((point) => point.day)).toEqual([
      '2026-09-10',
      '2026-09-11',
      '2026-09-14',
      '2026-09-15',
      '2026-09-16',
      '2026-09-17',
      '2026-09-18',
    ]);
    expect(trend.at(-1)).toMatchObject({ day: '2026-09-18', erreurs: 5, incidents: 3 });
    expect(trend.some((point) => point.day === '2026-09-19')).toBe(false);
  });
});

describe('sumFeai', () => {
  it('totalise les références FEAI du jour sélectionné', () => {
    const scopes = [
      scope('a', 'A', [activity(TODAY, 2, 1, ['INC000000001', 'INC000000002'])]),
      scope('b', 'B', [activity(TODAY, 1, 1, ['INC000000003'])]),
    ];
    expect(sumFeai(scopes, TODAY)).toBe(3);
  });

  it('renvoie 0 si aucune activité ce jour-là', () => {
    const scopes = [scope('a', 'A', [activity('2026-09-18', 2, 1)])];
    expect(sumFeai(scopes, TODAY)).toBe(0);
  });
});

describe('transformationRate', () => {
  it('calcule le pourcentage arrondi', () => {
    expect(transformationRate(1, 2)).toBe(50);
  });

  it('renvoie null quand aucune erreur', () => {
    expect(transformationRate(0, 0)).toBeNull();
    expect(transformationRate(3, 0)).toBeNull();
  });
});

describe('trailingErrors', () => {
  it('écart non transformé (erreurs − incidents), jamais négatif', () => {
    expect(trailingErrors(5, 2)).toBe(3);
    expect(trailingErrors(2, 5)).toBe(0);
    expect(trailingErrors(0, 0)).toBe(0);
  });
});

describe('baselineDelta', () => {
  it('calcule l’écart en % vs moyenne des 7 jours précédents', () => {
    const days = lastWorkingDays(TODAY, 8);
    const scopes = days
      .filter((d) => d !== TODAY)
      .map((d, i) => scope(`s${i}`, `S${i}`, [activity(d, 5, 0)]));
    scopes.push(scope('today', 'Aujourd’hui', [activity(TODAY, 10, 0)]));

    const delta = baselineDelta(scopes, TODAY);
    expect(delta.avg).toBe(5);
    expect(delta.todayTotal).toBe(10);
    expect(delta.deltaPct).toBe(100);
    expect(delta.direction).toBe('up');
  });

  it('renvoie null si la moyenne précédente est nulle', () => {
    const scopes = [scope('today', 'Aujourd’hui', [activity(TODAY, 3, 0)])];
    const delta = baselineDelta(scopes, TODAY);
    expect(delta.avg).toBe(0);
    expect(delta.deltaPct).toBeNull();
    expect(delta.direction).toBe('flat');
  });

  it('direction down quand le jour est sous la moyenne', () => {
    const days = lastWorkingDays(TODAY, 8);
    const scopes = days
      .filter((d) => d !== TODAY)
      .map((d, i) => scope(`s${i}`, `S${i}`, [activity(d, 5, 0)]));
    scopes.push(scope('today', 'Aujourd’hui', [activity(TODAY, 2, 0)]));

    const delta = baselineDelta(scopes, TODAY);
    expect(delta.deltaPct).toBe(-60);
    expect(delta.direction).toBe('down');
  });
});

describe('coverageRate', () => {
  it('calcule le % de cellules (périmètre × jour) avec activité', () => {
    const scopes = [
      scope('a', 'A', [activity(TODAY, 1, 0)]),
      scope('b', 'B', [activity('2026-09-18', 1, 0)]),
    ];
    const days = [TODAY, '2026-09-18'];
    expect(coverageRate(scopes, days)).toBe(50);
  });

  it('renvoie 0 sans périmètre ou sans jours', () => {
    expect(coverageRate([], [TODAY])).toBe(0);
    expect(coverageRate([scope('a', 'A', [])], [])).toBe(0);
  });
});
