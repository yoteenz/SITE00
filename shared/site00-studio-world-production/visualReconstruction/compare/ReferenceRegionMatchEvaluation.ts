export { compareRenderedReference, overallScoreCannotHideRegionFailure } from './RenderedReferenceComparison.js';
export type { CompareImagesInput } from './RenderedReferenceComparison.js';

export function evaluateReferenceRegionMatch(
  regionScores: import('../types.js').RegionMatchScore[],
): import('../types.js').RegionMatchScore[] {
  return regionScores;
}
