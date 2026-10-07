/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { AuditLogPage } from '../pages/AuditLogPage';
import { ToastProvider } from '../hooks/useToast';
import { AuditEvent } from '../types';
import { protabApi } from '../services/api';
import { makeAuditEvent, makeScope } from './factories';

vi.mock('../services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/api')>();
  return {
    ...actual,
    protabApi: {
      ...actual.protabApi,
      getAuditLog: vi.fn(),
      getScopeMonitorings: vi.fn(),
    },
  };
});

const events: AuditEvent[] = [
  makeAuditEvent({ id: 'evt-0001', actor: 'ABCD', action: 'activity_updated' }),
  makeAuditEvent({
    id: 'evt-0002',
    actor: null,
    action: 'scope_created',
    day: null,
    changes: {},
    created_at: '2026-09-18T09:05:00Z',
  }),
];

function renderPage() {
  return render(
    <ToastProvider>
      <AuditLogPage />
    </ToastProvider>
  );
}

describe('AuditLogPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(protabApi.getAuditLog).mockResolvedValue(events);
    vi.mocked(protabApi.getScopeMonitorings).mockResolvedValue([makeScope()]);
  });

  it('affiche le chargement puis les événements du journal', async () => {
    renderPage();

    expect(screen.getByText(/Chargement de l'historique en cours/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('ABCD')).toBeInTheDocument();
      expect(screen.getByText('Système')).toBeInTheDocument();
      expect(screen.getAllByText('Périmètre Alpha').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Modification d'activité").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Création de périmètre').length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getByText(/Voir le détail/)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Activité par heure de la semaine/i }),
    ).toBeInTheDocument();
  });

  it('déplie le détail du diff avant/après', async () => {
    renderPage();

    await waitFor(() => screen.getByText('ABCD'));

    fireEvent.click(screen.getByText('Voir le détail'));

    expect(screen.getByText('errors_reported')).toBeInTheDocument();
    expect(screen.getByText('feai')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('INC000000001, INC000000002')).toBeInTheDocument();
  });

  it("affiche l'état vide quand aucun événement", async () => {
    vi.mocked(protabApi.getAuditLog).mockResolvedValue([]);
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Aucun événement d'audit")).toBeInTheDocument();
    });
    expect(protabApi.getAuditLog).toHaveBeenCalled();
  });

  it('filtre par action et acteur via l’API', async () => {
    renderPage();
    await waitFor(() => screen.getByText('ABCD'));

    fireEvent.change(screen.getByLabelText('Quadrigramme'), {
      target: { value: 'ABCD' },
    });
    fireEvent.change(screen.getByLabelText("Type d'action"), {
      target: { value: 'activity_updated' },
    });

    await waitFor(() => {
      expect(protabApi.getAuditLog).toHaveBeenLastCalledWith({
        scope_ids: undefined,
        actor: 'ABCD',
        action: 'activity_updated',
        from_created_at: undefined,
        to_created_at: undefined,
        limit: 500,
      });
    });
  });

  it('envoie les bornes de période en instants, pas en dates', async () => {
    renderPage();
    await waitFor(() => screen.getByText('ABCD'));

    fireEvent.change(screen.getByLabelText('Journal : à partir du'), {
      target: { value: '2026-09-19' },
    });
    fireEvent.change(screen.getByLabelText("Journal : jusqu'au"), {
      target: { value: '2026-09-19' },
    });

    await waitFor(() => {
      const call = vi.mocked(protabApi.getAuditLog).mock.calls.at(-1)?.[0];
      expect(call?.from_created_at).toBe(new Date(2026, 8, 19).toISOString());
      expect(call?.to_created_at).toBe(new Date(2026, 8, 20).toISOString());
    });
  });

  it('ne déclenche qu’une requête par rafale de frappe', async () => {
    vi.useFakeTimers();
    try {
      renderPage();
      await vi.waitFor(() => expect(protabApi.getAuditLog).toHaveBeenCalledTimes(1));

      const actor = screen.getByLabelText('Quadrigramme');
      for (const value of ['A', 'AB', 'ABC', 'ABCD']) {
        fireEvent.change(actor, { target: { value } });
      }

      // Aucune requête pendant la frappe : c'est ce qui vidait la table.
      expect(protabApi.getAuditLog).toHaveBeenCalledTimes(1);

      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      expect(protabApi.getAuditLog).toHaveBeenCalledTimes(2);
      expect(protabApi.getAuditLog).toHaveBeenLastCalledWith(
        expect.objectContaining({ actor: 'ABCD' }),
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it('réinitialise tous les filtres', async () => {
    renderPage();
    await waitFor(() => screen.getByText('ABCD'));

    fireEvent.change(screen.getByLabelText('Quadrigramme'), {
      target: { value: 'ABCD' },
    });
    fireEvent.change(screen.getByLabelText('Journal : à partir du'), {
      target: { value: '2026-09-01' },
    });
    await waitFor(() =>
      expect(vi.mocked(protabApi.getAuditLog).mock.calls.length).toBeGreaterThan(2),
    );

    fireEvent.click(screen.getByRole('button', { name: /Réinitialiser/i }));

    await waitFor(() => {
      expect(protabApi.getAuditLog).toHaveBeenLastCalledWith({
        scope_ids: undefined,
        actor: undefined,
        action: undefined,
        from_created_at: undefined,
        to_created_at: undefined,
        limit: 500,
      });
    });
  });

  it('signale une période inversée au lieu d’un journal vide muet', async () => {
    renderPage();
    await waitFor(() => screen.getByText('ABCD'));

    fireEvent.change(screen.getByLabelText('Journal : à partir du'), {
      target: { value: '2026-09-19' },
    });
    fireEvent.change(screen.getByLabelText("Journal : jusqu'au"), {
      target: { value: '2026-09-01' },
    });

    expect(await screen.findByText(/date de début est postérieure/i)).toBeInTheDocument();
  });

  it('propose de réinitialiser quand les filtres ne donnent rien', async () => {
    vi.mocked(protabApi.getAuditLog).mockResolvedValue([]);
    renderPage();

    fireEvent.change(screen.getByLabelText('Quadrigramme'), {
      target: { value: 'ZZZZ' },
    });

    await waitFor(() =>
      expect(screen.getByText(/Aucun événement ne correspond/i)).toBeInTheDocument(),
    );
    expect(
      screen.getByRole('button', { name: /Réinitialiser les 1 filtre/i }),
    ).toBeInTheDocument();
  });

  it('n’annonce le plafond de 500 que lorsqu’il est atteint', async () => {
    renderPage();
    await waitFor(() => screen.getByText('ABCD'));

    expect(screen.getByText(/Affichage de 2 événements$/)).toBeInTheDocument();

    vi.mocked(protabApi.getAuditLog).mockResolvedValue(
      Array.from({ length: 500 }, (_, i) =>
        makeAuditEvent({ id: `evt-${i}` }),
      ),
    );
    fireEvent.click(screen.getByRole('button', { name: /Actualiser/i }));

    expect(
      await screen.findByText(/Affichage de 500 événements sur les 500 plus récents/),
    ).toBeInTheDocument();
  });

  it('charge la liste des périmètres pour le sélecteur', async () => {
    renderPage();

    await waitFor(() =>
      expect(protabApi.getScopeMonitorings).toHaveBeenCalled(),
    );
    expect(
      screen.getByLabelText(/Sélectionner les périmètres du journal/i),
    ).toBeInTheDocument();
  });

  afterEach(() => {
    vi.useRealTimers();
  });
});