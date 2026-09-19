import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="py-16 text-center space-y-4">
      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-nord-1 text-slate-500 dark:text-nord-4 flex items-center justify-center mx-auto">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-nord-6">Page introuvable (404)</h1>
      <p className="text-sm text-slate-500 dark:text-nord-4 max-w-sm mx-auto">
        La page ou la ressource que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-nord-10 dark:hover:bg-nord-9 rounded-lg shadow-xs transition-colors"
      >
        <Home className="w-4 h-4" />
        Retour à l'accueil
      </Link>
    </div>
  );
}
