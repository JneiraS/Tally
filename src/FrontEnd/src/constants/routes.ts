/**
 * Shared route constants.
 *
 * The audit-log path used to be duplicated as a literal across the API layer,
 * the router, the nginx proxy and the tests, which made it public and let the
 * copies drift. It is now split into two constants declared here:
 * - `AUDIT_LOG_PATH`      → `/api/audit-log` (API endpoint, proxied by nginx/vite)
 * - `AUDIT_LOG_PAGE_PATH` → `/audit-log`     (SPA route, served by nginx try_files)
 *
 * Access is enforced by the session cookie, not by obscurity of the path.
 *
 * Only `AUDIT_LOG_PATH` has a counterpart in `app.py`, `nginx.conf` and
 * `vite.config.ts`. The page path is deliberately absent from those layers;
 * nginx falls back to `index.html` for unknown paths, which serves the SPA
 * route on a hard refresh or a shared link.
 */
export const AUDIT_LOG_PATH = "/api/audit-log";
export const AUDIT_LOG_PAGE_PATH = "/audit-log";
export const SCOPE_LIST_PATH = "/";
export const SCOPE_DETAIL_PATH = "/scopes/:id";
export const ANALYTICS_PATH = "/analyse";