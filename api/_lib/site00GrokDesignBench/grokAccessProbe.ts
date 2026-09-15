/**
 * P0.VR.DESIGNBENCH.GROK1F3 — team-scoped xAI model access probe.
 * Uses server-side XAI_API_KEY only. Never logs or returns key material.
 */

import {
  GROK_4_6_NOT_AVAILABLE_TO_CURRENT_XAI_TEAM,
  GROK_DESIGN_BENCH_INFERENCE_METHOD,
  GROK_DESIGN_BENCH_INFERENCE_PATH,
  GROK_XAI_API_BASE,
} from '../../../shared/site00-design-bench/grokTwinTestA/constants.js';
import { GROK_DESIGN_BENCH_MODEL_ID } from '../../../shared/site00-design-bench/grokTwinTestA/modelContract.js';

function grokDesignBenchApiKey(): string | null {
  return process.env.XAI_API_KEY?.trim() || null;
}

export type Grok46RootCause =
  | 'MODEL_NOT_AVAILABLE_TO_TEAM'
  | 'MODEL_EARLY_ACCESS_NOT_ENABLED'
  | 'WRONG_ENDPOINT_FOR_MODEL'
  | 'REGION_OR_ACCOUNT_ACCESS_RESTRICTION'
  | 'REQUEST_SHAPE_REJECTED'
  | 'OTHER_PROVIDER_REJECTION'
  | null;

export interface Grok46ModelDetailSafe {
  id: string | null;
  aliases: string[];
  ownedBy: string | null;
  contextLength: number | null;
  imageInputPriced: boolean;
  httpStatus: number | null;
}

export interface Grok46SmokeResult {
  ran: boolean;
  httpStatus: number | null;
  modelAccepted: boolean;
  providerStatus: string | null;
}

export interface Grok46AccessProbe {
  modelListRequest: string;
  modelDetailRequest: string;
  requestEndpoint: string;
  requestMethod: 'POST';
  modelField: typeof GROK_DESIGN_BENCH_MODEL_ID;
  availableLanguageModels: string[];
  grok46AvailableToThisKey: boolean;
  modelDetail: Grok46ModelDetailSafe | null;
  textOnlySmoke: Grok46SmokeResult;
  imageSmoke: Grok46SmokeResult;
  rootCause: Grok46RootCause;
  notAvailableCode: typeof GROK_4_6_NOT_AVAILABLE_TO_CURRENT_XAI_TEAM | null;
}

/** 8x8 red PNG — xAI rejects images smaller than 8px on either edge. */
export const GROK46_SMOKE_PNG_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAEklEQVR4nGP4z8DwHx9mGBkKAMLXf4EvceABAAAAAElFTkSuQmCC';

type FetchLike = typeof fetch;

let probeCache: { at: number; value: Grok46AccessProbe } | null = null;
const PROBE_CACHE_MS = 45_000;

function xaiBase(): string {
  return (process.env.SITE00_GROK_API_BASE?.replace(/\/$/, '') || GROK_XAI_API_BASE).replace(/\/$/, '');
}

function headers(apiKey: string): HeadersInit {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
}

function safeBodySnippet(raw: string): string {
  return raw.replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [REDACTED]').slice(0, 240);
}

function extractResponsesText(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return '';
  const rec = payload as Record<string, unknown>;
  if (typeof rec.output_text === 'string') return rec.output_text;
  const output = rec.output;
  if (!Array.isArray(output)) return '';
  for (const item of output) {
    if (!item || typeof item !== 'object') continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (!part || typeof part !== 'object') continue;
      const typed = part as { type?: string; text?: string };
      if (typed.type === 'output_text' && typeof typed.text === 'string') return typed.text;
    }
  }
  return '';
}

export function grok46ListedForKey(models: string[]): boolean {
  return models.some((id) => id === GROK_DESIGN_BENCH_MODEL_ID || id.startsWith(`${GROK_DESIGN_BENCH_MODEL_ID}-`));
}

