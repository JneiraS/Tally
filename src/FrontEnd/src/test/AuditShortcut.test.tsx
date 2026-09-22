/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, fireEvent } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { AuditShortcut } from "../components/AuditShortcut";

function LocationProbe() {
  const { pathname } = useLocation();
  return <span data-testid="pathname">{pathname}</span>;
}

function renderWithShortcut(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuditShortcut />
      <LocationProbe />
    </MemoryRouter>,
  );
}

const getPath = () =>
  document.querySelector('[data-testid="pathname"]')?.textContent;

function pressKeys(init: KeyboardEventInit) {
  fireEvent.keyDown(window, { key: "l", ...init });
}

describe("AuditShortcut Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("navigue vers /audit avec Ctrl+Alt+L", () => {
    renderWithShortcut("/");

    pressKeys({ ctrlKey: true, altKey: true });

    expect(getPath()).toBe("/audit");
  });

  it("ne fait rien quand on est déjà sur /audit", () => {
    renderWithShortcut("/audit");

    pressKeys({ ctrlKey: true, altKey: true });

    expect(getPath()).toBe("/audit");
  });

  it("ignore une simple touche A", () => {
    renderWithShortcut("/");

    pressKeys({});

    expect(getPath()).toBe("/");
  });

  it("ignore une combinaison différente", () => {
    renderWithShortcut("/");

    pressKeys({ ctrlKey: true, shiftKey: true });

    expect(getPath()).toBe("/");
  });
});
