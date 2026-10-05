/**
 * P0.VR.8R3R4 — Server-side capture transport health (reads shared WorkerHealthStore).
 */

import { getCaptureWorkerHealth } from './captureWorkerHealth.js';
import { buildCaptureVersionReceipt } from './buildVersionReceipt.js';
import { CAPTURE_RUN_CONTRACT_VERSION } from './projectCaptureRunContract.js';
import { workerHealthStore } from './workerHealthStore.js';
import { detectBackendVersionMismatch } from './buildVersionReceipt.js';
import { loadCaptureOrchestrationRegistry } from './captureRunPersistentStore.js';
import type { CaptureTransportHealthResponse } from './captureTransportReceipt.js';

export function buildCaptureTransportHealthResponse(repoRoot?: string): CaptureTransportHealthResponse {
  const worker = getCaptureWorkerHealth(repoRoot);
  const receipt = buildCaptureVersionReceipt();
  const versionMismatch = detectBackendVersionMismatch(receipt, receipt.apiBuild);
  const browserBoot = workerHealthStore.getBrowserBootReceipt(repoRoot);
  const registry = loadCaptureOrchestrationRegistry(repoRoot);

  const captureServiceReady =
    worker.status === 'HEALTHY' &&
    Boolean(worker.lastHeartbeat) &&
    worker.playwrightReady === true &&
    worker.browserReady === true &&
    !versionMismatch;

  return {
    apiBuild: receipt.apiBuild,
    workerBuild: worker.buildVersion || receipt.workerBuild,
    contractVersion: CAPTURE_RUN_CONTRACT_VERSION,
    workerStatus: worker.status,
    serverTime: new Date().toISOString(),
    captureServiceReady,
    gitSha: receipt.gitSha,
    lastHeartbeat: worker.lastHeartbeat,
    lastAcceptedJobAt: worker.lastAcceptedJobAt,
    workerId: worker.workerId,
    heartbeatAgeMs: worker.heartbeatAgeMs ?? null,
    playwrightReady: worker.playwrightReady ?? false,
    browserReady: worker.browserReady ?? false,
    activeJobCount: worker.activeJobCount,
    queueDepth: worker.queueDepth,
    lastError: worker.lastError,
    testJobPassed: workerHealthStore.hasSuccessfulTestJob(repoRoot),
    versionMismatch: versionMismatch ?? null,
    browserBootErrorCode: browserBoot?.errorCode ?? null,
    chromiumRevision: browserBoot?.chromiumRevision ?? null,
    chromiumExecutablePath: browserBoot?.executablePath ?? null,
    missingLibraries: browserBoot?.missingLibraries ?? [],
    deploymentStrategy: browserBoot?.deploymentStrategy ?? null,
    systemDependenciesReady: browserBoot ? browserBoot.missingLibraries.length === 0 : false,
    testScreenshotPath: registry.lastTestScreenshot?.path ?? null,
  };
}
