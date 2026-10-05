import { describe, expect, it } from 'vitest';
import { runFalImageJobsParallel } from '../shared/site00-visual-generation/falParallelImageSubscribe.js';

describe('runFalImageJobsParallel', () => {
  it('returns vitest stubs for all jobs in one batch', async () => {
    const { results, providerTrace } = await runFalImageJobsParallel([
      { jobKey: 'A-mobile', prompt: 'one', aspectRatio: '9:16' },
      { jobKey: 'A-desktop', prompt: 'two', aspectRatio: '16:9' },
      { jobKey: 'B-mobile', prompt: 'three', aspectRatio: '9:16' },
    ]);
    expect(results.length).toBe(3);
    expect(providerTrace.some((l) => l.includes('FAL_PARALLEL_ENQUEUE'))).toBe(true);
    expect(results.map((r) => r.jobKey).sort()).toEqual(['A-desktop', 'A-mobile', 'B-mobile']);
  });
});
