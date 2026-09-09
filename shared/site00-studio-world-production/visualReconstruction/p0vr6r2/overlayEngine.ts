/**
 * P0.VR.6R2 — Overlay artifact generation (reference @ 50% + live @ 50%).
 */

import { normalizeCanvasDimensions } from '../p0vr6r1/overlayQA.js';
import { DEFAULT_OVERLAY_OPACITY } from './constants.js';
import type { VisualComparisonNormalization, VisualOverlayArtifact } from './types.js';

function artifactId(sessionId: string, iteration: number): string {
  return `overlay-${sessionId}-${iteration}-${Math.random().toString(36).slice(2, 6)}`;
}

export function buildVisualComparisonNormalization(input: {
  referenceWidth: number;
  referenceHeight: number;
  liveWidth: number;
  liveHeight: number;
  devicePixelRatio?: number;
}): VisualComparisonNormalization {
  const normalized = normalizeCanvasDimensions(
    input.referenceWidth,
    input.referenceHeight,
    input.liveWidth,
    input.liveHeight,
  );
  return {
    referenceCanvasWidth: input.referenceWidth,
    referenceCanvasHeight: input.referenceHeight,
    liveCanvasWidth: input.liveWidth,
    liveCanvasHeight: input.liveHeight,
    normalizedWidth: normalized.width,
    normalizedHeight: normalized.height,
    scaleApplied: normalized.referenceScale,
    cropApplied: false,
    devicePixelRatio: input.devicePixelRatio ?? 1,
    browserChromeExcluded: true,
    safeAreaExcluded: true,
  };
}

export function generateOverlayArtifact(input: {
  sessionId: string;
  iterationNumber: number;
  referencePath: string;
  livePath: string;
  normalization: VisualComparisonNormalization;
}): VisualOverlayArtifact {
  const base = `convergence/${input.sessionId}/iter-${input.iterationNumber}`;
  return {
    artifactId: artifactId(input.sessionId, input.iterationNumber),
    sessionId: input.sessionId,
    iterationNumber: input.iterationNumber,
    referenceOnlyPath: `${base}/reference.png`,
    liveOnlyPath: input.livePath,
    overlayPath: `${base}/overlay-50.png`,
    diffPath: `${base}/diff.png`,
    opacity: DEFAULT_OVERLAY_OPACITY,
    createdAt: new Date().toISOString(),
  };
}
