/**
 * P0.VR.8 — ProjectPageRegistry — project-scoped live page mirror registry.
 */

import {
  discoverProjectRoutes,
  screenToPageRecord,
  detectAddedRoutes,
  detectRemovedRoutes,
  detectChangedRoutes,
  reconcileRouteRename,
} from './routeDiscoveryService.js';
import type { ProjectPageRecord } from './types.js';

const registry = new Map<string, ProjectPageRecord>();
let lastDiscoveryAt: string | null = null;
let lastDeploymentId: string | null = null;

export function getProjectPageRecord(projectId: string, pageId: string): ProjectPageRecord | null {
  return registry.get(pageId) ?? [...registry.values()].find((p) => p.projectId === projectId && p.pageId === pageId) ?? null;
}

export function listProjectPageRecords(projectId: string, activeOnly = true): ProjectPageRecord[] {
  return [...registry.values()].filter((p) => p.projectId === projectId && (!activeOnly || p.isActive));
}

export function upsertProjectPageRecord(record: ProjectPageRecord): ProjectPageRecord {
  registry.set(record.pageId, record);
  return record;
}

export function reconcileProjectPageRegistry(
  projectId: string,
  options?: { screenSetMode?: 'PRIMARY' | 'ALL_DESIGNABLE' },
): {
  added: ProjectPageRecord[];
  removed: ProjectPageRecord[];
  changed: ProjectPageRecord[];
  renames: Array<{ from: ProjectPageRecord; to: ProjectPageRecord }>;
  all: ProjectPageRecord[];
} {
  const screens = discoverProjectRoutes(projectId, options);
  const discovered = screens.map((s) => screenToPageRecord(s, projectId));
  const existing = listProjectPageRecords(projectId, false);

  const addedRaw = detectAddedRoutes(discovered, existing);
  const removedRaw = detectRemovedRoutes(discovered, existing);
  const changed = detectChangedRoutes(discovered, existing);
  const { renames, orphanRemoved, orphanAdded } = reconcileRouteRename(removedRaw, addedRaw);

  for (const { from, to } of renames) {
    const lineage = registry.get(from.pageId);
    upsertProjectPageRecord({
      ...to,
      createdAt: lineage?.createdAt ?? to.createdAt,
      lastCapturedAt: lineage?.lastCapturedAt ?? null,
      lastContentHash: lineage?.lastContentHash ?? null,
      status: lineage?.status === 'CURRENT' ? 'STALE' : to.status,
    });
    upsertProjectPageRecord({ ...from, isActive: false, status: 'REMOVED', updatedAt: new Date().toISOString() });
  }

  for (const page of orphanAdded) {
    upsertProjectPageRecord(page);
  }

  for (const page of changed) {
    const prev = registry.get(page.pageId);
    upsertProjectPageRecord({
      ...page,
      status: prev?.lastCapturedAt ? 'STALE' : page.status,
    });
  }

  for (const page of orphanRemoved) {
    const prev = registry.get(page.pageId);
    if (prev) {
      upsertProjectPageRecord({ ...prev, isActive: false, status: 'REMOVED', updatedAt: new Date().toISOString() });
    }
  }

  for (const d of discovered) {
    if (!registry.has(d.pageId)) {
      upsertProjectPageRecord(d);
    } else {
      const prev = registry.get(d.pageId)!;
      upsertProjectPageRecord({
        ...prev,
        ...d,
        createdAt: prev.createdAt,
        lastDiscoveredAt: new Date().toISOString(),
        isActive: d.status !== 'ROUTE_MISSING',
      });
    }
  }

  lastDiscoveryAt = new Date().toISOString();
  return {
    added: orphanAdded,
    removed: orphanRemoved,
    changed,
    renames,
    all: listProjectPageRecords(projectId, false),
  };
}

export function markPageStale(projectId: string, pageId: string, reason?: string): ProjectPageRecord | null {
  const page = getProjectPageRecord(projectId, pageId);
  if (!page) return null;
  return upsertProjectPageRecord({
    ...page,
    status: 'STALE',
    updatedAt: new Date().toISOString(),
    lastContentHash: reason ?? page.lastContentHash,
  });
}

export function markPagesStaleForDeploy(projectId: string, deploymentId: string, pageIds?: string[]): number {
  lastDeploymentId = deploymentId;
  let count = 0;
  const targets = pageIds?.length
    ? pageIds.map((id) => getProjectPageRecord(projectId, id)).filter(Boolean) as ProjectPageRecord[]
    : listProjectPageRecords(projectId);

  for (const page of targets) {
    if (page.status === 'REMOVED') continue;
    upsertProjectPageRecord({
      ...page,
      status: 'STALE',
      lastDeploymentId: deploymentId,
      updatedAt: new Date().toISOString(),
    });
    count++;
  }
  return count;
}

export function assertNoCrossProjectCollision(projectId: string, normalizedRoute: string): boolean {
  const match = [...registry.values()].find(
    (p) => p.normalizedRoute === normalizedRoute && p.projectId !== projectId && p.isActive,
  );
  if (!match) return true;
  return match.projectId !== projectId;
}

export function getPageRegistryMeta() {
  return { lastDiscoveryAt, lastDeploymentId };
}

export function clearProjectPageRegistryForTest(): void {
  registry.clear();
  lastDiscoveryAt = null;
  lastDeploymentId = null;
}
