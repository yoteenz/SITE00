/**
 * P0.5E.4 — Casting readiness + founder recognition gate.
 */

import type {
  CharacterCastingReadinessEvaluation,
  CharacterForensicAudit,
  ExtendedHumanityEvaluation,
  FounderCharacterRecognitionEvaluation,
} from './types.js';
import { meaningfulContradictionCount } from './contradictionEngine.js';
import { genuineFlawCount } from './flawProfile.js';
import { intelligenceHasShape } from './intelligenceMap.js';
import type { CharacterContradiction, CharacterFlawProfile, CharacterIntelligenceMap } from './types.js';

export function evaluateFounderRecognitionGate(
  response: FounderCharacterRecognitionEvaluation['response'],
): boolean {
  return response === 'YES_I_KNOW_HER';
}

export function founderRecognitionCannotBeInferred(evaluation: FounderCharacterRecognitionEvaluation): boolean {
  return evaluation.inferred === false;
}

export function evaluateCharacterCastingReadiness(params: {
  forensicReport: CharacterForensicAudit;
  contradictions: CharacterContradiction[];
  flawProfile: CharacterFlawProfile;
  intelligenceMap: CharacterIntelligenceMap;
  privateHumanityEstablished: boolean;
  voiceDifferentiationEstablished: boolean;
  bookRelationshipEstablished: boolean;
  culturalBoundaryEstablished: boolean;
  visualHypothesesReviewed: boolean;
  humanityEvaluation: ExtendedHumanityEvaluation;
  founderRecognition: FounderCharacterRecognitionEvaluation;
}): CharacterCastingReadinessEvaluation {
  const blockingGates: string[] = [];
  const contradictionsConfirmed = meaningfulContradictionCount(params.contradictions) >= 3;
  const realFlawsConfirmed = genuineFlawCount(params.flawProfile) >= 2;
  const intelligenceUnevennessEstablished = intelligenceHasShape(params.intelligenceMap);
  const founderKnowsHer = evaluateFounderRecognitionGate(params.founderRecognition.response);

  if (!contradictionsConfirmed) blockingGates.push('meaningful_contradictions');
  if (!realFlawsConfirmed) blockingGates.push('real_flaws');
  if (!intelligenceUnevennessEstablished) blockingGates.push('intelligence_unevenness');
  if (!params.privateHumanityEstablished) blockingGates.push('private_humanity');
  if (!params.voiceDifferentiationEstablished) blockingGates.push('voice_differentiation');
  if (!params.bookRelationshipEstablished) blockingGates.push('book_relationship');
  if (!params.culturalBoundaryEstablished) blockingGates.push('cultural_boundary');
  if (!params.visualHypothesesReviewed) blockingGates.push('visual_hypotheses');
  if (!params.humanityEvaluation.passes) blockingGates.push('humanity_evaluation');
  if (!founderKnowsHer) blockingGates.push('founder_i_know_her');

  const founderDiscoveryComplete =
    params.forensicReport.founderConfirmedTraits >= 5 && params.forensicReport.unresolvedTraits >= 0;

  let state: CharacterCastingReadinessEvaluation['state'] = 'BLOCKED_FOUNDER_DISCOVERY_REQUIRED';
  if (founderDiscoveryComplete && params.humanityEvaluation.passes && !founderKnowsHer) {
    state = 'BLOCKED_FOUNDER_RECOGNITION';
  } else if (founderDiscoveryComplete && !params.humanityEvaluation.passes) {
    state = 'BLOCKED_HUMANITY_EVALUATION';
  } else if (
    founderDiscoveryComplete &&
    params.humanityEvaluation.passes &&
    founderKnowsHer &&
    blockingGates.length === 0
  ) {
    state = 'READY_FOR_CHARACTER_SYNTHESIS';
  }

  return {
    evaluationId: 'casting-readiness-p05e4',
    state,
    founderDiscoveryComplete,
    contradictionsConfirmed,
    realFlawsConfirmed,
    intelligenceUnevennessEstablished,
    privateHumanityEstablished: params.privateHumanityEstablished,
    voiceDifferentiationEstablished: params.voiceDifferentiationEstablished,
    bookRelationshipEstablished: params.bookRelationshipEstablished,
    culturalBoundaryEstablished: params.culturalBoundaryEstablished,
    visualHypothesesReviewed: params.visualHypothesesReviewed,
    humanityEvaluationPass: params.humanityEvaluation.passes,
    founderKnowsHer,
    readyForCharacterSynthesis: state === 'READY_FOR_CHARACTER_SYNTHESIS',
    readyForCastingExploration: false,
    blockingGates,
  };
}

export function castingBlockedBeforeFounderRecognition(
  readiness: CharacterCastingReadinessEvaluation,
): boolean {
  return !readiness.founderKnowsHer && readiness.state !== 'READY_FOR_CHARACTER_SYNTHESIS';
}
