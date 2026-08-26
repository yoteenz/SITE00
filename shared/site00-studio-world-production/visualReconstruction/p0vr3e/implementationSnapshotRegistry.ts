/**
 * P0.VR.3E — Implementation snapshot registry (history + latest pointer).
 */

import type {
  ImplementationSnapshotRecord,
  LatestImplementationSnapshotPointer,
  ImplementationSnapshotBatch,
} from './types.js';
import type { DesignViewportClass } from '../p0vr2/types.js';

const snapshots = new Map<string, ImplementationSnapshotRecord>();
const latestPointers = new Map<string, LatestImplementationSnapshotPointer>();
const batches = new Map<string, ImplementationSnapshotBatch>();

function pointerKey(
  projectId: string,
  designScreenId: string,
  viewportClass: DesignViewportClass,
  visualStateId: string | null,
): string {
  return `${projectId}:${designScreenId}:${viewportClass}:${visualStateId ?? 'base'}`;
}

export function registerImplementationSnapshot(record: ImplementationSnapshotRecord): ImplementationSnapshotRecord {
  snapshots.set(record.snapshotId, record);
  const key = pointerKey(record.projectId, record.designScreenId, record.viewportClass, record.visualStateId);
  latestPointers.set(key, {
    projectId: record.projectId,
    designScreenId: record.designScreenId,
    viewportClass: record.viewportClass,
    visualStateId: record.visualStateId,
    snapshotId: record.snapshotId,
    updatedAt: record.capturedAt,
  });
  return record;
}

export function getImplementationSnapshot(snapshotId: string): ImplementationSnapshotRecord | null {
  return snapshots.get(snapshotId) ?? null;
}

export function listImplementationSnapshotsForScreen(
  projectId: string,
  designScreenId: string,
  viewportClass?: DesignViewportClass,
): ImplementationSnapshotRecord[] {
  return [...snapshots.values()]
    .filter((s) => s.projectId === projectId && s.designScreenId === designScreenId)
    .filter((s) => !viewportClass || s.viewportClass === viewportClass)
    .sort((a, b) => b.capturedAt.localeCompare(a.capturedAt));
}

export function getLatestImplementationSnapshot(
  projectId: string,
  designScreenId: string,
  viewportClass: DesignViewportClass,
  visualStateId: string | null = null,
): ImplementationSnapshotRecord | null {
  const key = pointerKey(projectId, designScreenId, viewportClass, visualStateId);
  const pointer = latestPointers.get(key);
  if (!pointer) return null;
  return snapshots.get(pointer.snapshotId) ?? null;
}

export function markSnapshotsStaleForProject(projectId: string, reason = 'source commit changed'): number {
  let count = 0;
  for (const snap of snapshots.values()) {
    if (snap.projectId !== projectId || snap.stale) continue;
    snapshots.set(snap.snapshotId, {
      ...snap,
      stale: true,
      captureStatus: snap.captureStatus === 'CURRENT' ? 'STALE' : snap.captureStatus,
      error: reason,
    });
    count++;
  }
  return count;
}

export function registerImplementationSnapshotBatch(batch: ImplementationSnapshotBatch): ImplementationSnapshotBatch {
  batches.set(batch.batchId, batch);
  return batch;
}

export function getImplementationSnapshotBatch(batchId: string): ImplementationSnapshotBatch | null {
  return batches.get(batchId) ?? null;
}

export function updateImplementationSnapshotBatch(
  batchId: string,
  patch: Partial<ImplementationSnapshotBatch>,
): ImplementationSnapshotBatch | null {
  const existing = batches.get(batchId);
  if (!existing) return null;
  const updated = { ...existing, ...patch };
  batches.set(batchId, updated);
  return updated;
}

export function listImplementationSnapshotBatches(projectId?: string): ImplementationSnapshotBatch[] {
  return [...batches.values()]
    .filter((b) => !projectId || b.projectId === projectId)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export function clearImplementationSnapshotRegistryForTest(): void {
  snapshots.clear();
  latestPointers.clear();
  batches.clear();
}
