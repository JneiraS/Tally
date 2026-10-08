import { expect } from "vitest";

/**
 * Un conteneur qui abrite un popover ne doit pas rogner ses enfants débordants.
 *
 * **Garde-fou de classe, pas preuve de rendu.** jsdom calcule aucun layout *et*
 * ne charge pas Tailwind : `getComputedStyle(container).overflow` renverrait
 * `visible` quel que soit le `className`, donc une assertion sur le style
 * calculé passerait toujours — un test vert qui ne prouve rien (AGENTS.md
 * §28.6). La chaîne de classes est la seule chose vérifiable ici ; la preuve
 * réelle reste un coup d'œil sur la page.
 *
 * `ScopePicker` ouvre son popover en `position: absolute` à l'intérieur de la
 * carte de filtres. Tout `overflow-*` sur cette carte crée une boîte de rognage
 * qui coupe le popover à son bord bas, sans le moindre symptôme côté console.
 */
export function expectDoesNotClip(container: HTMLElement): void {
  const clipping = (container.getAttribute("class") ?? "")
    .split(/\s+/)
    .filter((token) => /^overflow(-\S+)?$/.test(token));

  expect(clipping, `classe de rognage sur ${container.tagName}`).toEqual([]);
}
