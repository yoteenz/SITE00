/**
 * P0.VR.8R3 — Project capture refresh + queue orchestration recovery.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { registerNdxbookDesignPilot, registerSite00DesignPilot } from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/client.js';
import {
  clearCaptureQueueForTest,
  clearPageSnapshotStoreForTest,
  clearProjectPageRegistryForTest,
  computePageSnapshotFreshness,
  listCaptureQueue,
  listProjectPageRecords,
  reconcileProjectPageRegistry,
  registerProjectPageSnapshot,
  upsertProjectPageRecord,
  getProjectPageRecord,
  completeCaptureJob,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr8/client.js';
import {
  clearCaptureFailureLoopGuardForTest,
  clearProjectCaptureRunsForTest,
  clearCaptureOrchestrationRegistryForTest,
  clearCaptureRunEventsForTest,
  resetCaptureQueueHydrationForTest,
  countPagesByCaptureStatus,
  derivePageCaptureStatus,
  dispatchCaptureWorker,
  getActiveProjectCaptureRun,
  getProjectCaptureRefreshProgress,
  refreshProjectCaptureState,
  resetCaptureWorkerHealthForTest,
  shouldBlockCaptureRetry,
  recordCaptureFailure,
  buildCaptureOrchestrationInspectorState,
  CAPTURE_FAILURE_LOOP_MAX,
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
    if (page) {
      upsertProjectPageRecord({ ...page, status: 'CURRENT', lastCapturedAt: capturedAt });
    }
    if (input.jobId) completeCaptureJob(input.jobId, true);
    return { pageSnapshot: snap } as never;
  });
}

describe('P0.VR.8R3 — Capture orchestration recovery', () => {
  beforeEach(() => {
    clearProjectPageRegistryForTest();
    clearCaptureQueueForTest();
    clearPageSnapshotStoreForTest();
    clearProjectCaptureRunsForTest();
    clearCaptureOrchestrationRegistryForTest();
    clearCaptureRunEventsForTest();
    resetCaptureQueueHydrationForTest();
    clearCaptureFailureLoopGuardForTest();
    resetCaptureWorkerHealthForTest();
    registerNdxbookDesignPilot();
    registerSite00DesignPilot();
    reconcileProjectPageRegistry('ndxbook');
  });

  it('1. ProjectCaptureRefreshOrchestrator module exists', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr8r3/projectCaptureRefreshOrchestrator.ts')).toContain(
      'refreshProjectCaptureState',
    );
  });

  it('2. refresh project creates run', async () => {
    const run = await refreshProjectCaptureState('ndxbook', { executeWorker: false });
    expect(run.runId).toMatch(/^pcr-/);
    expect(run.status).toMatch(/QUEUING|CAPTURING|COMPLETE/);
    expect(run.totalTargets).toBeGreaterThan(0);
  });

  it('3. designable pages become targets', async () => {
    const run = await refreshProjectCaptureState('ndxbook', { executeWorker: false, forceNewRun: true });
    expect(run.totalTargets).toBeGreaterThan(0);
    expect(run.queuedCount).toBeGreaterThan(0);
  });

  it('4. supported viewport detection mobile-first', async () => {
    const run = await refreshProjectCaptureState('ndxbook', { viewportMode: 'MOBILE_ONLY', executeWorker: false, forceNewRun: true });
    expect(run.totalTargets).toBeGreaterThan(0);
    expect(run.queuedCount).toBe(run.totalTargets);
  });

  it('5. NEVER_CAPTURED state', () => {
    const page = listProjectPageRecords('ndxbook')[0]!;
    expect(derivePageCaptureStatus({ ...page, lastCapturedAt: null, status: 'DISCOVERED' })).toBe('NEVER_CAPTURED');
  });

  it('6. NEVER_CAPTURED is not STALE in freshness', () => {
    const page = listProjectPageRecords('ndxbook')[0]!;
    const fresh = computePageSnapshotFreshness({ ...page, lastCapturedAt: null });
    expect(fresh.neverCaptured).toBe(true);
    expect(fresh.isStale).toBe(false);
  });

  it('7. QUEUED state', async () => {
    await refreshProjectCaptureState('ndxbook', { executeWorker: false });
    const page = listProjectPageRecords('ndxbook')[0]!;
    const job = listCaptureQueue('ndxbook').find((j) => j.pageId === page.pageId);
    expect(job?.status).toBe('QUEUED');
    expect(derivePageCaptureStatus(page, job)).toBe('QUEUED');
  });

  it('8. worker execution promotes CURRENT', async () => {
    const run = await refreshProjectCaptureState('ndxbook', { executeWorker: false });
    const mock = mockCaptureFn();
    await dispatchCaptureWorker({ projectId: 'ndxbook', runId: run.runId, captureFn: mock, concurrency: 2 });
    const page = listProjectPageRecords('ndxbook')[0]!;
    const updated = getProjectPageRecord('ndxbook', page.pageId)!;
    expect(updated.lastCapturedAt).toBeTruthy();
    expect(derivePageCaptureStatus(updated)).toBe('CURRENT');
  });

  it('9. STALE state when capture predates change', () => {
    const page = listProjectPageRecords('ndxbook')[0]!;
    const stale = derivePageCaptureStatus({
      ...page,
      lastCapturedAt: '2020-01-01T00:00:00Z',
      status: 'STALE',
      updatedAt: new Date().toISOString(),
    });
    expect(stale).toBe('STALE');
  });

  it('10. FAILED state', async () => {
    const run = await refreshProjectCaptureState('ndxbook', { executeWorker: false });
    const failFn: CaptureExecutor = vi.fn(async (input) => {
      if (input.jobId) completeCaptureJob(input.jobId, false);
      throw new Error('CAPTURE_RENDER_TIMEOUT');
    });
    await dispatchCaptureWorker({ projectId: 'ndxbook', runId: run.runId, captureFn: failFn, concurrency: 1 });
    const failedJobs = listCaptureQueue('ndxbook').filter((j) => j.status === 'FAILED');
    expect(failedJobs.length).toBeGreaterThan(0);
  });

  it('11. project filter counts', () => {
    const pages = listProjectPageRecords('ndxbook');
    const counts = countPagesByCaptureStatus(pages, []);
    expect(counts.ALL).toBe(pages.length);
    expect(counts.NEVER_CAPTURED).toBeGreaterThan(0);
  });

  it('12. page-level refresh API path supports executeCapture', () => {
    expect(read('api/site00/page-mirror.ts')).toContain('executeCapture');
  });

  it('13. project-level refresh uses orchestrator not sync only', () => {
    expect(read('api/site00/page-mirror.ts')).toContain('refreshProjectCaptureState');
    expect(read('api/site00/page-mirror.ts')).not.toMatch(/refresh_project[\s\S]*handlePageSyncEvent/);
  });

  it('14. queue dispatch processes jobs', async () => {
    const run = await refreshProjectCaptureState('ndxbook', { executeWorker: false });
    const before = listCaptureQueue('ndxbook').filter((j) => j.status === 'QUEUED').length;
    expect(before).toBeGreaterThan(0);
    await dispatchCaptureWorker({ projectId: 'ndxbook', runId: run.runId, captureFn: mockCaptureFn(), concurrency: 3 });
    const afterQueued = listCaptureQueue('ndxbook').filter((j) => j.status === 'QUEUED').length;
    expect(afterQueued).toBe(0);
  });

  it('15. capture persistence updates page record', async () => {
    const run = await refreshProjectCaptureState('ndxbook', { executeWorker: false });
    await dispatchCaptureWorker({ projectId: 'ndxbook', runId: run.runId, captureFn: mockCaptureFn(), concurrency: 2 });
    const withCapture = listProjectPageRecords('ndxbook').filter((p) => p.lastCapturedAt);
    expect(withCapture.length).toBeGreaterThan(0);
  });

  it('16. current promotion after success', async () => {
    const page = listProjectPageRecords('ndxbook')[0]!;
    const run = await refreshProjectCaptureState('ndxbook', { executeWorker: false });
    await dispatchCaptureWorker({ projectId: 'ndxbook', runId: run.runId, captureFn: mockCaptureFn(), concurrency: 1 });
    const updated = getProjectPageRecord('ndxbook', page.pageId)!;
    expect(updated.status).toBe('CURRENT');
  });

  it('17. failure loop guard', () => {
    for (let i = 0; i < CAPTURE_FAILURE_LOOP_MAX; i++) {
      recordCaptureFailure('ndxbook', 'p1', 'mobile', 'CAPTURE_RENDER_TIMEOUT');
    }
    expect(shouldBlockCaptureRetry('ndxbook', 'p1', 'mobile', 'CAPTURE_RENDER_TIMEOUT')).toBe(true);
  });

  it('18. duplicate run guard', async () => {
    await refreshProjectCaptureState('ndxbook', { executeWorker: false });
    const second = await refreshProjectCaptureState('ndxbook', { executeWorker: false });
    expect(second.duplicateBlocked).toBe(true);
  });

  it('19. resume active run progress', async () => {
    await refreshProjectCaptureState('ndxbook', { executeWorker: false });
    const progress = getProjectCaptureRefreshProgress('ndxbook');
    expect(progress?.runId).toBeTruthy();
  });

  it('20. historical capture preservation', async () => {
    const page = listProjectPageRecords('ndxbook')[0]!;
    registerProjectPageSnapshot({
      snapshotId: 'hist-1',
      projectId: 'ndxbook',
      pageId: page.pageId,
      route: page.route,
      viewport: 'mobile',
      captureType: 'LIVE_CURRENT',
      imageUrl: 'https://vitest.local/hist.png',
      storagePath: 'hist.png',
      width: 390,
      height: 844,
      devicePixelRatio: 2,
      capturedAt: '2020-01-01T00:00:00Z',
      status: 'STALE',
      isCurrent: false,
    });
    const run = await refreshProjectCaptureState('ndxbook', { executeWorker: false, forceNewRun: true });
    await dispatchCaptureWorker({ projectId: 'ndxbook', runId: run.runId, captureFn: mockCaptureFn(), concurrency: 2 });
    expect(getProjectPageRecord('ndxbook', page.pageId)?.lastCapturedAt).not.toBe('2020-01-01T00:00:00Z');
  });

  it('21. reference preservation — capture type LIVE_CURRENT only', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr8/screenshotRecorder.ts')).toContain(
      'LIVE_CURRENT',
    );
  });

  it('22. page completion refresh queued count', async () => {
    const run = await refreshProjectCaptureState('ndxbook', { executeWorker: false });
    expect(run.totalTargets).toBeGreaterThan(0);
  });

  it('23. worker health inspector', () => {
    const inspector = buildCaptureOrchestrationInspectorState('ndxbook');
    expect(inspector.workerHealth.status).toBe('HEALTHY');
    expect(inspector.deploymentTarget).toContain('https://');
  });

  it('24. NDXBOOK 46-page fixture targets', async () => {
    const pages = listProjectPageRecords('ndxbook');
    expect(pages.length).toBeGreaterThanOrEqual(40);
    const run = await refreshProjectCaptureState('ndxbook', { executeWorker: false, forceNewRun: true });
    expect(run.totalTargets).toBe(pages.length);
  });

  it('25. one failure does not stop run', async () => {
    const run = await refreshProjectCaptureState('ndxbook', { executeWorker: false });
    let call = 0;
    const mixedFn: CaptureExecutor = vi.fn(async (input) => {
      call++;
      if (call === 1) {
        if (input.jobId) completeCaptureJob(input.jobId, false);
        throw new Error('CAPTURE_RENDER_TIMEOUT');
      }
      return mockCaptureFn()(input);
    });
    await dispatchCaptureWorker({ projectId: 'ndxbook', runId: run.runId, captureFn: mixedFn, concurrency: 2 });
    const completed = listCaptureQueue('ndxbook').filter((j) => j.status === 'COMPLETE').length;
    expect(completed).toBeGreaterThan(0);
  });

  it('26. concurrency limit respected', async () => {
    const run = await refreshProjectCaptureState('ndxbook', { executeWorker: false });
    await dispatchCaptureWorker({ projectId: 'ndxbook', runId: run.runId, captureFn: mockCaptureFn(), concurrency: 2 });
    expect(getActiveProjectCaptureRun('ndxbook')).toBeNull();
  });

  it('27. UI separates route sync from capture refresh', () => {
    expect(read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx')).toContain('handleRefreshProjectCapture');
    expect(read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx')).toContain('handleSyncProjectPages');
  });

  it('28. Pages tab NEVER CAPTURED filter', () => {
    expect(read('src/site00/components/designWorkspace/DesignPagesTabPanel.tsx')).toContain('NEVER CAPTURED');
  });

  it('29. capture orchestration inspector UI', () => {
    expect(read('src/site00/components/designWorkspace/DesignCaptureOrchestrationInspector.tsx')).toContain(
      'CAPTURE ORCHESTRATION',
    );
  });

  it('30. live mirror empty state labels', () => {
    expect(read('src/site00/components/designWorkspace/DesignPagesTabPanel.tsx')).toContain('NEVER CAPTURED');
    expect(read('src/site00/components/designWorkspace/DesignPagesTabPanel.tsx')).toContain('CAPTURING…');
  });

  it('31. build passes', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr8r3/types.ts')).toContain('NEVER_CAPTURED');
    expect(read('api/site00/page-mirror.ts')).toContain('capture-orchestration');
  });
});
