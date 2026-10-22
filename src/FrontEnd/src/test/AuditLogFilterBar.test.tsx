/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  AuditLogFilterBar,
  EMPTY_FILTERS,
  activeFilterCount,
} from '../components/AuditLogFilterBar';
import type { AuditLogFilters } from '../components/AuditLogFilterBar';
import { makeScope, makeScopes } from './factories';
import { expectDoesNotClip } from './overflowGuard';

function setup(initial: Partial<AuditLogFilters> = {}) {
  const onChange = vi.fn();
  const onReset = vi.fn();
  const filters = { ...EMPTY_FILTERS, ...initial };
  render(
    <AuditLogFilterBar
      filters={filters}
      onChange={onChange}
      onReset={onReset}
      scopes={makeScopes(['Périmètre Alpha', 'Périmètre Beta'])}
    />,
  );
  return { onChange, onReset };
}

describe('AuditLogFilterBar', () => {
  it('expose un nom accessible à chaque champ', () => {
    setup();

    // Le placeholder disparaît dès la première frappe : seul un aria-label
    // (ou un label associé) donne un nom stable au champ.
    expect(screen.getByLabelText('Quadrigramme')).toBeInTheDocument();
    expect(screen.getByLabelText("Type d'action")).toBeInTheDocument();
    expect(screen.getByLabelText('Journal : à partir du')).toBeInTheDocument();
    expect(screen.getByLabelText("Journal : jusqu'au")).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Sélectionner les périmètres du journal/i),
    ).toBeInTheDocument();
  });

  it('liste les huit actions et rien de plus', () => {
    setup();

    const options = screen.getAllByRole('option').map((o) => o.textContent);
    expect(options).toEqual([
      'Toutes les actions',
      'Création de périmètre',
      'Import CSV',
      "Saisie d'activité",
      "Modification d'activité",
      "Validation d'activité",
      'Journée signalée KO',
      'Note du périmètre',
      'Responsables du périmètre',
    ]);
  });

  it('borne la date de fin à aujourd’hui', () => {
    setup();

    expect(screen.getByLabelText("Journal : jusqu'au")).toHaveAttribute(
      'max',
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    );
  });

  it('remonte les modifications de filtres', () => {
    const { onChange } = setup();

    fireEvent.change(screen.getByLabelText('Quadrigramme'), {
      target: { value: 'ab' },
    });
    expect(onChange).toHaveBeenCalledWith({ actor: 'ab' });

    fireEvent.change(screen.getByLabelText('Journal : à partir du'), {
      target: { value: '2026-09-19' },
    });
    expect(onChange).toHaveBeenCalledWith({ fromDate: '2026-09-19' });
  });

  it('avertit quand la période est inversée', () => {
    setup({ fromDate: '2026-09-19', toDate: '2026-09-01' });

    expect(screen.getByText(/date de début est postérieure/i)).toBeInTheDocument();
  });

  it('n’avertit pas pour une période normale', () => {
    setup({ fromDate: '2026-09-01', toDate: '2026-09-19' });

    expect(screen.queryByText(/date de début est postérieure/i)).toBeNull();
  });

  it('désactive la réinitialisation quand aucun filtre n’est actif', () => {
    const { onReset } = setup();

    expect(screen.getByRole('button', { name: /Réinitialiser/i })).toBeDisabled();
    expect(onReset).not.toHaveBeenCalled();
  });

  it('active la réinitialisation dès qu’un filtre est posé', () => {
    const { onReset } = setup({ actor: 'AB' });

    const button = screen.getByRole('button', { name: /Réinitialiser/i });
    expect(button).toBeEnabled();
    fireEvent.click(button);
    expect(onReset).toHaveBeenCalled();
  });

  it('explique que la période porte sur la date de saisie', () => {
    setup();

    // Sans cette précision, « filtrer par jour » se lit comme « journee métier »,
    // alors qu'une création de périmètre n'a pas de journée.
    expect(screen.getByText(/date d'enregistrement de la modification/i)).toBeInTheDocument();
  });
});

describe('activeFilterCount', () => {
  it('compte les filtres réellement posés', () => {
    expect(activeFilterCount(EMPTY_FILTERS)).toBe(0);
    expect(
      activeFilterCount({
        fromDate: '',
        toDate: '2026-09-19',
        scopeIds: [],
        actor: '   ',
        action: '',
      }),
    ).toBe(1);
    expect(
      activeFilterCount({
        fromDate: '2026-09-01',
        toDate: '2026-09-19',
        scopeIds: ['scope-1'],
        actor: 'AB',
        action: 'activity_updated',
      }),
    ).toBe(5);
  });

  it('ne compte pas un acteur composé uniquement d’espaces', () => {
    expect(activeFilterCount({ ...EMPTY_FILTERS, actor: '  ' })).toBe(0);
  });
});

describe('sélecteur de périmètres partagé', () => {
  it('porte le libellé de la page qui l’utilise', () => {
    render(
      <AuditLogFilterBar
        filters={EMPTY_FILTERS}
        onChange={vi.fn()}
        onReset={vi.fn()}
        scopes={[makeScope({ name: 'Périmètre Alpha' })]}
      />,
    );

    // Le journal ne doit pas hériter du « analysés » d'/analyse.
    expect(
      screen.getByLabelText(/Sélectionner les périmètres du journal/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/Sélectionner les périmètres analysés/i),
    ).toBeNull();
  });
});
describe('liste des périmètres indisponible', () => {
  it('le dit, plutôt que de laisser un sélecteur vide silencieux', () => {
    render(
      <AuditLogFilterBar
        filters={EMPTY_FILTERS}
        onChange={vi.fn()}
        onReset={vi.fn()}
        scopes={[]}
        scopesUnavailable
      />,
    );

    expect(screen.getByText(/liste des périmètres n'a pas pu être chargée/i)).toBeInTheDocument();
    expect(screen.getByText(/autres filtres restent utilisables/i)).toBeInTheDocument();
  });

  it('reste muet quand la liste est simplement vide', () => {
    render(
      <AuditLogFilterBar
        filters={EMPTY_FILTERS}
        onChange={vi.fn()}
        onReset={vi.fn()}
        scopes={[]}
      />,
    );

    expect(screen.queryByText(/liste des périmètres n'a pas pu être chargée/i)).toBeNull();
  });
});

describe('carte de filtres', () => {
  it('ne rogne pas le popover du sélecteur de périmètres', () => {
    render(
      <AuditLogFilterBar
        filters={EMPTY_FILTERS}
        onChange={vi.fn()}
        onReset={vi.fn()}
        scopes={[makeScope()]}
      />,
    );

    // `ScopePicker` ouvre son popover en `absolute` à l'intérieur de cette
    // carte : un `overflow-hidden` le couperait à son bord bas. Sur le journal
    // le sélecteur est le 2e fieldset sur 3, donc environ 150px du popover
    // (~448px) restaient visibles — la recherche et une ligne, puis plus rien.
    expectDoesNotClip(
      screen.getByRole("region", { name: /filtres du journal/i }),
    );
  });
});
