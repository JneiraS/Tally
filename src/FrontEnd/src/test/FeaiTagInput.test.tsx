/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
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

describe('FeaiTagInput', () => {
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

    fireEvent.click(
      screen.getByRole('button', { name: 'Supprimer la référence INC000000001' })
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Supprimer la référence INC000000002' })
    );

    expect(screen.getAllByRole('button', { name: 'Annuler' })).toHaveLength(1);
    expect(
      screen.getByText('Référence INC000000002 retirée')
    ).toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith(['INC000000001']);
  });

  it('supprime la dernière référence au clavier et propose la même annulation', () => {
    const { onChange } = renderInput(['INC000000001', 'INC000000002']);

    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Backspace' });
    expect(onChange).toHaveBeenCalledWith(['INC000000001']);

    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));
    expect(onChange).toHaveBeenLastCalledWith(['INC000000001', 'INC000000002']);
  });

  it('ne retire rien quand aucun code n\'est présent', () => {
    const { onChange } = renderInput([]);

    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Backspace' });

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Annuler' })).toBeNull();
  });
});
