import { jsonrepair } from 'jsonrepair';
import {
  GROK_4_6_NOT_AVAILABLE_TO_CURRENT_XAI_TEAM,
  GROK_DESIGN_BENCH_INFERENCE_METHOD,
  GROK_DESIGN_BENCH_INFERENCE_PATH,
  GROK_TWIN_TEST_A_PROVIDER,
  GROK_XAI_API_BASE,
} from '../../../shared/site00-design-bench/grokTwinTestA/constants.js';
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
import { probeGrok46TeamAccess, type Grok46AccessProbe } from './grokAccessProbe.js';
import { buildGrokVisualTranslationUserPrompt, GROK_VISUAL_TRANSLATION_SYSTEM } from './prompt.js';

export interface GrokVisionTranslateInput {
  runId: string;
  imageBytes: Buffer;
  mime: string;
  filename: string;
  width: number;
  height: number;
  sha256: string;
  signal?: AbortSignal;
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
  outputBytes: number | null;
  requestInputBytes: number | null;
  responseId: string | null;
  finishStatus: string | null;
  responseTruncated: boolean;
  maxOutputTokens: null;
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
  const requestEndpoint = `${(process.env.SITE00_GROK_API_BASE?.replace(/\/$/, '') || GROK_XAI_API_BASE).replace(/\/$/, '')}${GROK_DESIGN_BENCH_INFERENCE_PATH}`;
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
  } else {
    reason = 'Live grok-4.6 access probe required before benchmark READY';
  }
  return {
    state: 'BLOCKED',
    reason,
    provider: 'xai',
    modelId: GROK_DESIGN_BENCH_MODEL_ID,
    xaiApiKeyPresent: keyPresent,
    grok46Access: 'UNKNOWN',
    liveModelSmoke: 'SKIPPED',
    benchmarkReady: false,
    availableLanguageModels: [],
    requestEndpoint,
    requestMethod: GROK_DESIGN_BENCH_INFERENCE_METHOD,
    modelField: GROK_DESIGN_BENCH_MODEL_ID,
    modelHardBound: true,
    fallbackAllowed: false,
    webSearchAllowed: false,
    visionInputRequired: true,
    imageInputCanAttach,
    competitorAccessAllowed: false,
  };
}

export function applyGrok46AccessProbeToReadiness(
  base: GrokDesignBenchProviderReadinessReceipt,
  probe: Grok46AccessProbe,
): GrokDesignBenchProviderReadinessReceipt {
  const smokePass = probe.textOnlySmoke.modelAccepted && (!probe.imageSmoke.ran || probe.imageSmoke.modelAccepted);
  const access: GrokDesignBenchProviderReadinessReceipt['grok46Access'] = probe.grok46AvailableToThisKey
    ? 'AVAILABLE'
    : 'UNAVAILABLE';
  const liveModelSmoke: GrokDesignBenchProviderReadinessReceipt['liveModelSmoke'] = !probe.textOnlySmoke.ran
    ? 'SKIPPED'
    : smokePass
      ? 'PASS'
      : 'FAIL';
  const available = probe.availableLanguageModels.filter((id) => id.toLowerCase().includes('grok'));
  let reason = base.reason;
  if (!base.xaiApiKeyPresent) {
    reason = 'XAI_API_KEY missing on the API host. Grok 4.6 cannot start.';
  } else if (!probe.grok46AvailableToThisKey) {
    reason = `${GROK_4_6_NOT_AVAILABLE_TO_CURRENT_XAI_TEAM}. Available Grok models: ${available.join(', ') || 'none'}`;
  } else if (!probe.textOnlySmoke.modelAccepted) {
    reason = `grok-4.6 listed but text smoke failed HTTP ${probe.textOnlySmoke.httpStatus ?? 'none'}`;
  } else if (probe.imageSmoke.ran && !probe.imageSmoke.modelAccepted) {
    reason = `grok-4.6 text smoke passed; image smoke failed HTTP ${probe.imageSmoke.httpStatus ?? 'none'}`;
  } else {
    reason = null;
  }
  const blockedForOther = Boolean(
    process.env.SITE00_GROK_DESIGN_BENCH_ALLOW_ALT === '1' ||
      (process.env.SITE00_GROK_VISION_MODEL?.trim() &&
        process.env.SITE00_GROK_VISION_MODEL.trim() !== GROK_DESIGN_BENCH_MODEL_ID),
  );
  const benchmarkReady = Boolean(base.xaiApiKeyPresent && probe.grok46AvailableToThisKey && smokePass && !blockedForOther);
  return {
    ...base,
    state: benchmarkReady ? 'READY' : 'BLOCKED',
    reason: blockedForOther ? base.reason : reason,
    grok46Access: access,
    liveModelSmoke,
    benchmarkReady,
    availableLanguageModels: probe.availableLanguageModels,
    requestEndpoint: probe.requestEndpoint,
    requestMethod: probe.requestMethod,
    modelField: probe.modelField,
  };
}

