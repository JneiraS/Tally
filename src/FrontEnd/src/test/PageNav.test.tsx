/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PageNav } from "../components/PageNav";
import { ANALYTICS_PATH, AUDIT_LOG_PATH } from "../constants/routes";

function renderNav(path: string, orientation?: "horizontal" | "vertical") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <PageNav orientation={orientation} />
    </MemoryRouter>,
  );
}

describe("PageNav", () => {
  it("présente les trois vues de l'application", () => {
    renderNav(ANALYTICS_PATH);

    const nav = screen.getByRole("navigation", { name: /pages principales/i });
    expect(within(nav).getByRole("link", { name: "Périmètres" })).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: "Analyse" })).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: "Journal" })).toBeInTheDocument();
  });

  it("pointe vers les chemins canoniques, jamais vers des littéraux", () => {
    renderNav(ANALYTICS_PATH);

    expect(screen.getByRole("link", { name: "Analyse" })).toHaveAttribute(
      "href",
      ANALYTICS_PATH,
    );
    expect(screen.getByRole("link", { name: "Journal" })).toHaveAttribute(
      "href",
      AUDIT_LOG_PATH,
    );
  });

  it("marque la vue courante, et elle seule", () => {
    renderNav(ANALYTICS_PATH);

    expect(screen.getByRole("link", { name: "Analyse" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Périmètres" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("ne confond pas la liste avec le détail d'un périmètre", () => {
    // `SCOPE_LIST_PATH` vaut "/" : sans `end`, NavLink la laisserait active
    // sur toutes les pages, et « Périmètres » serait marqué courant partout.
    renderNav("/scopes/s1");

    expect(screen.getByRole("link", { name: "Périmètres" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});