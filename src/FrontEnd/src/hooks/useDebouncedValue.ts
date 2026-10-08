import { useEffect, useState } from "react";

/**
 * Return `value` once it has stopped changing for `delayMs`.
 *
 * The audit journal filters are server-side, so every keystroke in a text input
 * used to be one HTTP request: typing "ABCD" fired four, three of which
 * returned nothing and blanked the table — which reads as a broken filter
 * rather than as a race. Debouncing collapses the burst into one request.
 *
 * Deliberately not `useDeferredValue`: that keeps the stale value interactive
 * and only deprioritises the render, so a half-typed filter would still be
 * displayed as the result of the query.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}