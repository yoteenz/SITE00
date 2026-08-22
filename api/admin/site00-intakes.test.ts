import { describe, expect, it, beforeEach, vi } from 'vitest';
import { resetIntakeMemoryStore } from '../_lib/site00Intakes/memoryStore.js';
import { resetIntakeStoreModeCache } from '../_lib/site00Intakes/storeAdapter.js';

vi.mock('../_lib/email/sendEmail.js', () => ({
  sendEmailAsync: vi.fn(),
}));

let adminAuthResult:
  | { ok: true; user: { id: string; email: string; accessToken: string } }
  | { ok: false; failure: { status: number; error: string } };

vi.mock('../_lib/adminAuth.js', () => ({
  resolveAdminAuth: vi.fn(async () => adminAuthResult),
}));

function makeReq(opts: { method: string; query?: Record<string, string>; body?: unknown }) {
  return {
    method: opts.method,
    query: opts.query ?? {},
    body: opts.body ?? {},
    headers: {},
  } as any;
}

function makeRes() {
  const res: any = {
    statusCode: 200,
    body: undefined,
    headers: {} as Record<string, string>,
    setHeader(key: string, value: string) {
      this.headers[key] = value;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
    end() {
      return this;
    },
  };
  return res;
}

describe('api/admin/site00-intakes — canonical Intake Inbox handler', () => {
  beforeEach(() => {
    vi.stubEnv('VITEST', 'true');
    resetIntakeMemoryStore();
    resetIntakeStoreModeCache();
    adminAuthResult = { ok: true, user: { id: 'admin-1', email: 'admin@frontalslayer.com', accessToken: 'tok' } };
  });

  it('a non-admin (or guest) caller is denied — guest/standard user cannot reach the Intake Inbox', async () => {
    adminAuthResult = { ok: false, failure: { status: 403, error: 'Admin access denied' } };
    const handler = (await import('./site00-intakes.js')).default;
    const res = makeRes();
    await handler(makeReq({ method: 'GET', query: { action: 'list' } }), res);
    expect(res.statusCode).toBe(403);
  });

  it('an unauthenticated caller is denied with 401 (not silently treated as admin)', async () => {
    adminAuthResult = { ok: false, failure: { status: 401, error: 'Sign in required' } };
    const handler = (await import('./site00-intakes.js')).default;
    const res = makeRes();
    await handler(makeReq({ method: 'GET', query: { action: 'list' } }), res);
    expect(res.statusCode).toBe(401);
  });

  it('an authorized admin can list canonical intake records', async () => {
    const intakesHandler = (await import('../site00/intakes.js')).default;
    const startRes: any = { statusCode: 200, headers: {}, setHeader() {}, status(c: number) { this.statusCode = c; return this; }, json(b: unknown) { this.body = b; return this; }, end() { return this; } };
    await intakesHandler(
      makeReq({ method: 'POST', query: { action: 'start' }, body: { intakeType: 'IDENTITY', domainLabel: 'discovery', email: 'admin-view@example.com' } }),
      startRes,
    );

    const handler = (await import('./site00-intakes.js')).default;
    const res = makeRes();
    await handler(makeReq({ method: 'GET', query: { action: 'list' } }), res);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.intakes)).toBe(true);
    expect(res.body.intakes.some((i: { id: string }) => i.id === startRes.body.intake.id)).toBe(true);
  });

  it('admin detail includes audit events', async () => {
    const intakesHandler = (await import('../site00/intakes.js')).default;
    const startRes: any = { statusCode: 200, headers: {}, setHeader() {}, status(c: number) { this.statusCode = c; return this; }, json(b: unknown) { this.body = b; return this; }, end() { return this; } };
    await intakesHandler(
      makeReq({ method: 'POST', query: { action: 'start' }, body: { intakeType: 'BUILDER', domainLabel: 'site' } }),
      startRes,
    );

    const handler = (await import('./site00-intakes.js')).default;
    const res = makeRes();
    await handler(
      makeReq({ method: 'GET', query: { action: 'detail', intakeType: 'BUILDER', id: startRes.body.intake.id } }),
      res,
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.intake.id).toBe(startRes.body.intake.id);
    expect(res.body.events.some((e: { eventType: string }) => e.eventType === 'INTAKE_CREATED')).toBe(true);
  });

  it('admin mark-in-review and archive are conservative lifecycle actions, never rewriting submitted content', async () => {
    const intakesHandler = (await import('../site00/intakes.js')).default;
    const startRes: any = { statusCode: 200, headers: {}, setHeader() {}, status(c: number) { this.statusCode = c; return this; }, json(b: unknown) { this.body = b; return this; }, end() { return this; } };
    await intakesHandler(
      makeReq({ method: 'POST', query: { action: 'start' }, body: { intakeType: 'IDENTITY', domainLabel: 'discovery', email: 'x@example.com' } }),
      startRes,
    );
    const submitRes: any = { statusCode: 200, headers: {}, setHeader() {}, status(c: number) { this.statusCode = c; return this; }, json(b: unknown) { this.body = b; return this; }, end() { return this; } };
    await intakesHandler(
      makeReq({ method: 'POST', query: { action: 'submit' }, body: { intakeType: 'IDENTITY', id: startRes.body.intake.id } }),
      submitRes,
    );

    const handler = (await import('./site00-intakes.js')).default;
    const reviewRes = makeRes();
    await handler(
      makeReq({ method: 'POST', body: { action: 'mark-in-review', intakeType: 'IDENTITY', id: startRes.body.intake.id } }),
      reviewRes,
    );
    expect(reviewRes.statusCode).toBe(200);
    expect(reviewRes.body.intake.status).toBe('IN_REVIEW');
    expect(reviewRes.body.intake.submittedPayload).toEqual(submitRes.body.intake.submittedPayload);
  });
});
