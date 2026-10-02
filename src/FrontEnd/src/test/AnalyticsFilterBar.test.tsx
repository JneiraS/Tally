/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { AnalyticsFilterBar, type AnalyticsFilters } from "../components/AnalyticsFilterBar";
import { CHECKBOX_CLASS } from "../constants/ui";
import type { ScopeMonitoring } from "../types";
import { makeScope } from "./factories";

function scope(id: string, name: string, billing_code: string | null = null): ScopeMonitoring {
  return makeScope({ id, name, knowledge_base_id: `KB-${id}`, billing_code });
}

const MANY = Array.from({ length: 20 }, (_, i) => scope(`s${i}`, `Périmètre ${i + 1}`));
const FILTERS: AnalyticsFilters = {
  from: "2026-09-01",
  to: "2026-09-21",
  preset: "mois",
  granularity: "jour",
  workingDaysOnly: true,
  compare: false,
  scopeIds: MANY.map((item) => item.id),
  billingCodes: [],
};

function renderBar(scopes: ScopeMonitoring[] = MANY, filters = FILTERS) {
  const onChange = vi.fn();
  render(
    <AnalyticsFilterBar
      filters={filters}
      onChange={onChange}
      scopes={scopes}
      nonWorkingDays={{ excluded_weekdays: [6, 7], excluded_dates: [] }}
      onExport={() => undefined}
    />,
  );
  return onChange;
}

describe("AnalyticsFilterBar", () => {
  it("n'affiche pas les périmètres tant que le sélecteur est fermé", () => {
    renderBar();

    expect(screen.getByText("20 périmètres sélectionnés sur 20")).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: "Périmètre 1" })).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("ouvre un sélecteur recherché et permet de cocher un périmètre", () => {
    const onChange = renderBar();

    fireEvent.click(screen.getByRole("button", { name: /sélectionner les périmètres/i }));
    expect(screen.getByRole("dialog", { name: /sélection des périmètres/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: "Périmètre 3" }));
    expect(onChange).toHaveBeenCalledWith({ scopeIds: MANY.map((item) => item.id).filter((id) => id !== "s2") });

    fireEvent.change(screen.getByRole("textbox", { name: /rechercher un périmètre/i }), { target: { value: "20" } });
    expect(screen.getByRole("checkbox", { name: "Périmètre 20" })).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: "Périmètre 1" })).not.toBeInTheDocument();
  });

  it("permet de tout sélectionner et tout désélectionner dans la liste", () => {
    const filters = { ...FILTERS, scopeIds: [] };
    const onChange = renderBar(MANY, filters);
    fireEvent.click(screen.getByRole("button", { name: /sélectionner les périmètres/i }));

    fireEvent.click(screen.getByRole("button", { name: "Tout cocher" }));
    expect(onChange).toHaveBeenCalledWith({ scopeIds: MANY.map((item) => item.id) });
    expect(screen.getByRole("button", { name: "Tout décocher" })).toBeDisabled();
  });

  it("utilise un groupe compact et multi-sélectionnable pour les codes", () => {
    const scopes = [scope("s1", "Alpha", "FAC-A"), scope("s2", "Beta", "FAC-B"), scope("s3", "Gamma")];
    const onChange = renderBar(scopes, { ...FILTERS, scopeIds: scopes.map((item) => item.id) });

    expect(screen.getByRole("button", { name: "Tous" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "FAC-A" }));
    expect(onChange).toHaveBeenCalledWith({ billingCodes: ["FAC-A"] });
    expect(screen.getByRole("button", { name: "Sans code" })).toBeInTheDocument();
  });

  it("révèle les dates uniquement pour une période personnalisée", () => {
    renderBar();
    expect(screen.queryByLabelText("Période : début")).not.toBeInTheDocument();
    // Le composant parent contrôle les filtres : le clic émet le patch, puis
    // le parent remonte la nouvelle valeur au rendu suivant.
    renderBar(MANY, { ...FILTERS, preset: "perso" });
    expect(screen.getByLabelText("Période : début")).toBeInTheDocument();
    expect(screen.getByLabelText("Période : fin")).toBeInTheDocument();
  });

  it("garde le même style pour les options checkbox", () => {
    renderBar();
    const classes = new Set(screen.getAllByRole("checkbox").map((input) => input.getAttribute("class")));
    expect(classes).toEqual(new Set([CHECKBOX_CLASS]));
  });

  it("garde le bouton d'export existant", () => {
    const onExport = vi.fn();
    render(
      <AnalyticsFilterBar
        filters={FILTERS}
        onChange={() => undefined}
        scopes={MANY}
        nonWorkingDays={{ excluded_weekdays: [6, 7], excluded_dates: [] }}
        onExport={onExport}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /exporter la sélection/i }));
    expect(onExport).toHaveBeenCalledOnce();
  });
});
