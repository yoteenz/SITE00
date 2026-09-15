import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  COMPOSER_INVOKED_DURING_TEST,
  SOL_DESIGN_BENCH_STAGES,
  SolDesignBenchEtaEstimator,
  estimateRemainingSeconds,
  stageProgress,
  validateReferenceInput,
  type FigmaStyleInterfaceTranslationPackage,
  type StartSolDesignBenchRequest,
} from '../shared/site00-sol-design-bench/contracts';
import { SolDesignBenchModelContract } from '../shared/site00-sol-design-bench/modelContract';
import {
  getSolDesignBenchRun,
  resetSolDesignBenchForTests,
  setSolDesignBenchExecutorForTests,
  startSolDesignBenchRun,
} from '../api/_lib/site00SolDesignBench/service';
import {
  SOL_PROMPT_HASH,
  SOL_PROMPT_VERSION,
  buildSolBenchmarkInputReceipt,
} from '../api/_lib/site00SolDesignBench/provider';
import { SITE00_ROUTES, solDesignBenchmarkRoute } from '../src/site00/config/routes';

function packageFixture(sha256: string): FigmaStyleInterfaceTranslationPackage {
  return {
    packageType: 'FigmaStyleInterfaceTranslationPackage',
    VISUAL_INTERFACE_PREVIEW: {
      artboardWidth: 40,
      artboardHeight: 60,
      background: '#ffffff',
      componentIds: ['page'],
      renderingNotes: ['Literal test fixture'],
      visualPreviewRef: 'sol-preview://fixture',
    },
    PAGE_FRAME_SPEC: {
      frame: { width: 40, height: 60 },
      contentBounds: { x: 0, y: 0, width: 40, height: 60 },
      background: '#ffffff',
      outerMargins: 0,
      grid: 'none',
      columns: 1,
      gutters: 0,
      verticalRhythm: 4,
    },
    SECTION_TREE: [{ type: 'PAGE', id: 'page', children: [] }],
    COMPONENT_TREE: [{
      componentId: 'page',
      parentId: null,
      label: 'Page',
      semanticRole: 'page',
      visualRole: 'canvas',
      siblingOrder: 0,
      x: 0,
      y: 0,
      width: 40,
      height: 60,
      normalizedBounds: { x: 0, y: 0, width: 1, height: 1 },
      layoutMode: 'absolute',
      alignment: 'start',
      padding: 0,
      gap: 0,
      visualPriority: 'DOMINANT',
      style: { background: '#ffffff' },
    }],
    LAYOUT_GEOMETRY_SPEC: { anchors: ['top-left'] },
    TYPOGRAPHY_SYSTEM: [],
    COLOR_SYSTEM: [{ token: 'page', value: '#ffffff' }],
    SPACING_SYSTEM: { pageMargin: 0 },
    BORDER_RADIUS_SURFACE_SYSTEM: { borders: [], radii: [] },
    ASSET_PLACEMENT_MAP: [],
    CONTROL_STATE_SYSTEM: [],
    VISUAL_HIERARCHY_MAP: [{ semanticRole: 'page', visualWeight: 'DOMINANT' }],
    IMPLEMENTATION_HANDOFF: {
      handoffType: 'SolComposerImplementationHandoff',
      executionIntent: 'REFERENCE_TRANSLATION',
      sourceAuthoritySha256: sha256,
      inventionBudget: 'NONE',
      targetFrame: { width: 40, height: 60 },
      orderedBuildInstructions: ['Build the measured page.'],
      componentContracts: [],
      tokenContracts: {},
      assetBindings: [],
      acceptanceChecks: ['Match screenshot.'],
      composerInvoked: false,
    },
    DO_NOT_CHANGE_RULES: ['Frame ratio'],
  };
}

async function requestFixture(): Promise<StartSolDesignBenchRequest> {
  const bytes = await sharp({
    create: { width: 40, height: 60, channels: 4, background: '#7acc22' },
  }).png().toBuffer();
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  return {
    action: 'START_SOL_TEST',
    reference: {
      filename: 'golden.png',
      mime: 'image/png',
      bytes: bytes.length,
      width: 40,
      height: 60,
      sha256,
      dataUrl: `data:image/png;base64,${bytes.toString('base64')}`,
    },
  };
}

async function waitForTerminal(runId: string) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const run = await getSolDesignBenchRun(runId);
    if (run?.status === 'COMPLETE' || run?.status === 'FAILED') return run;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error('test run did not finish');
}

beforeEach(() => {
  process.env.OPENAI_API_KEY = 'test-server-only-key';
});

afterEach(async () => {
  delete process.env.OPENAI_API_KEY;
  setSolDesignBenchExecutorForTests(null);
  await resetSolDesignBenchForTests();
});

