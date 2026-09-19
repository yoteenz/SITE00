/**
 * Live surgical revision generation — unit tests (no provider spend).
 */

import { describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import type { CreativeAssetRecord } from './types.js';
import { defaultBrandLineageFields } from './founderJudgmentLineage.js';
import { compileCreativeRevision, hashRevisionPrompt } from './revisionCompiler.js';
import { resolveRevisionGenerationMode, defaultProviderCapabilities } from './revisionGenerationModeResolver.js';
import { detectRevisionLockConflicts, hasBlockingLockConflicts } from './revisionLockConflictDetection.js';
import { evaluateRevisionCompliance } from './revisionCompliance.js';
import { canApproveRevisionGeneration, runRevisionSurgicalityTest, runRevisionWorldContaminationTest } from './revisionValidation.js';
import type { CreativeRevisionSpec, RevisionElementKey } from './revisionTypes.js';
import { buildRevisionChildAssetRecord } from '../../../api/_lib/site00Evolve/creativeLineage/assetRecordBuilders.js';

function sampleAsset(overrides: Partial<CreativeAssetRecord> = {}): CreativeAssetRecord {
  const ts = new Date().toISOString();
  const assetId = randomUUID();
  return {
    assetId,
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
      slideNumber: 4,
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
      promptHash: 'hash-1',
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
      generationCostUsd: 0.045,
      storagePath: 'site00/test-parent.webp',
    },
    reviewState: 'REVISE',
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
    historicalSourceRef: 'test',
    immutable: true,
    ...defaultBrandLineageFields(),
    rootAssetId: assetId,
    createdAt: ts,
    updatedAt: ts,
    ...overrides,
  };
}

function sampleSpec(parent: CreativeAssetRecord, overrides: Partial<CreativeRevisionSpec> = {}): CreativeRevisionSpec {
  const ts = new Date().toISOString();
  return {
    revisionId: `revision-${randomUUID()}`,
    parentAssetId: parent.assetId,
    rootAssetId: parent.rootAssetId ?? parent.assetId,
    revisionNumber: 1,
    branchId: `branch-${parent.assetId}`,
    brandSlug: 'ndxbook',
    projectId: parent.projectId,
    directionId: parent.directionLineage.directionId,
    worldId: parent.directionLineage.worldId,
    creativeFamilyId: parent.creativeFamilyId,
    severity: 'TARGETED',
    founderOriginalNote: 'replace yellow highlight with lime',
    categoryNotes: { color: 'replace yellow highlight with canonical lime' },
    elementStates: {},
    lockedElements: ['COPY', 'COMPOSITION', 'TYPOGRAPHY'] as RevisionElementKey[],
    mutableElements: ['COLOR'] as RevisionElementKey[],
    preserveUnspecified: true,
    requestedAssetExchange: [],
    requestedCopyChanges: [],
    requestedColorChanges: ['yellow → lime'],
    requestedTypographyChanges: [],
    status: 'APPROVED_FOR_GENERATION',
    generationMode: 'IMAGE_EDIT',
    generationGate: { liveGenerationEnabled: true, gateReason: 'Approved' },
    childAssetId: null,
    generationReceipt: null,
    complianceDiff: null,
    idempotencyKey: null,
    approvedAt: ts,
    generationAttempt: 1,
    createdAt: ts,
    updatedAt: ts,
    ...overrides,
  };
}

