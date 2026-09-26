/**
 * Shared route constants.
 *
 * The audit-log path used to be duplicated as a literal across the API layer,
 * the router, the nginx proxy and the tests, which made it public and let the
 * copies drift. It is declared once here and referenced everywhere; access is
 * enforced by the session cookie, not by obscurity of the path.
 */
export const AUDIT_LOG_PATH = "/audit-log";
