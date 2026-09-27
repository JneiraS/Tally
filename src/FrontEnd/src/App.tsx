import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { AuditShortcut } from "./components/AuditShortcut";
import { ToastProvider } from "./hooks/useToast";
import { ToastContainer } from "./components/Toast";
import { ThemeProvider } from "./hooks/useTheme";
import { ScopeListPage } from "./pages/ScopeListPage";
import { ScopeDetailPage } from "./pages/ScopeDetailPage";
import { AuditLogPage } from "./pages/AuditLogPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { LoginPage } from "./pages/LoginPage";
import { ScopeFormModal } from "./components/ScopeFormModal";
import { CsvImportModal } from "./components/CsvImportModal";
import { WorkingDaysModal } from "./components/WorkingDaysModal";
import { NonWorkingDays } from "./types";
import { DEFAULT_NON_WORKING_DAYS } from "./utils/kpi";
import { ExternalLink, Terminal } from "lucide-react";
import { AuthSession, protabApi } from "./services/api";
import { AUDIT_LOG_PATH } from "./constants/routes";

export default function App() {
  // The provider wraps every branch, including the pre-session and login
  // screens: a page rendered outside it would have no theme at all, and the
  // saved preference would only apply once authenticated (visible flash).
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [isCreateScopeOpen, setIsCreateScopeOpen] = useState(false);
  const [isImportCsvOpen, setIsImportCsvOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isWorkingDaysOpen, setIsWorkingDaysOpen] = useState(false);

  useEffect(() => {
    // A 401 anywhere means the cookie expired: drop the session so the login
    // screen shows instead of a "failed to load" box that retrying cannot fix.
    protabApi.setUnauthorizedHandler(() => setSession(null));
    return () => protabApi.setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    protabApi
      .getSession()
      .then(setSession)
      .catch(() => setSession(null))
      .finally(() => setCheckingSession(false));
  }, []);

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500 dark:bg-nord-0 dark:text-nord-4">
        Chargement...
      </div>
    );
  }

  if (!session) {
    return <LoginPage onAuthenticated={setSession} />;
  }

  const handleLogout = async () => {
    await protabApi.logout().catch(() => undefined);
    setSession(null);
  };

  const handleScopeCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCsvImported = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <BrowserRouter>
      <ToastProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-nord-0 text-slate-900 dark:text-nord-5 selection:bg-blue-100 dark:selection:bg-nord-9/30 dark:selection:text-nord-6 transition-colors duration-150">
            {/* Barre de navigation */}
            <Navbar
              onOpenCreateScope={() => setIsCreateScopeOpen(true)}
              onOpenImportCsv={() => setIsImportCsvOpen(true)}
              projectName={session.project.name}
              quadrigramme={session.quadrigramme}
              onLogout={handleLogout}
              onOpenSettings={() => setIsWorkingDaysOpen(true)}
            />
            <AuditShortcut />

            {/* Contenu principal */}
            <main className="flex-1 max-w-screen-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Routes>
                <Route
                  path="/"
                  element={
                    <ScopeListPage
                      onOpenCreateScope={() => setIsCreateScopeOpen(true)}
                      onOpenImportCsv={() => setIsImportCsvOpen(true)}
                      refreshTrigger={refreshTrigger}
                      nonWorkingDays={
                        session.project.non_working_days ??
                        DEFAULT_NON_WORKING_DAYS
                      }
                    />
                  }
                />
                <Route path="/scopes/:id" element={<ScopeDetailPage />} />
                <Route path={AUDIT_LOG_PATH} element={<AuditLogPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>

            {/* Pied de page informatif */}
            <footer className="border-t border-slate-200 dark:border-nord-2 bg-white dark:bg-nord-1 py-6 mt-12 text-xs text-slate-500 dark:text-nord-4 transition-colors"></footer>

            {/* Modales globales de création et d'import */}
            <ScopeFormModal
              isOpen={isCreateScopeOpen}
              onClose={() => setIsCreateScopeOpen(false)}
              onSuccess={handleScopeCreated}
            />

            <CsvImportModal
              isOpen={isImportCsvOpen}
              onClose={() => setIsImportCsvOpen(false)}
              onSuccess={handleCsvImported}
            />

            <WorkingDaysModal
              isOpen={isWorkingDaysOpen}
              settings={
                session.project.non_working_days ?? DEFAULT_NON_WORKING_DAYS
              }
              onClose={() => setIsWorkingDaysOpen(false)}
              onSaved={(settings: NonWorkingDays) =>
                setSession((current) =>
                  current
                    ? {
                        ...current,
                        project: {
                          ...current.project,
                          non_working_days: settings,
                        },
                      }
                    : current,
                )
              }
            />

            {/* Notifications Toast */}
            <ToastContainer />
          </div>
        </ToastProvider>
    </BrowserRouter>
  );
}
