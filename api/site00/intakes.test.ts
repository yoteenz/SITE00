import { describe, expect, it, beforeEach, vi } from 'vitest';
import { resetIntakeMemoryStore } from '../_lib/site00Intakes/memoryStore.js';
import { resetIntakeStoreModeCache } from '../_lib/site00Intakes/storeAdapter.js';

vi.mock('../_lib/auth.js', () => ({
  getAuthUser: vi.fn(async () => currentUser),
}));

vi.mock('../_lib/email/sendEmail.js', () => ({
  sendEmailAsync: vi.fn(),
}));

let currentUser: { id: string; email: string; accessToken: string } | null = null;

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

describe('api/site00/intakes — client + guest facing handler', () => {
  beforeEach(() => {
    vi.stubEnv('VITEST', 'true');
    resetIntakeMemoryStore();
    resetIntakeStoreModeCache();
    currentUser = null;
  });

  it('guest can start an intake without signing in', async () => {
    const handler = (await import('./intakes.js')).default;
    const req = makeReq({ method: 'POST', query: { action: 'start' }, body: { intakeType: 'IDENTITY', domainLabel: 'discovery' } });
    const res = makeRes();
    await handler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.intake.status).toBe('DRAFT');
  });

  it('list requires sign-in — guest is rejected with 401', async () => {
    const handler = (await import('./intakes.js')).default;
    const req = makeReq({ method: 'GET', query: { action: 'list' } });
    const res = makeRes();
    await handler(req, res);
    expect(res.statusCode).toBe(401);
  });

  it('authenticated caller can list their own intakes', async () => {
    const handler = (await import('./intakes.js')).default;
    currentUser = { id: 'user-1', email: 'user1@example.com', accessToken: 'tok' };
    const startRes = makeRes();
    await handler(
      makeReq({ method: 'POST', query: { action: 'start' }, body: { intakeType: 'BUILDER', domainLabel: 'site' } }),
      startRes,
    );
    expect(startRes.statusCode).toBe(200);

    const listRes = makeRes();
    await handler(makeReq({ method: 'GET', query: { action: 'list' } }), listRes);
    expect(listRes.statusCode).toBe(200);
    expect(listRes.body.intakes.length).toBe(1);
  });

  it('a different authenticated user is denied access to someone else\'s intake', async () => {
    const handler = (await import('./intakes.js')).default;
    currentUser = { id: 'user-1', email: 'user1@example.com', accessToken: 'tok' };
    const startRes = makeRes();
    await handler(
      makeReq({ method: 'POST', query: { action: 'start' }, body: { intakeType: 'IDENTITY', domainLabel: 'discovery' } }),
      startRes,
    );
    const intakeId = startRes.body.intake.id;

    currentUser = { id: 'user-2', email: 'user2@example.com', accessToken: 'tok' };
    const getRes = makeRes();
    await handler(makeReq({ method: 'GET', query: { action: 'get', intakeType: 'IDENTITY', id: intakeId } }), getRes);
    expect(getRes.statusCode).toBe(403);
  });

  it('a forged guest token is rejected on autosave', async () => {
    const handler = (await import('./intakes.js')).default;
    currentUser = { id: 'owner-1', email: 'owner@example.com', accessToken: 'tok' };
    const startRes = makeRes();
    await handler(
      makeReq({ method: 'POST', query: { action: 'start' }, body: { intakeType: 'IDENTITY', domainLabel: 'discovery' } }),
      startRes,
    );
    const intakeId = startRes.body.intake.id;

    currentUser = null; // guest, forged token
    const updateRes = makeRes();
    await handler(
      makeReq({
        method: 'POST',
        query: { action: 'update' },
        body: { intakeType: 'IDENTITY', id: intakeId, guestToken: 'forged-token-value-1234567890', draftPayload: { x: 1 } },
      }),
      updateRes,
    );
    expect(updateRes.statusCode).toBe(403);
  });

  it('submitting twice via the API is idempotent (no duplicate submission)', async () => {
    const handler = (await import('./intakes.js')).default;
    const startRes = makeRes();
    await handler(
      makeReq({ method: 'POST', query: { action: 'start' }, body: { intakeType: 'BUILDER', domainLabel: 'site', email: 'guest@example.com' } }),
      startRes,
    );
    const intakeId = startRes.body.intake.id;

    const submit1 = makeRes();
    await handler(makeReq({ method: 'POST', query: { action: 'submit' }, body: { intakeType: 'BUILDER', id: intakeId } }), submit1);
    const submit2 = makeRes();
    await handler(makeReq({ method: 'POST', query: { action: 'submit' }, body: { intakeType: 'BUILDER', id: intakeId } }), submit2);

    expect(submit1.statusCode).toBe(200);
    expect(submit2.statusCode).toBe(200);
    expect(submit1.body.intake.submittedAt).toBe(submit2.body.intake.submittedAt);
  });

  it('claim without sign-in is rejected (verified authentication required)', async () => {
    const handler = (await import('./intakes.js')).default;
    currentUser = null;
    const res = makeRes();
    await handler(makeReq({ method: 'POST', query: { action: 'claim' }, body: {} }), res);
    expect(res.statusCode).toBe(401);
  });
});
