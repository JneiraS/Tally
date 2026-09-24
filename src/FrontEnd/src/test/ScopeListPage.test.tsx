/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ScopeListPage } from '../pages/ScopeListPage';
import { ToastProvider } from '../hooks/useToast';
import { KNOWLEDGE_BASE_URL } from '../utils/knowledgeBase';
import { protabApi } from '../services/api';

vi.mock('../services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/api')>();
  return {
    ...actual,
    protabApi: {
      ...actual.protabApi,
      getScopeMonitorings: vi.fn(),
      createActivity: vi.fn(),
      updateActivity: vi.fn(),
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
      expect(within(screen.getByRole('table')).getByText('Scope Alpha Test')).toBeInTheDocument();
      expect(within(screen.getByRole('table')).getByText('KB-TEST-0001')).toBeInTheDocument();
      expect(within(screen.getByRole('table')).getByText('Alice')).toBeInTheDocument();
      expect(within(screen.getByRole('table')).getByText('Bob')).toBeInTheDocument();
    });

    const kbLink = within(screen.getByRole('table')).getByText('KB-TEST-0001').closest('a');
    expect(kbLink).toHaveAttribute('href', `${KNOWLEDGE_BASE_URL}KB-TEST-0001`);
    expect(kbLink).toHaveAttribute('target', '_blank');

    const nameLink = within(screen.getByRole('table')).getByRole('link', { name: 'Scope Alpha Test' });
    expect(nameLink).toHaveAttribute('href', '/scopes/123e4567-e89b-12d3-a456-426614174000');

    const detailRow = within(screen.getByRole('table')).getByRole('link', {
      name: 'Ouvrir le détail de Scope Alpha Test',
    });
    expect(detailRow).toBeInTheDocument();
  });

  it('affiche les KPI action-first (à traiter, terminés, erreurs, incidents)', async () => {
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

    await waitFor(() => {
      expect(within(screen.getByRole('table')).getByText('Scope Alpha Test')).toBeInTheDocument();
    });

    expect(screen.getByText('1 en cours · 0 non saisis')).toBeInTheDocument();
    expect(screen.getByText('0 / 1')).toBeInTheDocument();
    expect(screen.getByText('Erreurs du jour')).toBeInTheDocument();
    expect(screen.getByText('Incidents à suivre')).toBeInTheDocument();
    expect(screen.getByText(/vs baseline \(7 j\) : —/)).toBeInTheDocument();
    expect(screen.getByText('1 non transformé')).toBeInTheDocument();
    expect(screen.queryByText(/Couverture 7 j ouvrés/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Σ FEAI : 1/)).not.toBeInTheDocument();
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

  it('le filtre "À traiter" conserve "En cours" et "Non saisi" mais masque "Terminé"', async () => {
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
      expect(within(screen.getByRole('table')).getByText('Scope En Cours Filtre')).toBeInTheDocument();
      expect(within(screen.getByRole('table')).getByText('Scope Non Saisi Filtre')).toBeInTheDocument();
      expect(within(screen.getByRole('table')).getByText('Scope Terminé Filtre')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /^À traiter/ }));

    expect(within(screen.getByRole('table')).getByText('Scope En Cours Filtre')).toBeInTheDocument();
    expect(within(screen.getByRole('table')).getByText('Scope Non Saisi Filtre')).toBeInTheDocument();
    expect(
      within(screen.getByRole('table')).queryByText('Scope Terminé Filtre')
    ).not.toBeInTheDocument();
  });

  it('le filtre "Erreurs" n\'affiche que les périmètres avec erreurs signalées', async () => {
    const mockScopes = [
      {
        id: '111e4567-e89b-12d3-a456-426614174001',
        name: 'Scope Avec Erreurs',
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
      expect(within(screen.getByRole('table')).getByText('Scope Avec Erreurs')).toBeInTheDocument();
      expect(within(screen.getByRole('table')).getByText('Scope Non Saisi Filtre')).toBeInTheDocument();
      expect(within(screen.getByRole('table')).getByText('Scope Terminé Filtre')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /^Erreurs/ }));

    expect(within(screen.getByRole('table')).getByText('Scope Avec Erreurs')).toBeInTheDocument();
    expect(within(screen.getByRole('table')).getByText('Scope Terminé Filtre')).toBeInTheDocument();
    expect(
      within(screen.getByRole('table')).queryByText('Scope Non Saisi Filtre')
    ).not.toBeInTheDocument();
  });

  it('le filtre "Terminés" n\'affiche que les périmètres complétés', async () => {
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
      expect(within(screen.getByRole('table')).getByText('Scope En Cours Filtre')).toBeInTheDocument();
      expect(within(screen.getByRole('table')).getByText('Scope Terminé Filtre')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /^Terminés/ }));

    expect(within(screen.getByRole('table')).getByText('Scope Terminé Filtre')).toBeInTheDocument();
    expect(
      within(screen.getByRole('table')).queryByText('Scope En Cours Filtre')
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
      expect(within(screen.getByRole('table')).getByText('Scope En Cours')).toBeInTheDocument();
      expect(within(screen.getByRole('table')).getByText('En cours')).toBeInTheDocument();
    });

    fireEvent.click(within(screen.getByRole('table')).getByRole('button', { name: /Marquer Terminé/i }));

    await waitFor(() => {
      expect(protabApi.completeActivities).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        { days: ['2026-09-19'] }
      );
      expect(protabApi.createActivity).not.toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(within(screen.getByRole('table')).getByText('Terminé')).toBeInTheDocument();
      expect(
        within(screen.getByRole('table')).queryByRole('button', { name: /Marquer Terminé/i })
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
      expect(within(screen.getByRole('table')).getByText('Scope Non Saisi')).toBeInTheDocument();
      expect(within(screen.getByRole('table')).getByText('Non saisi')).toBeInTheDocument();
    });

    fireEvent.click(within(screen.getByRole('table')).getByRole('button', { name: /Marquer Terminé/i }));

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
      expect(within(screen.getByRole('table')).getByText('Terminé')).toBeInTheDocument();
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
      expect(within(screen.getByRole('table')).getByText('Scope Erreur')).toBeInTheDocument();
    });

    fireEvent.click(within(screen.getByRole('table')).getByRole('button', { name: /Marquer Terminé/i }));

    await waitFor(() => {
      expect(protabApi.completeActivities).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        { days: ['2026-09-19'] }
      );
    });

    await waitFor(() => {
      expect(within(screen.getByRole('table')).getByText('En cours')).toBeInTheDocument();
      expect(
        within(screen.getByRole('table')).getByRole('button', { name: /Marquer Terminé/i })
      ).toBeInTheDocument();
    });
  });

  it('saisit des erreurs/incidents sur une ligne "Non saisi" et crée l\'activité en autosave', async () => {
    const mockScopes = [
      {
        id: '987e6543-e21b-23c4-a456-426614174000',
        name: 'Scope Nouvelle Saisie',
        knowledge_base_id: 'KB-SAISIE-01',
        official_main: 'Charlie',
        official_backup: 'Dana',
        daily_activities: [],
      },
    ];

    vi.mocked(protabApi.getScopeMonitorings).mockResolvedValueOnce(mockScopes);
    vi.mocked(protabApi.createActivity).mockResolvedValueOnce(undefined);

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
      expect(within(screen.getByRole('table')).getByText('Scope Nouvelle Saisie')).toBeInTheDocument();
    });

    fireEvent.change(
      within(screen.getByRole('table')).getByLabelText(/Erreurs signalées/),
      { target: { value: '3' } }
    );
    fireEvent.change(
      within(screen.getByRole('table')).getByLabelText(/Incidents créés/),
      { target: { value: '1' } }
    );

    await waitFor(
      () => {
        expect(protabApi.createActivity).toHaveBeenCalledWith(
          '987e6543-e21b-23c4-a456-426614174000',
          { day: '2026-09-19', errors_reported: 3, incidents_created: 1, feai: [] }
        );
      },
      { timeout: 3000 }
    );
    expect(protabApi.updateActivity).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(within(screen.getByRole('table')).getByText('Enregistré')).toBeInTheDocument();
      expect(within(screen.getByRole('table')).getByText('En cours')).toBeInTheDocument();
    });
  });

  it('modifie les erreurs d\'un jour existant via updateActivity en autosave', async () => {
    const mockScopes = [
      {
        id: 'acbd1234-e21b-23c4-a456-426614174000',
        name: 'Scope Existant',
        knowledge_base_id: 'KB-EXISTANT-01',
        official_main: 'Eve',
        official_backup: 'Frank',
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
    vi.mocked(protabApi.updateActivity).mockResolvedValueOnce(undefined);

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
      expect(within(screen.getByRole('table')).getByText('Scope Existant')).toBeInTheDocument();
    });

    fireEvent.change(
      within(screen.getByRole('table')).getByLabelText(/Erreurs signalées/),
      { target: { value: '5' } }
    );

    await waitFor(
      () => {
        expect(protabApi.updateActivity).toHaveBeenCalledWith(
          'acbd1234-e21b-23c4-a456-426614174000',
          '2026-09-19',
          { errors_reported: 5, incidents_created: 1, feai: ['INC000000001'] }
        );
      },
      { timeout: 3000 }
    );
    expect(
      within(screen.getByRole('table')).queryByText('Scope Nouvelle Saisie')
    ).not.toBeInTheDocument();
    expect(protabApi.createActivity).not.toHaveBeenCalled();
  });

  it('ouvre la modale d\'export depuis le bouton Exporter de l\'en-tête', async () => {
    const mockScopes = [
      {
        id: '9922e4567-e89b-12d3-a456-426614174000',
        name: 'Scope Export',
        knowledge_base_id: 'KB-EXPORT-01',
        official_main: 'Alice',
        official_backup: 'Bob',
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
      expect(within(screen.getByRole('table')).getByText('Scope Export')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Exporter/i }));

    expect(
      screen.getByRole('heading', { name: /Exporter les données/i })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));
    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: /Exporter les données/i })
      ).not.toBeInTheDocument();
    });
  });

  it('ajoute une référence FEAI sur un jour existant via updateActivity en autosave', async () => {
    const mockScopes = [
      {
        id: '55551234-e21b-23c4-a456-426614174000',
        name: 'Scope FEAI Existant',
        knowledge_base_id: 'KB-FEAI-01',
        official_main: 'Eve',
        official_backup: 'Frank',
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
    vi.mocked(protabApi.updateActivity).mockResolvedValueOnce(undefined);

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
      expect(within(screen.getByRole('table')).getByText('Scope FEAI Existant')).toBeInTheDocument();
    });

    const feaiInput = within(screen.getByRole('table')).getByLabelText('Ajouter une référence FEAI');
    fireEvent.change(feaiInput, { target: { value: 'inc000000002' } });
    fireEvent.keyDown(feaiInput, { key: 'Enter' });

    await waitFor(
      () => {
        expect(protabApi.updateActivity).toHaveBeenCalledWith(
          '55551234-e21b-23c4-a456-426614174000',
          '2026-09-19',
          {
            errors_reported: 2,
            incidents_created: 1,
            feai: ['INC000000001', 'INC000000002'],
          }
        );
      },
      { timeout: 3000 }
    );

    await waitFor(() => {
      expect(within(screen.getByRole('table')).getByText('Enregistré')).toBeInTheDocument();
    });
    expect(protabApi.createActivity).not.toHaveBeenCalled();
  });

  it('ajoute une référence FEAI sur un jour non saisi via createActivity en autosave', async () => {
    const mockScopes = [
      {
        id: '66664321-e21b-23c4-a456-426614174000',
        name: 'Scope FEAI Nouveau',
        knowledge_base_id: 'KB-FEAI-02',
        official_main: 'Eve',
        official_backup: 'Frank',
        daily_activities: [],
      },
    ];

    vi.mocked(protabApi.getScopeMonitorings).mockResolvedValueOnce(mockScopes);
    vi.mocked(protabApi.createActivity).mockResolvedValueOnce(undefined);

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
      expect(within(screen.getByRole('table')).getByText('Scope FEAI Nouveau')).toBeInTheDocument();
    });

    const feaiInput = within(screen.getByRole('table')).getByLabelText('Ajouter une référence FEAI');
    fireEvent.change(feaiInput, { target: { value: 'INC000000007' } });
    fireEvent.keyDown(feaiInput, { key: 'Enter' });

    await waitFor(
      () => {
        expect(protabApi.createActivity).toHaveBeenCalledWith(
          '66664321-e21b-23c4-a456-426614174000',
          {
            day: '2026-09-19',
            errors_reported: 0,
            incidents_created: 0,
            feai: ['INC000000007'],
          }
        );
      },
      { timeout: 3000 }
    );
  });

  it('supprime une référence FEAI via la croix et sauvegarde via updateActivity', async () => {
    const mockScopes = [
      {
        id: '77774321-e21b-23c4-a456-426614174000',
        name: 'Scope FEAI Suppression',
        knowledge_base_id: 'KB-FEAI-03',
        official_main: 'Eve',
        official_backup: 'Frank',
        daily_activities: [
          {
            day: '2026-09-19',
            errors_reported: 1,
            incidents_created: 0,
            feai: ['INC000000001'],
            handled: true,
            completed: false,
          },
        ],
      },
    ];

    vi.mocked(protabApi.getScopeMonitorings).mockResolvedValueOnce(mockScopes);
    vi.mocked(protabApi.updateActivity).mockResolvedValueOnce(undefined);

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
      expect(within(screen.getByRole('table')).getByText('Scope FEAI Suppression')).toBeInTheDocument();
    });

    const removeButton = within(screen.getByRole('table')).getByRole('button', {
      name: 'Supprimer la référence INC000000001',
    });
    fireEvent.click(removeButton);

    await waitFor(
      () => {
        expect(protabApi.updateActivity).toHaveBeenCalledWith(
          '77774321-e21b-23c4-a456-426614174000',
          '2026-09-19',
          {
            errors_reported: 1,
            incidents_created: 0,
            feai: [],
          }
        );
      },
      { timeout: 3000 }
    );
  });
});