import { describe, expect, it, vi } from 'vitest';

import { promiseWithTimeout } from '../src/utils/promiseWithTimeout.js';

describe('promiseWithTimeout', () => {
  it('resolves with value when promise finishes first', async () => {
    await expect(promiseWithTimeout(Promise.resolve('ok'), 500, 'fallback')).resolves.toBe('ok');
  });

  it('resolves with fallback when promise is slow', async () => {
    vi.useFakeTimers();
    const slow = new Promise<string>((resolve) => {
      setTimeout(() => resolve('late'), 10_000);
    });
    const result = promiseWithTimeout(slow, 50, 'fallback');
    await vi.advanceTimersByTimeAsync(60);
    await expect(result).resolves.toBe('fallback');
    vi.useRealTimers();
  });
});
