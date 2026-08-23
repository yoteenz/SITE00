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
import { parseStructuredJson } from './formationValidation.js';
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

async function callAnthropic(system: string, userPayload: unknown): Promise<{ text: string; usage: ProviderRequestUsage }> {
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
      max_tokens: 8192,
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
      const { text, usage } = await callAnthropic(CORE_DIRECTION_FORMATION_SYSTEM_PROMPT, payload);
      const parsed = parseStructuredJson<{ directions: Record<string, unknown>[]; rationaleSummary?: string }>(text);
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
      const { text, usage } = await callAnthropic(CORE_DIRECTION_CRITIC_SYSTEM_PROMPT, { input: payload, candidates });
      const parsed = parseStructuredJson<CoreDirectionCritiqueResult>(text);
      return { ...parsed, requestUsage: usage };
    },
    async reviseCoreDirections(reviseInput: ReviseCoreDirectionsInput): Promise<CoreDirectionFormationResult> {
      const orgSlug = reviseInput.formationInput.orgSlug ?? 'ndxbook';
      const payload = {
        ...reviseInput,
        formationInput: enrichFormationInputPayload(reviseInput.formationInput, orgSlug),
      };
      const { text, usage } = await callAnthropic(CORE_DIRECTION_REVISION_SYSTEM_PROMPT, payload);
      const parsed = parseStructuredJson<{ directions: Record<string, unknown>[] }>(text);
      return {
        directions: (parsed.directions ?? []).map(normalizeDirection),
        requestUsage: usage,
      };
    },
  };
}
