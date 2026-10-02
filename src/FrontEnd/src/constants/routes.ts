/**
 * Shared route constants.
 *
 * The audit-log path used to be duplicated as a literal across the API layer,
 * the router, the nginx proxy and the tests, which made it public and let the
 * copies drift. It is declared once here and referenced everywhere; access is
 * enforced by the session cookie, not by obscurity of the path.
 *
 * Every path also has its counterpart in `app.py`, `nginx.conf` and
 * `vite.config.ts`. None of them needs a server-side location: nginx already
 * falls back to `index.html` for unknown paths, which is what serves the SPA
 * route on a hard refresh or a shared link.
 */
export const AUDIT_LOG_PATH = "/audit-log";
export const SCOPE_LIST_PATH = "/";
export const SCOPE_DETAIL_PATH = "/scopes/:id";
export const ANALYTICS_PATH = "/analyse";