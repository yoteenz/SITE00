/**
 * P0.VR.CAPTURE.1R3 — HTTP delivery probe + trace builder.
 */

import { VALID_IMAGE_MIME_PREFIXES } from './constants.js';
import type { ImageDeliveryErrorCode } from './constants.js';
import { normalizeLegacyAssetRef, maskSignedUrlForDisplay } from './canonicalAssetRef.js';
import { resolveAssetRenderableUrl } from './assetRenderableUrlResolver.js';
import type {
  AssetDeliveryProbeResult,
  CanonicalAssetRef,
  ImageDeliveryTrace,
  RenderableAssetUrl,
} from './types.js';

export function classifyHttpDeliveryError(status: number): ImageDeliveryErrorCode {
  if (status === 401) return 'HTTP_401';
  if (status === 403) return 'HTTP_403';
  if (status === 404) return 'HTTP_404';
  if (status >= 500) return 'HTTP_5XX';
  return 'UNKNOWN_IMAGE_DELIVERY_ERROR';
}

export function isValidImageMime(mime: string | null | undefined): boolean {
  if (!mime?.trim()) return false;
  const normalized = mime.split(';')[0]?.trim().toLowerCase() ?? '';
  return VALID_IMAGE_MIME_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

export function evaluateDeliveryProbe(input: {
  httpStatus: number | null;
  mime: string | null;
  size?: number | null;
  urlResolved?: boolean;
}): AssetDeliveryProbeResult {
  if (!input.urlResolved) {
    return { exists: false, httpStatus: null, mime: null, size: null, renderable: false, error: 'ASSET_REF_MISSING' };
  }
  if (input.httpStatus == null) {
    return { exists: false, httpStatus: null, mime: input.mime, size: input.size ?? null, renderable: false, error: 'UNKNOWN_IMAGE_DELIVERY_ERROR' };
  }
  if (input.httpStatus < 200 || input.httpStatus >= 300) {
    return {
      exists: false,
      httpStatus: input.httpStatus,
      mime: input.mime,
      size: input.size ?? null,
      renderable: false,
      error: classifyHttpDeliveryError(input.httpStatus),
    };
  }
  if (input.size === 0) {
    return {
      exists: true,
      httpStatus: input.httpStatus,
      mime: input.mime,
      size: 0,
      renderable: false,
      error: 'ARTIFACT_EMPTY',
    };
  }
  if (!isValidImageMime(input.mime)) {
    return {
      exists: true,
      httpStatus: input.httpStatus,
      mime: input.mime,
      size: input.size ?? null,
      renderable: false,
      error: 'MIME_INVALID',
    };
  }
  return {
    exists: true,
    httpStatus: input.httpStatus,
    mime: input.mime,
    size: input.size ?? null,
    renderable: true,
    error: null,
  };
}

export async function probeAssetDelivery(
  ref: string | CanonicalAssetRef,
  fetchImpl: typeof fetch = globalThis.fetch,
): Promise<AssetDeliveryProbeResult> {
  const resolved = resolveAssetRenderableUrl(ref);
  if (!resolved.url || resolved.status !== 'RESOLVED') {
    return evaluateDeliveryProbe({ httpStatus: null, mime: null, urlResolved: false });
  }

  try {
    const response = await fetchImpl(resolved.url, { method: 'HEAD' });
    const mime = response.headers.get('content-type');
    const lengthHeader = response.headers.get('content-length');
    const size = lengthHeader ? Number(lengthHeader) : null;
    return evaluateDeliveryProbe({
      httpStatus: response.status,
      mime,
      size: Number.isFinite(size) ? size : null,
      urlResolved: true,
    });
  } catch {
    return {
      exists: false,
      httpStatus: null,
      mime: null,
      size: null,
      renderable: false,
      error: 'CORS_BLOCKED',
    };
  }
}

export function buildImageDeliveryTrace(input: {
  sourceType: string;
  sourceId: string;
  ref: string | CanonicalAssetRef | null | undefined;
  projectId?: string | null;
  pageId?: string | null;
  viewport?: string | null;
  probe?: AssetDeliveryProbeResult;
  browserLoaded?: boolean;
}): ImageDeliveryTrace {
  const canonicalRef =
    typeof input.ref === 'string' || input.ref == null
      ? normalizeLegacyAssetRef(input.ref ?? null)
      : input.ref;
  const resolved: RenderableAssetUrl = resolveAssetRenderableUrl(canonicalRef);
  const probe = input.probe ?? evaluateDeliveryProbe({ httpStatus: null, mime: null, urlResolved: Boolean(resolved.url) });

  let renderStatus: ImageDeliveryTrace['renderStatus'] = 'UNKNOWN';
  if (input.browserLoaded) renderStatus = 'RENDERABLE';
  else if (probe.renderable) renderStatus = 'RENDERABLE';
  else if (probe.error) renderStatus = 'NOT_RENDERABLE';

  return {
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    projectId: input.projectId ?? null,
    pageId: input.pageId ?? null,
    viewport: input.viewport ?? null,
    canonicalRef: canonicalRef ?? {
      provider: 'NONE',
      bucket: null,
      objectPath: null,
      assetId: null,
      visibility: 'PUBLIC',
      mimeType: null,
      version: 'canonical',
      checksum: null,
      assetRefVersion: 'v2',
    },
    storageProvider: canonicalRef?.provider ?? 'NONE',
    storageObjectPath: canonicalRef?.objectPath ?? null,
    resolvedUrl: resolved.url ? maskSignedUrlForDisplay(resolved.url) : null,
    httpStatus: probe.httpStatus,
    contentType: probe.mime,
    contentLength: probe.size,
    corsStatus: probe.error === 'CORS_BLOCKED' ? 'BLOCKED' : 'UNKNOWN',
    authMode: resolved.authMode,
    expiresAt: resolved.expiresAt,
    renderStatus,
    errorCode: probe.error ?? resolved.errorCode,
    errorMessage: probe.error ?? resolved.errorCode,
    resolvedBrowserImageUrl: resolved.url,
  };
}