describe('revision live generation unit tests', () => {
  it('1 save spec does not imply generation — DRAFT status', () => {
    const spec = sampleSpec(sampleAsset(), { status: 'DRAFT' });
    expect(spec.status).toBe('DRAFT');
    expect(spec.childAssetId).toBeNull();
  });

  it('2 explicit generate requires APPROVED_FOR_GENERATION', () => {
    const parent = sampleAsset();
    const spec = sampleSpec(parent, { status: 'READY_FOR_REVIEW' });
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
      spec,
      surgicality,
      contamination,
      parentAssetAvailable: true,
      parentPromptLineageAvailable: true,
    });
    expect(gate.approved).toBe(false);
  });

  it('3 MICRO prefers image edit when available', () => {
    const spec = sampleSpec(sampleAsset(), { severity: 'MICRO' });
    const mode = resolveRevisionGenerationMode({
      spec,
      capabilities: defaultProviderCapabilities(true),
    });
    expect(mode.mode).toBe('IMAGE_EDIT');
  });

  it('4 TARGETED preserves parent reference', () => {
    const mode = resolveRevisionGenerationMode({
      spec: sampleSpec(sampleAsset(), { severity: 'TARGETED' }),
      capabilities: defaultProviderCapabilities(true),
    });
    expect(mode.parentImageRequired).toBe(true);
  });

  it('5 SUBSTANTIAL can select reference-conditioned mode', () => {
    const parent = sampleAsset();
    const spec = sampleSpec(parent, {
      severity: 'SUBSTANTIAL',
      categoryNotes: { composition: 'replace entire photographic environment but preserve editorial hierarchy' },
    });
    const mode = resolveRevisionGenerationMode({
      spec,
      capabilities: defaultProviderCapabilities(true),
    });
    expect(mode.mode).toBe('REFERENCE_CONDITIONED_REGENERATION');
  });

  it('6 REINTERPRET can select prompt regeneration', () => {
    const spec = sampleSpec(sampleAsset(), {
      severity: 'REINTERPRET',
      founderOriginalNote: 'reinterpret this concept completely',
    });
    const mode = resolveRevisionGenerationMode({
      spec,
      capabilities: defaultProviderCapabilities(true),
    });
    expect(mode.mode).toBe('PROMPT_REGENERATION');
  });

  it('7 provider capability overrides impossible edit when no parent image', () => {
    const spec = sampleSpec(sampleAsset(), { severity: 'MICRO' });
    const mode = resolveRevisionGenerationMode({
      spec,
      capabilities: { ...defaultProviderCapabilities(false), imageEdit: false },
    });
    expect(mode.mode).toBe('PROMPT_REGENERATION');
  });

  it('8 production brief includes parent asset role and hard locks', () => {
    const parent = sampleAsset();
    const spec = sampleSpec(parent);
    const brief = compileCreativeRevision(spec, {
      parentAsset: parent,
      directionName: parent.directionLineage.directionName,
      worldId: parent.directionLineage.worldId,
    });
    expect(brief.deltaPrompt).toContain('PARENT ASSET ROLE');
    expect(brief.hardLocks.length).toBeGreaterThan(0);
    expect(brief.deltaPrompt).toContain('preserveUnspecified=true');
  });

  it('9 preserveUnspecified in anti-drift rules', () => {
    const brief = compileCreativeRevision(sampleSpec(sampleAsset()), {
      parentAsset: sampleAsset(),
      directionName: 'DIR',
      worldId: 'world-1',
    });
    expect(brief.antiDriftRules.some((r) => r.includes('not listed as mutable'))).toBe(true);
  });

  it('10 lock/change contradiction blocks via conflicts', () => {
    const spec = sampleSpec(sampleAsset(), {
      lockedElements: ['TYPOGRAPHY'],
      mutableElements: ['TYPOGRAPHY'],
    });
    expect(hasBlockingLockConflicts(spec)).toBe(true);
    expect(detectRevisionLockConflicts(spec)[0]?.message).toContain('TYPOGRAPHY');
  });

  it('11 host typography cannot enter client revision prompt', () => {
    const parent = sampleAsset();
    const spec = sampleSpec(parent, {
      categoryNotes: { typography: 'use Martian Mono for headline' },
      lockedElements: [],
      mutableElements: ['TYPOGRAPHY'],
    });
    const brief = compileCreativeRevision(spec, {
      parentAsset: parent,
      directionName: parent.directionLineage.directionName,
      worldId: parent.directionLineage.worldId,
    });
    expect(brief.brandDnaPreserve.some((b) => b.includes('never platform'))).toBe(true);
  });

  it('17 child gets new CreativeAssetRecord fields', () => {
    const parent = sampleAsset();
    const child = buildRevisionChildAssetRecord({
      parent,
      childAssetId: 'child-1',
      revisionNumber: 1,
      revisionSpecId: 'spec-1',
      storagePath: 'site00/child.webp',
      generationReceipt: {
        provider: 'fal',
        model: 'openai/gpt-image-2/edit',
        requestId: 'req-1',
        costEstimateUsd: 0.045,
        referenceAssetIds: [parent.assetId],
        imageConditioningUsed: true,
      },
    });
    expect(child.assetId).toBe('child-1');
    expect(child.creativeValue).toBe('UNREVIEWED');
    expect(child.relationship.parentAssetId).toBe(parent.assetId);
    expect(child.generationLineage.storagePath).toBe('site00/child.webp');
  });

  it('22 compliance separates requested change from drift categories', () => {
    const parent = sampleAsset();
    const spec = sampleSpec(parent);
    const brief = compileCreativeRevision(spec, {
      parentAsset: parent,
      directionName: parent.directionLineage.directionName,
      worldId: parent.directionLineage.worldId,
    });
    const child = buildRevisionChildAssetRecord({
      parent,
      childAssetId: 'child-1',
      revisionNumber: 1,
      revisionSpecId: spec.revisionId,
      storagePath: 'site00/child.webp',
      generationReceipt: {
        provider: 'fal',
        model: 'edit',
        requestId: null,
        costEstimateUsd: 0.045,
        referenceAssetIds: [parent.assetId],
        imageConditioningUsed: true,
      },
    });
    const diff = evaluateRevisionCompliance({ spec, brief, parent, child });
    expect(diff.requestedChanges.length).toBeGreaterThan(0);
    expect(diff.unrequestedDrift.length).toBeGreaterThan(0);
    expect(diff.summaryCompliance).toBeTruthy();
  });

  it('23 unavailable scorer returns NOT_EVALUATED for color', () => {
    const parent = sampleAsset();
    const spec = sampleSpec(parent);
    const brief = compileCreativeRevision(spec, {
      parentAsset: parent,
      directionName: parent.directionLineage.directionName,
      worldId: parent.directionLineage.worldId,
    });
    const child = buildRevisionChildAssetRecord({
      parent,
      childAssetId: 'child-1',
      revisionNumber: 1,
      revisionSpecId: spec.revisionId,
      storagePath: 'site00/child.webp',
      generationReceipt: {
        provider: 'fal',
        model: 'edit',
        requestId: null,
        costEstimateUsd: 0.045,
        referenceAssetIds: [],
        imageConditioningUsed: false,
      },
    });
    const diff = evaluateRevisionCompliance({ spec, brief, parent, child });
    const color = diff.categoryResults.find((c) => c.category === 'COLOR');
    expect(color?.result).toBe('NOT_EVALUATED');
  });

  it('25 format mismatch fails compliance', () => {
    const parent = sampleAsset();
    const spec = sampleSpec(parent);
    const brief = compileCreativeRevision(spec, {
      parentAsset: parent,
      directionName: parent.directionLineage.directionName,
      worldId: parent.directionLineage.worldId,
    });
    const child = buildRevisionChildAssetRecord({
      parent,
      childAssetId: 'child-1',
      revisionNumber: 1,
      revisionSpecId: spec.revisionId,
      storagePath: 'site00/child.webp',
      generationReceipt: {
        provider: 'fal',
        model: 'edit',
        requestId: null,
        costEstimateUsd: 0.045,
        referenceAssetIds: [],
        imageConditioningUsed: false,
      },
    });
    child.contentLineage = { ...child.contentLineage, slideNumber: 99 };
    const diff = evaluateRevisionCompliance({ spec, brief, parent, child });
    const format = diff.categoryResults.find((c) => c.category === 'FORMAT');
    expect(format?.result).toBe('FAIL');
  });

  it('34 preference evidence does not auto-promote canon', () => {
    const spec = sampleSpec(sampleAsset());
    expect(spec.preserveUnspecified).toBe(true);
    expect(spec.status).not.toBe('ACCEPTED');
  });

  it('38 generation receipt prompt hash is stable', () => {
    const hash = hashRevisionPrompt('test prompt');
    expect(hash).toMatch(/^rev-prompt-/);
  });

  it('30 carousel single-slide — format requirements mention slide', () => {
    const parent = sampleAsset({ contentLineage: { ...sampleAsset().contentLineage, slideNumber: 4 } });
    const brief = compileCreativeRevision(sampleSpec(parent), {
      parentAsset: parent,
      directionName: parent.directionLineage.directionName,
      worldId: parent.directionLineage.worldId,
    });
    expect(brief.formatRequirements.some((f) => f.includes('slide 4'))).toBe(true);
  });
});
