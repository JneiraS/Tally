/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
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
      checkBackendHealth: vi.fn().mockResolvedValue(true),
    },
    ApiConfig: {
      ...actual.ApiConfig,
      isDemoMode: false,
      setDemoMode: vi.fn(),
      getBaseUrl: vi.fn().mockReturnValue('http://localhost:8000'),
    },
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
            feai: ['INC0000001'],
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
});
