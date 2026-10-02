/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DashboardCharts } from '../components/DashboardCharts';
import { ScopeMonitoring } from '../types';

const scope = (
  id: string,
  name: string,
  daily_activities: ScopeMonitoring['daily_activities'],
): ScopeMonitoring => ({
  id,
  name,
  knowledge_base_id: 'KB-ALPHA-0001',
  official_main: 'MAIN',
  official_backup: 'BACK',
  billing_code: 'FACT-2026-PAI',
  note: null,
  daily_activities,
});

describe('DashboardCharts', () => {
  it('affiche l\'activité des 7 derniers jours et l\'état des périmètres', () => {
    const scopes = [
      scope('s1', 'Périmètre Alpha', [
        {
          day: '2026-09-19',
          errors_reported: 4,
          incidents_created: 2,
          feai: [],
          handled: true,
          completed: true,
        },
      ]),
      scope('s2', 'Périmètre Beta', []),
    ];

    render(
      <DashboardCharts
        scopes={scopes}
        day="2026-09-19"
        nonWorkingDays={{ excluded_weekdays: [6, 7], excluded_dates: [] }}
      />,
    );

    expect(screen.getByRole('heading', { name: /Activité — 7 derniers jours/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /État des périmètres/i })).toBeInTheDocument();
    expect(screen.getByText(/4 erreurs/)).toBeInTheDocument();
    expect(screen.getByText(/2 incidents/)).toBeInTheDocument();
    expect(screen.queryByText(/Couverture de saisie/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Périmètres à risque/i)).not.toBeInTheDocument();
  });

  it("retire l'outline par défaut du <svg> du graphique et le remplace au focus-visible", () => {
    const { container } = render(
      <DashboardCharts
        scopes={[scope('s1', 'Périmètre Alpha', [])]}
        day="2026-09-19"
        nonWorkingDays={{ excluded_weekdays: [6, 7], excluded_dates: [] }}
      />,
    );

    // recharts ne rend le <svg> qu'à largeur/hauteur positives, ce que jsdom ne
    // fournit pas : le garde-fou porte donc sur notre conteneur, seul nœud qui rend.
    // Le nom de classe visé est bien celui produit par recharts 3.10
    // (RechartsWrapper.js:347 pour le wrapper, RootSurface.js:64 pour le <svg>).
    const chart = container.querySelector('div.h-40');

    expect(chart).not.toBeNull();
    expect(chart?.className).toContain('[&_.recharts-surface]:outline-none');
    expect(chart?.className).toContain('[&_.recharts-surface]:focus-visible:outline-2');
    // outline-2 compile en `outline-style: var(--tw-outline-style)`, et c'est
    // outline-none qui met cette variable à none sur le même élément : sans
    // outline-solid, le substitut ne serait jamais peint.
    expect(chart?.className).toContain('[&_.recharts-surface]:focus-visible:outline-solid');
  });
});