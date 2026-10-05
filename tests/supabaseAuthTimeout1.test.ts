import { describe, expect, it } from 'vitest';
import { isSupabaseTransportFailure } from '../src/utils/supabaseFetch.js';

describe('isSupabaseTransportFailure', () => {
  it('detects timeout and abort errors', () => {
    expect(isSupabaseTransportFailure(new DOMException('timeout', 'TimeoutError'))).toBe(true);
    expect(isSupabaseTransportFailure(new DOMException('aborted', 'AbortError'))).toBe(true);
    expect(isSupabaseTransportFailure(new Error('Failed to fetch'))).toBe(true);
    expect(isSupabaseTransportFailure(new Error('Invalid login credentials'))).toBe(false);
  });
});
