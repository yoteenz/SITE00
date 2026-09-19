/**
 * Anthropic / Sonnet Creative Intelligence provider — server-side only.
 */

import { randomUUID } from 'node:crypto';
import {
  ANTHROPIC_API_URL,
  ANTHROPIC_CREATIVE_MODEL,
  creativeIntelligenceDebugLoggingEnabled,
  isAnthropicConfigured,
} from './config.js';
import {
  CORE_DIRECTION_CRITIC_SYSTEM_PROMPT,
  CORE_DIRECTION_FORMATION_SYSTEM_PROMPT,
  CORE_DIRECTION_REVISION_SYSTEM_PROMPT,
} from './prompts.js';
import { enrichFormationInputPayload } from '../../../../../shared/site00-brand-lore/productionPromptNormalization.js';
import { parseStructuredJson, isJsonParseError, STRUCTURED_JSON_REVISION_HINT } from './formationValidation.js';
import type {
  CoreDirectionCritiqueResult,
  CoreDirectionFormationInput,
  CoreDirectionFormationResult,
  CreativeIntelligenceProvider,
  FormedCoreDirection,
  ProviderRequestUsage,
  ReviseCoreDirectionsInput,
} from './types.js';

type AnthropicMessageResponse = {
  content: Array<{ type: string; text?: string }>;
  usage?: { input_tokens?: number; output_tokens?: number };
};

function sanitizeInputForLog(input: CoreDirectionFormationInput): Record<string, unknown> {
  return {
    organizationId: input.organizationId,
    brandLoreProfileId: input.brandLoreProfileId,
    brandLoreFingerprint: input.brandLoreFingerprint,
    formationVersion: input.formationVersion,
    fieldCount: Object.keys(input).length,
  };
}

