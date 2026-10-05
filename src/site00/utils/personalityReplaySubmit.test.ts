import { describe, expect, it } from 'vitest';
import {
  canSubmitPersonalityReplayIntake,
  isPersonalityReplayIntakeSubmitted,
} from './personalityReplaySubmit';

describe('personalityReplaySubmit', () => {
  it('treats PERSONALITY_READY as not yet submitted', () => {
    expect(isPersonalityReplayIntakeSubmitted('PERSONALITY_READY')).toBe(false);
    expect(
      canSubmitPersonalityReplayIntake({ status: 'PERSONALITY_READY', hasAnswers: true }),
    ).toBe(true);
  });

  it('treats FORMATION_READY as submitted', () => {
    expect(isPersonalityReplayIntakeSubmitted('FORMATION_READY')).toBe(true);
    expect(
      canSubmitPersonalityReplayIntake({ status: 'FORMATION_READY', hasAnswers: true }),
    ).toBe(false);
  });
});
