/**
 * P0.VR.8 — ProjectRouteDiscoveryService — discover routes from canonical sources.
 */

import { listDesignScreensForProject, resolveDesignScreenRoute } from '../p0vr2/designScreenRegistry.js';
import type { DesignScreenDefinition } from '../p0vr2/types.js';
import { listManifestScreensForProject } from '../p0vr3/designRouteManifest.js';
import { resolveRepresentativeRoute, isMissingImplementationRoute } from '../p0vr3e/routeRepresentativeResolver.js';
import { normalizeRouteKey } from './changeDetector.js';
import type { ProjectPageRecord } from './types.js';

export function discoverProjectRoutes(
  projectId: string,
  options?: { screenSetMode?: 'PRIMARY' | 'ALL_DESIGNABLE' },
): DesignScreenDefinition[] {
  if (projectId === 'site00') {
    return listManifestScreensForProject('site00', false, options?.screenSetMode ?? 'PRIMARY');
  }
  return listDesignScreensForProject(projectId, true);
}

export function screenToPageRecord(
  screen: DesignScreenDefinition,
  projectId: string,
  source: ProjectPageRecord['source'] = 'ROUTE_DISCOVERY',
): ProjectPageRecord {
  const route = resolveDesignScreenRoute(screen, projectId);
  const { templateRoute, representativeRoute } = resolveRepresentativeRoute(screen, projectId);
  const now = new Date().toISOString();
  const isDynamic = templateRoute.includes(':');
  const isParameterized = isDynamic;
  const missing = isMissingImplementationRoute(screen);

  return {
    pageId: `${projectId}:${normalizeRouteKey(representativeRoute || route)}`,
    projectId,
    screenId: screen.screenId,
    route,
    normalizedRoute: normalizeRouteKey(representativeRoute || route),
    pageName: screen.displayName,
    pageType: screen.routeFamily ?? 'PAGE',
    source,
    sourceFile: screen.sharedComponentPaths?.[0] ?? null,
    routeSource: templateRoute,
    deploymentTarget: projectId,
    isActive: !missing,
    isDynamic,
    isAuthProtected: screen.routePattern.includes('/account') || screen.routeFamily === 'ACCOUNT',
    isParameterized,
    viewportAvailability: ['mobile', 'tablet', 'desktop'],
    createdAt: now,
    updatedAt: now,
    lastDiscoveredAt: now,
    lastRenderedAt: null,
    lastCapturedAt: null,
    lastContentHash: null,
    lastVisualHash: null,
    lastDeploymentId: null,
    status: missing ? 'ROUTE_MISSING' : 'DISCOVERED',
    representativeRoute,
    sharedComponentPaths: screen.sharedComponentPaths,
  };
}

export function detectAddedRoutes(
  discovered: ProjectPageRecord[],
  existing: ProjectPageRecord[],
): ProjectPageRecord[] {
  const existingKeys = new Set(existing.map((p) => p.pageId));
  return discovered.filter((d) => !existingKeys.has(d.pageId));
}

export function detectRemovedRoutes(
  discovered: ProjectPageRecord[],
  existing: ProjectPageRecord[],
): ProjectPageRecord[] {
  const discoveredKeys = new Set(discovered.map((d) => d.pageId));
  return existing.filter((e) => e.isActive && !discoveredKeys.has(e.pageId));
}

export function detectChangedRoutes(
  discovered: ProjectPageRecord[],
  existing: ProjectPageRecord[],
): ProjectPageRecord[] {
  const byId = new Map(existing.map((e) => [e.pageId, e]));
  const changed: ProjectPageRecord[] = [];
  for (const d of discovered) {
    const prev = byId.get(d.pageId);
    if (!prev) continue;
    if (
      prev.route !== d.route ||
      prev.pageName !== d.pageName ||
      prev.representativeRoute !== d.representativeRoute
    ) {
      changed.push({ ...d, createdAt: prev.createdAt, updatedAt: new Date().toISOString() });
    }
  }
  return changed;
}

export function reconcileRouteRename(
  removed: ProjectPageRecord[],
  added: ProjectPageRecord[],
): { renames: Array<{ from: ProjectPageRecord; to: ProjectPageRecord }>; orphanRemoved: ProjectPageRecord[]; orphanAdded: ProjectPageRecord[] } {
  const renames: Array<{ from: ProjectPageRecord; to: ProjectPageRecord }> = [];
  const usedAdded = new Set<string>();
  const usedRemoved = new Set<string>();

  for (const r of removed) {
    const candidate = added.find(
      (a) =>
        !usedAdded.has(a.pageId) &&
        a.screenId === r.screenId &&
        a.projectId === r.projectId,
    );
    if (candidate) {
      renames.push({ from: r, to: candidate });
      usedAdded.add(candidate.pageId);
      usedRemoved.add(r.pageId);
    }
  }

  return {
    renames,
    orphanRemoved: removed.filter((r) => !usedRemoved.has(r.pageId)),
    orphanAdded: added.filter((a) => !usedAdded.has(a.pageId)),
  };
}

export function normalizeProjectRoutes(routes: string[]): string[] {
  return [...new Set(routes.map(normalizeRouteKey))];
}
