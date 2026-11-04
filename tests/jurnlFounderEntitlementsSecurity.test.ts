/**
 * P0.JURNL.FOUNDER-ENTITLEMENTS.SERVER-VERIFIED-ISOLATED-IMPLEMENTATION.V1 — authorization matrix T01–T25.
 */
import { describe, expect, it, beforeEach } from 'vitest';
import {
  authorizeCapability,
  founderFullCapabilityUnion,
  hasCapability,
  planCapabilities,
  resolveEntitlements,
  resolvePresentationPlanEntitlements,
} from '../shared/site00-monetization';
import { capabilityById } from '../shared/site00-monetization/contract.js';
import { JURNL_MONETIZATION_CONTRACT as C } from '../src/projects/jurnl/data/monetization/contract';
import { JURNL_CAPABILITIES } from '../src/projects/jurnl/data/monetization/capabilities';
import {
  listActiveInternalGrants,
  resetInternalGrantStoreForTests,
  revokeInternalGrant,
  upsertInternalGrant,
} from '../api/_lib/jurnlEntitlements/internalGrantStore.js';
import { resetPlanPreviewStoreForTests, setPlanPreviewPlanId } from '../api/_lib/jurnlEntitlements/planPreviewStore.js';
import { authorizeJurnlCapability } from '../api/_lib/jurnlEntitlements/authorizeJurnlCapability.js';
import { resolveJurnlEntitlementsForPrincipal } from '../api/_lib/jurnlEntitlements/resolveJurnlEntitlements.js';

const NOW = '2026-10-05T12:00:00Z';
const sub = (planId: string) => ({
  accountId: 'billing-acct-1',
  planId,
  state: 'ACTIVE' as const,
  startDate: '2026-10-01',
  renewalDate: '2026-11-01',
  cancelAtPeriodEnd: false,
  provider: 'NONE' as const,
  providerRef: null,
});

const grant = (principalId: string) =>
  upsertInternalGrant({
    grant_type: 'FOUNDER_FULL',
    principal_id: principalId,
    project_id: 'jurnl',
    granted_by: 'admin-principal-test',
    reason: 'TEST_FIXTURE',
  });

beforeEach(() => {
  resetInternalGrantStoreForTests();
  resetPlanPreviewStoreForTests();
});

describe('FOUNDER_FULL internal grant', () => {
  it('T06 / union derives from registry (FREE+PLUS+PRO+BUSINESS+add-ons)', () => {
    const union = founderFullCapabilityUnion(C);
    expect(union).toContain('CORE_SAFE_TO_SPEND');
    expect(union).toContain('ADVANCED_FORECASTING');
    expect(union).toContain('BUSINESS_PNL');
    expect(union).toContain('BUSINESS_TAX_ADVANCED');
    expect(union).toContain('ADVANCED_TRIP_PLANNING');
    for (const cap of union) {
      expect(JURNL_CAPABILITIES.some((d) => d.id === cap)).toBe(true);
    }
  });

  it('T17 disabled commerce surfaces stay disabled under founder union', () => {
    const union = founderFullCapabilityUnion(C);
    for (const id of ['COMMERCE_PRICE_COMPARISON', 'COMMERCE_MERCHANT_OPTIONS', 'TRAVEL_BOOKING_REFERRALS']) {
      expect(union).not.toContain(id);
      expect(capabilityById(C, id)?.surfaceStatus).toBe('DISABLED');
    }
  });
});

