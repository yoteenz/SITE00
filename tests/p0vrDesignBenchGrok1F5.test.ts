import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import {
  FIGMA_STYLE_PACKAGE_KEYS,
  GROK_DESIGN_BENCH_EXECUTION_TIMEOUT_MS,
  GROK_DESIGN_BENCH_INFERENCE_PATH,
  GROK_DESIGN_BENCH_STALL_MS,
  GROK_PROVIDER_MAX_ATTEMPTS,
  GROK_PROVIDER_MAX_RETRIES,
  GROK_PROVIDER_SERVICE_UNAVAILABLE,
  GROK_TWIN_TEST_A_PROVIDER_MODEL,
  P0_VR_DESIGNBENCH_GROK1_BUILD,
  P0_VR_DESIGNBENCH_GROK1F5_LINEAGE,
} from '../shared/site00-design-bench/grokTwinTestA/constants.js';
import { classifyGrok46ProviderError, GROK_DESIGN_BENCH_MODEL_ID } from '../shared/site00-design-bench/grokTwinTestA/modelContract.js';
import {
  classifyGrokProviderHttpStatus,
  computeGrokProviderRetryWaitMs,
  grokIncidentClassForHttp,
  isNonRetryableGrokProviderStatus,
  isTransientGrokProviderStatus,
  mapProviderClassificationToBenchmarkFailure,
  parseRetryAfterMs,
} from '../shared/site00-design-bench/grokTwinTestA/providerErrors.js';
import { fetchGrokResponsesWithRetry, GrokProviderError } from '../api/_lib/site00GrokDesignBench/grokProviderRetry.js';
import { grok46ProviderFailureFromHttp, buildGrok46ResponsesPayload } from '../api/_lib/site00GrokDesignBench/grokVisionProvider.js';
import { retryGrokDesignBenchFromRun, startGrokDesignBenchRun } from '../api/_lib/site00GrokDesignBench/service.js';
import { resetGrokDesignBenchStoreForTests } from '../api/_lib/site00GrokDesignBench/store.js';

const PNG_1X1_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

function read(path: string): string {
  return readFileSync(path, 'utf8');
}

function sequentialFetch(
  responses: Array<{ status: number; body: unknown; headers?: Record<string, string> }>,
): { fetchImpl: typeof fetch; calls: () => number } {
  let calls = 0;
  const fetchImpl = (async () => {
    const spec = responses[Math.min(calls, responses.length - 1)];
    calls += 1;
    return new Response(typeof spec.body === 'string' ? spec.body : JSON.stringify(spec.body), {
      status: spec.status,
      headers: spec.headers,
    });
  }) as typeof fetch;
  return { fetchImpl, calls: () => calls };
}

async function instantSleep(): Promise<void> {
  /* no delay in tests */
}

