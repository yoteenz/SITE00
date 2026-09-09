/**
 * P0.VR.4 — Image-like asset detection from approved design screenshots.
 */

import {
  LIVE_UI_EXCLUSION_CLASSIFICATIONS,
  RECONSTRUCTABLE_CLASSIFICATIONS,
} from './constants.js';
import type {
  ApprovedScreenshotSource,
  DetectedAssetRegion,
  DetectionClassification,
  DetectionConfidenceLevel,
  RawDetectionHint,
} from './types.js';

export type { RawDetectionHint };

function inferSemanticName(classification: DetectionClassification, labelHint?: string): string {
  if (labelHint?.trim()) return labelHint.trim().toUpperCase();
  return `${classification.replace(/_/g, ' ')} ASSET`;
}

function inferConfidence(
  classification: DetectionClassification,
  hint?: DetectionConfidenceLevel,
): DetectionConfidenceLevel {
  if (hint) return hint;
  if (classification === 'HERO_OBJECT' || classification === 'PROJECT_VISUAL') return 'HIGH';
  if (classification === 'ICON' || classification === 'NAV_ICON') return 'MODERATE';
  if (LIVE_UI_EXCLUSION_CLASSIFICATIONS.includes(classification as 'DOM_UI' | 'DOM_TEXT')) {
    return 'LOW';
  }
  return 'MODERATE';
}

export function isLiveUiClassification(classification: DetectionClassification): boolean {
  return (LIVE_UI_EXCLUSION_CLASSIFICATIONS as readonly string[]).includes(classification);
}

export function isReconstructableClassification(classification: DetectionClassification): boolean {
  return (RECONSTRUCTABLE_CLASSIFICATIONS as readonly string[]).includes(classification);
}

export function detectDesignAssets(input: {
  source: ApprovedScreenshotSource;
  hints: RawDetectionHint[];
}): DetectedAssetRegion[] {
  if (input.source.approvalStatus !== 'APPROVED') {
    return [];
  }

  return input.hints.map((hint) => {
    const confidence = inferConfidence(hint.classification, hint.confidenceHint);
    const liveUi = isLiveUiClassification(hint.classification);
    const reconstructable =
      !liveUi && isReconstructableClassification(hint.classification) && confidence !== 'LOW';

    return {
      regionId: hint.regionId,
      classification: hint.classification,
      confidence,
      semanticName: inferSemanticName(hint.classification, hint.labelHint),
      bounds: hint.bounds,
      reconstructable,
      markedAsLiveUi: liveUi,
      ignored: false,
    };
  });
}

export function markRegionAsLiveUi(region: DetectedAssetRegion): DetectedAssetRegion {
  return { ...region, markedAsLiveUi: true, reconstructable: false };
}

export function markRegionIgnored(region: DetectedAssetRegion): DetectedAssetRegion {
  return { ...region, ignored: true, reconstructable: false };
}

export function adjustRegionBounds(
  region: DetectedAssetRegion,
  bounds: DetectedAssetRegion['bounds'],
): DetectedAssetRegion {
  return { ...region, bounds };
}

export function filterReconstructableRegions(regions: DetectedAssetRegion[]): DetectedAssetRegion[] {
  return regions.filter((r) => r.reconstructable && !r.ignored && !r.markedAsLiveUi);
}

export function shouldAutoGenerate(region: DetectedAssetRegion): boolean {
  return region.confidence === 'HIGH' && region.reconstructable;
}
