/**
 * Builder experience profile synthesis — from experience answers + inherited Identity lore.
 */

import type { BrandLoreField, BuilderExperienceProfile } from '../../../shared/site00-brand-lore/types.js';
import type { BrandPersonalityProfile } from '../../../shared/site00-brand-lore/personalityTypes.js';
import { isSkippedAnswer } from '../../../shared/site00-brand-lore/adaptivity.js';

function nowIso(): string {
  return new Date().toISOString();
}

export function field<T>(
  value: T,
  sourceAnswerIds: string[],
): BrandLoreField<T> {
  const hasContent =
    value !== null &&
    value !== undefined &&
    !(typeof value === 'string' && !String(value).trim()) &&
    !(Array.isArray(value) && value.length === 0);

  return {
    value,
    classification: 'RAW_FOUNDER_INPUT',
    confidence: hasContent ? 'HIGH' : 'NONE',
    sourceAnswerIds,
    sourceType: 'BUILDER_EXPERIENCE',
    founderConfirmationState: 'PENDING',
    updatedAt: nowIso(),
  };
}

function str(answers: Record<string, string | string[]>, id: string): string | null {
  const v = answers[id];
  if (isSkippedAnswer(v)) return null;
  if (typeof v === 'string') return v.trim() || null;
  return null;
}

function arr(answers: Record<string, string | string[]>, id: string): string[] {
  const v = answers[id];
  if (isSkippedAnswer(v)) return [];
  if (Array.isArray(v)) return v.filter((x) => typeof x === 'string');
  if (typeof v === 'string' && v.trim()) return [v.trim()];
  return [];
}

export function synthesizeBuilderExperienceProfile(
  experienceAnswers: Record<string, string | string[]>,
  inheritedLoreSnapshot: Partial<import('../../../shared/site00-brand-lore/types.js').BrandLoreProfile> | null,
  personalityTranslationAnswers?: Record<string, string | string[]>,
): BuilderExperienceProfile {
  const inheritedPersonality = inheritedLoreSnapshot?.brandPersonality ?? null;
  const personalityTranslation =
    personalityTranslationAnswers && Object.keys(personalityTranslationAnswers).length
      ? synthesizePersonalityTranslationProfile(personalityTranslationAnswers, inheritedPersonality)
      : null;

  return {
    primaryEntryBehavior: field(str(experienceAnswers, 'arrival'), ['arrival']),
    digitalMetaphor: field(str(experienceAnswers, 'digital-metaphor'), ['digital-metaphor']),
    navigationBehavior: field(str(experienceAnswers, 'movement'), ['movement']),
    dynamicSystemPriorities: field(arr(experienceAnswers, 'alive'), ['alive']),
    digitalAntiPatterns: field(str(experienceAnswers, 'anti-website'), ['anti-website']),
    signatureExperiences: field(arr(experienceAnswers, 'signature-moment'), ['signature-moment']),
    physicalExtensions: field(arr(experienceAnswers, 'physical'), ['physical']),
    persistentUserState: field(arr(experienceAnswers, 'persistence'), ['persistence']),
    repeatVisitBehavior: field(str(experienceAnswers, 'return'), ['return']),
    experienceDepth: field(str(experienceAnswers, 'depth'), ['depth']),
    signatureDigitalAdvantage: field(str(experienceAnswers, 'advantage'), ['advantage']),
    rawExperienceAnswers: { ...experienceAnswers },
    inheritedLoreSnapshot,
    inheritedBrandPersonalitySnapshot: inheritedPersonality,
    personalityTranslation,
  };
}

export function synthesizePersonalityTranslationProfile(
  answers: Record<string, string | string[]>,
  inheritedPersonality?: BrandPersonalityProfile | null,
): import('../../../shared/site00-brand-lore/personalityTypes.js').BuilderPersonalityTranslationProfile {
  return {
    digitalPresenceBehavior: field(arr(answers, 'digital-presence'), ['digital-presence']),
    uiAttitudeBehavior: field(arr(answers, 'ui-attitude'), ['ui-attitude']),
    microcopyPersonalityLevel: field(str(answers, 'microcopy-level'), ['microcopy-level']),
    errorStateBehavior: field(arr(answers, 'error-state'), ['error-state']),
    motionPersonality: field(arr(answers, 'motion-personality'), ['motion-personality']),
    interactionConfidence: field(str(answers, 'interaction-confidence'), ['interaction-confidence']),
    repeatVisitPersonality: field(str(answers, 'repeat-visit-personality'), ['repeat-visit-personality']),
    personalitySignatureInteraction: field(str(answers, 'personality-signature'), ['personality-signature']),
    rawPersonalityTranslationAnswers: { ...answers },
    inheritedBrandPersonalitySnapshot: inheritedPersonality ?? null,
  };
}
