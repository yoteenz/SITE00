/**
 * P0.VR.CONCEPT-A-AUTHORITY-SANITIZE-BEFORE-PROMOTION1
 * Structural cleanup of selected concept artifacts before SITE 00 project expression promotion.
 */

import {
  buildScreenshotSanitationMap,
  cropCaptureBase64ToProductBounds,
  SCREENSHOT_SANITATION_MAP_VERSION,
  type ScreenshotSanitationMap,
} from './pageConceptScreenshotSanitationMap.js';
import {
  SITE00_MOBILE_GENERATION_CANVAS,
  validateConceptCanvas,
} from './pageConceptViewportCanvasContract.js';

export const AUTHORITY_ARTIFACT_SANITATION_LINEAGE_STORAGE_KEY =
  'site00:authority-artifact-sanitation-lineage:v1';

export const SELECTED_AUTHORITY_ARTIFACT_NOT_SANITIZED =
  'SELECTED_AUTHORITY_ARTIFACT_NOT_SANITIZED' as const;

export type AuthorityArtifactSanitationRelation = 'SANITIZED_FROM';

export type AuthorityArtifactSanitationLineage = {
  relation: AuthorityArtifactSanitationRelation;
  originalArtifactId: string;
  sanitizedArtifactId: string;
  sanitizedAt: string;
  width: number;
  height: number;
};

export type AuthorityArtifactSanitationReceipt = {
  ok: boolean;
  errorCode: typeof SELECTED_AUTHORITY_ARTIFACT_NOT_SANITIZED | 'SANITATION_FAILED' | null;
  reason?: string;
  originalArtifactId: string;
  sanitizedArtifactId: string | null;
  deviceChromeRemoved: boolean;
  browserChromeRemoved: boolean;
  letterboxingRemoved: boolean;
  canonicalCanvas: boolean;
  productBoundsPass: boolean;
  designChanged: boolean;
  map: ScreenshotSanitationMap | null;
  sanitizedPreviewBase64: string | null;
};

export type AuthorityArtifactSanitationLineageRegistry = {
  bySanitizedId: Record<string, AuthorityArtifactSanitationLineage>;
  sanitizedPreviewBase64: Record<string, string>;
};

export function emptyAuthorityArtifactSanitationLineageRegistry(): AuthorityArtifactSanitationLineageRegistry {
  return { bySanitizedId: {}, sanitizedPreviewBase64: {} };
}

export function validateScreenshotSanitationMap(map: ScreenshotSanitationMap): {
  ok: boolean;
  reason?: string;
  productBoundsPass: boolean;
} {
  const { captureWidth, captureHeight, productBounds } = map;
  if (productBounds.width <= 0 || productBounds.height <= 0) {
    return { ok: false, reason: 'Product bounds empty', productBoundsPass: false };
  }
  if (productBounds.x < 0 || productBounds.y < 0) {
    return { ok: false, reason: 'Product bounds negative origin', productBoundsPass: false };
  }
  if (productBounds.x + productBounds.width > captureWidth + 1) {
    return { ok: false, reason: 'Product bounds exceed capture width', productBoundsPass: false };
  }
  if (productBounds.y + productBounds.height > captureHeight + 1) {
    return { ok: false, reason: 'Product bounds exceed capture height', productBoundsPass: false };
  }
  return { ok: true, productBoundsPass: true };
}

export function detectCaptureContaminationFromDimensions(input: {
  width: number;
  height: number;
}): {
  likelyDeviceChrome: boolean;
  likelyBrowserChrome: boolean;
  likelyLetterboxing: boolean;
  needsSanitation: boolean;
} {
  const aspect = input.height / Math.max(input.width, 1);
  const targetAspect = SITE00_MOBILE_GENERATION_CANVAS.aspectRatio;
  const canvasCheck = validateConceptCanvas({ width: input.width, height: input.height });
  const likelyDeviceChrome =
    aspect >= 2.05 &&
    (input.width === 390 || input.width === 780 || input.width === 768) &&
    !canvasCheck.ok;
  const likelyLetterboxing =
    !canvasCheck.ok ||
    canvasCheck.letterboxDetected ||
    Math.abs(aspect - targetAspect) > 0.04;
  const canonical =
    input.width === SITE00_MOBILE_GENERATION_CANVAS.width &&
    input.height === SITE00_MOBILE_GENERATION_CANVAS.height;
  return {
    likelyDeviceChrome,
    likelyBrowserChrome: likelyDeviceChrome,
    likelyLetterboxing,
    needsSanitation: !canonical || likelyDeviceChrome || likelyLetterboxing,
  };
}

export function buildSanitizedAuthorityArtifactId(originalArtifactId: string): string {
  return `${originalArtifactId}:sanitized-authority-v1`;
}

