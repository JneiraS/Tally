import { describe, expect, it } from "vitest";
import {
  aggregateByDay,
  aggregateByWeek,
  buildPeriodDays,
  buildSupervisionGrid,
  buildErrorHeatmap,
  clampRange,
  computePeriodSummary,
  firstActivityDay,
  isoWeekKey,
  normalizeRange,
  periodDelta,
  previousPeriod,
  resolvePresetRange,
  scaleBucket,
  weekLabel,
} from "../utils/analytics";
import { DailyActivity, NonWorkingDays, ScopeMonitoring } from "../types";

const CONFIG: NonWorkingDays = {
  excluded_weekdays: [6, 7],
  excluded_dates: ["2026-09-16"],
};

function activity(
  day: string,
  errors_reported: number,
  incidents_created: number,
  overrides: Partial<DailyActivity> = {},
): DailyActivity {
  return {
    day,
    errors_reported,
    incidents_created,
    feai: [],
    handled: true,
    completed: false,
    ...overrides,
  };
}

function scope(
  id: string,
  name: string,
  daily_activities: DailyActivity[],
): ScopeMonitoring {
  return {
    id,
    name,
    knowledge_base_id: `KB-${id}`,
    official_main: "MAIN",
    official_backup: "BACK",
    billing_code: null,
    daily_activities,
  };
}

/** 2026-09-21 est un lundi : toute la semaine d'exemple est ouvrée sauf S38. */
const LUNDI = "2026-09-21";

describe("plage de dates", () => {
  it("normalise une plage inversée et la borne à la date du jour", () => {
    expect(normalizeRange("2026-09-25", "2026-09-21")).toEqual({
      from: "2026-09-21",
      to: "2026-09-25",
    });
    expect(normalizeRange("2026-09-01", "2026-10-31", LUNDI)).toEqual({
      from: "2026-09-01",
      to: LUNDI,
    });
  });

  it("ne triche pas sur une plage déjà ordonnée et dans les bornes", () => {
    expect(normalizeRange("2026-09-14", "2026-09-21", LUNDI)).toEqual({
      from: "2026-09-14",
      to: "2026-09-21",
    });
  });

  it("énumère les jours de la période, bornes incluses", () => {
    expect(buildPeriodDays("2026-09-18", "2026-09-21", CONFIG, false)).toEqual([
      "2026-09-18",
      "2026-09-19",
      "2026-09-20",
      "2026-09-21",
    ]);
  });

  it("écarte week-ends et jours non travaillés quand on le demande", () => {
    // 18 = vendredi, 19 et 20 = week-end, 21 = lundi
    expect(buildPeriodDays("2026-09-18", "2026-09-21", CONFIG, true)).toEqual([
      "2026-09-18",
      "2026-09-21",
    ]);
  });

  it("écarte un jour exclu explicitement même s'il est ouvré", () => {
    // 2026-09-16 est un mercredi, donc absent uniquement via excluded_dates
    expect(buildPeriodDays("2026-09-15", "2026-09-17", CONFIG, true)).toEqual([
      "2026-09-15",
      "2026-09-17",
    ]);
  });

  it("renvoie une liste vide si la période est vide", () => {
    expect(buildPeriodDays("2026-09-21", "2026-09-21", CONFIG, false)).toEqual([
      LUNDI,
    ]);
    expect(normalizeRange("2026-09-21", "2026-09-21")).toEqual({
      from: LUNDI,
      to: LUNDI,
    });
  });
});

describe("semaines ISO", () => {
  it("classe un lundi, un jeudi et le dimanche qui le suit dans la même semaine", () => {
    expect(isoWeekKey("2026-09-21")).toBe("2026-W39");
    expect(isoWeekKey("2026-09-24")).toBe("2026-W39");
    expect(isoWeekKey("2026-09-27")).toBe("2026-W39");
  });

  it("ouvre une nouvelle semaine le lundi suivant", () => {
    expect(isoWeekKey("2026-09-28")).toBe("2026-W40");
  });

  it("rattache les jours de fin d'année à la bonne semaine ISO", () => {
    expect(isoWeekKey("2026-01-01")).toBe("2026-W01");
    expect(isoWeekKey("2026-01-04")).toBe("2026-W01");
    expect(isoWeekKey("2026-01-05")).toBe("2026-W02");
  });

  it("rend un libellé court sans préfixe d'année", () => {
    expect(weekLabel("2026-W39")).toBe("S39");
  });
});

