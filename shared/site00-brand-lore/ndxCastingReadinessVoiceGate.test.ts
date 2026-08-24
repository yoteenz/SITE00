import { beforeEach, describe, expect, it } from 'vitest';
import { buildNdxFounderCharacterDiscoveryRun } from './ndxEmbodiedCharacterFounderDiscovery/ndxFounderDiscoveryRun.js';
import { evaluateExtendedHumanity } from '../site00-studio-world-production/embodiedCharacterFounderDiscovery/humanityEvaluation.js';
import { evaluateNdxFounderCharacterCastingReadiness } from './ndxEmbodiedCharacterFounderDiscovery/ndxCastingReadinessBridge.js';
import { initializeNeuralCastingState, planNeuralVoiceCalibrationRound } from '../site00-studio-world-production/embodiedCharacterVoice/neuralVoiceCalibrationEngine.js';
import { buildEmptyVoiceCalibrationState } from '../site00-studio-world-production/embodiedCharacterVoice/voiceCalibrationEngine.js';
import { applyVoiceHypothesisJudgment } from '../site00-studio-world-production/embodiedCharacterVoice/voiceCalibrationEngine.js';

function humanityFor(run: ReturnType<typeof buildNdxFounderCharacterDiscoveryRun>) {
  return evaluateExtendedHumanity({
    contradictions: run.contradictions,
    flawProfile: run.flawProfile,
    intelligenceMap: run.intelligenceMap,
    relationships: run.relationships,
    culturalBoundaries: run.culturalBoundaries,
    publicPrivate: run.publicPrivate,
    privateHumanityPresent: run.flawProfile.procrastinates.length > 0,
  });
}

describe('ndxCastingReadinessBridge voice gate', () => {
  it('neural voice hypothesis judgments satisfy voice_differentiation', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    let voiceState = initializeNeuralCastingState(
      buildEmptyVoiceCalibrationState({ projectId: 'ndxbook', brandId: 'ndxbook', characterId: 'c' }),
      true,
    );
    const { state, hypotheses } = planNeuralVoiceCalibrationRound(voiceState);
    voiceState = applyVoiceHypothesisJudgment(state, hypotheses[0]!.id, 'CLOSE');
    const withVoice = { ...run, voiceCalibrationState: voiceState };
    const readiness = evaluateNdxFounderCharacterCastingReadiness({
      run: withVoice,
      humanityEvaluation: humanityFor(withVoice),
    });
    expect(readiness.voiceDifferentiationEstablished).toBe(true);
    expect(readiness.blockingGates).not.toContain('voice_differentiation');
  });
});
