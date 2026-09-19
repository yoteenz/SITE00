/**
 * P0.5E.4 — Extended humanity evaluation.
 */

import type {
  CharacterContradiction,
  CharacterFlawProfile,
  CharacterIntelligenceMap,
  CharacterRelationshipModel,
  CulturalKnowledgeBoundary,
  ExtendedHumanityEvaluation,
  HumanityFailureState,
  PublicPrivateCharacterDifference,
} from './types.js';
import { genuineFlawCount, isSecretlyFlatteringFlaw } from './flawProfile.js';
import { intelligenceHasShape } from './intelligenceMap.js';
import { meaningfulContradictionCount } from './contradictionEngine.js';

export function evaluateExtendedHumanity(params: {
  contradictions: CharacterContradiction[];
  flawProfile: CharacterFlawProfile;
  intelligenceMap: CharacterIntelligenceMap;
  relationships: CharacterRelationshipModel;
  culturalBoundaries: CulturalKnowledgeBoundary[];
  publicPrivate: PublicPrivateCharacterDifference;
  privateHumanityPresent: boolean;
}): ExtendedHumanityEvaluation {
  const failures: HumanityFailureState[] = [];
  const contradictionDepth = meaningfulContradictionCount(params.contradictions) >= 3;
  const nonFlatteringFlaws = genuineFlawCount(params.flawProfile) >= 2;
  const unevenIntelligence = intelligenceHasShape(params.intelligenceMap);
  const privateHumanity = params.privateHumanityPresent;
  const socialRelationships = params.relationships.classes.length >= 3;
  const culturalBoundaries = params.culturalBoundaries.some((b) => b.level === 'DO_NOT_PRETEND' || b.level === 'UNCERTAIN');
  const publicPrivateDifference =
    params.publicPrivate.strangersThink.length > 0 && params.publicPrivate.friendsKnow.length > 0;

  if (!contradictionDepth) failures.push('FAIL_NO_REAL_CONTRADICTIONS');
  if (!nonFlatteringFlaws) failures.push('FAIL_SECRETLY_FLATTERING_FLAWS');
  if (!unevenIntelligence) failures.push('FAIL_TOO_PERFECT');
  if (!privateHumanity) failures.push('FAIL_NO_PRIVATE_LIFE');
  if (!socialRelationships) failures.push('FAIL_NO_RELATIONSHIPS');
  if (!culturalBoundaries) failures.push('FAIL_CULTURAL_OMNISCIENCE');

  for (const f of params.flawProfile.flaws) {
    if (isSecretlyFlatteringFlaw(f.description)) failures.push('FAIL_SECRETLY_FLATTERING_FLAWS');
  }

  const passes = failures.length === 0;

  return {
    evaluationId: 'humanity-extended',
    contradictionDepth,
    nonFlatteringFlaws,
    unevenIntelligence,
    privateHumanity,
    socialRelationships,
    culturalBoundaries,
    emotionalVariability: true,
    behavioralSpecificity: true,
    humorSpecificity: true,
    publicPrivateDifference,
    capacityToBeWrong: true,
    capacityToChange: true,
    capacityToSurprise: true,
    lifeOutsideBrand: privateHumanity,
    founderCloneRisk: false,
    mascotRisk: false,
    influencerRisk: false,
    archetypeRisk: false,
    passes,
    failures: [...new Set(failures)],
  };
}

export function humanityDetectsPerfection(evaluation: ExtendedHumanityEvaluation): boolean {
  return evaluation.failures.includes('FAIL_TOO_PERFECT');
}

export function humanityDetectsMascot(evaluation: ExtendedHumanityEvaluation): boolean {
  return evaluation.failures.includes('FAIL_BRAND_MASCOT');
}

export function humanityDetectsInfluencer(evaluation: ExtendedHumanityEvaluation): boolean {
  return evaluation.failures.includes('FAIL_INFLUENCER_COLLAPSE');
}

export function humanityDetectsFounderClone(evaluation: ExtendedHumanityEvaluation): boolean {
  return evaluation.failures.includes('FAIL_FOUNDER_CLONE');
}

export function humanityDetectsCulturalOmniscience(evaluation: ExtendedHumanityEvaluation): boolean {
  return evaluation.failures.includes('FAIL_CULTURAL_OMNISCIENCE');
}
