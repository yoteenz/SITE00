import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import type { VercelRequest } from '@vercel/node';

describe('getAuthUser', () => {
  const originalWebSocket = globalThis.WebSocket;
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    delete (globalThis as { WebSocket?: typeof WebSocket }).WebSocket;
    vi.resetModules();
    fetchMock.mockReset();
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'anon-key-test';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    globalThis.WebSocket = originalWebSocket;
    vi.resetModules();
  });

  it('returns null when Authorization header is missing', async () => {
    const { getAuthUser } = await import('./auth.js');
    const req = { headers: {} } as VercelRequest;
    await expect(getAuthUser(req)).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('validates bearer token via Supabase auth REST without WebSocket', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'user-1', email: 'founder@example.com' }),
    });

    const { getAuthUser } = await import('./auth.js');
    const req = {
      headers: { authorization: 'Bearer access-token-123' },
    } as VercelRequest;

    await expect(getAuthUser(req)).resolves.toEqual({
      id: 'user-1',
      email: 'founder@example.com',
      accessToken: 'access-token-123',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.supabase.co/auth/v1/user',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer access-token-123',
          apikey: 'anon-key-test',
        }),
      }),
    );
  });

  it('returns null when Supabase rejects the token', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 401 });

    const { getAuthUser } = await import('./auth.js');
    const req = {
      headers: { authorization: 'Bearer bad-token' },
    } as VercelRequest;

    await expect(getAuthUser(req)).resolves.toBeNull();
  });
});
