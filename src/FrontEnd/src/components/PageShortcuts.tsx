import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ANALYTICS_PATH, AUDIT_LOG_PAGE_PATH } from "../constants/routes";

/**
 * Raccourcis vers les deux vues qui ne sont plus dans l'en-tête.
 *
 * `Navbar` ne monte plus `PageNav` : "Périmètres" y serait un doublon du logo,
 * qui pointe déjà sur `SCOPE_LIST_PATH`. Analyse et Journal reviennent donc par
 * clavier, et le pied de page garde les trois liens pour le mobile, où il n'y a
 * pas de Ctrl+Alt.
 *
 * Les deux liaisons tiennent dans un seul `keydown` : deux composants
 * équivalents dupliqueraient la même logique de garde.
 *
 * La navigation a lieu même modale ouverte — comme pour Ctrl+Alt+L avant ce
 * changement — donc quitter la page démonte une saisie en cours. C'est le
 * compromis assumé d'un raccourci global : il n'a pas à consulter l'état des
 * modales, qui vit dans `AppContent`.
 */
const SHORTCUTS: ReadonlyArray<readonly [string, string]> = [
  [ANALYTICS_PATH, "g"],
  [AUDIT_LOG_PAGE_PATH, "l"],
];

export function PageShortcuts() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!event.ctrlKey || !event.altKey || event.shiftKey) return;

      const key = event.key.toLowerCase();
      const target = SHORTCUTS.find(([, binding]) => binding === key)?.[0];
      if (target === undefined) return;

      event.preventDefault();
      if (pathname !== target) {
        navigate(target);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate, pathname]);

  return null;
}
