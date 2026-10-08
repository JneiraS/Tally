import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { protabApi } from '../services/api';

/**
 * `scope_id` is repeated, not joined. A comma-separated list would reach the
 * server as a *single* id that matches nothing — the filter would appear to
 * work (a 200 with an empty array) while selecting every scope at once.
 */
describe('getAuditLog — sérialisation de la requête', () => {
  let requested: string[] = [];

  beforeEach(() => {
    requested = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        requested.push(String(url));
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => [],
        };
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  async function queryFor(params: Parameters<typeof protabApi.getAuditLog>[0]) {
    await protabApi.getAuditLog(params);
    return new URL(requested.at(-1)!, 'http://x').searchParams;
  }

  it('répète scope_id une fois par périmètre', async () => {
    const qs = await queryFor({ scope_ids: ['scope-1', 'scope-2'] });

    expect(qs.getAll('scope_id')).toEqual(['scope-1', 'scope-2']);
  });

  it('omet scope_id quand la sélection est vide', async () => {
    const qs = await queryFor({ scope_ids: [] });

    expect(qs.has('scope_id')).toBe(false);
  });

  it('omet les filtres absents plutôt que de les envoyer vides', async () => {
    const qs = await queryFor({
      actor: undefined,
      action: undefined,
      from_created_at: undefined,
      to_created_at: undefined,
    });

    expect([...qs.keys()]).toEqual([]);
  });

  it('transmet les bornes de période telles quelles', async () => {
    const qs = await queryFor({
      from_created_at: '2026-09-19T00:00:00.000Z',
      to_created_at: '2026-09-20T00:00:00.000Z',
    });

    expect(qs.get('from_created_at')).toBe('2026-09-19T00:00:00.000Z');
    expect(qs.get('to_created_at')).toBe('2026-09-20T00:00:00.000Z');
  });

  it('conserve le plafond', async () => {
    const qs = await queryFor({ limit: 500 });

    expect(qs.get('limit')).toBe('500');
  });
});