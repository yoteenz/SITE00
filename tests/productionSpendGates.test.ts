import fs from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * D-13 regression: reading never spends. The two bypasses the Character Studios audit found were (1) Entry 002 paid
 * generation defaulting on whenever FAL_KEY exists, reachable from plain GETs, and (2) the ASSTS library GET queueing
 * a batch run and polling continuing a vault lineage. Both now need an explicit action.
 */
const REPO = path.resolve(import.meta.dirname, '..');
const read = (rel: string) => fs.readFileSync(path.join(REPO, rel), 'utf8');

const calls = vi.hoisted(() => ({
  bootstrap: [] as Array<{ name: string; options: Record<string, unknown> | undefined }>,
  pipeline: [] as Array<Record<string, unknown> | undefined>,
  runBatch: 0,
  poll: [] as Array<Record<string, unknown> | undefined>,
  lineage: 0,
  falSubscribe: 0,
}));

vi.mock('../api/_lib/site00ExpressionEngine/expressionEngineService.js', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  const capture = (name: string) => async (options?: Record<string, unknown>) => {
    calls.bootstrap.push({ name, options });
    throw new Error('captured');
  };
  return { ...actual, bootstrapB3CreativeAnchor: capture('B3'), bootstrapB41: capture('B41'), bootstrapB42: capture('B42'), bootstrapB44: capture('B44'), bootstrapB45: capture('B45'), bootstrapB46: capture('B46') };
});

vi.mock('../api/_lib/adminAuth.js', () => ({ resolveAdminAuth: async () => ({ ok: true }) }));
vi.mock('../api/_lib/site00Assts/service.js', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    ensureAutoGenerationPipeline: async (_key: string, options?: Record<string, unknown>) => {
      calls.pipeline.push(options);
      return { autoQueued: false, polled: 0, awaitingGeneration: 3 };
    },
    getLibrarySummary: async () => ({ batchesList: [] }),
    getLibraryCategoryCounts: async () => ({}),
    getBatchById: async () => ({ id: 'b1', batch_key: 'K' }),
    getBatchByKey: async () => ({ id: 'b1', batch_key: 'K' }),
    enrichBatch: async (b: unknown) => b,
    getAssetById: async () => ({ id: 'a1', batch_id: null }),
    listReviewEvents: async () => [],
    enrichAsset: async (a: unknown) => a,
  };
});
vi.mock('../api/_lib/site00Assts/generation.js', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    runBatchGeneration: async () => {
      calls.runBatch += 1;
      return { queued: 0, jobs: [] };
    },
    pollPendingGenerationJobs: async (_limit?: number, options?: Record<string, unknown>) => {
      calls.poll.push(options);
      return 0;
    },
    continueVaultLineageGeneration: async () => {
      calls.lineage += 1;
      return { queued: 0, jobs: [] };
    },
  };
});
vi.mock('../api/_lib/site00Assts/postProcess/pipeline.js', async (importOriginal) => ({ ...(await importOriginal<Record<string, unknown>>()), pollPendingLoaderPostProcessJobs: async () => 0 }));
vi.mock('../api/_lib/site00Assts/storage.js', async (importOriginal) => ({ ...(await importOriginal<Record<string, unknown>>()), site00StorageObjectExists: async () => false }));
vi.mock('@fal-ai/client', () => ({
  fal: {
    config: () => undefined,
    subscribe: async () => {
      calls.falSubscribe += 1;
      throw new Error('provider call reached');
    },
  },
}));

function mockRes() {
  const res = { statusCode: 0, body: undefined as unknown, headers: {} as Record<string, string> };
  const api = {
    status(code: number) {
      res.statusCode = code;
      return api;
    },
    json(b: unknown) {
      res.body = b;
      return api;
    },
    setHeader(k: string, v: string) {
      res.headers[k] = v;
      return api;
    },
    end() {
      return api;
    },
  };
  return { res, api: api as unknown as VercelResponse };
}
const req = (method: string, query: Record<string, string>, body: Record<string, unknown> = {}) => ({ method, query, body, headers: {} }) as unknown as VercelRequest;

beforeEach(() => {
  calls.bootstrap.length = 0;
  calls.pipeline.length = 0;
  calls.poll.length = 0;
  calls.runBatch = 0;
  calls.lineage = 0;
  calls.falSubscribe = 0;
});

