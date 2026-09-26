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
});