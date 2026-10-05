/**
 * P0.5E.4 — Visual hypothesis review + style reasoning.
 */

import type { CharacterStyleReasoning, VisualHypothesisReview } from './types.js';

export function buildVisualHypothesisReview(hypothesis: string): VisualHypothesisReview {
  return {
    hypothesisId: hypothesis.slice(0, 40).replace(/\s+/g, '-').toLowerCase(),
    hypothesis,
    judgment: null,
    note: null,
    identityAuthority: 'NONE',
    isCastingCanon: false,
  };
}

export function northStarRemainsNonCanon(review: VisualHypothesisReview): boolean {
  return review.identityAuthority === 'NONE' && review.isCastingCanon === false;
}

export function buildStyleReasoning(proposedBehavior: string, why: string): CharacterStyleReasoning {
  return {
    reasoningId: `style-${proposedBehavior.slice(0, 20)}`,
    proposedBehavior,
    whyWouldSheWearThis: why,
    reasons: ['PERSONAL_TASTE', 'COMFORT'],
    costumeDisguisedAsPersonalStyle: false,
    limeUniformRequired: false,
  };
}

export function limeWardrobeUniformNotRequired(reasoning: CharacterStyleReasoning): boolean {
  return reasoning.limeUniformRequired === false;
}

export function styleRequiresBehavioralReasoning(reasoning: CharacterStyleReasoning): boolean {
  return Boolean(reasoning.whyWouldSheWearThis.trim());
}
