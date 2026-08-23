import { describe, expect, it, beforeEach } from 'vitest';
import { randomUUID } from 'node:crypto';
import {
  resolveCanonicalCreativeRangeDirectionsFromFormations,
  runCanonicalSixDirectionRosterTest,
} from './canonicalCreativeRangeResolver.js';
import { buildCanonicalRangeGenerationPreflight } from './canonicalRangeGenerationPreflight.js';
import {
  compileDirectionDnaEnvelope,
  compareDnaEnvelopes,
  runCrossDirectionGenerationContaminationTest,
} from './directionDnaEnvelope.js';
import {
  deriveNativeFormatForDirection,
  runFormatAssignmentContaminationTest,
  computeObservedFormatDiversity,
} from './directionNativeFormatSelection.js';
import { deriveFormatNativeExpressionProfile } from './formatNativeExpression.js';
import {
  CANONICAL_CREATIVE_RANGE_EXPERIMENT,
  BLIND_FORMATION_CONSISTENCY_EXPERIMENT,
  CANONICAL_NDXBOOK_DIRECTION_NAMES,
} from './canonicalCreativeRangeConstants.js';
import { assertNoHostFontInPayload } from './typographyProvenance.js';
import type { CoreDirectionFormationRecord, FormedCoreDirection } from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/types.js';

function direction(name: string): FormedCoreDirection {
  return {
    directionId: randomUUID(),
    directionName: name,
    bigIdea: `${name} big idea`,
    oneLineThesis: `${name} thesis`,
    brandConnection: 'connected',
    loreLineage: ['lore'],
    conceptualAncestor: 'ancestor',
    culturalReference: 'ref',
    emotionalPromise: 'promise',
    audienceRole: 'audience',
    brandRole: 'brand',
    visualMetaphor: `${name} metaphor`,
    governingBehavior: `${name} behavior`,
    materialImageryLanguage: 'material',
    imageryLanguage: 'imagery',
    typographicAttitude: 'Sans editorial',
    coreColorLogic: 'Ink and accent',
    colorLogic: 'Ink and accent',
    signatureDevices: ['device'],
    primaryBrandArtifact: 'artifact',
    motionSeed: 'motion',
    socialExpressionHypothesis: 'social',
    proprietaryQuality: 'prop',
    antiDirection: ['generic'],
    risks: ['risk'],
    qualityConfidence: 'MEDIUM',
  };
}

