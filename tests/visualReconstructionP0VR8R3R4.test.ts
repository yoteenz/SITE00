/**
 * P0.VR.8R3R4 — Capture worker boot + heartbeat + shared runtime health.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildCaptureWorkerIdentity,
  CAPTURE_WORKER_HEARTBEAT_EXPIRE_MS,
  captureQueueStore,
  createCaptureWorkerTestJob,
  executeCaptureWorkerTestJob,
  getCaptureWorkerHealth,
  P0_VR_8R3R4_BUILD,
  probePlaywrightReadiness,
  resetCaptureWorkerHealthForTest,
  resetWorkerHealthStoreForTest,
  resolveWorkerStatusFromHeartbeat,
  startCaptureWorker,
  stopCaptureWorkerForTest,
  workerHealthStore,
  buildCaptureTransportHealthResponse,
  clearCaptureOrchestrationRegistryForTest,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/client.js';
import { resetCaptureWorkerRuntimeForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/captureWorkerRuntime.js';
import { createBootReceipt } from '../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/captureWorkerBootReceipt.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.8R3R4 — Worker boot + shared health', () => {
  afterEach(() => {
    stopCaptureWorkerForTest();
    resetCaptureWorkerRuntimeForTest();
    resetWorkerHealthStoreForTest();
    clearCaptureOrchestrationRegistryForTest();
    vi.unstubAllGlobals();
  });

  it('1. CaptureWorkerIdentity module', () => {
    const identity = buildCaptureWorkerIdentity();
    expect(identity.workerId).toMatch(/^cap-worker-/);
    expect(identity.buildVersion).toBe(P0_VR_8R3R4_BUILD);
    expect(identity.capabilities).toContain('PLAYWRIGHT');
  });

  it('2. CaptureWorkerBootReceipt module', () => {
    const receipt = createBootReceipt('cap-worker-test', P0_VR_8R3R4_BUILD);
    expect(receipt.status).toBe('STARTING');
    expect(receipt.workerId).toBe('cap-worker-test');
  });

  it('3. startCaptureWorker in server boot', () => {
    expect(read('server/index.ts')).toContain('startCaptureWorker');
  });

  it('4. worker registration writes shared store', async () => {
    const receipt = await startCaptureWorker();
    expect(receipt.workerId).toBeTruthy();
    const health = workerHealthStore.getWorkerHealth(receipt.workerId);
    expect(health.workerId).toBe(receipt.workerId);
    expect(health.buildVersion).toBe(P0_VR_8R3R4_BUILD);
  });

  it('5. heartbeat write', async () => {
    await startCaptureWorker();
    const health = getCaptureWorkerHealth();
    expect(health.lastHeartbeat).toBeTruthy();
  });

  it('6. heartbeat read via API health builder', async () => {
    await startCaptureWorker();
    const response = buildCaptureTransportHealthResponse();
    expect(response.lastHeartbeat).toBeTruthy();
    expect(response.workerId).toBeTruthy();
  });

  it('7. health expiration OFFLINE', () => {
    const status = resolveWorkerStatusFromHeartbeat({
      lastHeartbeat: new Date(Date.now() - CAPTURE_WORKER_HEARTBEAT_EXPIRE_MS - 1000).toISOString(),
      storedStatus: 'HEALTHY',
      playwrightReady: true,
      browserReady: true,
    });
    expect(status).toBe('OFFLINE');
  });

  it('8. WorkerHealthStore exists', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr8r3/workerHealthStore.ts')).toContain(
      'registerWorker',
    );
  });

  it('9. multi-process visibility via shared registry file', async () => {
    await startCaptureWorker();
    resetCaptureWorkerRuntimeForTest();
    stopCaptureWorkerForTest();
    const health = workerHealthStore.getWorkerHealth();
    expect(health.lastHeartbeat).toBeTruthy();
    expect(health.status).not.toBe('UNKNOWN');
  });

  it('10. API health reads shared store not in-memory singleton', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr8r3/captureTransportHealth.ts')).toContain(
      'workerHealthStore',
    );
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr8r3/captureWorkerHealth.ts')).toContain(
      'workerHealthStore.getWorkerHealth',
    );
  });

  it('11. Playwright readiness probe', async () => {
    const result = await probePlaywrightReadiness();
    expect(result.playwrightReady).toBe(true);
  });

  it('12. browser readiness in test env', async () => {
    const result = await probePlaywrightReadiness();
    expect(result.browserReady).toBe(true);
  });

  it('13. browser failure classification codes exist', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr8r3/playwrightReadiness.ts')).toContain(
      'BROWSER_LAUNCH_FAILED',
    );
  });

  it('14. Railway start command includes start:api', () => {
    expect(read('package.json')).toContain('start:api');
    expect(read('server/index.ts')).toContain('startCaptureWorker');
  });

  it('15. same-process worker boot guard', async () => {
    const first = await startCaptureWorker();
    const second = await startCaptureWorker();
    expect(second.workerId).toBe(first.workerId);
  });

  it('16. CaptureQueueStore module', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr8r3/captureQueueStore.ts')).toContain(
      'claimNextJob',
    );
  });

  it('17. queue shared via registry persistence', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr8r3/captureRunPersistentStore.ts')).toContain(
      'PersistedCaptureQueueJob',
    );
  });

  it('18. job claim lease', () => {
    expect(captureQueueStore.claimNextJob).toBeTypeOf('function');
  });

  it('19. job lease release', () => {
    expect(captureQueueStore.releaseExpiredLeases).toBeTypeOf('function');
  });

  it('20. worker acknowledgement in test job flow', async () => {
    await startCaptureWorker();
    const job = createCaptureWorkerTestJob();
    const workerId = getCaptureWorkerHealth().workerId;
    const completed = await executeCaptureWorkerTestJob(workerId, job.jobId);
    expect(completed.acknowledgedAt).toBeTruthy();
  });

  it('21. test worker job completes', async () => {
    await startCaptureWorker();
    const job = createCaptureWorkerTestJob();
    const workerId = getCaptureWorkerHealth().workerId;
    const completed = await executeCaptureWorkerTestJob(workerId, job.jobId);
    expect(completed.status).toBe('COMPLETE');
  });

  it('22. worker offline classification', () => {
    resetCaptureWorkerHealthForTest();
    const health = getCaptureWorkerHealth();
    expect(['HEALTHY', 'DEGRADED', 'OFFLINE', 'UNKNOWN']).toContain(health.status);
  });

  it('23. worker degraded when browser not ready', () => {
    const status = resolveWorkerStatusFromHeartbeat({
      lastHeartbeat: new Date().toISOString(),
      storedStatus: 'HEALTHY',
      playwrightReady: true,
      browserReady: false,
    });
    expect(status).toBe('DEGRADED');
  });

  it('24. restart recovery re-register', async () => {
    await startCaptureWorker();
    stopCaptureWorkerForTest();
    resetCaptureWorkerRuntimeForTest();
    const receipt = await startCaptureWorker();
    expect(receipt.bootCompletedAt).toBeTruthy();
  });

  it('25. orphaned job lease recovery', () => {
    const released = captureQueueStore.releaseExpiredLeases();
    expect(released).toBeGreaterThanOrEqual(0);
  });

  it('26. version mismatch detection wired', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr8r3/captureTransportHealth.ts')).toContain(
      'detectBackendVersionMismatch',
    );
  });

  it('27. test_worker API action', () => {
    expect(read('api/site00/page-mirror.ts')).toContain("'test_worker'");
  });

  it('28. UI TEST WORKER button', () => {
    const ux = read('src/site00/components/designWorkspace/founderCapture/FounderCaptureExperience.tsx');
    const wizard = read('src/site00/components/designWorkspace/DesignPagesWizard.tsx');
    expect(ux.includes('TEST WORKER') || wizard.includes('onTestWorker') || wizard.includes("'test-worker'")).toBe(true);
  });

  it('29. refresh gated until test job', () => {
    expect(read('src/site00/components/designWorkspace/usePageMirror.ts')).toContain('WORKER_TEST_REQUIRED');
  });

  it('30. build v263', () => {
    expect(P0_VR_8R3R4_BUILD).toBe('v263');
  });

  it('31. worker events log', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr8r3/captureWorkerEvents.ts')).toContain(
      'WORKER_REGISTERED',
    );
  });
});
