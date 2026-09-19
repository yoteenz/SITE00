/**
 * P0.VR.3 — Studio World Design Route Manifest sync.
 * Active authority: v2+ via P0.VR.3B normalization + P0.VR.3D reconciliation.
 * v1 compile preserved as P0.VR.3A historical audit artifact only.
 */

import type { StudioWorldDesignRouteManifest } from './types.js';
import {
  P0_VR_3_LINEAGE,
  SITE00_DESIGN_PROJECT_ID,
  STUDIO_WORLD_DESIGN_ROUTE_MANIFEST_VERSION,
  STUDIO_WORLD_DESIGN_ROUTE_MANIFEST_V1_STATUS,
  ACTIVE_ROUTE_MANIFEST_SCHEMA,
  ACTIVE_ROUTE_MANIFEST_VERSION,
  P0_VR_3A_V1_ACTIVE_RUNTIME_AUTHORITY,
} from './constants.js';
import { buildSite00RouteDependencyGraph } from '../p0vr3a/site00RouteDependencyGraph.js';
import {
  buildSite00DiscoveredRoutes,
  buildSite00MissingRoutes,
  buildSite00VisualStates,
} from '../p0vr3a/site00RouteForensics.js';
import { enrichRoutesWithReferenceCoverage } from '../p0vr3a/site00ReferenceDiscovery.js';
import {
  buildNeedsBetterReferenceQueue,
  buildNeedsReferenceQueue,
  buildSite00DesignCoverageSummary,
} from '../p0vr3a/site00CoverageSummary.js';
import { registerProjectDesignScreens } from '../p0vr2/designScreenRegistry.js';
import type { DesignScreenDefinition } from '../p0vr2/types.js';
import {
  getActiveDesignRouteSyncContract,
  clearDesignRouteSyncContractCacheForTest,
  buildReconciledSite00DesignScreens,
  buildSite00FounderDesignScreenSet,
} from '../p0vr3d/client.js';
import { getActiveRouteManifestV2 } from '../p0vr3b/manifestV2Compiler.js';

const v1ManifestCache = new Map<string, StudioWorldDesignRouteManifest>();

/** P0.VR.3A v1 historical compile — not active runtime authority. */
export function compileSite00DesignRouteManifestV1Historical(): StudioWorldDesignRouteManifest {
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

  v1ManifestCache.set(SITE00_DESIGN_PROJECT_ID, manifest);
  return manifest;
}

/** @deprecated Use getActiveDesignRouteSyncContract(); v1 preserved for historical audit only. */
export function compileSite00DesignRouteManifest(): StudioWorldDesignRouteManifest {
  return compileSite00DesignRouteManifestV1Historical();
}

export function getStudioWorldDesignRouteManifest(projectId: string): StudioWorldDesignRouteManifest | null {
  if (projectId === SITE00_DESIGN_PROJECT_ID) {
    return v1ManifestCache.get(projectId) ?? compileSite00DesignRouteManifestV1Historical();
  }
  return null;
}

export function site00ManifestToDesignScreens(includeMissing = true, includeStates = true): DesignScreenDefinition[] {
  const contract = getActiveDesignRouteSyncContract();
  const screens = buildReconciledSite00DesignScreens(contract);
  if (!includeStates) {
    return screens.filter((s) => s.recordKind !== 'INTERACTION_STATE');
  }
  if (!includeMissing) {
    return screens.filter(
      (s) => s.recordKind !== 'SITE00_REQUIRED_MISSING_ROUTE' && s.recordKind !== 'SITE00_IMPLIED_REQUIRED_ROUTE',
    );
  }
  return screens;
}

export function syncSite00ManifestToDesignRegistry(): StudioWorldDesignRouteManifest {
  const contract = getActiveDesignRouteSyncContract();
  registerProjectDesignScreens(SITE00_DESIGN_PROJECT_ID, buildReconciledSite00DesignScreens(contract));
  return compileSite00DesignRouteManifestV1Historical();
}

export function clearDesignRouteManifestCacheForTest(): void {
  v1ManifestCache.clear();
  clearDesignRouteSyncContractCacheForTest();
}

export function listManifestScreensForProject(
  projectId: string,
  includeInspect = false,
  screenSetMode: 'PRIMARY' | 'ALL_DESIGNABLE' = 'PRIMARY',
): DesignScreenDefinition[] {
  if (projectId !== SITE00_DESIGN_PROJECT_ID) return [];
  const contract = getActiveDesignRouteSyncContract();
  const screenSet = buildSite00FounderDesignScreenSet(screenSetMode, contract);
  const allScreens = buildReconciledSite00DesignScreens(contract);

  if (includeInspect) {
    return allScreens;
  }

  return allScreens.filter((s) => screenSet.screenIds.includes(s.screenId));
}

export function groupManifestScreensByFamily(
  projectId: string,
  screenSetMode: 'PRIMARY' | 'ALL_DESIGNABLE' = 'PRIMARY',
): Record<string, DesignScreenDefinition[]> {
  const screens = listManifestScreensForProject(projectId, false, screenSetMode);
  const grouped: Record<string, DesignScreenDefinition[]> = {};
  for (const screen of screens) {
    const family = screen.routeFamily ?? 'OTHER';
    grouped[family] = grouped[family] ?? [];
    grouped[family].push(screen);
  }
  return grouped;
}

export function getActiveManifestAuthority() {
  return {
    schema: ACTIVE_ROUTE_MANIFEST_SCHEMA,
    version: ACTIVE_ROUTE_MANIFEST_VERSION,
    p0vr3aV1Status: STUDIO_WORLD_DESIGN_ROUTE_MANIFEST_V1_STATUS,
    p0vr3aV1ActiveRuntimeAuthority: P0_VR_3A_V1_ACTIVE_RUNTIME_AUTHORITY,
    v2Manifest: getActiveRouteManifestV2(),
    syncContract: getActiveDesignRouteSyncContract(),
  };
}

export {
  getActiveDesignRouteSyncContract,
  buildSite00FounderDesignScreenSet,
  ACTIVE_ROUTE_MANIFEST_SCHEMA,
  ACTIVE_ROUTE_MANIFEST_VERSION,
};
