/**
 * P0.VR.3A — SITE 00 design pilot registration.
 */

import { syncSite00ManifestToDesignRegistry, clearDesignRouteManifestCacheForTest } from '../p0vr3/designRouteManifest.js';
import { clearDesignRouteSyncContractCacheForTest } from '../p0vr3d/designRouteSyncContract.js';
import type { StudioWorldDesignRouteManifest } from '../p0vr3/types.js';

let site00PilotRegistered = false;

export function registerSite00DesignPilot(_rootDir?: string): StudioWorldDesignRouteManifest {
  if (site00PilotRegistered) {
    return syncSite00ManifestToDesignRegistry();
  }
  site00PilotRegistered = true;
  return syncSite00ManifestToDesignRegistry();
}

export function ensureSite00DesignPilotRegistered(): void {
  registerSite00DesignPilot();
}

export function resetSite00PilotForTest(): void {
  site00PilotRegistered = false;
  clearDesignRouteManifestCacheForTest();
  clearDesignRouteSyncContractCacheForTest();
}

export function registerAllDesignPilots(): void {
  registerSite00DesignPilot();
}
