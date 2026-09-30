/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AnalyticsRanking } from "../components/AnalyticsCharts";
import { ScopeMonitoring } from "../types";

function scope(
  id: string,
  name: string,
  billing_code: string | null,
  errors: number,
  incidents: number,
): ScopeMonitoring {
  return {
    id,
    name,
    knowledge_base_id: `KB-${id}`,
    official_main: "MAIN",
    official_backup: "BACK",
    billing_code,
    daily_activities: [
      {
        day: "2026-09-21",
        errors_reported: errors,
        incidents_created: incidents,
        feai: [],
        handled: true,
        completed: true,
      },
    ],
  };
}

// Zéro erreur ⇒ taux **indéfini**, et non 0 % : c'est précisément la distinction
// que la page doit rendre visible. 17 %, 75 % et 100 % couvrent le tri croissant.
const SCOPES = [
  scope("s-mauvais", "Mauvais", null, 6, 1),
  scope("s-moyen", "Moyen", "FACT-2026-PAI", 4, 3),
  scope("s-bon", "Bon taux", null, 3, 3),
  scope("s-aucune-erreur", "Aucune erreur", null, 0, 0),
];

const DAYS = ["2026-09-21"];

function renderRanking(
  metric: "arriere" | "erreurs" | "transformation" = "arriere",
  scopes: ScopeMonitoring[] = SCOPES,
) {
  return render(
    <MemoryRouter>
      <AnalyticsRanking scopes={scopes} days={DAYS} metric={metric} />
    </MemoryRouter>,
  );
}

function items(): HTMLElement[] {
  return within(screen.getByRole("list")).getAllByRole("listitem");
}

/** La ligne d'un périmètre, texte et barre compris. */
function row(name: RegExp): HTMLElement {
  return screen.getByRole("link", { name }).closest("li")!;
}

describe("AnalyticsRanking", () => {
  it("classe du plus dégradé au moins dégradé, quel que soit le sens de la métrique", () => {
    renderRanking("arriere");

    // 5 en attente, 1, puis 0 : l'arriéré est dégressif.
    expect(items()[0]).toHaveTextContent("Mauvais");
    expect(items()[1]).toHaveTextContent("Moyen");
    expect(items()[2]).toHaveTextContent("Bon taux");
    expect(items()[3]).toHaveTextContent("Aucune erreur");
  });

  it("place un taux indéfini en dernier du classement par taux", () => {
    renderRanking("transformation");

    // Croissant : 17 % puis 75 % et 100 %, et le périmètre sans erreur ferme la
    // liste au lieu d'être traité comme un 0 %.
    expect(items()[0]).toHaveTextContent("Mauvais");
    expect(items()[1]).toHaveTextContent("Moyen");
    expect(items()[2]).toHaveTextContent("Bon taux");
    expect(items()[3]).toHaveTextContent("Aucune erreur");
    expect(items()[3]).toHaveTextContent("—");
  });

  it("affiche la valeur en texte, pas seulement par une barre", () => {
    renderRanking("arriere");

    // La barre est décorative : sans la valeur en texte, un lecteur d'écran
    // n'aurait aucun chiffre à lire, et un rate-limit n'aurait aucun moyen de
    // distinguer deux périmètres de même longueur.
    expect(row(/Mauvais/)).toHaveTextContent("5");
    expect(row(/Moyen/)).toHaveTextContent("1");
  });

  it("rattache chaque ligne au détail du périmètre", () => {
    renderRanking("arriere");

    expect(screen.getByRole("link", { name: /Bon taux/ })).toHaveAttribute(
      "href",
      "/scopes/s-bon",
    );
  });

  it("montre le code de facturation à côté du nom, pas dans une infobulle", () => {
    renderRanking("arriere");

    expect(screen.getByLabelText("Code de facturation : FACT-2026-PAI")).toBeInTheDocument();
  });

  it("cale la barre sur le pire périmètre, pour qu'elle ne soit pas décorative", () => {
    renderRanking("arriere");

    // Le pire est à 100 % : sans cette normalisation, le deuxième se
    // retrouverait à 20 % et la comparaison visuelle serait un décor.
    expect(row(/Mauvais/).querySelector("[data-bar]")).toHaveAttribute("data-bar", "100");
    expect(row(/Moyen/).querySelector("[data-bar]")).toHaveAttribute("data-bar", "20");
  });

  it("inverse la longueur de la barre pour le taux, pour qu'elle vexe toujours le même sens", () => {
    const { rerender } = renderRanking("arriere");
    expect(row(/Mauvais/).querySelector("[data-bar]")).toHaveAttribute("data-bar", "100");

    rerender(
      <MemoryRouter>
        <AnalyticsRanking scopes={SCOPES} days={DAYS} metric="transformation" />
      </MemoryRouter>,
    );
    // 17 % de transformation ⇒ 83 d'inverse, alors que « Moyen » à 75 % ne vaut
    // que 25 : une barre non inversée montrerait le meilleur périmètre comme le
    // plus dégradé, à l'encontre de l'ordre des lignes.
    expect(row(/Mauvais/).querySelector("[data-bar]")).toHaveAttribute("data-bar", "83");
    expect(row(/Moyen/).querySelector("[data-bar]")).toHaveAttribute("data-bar", "25");
  });

  it("ne dessine aucune barre pour un taux indéfini", () => {
    renderRanking("transformation");

    // Une barre de longueur nulle se lirait comme un 0 %, ce qui est faux.
    expect(row(/Aucune erreur/).querySelector("[data-bar]")).toBeNull();
  });

  it("annonce les périmètres au-delà du plafond au lieu de les faire disparaître", () => {
    const many = Array.from({ length: 18 }, (_, i) =>
      scope(`s${i}`, `Périmètre ${i}`, null, 18 - i, 0),
    );
    renderRanking("arriere", many);

    expect(items()).toHaveLength(15);
    expect(
      screen.getByText(/3 périmètres au-delà des 15 plus dégradés/i),
    ).toBeInTheDocument();
  });

  it("annonce l'absence de périmètre plutôt qu'une liste vide", () => {
    renderRanking("arriere", []);

    expect(screen.getByText(/Aucun périmètre sur cette période/i)).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
