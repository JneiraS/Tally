/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SupervisionGrid } from "../components/SupervisionGrid";
import { ScopeMonitoring } from "../types";
import { formatDateFr } from "../utils/date";

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

function renderGrid(days = DAYS, scopes = SCOPES) {
  return render(
    <MemoryRouter>
      <SupervisionGrid scopes={scopes} days={days} />
    </MemoryRouter>,
  );
}

describe("SupervisionGrid", () => {
  it("nomme l'état de chaque cellule pour un lecteur d'écran", () => {
    renderGrid();

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
    renderGrid();

    expect(
      screen.getByRole("img", {
        name: /2 périmètres sur 2 jours, 1 traité, 1 en cours, 2 non saisis/i,
      }),
    ).toBeInTheDocument();
  });

  it("donne un en-tête par jour, pour balayer la ligne de gauche à droite", () => {
    renderGrid();

    const table = screen.getByRole("table");
    expect(within(table).getByRole("columnheader", { name: /21/ })).toBeInTheDocument();
    expect(within(table).getByRole("columnheader", { name: /22/ })).toBeInTheDocument();
  });

  it("rattache chaque ligne à son périmètre et affiche son code de facturation", () => {
    renderGrid();

    expect(screen.getByRole("link", { name: "Ouvrir le détail de Alpha" })).toHaveAttribute(
      "href",
      "/scopes/s1",
    );
    expect(screen.getByLabelText("Code de facturation : FACT-2026-PAI")).toBeInTheDocument();
    expect(screen.getByLabelText("Code de facturation non renseigné")).toHaveTextContent("—");
  });

  it("annonce l'absence de journée plutôt qu'un tableau vide", () => {
    renderGrid([], []);

    expect(screen.getByText(/Aucune journée sur cette période/i)).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("annonce l'absence de périmètre sans masquer les en-têtes de jours", () => {
    renderGrid(DAYS, []);

    expect(screen.getByText(/Aucun périmètre sélectionné/i)).toBeInTheDocument();
  });
});

describe("SupervisionGrid — tenue dans la largeur", () => {
  // Une période de 60 jours est la raison d'être de la page : c'est là que la
  // grille doit tenir sans barre de défilement horizontal.
  const LONG_DAYS = Array.from({ length: 60 }, (_, i) => {
    const day = new Date(Date.UTC(2026, 6, 6 + i));
    return day.toISOString().slice(0, 10);
  });

  it("affiche toutes les journées de la période, aucune n'est masquée", () => {
    renderGrid(LONG_DAYS);

    // 60 jours × 2 périmètres : le garde-fou contre un plafond silencieux qui
    // tronquerait la période sans le dire.
    expect(screen.getAllByRole("cell")).toHaveLength(60 * SCOPES.length + SCOPES.length);
    expect(within(screen.getByRole("table")).getAllByRole("columnheader")).toHaveLength(62);
  });

  it("ne déborde jamais : largeur fixée par le tableau, pas par son contenu", () => {
    const { container } = renderGrid(LONG_DAYS);

    const table = container.querySelector("table")!;
    // `min-w-max` ferait porter la largeur au contenu et déborderait dès ~15
    // jours ; c'est ce qui affichait une barre de défilement.
    expect(table.className).toContain("table-fixed");
    expect(table.className).not.toContain("min-w-max");
    expect(container.querySelector(".overflow-x-auto")).toBeNull();
  });

  it("nomme chaque colonne même quand son libellé visible est masqué", () => {
    renderGrid(LONG_DAYS);

    // Le libellé n'est affiché qu'une colonne sur N, pour qu'ils ne se
    // chevauchent pas : les colonnes muettes gardent donc un nom accessible.
    const headers = within(screen.getByRole("table")).getAllByRole("columnheader");
    const visibleLabels = headers.flatMap((th) =>
      Array.from(th.querySelectorAll("span")).filter(
        (span) => !span.className.includes("sr-only") && span.textContent?.trim(),
      ),
    );

    // 60 jours / 12 labels ⇒ un libellé toutes les 5 colonnes, plus le dernier.
    expect(visibleLabels).toHaveLength(13);

    // La colonne muette reste nommée pour un lecteur d'écran.
    expect(headers[2].textContent?.trim()).toBe(formatDateFr(LONG_DAYS[1]));
    expect(headers[2].querySelector(".sr-only")).toHaveTextContent(
      formatDateFr(LONG_DAYS[1]),
    );

    // La dernière colonne est toujours étiquetée : c'est celle qu'on lit en
    // premier en arrivant par la droite.
    expect(visibleLabels.at(-1)).toHaveTextContent(
      formatDateFr(LONG_DAYS[LONG_DAYS.length - 1]),
    );
  });

  it("laisse le nom du périmètre s'ellipse au lieu d'élargir la colonne", () => {
    renderGrid();

    // Un nom `truncate` dans une rangée flex a besoin de `min-w-0` sur l'item
    // lui-même : sans lui, `min-width: auto` empêche le rétrécissement sous la
    // largeur du texte et la colonne déborde.
    expect(screen.getByRole("link", { name: "Ouvrir le détail de Alpha" }).className).toContain(
      "min-w-0",
    );
  });
});
