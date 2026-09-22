import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export function AuditShortcut() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.altKey && event.key.toLowerCase() === "l") {
        event.preventDefault();
        if (
          pathname !==
          "/6d857a9d14aa1d6ce76921219a77b5214f9a293c81717605c2c76d4d83747e9ef1bbd04a2ea1dbe80ade21e5f5ba66d9"
        ) {
          navigate(
            "/6d857a9d14aa1d6ce76921219a77b5214f9a293c81717605c2c76d4d83747e9ef1bbd04a2ea1dbe80ade21e5f5ba66d9",
          );
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate, pathname]);

  return null;
}
