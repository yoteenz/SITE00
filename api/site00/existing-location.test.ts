import { describe, expect, it, beforeEach, vi } from 'vitest';
import { resetExistingLocationMemoryStore } from '../_lib/existingLocation/memoryStore.js';
import { createCourtesyCode, createQuoteForCase, markAccessConnected, submitIntake, updateCaseIntake } from '../_lib/existingLocation/service.js';

vi.mock('../_lib/auth.js', () => ({
  getAuthUser: vi.fn(async () => currentUser),
}));

vi.mock('../_lib/adminAuth.js', () => ({
  isAdminEmail: (email: string | null | undefined) => email === 'founder@site00.com',
}));

let currentUser: { id: string; email: string } | null = null;

function makeReq(opts: { method: string; query?: Record<string, string>; body?: unknown }) {
  return { method: opts.method, query: opts.query ?? {}, body: opts.body ?? {}, headers: {} } as any;
}

function makeRes() {
  const res: any = { statusCode: 200, body: undefined, headers: {}, setHeader() {}, status(c: number) { this.statusCode = c; return this; }, json(p: unknown) { this.body = p; return this; }, end() { return this; } };
  return res;
}

describe('api/site00/existing-location', () => {
  beforeEach(() => {
    vi.stubEnv('VITEST', 'true');
    resetExistingLocationMemoryStore();
    currentUser = null;
  });

  it('creates a case and completes Shopify intake flow', async () => {
    const handler = (await import('./existing-location.js')).default;
    const startRes = makeRes();
    await handler(makeReq({ method: 'POST', body: { action: 'start', email: 'merchant@example.com' } }), startRes);
    const caseId = startRes.body.case.id;
    await handler(
      makeReq({
        method: 'POST',
        body: {
          action: 'update-intake',
          id: caseId,
          request_type: 'REPAIR',
          platform: 'SHOPIFY',
          site_url: 'https://shop.example.com',
          client_description: 'Free samples ignore minimum purchase rules.',
        },
      }),
      makeRes(),
    );
    const submitRes = makeRes();
    await handler(makeReq({ method: 'POST', body: { action: 'submit-intake', id: caseId } }), submitRes);
    expect(submitRes.body.case.status).toBe('ACCESS_REQUIRED');
    expect(submitRes.body.case.access_requirements.length).toBeGreaterThan(0);
  });

  it('validates courtesy code server-side and completes $0 checkout with entitlement', async () => {
    const handler = (await import('./existing-location.js')).default;
    createCourtesyCode({
      raw_code: 'FRIEND-TEST-ONLY',
      display_label: 'Test',
      discount_type: 'FULL_CASE_COMP',
      discount_value: 100,
      eligible_email: 'friend@example.com',
      created_by: 'founder@site00.com',
    });

    const startRes = makeRes();
    await handler(makeReq({ method: 'POST', body: { action: 'start', email: 'friend@example.com' } }), startRes);
    const caseId = startRes.body.case.id;
    updateCaseIntake(caseId, {
      request_type: 'DIAGNOSE',
      platform: 'SHOPIFY',
      client_description: 'Promotion logic issue',
    });
    submitIntake(caseId);
    markAccessConnected(caseId);

    createQuoteForCase(caseId, {
      line_items: [{ id: '1', code: 'REPAIR', label: 'Repair', amount_cents: 50000, optional: false }],
      basis_notes: 'Diagnosis-based quote',
    });

    currentUser = null;
    await handler(makeReq({ method: 'POST', body: { action: 'approve-quote', id: caseId } }), makeRes());

    const previewRes = makeRes();
    await handler(
      makeReq({ method: 'POST', body: { action: 'preview-courtesy', id: caseId, code: 'friend-test-only', email: 'friend@example.com' } }),
      previewRes,
    );
    expect(previewRes.body.final_total_cents).toBe(0);

    const checkoutRes = makeRes();
    await handler(
      makeReq({ method: 'POST', body: { action: 'complete-checkout', id: caseId, code: 'FRIEND-TEST-ONLY', email: 'friend@example.com' } }),
      checkoutRes,
    );
    expect(checkoutRes.body.case.status).toBe('COMPLIMENTARY_APPROVED');
    expect(checkoutRes.body.case.entitlement).toBeTruthy();
  });

  it('rejects expired courtesy codes', async () => {
    createCourtesyCode({
      raw_code: 'EXPIRED',
      display_label: 'Expired',
      discount_type: 'FULL_CASE_COMP',
      discount_value: 100,
      expires_at: new Date(Date.now() - 86400000).toISOString(),
      created_by: 'admin@test.com',
    });
    const handler = (await import('./existing-location.js')).default;
    const startRes = makeRes();
    await handler(makeReq({ method: 'POST', body: { action: 'start' } }), startRes);
    const caseId = startRes.body.case.id;
    updateCaseIntake(caseId, { request_type: 'REPAIR', platform: 'SHOPIFY', client_description: 'x' });
    submitIntake(caseId);
    createQuoteForCase(caseId, {
      line_items: [{ id: '1', code: 'LABOR', label: 'Labor', amount_cents: 10000, optional: false }],
      basis_notes: 'test',
    });
    const previewRes = makeRes();
    await handler(makeReq({ method: 'POST', body: { action: 'preview-courtesy', id: caseId, code: 'EXPIRED' } }), previewRes);
    expect(previewRes.statusCode).toBe(400);
  });
});
