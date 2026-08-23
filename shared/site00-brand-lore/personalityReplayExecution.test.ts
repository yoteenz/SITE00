/**
 * Blind personality replay downstream execution — idempotency + diagnostic tests.
 */

import { describe, expect, it, beforeEach, vi } from 'vitest';
import { synthesizeBrandLoreProfile } from './loreSynthesis.js';
import { synthesizeBrandPersonalityProfile } from './personalitySynthesis.js';

vi.mock('../../api/_lib/site00BrandLore/loreService.js', () => ({
  getOrReconcileBrandLoreForOrg: vi.fn(),
}));

vi.mock('../../api/_lib/site00BrandLore/storeAdapter.js', () => ({
  getBrandLoreProfileByOrgId: vi.fn(),
  saveBrandLoreProfile: vi.fn(),
}));

vi.mock('../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/formationService.js', () => ({
  runCoreDirectionFormation: vi.fn(),
}));

vi.mock('../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/directionExpressionSystemService.js', () => ({
  runSonnetDirectionExpressionSystem: vi.fn(),
}));

vi.mock('../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/identityNativeArtDirectorService.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/identityNativeArtDirectorService.js')>();
  return {
    ...actual,
    runIdentityNativeArtDirector: vi.fn(),
  };
});

vi.mock('../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/creativeExpressionService.js', () => ({
  runCreativeExpressionDirector: vi.fn(),
}));

vi.mock('../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/copyQualityGate.js', () => ({
  runCopyQualityGate: vi.fn(),
  resolveHeroConceptAfterCopyGate: vi.fn((hero) => hero),
}));

vi.mock('../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/identityNativeVisualBriefV2Compiler.js', () => ({
  compileIdentityNativeV2VisualBrief: vi.fn(() => ({ briefId: 'brief-1' })),
}));

vi.mock('../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/gptImage2VisualProviderAdapter.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/gptImage2VisualProviderAdapter.js')>();
  return {
    ...actual,
    generateIdentityNativeImageFromBrief: vi.fn(),
  };
});

vi.mock('../../api/_lib/site00Assts/storage.js', () => ({
  downloadUrlToBuffer: vi.fn(),
  uploadSite00AssetBuffer: vi.fn(),
}));

import {
  createNdxbookPersonalityReplay,
  saveReplayPersonalityAnswers,
  completeReplayPersonalityIntake,
  resetPersonalityReplayMemoryStore,
} from '../../api/_lib/site00Evolve/creativeDirection/personalityReplay/replayService.js';
import {
  buildReplayExecutionDiagnostic,
  executePersonalityReplayDownstream,
} from '../../api/_lib/site00Evolve/creativeDirection/personalityReplay/replayExecutionService.js';
import * as replayStore from '../../api/_lib/site00Evolve/creativeDirection/personalityReplay/replayStore/storeAdapter.js';
import { getOrReconcileBrandLoreForOrg } from '../../api/_lib/site00BrandLore/loreService.js';
import * as brandLoreStore from '../../api/_lib/site00BrandLore/storeAdapter.js';
import { runCoreDirectionFormation } from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/formationService.js';
import { runSonnetDirectionExpressionSystem } from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/directionExpressionSystemService.js';
import { runIdentityNativeArtDirector } from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/identityNativeArtDirectorService.js';
import { runCreativeExpressionDirector } from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/creativeExpressionService.js';
import { runCopyQualityGate } from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/copyQualityGate.js';

const ORG_ID = 'org-00000000-0000-4000-8000-000000000005';

const FULL_LORE = {
  belief: 'Money should make sense.',
  role: ['friend'],
  world: 'Financial truth under argument.',
  feeling: ['curious'],
  enemy: ['boring'],
  contradiction: ['serious-funny'],
  lineage: 'Editorial references.',
  'no-go': 'Stock finance imagery.',
  language: 'Receipts-first voice.',
};

const FULL_PERSONALITY: Record<string, string | string[]> = {
  'social-instinct': ['notices-missed'],
  confidence: ['receipts'],
  humor: ['dry-observation'],
  humanity: ['candid'],
  disagreement: ['shows-evidence'],
  edge: 'sharp',
  charm: ['wit'],
  observation: 'The footnote nobody reads.',
  memorability: 'The correction line.',
  'emotional-range': ['skeptical'],
  restraint: ['humor-cheapens'],
  'personality-tension': ['intelligent-playful'],
  'social-reaction': ['bring-receipts'],
  'self-correction': ['update-record'],
  'anti-personality': 'Try-hard slang.',
};