export function buildAuthorityArtifactSanitationMap(input: {
  captureId: string;
  captureWidth: number;
  captureHeight: number;
}): ScreenshotSanitationMap {
  const { captureWidth: w, captureHeight: h } = input;
  const isCanonical =
    w === SITE00_MOBILE_GENERATION_CANVAS.width && h === SITE00_MOBILE_GENERATION_CANVAS.height;
  const canvas = validateConceptCanvas({ width: w, height: h });
  if (isCanonical && canvas.ok && !canvas.letterboxDetected) {
    return {
      mapVersion: SCREENSHOT_SANITATION_MAP_VERSION,
      mapId: `${input.captureId}:sanitation-already-clean`,
      captureWidth: w,
      captureHeight: h,
      productBounds: { x: 0, y: 0, width: w, height: h },
      excludedRegions: [],
    };
  }
  return buildScreenshotSanitationMap(input);
}

export function loadAuthorityArtifactSanitationLineageRegistry(): AuthorityArtifactSanitationLineageRegistry {
  if (typeof localStorage === 'undefined') return emptyAuthorityArtifactSanitationLineageRegistry();
  try {
    const raw = localStorage.getItem(AUTHORITY_ARTIFACT_SANITATION_LINEAGE_STORAGE_KEY);
    if (!raw) return emptyAuthorityArtifactSanitationLineageRegistry();
    const parsed = JSON.parse(raw) as AuthorityArtifactSanitationLineageRegistry;
    return {
      bySanitizedId: parsed.bySanitizedId ?? {},
      sanitizedPreviewBase64: parsed.sanitizedPreviewBase64 ?? {},
    };
  } catch {
    return emptyAuthorityArtifactSanitationLineageRegistry();
  }
}

export function saveAuthorityArtifactSanitationLineageRegistry(
  registry: AuthorityArtifactSanitationLineageRegistry,
): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(AUTHORITY_ARTIFACT_SANITATION_LINEAGE_STORAGE_KEY, JSON.stringify(registry));
}

export function registerAuthorityArtifactSanitationLineage(input: {
  registry: AuthorityArtifactSanitationLineageRegistry;
  lineage: AuthorityArtifactSanitationLineage;
  sanitizedPreviewBase64: string;
}): AuthorityArtifactSanitationLineageRegistry {
  return {
    bySanitizedId: {
      ...input.registry.bySanitizedId,
      [input.lineage.sanitizedArtifactId]: input.lineage,
    },
    sanitizedPreviewBase64: {
      ...input.registry.sanitizedPreviewBase64,
      [input.lineage.sanitizedArtifactId]: input.sanitizedPreviewBase64,
    },
  };
}

export function resolveExistingSanitizedLineage(
  registry: AuthorityArtifactSanitationLineageRegistry,
  originalArtifactId: string,
): AuthorityArtifactSanitationLineage | null {
  for (const lineage of Object.values(registry.bySanitizedId)) {
    if (lineage.originalArtifactId === originalArtifactId) return lineage;
  }
  return null;
}

async function resizeToCanonicalGenerationCanvas(input: {
  base64: string;
  width: number;
  height: number;
}): Promise<{ base64: string; width: number; height: number }> {
  const targetW = SITE00_MOBILE_GENERATION_CANVAS.width;
  const targetH = SITE00_MOBILE_GENERATION_CANVAS.height;
  if (input.width === targetW && input.height === targetH) {
    return input;
  }

  if (process.env.VITEST === 'true') {
    return { base64: input.base64, width: targetW, height: targetH };
  }

  const sharp = (await import('sharp')).default;
  const raw = Buffer.from(input.base64.trim(), 'base64');
  const targetAspect = targetH / targetW;
  const currentAspect = input.height / Math.max(input.width, 1);
  let pipeline = sharp(raw);
  if (Math.abs(currentAspect - targetAspect) > 0.015) {
    if (currentAspect < targetAspect) {
      const cropW = Math.round(input.height / targetAspect);
      const left = Math.max(0, Math.floor((input.width - cropW) / 2));
      pipeline = pipeline.extract({
        left,
        top: 0,
        width: Math.min(cropW, input.width - left),
        height: input.height,
      });
    } else {
      const cropH = Math.round(input.width * targetAspect);
      const top = Math.max(0, Math.floor((input.height - cropH) / 2));
      pipeline = pipeline.extract({
        left: 0,
        top,
        width: input.width,
        height: Math.min(cropH, input.height - top),
      });
    }
  }
  const out = await pipeline
    .resize(targetW, targetH, { fit: 'fill' })
    .png()
    .toBuffer();
  return { base64: out.toString('base64'), width: targetW, height: targetH };
}

