import { describe, expect, it, beforeEach, vi } from 'vitest';
import { resetIntakeMemoryStore } from '../_lib/site00Intakes/memoryStore.js';
import { resetIntakeStoreModeCache } from '../_lib/site00Intakes/storeAdapter.js';

vi.mock('../_lib/email/sendEmail.js', () => ({
  sendEmailAsync: vi.fn(),
}));

function makeReq(opts: { method: string; query?: Record<string, string> }) {
  return { method: opts.method, query: opts.query ?? {}, headers: {} } as any;
}

function makeRes() {
  const res: any = {
    statusCode: 200,
    body: undefined,
    setHeader() {},
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

describe('api/site00/intake-access — public guest resolution endpoint', () => {
  beforeEach(() => {
    vi.stubEnv('VITEST', 'true');
    resetIntakeMemoryStore();
    resetIntakeStoreModeCache();
  });

  it('resolves a valid token to its intake without requiring sign-in', async () => {
    const intakesHandler = (await import('./intakes.js')).default;
    const startRes = makeRes();
    await intakesHandler(
      { method: 'POST', query: { action: 'start' }, body: { intakeType: 'IDENTITY', domainLabel: 'discovery' }, headers: {} } as any,
      startRes,
    );
    const accessRes = makeRes();
    await intakesHandler(
      {
        method: 'POST',
        query: { action: 'send-access' },
        body: { intakeType: 'IDENTITY', id: startRes.body.intake.id, email: 'guest@example.com' },
        headers: {},
      } as any,
      accessRes,
    );
    const rawToken = accessRes.body.accessToken;

    const handler = (await import('./intake-access.js')).default;
    const res = makeRes();
    await handler(makeReq({ method: 'GET', query: { token: rawToken } }), res);
    expect(res.statusCode).toBe(200);
    expect(res.body.intake.id).toBe(startRes.body.intake.id);
  });

  it('an invalid/forged token returns 404, never leaking whether an intake exists', async () => {
    const handler = (await import('./intake-access.js')).default;
    const res = makeRes();
    await handler(makeReq({ method: 'GET', query: { token: 'totally-forged-token-value-000000' } }), res);
    expect(res.statusCode).toBe(404);
  });

  it('missing token is rejected with 400', async () => {
    const handler = (await import('./intake-access.js')).default;
    const res = makeRes();
    await handler(makeReq({ method: 'GET', query: {} }), res);
    expect(res.statusCode).toBe(400);
  });
});
