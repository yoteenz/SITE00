/**
 * P0.5E.3 — Casting readiness gate — no generation before readiness.
 */

import { randomId } from './id.js';
import type {
  EmbodiedCharacterCastingReadiness,
  EmbodiedCharacterHumanityEvaluation,
} from './types.js';

export function evaluateCastingReadiness(params: {
  psychologyComplete: boolean;
  contradictionsComplete: boolean;
  voiceComplete: boolean;
  bookRelationshipComplete: boolean;
  behaviorComplete: boolean;
  cameraComplete: boolean;
  styleImplicationsPresent: boolean;
  humanity: EmbodiedCharacterHumanityEvaluation;
  founderReviewRequired?: boolean;
}): EmbodiedCharacterCastingReadiness {
  const allComplete =
    params.psychologyComplete &&
    params.contradictionsComplete &&
    params.voiceComplete &&
    params.bookRelationshipComplete &&
    params.behaviorComplete &&
    params.cameraComplete &&
    params.styleImplicationsPresent;

  let state: EmbodiedCharacterCastingReadiness['state'] = 'NOT_READY';
  if (!params.humanity.passes) state = 'CHARACTER_INSUFFICIENT';
  else if (params.founderReviewRequired) state = 'FOUNDER_REVIEW_REQUIRED';
  else if (allComplete && params.humanity.existedBeforeCamera) state = 'READY_FOR_CASTING_EXPLORATION';
  else if (params.humanity.contradictionPresent) state = 'FOUNDER_PROCEED_WITH_PARTIAL_EVIDENCE';

  return {
    readinessId: randomId('cast'),
    state,
    psychologyComplete: params.psychologyComplete,
    contradictionsComplete: params.contradictionsComplete,
    voiceComplete: params.voiceComplete,
    bookRelationshipComplete: params.bookRelationshipComplete,
    behaviorComplete: params.behaviorComplete,
    cameraComplete: params.cameraComplete,
    styleImplicationsPresent: params.styleImplicationsPresent,
    castingCandidatesMustShareOneCharacter: true,
    finalFaceSelected: false,
    generationPerformed: false,
  };
}

export function castingCannotOccurBeforeReadiness(readiness: EmbodiedCharacterCastingReadiness): boolean {
  return readiness.state !== 'READY_FOR_CASTING_EXPLORATION' && readiness.finalFaceSelected === false;
}

export function castingCandidatesMustShareOneCharacter(): true {
  return true;
}
