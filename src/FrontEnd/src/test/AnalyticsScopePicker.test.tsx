/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AnalyticsScopePicker } from "../components/AnalyticsScopePicker";
import { CHECKBOX_CLASS } from "../constants/ui";
import type { ScopeMonitoring } from "../types";

const scopes: ScopeMonitoring[] = [
  { id: "1", name: "AH - Daily monitoring", knowledge_base_id: "KB1", official_main: "A", official_backup: "B", billing_code: "AO1", note: null, daily_activities: [] },
  { id: "2", name: "Airbus IDoc Extract", knowledge_base_id: "KB2", official_main: "A", official_backup: "B", billing_code: null, note: null, daily_activities: [] },
  { id: "3", name: "API - PI - ASN Create", knowledge_base_id: "KB3", official_main: "A", official_backup: "B", billing_code: "AO2", note: null, daily_activities: [] },
];

function renderPicker(selectedIds = scopes.map((scope) => scope.id)) {
  const onChange = vi.fn();
  render(<AnalyticsScopePicker scopes={scopes} selectedIds={selectedIds} onChange={onChange} />);
  fireEvent.click(screen.getByRole("button", { name: /sélectionner les périmètres/i }));
  return onChange;
}

describe("AnalyticsScopePicker", () => {
  it("recherche un périmètre sans afficher les autres", () => {
    renderPicker();
    fireEvent.change(screen.getByRole("textbox", { name: /rechercher un périmètre/i }), { target: { value: "airbus" } });
    expect(screen.getByRole("checkbox", { name: "Airbus IDoc Extract" })).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: "AH - Daily monitoring" })).not.toBeInTheDocument();
  });

  it("annonce l'absence de résultat", () => {
    renderPicker();
    fireEvent.change(screen.getByRole("textbox", { name: /rechercher un périmètre/i }), { target: { value: "inconnu" } });
    expect(screen.getByText(/Aucun périmètre ne correspond/)).toBeInTheDocument();
  });

  it("utilise les mêmes cases accessibles et sélectionne tout le résultat", () => {
    const onChange = renderPicker([]);
    expect(new Set(screen.getAllByRole("checkbox").map((input) => input.className))).toEqual(new Set([CHECKBOX_CLASS]));
    fireEvent.click(screen.getByRole("button", { name: "Tout cocher" }));
    expect(onChange).toHaveBeenCalledWith(["1", "2", "3"]);
    expect(screen.getByRole("button", { name: "Tout décocher" })).toBeDisabled();
  });

  it("ferme avec Échap", () => {
    renderPicker();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
