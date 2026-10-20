import { beforeEach, describe, expect, it } from 'vitest';
import { resetDigitalFoundationMemoryStore } from '../api/_lib/digitalFoundation/memoryStore.js';
import { resetDfSessionsForTest } from '../api/_lib/digitalFoundation/dfSession.js';
import { createArtifactForLead, getClientArtifactPayloadByToken } from '../api/_lib/digitalFoundation/service.js';

function mockRes() {
  const headers: Record<string, string | string[]> = {};
  return {
    setHeader(k: string, v: string) {
      headers[k] = v;
    },
    headers,
    statusCode: 200,
    status(n: number) {
      this.statusCode = n;
      return this;
    },
    json(body: unknown) {
      this.body = body;
      return this;
    },
    body: null as unknown,
  };
}

describe('Digital Foundation session (G-09)', () => {
  beforeEach(() => {
    resetDigitalFoundationMemoryStore();
    resetDfSessionsForTest();
  });

  it('establish-session sets cookie and session-payload resolves artifact', async () => {
    const a = createArtifactForLead({});
    const handler = (await import('../api/site00/digital-foundation-session.js')).default;
    const establishRes = mockRes();
    await handler(
      {
        method: 'POST',
        query: { action: 'establish-session' },
        body: { token: a.public_token, action: 'establish-session' },
        headers: {},
      } as never,
      establishRes as never,
    );
    expect(establishRes.statusCode).toBe(200);
    expect(String(establishRes.headers['Set-Cookie'] ?? '')).toContain('df_session=');

    const cookie = String(establishRes.headers['Set-Cookie']).split(';')[0];
    const payloadRes = mockRes();
    await handler(
      {
        method: 'GET',
        query: { action: 'session-payload' },
        headers: { cookie },
      } as never,
      payloadRes as never,
    );
    expect(payloadRes.statusCode).toBe(200);
    const body = payloadRes.body as ReturnType<typeof getClientArtifactPayloadByToken>;
    expect(body.artifact.artifact_id).toBe(a.artifact_id);
  });
});