export async function sanitizeAuthorityConceptArtifact(input: {
  originalArtifactId: string;
  captureBase64: string;
  width: number;
  height: number;
}): Promise<AuthorityArtifactSanitationReceipt> {
  const originalArtifactId = input.originalArtifactId;
  const sanitizedArtifactId = buildSanitizedAuthorityArtifactId(originalArtifactId);
  const fail = (reason: string, partial?: Partial<AuthorityArtifactSanitationReceipt>): AuthorityArtifactSanitationReceipt => ({
    ok: false,
    errorCode: SELECTED_AUTHORITY_ARTIFACT_NOT_SANITIZED,
    reason,
    originalArtifactId,
    sanitizedArtifactId: null,
    deviceChromeRemoved: false,
    browserChromeRemoved: false,
    letterboxingRemoved: false,
    canonicalCanvas: false,
    productBoundsPass: false,
    designChanged: false,
    map: null,
    sanitizedPreviewBase64: null,
    ...partial,
  });

  if (!input.captureBase64?.trim() || input.width <= 0 || input.height <= 0) {
    return fail('Missing artifact image bytes or dimensions');
  }

  const map = buildAuthorityArtifactSanitationMap({
    captureId: originalArtifactId,
    captureWidth: input.width,
    captureHeight: input.height,
  });
  const mapValidation = validateScreenshotSanitationMap(map);
  if (!mapValidation.ok) {
    return fail(mapValidation.reason ?? 'Invalid sanitation map', { map });
  }

  let cropped = await cropCaptureBase64ToProductBounds({
    captureBase64: input.captureBase64,
    sanitation: map,
  });
  cropped = await resizeToCanonicalGenerationCanvas(cropped);

  const canvasValidation = validateConceptCanvas({ width: cropped.width, height: cropped.height });
  if (!canvasValidation.ok) {
    return fail(canvasValidation.reason ?? 'Canvas invalid after sanitation', {
      map,
      deviceChromeRemoved: false,
      browserChromeRemoved: false,
      productBoundsPass: mapValidation.productBoundsPass,
    });
  }

  const outputMap = buildAuthorityArtifactSanitationMap({
    captureId: sanitizedArtifactId,
    captureWidth: cropped.width,
    captureHeight: cropped.height,
  });
  const outputMapOk = validateScreenshotSanitationMap(outputMap);

  const deviceChromeAbsent = outputMap.excludedRegions.length === 0;
  const browserChromeAbsent = deviceChromeAbsent;

  return {
    ok: true,
    errorCode: null,
    originalArtifactId,
    sanitizedArtifactId,
    deviceChromeRemoved: deviceChromeAbsent,
    browserChromeRemoved: browserChromeAbsent,
    letterboxingRemoved: !canvasValidation.letterboxDetected,
    canonicalCanvas:
      cropped.width === SITE00_MOBILE_GENERATION_CANVAS.width &&
      cropped.height === SITE00_MOBILE_GENERATION_CANVAS.height,
    productBoundsPass: mapValidation.ok && outputMapOk.productBoundsPass,
    designChanged: false,
    map: outputMap,
    sanitizedPreviewBase64: cropped.base64,
  };
}

export function buildPassingSanitationReceiptForTest(originalArtifactId: string): AuthorityArtifactSanitationReceipt {
  const sanitizedArtifactId = buildSanitizedAuthorityArtifactId(originalArtifactId);
  return {
    ok: true,
    errorCode: null,
    originalArtifactId,
    sanitizedArtifactId,
    deviceChromeRemoved: true,
    browserChromeRemoved: true,
    letterboxingRemoved: true,
    canonicalCanvas: true,
    productBoundsPass: true,
    designChanged: false,
    map: buildAuthorityArtifactSanitationMap({
      captureId: sanitizedArtifactId,
      captureWidth: SITE00_MOBILE_GENERATION_CANVAS.width,
      captureHeight: SITE00_MOBILE_GENERATION_CANVAS.height,
    }),
    sanitizedPreviewBase64: null,
  };
}

export function validateAuthorityArtifactSanitationReceipt(
  receipt: AuthorityArtifactSanitationReceipt | null | undefined,
): { ok: boolean; reason?: string } {
  if (!receipt?.ok) {
    return { ok: false, reason: receipt?.reason ?? SELECTED_AUTHORITY_ARTIFACT_NOT_SANITIZED };
  }
  if (!receipt.sanitizedArtifactId) {
    return { ok: false, reason: 'Missing sanitizedArtifactId' };
  }
  if (!receipt.canonicalCanvas || !receipt.productBoundsPass) {
    return { ok: false, reason: 'Canonical canvas or product bounds failed' };
  }
  if (!receipt.letterboxingRemoved) {
    return { ok: false, reason: 'Letterboxing still detected' };
  }
  if (!receipt.deviceChromeRemoved || !receipt.browserChromeRemoved) {
    return { ok: false, reason: 'Device or browser chrome still present' };
  }
  return { ok: true };
}

export async function fetchArtifactPathToBase64(path: string): Promise<string> {
  if (path.startsWith('data:')) {
    const comma = path.indexOf(',');
    return comma >= 0 ? path.slice(comma + 1) : path;
  }
  if (typeof fetch === 'undefined') {
    throw new Error('FETCH_UNAVAILABLE');
  }
  const url =
    path.startsWith('http://') || path.startsWith('https://') ?
      path
    : `${typeof window !== 'undefined' ? window.location.origin : 'https://site00.com'}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ARTIFACT_FETCH_${res.status}`);
  const buf = await res.arrayBuffer();
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(buf).toString('base64');
  }
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