export function classifyGrok46AccessRootCause(input: {
  grok46AvailableToThisKey: boolean;
  textHttp: number | null;
  chatHttp?: number | null;
  responsesHttp?: number | null;
  imageHttp?: number | null;
}): Grok46RootCause {
  if (!input.grok46AvailableToThisKey) return 'MODEL_NOT_AVAILABLE_TO_TEAM';
  if (input.chatHttp === 410 && input.responsesHttp != null && input.responsesHttp >= 200 && input.responsesHttp < 300) {
    return 'WRONG_ENDPOINT_FOR_MODEL';
  }
  if (input.textHttp === 410 || input.textHttp === 404) return 'MODEL_NOT_AVAILABLE_TO_TEAM';
  if (input.textHttp === 403) return 'MODEL_EARLY_ACCESS_NOT_ENABLED';
  if (input.textHttp === 400) return 'REQUEST_SHAPE_REJECTED';
  if (input.textHttp != null && input.textHttp >= 200 && input.textHttp < 300) {
    if (input.imageHttp != null && input.imageHttp >= 400) return 'REQUEST_SHAPE_REJECTED';
    return null;
  }
  if (input.textHttp != null) return 'OTHER_PROVIDER_REJECTION';
  return null;
}

export async function xaiAuthorizedGet(path: string, apiKey: string, fetchImpl: FetchLike): Promise<{ status: number; json: unknown; text: string }> {
  const res = await fetchImpl(`${xaiBase()}${path}`, { method: 'GET', headers: headers(apiKey) });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: safeBodySnippet(text) };
  }
  return { status: res.status, json, text };
}

