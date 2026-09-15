import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import {
  FIGMA_STYLE_PACKAGE_KEYS,
  GROK_JOB_STAGES,
  GROK_TWIN_TEST_A_MODEL_LABEL,
  GROK_TWIN_TEST_A_PROVIDER_MODEL,
} from '../shared/site00-design-bench/grokTwinTestA/constants.js';
import {
  GROK_4_6_PROVIDER_BINDING_FAILED,
  GROK_DESIGN_BENCH_MODEL_CONTRACT,
  GROK_DESIGN_BENCH_MODEL_ID,
  GROK_DESIGN_BENCH_PROMPT_VERSION,
  assertGrok46HardBind,
  classifyGrok46ProviderError,
  formatGrok46BindingFailure,
  isForbiddenGrokBenchModel,
} from '../shared/site00-design-bench/grokTwinTestA/modelContract.js';
import { resetGrokDesignBenchStoreForTests } from '../api/_lib/site00GrokDesignBench/store.js';
import { startGrokDesignBenchRun } from '../api/_lib/site00GrokDesignBench/service.js';
import {
  buildGrok46ChatPayload,
  buildGrokBenchmarkInputReceipt,
  evaluateGrokDesignBenchReadiness,
  grok46ProviderFailureFromHttp,
  grokDesignBenchProviderModel,
} from '../api/_lib/site00GrokDesignBench/grokVisionProvider.js';

const PNG_1X1_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

function read(path: string): string {
  return readFileSync(path, 'utf8');
}

const EXECUTION_FILES = [
  'shared/site00-design-bench/grokTwinTestA/constants.ts',
  'api/_lib/site00GrokDesignBench/grokVisionProvider.ts',
  'api/_lib/site00GrokDesignBench/service.ts',
  'api/_lib/site00GrokDesignBench/jobRunner.ts',
  'src/site00/pages/DesignTwinTestAPage.tsx',
  'src/site00/services/grokTwinTestAClient.ts',
];

