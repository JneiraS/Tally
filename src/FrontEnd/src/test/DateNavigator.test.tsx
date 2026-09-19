/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DateNavigator } from '../components/DateNavigator';

describe('DateNavigator', () => {
  it('permet de revenir au jour précédent et bloque les dates futures', () => {
    const onChange = vi.fn();

    render(
      <DateNavigator
        value="2026-09-18"
        today="2026-09-19"
        onChange={onChange}
      />
    );

    expect(screen.getByRole('button', { name: 'Afficher le jour suivant' })).not.toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Afficher le jour précédent' }));
    expect(onChange).toHaveBeenCalledWith('2026-09-17');

    fireEvent.click(screen.getByRole('button', { name: 'Afficher le jour suivant' }));
    expect(onChange).toHaveBeenCalledWith('2026-09-19');
  });

  it("désactive l'avance et propose le retour à aujourd'hui", () => {
    const onChange = vi.fn();

    const { rerender } = render(
      <DateNavigator
        value="2026-09-18"
        today="2026-09-19"
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: "Aujourd'hui" }));
    expect(onChange).toHaveBeenCalledWith('2026-09-19');

    rerender(
      <DateNavigator
        value="2026-09-19"
        today="2026-09-19"
        onChange={onChange}
      />
    );
    expect(screen.getByRole('button', { name: 'Afficher le jour suivant' })).toBeDisabled();
  });
});
