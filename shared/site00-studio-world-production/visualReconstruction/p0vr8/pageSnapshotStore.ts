/**
 * P0.VR.8 — ProjectPageSnapshot store with current pointer + history.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import {
  getLatestImplementationSnapshot,
  listImplementationSnapshotsForScreen,
} from '../p0vr3e/implementationSnapshotRegistry.js';
import type { ImplementationSnapshotRecord } from '../p0vr3e/types.js';
import type { ProjectPageSnapshot, ProjectPageSnapshotCaptureType } from './types.js';
import { mapSnapshotStatusToMirrorStatus } from './snapshotFreshness.js';

const pageSnapshots = new Map<string, ProjectPageSnapshot>();
const currentPointers = new Map<string, string>();

function pointerKey(projectId: string, pageId: string, viewport: DesignViewportClass): string {
  return `${projectId}:${pageId}:${viewport}`;
}

export function implementationToPageSnapshot(
  impl: ImplementationSnapshotRecord,
  pageId: string,
  captureType: ProjectPageSnapshotCaptureType = 'LIVE_CURRENT',
): ProjectPageSnapshot {
  return {
    snapshotId: impl.snapshotId,
    projectId: impl.projectId,
    pageId,
    route: impl.resolvedRoute || impl.route,
    viewport: impl.viewportClass,
    captureType,
    imageUrl: impl.publicUrl,
    storagePath: impl.storagePath,
    width: impl.width,
    height: impl.height,
    devicePixelRatio: impl.deviceScaleFactor,
    contentHash: impl.sourceCommit,
    visualHash: null,
    deploymentId: impl.sourceBuildId,
    sourceRevision: impl.sourceCommit,
    capturedAt: impl.capturedAt,
    status: mapSnapshotStatusToMirrorStatus(impl.captureStatus, impl.stale),
    previousSnapshotId: null,
    isCurrent: impl.captureStatus === 'CURRENT' && !impl.stale,
  };
}

export function registerProjectPageSnapshot(snapshot: ProjectPageSnapshot): ProjectPageSnapshot {
  const key = pointerKey(snapshot.projectId, snapshot.pageId, snapshot.viewport);
  const prevId = currentPointers.get(key);
  if (prevId && prevId !== snapshot.snapshotId) {
    const prev = pageSnapshots.get(prevId);
    if (prev) pageSnapshots.set(prevId, { ...prev, isCurrent: false });
    snapshot = { ...snapshot, previousSnapshotId: prevId };
  }
  pageSnapshots.set(snapshot.snapshotId, snapshot);
  if (snapshot.isCurrent) currentPointers.set(key, snapshot.snapshotId);
  return snapshot;
}

export function getCurrentPageSnapshot(
  projectId: string,
  pageId: string,
  viewport: DesignViewportClass,
  screenId?: string,
): ProjectPageSnapshot | null {
  const key = pointerKey(projectId, pageId, viewport);
  const ptr = currentPointers.get(key);
  if (ptr) return pageSnapshots.get(ptr) ?? null;

  if (screenId) {
    const impl = getLatestImplementationSnapshot(projectId, screenId, viewport);
    if (impl) return implementationToPageSnapshot(impl, pageId);
  }
  return null;
}

export function listPageSnapshotHistory(
  projectId: string,
  pageId: string,
  screenId?: string,
  viewport?: DesignViewportClass,
): ProjectPageSnapshot[] {
  const local = [...pageSnapshots.values()]
    .filter((s) => s.projectId === projectId && s.pageId === pageId)
    .filter((s) => !viewport || s.viewport === viewport)
    .sort((a, b) => b.capturedAt.localeCompare(a.capturedAt));

  if (local.length) return local;

  if (screenId) {
    return listImplementationSnapshotsForScreen(projectId, screenId, viewport).map((impl) =>
      implementationToPageSnapshot(impl, pageId),
    );
  }
  return [];
}

export function clearPageSnapshotStoreForTest(): void {
  pageSnapshots.clear();
  currentPointers.clear();
}
