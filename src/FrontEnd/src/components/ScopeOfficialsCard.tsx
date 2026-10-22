/**
 * Responsables du périmètre (principal / suppléant), édités depuis la page de
 * détail par les administrateurs du projet uniquement.
 *
 * Comme la note (ScopeNoteCard), l'édition est un **brouillon** : rien n'est
 * écrit avant « Enregistrer ». Un autosave enverrait un PATCH par frappe —
 * donc un événement d'audit par caractère tapé. L'affichage conditionnel à
 * l'administration est une commodité de l'interface ; le 403 du serveur reste
 * l'unique arbitre, et un refus y est annoncé comme une erreur sans écraser le
 * brouillon.
 */
import { useState } from 'react';
import { Loader2, Users } from 'lucide-react';
import { protabApi } from '../services/api';
import { useToastActions } from '../hooks/useToast';

export interface ScopeOfficials {
  official_main: string;
  official_backup: string;
}

interface ScopeOfficialsCardProps {
  scopeId: string;
  officialMain: string;
  officialBackup: string;
  /** Rappelle les responsables enregistrés, sans que le parent ne recharge. */
  onSaved: (officials: ScopeOfficials) => void;
}

export function ScopeOfficialsCard({
  scopeId,
  officialMain,
  officialBackup,
  onSaved,
}: ScopeOfficialsCardProps) {
  const [mainDraft, setMainDraft] = useState(officialMain);
  const [backupDraft, setBackupDraft] = useState(officialBackup);
  const [isSaving, setIsSaving] = useState(false);
  const { success, error } = useToastActions();

  // Même arbitrage que la note : « LAMA  » et « LAMA » sont le même
  // enregistrement, donc Annuler ne doit pas s'activer pour rien.
  const isDirty =
    mainDraft.trim() !== officialMain || backupDraft.trim() !== officialBackup;

  // Les deux responsables sont obligatoires côté domaine (EmptyOfficialsError,
  // 400) : le bouton refuse de payer l'aller-retour évident. Les autres règles
  // de forme ne sont pas dupliquées ici — le serveur fait foi.
  const isMissingOfficial = mainDraft.trim() === '' || backupDraft.trim() === '';

  const handleSave = async () => {
    const payload = {
      official_main: mainDraft.trim(),
      official_backup: backupDraft.trim(),
    };
    setIsSaving(true);
    try {
      await protabApi.updateScopeOfficials(scopeId, payload);
      onSaved(payload);
      success('Responsables enregistrés', 'Le périmètre a bien été mis à jour.');
    } catch (err: unknown) {
      // Un 403 (droit perdu depuis l'ouverture de la page) ou un 400 : le
      // brouillon reste intact, l'utilisateur ne perd pas sa saisie.
      error(
        "Échec de l'enregistrement",
        (err as Error)?.message,
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-nord-1 rounded-2xl border border-slate-200 dark:border-nord-2 p-5 sm:p-6 shadow-2xs space-y-4">
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-nord-6 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600 dark:text-nord-8" />
          Responsables
        </h2>
        <p className="text-xs text-slate-500 dark:text-nord-4">
          Responsable principal et suppléant — à enregistrer explicitement.
          Plusieurs quadrigrammes possibles, séparés par « / ».
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="scope-official-main" className="sr-only">
            Responsable principal
          </label>
          <input
            id="scope-official-main"
            aria-label="Responsable principal"
            type="text"
            value={mainDraft}
            onChange={(e) => setMainDraft(e.target.value)}
            disabled={isSaving}
            className="w-full px-3 py-2 text-sm font-mono uppercase text-slate-900 dark:text-nord-5 bg-white dark:bg-nord-0 border border-slate-200 dark:border-nord-2 rounded-lg focus:outline-none focus:ring-1 focus:border-blue-500 dark:focus:border-nord-8 disabled:opacity-60"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="scope-official-backup" className="sr-only">
            Responsable suppléant (Backup)
          </label>
          <input
            id="scope-official-backup"
            aria-label="Responsable suppléant (Backup)"
            type="text"
            value={backupDraft}
            onChange={(e) => setBackupDraft(e.target.value)}
            disabled={isSaving}
            className="w-full px-3 py-2 text-sm font-mono uppercase text-slate-900 dark:text-nord-5 bg-white dark:bg-nord-0 border border-slate-200 dark:border-nord-2 rounded-lg focus:outline-none focus:ring-1 focus:border-blue-500 dark:focus:border-nord-8 disabled:opacity-60"
          />
        </div>
      </div>

      {isMissingOfficial ? (
        <p role="alert" className="text-xs text-rose-600 dark:text-rose-400">
          Les deux responsables sont obligatoires.
        </p>
      ) : null}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setMainDraft(officialMain);
            setBackupDraft(officialBackup);
          }}
          disabled={!isDirty || isSaving}
          className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-nord-4 hover:text-slate-900 dark:hover:text-nord-6 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || isMissingOfficial || isSaving}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 dark:bg-nord-8 text-white hover:bg-blue-700 dark:hover:bg-nord-9 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Enregistrer
        </button>
      </div>
    </div>
  );
}
