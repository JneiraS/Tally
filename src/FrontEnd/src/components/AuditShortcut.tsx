import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export function AuditShortcut() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.altKey && event.key.toLowerCase() === "l") {
        event.preventDefault();
        if (pathname !== "/audit") {
          navigate("/audit");
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate, pathname]);

  return null;
}
