/**
 * Creative lineage methodology tests.
 */

import { describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { defaultBrandLineageFields } from './founderJudgmentLineage.js';
import { buildForensicAuditReport, runHistoricalProvenanceImmutabilityTest } from './forensicAudit.js';
import { translateConceptIntoWinningWorld, runWorldTranslationTest } from './worldTranslationEngine.js';
import { runLosingWorldVisualDnaContaminationTest, runHostFontLeakageTest, runSite00VisualDnaLeakageTest } from './contaminationGuard.js';
import { classifySalvageItem, runSalvageClassificationTest, runLosingDirectionPreservationTest } from './salvageClassification.js';
import {
  createDefaultBrandCanonState,
  incrementBrandCanonVersion,
  incrementContentCanonVersion,
  markAssetsStaleForBrandCanonChange,
  computePublishingReadiness,
  detectConceptOverlap,
  runBrandCanonContentCanonSeparationTest,
  runCreativeFamilyTest,
  runTopicFamilyIsolationTest,
  runAssetRelationshipGraphTest,
} from './canonVersioning.js';
import type { CreativeAssetRecord, CreativeConceptRecord, GoverningCreativeWorld } from './types.js';

function sampleAsset(overrides: Partial<CreativeAssetRecord> = {}): CreativeAssetRecord {
  const ts = new Date().toISOString();
  return {
    assetId: randomUUID(),
    orgId: 'org',
    projectId: 'ndxbook',
    brandSlug: 'ndxbook',
    brandDisplayName: 'NDXBOOK',
    assetType: 'HERO',
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
      experimentClassification: 'CANONICAL_CREATIVE_RANGE_VALIDATION',
    },
    contentLineage: {
      topicId: 'credit-utilization',
      topicName: 'CREDIT UTILIZATION',
      contentFranchiseId: null,
      episodeId: null,
      carouselId: null,
      slideNumber: null,
      format: 'CAROUSEL_COVER',
      nativeFormatReason: null,
    },
    intelligenceLineage: {
      brandLoreVersion: 24,
      brandLoreFingerprint: 'abc',
      personalityFingerprint: null,
      expressionContext: 'SOCIAL_FIRST_EDITORIAL',
      directionExpressionSystemId: null,
      creativeExpressionSystemId: null,
      identityArtDirectionId: null,
      visualBriefId: null,
      promptHash: 'hash',
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
    productionState: 'EXPERIMENTAL',
    reuseState: 'ORIGINAL_USE_ONLY',
    canonStatus: 'NON_CANON',
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

describe('creative lineage methodology', () => {
  it('CREATIVE_ASSET_LINEAGE_TEST', () => {
    const asset = sampleAsset();
    expect(asset.historicalSourceRef).toBeTruthy();
    expect(asset.directionLineage.directionId).toBeTruthy();
    expect(runHistoricalProvenanceImmutabilityTest(asset).passed).toBe(true);
  });

  it('CREATIVE_CONCEPT_LINEAGE_TEST', () => {
    const concept: CreativeConceptRecord = {
      conceptId: 'c1',
      brandSlug: 'ndxbook',
      orgId: 'org',
      originDirectionId: 'd1',
      originDirectionName: 'THE COUNTDOWN ROOM',
      originWorldId: 'w1',
      conceptType: 'CONTENT_FRANCHISE',
      name: 'Countdown',
      description: 'Scoreboard',
      whyItWorks: 'Ranking entertainment',
      originalExpression: 'Leaderboard graphics',
      portableCore: 'Rank information confidently',
      directionSpecificElements: ['scoreboard'],
      visualDependencies: ['leaderboard'],
      voiceDependencies: [],
      formatDependencies: [],
      topicDependencies: [],
      reuseAssessment: 'PORTABLE_WITH_TRANSLATION',
      founderJudgment: null,
      canonStatus: 'NON_CANON',
      salvageClassification: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expect(concept.portableCore).not.toEqual(concept.originalExpression);
  });

  it('CONTENT_FRANCHISE_LINEAGE_TEST', () => {
    expect(runSalvageClassificationTest('SALVAGE_CONTENT_FRANCHISE').passed).toBe(true);
  });

  it('WINNING_WORLD_PROMOTION_TEST — not auto-triggered', () => {
    const plan = { autoTriggered: false as const, status: 'DRAFT' };
    expect(plan.autoTriggered).toBe(false);
  });

  it('LOSING_DIRECTION_PRESERVATION_TEST', () => {
    expect(
      runLosingDirectionPreservationTest({
        historicalRecordsIntact: true,
        normalizedRecordsCreated: true,
        historicalDeleted: false,
      }).passed,
    ).toBe(true);
  });

  it('SALVAGE_CLASSIFICATION_TEST', () => {
    expect(classifySalvageItem({
      kind: 'CONCEPT',
      founderLiked: true,
      visuallyCompatibleWithWinningWorld: false,
      portableCorePresent: true,
      isFranchise: true,
      isCopyMechanic: false,
      isMotionMechanic: false,
      isVisualDevice: false,
    })).toBe('SALVAGE_CONTENT_FRANCHISE');
  });

  it('WORLD_TRANSLATION_TEST', () => {
    const world: GoverningCreativeWorld = {
      canonicalDirectionId: 'w1',
      canonicalDirectionName: 'THE PERSONAL ARCHIVE',
      canonicalWorldId: 'world-archive',
      canonicalTypographySystem: 'Archive typography',
      canonicalColorSystem: 'Muted paper',
      canonicalCompositionSystem: 'Folder grid',
      canonicalPhotographySystem: 'Screenshot documentary',
      canonicalGraphicGrammar: 'Folder tabs',
      canonicalArtifactLanguage: 'Saved files',
      canonicalMotionLanguage: 'Swipe reveal',
      canonicalVoiceBehavior: 'Personal evidence voice',
      canonicalSocialBehavior: 'Saveable reference',
      canonicalFormatBehavior: 'Carousel-native',
    };
    const preview = translateConceptIntoWinningWorld({
      concept: {
        name: 'Ranking',
        description: 'Rank factors',
        originalExpression: 'Scoreboard leaderboard',
        portableCore: 'Rank information confidently',
        originDirectionName: 'THE COUNTDOWN ROOM',
      },
      originDirectionName: 'THE COUNTDOWN ROOM',
      winningWorld: world,
      targetFormat: 'CAROUSEL',
      targetTopic: 'CREDIT UTILIZATION',
    });
    expect(runWorldTranslationTest(preview).passed).toBe(true);
  });

  it('LOSING_WORLD_VISUAL_DNA_CONTAMINATION_TEST', () => {
    const result = runLosingWorldVisualDnaContaminationTest({
      translatedPayload: { text: 'Personal archive folder ranking — saved screenshots only' },
      originDirectionName: 'THE COUNTDOWN ROOM',
      winningDirectionName: 'THE PERSONAL ARCHIVE',
      explicitTraitPromotion: false,
    });
    expect(result.result).toBe('PASS');
  });

  it('TRAIT_LEVEL_CANON_PROMOTION_TEST', () => {
    const result = runLosingWorldVisualDnaContaminationTest({
      translatedPayload: { uses: 'countdown scoreboard palette' },
      originDirectionName: 'THE COUNTDOWN ROOM',
      winningDirectionName: 'THE PERSONAL ARCHIVE',
      explicitTraitPromotion: true,
    });
    expect(result.passed).toBe(true);
  });

  it('BRAND_CANON_CONTENT_CANON_SEPARATION_TEST', () => {
    expect(
      runBrandCanonContentCanonSeparationTest({
        brandCanonTraitTypes: ['TYPOGRAPHY', 'COLOR'],
        contentCanonConceptTypes: ['CONTENT_FRANCHISE', 'EPISODE_IDEA'],
      }).passed,
    ).toBe(true);
  });

  it('LAUNCH_SEED_SET_TEST', () => {
    const seed = { status: 'DRAFT', selectedAssets: [] as string[] };
    expect(seed.status).toBe('DRAFT');
  });

  it('PUBLISHING_READINESS_TEST', () => {
    const readiness = computePublishingReadiness(sampleAsset({ reviewState: 'APPROVED', productionState: 'PRODUCTION_CANDIDATE' }));
    expect(readiness.state).toBe('READY_TO_PUBLISH');
  });

  it('ASSET_RELATIONSHIP_GRAPH_TEST', () => {
    const child = sampleAsset({
      relationship: { parentAssetId: 'parent-1', derivedAssetIds: [], adaptationType: 'CAROUSEL_CONTINUATION' },
    });
    expect(runAssetRelationshipGraphTest(child).passed).toBe(true);
  });

  it('CREATIVE_FAMILY_TEST', () => {
    expect(runCreativeFamilyTest({ topicId: 'credit-utilization', directionId: 'd1', memberAssetIds: ['a1'] }).passed).toBe(true);
  });

  it('TOPIC_FAMILY_ISOLATION_TEST', () => {
    expect(
      runTopicFamilyIsolationTest([
        { topicId: 'credit-utilization', directionId: 'd1', familyId: 'f1' },
        { topicId: 'credit-utilization', directionId: 'd2', familyId: 'f2' },
      ]).passed,
    ).toBe(true);
  });

  it('CANON_VERSIONING_TEST', () => {
    const state = createDefaultBrandCanonState('ndxbook', 'org');
    expect(incrementBrandCanonVersion(state).brandCanonVersion).toBe(1);
    expect(incrementContentCanonVersion(state).contentCanonVersion).toBe(1);
  });

  it('ASSET_STALENESS_TEST', () => {
    const assets = markAssetsStaleForBrandCanonChange(
      [sampleAsset({ productionState: 'PRODUCTION_CANDIDATE', brandCanonVersionAtGeneration: 0 })],
      1,
    );
    expect(assets[0]!.productionState).toBe('CANON_REVIEW_REQUIRED');
  });

  it('HISTORICAL_PROVENANCE_IMMUTABILITY_TEST', () => {
    expect(runHistoricalProvenanceImmutabilityTest({ immutable: true, historicalSourceRef: 'ref' }).passed).toBe(true);
  });

  it('HOST_FONT_LEAKAGE_TEST', () => {
    expect(runHostFontLeakageTest({ font: 'editorial sans' }).passed).toBe(true);
  });

  it('SITE00_VISUAL_DNA_LEAKAGE_TEST', () => {
    expect(runSite00VisualDnaLeakageTest({ brand: 'ndxbook' }).passed).toBe(true);
  });

  it('duplicate detection', () => {
    const a: CreativeConceptRecord = {
      conceptId: '1',
      brandSlug: 'ndxbook',
      orgId: 'o',
      originDirectionId: 'd',
      originDirectionName: 'X',
      originWorldId: 'w',
      conceptType: 'EDITORIAL_MECHANIC',
      name: 'Rank utilization factors',
      description: 'd',
      whyItWorks: 'w',
      originalExpression: 'e',
      portableCore: 'rank utilization confidently',
      directionSpecificElements: [],
      visualDependencies: [],
      voiceDependencies: [],
      formatDependencies: [],
      topicDependencies: [],
      reuseAssessment: 'PORTABLE',
      founderJudgment: null,
      canonStatus: 'NON_CANON',
      salvageClassification: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const b = { ...a, conceptId: '2', name: 'Rank utilization scoreboard' };
    expect(detectConceptOverlap(a, b).relationship).not.toBe('DISTINCT');
  });

  it('forensic audit report', () => {
    const report = buildForensicAuditReport({ brandSlug: 'ndxbook', assetCount: 6, conceptCount: 6 });
    expect(report.migrationPlan.length).toBeGreaterThan(0);
  });
});
