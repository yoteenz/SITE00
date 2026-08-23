/**
 * Content Brain → Brand Personality structured bridge for downstream systems.
 */

import type { BrandPersonalityProfile } from './personalityTypes.js';

export type ContentBrainPersonalityInput = {
  socialInstinct: string | null;
  confidenceBehavior: string | null;
  witBehavior: string | null;
  humanityBehavior: string | null;
  disagreementBehavior: string | null;
  edgeBehavior: string | null;
  charmBehavior: string | null;
  observationalBehavior: string | null;
  memorabilityBehavior: string | null;
  emotionalRange: string | null;
  restraintBehavior: string | null;
  personalityTensions: string | null;
  socialReactionBehavior: string | null;
  selfCorrectionBehavior: string | null;
  antiPersonality: string | null;
};

function val(field: { value: unknown } | undefined): string | null {
  if (!field?.value) return null;
  if (Array.isArray(field.value)) return field.value.join(', ') || null;
  const s = String(field.value).trim();
  return s || null;
}

export function buildContentBrainPersonalityInput(
  personality: BrandPersonalityProfile | null | undefined,
): ContentBrainPersonalityInput | null {
  if (!personality) return null;
  return {
    socialInstinct: val(personality.socialInstinct),
    confidenceBehavior: val(personality.confidenceBehavior),
    witBehavior: val(personality.witBehavior),
    humanityBehavior: val(personality.humanityBehavior),
    disagreementBehavior: val(personality.disagreementBehavior),
    edgeBehavior: val(personality.edgeBehavior),
    charmBehavior: val(personality.charmBehavior),
    observationalBehavior: val(personality.observationalBehavior),
    memorabilityBehavior: val(personality.memorabilityBehavior),
    emotionalRange: val(personality.emotionalRange),
    restraintBehavior: val(personality.restraintBehavior),
    personalityTensions: val(personality.personalityTensions),
    socialReactionBehavior: val(personality.socialReactionBehavior),
    selfCorrectionBehavior: val(personality.selfCorrectionBehavior),
    antiPersonality: val(personality.antiPersonality),
  };
}

export function summarizeContentBrainPersonalityInput(input: ContentBrainPersonalityInput): string {
  return Object.entries(input)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
}
