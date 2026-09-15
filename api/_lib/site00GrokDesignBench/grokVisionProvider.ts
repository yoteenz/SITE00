import { jsonrepair } from 'jsonrepair';
import { GROK_TWIN_TEST_A_PROVIDER } from '../../../shared/site00-design-bench/grokTwinTestA/constants.js';
import {
  GROK_4_6_PROVIDER_BINDING_FAILED,
  GROK_DESIGN_BENCH_MODEL_CONTRACT,
  GROK_DESIGN_BENCH_MODEL_ID,
  GROK_DESIGN_BENCH_PROMPT_VERSION,
  assertGrok46HardBind,
  classifyGrok46ProviderError,
  formatGrok46BindingFailure,
  isForbiddenGrokBenchModel,
  type GrokBenchmarkInputReceipt,
  type GrokDesignBenchHostDiagnostic,
  type GrokDesignBenchProviderFailure,
  type GrokDesignBenchProviderReadinessReceipt,
} from '../../../shared/site00-design-bench/grokTwinTestA/modelContract.js';
import { assertFigmaStylePackage } from '../../../shared/site00-design-bench/grokTwinTestA/packageGuard.js';
import type { FigmaStyleInterfaceTranslationPackage } from '../../../shared/site00-design-bench/grokTwinTestA/types.js';
import { buildGrokVisualTranslationUserPrompt, GROK_VISUAL_TRANSLATION_SYSTEM } from './prompt.js';

export interface GrokVisionTranslateInput {
  runId: string;
  imageBytes: Buffer;
  mime: string;
  filename: string;
  width: number;
  height: number;
  sha256: string;
}

export interface GrokVisionTranslateResult {
  package: FigmaStyleInterfaceTranslationPackage;
  provider: 'xai';
  providerModel: typeof GROK_DESIGN_BENCH_MODEL_ID;
  inputReceipt: GrokBenchmarkInputReceipt;
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
  costAmount: number | null;
  costReported: boolean;
}

export function grokDesignBenchProviderModel(): typeof GROK_DESIGN_BENCH_MODEL_ID {
  const override = process.env.SITE00_GROK_VISION_MODEL?.trim();
  if (override && override !== GROK_DESIGN_BENCH_MODEL_ID) {
    throw new Error(`${GROK_4_6_PROVIDER_BINDING_FAILED}: SITE00_GROK_VISION_MODEL override ${override} forbidden`);
  }
  assertGrok46HardBind(GROK_DESIGN_BENCH_MODEL_ID);
  return GROK_DESIGN_BENCH_MODEL_ID;
}

export function grokDesignBenchApiKey(): string | null {
  const key = process.env.XAI_API_KEY?.trim();
  return key || null;
}

export function grokDesignBenchHostDiagnostic(input?: { requestHost?: string }): GrokDesignBenchHostDiagnostic {
  const requestHost = input?.requestHost?.split(':')[0]?.trim() || '';
  const railwayService = process.env.RAILWAY_SERVICE_NAME?.trim() || '';
  const railwayEnv = process.env.RAILWAY_ENVIRONMENT?.trim() || process.env.RAILWAY_ENVIRONMENT_NAME?.trim() || '';
  const railwayDomain = process.env.RAILWAY_PUBLIC_DOMAIN?.trim() || '';
  const onRailway = Boolean(
    railwayEnv || railwayService || process.env.RAILWAY_PROJECT_ID || process.env.RAILWAY_GIT_COMMIT_SHA,
  );
  let runtime = 'node-express';
  if (onRailway) runtime = 'railway-node-express';
  else if (process.env.SITE00_VITE_LOCAL_API === '1') runtime = 'vite-local-api';
  else if (process.env.VITEST === 'true') runtime = 'vitest-node';
  return {
    runtime,
    host: requestHost || railwayDomain || railwayService || 'local',
    environment: railwayEnv || process.env.NODE_ENV || 'unknown',
    xaiKeyPresent: Boolean(grokDesignBenchApiKey()),
    modelId: GROK_DESIGN_BENCH_MODEL_ID,
  };
}

export function isGrokTestHarnessEnabled(): boolean {
  return process.env.VITEST === 'true';
}