function formation(version: number, names: string[]): CoreDirectionFormationRecord {
  const dirs = names.map((n) => direction(n));
  return {
    formationId: randomUUID(),
    organizationId: '7681ab75-bddc-43e5-b594-79fcf8168205',
    projectId: null,
    brandLoreProfileId: 'profile',
    brandLoreProfileVersion: 24,
    brandLoreFingerprint: '5e71f429',
    formationVersion: version,
    providerId: 'anthropic',
    modelId: 'claude-sonnet-4-6',
    promptVersion: 'v1',
    status: 'READY_FOR_VISUAL_PRODUCTION',
    idempotencyKey: `k-${version}`,
    formationInput: {
      organizationId: '7681ab75-bddc-43e5-b594-79fcf8168205',
      brandExpressionContext: 'SOCIAL_FIRST_EDITORIAL',
      referenceEvidence: [],
      formationVersion: version,
      formatLineage: ['CAROUSEL_COVER'],
      brandPersonalitySummary: 'personality',
    } as never,
    candidateDirections: dirs,
    criticResult: null,
    revisionRounds: 0,
    finalDirections: dirs,
    visualProofPlans: [],
    legacyStaticPreview: 'PRESERVED',
    proposedFormationLabel: 'PROPOSED',
    providerAccounting: {
      providerId: 'anthropic',
      modelId: 'claude-sonnet-4-6',
      requestCount: 1,
      revisionCount: 0,
      formationRequests: 1,
      critiqueRequests: 0,
      reviseRequests: 0,
      tokenUsage: {},
    },
    directionCompletionOverlays: [],
    error: null,
    errorCode: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

describe('canonical creative range validation', () => {
  const v1 = formation(1, ['THE MARKED-UP COPY', 'THE COUNTDOWN ROOM', 'THE PERSONAL ARCHIVE']);
  const v2 = formation(2, ['THE ANNOTATED COPY', 'THE ROOM WHERE IT HAPPENS', 'THE INDEX']);

  it('CANONICAL_SIX_DIRECTION_ROSTER_TEST passes for canonical v1+v2', () => {
    const roster = resolveCanonicalCreativeRangeDirectionsFromFormations({ v1, v2 });
    const test = runCanonicalSixDirectionRosterTest({ roster, shadowRosterUsed: false });
    expect(test.passed).toBe(true);
    expect(test.directionCount).toBe(6);
    expect(test.uniqueCanonicalDirectionCount).toBe(6);
    expect(roster.map((r) => r.canonicalName)).toEqual([...CANONICAL_NDXBOOK_DIRECTION_NAMES]);
  });

  it('NO_NEAR_MISS_DIRECTION_SUBSTITUTION_TEST rejects THE MARKED COPY', () => {
    const badV1 = formation(1, ['THE MARKED COPY', 'THE COUNTDOWN ROOM', 'THE PERSONAL ARCHIVE']);
    expect(() => resolveCanonicalCreativeRangeDirectionsFromFormations({ v1: badV1, v2 })).toThrow(
      'THE MARKED-UP COPY',
    );
  });

  it('FORMAT_SELECTION_DERIVED_FROM_DIRECTION_TEST', () => {
    const roster = resolveCanonicalCreativeRangeDirectionsFromFormations({ v1, v2 });
    const formatProfile = deriveFormatNativeExpressionProfile({
      context: 'SOCIAL_FIRST_EDITORIAL',
      profile: { brandPersonality: null } as never,
    });
    const sel = deriveNativeFormatForDirection({
      direction: roster[0]!.direction,
      formatProfile,
    });
    expect(sel.formatSelectionDerivedFromDirection).toBe(true);
  });

  it('CROSS_DIRECTION_GENERATION_CONTAMINATION_TEST passes clean payload', () => {
    const result = runCrossDirectionGenerationContaminationTest({ promptPayload: { brandLore: true } });
    expect(result.passed).toBe(true);
  });

  it('preflight ready with complete formations', async () => {
    const preflight = await buildCanonicalRangeGenerationPreflight({
      brandSlug: 'ndxbook',
      profile: { brandPersonality: null } as never,
      v1,
      v2,
    });
    expect(preflight.canonicalRangeGenerationReady).toBe(true);
    expect(preflight.shadowRosterUsed).toBe(false);
    expect(preflight.experimentClassification).toBe('CANONICAL_CREATIVE_RANGE_VALIDATION');
  });

  it('DNA envelope typography and palette derived from direction', () => {
    const roster = resolveCanonicalCreativeRangeDirectionsFromFormations({ v1, v2 });
    const formatProfile = deriveFormatNativeExpressionProfile({
      context: 'SOCIAL_FIRST_EDITORIAL',
      profile: { brandPersonality: null } as never,
    });
    const fmt = deriveNativeFormatForDirection({ direction: roster[0]!.direction, formatProfile });
    const dna = compileDirectionDnaEnvelope({
      direction: roster[0]!.direction,
      canonicalName: roster[0]!.canonicalName,
      comparisonIndex: 1,
      formatSelection: fmt,
    });
    expect(dna.hostTypographyExcluded).toBe(true);
    expect(dna.typographyDerivedFromDirection).toBe(true);
    expect(dna.paletteDerivedFromDirection).toBe(true);
  });

  it('CANONICAL_DIRECTION_UNIQUENESS_TEST', () => {
    const roster = resolveCanonicalCreativeRangeDirectionsFromFormations({ v1, v2 });
    const names = roster.map((r) => r.canonicalName);
    expect(new Set(names).size).toBe(6);
  });

  it('NO_SHADOW_ROSTER_IN_CANONICAL_RANGE_TEST', () => {
    const roster = resolveCanonicalCreativeRangeDirectionsFromFormations({ v1, v2 });
    const test = runCanonicalSixDirectionRosterTest({ roster, shadowRosterUsed: false });
    expect(test.shadowRosterUsed).toBe(false);
    expect(test.passed).toBe(true);
  });

  it('HOST_FONT_LEAKAGE_TEST on DNA envelope payload', () => {
    const roster = resolveCanonicalCreativeRangeDirectionsFromFormations({ v1, v2 });
    const formatProfile = deriveFormatNativeExpressionProfile({
      context: 'SOCIAL_FIRST_EDITORIAL',
      profile: { brandPersonality: null } as never,
    });
    const fmt = deriveNativeFormatForDirection({ direction: roster[0]!.direction, formatProfile });
    const dna = compileDirectionDnaEnvelope({
      direction: roster[0]!.direction,
      canonicalName: roster[0]!.canonicalName,
      comparisonIndex: 1,
      formatSelection: fmt,
    });
    expect(assertNoHostFontInPayload(dna).passed).toBe(true);
  });

  it('DIRECTION_TYPOGRAPHY_PROVENANCE_TEST', () => {
    const roster = resolveCanonicalCreativeRangeDirectionsFromFormations({ v1, v2 });
    const formatProfile = deriveFormatNativeExpressionProfile({
      context: 'SOCIAL_FIRST_EDITORIAL',
      profile: { brandPersonality: null } as never,
    });
    for (const entry of roster) {
      const fmt = deriveNativeFormatForDirection({ direction: entry.direction, formatProfile });
      const dna = compileDirectionDnaEnvelope({
        direction: entry.direction,
        canonicalName: entry.canonicalName,
        comparisonIndex: entry.comparisonIndex,
        formatSelection: fmt,
      });
      expect(dna.typographyDerivedFromDirection).toBe(true);
      expect(dna.typographySelectionSource).toBe('CANONICAL_CORE_DIRECTION');
    }
  });

  it('DIRECTION_PALETTE_PROVENANCE_TEST', () => {
    const roster = resolveCanonicalCreativeRangeDirectionsFromFormations({ v1, v2 });
    const formatProfile = deriveFormatNativeExpressionProfile({
      context: 'SOCIAL_FIRST_EDITORIAL',
      profile: { brandPersonality: null } as never,
    });
    for (const entry of roster) {
      const fmt = deriveNativeFormatForDirection({ direction: entry.direction, formatProfile });
      const dna = compileDirectionDnaEnvelope({
        direction: entry.direction,
        canonicalName: entry.canonicalName,
        comparisonIndex: entry.comparisonIndex,
        formatSelection: fmt,
      });
      expect(dna.paletteDerivedFromDirection).toBe(true);
      expect(dna.paletteSource).toBe('CANONICAL_CORE_DIRECTION');
    }
  });

  it('NO_FORMAT_ROTATION_TEST and NO_FORMAT_DIVERSITY_QUOTA_TEST', () => {
    const roster = resolveCanonicalCreativeRangeDirectionsFromFormations({ v1, v2 });
    const formatProfile = deriveFormatNativeExpressionProfile({
      context: 'SOCIAL_FIRST_EDITORIAL',
      profile: { brandPersonality: null } as never,
    });
    for (const entry of roster) {
      const sel = deriveNativeFormatForDirection({ direction: entry.direction, formatProfile });
      const contamination = runFormatAssignmentContaminationTest(sel);
      expect(contamination.rotationAlgorithmUsed).toBe(false);
      expect(contamination.diversityQuotaInfluenced).toBe(false);
      expect(contamination.priorDirectionFormatInfluenced).toBe(false);
    }
  });

  it('SOCIAL_NATIVE_OUTPUT_TEST — formats are social-native', () => {
    const roster = resolveCanonicalCreativeRangeDirectionsFromFormations({ v1, v2 });
    const formatProfile = deriveFormatNativeExpressionProfile({
      context: 'SOCIAL_FIRST_EDITORIAL',
      profile: { brandPersonality: null } as never,
    });
    const socialFormats = new Set([
      'FEED_TILE',
      'CAROUSEL_COVER',
      'CAROUSEL_SEQUENCE',
      'STORY_FRAME',
      'STORY_SEQUENCE',
      'REEL_HOOK',
      'REEL_FRAME',
      'TIKTOK_VERTICAL',
      'MOTION_KEYFRAME',
      'CONTENT_FRANCHISE',
      'SAVEABLE_REFERENCE_POST',
    ]);
    for (const entry of roster) {
      const sel = deriveNativeFormatForDirection({ direction: entry.direction, formatProfile });
      expect(socialFormats.has(sel.nativeFormat)).toBe(true);
    }
  });

  it('NO_SIBLING_HERO_REFERENCE_TEST', () => {
    const result = runCrossDirectionGenerationContaminationTest({
      promptPayload: { siblingVisualBrief: 'forbidden' },
    });
    expect(result.passed).toBe(false);
    expect(result.siblingPromptReferenced).toBe(true);
  });

  it('EXPERIMENT_CLASSIFICATION_ISOLATION_TEST', () => {
    expect(CANONICAL_CREATIVE_RANGE_EXPERIMENT).toBe('CANONICAL_CREATIVE_RANGE_VALIDATION');
    expect(BLIND_FORMATION_CONSISTENCY_EXPERIMENT).toBe('BLIND_FORMATION_CONSISTENCY_VALIDATION');
    expect(CANONICAL_CREATIVE_RANGE_EXPERIMENT).not.toBe(BLIND_FORMATION_CONSISTENCY_EXPERIMENT);
  });

  it('ZERO_MEANS_EVALUATED_ZERO_TEST — collapse only on duplicate names', () => {
    const roster = resolveCanonicalCreativeRangeDirectionsFromFormations({ v1, v2 });
    const formatProfile = deriveFormatNativeExpressionProfile({
      context: 'SOCIAL_FIRST_EDITORIAL',
      profile: { brandPersonality: null } as never,
    });
    const envelopes = roster.map((entry) => {
      const fmt = deriveNativeFormatForDirection({ direction: entry.direction, formatProfile });
      return compileDirectionDnaEnvelope({
        direction: entry.direction,
        canonicalName: entry.canonicalName,
        comparisonIndex: entry.comparisonIndex,
        formatSelection: fmt,
      });
    });
    const pairs = [];
    for (let i = 0; i < envelopes.length; i += 1) {
      for (let j = i + 1; j < envelopes.length; j += 1) {
        pairs.push(compareDnaEnvelopes(envelopes[i]!, envelopes[j]!));
      }
    }
    expect(pairs.every((p) => !p.collapseSuspected)).toBe(true);
  });

  it('duplicate formats allowed — observed diversity not enforced', () => {
    const observed = computeObservedFormatDiversity(['CAROUSEL_COVER', 'CAROUSEL_COVER', 'FEED_TILE']);
    expect(observed.duplicateFormatsAllowed).toBe(true);
    expect(observed.notes.some((n) => n.includes('independently selected'))).toBe(true);
  });
});