describe("agrégation", () => {
  const SCOPES = [
    scope("s1", "Alpha", [
      activity("2026-09-21", 4, 1),
      activity("2026-09-22", 2, 2),
    ]),
    scope("s2", "Beta", [activity("2026-09-21", 6, 3)]),
  ];

  it("cumule erreurs, incidents et arriéré par jour", () => {
    expect(aggregateByDay(SCOPES, ["2026-09-21", "2026-09-22", "2026-09-23"])).toEqual([
      { label: "2026-09-21", erreurs: 10, incidents: 4, arriere: 6 },
      { label: "2026-09-22", erreurs: 2, incidents: 2, arriere: 0 },
      { label: "2026-09-23", erreurs: 0, incidents: 0, arriere: 0 },
    ]);
  });

  it("n'ajoute que les jours de la période demandée", () => {
    const points = aggregateByDay(SCOPES, ["2026-09-22"]);
    expect(points).toHaveLength(1);
    expect(points[0]).toMatchObject({ erreurs: 2, incidents: 2 });
  });

  it("regroupe par semaine ISO et additionne les journées d'une même semaine", () => {
    const points = aggregateByWeek(SCOPES, [
      "2026-09-21",
      "2026-09-22",
      "2026-09-28",
    ]);
    expect(points).toEqual([
      { label: "2026-W39", erreurs: 12, incidents: 6, arriere: 6 },
      { label: "2026-W40", erreurs: 0, incidents: 0, arriere: 0 },
    ]);
  });

  it("conserve l'ordre chronologique des semaines sans doublon", () => {
    const points = aggregateByWeek(SCOPES, [
      "2026-09-28",
      "2026-09-21",
      "2026-09-22",
    ]);
    expect(points.map((p) => p.label)).toEqual(["2026-W39", "2026-W40"]);
  });
});

describe("heatmap hebdomadaire des erreurs", () => {
  const SCOPES = [
    scope("s1", "Alpha", [
      activity("2026-09-21", 4, 1),
      activity("2026-09-22", 6, 2),
      activity("2026-09-28", 3, 0),
    ]),
    scope("s2", "Beta", [activity("2026-09-21", 2, 0)]),
  ];

  it("cumule les erreurs brutes par semaine et par périmètre", () => {
    const heatmap = buildErrorHeatmap(SCOPES, [
      "2026-09-21",
      "2026-09-22",
      "2026-09-28",
    ]);

    expect(heatmap.columns).toEqual(["2026-W39", "2026-W40"]);
    expect(heatmap.granularity).toBe("semaine");
    expect(heatmap.rows[0]).toMatchObject({
      name: "Alpha",
      totalErrors: 13,
      cells: [
        { column: "2026-W39", errors: 10, changePct: null },
        { column: "2026-W40", errors: 3, changePct: -70 },
      ],
    });
    expect(heatmap.maxErrors).toBe(10);
  });

  it("décline une colonne par jour quand la granularité le demande", () => {
    const heatmap = buildErrorHeatmap(
      SCOPES,
      ["2026-09-21", "2026-09-22", "2026-09-28"],
      "jour",
    );

    expect(heatmap.columns).toEqual(["2026-09-21", "2026-09-22", "2026-09-28"]);
    expect(heatmap.granularity).toBe("jour");
    expect(heatmap.rows[0]).toMatchObject({
      totalErrors: 13,
      cells: [
        { column: "2026-09-21", errors: 4, changePct: null },
        { column: "2026-09-22", errors: 6, changePct: 50 },
        { column: "2026-09-28", errors: 3, changePct: -50 },
      ],
    });
    expect(heatmap.maxErrors).toBe(6);
  });

  it("classe les périmètres sur le total d'erreurs de la période", () => {
    const heatmap = buildErrorHeatmap(SCOPES, [
      "2026-09-21",
      "2026-09-22",
      "2026-09-28",
    ]);

    expect(heatmap.rows.map((row) => row.name)).toEqual(["Alpha", "Beta"]);
    expect(heatmap.rows[1].cells[1]).toMatchObject({ errors: 0, changePct: -100 });
  });

  it("distingue une semaine sans erreur d'une semaine absente de la période", () => {
    const heatmap = buildErrorHeatmap(
      [scope("s1", "Alpha", [activity("2026-09-21", 0, 0)])],
      ["2026-09-21", "2026-09-28"],
    );

    expect(heatmap.rows[0].cells).toEqual([
      { column: "2026-W39", errors: 0, changePct: null },
      { column: "2026-W40", errors: 0, changePct: null },
    ]);
  });
});

