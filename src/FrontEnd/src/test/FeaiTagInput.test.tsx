/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeaiTagInput } from '../components/FeaiTagInput';
import { ToastContainer } from '../components/Toast';
import { ToastProvider } from '../hooks/useToast';

const renderInput = (values: string[]) => {
  const onChange = vi.fn();
  render(
    <ToastProvider>
      <FeaiTagInput values={values} onChange={onChange} />
      <ToastContainer />
    </ToastProvider>
  );
  return { onChange };
};

/** Parent piloté par l'état, comme InlineActivityCounters : les props se rafraîchissent. */
const StatefulInput = ({ initial }: { initial: string[] }) => {
  const [values, setValues] = useState<string[]>(initial);
  return (
    <ToastProvider>
      <FeaiTagInput values={values} onChange={setValues} />
      <output aria-label="liste">{values.join(',')}</output>
      <ToastContainer />
    </ToastProvider>
  );
};

const removeByName = (code: string) =>
  fireEvent.click(screen.getByRole('button', { name: `Supprimer la référence ${code}` }));

const currentList = () => screen.getByLabelText('liste').textContent;

const undo = () => fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));

describe('FeaiTagInput', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('retire la référence au clic sur la croix', () => {
    const { onChange } = renderInput(['INC000000001', 'INC000000002']);

    fireEvent.click(
      screen.getByRole('button', { name: 'Supprimer la référence INC000000001' })
    );

    expect(onChange).toHaveBeenCalledWith(['INC000000002']);
  });

  it("n'ouvre aucune modale de confirmation", () => {
    const { onChange } = renderInput(['INC000000001']);

    fireEvent.click(
      screen.getByRole('button', { name: 'Supprimer la référence INC000000001' })
    );

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("restaure la référence à sa position d'origine via le bouton Annuler", () => {
    const { onChange } = renderInput([
      'INC000000001',
      'INC000000002',
      'INC000000003',
    ]);

    fireEvent.click(
      screen.getByRole('button', { name: 'Supprimer la référence INC000000002' })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));

    expect(onChange).toHaveBeenLastCalledWith([
      'INC000000001',
      'INC000000002',
      'INC000000003',
    ]);
  });

  it('ferme le toast après annulation', () => {
    const { onChange } = renderInput(['INC000000001']);

    fireEvent.click(
      screen.getByRole('button', { name: 'Supprimer la référence INC000000001' })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));

    expect(screen.queryByRole('button', { name: 'Annuler' })).toBeNull();
    expect(onChange).toHaveBeenLastCalledWith(['INC000000001']);
  });

  it("n'affiche qu'un seul toast d'annulation quand plusieurs références sont retirées", () => {
    const { onChange } = renderInput(['INC000000001', 'INC000000002']);

    removeByName('INC000000001');
    removeByName('INC000000002');

    expect(screen.getAllByRole('button', { name: 'Annuler' })).toHaveLength(1);
    expect(screen.getByText('2 références retirées')).toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith(['INC000000001']);
  });

  it('annule toute la rafale de suppressions avec un seul Annuler', () => {
    render(<StatefulInput initial={['INC000000001', 'INC000000002', 'INC000000003']} />);

    removeByName('INC000000002');
    removeByName('INC000000003');
    expect(currentList()).toBe('INC000000001');

    undo();

    expect(currentList()).toBe('INC000000001,INC000000002,INC000000003');
  });

  it("préserve une référence ajoutée pendant la fenêtre d'annulation", () => {
    render(<StatefulInput initial={['INC000000001', 'INC000000002']} />);

    removeByName('INC000000001');
    fireEvent.change(screen.getByLabelText('Ajouter une référence FEAI'), {
      target: { value: 'INC000000009' },
    });
    fireEvent.keyDown(screen.getByLabelText('Ajouter une référence FEAI'), {
      key: 'Enter',
    });

    undo();

    // 001 revient à sa place (index 0) sans écraser la référence ajoutée entre-temps.
    expect(currentList()).toBe('INC000000001,INC000000002,INC000000009');
  });

  it("n'étend pas la rafale au-delà de la fenêtre d'annulation", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-21T08:00:00Z'));
    render(<StatefulInput initial={['INC000000001', 'INC000000002', 'INC000000003']} />);

    removeByName('INC000000002');
    vi.setSystemTime(new Date('2026-09-21T08:00:07Z'));
    removeByName('INC000000003');

    expect(screen.getByText('Référence INC000000003 retirée')).toBeInTheDocument();

    undo();

    // Seule la seconde suppression est annulable : 002 appartient à la rafale expirée.
    expect(currentList()).toBe('INC000000001,INC000000003');
  });

  it('supprime la dernière référence au clavier et propose la même annulation', () => {
    const { onChange } = renderInput(['INC000000001', 'INC000000002']);

    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Backspace' });
    expect(onChange).toHaveBeenCalledWith(['INC000000001']);

    undo();
    expect(onChange).toHaveBeenLastCalledWith(['INC000000001', 'INC000000002']);
  });

  it('ne retire rien quand aucun code n\'est présent', () => {
    const { onChange } = renderInput([]);

    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Backspace' });

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Annuler' })).toBeNull();
  });
});
