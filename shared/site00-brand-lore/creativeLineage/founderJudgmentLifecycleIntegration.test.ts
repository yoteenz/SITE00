/**
 * Founder judgment semantics + revision lifecycle integration tests.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import {
  applyFounderJudgmentToAsset,
  buildRevisionChildAssetDefaults,
  defaultBrandLineageFields,
} from './founderJudgmentLineage.js';
import {
  resolveAssetLifecycleDimensions,
  resolveProductionDestiny,
} from './assetLifecycleDimensions.js';
import { preferenceIsNotCanon } from './preferenceEvidence.js';
import type { CreativeAssetRecord, LaunchSeedSet } from './types.js';
import {
  addAssetToLaunchSeedSet,
  createEmptyLaunchSeedSet,
  reconcileLaunchSeedSemantics,
} from '../../../api/_lib/site00Evolve/creativeLineage/launchSeedSemanticsService.js';

function sampleAsset(overrides: Partial<CreativeAssetRecord> = {}): CreativeAssetRecord {
  const ts = new Date().toISOString();
  return {
    assetId: randomUUID(),
    orgId: 'org',
    projectId: 'ndxbook',
    brandSlug: 'ndxbook',
    brandDisplayName: 'NDXBOOK',
    assetType: 'CAROUSEL_SLIDE',
    sourceType: 'GENERATED',
    creativeStage: 'VALIDATION',
    directionLineage: {
      directionId: 'dir-1',
      directionName: 'THE MARKED-UP COPY',
      formationId: null,
      formationVersion: 1,
      canonicalAtCreation: true,
      worldId: 'world-1',
      worldVersion: 'v1',
      experimentClassification: 'CANONICAL_SAME_TOPIC_CAROUSEL_EXPANSION',
    },
    contentLineage: {
      topicId: 'credit-utilization',
      topicName: 'CREDIT UTILIZATION',
      contentFranchiseId: null,
      episodeId: null,
      carouselId: 'carousel-1',
      slideNumber: 2,
      format: 'CAROUSEL_SEQUENCE',
      nativeFormatReason: null,
    },
    intelligenceLineage: {
      brandLoreVersion: null,
      brandLoreFingerprint: null,
      personalityFingerprint: null,
      expressionContext: 'SOCIAL_FIRST_EDITORIAL',
      directionExpressionSystemId: null,
      creativeExpressionSystemId: null,
      identityArtDirectionId: null,
      visualBriefId: null,
      promptHash: null,
    },
    generationLineage: {
      provider: 'openai/gpt-image-2',
      model: 'openai/gpt-image-2',
      requestId: null,
      generationVersion: 'v1',
      parentAssetIds: [],
      referenceAssetIds: [],
      imageConditioningUsed: false,
      promptVersion: null,
      generatedAt: ts,
      generationCostUsd: 0,
      storagePath: 'site00/validation/ndxbook/test.webp',
    },
    reviewState: 'UNREVIEWED',
    creativeValue: 'UNREVIEWED',
    productionState: 'EXPERIMENTAL',
    productionDestiny: 'UNDECIDED',
    reuseState: 'REUSABLE_WITH_ADAPTATION',
    canonStatus: 'DIRECTION_CANON',
    relationship: { parentAssetId: null, derivedAssetIds: [], adaptationType: null },
    creativeFamilyId: 'family-1',
    brandCanonVersionAtGeneration: 0,
    contentCanonVersionAtGeneration: 0,
    founderNotes: null,
    internalNotes: null,
    salvageClassification: null,
    publishingReadiness: null,
    historicalSourceRef: 'test:ref',
    immutable: true,
    ...defaultBrandLineageFields(),
    createdAt: ts,
    updatedAt: ts,
    ...overrides,
  };
}

describe('founder judgment lifecycle integration', () => {
  it('1 LOVE IT creates creative-positive state', () => {
    const result = applyFounderJudgmentToAsset(sampleAsset(), 'LOVE_IT');
    expect(result.creativeValue).toBe('LOVE_IT');
  });

  it('2 LOVE IT creates production-candidate eligibility', () => {
    const result = applyFounderJudgmentToAsset(sampleAsset(), 'LOVE_IT');
    expect(result.productionState).toBe('PRODUCTION_CANDIDATE');
    expect(result.productionDestiny).toBe('PRODUCTION_CANDIDATE');
  });

  it('3 LOVE IT does NOT automatically add to Launch Seed Set', () => {
    const asset = applyFounderJudgmentToAsset(sampleAsset(), 'LOVE_IT');
    const seed = createEmptyLaunchSeedSet({ brandSlug: 'ndxbook', orgId: 'org' });
    expect(seed.selectedAssets).not.toContain(asset.assetId);
    expect(resolveProductionDestiny(asset, seed)).toBe('PRODUCTION_CANDIDATE');
  });

  it('4 LOVE IT does NOT create Brand Canon', () => {
    const result = applyFounderJudgmentToAsset(sampleAsset(), 'LOVE_IT');
    expect(result.canonStatus).toBe('DIRECTION_CANON');
    expect(result.canonStatus).not.toBe('BRAND_CANON');
  });

  it('5 LOVE IT does NOT create Content Canon', () => {
    const result = applyFounderJudgmentToAsset(sampleAsset(), 'LOVE_IT');
    expect(result.canonStatus).not.toBe('CONTENT_CANON');
  });

  it('6 PROMISING REFINE creates revision-pending state', () => {
    const result = applyFounderJudgmentToAsset(sampleAsset(), 'PROMISING_REFINE');
    expect(result.creativeValue).toBe('PROMISING_REFINE');
    expect(result.reviewState).toBe('PROMISING_REFINE');
    expect(result.revisionPending).toBe(true);
    expect(result.brandDisposition).toBe('REVISION_PENDING');
  });

  it('7 PROMISING REFINE exposes revision workflow eligibility', () => {
    const dims = resolveAssetLifecycleDimensions(
      applyFounderJudgmentToAsset(sampleAsset(), 'PROMISING_REFINE'),
    );
    expect(dims.brandDisposition).toBe('REVISION_PENDING');
  });

  it('8 PROMISING REFINE does NOT automatically generate', () => {
    const result = applyFounderJudgmentToAsset(sampleAsset(), 'PROMISING_REFINE');
    expect(result.productionDestiny).toBe('UNDECIDED');
  });

  it('9 revision child receives independent founder judgment', () => {
    const parent = applyFounderJudgmentToAsset(sampleAsset(), 'PROMISING_REFINE');
    const child = buildRevisionChildAssetDefaults(parent, 'child-1', 2);
    expect(child.creativeValue).toBe('UNREVIEWED');
    expect(child.reviewState).toBe('UNREVIEWED');
  });

  it('10 parent remains immutable conceptually via separate child id', () => {
    const parent = sampleAsset({ assetId: 'parent-1' });
    const child = buildRevisionChildAssetDefaults(parent, 'child-1', 1);
    expect(child.relationship.parentAssetId).toBe('parent-1');
    expect(child.assetId).not.toBe(parent.assetId);
  });

  it('11 NOT FOR ME excludes asset from brand-active library', () => {
    const result = applyFounderJudgmentToAsset(sampleAsset(), 'NOT_FOR_ME');
    expect(result.brandLineageMembership).toBe('EXCLUDED');
  });

  it('12 NOT FOR ME does not delete blob or lineage', () => {
    const asset = sampleAsset();
    const result = applyFounderJudgmentToAsset(asset, 'NOT_FOR_ME');
    expect(result.generationLineage.storagePath).toBeTruthy();
    expect(result.historicalSourceRef).toBe(asset.historicalSourceRef);
  });

  it('13 NOT FOR ME does not automatically authorize exact cross-brand reuse', () => {
    const result = applyFounderJudgmentToAsset(sampleAsset(), 'NOT_FOR_ME');
    expect(result.exactAssetCrossBrandReuse).toBe(false);
    expect(result.crossBrandPortable).toBe(false);
  });

  it('14 portableCore can survive brand exclusion via ideaPortabilityEligible', () => {
    const result = applyFounderJudgmentToAsset(sampleAsset(), 'NOT_FOR_ME');
    expect(result.ideaPortabilityEligible).toBe(true);
  });

  it('15 Launch Seed Set requires explicit valid transition', () => {
    const asset = applyFounderJudgmentToAsset(sampleAsset(), 'LOVE_IT');
    let seed = createEmptyLaunchSeedSet({ brandSlug: 'ndxbook', orgId: 'org' });
    seed = addAssetToLaunchSeedSet(seed, asset.assetId, 'FOUNDER_SELECTED');
    expect(seed.selectedAssets).toContain(asset.assetId);
    expect(seed.assetProvenance[asset.assetId]?.source).toBe('FOUNDER_SELECTED');
  });

  it('16 historical auto-seed records removed only with provenance', () => {
    const assetId = 'asset-auto';
    const seed: LaunchSeedSet = {
      ...createEmptyLaunchSeedSet({ brandSlug: 'ndxbook', orgId: 'org' }),
      selectedAssets: [assetId],
      assetProvenance: {
        [assetId]: { source: 'AUTO_LOVE_IT_LEGACY', addedAt: new Date().toISOString() },
      },
    };
    const result = reconcileLaunchSeedSemantics(seed, [sampleAsset({ assetId })]);
    expect(result.autoRemovedCount).toBe(1);
    expect(result.launchSeedSet?.selectedAssets).not.toContain(assetId);
  });

  it('17 ambiguous historical seed records preserved + review flagged', () => {
    const assetId = 'asset-unknown';
    const seed: LaunchSeedSet = {
      ...createEmptyLaunchSeedSet({ brandSlug: 'ndxbook', orgId: 'org' }),
      selectedAssets: [assetId],
      assetProvenance: {},
    };
    const result = reconcileLaunchSeedSemantics(seed, [sampleAsset({ assetId })]);
    expect(result.preservedAmbiguous).toBe(1);
    expect(result.launchSeedSet?.reviewRequiredAssetIds).toContain(assetId);
  });

  it('18 founder preference evidence remains distinct from canon', () => {
    expect(preferenceIsNotCanon({} as never)).toBe(true);
  });

  it('19 independent lifecycle dimensions enforced', () => {
    const loved = applyFounderJudgmentToAsset(sampleAsset(), 'LOVE_IT');
    const dims = resolveAssetLifecycleDimensions(loved);
    expect(dims.creativeValue).toBe('LOVE_IT');
    expect(dims.productionDestiny).toBe('PRODUCTION_CANDIDATE');
    expect(dims.launchSelected).toBe(false);
  });

  it('20 winning-world loved assets remain salvage-eligible via production candidate', () => {
    const loved = applyFounderJudgmentToAsset(sampleAsset(), 'LOVE_IT');
    expect(loved.productionState).toBe('PRODUCTION_CANDIDATE');
    expect(loved.canonStatus).not.toBe('BRAND_CANON');
  });
});
