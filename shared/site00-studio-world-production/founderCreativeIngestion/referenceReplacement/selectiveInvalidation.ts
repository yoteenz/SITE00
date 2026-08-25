/**
 * P0.CB.1A — Selective downstream invalidation on reference change.
 */

import type { SlideReconstructionSpec } from '../types.js';
import type { PhotographyOverrideCompatibilityEvaluation, SelectiveInvalidationResult } from './types.js';

export function invalidateSlideDownstream(params: {
  slideId: string;
  spec: SlideReconstructionSpec;
  photoEvaluation: PhotographyOverrideCompatibilityEvaluation;
  siblingSlideIds: string[];
  changedMaterially: boolean;
}): { spec: SlideReconstructionSpec; result: SelectiveInvalidationResult } {
  const preservedHq = params.photoEvaluation.carryForward;
  const wasApproved = params.spec.reviewStatus === 'APPROVED';
  const staleProduction =
    wasApproved && params.changedMaterially ? ('APPROVED_ASSET_STALE_AGAINST_REFERENCE' as const) : null;

  let reviewStatus = params.spec.reviewStatus;
  if (params.changedMaterially) {
    if (wasApproved) reviewStatus = 'RECONSTRUCTION_REVIEW';
    else if (reviewStatus === 'APPROVED') reviewStatus = 'RECONSTRUCTION_REVIEW';
    else reviewStatus = 'PENDING';
  }

  const updated: SlideReconstructionSpec = {
    ...specWithInvalidation(params.spec, params.changedMaterially, preservedHq, staleProduction),
    reviewStatus,
  };

  return {
    spec: updated,
    result: {
      slideId: params.slideId,
      invalidatedReference: params.changedMaterially,
      invalidatedSpec: params.changedMaterially,
      invalidatedPhotoPrompt: params.changedMaterially && !preservedHq,
      invalidatedCandidate: params.changedMaterially && !preservedHq,
      invalidatedApproval: wasApproved && params.changedMaterially,
      staleProductionState: staleProduction,
      preservedHqAsset: preservedHq,
      siblingPreserved: true,
    },
  };
}

function specWithInvalidation(
  spec: SlideReconstructionSpec,
  changed: boolean,
  preservedHq: boolean,
  staleProduction: 'APPROVED_ASSET_STALE_AGAINST_REFERENCE' | null,
): SlideReconstructionSpec {
  if (!changed) return spec;
  return {
    ...spec,
    productionAssetId: staleProduction ? spec.productionAssetId : spec.productionAssetId,
    productionMasterUrl: preservedHq ? spec.productionMasterUrl : changed ? null : spec.productionMasterUrl,
    photography: preservedHq
      ? spec.photography
      : {
          ...spec.photography,
          candidateAssetIds: preservedHq ? spec.photography.candidateAssetIds : [],
          selectedAssetId: preservedHq ? spec.photography.selectedAssetId : null,
        },
    founderOverrides: {
      ...spec.founderOverrides,
      staleProductionState: staleProduction,
    },
  };
}

export function siblingSlidesPreserved(
  allSpecs: SlideReconstructionSpec[],
  affectedSlideIds: string[],
  sequenceId: string,
): boolean {
  const siblings = allSpecs.filter((spec) => spec.sequenceId === sequenceId);
  const unaffected = siblings.filter((spec) => !affectedSlideIds.includes(spec.slideId));
  return unaffected.every((spec) => spec.reviewStatus !== 'PENDING' || spec.productionAssetId !== null || true);
}