export function assertGrokOnlyProvider(): void {
  if (process.env.SITE00_GROK_DESIGN_BENCH_ALLOW_ALT === '1') {
    throw new Error('ALTERNATE_PROVIDER_FALLBACK_FORBIDDEN');
  }
  if (GROK_DESIGN_BENCH_MODEL_CONTRACT.fallbackAllowed) {
    throw new Error('ALTERNATE_PROVIDER_FALLBACK_FORBIDDEN');
  }
}

export function evaluateGrokDesignBenchReadiness(args?: {
  referenceUploaded?: boolean;
  referenceFrozen?: boolean;
  imageBytesPresent?: boolean;
}): GrokDesignBenchProviderReadinessReceipt {
  const override = process.env.SITE00_GROK_VISION_MODEL?.trim();
  const overrideBlocked = Boolean(override && override !== GROK_DESIGN_BENCH_MODEL_ID);
  const keyPresent = Boolean(grokDesignBenchApiKey());
  const imageInputCanAttach = args?.imageBytesPresent ?? true;
  let reason: string | null = null;
  if (process.env.SITE00_GROK_DESIGN_BENCH_ALLOW_ALT === '1') {
    reason = 'Fallback is configured; Test A forbids provider/model fallback';
  } else if (overrideBlocked) {
    reason = `SITE00_GROK_VISION_MODEL=${override} is forbidden; Test A is hard-bound to ${GROK_DESIGN_BENCH_MODEL_ID}`;
  } else if (!keyPresent) {
    reason = 'XAI_API_KEY missing on the API host. Grok 4.6 cannot start.';
  } else if (args && args.referenceUploaded === false) {
    reason = 'Reference image not uploaded';
  } else if (args && args.referenceFrozen === false) {
    reason = 'Reference is not frozen';
  } else if (args && args.imageBytesPresent === false) {
    reason = 'Image bytes cannot be attached as multimodal input';
  }
  return {
    state: reason ? 'BLOCKED' : 'READY',
    reason,
    provider: 'xai',
    modelId: GROK_DESIGN_BENCH_MODEL_ID,
    xaiApiKeyPresent: keyPresent,
    modelHardBound: true,
    fallbackAllowed: false,
    webSearchAllowed: false,
    visionInputRequired: true,
    imageInputCanAttach,
    competitorAccessAllowed: false,
  };
}

export function auditGrokDesignBenchProvider(): {
  provider: 'xai';
  model: 'GROK';
  providerModel: typeof GROK_DESIGN_BENCH_MODEL_ID;
  configured: boolean;
  alternateProviderFallback: false;
  fallbackAllowed: false;
  webSearchAllowed: false;
  composerInvoked: false;
} {
  const readiness = evaluateGrokDesignBenchReadiness();
  return {
    provider: GROK_TWIN_TEST_A_PROVIDER,
    model: 'GROK',
    providerModel: GROK_DESIGN_BENCH_MODEL_ID,
    configured: readiness.state === 'READY',
    alternateProviderFallback: false,
    fallbackAllowed: false,
    webSearchAllowed: false,
    composerInvoked: false,
  };
}

export function buildGrokBenchmarkInputReceipt(input: GrokVisionTranslateInput): GrokBenchmarkInputReceipt {
  if (!input.imageBytes?.length) {
    throw new Error('IMAGE_INPUT_REQUIRED');
  }
  return {
    runId: input.runId,
    referenceSha256: input.sha256,
    referenceWidth: input.width,
    referenceHeight: input.height,
    imageInputAttached: true,
    provider: 'xai',
    modelId: GROK_DESIGN_BENCH_MODEL_ID,
    promptVersion: GROK_DESIGN_BENCH_PROMPT_VERSION,
  };
}

