/**
 * P0.VR.8R3R3 — Frontend capture transport health preflight.
 */

import { P0_VR_8R3R3_BUILD } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/constants.js';
import { CAPTURE_RUN_CONTRACT_VERSION } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/projectCaptureRunContract.js';
import {
  deriveTransportHealthStatus,
} from '../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/classifyCaptureTransportError.js';
import type {
  CaptureTransportHealth,
  CaptureTransportHealthResponse,
  CaptureTransportReceipt,
  CaptureTransportErrorCode,
} from '../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/captureTransportReceipt.js';
import { detectBackendVersionMismatch } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/buildVersionReceipt.browser.js';
import { resolveSite00ApiBase, site00ApiUrl } from '../../utils/site00ApiBase';
import { getAccessToken } from '../../utils/api';
import { captureApiFetch, detectInvalidApiBaseUrl, PAGE_MIRROR_PATH } from './captureApiFetch';

export type CaptureTransportCheckResult = {
  health: CaptureTransportHealth;
  receipt: CaptureTransportReceipt;
};

function healthEndpoint(projectId: string): string {
  return `${PAGE_MIRROR_PATH}?projectId=${encodeURIComponent(projectId)}&view=health`;
}

export async function checkCaptureTransportHealth(projectId: string): Promise<CaptureTransportCheckResult> {
  const started = Date.now();
  const apiBaseUrl = resolveSite00ApiBase();
  const captureEndpoint = site00ApiUrl(PAGE_MIRROR_PATH);
  const healthUrl = site00ApiUrl(healthEndpoint(projectId));
  const errors: CaptureTransportErrorCode[] = [];

  const baseError = detectInvalidApiBaseUrl();
  if (baseError) errors.push(baseError);

  const token = await getAccessToken();
  const authHeaderPresent = Boolean(token);

  let apiReachable = false;
  let corsAllowed = false;
  let authValid = true;
  let apiBuild: string | null = null;
  let workerBuild: string | null = null;
  let apiGitSha: string | null = null;
  let contractVersion: string | null = null;
  let contractCompatible = false;
  let workerStatus = 'UNKNOWN';
  let receipt: CaptureTransportReceipt = {
    requestUrl: healthUrl,
    method: 'GET',
    origin: typeof window !== 'undefined' ? window.location.origin : null,
    statusCode: null,
    responseReceived: false,
    responseContentType: null,
    corsHeader: null,
    authHeaderPresent,
    requestDurationMs: 0,
    apiBuild: null,
    workerBuild: null,
    contractVersion: null,
    errorCode: null,
    errorMessage: null,
  };

  if (!baseError) {
    const result = await captureApiFetch<CaptureTransportHealthResponse>(healthEndpoint(projectId), {
      authHeaderPresent,
    });
    receipt = result.receipt;
    apiReachable = result.receipt.responseReceived && result.status > 0;
    corsAllowed = Boolean(result.receipt.corsHeader) || apiReachable;
    if (result.errorCode) errors.push(result.errorCode);
    if (result.status === 401 || result.status === 403) {
      authValid = false;
      if (!errors.includes('AUTH_FAILED')) errors.push('AUTH_FAILED');
    }
    if (result.data) {
      apiBuild = result.data.apiBuild;
      workerBuild = result.data.workerBuild;
      apiGitSha = result.data.gitSha;
      contractVersion = result.data.contractVersion;
      contractCompatible = contractVersion === CAPTURE_RUN_CONTRACT_VERSION;
      workerStatus = result.data.workerStatus;
      if (!contractCompatible) errors.push('CONTRACT_VERSION_MISMATCH');
      if (!result.data.captureServiceReady || workerStatus === 'OFFLINE') {
        errors.push('WORKER_UNAVAILABLE');
      }
      const mismatch = detectBackendVersionMismatch(
        {
          frontendBuild: P0_VR_8R3R3_BUILD,
          apiBuild: apiBuild ?? '',
          workerBuild: workerBuild ?? '',
          gitSha: apiGitSha,
          contractVersion: contractVersion ?? '',
        },
        P0_VR_8R3R3_BUILD,
      );
      if (mismatch) errors.push('BACKEND_VERSION_MISMATCH');
    } else if (apiReachable && !result.ok) {
      if (!result.errorCode) errors.push('UNKNOWN_TRANSPORT_ERROR');
    }
  }

  const uniqueErrors = [...new Set(errors)];
  const status = deriveTransportHealthStatus(uniqueErrors);

  const health: CaptureTransportHealth = {
    frontendBuild: P0_VR_8R3R3_BUILD,
    apiBuild,
    workerBuild,
    frontendGitSha: null,
    apiGitSha,
    workerGitSha: apiGitSha,
    apiBaseUrl: apiBaseUrl || captureEndpoint.replace(PAGE_MIRROR_PATH, ''),
    captureEndpoint,
    healthEndpoint: healthUrl,
    apiReachable,
    corsAllowed,
    authValid,
    contractVersion,
    contractCompatible,
    workerStatus,
    latencyMs: Date.now() - started,
    lastCheckedAt: new Date().toISOString(),
    status,
    errors: uniqueErrors,
  };

  return { health, receipt };
}
