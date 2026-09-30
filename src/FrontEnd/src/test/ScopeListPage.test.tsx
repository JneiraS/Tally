/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ScopeListPage } from '../pages/ScopeListPage';
import { ToastProvider } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import { KNOWLEDGE_BASE_URL } from '../utils/knowledgeBase';
import { protabApi } from '../services/api';
import { getTodayIsoDate } from '../utils/date';

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
    getTodayIsoDate: vi.fn(() => '2026-09-21'),
  };
});

describe('ScopeListPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getTodayIsoDate).mockReturnValue('2026-09-21');
  });

  it('signale les périmètres non traités du dernier jour ouvré', async () => {
    vi.mocked(protabApi.getScopeMonitorings).mockResolvedValueOnce([
      {
        id: 'scope-untreated',
        name: 'Scope non traité',
        knowledge_base_id: 'KB-UNTREATED',
        official_main: 'Alice',
        official_backup: 'Bob',
        billing_code: 'FACT-2026-PAI',
        daily_activities: [],
      },
      {
        id: 'scope-handled',
        name: 'Scope traité',
        knowledge_base_id: 'KB-HANDLED',
        official_main: 'Alice',
        official_backup: 'Bob',
        billing_code: 'FACT-2026-PAI',
        daily_activities: [
          {
            day: '2026-09-18',
            errors_reported: 0,
            incidents_created: 0,
            feai: [],
            handled: true,
            completed: false,
          },
        ],
      },
    ]);

    render(
      <BrowserRouter>
        <ToastProvider>
          <ScopeListPage
            onOpenCreateScope={vi.fn()}
            onOpenImportCsv={vi.fn()}
          />
        </ToastProvider>
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
    expect(screen.getByRole('status')).toHaveTextContent('1 périmètre non traité');
    expect(screen.getByText(/18 sept. 2026/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /voir les 1 périmètres/i })).toBeInTheDocument();
  });

  it('masque le bandeau lorsqu’on consulte le dernier jour ouvré', async () => {
    vi.mocked(protabApi.getScopeMonitorings).mockResolvedValueOnce([
      {
        id: 'scope-untreated',
        name: 'Scope non traité',
        knowledge_base_id: 'KB-UNTREATED',
        official_main: 'Alice',
        official_backup: 'Bob',
        billing_code: 'FACT-2026-PAI',
        daily_activities: [],
      },
    ]);

    render(
      <BrowserRouter>
        <ToastProvider>
          <ScopeListPage
            onOpenCreateScope={vi.fn()}
            onOpenImportCsv={vi.fn()}
          />
        </ToastProvider>
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /voir les 1 périmètres/i }));

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /à traiter/i }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Activité du 18 sept. 2026')).toBeInTheDocument();
  });

  it('remonte au vendredi depuis un lundi pour le dernier jour ouvré', async () => {
    vi.mocked(getTodayIsoDate).mockReturnValue('2026-09-21');
    vi.mocked(protabApi.getScopeMonitorings).mockResolvedValueOnce([
      {
        id: 'scope-untreated',
        name: 'Scope non traité',
        knowledge_base_id: 'KB-UNTREATED',
        official_main: 'Alice',
        official_backup: 'Bob',
        billing_code: 'FACT-2026-PAI',
        daily_activities: [],
      },
    ]);

    render(
      <BrowserRouter>
        <ToastProvider>
          <ScopeListPage
            onOpenCreateScope={vi.fn()}
            onOpenImportCsv={vi.fn()}
          />
        </ToastProvider>
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/18 sept. 2026/)).toBeInTheDocument();
    });
  });

  it('affiche le code de facturation, ou un tiret quand il est absent', async () => {
    // Le code est obligatoire à la création mais reste absent des périmètres
    // enregistrés avant son introduction : l'API ne réécrit pas l'historique.
    const mockScopes = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Scope Facturé',
        knowledge_base_id: 'KB-FACT-0001',
        official_main: 'Alice',
        official_backup: 'Bob',
        billing_code: 'FACT-2026-PAI',
        daily_activities: [],
      },
      {
        id: '223e4567-e89b-12d3-a456-426614174000',
        name: 'Scope Ancien',
        knowledge_base_id: 'KB-FACT-0002',
        official_main: 'Alice',
        official_backup: 'Bob',
        billing_code: null,
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

    const table = within(await screen.findByRole('table'));

    expect(table.getByLabelText('Code de facturation : FACT-2026-PAI')).toBeInTheDocument();
    expect(table.getByLabelText('Code de facturation non renseigné')).toHaveTextContent('—');

    // La pastille précède le nom, dans le tableau comme dans la carte mobile.
    // Le <li> mobile porte le même role que le <tr> : il faut passer par la <ul>
    // pour ne pas confondre les deux rendus, tous deux présents dans le DOM.
    const comesFirst = (badge: HTMLElement, name: HTMLElement) =>
      Boolean(badge.compareDocumentPosition(name) & Node.DOCUMENT_POSITION_FOLLOWING);

    expect(
      comesFirst(
        table.getByLabelText('Code de facturation : FACT-2026-PAI'),
        table.getByText('Scope Facturé')
      )
    ).toBe(true);

    const cards = within(screen.getByRole('list', { name: 'Périmètres de supervision' }));
    expect(
      comesFirst(
        cards.getByLabelText('Code de facturation : FACT-2026-PAI'),
        cards.getByText('Scope Facturé')
      )
    ).toBe(true);
  });

  it('filtre les périmètres par code de facturation', async () => {
    const mockScopes = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Scope Facturé',
        knowledge_base_id: 'KB-FACT-0001',
        official_main: 'Alice',
        official_backup: 'Bob',
        billing_code: 'FACT-2026-REC',
        daily_activities: [],
      },
      {
        id: '223e4567-e89b-12d3-a456-426614174000',
        name: 'Scope Infrastructure',
        knowledge_base_id: 'KB-FACT-0002',
        official_main: 'Alice',
        official_backup: 'Bob',
        billing_code: 'FACT-2026-INF',
        daily_activities: [],
      },
    ];

    vi.mocked(protabApi.getScopeMonitorings).mockResolvedValue(mockScopes);

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

    const table = within(await screen.findByRole('table'));
    await waitFor(() => {
      expect(table.getByText('Scope Facturé')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/Rechercher/i), {
      target: { value: 'FACT-2026-REC' },
    });

    await waitFor(() => {
      expect(table.getByText('Scope Facturé')).toBeInTheDocument();
      expect(table.queryByText('Scope Infrastructure')).not.toBeInTheDocument();
    });
  });

  it('affiche le chargement puis la liste des périmètres', async () => {
    const mockScopes = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Scope Alpha Test',
        knowledge_base_id: 'KB-TEST-0001',
        official_main: 'Alice',
        official_backup: 'Bob',
        billing_code: 'FACT-2026-PAI',
        daily_activities: [
          {
            day: '2026-09-21',
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
        billing_code: 'FACT-2026-PAI',
        daily_activities: [
          {
            day: '2026-09-21',
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
        billing_code: 'FACT-2026-PAI',
        daily_activities: [
          {
            day: '2026-09-21',
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
        billing_code: 'FACT-2026-PAI',
        daily_activities: [],
      },
      {
        id: '333e4567-e89b-12d3-a456-426614174003',
        name: 'Scope Terminé Filtre',
        knowledge_base_id: 'KB-FILTRE-03',
        official_main: 'Eve',
        official_backup: 'Frank',
        billing_code: 'FACT-2026-PAI',
        daily_activities: [
          {
            day: '2026-09-21',
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
        billing_code: 'FACT-2026-PAI',
        daily_activities: [
          {
            day: '2026-09-21',
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
        billing_code: 'FACT-2026-PAI',
        daily_activities: [],
      },
      {
        id: '333e4567-e89b-12d3-a456-426614174003',
        name: 'Scope Terminé Filtre',
        knowledge_base_id: 'KB-FILTRE-03',
        official_main: 'Eve',
        official_backup: 'Frank',
        billing_code: 'FACT-2026-PAI',
        daily_activities: [
          {
            day: '2026-09-21',
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
        billing_code: 'FACT-2026-PAI',
        daily_activities: [
          {
            day: '2026-09-21',
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
        billing_code: 'FACT-2026-PAI',
        daily_activities: [
          {
            day: '2026-09-21',
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
        billing_code: 'FACT-2026-PAI',
        daily_activities: [
          {
            day: '2026-09-21',
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
        { days: ['2026-09-21'] }
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
        billing_code: 'FACT-2026-PAI',
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
        { day: '2026-09-21', errors_reported: 0, incidents_created: 0, feai: [] }
      );
      expect(protabApi.completeActivities).toHaveBeenCalledWith(
        '987e6543-e21b-23c4-a456-426614174000',
        { days: ['2026-09-21'] }
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
        billing_code: 'FACT-2026-PAI',
        daily_activities: [
          {
            day: '2026-09-21',
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
        { days: ['2026-09-21'] }
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
        billing_code: 'FACT-2026-PAI',
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
          { day: '2026-09-21', errors_reported: 3, incidents_created: 1, feai: [] }
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
        billing_code: 'FACT-2026-PAI',
        daily_activities: [
          {
            day: '2026-09-21',
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
          '2026-09-21',
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
        billing_code: 'FACT-2026-PAI',
        daily_activities: [
          {
            day: '2026-09-21',
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
        billing_code: 'FACT-2026-PAI',
        daily_activities: [
          {
            day: '2026-09-21',
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
          '2026-09-21',
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
        billing_code: 'FACT-2026-PAI',
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
            day: '2026-09-21',
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
        billing_code: 'FACT-2026-PAI',
        daily_activities: [
          {
            day: '2026-09-21',
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
          '2026-09-21',
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

  it('restaure une référence FEAI annihilée par le bouton Annuler', async () => {
    const mockScopes = [
      {
        id: '88884321-e21b-23c4-a456-426614174000',
        name: 'Scope FEAI Annulation',
        knowledge_base_id: 'KB-FEAI-04',
        official_main: 'Eve',
        official_backup: 'Frank',
        billing_code: 'FACT-2026-PAI',
        daily_activities: [
          {
            day: '2026-09-21',
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
    vi.mocked(protabApi.updateActivity).mockResolvedValue(undefined);

    render(
      <BrowserRouter>
        <ToastProvider>
          <ScopeListPage
            onOpenCreateScope={vi.fn()}
            onOpenImportCsv={vi.fn()}
          />
          <ToastContainer />
        </ToastProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(within(screen.getByRole('table')).getByText('Scope FEAI Annulation')).toBeInTheDocument();
    });

    fireEvent.click(
      within(screen.getByRole('table')).getByRole('button', {
        name: 'Supprimer la référence INC000000001',
      })
    );

    await waitFor(
      () => {
        expect(protabApi.updateActivity).toHaveBeenCalledWith(
          '88884321-e21b-23c4-a456-426614174000',
          '2026-09-21',
          { errors_reported: 1, incidents_created: 0, feai: [] }
        );
      },
      { timeout: 3000 }
    );

    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));

    await waitFor(
      () => {
        expect(protabApi.updateActivity).toHaveBeenLastCalledWith(
          '88884321-e21b-23c4-a456-426614174000',
          '2026-09-21',
          { errors_reported: 1, incidents_created: 0, feai: ['INC000000001'] }
        );
      },
      { timeout: 3000 }
    );
  });

  it('ouvre sur le dernier jour ouvré quand la date du jour n\'est pas ouvrée', async () => {
    vi.mocked(getTodayIsoDate).mockReturnValue('2026-09-27');
    vi.mocked(protabApi.getScopeMonitorings).mockResolvedValueOnce([
      {
        id: 'aaaa1111-e21b-23c4-a456-426614174000',
        name: 'Scope Historique',
        knowledge_base_id: 'KB-HISTOR-01',
        official_main: 'Alice',
        official_backup: 'Bob',
        billing_code: 'FACT-2026-PAI',
        daily_activities: [
          {
            day: '2026-09-25',
            errors_reported: 5,
            incidents_created: 2,
            feai: ['INC000000009'],
            handled: true,
            completed: true,
          },
        ],
      },
    ]);

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
      expect(screen.getByText('Activité du 25 sept. 2026')).toBeInTheDocument();
    });

    const table = within(screen.getByRole('table'));
    expect(table.getByLabelText('Erreurs signalées 2026-09-25')).toHaveValue(5);
    expect(table.getByLabelText('Incidents créés 2026-09-25')).toHaveValue(2);
    expect(table.getByText('Terminé')).toBeInTheDocument();
  });

  it('affiche les compteurs du jour sélectionné après un changement de jour', async () => {
    vi.mocked(getTodayIsoDate).mockReturnValue('2026-09-25');
    vi.mocked(protabApi.getScopeMonitorings).mockResolvedValueOnce([
      {
        id: 'bbbb2222-e21b-23c4-a456-426614174000',
        name: 'Scope Deux Jours',
        knowledge_base_id: 'KB-DEUXJOURS-1',
        official_main: 'Alice',
        official_backup: 'Bob',
        billing_code: 'FACT-2026-PAI',
        daily_activities: [
          {
            day: '2026-09-25',
            errors_reported: 5,
            incidents_created: 2,
            feai: [],
            handled: false,
            completed: false,
          },
          {
            day: '2026-09-24',
            errors_reported: 9,
            incidents_created: 4,
            feai: ['INC000000042'],
            handled: false,
            completed: false,
          },
        ],
      },
    ]);

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
      expect(
        within(screen.getByRole('table')).getByLabelText('Erreurs signalées 2026-09-25'),
      ).toHaveValue(5);
    });

    fireEvent.click(screen.getByRole('button', { name: /Afficher le jour précédent/i }));

    await waitFor(() => {
      expect(
        within(screen.getByRole('table')).getByLabelText('Erreurs signalées 2026-09-24'),
      ).toHaveValue(9);
    });
    expect(
      within(screen.getByRole('table')).getByLabelText('Incidents créés 2026-09-24'),
    ).toHaveValue(4);
  });

  it('signale la dernière saisie et permet d\'afficher cette journée', async () => {
    vi.mocked(getTodayIsoDate).mockReturnValue('2026-09-28');
    vi.mocked(protabApi.getScopeMonitorings).mockResolvedValueOnce([
      {
        id: 'cccc3333-e21b-23c4-a456-426614174000',
        name: 'Scope Retard',
        knowledge_base_id: 'KB-RETARD-001',
        official_main: 'Alice',
        official_backup: 'Bob',
        billing_code: 'FACT-2026-PAI',
        daily_activities: [
          {
            day: '2026-09-25',
            errors_reported: 5,
            incidents_created: 2,
            feai: [],
            handled: true,
            completed: true,
          },
        ],
      },
    ]);

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

    const notice = await screen.findByRole('status');
    expect(notice).toHaveTextContent('Aucune saisie le 28 sept. 2026');
    expect(notice).toHaveTextContent('25 sept. 2026');
    expect(notice).toHaveTextContent('1 périmètre');
    expect(notice).toHaveTextContent('5 erreurs');
    expect(notice).toHaveTextContent('2 incidents');

    fireEvent.click(
      within(notice).getByRole('button', { name: /Voir les données du 25 sept. 2026/i })
    );

    await waitFor(() => {
      expect(screen.getByText('Activité du 25 sept. 2026')).toBeInTheDocument();
    });
    expect(
      within(screen.getByRole('table')).getByLabelText('Erreurs signalées 2026-09-25'),
    ).toHaveValue(5);
  });

  it('n\'affiche pas le bandeau « dernière saisie » quand le jour affiché contient des données', async () => {
    vi.mocked(getTodayIsoDate).mockReturnValue('2026-09-25');
    vi.mocked(protabApi.getScopeMonitorings).mockResolvedValueOnce([
      {
        id: 'dddd4444-e21b-23c4-a456-426614174000',
        name: 'Scope A Jour',
        knowledge_base_id: 'KB-AJOUR-0001',
        official_main: 'Alice',
        official_backup: 'Bob',
        billing_code: 'FACT-2026-PAI',
        daily_activities: [
          {
            day: '2026-09-25',
            errors_reported: 5,
            incidents_created: 2,
            feai: [],
            handled: true,
            completed: true,
          },
          {
            day: '2026-09-24',
            errors_reported: 1,
            incidents_created: 0,
            feai: [],
            handled: true,
            completed: true,
          },
        ],
      },
    ]);

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
      expect(
        within(screen.getByRole('table')).getByLabelText('Erreurs signalées 2026-09-25'),
      ).toHaveValue(5);
    });

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
