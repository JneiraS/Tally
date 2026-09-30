/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SupervisionGrid } from "../components/SupervisionGrid";
import { ScopeMonitoring } from "../types";

function scope(
  id: string,
  name: string,
  billing_code: string | null,
  daily_activities: ScopeMonitoring["daily_activities"],
): ScopeMonitoring {
  return {
    id,
    name,
    knowledge_base_id: `KB-${id}`,
    official_main: "MAIN",
    official_backup: "BACK",
    billing_code,
    daily_activities,
  };
}

const SCOPES = [
  scope("s1", "Alpha", "FACT-2026-PAI", [
    {
      day: "2026-09-21",
      errors_reported: 4,
      incidents_created: 1,
      feai: [],
      handled: true,
      completed: true,
    },
    {
      day: "2026-09-22",
      errors_reported: 2,
      incidents_created: 0,
      feai: [],
      handled: true,
      completed: false,
    },
  ]),
  scope("s2", "Beta", null, []),
];

const DAYS = ["2026-09-21", "2026-09-22"];

describe("SupervisionGrid", () => {
  it("nomme l'état de chaque cellule pour un lecteur d'écran", () => {
    render(
      <MemoryRouter>
        <SupervisionGrid scopes={SCOPES} days={DAYS} />
      </MemoryRouter>,
    );

    expect(
      screen.getByLabelText("Alpha, lundi 21 septembre 2026 : traité, 3 en attente"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Alpha, mardi 22 septembre 2026 : en cours, 2 en attente"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Beta, lundi 21 septembre 2026 : non saisi"),
    ).toBeInTheDocument();
  });

  it("donne un résumé chiffré de la grille, la couleur ne suffisant pas", () => {
    render(
      <MemoryRouter>
        <SupervisionGrid scopes={SCOPES} days={DAYS} />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("img", { name: /2 périmètres sur 2 jours, 1 traité, 1 en cours, 2 non saisis/i }),
    ).toBeInTheDocument();
  });

  it("donne un en-tête par jour, pour balayer la ligne de gauche à droite", () => {
    render(
      <MemoryRouter>
        <SupervisionGrid scopes={SCOPES} days={DAYS} />
      </MemoryRouter>,
    );

    const table = screen.getByRole("table");
    expect(within(table).getByRole("columnheader", { name: /21/ })).toBeInTheDocument();
    expect(within(table).getByRole("columnheader", { name: /22/ })).toBeInTheDocument();
  });

  it("rattache chaque ligne à son périmètre et affiche son code de facturation", () => {
    render(
      <MemoryRouter>
        <SupervisionGrid scopes={SCOPES} days={DAYS} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Ouvrir le détail de Alpha" })).toHaveAttribute(
      "href",
      "/scopes/s1",
    );
    expect(screen.getByLabelText("Code de facturation : FACT-2026-PAI")).toBeInTheDocument();
    expect(screen.getByLabelText("Code de facturation non renseigné")).toHaveTextContent("—");
  });

  it("annonce l'absence de journée plutôt qu'un tableau vide", () => {
    render(
      <MemoryRouter>
        <SupervisionGrid scopes={[]} days={[]} />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Aucune journée sur cette période/i)).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("annonce l'absence de périmètre sans masquer les en-têtes de jours", () => {
    render(
      <MemoryRouter>
        <SupervisionGrid scopes={[]} days={DAYS} />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Aucun périmètre sélectionné/i)).toBeInTheDocument();
  });
});