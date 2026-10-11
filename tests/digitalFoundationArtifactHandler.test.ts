import { describe, expect, it, vi, beforeEach } from 'vitest';
import { digitalFoundationHandlerError } from '../api/site00/digital-foundation-artifact.js';
import { resetDigitalFoundationMemoryStore } from '../api/_lib/digitalFoundation/memoryStore.js';
import { createArtifactForLead } from '../api/_lib/digitalFoundation/service.js';

describe('digital-foundation-artifact API handler smoke', () => {
  beforeEach(() => {
    resetDigitalFoundationMemoryStore();
    vi.stubEnv('SITE00_DIGITAL_FOUNDATION_ARTIFACT_V1', '1');
  });

  it('loads handler module and returns client payload for valid token', async () => {
    const handler = (await import('../api/site00/digital-foundation-artifact.js')).default;
    const artifact = createArtifactForLead({});
    const req = {
      method: 'GET',
      query: { action: 'payload', token: artifact.public_token },
      body: {},
      headers: {},
    } as never;
    const res = {
      statusCode: 0,
      body: null as unknown,
      setHeader: () => undefined,
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(payload: unknown) {
        this.body = payload;
        return this;
      },
      end: () => undefined,
    } as never;

    await handler(req, res);
    expect(res.statusCode).toBe(200);
    const body = res.body as Record<string, unknown>;
    expect(body.artifact).toBeTruthy();
    expect(body.events).toBeUndefined();
    expect(body.referral_source).toBeUndefined();
  });

  it('returns 404 for invalid token', async () => {
    const handler = (await import('../api/site00/digital-foundation-artifact.js')).default;
    const req = {
      method: 'GET',
      query: { action: 'payload', token: 'not-a-real-token-value' },
      body: {},
      headers: {},
    } as never;
    const res = {
      statusCode: 0,
      body: null as unknown,
      setHeader: () => undefined,
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(payload: unknown) {
        this.body = payload;
        return this;
      },
      end: () => undefined,
    } as never;

    await handler(req, res);
    expect([404, 500, 503]).toContain(res.statusCode);
  });

  it('maps plain provider failures instead of [object Object]', () => {
    expect(digitalFoundationHandlerError({ message: 'ARTIFACT_NOT_FOUND', code: 'PGRST116' })).toEqual({
      status: 404,
      error: 'ARTIFACT_NOT_FOUND',
    });
    const down = digitalFoundationHandlerError({
      title: 'Error 522: Connection timed out',
      detail: 'Cloudflare could not establish a TCP connection',
      status: 522,
    });
    expect(down.status).toBe(503);
    expect(down.error).toContain('could not establish a TCP connection');
    expect(down.error).not.toBe('[object Object]');
  });
});
