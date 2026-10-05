/**
 * P0.VR.7R1 — Transfer relative crop geometry between sibling cards (proposal only).
 */

import type { NormalizedCropRegion, GeometryTransferProposal } from './types.js';

export const DEFAULT_INNER_MEDIA_CROP: NormalizedCropRegion = {
  x: 0.08,
  y: 0.1,
  width: 0.84,
  height: 0.68,
};

export function normalizeCropRegion(region: NormalizedCropRegion): NormalizedCropRegion {
  return {
    x: clamp01(region.x),
    y: clamp01(region.y),
    width: clamp01(region.width),
    height: clamp01(region.height),
  };
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

export function proposeSiblingGeometryTransfer(input: {
  sourceAssetId: string;
  targetAssetId: string;
  approvedSourceRegion: NormalizedCropRegion;
  sharedStructure: boolean;
}): GeometryTransferProposal {
  const proposedRegion = normalizeCropRegion(input.approvedSourceRegion);
  return {
    assetId: input.targetAssetId,
    proposedRegion,
    sourceAssetId: input.sourceAssetId,
    confidence: input.sharedStructure ? 0.88 : 0.55,
    requiresFounderReview: true,
    rationale: input.sharedStructure
      ? 'Sibling cards share media inset geometry — proposing equivalent inner-media crop from prior approval.'
      : 'Structural similarity uncertain — proposing prior crop as starting frame only.',
  };
}

export function applyGeometryProposalToCrop(
  current: NormalizedCropRegion,
  proposal: GeometryTransferProposal | null,
): NormalizedCropRegion {
  if (!proposal) return current;
  return normalizeCropRegion(proposal.proposedRegion);
}
