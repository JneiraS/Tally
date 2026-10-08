import { Check, Clock, AlertTriangle, OctagonX, ShieldCheck } from 'lucide-react';

interface BadgeProps {
  type: 'handled' | 'completed' | 'in_progress' | 'ko' | 'incident' | 'error' | 'none' | 'neutral';
  label?: string;
  size?: 'sm' | 'md';
}

export function Badge({ type, label, size = 'sm' }: BadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  if (type === 'completed') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-medium rounded-full bg-emerald-100 dark:bg-nord-14/20 text-emerald-800 dark:text-nord-14 border border-emerald-200 dark:border-nord-14/30 ${sizeClasses}`}
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-nord-14" />
        <span>{label || 'Terminé'}</span>
      </span>
    );
  }

  if (type === 'handled') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-medium rounded-full bg-blue-100 dark:bg-nord-8/20 text-blue-800 dark:text-nord-8 border border-blue-200 dark:border-nord-8/30 ${sizeClasses}`}
      >
        <Check className="w-3 h-3 text-blue-600 dark:text-nord-8" />
        <span>{label || 'Traité'}</span>
      </span>
    );
  }

  if (type === 'in_progress') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-medium rounded-full bg-amber-100 dark:bg-nord-13/20 text-amber-800 dark:text-nord-13 border border-amber-200 dark:border-nord-13/30 ${sizeClasses}`}
      >
        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-nord-13" />
        <span>{label || 'En cours'}</span>
      </span>
    );
  }

  if (type === 'ko') {
    // Volontairement dans le rouge des incidents, pas dans l'ambre de « en
    // cours » : un blocage n'est pas un travail commencé, et l'ambiguïté se paie
    // chaque matin sur le bandeau des non traités.
    return (
      <span
        className={`inline-flex items-center gap-1 font-medium rounded-full bg-rose-100 dark:bg-nord-11/20 text-rose-800 dark:text-nord-11 border border-rose-200 dark:border-nord-11/30 ${sizeClasses}`}
      >
        <OctagonX className="w-3.5 h-3.5 text-rose-600 dark:text-nord-11" />
        <span>{label || 'KO'}</span>
      </span>
    );
  }

  if (type === 'incident') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-medium rounded-full bg-rose-100 dark:bg-nord-11/20 text-rose-800 dark:text-nord-11 border border-rose-200 dark:border-nord-11/30 ${sizeClasses}`}
      >
        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-nord-11" />
        <span>{label || 'Incident'}</span>
      </span>
    );
  }

  if (type === 'error') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-medium rounded-full bg-orange-100 dark:bg-nord-12/20 text-orange-800 dark:text-nord-12 border border-orange-200 dark:border-nord-12/30 ${sizeClasses}`}
      >
        <span>{label || 'Erreur'}</span>
      </span>
    );
  }

  if (type === 'none') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-semibold rounded-full bg-amber-100 dark:bg-nord-13/25 text-amber-900 dark:text-nord-13 border border-amber-300 dark:border-nord-13/50 ${sizeClasses}`}
      >
        <AlertTriangle className="w-3.5 h-3.5 text-amber-700 dark:text-nord-13" />
        <span>{label || 'Non saisi'}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 dark:bg-nord-2 text-slate-700 dark:text-nord-4 border border-slate-200 dark:border-nord-3 ${sizeClasses}`}
    >
      <span>{label}</span>
    </span>
  );
}
