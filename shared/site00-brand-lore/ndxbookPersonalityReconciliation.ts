/**
 * NDX BOOK — reconcile known upstream personality evidence without promoting downstream creative output.
 *
 * Classifications: LEGACY_CANON + CONTENT_BRAIN only — never PROPOSED_CREATIVE_OUTPUT from CES/DES.
 */

import type { BrandPersonalityProfile } from './personalityTypes.js';
import { synthesizeBrandPersonalityProfile } from './personalitySynthesis.js';
import { evaluateBrandPersonalityReadiness } from './personalityReadiness.js';
import type { BrandLoreProfile } from './types.js';

/** Known NDX BOOK personality traits from founder calibration / brand canon — not from pilot output. */
const NDXBOOK_KNOWN_PERSONALITY_ANSWERS: Record<string, string | string[]> = {
  'social-instinct': ['notices-missed', 'uncomfortable-question', 'says-thinking'],
  confidence: ['receipts', 'curiosity', 'room-to-be-wrong'],
  humor: ['dry-observation', 'contradiction', 'unexpected-specificity', 'not-trying-funny'],
  humanity: ['unfiltered', 'candid', 'vulnerable-small-doses'],
  disagreement: ['shows-evidence', 'better-question', 'reframes', 'changes-mind'],
  edge: 'sharp',
  charm: ['wit', 'honesty', 'intelligence', 'relatability', 'usefulness'],
  observation: 'The gap between what financial copy claims and what the receipts show.',
  memorability: 'A correction that changes what the headline meant.',
  'emotional-range': ['skeptical', 'curious', 'amused', 'serious'],
  restraint: ['humor-cheapens', 'not-our-subject', 'silence-stronger'],
  'personality-tension': ['intelligent-playful', 'confident-self-aware', 'warm-blunt'],
  'social-reaction': ['bring-receipts', 'challenge'],
  'self-correction': ['publicly-correct', 'update-record', 'explain-changed'],
  'anti-personality': 'Try-hard slang, corporate inspiration, fake luxury, performative relatability, mean humor, generic finance voice.',
};

export type NdxbookPersonalityReconciliationReport = {
  orgId: string;
  knownDomains: string[];
  unknownDomains: string[];
  sources: Array<{ domain: string; classification: string; source: string }>;
  personalityReadinessState: BrandPersonalityProfile['personalityReadinessState'];
  loreReadinessState: BrandLoreProfile['readinessState'] | null;
  dataMutations: string[];
};

export function buildNdxbookReconciledPersonality(
  prior?: BrandPersonalityProfile | null,
): BrandPersonalityProfile {
  return synthesizeBrandPersonalityProfile({
    personalityAnswers: { ...NDXBOOK_KNOWN_PERSONALITY_ANSWERS },
    prior,
  });
}

export function reconcileNdxbookPersonality(params: {
  orgId: string;
  loreProfile: BrandLoreProfile | null;
  existingPersonality?: BrandPersonalityProfile | null;
}): {
  personality: BrandPersonalityProfile;
  report: NdxbookPersonalityReconciliationReport;
} {
  const personality = buildNdxbookReconciledPersonality(params.existingPersonality);
  const readiness = evaluateBrandPersonalityReadiness(personality, params.loreProfile);

  const sources = [
    { domain: 'WIT_BEHAVIOR', classification: 'LEGACY_CANON', source: 'founder-calibration-ndxbook-voice' },
    { domain: 'CONFIDENCE_BEHAVIOR', classification: 'LEGACY_CANON', source: 'receipts/evidence-behavior' },
    { domain: 'DISAGREEMENT_BEHAVIOR', classification: 'LEGACY_CANON', source: 'live-correction-behavior' },
    { domain: 'ANTI_PERSONALITY', classification: 'CONTENT_BRAIN', source: 'voice.avoid-handoff' },
  ];

  return {
    personality: { ...personality, personalityReadinessState: readiness.state, personalityMissingDomains: readiness.missingDomains },
    report: {
      orgId: params.orgId,
      knownDomains: readiness.satisfiedDomains,
      unknownDomains: readiness.missingDomains,
      sources,
      personalityReadinessState: readiness.state,
      loreReadinessState: params.loreProfile?.readinessState ?? null,
      dataMutations: ['brandPersonality nested on BrandLoreProfile — reconciled, not re-intake'],
    },
  };
}

/** Downstream creative output must never silently become founder canon. */
export function isProposedCreativePersonalitySource(classification: string): boolean {
  return classification === 'PROPOSED_CREATIVE_OUTPUT' || classification === 'INFERRED_FROM_APPROVED_OUTPUT';
}
