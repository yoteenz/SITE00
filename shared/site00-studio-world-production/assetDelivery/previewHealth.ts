/**
 * P0.VR.CAPTURE.1R3 — Preview health + renderable authority contract.
 */

import type { ImageDeliveryErrorCode } from './constants.js';
import { resolveAssetRenderableUrl } from './assetRenderableUrlResolver.js';
import type { PreviewHealth, RenderableAuthorityContract } from './types.js';

export function derivePreviewHealthFromBrowser(input: {
  ref: string | null | undefined;
  urlResolved?: boolean;
  browserLoaded?: boolean;
  browserError?: boolean;
  httpStatus?: number | null;
  mime?: string | null;
}): PreviewHealth {
  const resolved = resolveAssetRenderableUrl(input.ref ?? null);
  const urlResolved = input.urlResolved ?? Boolean(resolved.url && resolved.status === 'RESOLVED');

  let errorCode: ImageDeliveryErrorCode | null = resolved.errorCode;
  if (input.browserError) errorCode = errorCode ?? 'IMAGE_DECODE_FAILED';
  if (!urlResolved) errorCode = errorCode ?? 'ASSET_REF_MISSING';

  const browserLoaded = Boolean(input.browserLoaded);
  const requestSucceeded = input.httpStatus == null ? browserLoaded : input.httpStatus >= 200 && input.httpStatus < 300;
  const mimeValid = input.mime ? input.mime.startsWith('image/') : browserLoaded;

  const pass =
    urlResolved &&
    browserLoaded &&
    !input.browserError &&
    (input.httpStatus == null || requestSucceeded) &&
    mimeValid;

  return {
    assetExists: urlResolved,
    urlResolved,
    requestSucceeded,
    mimeValid,
    browserLoaded,
    status: pass ? 'PASS' : browserLoaded || input.browserError ? 'FAIL' : 'UNKNOWN',
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
}): RenderableAuthorityContract {
  const designOk = input.designAuthorityPreview.status === 'PASS';
  const liveOk = input.liveCapturePreview.status === 'PASS';
  const pageOk = input.pageIdentityMatch !== false;
  const routeOk = input.routeMatch !== false;
  const viewportOk = input.viewportMatch !== false;

  let blockReason: string | null = null;
  if (!designOk) blockReason = 'DESIGN AUTHORITY PREVIEW REQUIRED';
  else if (!liveOk) blockReason = 'LIVE CAPTURE PREVIEW REQUIRED';
  else if (!pageOk) blockReason = 'CAPTURED PAGE DOES NOT MATCH TARGET';
  else if (!routeOk) blockReason = 'LIVE CAPTURE ROUTE MISMATCH';
  else if (!viewportOk) blockReason = 'LIVE CAPTURE VIEWPORT MISMATCH';
  else if (input.captureStatus === 'SAVED' || input.captureStatus === 'VERIFYING_PREVIEW') {
    blockReason = 'LIVE CAPTURE PREVIEW REQUIRED';
  } else if (input.captureStatus === 'PAGE_MISMATCH') {
    blockReason = 'CAPTURED PAGE DOES NOT MATCH TARGET';
  } else if (input.captureStatus !== 'READY') {
    blockReason = 'LIVE CAPTURE PREVIEW REQUIRED';
  }

  return {
    approvalStatus: input.approvalStatus,
    captureStatus: input.captureStatus,
    previewHealth: input.liveCapturePreview,
    upgradeAllowed: designOk && liveOk && pageOk && routeOk && viewportOk && input.captureStatus === 'READY',
    blockReason,
  };
}

export function previewHealthLabel(health: PreviewHealth): string {
  if (health.status === 'PASS') return 'PREVIEW READY ✓';
  if (health.status === 'FAIL') return 'PREVIEW UNAVAILABLE';
  return 'PREVIEW CHECKING…';
}
