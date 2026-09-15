import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FigmaStyleInterfaceTranslationPackage, StartSolDesignBenchRequest } from '../shared/site00-sol-design-bench/contracts';
import { SolDesignBenchModelContract } from '../shared/site00-sol-design-bench/modelContract';
import {
  SOL_PROMPT_HASH,
  SOL_PROMPT_VERSION,
  assertSolStructuredOutputRequest,
  buildSolOpenAiRequestBody,
  executeSolDesignAnalysis,
} from '../api/_lib/site00SolDesignBench/provider';
import {
  SolDesignBenchProviderBlockedError,
  getSolDesignBenchProviderReadiness,
  startSolDesignBenchRun,
} from '../api/_lib/site00SolDesignBench/service';

const OUTPUT_DELIVERABLES = [
  'VISUAL_INTERFACE_PREVIEW',
  'PAGE_FRAME_SPEC',
  'SECTION_TREE',
  'COMPONENT_TREE',
  'LAYOUT_GEOMETRY_SPEC',
  'TYPOGRAPHY_SYSTEM',
  'COLOR_SYSTEM',
  'SPACING_SYSTEM',
  'BORDER_RADIUS_SURFACE_SYSTEM',
  'ASSET_PLACEMENT_MAP',
  'CONTROL_STATE_SYSTEM',
  'VISUAL_HIERARCHY_MAP',
  'IMPLEMENTATION_HANDOFF',
  'DO_NOT_CHANGE_RULES',
] as const;

function outputFixture(sha256: string): FigmaStyleInterfaceTranslationPackage {
  return {
    packageType: 'FigmaStyleInterfaceTranslationPackage',
    VISUAL_INTERFACE_PREVIEW: {
      artboardWidth: 2,
      artboardHeight: 3,
      background: '#fff',
      componentIds: ['page'],
      renderingNotes: [],
    },
    PAGE_FRAME_SPEC: { frame: { width: 2, height: 3 } },
    SECTION_TREE: [{ id: 'page', type: 'PAGE' }],
    COMPONENT_TREE: [{
      componentId: 'page',
      parentId: null,
      label: 'Page',
      semanticRole: 'PAGE',
      visualRole: 'CANVAS',
      siblingOrder: 0,
      x: 0,
      y: 0,
      width: 2,
      height: 3,
      normalizedBounds: { x: 0, y: 0, width: 1, height: 1 },
      layoutMode: 'ABSOLUTE',
      alignment: 'START',
      padding: 0,
      gap: 0,
      visualPriority: 'DOMINANT',
    }],
    LAYOUT_GEOMETRY_SPEC: {},
    TYPOGRAPHY_SYSTEM: [],
    COLOR_SYSTEM: [],
    SPACING_SYSTEM: {},
    BORDER_RADIUS_SURFACE_SYSTEM: {},
    ASSET_PLACEMENT_MAP: [],
    CONTROL_STATE_SYSTEM: [],
    VISUAL_HIERARCHY_MAP: [],
    IMPLEMENTATION_HANDOFF: {
      handoffType: 'SolComposerImplementationHandoff',
      executionIntent: 'REFERENCE_TRANSLATION',
      sourceAuthoritySha256: sha256,
      inventionBudget: 'NONE',
      targetFrame: {},
      orderedBuildInstructions: [],
      componentContracts: [],
      tokenContracts: {},
      assetBindings: [],
      acceptanceChecks: [],
      composerInvoked: false,
    },
    DO_NOT_CHANGE_RULES: [],
  };
}

