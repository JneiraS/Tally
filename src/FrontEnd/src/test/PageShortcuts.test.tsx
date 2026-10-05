/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, fireEvent } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { PageShortcuts } from "../components/PageShortcuts";
import { ANALYTICS_PATH, AUDIT_LOG_PAGE_PATH } from "../constants/routes";

function LocationProbe() {
  const { pathname } = useLocation();
  return <span data-testid="pathname">{pathname}</span>;
}

function renderWithShortcuts(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <PageShortcuts />
      <LocationProbe />
    </MemoryRouter>,
  );
}

const getPath = () =>
  document.querySelector('[data-testid="pathname"]')?.textContent;

function pressKeys(init: KeyboardEventInit) {
  fireEvent.keyDown(window, { key: "l", ...init });
}

describe("PageShortcuts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("navigue vers le journal avec Ctrl+Alt+L", () => {
    renderWithShortcuts("/");

    pressKeys({ ctrlKey: true, altKey: true });

    expect(getPath()).toBe(AUDIT_LOG_PAGE_PATH);
  });

  it("navigue vers l'analyse avec Ctrl+Alt+G", () => {
    renderWithShortcuts("/");

    pressKeys({ key: "g", ctrlKey: true, altKey: true });

    expect(getPath()).toBe(ANALYTICS_PATH);
  });

  it("sert les deux liaisons depuis le même écouteur", () => {
    // Un `keydown` par composant aurait laissé l'un des deux inerte : c'est le
    // cas qu'un test isolé par cible ne voit pas.
    renderWithShortcuts("/");

    pressKeys({ key: "g", ctrlKey: true, altKey: true });
    expect(getPath()).toBe(ANALYTICS_PATH);

    pressKeys({ key: "l", ctrlKey: true, altKey: true });
    expect(getPath()).toBe(AUDIT_LOG_PAGE_PATH);
  });

  it("accepte la touche en majuscule", () => {
    renderWithShortcuts("/");

    pressKeys({ key: "G", ctrlKey: true, altKey: true });

    expect(getPath()).toBe(ANALYTICS_PATH);
  });

  it("ne fait rien quand on est déjà sur la cible", () => {
    renderWithShortcuts(AUDIT_LOG_PAGE_PATH);

    pressKeys({ ctrlKey: true, altKey: true });

    expect(getPath()).toBe(AUDIT_LOG_PAGE_PATH);
  });

  it("ignore une simple touche A", () => {
    renderWithShortcuts("/");

    pressKeys({});

    expect(getPath()).toBe("/");
  });

  it("ignore Ctrl+Alt sans lettre liée", () => {
    renderWithShortcuts("/");

    pressKeys({ key: "z", ctrlKey: true, altKey: true });

    expect(getPath()).toBe("/");
  });

  it("ignore une combinaison différente", () => {
    renderWithShortcuts("/");

    pressKeys({ ctrlKey: true, shiftKey: true });

    expect(getPath()).toBe("/");
  });

  it("ignore Ctrl+Alt+Maj+L, qui n'est pas la liaison", () => {
    // Sans le refus de `shiftKey`, l'app capturerait une mainlevée que le
    // bureau peut envoyer pour autre chose.
    renderWithShortcuts("/");

    pressKeys({ key: "l", ctrlKey: true, altKey: true, shiftKey: true });

    expect(getPath()).toBe("/");
  });
});