export async function evaluateGrokDesignBenchLiveReadiness(args?: {
  referenceUploaded?: boolean;
  referenceFrozen?: boolean;
  imageBytesPresent?: boolean;
}): Promise<GrokDesignBenchProviderReadinessReceipt> {
  const base = evaluateGrokDesignBenchReadiness(args);
  if (!base.xaiApiKeyPresent) return base;
  if (process.env.SITE00_GROK_DESIGN_BENCH_ALLOW_ALT === '1') return base;
  const override = process.env.SITE00_GROK_VISION_MODEL?.trim();
  if (override && override !== GROK_DESIGN_BENCH_MODEL_ID) return base;
  const probe = await probeGrok46TeamAccess();
  return applyGrok46AccessProbeToReadiness(base, probe);
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

export function buildGrok46ResponsesPayload(input: GrokVisionTranslateInput): {
  model: typeof GROK_DESIGN_BENCH_MODEL_ID;
  temperature: number;
  tools: [];
  store: false;
  input: unknown[];
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
    tools: [],
    store: false,
    input: [
      { role: 'system', content: GROK_VISUAL_TRANSLATION_SYSTEM },
      {
        role: 'user',
        content: [
          { type: 'input_text', text: buildGrokVisualTranslationUserPrompt(input) },
          { type: 'input_image', image_url: dataUrl },
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
      outputBytes: null,
      requestInputBytes: null,
      responseId: null,
      finishStatus: 'HARNESS',
      responseTruncated: false,
      maxOutputTokens: null,
    };
  }

  const apiKey = grokDesignBenchApiKey();
  if (!apiKey) {
    throw new Error('XAI_API_KEY_MISSING: set XAI_API_KEY on the Railway API service. Grok 4.6 is the only provider; no fallback.');
  }

  const payloadBody = buildGrok46ResponsesPayload(input);
  const serialized = JSON.stringify(payloadBody);
  const requestInputBytes = Buffer.byteLength(serialized, 'utf8');
  const user = payloadBody.input[1] as { content: Array<{ type: string }> };
  const imagePart = user.content.some((p) => p.type === 'input_image');
  if (!imagePart || !inputReceipt.imageInputAttached) {
    throw new Error('IMAGE_INPUT_REQUIRED');
  }

  const endpoint = process.env.SITE00_GROK_API_BASE?.replace(/\/$/, '') || 'https://api.x.ai/v1';
  const response = await fetch(`${endpoint}/responses`, {
    method: GROK_DESIGN_BENCH_INFERENCE_METHOD,
    signal: input.signal,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: serialized,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(formatGrok46BindingFailure({ runId: input.runId, status: response.status, body: detail }));
  }

  const payload = (await response.json()) as {
    id?: string;
    model?: string;
    status?: string;
    incomplete_details?: { reason?: string };
    output_text?: string;
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
    usage?: { input_tokens?: number; output_tokens?: number; total_tokens?: number; prompt_tokens?: number; completion_tokens?: number };
    usage_cost?: { total_cost?: number };
  };
  if (payload.model && payload.model !== GROK_DESIGN_BENCH_MODEL_ID) {
    throw new Error(`${GROK_4_6_PROVIDER_BINDING_FAILED}: provider returned model ${payload.model}`);
  }
  const content =
    payload.output_text ||
    payload.output
      ?.flatMap((item) => item.content ?? [])
      .find((part) => part.type === 'output_text' && part.text)?.text;
  if (!content) {
    throw new Error('GROK_PROVIDER_EMPTY_RESPONSE');
  }

  const parsed = parseGrokPackageJson(content);
  const pkg = assertFigmaStylePackage(parsed);
  const finishStatus = payload.status ?? (payload.incomplete_details?.reason ? 'incomplete' : 'completed');
  const responseTruncated =
    finishStatus === 'incomplete' ||
    payload.incomplete_details?.reason === 'max_output_tokens' ||
    /max_output_tokens|length/i.test(payload.incomplete_details?.reason ?? '');
  return {
    package: pkg,
    provider: 'xai',
    providerModel: GROK_DESIGN_BENCH_MODEL_ID,
    inputReceipt,
    promptTokens: payload.usage?.input_tokens ?? payload.usage?.prompt_tokens ?? null,
    completionTokens: payload.usage?.output_tokens ?? payload.usage?.completion_tokens ?? null,
    totalTokens: payload.usage?.total_tokens ?? null,
    costAmount: typeof payload.usage_cost?.total_cost === 'number' ? payload.usage_cost.total_cost : null,
    costReported: typeof payload.usage_cost?.total_cost === 'number',
    outputBytes: Buffer.byteLength(content, 'utf8'),
    requestInputBytes,
    responseId: payload.id ?? null,
    finishStatus,
    responseTruncated,
    maxOutputTokens: null,
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
