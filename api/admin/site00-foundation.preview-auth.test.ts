import type { VercelRequest, VercelResponse } from '@vercel/node';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('site00-foundation admin auth (cloud preview)', () => {
  const env = process.env;

  afterEach(() => {
    process.env = { ...env };
    vi.resetModules();
  });

  it('allows list without Bearer when SITE00_CLOUD_MOBILE_PREVIEW=1', async () => {
    process.env.NODE_ENV = 'development';
    process.env.SITE00_CLOUD_MOBILE_PREVIEW = '1';
    delete process.env.SUPABASE_URL;

    const { default: handler } = await import('./site00-foundation.js');

    const req = {
      method: 'GET',
      query: { action: 'list' },
      headers: {},
    } as unknown as VercelRequest;

    let status = 0;
    let body: unknown;
    const res = {
      setHeader: vi.fn(),
      status: (code: number) => {
        status = code;
        return res;
      },
      json: (payload: unknown) => {
        body = payload;
        return res;
      },
      end: vi.fn(),
    } as unknown as VercelResponse;

    await handler(req, res);
    expect(status).toBe(200);
    expect(body).toMatchObject({ artifacts: expect.any(Array) });
  });

  it('requires Bearer when preview flag is off', async () => {
    process.env.NODE_ENV = 'development';
    delete process.env.SITE00_CLOUD_MOBILE_PREVIEW;
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'anon';

    const { default: handler } = await import('./site00-foundation.js');

    const req = {
      method: 'GET',
      query: { action: 'list' },
      headers: {},
    } as unknown as VercelRequest;

    let status = 0;
    let body: unknown;
    const res = {
      setHeader: vi.fn(),
      status: (code: number) => {
        status = code;
        return res;
      },
      json: (payload: unknown) => {
        body = payload;
        return res;
      },
      end: vi.fn(),
    } as unknown as VercelResponse;

    await handler(req, res);
    expect(status).toBe(401);
    expect(body).toMatchObject({ code: 'MISSING_TOKEN' });
  });
});
