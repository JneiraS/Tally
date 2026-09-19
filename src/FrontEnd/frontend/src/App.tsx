import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ToastProvider } from './hooks/useToast';
import { ToastContainer } from './components/Toast';
import { ThemeProvider } from './hooks/useTheme';
import { ScopeListPage } from './pages/ScopeListPage';
import { ScopeDetailPage } from './pages/ScopeDetailPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ScopeFormModal } from './components/ScopeFormModal';
import { CsvImportModal } from './components/CsvImportModal';
import { ExternalLink, Terminal } from 'lucide-react';

export default function App() {
  const [isCreateScopeOpen, setIsCreateScopeOpen] = useState(false);
  const [isImportCsvOpen, setIsImportCsvOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleScopeCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCsvImported = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <ThemeProvider>
      <BrowserRouter>
        <ToastProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-nord-0 text-slate-900 dark:text-nord-5 selection:bg-blue-100 dark:selection:bg-nord-9/30 dark:selection:text-nord-6 transition-colors duration-150">
            {/* Barre de navigation */}
            <Navbar
              onOpenCreateScope={() => setIsCreateScopeOpen(true)}
              onOpenImportCsv={() => setIsImportCsvOpen(true)}
            />

            {/* Contenu principal */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Routes>
                <Route
                  path="/"
                  element={
                    <ScopeListPage
                      onOpenCreateScope={() => setIsCreateScopeOpen(true)}
                      onOpenImportCsv={() => setIsImportCsvOpen(true)}
                      refreshTrigger={refreshTrigger}
                    />
                  }
                />
                <Route path="/scopes/:id" element={<ScopeDetailPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>

            {/* Pied de page informatif */}
            <footer className="border-t border-slate-200 dark:border-nord-2 bg-white dark:bg-nord-1 py-6 mt-12 text-xs text-slate-500 dark:text-nord-4 transition-colors">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700 dark:text-nord-6">ProTab Scope Monitoring</span>
                  <span>•</span>
                  <span>Projection et supervision d'activité quotidienne</span>
                </div>

                <div className="flex items-center gap-4">
                  <a
                    href="http://localhost:8000/docs"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-slate-600 dark:text-nord-4 hover:text-blue-600 dark:hover:text-nord-8 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Swagger Backend (localhost:8000/docs)</span>
                  </a>
                  <span className="text-slate-300 dark:text-nord-3">|</span>
                  <span className="inline-flex items-center gap-1 text-slate-400 dark:text-nord-3 font-mono">
                    <Terminal className="w-3 h-3" />
                    make run
                  </span>
                </div>
              </div>
            </footer>

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

            {/* Notifications Toast */}
            <ToastContainer />
          </div>
        </ToastProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
