/**
 * Brand Personality Intelligence — behavioral canon upstream of Creative Direction.
 *
 * Nested inside BrandLoreProfile (same JSONB envelope) — not a parallel table.
 * Answers WHAT the brand does when it speaks, not just what world it believes in.
 */

import type { BrandLoreField, FounderConfirmationState, LoreFieldClassification } from './types.js';

export type PersonalityReadinessDomain =
  | 'SOCIAL_INSTINCT'
  | 'CONFIDENCE_BEHAVIOR'
  | 'VERBAL_PERSONALITY'
  | 'WIT_BEHAVIOR'
  | 'HUMANITY'
  | 'DISAGREEMENT_BEHAVIOR'
  | 'PERSONALITY_TENSION'
  | 'ANTI_PERSONALITY';

export type BrandPersonalityReadinessState =
  | 'PERSONALITY_INCOMPLETE'
  | 'PERSONALITY_PARTIAL'
  | 'PERSONALITY_READY';

/** How upstream personality evidence was classified — downstream creative output never auto-promotes. */
export type PersonalityEvidenceClassification =
  | 'FOUNDER_CONFIRMED'
  | 'FOUNDER_INPUT'
  | 'LEGACY_CANON'
  | 'CONTENT_BRAIN'
  | 'INFERRED_FROM_APPROVED_OUTPUT'
  | 'PROPOSED_CREATIVE_OUTPUT';

export type BrandPersonalityProfile = {
  /** Monotonic within the parent BrandLoreProfile save cycle. */
  profileVersion: number;

  socialInstinct: BrandLoreField<string[]>;
  confidenceBehavior: BrandLoreField<string[]>;
  witBehavior: BrandLoreField<string[]>;
  humanityBehavior: BrandLoreField<string[]>;
  disagreementBehavior: BrandLoreField<string[]>;
  edgeBehavior: BrandLoreField<string | null>;
  charmBehavior: BrandLoreField<string[]>;
  observationalBehavior: BrandLoreField<string | null>;
  memorabilityBehavior: BrandLoreField<string | null>;
  emotionalRange: BrandLoreField<string[]>;
  restraintBehavior: BrandLoreField<string[]>;
  /** Personality-specific contradictions — lore creativeTensions may also satisfy PERSONALITY_TENSION. */
  personalityTensions: BrandLoreField<string[]>;
  socialReactionBehavior: BrandLoreField<string[]>;
  selfCorrectionBehavior: BrandLoreField<string[]>;
  antiPersonality: BrandLoreField<string | null>;

  /** Derived signature behaviors — synthesized from answers, never invented without source. */
  signatureMoves: BrandLoreField<string[]>;
  forbiddenBehaviors: BrandLoreField<string[]>;

  rawPersonalityAnswers: Record<string, string | string[]>;

  personalityReadinessState: BrandPersonalityReadinessState;
  personalityMissingDomains: PersonalityReadinessDomain[];

  createdAt: string;
  updatedAt: string;
};

export type BuilderPersonalityTranslationProfile = {
  digitalPresenceBehavior: BrandLoreField<string[]>;
  uiAttitudeBehavior: BrandLoreField<string[]>;
  microcopyPersonalityLevel: BrandLoreField<string | null>;
  errorStateBehavior: BrandLoreField<string[]>;
  motionPersonality: BrandLoreField<string[]>;
  interactionConfidence: BrandLoreField<string | null>;
  repeatVisitPersonality: BrandLoreField<string | null>;
  personalitySignatureInteraction: BrandLoreField<string | null>;
  rawPersonalityTranslationAnswers: Record<string, string | string[]>;
  /** Snapshot of Identity personality at Builder start — translation only, not second canon. */
  inheritedBrandPersonalitySnapshot: Partial<BrandPersonalityProfile> | null;
};

export const PERSONALITY_FIELD_KEYS = [
  'socialInstinct',
  'confidenceBehavior',
  'witBehavior',
  'humanityBehavior',
  'disagreementBehavior',
  'edgeBehavior',
  'charmBehavior',
  'observationalBehavior',
  'memorabilityBehavior',
  'emotionalRange',
  'restraintBehavior',
  'personalityTensions',
  'socialReactionBehavior',
  'selfCorrectionBehavior',
  'antiPersonality',
  'signatureMoves',
  'forbiddenBehaviors',
] as const satisfies ReadonlyArray<keyof BrandPersonalityProfile>;

export type PersonalityFieldKey = (typeof PERSONALITY_FIELD_KEYS)[number];

export const PERSONALITY_STEP_TO_DOMAIN: Record<string, string> = {
  'social-instinct': 'SOCIAL_INSTINCT',
  confidence: 'CONFIDENCE_BEHAVIOR',
  humor: 'WIT_BEHAVIOR',
  humanity: 'HUMANITY',
  disagreement: 'DISAGREEMENT_BEHAVIOR',
  edge: 'EDGE',
  charm: 'CHARM',
  observation: 'OBSERVATION',
  memorability: 'MEMORABILITY',
  'emotional-range': 'EMOTIONAL_RANGE',
  restraint: 'RESTRAINT',
  'personality-tension': 'PERSONALITY_TENSION',
  'social-reaction': 'SOCIAL_REACTION',
  'self-correction': 'SELF_CORRECTION',
  'anti-personality': 'ANTI_PERSONALITY',
};

export type PersonalityLineageEntry = {
  upstreamField: PersonalityFieldKey | 'creativeTensions' | 'antiLanguage';
  upstreamValue: string;
  derivedBehavior: string;
  classification: PersonalityEvidenceClassification;
};

export function emptyPersonalityField<T>(value: T): BrandLoreField<T> {
  return {
    value,
    classification: 'UNKNOWN' as LoreFieldClassification,
    confidence: 'NONE',
    sourceAnswerIds: [],
    sourceType: 'UNKNOWN',
    founderConfirmationState: 'NOT_APPLICABLE' as FounderConfirmationState,
    updatedAt: new Date().toISOString(),
  };
}
