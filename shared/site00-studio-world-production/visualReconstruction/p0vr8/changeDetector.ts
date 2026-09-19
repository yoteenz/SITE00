/**
 * P0.VR.8 — ProjectPageChangeDetector — targeted capture selection.
 */

import type { ProjectPageRecord } from './types.js';
import { resolveSharedLayoutImpact } from './sharedLayoutImpactResolver.js';

export function detectAffectedPageIds(input: {
  projectId: string;
  changedFiles: string[];
  changedRoutes?: string[];
  pages: ProjectPageRecord[];
}): string[] {
  const routeHits = new Set<string>();
  if (input.changedRoutes?.length) {
    for (const route of input.changedRoutes) {
      const normalized = normalizeRouteKey(route);
      const page = input.pages.find(
        (p) => p.projectId === input.projectId && p.normalizedRoute === normalized && p.isActive,
      );
      if (page) routeHits.add(page.pageId);
    }
  }

  const fileHits = resolveSharedLayoutImpact(input.changedFiles, input.pages);
  return [...new Set([...routeHits, ...fileHits])];
}

export function normalizeRouteKey(route: string): string {
  return route.replace(/\/+$/, '').toLowerCase() || '/';
}

export function shouldSkipUnrelatedCapture(
  affectedPageIds: string[],
  pageId: string,
  forceFullProject = false,
): boolean {
  if (forceFullProject) return false;
  return !affectedPageIds.includes(pageId);
}
