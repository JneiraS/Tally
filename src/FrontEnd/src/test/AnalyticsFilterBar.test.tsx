/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { AnalyticsFilterBar, type AnalyticsFilters } from "../components/AnalyticsFilterBar";
import { CHECKBOX_CLASS } from "../constants/ui";
import { ScopeMonitoring } from "../types";

function scope(id: string, name: string): ScopeMonitoring {
  return {
    id,
    name,
    knowledge_base_id: `KB-${id}`,
    official_main: "MAIN",
    official_backup: "BACK",
    billing_code: null,
    daily_activities: [],
  };
}

function codedScope(id: string, name: string, billing_code: string | null): ScopeMonitoring {
  return { ...scope(id, name), billing_code };
}

const MANY = Array.from({ length: 20 }, (_, i) => scope(`s${i}`, `Périmètre ${i + 1}`));

const FILTERS: AnalyticsFilters = {
  from: "2026-09-01",
  to: "2026-09-21",
  preset: "mois",
  granularity: "jour",
  workingDaysOnly: true,
  compare: false,
  scopeIds: MANY.map((s) => s.id),
  billingCodes: [],
};

function renderBar(scopes: ScopeMonitoring[] = MANY, filters: AnalyticsFilters = FILTERS) {
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

describe("AnalyticsFilterBar — sélection des périmètres", () => {
  /**
   * La carte contient d'autres cases à cocher (« Jours ouvrés uniquement »,
   * « Comparer ») : compter globalement n'aurait aucun sens, il faut la liste des
   * périmètres — celle qui est étiquetée et servait de cible au défilement.
   */
  function scopeChips() {
    return within(
      screen.getByRole("list", { name: "Périmètres comparés" }),
    ).queryAllByRole("checkbox");
  }

  it("n'a aucune liste défilante, la barre de filtres reste compacte", () => {
    const { container } = render(
      <AnalyticsFilterBar
        filters={FILTERS}
        onChange={() => undefined}
        scopes={MANY}
        nonWorkingDays={{ excluded_weekdays: [6, 7], excluded_dates: [] }}
        onExport={() => undefined}
      />,
    );

    // Un `max-h-*` avec `overflow-y-auto` afficherait une barre de défilement
    // dès cinq périmètres, pour une simple liste de cases à cocher.
    expect(container.querySelector(".overflow-y-auto")).toBeNull();
    expect(container.innerHTML).not.toContain("max-h-28");
  });

  it("présente les périmètres en pastilles cliquables", () => {
    renderBar();

    const selected = screen.getByRole("checkbox", { name: "Périmètre 1" });
    const selectedChip = selected.closest("label");
    expect(selected).toBeInTheDocument();
    expect(selectedChip?.className).toContain("rounded-lg");
    expect(selectedChip?.className).toContain("dark:bg-nord-9/20");
    expect(selectedChip?.className).toContain("dark:text-nord-6");
    expect(selected.className).toContain("dark:accent-nord-8");
  });

  it("garde une pastille non sélectionnée lisible en thème sombre", () => {
    const filters = { ...FILTERS, scopeIds: FILTERS.scopeIds.filter((id) => id !== "s1") };
    renderBar(MANY, filters);

    const unselected = screen.getByRole("checkbox", { name: "Périmètre 2" });
    const unselectedChip = unselected.closest("label");
    expect(unselectedChip?.className).toContain("dark:bg-nord-0");
    expect(unselectedChip?.className).toContain("dark:text-nord-4");
    expect(unselectedChip?.className).toContain("dark:hover:text-nord-6");
  });

  it("permet de sélectionner un code de facturation", () => {
    const scopes = [
      codedScope("s1", "Alpha", "FAC-A"),
      codedScope("s2", "Beta", "FAC-B"),
      codedScope("s3", "Gamma", null),
    ];
    const filters = { ...FILTERS, scopeIds: scopes.map((scope) => scope.id), billingCodes: [] };
    const onChange = renderBar(scopes, filters);

    expect(screen.getByRole("checkbox", { name: "FAC-A" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Sans code" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("checkbox", { name: "FAC-A" }));

    expect(onChange).toHaveBeenCalledWith({ billingCodes: ["FAC-A"] });
  });

  /**
   * Garde-fou de classe, pas test de rendu : jsdom ne calcule aucune couleur, il
   * ne pourrait donc pas prouver le rendu. Ce qui est vérifiable ici, et qui a
   * déjà dérivé, c'est l'unicité du style dans toute la carte — les cases
   * isolées de « Affichage » et les pastilles partageaient avant trois
   * hauteurs, `text-*` contre `accent-*` et deux jetons de bordure.
   */
  it("applique le même style à toutes les cases de la carte", () => {
    const scopes = [
      codedScope("s1", "Alpha", "FAC-A"),
      codedScope("s2", "Beta", "FAC-B"),
    ];
    renderBar(scopes, { ...FILTERS, scopeIds: scopes.map((scope) => scope.id) });

    const classes = new Set(
      screen.getAllByRole("checkbox").map((input) => input.getAttribute("class")),
    );

    expect(classes.size).toBe(1);
    expect([...classes][0]).toBe(CHECKBOX_CLASS);
  });

  it("n'affiche qu'un lot de pastilles et renvoie le reste derrière un bouton", () => {
    renderBar();

    expect(scopeChips()).toHaveLength(12);
    expect(screen.getByRole("button", { name: /\+8 autres/i })).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: "Périmètre 20" })).not.toBeInTheDocument();
  });

  it("déplie les autres pastilles en ligne, sans modale ni nouvelle barre", () => {
    const { container } = render(
      <AnalyticsFilterBar
        filters={FILTERS}
        onChange={() => undefined}
        scopes={MANY}
        nonWorkingDays={{ excluded_weekdays: [6, 7], excluded_dates: [] }}
        onExport={() => undefined}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /\+8 autres/i }));

    // Le déploiement se fait dans la carte de filtres : une modale n'aurait ici
    // qu'un « Annuler » en doublon de celui de la page, et son « Valider » aussi.
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(scopeChips()).toHaveLength(20);
    expect(container.querySelector(".overflow-y-auto")).toBeNull();
    expect(screen.getByRole("button", { name: /− replier/i })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("décoche un périmètre en propageant la nouvelle sélection", () => {
    const onChange = renderBar();

    fireEvent.click(screen.getByRole("checkbox", { name: "Périmètre 3" }));

    expect(onChange).toHaveBeenCalledWith({
      scopeIds: MANY.map((s) => s.id).filter((id) => id !== "s2"),
    });
  });

  it("annonce le compte de sélection et permet de tout cocher ou décocher", () => {
    renderBar();

    expect(screen.getByText("20 périmètres sur 20")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Tout sélectionner/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Tout désélectionner/i })).toBeInTheDocument();
  });
});
