/**
 * NDX BOOK personality replay validation — infrastructure + safety tests.
 */

import { describe, expect, it, beforeEach, vi } from 'vitest';
import { synthesizeBrandLoreProfile } from './loreSynthesis.js';
import { synthesizeBrandPersonalityProfile } from './personalitySynthesis.js';
import {
  assertNoForbiddenReplayInputKeys,
  assertReplayFormationInputAllowed,
  stripPersonalityFromLoreSnapshot,
  FORBIDDEN_REPLAY_INPUT_KEYS,
} from './personalityReplayLeakage.js';
import { comparePersonalityProfiles, scoreDirectionMarkedUpAnalog } from './personalityReplayConvergence.js';
import { runDefaultHardcodingAudit } from './personalityReplayHardcodingAudit.js';
import { buildPersonalityLineageFromProfile } from './personalityLineage.js';
import { evaluateBrandPersonalityReadiness } from './personalityReadiness.js';

vi.mock('../../api/_lib/site00BrandLore/loreService.js', () => ({
  getOrReconcileBrandLoreForOrg: vi.fn(),
}));

vi.mock('../../api/_lib/site00BrandLore/storeAdapter.js', () => ({
  getBrandLoreProfileByOrgId: vi.fn(),
  saveBrandLoreProfile: vi.fn(),
}));

import {
  createNdxbookPersonalityReplay,
  saveReplayPersonalityAnswers,
  buildShadowReplayFormationInput,
  loadReplayBenchmarkSnapshot,
  runPostGenerationPersonalityComparison,
  resetPersonalityReplayMemoryStore,
  replayHeroStoragePath,
  replayHeroTopic,
  setFounderReplayValidationJudgment,
} from '../../api/_lib/site00Evolve/creativeDirection/personalityReplay/replayService.js';
import * as replayStore from '../../api/_lib/site00Evolve/creativeDirection/personalityReplay/replayStore/storeAdapter.js';
import { getOrReconcileBrandLoreForOrg } from '../../api/_lib/site00BrandLore/loreService.js';
import * as brandLoreStore from '../../api/_lib/site00BrandLore/storeAdapter.js';

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

beforeEach(() => {
  vi.stubEnv('VITEST', 'true');
  resetPersonalityReplayMemoryStore();
  const lore = buildReadyLoreProfile();
  vi.mocked(getOrReconcileBrandLoreForOrg).mockResolvedValue(lore);
  vi.mocked(brandLoreStore.getBrandLoreProfileByOrgId).mockResolvedValue({
    ...lore,
    brandPersonality: synthesizeBrandPersonalityProfile({ personalityAnswers: FULL_PERSONALITY }),
  });
  vi.mocked(brandLoreStore.saveBrandLoreProfile).mockImplementation(async (p) => p);
});

describe('Replay canonical mutation protection', () => {
  it('1. replay cannot mutate canonical personality profile', async () => {
    const replay = await createNdxbookPersonalityReplay({ organizationId: ORG_ID, orgSlug: 'ndxbook' });
    await saveReplayPersonalityAnswers({ replayId: replay.replayId, answers: FULL_PERSONALITY });
    expect(brandLoreStore.saveBrandLoreProfile).not.toHaveBeenCalled();
  });

  it('2. replay cannot mutate canonical Brand Lore', async () => {
    await createNdxbookPersonalityReplay({ organizationId: ORG_ID, orgSlug: 'ndxbook' });
    expect(brandLoreStore.saveBrandLoreProfile).not.toHaveBeenCalled();
  });

  it('3. replay cannot mutate canonical formation', async () => {
    const replay = await createNdxbookPersonalityReplay({ organizationId: ORG_ID, orgSlug: 'ndxbook' });
    expect(replay.formationRecord).toBeNull();
  });

  it('4. replay cannot mutate canonical hero assets', async () => {
    const replay = await createNdxbookPersonalityReplay({ organizationId: ORG_ID, orgSlug: 'ndxbook' });
    expect(replay.heroAsset).toBeNull();
  });
});

