/**
 * P0.5E.4B.1 — Neural voice casting provider tests.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  BROWSER_SPEECHSYNTHESIS_RETIRED_FROM_FOUNDER_CASTING,
  NEURAL_VOICE_CASTING_PROVIDER_IMPLEMENTED,
  PLACEHOLDER_VOICE_ASSETS_NON_CANONICAL,
} from '../site00-studio-world-production/embodiedCharacterVoice/constants.js';
import {
  blocksCanonicalFromPlaceholder,
  buildNaturalConversationalPerformanceContract,
  canProgressJudgmentToCloseOrYes,
  classifyPlaceholderCalibrationEvidence,
  crossEmotionRequiresNaturalnessPass,
  evaluateNeuralVoiceNaturalness,
  isDevPlaceholderAuthority,
  NEURAL_CASTING_TERRITORIES,
  providerAuthorityForEndpoint,
  selectNeuralVoiceCastingModel,
} from '../site00-studio-world-production/embodiedCharacterVoice/neuralVoiceCasting.js';
import {
  applyHumanWomanTest,
  initializeNeuralCastingState,
  planNeuralVoiceCalibrationRound,
} from '../site00-studio-world-production/embodiedCharacterVoice/neuralVoiceCalibrationEngine.js';
import {
  applyVoiceHypothesisJudgment,
  buildEmptyVoiceCalibrationState,
  compileNextVoiceCalibrationRound,
} from '../site00-studio-world-production/embodiedCharacterVoice/voiceCalibrationEngine.js';
import { buildDefaultVoiceCapabilityRegistry, buildSyntheticCalibrationCapability } from '../site00-studio-world-production/embodiedCharacterVoice/voiceGenerationCapability.js';
import { isNeuralProviderConfigured } from '../../api/_lib/site00Evolve/founderCharacterDiscovery/neuralVoiceGenerationService.js';
import {
  getNeuralVoiceCastingEstimate,
  saveFounderHumanWomanTest,
  startFounderNeuralVoiceAudition,
} from '../../api/_lib/site00Evolve/founderCharacterDiscovery/founderCharacterDiscoveryService.js';
import {
  resetFounderCharacterDiscoveryMemory,
  resetFounderCharacterDiscoveryStoreModeCache,
} from '../../api/_lib/site00Evolve/founderCharacterDiscovery/founderCharacterDiscoveryStoreAdapter.js';
import { initializeFounderCharacterDiscoveryRoom } from '../../api/_lib/site00Evolve/founderCharacterDiscovery/founderCharacterDiscoveryService.js';

const ROOT = join(process.cwd());

describe('P0.5E.4B.1 — Neural voice casting', () => {
  beforeEach(() => {
    resetFounderCharacterDiscoveryMemory();
    resetFounderCharacterDiscoveryStoreModeCache();
  });

  it('1–2. Browser SpeechSynthesis classified DEV_PLACEHOLDER; cannot establish canonical', () => {
    expect(NEURAL_VOICE_CASTING_PROVIDER_IMPLEMENTED).toBe(true);
    expect(BROWSER_SPEECHSYNTHESIS_RETIRED_FROM_FOUNDER_CASTING).toBe(true);
    expect(isDevPlaceholderAuthority('DEV_PLACEHOLDER')).toBe(true);
    expect(providerAuthorityForEndpoint('site00/synthetic-voice-calibration')).toBe('DEV_PLACEHOLDER');
    expect(providerAuthorityForEndpoint('fal-ai/minimax/speech-02-hd')).toBe('PRODUCTION_CANDIDATE');
  });

  it('3–4. Neural provider required; placeholder judgments preserved', () => {
    let state = buildEmptyVoiceCalibrationState({ projectId: 'p', brandId: 'b', characterId: 'c' });
    const { state: s1, hypotheses } = compileNextVoiceCalibrationRound(state);
    state = classifyPlaceholderCalibrationEvidence(s1);
    expect(state.placeholderHypothesisIds.length).toBeGreaterThan(0);
    expect(hypotheses.every((h) => h.isDevPlaceholder)).toBe(true);
    expect(blocksCanonicalFromPlaceholder(hypotheses[0]!)).toBe(true);
  });

  it('5–8. START NEURAL AUDITION plans same-line 4 candidates', () => {
    const state = initializeNeuralCastingState(
      buildEmptyVoiceCalibrationState({ projectId: 'p', brandId: 'b', characterId: 'c' }),
      true,
    );
    const { round, hypotheses, contracts } = planNeuralVoiceCalibrationRound(state);
    expect(round.isNeuralRound).toBe(true);
    expect(round.sameLineAcrossCandidates).toBe(true);
    expect(hypotheses.length).toBe(4);
    expect(new Set(hypotheses.map((h) => h.spokenCopy)).size).toBe(1);
    expect(contracts.length).toBe(4);
    expect(hypotheses[0]!.providerAuthority).not.toBe('DEV_PLACEHOLDER');
  });

  it('9–11. Model selection + schema + natural performance contract', () => {
    const caps = buildDefaultVoiceCapabilityRegistry();
    const selection = selectNeuralVoiceCastingModel({ capabilities: caps });
    expect(selection.schemaVerified).toBe(true);
    expect(selection.endpoint).toContain('minimax');
    const perf = buildNaturalConversationalPerformanceContract();
    expect(perf.discouragedDelivery).toContain('AI ASSISTANT');
    expect(perf.discouragedDelivery).toContain('ANNOUNCER');
    const validFalVoiceIds = new Set([
      'Calm_Woman', 'Lively_Girl', 'Wise_Woman', 'Soft_Girl', 'Friendly_Person',
      'Exuberant_Girl', 'Energetic_Girl', 'Attractive_Girl', 'Lovely_Girl',
    ]);
    expect(NEURAL_CASTING_TERRITORIES.every((t) => validFalVoiceIds.has(t.providerVoiceId))).toBe(true);
    expect(NEURAL_CASTING_TERRITORIES.some((t) => t.providerVoiceId.startsWith('English_'))).toBe(false);
  });

  it('12–17. Naturalness QA + human woman test separate from character fit', () => {
    const state = initializeNeuralCastingState(
      buildEmptyVoiceCalibrationState({ projectId: 'p', brandId: 'b', characterId: 'c' }),
      true,
    );
    const { state: s1, hypotheses } = planNeuralVoiceCalibrationRound(state);
    const evalSynth = evaluateNeuralVoiceNaturalness({
      hypothesisId: hypotheses[0]!.id,
      humanWomanTest: 'NO_SOUNDS_SYNTHETIC',
      providerAuthority: 'DEV_PLACEHOLDER',
      isDevPlaceholder: true,
    });
    expect(evalSynth.passes).toBe(false);
    expect(evalSynth.failures).toContain('FAIL_ROBOTIC_TTS');
    let s2 = applyHumanWomanTest(s1, hypotheses[0]!.id, 'YES_SOUNDS_HUMAN');
    expect(s2.hypotheses[0]!.naturalnessPass).toBe(true);
    const gate = canProgressJudgmentToCloseOrYes(s2.hypotheses[0]!, 'YES_THATS_HER');
    expect(gate.allowed).toBe(true);
  });

  it('18–22. CLOSE refines region; NO rejects; candidate persisted', () => {
    let state = initializeNeuralCastingState(
      buildEmptyVoiceCalibrationState({ projectId: 'p', brandId: 'b', characterId: 'c' }),
      true,
    );
    const { state: s1, hypotheses } = planNeuralVoiceCalibrationRound(state);
    state = applyHumanWomanTest(s1, hypotheses[0]!.id, 'YES_SOUNDS_HUMAN');
    state = applyVoiceHypothesisJudgment(state, hypotheses[0]!.id, 'CLOSE');
    expect(state.neuralCandidates.some((c) => c.founderStatus === 'CLOSE')).toBe(true);
    state = applyVoiceHypothesisJudgment(state, hypotheses[1]!.id, 'NO_NOT_HER');
    expect(state.rejectedProviderVoiceIds).toContain(hypotheses[1]!.voiceId);
    expect(hypotheses[0]!.neuralCandidateId).toBeTruthy();
  });

  it('27. Cross-emotion requires naturalness pass', () => {
    let state = initializeNeuralCastingState(
      buildEmptyVoiceCalibrationState({ projectId: 'p', brandId: 'b', characterId: 'c' }),
      true,
    );
    expect(crossEmotionRequiresNaturalnessPass(state)).toBe(true);
    const { state: s1, hypotheses } = planNeuralVoiceCalibrationRound(state);
    state = applyHumanWomanTest(s1, hypotheses[0]!.id, 'YES_SOUNDS_HUMAN');
    expect(crossEmotionRequiresNaturalnessPass(state)).toBe(false);
  });

  it('36–38. No auto generation; founder-trigger; cost estimate', async () => {
    await initializeFounderCharacterDiscoveryRoom({ projectId: 'ndxbook' });
    const est = await getNeuralVoiceCastingEstimate({ projectId: 'ndxbook' });
    expect(est.estimate.estimatedCostUsd).toBeGreaterThan(0);
    const audition = await startFounderNeuralVoiceAudition({ projectId: 'ndxbook' });
    expect(audition.run.voiceCalibrationState!.falRequests).toBeGreaterThan(0);
    expect(audition.run.voiceCalibrationState!.hypotheses.some((h) => h.audioUrl)).toBe(true);
  });

  it('40–42. Safety + generic architecture', () => {
    const generic = readFileSync(join(ROOT, 'shared/site00-studio-world-production/embodiedCharacterVoice/neuralVoiceCasting.ts'), 'utf8');
    expect(generic).not.toMatch(/NDXBOOK|Black woman/i);
    expect(buildSyntheticCalibrationCapability().knownLimitations.some((l) => l.includes('DEV_PLACEHOLDER'))).toBe(true);
    expect(PLACEHOLDER_VOICE_ASSETS_NON_CANONICAL).toBe(true);
  });

  it('API human woman test persists', async () => {
    await initializeFounderCharacterDiscoveryRoom({ projectId: 'ndxbook' });
    const { run } = await startFounderNeuralVoiceAudition({ projectId: 'ndxbook' });
    const hypoId = run.voiceCalibrationState!.hypotheses.find((h) => !h.isDevPlaceholder)!.id;
    const updated = await saveFounderHumanWomanTest({
      projectId: 'ndxbook',
      hypothesisId: hypoId,
      response: 'MOSTLY_HUMAN',
    });
    expect(updated.voiceCalibrationState!.hypotheses.find((h) => h.id === hypoId)!.humanWomanTest).toBe('MOSTLY_HUMAN');
  });
});

describe('P0.5E.4B.1 — provider config detection', () => {
  it('vitest enables mock neural generation path', () => {
    expect(isNeuralProviderConfigured()).toBe(true);
  });
});
