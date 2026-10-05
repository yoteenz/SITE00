import { describe, expect, it } from 'vitest';
import { resolvePersonalityReplayResumeStepId } from '../../../shared/site00-brand-lore/personalityReadiness';

describe('Personality replay intake merge behavior', () => {
  it('resume step id reaches review when all steps answered locally', () => {
    const answers: Record<string, string | string[]> = {
      'social-instinct': ['notices-missed'],
      confidence: ['receipts'],
      humor: ['dry-observation'],
      humanity: ['candid'],
      disagreement: ['shows-evidence'],
      edge: 'sharp',
      charm: ['wit'],
      observation: 'A receipt.',
      memorability: 'A line.',
      'emotional-range': ['skeptical'],
      restraint: ['humor-cheapens'],
      'personality-tension': ['intelligent-playful'],
      'social-reaction': ['bring-receipts'],
      'self-correction': ['update-record'],
      'anti-personality': 'No corporate speak.',
    };
    expect(resolvePersonalityReplayResumeStepId(answers)).toBe('review');
  });
});
