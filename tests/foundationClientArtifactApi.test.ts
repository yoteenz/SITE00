import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { fetchPayload } from '../src/site00/foundation-client/api';
import { parseClientDigitalFoundationPayload } from '../src/site00/foundation-client/validateClientPayload';
import { DfApiError } from '../src/site00/foundation-client/dfApiError';
import { draftFromPayload, resolveDfRoute } from '../src/site00/foundation-client/model';
import { fixtureFor } from '../shared/site00-correspondence-studio/fndatn01/index.js';

describe('parseClientDigitalFoundationPayload', () => {
  it('accepts a valid artifact payload', () => {
    const payload = fixtureFor('01');
    expect(parseClientDigitalFoundationPayload(payload).artifact.artifact_id).toBeTruthy();
  });

  it('rejects empty objects (SPA HTML mis-parse)', () => {
    expect(() => parseClientDigitalFoundationPayload({})).toThrow(DfApiError);
    try {
      parseClientDigitalFoundationPayload({});
    } catch (e) {
      expect(e).toBeInstanceOf(DfApiError);
      expect((e as DfApiError).code).toBe('INVALID_PAYLOAD');
    }
  });

  it('rejects payloads missing artifact.artifact_id', () => {
    expect(() => parseClientDigitalFoundationPayload({ surface: 'PROSPECT' })).toThrow(/INVALID_PAYLOAD/);
  });
});

describe('foundation client artifact API', () => {
  beforeEach(() => {
    vi.stubGlobal('import', { meta: { env: { VITE_API_BASE: 'https://reliable-creation-staging.test' } } });
    vi.stubEnv('VITE_API_BASE', 'https://reliable-creation-staging.test');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('fetchPayload uses absolute API base (not SPA origin)', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      expect(url).toMatch(/^https:\/\/reliable-creation-staging\.test\//);
      return new Response(JSON.stringify({ error: 'NOT_FOUND' }), {
        status: 404,
        headers: { 'content-type': 'application/json' },
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchPayload('bad-token')).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('fetchPayload rejects HTML SPA fallback responses', async () => {
    vi.stubGlobal('fetch', async () =>
      new Response('<!doctype html><html></html>', {
        status: 200,
        headers: { 'content-type': 'text/html' },
      }),
    );

    await expect(fetchPayload('any')).rejects.toMatchObject({ code: 'INVALID_API_RESPONSE' });
  });
});

describe('foundation client model guards', () => {
  it('draftFromPayload does not throw when artifact intake is missing', () => {
    const payload = fixtureFor('01');
    const broken = { ...payload, artifact: { ...payload.artifact, intake: undefined as unknown as typeof payload.artifact.intake } };
    expect(() => draftFromPayload(broken)).not.toThrow();
  });

  it('resolveDfRoute returns a safe route when artifact id is missing', () => {
    const payload = fixtureFor('01');
    const broken = {
      ...payload,
      artifact: { ...payload.artifact, artifact_id: '' },
    };
    const route = resolveDfRoute(broken, { checkout: null, activationSeen: false });
    expect(route.kind).toBe('views');
  });
});
