/**
 * P0.VR.3E — Batch implementation snapshot capture with controlled concurrency.
 */

import { listDesignScreensForProject } from '../p0vr2/designScreenRegistry.js';
import { buildSite00FounderDesignScreenSet } from '../p0vr3d/site00AuditReconciliation.js';
import { getActiveDesignRouteSyncContract } from '../p0vr3d/designRouteSyncContract.js';
import type { DesignViewportClass } from '../p0vr2/types.js';
import { SCREENSHOT_CAPTURE_CONCURRENCY_DEFAULT } from './constants.js';
import { captureImplementationSnapshot } from './implementationSnapshotCaptureEngine.js';
import {
  getImplementationSnapshotBatch,
  registerImplementationSnapshotBatch,
  updateImplementationSnapshotBatch,
} from './implementationSnapshotRegistry.js';
import type { CaptureProjectInput, ImplementationSnapshotBatch, ImplementationSnapshotRecord } from './types.js';

async function runWithConcurrency<T>(
  tasks: Array<() => Promise<T>>,
  concurrency: number,
): Promise<T[]> {
  const results: T[] = [];
  let index = 0;
  async function worker() {
    while (index < tasks.length) {
      const current = index++;
      results[current] = await tasks[current]();
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker()));
  return results;
}

function resolveScreenIds(input: CaptureProjectInput): string[] {
  if (input.projectId === 'site00') {
    const contract = getActiveDesignRouteSyncContract();
    const mode = input.screenSetMode ?? 'PRIMARY';
    return buildSite00FounderDesignScreenSet(mode, contract).screenIds;
  }
  return listDesignScreensForProject(input.projectId, true).map((s) => s.screenId);
}

export async function captureProjectImplementationSnapshots(
  input: CaptureProjectInput,
): Promise<{ batch: ImplementationSnapshotBatch; snapshots: ImplementationSnapshotRecord[] }> {
  const viewports: DesignViewportClass[] = input.viewports ?? ['mobile', 'tablet', 'desktop'];
  const screenIds = resolveScreenIds(input);
  const batchId = `batch-${input.projectId}-${Date.now()}`;
  const planned = screenIds.length * viewports.length;

  registerImplementationSnapshotBatch({
    batchId,
    projectId: input.projectId,
    status: 'CAPTURING',
    viewports,
    screenIds,
    planned,
    complete: 0,
    capturing: planned,
    queued: 0,
    failed: 0,
    startedAt: new Date().toISOString(),
    completedAt: null,
  });

  const flatTasks: Array<() => Promise<ImplementationSnapshotRecord | null>> = [];
  for (const screenId of screenIds) {
    for (const viewportClass of viewports) {
      flatTasks.push(() =>
        captureImplementationSnapshot({
          projectId: input.projectId,
          screenId,
          viewportClass,
          baseUrl: input.baseUrl,
        }),
      );
    }
  }

  let complete = 0;
  let failed = 0;
  const snapshots: ImplementationSnapshotRecord[] = [];

  const wrappedTasks = flatTasks.map((task) => async () => {
    updateImplementationSnapshotBatch(batchId, { capturing: Math.max(0, planned - complete - failed - 1) });
    const result = await task();
    if (result?.captureStatus === 'CURRENT') complete++;
    else if (result?.captureStatus === 'FAILED' || result?.captureStatus === 'AUTH_BLOCKED') failed++;
    else if (result) complete++;
    if (result) snapshots.push(result);
    updateImplementationSnapshotBatch(batchId, { complete, failed, capturing: Math.max(0, planned - complete - failed) });
    return result;
  });

  await runWithConcurrency(wrappedTasks, input.concurrency ?? SCREENSHOT_CAPTURE_CONCURRENCY_DEFAULT);

  const finalBatch = updateImplementationSnapshotBatch(batchId, {
    status: failed > 0 && complete > 0 ? 'PARTIAL' : failed > 0 ? 'FAILED_PARTIAL' : 'COMPLETE',
    complete,
    failed,
    capturing: 0,
    queued: 0,
    completedAt: new Date().toISOString(),
  })!;

  return { batch: finalBatch, snapshots };
}

export async function captureSelectedImplementationSnapshots(input: {
  projectId: string;
  screenIds: string[];
  viewports?: DesignViewportClass[];
  baseUrl?: string;
}): Promise<ImplementationSnapshotRecord[]> {
  const viewports = input.viewports ?? ['mobile', 'tablet', 'desktop'];
  const results: ImplementationSnapshotRecord[] = [];
  for (const screenId of input.screenIds) {
    for (const viewportClass of viewports) {
      const snap = await captureImplementationSnapshot({
        projectId: input.projectId,
        screenId,
        viewportClass,
        baseUrl: input.baseUrl,
      });
      if (snap) results.push(snap);
    }
  }
  return results;
}

export async function retryFailedCaptures(batchId: string): Promise<ImplementationSnapshotRecord[]> {
  const batch = getImplementationSnapshotBatch(batchId);
  if (!batch) return [];
  return captureSelectedImplementationSnapshots({
    projectId: batch.projectId,
    screenIds: batch.screenIds,
    viewports: batch.viewports,
  });
}
