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

  it("navigue vers /6d857a9d14aa1d6ce76921219a77b5214f9a293c81717605c2c76d4d83747e9ef1bbd04a2ea1dbe80ade21e5f5ba66d9 avec Ctrl+Alt+L", () => {
    renderWithShortcut("/");

    pressKeys({ ctrlKey: true, altKey: true });

    expect(getPath()).toBe(
      "/6d857a9d14aa1d6ce76921219a77b5214f9a293c81717605c2c76d4d83747e9ef1bbd04a2ea1dbe80ade21e5f5ba66d9",
    );
  });

  it("ne fait rien quand on est déjà sur /6d857a9d14aa1d6ce76921219a77b5214f9a293c81717605c2c76d4d83747e9ef1bbd04a2ea1dbe80ade21e5f5ba66d9", () => {
    renderWithShortcut(
      "/6d857a9d14aa1d6ce76921219a77b5214f9a293c81717605c2c76d4d83747e9ef1bbd04a2ea1dbe80ade21e5f5ba66d9",
    );

    pressKeys({ ctrlKey: true, altKey: true });

    expect(getPath()).toBe(
      "/6d857a9d14aa1d6ce76921219a77b5214f9a293c81717605c2c76d4d83747e9ef1bbd04a2ea1dbe80ade21e5f5ba66d9",
    );
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
