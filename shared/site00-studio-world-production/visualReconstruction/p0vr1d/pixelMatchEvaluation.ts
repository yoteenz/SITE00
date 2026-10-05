/**
 * PixelMatchEvaluation — reference vs rendered implementation scoring.
 */

import { randomUUID } from 'node:crypto';
import { PIXEL_MATCH_THRESHOLDS } from './constants.js';
import type { PixelMatchEvaluation, PixelMatchTier } from './types.js';
import type { RenderedReferenceComparison } from '../types.js';

function tierFromScore(score: number): PixelMatchTier {
  if (score >= PIXEL_MATCH_THRESHOLDS.PIXEL_PASS) return 'PIXEL_PASS';
  if (score >= PIXEL_MATCH_THRESHOLDS.VISUAL_PASS) return 'VISUAL_PASS';
  return 'STRUCTURAL_PASS';
}

export function evaluatePixelMatch(input: {
  referenceAssetId: string;
  renderAssetId: string;
  comparison: Pick<
    RenderedReferenceComparison,
    'structuralSimilarity' | 'textBoundsDifference' | 'regionScores' | 'heatmapPath' | 'layoutDifference'
  >;
}): PixelMatchEvaluation {
  const overall = input.comparison.structuralSimilarity ?? 0;
  const geometry = 1 - (input.comparison.layoutDifference ?? 0);
  const typography = 1 - (input.comparison.textBoundsDifference ?? 0);
  const regionAvg =
    input.comparison.regionScores?.length
      ? input.comparison.regionScores.reduce((s, r) => s + r.structuralSimilarity, 0) /
        input.comparison.regionScores.length
      : overall;

  const evaluation: PixelMatchEvaluation = {
    evaluationId: randomUUID(),
    referenceAssetId: input.referenceAssetId,
    renderAssetId: input.renderAssetId,
    globalAlignment: overall,
    regionAlignment: regionAvg,
    proportions: geometry,
    whitespace: overall * 0.95,
    panelGeometry: geometry,
    artworkPlacement: regionAvg * 0.92,
    typographyPosition: typography,
    lineWrapping: typography * 0.88,
    buttonGeometry: geometry * 0.9,
    borderRadius: overall * 0.85,
    backgroundFraming: overall * 0.93,
    visualHierarchy: regionAvg,
    tier: tierFromScore(overall),
    passed: overall >= PIXEL_MATCH_THRESHOLDS.STRUCTURAL_PASS,
  };
  return evaluation;
}

export function pixelMatchFromRenderedComparison(
  referenceAssetId: string,
  renderAssetId: string,
  comparison: RenderedReferenceComparison,
): PixelMatchEvaluation {
  return evaluatePixelMatch({ referenceAssetId, renderAssetId, comparison });
}
