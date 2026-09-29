/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ScopeDetailCharts } from '../components/ScopeDetailCharts';

const scope = {
  id: 'scope-1',
  name: 'Périmètre Alpha',
  knowledge_base_id: 'KB-ALPHA-0001',
  official_main: 'Alice',
  official_backup: 'Bob',
  billing_code: 'FACT-2026-PAI',
  daily_activities: [
    {
      day: '2026-09-19',
      errors_reported: 4,
      incidents_created: 2,
      feai: ['INC000000001'],
      handled: true,
      completed: true,
    },
    {
      day: '2026-09-18',
      errors_reported: 1,
      incidents_created: 0,
      feai: [],
      handled: false,
      completed: false,
    },
  ],
};

describe('ScopeDetailCharts', () => {
  it('affiche la tendance des erreurs et incidents du périmètre', () => {
    render(<ScopeDetailCharts scope={scope} />);

    expect(screen.getByRole('heading', { name: /Tendance des erreurs et incidents/i })).toBeInTheDocument();
    expect(screen.getByText('2 journées enregistrées')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /Cumul : erreurs \/ incidents — arriéré non transformées/i,
      }),
    ).toBeInTheDocument();
  });

  it("retire l'outline par défaut des <svg> des graphiques et le remplace au focus-visible", () => {
    const { container } = render(<ScopeDetailCharts scope={scope} />);

    // Voir DashboardCharts.test.tsx : sous jsdom le <svg class="recharts-surface">
    // n'est pas rendu, le conteneur est donc le seul point d'ancrage vérifiable.
    const charts = container.querySelectorAll('div.h-64');

    expect(charts).toHaveLength(2);
    charts.forEach((chart) => {
      expect(chart.className).toContain('[&_.recharts-surface]:outline-none');
      expect(chart.className).toContain('[&_.recharts-surface]:focus-visible:outline-2');
      // Voir DashboardCharts.test.tsx : sans outline-solid, var(--tw-outline-style)
      // reste à none et l'outline de remplacement ne se peint pas.
      expect(chart.className).toContain('[&_.recharts-surface]:focus-visible:outline-solid');
    });
  });
});
