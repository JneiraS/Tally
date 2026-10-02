/**
 * Note libre du périmètre, éditée depuis la page de détail.
 *
 * Contrairement aux compteurs d'activité, la note est un **brouillon** : rien
 * n'est écrit avant un clic sur « Enregistrer ». Un autosave ici enverrait une
 * note à chaque frappe au clavier, donc un événement d'audit par caractère tapé
 * — et une note est précisément le champ qu'on rédige longtemps.
 */
import { useState } from 'react';
import { Loader2, StickyNote } from 'lucide-react';
import { protabApi } from '../services/api';
import { useToastActions } from '../hooks/useToast';

/**
 * Borne d'affichage, alignée sur `NOTE_MAX_LENGTH` côté domaine. Elle n'empêche
 * rien : le serveur refuse au-delà, et une saisie plus longue doit rester
 * possible pendant la frappe pour que l'utilisateur voie son texte.
 */
const NOTE_MAX_LENGTH = 2000;

interface ScopeNoteCardProps {
  scopeId: string;
  /** Note déjà enregistrée, ou `null` si le périmètre n'en a pas. */
  note: string | null;
  /** Rappelle la note enregistrée, pour que le parent ne recharge rien. */
  onSaved: (note: string | null) => void;
}

export function ScopeNoteCard({ scopeId, note, onSaved }: ScopeNoteCardProps) {
  const [draft, setDraft] = useState(note ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const { success, error } = useToastActions();

  // La comparaison se fait sur la valeur nettoyée : « note » et «  note  » sont
  // le même enregistrement, donc le bouton ne doit pas s'activer pour rien.
  const cleaned = draft.trim();
  const persisted = note ?? '';
  const isDirty = cleaned !== persisted;
  const isTooLong = cleaned.length > NOTE_MAX_LENGTH;

  const handleSave = async () => {
    const next = cleaned === '' ? null : cleaned;
    setIsSaving(true);
    try {
      await protabApi.updateScopeNote(scopeId, { note: next });
      setDraft(next ?? '');
      onSaved(next);
      success('Note enregistrée', 'Le périmètre a bien été mis à jour.');
    } catch (err: unknown) {
      error('Échec de l\'enregistrement', (err as Error)?.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-nord-1 rounded-2xl border border-slate-200 dark:border-nord-2 p-5 sm:p-6 shadow-2xs space-y-4">
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-nord-6 flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-blue-600 dark:text-nord-8" />
          Note
        </h2>
        <p className="text-xs text-slate-500 dark:text-nord-4">
          Contexte libre du périmètre — à enregistrer explicitement
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="scope-note" className="sr-only">
          Note du périmètre
        </label>
        <textarea
          id="scope-note"
          aria-label="Note du périmètre"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={isSaving}
          rows={4}
          placeholder="Contexte, point de vigilance, consigne particulière…"
          className="w-full px-3 py-2 text-sm text-slate-900 dark:text-nord-5 bg-white dark:bg-nord-0 border border-slate-200 dark:border-nord-2 rounded-lg resize-y focus:outline-none focus:ring-1 focus:border-blue-500 dark:focus:border-nord-8 disabled:opacity-60"
        />
        <p className="text-xs text-slate-500 dark:text-nord-4 text-right">
          {cleaned.length} / {NOTE_MAX_LENGTH}
        </p>
      </div>

      {isTooLong && (
        <p role="alert" className="text-xs text-rose-600 dark:text-rose-400">
          La note ne peut pas dépasser {NOTE_MAX_LENGTH} caractères.
        </p>
      )}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setDraft(persisted)}
          disabled={!isDirty || isSaving}
          className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-nord-4 hover:text-slate-900 dark:hover:text-nord-6 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || isTooLong || isSaving}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 dark:bg-nord-8 text-white hover:bg-blue-700 dark:hover:bg-nord-9 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Enregistrer
        </button>
      </div>
    </div>
  );
}