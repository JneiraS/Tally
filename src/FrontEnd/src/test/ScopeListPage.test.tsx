/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ScopeListPage } from '../pages/ScopeListPage';
import { ToastProvider } from '../hooks/useToast';
import { protabApi } from '../services/api';

vi.mock('../services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/api')>();
  return {
    ...actual,
    protabApi: {
      ...actual.protabApi,
      getScopeMonitorings: vi.fn(),
      createActivity: vi.fn(),
      completeActivities: vi.fn(),
      checkBackendHealth: vi.fn().mockResolvedValue(true),
    },
  };
});

vi.mock('../utils/date', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/date')>();
  return {
    ...actual,
    getTodayIsoDate: () => '2026-09-19',
  };
});

describe('ScopeListPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche le chargement puis la liste des périmètres', async () => {
    const mockScopes = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Scope Alpha Test',
        knowledge_base_id: 'KB-TEST-0001',
        official_main: 'Alice',
        official_backup: 'Bob',
        daily_activities: [
          {
            day: '2026-09-19',
            errors_reported: 2,
            incidents_created: 1,
            feai: ['INC000000001'],
            handled: false,
            completed: false,
          },
        ],
      },
    ];

    vi.mocked(protabApi.getScopeMonitorings).mockResolvedValueOnce(mockScopes);

    render(
      <BrowserRouter>
        <ToastProvider>
          <ScopeListPage
            onOpenCreateScope={vi.fn()}
            onOpenImportCsv={vi.fn()}
          />
        </ToastProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Chargement des périmètres en cours/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Scope Alpha Test')).toBeInTheDocument();
      expect(screen.getByText('KB-TEST-0001')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });
  });

  it('affiche un message d\'erreur lorsque l\'API échoue', async () => {
    vi.mocked(protabApi.getScopeMonitorings).mockRejectedValueOnce(
      new Error('Erreur de connexion serveur')
    );

    render(
      <BrowserRouter>
        <ToastProvider>
          <ScopeListPage
            onOpenCreateScope={vi.fn()}
            onOpenImportCsv={vi.fn()}
          />
        </ToastProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Échec du chargement de l'API/i)).toBeInTheDocument();
      expect(screen.getByText(/Erreur de connexion serveur/i)).toBeInTheDocument();
    });
  });

  it('le filtre "En cours" n\'affiche pas les périmètres "Non saisi"', async () => {
    const mockScopes = [
      {
        id: '111e4567-e89b-12d3-a456-426614174001',
        name: 'Scope En Cours Filtre',
        knowledge_base_id: 'KB-FILTRE-01',
        official_main: 'Alice',
        official_backup: 'Bob',
        daily_activities: [
          {
            day: '2026-09-19',
            errors_reported: 2,
            incidents_created: 1,
            feai: ['INC000000001'],
            handled: false,
            completed: false,
          },
        ],
      },
      {
        id: '222e4567-e89b-12d3-a456-426614174002',
        name: 'Scope Non Saisi Filtre',
        knowledge_base_id: 'KB-FILTRE-02',
        official_main: 'Carol',
        official_backup: 'Dave',
        daily_activities: [],
      },
    ];

    vi.mocked(protabApi.getScopeMonitorings).mockResolvedValueOnce(mockScopes);

    render(
      <BrowserRouter>
        <ToastProvider>
          <ScopeListPage
            onOpenCreateScope={vi.fn()}
            onOpenImportCsv={vi.fn()}
          />
        </ToastProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Scope En Cours Filtre')).toBeInTheDocument();
      expect(screen.getByText('Scope Non Saisi Filtre')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /^En cours/ }));

    expect(screen.getByText('Scope En Cours Filtre')).toBeInTheDocument();
    expect(
      screen.queryByText('Scope Non Saisi Filtre')
    ).not.toBeInTheDocument();
  });

  it('le filtre "Non saisi" n\'affiche que les périmètres sans activité', async () => {
    const mockScopes = [
      {
        id: '111e4567-e89b-12d3-a456-426614174001',
        name: 'Scope En Cours Filtre',
        knowledge_base_id: 'KB-FILTRE-01',
        official_main: 'Alice',
        official_backup: 'Bob',
        daily_activities: [
          {
            day: '2026-09-19',
            errors_reported: 2,
            incidents_created: 1,
            feai: ['INC000000001'],
            handled: false,
            completed: false,
          },
        ],
      },
      {
        id: '222e4567-e89b-12d3-a456-426614174002',
        name: 'Scope Non Saisi Filtre',
        knowledge_base_id: 'KB-FILTRE-02',
        official_main: 'Carol',
        official_backup: 'Dave',
        daily_activities: [],
      },
      {
        id: '333e4567-e89b-12d3-a456-426614174003',
        name: 'Scope Terminé Filtre',
        knowledge_base_id: 'KB-FILTRE-03',
        official_main: 'Eve',
        official_backup: 'Frank',
        daily_activities: [
          {
            day: '2026-09-19',
            errors_reported: 1,
            incidents_created: 0,
            feai: [],
            handled: true,
            completed: true,
          },
        ],
      },
    ];

    vi.mocked(protabApi.getScopeMonitorings).mockResolvedValueOnce(mockScopes);

    render(
      <BrowserRouter>
        <ToastProvider>
          <ScopeListPage
            onOpenCreateScope={vi.fn()}
            onOpenImportCsv={vi.fn()}
          />
        </ToastProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Scope En Cours Filtre')).toBeInTheDocument();
      expect(screen.getByText('Scope Non Saisi Filtre')).toBeInTheDocument();
      expect(screen.getByText('Scope Terminé Filtre')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /^Non saisi/ }));

    expect(screen.getByText('Scope Non Saisi Filtre')).toBeInTheDocument();
    expect(
      screen.queryByText('Scope En Cours Filtre')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Scope Terminé Filtre')
    ).not.toBeInTheDocument();
  });

  it('marque le périmètre "En cours" comme terminé via le bouton', async () => {
    const mockScopes = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Scope En Cours',
        knowledge_base_id: 'KB-EN-COURS-01',
        official_main: 'Alice',
        official_backup: 'Bob',
        daily_activities: [
          {
            day: '2026-09-19',
            errors_reported: 2,
            incidents_created: 1,
            feai: ['INC000000001'],
            handled: false,
            completed: false,
          },
        ],
      },
    ];

    vi.mocked(protabApi.getScopeMonitorings).mockResolvedValueOnce(mockScopes);
    vi.mocked(protabApi.completeActivities).mockResolvedValueOnce(undefined);

    render(
      <BrowserRouter>
        <ToastProvider>
          <ScopeListPage
            onOpenCreateScope={vi.fn()}
            onOpenImportCsv={vi.fn()}
          />
        </ToastProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Scope En Cours')).toBeInTheDocument();
      expect(screen.getByText('En cours')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Marquer Terminé/i }));

    await waitFor(() => {
      expect(protabApi.completeActivities).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        { days: ['2026-09-19'] }
      );
      expect(protabApi.createActivity).not.toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('Terminé')).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /Marquer Terminé/i })
      ).not.toBeInTheDocument();
    });
  });

  it('crée une activité vide puis complète un périmètre "Non saisi"', async () => {
    const mockScopes = [
      {
        id: '987e6543-e21b-23c4-a456-426614174000',
        name: 'Scope Non Saisi',
        knowledge_base_id: 'KB-NON-SAISI-01',
        official_main: 'Charlie',
        official_backup: 'Dana',
        daily_activities: [],
      },
    ];

    vi.mocked(protabApi.getScopeMonitorings).mockResolvedValueOnce(mockScopes);
    vi.mocked(protabApi.createActivity).mockResolvedValueOnce(undefined);
    vi.mocked(protabApi.completeActivities).mockResolvedValueOnce(undefined);

    render(
      <BrowserRouter>
        <ToastProvider>
          <ScopeListPage
            onOpenCreateScope={vi.fn()}
            onOpenImportCsv={vi.fn()}
          />
        </ToastProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Scope Non Saisi')).toBeInTheDocument();
      expect(screen.getByText('Non saisi')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Marquer Terminé/i }));

    await waitFor(() => {
      expect(protabApi.createActivity).toHaveBeenCalledWith(
        '987e6543-e21b-23c4-a456-426614174000',
        { day: '2026-09-19', errors_reported: 0, incidents_created: 0, feai: [] }
      );
      expect(protabApi.completeActivities).toHaveBeenCalledWith(
        '987e6543-e21b-23c4-a456-426614174000',
        { days: ['2026-09-19'] }
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Terminé')).toBeInTheDocument();
    });
  });

  it('affiche un toast d\'erreur si la complétion échoue', async () => {
    const mockScopes = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Scope Erreur',
        knowledge_base_id: 'KB-ERREUR-01',
        official_main: 'Eve',
        official_backup: 'Frank',
        daily_activities: [
          {
            day: '2026-09-19',
            errors_reported: 1,
            incidents_created: 0,
            feai: [],
            handled: false,
            completed: false,
          },
        ],
      },
    ];

    vi.mocked(protabApi.getScopeMonitorings).mockResolvedValueOnce(mockScopes);
    vi.mocked(protabApi.completeActivities).mockRejectedValueOnce(
      new Error('Panne du serveur')
    );

    render(
      <BrowserRouter>
        <ToastProvider>
          <ScopeListPage
            onOpenCreateScope={vi.fn()}
            onOpenImportCsv={vi.fn()}
          />
        </ToastProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Scope Erreur')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Marquer Terminé/i }));

    await waitFor(() => {
      expect(protabApi.completeActivities).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        { days: ['2026-09-19'] }
      );
    });

    await waitFor(() => {
      expect(screen.getByText('En cours')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Marquer Terminé/i })
      ).toBeInTheDocument();
    });
  });
});
