/**
 * P0.VR.8R1 — ProjectRouteManifest + per-project sync state.
 */

import { discoverProjectRoutes } from '../p0vr8/routeDiscoveryService.js';
import { listProjectPageRecords, reconcileProjectPageRegistry } from '../p0vr8/projectPageRegistry.js';
import type { DesignScreenDefinition } from '../p0vr2/types.js';
import { getSite00ManagedProject } from './managedProjectRegistry.js';
import { SITE00_DESIGN_PROJECT_ID } from './types.js';

export type ProjectPageRegistrySyncState = 'NEVER_SYNCED' | 'SYNC_REQUIRED' | 'SYNCED';

export type ProjectRouteManifest = {
  manifestId: string;
  projectId: string;
  routes: DesignScreenDefinition[];
  routeCount: number;
  syncState: ProjectPageRegistrySyncState;
  lastSyncedAt: string | null;
  discoveredAt: string;
};

const syncTimestamps = new Map<string, string>();

export function markProjectPagesSynced(projectId: string, at: string = new Date().toISOString()): void {
  syncTimestamps.set(projectId, at);
}

export function clearProjectSyncStateForTest(): void {
  syncTimestamps.clear();
}

export function resolveProjectPageRegistrySyncState(projectId: string): ProjectPageRegistrySyncState {
  if (!getSite00ManagedProject(projectId)) return 'NEVER_SYNCED';
  if (syncTimestamps.has(projectId)) return 'SYNCED';

  const routes = discoverProjectRoutes(projectId);
  if (routes.length === 0) {
    return projectId === SITE00_DESIGN_PROJECT_ID ? 'SYNC_REQUIRED' : 'NEVER_SYNCED';
  }

  const records = listProjectPageRecords(projectId, false);
  if (records.length === 0) return 'SYNC_REQUIRED';
  return 'SYNCED';
}

export function buildProjectRouteManifest(
  projectId: string,
  options?: { screenSetMode?: 'PRIMARY' | 'ALL_DESIGNABLE' },
): ProjectRouteManifest {
  const routes = discoverProjectRoutes(projectId, options);
  const syncState = resolveProjectPageRegistrySyncState(projectId);
  const lastSyncedAt = syncTimestamps.get(projectId) ?? null;

  return {
    manifestId: `${projectId}:route-manifest`,
    projectId,
    routes,
    routeCount: routes.length,
    syncState,
    lastSyncedAt,
    discoveredAt: new Date().toISOString(),
  };
}

export function syncProjectRouteManifest(
  projectId: string,
  options?: { screenSetMode?: 'PRIMARY' | 'ALL_DESIGNABLE' },
): ProjectRouteManifest {
  reconcileProjectPageRegistry(projectId, options);
  markProjectPagesSynced(projectId);
  return buildProjectRouteManifest(projectId, options);
}

export function projectRegistryShowsUnsyncedNotZero(projectId: string): boolean {
  const state = resolveProjectPageRegistrySyncState(projectId);
  return state === 'NEVER_SYNCED' || state === 'SYNC_REQUIRED';
}
