/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ScopeDetailCharts } from '../components/ScopeDetailCharts';
import { makeScope } from './factories';

const scope = makeScope({
  official_main: 'Alice',
  official_backup: 'Bob',
  daily_activities: [
    {
      day: '2026-09-19',
      errors_reported: 4,
      incidents_created: 2,
      feai: ['INC000000001'],
      status: "pending",
      ko_reason: null,
    },
    {
      day: '2026-09-18',
      errors_reported: 1,
      incidents_created: 0,
      feai: [],
      status: "pending",
      ko_reason: null,
    },
  ],
});

describe('ScopeDetailCharts', () => {
  it('affiche la tendance des erreurs et incidents du périmètre', () => {
    render(<ScopeDetailCharts scope={scope} />);

    expect(screen.getByRole('heading', { name: /Tendance des erreurs et incidents/i })).toBeInTheDocument();
    expect(screen.getByText('2 journées enregistrées')).toBeInTheDocument();
  });

  it("ne porte plus de graphique cumulé erreurs / incidents", () => {
    render(<ScopeDetailCharts scope={scope} />);

    // Un cumul croît par construction et ne peut que monter : il répond
    // « combien depuis le début ? », pas « quel jour poser un incident ? ».
    // Son arriéré est par ailleurs la même quantité que le haut de son propre
    // empilement, donc le graphique encodait deux fois le même total.
    // Le RMSE et l'arriéré restent lisibles comme valeurs, sans courbe.
    expect(
      screen.queryByRole('heading', {
        name: /Cumul : erreurs \/ incidents — arriéré non transformées/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("retire l'outline par défaut des <svg> des graphiques et le remplace au focus-visible", () => {
    const { container } = render(<ScopeDetailCharts scope={scope} />);

    // Voir DashboardCharts.test.tsx : sous jsdom le <svg class="recharts-surface">
    // n'est pas rendu, le conteneur est donc le seul point d'ancrage vérifiable.
    const charts = container.querySelectorAll('div.h-64');

    expect(charts).toHaveLength(1);
    charts.forEach((chart) => {
      expect(chart.className).toContain('[&_.recharts-surface]:outline-none');
      expect(chart.className).toContain('[&_.recharts-surface]:focus-visible:outline-2');
      // Voir DashboardCharts.test.tsx : sans outline-solid, var(--tw-outline-style)
      // reste à none et l'outline de remplacement ne se peint pas.
      expect(chart.className).toContain('[&_.recharts-surface]:focus-visible:outline-solid');
    });
  });
});
