/**
 * Runtime bridge — entitlement load states (no live API).
 */
import { describe, expect, it } from 'vitest';
import { offlineEntitlements } from '../src/projects/jurnl/data/monetization/fetchServerEntitlements';
import { resolveEntitlements } from '../shared/site00-monetization/entitlements.js';
import { JURNL_MONETIZATION_CONTRACT as C } from '../src/projects/jurnl/data/monetization/contract';
import { hasCapability } from '../shared/site00-monetization';

describe('Runtime entitlement helpers T19–T28', () => {
  it('T24 offline fallback does not grant BUSINESS premium', () => {
    const e = offlineEntitlements();
    expect(e.source).toBe('NONE');
    expect(hasCapability(e, 'BUSINESS_PNL')).toBe(false);
  });

  it('T26 unknown capabilities remain denied under SERVER_VERIFIED FREE', () => {
    const e = resolveEntitlements(C, { source: 'SERVER_VERIFIED', subscription: null });
    expect(hasCapability(e, 'NOT_A_REAL_CAPABILITY')).toBe(false);
  });

  it('T28 founder union is independent of billing subscription object', () => {
    const e = resolveEntitlements(C, { source: 'SERVER_VERIFIED', subscription: null });
    expect(e.subscriptionState).toBe('NONE');
  });
});
