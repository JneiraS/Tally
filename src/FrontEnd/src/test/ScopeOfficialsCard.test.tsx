/**
 * La carte « Responsables » est un brouillon comme la note : rien n'est écrit
 * tant que l'utilisateur n'a pas cliqué sur « Enregistrer ». L'édition n'est
 * proposée qu'aux administrateurs — c'est le parent qui décide de la montrer ;
 * le refus 403 du serveur reste l'arbitre, jamais l'interface.
 *
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ScopeOfficialsCard } from '../components/ScopeOfficialsCard';
import { ToastContainer } from '../components/Toast';
import { ToastProvider } from '../hooks/useToast';
import { protabApi } from '../services/api';

vi.mock('../services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/api')>();
  return {
    ...actual,
    protabApi: { ...actual.protabApi, updateScopeOfficials: vi.fn() },
  };
});

const SCOPE_ID = '123e4567-e89b-12d3-a456-426614174000';

const renderCard = (main = 'LAMA', backup = 'JMAB') => {
  const onSaved = vi.fn();
  render(
    <ToastProvider>
      <ScopeOfficialsCard
        scopeId={SCOPE_ID}
        officialMain={main}
        officialBackup={backup}
        onSaved={onSaved}
      />
      <ToastContainer />
    </ToastProvider>
  );
  return { onSaved };
};

const mainInput = () => screen.getByLabelText('Responsable principal');
const backupInput = () =>
  screen.getByLabelText('Responsable suppléant (Backup)');
const save = () => screen.getByRole('button', { name: 'Enregistrer' });
const cancel = () => screen.getByRole('button', { name: 'Annuler' });

const type = (field: () => HTMLElement, value: string) =>
  fireEvent.change(field(), { target: { value } });

const clickSave = () =>
  act(async () => {
    fireEvent.click(save());
  });

describe('ScopeOfficialsCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(protabApi.updateScopeOfficials).mockResolvedValue(
      undefined as never,
    );
  });

  it('affiche les responsables enregistrés', () => {
    renderCard('LAMA/JMAB', 'MLOZ');

    expect(mainInput()).toHaveValue('LAMA/JMAB');
    expect(backupInput()).toHaveValue('MLOZ');
  });

  it("n'active l'enregistrement que sur une saisie modifiée", () => {
    renderCard();

    expect(save()).toBeDisabled();
    type(mainInput, 'MLOZ');
    expect(save()).toBeEnabled();
  });

  it('enregistre les deux valeurs sans leurs espaces de bord', async () => {
    const { onSaved } = renderCard();
    type(mainInput, '  FEAI  ');
    type(backupInput, ' MHRZ ');

    await clickSave();

    expect(protabApi.updateScopeOfficials).toHaveBeenCalledWith(SCOPE_ID, {
      official_main: 'FEAI',
      official_backup: 'MHRZ',
    });
    expect(onSaved).toHaveBeenCalledWith({
      official_main: 'FEAI',
      official_backup: 'MHRZ',
    });
  });

  it('désactive l\'enregistrement tant qu\'un responsable est vide', () => {
    // Les deux responsables sont obligatoires côté domaine : le bouton ne doit
    // pas payer un aller-retour 400 évident.
    renderCard();
    type(mainInput, '');

    expect(save()).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Les deux responsables sont obligatoires.',
    );
  });

  it('restaure les valeurs enregistrées avec Annuler', () => {
    renderCard();
    type(mainInput, 'Brouillon abandonné');

    fireEvent.click(cancel());

    expect(mainInput()).toHaveValue('LAMA');
    expect(backupInput()).toHaveValue('JMAB');
  });

  it('reste en brouillon tant que l\'enregistrement n\'est pas demandé', () => {
    renderCard();
    type(mainInput, 'Brouillon en cours');

    expect(protabApi.updateScopeOfficials).not.toHaveBeenCalled();
  });

  it("annonce l'échec et ne remonte rien quand l'API refuse (403)", async () => {
    vi.mocked(protabApi.updateScopeOfficials).mockRejectedValue(
      Object.assign(new Error('Seuls les administrateurs du projet peuvent ' +
        'modifier les responsables.'), { status: 403 }),
    );
    const { onSaved } = renderCard();
    type(mainInput, 'MLOZ');

    await clickSave();

    expect(onSaved).not.toHaveBeenCalled();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Seuls les administrateurs du projet',
    );
  });
});
