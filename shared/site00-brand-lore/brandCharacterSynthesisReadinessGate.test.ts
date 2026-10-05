import { describe, expect, it } from 'vitest';
import {
  canProceedToCompositeSynthesis,
  resolveSynthesisEligibleReadinessState,
} from './brandCharacterSynthesis/synthesisReadinessGate.js';

describe('synthesisReadinessGate', () => {
  it('floors INSUFFICIENT to PARTIAL when historical formation complete and 3+ deepening answers', () => {
    expect(
      resolveSynthesisEligibleReadinessState({
        evaluatedState: 'CHARACTER_INSUFFICIENT',
        deepeningAnswerCount: 5,
        historicalFormationComplete: true,
        override: false,
      }),
    ).toBe('CHARACTER_PARTIAL');
  });

  it('does not floor INSUFFICIENT without deepening answers', () => {
    expect(
      resolveSynthesisEligibleReadinessState({
        evaluatedState: 'CHARACTER_INSUFFICIENT',
        deepeningAnswerCount: 0,
        historicalFormationComplete: true,
        override: false,
      }),
    ).toBe('CHARACTER_INSUFFICIENT');
  });

  it('allows PARTIAL and READY through synthesis gate', () => {
    expect(canProceedToCompositeSynthesis('CHARACTER_PARTIAL', false)).toBe(true);
    expect(canProceedToCompositeSynthesis('CHARACTER_READY', false)).toBe(true);
    expect(canProceedToCompositeSynthesis('CHARACTER_INSUFFICIENT', false)).toBe(false);
  });
});
