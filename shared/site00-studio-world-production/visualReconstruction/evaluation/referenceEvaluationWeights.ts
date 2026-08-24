/**
 * Client-configurable evaluation weights.
 */

export type ReferenceEvaluationWeights = {
  geometryWeight: number;
  typographyWeight: number;
  brandWeight: number;
  artworkWeight: number;
  compositionWeight: number;
  responsiveWeight: number;
  paletteWeight: number;
};

export const DEFAULT_EVALUATION_WEIGHTS: ReferenceEvaluationWeights = {
  geometryWeight: 0.2,
  typographyWeight: 0.15,
  brandWeight: 0.15,
  artworkWeight: 0.15,
  compositionWeight: 0.15,
  responsiveWeight: 0.1,
  paletteWeight: 0.1,
};

export function weightedScore(
  scores: Partial<Record<keyof ReferenceEvaluationWeights, number>>,
  weights: ReferenceEvaluationWeights,
): number {
  let sum = 0;
  let w = 0;
  const keys = Object.keys(weights) as (keyof ReferenceEvaluationWeights)[];
  for (const key of keys) {
    const scoreKey = key.replace('Weight', '') as keyof typeof scores;
    const s = scores[scoreKey];
    if (s != null) {
      sum += s * weights[key];
      w += weights[key];
    }
  }
  return w > 0 ? sum / w : 0;
}
