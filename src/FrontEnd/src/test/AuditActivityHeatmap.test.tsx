/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AuditActivityHeatmap } from '../components/AuditActivityHeatmap';
import { AuditEvent } from '../types';

describe('AuditActivityHeatmap', () => {
  it('affiche la grille et le pic d’activité', () => {
    render(
      <AuditActivityHeatmap
        events={[
          { created_at: '2026-09-21T09:05:00' },
          { created_at: '2026-09-21T09:45:00' },
        ] as AuditEvent[]}
      />,
    );

    expect(
      screen.getByRole('heading', { name: /Activité par heure de la semaine/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Pic : 2 événements')).toBeInTheDocument();
    expect(screen.getByLabelText('Lun 9 heures : 2 événements')).toBeInTheDocument();
  });

  it('affiche un état vide sans événement', () => {
    render(<AuditActivityHeatmap events={[]} />);

    expect(screen.getByText("Aucun événement d'audit à représenter.")).toBeInTheDocument();
  });
});
