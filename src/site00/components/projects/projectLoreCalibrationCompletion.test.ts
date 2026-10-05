import { describe, expect, it } from 'vitest';
import { shouldFinishProjectLoreCalibration } from './projectLoreCalibrationCompletion';

describe('shouldFinishProjectLoreCalibration', () => {
  it('does not finish when save failed', () => {
    expect(
      shouldFinishProjectLoreCalibration({
        isLastStep: true,
        saveSucceeded: false,
        readinessBlocked: true,
      }),
    ).toBe(false);
  });

  it('finishes on the last step after a successful save even when readiness is still blocked', () => {
    expect(
      shouldFinishProjectLoreCalibration({
        isLastStep: true,
        saveSucceeded: true,
        readinessBlocked: true,
      }),
    ).toBe(true);
  });

  it('finishes early when readiness clears before the final step', () => {
    expect(
      shouldFinishProjectLoreCalibration({
        isLastStep: false,
        saveSucceeded: true,
        readinessBlocked: false,
      }),
    ).toBe(true);
  });

  it('continues mid-session when readiness is still blocked', () => {
    expect(
      shouldFinishProjectLoreCalibration({
        isLastStep: false,
        saveSucceeded: true,
        readinessBlocked: true,
      }),
    ).toBe(false);
  });
});
