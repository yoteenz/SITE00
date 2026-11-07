/**
 * Remembers the last in-app JURNL route for this tab (path + query under the runtime base).
 * Design-preview and signed-in sessions resume here instead of the entry index after refresh.
 */
export const JURNL_LAST_ROUTE_KEY = 'jurnl.runtime.v1.last-route';

export function readLastJurnlRoute(): string | null {
  try {
    const raw = sessionStorage.getItem(JURNL_LAST_ROUTE_KEY)?.trim();
    if (!raw || raw.startsWith('entry')) return null;
    return raw;
  } catch {
    return null;
  }
}

export function writeLastJurnlRoute(relPathAndSearch: string): void {
  const rel = relPathAndSearch.replace(/^\/+/, '').trim();
  if (!rel || rel.startsWith('entry')) return;
  try {
    sessionStorage.setItem(JURNL_LAST_ROUTE_KEY, rel);
  } catch {
    /* private mode */
  }
}

export function lastRouteNavigateTo(basePath: string): { pathname: string; search: string } | null {
  const last = readLastJurnlRoute();
  if (!last) return null;
  const q = last.indexOf('?');
  const path = q >= 0 ? last.slice(0, q) : last;
  const search = q >= 0 ? last.slice(q) : '';
  return { pathname: `${basePath}/${path}`.replace(/\/{2,}/g, '/'), search };
}
