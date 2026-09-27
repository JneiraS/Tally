/**
 * Session loss must be handled globally, not surfaced as a generic API failure.
 *
 * A 401 means the cookie expired or was revoked: retrying can never succeed, so
 * the app must return to the login screen. A 401 on the login endpoint itself is
 * a wrong password and must stay a form error, otherwise it would wipe the form.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { protabApi } from '../services/api';

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

describe('global 401 handling', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    protabApi.setUnauthorizedHandler(null);
  });

  it('signals session loss when a business route answers 401', async () => {
    const onUnauthorized = vi.fn();
    protabApi.setUnauthorizedHandler(onUnauthorized);
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(401, { detail: 'Authentification requise.' }),
    );

    await expect(protabApi.getScopeMonitorings()).rejects.toThrow();

    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('does not signal session loss when the login itself is rejected', async () => {
    const onUnauthorized = vi.fn();
    protabApi.setUnauthorizedHandler(onUnauthorized);
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(401, { detail: 'Identifiants invalides.' }),
    );

    await expect(
      protabApi.login('protab', 'JN01', 'wrong'),
    ).rejects.toThrow();

    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it('does not signal session loss on other errors', async () => {
    const onUnauthorized = vi.fn();
    protabApi.setUnauthorizedHandler(onUnauthorized);
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(500, { detail: 'Erreur serveur' }),
    );

    await expect(protabApi.getScopeMonitorings()).rejects.toThrow();

    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it('tolerates a null handler', async () => {
    protabApi.setUnauthorizedHandler(null);
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(401, { detail: 'Authentification requise.' }),
    );

    await expect(protabApi.getScopeMonitorings()).rejects.toThrow();
  });
});
