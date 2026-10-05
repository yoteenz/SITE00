/**
 * P0.VR.CAPTURE.1R3A — Root overview route equivalence for capture proof + upgrade gate.
 */

function normalizeRoutePath(routeOrUrl: string): string {
  try {
    if (routeOrUrl.startsWith('http')) {
      const u = new URL(routeOrUrl);
      return u.pathname.replace(/\/$/, '') || '/';
    }
  } catch {
    /* fall through */
  }
  return routeOrUrl.split('?')[0]?.replace(/\/$/, '') || '/';
}

/** `/projects/{id}` and `/projects/{id}/overview` are the same root overview target. */
export function captureRootOverviewRoutesEquivalent(a: string, b: string): boolean {
  const na = normalizeRoutePath(a).toLowerCase();
  const nb = normalizeRoutePath(b).toLowerCase();
  if (na === nb) return true;

  const rootMatch = na.match(/^\/projects\/([^/]+)$/);
  if (rootMatch && nb === `/projects/${rootMatch[1]}/overview`) return true;

  const overviewMatch = nb.match(/^\/projects\/([^/]+)$/);
  if (overviewMatch && na === `/projects/${overviewMatch[1]}/overview`) return true;

  return false;
}

export function captureNavigationRouteMatchesTarget(input: {
  targetRoute: string;
  requestedRoute: string;
  resolvedRuntimePath: string;
  finalUrl: string;
  status: 'MATCH' | 'REDIRECTED' | 'MISMATCH' | 'UNKNOWN';
}): boolean {
  if (input.status === 'MATCH' || input.status === 'REDIRECTED') return true;
  const paths = [input.targetRoute, input.requestedRoute, input.resolvedRuntimePath, input.finalUrl];
  for (let i = 0; i < paths.length; i++) {
    for (let j = i + 1; j < paths.length; j++) {
      if (captureRootOverviewRoutesEquivalent(paths[i]!, paths[j]!)) return true;
    }
  }
  return input.status !== 'MISMATCH';
}
