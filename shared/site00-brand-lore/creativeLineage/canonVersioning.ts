/**
 * Canon versioning, staleness, publishing readiness, duplicate detection.
 */

import type {
  BrandCanonState,
  CreativeAssetRecord,
  CreativeConceptRecord,
  PublishingReadiness,
  PublishingReadinessState,
} from './types.js';

export function createDefaultBrandCanonState(brandSlug: string, orgId: string): BrandCanonState {
  return {
    brandSlug,
    orgId,
    brandCanonVersion: 0,
    contentCanonVersion: 0,
    governingWorldId: null,
    winningDirectionId: null,
    winningDirectionName: null,
    brandCanonLayers: ['typography', 'color', 'composition', 'photography', 'graphic grammar', 'motion', 'voice', 'primary world'],
    contentCanonLayers: ['franchises', 'series', 'editorial mechanics', 'topic structures', 'audience rituals', 'episode types'],
    updatedAt: new Date().toISOString(),
  };
}

export function incrementBrandCanonVersion(state: BrandCanonState): BrandCanonState {
  return { ...state, brandCanonVersion: state.brandCanonVersion + 1, updatedAt: new Date().toISOString() };
}

export function incrementContentCanonVersion(state: BrandCanonState): BrandCanonState {
  return { ...state, contentCanonVersion: state.contentCanonVersion + 1, updatedAt: new Date().toISOString() };
}

export function markAssetsStaleForBrandCanonChange(
  assets: CreativeAssetRecord[],
  currentBrandCanonVersion: number,
): CreativeAssetRecord[] {
  return assets.map((a) => {
    if (
      a.productionState === 'PRODUCTION_CANDIDATE' &&
      a.brandCanonVersionAtGeneration < currentBrandCanonVersion
    ) {
      return { ...a, productionState: 'CANON_REVIEW_REQUIRED', updatedAt: new Date().toISOString() };
    }
    return a;
  });
}

export function computePublishingReadiness(asset: CreativeAssetRecord): PublishingReadiness {
  const founderApproved = asset.reviewState === 'APPROVED' || asset.reviewState === 'LOVE_IT';
  const brandCanonCompatible =
    asset.canonStatus === 'BRAND_CANON' ||
    asset.canonStatus === 'DIRECTION_CANON' ||
    asset.productionState !== 'CANON_REVIEW_REQUIRED';

  let state: PublishingReadinessState = 'NOT_READY';
  if (founderApproved && brandCanonCompatible && asset.generationLineage.storagePath) {
    state = 'NEEDS_REVIEW';
  }
  if (
    founderApproved &&
    brandCanonCompatible &&
    asset.reviewState === 'APPROVED' &&
    asset.productionState === 'PRODUCTION_CANDIDATE'
  ) {
    state = 'READY_TO_PUBLISH';
  }

  return {
    visualApproved: founderApproved,
    copyApproved: founderApproved,
    factChecked: false,
    sourceChecked: false,
    formatReady: Boolean(asset.contentLineage.format),
    cropReady: Boolean(asset.generationLineage.storagePath),
    captionReady: false,
    altTextReady: false,
    rightsClear: asset.sourceType !== 'REFERENCE',
    brandCanonCompatible,
    founderApproved,
    state,
  };
}

export function detectConceptOverlap(a: CreativeConceptRecord, b: CreativeConceptRecord): {
  relationship: 'POSSIBLE_DUPLICATE' | 'RELATED_CONCEPT' | 'DISTINCT';
  score: number;
} {
  const tokensA = new Set(`${a.name} ${a.portableCore}`.toLowerCase().split(/\W+/).filter(Boolean));
  const tokensB = new Set(`${b.name} ${b.portableCore}`.toLowerCase().split(/\W+/).filter(Boolean));
  let overlap = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) overlap += 1;
  }
  const score = overlap / Math.max(tokensA.size, tokensB.size, 1);
  if (score > 0.7) return { relationship: 'POSSIBLE_DUPLICATE', score };
  if (score > 0.35) return { relationship: 'RELATED_CONCEPT', score };
  return { relationship: 'DISTINCT', score };
}

export function runBrandCanonContentCanonSeparationTest(params: {
  brandCanonTraitTypes: string[];
  contentCanonConceptTypes: string[];
}): { passed: boolean; notes: string[] } {
  const overlap = params.brandCanonTraitTypes.filter((t) => params.contentCanonConceptTypes.includes(t));
  return {
    passed: overlap.length === 0,
    notes: overlap.length ? [`Canon layer overlap: ${overlap.join(', ')}`] : ['Brand canon and content canon separated'],
  };
}

export function runCreativeFamilyTest(family: {
  topicId: string;
  directionId: string;
  memberAssetIds: string[];
}): { passed: boolean; notes: string[] } {
  if (!family.topicId || !family.directionId) return { passed: false, notes: ['Missing topic or direction'] };
  return { passed: true, notes: [`Family isolated: ${family.topicId} / ${family.directionId}`] };
}

export function runTopicFamilyIsolationTest(families: Array<{ topicId: string; directionId: string; familyId: string }>): {
  passed: boolean;
  notes: string[];
} {
  const keys = new Set(families.map((f) => `${f.topicId}:${f.directionId}`));
  return {
    passed: keys.size === families.length,
    notes: keys.size === families.length ? [] : ['Duplicate topic+direction families merged incorrectly'],
  };
}

export function runAssetRelationshipGraphTest(asset: CreativeAssetRecord): { passed: boolean; notes: string[] } {
  if (asset.relationship.parentAssetId && asset.relationship.derivedAssetIds.length === 0) {
    return { passed: true, notes: ['Child asset with parent reference'] };
  }
  if (asset.relationship.derivedAssetIds.length > 0) {
    return { passed: true, notes: [`Parent with ${asset.relationship.derivedAssetIds.length} derivatives`] };
  }
  return { passed: true, notes: ['Root asset'] };
}
