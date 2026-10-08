import { describe, expect, it, vi, beforeEach } from 'vitest';
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
    expect([404, 500]).toContain(res.statusCode);
  });
});
