/**
 * P0.VR.8R3R2 — Capture contract receipt + page-state reconciliation + route resolution.
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
  upsertProjectPageRecord,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr8/client.js';
import {
  buildCaptureRunContractReceipt,
  buildCaptureRunPreflight,
  buildProjectCaptureStateSummary,
  CAPTURE_RUN_CONTRACT_VERSION,
  clearCaptureOrchestrationRegistryForTest,
  clearCaptureRunEventsForTest,
  clearProjectCaptureRunsForTest,
  derivePageCaptureStatus,
  dispatchCaptureWorker,
  generateCaptureRunId,
  getProjectCaptureRefreshProgress,
  normalizeRecoveredCaptureStatuses,
  P0_VR_8R3R2_BUILD,
  reconcileRecoveredPageCaptureStates,
  refreshProjectCaptureState,
  resetCaptureQueueHydrationForTest,
  resetCaptureWorkerHealthForTest,
  resolvePageCaptureState,
  resolveRuntimeRouteForPage,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/client.js';
import type { CaptureExecutor } from '../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/captureWorker.js';
import { normalizeProjectCaptureRunResponse } from '../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/projectCaptureRunContract.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

function mockCaptureFn(): CaptureExecutor {
  return vi.fn(async (input) => {
    const page = getProjectPageRecord(input.projectId, input.pageId);
    const capturedAt = new Date().toISOString();
    if (page) upsertProjectPageRecord({ ...page, status: 'CURRENT', lastCapturedAt: capturedAt });
    if (input.jobId) completeCaptureJob(input.jobId, true);
    return { pageSnapshot: { capturedAt } } as never;
  });
}

describe('P0.VR.8R3R2 — Contract receipt + page state + route resolution', () => {
  beforeEach(() => {
    clearProjectPageRegistryForTest();
    clearCaptureQueueForTest();
    clearPageSnapshotStoreForTest();
    clearProjectCaptureRunsForTest();
    clearCaptureOrchestrationRegistryForTest();
    clearCaptureRunEventsForTest();
    resetCaptureWorkerHealthForTest();
    resetCaptureQueueHydrationForTest();
    registerNdxbookDesignPilot();
    registerSite00DesignPilot();
    reconcileProjectPageRegistry('ndxbook');
  });

  it('1. CaptureRunContractReceipt module exists', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr8r3/captureRunContractReceipt.ts')).toContain(
      'CaptureRunContractReceipt',
    );
  });

  it('2. field-level RUN_ID_MISSING', () => {
    const receipt = buildCaptureRunContractReceipt({
      contractVersion: CAPTURE_RUN_CONTRACT_VERSION,
      runId: '',
      projectId: 'ndxbook',
      status: 'PLANNING',
      totalTargets: 0,
      queuedCount: 0,
      capturingCount: 0,
      completedCount: 0,
      failedCount: 0,
      skippedCount: 0,
      workerStatus: 'HEALTHY',
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    expect(receipt.errors).toContain('RUN_ID_MISSING');
    expect(receipt.primaryError).toBe('RUN_ID_MISSING');
  });

  it('3. PageCaptureStateResolver NEVER_CAPTURED overrides STALE', () => {
    const state = resolvePageCaptureState({
      latestCaptureId: null,
      lastCapturedAt: null,
      legacyPageStatus: 'STALE',
      routeExists: true,
      captureSupported: true,
    });
    expect(state).toBe('NEVER_CAPTURED');
  });

  it('4. reconcile 46 recovered pages to NEVER_CAPTURED', () => {
    const pages = listProjectPageRecords('ndxbook');
    for (const page of pages) {
      upsertProjectPageRecord({ ...page, status: 'STALE', lastCapturedAt: null, lastVisualHash: null });
    }
    const result = reconcileRecoveredPageCaptureStates('ndxbook');
    expect(result.neverCaptured).toBeGreaterThanOrEqual(pages.length - 5);
    const summary = buildProjectCaptureStateSummary(listProjectPageRecords('ndxbook'));
    expect(summary.neverCaptured).toBeGreaterThanOrEqual(pages.length - 5);
    expect(summary.stale).toBe(0);
  });

  it('5. displayRoute /OVERVIEW resolves to /projects/ndxbook/overview', () => {
    const page = listProjectPageRecords('ndxbook')[0]!;
    const identity = resolveRuntimeRouteForPage({
      ...page,
      screenId: 'legacy_overview_alias_only',
      route: '/OVERVIEW',
      normalizedRoute: '/overview',
      representativeRoute: null,
      routeSource: '/projects/:projectSlug/overview',
    });
    expect(identity.resolvedRuntimePath).toBe('/projects/ndxbook/overview');
    expect(identity.routeValid).toBe(true);
  });

  it('6. unresolved route fails closed', () => {
    const page = listProjectPageRecords('ndxbook')[0]!;
    const identity = resolveRuntimeRouteForPage({
      ...page,
      route: '/UNKNOWN-PAGE-XYZ-404',
      normalizedRoute: '/unknown-page-xyz-404',
      representativeRoute: null,
      routeSource: null,
      screenId: 'nonexistent_screen_xyz_404',
    });
    expect(identity.resolvedRuntimePath).toBeNull();
    expect(identity.routeValid).toBe(false);
  });

  it('7. preflight before run creation', () => {
    const preflight = buildCaptureRunPreflight('ndxbook');
    expect(preflight.inventoryCount).toBeGreaterThan(0);
    expect(preflight.eligibleCount).toBeGreaterThan(0);
    expect(preflight.resolvedUrlCount).toBeGreaterThan(0);
    expect(preflight.ready).toBe(true);
  });

  it('8. server-side runId format', () => {
    const id = generateCaptureRunId('ndxbook');
    expect(id).toMatch(/^capture_ndxbook_/);
  });

  it('9. valid contract after materialization', async () => {
    const run = await refreshProjectCaptureState('ndxbook', { executeWorker: false, forceNewRun: true });
    expect(run.contractValid).toBe(true);
    expect(run.runId).toMatch(/^capture_/);
    expect(run.status).toMatch(/QUEUING|CAPTURING/);
    expect(run.totalTargets).toBeGreaterThan(0);
    expect(run.contractReceipt?.contractValid.valid).toBe(true);
  });

  it('10. malformed run missing runId invalid receipt', () => {
    const contract = normalizeProjectCaptureRunResponse({
      contractVersion: CAPTURE_RUN_CONTRACT_VERSION,
      projectId: 'ndxbook',
      status: 'QUEUING',
      totalTargets: 46,
      queuedCount: 46,
      capturingCount: 0,
      completedCount: 0,
      failedCount: 0,
      skippedCount: 0,
      workerStatus: 'HEALTHY',
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    expect(contract.contractValid).toBe(false);
    expect(contract.contractReceipt?.errors).toContain('RUN_ID_MISSING');
  });

  it('11. retry creates new run id', async () => {
    const first = await refreshProjectCaptureState('ndxbook', { executeWorker: false, forceNewRun: true });
    const second = await refreshProjectCaptureState('ndxbook', { executeWorker: false, forceNewRun: true });
    expect(second.runId).not.toBe(first.runId);
  });

  it('12. first capture promotes CURRENT', async () => {
    const run = await refreshProjectCaptureState('ndxbook', { executeWorker: false, forceNewRun: true });
    await dispatchCaptureWorker({ projectId: 'ndxbook', runId: run.runId, captureFn: mockCaptureFn(), concurrency: 1 });
    const summary = buildProjectCaptureStateSummary(listProjectPageRecords('ndxbook'));
    expect(summary.current).toBeGreaterThan(0);
  });

  it('13. build v260', () => {
    expect(P0_VR_8R3R2_BUILD).toBe('v260');
  });

  it('14. API returns captureSummary', () => {
    expect(read('api/site00/page-mirror.ts')).toContain('captureSummary');
  });

  it('15. UI compact error panel', () => {
    expect(read('src/site00/components/designWorkspace/DesignPagesTabPanel.tsx')).toContain('VIEW ISSUES');
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr8r3/projectCaptureRunContract.ts')).toContain(
      'RUN_CONTRACT_INVALID',
    );
  });

  it('16. legacy normalizeRecoveredCaptureStatuses alias', () => {
    const page = listProjectPageRecords('ndxbook')[0]!;
    upsertProjectPageRecord({ ...page, status: 'STALE', lastCapturedAt: null });
    normalizeRecoveredCaptureStatuses('ndxbook');
    expect(derivePageCaptureStatus(getProjectPageRecord('ndxbook', page.pageId)!)).toBe('NEVER_CAPTURED');
  });

  it('17. progress after worker dispatch', async () => {
    const run = await refreshProjectCaptureState('ndxbook', { executeWorker: false, forceNewRun: true });
    await dispatchCaptureWorker({ projectId: 'ndxbook', runId: run.runId, captureFn: mockCaptureFn(), concurrency: 2 });
    const progress = getProjectCaptureRefreshProgress('ndxbook');
    expect(progress?.completedCount).toBeGreaterThan(0);
  });
});
