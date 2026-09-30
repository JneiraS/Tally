import { NavLink } from "react-router-dom";
import { ANALYTICS_PATH, AUDIT_LOG_PATH, SCOPE_LIST_PATH } from "../constants/routes";

const ITEMS = [
  { to: SCOPE_LIST_PATH, label: "Périmètres", end: true },
  { to: ANALYTICS_PATH, label: "Analyse", end: false },
  { to: AUDIT_LOG_PATH, label: "Journal", end: false },
];

/**
 * Navigation entre les trois vues de l'application.
 *
 * Monté deux fois — dans l'en-tête et dans le pied de page mobile — parce que la
 * barre d'en-tête se condense sur petit écran et que la seule navigation alors
 * restante serait un lien « retour » vers la liste. `NavLink` porte l'état actif
 * dans `aria-current`, ce qui donne la même information que la couleur.
 */
export function PageNav({ orientation = "horizontal" }: { orientation?: "horizontal" | "vertical" }) {
  return (
    <nav
      aria-label="Pages principales"
      className={
        orientation === "horizontal"
          ? "flex items-center gap-1"
          : "flex flex-col items-stretch gap-1"
      }
    >
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            [
              "rounded-lg px-3 py-1.5 text-sm transition-colors",
              orientation === "vertical" ? "block text-center" : "",
              isActive
                ? "bg-blue-50 font-medium text-blue-700 dark:bg-nord-9/25 dark:text-nord-8"
                : "text-slate-600 hover:bg-slate-100 dark:text-nord-4 dark:hover:bg-nord-2",
            ].join(" ")
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}