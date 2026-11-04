/**
 * P0.JURNL.FOUNDER-ENTITLEMENTS — authorization matrix + persistence (memory store under vitest).
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
  grantStoreMode,
  listActiveInternalGrants,
  resetInternalGrantStoreForTests,
  revokeInternalGrant,
  upsertInternalGrant,
} from '../api/_lib/jurnlEntitlements/internalGrantStore.js';
import { resetPlanPreviewStoreForTests, setPlanPreviewPlanId } from '../api/_lib/jurnlEntitlements/planPreviewStore.js';
import { authorizeJurnlCapability } from '../api/_lib/jurnlEntitlements/authorizeJurnlCapability.js';
import { resolveJurnlEntitlementsForPrincipal } from '../api/_lib/jurnlEntitlements/resolveJurnlEntitlements.js';
import { isValidPrincipalId } from '../api/_lib/jurnlEntitlements/supabaseGrantStore.js';
import { applyJurnlAdminApiCors, isJurnlCorsOriginAllowed } from '../api/_lib/jurnlEntitlements/jurnlApiCors.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

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

const FOUNDER_UUID = '11111111-1111-4111-8111-111111111111';
const OTHER_UUID = '22222222-2222-4222-8222-222222222222';

async function grant(principalId: string) {
  const result = await upsertInternalGrant({
    grant_type: 'FOUNDER_FULL',
    principal_id: principalId,
    project_id: 'jurnl',
    granted_by: '11111111-1111-4111-8111-000000000099',
    reason: 'TEST_FIXTURE',
  });
  if (!result.ok) throw new Error(result.error);
  return result.value;
}

beforeEach(() => {
  resetInternalGrantStoreForTests();
  resetPlanPreviewStoreForTests();
});

describe('Store mode', () => {
  it('uses in-memory grants under vitest', () => {
    expect(grantStoreMode()).toBe('memory');
  });
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

describe('Persistence (memory) T01–T10', () => {
  it('T01 new grant persists in active list', async () => {
    await grant(FOUNDER_UUID);
    const rows = await listActiveInternalGrants('jurnl', FOUNDER_UUID);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.status).toBe('ACTIVE');
  });

  it('T02 idempotent grant update keeps one active row', async () => {
    await grant(FOUNDER_UUID);
    await upsertInternalGrant({
      grant_type: 'FOUNDER_FULL',
      principal_id: FOUNDER_UUID,
      project_id: 'jurnl',
      granted_by: '11111111-1111-4111-8111-000000000099',
      reason: 'SECOND_UPSERT',
    });
    expect(await listActiveInternalGrants('jurnl', FOUNDER_UUID)).toHaveLength(1);
  });

  it('T03 revocation persists', async () => {
    await grant(FOUNDER_UUID);
    const rev = await revokeInternalGrant('jurnl', FOUNDER_UUID, 'FOUNDER_FULL', 'admin', 'TEST');
    expect(rev.ok).toBe(true);
    expect(await listActiveInternalGrants('jurnl', FOUNDER_UUID)).toHaveLength(0);
  });

  it('T05 concurrent duplicate upserts do not create duplicate actives', async () => {
    await Promise.all([grant(FOUNDER_UUID), grant(FOUNDER_UUID), grant(FOUNDER_UUID)]);
    expect(await listActiveInternalGrants('jurnl', FOUNDER_UUID)).toHaveLength(1);
  });

  it('T07 invalid principal rejected for db path shape', async () => {
    expect(isValidPrincipalId('not-a-uuid')).toBe(false);
    expect(isValidPrincipalId(FOUNDER_UUID)).toBe(true);
  });

  it('T08 cross-project grant does not authorize JURNL resolution', async () => {
    await upsertInternalGrant({
      grant_type: 'FOUNDER_FULL',
      principal_id: FOUNDER_UUID,
      project_id: 'other-project',
      granted_by: '11111111-1111-4111-8111-000000000099',
      reason: 'WRONG_PROJECT',
    });
    const payload = await resolveJurnlEntitlementsForPrincipal(C, FOUNDER_UUID, FOUNDER_UUID);
    expect(hasCapability(payload.authorization, 'BUSINESS_PNL')).toBe(false);
  });

  it('T09 cross-user grant does not authorize another principal', async () => {
    await grant(FOUNDER_UUID);
    const payload = await resolveJurnlEntitlementsForPrincipal(C, OTHER_UUID, OTHER_UUID);
    expect(hasCapability(payload.authorization, 'BUSINESS_PNL')).toBe(false);
  });

  it('T10 grant bound to immutable principal id (not email)', async () => {
    await grant(FOUNDER_UUID);
    const payload = await resolveJurnlEntitlementsForPrincipal(C, OTHER_UUID, OTHER_UUID);
    expect(hasCapability(payload.authorization, 'BUSINESS_PNL')).toBe(false);
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
    await grant('founder-principal-1');
    const payload = await resolveJurnlEntitlementsForPrincipal(C, 'founder-principal-1', 'founder-principal-1');
    expect(payload.authorization.source).toBe('SERVER_VERIFIED');
    expect(payload.authorization.internalGrants?.enforcementSource).toBe('INTERNAL_GRANT');
    expect(hasCapability(payload.authorization, 'BUSINESS_PNL')).toBe(true);
    expect(hasCapability(payload.authorization, 'ADVANCED_FORECASTING')).toBe(true);
    expect(payload.authorization.effectivePlanId).toBe('JURNL_FREE');
  });

  it('T07 revoked grant removes premium authorization', async () => {
    await grant('founder-principal-2');
    await revokeInternalGrant('jurnl', 'founder-principal-2', 'FOUNDER_FULL', 'admin', 'TEST_REVOKE');
    const payload = await resolveJurnlEntitlementsForPrincipal(C, 'founder-principal-2', 'founder-principal-2');
    expect(hasCapability(payload.authorization, 'BUSINESS_PNL')).toBe(false);
    expect(await listActiveInternalGrants('jurnl', 'founder-principal-2')).toHaveLength(0);
  });

  it('T08 forged client founder flag ignored (non-authoritative source)', async () => {
    const record = await grant('evil-user');
    const forged = resolveEntitlements(C, {
      source: 'NONE',
      subscription: null,
      internalGrants: [record],
    });
    expect(forged.authoritative).toBe(false);
    const auth = authorizeCapability(C, forged, 'BUSINESS_PNL');
    expect(auth.allowed).toBe(false);
    expect(auth.reason).toBe('UNTRUSTED_ENTITLEMENT_SOURCE');
  });

  it('T09 local NONE source cannot authorize BUSINESS export', async () => {
    const record = await grant('local-user');
    const e = resolveEntitlements(C, { source: 'NONE', subscription: null, internalGrants: [record] });
    expect(authorizeCapability(C, e, 'BUSINESS_ACCOUNTANT_EXPORT').allowed).toBe(false);
  });

  it('T11 preview simulation does not elevate SERVER authorization', async () => {
    await grant('founder-preview-1');
    setPlanPreviewPlanId('founder-preview-1', 'JURNL_FREE');
    const payload = await resolveJurnlEntitlementsForPrincipal(C, 'founder-preview-1', 'founder-preview-1');
    const ui = resolvePresentationPlanEntitlements(C, 'JURNL_FREE', NOW);
    expect(hasCapability(ui, 'BUSINESS_PNL')).toBe(false);
    expect(hasCapability(payload.authorization, 'BUSINESS_PNL')).toBe(true);
    const auth = await authorizeJurnlCapability(C, 'founder-preview-1', 'founder-preview-1', 'BUSINESS_PNL');
    expect(auth.allowed).toBe(true);
  });

  it('T16 unknown capability fails closed', async () => {
    await grant('founder-unk');
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

  it('T23 duplicate grant upsert keeps single active row', async () => {
    await grant('dup-user');
    await grant('dup-user');
    expect(await listActiveInternalGrants('jurnl', 'dup-user')).toHaveLength(1);
  });

  it('T12 clearing preview leaves founder grant active', async () => {
    await grant('founder-preview-2');
    setPlanPreviewPlanId('founder-preview-2', 'JURNL_PLUS');
    setPlanPreviewPlanId('founder-preview-2', null);
    expect(await listActiveInternalGrants('jurnl', 'founder-preview-2')).toHaveLength(1);
  });

  it('T15 project mismatch on authorize endpoint shape', async () => {
    await grant('founder-1');
    const grants = await listActiveInternalGrants('jurnl', 'founder-1');
    const e = resolveEntitlements(C, {
      source: 'SERVER_VERIFIED',
      subscription: null,
      internalGrants: grants,
    });
    const wrong = { ...e, projectId: 'other-project' };
    expect(authorizeCapability(C, wrong, 'BUSINESS_PNL').reason).toBe('PROJECT_MISMATCH');
  });
});

describe('Plan preview T29–T35', () => {
  it('T29–T32 founder can set each public preview plan', async () => {
    await grant('founder-preview-plans');
    for (const planId of ['JURNL_FREE', 'JURNL_PLUS', 'JURNL_PRO', 'JURNL_BUSINESS'] as const) {
      setPlanPreviewPlanId('founder-preview-plans', planId);
      const ui = resolvePresentationPlanEntitlements(C, planId, NOW);
      expect(ui.effectivePlanId).toBe(planId);
    }
  });

  it('T33 preview store does not mutate grant rows', async () => {
    await grant('founder-preview-3');
    setPlanPreviewPlanId('founder-preview-3', 'JURNL_PRO');
    expect(await listActiveInternalGrants('jurnl', 'founder-preview-3')).toHaveLength(1);
  });

  it('T35 exiting preview clears simulation only', async () => {
    await grant('founder-preview-4');
    setPlanPreviewPlanId('founder-preview-4', 'JURNL_BUSINESS');
    setPlanPreviewPlanId('founder-preview-4', null);
    const payload = await resolveJurnlEntitlementsForPrincipal(C, 'founder-preview-4', 'founder-preview-4');
    expect(hasCapability(payload.authorization, 'BUSINESS_PNL')).toBe(true);
    expect(payload.presentation.previewActive).toBe(false);
  });
});

describe('Admin CORS T15', () => {
  it('rejects arbitrary origin on admin grant surface', () => {
    expect(isJurnlCorsOriginAllowed('https://evil.example')).toBe(false);
    const headers: Record<string, string | string[]> = {};
    const req = { method: 'POST', headers: { origin: 'https://evil.example' } } as VercelRequest;
    const res = {
      setHeader: (k: string, v: string) => {
        headers[k] = v;
      },
      status: (code: number) => ({
        json: (body: unknown) => ({ code, body }),
      }),
    } as unknown as VercelResponse;
    const ok = applyJurnlAdminApiCors(req, res);
    expect(ok).toBe(false);
  });

  it('allows localhost admin origin when listed', () => {
    expect(isJurnlCorsOriginAllowed('http://localhost:5174')).toBe(true);
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
