import { describe, expect, it } from 'vitest';
import { buildSecretInventory } from '../scripts/jurnl/live-proof-prerequisite-precheck';

describe('JURNL live proof secret inventory', () => {
  it('lists exact QA and Supabase secret names', () => {
    const names = buildSecretInventory().map((s) => s.name);
    expect(names).toContain('JURNL_QA_USER_A_EMAIL');
    expect(names).toContain('JURNL_QA_USER_B_PASSWORD');
    expect(names).toContain('SUPABASE_SERVICE_ROLE_KEY');
  });

  it('treats API base as optional when absent and present when configured', () => {
    const previous = process.env.JURNL_LIVE_API_BASE;
    try {
      delete process.env.JURNL_LIVE_API_BASE;
      const absent = buildSecretInventory().find((s) => s.name === 'JURNL_LIVE_API_BASE');
      expect(absent?.classification).toBe('OPTIONAL');

      process.env.JURNL_LIVE_API_BASE = 'https://example.invalid';
      const present = buildSecretInventory().find((s) => s.name === 'JURNL_LIVE_API_BASE');
      expect(present?.classification).toBe('PRESENT');
    } finally {
      if (previous === undefined) delete process.env.JURNL_LIVE_API_BASE;
      else process.env.JURNL_LIVE_API_BASE = previous;
    }
  });
});
