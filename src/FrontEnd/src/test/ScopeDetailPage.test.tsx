/**
 * La page de détail d'un périmètre — sur le périmètre de la barre d'actions
 * groupées.
 *
 * Cette page est longue et n'avait aucun test ; on ne prétend pas la couvrir
 * toute. Ce que ces tests verrouillent est le lot : la sélection alimente le
 * même appel pour « Marquer comme terminé » et pour « Signaler un KO », et le
 * KO **ne recharge rien** — un `fetchScopeDetail` remettrait `isLoading` à vrai
 * et effacerait le jour sélectionné dans la carte « Activité du jour ».
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ScopeDetailPage } from '../pages/ScopeDetailPage';
import { ToastContainer } from '../components/Toast';
import { ToastProvider } from '../hooks/useToast';
import { protabApi } from '../services/api';
import { getTodayIsoDate } from '../utils/date';
import { makeActivity, makeScope } from './factories';

vi.mock('../services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/api')>();
  return {
    ...actual,
    protabApi: {
      ...actual.protabApi,
      getScopeMonitoring: vi.fn(),
      setActivitiesStatus: vi.fn(),
      createActivity: vi.fn(),
      updateActivity: vi.fn(),
    },
  };
});

vi.mock('../utils/date', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/date')>();
  return { ...actual, getTodayIsoDate: vi.fn(() => '2026-09-23') };
});

const TODAY = '2026-09-23';

function scopeWithDays() {
  return makeScope({
    id: 'scope-1',
    name: 'Périmètre Alpha',
    knowledge_base_id: 'KB-ALPHA-0001',
    daily_activities: [
      makeActivity('2026-09-20', { errors_reported: 1, status: 'completed' }),
      makeActivity('2026-09-21', { errors_reported: 1, status: 'completed' }),
      makeActivity('2026-09-22', { errors_reported: 2 }),
      makeActivity(TODAY, { errors_reported: 3 }),
    ],
  });
}

async function renderPage() {
  vi.mocked(protabApi.getScopeMonitoring).mockResolvedValue(scopeWithDays());
  render(
    <MemoryRouter initialEntries={['/scopes/scope-1']}>
      <ToastProvider>
        <Routes>
          <Route path="/scopes/:id" element={<ScopeDetailPage />} />
        </Routes>
        <ToastContainer />
      </ToastProvider>
    </MemoryRouter>,
  );
  await screen.findByRole('heading', { name: /Saisie du/i });
}

/**
 * Le tableau mono-jour affiche une ligne ; l'historique complet, qui porte la
 * sélection multiple, vit dans un panneau déroulant. Les tests de lot doivent
 * donc l'ouvrir — sinon les cases à cocher n'existent pas dans le DOM.
 */
async function openHistory() {
  const details = document.querySelector('details');
  if (!(details instanceof HTMLDetailsElement)) throw new Error('panneau introuvable');
  // Ouverture directe : jsdom ne synthétise pas le basculement au clic sur
  // <summary>, donc on force l'attribut — c'est l'utilisateur qui le fait dans
  // le navigateur.
  if (!details.open) {
    fireEvent.click(screen.getByText('Historique des journées'));
    if (!details.open) details.open = true;
    await waitFor(() => expect(details.open).toBe(true));
  }
  return within(details);
}



function checkboxFor(day: string) {
  return screen.getByRole('checkbox', { name: `Sélectionner le jour ${day}` });
}

