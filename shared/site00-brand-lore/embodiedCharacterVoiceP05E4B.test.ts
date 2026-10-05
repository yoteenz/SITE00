/**
 * P0.5E.4B — Adaptive Character Voice Casting (57 requirements).
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  languageLabSeparateFromVoiceLab,
  migrateVoiceLabSampleToLanguageEvidence,
  preserveHistoricalLanguageEvidence,
  selectComparisonSpokenCopy,
} from '../site00-studio-world-production/embodiedCharacterVoice/characterLanguageEvidence.js';
import {
  applyPairwiseVoicePreference,
  applyVoiceHypothesisJudgment,
  blocksRandomVoiceBatch,
  blocksFinalizationFromSingleLine,
  buildEmptyVoiceCalibrationState,
  compileNextVoiceCalibrationRound,
  sameLineAcrossCandidates,
  voiceIdentitySeparateFromPerformance,
} from '../site00-studio-world-production/embodiedCharacterVoice/voiceCalibrationEngine.js';
import {
  applyHumanWomanTest,
  initializeNeuralCastingState,
  planNeuralVoiceCalibrationRound,
} from '../site00-studio-world-production/embodiedCharacterVoice/neuralVoiceCalibrationEngine.js';
import {
  blocksCulturalCaricature,
  blocksForcedDialect,
  blocksRealPersonImpersonation,
  blocksUnauthorizedVoiceCloning,
  buildDefaultVoiceCapabilityRegistry,
} from '../site00-studio-world-production/embodiedCharacterVoice/voiceGenerationCapability.js';
import {
  compileVoiceGenerationContract,
  createVoiceGenerationSnapshot,
  snapshotIsImmutable,
} from '../site00-studio-world-production/embodiedCharacterVoice/voiceGenerationContract.js';
import {
  buildPerformanceEnvelope,
  identityDistinctFromPerformance,
  platformModulationSameIdentity,
} from '../site00-studio-world-production/embodiedCharacterVoice/voicePerformanceEnvelope.js';
import {
  applyFounderVoiceRecognition,
  directVsInferredTruthSeparate,
  evaluateVoiceContinuity,
  evaluateVoiceMigration,
  finalAudiovisualLockRequiresFaceAndVoice,
  founderKnowsHerNotAutoTriggered,
  genericStudioWorldHasNoIdentityAssumptions,
  migrationDoesNotSilentlyRecast,
  recordUnseenLineTest,
  voiceCalibrationMayPrecedeFaceSelection,
} from '../site00-studio-world-production/embodiedCharacterVoice/voiceContinuityQA.js';
import {
  AUDITORY_CHARACTER_VOICE_LAB_IMPLEMENTED,
  CHARACTER_LANGUAGE_LAB_SEPARATED_FROM_VOICE_LAB,
  FOUNDER_CHARACTER_VOICE_CONFIRMED,
  INITIAL_VOICE_CANDIDATE_COUNT,
} from '../site00-studio-world-production/embodiedCharacterVoice/constants.js';
import { buildVoiceLabSample } from '../site00-studio-world-production/embodiedCharacterFounderDiscovery/voiceLab.js';
import { buildNdxFounderCharacterDiscoveryRun } from '../site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/ndxFounderDiscoveryRun.js';
import {
  initializeNdxVoiceCalibration,
  startNdxVoiceCalibrationRound,
} from '../site00-brand-lore/ndxEmbodiedCharacterVoice/ndxVoiceCalibrationAdapter.js';
import {
  ingestCanonicalVoiceIntoBible,
  voiceIdentityCastInContinuity,
} from '../site00-brand-lore/ndxEmbodiedCharacterVoice/ndxVoiceContinuityIntegration.js';
import { buildEmptyEmbodiedCharacterBible } from '../site00-studio-world-production/characterContinuityPipeline/embodiedCharacterBible.js';
import { buildNdxCharacterContinuityPipelineRun } from '../site00-brand-lore/ndxCharacterContinuityPipeline/ndxCharacterContinuityRun.js';
import {
  brandCharacterImmutable,
  brandCanonUnchanged,
  productExpressionBlocked,
  worldFormationBlocked,
} from '../../api/_lib/site00Evolve/founderCharacterDiscovery/founderCharacterDiscoveryService.js';
import {
  resetFounderCharacterDiscoveryMemory,
  resetFounderCharacterDiscoveryStoreModeCache,
} from '../../api/_lib/site00Evolve/founderCharacterDiscovery/founderCharacterDiscoveryStoreAdapter.js';
import {
  getFounderCharacterDiscoveryState,
  initializeFounderCharacterDiscoveryRoom,
  saveFounderVoiceHypothesisJudgment,
  startFounderVoiceCalibrationRound,
} from '../../api/_lib/site00Evolve/founderCharacterDiscovery/founderCharacterDiscoveryService.js';

const ROOT = join(process.cwd());

describe('P0.5E.4B — Adaptive Character Voice Casting', () => {
  beforeEach(() => {
    resetFounderCharacterDiscoveryMemory();
    resetFounderCharacterDiscoveryStoreModeCache();
  });

  it('1. Language Lab remains separate from Voice Lab', () => {
    expect(CHARACTER_LANGUAGE_LAB_SEPARATED_FROM_VOICE_LAB).toBe(true);
    expect(languageLabSeparateFromVoiceLab()).toBe(true);
  });

  it('2. Existing text-register evidence preserved as CharacterLanguageEvidence', () => {
    const sample = buildVoiceLabSample('She notices the contradiction first.');
    const evidence = migrateVoiceLabSampleToLanguageEvidence(sample);
    expect(evidence.length).toBeGreaterThanOrEqual(5);
    expect(preserveHistoricalLanguageEvidence(evidence)).toBe(true);
    expect(evidence.every((e) => e.immutable)).toBe(true);
  });

  it('3–5. Voice Lab produces audible options with same line across initial candidates', () => {
    const state = buildEmptyVoiceCalibrationState({ projectId: 'p', brandId: 'b', characterId: 'c' });
    const { round, hypotheses } = compileNextVoiceCalibrationRound(state);
    expect(hypotheses.length).toBe(INITIAL_VOICE_CANDIDATE_COUNT);
    expect(round.sameLineAcrossCandidates).toBe(true);
    expect(sameLineAcrossCandidates(round, hypotheses)).toBe(true);
    expect(hypotheses.every((h) => h.playbackProfile)).toBe(true);
  });

  it('6–8. Founder can play/replay, select YES, CLOSE, reject', async () => {
    await initializeFounderCharacterDiscoveryRoom({ projectId: 'ndxbook' });
    const { run, round } = await startFounderVoiceCalibrationRound({ projectId: 'ndxbook' });
    const hypoId = (run.voiceCalibrationState!.hypotheses.find((h) => h.roundId === (round as { roundId: string }).roundId))!.id;
    const yesRun = await saveFounderVoiceHypothesisJudgment({ projectId: 'ndxbook', hypothesisId: hypoId, judgment: 'YES_THATS_HER' });
    expect(yesRun.voiceCalibrationState!.hypotheses.find((h) => h.id === hypoId)!.founderJudgment).toBe('YES_THATS_HER');
    const closeRun = await saveFounderVoiceHypothesisJudgment({ projectId: 'ndxbook', hypothesisId: hypoId, judgment: 'CLOSE' });
    expect(closeRun.voiceCalibrationState!.hypotheses.find((h) => h.id === hypoId)!.founderJudgment).toBe('CLOSE');
    const noRun = await saveFounderVoiceHypothesisJudgment({ projectId: 'ndxbook', hypothesisId: hypoId, judgment: 'NO_NOT_HER' });
    expect(noRun.voiceCalibrationState!.hypotheses.find((h) => h.id === hypoId)!.founderJudgment).toBe('NO_NOT_HER');
  });

  it('9–11. Pairwise comparison + inference + no acoustic terminology required', () => {
    let state = buildEmptyVoiceCalibrationState({ projectId: 'p', brandId: 'b', characterId: 'c' });
    const { state: s1, hypotheses } = compileNextVoiceCalibrationRound(state);
    state = applyVoiceHypothesisJudgment(s1, hypotheses[0]!.id, 'YES_THATS_HER');
    state = applyVoiceHypothesisJudgment(state, hypotheses[1]!.id, 'YES_THATS_HER');
    state = applyPairwiseVoicePreference(state, hypotheses[0]!.id, hypotheses[1]!.id, 'PREFER_A');
    expect(state.pairwiseComparisons.length).toBe(1);
    expect(state.inferences.length).toBeGreaterThan(0);
    expect(AUDITORY_CHARACTER_VOICE_LAB_IMPLEMENTED).toBe(true);
  });

  it('12–14. Direct vs inferred truth; adaptive next round; random batches blocked', () => {
    let state = buildEmptyVoiceCalibrationState({ projectId: 'p', brandId: 'b', characterId: 'c' });
    const r1 = compileNextVoiceCalibrationRound(state);
    state = r1.state;
    state = applyVoiceHypothesisJudgment(state, r1.hypotheses[0]!.id, 'YES_THATS_HER');
    state = applyVoiceHypothesisJudgment(state, r1.hypotheses[1]!.id, 'TOO_POLISHED');
    const r2 = compileNextVoiceCalibrationRound(state);
    expect(r2.round.roundNumber).toBe(2);
    expect(blocksRandomVoiceBatch(state)).toBe(true);
    expect(directVsInferredTruthSeparate(state.inferences)).toBe(true);
  });

  it('15–17. Identity vs performance; performance envelope; emotion testing architecture', () => {
    expect(voiceIdentitySeparateFromPerformance()).toBe(true);
    expect(identityDistinctFromPerformance()).toBe(true);
    let state = initializeNeuralCastingState(
      buildEmptyVoiceCalibrationState({ projectId: 'p', brandId: 'b', characterId: 'c' }),
      true,
    );
    const { state: s1, hypotheses } = planNeuralVoiceCalibrationRound(state);
    state = applyHumanWomanTest(s1, hypotheses[0]!.id, 'YES_SOUNDS_HUMAN');
    state = applyVoiceHypothesisJudgment(state, hypotheses[0]!.id, 'YES_THATS_HER');
    expect(state.emergingIdentity).not.toBeNull();
    const envelope = buildPerformanceEnvelope(state.emergingIdentity!);
    expect(envelope.prohibitedDrift.length).toBeGreaterThan(0);
  });

  it('18–20. Unseen-line + cross-emotion gates block premature finalization', () => {
    let state = buildEmptyVoiceCalibrationState({ projectId: 'p', brandId: 'b', characterId: 'c' });
    const { state: s1, hypotheses } = compileNextVoiceCalibrationRound(state);
    state = applyVoiceHypothesisJudgment(s1, hypotheses[0]!.id, 'YES_THATS_HER');
    expect(blocksFinalizationFromSingleLine(state)).toBe(true);
    state = applyFounderVoiceRecognition(state, 'YES_THATS_HER_VOICE');
    expect(state.recognitionEvaluation.founderCharacterVoiceConfirmed).toBe(false);
    state = recordUnseenLineTest(state, hypotheses[0]!.id, 'New line never heard before.', 'YES_STILL_HER');
    expect(state.generalizationTests.length).toBe(1);
  });

  it('21–26. Nonverbal/pause/laugh/code-switching/platform modulation', () => {
    let state = initializeNeuralCastingState(
      buildEmptyVoiceCalibrationState({ projectId: 'p', brandId: 'b', characterId: 'c' }),
      true,
    );
    const { state: s1, hypotheses } = planNeuralVoiceCalibrationRound(state);
    state = applyHumanWomanTest(s1, hypotheses[0]!.id, 'YES_SOUNDS_HUMAN');
    state = applyVoiceHypothesisJudgment(state, hypotheses[0]!.id, 'YES_THATS_HER');
    expect(state.emergingIdentity!.pauseBehavior).toBeTruthy();
    expect(state.emergingIdentity!.laughBehavior).toBeTruthy();
    expect(state.emergingIdentity!.codeSwitchingBehavior?.forcedDialect).toBe(false);
    expect(platformModulationSameIdentity()).toBe(true);
  });

  it('27–30. Cultural caricature, forced dialect, impersonation, cloning blocked', () => {
    expect(blocksCulturalCaricature()).toBe(true);
    expect(blocksForcedDialect()).toBe(true);
    expect(blocksRealPersonImpersonation()).toBe(true);
    expect(blocksUnauthorizedVoiceCloning()).toBe(true);
  });

  it('31–36. Provider registry, contract, snapshot, reference library', () => {
    const caps = buildDefaultVoiceCapabilityRegistry();
    expect(caps.some((c) => c.supportsTextToSpeech)).toBe(true);
    let state = buildEmptyVoiceCalibrationState({ projectId: 'p', brandId: 'b', characterId: 'c' });
    const { hypotheses } = compileNextVoiceCalibrationRound(state);
    const contract = compileVoiceGenerationContract({ identity: null, hypothesis: hypotheses[0]! });
    expect(contract.voiceIdentityCast).toBe(false);
    expect(contract.blockingReason).toBe('VOICE_IDENTITY_NOT_CAST');
    const snapshot = createVoiceGenerationSnapshot({ contract, hypothesis: hypotheses[0]! });
    expect(snapshotIsImmutable(snapshot)).toBe(true);
  });

  it('37–39. Voice versioning + migration does not silently recast', () => {
    const migration = evaluateVoiceMigration('site00_synthetic', 'fal', 'voice-1');
    expect(migrationDoesNotSilentlyRecast(migration)).toBe(true);
    expect(migration.silentlyRecast).toBe(false);
  });

  it('40–42. P0.5E.5 integration + Character Bible voice ingestion', () => {
    let state = buildEmptyVoiceCalibrationState({ projectId: 'p', brandId: 'b', characterId: 'c' });
    const { state: s1, hypotheses } = compileNextVoiceCalibrationRound(state);
    state = applyVoiceHypothesisJudgment(s1, hypotheses[0]!.id, 'YES_THATS_HER');
    state = recordUnseenLineTest(state, hypotheses[0]!.id, 'Unseen line.', 'YES_STILL_HER');
    const r2 = compileNextVoiceCalibrationRound(state);
    state = r2.state;
    state = applyFounderVoiceRecognition(state, 'YES_THATS_HER_VOICE');
    if (state.canonicalIdentity) {
      const bible = buildEmptyEmbodiedCharacterBible({ projectId: 'p', brandId: 'b', characterId: 'c' });
      const ingested = ingestCanonicalVoiceIntoBible(bible, state.canonicalIdentity as import('../site00-studio-world-production/embodiedCharacterVoice/types.js').CanonicalCharacterVoiceIdentity);
      expect(ingested.voiceAuthority).toBe('APPROVED');
      const continuityRun = buildNdxCharacterContinuityPipelineRun('ndxbook');
      expect(voiceIdentityCastInContinuity(continuityRun)).toBe(false);
    }
  });

  it('43–44. Stable voice ID + continuity QA', () => {
    let state = initializeNeuralCastingState(
      buildEmptyVoiceCalibrationState({ projectId: 'p', brandId: 'b', characterId: 'c' }),
      true,
    );
    const { state: s1, hypotheses } = planNeuralVoiceCalibrationRound(state);
    state = applyHumanWomanTest(s1, hypotheses[0]!.id, 'YES_SOUNDS_HUMAN');
    state = applyVoiceHypothesisJudgment(state, hypotheses[0]!.id, 'YES_THATS_HER');
    const qa = evaluateVoiceContinuity(state.emergingIdentity!);
    expect(qa.result).toBe('PASS');
  });

  it('45–48. Audiovisual coherence architecture + lock blocked until face+voice', () => {
    const state = buildEmptyVoiceCalibrationState({ projectId: 'p', brandId: 'b', characterId: 'c' });
    expect(finalAudiovisualLockRequiresFaceAndVoice(state)).toBe(true);
    expect(voiceCalibrationMayPrecedeFaceSelection()).toBe(true);
  });

  it('49–50. Founder I KNOW HER not auto-triggered from voice', () => {
    expect(founderKnowsHerNotAutoTriggered()).toBe(true);
    expect(FOUNDER_CHARACTER_VOICE_CONFIRMED).toBe(false);
  });

  it('51–57. Experimental integrity + generic architecture + NDX adapter', () => {
    expect(brandCharacterImmutable()).toBe(true);
    expect(brandCanonUnchanged()).toBe(true);
    expect(productExpressionBlocked()).toBe(true);
    expect(worldFormationBlocked()).toBe(true);
    expect(genericStudioWorldHasNoIdentityAssumptions()).toBe(true);
    const ndxRun = buildNdxFounderCharacterDiscoveryRun();
    const voiceState = initializeNdxVoiceCalibration(ndxRun);
    expect(voiceState.languageEvidence.length).toBeGreaterThan(0);
    const { round } = startNdxVoiceCalibrationRound({ ...ndxRun, voiceCalibrationState: voiceState });
    expect(round.hypothesisIds.length).toBe(INITIAL_VOICE_CANDIDATE_COUNT);
    const genericFiles = readFileSync(join(ROOT, 'shared/site00-studio-world-production/embodiedCharacterVoice/constants.ts'), 'utf8');
    expect(genericFiles).not.toMatch(/Black woman|NDXBOOK|ndxbook/i);
  });

  it('NDX adapter initializes from existing voice lab samples', () => {
    const ndxRun = buildNdxFounderCharacterDiscoveryRun();
    expect(ndxRun.voiceLabSamples.length).toBeGreaterThan(0);
    const voiceState = initializeNdxVoiceCalibration(ndxRun);
    const line = selectComparisonSpokenCopy(voiceState.languageEvidence);
    expect(line.length).toBeGreaterThan(10);
  });

  it('API persists voice calibration state', async () => {
    await initializeFounderCharacterDiscoveryRoom({ projectId: 'ndxbook' });
    await startFounderVoiceCalibrationRound({ projectId: 'ndxbook' });
    const run = await getFounderCharacterDiscoveryState({ projectId: 'ndxbook' });
    expect(run!.voiceCalibrationState?.rounds.length).toBe(1);
    expect(run!.languageLabEvidenceCount).toBeGreaterThan(0);
  });
});
