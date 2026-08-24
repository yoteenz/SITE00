/**
 * Forensic inventory of existing post-purchase character evidence sources.
 */

import type { BrandLoreProfile } from '../types.js';
import { buildContentBrainPersonalityInput } from '../contentBrainPersonalityBridge.js';
import { resolveCreativeIntelligenceReadiness } from '../creativeIntelligenceReadiness.js';
import type { BrandCharacterDeepeningAnswer, CharacterEvidenceConfidence, CharacterReadinessDomain } from './types.js';

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

function inventoryKeysForDeepeningDomain(domain: CharacterReadinessDomain): (keyof CharacterEvidenceInventory)[] {
  switch (domain) {
    case 'WORLDVIEW_ORIENTATION':
      return ['brandLore', 'businessOffering'];
    case 'INTERNAL_TENSION':
      return ['personalityTension'];
    case 'INTELLECTUAL_BEHAVIOR':
      return ['brandLore', 'brandPersonality'];
    case 'SOCIAL_BEHAVIOR':
      return ['socialInstinct', 'confidenceBehavior'];
    case 'AUDIENCE_RELATIONSHIP':
      return ['audienceTruth'];
    case 'HUMOR_WIT':
      return ['humorWit'];
    case 'CULTURAL_INTELLIGENCE':
      return ['culturalReferences', 'culturalSpecificity'];
    case 'EMOTIONAL_RANGE':
      return ['emotionalRange', 'humanity'];
    case 'LANGUAGE_BEHAVIOR':
      return ['founderLanguage'];
    case 'TASTE_JUDGMENT':
      return ['visualReferences', 'culturalReferences'];
    case 'ARTIFACT_MAKER_BEHAVIOR':
      return ['visualReferences'];
    case 'HARD_BOUNDARIES':
      return ['hardBoundaries', 'antiDirection'];
    default:
      return ['founderLanguage'];
  }
}

/** Merge founder deepening answers into inventory so re-evaluation reflects new evidence. */
export function applyDeepeningAnswersToInventory(
  inventory: CharacterEvidenceInventory,
  answers: BrandCharacterDeepeningAnswer[],
): CharacterEvidenceInventory {
  if (answers.length === 0) return inventory;
  const merged: CharacterEvidenceInventory = {
    ...inventory,
    brandLore: [...inventory.brandLore],
    brandPersonality: [...inventory.brandPersonality],
    businessOffering: [...inventory.businessOffering],
    audienceTruth: [...inventory.audienceTruth],
    founderLanguage: [...inventory.founderLanguage],
    antiDirection: [...inventory.antiDirection],
    culturalReferences: [...inventory.culturalReferences],
    visualReferences: [...inventory.visualReferences],
    humorWit: [...inventory.humorWit],
    socialInstinct: [...inventory.socialInstinct],
    confidenceBehavior: [...inventory.confidenceBehavior],
    humanity: [...inventory.humanity],
    personalityTension: [...inventory.personalityTension],
    emotionalRange: [...inventory.emotionalRange],
    culturalSpecificity: [...inventory.culturalSpecificity],
    hardBoundaries: [...inventory.hardBoundaries],
  };

  for (const answer of answers) {
    const text = answer.rawAnswer.trim();
    if (!text) continue;
    merged.founderLanguage.push(text);
    for (const key of inventoryKeysForDeepeningDomain(answer.domain)) {
      const bucket = merged[key];
      if (Array.isArray(bucket)) (bucket as string[]).push(text);
    }
  }

  return merged;
}

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
