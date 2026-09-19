/**
 * Canonical storage paths for host visual reference captures.
 */

import type { ViewportClass } from './types.js';

export function buildHostReferenceStoragePath(route: string, viewportClass: ViewportClass): string {
  const routePart = route === '/' ? 'origin' : route.replace(/^\//, '').replace(/\//g, '-');
  return `visual-references/site00/host/${viewportClass.toLowerCase()}/${routePart}.webp`;
}

/** Legacy seed paths (pre-unification) — map to canonical paths for hydration. */
export function legacyHostReferenceStoragePath(route: string, viewportClass: ViewportClass): string {
  const legacyPart = route.replace(/\//g, '_') || 'root';
  return `visual-references/site00/host/${viewportClass.toLowerCase()}/${legacyPart}.webp`;
}

export function hostReferenceStoragePathCandidates(route: string, viewportClass: ViewportClass): string[] {
  const canonicalWebp = buildHostReferenceStoragePath(route, viewportClass);
  const canonicalPng = canonicalWebp.replace(/\.webp$/, '.png');
  const legacy = legacyHostReferenceStoragePath(route, viewportClass);
  return [...new Set([canonicalPng, canonicalWebp, legacy])];
}
