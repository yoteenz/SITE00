/**
 * Reference match readiness — high-authority regions must pass.
 */

import type {
  ReferenceMatchReadinessEvaluation,
  RenderedReferenceComparison,
  VisualRegionLock,
} from '../types.js';
import { DEFAULT_RECONSTRUCTION_LOOP_CONFIG } from '../constants.js';

export function evaluateReferenceMatchReadiness(
  comparison: RenderedReferenceComparison,
  locks: VisualRegionLock[],
  config = DEFAULT_RECONSTRUCTION_LOOP_CONFIG,
): ReferenceMatchReadinessEvaluation {
  const failedHigh = comparison.regionScores.filter((s) => s.highAuthority && !s.passed);
  const unresolved = locks.filter((l) => l.state !== 'LOCKED').map((l) => l.regionId);

  const macroGeometry = comparison.layoutDifference <= 0.08;
  const regionGeometry = failedHigh.every((s) => s.layoutDifference <= 0.12);
  const typography = comparison.textBoundsDifference <= 0.1;
  const lineWrapping = typography;
  const surfaceMatch = comparison.colorDifference <= 0.15;
  const assetBounds = comparison.regionOverlap >= 0.9;
  const imageCrop = assetBounds;
  const colorMatch = surfaceMatch;
  const fixedElements = comparison.regionScores.find((s) => s.visualRole === 'BOTTOM_NAV')?.passed ?? true;

  const overallSimilarity = comparison.structuralSimilarity;
  const ready =
    failedHigh.length === 0 &&
    overallSimilarity >= config.overallPassThreshold &&
    macroGeometry &&
    regionGeometry &&
    typography &&
    fixedElements;

  return {
    ready,
    blockedReason: ready
      ? null
      : failedHigh.length
        ? `High-authority regions failed: ${failedHigh.map((s) => s.regionId).join(', ')}`
        : overallSimilarity < config.overallPassThreshold
          ? `Overall similarity ${(overallSimilarity * 100).toFixed(1)}% below threshold`
          : 'Layout or typography mismatch',
    macroGeometry,
    regionGeometry,
    typography,
    lineWrapping,
    surfaceMatch,
    assetBounds,
    imageCrop,
    colorMatch,
    fixedElements,
    overallSimilarity,
    unresolvedRegions: unresolved,
    failedHighAuthorityRegions: failedHigh.map((s) => s.regionId),
  };
}
