import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AUDIT_LOG_PATH } from "../constants/routes";

export function AuditShortcut() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.altKey && event.key.toLowerCase() === "l") {
        event.preventDefault();
        if (pathname !== AUDIT_LOG_PATH) {
          navigate(AUDIT_LOG_PATH);
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate, pathname]);

  return null;
}