export async function probeGrok46TeamAccess(opts?: {
  fetchImpl?: FetchLike;
  includeImageSmoke?: boolean;
  skipCache?: boolean;
}): Promise<Grok46AccessProbe> {
  const fetchImpl = opts?.fetchImpl ?? fetch;
  const includeImage = opts?.includeImageSmoke !== false;
  if (!opts?.skipCache && process.env.VITEST !== 'true' && probeCache && Date.now() - probeCache.at < PROBE_CACHE_MS) {
    return probeCache.value;
  }

  const apiKey = grokDesignBenchApiKey();
  const emptySmoke = (): Grok46SmokeResult => ({ ran: false, httpStatus: null, modelAccepted: false, providerStatus: null });
  const base: Grok46AccessProbe = {
    modelListRequest: `GET ${xaiBase()}/models`,
    modelDetailRequest: `GET ${xaiBase()}/models/${GROK_DESIGN_BENCH_MODEL_ID}`,
    requestEndpoint: `${xaiBase()}${GROK_DESIGN_BENCH_INFERENCE_PATH}`,
    requestMethod: GROK_DESIGN_BENCH_INFERENCE_METHOD,
    modelField: GROK_DESIGN_BENCH_MODEL_ID,
    availableLanguageModels: [],
    grok46AvailableToThisKey: false,
    modelDetail: null,
    textOnlySmoke: emptySmoke(),
    imageSmoke: emptySmoke(),
    rootCause: apiKey ? null : 'OTHER_PROVIDER_REJECTION',
    notAvailableCode: GROK_4_6_NOT_AVAILABLE_TO_CURRENT_XAI_TEAM,
  };
  if (!apiKey) return base;

  const list = await xaiAuthorizedGet('/models', apiKey, fetchImpl); // GET /models
  const listData = list.json && typeof list.json === 'object' ? (list.json as { data?: Array<{ id?: string }> }).data : null;
  const ids = Array.isArray(listData)
    ? listData.map((row) => String(row.id ?? '')).filter(Boolean)
    : [];
  base.availableLanguageModels = ids;
  base.grok46AvailableToThisKey = grok46ListedForKey(ids);

  const detail = await xaiAuthorizedGet('/models/grok-4.6', apiKey, fetchImpl);
  const detailRow = detail.json && typeof detail.json === 'object' ? (detail.json as Record<string, unknown>) : null;
  base.modelDetail = {
    id: typeof detailRow?.id === 'string' ? detailRow.id : null,
    aliases: Array.isArray(detailRow?.aliases) ? detailRow.aliases.filter((v): v is string => typeof v === 'string') : [],
    ownedBy: typeof detailRow?.owned_by === 'string' ? detailRow.owned_by : null,
    contextLength: typeof detailRow?.context_length === 'number' ? detailRow.context_length : null,
    imageInputPriced: detailRow?.prompt_image_token_price != null,
    httpStatus: detail.status,
  };
  if (detail.status >= 200 && detail.status < 300 && detailRow?.id === GROK_DESIGN_BENCH_MODEL_ID) {
    base.grok46AvailableToThisKey = true;
  }

  const textRes = await fetchImpl(base.requestEndpoint, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify({
      model: GROK_DESIGN_BENCH_MODEL_ID,
      input: 'Return exactly: READY',
      tools: [],
      store: false,
    }),
  });
  const textRaw = await textRes.text();
  let textJson: unknown = null;
  try {
    textJson = textRaw ? JSON.parse(textRaw) : null;
  } catch {
    textJson = null;
  }
  const textAccepted = textRes.ok;
  base.textOnlySmoke = {
    ran: true,
    httpStatus: textRes.status,
    modelAccepted: textAccepted,
    providerStatus: textAccepted ? 'accepted' : safeBodySnippet(textRaw) || `http_${textRes.status}`,
  };

  let chatHttp: number | null = null;
  try {
    const chatRes = await fetchImpl(`${xaiBase()}/chat/completions`, {
      method: 'POST',
      headers: headers(apiKey),
      body: JSON.stringify({
        model: GROK_DESIGN_BENCH_MODEL_ID,
        messages: [{ role: 'user', content: 'Return exactly: READY' }],
      }),
    });
    chatHttp = chatRes.status;
    await chatRes.text().catch(() => '');
  } catch {
    chatHttp = null;
  }

  if (textAccepted && includeImage) {
    const imageRes = await fetchImpl(base.requestEndpoint, {
      method: 'POST',
      headers: headers(apiKey),
      body: JSON.stringify({
        model: GROK_DESIGN_BENCH_MODEL_ID,
        tools: [],
        store: false,
        input: [
          {
            role: 'user',
            content: [
              { type: 'input_image', image_url: `data:image/png;base64,${GROK46_SMOKE_PNG_B64}` },
              { type: 'input_text', text: 'What is the dominant color in this image?' },
            ],
          },
        ],
      }),
    });
    const imageRaw = await imageRes.text();
    base.imageSmoke = {
      ran: true,
      httpStatus: imageRes.status,
      modelAccepted: imageRes.ok,
      providerStatus: imageRes.ok
        ? extractResponsesText(imageRaw.startsWith('{') ? JSON.parse(imageRaw) : null) || 'accepted'
        : safeBodySnippet(imageRaw) || `http_${imageRes.status}`,
    };
  }

  base.rootCause = classifyGrok46AccessRootCause({
    grok46AvailableToThisKey: base.grok46AvailableToThisKey,
    textHttp: base.textOnlySmoke.httpStatus,
    chatHttp,
    responsesHttp: base.textOnlySmoke.httpStatus,
    imageHttp: base.imageSmoke.httpStatus,
  });
  base.notAvailableCode = base.grok46AvailableToThisKey ? null : GROK_4_6_NOT_AVAILABLE_TO_CURRENT_XAI_TEAM;

  if (process.env.VITEST !== 'true') {
    probeCache = { at: Date.now(), value: base };
  }
  return base;
}

export function resetGrok46AccessProbeCache(): void {
  probeCache = null;
}