async function inputFixture(): Promise<{
  request: StartSolDesignBenchRequest;
  authority: {
    authorityType: 'SolDesignBenchReferenceAuthority';
    runId: string;
    storedFile: string;
    filename: string;
    sha256: string;
    width: number;
    height: number;
    bytes: number;
    mime: 'image/png';
    timestamp: string;
  };
}> {
  const bytes = await sharp({
    create: { width: 2, height: 3, channels: 4, background: '#000' },
  }).png().toBuffer();
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  const request: StartSolDesignBenchRequest = {
    action: 'START_SOL_TEST',
    reference: {
      filename: 'unit-input.png',
      mime: 'image/png',
      bytes: bytes.length,
      width: 2,
      height: 3,
      sha256,
      dataUrl: `data:image/png;base64,${bytes.toString('base64')}`,
    },
  };
  return {
    request,
    authority: {
      authorityType: 'SolDesignBenchReferenceAuthority',
      runId: 'sol_test',
      storedFile: '/server-only/reference.png',
      filename: request.reference.filename,
      sha256,
      width: 2,
      height: 3,
      bytes: bytes.length,
      mime: 'image/png',
      timestamp: new Date(0).toISOString(),
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.OPENAI_API_KEY;
});

describe('P0.VR.DESIGNBENCH.SOL1F1 hard binding', () => {
  it('serializes exact OpenAI model, high reasoning, image input and no tools', async () => {
    const { request, authority } = await inputFixture();
    const body = buildSolOpenAiRequestBody({ authority, dataUrl: request.reference.dataUrl });
    expect(body.model).toBe('gpt-5.6-sol');
    expect(body.reasoning).toEqual({ effort: 'high' });
    expect(body.tools).toEqual([]);
    expect(body.tool_choice).toBe('none');
    expect(body.input[0].content.find((part) => part.type === 'input_text')?.text)
      .toMatch(/\bJSON\b/);
    expect(() => assertSolStructuredOutputRequest(body)).not.toThrow();
    expect(body.input[0].content).toContainEqual(expect.objectContaining({
      type: 'input_image',
      image_url: request.reference.dataUrl,
    }));
    expect(SolDesignBenchModelContract).toEqual(expect.objectContaining({
      provider: 'openai',
      modelId: 'gpt-5.6-sol',
      reasoningEffort: 'high',
      fallbackAllowed: false,
      webSearchAllowed: false,
    }));
  });

  it('persists verified dispatch and multimodal input receipts', async () => {
    process.env.OPENAI_API_KEY = 'server-test-key';
    const { request, authority } = await inputFixture();
    const payload = outputFixture(authority.sha256);
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      const requestBody = JSON.parse(String(init.body)) as Record<string, unknown>;
      expect(requestBody.model).toBe('gpt-5.6-sol');
      expect(requestBody.reasoning).toEqual({ effort: 'high' });
      return new Response(JSON.stringify({
        id: 'resp_sol_exact',
        model: 'gpt-5.6-sol',
        output_text: JSON.stringify(payload),
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    });
    vi.stubGlobal('fetch', fetchMock);
    const result = await executeSolDesignAnalysis({
      runId: 'sol_test',
      authority,
      dataUrl: request.reference.dataUrl,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.openai.com/v1/responses');
    expect(result.dispatchReceipt).toMatchObject({
      provider: 'openai',
      modelId: 'gpt-5.6-sol',
      reasoningEffort: 'high',
      imageInputAttached: true,
      structuredOutputRequested: true,
      structuredOutputMode: 'json_object',
      jsonInstructionPresent: true,
      requestedModelId: 'gpt-5.6-sol',
      actualDispatchedModelId: 'gpt-5.6-sol',
      requestedReasoningEffort: 'high',
      fallbackAllowed: false,
      webSearchEnabled: false,
    });
    expect(result.inputReceipt).toMatchObject({
      runId: 'sol_test',
      referenceSha256: authority.sha256,
      imageInputAttached: true,
      modelId: 'gpt-5.6-sol',
      requestedReasoningEffort: 'high',
      promptVersion: SOL_PROMPT_VERSION,
    });
    expect(SOL_PROMPT_HASH).toMatch(/^[a-f0-9]{64}$/);
  });

  it('fails binding on a different dispatched model and never retries', async () => {
    process.env.OPENAI_API_KEY = 'server-test-key';
    const { request, authority } = await inputFixture();
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      id: 'resp_wrong',
      model: 'gpt-5.6-luna',
      output_text: '{}',
    }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(executeSolDesignAnalysis({
      runId: 'sol_test',
      authority,
      dataUrl: request.reference.dataUrl,
    })).rejects.toThrow('GPT_5_6_SOL_PROVIDER_BINDING_FAILED:DISPATCHED_MODEL_gpt-5.6-luna');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('blocks before run creation when the server credential is absent', async () => {
    const { request } = await inputFixture();
    const readiness = getSolDesignBenchProviderReadiness({
      referenceImageAvailable: true,
      imageInputAttachmentPathValid: true,
    });
    expect(readiness).toMatchObject({
      state: 'BLOCKED',
      openAiCredentialPresentServerSide: false,
      exactModelIdConfigured: true,
      highReasoningConfigured: true,
      noFallbackConfigured: true,
      webSearchDisabled: true,
    });
    await expect(startSolDesignBenchRun(request)).rejects.toBeInstanceOf(SolDesignBenchProviderBlockedError);
  });

  it('keeps the shared output surface and unrelated Twin routes unchanged', async () => {
    const { authority } = await inputFixture();
    expect(Object.keys(outputFixture(authority.sha256)).filter((key) => key !== 'packageType'))
      .toEqual(OUTPUT_DELIVERABLES);
    const ui = await readFile('src/site00/pages/SolDesignBenchmarkPage.tsx', 'utf8');
    expect(ui).toContain('TEST B · SOL');
    expect(ui).toContain('GPT-5.6 SOL');
    expect(ui).toContain('gpt-5.6-sol');
    expect(ui).toContain('REASONING');
    expect(ui).toContain('HIGH');
    expect(ui).not.toContain('gpt-5.6-luna');
    const routeConfig = await readFile('src/site00/config/routes.ts', 'utf8');
    expect(routeConfig).toContain("projectDesignTwin: '/projects/:projectSlug/design/twin'");
    expect(routeConfig).toContain("projectDesignTwinV4: '/projects/:projectSlug/design/twin-v4'");
  });
});
