/**
 * P0.VR.8-SRF — Structural QA (pass A masked) + Full QA (pass B).
 */

import { DEFAULT_ASSET_DEFERRED_POLICY, onlyAssetDeferredRegionsMaskable } from './assetDeferredPolicy.js';
import { structuralScoresPass, scoreDimensionsFromDifferences } from './fidelityScoring.js';
import type {
  ScreenAuthorityBlueprint,
  ScreenReplicationCaptureSet,
  ScreenReplicationDifference,
  StructuralQaPass,
} from './types.js';

export function maskAssetDeferredRegionsOnly(
  blueprint: ScreenAuthorityBlueprint,
  differences: ScreenReplicationDifference[],
): { masked: ScreenReplicationDifference[]; maskedRegionIds: string[] } {
  const maskedRegionIds = blueprint.regions
    .filter((r) => r.rebuildClass === 'ASSET_DEFERRED' && onlyAssetDeferredRegionsMaskable(r, DEFAULT_ASSET_DEFERRED_POLICY))
    .map((r) => r.regionId);

  const masked = differences.map((d) => {
    if (d.regionId && maskedRegionIds.includes(d.regionId) && d.differenceClass === 'ASSET_DRIFT') {
      return { ...d, masked: true };
    }
    if (d.differenceClass === 'CONTENT_VARIANCE' || d.differenceClass === 'EXPECTED_DYNAMIC_VARIANCE') {
      return { ...d, masked: true };
    }
    return d;
  });

  return { masked, maskedRegionIds };
}

export function runStructuralQaPass(input: {
  blueprint: ScreenAuthorityBlueprint;
  differences: ScreenReplicationDifference[];
}): StructuralQaPass {
  const { masked, maskedRegionIds } = maskAssetDeferredRegionsOnly(input.blueprint, input.differences);
  const assetDeferredRegionIds = input.blueprint.regions
    .filter((r) => r.rebuildClass === 'ASSET_DEFERRED')
    .map((r) => r.regionId);
  const scores = scoreDimensionsFromDifferences({
    differences: masked,
    assetDeferredRegionIds,
    maskedRegionIds,
  });

  return {
    passKind: 'STRUCTURAL',
    maskedRegionIds,
    scores,
    differences: masked,
    passed: structuralScoresPass(scores),
  };
}

export function runFullQaPass(input: {
  blueprint: ScreenAuthorityBlueprint;
  differences: ScreenReplicationDifference[];
}): StructuralQaPass {
  const assetDeferredRegionIds = input.blueprint.regions
    .filter((r) => r.rebuildClass === 'ASSET_DEFERRED')
    .map((r) => r.regionId);
  const scores = scoreDimensionsFromDifferences({
    differences: input.differences,
    assetDeferredRegionIds,
    maskedRegionIds: [],
  });

  return {
    passKind: 'FULL',
    maskedRegionIds: [],
    scores,
    differences: input.differences,
    passed: structuralScoresPass(scores) && scores.ASSET_MATCH >= 70,
  };
}

export function buildCaptureSet(input: {
  referencePath: string;
  livePath: string;
  viewportWidth: number;
  viewportHeight: number;
}): ScreenReplicationCaptureSet {
  const base = '/api/site00/design-control-plane?action=SCREEN_REPLICATION_CAPTURE';
  const q = (kind: string, path: string) =>
    `${base}&kind=${kind}&path=${encodeURIComponent(path)}&w=${input.viewportWidth}&h=${input.viewportHeight}`;

  return {
    referenceUrl: q('reference', input.referencePath),
    liveUrl: q('live', input.livePath),
    overlayUrl: q('overlay', input.referencePath),
    diffUrl: q('diff', input.referencePath),
    viewportWidth: input.viewportWidth,
    viewportHeight: input.viewportHeight,
  };
}

export function excessiveMaskingDetected(maskedRegionIds: string[], blueprint: ScreenAuthorityBlueprint): boolean {
  const structuralIds = blueprint.regions
    .filter((r) => r.rebuildClass === 'AUTHORITY_CONTROLLED' || r.rebuildClass === 'FUNCTIONAL_ONLY')
    .map((r) => r.regionId);
  return maskedRegionIds.some((id) => structuralIds.includes(id));
}
