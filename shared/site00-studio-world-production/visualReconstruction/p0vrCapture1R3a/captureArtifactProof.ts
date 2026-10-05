/**
 * P0.VR.CAPTURE.1R3A — Hard capture artifact proof chain.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import { resolveAssetRenderableUrl } from '../../assetDelivery/assetRenderableUrlResolver.js';
import { evaluateDeliveryProbe } from '../../assetDelivery/assetDeliveryProbe.js';
import type { CaptureNavigationReceipt } from './captureNavigationReceipt.js';
import type { CapturedPageIdentityCheck } from './capturedPageIdentityCheck.js';

export type CaptureArtifactProofStatus =
  | 'VALID'
  | 'ARTIFACT_EMPTY'
  | 'ARTIFACT_INVALID'
  | 'STORAGE_OBJECT_MISSING'
  | 'PAGE_MISMATCH'
  | 'DELIVERY_FAILED'
  | 'UNKNOWN';

export type CaptureArtifactProof = {
  jobId: string;
  captureId: string;
  projectId: string;
  pageId: string;
  viewport: DesignViewportClass;
  route: string;
  screenshotCreated: boolean;
  byteSize: number | null;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  checksum: string | null;
  storageObjectExists: boolean;
  storageRef: string | null;
  resolvedUrl: string | null;
  httpStatus: number | null;
  browserLoaded: boolean;
  status: CaptureArtifactProofStatus;
  errorCode: string | null;
  navigation: CaptureNavigationReceipt | null;
  pageIdentity: CapturedPageIdentityCheck | null;
};

export function buildCaptureArtifactProof(input: {
  jobId: string;
  captureId: string;
  projectId: string;
  pageId: string;
  viewport: DesignViewportClass;
  route: string;
  screenshotUrl: string | null;
  byteSize?: number | null;
  mimeType?: string | null;
  width?: number | null;
  height?: number | null;
  checksum?: string | null;
  storagePath?: string | null;
  httpStatus?: number | null;
  browserLoaded?: boolean;
  navigation?: CaptureNavigationReceipt | null;
  pageIdentity?: CapturedPageIdentityCheck | null;
}): CaptureArtifactProof {
  const resolved = input.screenshotUrl ? resolveAssetRenderableUrl(input.screenshotUrl) : null;
  const resolvedUrl = resolved?.url ?? null;
  const byteSize = input.byteSize ?? null;

  if (input.pageIdentity && !input.pageIdentity.match) {
    return baseProof(input, resolvedUrl, {
      status: 'PAGE_MISMATCH',
      errorCode: input.pageIdentity.errorCode ?? 'CAPTURE_PAGE_MISMATCH',
      screenshotCreated: Boolean(input.screenshotUrl),
      storageObjectExists: Boolean(input.storagePath || input.screenshotUrl),
    });
  }

  if (!input.screenshotUrl || !resolvedUrl) {
    return baseProof(input, null, {
      status: 'STORAGE_OBJECT_MISSING',
      errorCode: 'STORAGE_OBJECT_MISSING',
      screenshotCreated: false,
      storageObjectExists: false,
    });
  }

  if (byteSize === 0) {
    return baseProof(input, resolvedUrl, {
      status: 'ARTIFACT_EMPTY',
      errorCode: 'ARTIFACT_EMPTY',
      screenshotCreated: true,
      storageObjectExists: false,
    });
  }

  const delivery = evaluateDeliveryProbe({
    httpStatus: input.httpStatus ?? 200,
    mime: input.mimeType ?? 'image/webp',
    size: byteSize,
    urlResolved: true,
  });

  if (!delivery.renderable && byteSize != null && byteSize > 0) {
    return baseProof(input, resolvedUrl, {
      status: 'DELIVERY_FAILED',
      errorCode: delivery.error ?? 'MIME_INVALID',
      screenshotCreated: true,
      storageObjectExists: true,
    });
  }

  return baseProof(input, resolvedUrl, {
    status: byteSize == null || byteSize > 0 ? 'VALID' : 'ARTIFACT_INVALID',
    errorCode: null,
    screenshotCreated: true,
    storageObjectExists: true,
  });
}

function baseProof(
  input: Parameters<typeof buildCaptureArtifactProof>[0],
  resolvedUrl: string | null,
  extra: Pick<CaptureArtifactProof, 'status' | 'errorCode' | 'screenshotCreated' | 'storageObjectExists'>,
): CaptureArtifactProof {
  return {
    jobId: input.jobId,
    captureId: input.captureId,
    projectId: input.projectId,
    pageId: input.pageId,
    viewport: input.viewport,
    route: input.route,
    screenshotCreated: extra.screenshotCreated,
    byteSize: input.byteSize ?? null,
    mimeType: input.mimeType ?? null,
    width: input.width ?? null,
    height: input.height ?? null,
    checksum: input.checksum ?? null,
    storageObjectExists: extra.storageObjectExists,
    storageRef: input.storagePath ?? input.screenshotUrl,
    resolvedUrl,
    httpStatus: input.httpStatus ?? null,
    browserLoaded: Boolean(input.browserLoaded),
    status: extra.status,
    errorCode: extra.errorCode,
    navigation: input.navigation ?? null,
    pageIdentity: input.pageIdentity ?? null,
  };
}

export function captureArtifactProofAllowsReady(proof: CaptureArtifactProof): boolean {
  return proof.status === 'VALID' && Boolean(proof.resolvedUrl) && proof.pageIdentity?.match !== false;
}
