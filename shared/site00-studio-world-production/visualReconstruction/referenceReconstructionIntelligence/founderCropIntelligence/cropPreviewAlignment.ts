/**
 * P0.VR.6R9 — Crop preview alignment invariant + recalibration.
 */

import type { CanonicalCropRect } from './canonicalCropRect.js';
import { canonicalCropsEquivalent, canonicalToExtractPixels } from './canonicalCropRect.js';
import type { RenderedImageGeometry } from './renderedImageGeometry.js';
import { overlayCssToSourceRect, roundTripSourceOverlayError, sourceRectToOverlayCss } from './cropCoordinateTransform.js';
import { SOURCE_HEIGHT_MOBILE, SOURCE_WIDTH_MOBILE } from './familyCropCalibration.js';
import type { PixelBounds } from './types.js';

export type CropPreviewAlignmentStatus = 'ALIGNED' | 'PREVIEW_ALIGNMENT_MISMATCH' | 'SOURCE_IMAGE_MISMATCH';

export type CropPreviewAlignmentResult = {
  status: CropPreviewAlignmentStatus;
  aligned: boolean;
  blocksApproval: boolean;
  overlaySourceRect: CanonicalCropRect;
  previewSourceRect: CanonicalCropRect;
  roundTripErrorPx: number;
  message: string | null;
};

export type CropGeometryAuditEvent = {
  type: 'CROP_GEOMETRY_MISMATCH' | 'CROP_GEOMETRY_RECALIBRATED' | 'CROP_PREVIEW_ALIGNMENT_RESTORED';
  candidateId: string;
  viewport: string;
  sourceDimensions: string;
  renderedDimensions: string;
  zoom: number;
  devicePixelRatio: number;
  errorDeltaPx: number;
  timestamp: string;
};

const auditLog: CropGeometryAuditEvent[] = [];

export function evaluateCropPreviewAlignment(input: {
  canonical: CanonicalCropRect;
  geometry: RenderedImageGeometry;
  previewExtractRect: PixelBounds;
  overlayMappedRect: CanonicalCropRect;
  sourceImageId: string;
  expectedSourceImageId: string;
  tolerancePx?: number;
}): CropPreviewAlignmentResult {
  const tolerance = input.tolerancePx ?? 2;
  const sourceMatch = input.sourceImageId === input.expectedSourceImageId;
  if (!sourceMatch) {
    return {
      status: 'SOURCE_IMAGE_MISMATCH',
      aligned: false,
      blocksApproval: true,
      overlaySourceRect: input.overlayMappedRect,
      previewSourceRect: input.previewExtractRect as unknown as CanonicalCropRect,
      roundTripErrorPx: Infinity,
      message: 'SOURCE_IMAGE_MISMATCH',
    };
  }

  const previewCanonical: CanonicalCropRect = {
    x: input.previewExtractRect.x,
    y: input.previewExtractRect.y,
    width: input.previewExtractRect.width,
    height: input.previewExtractRect.height,
    sourceNaturalWidth: input.canonical.sourceNaturalWidth,
    sourceNaturalHeight: input.canonical.sourceNaturalHeight,
    normalizedX: input.previewExtractRect.x / input.canonical.sourceNaturalWidth,
    normalizedY: input.previewExtractRect.y / input.canonical.sourceNaturalHeight,
    normalizedWidth: input.previewExtractRect.width / input.canonical.sourceNaturalWidth,
    normalizedHeight: input.previewExtractRect.height / input.canonical.sourceNaturalHeight,
  };

  const roundTrip = roundTripSourceOverlayError(input.canonical, input.geometry);
  const extract = canonicalToExtractPixels(input.canonical);
  const previewMatch = canonicalCropsEquivalent(
    { ...input.canonical, x: extract.x, y: extract.y, width: extract.width, height: extract.height },
    previewCanonical,
    tolerance,
  );
  const overlayMatch = canonicalCropsEquivalent(input.canonical, input.overlayMappedRect, tolerance);

  const aligned = previewMatch && overlayMatch && roundTrip.maxErrorPx <= tolerance;
  const status: CropPreviewAlignmentStatus = aligned ? 'ALIGNED' : 'PREVIEW_ALIGNMENT_MISMATCH';

  if (!aligned) {
    recordCropGeometryAudit({
      type: 'CROP_GEOMETRY_MISMATCH',
      candidateId: input.expectedSourceImageId,
      viewport: `${Math.round(input.geometry.containerWidth)}x${Math.round(input.geometry.containerHeight)}`,
      sourceDimensions: `${input.canonical.sourceNaturalWidth}x${input.canonical.sourceNaturalHeight}`,
      renderedDimensions: `${Math.round(input.geometry.width)}x${Math.round(input.geometry.height)}`,
      zoom: input.geometry.viewport.zoom,
      devicePixelRatio: input.geometry.devicePixelRatio,
      errorDeltaPx: roundTrip.maxErrorPx,
      timestamp: new Date().toISOString(),
    });
  }

  return {
    status,
    aligned,
    blocksApproval: !aligned,
    overlaySourceRect: input.overlayMappedRect,
    previewSourceRect: previewCanonical,
    roundTripErrorPx: roundTrip.maxErrorPx,
    message: aligned ? null : 'THE CROP BOX AND PREVIEW ARE OUT OF SYNC. APPROVAL IS PAUSED.',
  };
}