describe('ScopeDetailPage — barre d’actions groupées', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getTodayIsoDate).mockReturnValue(TODAY);
    vi.mocked(protabApi.setActivitiesStatus).mockResolvedValue(undefined);
  });

  it('n’affiche la barre qu’une ligne est sélectionnée', async () => {
    await renderPage();

    // Le libellé du lot porte son compte : il ne doit pas se confondre avec le
    // bouton du panneau de statut, qui agit sur le seul jour affiché.
    expect(
      screen.queryByRole('button', { name: /Signaler le jour en KO/ }),
    ).not.toBeInTheDocument();

    await openHistory();
    fireEvent.click(checkboxFor('2026-09-22'));

    expect(
      screen.getByRole('button', { name: /Signaler le jour en KO/ }),
    ).toBeInTheDocument();
    expect(screen.getByText(/1 journée\(s\) sélectionnée/)).toBeInTheDocument();
  });

  it('termine les jours sélectionnés par le même appel que le KO', async () => {
    // Les deux actions partagent une route : le KO n'est pas un cas particulier
    // côté serveur, seulement un statut de plus.
    await renderPage();

    await openHistory();
    fireEvent.click(checkboxFor('2026-09-22'));
    fireEvent.click(screen.getByRole('button', { name: /Marquer comme terminé/ }));

    await waitFor(() => {
      expect(protabApi.setActivitiesStatus).toHaveBeenCalledWith('scope-1', {
        days: ['2026-09-22'],
        status: 'completed',
      });
    });
  });

  it('signale les jours sélectionnés en KO sans motif', async () => {
    await renderPage();

    await openHistory();
    fireEvent.click(checkboxFor('2026-09-22'));
    fireEvent.click(screen.getByRole('button', { name: /Signaler le jour en KO/ }));
    fireEvent.click(screen.getByRole('button', { name: /Signaler la journée/ }));

    await waitFor(() => {
      expect(protabApi.setActivitiesStatus).toHaveBeenCalledWith('scope-1', {
        days: ['2026-09-22'],
        status: 'ko',
        ko_reason: null,
      });
    });
  });

  it('reporte le KO sur l’écran sans rien recharger', async () => {
    await renderPage();

    await openHistory();
    fireEvent.click(checkboxFor('2026-09-22'));
    fireEvent.click(screen.getByRole('button', { name: /Signaler le jour en KO/ }));
    fireEvent.change(screen.getByLabelText('Motif du KO (facultatif)'), {
      target: { value: 'Collecteur HS' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Signaler la journée/ }));

    const history = await openHistory();
    await waitFor(() => {
      expect(history.getAllByText('KO').length).toBeGreaterThan(0);
    });
    expect(history.getByText('Collecteur HS')).toBeInTheDocument();
    // Le point du test : un rechargement remettrait `isLoading` à vrai et
    // remplacerait le jour affiché par « Chargement du périmètre… ».
    expect(vi.mocked(protabApi.getScopeMonitoring)).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole('region', { name: new RegExp(TODAY) }),
    ).toBeInTheDocument();
  });

  it('vide la sélection après le lot', async () => {
    await renderPage();

    await openHistory();
    await openHistory();
    fireEvent.click(checkboxFor('2026-09-22'));
    fireEvent.click(screen.getByRole('button', { name: /Signaler le jour en KO/ }));
    fireEvent.click(screen.getByRole('button', { name: /Signaler la journée/ }));

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: /Signaler le jour en KO/ }),
      ).not.toBeInTheDocument();
    });
  });

  it('laisse une journée KO sélectionnable, pour la terminer après la panne', async () => {
    // C'est le comportement voulu : une journée bloquée se rattrape. Le
    //Checkbox disparaît seulement quand elle est terminée.
    vi.mocked(protabApi.getScopeMonitoring).mockResolvedValue(
      makeScope({
        id: 'scope-1',
        name: 'Périmètre Alpha',
        daily_activities: [
          makeActivity('2026-09-22', { status: 'ko', ko_reason: 'Collecteur HS' }),
        ],
      }),
    );
    render(
      <MemoryRouter initialEntries={['/scopes/scope-1']}>
        <ToastProvider>
          <Routes>
            <Route path="/scopes/:id" element={<ScopeDetailPage />} />
          </Routes>
          <ToastContainer />
        </ToastProvider>
      </MemoryRouter>,
    );
    await screen.findByRole('heading', { name: /Saisie du/i });

    await openHistory();
    expect(checkboxFor('2026-09-22')).toBeInTheDocument();

    fireEvent.click(checkboxFor('2026-09-22'));
    fireEvent.click(screen.getByRole('button', { name: /Marquer comme terminé/ }));

    await waitFor(() => {
      expect(protabApi.setActivitiesStatus).toHaveBeenCalledWith('scope-1', {
        days: ['2026-09-22'],
        status: 'completed',
      });
    });
  });
});
describe('ScopeDetailPage — page mono-jour', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getTodayIsoDate).mockReturnValue(TODAY);
    vi.mocked(protabApi.setActivitiesStatus).mockResolvedValue(undefined);
  });

  /** Le tableau du jour affiché, à distinguer de celui de l'historique. */
  function dayTable() {
    return within(
      screen.getByRole('heading', { name: /Relevé du/i }).closest('div.space-y-3')!,
    );
  }

  it('n’affiche qu’une seule ligne, celle du jour sélectionné', async () => {
    await renderPage();

    const rows = dayTable().getAllByRole('row');
    // Une ligne d'en-tête + une ligne de donnée : le tableau ne liste PAS tout
    // l'historique, c'était la source du « cumul » décrit.
    expect(rows).toHaveLength(2);
    expect(dayTable().getByText('23 sept. 2026')).toBeInTheDocument();
    expect(dayTable().queryByText('22 sept. 2026')).not.toBeInTheDocument();
  });

  it('suit le sélecteur de jour sans empiler de ligne', async () => {
    await renderPage();
    expect(dayTable().getByText('23 sept. 2026')).toBeInTheDocument();

    // Trois jours en arrière : la ligne affichée doit être REMPLACÉE, pas
    // ajoutée. C'est exactement ce que la page ne faisait pas.
    fireEvent.click(screen.getByLabelText(/Afficher le jour précédent/));
    await waitFor(() => {
      expect(dayTable().getByText('22 sept. 2026')).toBeInTheDocument();
    });
    expect(dayTable().queryByText('23 sept. 2026')).not.toBeInTheDocument();
    expect(dayTable().getAllByRole('row')).toHaveLength(2);

    fireEvent.click(screen.getByLabelText(/Afficher le jour précédent/));
    await waitFor(() => {
      expect(dayTable().getByText('21 sept. 2026')).toBeInTheDocument();
    });
    expect(dayTable().getAllByRole('row')).toHaveLength(2);
  });

  it('ne répète pas le jour affiché dans l’historique', async () => {
    await renderPage();

    const history = await openHistory();
    expect(history.getByText('22 sept. 2026')).toBeInTheDocument();
    // Le jour affiché a sa carte « Relevé » : le redire dans l'historique
    // afficherait deux fois la même donnée.
    expect(history.queryByText('23 sept. 2026')).not.toBeInTheDocument();
  });

  it('garde l’historique complet et sans doublon', async () => {
    await renderPage();

    const history = await openHistory();
    // 5 journées relevées, une seule exclue du tableau : les 4 autres sont là,
    // chacune une fois.
    const days = history
      .getAllByRole('row')
      .slice(1)
      .map((row) => within(row).getAllByText(/^\d{4}-\d{2}-\d{2}$/)[0].textContent);
    expect(days).toEqual(['2026-09-22', '2026-09-21', '2026-09-20']);
    expect(new Set(days).size).toBe(days.length);
  });

  it('annonce un relevé absent pour un jour sans saisie', async () => {
    await renderPage();

    const previous = screen.getByLabelText(/Afficher le jour précédent/);
    // 23 → 22 → 21 → 20 → 19 ; aucune relevé n'existe pour le 19.
    for (let i = 0; i < 4; i += 1) fireEvent.click(previous);
    await waitFor(() => {
      expect(
        screen.getByText(/Aucune activité le 19 sept\. 2026/),
      ).toBeInTheDocument();
    });
  });

  it('ne propose qu’un seul chemin de saisie pour le jour affiché', async () => {
    // L'éditeur du dessus saisit les compteurs en autosave. Le crayon de la
    // ligne ouvrait la même saisie par la modale : deux validations et deux
    // boutons pour la même écriture. Le récapitulatif ne saisit plus.
    await renderPage();

    const box = dayTable();
    expect(
      box.queryByRole('button', { name: /Modifier l'activité/ }),
    ).not.toBeInTheDocument();
    // Les compteurs restent visibles, en lecture.
    expect(box.getByText('3')).toBeInTheDocument();
  });

  it('garde « Terminer » et ajoute « Signaler un KO » sur la ligne du jour', async () => {
    await renderPage();

    const box = dayTable();
    expect(box.getByRole('button', { name: /Terminer/ })).toBeInTheDocument();
    // Le KO n'existait pas par ligne : le panneau du haut ne couvre qu'un jour.
    expect(box.getByRole('button', { name: /^KO$/ })).toBeInTheDocument();
  });

  it('signale le KO du jour affiché depuis sa ligne, sans recharger', async () => {
    await renderPage();

    fireEvent.click(dayTable().getByRole('button', { name: /^KO$/ }));
    // La modale annonce le jour au singulier.
    expect(
      screen.getByRole('button', { name: /Signaler la journée/ }),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Motif du KO (facultatif)'), {
      target: { value: 'Collecteur HS' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Signaler la journée/ }));

    await waitFor(() => {
      expect(protabApi.setActivitiesStatus).toHaveBeenCalledWith('scope-1', {
        days: [TODAY],
        status: 'ko',
        ko_reason: 'Collecteur HS',
      });
    });
    expect(vi.mocked(protabApi.getScopeMonitoring)).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(dayTable().getByText('KO')).toBeInTheDocument();
    });
  });

  it('laisse l’historique garder son crayon de saisie', async () => {
    // Le jour affiché a son éditeur ; les autres journées de l'historique n'ont
    // pas d'éditeur, donc la modale reste leur seul accès à la saisie.
    await renderPage();

    const history = await openHistory();
    expect(
      history.getAllByRole('button', { name: /Modifier l'activité/ }).length,
    ).toBeGreaterThan(0);
  });

  it('n’expose aucune case de sélection sur le tableau du jour', async () => {
    // La sélection multiple n'a de sens que sur l'historique : une seule ligne,
    // c'est un cas particulier que le composant sait déjà traiter.
    await renderPage();

    expect(dayTable().queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('écrit le KO du jour affiché sans passer par l’historique', async () => {
    await renderPage();

    fireEvent.click(screen.getByRole('button', { name: /Signaler un KO/ }));
    fireEvent.change(screen.getByLabelText('Motif du KO'), {
      target: { value: 'Collecteur HS' },
    });
    // « Enregistrer » existe aussi dans la carte de note : on cible le panneau.
    const panel = screen.getByRole('region', { name: new RegExp(TODAY) });
    fireEvent.click(within(panel).getByRole('button', { name: 'Enregistrer' }));

    await waitFor(() => {
      expect(protabApi.setActivitiesStatus).toHaveBeenCalledWith('scope-1', {
        days: [TODAY],
        status: 'ko',
        ko_reason: 'Collecteur HS',
      });
    });
  });
});
