/**
 * Reconcile ParentChildRouteGraph against router manifest / registries.
 */

export function reconcileRouteManifest(input: {
  declaredRoutes: string[];
  routerManifestRoutes: string[];
  recoveredRoutes?: string[];
}): {
  matched: string[];
  missingFromManifest: string[];
  staleInManifest: string[];
  orphans: string[];
} {
  const manifest = new Set(input.routerManifestRoutes);
  const declared = new Set(input.declaredRoutes);
  const recovered = new Set(input.recoveredRoutes ?? []);

  const matched = input.declaredRoutes.filter(
    (r) => manifest.has(r) || [...manifest].some((m) => routesEquivalent(m, r)),
  );

  const missingFromManifest = input.declaredRoutes.filter(
    (r) => !manifest.has(r) && ![...manifest].some((m) => routesEquivalent(m, r)),
  );

  const staleInManifest = input.routerManifestRoutes.filter(
    (r) => !declared.has(r) && !recovered.has(r),
  );

  const orphans = missingFromManifest.filter((r) => !recovered.has(r));

  return { matched, missingFromManifest, staleInManifest, orphans };
}

function routesEquivalent(a: string, b: string): boolean {
  const na = normalizeRouteKey(a);
  const nb = normalizeRouteKey(b);
  if (na === nb) return true;
  return na.replace(/-+$/, '') === nb.replace(/-+$/, '');
}

export function normalizeRouteKey(route: string): string {
  return route
    .replace(/\/$/, '')
    .split('?')
    .map((part, i) => (i === 0 ? part : new URLSearchParams(part).toString()))
    .join('?')
    .toLowerCase();
}

export function surfaceExistsInRegistry(surfaceId: string, registry: string[]): boolean {
  return registry.includes(surfaceId);
}

export function routeHasRequiredParams(route: string, providedParams: Record<string, string>): boolean {
  const paramNames = [...route.matchAll(/:([A-Za-z0-9_]+)/g)].map((m) => m[1]);
  return paramNames.every((p) => Boolean(providedParams[p]));
}
