/**
 * P0.VR.3 — Studio World Design Route Manifest sync.
 */

import type { StudioWorldDesignRouteManifest } from './types.js';
import { P0_VR_3_LINEAGE, SITE00_DESIGN_PROJECT_ID, STUDIO_WORLD_DESIGN_ROUTE_MANIFEST_VERSION } from './constants.js';
import { buildSite00RouteDependencyGraph } from '../p0vr3a/site00RouteDependencyGraph.js';
import {
  buildSite00DiscoveredRoutes,
  buildSite00MissingRoutes,
  buildSite00VisualStates,
  missingRoutesAsDesignScreens,
  visualStatesAsDesignScreens,
} from '../p0vr3a/site00RouteForensics.js';
import { enrichRoutesWithReferenceCoverage } from '../p0vr3a/site00ReferenceDiscovery.js';
import {
  buildNeedsBetterReferenceQueue,
  buildNeedsReferenceQueue,
  buildSite00DesignCoverageSummary,
} from '../p0vr3a/site00CoverageSummary.js';
import { registerProjectDesignScreens } from '../p0vr2/designScreenRegistry.js';
import type { DesignScreenDefinition } from '../p0vr2/types.js';

const manifestCache = new Map<string, StudioWorldDesignRouteManifest>();

export function compileSite00DesignRouteManifest(): StudioWorldDesignRouteManifest {
  const routes = enrichRoutesWithReferenceCoverage(buildSite00DiscoveredRoutes());
  const coverageSummary = buildSite00DesignCoverageSummary(routes);
  const dependencyGraph = buildSite00RouteDependencyGraph();

  const manifest: StudioWorldDesignRouteManifest = {
    manifestId: 'STUDIO_WORLD_DESIGN_ROUTE_MANIFEST',
    version: STUDIO_WORLD_DESIGN_ROUTE_MANIFEST_VERSION,
    lineage: P0_VR_3_LINEAGE,
    projectId: SITE00_DESIGN_PROJECT_ID,
    compiledAt: new Date().toISOString(),
    routes,
    visualStates: buildSite00VisualStates(),
    missingRoutes: buildSite00MissingRoutes(),
    dependencyGraph,
    coverageSummary,
    needsReference: buildNeedsReferenceQueue(routes),
    needsBetterReference: buildNeedsBetterReferenceQueue(routes),
  };

  manifestCache.set(SITE00_DESIGN_PROJECT_ID, manifest);
  return manifest;
}

export function getStudioWorldDesignRouteManifest(projectId: string): StudioWorldDesignRouteManifest | null {
  if (projectId === SITE00_DESIGN_PROJECT_ID) {
    return manifestCache.get(projectId) ?? compileSite00DesignRouteManifest();
  }
  return null;
}

export function site00ManifestToDesignScreens(includeMissing = true, includeStates = true): DesignScreenDefinition[] {
  const manifest = compileSite00DesignRouteManifest();
  const base = manifest.routes.filter((r) => r.showInDefaultSelector !== false);
  const screens: DesignScreenDefinition[] = base.map(({ resolvedRoute: _r, viewportCoverage: _v, ...def }) => def);
  if (includeStates) screens.push(...visualStatesAsDesignScreens());
  if (includeMissing) screens.push(...missingRoutesAsDesignScreens());
  return screens;
}

export function syncSite00ManifestToDesignRegistry(): StudioWorldDesignRouteManifest {
  const manifest = compileSite00DesignRouteManifest();
  registerProjectDesignScreens(SITE00_DESIGN_PROJECT_ID, site00ManifestToDesignScreens());
  return manifest;
}

export function clearDesignRouteManifestCacheForTest(): void {
  manifestCache.clear();
}

export function listManifestScreensForProject(projectId: string, includeInspect = false): DesignScreenDefinition[] {
  if (projectId !== SITE00_DESIGN_PROJECT_ID) return [];
  const manifest = getStudioWorldDesignRouteManifest(projectId)!;
  const routes = manifest.routes.filter((r) => includeInspect || r.showInDefaultSelector !== false);
  const screens = routes.map(({ resolvedRoute: _r, viewportCoverage: _v, ...def }) => def);
  if (includeInspect) return screens;
  return [
    ...screens,
    ...visualStatesAsDesignScreens(),
    ...missingRoutesAsDesignScreens(),
  ];
}

export function groupManifestScreensByFamily(projectId: string): Record<string, DesignScreenDefinition[]> {
  const screens = listManifestScreensForProject(projectId, false);
  const grouped: Record<string, DesignScreenDefinition[]> = {};
  for (const screen of screens) {
    const family = screen.routeFamily ?? 'OTHER';
    grouped[family] = grouped[family] ?? [];
    grouped[family].push(screen);
  }
  return grouped;
}
