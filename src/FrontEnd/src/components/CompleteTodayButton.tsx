import { ShieldCheck } from 'lucide-react';

interface CompleteTodayButtonProps {
  onClick: () => void;
  dayLabel?: string;
  disabled?: boolean;
  pending?: boolean;
}

export function CompleteTodayButton({
  onClick,
  dayLabel = "du jour",
  disabled,
  pending,
}: CompleteTodayButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || pending}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-nord-14 bg-emerald-50 hover:bg-emerald-100 dark:bg-nord-14/10 dark:hover:bg-nord-14/20 border border-emerald-200 dark:border-nord-14/40 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-nord-14 disabled:opacity-50 disabled:cursor-not-allowed"
      title={`Marquer l'activité ${dayLabel} comme terminée`}
    >
      {pending ? (
        <span className="w-3.5 h-3.5 border-2 border-emerald-500/30 border-t-emerald-500 dark:border-nord-14/30 dark:border-t-nord-14 rounded-full animate-spin" />
      ) : (
        <ShieldCheck className="w-3.5 h-3.5" />
      )}
      <span>{pending ? 'Validation…' : 'Marquer Terminé'}</span>
    </button>
  );
}
