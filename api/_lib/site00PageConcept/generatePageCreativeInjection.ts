import {
  ANTHROPIC_API_URL,
  ANTHROPIC_CREATIVE_MODEL,
  isAnthropicConfigured,
} from '../site00Evolve/creativeDirection/creativeIntelligence/config.js';
import type {
  PageCreativeContext,
  PageCreativeInjection,
  PageFunctionContract,
  ProjectCreativeContext,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import { PAGE_CGPT_PROMPT_VERSION } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/generationPlan.js';
import {
  buildCgptCreativeDirectorSystemPrompt,
  buildCgptProviderUserPayload,
  buildCgptSynthesisRepairUserMessage,
  buildVitestCgptCreativeInjection,
  validateCgptCreativeSynthesis,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCgptCreativeSynthesis.js';
import {
  buildPageCreativeInjectionFromParsed,
  mergeCgptParsedRecords,
} from './buildPageCreativeInjectionFromParsed.js';
import {
  classifyAnthropic429,
  estimateJsonTokenCount,
  founderCodeForHardQuota429,
  isHardQuota429,
  parseAnthropicRateLimitHeaders,
  type PageConceptCgptProviderTelemetry,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCgpt429.js';
import { PageConceptCgptProviderError } from './pageConceptCgptProviderError.js';

export type PageCgptInput = {
  projectContext: ProjectCreativeContext;
  pageContext: PageCreativeContext;
  functionContract: PageFunctionContract;
};

export type PageCgptTokenAudit = {
  inputTokensEstimate: number;
  maxOutputTokens: number;
  systemTokensEstimate: number;
  projectContextTokens: number;
  pageContextTokens: number;
  functionContractTokens: number;
};

export const PAGE_CGPT_MAX_OUTPUT_TOKENS = 4096;


export function auditPageCgptInputTokens(input: PageCgptInput): PageCgptTokenAudit {
  const system = `You are CGPT for SITE 00 PAGE design. Return exactly ONE JSON object PageCreativeInjection.
Combine project brand intelligence and page role. Do NOT return arrays of concepts.`;
  return {
    systemTokensEstimate: estimateJsonTokenCount(system),
    projectContextTokens: estimateJsonTokenCount(input.projectContext),
    pageContextTokens: estimateJsonTokenCount(input.pageContext),
    functionContractTokens: estimateJsonTokenCount(input.functionContract),
    inputTokensEstimate: estimateJsonTokenCount({
      promptVersion: PAGE_CGPT_PROMPT_VERSION,
      projectContext: input.projectContext,
      pageContext: input.pageContext,
      functionContract: input.functionContract,
    }),
    maxOutputTokens: PAGE_CGPT_MAX_OUTPUT_TOKENS,
  };
}

function parseAnthropicErrorBody(data: unknown): {
  errorType: string | null;
  errorCode: string | null;
  providerMessage: string | null;
} {
  if (!data || typeof data !== 'object') {
    return { errorType: null, errorCode: null, providerMessage: null };
  }
  const err = (data as { error?: { type?: string; message?: string } }).error;
  return {
    errorType: err?.type ?? null,
    errorCode: err?.type ?? null,
    providerMessage: err?.message ?? null,
  };
}

export async function fetchAnthropicPageCreativeJson(
  input: PageCgptInput,
  options: { attempt?: number; fetchImpl?: typeof fetch } = {},
): Promise<{ parsed: Record<string, unknown>; model: string; tokenAudit: PageCgptTokenAudit }> {
  const attempt = options.attempt ?? 1;
  const fetchImpl = options.fetchImpl ?? fetch;
  const tokenAudit = auditPageCgptInputTokens(input);

  const system = buildCgptCreativeDirectorSystemPrompt();
  const userPayload = buildCgptProviderUserPayload(input);
  const user = JSON.stringify(userPayload);

  const res = await fetchImpl(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!.trim(),
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: ANTHROPIC_CREATIVE_MODEL,
      max_tokens: PAGE_CGPT_MAX_OUTPUT_TOKENS,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });

  const rateLimitHeaders = parseAnthropicRateLimitHeaders(res.headers);
  const requestId = res.headers.get('request-id') ?? res.headers.get('x-request-id');

  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }
    const parsedErr = parseAnthropicErrorBody(body);
    const rateLimitClass =
      res.status === 429 ?
        classifyAnthropic429({
          errorType: parsedErr.errorType,
          errorMessage: parsedErr.providerMessage,
          rateLimitHeaders,
        })
      : null;
    const hardQuota = rateLimitClass != null && isHardQuota429(rateLimitClass);
    const telemetry: PageConceptCgptProviderTelemetry = {
      provider: 'anthropic',
      model: ANTHROPIC_CREATIVE_MODEL,
      httpStatus: res.status,
      errorType: parsedErr.errorType,
      errorCode: parsedErr.errorCode,
      providerMessage: parsedErr.providerMessage,
      requestId,
      rateLimitClass,
      rateLimitHeaders,
      inputTokensEstimate: tokenAudit.inputTokensEstimate + tokenAudit.systemTokensEstimate,
      maxOutputTokens: tokenAudit.maxOutputTokens,
      attempt,
      retryable: res.status === 429 && !hardQuota,
      hardQuota,
    };
    const founderCode =
      res.status === 429 && hardQuota && rateLimitClass ?
        founderCodeForHardQuota429(rateLimitClass)
      : res.status === 429 ?
        'CGPT_RATE_LIMITED'
      : `CGPT_INJECTION_FAILED: ${res.status}`;
    throw new PageConceptCgptProviderError(telemetry, founderCode);
  }

  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = data.content?.find((c) => c.type === 'text')?.text ?? '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    const telemetry: PageConceptCgptProviderTelemetry = {
      provider: 'anthropic',
      model: ANTHROPIC_CREATIVE_MODEL,
      httpStatus: res.status,
      errorType: 'invalid_response',
      errorCode: 'invalid_json',
      providerMessage: 'missing JSON object in model output',
      requestId,
      rateLimitClass: null,
      rateLimitHeaders,
      inputTokensEstimate: tokenAudit.inputTokensEstimate + tokenAudit.systemTokensEstimate,
      maxOutputTokens: tokenAudit.maxOutputTokens,
      attempt,
      retryable: false,
      hardQuota: false,
    };
    throw new PageConceptCgptProviderError(telemetry, 'CGPT_INJECTION_FAILED: invalid JSON');
  }
  const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
  if (Array.isArray(parsed.concepts)) {
    throw new Error('CGPT_INJECTION_FAILED: multi-concept rejected');
  }
  return { parsed, model: ANTHROPIC_CREATIVE_MODEL, tokenAudit };
}