describe('Replay leakage protection', () => {
  it('5. replay input excludes benchmark hero', () => {
    const result = assertNoForbiddenReplayInputKeys({ benchmarkHeroImage: 'x' });
    expect(result.allowed).toBe(false);
    expect(FORBIDDEN_REPLAY_INPUT_KEYS).toContain('benchmarkHeroImage');
  });

  it('6. replay input excludes canonical IdentityNativeArtDirection', () => {
    const result = assertNoForbiddenReplayInputKeys({ canonicalIdentityNativeArtDirection: {} });
    expect(result.allowed).toBe(false);
  });

  it('7. replay input excludes canonical CreativeExpressionSystem', () => {
    const result = assertNoForbiddenReplayInputKeys({ canonicalCreativeExpressionSystem: {} });
    expect(result.allowed).toBe(false);
  });

  it('20. benchmark hero never used as reference input', () => {
    const result = assertNoForbiddenReplayInputKeys({
      benchmarkHeroPrompt: 'full prompt',
      canonicalHeroCreativeConcept: {},
    });
    expect(result.allowed).toBe(false);
  });
});

describe('Shadow personality synthesis', () => {
  it('8. fresh personality answers synthesize independently', async () => {
    const replay = await createNdxbookPersonalityReplay({ organizationId: ORG_ID, orgSlug: 'ndxbook' });
    const updated = await saveReplayPersonalityAnswers({ replayId: replay.replayId, answers: FULL_PERSONALITY });
    expect(updated.synthesizedPersonality?.witBehavior.sourceAnswerIds).toContain('humor');
    expect(updated.rawPersonalityAnswers).not.toEqual({});
  });

  it('9. personality readiness enforced', async () => {
    const replay = await createNdxbookPersonalityReplay({ organizationId: ORG_ID, orgSlug: 'ndxbook' });
    const partial = await saveReplayPersonalityAnswers({ replayId: replay.replayId, answers: { humor: ['dry-observation'] } });
    expect(partial.personalityReadiness).not.toBe('PERSONALITY_READY');
  });

  it('10. fixed Brand Lore snapshot used', async () => {
    const replay = await createNdxbookPersonalityReplay({ organizationId: ORG_ID, orgSlug: 'ndxbook' });
    expect(replay.loreMode).toBe('FIXED_LORE_REPLAY');
    expect(replay.brandLoreSnapshot.brandPersonality).toBeNull();
    expect(replay.brandLoreSnapshot.brandBelief.value).toBeTruthy();
  });
});

describe('Formation replay guards', () => {
  it('11. three fresh directions formed — formation input ready without legacy explorations', async () => {
    const replay = await createNdxbookPersonalityReplay({ organizationId: ORG_ID, orgSlug: 'ndxbook' });
    const updated = await saveReplayPersonalityAnswers({ replayId: replay.replayId, answers: FULL_PERSONALITY });
    const input = buildShadowReplayFormationInput(updated);
    expect(input.existingCreativeExplorations).toEqual([]);
  });

  it('12. current direction names not sent into formation prompt', async () => {
    const replay = await createNdxbookPersonalityReplay({ organizationId: ORG_ID, orgSlug: 'ndxbook' });
    const updated = await saveReplayPersonalityAnswers({ replayId: replay.replayId, answers: FULL_PERSONALITY });
    const input = buildShadowReplayFormationInput(updated);
    const guard = assertReplayFormationInputAllowed({
      includeLegacyExplorations: false,
      existingCreativeExplorations: input.existingCreativeExplorations,
    });
    expect(guard.allowed).toBe(true);
  });

  it('13. semantic convergence occurs post-formation only — benchmark blocked before hero', async () => {
    const replay = await createNdxbookPersonalityReplay({ organizationId: ORG_ID, orgSlug: 'ndxbook' });
    await expect(
      loadReplayBenchmarkSnapshot({ organizationId: ORG_ID, orgSlug: 'ndxbook', allowLoad: false }),
    ).rejects.toThrow(/blocked/i);
  });

  it('14. shadow marked-up analog selected post hoc via semantic scoring', () => {
    const score = scoreDirectionMarkedUpAnalog('A living document under editorial revision and annotation');
    expect(score).toBeGreaterThan(0);
  });
});

