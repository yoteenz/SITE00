import { describe, expect, it } from 'vitest';
import { computeBrandCharacterSynthesisProgress } from '../../src/site00/components/validation/brandCharacterSynthesisProgress';

describe('brandCharacterSynthesisProgress', () => {
  it('computes elapsed progress from synthesisStartedAt', () => {
    const startedAt = new Date('2026-08-24T06:00:00.000Z').toISOString();
    const progress = computeBrandCharacterSynthesisProgress(startedAt, new Date('2026-08-24T06:01:00.000Z').getTime());
    expect(progress?.elapsedLabel).toBe('1:00');
    expect(progress?.progressPercent).toBeGreaterThan(0);
  });
});
