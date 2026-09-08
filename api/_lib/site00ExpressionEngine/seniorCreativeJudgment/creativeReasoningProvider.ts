/**
 * C1.5 — Creative reasoning provider (Anthropic primary, structured fallback).
 */

import type {
  CreativeQualityTier,
  SeniorCreativeJudgmentInput,
  SeniorCreativeFailureClass,
  MetaphorMaturityClass,
} from '../../../shared/site00-expression-engine/senior-creative-judgment/types.js';

export const CREATIVE_RUNTIME_MODES = ['FULL_REASONING', 'HYBRID', 'DETERMINISTIC_FALLBACK'] as const;
export type CreativeRuntimeMode = (typeof CREATIVE_RUNTIME_MODES)[number];

export type CreativeReasoningRequest = {
  input: SeniorCreativeJudgmentInput;
  campaignResponsibility: string;
  retrievedPrinciples: string[];
};

export type CreativeReasoningResult = {
  runtimeMode: CreativeRuntimeMode;
  reasoningDepthLimited: boolean;
  textReasoningDispatchCount: number;
  surfaceObservation: string;
  firstOrderContradiction: string;
  secondOrderContradiction: string;
  humanContradiction: string;
  initialWinnerSummary: string;
  deeperIdea: string;
  attackVectors: Array<{ vector: string; diagnosis: string; severity: 'LOW' | 'MODERATE' | 'HIGH' }>;
  redTeamCriticism: string;
  challengerConceptName: string;
  challengerIdea: string;
  finalDirection: string;
  qualityTier: CreativeQualityTier;
  founderHandholdingRisk: 'LOW' | 'MODERATE' | 'HIGH';
  metaphorClass: MetaphorMaturityClass;
  worldStructural: boolean;
  artifactOutcome: string;
  explanatoryPropRisk: boolean;
  heroMemoryImage: string;
  cameraDiscovery: string;
  mediumRationale: string;
  failureClasses: SeniorCreativeFailureClass[];
  selfCritique: string[];
  brandSpecificity: string;
};

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

function isAnthropicConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

function parseJsonBlock(text: string): Record<string, unknown> | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function callAnthropicReasoning(req: CreativeReasoningRequest): Promise<CreativeReasoningResult | null> {
  if (!isAnthropicConfigured()) return null;
  const apiKey = process.env.ANTHROPIC_API_KEY!.trim();

  const system = `You are a senior executive creative director. Return ONLY valid JSON with these keys:
surfaceObservation, firstOrderContradiction, secondOrderContradiction, humanContradiction,
initialWinnerSummary, deeperIdea, attackVectors (array of {vector, diagnosis, severity}),
redTeamCriticism, challengerConceptName, challengerIdea, finalDirection, qualityTier (VALID|STRONG|EXCEPTIONAL),
founderHandholdingRisk (LOW|MODERATE|HIGH), metaphorClass, worldStructural (boolean),
artifactOutcome, explanatoryPropRisk (boolean), heroMemoryImage, cameraDiscovery, mediumRationale,
failureClasses (array), selfCritique (array), brandSpecificity.
Do not include chain-of-thought. Be structurally mature — challenge the first good answer.`;

  const response = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_CREATIVE_MODEL ?? 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system,
      messages: [{ role: 'user', content: JSON.stringify(req) }],
    }),
  });

  if (!response.ok) return null;
  const data = (await response.json()) as { content: Array<{ type: string; text?: string }> };
  const text = data.content.find((c) => c.type === 'text')?.text ?? '';
  const parsed = parseJsonBlock(text);
  if (!parsed) return null;

  return {
    runtimeMode: 'FULL_REASONING',
    reasoningDepthLimited: false,
    textReasoningDispatchCount: 1,
    surfaceObservation: String(parsed.surfaceObservation ?? ''),
    firstOrderContradiction: String(parsed.firstOrderContradiction ?? ''),
    secondOrderContradiction: String(parsed.secondOrderContradiction ?? ''),
    humanContradiction: String(parsed.humanContradiction ?? ''),
    initialWinnerSummary: String(parsed.initialWinnerSummary ?? req.input.conceptName),
    deeperIdea: String(parsed.deeperIdea ?? ''),
    attackVectors: Array.isArray(parsed.attackVectors)
      ? (parsed.attackVectors as CreativeReasoningResult['attackVectors'])
      : [],
    redTeamCriticism: String(parsed.redTeamCriticism ?? ''),
    challengerConceptName: String(parsed.challengerConceptName ?? 'CHALLENGER'),
    challengerIdea: String(parsed.challengerIdea ?? ''),
    finalDirection: String(parsed.finalDirection ?? req.input.conceptName),
    qualityTier: (parsed.qualityTier as CreativeQualityTier) ?? 'STRONG',
    founderHandholdingRisk: (parsed.founderHandholdingRisk as CreativeReasoningResult['founderHandholdingRisk']) ?? 'MODERATE',
    metaphorClass: (parsed.metaphorClass as MetaphorMaturityClass) ?? 'FUNCTIONAL',
    worldStructural: Boolean(parsed.worldStructural),
    artifactOutcome: String(parsed.artifactOutcome ?? 'SUPPORTING_ARTIFACT_ONLY'),
    explanatoryPropRisk: Boolean(parsed.explanatoryPropRisk),
    heroMemoryImage: String(parsed.heroMemoryImage ?? ''),
    cameraDiscovery: String(parsed.cameraDiscovery ?? 'DISCOVERS'),
    mediumRationale: String(parsed.mediumRationale ?? ''),
    failureClasses: Array.isArray(parsed.failureClasses)
      ? (parsed.failureClasses as SeniorCreativeFailureClass[])
      : [],
    selfCritique: Array.isArray(parsed.selfCritique) ? parsed.selfCritique.map(String) : [],
    brandSpecificity: String(parsed.brandSpecificity ?? ''),
  };
}