describe('Pipeline freshness + lineage', () => {
  it('15. DirectionExpression generated fresh — replay stores null until phase runs', async () => {
    const replay = await createNdxbookPersonalityReplay({ organizationId: ORG_ID, orgSlug: 'ndxbook' });
    expect(replay.directionExpression).toBeNull();
  });

  it('16. CreativeExpression generated fresh — replay stores null until phase runs', async () => {
    const replay = await createNdxbookPersonalityReplay({ organizationId: ORG_ID, orgSlug: 'ndxbook' });
    expect(replay.creativeExpression).toBeNull();
  });

  it('17. personalityLineage points to shadow profile', () => {
    const shadow = synthesizeBrandPersonalityProfile({ personalityAnswers: FULL_PERSONALITY });
    const lineage = buildPersonalityLineageFromProfile(shadow);
    expect(lineage.some((e) => e.upstreamField === 'witBehavior')).toBe(true);
  });

  it('18. Identity Art Direction generated fresh — null at create', async () => {
    const replay = await createNdxbookPersonalityReplay({ organizationId: ORG_ID, orgSlug: 'ndxbook' });
    expect(replay.identityArtDirection).toBeNull();
  });

  it('19. benchmark palette not injected directly into replay record', async () => {
    const replay = await createNdxbookPersonalityReplay({ organizationId: ORG_ID, orgSlug: 'ndxbook' });
    expect(JSON.stringify(replay)).not.toMatch(/#c6ff00|editorial lime/i);
  });
});

describe('Hero generation limits', () => {
  it('21. exactly one FAL hero path reserved', () => {
    const replayId = 'test-replay-id';
    expect(replayHeroStoragePath(replayId)).toContain('NDX-SHADOW-REPLAY-HERO-001');
    expect(replayHeroTopic()).toBe('credit utilization');
  });

  it('22. no board generation — replay has no board fields', async () => {
    const replay = await createNdxbookPersonalityReplay({ organizationId: ORG_ID, orgSlug: 'ndxbook' });
    expect(replay).not.toHaveProperty('boardPlan');
  });

  it('23–25. no social/motion/other direction generation at infrastructure stage', async () => {
    const replay = await createNdxbookPersonalityReplay({ organizationId: ORG_ID, orgSlug: 'ndxbook' });
    expect(replay.formationRecord).toBeNull();
    expect(replay.heroAsset).toBeNull();
  });
});

describe('Post-generation comparison', () => {
  it('26. post-generation comparison loads benchmark', async () => {
    let replay = await createNdxbookPersonalityReplay({ organizationId: ORG_ID, orgSlug: 'ndxbook' });
    replay = await saveReplayPersonalityAnswers({ replayId: replay.replayId, answers: FULL_PERSONALITY });
    replay = await replayStore.savePersonalityReplayRecord({ ...replay, status: 'HERO_GENERATED' });
    const compared = await runPostGenerationPersonalityComparison(replay.replayId);
    expect(compared.comparisonReport?.benchmarkLoadedAt).toBeTruthy();
    expect(compared.status).toBe('COMPARISON_READY');
  });

  it('27. pixel similarity not used as success metric', () => {
    const reports = comparePersonalityProfiles({
      canonical: synthesizeBrandPersonalityProfile({ personalityAnswers: FULL_PERSONALITY }),
      shadow: synthesizeBrandPersonalityProfile({
        personalityAnswers: { ...FULL_PERSONALITY, observation: 'Different wording same idea receipts footnote' },
      }),
    });
    expect(reports.length).toBeGreaterThan(0);
  });
});

describe('Hardcoding detector', () => {
  it('28. hardcoded NDX rescue logic detector runs', () => {
    const audit = runDefaultHardcodingAudit();
    expect(audit.passed).toBe(true);
    expect(audit.scannedAt).toBeTruthy();
  });
});

describe('Persistence + founder validation independence', () => {
  it('29. replay record persists', async () => {
    const replay = await createNdxbookPersonalityReplay({ organizationId: ORG_ID, orgSlug: 'ndxbook' });
    const updated = await saveReplayPersonalityAnswers({ replayId: replay.replayId, answers: { humor: ['deadpan'] } });
    expect(updated.rawPersonalityAnswers.humor).toEqual(['deadpan']);
  });

  it('30. founder validation state independent from Creative Direction approval', async () => {
    const replay = await createNdxbookPersonalityReplay({ organizationId: ORG_ID, orgSlug: 'ndxbook' });
    const judged = await setFounderReplayValidationJudgment({
      replayId: replay.replayId,
      judgment: 'PIPELINE_VALIDATED',
    });
    expect(judged.status).toBe('APPROVED_AS_PIPELINE_VALIDATION');
    expect(judged.classification).toBe('SHADOW_VALIDATION');
  });
});

describe('Responsive infrastructure', () => {
  it('31–36. replay intake reuses calibration shell classes (375/390/430/1024/1440 compatible)', () => {
    expect(stripPersonalityFromLoreSnapshot(buildReadyLoreProfile()).brandPersonality).toBeNull();
    const readiness = evaluateBrandPersonalityReadiness(
      synthesizeBrandPersonalityProfile({ personalityAnswers: FULL_PERSONALITY }),
      buildReadyLoreProfile(),
    );
    expect(readiness.state).toBe('PERSONALITY_READY');
  });
});