async function callAnthropic(
  system: string,
  userPayload: unknown,
  options?: { maxTokens?: number },
): Promise<{ text: string; usage: ProviderRequestUsage }> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) throw new Error('CREATIVE_INTELLIGENCE_PROVIDER_UNAVAILABLE');

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: ANTHROPIC_CREATIVE_MODEL,
      max_tokens: options?.maxTokens ?? 16384,
      system,
      messages: [{ role: 'user', content: JSON.stringify(userPayload) }],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Anthropic request failed (${response.status}): ${detail.slice(0, 200)}`);
  }

  const data = (await response.json()) as AnthropicMessageResponse;
  const text = data.content.find((c) => c.type === 'text')?.text ?? '';
  return {
    text,
    usage: {
      inputTokens: data.usage?.input_tokens,
      outputTokens: data.usage?.output_tokens,
    },
  };
}

function normalizeDirection(raw: Record<string, unknown>, index: number): FormedCoreDirection {
  const directionName = String(raw.directionName ?? raw.name ?? `Direction ${index + 1}`);
  return {
    directionId: String(raw.directionId ?? randomUUID()),
    directionName,
    bigIdea: String(raw.bigIdea ?? ''),
    oneLineThesis: String(raw.oneLineThesis ?? ''),
    brandConnection: String(raw.brandConnection ?? ''),
    loreLineage: Array.isArray(raw.loreLineage) ? raw.loreLineage.map(String) : [],
    conceptualAncestor: String(raw.conceptualAncestor ?? raw.culturalReference ?? ''),
    culturalReference: String(raw.culturalReference ?? raw.conceptualAncestor ?? ''),
    emotionalPromise: String(raw.emotionalPromise ?? ''),
    audienceRole: String(raw.audienceRole ?? ''),
    brandRole: String(raw.brandRole ?? ''),
    visualMetaphor: String(raw.visualMetaphor ?? ''),
    governingBehavior: String(raw.governingBehavior ?? ''),
    materialImageryLanguage: String(raw.materialImageryLanguage ?? raw.materialLanguage ?? ''),
    imageryLanguage: String(raw.imageryLanguage ?? raw.materialImageryLanguage ?? ''),
    typographicAttitude: String(raw.typographicAttitude ?? ''),
    coreColorLogic: String(raw.coreColorLogic ?? raw.colorLogic ?? ''),
    colorLogic: String(raw.colorLogic ?? raw.coreColorLogic ?? ''),
    signatureDevices: Array.isArray(raw.signatureDevices) ? raw.signatureDevices.map(String) : [],
    primaryBrandArtifact: String(raw.primaryBrandArtifact ?? raw.primaryArtifact ?? ''),
    motionSeed: String(raw.motionSeed ?? ''),
    socialExpressionHypothesis: String(raw.socialExpressionHypothesis ?? ''),
    proprietaryQuality: String(raw.proprietaryQuality ?? ''),
    antiDirection: Array.isArray(raw.antiDirection) ? raw.antiDirection.map(String) : [],
    risks: Array.isArray(raw.risks) ? raw.risks.map(String) : [],
    qualityConfidence: (raw.qualityConfidence as FormedCoreDirection['qualityConfidence']) ?? 'MEDIUM',
  };
}

async function callAnthropicWithJsonRetry<T>(params: {
  system: string;
  buildPayload: (revisionHint: string | null) => unknown;
  parse: (text: string) => T;
}): Promise<{ result: T; usage: ProviderRequestUsage }> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const revisionHint = attempt === 0 ? null : STRUCTURED_JSON_REVISION_HINT;
    const { text, usage } = await callAnthropic(params.system, params.buildPayload(revisionHint));
    try {
      return { result: params.parse(text), usage };
    } catch (err) {
      if (!isJsonParseError(err) || attempt === 1) throw err;
    }
  }
  throw new Error('Structured JSON parse failed after retry');
}

export function createAnthropicCreativeIntelligenceProvider(): CreativeIntelligenceProvider {
  const capability = {
    providerId: 'anthropic',
    modelId: ANTHROPIC_CREATIVE_MODEL,
    supportsStructuredOutput: true,
    supportsLongContext: true,
    supportsVision: false,
    supportsToolUse: false,
    maxContext: 200_000,
    status: isAnthropicConfigured() ? ('AVAILABLE' as const) : ('MISCONFIGURED' as const),
  };

  return {
    providerId: 'anthropic',
    capability,
    async formCoreDirections(input: CoreDirectionFormationInput): Promise<CoreDirectionFormationResult> {
      if (creativeIntelligenceDebugLoggingEnabled()) {
        console.info('[creative-intelligence] formCoreDirections', sanitizeInputForLog(input));
      }
      const orgSlug = input.orgSlug ?? 'ndxbook';
      const payload = enrichFormationInputPayload(input, orgSlug);
      const { result: parsed, usage } = await callAnthropicWithJsonRetry({
        system: CORE_DIRECTION_FORMATION_SYSTEM_PROMPT,
        buildPayload: (revisionHint) => ({
          ...payload,
          ...(revisionHint ? { revisionHint } : {}),
        }),
        parse: (text) =>
          parseStructuredJson<{ directions: Record<string, unknown>[]; rationaleSummary?: string }>(text),
      });
      return {
        directions: (parsed.directions ?? []).map(normalizeDirection),
        rationaleSummary: parsed.rationaleSummary,
        requestUsage: usage,
      };
    },
    async critiqueCoreDirections(
      input: CoreDirectionFormationInput,
      candidates: FormedCoreDirection[],
    ): Promise<CoreDirectionCritiqueResult> {
      const orgSlug = input.orgSlug ?? 'ndxbook';
      const payload = enrichFormationInputPayload(input, orgSlug);
      const { result: parsed, usage } = await callAnthropicWithJsonRetry({
        system: CORE_DIRECTION_CRITIC_SYSTEM_PROMPT,
        buildPayload: (revisionHint) => ({
          input: payload,
          candidates,
          ...(revisionHint ? { revisionHint } : {}),
        }),
        parse: (text) => parseStructuredJson<CoreDirectionCritiqueResult>(text),
      });
      return { ...parsed, requestUsage: usage };
    },
    async reviseCoreDirections(reviseInput: ReviseCoreDirectionsInput): Promise<CoreDirectionFormationResult> {
      const orgSlug = reviseInput.formationInput.orgSlug ?? 'ndxbook';
      const basePayload = {
        ...reviseInput,
        formationInput: enrichFormationInputPayload(reviseInput.formationInput, orgSlug),
      };
      const { result: parsed, usage } = await callAnthropicWithJsonRetry({
        system: CORE_DIRECTION_REVISION_SYSTEM_PROMPT,
        buildPayload: (revisionHint) => ({
          ...basePayload,
          ...(revisionHint ? { revisionHint } : {}),
        }),
        parse: (text) => parseStructuredJson<{ directions: Record<string, unknown>[] }>(text),
      });
      return {
        directions: (parsed.directions ?? []).map(normalizeDirection),
        requestUsage: usage,
      };
    },
  };
}