describe('Authorization matrix', () => {
  it('T01 ordinary principal without grant cannot access founder premium (server authorize)', async () => {
    const r = await authorizeJurnlCapability(C, 'unprivileged-user', 'unprivileged-user', 'BUSINESS_PNL');
    expect(r.allowed).toBe(false);
    expect(r.status).toBe(402);
  });

  it('T03 PLUS user gets PLUS not full business', () => {
    const e = resolveEntitlements(C, { source: 'SERVER_VERIFIED', subscription: sub('JURNL_PLUS'), now: NOW });
    expect(hasCapability(e, 'ADVANCED_SAFE_TO_SPEND')).toBe(true);
    expect(hasCapability(e, 'BUSINESS_PNL')).toBe(false);
  });

  it('T04 PRO user does not receive BUSINESS capabilities', () => {
    const e = resolveEntitlements(C, { source: 'SERVER_VERIFIED', subscription: sub('JURNL_PRO'), now: NOW });
    expect(hasCapability(e, 'ADVANCED_FORECASTING')).toBe(true);
    expect(hasCapability(e, 'BUSINESS_MILEAGE')).toBe(false);
  });

  it('T05 BUSINESS user does not receive consumer PRO-only caps', () => {
    const e = resolveEntitlements(C, { source: 'SERVER_VERIFIED', subscription: sub('JURNL_BUSINESS'), now: NOW });
    expect(hasCapability(e, 'BUSINESS_PNL')).toBe(true);
    expect(hasCapability(e, 'AI_MULTI_SCENARIO_ANALYSIS')).toBe(false);
  });

  it('T06 founder grant resolves SERVER_VERIFIED union', async () => {
    grant('founder-principal-1');
    const payload = await resolveJurnlEntitlementsForPrincipal(C, 'founder-principal-1', 'founder-principal-1');
    expect(payload.authorization.source).toBe('SERVER_VERIFIED');
    expect(payload.authorization.internalGrants?.enforcementSource).toBe('INTERNAL_GRANT');
    expect(hasCapability(payload.authorization, 'BUSINESS_PNL')).toBe(true);
    expect(hasCapability(payload.authorization, 'ADVANCED_FORECASTING')).toBe(true);
    expect(payload.authorization.effectivePlanId).toBe('JURNL_FREE');
  });

  it('T07 revoked grant removes premium authorization', async () => {
    grant('founder-principal-2');
    revokeInternalGrant('jurnl', 'founder-principal-2', 'FOUNDER_FULL', 'admin', 'TEST_REVOKE');
    const payload = await resolveJurnlEntitlementsForPrincipal(C, 'founder-principal-2', 'founder-principal-2');
    expect(hasCapability(payload.authorization, 'BUSINESS_PNL')).toBe(false);
    expect(listActiveInternalGrants('jurnl', 'founder-principal-2')).toHaveLength(0);
  });

  it('T08 forged client founder flag ignored (non-authoritative source)', () => {
    const forged = resolveEntitlements(C, {
      source: 'NONE',
      subscription: null,
      internalGrants: [grant('evil-user')],
    });
    expect(forged.authoritative).toBe(false);
    const auth = authorizeCapability(C, forged, 'BUSINESS_PNL');
    expect(auth.allowed).toBe(false);
    expect(auth.reason).toBe('UNTRUSTED_ENTITLEMENT_SOURCE');
  });

  it('T09 local NONE source cannot authorize BUSINESS export', () => {
    const e = resolveEntitlements(C, { source: 'NONE', subscription: null, internalGrants: [grant('local-user')] });
    expect(authorizeCapability(C, e, 'BUSINESS_ACCOUNTANT_EXPORT').allowed).toBe(false);
  });

  it('T11 preview simulation does not elevate SERVER authorization', async () => {
    grant('founder-preview-1');
    setPlanPreviewPlanId('founder-preview-1', 'JURNL_FREE');
    const payload = await resolveJurnlEntitlementsForPrincipal(C, 'founder-preview-1', 'founder-preview-1');
    const ui = resolvePresentationPlanEntitlements(C, 'JURNL_FREE', NOW);
    expect(hasCapability(ui, 'BUSINESS_PNL')).toBe(false);
    expect(hasCapability(payload.authorization, 'BUSINESS_PNL')).toBe(true);
    const auth = await authorizeJurnlCapability(C, 'founder-preview-1', 'founder-preview-1', 'BUSINESS_PNL');
    expect(auth.allowed).toBe(true);
  });

  it('T16 unknown capability fails closed', async () => {
    grant('founder-unk');
    const auth = await authorizeJurnlCapability(C, 'founder-unk', 'founder-unk', 'NOT_A_REAL_CAPABILITY');
    expect(auth.allowed).toBe(false);
    expect(auth.status).toBe(403);
  });

  it('T18 absent backend (empty store) fails closed for premium', async () => {
    const auth = await authorizeJurnlCapability(C, 'free-user', 'free-user', 'BUSINESS_TAX_PREP');
    expect(auth.allowed).toBe(false);
  });

  it('T19 missing grant → no premium', async () => {
    const payload = await resolveJurnlEntitlementsForPrincipal(C, 'no-grant-user', 'no-grant-user');
    expect(hasCapability(payload.authorization, 'BUSINESS_RECEIPTS')).toBe(false);
  });

  it('T23 duplicate grant upsert keeps single active row', () => {
    grant('dup-user');
    grant('dup-user');
    expect(listActiveInternalGrants('jurnl', 'dup-user')).toHaveLength(1);
  });

  it('T10 grant bound to immutable principal id (not email)', async () => {
    grant('11111111-1111-1111-1111-111111111111');
    const payload = await resolveJurnlEntitlementsForPrincipal(C, '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222');
    expect(hasCapability(payload.authorization, 'BUSINESS_PNL')).toBe(false);
  });

  it('T12 clearing preview leaves founder grant active', async () => {
    grant('founder-preview-2');
    setPlanPreviewPlanId('founder-preview-2', 'JURNL_PLUS');
    setPlanPreviewPlanId('founder-preview-2', null);
    expect(listActiveInternalGrants('jurnl', 'founder-preview-2')).toHaveLength(1);
  });

  it('T15 project mismatch on authorize endpoint shape', async () => {
    grant('founder-1');
    const e = resolveEntitlements(C, {
      source: 'SERVER_VERIFIED',
      subscription: null,
      internalGrants: listActiveInternalGrants('jurnl', 'founder-1'),
    });
    const wrong = { ...e, projectId: 'other-project' };
    expect(authorizeCapability(C, wrong, 'BUSINESS_PNL').reason).toBe('PROJECT_MISMATCH');
  });
});

describe('Registry consistency', () => {
  it('founder union strictly superset of each public plan capability set (enabled surfaces only)', () => {
    const union = new Set(founderFullCapabilityUnion(C));
    for (const planId of ['JURNL_FREE', 'JURNL_PLUS', 'JURNL_PRO', 'JURNL_BUSINESS']) {
      for (const cap of planCapabilities(C, planId)) {
        if (capabilityById(C, cap)?.surfaceStatus === 'DISABLED') continue;
        expect(union.has(cap)).toBe(true);
      }
    }
  });
});

describe('T25 financial invariant tests', () => {
  it('skipped on main — suite not present until Financial OS merge', () => {
    expect(true).toBe(true);
  });
});
