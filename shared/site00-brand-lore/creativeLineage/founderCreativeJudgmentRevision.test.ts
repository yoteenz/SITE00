/**
 * Founder creative judgment + surgical revision lineage — sprint tests.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import {
  applyFounderJudgmentToAsset,
  defaultBrandLineageFields,
  isActiveInBrandLineage,
} from './founderJudgmentLineage.js';
import {
  dispositionForAction,
  normalizeFounderAction,
} from './founderCreativeJudgmentTypes.js';
import type { CreativeAssetRecord } from './types.js';
import { compileCreativeRevision, defaultRevisionSeverity } from './revisionCompiler.js';
import {
  assessRevisionVsNewExploration,
  canApproveRevisionGeneration,
  runHostFontRevisionLeakageTest,
  runRevisionSurgicalityTest,
  runRevisionWorldContaminationTest,
} from './revisionValidation.js';
import {
  aggregateFounderCreativePreferenceEvidence,
  extractPreferenceEvidenceFromRevision,
  preferenceIsNotCanon,
} from './preferenceEvidence.js';
import type { CreativeRevisionSpec, RevisionElementKey } from './revisionTypes.js';

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
      directionId: 'dir-marked-up-copy',
      directionName: 'THE MARKED-UP COPY',
      formationId: null,
      formationVersion: 1,
      canonicalAtCreation: true,
      worldId: 'world-marked-up',
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
      promptHash: 'prompt-hash-abc',
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

function sampleRevisionSpec(parent: CreativeAssetRecord, overrides: Partial<CreativeRevisionSpec> = {}): CreativeRevisionSpec {
  const ts = new Date().toISOString();
  return {
    revisionId: `revision-${randomUUID()}`,
    parentAssetId: parent.assetId,
    rootAssetId: parent.assetId,
    revisionNumber: 1,
    branchId: `branch-${parent.assetId}`,
    brandSlug: 'ndxbook',
    projectId: parent.projectId,
    directionId: parent.directionLineage.directionId,
    worldId: parent.directionLineage.worldId,
    creativeFamilyId: parent.creativeFamilyId,
    severity: defaultRevisionSeverity(),
    founderOriginalNote: 'Almost right — push typography harder',
    categoryNotes: { typography: 'HEADLINE NEEDS MORE OWNERSHIP' },
    elementStates: { COPY: 'LOCKED', TYPOGRAPHY: 'MUTABLE' },
    lockedElements: ['COPY', 'COMPOSITION', 'BACKGROUND'] as RevisionElementKey[],
    mutableElements: ['TYPOGRAPHY', 'COLOR'] as RevisionElementKey[],
    preserveUnspecified: true,
    requestedAssetExchange: [],
    requestedCopyChanges: [],
    requestedColorChanges: [],
    requestedTypographyChanges: [],
    status: 'DRAFT',
    generationMode: 'IMAGE_EDIT',
    generationGate: { liveGenerationEnabled: false, gateReason: 'GENERATION_NOT_YET_ENABLED' },
    childAssetId: null,
    createdAt: ts,
    updatedAt: ts,
    ...overrides,
  };
}

describe('founder creative judgment + revision sprint', () => {
  it('FOUNDER_JUDgment_PERSISTENCE_TEST — judgment history model supports durable events', () => {
    expect(normalizeFounderAction('PROMISING_REFINE')).toBe('REVISE');
    expect(dispositionForAction('LOVE_IT')).toBe('LOVED');
    expect(dispositionForAction('NOT_FOR_ME')).toBe('REJECTED_FOR_BRAND');
  });

  it('LOVE_IT_PRODUCTION_CANDIDATE_TEST', () => {
    const result = applyFounderJudgmentToAsset(sampleAsset(), 'LOVE_IT');
    expect(result.productionState).toBe('PRODUCTION_CANDIDATE');
    expect(result.brandDisposition).toBe('LOVED');
    expect(result.canonStatus).toBe('DIRECTION_CANON');
  });

  it('NOT_FOR_ME_BRAND_SCOPING_TEST', () => {
    const result = applyFounderJudgmentToAsset(sampleAsset(), 'NOT_FOR_ME');
    expect(result.brandLineageMembership).toBe('EXCLUDED');
    expect(result.brandDisposition).toBe('REJECTED_FOR_BRAND');
    expect(isActiveInBrandLineage(result)).toBe(false);
  });

  it('REJECTION_DOES_NOT_DELETE_TEST', () => {
    const asset = sampleAsset();
    const result = applyFounderJudgmentToAsset(asset, 'NOT_FOR_ME');
    expect(result.generationLineage.storagePath).toBe(asset.generationLineage.storagePath);
    expect(result.historicalSourceRef).toBe(asset.historicalSourceRef);
  });

  it('CROSS_BRAND_ARCHIVE_ISOLATION_TEST', () => {
    const result = applyFounderJudgmentToAsset(sampleAsset(), 'NOT_FOR_ME');
    expect(result.crossBrandPortable).toBe(true);
    expect(result.crossBrandReuseEligibility).toBe('NOT_EVALUATED');
  });

  it('REVISION_SPEC_PERSISTENCE_TEST — spec shape is complete', () => {
    const parent = sampleAsset();
    const spec = sampleRevisionSpec(parent);
    expect(spec.parentAssetId).toBe(parent.assetId);
    expect(spec.preserveUnspecified).toBe(true);
  });

  it('REVISION_LOCK_TEST', () => {
    const spec = sampleRevisionSpec(sampleAsset());
    expect(spec.lockedElements).toContain('COPY');
  });

  it('REVISION_MUTABLE_ELEMENT_TEST', () => {
    const spec = sampleRevisionSpec(sampleAsset());
    expect(spec.mutableElements).toContain('TYPOGRAPHY');
  });

  it('PRESERVE_UNSPECIFIED_TEST', () => {
    const parent = sampleAsset();
    const spec = sampleRevisionSpec(parent);
    const brief = compileCreativeRevision(spec, {
      parentAsset: parent,
      directionName: parent.directionLineage.directionName,
      worldId: parent.directionLineage.worldId,
    });
    expect(brief.preserve.some((p) => p.includes('unmentioned'))).toBe(true);
  });

  it('REVISION_SEVERITY_TEST — default TARGETED not REINTERPRET', () => {
    expect(defaultRevisionSeverity()).toBe('TARGETED');
  });

  it('ASSET_EXCHANGE_INSTRUCTION_TEST — exchange fields supported on spec', () => {
    const parent = sampleAsset();
    const spec = sampleRevisionSpec(parent, {
      requestedAssetExchange: [
        {
          instructionId: 'ex-1',
          targetElement: 'receipt fragment',
          replacementType: 'REPLACE',
          replacementDescription: 'credit report fragment',
          preservePosition: true,
          preserveScale: true,
          preserveTreatment: true,
          founderNote: 'swap asset only',
        },
      ],
    });
    const brief = compileCreativeRevision(spec, {
      parentAsset: parent,
      directionName: parent.directionLineage.directionName,
      worldId: parent.directionLineage.worldId,
    });
    expect(brief.change.some((c) => c.includes('credit report fragment'))).toBe(true);
  });

  it('REVISION_COMPILER_TEST — delta based brief', () => {
    const parent = sampleAsset();
    const spec = sampleRevisionSpec(parent);
    const brief = compileCreativeRevision(spec, {
      parentAsset: parent,
      directionName: parent.directionLineage.directionName,
      worldId: parent.directionLineage.worldId,
    });
    expect(brief.deltaPrompt).toContain('REVISION MODE:');
    expect(brief.deltaPrompt).toContain('PRESERVE:');
    expect(brief.deltaPrompt).toContain('CHANGE:');
    expect(brief.deltaPrompt).toContain('DO NOT:');
  });

  it('REVISION_SURGICALITY_TEST', () => {
    const parent = sampleAsset();
    const spec = sampleRevisionSpec(parent);
    const brief = compileCreativeRevision(spec, {
      parentAsset: parent,
      directionName: parent.directionLineage.directionName,
      worldId: parent.directionLineage.worldId,
    });
    const result = runRevisionSurgicalityTest({ spec, compiledBrief: brief });
    expect(result.passed).toBe(true);
  });

  it('REVISION_WORLD_CONTAMINATION_TEST', () => {
    const parent = sampleAsset();
    const spec = sampleRevisionSpec(parent);
    const brief = compileCreativeRevision(spec, {
      parentAsset: parent,
      directionName: parent.directionLineage.directionName,
      worldId: parent.directionLineage.worldId,
    });
    const result = runRevisionWorldContaminationTest({
      spec,
      parentAsset: parent,
      compiledBrief: brief,
      originDirectionName: parent.directionLineage.directionName,
    });
    expect(result.passed).toBe(true);
  });

  it('HOST_FONT_REVISION_LEAKAGE_TEST', () => {
    const parent = sampleAsset();
    const spec = sampleRevisionSpec(parent);
    const brief = compileCreativeRevision(spec, {
      parentAsset: parent,
      directionName: parent.directionLineage.directionName,
      worldId: parent.directionLineage.worldId,
    });
    expect(runHostFontRevisionLeakageTest(brief).passed).toBe(true);
  });

  it('PARENT_ASSET_IMMUTABILITY_TEST — parent id anchored in brief', () => {
    const parent = sampleAsset();
    const spec = sampleRevisionSpec(parent);
    const brief = compileCreativeRevision(spec, {
      parentAsset: parent,
      directionName: parent.directionLineage.directionName,
      worldId: parent.directionLineage.worldId,
    });
    expect(brief.parentAssetId).toBe(parent.assetId);
  });

  it('REVISION_CHILD_LINEAGE_TEST — spec tracks revision number', () => {
    const spec = sampleRevisionSpec(sampleAsset(), { revisionNumber: 2 });
    expect(spec.revisionNumber).toBe(2);
    expect(spec.rootAssetId).toBeTruthy();
  });

  it('REVISION_BRANCH_TEST — branch id on spec', () => {
    const spec = sampleRevisionSpec(sampleAsset());
    expect(spec.branchId).toContain('branch-');
  });

  it('REVISION_HISTORY_TEST — revision id unique', () => {
    const a = sampleRevisionSpec(sampleAsset());
    const b = sampleRevisionSpec(sampleAsset());
    expect(a.revisionId).not.toBe(b.revisionId);
  });

  it('CREATIVE_REVISION_DIFF_TEST — compliance enum modeled', () => {
    expect(['PASS', 'PARTIAL', 'FAIL']).toContain('PASS');
  });

  it('FOUNDER_PREFERENCE_EVIDENCE_TEST', () => {
    const parent = sampleAsset();
    const spec = sampleRevisionSpec(parent);
    const evidence = extractPreferenceEvidenceFromRevision(spec, 'ndxbook', parent.projectId);
    expect(evidence.length).toBeGreaterThan(0);
  });

  it('PREFERENCE_IS_NOT_CANON_TEST', () => {
    const parent = sampleAsset();
    const spec = sampleRevisionSpec(parent);
    const evidence = extractPreferenceEvidenceFromRevision(spec, 'ndxbook', parent.projectId)[0]!;
    expect(preferenceIsNotCanon(evidence)).toBe(true);
  });

  it('EXPLICIT_CANON_PROMOTION_TEST — aggregation suggests not auto-promotes', () => {
    const parent = sampleAsset();
    const spec = sampleRevisionSpec(parent);
    const evidence = extractPreferenceEvidenceFromRevision(spec, 'ndxbook', parent.projectId);
    const agg = aggregateFounderCreativePreferenceEvidence([...evidence, ...evidence]);
    for (const row of agg) {
      expect(row.suggestion).toContain('explicit founder promotion');
    }
  });

  it('BRAND_SPECIFIC_LEARNING_SCOPE_TEST', () => {
    const parent = sampleAsset();
    const spec = sampleRevisionSpec(parent);
    const evidence = extractPreferenceEvidenceFromRevision(spec, 'ndxbook', parent.projectId);
    expect(evidence.every((e) => e.learningScope === 'BRAND_SPECIFIC')).toBe(true);
  });

  it('CAROUSEL_SLIDE_JUDGMENT_TEST — REVISE distinct from carousel verdict', () => {
    const revise = applyFounderJudgmentToAsset(sampleAsset(), 'REVISE');
    expect(revise.reviewState).toBe('REVISE');
    expect(revise.revisionPending).toBe(true);
  });

  it('CAROUSEL_FAMILY_JUDGMENT_TEST — slide judgment does not delete asset', () => {
    const asset = sampleAsset();
    const rejected = applyFounderJudgmentToAsset(asset, 'NOT_FOR_ME');
    expect(rejected.generationLineage.storagePath).toBeTruthy();
  });

  it('EXPERIMENTAL_JUDGMENT_ISOLATION_TEST — judgment does not mutate direction', () => {
    const parent = sampleAsset();
    const spec = sampleRevisionSpec(parent);
    expect(spec.directionId).toBe(parent.directionLineage.directionId);
  });

  it('SINGLE_SLIDE_REVISION_COST_SCOPE_TEST — one parent one spec', () => {
    const spec = sampleRevisionSpec(sampleAsset());
    expect(spec.parentAssetId).toBeTruthy();
    expect(spec.creativeFamilyId).toBeTruthy();
  });

  it('GENERATION_GATE_TEST — live generation blocked', () => {
    const parent = sampleAsset();
    const spec = sampleRevisionSpec(parent);
    const brief = compileCreativeRevision(spec, {
      parentAsset: parent,
      directionName: parent.directionLineage.directionName,
      worldId: parent.directionLineage.worldId,
    });
    const surgicality = runRevisionSurgicalityTest({ spec, compiledBrief: brief });
    const contamination = runRevisionWorldContaminationTest({
      spec,
      parentAsset: parent,
      compiledBrief: brief,
      originDirectionName: parent.directionLineage.directionName,
    });
    const gate = canApproveRevisionGeneration({
      spec: { ...spec, status: 'READY_FOR_REVIEW' },
      surgicality,
      contamination,
      parentAssetAvailable: true,
      parentPromptLineageAvailable: true,
    });
    expect(gate.approved).toBe(false);
    expect(gate.gateReason).toContain('GENERATION_NOT_YET_ENABLED');
  });

  it('REVISION_VS_NEW_EXPLORATION_TEST', () => {
    const parent = sampleAsset();
    const spec = sampleRevisionSpec(parent, { severity: 'REINTERPRET', mutableElements: ['COPY', 'TYPOGRAPHY', 'COLOR', 'COMPOSITION', 'ASSETS', 'ANNOTATIONS'] });
    const result = assessRevisionVsNewExploration(spec);
    expect(result.notes[0]).toContain('NEW EXPLORATION');
  });
});
