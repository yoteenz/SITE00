/**
 * HTTP layer of /api/jurnl/bank: authentication, the server-side founder gate, configuration refusal, and that no
 * response carries a provider access token or the sync cursor.
 */
import { afterEach, describe, expect, it } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import bankHandler from '../../../api/jurnl/bank';
import { setBankAuthOverrideForTests } from '../../../api/_lib/jurnlBanking/http';
import { setBankingDepsOverride } from '../../../api/_lib/jurnlBanking/runtime';
import { bankingHarness, createUser, acct } from './harness';

function call(op: string, method: 'GET' | 'POST', body: Record<string, unknown> = {}, query: Record<string, string> = {}) {
  const out: { status: number; json: unknown } = { status: 0, json: null };
  const res = {
    setHeader: () => res,
    status: (s: number) => {
      out.status = s;
      return res;
    },
    json: (j: unknown) => {
      out.json = j;
      return res;
    },
    end: () => res,
  } as unknown as VercelResponse;
  const req = { method, query: { op, ...query }, headers: { authorization: 'Bearer test' }, body } as unknown as VercelRequest;
  return bankHandler(req, res).then(() => out);
}

afterEach(() => {
  setBankAuthOverrideForTests(null, null);
  setBankingDepsOverride(null);
});

describe('/api/jurnl/bank', () => {
  it('config never needs a session and lists missing settings by name only', async () => {
    const r = await call('config', 'GET');
    expect(r.status).toBe(200);
    expect(r.json).toMatchObject({ configured: false, readOnly: true });
    const j = r.json as { missing: string[] };
    expect(Object.keys(r.json as object).sort()).toEqual(['access', 'configured', 'environment', 'missing', 'readOnly']);
    expect(j.missing.every((m) => /^[A-Z_]+$/.test(m))).toBe(true);
  });

  it('401 without a valid session', async () => {
    setBankAuthOverrideForTests(async () => null);
    expect((await call('connections', 'GET')).status).toBe(401);
  });

  it('503 when connected banking is not configured (never a pretend connection)', async () => {
    setBankAuthOverrideForTests(async () => ({ id: 'u', email: 'u@example.test', accessToken: 't' }));
    const r = await call('connections', 'GET');
    expect(r.status).toBe(503);
    expect(r.json).toMatchObject({ code: 'BANKING_NOT_CONFIGURED' });
  });

  it('403 for an account without the server-side founder grant', async () => {
    const h = await bankingHarness();
    setBankingDepsOverride(h.deps);
    setBankAuthOverrideForTests(async () => ({ id: 'u', email: 'u@example.test', accessToken: 't' }), async () => false);
    expect((await call('link-token', 'POST')).status).toBe(403);
  });

  it('founder flow over HTTP: link token → exchange → connections; no token or cursor in any response', async () => {
    const h = await bankingHarness();
    const user = await createUser(h.db, 'founder@example.test');
    setBankingDepsOverride(h.deps);
    setBankAuthOverrideForTests(async () => ({ id: user, email: 'founder@example.test', accessToken: 't' }), async (id) => id === user);
    const pub = h.provider.addItem('item-H', { institution_id: 'ins_s', institution_name: 'SYNTHETIC BANK', accounts: [acct({ provider_account_id: 'a1', name: 'Checking', type: 'depository', subtype: 'checking', current_balance: 50, available_balance: 50 })] });
    const lt = await call('link-token', 'POST');
    expect(lt.status).toBe(200);
    expect(lt.json).toMatchObject({ mode: 'NEW', environment: 'sandbox' });
    const ex = await call('exchange', 'POST', { public_token: pub });
    expect(ex.status).toBe(200);
    const conns = await call('connections', 'GET');
    expect(conns.status).toBe(200);
    const all = JSON.stringify([lt.json, ex.json, conns.json]);
    expect(all).not.toMatch(/access-sandbox-/);
    expect(all).not.toMatch(/sync_cursor/);
    expect((conns.json as { items: unknown[] }).items).toHaveLength(1);
  });
});
