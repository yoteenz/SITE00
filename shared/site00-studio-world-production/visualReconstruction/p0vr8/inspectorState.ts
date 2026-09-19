/**
 * P0.VR.8 — System inspector mirror state.
 */

import { listProjectPageRecords, getPageRegistryMeta } from './projectPageRegistry.js';
import { listCaptureQueue } from './captureQueue.js';
import { computePageSnapshotFreshness } from './snapshotFreshness.js';
import type { PageMirrorInspectorState } from './types.js';

export function buildPageMirrorInspectorState(projectId: string): PageMirrorInspectorState {
  const pages = listProjectPageRecords(projectId, false);
  const active = pages.filter((p) => p.isActive);
  const stale = active.filter((p) => computePageSnapshotFreshness(p).isStale);
  const queue = listCaptureQueue(projectId).filter((j) => j.status === 'QUEUED' || j.status === 'CAPTURING');
  const meta = getPageRegistryMeta();
  const failures = listCaptureQueue(projectId).filter((j) => j.status === 'FAILED').length;
  const lastCapture = active
    .map((p) => p.lastCapturedAt)
    .filter(Boolean)
    .sort()
    .reverse()[0] ?? null;

  return {
    activeDesignProjectId: projectId,
    routeCount: pages.length,
    activePageCount: active.length,
    stalePageCount: stale.length,
    captureQueueCount: queue.length,
    lastRouteDiscoveryAt: meta.lastDiscoveryAt,
    lastDeploymentId: meta.lastDeploymentId,
    lastCaptureAt: lastCapture,
    captureFailures: failures,
    pageRegistrySource: projectId === 'site00' ? 'P0.VR.3D_MANIFEST' : 'P0.VR.2_DESIGN_REGISTRY',
  };
}
