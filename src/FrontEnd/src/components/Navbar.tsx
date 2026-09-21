import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Activity, Plus, UploadCloud, Sun, Moon } from "lucide-react";
import { protabApi } from "../services/api";
import { useToast } from "../hooks/useToast";
import { useTheme } from "../hooks/useTheme";

interface NavbarProps {
  onOpenCreateScope: () => void;
  onOpenImportCsv: () => void;
  projectName: string;
  quadrigramme: string;
  onLogout: () => void;
}

export function Navbar({ onOpenCreateScope, onOpenImportCsv, projectName, quadrigramme, onLogout }: NavbarProps) {
  const { info, success } = useToast();
  const { isNord, toggleTheme } = useTheme();
  const [isCheckingServer, setIsCheckingServer] = useState(false);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);

  const checkStatus = async () => {
    setIsCheckingServer(true);
    try {
      const ok = await protabApi.checkBackendHealth();
      setServerOnline(ok);
      if (ok) {
        success("Backend connecté", "Le serveur répond correctement.");
      } else {
        info("Backend déconnecté", "Le serveur ne répond pas.");
      }
    } finally {
      setIsCheckingServer(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <header className="bg-white dark:bg-nord-0/95 border-b border-slate-200 dark:border-nord-2 sticky top-0 z-40 transition-colors backdrop-blur-md">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Titre */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-nord-8 rounded-lg p-1 -m-1"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 dark:bg-nord-9 text-white flex items-center justify-center shadow-xs">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-nord-6 text-lg tracking-tight flex items-center gap-1.5">
                  ProTab
                  <span className="text-[11px] font-semibold uppercase tracking-wider bg-blue-50 dark:bg-nord-10/25 text-blue-700 dark:text-nord-8 px-1.5 py-0.5 rounded border border-blue-200 dark:border-nord-9/40">
                    Supervision
                  </span>
                </span>
                <p className="text-xs text-slate-500 dark:text-nord-4 hidden sm:block">
                  Suivi d'activité quotidienne par périmètre
                </p>
              </div>
            </Link>
          </div>

          {/* Actions & Indicateur API */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden lg:block text-right text-xs">
              <p className="font-semibold text-slate-700 dark:text-nord-5">{projectName}</p>
              <p className="text-slate-500 dark:text-nord-4">{quadrigramme}</p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-nord-2 dark:text-nord-5 dark:hover:bg-nord-2"
            >
              Déconnexion
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-nord-5 bg-white dark:bg-nord-1 hover:bg-slate-50 dark:hover:bg-nord-2 border border-slate-300 dark:border-nord-2 rounded-lg shadow-2xs transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-nord-8"
              title={
                isNord
                  ? "Passer au thème clair"
                  : "Activer le thème sombre Nord"
              }
              aria-label={
                isNord
                  ? "Passer au thème clair"
                  : "Activer le thème sombre Nord"
              }
            >
              {isNord ? (
                <>
                  <Sun className="w-4 h-4 text-nord-13" />
                  <span className="hidden sm:inline">Clair</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-nord-10" />
                  <span className="hidden sm:inline">Nord</span>
                </>
              )}
            </button>

            {/* Boutons d'action rapides */}
            <button
              type="button"
              onClick={onOpenImportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-nord-5 hover:text-slate-900 dark:hover:text-nord-6 bg-white dark:bg-nord-1 hover:bg-slate-50 dark:hover:bg-nord-2 border border-slate-300 dark:border-nord-2 rounded-lg shadow-2xs transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-nord-8"
            >
              <UploadCloud className="w-4 h-4 text-slate-500 dark:text-nord-4" />
              <span className="hidden sm:inline">Import CSV</span>
            </button>

            <button
              type="button"
              onClick={onOpenCreateScope}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-nord-10 dark:hover:bg-nord-9 active:bg-blue-800 rounded-lg shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-nord-8"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Périmètre</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