function deterministicReasoning(req: CreativeReasoningRequest): CreativeReasoningResult {
  const { input } = req;
  const hasMetricRisk = /count|sku|number|metric|stat/i.test(input.oneSentenceIdea + input.thesis);
  const worldStructural = input.worldFunction.length > 20 && !/generic|neutral room/i.test(input.world);
  const explanatoryPropRisk =
    Boolean(input.artifact) &&
    (input.artifactFunction?.toLowerCase().includes('explain') ||
      /receipt|schedule|document/i.test(input.artifact ?? ''));

  return {
    runtimeMode: isAnthropicConfigured() ? 'HYBRID' : 'DETERMINISTIC_FALLBACK',
    reasoningDepthLimited: true,
    textReasoningDispatchCount: 0,
    surfaceObservation: input.oneSentenceIdea,
    firstOrderContradiction: input.thesis,
    secondOrderContradiction: input.deeperContradiction,
    humanContradiction: 'Performance vs admission tension beneath measurable proof',
    initialWinnerSummary: input.conceptName,
    deeperIdea: input.deeperContradiction,
    attackVectors: [
      { vector: 'TOO SAFE', diagnosis: 'First answer may stop at illustration', severity: 'MODERATE' },
      { vector: 'ARTIFACT DOES TOO MUCH', diagnosis: 'Prop may explain what world already proves', severity: 'MODERATE' },
      { vector: 'METRIC IS THE IDEA', diagnosis: hasMetricRisk ? 'Count/metric risks becoming thesis' : 'Low metric risk', severity: hasMetricRisk ? 'HIGH' : 'LOW' },
    ],
    redTeamCriticism: 'A rival would push behavior-as-receipt and demote explanatory props',
    challengerConceptName: 'BEHAVIOR-AS-RECEIPT VARIANT',
    challengerIdea: 'Same thesis — proof lives in subject behavior without explanatory artifact',
    finalDirection: explanatoryPropRisk
      ? `${input.conceptName} — environment/behavior primary receipt`
      : input.conceptName,
    qualityTier: worldStructural && !hasMetricRisk ? 'STRONG' : 'VALID',
    founderHandholdingRisk: worldStructural ? 'MODERATE' : 'HIGH',
    metaphorClass: worldStructural ? 'STRUCTURAL' : 'FUNCTIONAL',
    worldStructural,
    artifactOutcome: explanatoryPropRisk ? 'SUPPORTING_ARTIFACT_ONLY' : 'PRIMARY_ARTIFACT_REQUIRED',
    explanatoryPropRisk,
    heroMemoryImage: input.climaxImage || input.openingImage,
    cameraDiscovery: 'DISCOVERS',
    mediumRationale: input.formatTarget === 'REEL' || input.formatTarget === 'FILM'
      ? 'Temporal discovery required'
      : 'Medium-specific compression',
    failureClasses: [
      ...(hasMetricRisk ? (['METRIC_IS_THE_IDEA'] as SeniorCreativeFailureClass[]) : []),
      ...(explanatoryPropRisk ? (['EXPLANATORY_PROP'] as SeniorCreativeFailureClass[]) : []),
      'REASONING_DEPTH_LIMITED',
    ],
    selfCritique: ['Deterministic fallback — full reasoning provider unavailable or failed'],
    brandSpecificity: input.culturalRead.slice(0, 120),
  };
}

export async function runCreativeReasoning(req: CreativeReasoningRequest): Promise<CreativeReasoningResult> {
  if (process.env.VITEST === 'true' || process.env.SITE00_CREATIVE_REASONING_FORCE_FALLBACK === '1') {
    return deterministicReasoning(req);
  }
  const provider = await callAnthropicReasoning(req);
  if (provider && provider.attackVectors.length >= 3) return provider;
  const fallback = deterministicReasoning(req);
  return {
    ...fallback,
    runtimeMode: provider ? 'HYBRID' : fallback.runtimeMode,
    textReasoningDispatchCount: provider?.textReasoningDispatchCount ?? 0,
  };
}

export function isCreativeReasoningProviderConfigured(): boolean {
  return isAnthropicConfigured();
}
