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
  });
});
