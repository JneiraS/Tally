/**
 * La modale porte sa propre implémentation de la saisie FEAI (liste de
 * brouillons, pas FeaiTagInput) : elle avait trois « 12 » en dur et un trim
 * appliqué à chaque frappe, qui rendaient impossible de taper un séparateur.
 *
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ActivityFormModal } from '../components/ActivityFormModal';
import { ToastProvider } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import { protabApi } from '../services/api';

vi.mock('../services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/api')>();
  return {
    ...actual,
    protabApi: {
      ...actual.protabApi,
      createActivity: vi.fn(),
      updateActivity: vi.fn(),
    },
  };
});

const SCOPE_ID = '123e4567-e89b-12d3-a456-426614174000';

const addReference = () =>
  fireEvent.click(screen.getByRole('button', { name: /ajouter une réf/i }));

const typeReference = (index: number, value: string) =>
  fireEvent.change(screen.getByLabelText(`Référence FEAI ${index + 1}`), {
    target: { value },
  });

const submit = () =>
  fireEvent.click(screen.getByRole('button', { name: /créer l'activité/i }));

const renderModal = () => {
  const onSuccess = vi.fn();
  render(
    <ToastProvider>
      <ActivityFormModal
        isOpen
        onClose={vi.fn()}
        scopeId={SCOPE_ID}
        scopeName="Scope Alpha"
        existingDays={[]}
        initialActivity={null}
        onSuccess={onSuccess}
      />
      <ToastContainer />
    </ToastProvider>
  );
};

describe('ActivityFormModal — références FEAI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(protabApi.createActivity).mockResolvedValue(undefined as never);
  });

  it("conserve l'espace tapée entre le préfixe et le code", () => {
    renderModal();
    addReference();

    typeReference(0, 'FE ');

    // Le trim appliqué à chaque frappe effaçait la séparatrice : le champ
    // revenait à « FE » et la forme avec espace était impossible à saisir.
    expect(screen.getByLabelText('Référence FEAI 1')).toHaveValue('FE ');
  });

  it('enregistre la forme canonique', async () => {
    renderModal();

    fireEvent.change(screen.getByLabelText(/Erreurs signalées/), {
      target: { value: '3' },
    });
    fireEvent.change(screen.getByLabelText(/Incidents créés/), {
      target: { value: '1' },
    });
    addReference();
    typeReference(0, 'FEAI INC000000001');

    submit();

    await waitFor(() => {
      expect(protabApi.createActivity).toHaveBeenCalledWith(SCOPE_ID, {
        day: expect.any(String),
        errors_reported: 3,
        incidents_created: 1,
        feai: ['FEAI-INC000000001'],
      });
    });
    expect(screen.queryByText(/Format attendu/)).toBeNull();
  });

  it('signale un code mal formé', () => {
    renderModal();
    addReference();
    typeReference(0, 'FEAI000000001');

    submit();

    expect(screen.getByText(/Format attendu/)).toBeInTheDocument();
    expect(protabApi.createActivity).not.toHaveBeenCalled();
  });

  it('refuse un doublon écrit avec un autre séparateur', () => {
    renderModal();
    addReference();
    addReference();
    typeReference(0, 'FE INC000000001');
    typeReference(1, 'FE-INC000000001');

    submit();

    expect(screen.getByText(/Référence en doublon : "FE-INC000000001"/)).toBeInTheDocument();
    expect(protabApi.createActivity).not.toHaveBeenCalled();
  });
});