/**
 * P0.VR.AUTH.1 — Preview health + renderable authority contract.
 */

import type { ImageDeliveryErrorCode } from './constants.js';
import { resolveAssetRenderableUrl } from './assetRenderableUrlResolver.js';
import type { PreviewHealth, PreviewHealthLifecycleState, RenderableAuthorityContract } from './types.js';
import {
  designAuthorityBlockReasonFromLifecycle,
  liveCaptureBlockReasonFromLifecycle,
  mapLifecycleToPreviewHealthStatus,
} from './previewHealthLifecycle.js';

export function derivePreviewHealthFromBrowser(input: {
  ref: string | null | undefined;
  urlResolved?: boolean;
  browserLoaded?: boolean;
  browserError?: boolean;
  httpStatus?: number | null;
  mime?: string | null;
  lifecycle?: PreviewHealthLifecycleState;
}): PreviewHealth {
  const resolved = resolveAssetRenderableUrl(input.ref ?? null);
  const urlResolved = input.urlResolved ?? Boolean(resolved.url && resolved.status === 'RESOLVED');
  const lifecycle = input.lifecycle ?? 'IDLE';

  let errorCode: ImageDeliveryErrorCode | null = resolved.errorCode;
  if (input.browserError || lifecycle === 'FAIL') errorCode = errorCode ?? 'IMAGE_DECODE_FAILED';
  if (lifecycle === 'TIMEOUT') errorCode = errorCode ?? 'IMAGE_DECODE_FAILED';
  if (!urlResolved) errorCode = errorCode ?? 'ASSET_REF_MISSING';

  const browserLoaded = lifecycle === 'PASS' || Boolean(input.browserLoaded);
  const requestSucceeded = input.httpStatus == null ? browserLoaded : input.httpStatus >= 200 && input.httpStatus < 300;
  const mimeValid = input.mime ? input.mime.startsWith('image/') : browserLoaded;

  let status: PreviewHealth['status'];
  if (lifecycle === 'PASS') status = 'PASS';
  else if (lifecycle === 'FAIL' || lifecycle === 'TIMEOUT') status = 'FAIL';
  else if (lifecycle === 'LOADING') status = 'UNKNOWN';
  else if (input.browserError) status = 'FAIL';
  else if (browserLoaded) status = 'PASS';
  else status = mapLifecycleToPreviewHealthStatus(lifecycle);

  const pass =
    status === 'PASS' &&
    urlResolved &&
    browserLoaded &&
    !input.browserError &&
    lifecycle !== 'TIMEOUT' &&
    (input.httpStatus == null || requestSucceeded) &&
    mimeValid;

  return {
    assetExists: urlResolved,
    urlResolved,
    requestSucceeded,
    mimeValid,
    browserLoaded,
    status: pass ? 'PASS' : status,
    lifecycle,
    errorCode: pass ? null : errorCode,
    resolvedUrl: resolved.url,
  };
}

export function evaluateRenderableAuthorityContract(input: {
  approvalStatus: string;
  captureStatus: string | null;
  designAuthorityPreview: PreviewHealth;
  liveCapturePreview: PreviewHealth;
  pageIdentityMatch?: boolean;
  routeMatch?: boolean;
  viewportMatch?: boolean;
  designAuthorityMissing?: boolean;
}): RenderableAuthorityContract {
  const designOk = input.designAuthorityPreview.status === 'PASS';
  const liveOk = input.liveCapturePreview.status === 'PASS';
  const designUrlReady = input.designAuthorityPreview.urlResolved;
  const liveUrlReady = input.liveCapturePreview.urlResolved;
  const pageOk = input.pageIdentityMatch !== false;
  const routeOk = input.routeMatch !== false;
  const viewportOk = input.viewportMatch !== false;

  let blockReason: string | null = null;
  if (input.designAuthorityMissing) {
    blockReason = 'DESIGN AUTHORITY MISSING';
  } else if (!designOk) {
    blockReason =
      designAuthorityBlockReasonFromLifecycle(input.designAuthorityPreview.lifecycle) ??
      'DESIGN AUTHORITY PREVIEW REQUIRED';
  } else if (!liveOk) {
    blockReason =
      liveCaptureBlockReasonFromLifecycle(input.liveCapturePreview.lifecycle) ??
      'LIVE CAPTURE PREVIEW REQUIRED';
  } else if (!pageOk) {
    blockReason = 'CAPTURED PAGE DOES NOT MATCH TARGET';
  } else if (!routeOk) {
    blockReason = 'LIVE CAPTURE ROUTE MISMATCH';
  } else if (!viewportOk) {
    blockReason = 'LIVE CAPTURE VIEWPORT MISMATCH';
  } else if (input.captureStatus === 'SAVED' || input.captureStatus === 'VERIFYING_PREVIEW') {
    blockReason = 'LIVE CAPTURE PREVIEW REQUIRED';
  } else if (input.captureStatus === 'PAGE_MISMATCH') {
    blockReason = 'CAPTURED PAGE DOES NOT MATCH TARGET';
  } else if (input.captureStatus !== 'READY' && input.captureStatus !== 'OUTDATED') {
    blockReason = 'LIVE CAPTURE PREVIEW REQUIRED';
  }

  const captureReadyForUpgrade =
    input.captureStatus === 'READY' ||
    input.captureStatus === 'OUTDATED' ||
    input.captureStatus === 'SAVED' ||
    input.captureStatus === 'VERIFYING_PREVIEW';

  const previewVerified = designOk && liveOk;
  const previewDegraded =
    !previewVerified &&
    designUrlReady &&
    liveUrlReady &&
    input.designAuthorityPreview.status !== 'FAIL' &&
    input.liveCapturePreview.status !== 'FAIL';

  const upgradeAllowed =
    pageOk &&
    routeOk &&
    viewportOk &&
    captureReadyForUpgrade &&
    !input.designAuthorityMissing &&
    (previewVerified || previewDegraded);

  if (previewDegraded && !previewVerified && !blockReason) {
    blockReason = 'PREVIEW SLOW — UPGRADE ALLOWED WITH CAUTION';
  }

  return {
    approvalStatus: input.approvalStatus,
    captureStatus: input.captureStatus,
    previewHealth: input.liveCapturePreview,
    upgradeAllowed,
    blockReason,
  };
}

export function previewHealthLabel(health: PreviewHealth): string {
  if (health.lifecycle === 'TIMEOUT') return 'PREVIEW TOOK TOO LONG';
  if (health.lifecycle === 'LOADING') return 'PREVIEW CHECKING…';
  if (health.status === 'PASS') return 'PREVIEW READY ✓';
  if (health.status === 'FAIL') return 'PREVIEW UNAVAILABLE';
  if (health.lifecycle === 'IDLE') return 'PREVIEW UNAVAILABLE';
  return 'PREVIEW CHECKING…';
}