describe('P0.VR.DESIGNBENCH.SOL1', () => {
  it('registers only the isolated Test B route', async () => {
    expect(SITE00_ROUTES.projectDesignTwinTestB).toBe('/projects/:projectSlug/design/twin-testB');
    expect(solDesignBenchmarkRoute('ndxbook')).toBe('/projects/ndxbook/design/twin-testB');
    const routes = await readFile('src/routes/Site00Routes.tsx', 'utf8');
    expect(routes).toContain('SolDesignBenchmarkPage');
    expect(routes).toContain('projectDesignTwinTestB');
  });

  it('validates MIME, hashes, dimensions and creates an immutable authority', async () => {
    const request = await requestFixture();
    expect(validateReferenceInput(request.reference)).toEqual([]);
    expect(validateReferenceInput({ ...request.reference, mime: 'image/gif' as 'image/png' }))
      .toContain('UNSUPPORTED_MIME');

    setSolDesignBenchExecutorForTests(async ({ runId, authority }) => ({
      package: packageFixture(authority.sha256),
      cost: null,
      dispatchReceipt: {
        receiptType: 'SolBenchmarkProviderDispatchReceipt',
        runId,
        provider: 'openai',
        modelId: 'gpt-5.6-sol',
        reasoningEffort: 'high',
        imageInputAttached: true,
        structuredOutputRequested: true,
        structuredOutputMode: 'json_schema',
        schemaVersion: 'figma-interface-translation-v1',
        jsonInstructionPresent: true,
        requestedModelId: 'gpt-5.6-sol',
        actualDispatchedModelId: 'gpt-5.6-sol',
        requestedReasoningEffort: 'high',
        fallbackAllowed: false,
        webSearchEnabled: false,
        endpoint: 'https://api.openai.com/v1/responses',
        providerResponseId: 'resp_test',
        dispatchedAt: new Date().toISOString(),
      },
      inputReceipt: buildSolBenchmarkInputReceipt({ runId, authority }),
      validationReceipt: {
        receiptType: 'SolStructuredOutputValidationReceipt',
        runId,
        model: 'gpt-5.6-sol',
        schemaVersion: 'figma-interface-translation-v1',
        responseReceived: true,
        jsonParsePass: true,
        schemaValidationPass: true,
        missingFields: [],
        invalidFields: [],
        rawResponsePersistedSafely: false,
        recoverable: false,
        repairAttempted: false,
        repairSucceeded: false,
      },
      completenessReceipt: {
        receiptType: 'SolOutputCompletenessReceipt',
        runId,
        finishReason: 'completed',
        outputCharacters: 100,
        outputTokens: 25,
        truncated: false,
        complete: true,
      },
      rawProviderResponse: '{"fixture":true}',
    }));
    const started = await startSolDesignBenchRun(request);
    request.reference.filename = 'replacement.png';
    request.reference.width = 999;
    const complete = await waitForTerminal(started.runId);

    expect(complete.status).toBe('COMPLETE');
    expect(complete.authority.filename).toBe('golden.png');
    expect(complete.authority.width).toBe(40);
    expect(complete.authority.height).toBe(60);
    expect(complete.authority.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(complete.result?.packageType).toBe('FigmaStyleInterfaceTranslationPackage');
    expect(complete.result?.IMPLEMENTATION_HANDOFF.composerInvoked).toBe(false);
    expect(complete.composerInvokedDuringTest).toBe(false);
    expect(complete.grokOutputAccessed).toBe(false);
    expect(complete.provider).toBe('OpenAI');
    expect(complete.providerModelId).toBe('gpt-5.6-sol');
    expect(complete.requestedReasoningEffort).toBe('high');
    expect(complete.inputReceipt).toMatchObject({
      imageInputAttached: true,
      modelId: 'gpt-5.6-sol',
      requestedReasoningEffort: 'high',
    });
    expect(complete.providerDispatchReceipt?.actualDispatchedModelId).toBe('gpt-5.6-sol');
    expect(complete.solPromptVersion).toBe(SOL_PROMPT_VERSION);
    expect(complete.solPromptHash).toBe(SOL_PROMPT_HASH);
    expect(complete.timing.totalDuration).not.toBeNull();
  });

  it('keeps failed reference metadata and emits SOL_RUN_FAILED without fallback', async () => {
    const request = await requestFixture();
    setSolDesignBenchExecutorForTests(async () => {
      throw new Error('SOL_PROVIDER_FAILED_TEST');
    });
    const complete = await waitForTerminal((await startSolDesignBenchRun(request)).runId);
    expect(complete.status).toBe('FAILED');
    expect(complete.error).toEqual({
      code: 'SOL_RUN_FAILED',
      message: 'SOL_PROVIDER_FAILED_TEST',
    });
    expect(complete.authority.storedFile).toContain('reference.png');
    expect(complete.provider).toBe('OpenAI');
  });

  it('implements the fixed stage machine and explicitly approximate ETA', () => {
    expect(SOL_DESIGN_BENCH_STAGES).toEqual([
      'IDLE', 'UPLOADING', 'QUEUED', 'INGESTING_REFERENCE', 'ANALYZING_VISUAL',
      'MEASURING_COMPOSITION', 'DERIVING_DESIGN_SYSTEM', 'DERIVING_COMPONENT_TREE',
      'RENDERING_INTERFACE_PREVIEW', 'BUILDING_IMPLEMENTATION_HANDOFF', 'FINALIZING',
      'COMPLETE', 'FAILED', 'SOL_OUTPUT_VALIDATION_FAILED', 'SOL_OUTPUT_TRUNCATED',
    ]);
    expect(stageProgress('ANALYZING_VISUAL')).toBeGreaterThan(stageProgress('INGESTING_REFERENCE'));
    expect(estimateRemainingSeconds('ANALYZING_VISUAL', 10)).toBeGreaterThan(0);
    expect(new SolDesignBenchEtaEstimator().estimate('ANALYZING_VISUAL', 10)).toMatchObject({
      approximate: true,
      basis: 'STAGE_WEIGHTS',
    });
    expect(COMPOSER_INVOKED_DURING_TEST).toBe(false);
    expect(SolDesignBenchModelContract).toMatchObject({
      provider: 'openai',
      modelId: 'gpt-5.6-sol',
      reasoningEffort: 'high',
      visionInputRequired: true,
      fallbackAllowed: false,
      webSearchAllowed: false,
      competitorAccessAllowed: false,
    });
  });
});