describe("résumé de période", () => {
  const SCOPES = [
    scope("s1", "Alpha", [
      activity("2026-09-21", 4, 1, { completed: true }),
      activity("2026-09-22", 2, 2),
    ]),
    scope("s2", "Beta", [activity("2026-09-21", 6, 3)]),
  ];

  it("totalise erreurs, incidents, arriéré et couverture", () => {
    const summary = computePeriodSummary(SCOPES, [
      "2026-09-21",
      "2026-09-22",
    ]);
    expect(summary).toMatchObject({
      scopes: 2,
      jours: 2,
      erreurs: 12,
      incidents: 6,
      arriere: 6,
      transformation: 50,
      traitees: 3,
    });
    // 4 cellules attendues (2 périmètres × 2 jours), 3 saisies
    expect(summary.couverture).toBe(75);
  });

  it("reste défini quand la période ne contient aucune erreur", () => {
    const summary = computePeriodSummary(SCOPES, ["2026-09-23"]);
    expect(summary.erreurs).toBe(0);
    expect(summary.arriere).toBe(0);
    expect(summary.transformation).toBeNull();
    expect(summary.couverture).toBe(0);
  });

  it("ne divise pas par zéro quand aucun périmètre n'est sélectionné", () => {
    const summary = computePeriodSummary([], ["2026-09-21"]);
    expect(summary).toMatchObject({
      scopes: 0,
      erreurs: 0,
      couverture: 0,
      transformation: null,
    });
  });

  it("retombe sur la période de même longueur qui précède", () => {
    // 14 → 21 inclus fait 8 jours, donc 06 → 13 pour la période précédente
    expect(previousPeriod("2026-09-14", "2026-09-21")).toEqual({
      from: "2026-09-06",
      to: "2026-09-13",
    });
    expect(previousPeriod("2026-09-21", "2026-09-21")).toEqual({
      from: "2026-09-20",
      to: "2026-09-20",
    });
  });

  it("compare deux périodes en pourcentage, et renonce quand la base est nulle", () => {
    const deuxPeriodes = [
      scope("s1", "Alpha", [
        activity("2026-09-21", 4, 1),
        activity("2026-09-18", 8, 2),
      ]),
    ];
    const current = computePeriodSummary(deuxPeriodes, ["2026-09-21"]);
    const previous = computePeriodSummary(deuxPeriodes, ["2026-09-18"]);

    expect(current).toMatchObject({ erreurs: 4, incidents: 1, arriere: 3 });
    expect(previous).toMatchObject({ erreurs: 8, incidents: 2, arriere: 6 });
    expect(periodDelta(current, previous)).toEqual({
      erreursPct: -50,
      incidentsPct: -50,
      arrierePct: -50,
      couverturePct: 0,
    });

    // Une période précédente vide n'a pas de base de division : null, pas 0.
    const vide = computePeriodSummary([], ["2026-09-18"]);
    expect(periodDelta(current, vide)).toEqual({
      erreursPct: null,
      incidentsPct: null,
      arrierePct: null,
      couverturePct: null,
    });
  });
});

describe("grille de supervision", () => {
  const SCOPES = [
    scope("s1", "Alpha", [
      activity("2026-09-21", 4, 1, { completed: true }),
      activity("2026-09-22", 2, 0, { completed: false }),
    ]),
    scope("s2", "Beta", []),
  ];
  const DAYS = ["2026-09-21", "2026-09-22"];

  it("distingue traité, en cours et non saisi", () => {
    const grid = buildSupervisionGrid(SCOPES, DAYS);
    expect(grid.maxArriere).toBe(3);
    expect(grid.rows[0].cells.map((c) => c.etat)).toEqual(["traite", "encours"]);
    expect(grid.rows[0].cells.map((c) => c.arriere)).toEqual([3, 2]);
    expect(grid.rows[1].cells.map((c) => c.etat)).toEqual(["nonSaisi", "nonSaisi"]);
  });

  it("encode l'intensité en trois paliers, zéro pour une journée sans arrière", () => {
    expect(scaleBucket(0, 100)).toBe(0);
    expect(scaleBucket(1, 100)).toBe(1);
    expect(scaleBucket(50, 100)).toBe(1);
    expect(scaleBucket(51, 100)).toBe(2);
    expect(scaleBucket(100, 100)).toBe(2);
  });

  it("ne peut pas diviser par un maximum nul", () => {
    expect(scaleBucket(0, 0)).toBe(0);
  });
});

describe("presets de période", () => {
  it("propose sept jours ouvrés, trente jours calendaires et le mois en cours", () => {
    // 7 jours ouvrés en remontant : 10, 11, 14, 15, 17, 18 et 21 — le 16 est exclu
    expect(resolvePresetRange("7j", LUNDI, CONFIG)).toEqual({
      from: "2026-09-10",
      to: LUNDI,
    });
    expect(resolvePresetRange("30j", LUNDI, CONFIG)).toEqual({
      from: "2026-08-23",
      to: LUNDI,
    });
    expect(resolvePresetRange("mois", LUNDI, CONFIG)).toEqual({
      from: "2026-09-01",
      to: LUNDI,
    });
  });

  it("couvre tout l'historique depuis la première activité", () => {
    const scopes = [
      scope("s1", "Alpha", [
        activity("2026-03-02", 1, 1),
        activity("2026-09-18", 2, 1),
      ]),
    ];
    expect(firstActivityDay(scopes)).toBe("2026-03-02");
    expect(resolvePresetRange("tout", LUNDI, CONFIG, "2026-03-02")).toEqual({
      from: "2026-03-02",
      to: LUNDI,
    });
  });

  it("retombe sur le jour du jour quand l'historique est vide", () => {
    expect(firstActivityDay([])).toBeNull();
    expect(resolvePresetRange("tout", LUNDI, CONFIG, null)).toEqual({
      from: LUNDI,
      to: LUNDI,
    });
  });
});

describe("bornes de lisibilité", () => {
  it("borne la plage pour qu'une longue série reste traçable", () => {
    expect(clampRange("2026-01-05", "2026-09-21", 30)).toEqual({
      from: "2026-08-23",
      to: LUNDI,
    });
  });

  it("laisse une plage courte inchangée", () => {
    expect(clampRange("2026-09-18", LUNDI, 30)).toEqual({
      from: "2026-09-18",
      to: LUNDI,
    });
  });
});
