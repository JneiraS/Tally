/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AuditLogPage } from '../pages/AuditLogPage';
import { ToastProvider } from '../hooks/useToast';
import { AuditEvent } from '../types';
import { protabApi } from '../services/api';

vi.mock('../services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/api')>();
  return {
    ...actual,
    protabApi: {
      ...actual.protabApi,
      getAuditLog: vi.fn(),
    },
  };
});

describe('AuditLogPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockEvents: AuditEvent[] = [
    {
      id: 'evt-0001',
      actor: 'ABCD',
      action: 'activity_updated',
      scope_id: '123e4567-e89b-12d3-a456-426614174000',
      scope_name: 'Scope Alpha',
      day: '2026-09-19',
      created_at: '2026-09-19T14:32:00Z',
      changes: {
        errors_reported: { old: 2, new: 5 },
        feai: { old: ['INC000000001'], new: ['INC000000001', 'INC000000002'] },
      },
    },
    {
      id: 'evt-0002',
      actor: null,
      action: 'scope_created',
      scope_id: '123e4567-e89b-12d3-a456-426614174000',
      scope_name: 'Scope Alpha',
      day: null,
      created_at: '2026-09-18T09:05:00Z',
      changes: null,
    },
  ];

  it('affiche le chargement puis les événements du journal', async () => {
    vi.mocked(protabApi.getAuditLog).mockResolvedValueOnce(mockEvents);

    render(
      <ToastProvider>
        <AuditLogPage />
      </ToastProvider>
    );

    expect(screen.getByText(/Chargement de l'historique en cours/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('ABCD')).toBeInTheDocument();
      expect(screen.getByText('Système')).toBeInTheDocument();
      expect(screen.getAllByText('Scope Alpha').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Modification d\'activité').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Création de périmètre').length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getByText(/Voir le détail/)).toBeInTheDocument();
  });

  it('déplie le détail du diff avant/après', async () => {
    vi.mocked(protabApi.getAuditLog).mockResolvedValueOnce(mockEvents);

    render(
      <ToastProvider>
        <AuditLogPage />
      </ToastProvider>
    );

    await waitFor(() => screen.getByText('ABCD'));

    fireEvent.click(screen.getByText('Voir le détail'));

    expect(screen.getByText('errors_reported')).toBeInTheDocument();
    expect(screen.getByText('feai')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(
      screen.getByText('INC000000001, INC000000002')
    ).toBeInTheDocument();
  });

  it('affiche l’état vide quand aucun événement', async () => {
    vi.mocked(protabApi.getAuditLog).mockResolvedValueOnce([]);

    render(
      <ToastProvider>
        <AuditLogPage />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Aucun événement d\'audit')).toBeInTheDocument();
    });
    expect(protabApi.getAuditLog).toHaveBeenCalled();
  });

  it('filtre par action et acteur via l’API', async () => {
    vi.mocked(protabApi.getAuditLog).mockResolvedValue(mockEvents);

    render(
      <ToastProvider>
        <AuditLogPage />
      </ToastProvider>
    );

    await waitFor(() => screen.getByText('ABCD'));

    const actorInput = screen.getByPlaceholderText(
      /Filtrer par acteur \(quadrigramme\)\.\.\./
    );
    fireEvent.change(actorInput, { target: { value: 'ABCD' } });

    const actionSelect = screen.getByRole('combobox');
    fireEvent.change(actionSelect, { target: { value: 'activity_updated' } });

    await waitFor(() => {
      expect(protabApi.getAuditLog).toHaveBeenLastCalledWith({
        scope_id: undefined,
        actor: 'ABCD',
        action: 'activity_updated',
        limit: 500,
      });
    });
  });
});