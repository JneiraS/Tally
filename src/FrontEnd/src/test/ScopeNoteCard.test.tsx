/**
 * La note du périmètre est un **brouillon** : rien n'est écrit tant que
 * l'utilisateur n'a pas cliqué sur « Enregistrer », contrairement aux
 * compteurs d'activité qui sont en autosave.
 *
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ScopeNoteCard } from '../components/ScopeNoteCard';
import { ToastContainer } from '../components/Toast';
import { ToastProvider } from '../hooks/useToast';
import { protabApi } from '../services/api';

vi.mock('../services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/api')>();
  return {
    ...actual,
    protabApi: { ...actual.protabApi, updateScopeNote: vi.fn() },
  };
});

const SCOPE_ID = '123e4567-e89b-12d3-a456-426614174000';

const renderCard = (note: string | null) => {
  const onSaved = vi.fn();
  render(
    <ToastProvider>
      <ScopeNoteCard scopeId={SCOPE_ID} note={note} onSaved={onSaved} />
      <ToastContainer />
    </ToastProvider>
  );
  return { onSaved };
};

const textarea = () => screen.getByLabelText('Note du périmètre');
const save = () => screen.getByRole('button', { name: 'Enregistrer' });
const cancel = () => screen.getByRole('button', { name: 'Annuler' });
const type = (value: string) => fireEvent.change(textarea(), { target: { value } });

// L'enregistrement est asynchrone (fetch + toast) : le clic doit être attendu,
// sinon les mises à jour d'état tombent hors de `act`.
const clickSave = () =>
  act(async () => {
    fireEvent.click(save());
  });

describe('ScopeNoteCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(protabApi.updateScopeNote).mockResolvedValue(undefined as never);
  });

  it('affiche la note enregistrée', () => {
    renderCard('Incident de facturation à suivre.');

    expect(textarea()).toHaveValue('Incident de facturation à suivre.');
  });

  it('propose une saisie vide quand le périmètre n\'a pas de note', () => {
    renderCard(null);

    expect(textarea()).toHaveValue('');
  });

  it('n\'active l\'enregistrement que sur une saisie modifiée', () => {
    renderCard('Note existante');

    expect(save()).toBeDisabled();
    type('Note existante modifiée');
    expect(save()).toBeEnabled();
  });

  it('active l\'enregistrement sur une note effacée', () => {
    renderCard('Note existante');

    type('');

    expect(save()).toBeEnabled();
  });

  it('enregistre la valeur sans ses espaces de bord', async () => {
    const { onSaved } = renderCard(null);
    type('  Facturation à vérifier  ');

    await clickSave();

    expect(protabApi.updateScopeNote).toHaveBeenCalledWith(SCOPE_ID, {
      note: 'Facturation à vérifier',
    });
    expect(onSaved).toHaveBeenCalledWith('Facturation à vérifier');
  });

  it('enregistre une note vidée comme absente', async () => {
    // « Pas de note » est ``null`` et non une chaîne vide : la colonne et le
    // domaine ne connaissent qu'un seul état absent.
    const { onSaved } = renderCard('Note à supprimer');
    type('   ');

    await clickSave();

    expect(protabApi.updateScopeNote).toHaveBeenCalledWith(SCOPE_ID, { note: null });
    expect(onSaved).toHaveBeenCalledWith(null);
  });

  it('reste en brouillon tant que l\'enregistrement n\'est pas demandé', () => {
    renderCard('Note existante');
    type('Brouillon en cours');

    expect(protabApi.updateScopeNote).not.toHaveBeenCalled();
  });

  it('restaure la valeur enregistrée avec Annuler', () => {
    renderCard('Note existante');
    type('Brouillon abandonné');

    fireEvent.click(cancel());

    expect(textarea()).toHaveValue('Note existante');
    expect(save()).toBeDisabled();
    expect(protabApi.updateScopeNote).not.toHaveBeenCalled();
  });

  it('affiche une erreur quand l\'enregistrement échoue', async () => {
    vi.mocked(protabApi.updateScopeNote).mockRejectedValue(
      new Error('Note trop longue')
    );
    renderCard(null);
    type('Une note');

    await clickSave();

    expect(screen.getByText('Note trop longue')).toBeInTheDocument();
  });
});