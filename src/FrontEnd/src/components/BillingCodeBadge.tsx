interface BillingCodeBadgeProps {
  code: string | null;
}

/**
 * Affiche le code de facturation d'un périmètre.
 *
 * Le champ est obligatoire à la création mais reste `null` sur les périmètres
 * enregistrés avant son introduction : l'API ne réécrit pas l'historique, donc
 * l'absence se rend par un tiret cadratin plutôt que par un vide muet.
 *
 * Le libellé complet est porté par `aria-label` : un tiret seul ne dit rien à
 * un lecteur d'écran, qui lirait « tiret cadratin » sans savoir ce qu'il
 * désigne.
 */
export function BillingCodeBadge({ code }: BillingCodeBadgeProps) {
  const missing = !code || code.trim() === '';

  if (missing) {
    return (
      <span
        title="Code de facturation non renseigné"
        aria-label="Code de facturation non renseigné"
        className="inline-block text-xs text-slate-400 dark:text-nord-3 select-none"
      >
        —
      </span>
    );
  }

  return (
    <span
      title={code}
      aria-label={`Code de facturation : ${code}`}
      className="inline-block text-xs font-mono text-indigo-700 dark:text-nord-5 bg-indigo-50 dark:bg-nord-5/20 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-nord-5/40"
    >
      {code}
    </span>
  );
}
