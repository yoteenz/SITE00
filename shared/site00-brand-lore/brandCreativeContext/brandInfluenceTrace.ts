/**
 * P0.CBI.1 — BrandInfluenceTrace — trace actual input used by generator.
 */

import type { BrandCreativeContext, BrandInfluenceTrace } from './types.js';

export function buildBrandInfluenceTraces(
  context: BrandCreativeContext,
  creativeDecisions: { decision: string; fieldHints: string[] }[],
): BrandInfluenceTrace[] {
  const traces: BrandInfluenceTrace[] = [];

  for (const { decision, fieldHints } of creativeDecisions) {
    for (const hint of fieldHints) {
      const trace = resolveTraceForField(context, hint, decision);
      if (trace) traces.push(trace);
    }
  }

  return traces;
}

function resolveTraceForField(
  context: BrandCreativeContext,
  fieldHint: string,
  decision: string,
): BrandInfluenceTrace | null {
  const map: Record<string, { value: unknown; source: string }> = {
    positioning: { value: context.positioning.value, source: 'positioning' },
    brandPromise: { value: context.brandPromise.value, source: 'brandPromise' },
    audience: { value: context.audience.primary.value, source: 'audience.primary' },
    offers: { value: context.offers.map((o) => o.name).join(', '), source: 'offers' },
    world: { value: context.worldBuilding.locations.value, source: 'worldBuilding.locations' },
    visual: { value: context.visualIdentity.recurringSignatures.value, source: 'visualIdentity' },
    voice: { value: context.toneVoice.preferredPatterns.value, source: 'toneVoice' },
    experience: { value: context.experiencePrinciples.value, source: 'experiencePrinciples' },
  };

  const entry = map[fieldHint];
  if (!entry || entry.value == null || (Array.isArray(entry.value) && entry.value.length === 0)) {
    return null;
  }

  const refs = context.sourceRefs.filter((r) => r.fieldsContributed.some((f) => f.includes(fieldHint)));
  const source = refs[0]?.sourceId ?? entry.source;

  return {
    contextField: entry.source,
    source,
    creativeDecision: decision,
    strength: context.confidence === 'HIGH' ? 'HIGH' : context.confidence === 'MEDIUM' ? 'MEDIUM' : 'LOW',
  };
}

export function buildBrandSpecificFitExplanation(context: BrandCreativeContext, decisionArea: string): string {
  const parts: string[] = [];
  if (context.positioning.value && !context.positioning.isUnknown) {
    parts.push(`positioning (${context.positioning.value})`);
  }
  if (context.experiencePrinciples.value?.length) {
    parts.push(`experience (${context.experiencePrinciples.value[0]})`);
  }
  if (context.visualIdentity.recurringSignatures.value?.length) {
    parts.push(`visual language (${context.visualIdentity.recurringSignatures.value.slice(0, 2).join(', ')})`);
  }
  if (context.worldBuilding.locations.value?.length) {
    parts.push(`world (${context.worldBuilding.locations.value[0]})`);
  }

  if (parts.length === 0) {
    return `Insufficient brand context to explain ${decisionArea} fit — do not generate generic category rationale.`;
  }

  return `This ${decisionArea} fits ${context.brandName} specifically because it draws on ${parts.join('; ')} — not generic category assumptions.`;
}
