/**
 * P0.VR.DESIGN-OPUS-LAUNCHER1 — match DESIGN routes to Opus surface registry entries.
 */

export type DesignAgentSurfaceSummary = {
  pageId: string;
  route: string;
  standingWriteMode?: string | null;
  writeFirewallReason?: string | null;
  goldenReferenceVersion?: string | null;
};

function routeMatches(pattern: string, actual: string): boolean {
  const expression = pattern.replace(/:[A-Za-z]+/g, '[^/]+').replace(/\/+$/, '');
  return new RegExp(`^${expression}$`).test(actual.replace(/\/+$/, ''));
}

/** Production + module routes share twin-opus-direct authority (see server findSurface). */
export function resolveDesignAgentSurfaceMatch(
  route: string,
  surfaces: readonly DesignAgentSurfaceSummary[],
): DesignAgentSurfaceSummary | null {
  const normalized = route.replace(/\/+$/, '');
  const twin = surfaces.find((surface) => surface.pageId === 'twin-opus-direct') ?? null;

  if (/^\/projects\/design\/[^/]+/.test(normalized)) {
    return twin;
  }
  if (/^\/projects\/[^/]+\/design(\/|$)/.test(normalized)) {
    return twin;
  }

  return surfaces.find((surface) => routeMatches(surface.route, normalized)) ?? null;
}
