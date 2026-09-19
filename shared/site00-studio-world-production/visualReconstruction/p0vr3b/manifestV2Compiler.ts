/**
 * P0.VR.3B — Compile studio-world-design-route-manifest@2.
 */

import { SITE00_DESIGN_PROJECT_ID } from '../p0vr3/constants.js';
import {
  ACTIVE_ROUTE_MANIFEST_SCHEMA,
  ACTIVE_ROUTE_MANIFEST_VERSION,
  P0_VR_3B_LINEAGE,
  STUDIO_WORLD_DESIGN_ROUTE_MANIFEST_ID,
} from './constants.js';
import { buildSite00RawImplementationRoutes } from './site00RawRouteInventory.js';
import { normalizeImplementationRoutesToDesignScreens } from './site00DesignScreenNormalization.js';
import type { Site00RouteCountModel, StudioWorldDesignRouteManifestV2 } from './types.js';

let v2Cache: StudioWorldDesignRouteManifestV2 | null = null;

export function compileStudioWorldDesignRouteManifestV2(): StudioWorldDesignRouteManifestV2 {
  const rawImplementationRoutes = buildSite00RawImplementationRoutes();
  const { screens: designScreens, linkedRaw } = normalizeImplementationRoutesToDesignScreens(rawImplementationRoutes);

  const routeCounts: Site00RouteCountModel = {
    rawImplementationRouteCount: rawImplementationRoutes.filter((r) => r.reachable).length,
    normalizedDesignScreenCount: designScreens.length,
    websiteExperienceRouteCount: 0,
    primaryFounderDesignableCount: 0,
    visualStateCount: 0,
    missingDependencyCount: 0,
    hostInternalCount: designScreens.filter((s) => s.classification === 'HOST_INTERNAL').length,
    trueOrphanCount: 0,
  };

  const manifest: StudioWorldDesignRouteManifestV2 = {
    manifestId: STUDIO_WORLD_DESIGN_ROUTE_MANIFEST_ID,
    schema: ACTIVE_ROUTE_MANIFEST_SCHEMA,
    version: ACTIVE_ROUTE_MANIFEST_VERSION,
    lineage: P0_VR_3B_LINEAGE,
    projectId: SITE00_DESIGN_PROJECT_ID,
    compiledAt: new Date().toISOString(),
    rawImplementationRoutes: linkedRaw.length ? rawImplementationRoutes : rawImplementationRoutes,
    designScreens,
    routeCounts,
    trueOrphanCount: 0,
  };

  v2Cache = manifest;
  return manifest;
}

export function getActiveRouteManifestV2(): StudioWorldDesignRouteManifestV2 {
  return v2Cache ?? compileStudioWorldDesignRouteManifestV2();
}

export function clearManifestV2CacheForTest(): void {
  v2Cache = null;
}

export function findDesignScreenByPath(path: string): ReturnType<typeof getActiveRouteManifestV2>['designScreens'][number] | null {
  const manifest = getActiveRouteManifestV2();
  const key = path.replace(/\/desktop(\/|$)/, '$1').replace(/\/+$/, '') || '/';
  return manifest.designScreens.find((s) => s.normalizedPath === key || s.normalizedPath === path) ?? null;
}

export function findDesignScreenById(designScreenId: string) {
  return getActiveRouteManifestV2().designScreens.find((s) => s.designScreenId === designScreenId) ?? null;
}
