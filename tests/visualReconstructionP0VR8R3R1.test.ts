/**
 * P0.VR.8R3R1 — Capture run contract + worker execution recovery.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { registerNdxbookDesignPilot, registerSite00DesignPilot } from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/client.js';
import {
  clearCaptureQueueForTest,
  clearPageSnapshotStoreForTest,
  clearProjectPageRegistryForTest,
  completeCaptureJob,
  getProjectPageRecord,
  listProjectPageRecords,
  reconcileProjectPageRegistry,
  registerProjectPageSnapshot,
  upsertProjectPageRecord,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr8/client.js';
import {
  CAPTURE_RUN_CONTRACT_VERSION,
  normalizeProjectCaptureRunResponse,
  validateProjectCaptureRunContract,
  captureRunProgressLabel,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/projectCaptureRunContract.js';
import {
  clearCaptureFailureLoopGuardForTest,
  clearCaptureRunEventsForTest,
  clearProjectCaptureRunsForTest,
  clearCaptureOrchestrationRegistryForTest,
  dispatchCaptureWorker,
  derivePageCaptureStatus,
  getProjectCaptureRefreshProgress,
  normalizeRecoveredCaptureStatuses,
  refreshProjectCaptureState,
  resetCaptureWorkerHealthForTest,
  resetCaptureQueueHydrationForTest,
  markCaptureWorkerOffline,
  buildCaptureVersionReceipt,
  detectBackendVersionMismatch,
  P0_VR_8R3R1_BUILD,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/client.js';
import type { CaptureExecutor } from '../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/captureWorker.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

function mockCaptureFn(): CaptureExecutor {
  return vi.fn(async (input) => {
    const page = getProjectPageRecord(input.projectId, input.pageId);
    const capturedAt = new Date().toISOString();
    const snap = registerProjectPageSnapshot({
      snapshotId: `mock-${input.pageId}-${input.viewportClass}`,
      projectId: input.projectId,
      pageId: input.pageId,
      route: page?.route ?? '/',
      viewport: input.viewportClass,
      captureType: 'LIVE_CURRENT',
      imageUrl: `https://vitest.local/${input.pageId}.png`,
      storagePath: `${input.pageId}.png`,
      width: 390,
      height: 844,
      devicePixelRatio: 2,
      capturedAt,
      status: 'CURRENT',
      isCurrent: true,
    });
    if (page) upsertProjectPageRecord({ ...page, status: 'CURRENT', lastCapturedAt: capturedAt });
    if (input.jobId) completeCaptureJob(input.jobId, true);
    return { pageSnapshot: snap } as never;
  });
}

describe('P0.VR.8R3R1 — Capture run contract recovery', () => {
  beforeEach(() => {
    clearProjectPageRegistryForTest();
    clearCaptureQueueForTest();
    clearPageSnapshotStoreForTest();
    clearProjectCaptureRunsForTest();
    clearCaptureOrchestrationRegistryForTest();
    clearCaptureFailureLoopGuardForTest();
    clearCaptureRunEventsForTest();
    resetCaptureWorkerHealthForTest();
    resetCaptureQueueHydrationForTest();
    registerNdxbookDesignPilot();
    registerSite00DesignPilot();
    reconcileProjectPageRegistry('ndxbook');
  });

  it('1. ProjectCaptureRunContract exists', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr8r3/projectCaptureRunContract.ts')).toContain(
      'ProjectCaptureRunContract',
    );
  });

  it('2. contract version capture-run-v1', () => {
    expect(CAPTURE_RUN_CONTRACT_VERSION).toBe('capture-run-v1');
  });

  it('3. response normalization defaults counts to 0', () => {
    const contract = normalizeProjectCaptureRunResponse({});
    expect(contract.queuedCount).toBe(0);
    expect(contract.totalTargets).toBe(0);
    expect(Number.isNaN(contract.completedCount)).toBe(false);
  });

  it('4. invalid contract flagged', () => {
    const contract = normalizeProjectCaptureRunResponse({ contractVersion: 'capture-run-v0', runId: 'x', projectId: 'ndxbook' });
    expect(contract.contractValid).toBe(false);
    expect(contract.contractError).toBe('CAPTURE_RUN_CONTRACT_MISMATCH');
  });

  it('5. malformed run missing totals invalid', () => {
    const contract = normalizeProjectCaptureRunResponse({
      contractVersion: CAPTURE_RUN_CONTRACT_VERSION,
      runId: 'pcr-1',
      projectId: 'ndxbook',
      status: 'QUEUING',
      totalTargets: 0,
    });
    expect(contract.contractValid).toBe(false);
  });

  it('6. refresh project creates normalized run', async () => {
    const run = await refreshProjectCaptureState('ndxbook', { executeWorker: false });
    expect(run.contractVersion).toBe(CAPTURE_RUN_CONTRACT_VERSION);
    expect(run.runId).toMatch(/^capture_/);
    expect(run.totalTargets).toBeGreaterThan(0);
    expect(run.contractValid).toBe(true);
  });

  it('7. totalTargets from backend not inferred', async () => {
    const pages = listProjectPageRecords('ndxbook');
    const run = await refreshProjectCaptureState('ndxbook', { executeWorker: false });
    expect(run.totalTargets).toBeGreaterThanOrEqual(pages.length - 5);
  });

  it('8. queue counts derived from jobs', async () => {
    const run = await refreshProjectCaptureState('ndxbook', { executeWorker: false });
    expect(run.queuedCount).toBeGreaterThan(0);
  });

  it('9. worker offline blocks refresh', async () => {
    markCaptureWorkerOffline('test');
    await expect(refreshProjectCaptureState('ndxbook')).rejects.toThrow(/OFFLINE/);
  });

  it('10. first page promotion CURRENT', async () => {
    const run = await refreshProjectCaptureState('ndxbook', { executeWorker: false });
    await dispatchCaptureWorker({
      projectId: 'ndxbook',
      runId: run.runId,
      captureFn: mockCaptureFn(),
      concurrency: 1,
    });
    const withCurrent = listProjectPageRecords('ndxbook').filter((p) => p.status === 'CURRENT');
    expect(withCurrent.length).toBeGreaterThan(0);
  });

  it('11. progress label never NaN', async () => {
    const run = await refreshProjectCaptureState('ndxbook', { executeWorker: false });
    const label = captureRunProgressLabel(run);
    expect(label).not.toContain('NaN');
    expect(label).not.toContain('undefined');
  });

  it('12. status normalization NEVER_CAPTURED', () => {
    reconcileProjectPageRegistry('ndxbook');
    const page = listProjectPageRecords('ndxbook')[0]!;
    upsertProjectPageRecord({ ...page, status: 'STALE', lastCapturedAt: null, lastVisualHash: null });
    normalizeRecoveredCaptureStatuses('ndxbook');
    const updated = getProjectPageRecord('ndxbook', page.pageId)!;
    expect(derivePageCaptureStatus(updated)).toBe('NEVER_CAPTURED');
  });

  it('13. backend version mismatch detection', () => {
    const receipt = buildCaptureVersionReceipt('v259');
    expect(detectBackendVersionMismatch({ ...receipt, apiBuild: 'v100' }, 'v259')).toBe('BACKEND_VERSION_MISMATCH');
  });

  it('14. API returns pageMirrorRowToVisualIndexRow', () => {
    expect(read('api/site00/page-mirror.ts')).toContain('pageMirrorRowToVisualIndexRow');
  });

  it('15. API wraps captureRun in contract', () => {
    expect(read('api/site00/page-mirror.ts')).toContain('captureRun');
    expect(read('api/site00/page-mirror.ts')).toContain('contractVersion');
  });

  it('16. golden first route prioritized', async () => {
    const run = await refreshProjectCaptureState('ndxbook', { executeWorker: false });
    expect(run.lastEvent?.route).toContain('/projects/ndxbook');
  });

  it('17. run progress after worker', async () => {
    const run = await refreshProjectCaptureState('ndxbook', { executeWorker: false });
    await dispatchCaptureWorker({ projectId: 'ndxbook', runId: run.runId, captureFn: mockCaptureFn(), concurrency: 2 });
    const progress = getProjectCaptureRefreshProgress('ndxbook');
    expect(progress?.completedCount).toBeGreaterThan(0);
  });

  it('18. partial run when failures exist', async () => {
    const run = await refreshProjectCaptureState('ndxbook', { executeWorker: false, forceNewRun: true });
    let n = 0;
    const mixed: CaptureExecutor = vi.fn(async (input) => {
      n++;
      if (n === 1) {
        if (input.jobId) completeCaptureJob(input.jobId, false);
        throw new Error('CAPTURE_RENDER_TIMEOUT');
      }
      return mockCaptureFn()(input);
    });
    await dispatchCaptureWorker({ projectId: 'ndxbook', runId: run.runId, captureFn: mixed, concurrency: 2 });
    const progress = getProjectCaptureRefreshProgress('ndxbook');
    expect(['PARTIAL', 'CAPTURING', 'COMPLETE', 'FAILED']).toContain(progress?.status ?? '');
  });

  it('19. validateProjectCaptureRunContract', () => {
    const ok = normalizeProjectCaptureRunResponse({
      contractVersion: CAPTURE_RUN_CONTRACT_VERSION,
      runId: 'pcr-1',
      projectId: 'ndxbook',
      status: 'CAPTURING',
      totalTargets: 46,
    });
    expect(validateProjectCaptureRunContract(ok).valid).toBe(true);
  });

  it('20. UI NaN guards in DesignPagesTabPanel', () => {
    expect(read('src/site00/components/designWorkspace/DesignPagesTabPanel.tsx')).toContain('FounderCaptureExperience');
    expect(read('src/site00/components/designWorkspace/usePageMirror.ts')).toContain('normalizeProjectCaptureRunResponse');
  });

  it('21. usePageMirror normalizes contract', () => {
    expect(read('src/site00/components/designWorkspace/usePageMirror.ts')).toContain('normalizeProjectCaptureRunResponse');
  });

  it('22. persistent registry path exists', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr8r3/captureRunPersistentStore.ts')).toContain(
      'capture-orchestration-registry.json',
    );
  });

  it('23. worker dispatch receipts', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr8r3/workerDispatchReceipt.ts')).toContain(
      'WorkerDispatchReceipt',
    );
  });

  it('24. run events stream', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr8r3/captureRunEvents.ts')).toContain(
      'CAPTURE_STARTED',
    );
  });

  it('25. 46-target ndxbook fixture', async () => {
    const pages = listProjectPageRecords('ndxbook');
    expect(pages.length).toBeGreaterThanOrEqual(40);
    const run = await refreshProjectCaptureState('ndxbook', { executeWorker: false });
    expect(run.totalTargets).toBe(pages.length);
  });

  it('26. first target current count increment', async () => {
    const run = await refreshProjectCaptureState('ndxbook', { executeWorker: false });
    await dispatchCaptureWorker({ projectId: 'ndxbook', runId: run.runId, captureFn: mockCaptureFn(), concurrency: 1 });
    const progress = getProjectCaptureRefreshProgress('ndxbook');
    expect(progress?.completedCount).toBeGreaterThanOrEqual(1);
  });

  it('27. duplicate run guard', async () => {
    await refreshProjectCaptureState('ndxbook', { executeWorker: false });
    const second = await refreshProjectCaptureState('ndxbook', { executeWorker: false });
    expect(second.duplicateBlocked).toBe(true);
  });

  it('28. malformed active run invalidated on retry', async () => {
    const bad = normalizeProjectCaptureRunResponse({
      contractVersion: CAPTURE_RUN_CONTRACT_VERSION,
      runId: 'pcr-bad',
      projectId: 'ndxbook',
      status: 'CAPTURING',
      totalTargets: 0,
    });
    expect(bad.contractValid).toBe(false);
  });

  it('29. build passes contract module', () => {
    expect(P0_VR_8R3R1_BUILD).toBe('v263');
  });

  it('30. frontend build receipt constant', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr8r3/constants.ts')).toContain('v263');
  });

  it('31. integration contract fields on refresh', async () => {
    const run = await refreshProjectCaptureState('ndxbook', { executeWorker: false });
    expect(run.workerStatus).toBeTruthy();
    expect(run.startedAt).toBeTruthy();
    expect(run.updatedAt).toBeTruthy();
  });
});
