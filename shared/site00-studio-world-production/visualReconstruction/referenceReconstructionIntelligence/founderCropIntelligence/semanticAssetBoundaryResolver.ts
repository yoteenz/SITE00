/**
 * P0.VR.6R8 — SemanticAssetBoundaryResolver: find the actual content asset for a target slot.
 */

import type { ReferenceAssetCandidate } from '../referenceAssetMismatch.js';
import type { NormalizedBbox } from '../types.js';
import { resolveComponentRegion } from './componentRegionResolver.js';
import { resolveFamilyCardCrop, resolveMediaWithPaddingCrop } from './familyCropCalibration.js';
import { clampNormalizedBbox } from './cropGeometry.js';
import type { AssetTargetSlotContract, CropDetectionCandidate, SemanticBoundaryResult } from './types.js';

export const BOUNDARY_CONFIDENCE_THRESHOLD = 85;

function overlapRatio(a: NormalizedBbox, b: NormalizedBbox): number {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.width, b.x + b.width);
  const y2 = Math.min(a.y + a.height, b.y + b.height);
  if (x2 <= x1 || y2 <= y1) return 0;
  const inter = (x2 - x1) * (y2 - y1);
  const union = a.width * a.height + b.width * b.height - inter;
  return union > 0 ? inter / union : 0;
}

function buildCandidate(
  id: string,
  label: string,
  boundary: NormalizedBbox,
  confidencePercent: number,
  reasonCode: string,
): CropDetectionCandidate {
  return {
    candidateId: id,
    label,
    boundary: clampNormalizedBbox(boundary),
    confidencePercent,
    reasonCode,
  };
}

export function resolveSemanticAssetBoundary(input: {
  candidate: ReferenceAssetCandidate;
  index: number;
  contract: AssetTargetSlotContract;
}): SemanticBoundaryResult {
  const { candidate, index, contract } = input;
  const brandKey = candidate.brandKey;
  const regions = resolveComponentRegion({ brandKey, index, contract });

  const cardRegion = regions.cardRegion;
  const mediaRegion = regions.mediaRegion;
  const mediaPadded = resolveMediaWithPaddingCrop(brandKey, mediaRegion, 6);
  const fullCard = resolveFamilyCardCrop(brandKey, index);

  const primary = buildCandidate(
    'media-inner',
    'MEDIA REGION ONLY',
    mediaRegion,
    brandKey === 'NDXBOOK' ? 94 : 91,
    'INNER_MEDIA_IN_CARD',
  );
  const alternateCandidates: CropDetectionCandidate[] = [
    buildCandidate('media-padded', 'MEDIA + SMALL PADDING', mediaPadded, 88, 'MEDIA_WITH_PADDING'),
    buildCandidate('full-card', 'FULL CARD', fullCard, 61, 'FULL_CARD_FALLBACK'),
  ];

  const boundaryConfidence = primary.confidencePercent;
  const semanticConfidence = brandKey === 'NDXBOOK' ? 92 : 90;
  const contaminationFlags: string[] = [];

  const primaryOverlapMedia = overlapRatio(primary.boundary, mediaRegion);
  if (primaryOverlapMedia < 0.85) contaminationFlags.push('MEDIA_BOUNDARY_MISMATCH');
  if (overlapRatio(primary.boundary, fullCard) > 0.92 && brandKey === 'NDXBOOK') {
    contaminationFlags.push('DEVICE_CHROME');
    contaminationFlags.push('CARD_BORDER');
  }

  const needsFounderPlacement = boundaryConfidence < BOUNDARY_CONFIDENCE_THRESHOLD || contaminationFlags.length > 0;

  return {
    primaryCandidate: primary,
    alternateCandidates,
    candidateBoundary: primary.boundary,
    cardRegion,
    mediaRegion,
    boundaryConfidence,
    semanticConfidence,
    contaminationFlags,
    needsFounderPlacement,
    reasonCode: needsFounderPlacement ? 'NEEDS_FOUNDER_PLACEMENT' : 'SEMANTIC_BOUNDARY_RESOLVED',
  };
}

export function selectDetectionCandidate(
  result: SemanticBoundaryResult,
  candidateId: string,
): { boundary: NormalizedBbox; candidate: CropDetectionCandidate | null } {
  if (result.primaryCandidate.candidateId === candidateId) {
    return { boundary: result.primaryCandidate.boundary, candidate: result.primaryCandidate };
  }
  const alt = result.alternateCandidates.find((c) => c.candidateId === candidateId);
  if (alt) return { boundary: alt.boundary, candidate: alt };
  return { boundary: result.primaryCandidate.boundary, candidate: null };
}

export function inferContaminationFromBounds(
  crop: NormalizedBbox,
  cardRegion: NormalizedBbox,
  mediaRegion: NormalizedBbox,
  brandKey: string,
): {
  uiContaminationSuspected: boolean;
  hasDeviceFrame: boolean;
  hasText: boolean;
  hasAdjacentCard: boolean;
  objectCoverageOverride?: 'FULL' | 'PARTIAL' | 'UNKNOWN';
} {
  const mediaOverlap = overlapRatio(crop, mediaRegion);
  const coversFullCard = crop.width >= cardRegion.width * 0.92 && crop.height >= cardRegion.height * 0.88;
  const extendsBeyondMedia =
    crop.x < mediaRegion.x - 0.004 ||
    crop.y < mediaRegion.y - 0.004 ||
    crop.x + crop.width > mediaRegion.x + mediaRegion.width + 0.004 ||
    crop.y + crop.height > mediaRegion.y + mediaRegion.height + 0.012;

  const isNdx = brandKey === 'NDXBOOK';
  const hasDeviceFrame = isNdx && (coversFullCard || (extendsBeyondMedia && mediaOverlap < 0.82));
  const hasText = isNdx && crop.y + crop.height > cardRegion.y + cardRegion.height * 0.72;
  const hasAdjacentCard =
    isNdx &&
    (crop.x + crop.width > cardRegion.x + cardRegion.width + 0.002 ||
      crop.x < cardRegion.x - 0.002 ||
      crop.width >= cardRegion.width * 0.98);

  let objectCoverageOverride: 'FULL' | 'PARTIAL' | 'UNKNOWN' | undefined;
  if (mediaOverlap >= 0.88 && !hasDeviceFrame && !hasText && !hasAdjacentCard) {
    objectCoverageOverride = 'FULL';
  } else if (hasDeviceFrame || hasText || hasAdjacentCard) {
    objectCoverageOverride = 'PARTIAL';
  }

  return {
    uiContaminationSuspected: hasDeviceFrame || hasText || hasAdjacentCard,
    hasDeviceFrame,
    hasText,
    hasAdjacentCard,
    objectCoverageOverride,
  };
}
