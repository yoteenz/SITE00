/**
 * Duplicate child surface / route detection
 */

import type { RequiredChildSurface } from './types.js';

export function findDuplicateChildSurfaces(surfaces: RequiredChildSurface[]): string[] {
  const seen = new Map<string, string>();
  const dupes: string[] = [];
  for (const s of surfaces) {
    const key = `${s.targetType}:${s.route ?? s.label}`;
    if (seen.has(key)) dupes.push('PAGE_CHILD_ROUTE_DUPLICATE');
    else seen.set(key, s.childSurfaceId);
  }
  return dupes;
}

export function findEquivalentRoute(route: string, existingRoutes: string[]): string | null {
  return existingRoutes.find((r) => r === route || r.endsWith(route.split('/').pop() ?? '')) ?? null;
}
