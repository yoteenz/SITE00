import { describe, expect, it } from 'vitest';
import { buildSecretInventory } from '../scripts/jurnl/live-proof-prerequisite-precheck';

describe('JURNL live proof secret inventory', () => {
  it('lists exact QA and Supabase secret names', () => {
    const names = buildSecretInventory().map((s) => s.name);
    expect(names).toContain('JURNL_QA_USER_A_EMAIL');
    expect(names).toContain('JURNL_QA_USER_B_PASSWORD');
    expect(names).toContain('SUPABASE_SERVICE_ROLE_KEY');
  });

  it('marks optional API base', () => {
    const api = buildSecretInventory().find((s) => s.name === 'JURNL_LIVE_API_BASE');
    expect(api?.classification).toBe('OPTIONAL');
  });
});