describe('D-13: Expression Engine GET phases never dispatch paid generation', () => {
  it('no dispatcher defaults to spending when a provider key is configured', () => {
    const dir = 'api/_lib/site00ExpressionEngine';
    const offenders = fs.readdirSync(path.join(REPO, dir)).filter((f) => f.endsWith('.ts') && /dispatchFal \?\? Boolean\(process\.env\.FAL_KEY/.test(read(`${dir}/${f}`)));
    expect(offenders).toEqual([]);
    expect(read('api/site00/expression-engine.ts')).not.toMatch(/body\.dispatchFal !== false|req\.query\.dispatchFal === '1'|req\.query\.forceDispatch === '1'/);
  });

  it.each([
    ['B3', 'B3'],
    ['B41', 'B41'],
    ['B42', 'B42'],
    ['B44', 'B44'],
    ['B45', 'B45'],
    ['B46', 'B46'],
  ])('GET phase=%s ignores ?dispatchFal=1 and ?forceDispatch=1', async (phase, name) => {
    const { default: handler } = await import('../api/site00/expression-engine.js');
    const { api } = mockRes();
    await handler(req('GET', { phase, dispatchFal: '1', forceDispatch: '1' }, { dispatchFal: true, forceDispatch: true }), api);
    const call = calls.bootstrap.find((c) => c.name === name);
    expect(call, name).toBeDefined();
    expect(call!.options?.dispatchFal, name).toBe(false);
    if ('forceDispatch' in (call!.options ?? {})) expect(call!.options!.forceDispatch, name).toBe(false);
  });
});

describe('D-13: the keyframe dispatcher is opt-in', () => {
  const env = { ...process.env };
  afterEach(() => {
    process.env = { ...env };
  });

  it('does not call the provider with a key configured and no explicit request', async () => {
    process.env.VITEST = 'false';
    process.env.FAL_KEY = 'test-key-not-real';
    const { dispatchEntry002ReelKeyframeRaster } = await import('../api/_lib/site00ExpressionEngine/entry002ReelKeyframeDispatch.js');
    const result = await dispatchEntry002ReelKeyframeRaster('START', { skipStoryboardGateCheck: true });
    expect(result.status).toBe('NOT_DISPATCHED');
    expect(result.dispatchAttempted).toBe(false);
    expect(calls.falSubscribe).toBe(0);
  });

  it('still reaches the provider only when a caller asks explicitly (mocked; no real request)', async () => {
    process.env.VITEST = 'false';
    process.env.FAL_KEY = 'test-key-not-real';
    const { dispatchEntry002ReelKeyframeRaster } = await import('../api/_lib/site00ExpressionEngine/entry002ReelKeyframeDispatch.js');
    await dispatchEntry002ReelKeyframeRaster('START', { dispatchFal: true, skipStoryboardGateCheck: true }).catch(() => undefined);
    expect(calls.falSubscribe).toBeGreaterThan(0);
  });
});

describe('D-13: ASSTS reads never queue or continue paid generation', () => {
  it('GET library reports pending work without starting a batch run', async () => {
    const { default: handler } = await import('../api/admin/site00-assts.js');
    const { res, api } = mockRes();
    await handler(req('GET', { action: 'library' }), api);
    expect(res.statusCode).toBe(200);
    expect(calls.pipeline).toEqual([undefined]);
    expect(calls.runBatch).toBe(0);
    expect((res.body as { pipeline: { awaitingGeneration: number } }).pipeline.awaitingGeneration).toBe(3);
  });

  it.each(['batch', 'asset', 'poll'])('GET %s polls without continuing a vault lineage', async (action) => {
    const { default: handler } = await import('../api/admin/site00-assts.js');
    const { api } = mockRes();
    await handler(req('GET', { action, batchId: 'b1', assetId: 'a1' }), api);
    expect(calls.poll.length).toBeGreaterThan(0);
    expect(calls.poll.every((o) => o?.continueLineage !== true)).toBe(true);
    expect(calls.lineage).toBe(0);
    expect(calls.runBatch).toBe(0);
  });

  it('continuing a lineage is an explicit admin POST', async () => {
    const { default: handler } = await import('../api/admin/site00-assts.js');
    const { res, api } = mockRes();
    await handler(req('POST', { action: 'continue-lineage' }, { action: 'continue-lineage', batchKey: 'K' }), api);
    expect(res.statusCode).toBe(200);
    expect(calls.lineage).toBe(1);
  });

  it('the pipeline starts a run only on allowGeneration: true and counts failed assets without retrying them', async () => {
    const { assetsAwaitingGeneration } = await import('../api/_lib/site00Assts/service.js');
    expect(assetsAwaitingGeneration([{ status: 'FAILED', current_version_id: 'v' }, { status: 'NEEDS_REVIEW', current_version_id: 'v' }, { status: 'QUEUED', current_version_id: null }])).toBe(2);
    const src = read('api/_lib/site00Assts/service.ts');
    expect(src).toMatch(/if \(options\.allowGeneration === true && awaitingGeneration > 0/);
    expect(read('api/_lib/site00Assts/generation.ts')).toMatch(/if \(options\.continueLineage === true\) \{\n\s+for \(const batchKey of batchesToContinue\)/);
  });
});
