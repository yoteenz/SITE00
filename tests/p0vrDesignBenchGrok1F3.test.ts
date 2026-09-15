import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import {
  FIGMA_STYLE_PACKAGE_KEYS,
  GROK_4_6_NOT_AVAILABLE_TO_CURRENT_XAI_TEAM,
  GROK_DESIGN_BENCH_INFERENCE_METHOD,
  GROK_DESIGN_BENCH_INFERENCE_PATH,
  P0_VR_DESIGNBENCH_GROK1_BUILD,
  P0_VR_DESIGNBENCH_GROK1F3_LINEAGE,
} from '../shared/site00-design-bench/grokTwinTestA/constants.js';
import { GROK_DESIGN_BENCH_MODEL_ID } from '../shared/site00-design-bench/grokTwinTestA/modelContract.js';
import {
  applyGrok46AccessProbeToReadiness,
  evaluateGrokDesignBenchReadiness,
} from '../api/_lib/site00GrokDesignBench/grokVisionProvider.js';
import {
  GROK46_SMOKE_PNG_B64,
  classifyGrok46AccessRootCause,
  grok46ListedForKey,
  probeGrok46TeamAccess,
  resetGrok46AccessProbeCache,
  type Grok46AccessProbe,
} from '../api/_lib/site00GrokDesignBench/grokAccessProbe.js';

function read(path: string): string {
  return readFileSync(path, 'utf8');
}

function mockFetch(handlers: Record<string, { status: number; body: unknown }>): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    const url = String(input);
    const hit = Object.entries(handlers)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([key]) => url.includes(key));
    if (!hit) return new Response(JSON.stringify({ error: 'unexpected' }), { status: 500 });
    return new Response(JSON.stringify(hit[1].body), { status: hit[1].status });
  }) as typeof fetch;
}

