/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { NonWorkingDays, ScopeMonitoring, DailyActivity } from '../types';
import {
  baselineDelta,
  
  buildDailyTrend,
  coverageRate,
  defaultDisplayDay,
  hasAnyDueDay,
  isScopeDue,
  isWorkingDay,
  lastNDays,
  lastWorkingDays,
  latestActivityDay,
  sumFeai,
  trailingErrors,
  transformationRate,
} from '../utils/kpi';
import { makeScope } from './factories';

const TODAY = '2026-09-18';

function activity(
  day: string,
  errors: number,
  incidents: number,
  feai: string[] = [],
): DailyActivity {
  return { day, errors_reported: errors, incidents_created: incidents, feai, status: "pending", ko_reason: null };
}

function scope(
  id: string,
  name: string,
  daily_activities: DailyActivity[],
): ScopeMonitoring {
  return makeScope({ id, name, daily_activities });
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

  it('abandonne la recherche si aucun jour ne peut être ouvré', () => {
    // Un calendrier couvrant toute la semaine n'a rien à afficher. Sans borne,
    // cette recherche tournerait jusqu'à la limite de `Date` — un gel du rendu
    // — donc elle ne rendrait jamais la main. Le test ne peut pas se falsifier
    // tout seul : une boucle non bornée ne produit pas `[]`, elle ne termine pas.
    expect(
      lastWorkingDays('2026-09-18', 3, {
        excluded_weekdays: [1, 2, 3, 4, 5, 6, 7],
        excluded_dates: [],
      }),
    ).toEqual([]);
  });

  it('ouvre sur le jour courant quand aucun jour ouvré n’existe', () => {
    // La branche de repli doit rester atteignable : c'est elle qui évite un
    // écran vide quand la recherche ne renvoie rien.
    expect(
      defaultDisplayDay('2026-09-19', {
        excluded_weekdays: [1, 2, 3, 4, 5, 6, 7],
        excluded_dates: [],
      }),
    ).toBe('2026-09-19');
  });

  it('trouve les jours ouvrés malgré des dates ponctuelles défavorables', () => {
    // La borne doit valoir sept jours par jour cherché **plus** sept jours par
    // date ponctuelle : une date exclue qui tombe sur le seul jour ouvrable
    // coûte une semaine entière de recherche, pas un jour. Avec un calendrier
    // ne travaillant que le dimanche, quatre dimanches exclus repoussent la
    // troisième occurrence bien au-delà de `n * 7 + dates`.
    const calendar: NonWorkingDays = {
      excluded_weekdays: [1, 2, 3, 4, 5, 6],
      excluded_dates: [
        '2026-10-04',
        '2026-09-27',
        '2026-09-20',
        '2026-09-13',
      ],
    };
    expect(lastWorkingDays('2026-10-11', 3, calendar)).toEqual([
      '2026-10-11',
      '2026-09-06',
      '2026-08-30',
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

describe('defaultDisplayDay', () => {
  it('conserve le jour courant quand il est ouvré', () => {
    expect(defaultDisplayDay('2026-09-18')).toBe('2026-09-18');
  });

  it('retombe sur le dernier jour ouvré quand le jour courant ne l’est pas', () => {
    // 2026-09-27 est un dimanche : la page doit s'ouvrir sur le vendredi 25.
    expect(defaultDisplayDay('2026-09-27')).toBe('2026-09-25');
    expect(defaultDisplayDay('2026-09-26')).toBe('2026-09-25');
  });

  it('respecte les jours non ouvrés configurés par le projet', () => {
    const config: NonWorkingDays = {
      excluded_weekdays: [6, 7],
      excluded_dates: ['2026-09-25'],
    };
    expect(defaultDisplayDay('2026-09-25', config)).toBe('2026-09-24');
    expect(
      defaultDisplayDay('2026-09-27', {
        excluded_weekdays: [6, 7],
        excluded_dates: [],
      }),
    ).toBe('2026-09-25');
  });
});

describe('latestActivityDay', () => {
  it('renvoie le jour le plus récent saisi, tous périmètres confondus', () => {
    const scopes = [
      scope('a', 'A', [activity('2026-09-18', 1, 0), activity('2026-09-25', 2, 1)]),
      scope('b', 'B', [activity('2026-09-24', 4, 2)]),
    ];

    expect(latestActivityDay(scopes)).toBe('2026-09-25');
  });

  it('renvoie null si rien n’a jamais été saisi', () => {
    expect(latestActivityDay([])).toBeNull();
    expect(latestActivityDay([scope('a', 'A', [])])).toBeNull();
  });
});

/**
 * Périodicité d'un périmètre.
 *
 * La cadence **restreint** le calendrier du projet, elle ne l'élargit jamais :
 * un samedi déclaré dans un projet lundi–vendredi n'est pas un jour attendu. Et
 * le cycle se compte depuis l'ancre, jamais depuis le numéro de semaine ISO —
 * une année à 53 semaines en changerait la parité.
 */
const MONDAY_TO_FRIDAY: NonWorkingDays = {
  excluded_weekdays: [6, 7],
  excluded_dates: [],
};

function scheduled(
  weekdays: NonWorkingDays['excluded_weekdays'],
  interval_weeks = 1,
  anchor_date: string | null = null,
): ScopeMonitoring {
  return makeScope({
    schedule: { weekdays, interval_weeks, anchor_date },
  });
}

describe('isScopeDue', () => {
  it("considère un périmètre sans périodicité comme attendu chaque jour ouvré", () => {
    const scope = scheduled([]);
    expect(isScopeDue(scope, '2026-09-21', MONDAY_TO_FRIDAY)).toBe(true); // lundi
    expect(isScopeDue(scope, '2026-09-26', MONDAY_TO_FRIDAY)).toBe(false); // samedi
  });

  it("n'attend un périmètre que les jours qu'il déclare", () => {
    const scope = scheduled([1, 5]);
    expect(isScopeDue(scope, '2026-09-21', MONDAY_TO_FRIDAY)).toBe(true);
    expect(isScopeDue(scope, '2026-09-22', MONDAY_TO_FRIDAY)).toBe(false);
    expect(isScopeDue(scope, '2026-09-25', MONDAY_TO_FRIDAY)).toBe(true);
  });

  it("ne rend jamais attendu un jour non ouvré, même déclaré", () => {
    const scope = scheduled([6]);
    expect(isScopeDue(scope, '2026-09-26', MONDAY_TO_FRIDAY)).toBe(false);
  });

  it('saute une semaine sur deux depuis l’ancre', () => {
    const scope = scheduled([1], 2, '2026-01-05');
    expect(isScopeDue(scope, '2026-01-05', MONDAY_TO_FRIDAY)).toBe(true);
    expect(isScopeDue(scope, '2026-01-12', MONDAY_TO_FRIDAY)).toBe(false);
    expect(isScopeDue(scope, '2026-01-19', MONDAY_TO_FRIDAY)).toBe(true);
  });

  it('garde la phase au passage d’une année à 53 semaines', () => {
    // 2026-12-28 est 2026-W53 et 2027-01-04 est 2027-W01 : une règle fondée sur
    // la parité du numéro de semaine sauterait deux semaines de suite.
    const scope = scheduled([1], 2, '2026-01-05');
    expect(isScopeDue(scope, '2026-12-28', MONDAY_TO_FRIDAY)).toBe(false);
    expect(isScopeDue(scope, '2027-01-04', MONDAY_TO_FRIDAY)).toBe(true);
  });
});

describe('hasAnyDueDay', () => {
  it("détecte une périodicité qui ne tombe jamais un jour ouvré", () => {
    expect(hasAnyDueDay(scheduled([6]), MONDAY_TO_FRIDAY)).toBe(false);
    expect(hasAnyDueDay(scheduled([1]), MONDAY_TO_FRIDAY)).toBe(true);
  });

  it('conclut en un cycle borné, même une semaine sur douze', () => {
    expect(hasAnyDueDay(scheduled([1], 12, '2026-01-05'), MONDAY_TO_FRIDAY)).toBe(true);
  });
});

describe('coverageRate avec périodicité', () => {
  it('ne compte que les cellules attendues au dénominateur', () => {
    const scopes = [
      scheduled([1, 5]), // attendu lundi et vendredi seulement
      scheduled([]), // attendu les cinq jours
    ];
    const days = [
      '2026-09-21', // lundi
      '2026-09-22',
      '2026-09-23',
      '2026-09-24',
      '2026-09-25', // vendredi
    ];
    const filledEveryDay = scope(
      'b',
      'B',
      days.map((day) => activity(day, 1, 0)),
    );
    // 5 cellules remplies sur 2 + 5 = 7 attendues.
    expect(coverageRate([scopes[0], filledEveryDay], days, MONDAY_TO_FRIDAY)).toBe(71);
  });

  it('ne compte pas une saisie hors périodicité et ne dépasse jamais 100 %', () => {
    const scopeDueMonday = scheduled([1]);
    scopeDueMonday.daily_activities = [
      activity('2026-09-21', 1, 0), // lundi : attendu
      activity('2026-09-22', 1, 0), // mardi : hors périodicité
    ];

    expect(
      coverageRate([scopeDueMonday], ['2026-09-21', '2026-09-22'], MONDAY_TO_FRIDAY),
    ).toBe(100);
  });
});
