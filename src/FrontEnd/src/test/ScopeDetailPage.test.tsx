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
      updateScopeOfficials: vi.fn(),
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

async function renderPage(isAdmin = false) {
  vi.mocked(protabApi.getScopeMonitoring).mockResolvedValue(scopeWithDays());
  render(
    <MemoryRouter initialEntries={['/scopes/scope-1']}>
      <ToastProvider>
        <Routes>
          <Route path="/scopes/:id" element={<ScopeDetailPage isAdmin={isAdmin} />} />
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
            <Route path="/scopes/:id" element={<ScopeDetailPage isAdmin={false} />} />
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

  /**
   * La zone de saisie du jour affiché.
   *
   * Elle a remplacé le tableau mono-jour supprimé : la garantie porte donc sur
   * les champs eux-mêmes — un seul groupe, qui suit le sélecteur de jour.
   */
  function editor() {
    return within(
      screen.getByRole('heading', { name: /Saisie du/i }).closest('div.space-y-4')!,
    );
  }

  /** Les champs du compteur d'erreurs — un seul doit exister à la fois. */
  const errorFields = () => screen.getAllByLabelText('Erreurs signalées du jour');

  it('n’expose qu’une seule zone de saisie sur toute la page', async () => {
    // Le doublon qui motivait la suppression : l'éditeur du dessus et le tableau
    // du jour « Relevé » proposaient la même écriture par deux routes.
    await renderPage();

    expect(errorFields()).toHaveLength(1);
    expect(
      screen.queryByRole('heading', { name: /Relevé du/i }),
    ).not.toBeInTheDocument();
  });

  it('suit le sélecteur de jour sans jamais dupliquer l’éditeur', async () => {
    await renderPage();
    expect(editor().getByRole('heading', { name: /23 septembre 2026/ })).toBeInTheDocument();
    expect(errorFields()).toHaveLength(1);

    // Trois jours en arrière : l'éditeur doit être REMPLACÉ, pas empilé. C'est
    // exactement ce que la page ne faisait pas avant le passage mono-jour.
    const previous = screen.getByLabelText(/Afficher le jour précédent/);
    for (const day of [22, 21]) {
      fireEvent.click(previous);
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: new RegExp(`${day} septembre 2026`) }),
        ).toBeInTheDocument();
      });
      expect(errorFields()).toHaveLength(1);
    }
  });

  it('pré-remplit l’éditeur avec les valeurs du jour sélectionné', async () => {
    // Le sélecteur ne déplace pas seulement un titre : il doit recharger les
    // compteurs, sinon on saisirait le jour affiché dans ceux d'un autre.
    await renderPage();
    expect(errorFields()[0]).toHaveValue(3);

    fireEvent.click(screen.getByLabelText(/Afficher le jour précédent/));
    await waitFor(() => {
      expect(errorFields()[0]).toHaveValue(2);
    });

    fireEvent.click(screen.getByLabelText(/Afficher le jour précédent/));
    await waitFor(() => {
      // Le 21 septembre est terminé : l'éditeur le montre malgré tout.
      expect(errorFields()[0]).toHaveValue(1);
    });
  });

  it('inclut le jour affiché dans l’historique', async () => {
    // L'historique l'excluait pour ne pas le montrer deux fois à côté de son
    // propre tableau ; ce tableau ayant disparu, l'exclusion aussi.
    await renderPage();

    const history = await openHistory();
    expect(history.getByText('22 sept. 2026')).toBeInTheDocument();
    expect(history.getByText('23 sept. 2026')).toBeInTheDocument();
  });

  it('garde l’historique complet et sans doublon', async () => {
    await renderPage();

    const history = await openHistory();
    // Les 4 journées relevées, chacune une fois, jour affiché compris.
    const days = history
      .getAllByRole('row')
      .slice(1)
      .map((row) => within(row).getAllByText(/^\d{4}-\d{2}-\d{2}$/)[0].textContent);
    expect(days).toEqual(['2026-09-23', '2026-09-22', '2026-09-21', '2026-09-20']);
    expect(new Set(days).size).toBe(days.length);
  });

  it('affiche une journée sans saisie comme telle, sans tableau dédié', async () => {
    // L'état « aucune saisie » appartenait au tableau du jour supprimé. Il reste
    // porté par l'éditeur et par le panneau de statut.
    await renderPage();

    const previous = screen.getByLabelText(/Afficher le jour précédent/);
    // 23 → 22 → 21 → 20 → 19 ; aucun relevé n'existe pour le 19.
    for (let i = 0; i < 4; i += 1) fireEvent.click(previous);
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /19 septembre 2026/ }),
      ).toBeInTheDocument();
    });
    const panel = screen.getByRole('region', { name: 'Statut de la journée 2026-09-19' });
    expect(panel).toHaveTextContent('À traiter');
    // Aucun relevé : les champs restent à zéro, et rien ne le prétend saisi.
    // Le libellé d'état de l'éditeur ne s'affiche que sur saisie invalide ou en
    // cours ; c'est le panneau de statut qui porte l'état « à traiter ».
    expect(errorFields()[0]).toHaveValue(0);
  });

  it('ne propose qu’un seul chemin de saisie pour le jour affiché', async () => {
    // L'éditeur saisit les compteurs en autosave ; la modale, atteinte par le
    // crayon de l'historique, saisit les mêmes données. Deux routes pour la même
    // écriture : deux validations et deux boutons à faire diverger.
    await renderPage();

    const history = await openHistory();
    // Chaque ligne de l'historique a son crayon — le jour affiché compris, et
    // c'est assumé : l'historique est un inventaire, l'éditeur la zone de saisie.
    expect(
      history.getAllByRole('button', { name: /Modifier l'activité/ }).length,
    ).toBeGreaterThan(0);
    // Mais il n'existe qu'un seul éditeur à l'écran.
    expect(errorFields()).toHaveLength(1);
  });

  it('garde « Terminer » et « Signaler un KO » sur chaque ligne d’historique', async () => {
    await renderPage();

    const history = await openHistory();
    // Deux journées terminées n'offrent plus « Terminer » : il en reste 2.
    expect(history.getAllByRole('button', { name: /Terminer/ }).length).toBe(2);
    expect(history.getAllByRole('button', { name: /^KO$/ }).length).toBe(2);
  });

  it('signale le KO d’une journée depuis sa ligne, sans recharger', async () => {
    await renderPage();

    const history = await openHistory();
    const row = history.getAllByRole('row').find((r) => within(r).queryByText(TODAY))!;
    fireEvent.click(within(row).getByRole('button', { name: /^KO$/ }));
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
      expect(history.getAllByText('KO').length).toBeGreaterThan(0);
    });
  });

  it('n’expose des cases de sélection que dans l’historique', async () => {
    await renderPage();

    // La zone de saisie n'a pas de tableau, donc rien à cocher.
    expect(errorFields()).toHaveLength(1);
    const history = await openHistory();
    expect(
      history.getAllByRole('checkbox', { name: /Sélectionner le jour/ }).length,
    ).toBeGreaterThan(0);
  });

  it('écrit le KO du jour affiché sans passer par l’historique', async () => {
    await renderPage();

    fireEvent.click(screen.getByRole('button', { name: /Signaler un KO/ }));
    fireEvent.change(screen.getByLabelText('Motif du KO'), {
      target: { value: 'Collecteur HS' },
    });
    // « Enregistrer » existe aussi dans la carte de note : on cible le panneau.
    const panel = screen.getByRole('region', { name: `Statut de la journée ${TODAY}` });
    fireEvent.click(within(panel).getByRole('button', { name: 'Enregistrer' }));

    await waitFor(() => {
      expect(protabApi.setActivitiesStatus).toHaveBeenCalledWith('scope-1', {
        days: [TODAY],
        status: 'ko',
        ko_reason: 'Collecteur HS',
      });
    });
  });

  it("n'expose pas la carte des responsables à un non-admin", async () => {
    // La tuile « Responsable Principal » reste le seul affichage : l'édition
    // est une commodité admin, pas un droit déduit de la page.
    await renderPage(false);

    expect(screen.queryByLabelText('Responsable principal')).not.toBeInTheDocument();
  });

  it('expose la carte des responsables à un admin et ne recharge rien', async () => {
    vi.mocked(protabApi.updateScopeOfficials).mockResolvedValue(undefined as never);
    await renderPage(true);

    const main = screen.getByLabelText('Responsable principal');
    expect(main).toHaveValue('LAMA');

    fireEvent.change(main, { target: { value: 'MLOZ' } });
    // « Enregistrer » existe aussi dans la carte de note : on cible la carte,
    // dont le conteneur porte ses coins arrondis.
    const card = screen
      .getByRole('heading', { name: 'Responsables' })
      .closest('div.rounded-2xl');
    if (!(card instanceof HTMLElement)) throw new Error('carte introuvable');
    fireEvent.click(within(card).getByRole('button', { name: 'Enregistrer' }));

    await waitFor(() => {
      expect(protabApi.updateScopeOfficials).toHaveBeenCalledWith('scope-1', {
        official_main: 'MLOZ',
        official_backup: 'JMAB',
      });
    });
    // La tuile reflète la valeur enregistrée — mise à jour locale, sans
    // `fetchScopeDetail` qui effacerait le jour sélectionné.
    await waitFor(() => {
      expect(screen.getAllByText('MLOZ').length).toBeGreaterThan(0);
    });
    expect(protabApi.getScopeMonitoring).toHaveBeenCalledTimes(1);
  });
});
