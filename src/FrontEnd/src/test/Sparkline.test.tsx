/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sparkline } from "../components/Sparkline";

describe("Sparkline", () => {
  it("ne rend rien pour une série vide", () => {
    render(<Sparkline values={[]} tone="amber" label="Test" />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("ne rend rien pour une série entièrement à zéro", () => {
    render(<Sparkline values={[0, 0, 0]} tone="amber" label="Test" />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("génère un chemin SVG qui varie avec les données", () => {
    const { container: c1 } = render(<Sparkline values={[1, 2, 3]} tone="amber" label="Test" />);
    const { container: c2 } = render(<Sparkline values={[3, 2, 1]} tone="amber" label="Test" />);
    const path1 = c1.querySelector("path")?.getAttribute("d");
    const path2 = c2.querySelector("path")?.getAttribute("d");
    expect(path1).not.toBe(path2);
  });

  it("respecte le domaine fixe quand il est fourni", () => {
    const { container } = render(<Sparkline values={[50, 75]} domain={[0, 100]} tone="emerald" label="Test" />);
    const path = container.querySelector("path")?.getAttribute("d");
    expect(path).toBeTruthy();
  });

  it("porte le libellé accessible", () => {
    render(<Sparkline values={[1, 2, 3]} tone="rose" label="Tendance des erreurs : de 1 à 2" />);
    expect(screen.getByRole("img", { name: /Tendance des erreurs : de 1 à 2/ })).toBeInTheDocument();
  });

  it("n'a aucun nœud texte dans le SVG", () => {
    const { container } = render(<Sparkline values={[1, 2, 3]} tone="blue" label="Test" />);
    const svg = container.querySelector("svg");
    const textNodes = Array.from(svg?.childNodes ?? []).filter((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim());
    expect(textNodes.length).toBe(0);
  });

  it("applique la couleur via currentColor et le ton", () => {
    const { container } = render(<Sparkline values={[1, 2, 3]} tone="amber" label="Test" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("text-amber-600");
  });
});