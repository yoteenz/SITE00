/**
 * P0.5E.4B.1+ — Neural voice revision / regenerate loop tests.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import {
  NEURAL_VOICE_REGENERATE_REPLAY_SUPPORTED,
  NEURAL_VOICE_REVISION_LOOP_IMPLEMENTED,
} from '../site00-studio-world-production/embodiedCharacterVoice/constants.js';
import {
  applyFounderRevisionToVoiceHypothesis,
  NEURAL_VOICE_FOUNDER_REVISION_PIPELINE_IMPLEMENTED,
} from '../site00-studio-world-production/embodiedCharacterVoice/neuralVoiceFounderRevisionPipeline.js';
import {
  applyFounderNeuralVoiceRevision,
  applyNeuralVoiceRegenerationResult,
  NEURAL_VOICE_REGENERATE_CURRENT_SUPPORTED,
  NEURAL_VOICE_REPLAY_GENERATION_SUPPORTED,
  prepareNeuralVoiceRegeneration,
} from '../site00-studio-world-production/embodiedCharacterVoice/neuralVoiceRevisionEngine.js';
import {
  judgmentRequiresVoiceRevisionNote,
  isVoiceApprovalJudgment,
} from '../site00-studio-world-production/embodiedCharacterVoice/voiceFounderRevisionLabels.js';
import {
  initializeNeuralCastingState,
  planNeuralVoiceCalibrationRound,
} from '../site00-studio-world-production/embodiedCharacterVoice/neuralVoiceCalibrationEngine.js';
import { buildEmptyVoiceCalibrationState } from '../site00-studio-world-production/embodiedCharacterVoice/voiceCalibrationEngine.js';
import {
  initializeFounderCharacterDiscoveryRoom,
  regenerateFounderNeuralVoiceHypothesis,
  startFounderNeuralVoiceAudition,
  submitFounderNeuralVoiceRevision,
} from '../../api/_lib/site00Evolve/founderCharacterDiscovery/founderCharacterDiscoveryService.js';
import {
  resetFounderCharacterDiscoveryMemory,
  resetFounderCharacterDiscoveryStoreModeCache,
} from '../../api/_lib/site00Evolve/founderCharacterDiscovery/founderCharacterDiscoveryStoreAdapter.js';

describe('P0.5E.4B.1+ — Neural voice revision loop', () => {
  beforeEach(() => {
    resetFounderCharacterDiscoveryMemory();
    resetFounderCharacterDiscoveryStoreModeCache();
  });

  it('flags + revision label routing mirror V2.3 pattern', () => {
    expect(NEURAL_VOICE_REVISION_LOOP_IMPLEMENTED).toBe(true);
    expect(NEURAL_VOICE_REGENERATE_REPLAY_SUPPORTED).toBe(true);
    expect(NEURAL_VOICE_FOUNDER_REVISION_PIPELINE_IMPLEMENTED).toBe(true);
    expect(NEURAL_VOICE_REGENERATE_CURRENT_SUPPORTED).toBe(true);
    expect(NEURAL_VOICE_REPLAY_GENERATION_SUPPORTED).toBe(true);
    expect(isVoiceApprovalJudgment('CLOSE')).toBe(true);
    expect(judgmentRequiresVoiceRevisionNote('TOO_FAST')).toBe(true);
    expect(judgmentRequiresVoiceRevisionNote('VOICE_RIGHT_PERFORMANCE_WRONG')).toBe(true);
    expect(judgmentRequiresVoiceRevisionNote('CLOSE')).toBe(false);
  });

  it('applyFounderRevisionToVoiceHypothesis appends revisionHistory in GENERATING state', () => {
    const state = initializeNeuralCastingState(
      buildEmptyVoiceCalibrationState({ projectId: 'p', brandId: 'b', characterId: 'c' }),
      true,
    );
    const { hypotheses, contracts } = planNeuralVoiceCalibrationRound(state);
    const hypothesis = hypotheses[0]!;
    const selection = state.selectedCastingProvider!;
    const withContract = { ...hypothesis, castingContract: contracts[0]! };
    const revised = applyFounderRevisionToVoiceHypothesis({
      hypothesis: withContract,
      selection,
      judgment: 'TOO_FAST',
      founderNote: 'slow down, more attitude, late 20s Black woman',
    });
    expect(revised.generationStatus).toBe('GENERATING');
    expect(revised.revisionHistory).toHaveLength(1);
    expect(revised.revisionHistory![0]?.status).toBe('GENERATING');
    expect(revised.revisionHistory![0]?.founderNote).toContain('attitude');
    expect(revised.promptSnapshots!.length).toBeGreaterThan(0);
    expect(revised.castingContract?.fingerprint).toBeTruthy();
  });

  it('REGENERATE_CURRENT and REPLAY_GENERATION preserve lineage', () => {
    let state = initializeNeuralCastingState(
      buildEmptyVoiceCalibrationState({ projectId: 'p', brandId: 'b', characterId: 'c' }),
      true,
    );
    const planned = planNeuralVoiceCalibrationRound(state);
    state = planned.state;
    const hypothesisId = planned.hypotheses[0]!.id;
    const withMeta = {
      ...planned.hypotheses[0]!,
      castingContract: planned.contracts[0]!,
      audioUrl: 'https://vitest.local/a.mp3',
      promptSnapshots: [
        {
          snapshotId: 'snap-1',
          hypothesisId,
          contractFingerprint: planned.contracts[0]!.fingerprint,
          voiceSetting: planned.contracts[0]!.voiceSetting,
          performanceDirection: 'natural',
          spokenCopy: planned.hypotheses[0]!.spokenCopy,
          revisionDirective: null,
          triggerSource: 'INITIAL' as const,
          compiledAt: new Date().toISOString(),
          fingerprint: 'fp1',
        },
      ],
      generationAssets: [],
    };
    state = { ...state, hypotheses: state.hypotheses.map((h) => (h.id === hypothesisId ? withMeta : h)) };

    const regen = prepareNeuralVoiceRegeneration({ state, hypothesisId, mode: 'REGENERATE_CURRENT' });
    expect(regen.state.hypotheses[0]?.generationStatus).toBe('GENERATING');
    expect(regen.state.hypotheses[0]?.promptSnapshots!.length).toBe(2);

    const replay = prepareNeuralVoiceRegeneration({ state, hypothesisId, mode: 'REPLAY_GENERATION' });
    expect(replay.contract.spokenCopy).toBe(withMeta.spokenCopy);

    const done = applyNeuralVoiceRegenerationResult({
      state: regen.state,
      hypothesisId,
      audioUrl: 'https://vitest.local/b.mp3',
      durationMs: 5000,
      costUsd: 0.01,
    });
    expect(done.hypotheses[0]?.generationStatus).toBe('GENERATED');
    expect(done.hypotheses[0]?.generationAssets!.length).toBe(1);
    expect(done.hypotheses[0]?.generationAssets![0]?.lineageClassification).toBe('CURRENT');
  });

  it('service: founder revision + regenerate after neural audition', async () => {
    await initializeFounderCharacterDiscoveryRoom({ projectId: 'ndxbook' });
    const audition = await startFounderNeuralVoiceAudition({ projectId: 'ndxbook' });
    const hypothesisId = audition.run.voiceCalibrationState!.hypotheses[0]!.id;

    const revised = await submitFounderNeuralVoiceRevision({
      projectId: 'ndxbook',
      hypothesisId,
      judgment: 'VOICE_RIGHT_PERFORMANCE_WRONG',
      founderNote: 'more personality and attitude — less flat delivery',
    });
    const hypo = revised.voiceCalibrationState!.hypotheses.find((h) => h.id === hypothesisId)!;
    expect(hypo.revisionHistory!.length).toBeGreaterThan(0);
    expect(hypo.revisionHistory![0]?.status).toBe('GENERATED');
    expect(hypo.audioUrl).toContain('vitest.local');

    const regen = await regenerateFounderNeuralVoiceHypothesis({
      projectId: 'ndxbook',
      hypothesisId,
      mode: 'REGENERATE_CURRENT',
    });
    const regenHypo = regen.voiceCalibrationState!.hypotheses.find((h) => h.id === hypothesisId)!;
    expect(regenHypo.generationAssets!.length).toBeGreaterThan(1);
  });
});