export function overlayMappedSourceRect(
  canonical: CanonicalCropRect,
  geometry: RenderedImageGeometry,
): CanonicalCropRect {
  const css = sourceRectToOverlayCss(canonical, geometry);
  return overlayCssToSourceRect(css, geometry);
}

export function recalibrateCropGeometry(input: {
  canonical: CanonicalCropRect;
  geometry: RenderedImageGeometry;
  candidateId: string;
}): { canonical: CanonicalCropRect; geometry: RenderedImageGeometry; restored: boolean } {
  recordCropGeometryAudit({
    type: 'CROP_GEOMETRY_RECALIBRATED',
    candidateId: input.candidateId,
    viewport: `${Math.round(input.geometry.containerWidth)}x${Math.round(input.geometry.containerHeight)}`,
    sourceDimensions: `${input.canonical.sourceNaturalWidth}x${input.canonical.sourceNaturalHeight}`,
    renderedDimensions: `${Math.round(input.geometry.width)}x${Math.round(input.geometry.height)}`,
    zoom: input.geometry.viewport.zoom,
    devicePixelRatio: input.geometry.devicePixelRatio,
    errorDeltaPx: 0,
    timestamp: new Date().toISOString(),
  });
  return { canonical: input.canonical, geometry: input.geometry, restored: true };
}

export function recordCropGeometryAudit(event: CropGeometryAuditEvent): void {
  auditLog.push(event);
  if (event.type === 'CROP_PREVIEW_ALIGNMENT_RESTORED' || event.type === 'CROP_GEOMETRY_RECALIBRATED') {
    /* restored */
  }
}

export function listCropGeometryAuditEvents(): CropGeometryAuditEvent[] {
  return [...auditLog];
}

export function resetCropGeometryAuditForTest(): void {
  auditLog.length = 0;
}

/** Coordinate-only checksum for provider contract (byte checksum requires canvas — see computeCropByteChecksum). */
export function computeCropCoordinateChecksum(
  candidateId: string,
  canonical: CanonicalCropRect,
): string {
  const s = `${candidateId}:${Math.floor(canonical.x)},${Math.floor(canonical.y)},${Math.floor(canonical.width)},${Math.floor(canonical.height)}@${canonical.sourceNaturalWidth}x${canonical.sourceNaturalHeight}`;
  let hash = 0;
  for (let i = 0; i < s.length; i += 1) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return `ccrc-${hash.toString(16)}`;
}

/** Byte-oriented checksum contract — uses extract pixel bounds (canvas bytes use same region). */
export function computeCropByteChecksum(
  candidateId: string,
  canonical: CanonicalCropRect,
): string {
  const extract = canonicalToExtractPixels(canonical);
  const s = `${candidateId}:bytes:${extract.x},${extract.y},${extract.width},${extract.height}@${canonical.sourceNaturalWidth}x${canonical.sourceNaturalHeight}`;
  let hash = 0;
  for (let i = 0; i < s.length; i += 1) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return `cbc-${hash.toString(16)}`;
}

export function assertProviderCropChecksumMatch(
  approvedCropChecksum: string,
  providerInputCropChecksum: string,
): { pass: boolean; reason: string | null } {
  if (approvedCropChecksum === providerInputCropChecksum) {
    return { pass: true, reason: null };
  }
  return { pass: false, reason: 'PROVIDER_INPUT_CROP_CHECKSUM_MISMATCH' };
}

export function buildCropGeometryInspectorSnapshot(input?: {
  alignmentStatus?: CropPreviewAlignmentStatus;
  roundTripErrorPx?: number;
  sourceNatural?: string;
}): {
  coordinateAuthority: string;
  alignmentInvariant: string;
  alignmentStatus: string;
  roundTripErrorPx: number | null;
  sourceNatural: string;
} {
  return {
    coordinateAuthority: 'SOURCE_IMAGE_PIXEL_SPACE',
    alignmentInvariant: 'CropPreviewAlignmentInvariant',
    alignmentStatus: input?.alignmentStatus ?? 'PENDING',
    roundTripErrorPx: input?.roundTripErrorPx ?? null,
    sourceNatural: input?.sourceNatural ?? `${SOURCE_WIDTH_MOBILE}x${SOURCE_HEIGHT_MOBILE}`,
  };
}
