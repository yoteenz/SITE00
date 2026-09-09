/**
 * P0.VR.4 — Image vs live UI guard.
 */

import type { DetectedAssetRegion } from './types.js';
import { isLiveUiClassification, isReconstructableClassification } from './assetDetection.js';

export type ImageVsUiDecision = 'RECONSTRUCT_AS_ASSET' | 'KEEP_AS_DOM_CSS';

export function classifyImageVsUi(region: DetectedAssetRegion): ImageVsUiDecision {
  if (region.markedAsLiveUi || isLiveUiClassification(region.classification)) {
    return 'KEEP_AS_DOM_CSS';
  }
  if (isReconstructableClassification(region.classification)) {
    return 'RECONSTRUCT_AS_ASSET';
  }
  return 'KEEP_AS_DOM_CSS';
}

export function shouldExcludeFromReconstruction(region: DetectedAssetRegion): boolean {
  return classifyImageVsUi(region) === 'KEEP_AS_DOM_CSS';
}
