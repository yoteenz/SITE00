import { describe, expect, it } from 'vitest';
import { buildEmptyVoiceCalibrationState } from '../site00-studio-world-production/embodiedCharacterVoice/voiceCalibrationEngine.js';
import {
  NDX_NEURAL_CASTING_ROUND_1,
  NDX_SIBLING_TERRITORIES_FROM_SOFT_GIRL,
  resolveNdxCastingTerritories,
} from './ndxEmbodiedCharacterVoice/ndxNeuralCastingTerritories.js';

describe('NDX neural casting territories', () => {
  it('round 1 targets adult conversational charisma without generic calm/wise presets', () => {
    const ids = NDX_NEURAL_CASTING_ROUND_1.map((t) => t.providerVoiceId);
    expect(ids).toContain('Exuberant_Girl');
    expect(ids).toContain('Soft_Girl');
    expect(ids).not.toContain('Wise_Woman');
    expect(ids).not.toContain('Calm_Woman');
    expect(NDX_NEURAL_CASTING_ROUND_1.every((t) => !t.performanceDirection?.match(/urban|sassy|AAVE/i))).toBe(true);
  });

  it('CLOSE on Soft_Girl plans sibling refinement territories', () => {
    const state = buildEmptyVoiceCalibrationState({ projectId: 'p', brandId: 'b', characterId: 'c' });
    state.neuralCandidates = [
      {
        candidateId: 'c1',
        provider: 'fal',
        endpoint: 'fal-ai/minimax/speech-02-hd',
        providerVoiceId: 'Soft_Girl',
        providerVoiceName: 'Soft Girl',
        voiceDesignId: null,
        voiceFingerprint: 'fp',
        roundIntroduced: 'r1',
        identityParameters: {},
        referenceAudioId: null,
        founderStatus: 'CLOSE',
        providerAuthority: 'PRODUCTION_CANDIDATE',
      },
    ];
    const plan = resolveNdxCastingTerritories(state);
    expect(plan.territories).toEqual(NDX_SIBLING_TERRITORIES_FROM_SOFT_GIRL);
    expect(plan.sessionMessage).toContain('HEAR HER');
  });
});
