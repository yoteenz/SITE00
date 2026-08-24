/**
 * Typography reference evaluation — line wrap is high-priority.
 */

import type { TypographyReferenceEvaluation, VisualReferenceRegion } from '../types.js';

export function evaluateTypographyForRegions(regions: VisualReferenceRegion[]): TypographyReferenceEvaluation[] {
  return regions
    .filter((r) =>
      ['HERO', 'METHOD_STAGE', 'EXPERIMENT_CARD', 'TEXT_BLOCK', 'EXPERIMENT_GROUP'].includes(r.visualRole),
    )
    .map((region) => ({
      regionId: region.regionId,
      fontFamily: 'ui-monospace, monospace',
      fontSource: 'repository' as const,
      fontSize: region.visualRole === 'HERO' ? 18 : 11,
      fontWeight: region.visualRole === 'HERO' ? 700 : 600,
      lineHeight: region.visualRole === 'HERO' ? 1.2 : 1.4,
      letterSpacing: 0.08,
      caseBehavior: 'upper' as const,
      textWidth: region.bounds.width * 0.9,
      wrapPoints: estimateWrapPoints(region),
      alignment: 'left',
      exactWrapRequired: region.visualRole === 'HERO' || region.visualRole === 'EXPERIMENT_CARD',
      confidence: region.confidence,
    }));
}

function estimateWrapPoints(region: VisualReferenceRegion): number {
  if (region.visualRole === 'HERO') return 1;
  if (region.visualRole === 'EXPERIMENT_CARD') return 2;
  return 3;
}

export function typographyMatchScore(
  reference: TypographyReferenceEvaluation,
  render: Pick<TypographyReferenceEvaluation, 'fontSize' | 'wrapPoints' | 'lineHeight'>,
): number {
  let score = 1;
  if (reference.fontSize && render.fontSize) {
    score -= Math.min(0.3, Math.abs(reference.fontSize - render.fontSize) / reference.fontSize);
  }
  if (reference.exactWrapRequired && reference.wrapPoints !== render.wrapPoints) {
    score -= 0.4;
  }
  return Math.max(0, score);
}