describe('P0.VR.DESIGNBENCH.GROK1F3 grok-4.6 team access probe', () => {
  afterEach(() => {
    delete process.env.XAI_API_KEY;
    resetGrok46AccessProbeCache();
  });

  it('1. live model-list probe is supported', async () => {
    process.env.XAI_API_KEY = 'test-key-not-real';
    const probe = await probeGrok46TeamAccess({
      skipCache: true,
      includeImageSmoke: false,
      fetchImpl: mockFetch({
        '/models/grok-4.6': { status: 200, body: { id: 'grok-4.6', aliases: [], owned_by: 'xai' } },
        '/models': { status: 200, body: { data: [{ id: 'grok-4.6' }, { id: 'grok-4' }] } },
        '/responses': { status: 200, body: { output_text: 'READY' } },
      }),
    });
    expect(probe.modelListRequest).toContain('/models');
    expect(probe.availableLanguageModels).toContain('grok-4.6');
    expect(P0_VR_DESIGNBENCH_GROK1F3_LINEAGE).toBe('P0.VR.DESIGNBENCH.GROK1F3');
    expect(P0_VR_DESIGNBENCH_GROK1_BUILD).toBe('v486');
  });

  it('2. grok-4.6 access is explicitly checked', () => {
    expect(grok46ListedForKey(['grok-4', 'grok-4.5'])).toBe(false);
    expect(grok46ListedForKey(['grok-4.6'])).toBe(true);
    expect(read('api/_lib/site00GrokDesignBench/grokAccessProbe.ts')).toContain('/models/grok-4.6');
  });

  it('3. no fallback model is configured', () => {
    expect(evaluateGrokDesignBenchReadiness().fallbackAllowed).toBe(false);
    const provider = read('api/_lib/site00GrokDesignBench/grokVisionProvider.ts');
    expect(provider).not.toContain('falling back');
    expect(provider).toContain(GROK_DESIGN_BENCH_INFERENCE_PATH);
  });

  it('4. model rejected is not classified as a missing key', () => {
    const unavailable: Grok46AccessProbe = {
      modelListRequest: 'GET /models',
      modelDetailRequest: 'GET /models/grok-4.6',
      requestEndpoint: 'https://api.x.ai/v1/responses',
      requestMethod: 'POST',
      modelField: 'grok-4.6',
      availableLanguageModels: ['grok-4'],
      grok46AvailableToThisKey: false,
      modelDetail: null,
      textOnlySmoke: { ran: true, httpStatus: 410, modelAccepted: false, providerStatus: 'gone' },
      imageSmoke: { ran: false, httpStatus: null, modelAccepted: false, providerStatus: null },
      rootCause: 'MODEL_NOT_AVAILABLE_TO_TEAM',
      notAvailableCode: GROK_4_6_NOT_AVAILABLE_TO_CURRENT_XAI_TEAM,
    };
    const missingKey = applyGrok46AccessProbeToReadiness(evaluateGrokDesignBenchReadiness(), unavailable);
    expect(missingKey.xaiApiKeyPresent).toBe(false);
    process.env.XAI_API_KEY = 'present';
    const withKey = applyGrok46AccessProbeToReadiness(evaluateGrokDesignBenchReadiness(), unavailable);
    expect(withKey.xaiApiKeyPresent).toBe(true);
    expect(withKey.grok46Access).toBe('UNAVAILABLE');
    expect(withKey.reason).toContain(GROK_4_6_NOT_AVAILABLE_TO_CURRENT_XAI_TEAM);
    expect(withKey.reason).not.toMatch(/missing on the API host/i);
    expect(withKey.state).toBe('BLOCKED');
  });

  it('5. text-only smoke test exists', async () => {
    process.env.XAI_API_KEY = 'test-key-not-real';
    const probe = await probeGrok46TeamAccess({
      skipCache: true,
      includeImageSmoke: false,
      fetchImpl: mockFetch({
        '/models/grok-4.6': { status: 200, body: { id: 'grok-4.6' } },
        '/models': { status: 200, body: { data: [{ id: 'grok-4.6' }] } },
        '/responses': { status: 200, body: { output_text: 'READY' } },
      }),
    });
    expect(probe.textOnlySmoke.ran).toBe(true);
    expect(probe.textOnlySmoke.modelAccepted).toBe(true);
    expect(probe.imageSmoke.ran).toBe(false);
  });

  it('6. image smoke runs only after text smoke succeeds', async () => {
    process.env.XAI_API_KEY = 'test-key-not-real';
    const failedText = await probeGrok46TeamAccess({
      skipCache: true,
      fetchImpl: mockFetch({
        '/models/grok-4.6': { status: 404, body: { error: 'missing' } },
        '/models': { status: 200, body: { data: [{ id: 'grok-4' }] } },
        '/responses': { status: 410, body: { error: 'gone' } },
        '/chat/completions': { status: 410, body: { error: 'gone' } },
      }),
    });
    expect(failedText.textOnlySmoke.modelAccepted).toBe(false);
    expect(failedText.imageSmoke.ran).toBe(false);

    const passedText = await probeGrok46TeamAccess({
      skipCache: true,
      fetchImpl: mockFetch({
        '/models/grok-4.6': { status: 200, body: { id: 'grok-4.6' } },
        '/models': { status: 200, body: { data: [{ id: 'grok-4.6' }] } },
        '/responses': { status: 200, body: { output_text: 'READY' } },
        '/chat/completions': { status: 410, body: { error: 'gone' } },
      }),
    });
    expect(passedText.textOnlySmoke.modelAccepted).toBe(true);
    expect(passedText.imageSmoke.ran).toBe(true);
    const png = Buffer.from(GROK46_SMOKE_PNG_B64, 'base64');
    const width = png.readUInt32BE(16);
    const height = png.readUInt32BE(20);
    expect(width).toBeGreaterThanOrEqual(8);
    expect(height).toBeGreaterThanOrEqual(8);
    expect(width * height).toBeGreaterThanOrEqual(512);
  });

  it('7. provider endpoint is recorded as POST /responses', () => {
    expect(GROK_DESIGN_BENCH_INFERENCE_PATH).toBe('/responses');
    expect(GROK_DESIGN_BENCH_INFERENCE_METHOD).toBe('POST');
    const provider = read('api/_lib/site00GrokDesignBench/grokVisionProvider.ts');
    expect(provider).toContain('GROK_DESIGN_BENCH_INFERENCE_PATH');
    expect(provider).toContain('buildGrok46ResponsesPayload');
    expect(classifyGrok46AccessRootCause({ grok46AvailableToThisKey: true, textHttp: 200, chatHttp: 410, responsesHttp: 200 })).toBe(
      'WRONG_ENDPOINT_FOR_MODEL',
    );
  });

  it('8. model availability is visible on readiness', () => {
    const page = read('src/site00/pages/DesignTwinTestAPage.tsx');
    expect(page).toContain('GROK 4.6 ACCESS');
    expect(page).toContain('LIVE MODEL SMOKE');
    expect(page).toContain('BENCHMARK READY');
    expect(page).toContain('twin-test-a-grok-access');
  });

  it('9. API secret is never exposed', () => {
    const client = read('src/site00/services/grokTwinTestAClient.ts') + read('src/site00/pages/DesignTwinTestAPage.tsx');
    expect(client).not.toContain('XAI_API_KEY');
    expect(client).not.toContain('VITE_XAI');
    expect(read('api/_lib/site00GrokDesignBench/grokAccessProbe.ts')).not.toContain('console.log');
    expect(read('.env.example')).not.toContain('VITE_XAI_API_KEY');
  });

  it('10. benchmark contract is unchanged', () => {
    expect(FIGMA_STYLE_PACKAGE_KEYS).toHaveLength(14);
    expect(GROK_DESIGN_BENCH_MODEL_ID).toBe('grok-4.6');
  });

  it('11. Composer is not invoked', () => {
    const files = [
      'api/_lib/site00GrokDesignBench/grokAccessProbe.ts',
      'api/_lib/site00GrokDesignBench/grokVisionProvider.ts',
      'src/site00/pages/DesignTwinTestAPage.tsx',
    ];
    for (const file of files) {
      expect(read(file)).not.toContain('invokeComposer');
    }
  });

  it('12. Sol route is untouched', () => {
    expect(read('src/site00/pages/SolDesignBenchmarkPage.tsx')).not.toContain('GROK1F3');
    expect(read('src/site00/config/routes.ts')).toContain("projectDesignTwinTestB: '/projects/:projectSlug/design/twin-testB'");
  });
});
