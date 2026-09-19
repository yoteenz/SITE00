/**
 * P0.VR.8-SRF — Separate structural vs asset fidelity scores.
 */

import { STRUCTURAL_FIDELITY_THRESHOLDS } from './constants.js';
import type {
  ScreenAuthorityBlueprint,
  ScreenReplicationDifference,
  ScreenReplicationFidelityScore,
} from './types.js';

export function scoreDimensionsFromDifferences(input: {
  differences: ScreenReplicationDifference[];
  assetDeferredRegionIds: string[];
  maskedRegionIds: string[];
}): ScreenReplicationFidelityScore {
  const active = input.differences.filter((d) => !d.masked);
  const assetOnly = active.every((d) => d.differenceClass === 'ASSET_DRIFT' || d.differenceClass === 'EXPECTED_DYNAMIC_VARIANCE');
  const dim = (cls: ScreenReplicationDifference['differenceClass'], base: number) => {
    const hits = active.filter((d) => d.differenceClass === cls && d.severity !== 'MINOR').length;
    return Math.max(0, Math.round(base - hits * 8));
  };

  const assetDrifts = active.filter((d) => d.differenceClass === 'ASSET_DRIFT').length;
  const deferredCount = input.assetDeferredRegionIds.length;
  const assetMatch =
    deferredCount > 0 && assetDrifts <= deferredCount
      ? Math.max(35, 100 - assetDrifts * 12)
      : Math.max(0, 100 - assetDrifts * 15);

  const scores: ScreenReplicationFidelityScore = {
    STRUCTURE_MATCH: dim('STRUCTURAL_DRIFT', 98),
    GEOMETRY_MATCH: dim('GEOMETRY_DRIFT', 96),
    SPACING_MATCH: dim('SPACING_DRIFT', 95),
    TYPOGRAPHY_MATCH: dim('TYPOGRAPHY_DRIFT', 94),
    COMPOSITION_MATCH: dim('COMPOSITION_DRIFT', 97),
    CONTROL_MATCH: dim('CONTROL_DRIFT', 100),
    INTERACTION_MATCH: 100,
    RESPONSIVE_MATCH: dim('COMPOSITION_CLONING', 95),
    ASSET_MATCH: assetMatch,
    assetMatchStatus: deferredCount > 0 ? 'DEFERRED' : assetMatch >= 90 ? 'VERIFIED' : 'PARTIAL',
    structuralFidelityHigh: false,
  };

  scores.structuralFidelityHigh = structuralScoresPass(scores) && (assetOnly || input.maskedRegionIds.length > 0);
  return scores;
}

export function structuralScoresPass(scores: ScreenReplicationFidelityScore): boolean {
  return (
    scores.STRUCTURE_MATCH >= STRUCTURAL_FIDELITY_THRESHOLDS.STRUCTURE_MATCH &&
    scores.GEOMETRY_MATCH >= STRUCTURAL_FIDELITY_THRESHOLDS.GEOMETRY_MATCH &&
    scores.SPACING_MATCH >= STRUCTURAL_FIDELITY_THRESHOLDS.SPACING_MATCH &&
    scores.TYPOGRAPHY_MATCH >= STRUCTURAL_FIDELITY_THRESHOLDS.TYPOGRAPHY_MATCH &&
    scores.COMPOSITION_MATCH >= STRUCTURAL_FIDELITY_THRESHOLDS.COMPOSITION_MATCH &&
    scores.CONTROL_MATCH >= STRUCTURAL_FIDELITY_THRESHOLDS.CONTROL_MATCH
  );
}

export function assetScoreMustNotLowerStructure(
  structural: number,
  asset: number,
): { structuralFidelity: number; assetFidelity: string } {
  return {
    structuralFidelity: structural,
    assetFidelity: asset < 70 ? 'DEFERRED' : String(asset),
  };
}

export function measureLiveRegionsAgainstBlueprint(input: {
  blueprint: ScreenAuthorityBlueprint;
  liveRegionPresence: Record<string, boolean>;
  usesGenericTemplate: boolean;
}): ScreenReplicationDifference[] {
  const diffs: ScreenReplicationDifference[] = [];
  if (input.usesGenericTemplate) {
    diffs.push({
      differenceId: 'template-drift',
      regionId: null,
      differenceClass: 'TEMPLATE_DRIFT',
      severity: 'BLOCKING',
      description: 'Live screen preserves generic project overview template composition',
      masked: false,
    });
  }

  for (const region of input.blueprint.regions) {
    if (region.rebuildClass === 'HOST_LOCKED') continue;
    if (!input.liveRegionPresence[region.regionId] && region.rebuildClass !== 'ASSET_DEFERRED') {
      diffs.push({
        differenceId: `missing-${region.regionId}`,
        regionId: region.regionId,
        differenceClass: 'STRUCTURAL_DRIFT',
        severity: 'MAJOR',
        description: `Missing authority region ${region.regionId}`,
        masked: false,
      });
    }
  }

  return diffs;
}

export function authoritiesShareDomFingerprint(
  authorityA: string,
  authorityB: string,
  sameDomFingerprint: boolean,
): boolean {
  return authorityA !== authorityB && sameDomFingerprint;
}
