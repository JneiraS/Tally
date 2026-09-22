import { describe, expect, it } from "vitest";
import { buildHeatmapMatrix } from "../utils/auditStats";

describe("buildHeatmapMatrix", () => {
  it("regroupe les événements par jour et heure locale", () => {
    const matrix = buildHeatmapMatrix([
      { created_at: "2026-09-21T09:05:00" },
      { created_at: "2026-09-21T09:45:00" },
      { created_at: "2026-09-22T14:10:00" },
      { created_at: "2026-09-27T23:00:00" },
    ]);

    expect(matrix[0][9]).toBe(2);
    expect(matrix[1][14]).toBe(1);
    expect(matrix[6][23]).toBe(1);
  });

  it("ignore les horodatages invalides et conserve une matrice 7 × 24", () => {
    const matrix = buildHeatmapMatrix([{ created_at: "invalid" }]);

    expect(matrix).toHaveLength(7);
    expect(matrix.every((row) => row.length === 24)).toBe(true);
    expect(matrix.flat().every((value) => value === 0)).toBe(true);
  });
});
