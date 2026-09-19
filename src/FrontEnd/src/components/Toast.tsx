import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 sm:px-0 pointer-events-none"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isInfo = toast.type === 'info';

        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border transition-all transform duration-200 animate-in fade-in slide-in-from-bottom-4 ${
              isSuccess
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-nord-1 dark:text-nord-14 dark:border-nord-14/40'
                : isError
                ? 'bg-rose-50 text-rose-900 border-rose-200 dark:bg-nord-1 dark:text-nord-11 dark:border-nord-11/40'
                : 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-nord-1 dark:text-nord-8 dark:border-nord-8/40'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-nord-14" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-600 dark:text-nord-11" />}
              {isInfo && <Info className="w-5 h-5 text-blue-600 dark:text-nord-8" />}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight text-current">{toast.title}</p>
              {toast.message && (
                <p className="mt-1 text-xs opacity-90 break-words leading-relaxed text-slate-700 dark:text-nord-4">
                  {toast.message}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Fermer la notification"
              className="shrink-0 -mr-1 -mt-1 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-current/60 hover:text-current transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
