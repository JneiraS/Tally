/**
 * A session that dies mid-usage must land on the login screen.
 *
 * The scope list used to render a "Échec du chargement de l'API" box whose
 * "Réessayer" button could never succeed, because a 401 is not a transient
 * network failure.
 *
 * The 401 is produced by the real `fetch` pipeline (not a mocked api method),
 * so the global handler registered by `App` is genuinely exercised.
 *
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';

const PROJECT = {
  id: 'protab',
  name: 'Projet principal',
  non_working_days: { excluded_weekdays: [6, 7], excluded_dates: [] },
};

const SESSION = { project: PROJECT, quadrigramme: 'JN01', is_admin: false };

function json(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

function stubFetch(scopeStatus: number) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/auth/me')) return json(200, SESSION);
      if (url.includes('/projects')) return json(200, [PROJECT]);
      if (url.includes('/scope-monitorings')) {
        return json(scopeStatus, { detail: 'Authentification requise.' });
      }
      return json(200, null);
    }),
  );
}

describe('App session loss', () => {
  beforeEach(() => {
    // jsdom n'implémente pas matchMedia, utilisé par le hook de thème.
    window.matchMedia = window.matchMedia ?? (() => ({
      matches: false,
      media: '',
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns to the login screen when a data call answers 401', async () => {
    stubFetch(401);

    render(<App />);

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /Se connecter/i }),
      ).toBeInTheDocument(),
    );
    expect(
      screen.queryByText(/Échec du chargement de l'API/i),
    ).not.toBeInTheDocument();
  });

  it('keeps showing the API error box for a non-401 failure', async () => {
    stubFetch(500);

    render(<App />);

    await waitFor(() =>
      expect(
        screen.getByText(/Échec du chargement de l'API/i),
      ).toBeInTheDocument(),
    );
  });
});
