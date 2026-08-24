/**
 * Vitest fixtures — rich brand lore profiles for readiness + formation gate tests.
 */

import { randomUUID } from 'node:crypto';
import type { BrandLoreField, BrandLoreProfile } from '../types.js';
import { buildNdxbookReconciledProfile } from '../../../api/_lib/site00BrandLore/ndxbookReconciliation.js';
import { reconcileNdxbookPersonality } from '../ndxbookPersonalityReconciliation.js';
import { synthesizeBrandPersonalityProfile } from '../personalitySynthesis.js';

function confirmedField<T>(value: T): BrandLoreField<T> {
  return {
    value,
    classification: 'FOUNDER_CONFIRMED',
    confidence: 'HIGH',
    sourceAnswerIds: ['vitest'],
    sourceType: 'IDENTITY_LORE',
    founderConfirmationState: 'CONFIRMED',
    updatedAt: new Date().toISOString(),
  };
}

/** NDXBOOK-shaped profile with enough founder-grounded evidence for readiness evaluation. */
export function buildVitestRichBrandLoreProfile(orgId = 'ndxbook-org'): BrandLoreProfile {
  const base = buildNdxbookReconciledProfile(orgId);
  const { personality } = reconcileNdxbookPersonality({
    orgId,
    loreProfile: base,
    existingPersonality: base.brandPersonality ?? null,
  });

  return {
    ...base,
    readinessState: 'CORE_DIRECTION_READY',
    readinessMissingDomains: [],
    brandBelief: confirmedField(
      'Financial copy often claims certainty the receipts cannot support — we exist to close that gap.',
    ),
    brandWorld: confirmedField('A room where the obvious headline gets corrected by what actually happened.'),
    audienceRelationship: confirmedField([
      'People who are tired of being talked down to by finance brands that perform confidence without evidence.',
    ]),
    coreObsessions: confirmedField('The gap between what financial copy claims and what the receipts show.'),
    emotionalPromise: confirmedField(['skeptical clarity', 'useful correction', 'unexpected specificity']),
    creativeTensions: confirmedField(['intelligent and playful', 'confident and self-aware', 'warm and blunt']),
    referenceLineage: confirmedField('Receipts culture, correction memes, investigative personal finance creators'),
    currentReferenceSignals: confirmedField('Dry observation, contradiction, unexpected specificity in money talk'),
    culturalOpposition: confirmedField(['try-hard slang', 'corporate inspiration', 'fake luxury finance voice']),
    materialVocabulary: confirmedField(['annotated screenshots', 'highlighted receipts', 'crossed-out headlines']),
    authenticLanguageSamples: confirmedField([
      'That would make us roll our eyes because everybody already knows that.',
      'Show me the receipt before you tell me what it means.',
    ]),
    antiLanguage: confirmedField(['synergy', 'game-changer', 'unlock your potential']),
    creativeAntiPatterns: confirmedField(['performative relatability', 'mean humor', 'generic finance voice']),
    brandPersonality: personality,
  };
}

export function buildVitestInsufficientBrandLoreProfile(orgId = 'ndxbook-org'): BrandLoreProfile {
  const profile = buildVitestRichBrandLoreProfile(orgId);
  return {
    ...profile,
    readinessState: 'CORE_DIRECTION_READY',
    brandBelief: confirmedField(null),
    brandWorld: confirmedField(null),
    coreObsessions: confirmedField(null),
    audienceRelationship: confirmedField([]),
    referenceLineage: confirmedField(null),
    currentReferenceSignals: confirmedField(null),
    materialVocabulary: confirmedField([]),
    culturalOpposition: confirmedField([]),
    emotionalPromise: confirmedField([]),
    authenticLanguageSamples: confirmedField([]),
    creativeTensions: confirmedField([]),
    antiLanguage: confirmedField([]),
    creativeAntiPatterns: confirmedField([]),
    brandPersonality: profile.brandPersonality
      ? {
          ...profile.brandPersonality,
          personalityReadinessState: 'PERSONALITY_READY',
          witBehavior: confirmedField([]),
          socialInstinct: confirmedField([]),
          confidenceBehavior: confirmedField([]),
          humanityBehavior: confirmedField([]),
          disagreementBehavior: confirmedField([]),
          selfCorrectionBehavior: confirmedField([]),
          emotionalRange: confirmedField([]),
          forbiddenBehaviors: confirmedField([]),
          personalityTensions: confirmedField([]),
          antiPersonality: confirmedField(null),
          rawPersonalityAnswers: {},
        }
      : profile.brandPersonality,
  };
}

export function buildVitestThinBrandLoreProfile(orgId = 'vitest-thin'): BrandLoreProfile {
  const now = new Date().toISOString();
  const personality = synthesizeBrandPersonalityProfile({ personalityAnswers: {} });
  return {
    id: randomUUID(),
    organizationId: orgId,
    projectId: null,
    sourceIntakeId: 'vitest-thin',
    sourceIntakeType: 'IDENTITY',
    brandWorld: confirmedField(null),
    audienceRelationship: confirmedField([]),
    brandBelief: confirmedField(null),
    culturalOpposition: confirmedField([]),
    coreObsessions: confirmedField(null),
    emotionalPromise: confirmedField([]),
    creativeTensions: confirmedField([]),
    worldMetaphor: confirmedField(null),
    materialVocabulary: confirmedField([]),
    symbolicVocabulary: confirmedField([]),
    referenceLineage: confirmedField(null),
    currentReferenceSignals: confirmedField(null),
    authenticLanguageSamples: confirmedField([]),
    antiLanguage: confirmedField([]),
    socialSignal: confirmedField(null),
    audienceRitual: confirmedField([]),
    memoryGoal: confirmedField(null),
    desiredMythology: confirmedField(null),
    futureWorld: confirmedField(null),
    creativeAntiPatterns: confirmedField([]),
    signatureDeviceSeeds: confirmedField(null),
    rawLoreAnswers: {},
    referenceEvidence: [],
    contextClassification: 'CREATOR_BRAND',
    readinessState: 'CONTEXT_INCOMPLETE',
    readinessMissingDomains: ['AUDIENCE_RELATIONSHIP', 'WORLDVIEW'],
    profileVersion: 1,
    createdAt: now,
    updatedAt: now,
    brandPersonality: {
      ...personality,
      personalityReadinessState: 'PERSONALITY_INCOMPLETE',
      personalityMissingDomains: ['WIT_BEHAVIOR'],
    },
  };
}
