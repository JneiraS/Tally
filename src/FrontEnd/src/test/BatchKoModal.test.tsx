/**
 * Le signalement d'une panne sur un lot de journées.
 *
 * Ce qui compte ici : le motif est **un pour tout le lot** et reste
 * **facultatif**, et rien n'est écrit avant confirmation. Le comportement
 * serveur — KO sur plusieurs jours, un événement d'audit par jour — est déjà
 * couvert côté API ; ces tests verrouillent l'écran.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BatchKoModal } from '../components/BatchKoModal';
import { ToastContainer } from '../components/Toast';
import { KO_REASON_MAX_LENGTH } from '../constants/dayStatus';
import { ToastProvider } from '../hooks/useToast';
import { protabApi, ApiError } from '../services/api';

vi.mock('../services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/api')>();
  return {
    ...actual,
    protabApi: { ...actual.protabApi, setActivitiesStatus: vi.fn() },
  };
});

const DAYS = ['2026-09-21', '2026-09-22', '2026-09-23'];

function renderModal(overrides: Partial<Parameters<typeof BatchKoModal>[0]> = {}) {
  const onConfirmed = vi.fn();
  const onClose = vi.fn();
  render(
    <ToastProvider>
      <BatchKoModal
        isOpen
        onClose={onClose}
        scopeId="scope-1"
        scopeName="Périmètre Alpha"
        days={DAYS}
        onConfirmed={onConfirmed}
        {...overrides}
      />
      <ToastContainer />
    </ToastProvider>,
  );
  return { onConfirmed, onClose };
}

describe('BatchKoModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(protabApi.setActivitiesStatus).mockResolvedValue(undefined);
  });

  it('annonce le lot et la plage de dates couverte', () => {
    renderModal();

    expect(screen.getByRole('dialog')).toHaveTextContent('3 journées');
    // Un intervalle se lit du plus ancien au plus récent, quel que soit l'ordre
    // de sélection : « du 21 sept. au 23 sept. » et non l'inverse.
    expect(screen.getByRole('dialog')).toHaveTextContent(
      /21 sept\. 2026 au 23 sept\. 2026/,
    );
  });

  it('écrit un seul motif pour toutes les journées du lot', async () => {
    const { onConfirmed, onClose } = renderModal();

    fireEvent.change(screen.getByLabelText('Motif du KO (facultatif)'), {
      target: { value: 'Collecteur indisponible' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Signaler 3 journées/ }));

    await waitFor(() => {
      expect(protabApi.setActivitiesStatus).toHaveBeenCalledWith('scope-1', {
        days: DAYS,
        status: 'ko',
        ko_reason: 'Collecteur indisponible',
      });
    });
    expect(onConfirmed).toHaveBeenCalledWith(DAYS, 'Collecteur indisponible');
    expect(onClose).toHaveBeenCalled();
  });

  it('accepte un KO sans motif et le normalise en null', async () => {
    // Le motif est facultatif : un blocage est un fait, l'explication est un
    // bonus. Refuser l'enregistrement le rendrait inaccessible.
    const { onConfirmed } = renderModal();

    fireEvent.click(screen.getByRole('button', { name: /Signaler 3 journées/ }));

    await waitFor(() => {
      expect(protabApi.setActivitiesStatus).toHaveBeenCalledWith('scope-1', {
        days: DAYS,
        status: 'ko',
        ko_reason: null,
      });
    });
    expect(onConfirmed).toHaveBeenCalledWith(DAYS, null);
  });

  it('traite un motif blanc comme l’absence de motif', async () => {
    const { onConfirmed } = renderModal();

    fireEvent.change(screen.getByLabelText('Motif du KO (facultatif)'), {
      target: { value: '   ' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Signaler 3 journées/ }));

    await waitFor(() => {
      expect(protabApi.setActivitiesStatus).toHaveBeenCalledWith('scope-1', {
        days: DAYS,
        status: 'ko',
        ko_reason: null,
      });
    });
    expect(onConfirmed).toHaveBeenCalledWith(DAYS, null);
  });

  it('refuse d’enregistrer un motif plus long que la borne du domaine', () => {
    renderModal();

    fireEvent.change(screen.getByLabelText('Motif du KO (facultatif)'), {
      target: { value: 'x'.repeat(KO_REASON_MAX_LENGTH + 1) },
    });

    expect(screen.getByRole('button', { name: /Signaler 3 journées/ })).toBeDisabled();
    expect(protabApi.setActivitiesStatus).not.toHaveBeenCalled();
  });

  it('n’écrit rien si le formulaire est annulé', () => {
    const { onClose } = renderModal();

    fireEvent.change(screen.getByLabelText('Motif du KO (facultatif)'), {
      target: { value: 'Panne' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));

    expect(protabApi.setActivitiesStatus).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('demande une seule journée au singulier', () => {
    renderModal({ days: ['2026-09-21'] });

    expect(
      screen.getByRole('button', { name: /Signaler la journée/ }),
    ).toBeInTheDocument();
  });

  it('signale l’échec sans prévenir le parent ni fermer', async () => {
    // Un parent prévenu sur un échec afficherait un statut que l'API n'a jamais
    // enregistré : l'écran dirait « KO » là où la base dit « à traiter ».
    const onConfirmed = vi.fn();
    const onClose = vi.fn();
    vi.mocked(protabApi.setActivitiesStatus).mockRejectedValueOnce(
      new ApiError(500, 'Internal server error.'),
    );
    render(
      <ToastProvider>
        <BatchKoModal
          isOpen
          onClose={onClose}
          scopeId="scope-1"
          scopeName="Périmètre Alpha"
          days={DAYS}
          onConfirmed={onConfirmed}
        />
        <ToastContainer />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Signaler 3 journées/ }));

    // Le message est rendu à côté d'un « Erreur : » dans un <span>, donc c'est le
    // texte du dialogue qu'il faut lire, pas un nœud isolé.
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toHaveTextContent('Internal server error');
    });
    expect(onConfirmed).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});