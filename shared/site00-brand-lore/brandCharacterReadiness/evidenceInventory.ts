/**
 * Forensic inventory of existing post-purchase character evidence sources.
 */

import type { BrandLoreProfile } from '../types.js';
import { buildContentBrainPersonalityInput } from '../contentBrainPersonalityBridge.js';
import { resolveCreativeIntelligenceReadiness } from '../creativeIntelligenceReadiness.js';
import type { CharacterEvidenceConfidence } from './types.js';

function fieldTexts(field: { value: unknown } | undefined): string[] {
  if (!field?.value) return [];
  if (Array.isArray(field.value)) return field.value.map(String).filter(Boolean);
  const s = String(field.value).trim();
  return s ? [s] : [];
}

export type CharacterEvidenceInventory = {
  brandLore: string[];
  brandPersonality: string[];
  founderCreativeAppetite: string[];
  primaryExpressionContext: string[];
  businessOffering: string[];
  audienceTruth: string[];
  founderLanguage: string[];
  antiDirection: string[];
  culturalReferences: string[];
  visualReferences: string[];
  humorWit: string[];
  socialInstinct: string[];
  confidenceBehavior: string[];
  humanity: string[];
  disagreementBehavior: string[];
  personalityTension: string[];
  selfCorrection: string[];
  emotionalRange: string[];
  culturalSpecificity: string[];
  hardBoundaries: string[];
  rawPersonalityAnswers: Record<string, string | string[]>;
  creativeIntelligenceSummary: ReturnType<typeof resolveCreativeIntelligenceReadiness>;
};

export function inventoryCharacterEvidence(profile: BrandLoreProfile | null): CharacterEvidenceInventory {
  const empty: CharacterEvidenceInventory = {
    brandLore: [],
    brandPersonality: [],
    founderCreativeAppetite: [],
    primaryExpressionContext: [],
    businessOffering: [],
    audienceTruth: [],
    founderLanguage: [],
    antiDirection: [],
    culturalReferences: [],
    visualReferences: [],
    humorWit: [],
    socialInstinct: [],
    confidenceBehavior: [],
    humanity: [],
    disagreementBehavior: [],
    personalityTension: [],
    selfCorrection: [],
    emotionalRange: [],
    culturalSpecificity: [],
    hardBoundaries: [],
    rawPersonalityAnswers: {},
    creativeIntelligenceSummary: resolveCreativeIntelligenceReadiness(
      profile ?? ({} as BrandLoreProfile),
    ),
  };
  if (!profile) return empty;

  const p = profile.brandPersonality;
  const personalityInput = buildContentBrainPersonalityInput(p);

  return {
    brandLore: [
      ...fieldTexts(profile.brandBelief),
      ...fieldTexts(profile.brandWorld),
      ...fieldTexts(profile.worldMetaphor),
      ...fieldTexts(profile.coreObsessions),
    ],
    brandPersonality: personalityInput
      ? Object.entries(personalityInput)
          .filter(([, v]) => v)
          .map(([k, v]) => `${k}: ${v}`)
      : [],
    founderCreativeAppetite: profile.founderCreativeAppetite
      ? ['Founder Creative Appetite profile captured']
      : [],
    primaryExpressionContext: profile.contextClassification ? [profile.contextClassification] : [],
    businessOffering: [...fieldTexts(profile.brandBelief), ...fieldTexts(profile.coreObsessions)],
    audienceTruth: fieldTexts(profile.audienceRelationship),
    founderLanguage: [
      ...fieldTexts(profile.authenticLanguageSamples),
      ...(p?.rawPersonalityAnswers
        ? Object.values(p.rawPersonalityAnswers).flatMap((v) => (Array.isArray(v) ? v : [v]))
        : []),
    ],
    antiDirection: [
      ...fieldTexts(profile.antiLanguage),
      ...fieldTexts(profile.creativeAntiPatterns),
      ...(p ? fieldTexts(p.antiPersonality) : []),
    ],
    culturalReferences: [
      ...fieldTexts(profile.referenceLineage),
      ...fieldTexts(profile.currentReferenceSignals),
      ...fieldTexts(profile.culturalOpposition),
    ],
    visualReferences: [
      ...fieldTexts(profile.materialVocabulary),
      ...fieldTexts(profile.referenceLineage),
    ],
    humorWit: p ? fieldTexts(p.witBehavior) : [],
    socialInstinct: p ? fieldTexts(p.socialInstinct) : [],
    confidenceBehavior: p ? fieldTexts(p.confidenceBehavior) : [],
    humanity: p ? fieldTexts(p.humanityBehavior) : [],
    disagreementBehavior: p ? fieldTexts(p.disagreementBehavior) : [],
    personalityTension: [
      ...fieldTexts(profile.creativeTensions),
      ...(p ? fieldTexts(p.personalityTensions) : []),
    ],
    selfCorrection: p ? fieldTexts(p.selfCorrectionBehavior) : [],
    emotionalRange: [
      ...fieldTexts(profile.emotionalPromise),
      ...(p ? fieldTexts(p.emotionalRange) : []),
    ],
    culturalSpecificity: fieldTexts(profile.culturalOpposition),
    hardBoundaries: [
      ...fieldTexts(profile.creativeAntiPatterns),
      ...(p ? fieldTexts(p.forbiddenBehaviors) : []),
    ],
    rawPersonalityAnswers: p?.rawPersonalityAnswers ?? {},
    creativeIntelligenceSummary: resolveCreativeIntelligenceReadiness(profile),
  };
}

export function classifyEvidenceConfidence(params: {
  directFounder: boolean;
  carryForward: boolean;
  multipleSignals: boolean;
  synthesizedOnly: boolean;
}): CharacterEvidenceConfidence {
  if (params.directFounder) return 'DIRECT_FOUNDER_EVIDENCE';
  if (params.carryForward) return 'VALIDATED_CARRY_FORWARD';
  if (params.multipleSignals) return 'MULTIPLE_SUPPORTING_SIGNALS';
  if (params.synthesizedOnly) return 'SYNTHESIZED_LOW_CONFIDENCE';
  return 'MODEL_INFERENCE_ONLY';
}

export function modelInferenceOnlyCannotSatisfyCritical(confidence: CharacterEvidenceConfidence): boolean {
  return confidence === 'MODEL_INFERENCE_ONLY';
}
