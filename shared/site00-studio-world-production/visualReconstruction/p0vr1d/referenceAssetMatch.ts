/**
 * Reference asset matching — exact approved assets before reconstruction.
 */

import type { PageVisualDecomposition, ReferenceAssetMatch, ReferenceAssetMatchType } from './types.js';

const ASSET_PRIORITY: ReferenceAssetMatchType[] = [
  'EXACT',
  'CROP',
  'DERIVED',
  'NEEDS_RECONSTRUCTION',
  'MISSING',
];

export function matchReferenceAssets(input: {
  decomposition: PageVisualDecomposition;
  projectAssets: Array<{ assetId: string; regionHint?: string; url: string }>;
}): ReferenceAssetMatch[] {
  return input.decomposition.layoutRegions.map((layout) => {
    const hint = layout.role.toLowerCase();
    const exact = input.projectAssets.find(
      (a) => a.regionHint?.toLowerCase() === hint || a.assetId.includes(hint),
    );
    const matchType: ReferenceAssetMatchType = exact ? 'EXACT' : layout.role.includes('ARTWORK') ? 'NEEDS_RECONSTRUCTION' : 'MISSING';
    return {
      regionId: layout.regionId,
      referenceAssetId: input.decomposition.referenceAssetId,
      matchedProjectAssetId: exact?.assetId ?? null,
      matchType,
      reuseExactAsset: matchType === 'EXACT',
    };
  });
}

export function selectAssetByPriority(matches: ReferenceAssetMatch[]): ReferenceAssetMatch | null {
  for (const type of ASSET_PRIORITY) {
    const found = matches.find((m) => m.matchType === type && m.matchedProjectAssetId);
    if (found) return found;
  }
  return matches[0] ?? null;
}

export function exactBackgroundReuseRequired(
  matches: ReferenceAssetMatch[],
  role: string,
): boolean {
  const bg = matches.find((m) => m.regionId.includes('background') || role === 'BACKGROUND_ARCHITECTURE');
  return bg?.reuseExactAsset === true;
}

export function generatedSubstituteIsLastResort(match: ReferenceAssetMatch): boolean {
  return match.matchType === 'NEEDS_RECONSTRUCTION' || match.matchType === 'MISSING';
}