describe('P0.VR.DESIGNBENCH.GROK1F1 grok-4.6 hard-bind', () => {
  afterEach(() => {
    delete process.env.SITE00_GROK_VISION_MODEL;
    delete process.env.SITE00_GROK_DESIGN_BENCH_ALLOW_ALT;
    resetGrokDesignBenchStoreForTests();
  });

  it('1. Test A production model = grok-4.6', () => {
    expect(GROK_DESIGN_BENCH_MODEL_ID).toBe('grok-4.6');
    expect(GROK_TWIN_TEST_A_PROVIDER_MODEL).toBe('grok-4.6');
    expect(GROK_DESIGN_BENCH_MODEL_CONTRACT.modelId).toBe('grok-4.6');
    expect(grokDesignBenchProviderModel()).toBe('grok-4.6');
  });

  it('2. grok-2-vision-1212 is not used by Test A execution', () => {
    for (const file of EXECUTION_FILES) {
      const src = read(file);
      expect(src).not.toMatch(/grok-2-vision-1212['"`]/);
      expect(src).not.toContain("= 'grok-2-vision-1212'");
    }
    expect(isForbiddenGrokBenchModel('grok-2-vision-1212')).toBe(true);
  });

  it('3. no fallback model configured', () => {
    expect(GROK_DESIGN_BENCH_MODEL_CONTRACT.fallbackAllowed).toBe(false);
    expect(evaluateGrokDesignBenchReadiness().fallbackAllowed).toBe(false);
    process.env.SITE00_GROK_VISION_MODEL = 'grok-2-vision-1212';
    expect(() => grokDesignBenchProviderModel()).toThrow(GROK_4_6_PROVIDER_BINDING_FAILED);
    expect(evaluateGrokDesignBenchReadiness().state).toBe('BLOCKED');
  });

  it('4. xAI provider only', () => {
    expect(GROK_DESIGN_BENCH_MODEL_CONTRACT.provider).toBe('xai');
    expect(GROK_DESIGN_BENCH_MODEL_CONTRACT.competitorAccessAllowed).toBe(false);
    const provider = read('api/_lib/site00GrokDesignBench/grokVisionProvider.ts');
    expect(provider).toContain('https://api.x.ai/v1');
    expect(provider).not.toContain('api.openai.com');
    expect(provider).not.toContain('api.anthropic.com');
  });

  it('5. image input required and attached', () => {
    expect(GROK_DESIGN_BENCH_MODEL_CONTRACT.visionInputRequired).toBe(true);
    const bytes = Buffer.from(PNG_1X1_B64, 'base64');
    const receipt = buildGrokBenchmarkInputReceipt({
      runId: 'run-1',
      imageBytes: bytes,
      mime: 'image/png',
      filename: 'golden.png',
      width: 390,
      height: 844,
      sha256: 'abc',
    });
    expect(receipt.imageInputAttached).toBe(true);
    expect(receipt.modelId).toBe('grok-4.6');
    expect(() =>
      buildGrokBenchmarkInputReceipt({
        runId: 'run-1',
        imageBytes: Buffer.alloc(0),
        mime: 'image/png',
        filename: 'golden.png',
        width: 390,
        height: 844,
        sha256: 'abc',
      }),
    ).toThrow('IMAGE_INPUT_REQUIRED');
    const payload = buildGrok46ChatPayload({
      runId: 'run-1',
      imageBytes: bytes,
      mime: 'image/png',
      filename: 'golden.png',
      width: 390,
      height: 844,
      sha256: 'abc',
    });
    const user = payload.messages[1] as { content: Array<{ type: string; image_url?: { url: string } }> };
    expect(user.content.some((part) => part.type === 'image_url' && part.image_url?.url.startsWith('data:image/png'))).toBe(true);
  });

  it('6. web search disabled', () => {
    expect(GROK_DESIGN_BENCH_MODEL_CONTRACT.webSearchAllowed).toBe(false);
    const payload = buildGrok46ChatPayload({
      runId: 'run-1',
      imageBytes: Buffer.from(PNG_1X1_B64, 'base64'),
      mime: 'image/png',
      filename: 'golden.png',
      width: 1,
      height: 1,
      sha256: 'abc',
    });
    expect(payload.search_parameters).toEqual({ mode: 'off' });
    expect(payload.tools).toEqual([]);
  });

  it('7. XAI_API_KEY is server-only', () => {
    const client = read('src/site00/services/grokTwinTestAClient.ts') + read('src/site00/pages/DesignTwinTestAPage.tsx');
    expect(client).not.toContain('XAI_API_KEY');
    expect(client).not.toContain('VITE_XAI');
    expect(read('.env.example')).toContain('XAI_API_KEY=');
    expect(read('.env.example')).not.toContain('VITE_XAI_API_KEY');
  });

  it('8. exact model ID is on the run receipt', async () => {
    const run = await startGrokDesignBenchRun({
      projectId: 'ndxbook',
      filename: 'golden.png',
      mime: 'image/png',
      width: 390,
      height: 844,
      imageBase64: PNG_1X1_B64,
      awaitCompletion: true,
    });
    expect(run.modelId).toBe('grok-4.6');
    expect(run.providerModel).toBe('grok-4.6');
    expect(run.providerLabel).toBe('xAI');
    expect(run.inputReceipt?.modelId).toBe('grok-4.6');
    expect(run.inputReceipt?.imageInputAttached).toBe(true);
    expect(run.inputReceipt?.promptVersion).toBe(GROK_DESIGN_BENCH_PROMPT_VERSION);
    expect(run.webSearchEnabled).toBe(false);
  });

  it('9. exact model ID is visible in run metrics UI', () => {
    const page = read('src/site00/pages/DesignTwinTestAPage.tsx');
    expect(page).toContain('GROK_TWIN_TEST_A_MODEL_LABEL');
    expect(GROK_TWIN_TEST_A_MODEL_LABEL).toBe('GROK 4.6');
    expect(page).toContain('twin-test-a-metrics-model');
    expect(page).toContain('run.modelId');
    expect(page).toContain('GROK_TWIN_TEST_A_PROVIDER_LABEL');
  });

  it('10. provider rejection does not trigger fallback', () => {
    expect(() => assertGrok46HardBind('grok-2-vision-1212')).toThrow(GROK_4_6_PROVIDER_BINDING_FAILED);
    const failure = grok46ProviderFailureFromHttp('run-9', 404, 'model not found');
    expect(failure.code).toBe(GROK_4_6_PROVIDER_BINDING_FAILED);
    expect(failure.classification).toBe('MODEL_REJECTED');
    expect(failure.runId).toBe('run-9');
    const message = formatGrok46BindingFailure({ runId: 'run-9', status: 404, body: 'unknown model' });
    expect(message).toContain(GROK_4_6_PROVIDER_BINDING_FAILED);
    expect(message).not.toContain('falling back');
    expect(classifyGrok46ProviderError(404, 'model not found')).toBe('MODEL_REJECTED');
  });

  it('11. original benchmark contract unchanged', () => {
    expect(FIGMA_STYLE_PACKAGE_KEYS).toEqual([
      'visualInterfacePreview',
      'pageFrameSpec',
      'sectionTree',
      'componentTree',
      'layoutGeometrySpec',
      'typographySystem',
      'colorSystem',
      'spacingSystem',
      'borderRadiusSurfaceSystem',
      'assetPlacementMap',
      'controlStateSystem',
      'visualHierarchyMap',
      'implementationHandoff',
      'doNotChangeRules',
    ]);
    expect(GROK_JOB_STAGES).toContain('ANALYZING_VISUAL');
    expect(GROK_JOB_STAGES).toContain('RENDERING_VISUAL_TRANSLATION');
  });

  it('12–14. isolation: Test B / Composer / Twin routes untouched', () => {
    const page = read('src/site00/pages/DesignTwinTestAPage.tsx');
    expect(page).not.toContain('twin-testB');
    expect(page).not.toContain('invokeComposer');
    expect(read('src/site00/pages/DesignTwinImplementationPage.tsx')).not.toContain('grok-4.6');
    expect(read('src/site00/pages/DesignTwinV4ProofPage.tsx')).not.toContain('grok-4.6');
    expect(read('src/site00/config/routes.ts')).toContain("projectDesignTwin: '/projects/:projectSlug/design/twin'");
    expect(read('src/site00/config/routes.ts')).toContain("projectDesignTwinV4: '/projects/:projectSlug/design/twin-v4'");
  });
});