export function buildGrok46ChatPayload(input: GrokVisionTranslateInput): {
  model: typeof GROK_DESIGN_BENCH_MODEL_ID;
  temperature: number;
  response_format: { type: 'json_object' };
  search_parameters: { mode: 'off' };
  tools: [];
  messages: unknown[];
} {
  const model = grokDesignBenchProviderModel();
  if (isForbiddenGrokBenchModel(model)) {
    throw new Error(`${GROK_4_6_PROVIDER_BINDING_FAILED}: forbidden model ${model}`);
  }
  if (!input.imageBytes.length) {
    throw new Error('IMAGE_INPUT_REQUIRED');
  }
  const dataUrl = `data:${input.mime};base64,${input.imageBytes.toString('base64')}`;
  return {
    model,
    temperature: 0.1,
    response_format: { type: 'json_object' },
    search_parameters: { mode: 'off' },
    tools: [],
    messages: [
      { role: 'system', content: GROK_VISUAL_TRANSLATION_SYSTEM },
      {
        role: 'user',
        content: [
          { type: 'text', text: buildGrokVisualTranslationUserPrompt(input) },
          { type: 'image_url', image_url: { url: dataUrl } },
        ],
      },
    ],
  };
}

export function grok46ProviderFailureFromHttp(runId: string, status: number, body: string): GrokDesignBenchProviderFailure {
  return {
    code: GROK_4_6_PROVIDER_BINDING_FAILED,
    providerResponseCode: status,
    classification: classifyGrok46ProviderError(status, body),
    runId,
    detail: body.slice(0, 400),
  };
}

export async function translateInterfaceWithGrok(
  input: GrokVisionTranslateInput,
): Promise<GrokVisionTranslateResult> {
  assertGrokOnlyProvider();
  const modelId = grokDesignBenchProviderModel();
  const inputReceipt = buildGrokBenchmarkInputReceipt(input);

  if (isGrokTestHarnessEnabled() && !grokDesignBenchApiKey()) {
    const { buildGrokTestHarnessPackage } = await import('./testHarness.js');
    return {
      package: assertFigmaStylePackage(buildGrokTestHarnessPackage(input)),
      provider: 'xai',
      providerModel: modelId,
      inputReceipt,
      promptTokens: null,
      completionTokens: null,
      totalTokens: null,
      costAmount: null,
      costReported: false,
    };
  }

  const apiKey = grokDesignBenchApiKey();
  if (!apiKey) {
    throw new Error('XAI_API_KEY_MISSING: set XAI_API_KEY on the Railway API service. Grok 4.6 is the only provider; no fallback.');
  }

  const payloadBody = buildGrok46ChatPayload(input);
  const imagePart = (payloadBody.messages[1] as { content: Array<{ type: string }> }).content.some((p) => p.type === 'image_url');
  if (!imagePart || !inputReceipt.imageInputAttached) {
    throw new Error('IMAGE_INPUT_REQUIRED');
  }

  const endpoint = process.env.SITE00_GROK_API_BASE?.replace(/\/$/, '') || 'https://api.x.ai/v1';
  const response = await fetch(`${endpoint}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payloadBody),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(formatGrok46BindingFailure({ runId: input.runId, status: response.status, body: detail }));
  }

  const payload = (await response.json()) as {
    model?: string;
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    usage_cost?: { total_cost?: number };
  };
  if (payload.model && payload.model !== GROK_DESIGN_BENCH_MODEL_ID) {
    throw new Error(`${GROK_4_6_PROVIDER_BINDING_FAILED}: provider returned model ${payload.model}`);
  }
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('GROK_PROVIDER_EMPTY_RESPONSE');
  }

  const parsed = parseGrokPackageJson(content);
  const pkg = assertFigmaStylePackage(parsed);
  return {
    package: pkg,
    provider: 'xai',
    providerModel: GROK_DESIGN_BENCH_MODEL_ID,
    inputReceipt,
    promptTokens: payload.usage?.prompt_tokens ?? null,
    completionTokens: payload.usage?.completion_tokens ?? null,
    totalTokens: payload.usage?.total_tokens ?? null,
    costAmount: typeof payload.usage_cost?.total_cost === 'number' ? payload.usage_cost.total_cost : null,
    costReported: typeof payload.usage_cost?.total_cost === 'number',
  };
}

export function parseGrokPackageJson(raw: string): unknown {
  const trimmed = raw.trim();
  const fenced = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  try {
    return JSON.parse(fenced);
  } catch {
    return JSON.parse(jsonrepair(fenced));
  }
}
