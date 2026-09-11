import { describe, expect, it } from 'vitest';
import { isRetryableFrontendHttpStatus } from '../scripts/site00-verify-production-release.mjs';

describe('site00-verify-production-release', () => {
  it('retries transient frontend HTTP errors during cPanel deploy', () => {
    expect(isRetryableFrontendHttpStatus(403)).toBe(true);
    expect(isRetryableFrontendHttpStatus(404)).toBe(true);
    expect(isRetryableFrontendHttpStatus(503)).toBe(true);
    expect(isRetryableFrontendHttpStatus(401)).toBe(false);
    expect(isRetryableFrontendHttpStatus(200)).toBe(false);
  });
});