describe('P0.VR.DESIGNBENCH.GROK1F5 xAI 503 classification + transient retry', () => {
  afterEach(() => {
    resetGrokDesignBenchStoreForTests();
    delete process.env.XAI_API_KEY;
  });

  it('1. 503 is not MODEL_REJECTED', () => {
    expect(classifyGrokProviderHttpStatus(503, 'overloaded')).not.toBe('MODEL_REJECTED' as never);
    expect(classifyGrok46ProviderError(503, 'model service unavailable')).not.toBe('MODEL_REJECTED' as never);
    expect(grok46ProviderFailureFromHttp('inc-503', 503, 'unavailable').classification).not.toBe(
      'MODEL_REJECTED' as never,
    );
    expect(P0_VR_DESIGNBENCH_GROK1F5_LINEAGE).toBe('P0.VR.DESIGNBENCH.GROK1F5');
    expect(P0_VR_DESIGNBENCH_GROK1_BUILD).toBe('v489');
  });

  it('2. 503 → PROVIDER_SERVICE_UNAVAILABLE / GROK_PROVIDER_SERVICE_UNAVAILABLE', () => {
    expect(classifyGrokProviderHttpStatus(503, '')).toBe('PROVIDER_SERVICE_UNAVAILABLE');
    expect(grokIncidentClassForHttp(503, '')).toBe(GROK_PROVIDER_SERVICE_UNAVAILABLE);
    expect(mapProviderClassificationToBenchmarkFailure('PROVIDER_SERVICE_UNAVAILABLE')).toBe(
      'PROVIDER_TRANSIENT_FAILURE',
    );
    expect(grok46ProviderFailureFromHttp('inc-503', 503, 'unavailable').code).toBe(GROK_PROVIDER_SERVICE_UNAVAILABLE);
  });

  it('3–6. 429/500/502/504 are transient', () => {
    for (const status of [429, 500, 502, 503, 504]) {
      expect(isTransientGrokProviderStatus(status)).toBe(true);
    }
    expect(classifyGrokProviderHttpStatus(429, '')).toBe('RATE_LIMITED');
    expect(classifyGrokProviderHttpStatus(500, '')).toBe('PROVIDER_INTERNAL_ERROR');
    expect(classifyGrokProviderHttpStatus(502, '')).toBe('PROVIDER_BAD_GATEWAY');
    expect(classifyGrokProviderHttpStatus(504, '')).toBe('PROVIDER_GATEWAY_TIMEOUT');
  });

  it('7. max 2 retries after the initial attempt', async () => {
    expect(GROK_PROVIDER_MAX_ATTEMPTS).toBe(3);
    expect(GROK_PROVIDER_MAX_RETRIES).toBe(2);
    const seq = sequentialFetch([
      { status: 503, body: { error: 'unavailable' } },
      { status: 503, body: { error: 'unavailable' } },
      { status: 503, body: { error: 'unavailable' } },
      { status: 503, body: { error: 'should-not-call' } },
    ]);
    await expect(
      fetchGrokResponsesWithRetry({
        runId: 'r-max',
        endpoint: 'https://api.x.ai/v1/responses',
        apiKey: 'test-not-real',
        body: '{}',
        fetchImpl: seq.fetchImpl,
        sleepImpl: instantSleep,
      }),
    ).rejects.toMatchObject({
      classification: 'PROVIDER_SERVICE_UNAVAILABLE',
      benchmarkFailureClass: 'PROVIDER_TRANSIENT_FAILURE',
      attempts: 3,
    });
    expect(seq.calls()).toBe(3);
  });

  it('8. Retry-After is honored when provided', async () => {
    const waits: number[] = [];
    const seq = sequentialFetch([
      { status: 503, body: { error: 'busy' }, headers: { 'retry-after': '7' } },
      { status: 200, body: { output_text: '{}' } },
    ]);
    await fetchGrokResponsesWithRetry({
      runId: 'r-after',
      endpoint: 'https://api.x.ai/v1/responses',
      apiKey: 'test-not-real',
      body: '{}',
      fetchImpl: seq.fetchImpl,
      sleepImpl: async (ms) => {
        waits.push(ms);
      },
    });
    expect(parseRetryAfterMs('7')).toBe(7000);
    expect(waits[0]).toBe(7000);
    expect(
      computeGrokProviderRetryWaitMs({
        nextAttempt: 2,
        retryAfterHeader: '7',
        remainingBudgetMs: 60_000,
      }).honoredRetryAfter,
    ).toBe(true);
  });

  it('9–12. 400/401/403/410 are not automatically retried', async () => {
    for (const status of [400, 401, 403, 410] as const) {
      expect(isNonRetryableGrokProviderStatus(status)).toBe(true);
      expect(isTransientGrokProviderStatus(status)).toBe(false);
      const seq = sequentialFetch([
        { status, body: { error: 'no' } },
        { status: 200, body: { output_text: '{}' } },
      ]);
      await expect(
        fetchGrokResponsesWithRetry({
          runId: `r-${status}`,
          endpoint: 'https://api.x.ai/v1/responses',
          apiKey: 'test-not-real',
          body: '{}',
          fetchImpl: seq.fetchImpl,
          sleepImpl: instantSleep,
        }),
      ).rejects.toBeInstanceOf(GrokProviderError);
      expect(seq.calls()).toBe(1);
    }
    expect(classifyGrokProviderHttpStatus(400, '')).toBe('INVALID_REQUEST');
    expect(classifyGrokProviderHttpStatus(401, '')).toBe('AUTHENTICATION_OR_ACCESS_FAILURE');
    expect(classifyGrokProviderHttpStatus(403, '')).toBe('AUTHENTICATION_OR_ACCESS_FAILURE');
    expect(classifyGrokProviderHttpStatus(410, '')).toBe('MODEL_OR_ENDPOINT_REJECTED');
    expect(mapProviderClassificationToBenchmarkFailure('MODEL_OR_ENDPOINT_REJECTED')).toBe('MODEL_ACCESS_FAILURE');
  });

  it('13. retries remain inside the overall 10-minute timeout', async () => {
    expect(GROK_DESIGN_BENCH_EXECUTION_TIMEOUT_MS).toBe(10 * 60 * 1000);
    expect(GROK_DESIGN_BENCH_STALL_MS).toBe(5 * 60 * 1000);
    const inside = computeGrokProviderRetryWaitMs({
      nextAttempt: 2,
      remainingBudgetMs: GROK_DESIGN_BENCH_EXECUTION_TIMEOUT_MS,
    });
    expect(inside.canRetry).toBe(true);
    const noBudget = computeGrokProviderRetryWaitMs({
      nextAttempt: 2,
      remainingBudgetMs: 100,
    });
    expect(noBudget.canRetry).toBe(false);
    const seq = sequentialFetch([
      { status: 503, body: { error: 'unavailable' } },
      { status: 503, body: { error: 'unavailable' } },
    ]);
    await expect(
      fetchGrokResponsesWithRetry({
        runId: 'r-timeout',
        endpoint: 'https://api.x.ai/v1/responses',
        apiKey: 'test-not-real',
        body: '{}',
        deadlineMs: Date.now() + 50,
        fetchImpl: seq.fetchImpl,
        sleepImpl: instantSleep,
      }),
    ).rejects.toBeInstanceOf(GrokProviderError);
    expect(seq.calls()).toBe(1);
  });

  it('14–15. retry attempts and provider request IDs are recorded safely', async () => {
    const seq = sequentialFetch([
      {
        status: 503,
        body: { error: { message: 'busy Bearer xai-secretkey', type: 'unavailable', code: 'svc' } },
        headers: { 'x-request-id': 'req-abc-1' },
      },
      { status: 200, body: { output_text: '{}' } },
    ]);
    const result = await fetchGrokResponsesWithRetry({
      runId: 'r-ids',
      endpoint: 'https://api.x.ai/v1/responses',
      apiKey: 'xai-secretkey',
      body: '{}',
      fetchImpl: seq.fetchImpl,
      sleepImpl: instantSleep,
    });
    expect(result.retryState.attempt).toBe(2);
    expect(result.retryState.retries).toBe(1);
    expect(result.retryState.timing.successfulAttempt).toBe(2);
    expect(result.retryState.timing.attempt1Duration).not.toBeNull();
    expect(result.retryState.timing.attempt2Duration).not.toBeNull();
    expect(result.retryState.evidence[0]?.providerRequestId).toBe('req-abc-1');
    const serialized = JSON.stringify(result.retryState);
    expect(serialized).not.toContain('xai-secretkey');
    expect(serialized).not.toContain('Authorization');
    expect(serialized).toContain('req-abc-1');
  });

  it('16–17. golden SHA is preserved and manual retry creates a new run ID', async () => {
    const first = await startGrokDesignBenchRun({
      projectId: 'ndxbook',
      filename: 'golden.png',
      mime: 'image/png',
      width: 390,
      height: 844,
      imageBase64: PNG_1X1_B64,
      awaitCompletion: true,
    });
    const second = await retryGrokDesignBenchFromRun(first.runId);
    expect(second.runId).not.toBe(first.runId);
    expect(second.reference?.sha256).toBe(first.reference?.sha256);
    expect(first.reference?.immutableForRun).toBe(true);
    expect(second.reference?.immutableForRun).toBe(true);
  });

  it('18–20. benchmark contract, model, and /v1/responses stay unchanged', () => {
    expect(FIGMA_STYLE_PACKAGE_KEYS).toHaveLength(14);
    expect(GROK_DESIGN_BENCH_MODEL_ID).toBe('grok-4.6');
    expect(GROK_TWIN_TEST_A_PROVIDER_MODEL).toBe('grok-4.6');
    expect(GROK_DESIGN_BENCH_INFERENCE_PATH).toBe('/responses');
    const payload = buildGrok46ResponsesPayload({
      runId: 'contract',
      imageBytes: Buffer.from('abcd'),
      mime: 'image/png',
      filename: 'tiny.png',
      width: 32,
      height: 32,
      sha256: 'abc',
    });
    expect(payload.model).toBe('grok-4.6');
    expect(JSON.stringify(payload)).not.toContain('max_output_tokens');
    expect(read('api/_lib/site00GrokDesignBench/prompt.ts')).toContain('FigmaStyleInterfaceTranslationPackage');
    expect(read('api/_lib/site00GrokDesignBench/grokVisionProvider.ts')).toContain('/responses');
    expect(read('api/_lib/site00GrokDesignBench/grokVisionProvider.ts')).toContain('https://api.x.ai/v1');
  });

  it('21–22. Composer is not invoked and Sol route is untouched', () => {
    const files = [
      'api/_lib/site00GrokDesignBench/grokProviderRetry.ts',
      'api/_lib/site00GrokDesignBench/grokVisionProvider.ts',
      'api/_lib/site00GrokDesignBench/jobRunner.ts',
      'src/site00/pages/DesignTwinTestAPage.tsx',
      'shared/site00-design-bench/grokTwinTestA/providerErrors.ts',
    ];
    for (const file of files) {
      const src = read(file);
      expect(src).not.toContain('invokeComposer');
      expect(src).not.toContain('gpt-5.6-sol');
      expect(src).not.toContain('solTwinTestB');
    }
    expect(read('src/site00/pages/SolDesignBenchmarkPage.tsx')).not.toContain('GROK1F5');
  });

  it('mocked 503 retries then succeeds without MODEL_REJECTED', async () => {
    const seq = sequentialFetch([
      { status: 503, body: { error: 'unavailable' } },
      { status: 200, body: { output_text: '{}' } },
    ]);
    const result = await fetchGrokResponsesWithRetry({
      runId: 'r-recover',
      endpoint: 'https://api.x.ai/v1/responses',
      apiKey: 'test-not-real',
      body: '{}',
      fetchImpl: seq.fetchImpl,
      sleepImpl: instantSleep,
    });
    expect(result.retryState.status).toBe('SUCCEEDED');
    expect(result.retryState.retries).toBe(1);
    expect(JSON.stringify(result.retryState)).not.toContain('MODEL_REJECTED');
    expect(read('src/site00/pages/DesignTwinTestAPage.tsx')).toContain('GROK PROVIDER TEMPORARILY UNAVAILABLE');
    expect(read('src/site00/pages/DesignTwinTestAPage.tsx')).toContain('RETRY GROK TEST');
    expect(read('src/site00/pages/DesignTwinTestAPage.tsx')).not.toContain('MODEL REJECTED');
    expect(read('api/_lib/site00GrokDesignBench/jobRunner.ts')).toContain('onProviderEvent');
    expect(read('api/_lib/site00GrokDesignBench/jobRunner.ts')).toContain('lastStateChangeAt');
  });
});
