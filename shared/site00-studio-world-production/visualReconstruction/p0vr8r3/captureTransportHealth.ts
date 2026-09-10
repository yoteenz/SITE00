/**
 * P0.VR.8R3R3 — Server-side capture transport health builder.
 */

import { getCaptureWorkerHealth } from './captureWorkerHealth.js';
import { buildCaptureVersionReceipt } from './buildVersionReceipt.js';
import { CAPTURE_RUN_CONTRACT_VERSION } from './projectCaptureRunContract.js';
import type { CaptureTransportHealthResponse } from './captureTransportReceipt.js';

export function buildCaptureTransportHealthResponse(): CaptureTransportHealthResponse {
  const worker = getCaptureWorkerHealth();
  const receipt = buildCaptureVersionReceipt();
  const captureServiceReady = worker.status === 'HEALTHY' || worker.status === 'DEGRADED';

  return {
    apiBuild: receipt.apiBuild,
    workerBuild: receipt.workerBuild,
    contractVersion: CAPTURE_RUN_CONTRACT_VERSION,
    workerStatus: worker.status,
    serverTime: new Date().toISOString(),
    captureServiceReady,
    gitSha: receipt.gitSha,
    lastHeartbeat: worker.lastHeartbeat,
    lastAcceptedJobAt: worker.lastAcceptedJobAt,
  };
}
