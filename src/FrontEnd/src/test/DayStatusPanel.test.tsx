/**
 * Le statut d'une journée, et son motif.
 *
 * Le panneau est le seul endroit qui écrit le statut : l'autosave des compteurs
 * vit à côté mais ne le touche pas, sinon deux mécanismes se disputeraient la
 * même ligne. Ces tests verrouillent les trois propriétés qui comptent — la
 * route appelée, le motif en brouillon, et l'état local renvoyé au parent.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DayStatusPanel } from '../components/DayStatusPanel';
import { KO_REASON_MAX_LENGTH } from '../constants/dayStatus';
import { ToastContainer } from '../components/Toast';
import { ToastProvider } from '../hooks/useToast';
import { protabApi, ApiError } from '../services/api';

vi.mock('../services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/api')>();
  return {
    ...actual,
    protabApi: { ...actual.protabApi, setActivitiesStatus: vi.fn() },
  };
});

const DAY = '2026-09-19';

function renderPanel(overrides: Partial<Parameters<typeof DayStatusPanel>[0]> = {}) {
  const onChanged = vi.fn();
  render(
    <ToastProvider>
      <DayStatusPanel
        scopeId="scope-1"
        day={DAY}
        status="pending"
        koReason={null}
        onChanged={onChanged}
        {...overrides}
      />
      <ToastContainer />
    </ToastProvider>,
  );
  return { onChanged };
}

describe('DayStatusPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(protabApi.setActivitiesStatus).mockResolvedValue(undefined);
  });

  it('affiche le statut courant et sa description', () => {
    renderPanel({ status: 'ko', koReason: 'Collecteur HS' });

    const panel = screen.getByRole('region', { name: new RegExp(DAY) });
    expect(panel).toHaveTextContent('KO');
    expect(panel).toHaveTextContent('Motif : Collecteur HS');
  });

  it('propose les trois transitions depuis une journée à traiter', () => {
    renderPanel();

    expect(screen.getByRole('button', { name: /Signaler un KO/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Marquer terminée/i }),
    ).toBeInTheDocument();
    // « Lever le KO » n'a de sens que sur un jour KO.
    expect(screen.queryByRole('button', { name: /Lever le KO/i })).not.toBeInTheDocument();
  });

  it('signale un KO sur une journée qui n’a encore aucune saisie', async () => {
    const { onChanged } = renderPanel();

    fireEvent.click(screen.getByRole('button', { name: /Signaler un KO/i }));
    fireEvent.change(screen.getByLabelText('Motif du KO'), {
      target: { value: 'Collecteur indisponible' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    await waitFor(() => {
      expect(protabApi.setActivitiesStatus).toHaveBeenCalledWith('scope-1', {
        days: [DAY],
        status: 'ko',
        ko_reason: 'Collecteur indisponible',
      });
    });
    expect(onChanged).toHaveBeenCalledWith(DAY, 'ko', 'Collecteur indisponible');
  });

  it('n’écrit rien tant que le motif n’est pas enregistré', () => {
    renderPanel();

    fireEvent.click(screen.getByRole('button', { name: /Signaler un KO/i }));
    fireEvent.change(screen.getByLabelText('Motif du KO'), {
      target: { value: 'Pan' },
    });

    // Un autosave ici enverrait une requête — donc un événement d'audit — par
    // frappe. Le motif est un brouillon, comme la note du périmètre.
    expect(protabApi.setActivitiesStatus).not.toHaveBeenCalled();
  });

  it('permet un KO sans motif et le normalise en null', async () => {
    const { onChanged } = renderPanel();

    fireEvent.click(screen.getByRole('button', { name: /Signaler un KO/i }));
    fireEvent.change(screen.getByLabelText('Motif du KO'), { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    await waitFor(() => {
      expect(protabApi.setActivitiesStatus).toHaveBeenCalledWith('scope-1', {
        days: [DAY],
        status: 'ko',
        ko_reason: null,
      });
    });
    expect(onChanged).toHaveBeenCalledWith(DAY, 'ko', null);
  });

  it('refuse d’enregistrer un motif plus long que la borne du domaine', () => {
    renderPanel();

    fireEvent.click(screen.getByRole('button', { name: /Signaler un KO/i }));
    fireEvent.change(screen.getByLabelText('Motif du KO'), {
      target: { value: 'x'.repeat(KO_REASON_MAX_LENGTH + 1) },
    });

    expect(screen.getByRole('button', { name: 'Enregistrer' })).toBeDisabled();
  });

  it('abandonne le brouillon sur « Annuler »', () => {
    renderPanel({ status: 'ko', koReason: 'Panne' });

    fireEvent.click(screen.getByRole('button', { name: /Modifier le motif/i }));
    fireEvent.change(screen.getByLabelText('Motif du KO'), {
      target: { value: 'Autre chose' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));

    expect(screen.queryByLabelText('Motif du KO')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Modifier le motif/i }));
    expect(screen.getByLabelText('Motif du KO')).toHaveValue('Panne');
    expect(protabApi.setActivitiesStatus).not.toHaveBeenCalled();
  });

  it('marque la journée terminée sans motif', async () => {
    const { onChanged } = renderPanel();

    fireEvent.click(screen.getByRole('button', { name: /Marquer terminée/i }));

    await waitFor(() => {
      expect(protabApi.setActivitiesStatus).toHaveBeenCalledWith('scope-1', {
        days: [DAY],
        status: 'completed',
        ko_reason: null,
      });
    });
    expect(onChanged).toHaveBeenCalledWith(DAY, 'completed', null);
  });

  it('lève le KO en rendant la journée à traiter', async () => {
    const { onChanged } = renderPanel({ status: 'ko', koReason: 'Panne' });

    fireEvent.click(screen.getByRole('button', { name: /Lever le KO/i }));

    await waitFor(() => {
      expect(protabApi.setActivitiesStatus).toHaveBeenCalledWith('scope-1', {
        days: [DAY],
        status: 'pending',
        ko_reason: null,
      });
    });
    // Le motif est effacé de la ligne : une journée à traiter n'en porte pas.
    expect(onChanged).toHaveBeenCalledWith(DAY, 'pending', null);
  });

  it('n’affiche plus « Marquer terminée » sur une journée terminée', () => {
    renderPanel({ status: 'completed' });

    expect(
      screen.queryByRole('button', { name: /Marquer terminée/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Signaler un KO/i })).toBeInTheDocument();
  });

  it('signale l’échec sans réveiller le parent', async () => {
    const onChanged = vi.fn();
    vi.mocked(protabApi.setActivitiesStatus).mockRejectedValueOnce(
      new ApiError(500, 'Internal server error.'),
    );
    render(
      <ToastProvider>
        <DayStatusPanel
          scopeId="scope-1"
          day={DAY}
          status="pending"
          koReason={null}
          onChanged={onChanged}
        />
        <ToastContainer />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Marquer terminée/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Échec/i);
    });
    // Un parent是中国 invoqué sur un échec afficherait un statut que l'API n'a
    // jamais enregistré.
    expect(onChanged).not.toHaveBeenCalled();
  });
});