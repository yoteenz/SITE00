/**
 * Canonical creative range service integration — VITEST stub heroes, no FAL.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
import type { CoreDirectionFormationRecord, FormedCoreDirection } from '../creativeIntelligence/types.js';
import {
  NDXBOOK_V1_FORMATION_ID,
  NDXBOOK_V2_FORMATION_ID,
} from '../creativeIntelligence/founderComparisonSet.js';

vi.mock('../../../site00BrandLore/loreService.js', () => ({
  getOrReconcileBrandLoreForOrg: vi.fn(),
}));

vi.mock('../creativeIntelligence/directionExpressionSystemService.js', () => ({
  runSonnetDirectionExpressionSystem: vi.fn(),
}));

vi.mock('../creativeIntelligence/identityNativeArtDirectorService.js', () => ({
  runIdentityNativeArtDirector: vi.fn(),
}));

vi.mock('../creativeIntelligence/creativeExpressionService.js', () => ({
  runCreativeExpressionDirector: vi.fn(),
}));

vi.mock('../creativeIntelligence/copyQualityGate.js', () => ({
  runCopyQualityGate: vi.fn(),
  resolveHeroConceptAfterCopyGate: vi.fn((hero) => hero),
}));

vi.mock('../creativeIntelligence/identityNativeVisualBriefV2Compiler.js', () => ({
  compileIdentityNativeV2VisualBrief: vi.fn(() => ({ briefId: 'brief-1' })),
}));

vi.mock('../creativeIntelligence/formationStore/storeAdapter.js', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('../creativeIntelligence/formationStore/storeAdapter.js')
  >();
  return {
    ...actual,
    getFormationRecordById: vi.fn(),
  };
});

import * as formationStore from '../creativeIntelligence/formationStore/storeAdapter.js';
import { getOrReconcileBrandLoreForOrg } from '../../../site00BrandLore/loreService.js';
import { runSonnetDirectionExpressionSystem } from '../creativeIntelligence/directionExpressionSystemService.js';
import { runIdentityNativeArtDirector } from '../creativeIntelligence/identityNativeArtDirectorService.js';
import { runCreativeExpressionDirector } from '../creativeIntelligence/creativeExpressionService.js';
import { runCopyQualityGate } from '../creativeIntelligence/copyQualityGate.js';
import {
  executeCanonicalCreativeRangeValidation,
  getCanonicalRangePreflight,
} from './canonicalCreativeRangeService.js';
import * as rangeStore from './storeAdapter.js';
import { CANONICAL_CREATIVE_RANGE_EXPERIMENT } from '../../../../../shared/site00-brand-lore/canonicalCreativeRangeConstants.js';

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

function formation(
  formationId: string,
  version: number,
  names: string[],
): CoreDirectionFormationRecord {
  const dirs = names.map((n) => direction(n));
  return {
    formationId,
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
      formatLineageSummary: 'CAROUSEL_COVER: editorial',
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

describe('canonicalCreativeRangeService', () => {
  const v1 = formation(NDXBOOK_V1_FORMATION_ID, 1, [
    'THE MARKED-UP COPY',
    'THE COUNTDOWN ROOM',
    'THE PERSONAL ARCHIVE',
  ]);
  const v2 = formation(NDXBOOK_V2_FORMATION_ID, 2, [
    'THE ANNOTATED COPY',
    'THE ROOM WHERE IT HAPPENS',
    'THE INDEX',
  ]);

  beforeEach(() => {
    rangeStore.resetCanonicalCreativeRangeMemory();
    vi.mocked(getOrReconcileBrandLoreForOrg).mockResolvedValue({
      brandPersonality: null,
    } as never);
    vi.mocked(formationStore.getFormationRecordById).mockImplementation(async (id) => {
      if (id === NDXBOOK_V1_FORMATION_ID) return v1;
      if (id === NDXBOOK_V2_FORMATION_ID) return v2;
      return null;
    });
    vi.mocked(runSonnetDirectionExpressionSystem).mockResolvedValue({
      system: { directionId: 'des' },
      anthropicRequests: 1,
    } as never);
    vi.mocked(runIdentityNativeArtDirector).mockResolvedValue({
      artDirection: { directionId: 'iad' },
      anthropicRequests: 1,
    } as never);
    vi.mocked(runCreativeExpressionDirector).mockResolvedValue({
      creativeExpression: { expressionId: 'ces' },
      heroConcept: { headline: 'NDXBOOK', primaryProofFormat: 'CAROUSEL_COVER' },
      anthropicRequests: 1,
    } as never);
    vi.mocked(runCopyQualityGate).mockResolvedValue({
      scores: {},
      passed: true,
    } as never);
  });

  it('EXPERIMENT_CLASSIFICATION_ISOLATION_TEST', async () => {
    const preflight = await getCanonicalRangePreflight();
    expect(preflight.experimentClassification).toBe(CANONICAL_CREATIVE_RANGE_EXPERIMENT);
    expect(preflight.shadowRosterUsed).toBe(false);
  });

  it('FIRST_PASS_ONLY_TEST — stub execute generates one attempt per direction', async () => {
    const run = await executeCanonicalCreativeRangeValidation();
    expect(run.status).toBe('COMPLETE');
    expect(run.directions).toHaveLength(6);
    for (const d of run.directions) {
      expect(d.generationReceipt?.creativeAttemptCount).toBeLessThanOrEqual(1);
      if (d.firstPassStatus === 'STRONG') {
        expect(d.generationReceipt?.creativeAttemptCount).toBe(1);
      }
    }
  });

  it('NO_SHADOW_ROSTER_IN_CANONICAL_RANGE_TEST', async () => {
    const run = await executeCanonicalCreativeRangeValidation();
    expect(run.rosterTest?.shadowRosterUsed).toBe(false);
    expect(run.rosterTest?.passed).toBe(true);
  });
});