export async function fetchAnthropicCgptSynthesisRepair(
  input: PageCgptInput,
  missingFields: readonly string[],
  options: { fetchImpl?: typeof fetch } = {},
): Promise<{ parsed: Record<string, unknown>; model: string }> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const system = buildCgptCreativeDirectorSystemPrompt();
  const user = buildCgptSynthesisRepairUserMessage(missingFields);
  const context = JSON.stringify(buildCgptProviderUserPayload(input));

  const res = await fetchImpl(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!.trim(),
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: ANTHROPIC_CREATIVE_MODEL,
      max_tokens: PAGE_CGPT_MAX_OUTPUT_TOKENS,
      system,
      messages: [
        { role: 'user', content: context },
        { role: 'assistant', content: '{}' },
        { role: 'user', content: user },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`CGPT_SYNTHESIS_REPAIR_FAILED: ${res.status}`);
  }
  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = data.content?.find((c) => c.type === 'text')?.text ?? '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('CGPT_SYNTHESIS_REPAIR_FAILED: invalid JSON');
  return { parsed: JSON.parse(jsonMatch[0]) as Record<string, unknown>, model: ANTHROPIC_CREATIVE_MODEL };
}

export async function generatePageCreativeInjection(input: PageCgptInput): Promise<PageCreativeInjection> {
  if (process.env.VITEST === 'true') {
    return buildVitestCgptCreativeInjection(input);
  }
  if (!isAnthropicConfigured()) {
    throw new Error('CGPT_INJECTION_FAILED: ANTHROPIC_API_KEY not configured');
  }

  let { parsed, model } = await fetchAnthropicPageCreativeJson(input);
  let injection = buildPageCreativeInjectionFromParsed(input, parsed, model);
  let validation = validateCgptCreativeSynthesis(injection);
  if (!validation.ok) {
    const repair = await fetchAnthropicCgptSynthesisRepair(input, validation.missingFields);
    parsed = mergeCgptParsedRecords(parsed, repair.parsed);
    injection = buildPageCreativeInjectionFromParsed(input, parsed, model);
    validation = validateCgptCreativeSynthesis(injection);
  }
  if (!validation.ok) {
    throw new Error(`CGPT_SYNTHESIS_INCOMPLETE: ${validation.missingFields.join(', ')}`);
  }
  return injection;
}