function buildReadyLoreProfile() {
  return synthesizeBrandLoreProfile({
    loreAnswers: FULL_LORE,
    organizationId: ORG_ID,
    orgSlug: 'ndxbook',
  });
}

function mockDownstreamChain() {
  vi.mocked(runCoreDirectionFormation).mockResolvedValue({
    record: {
      formationId: 'f1',
      formationVersion: 1,
      status: 'COMPLETE',
      finalDirections: [
        {
          directionId: 'd-shadow',
          directionName: 'FRESH SHADOW DIRECTION',
          oneLineThesis: 'Editorial proof under argument.',
        },
      ],
      candidateDirections: [],
      providerAccounting: { requestCount: 1, tokenUsage: { estimatedCostUsd: 0.01 } },
    },
  } as never);

  vi.mocked(runSonnetDirectionExpressionSystem).mockResolvedValue({
    system: { directionExpressionId: 'des-1' },
    anthropicRequests: 1,
  } as never);

  vi.mocked(runIdentityNativeArtDirector).mockResolvedValue({
    artDirection: { identityArtDirectionId: 'iad-1' },
    anthropicRequests: 1,
  } as never);

  vi.mocked(runCreativeExpressionDirector).mockResolvedValue({
    creativeExpression: { creativeExpressionId: 'ces-1' },
    heroConcept: { heroConceptId: 'hc-1', primaryProofFormat: 'CAROUSEL_COVER' },
    anthropicRequests: 1,
  } as never);

  vi.mocked(runCopyQualityGate).mockResolvedValue({
    scores: { pass: true, reasons: [] },
  } as never);
}

beforeEach(() => {
  vi.stubEnv('VITEST', 'true');
  vi.stubEnv('FAL_KEY', '');
  resetPersonalityReplayMemoryStore();
  const lore = buildReadyLoreProfile();
  vi.mocked(getOrReconcileBrandLoreForOrg).mockResolvedValue(lore);
  vi.mocked(brandLoreStore.getBrandLoreProfileByOrgId).mockResolvedValue({
    ...lore,
    brandPersonality: synthesizeBrandPersonalityProfile({ personalityAnswers: FULL_PERSONALITY }),
  });
  mockDownstreamChain();
});

describe('Replay submit + downstream dispatch', () => {
  it('complete intake sets execution job and runs downstream idempotently', async () => {
    let replay = await createNdxbookPersonalityReplay({ organizationId: ORG_ID, orgSlug: 'ndxbook' });
    replay = await saveReplayPersonalityAnswers({ replayId: replay.replayId, answers: FULL_PERSONALITY });
    replay = await completeReplayPersonalityIntake(replay.replayId);

    expect(replay.executionJobId).toBeTruthy();
    expect(replay.personalitySubmittedAt).toBeTruthy();
    expect(replay.status).toBe('COMPARISON_READY');
    expect(replay.heroAsset).toBeTruthy();
    expect(runCoreDirectionFormation).toHaveBeenCalledTimes(1);

    const again = await executePersonalityReplayDownstream(replay.replayId);
    expect(again.status).toBe('COMPARISON_READY');
    expect(runCoreDirectionFormation).toHaveBeenCalledTimes(1);
  });

  it('diagnostic reflects persisted checkpoint fields', async () => {
    let replay = await createNdxbookPersonalityReplay({ organizationId: ORG_ID, orgSlug: 'ndxbook' });
    replay = await saveReplayPersonalityAnswers({ replayId: replay.replayId, answers: FULL_PERSONALITY });
    replay = await replayStore.savePersonalityReplayRecord({
      ...replay,
      status: 'FORMATION_READY',
      personalitySubmittedAt: new Date().toISOString(),
      executionPhase: 'PERSONALITY_SUBMITTED',
    });

    const diagnostic = buildReplayExecutionDiagnostic(replay, 'memory');
    expect(diagnostic.personalityAnswersPersisted).toBe(true);
    expect(diagnostic.answerCount).toBe(Object.keys(FULL_PERSONALITY).length);
    expect(diagnostic.shadowPersonalitySynthesized).toBe(true);
    expect(diagnostic.downstreamJobCreated).toBe(false);
    expect(diagnostic.coreDirectionGenerated).toBe(false);
  });
});
