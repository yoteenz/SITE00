/**
 * P0.VR.8R3R4 — Capture worker identity.
 */

import { CAPTURE_RUN_CONTRACT_VERSION } from './projectCaptureRunContract.js';
import { P0_VR_8R3R4_BUILD } from './constants.js';

export type CaptureWorkerCapability =
  | 'PLAYWRIGHT'
  | 'MOBILE_CAPTURE'
  | 'DESKTOP_CAPTURE'
  | 'PAGE_MIRROR';

export type CaptureWorkerIdentity = {
  workerId: string;
  serviceId: string;
  instanceId: string;
  buildVersion: string;
  contractVersion: string;
  startedAt: string;
  environment: string;
  capabilities: CaptureWorkerCapability[];
};

export function buildCaptureWorkerIdentity(): CaptureWorkerIdentity {
  const deploymentId = process.env.RAILWAY_DEPLOYMENT_ID ?? process.env.RAILWAY_REPLICA_ID ?? 'local';
  const serviceId = process.env.RAILWAY_SERVICE_ID ?? 'site00-api';
  const instanceId = `${serviceId}-${deploymentId}`;
  return {
    workerId: `cap-worker-${deploymentId}`,
    serviceId,
    instanceId,
    buildVersion: P0_VR_8R3R4_BUILD,
    contractVersion: CAPTURE_RUN_CONTRACT_VERSION,
    startedAt: new Date().toISOString(),
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    capabilities: ['PLAYWRIGHT', 'MOBILE_CAPTURE', 'DESKTOP_CAPTURE', 'PAGE_MIRROR'],
  };
}
