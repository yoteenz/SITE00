/**
 * P0.VR.6R1 — Reference/live overlay normalization and diff helpers.
 */

import type {
  CalibrationComparisonStatus,
  CalibrationScreenId,
  OverlayCapturePair,
  ReferenceDelta,
  ReferenceDeltaSeverity,
  ScreenCalibrationScore,
} from './types.js';
import { CALIBRATION_CANVAS, CALIBRATION_REFERENCE_BASE, CALIBRATION_SCREEN_META } from './constants.js';

export function referencePathForScreen(screenId: CalibrationScreenId): string {
  return `${CALIBRATION_REFERENCE_BASE}/${CALIBRATION_SCREEN_META[screenId].referenceFile}`;
}

export function designWorkspaceCaptureUrl(baseUrl: string, screenId: CalibrationScreenId): string {
  const q = CALIBRATION_SCREEN_META[screenId].routeQuery;
  const sep = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl.replace(/\/$/, '')}/projects/site00/design${sep}${q}`;
}

export function normalizeCanvasDimensions(
  referenceWidth: number,
  referenceHeight: number,
  liveWidth: number,
  liveHeight: number,
): { width: number; height: number; referenceScale: number; liveScale: number } {
  const targetW = CALIBRATION_CANVAS.width;
  const targetH = CALIBRATION_CANVAS.height;
  return {
    width: targetW,
    height: targetH,
    referenceScale: Math.min(targetW / referenceWidth, targetH / referenceHeight),
    liveScale: Math.min(targetW / liveWidth, targetH / liveHeight),
  };
}

export function buildReferenceDelta(input: {
  screenId: CalibrationScreenId;
  componentId: string;
  reference: Partial<{ x: number; y: number; width: number; height: number }>;
  live: Partial<{ x: number; y: number; width: number; height: number }>;
  correction: string;
}): ReferenceDelta {
  const deltaX =
    input.reference.x != null && input.live.x != null ? input.live.x - input.reference.x : null;
  const deltaY =
    input.reference.y != null && input.live.y != null ? input.live.y - input.reference.y : null;
  const deltaWidth =
    input.reference.width != null && input.live.width != null
      ? input.live.width - input.reference.width
      : null;
  const deltaHeight =
    input.reference.height != null && input.live.height != null
      ? input.live.height - input.reference.height
      : null;

  const abs = [
    Math.abs(deltaX ?? 0),
    Math.abs(deltaY ?? 0),
    Math.abs(deltaWidth ?? 0),
    Math.abs(deltaHeight ?? 0),
  ];
  const max = Math.max(...abs);
  const severity: ReferenceDeltaSeverity = max > 24 ? 'HIGH' : max > 8 ? 'MEDIUM' : 'LOW';

  return {
    screenId: input.screenId,
    componentId: input.componentId,
    referenceX: input.reference.x ?? null,
    liveX: input.live.x ?? null,
    deltaX,
    referenceY: input.reference.y ?? null,
    liveY: input.live.y ?? null,
    deltaY,
    referenceWidth: input.reference.width ?? null,
    liveWidth: input.live.width ?? null,
    deltaWidth,
    referenceHeight: input.reference.height ?? null,
    liveHeight: input.live.height ?? null,
    deltaHeight,
    severity,
    correction: input.correction,
  };
}

export function scoreFromDeltas(deltas: ReferenceDelta[]): CalibrationComparisonStatus {
  if (!deltas.length) return 'HIGH_MATCH';
  if (deltas.some((d) => d.severity === 'HIGH')) return 'MAJOR_DRIFT';
  if (deltas.some((d) => d.severity === 'MEDIUM')) return 'PARTIAL_MATCH';
  return 'HIGH_MATCH';
}

export function buildScreenCalibrationScore(input: {
  screenId: CalibrationScreenId;
  deltas: ReferenceDelta[];
}): ScreenCalibrationScore {
  const overall = scoreFromDeltas(input.deltas);
  return {
    screenId: input.screenId,
    shellScore: overall,
    geometryScore: overall,
    typographyScore: overall,
    spacingScore: overall,
    assetScore: overall,
    overallStatus: overall,
    numericScore: null,
    deltas: input.deltas,
  };
}

export function buildOverlayCapturePair(input: {
  screenId: CalibrationScreenId;
  livePath: string;
  overlayPath?: string | null;
  normalizedWidth?: number;
  normalizedHeight?: number;
}): OverlayCapturePair {
  return {
    screenId: input.screenId,
    referencePath: referencePathForScreen(input.screenId),
    livePath: input.livePath,
    overlayPath: input.overlayPath ?? null,
    normalizedWidth: input.normalizedWidth ?? CALIBRATION_CANVAS.width,
    normalizedHeight: input.normalizedHeight ?? CALIBRATION_CANVAS.height,
  };
}

export function overlayOpacity(): number {
  return 0.5;
}
