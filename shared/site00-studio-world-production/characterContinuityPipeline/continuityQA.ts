/**
 * P0.5E.5 — Continuity QA — identity vs behavior fidelity.
 */

import { randomUUID } from 'node:crypto';
import type {
  CharacterBehaviorFidelityEvaluation,
  CharacterContinuityEvaluation,
  CharacterVideoContinuityEvaluation,
  ContinuityQaResult,
  IdentityFidelityEvaluation,
} from './types.js';

export function evaluateIdentityFidelity(params: {
  faceMatch?: ContinuityQaResult;
  hasApprovedReferences: boolean;
}): IdentityFidelityEvaluation {
  const face = params.faceMatch ?? (params.hasApprovedReferences ? 'FOUNDER_REVIEW_REQUIRED' : 'FAIL_FACE_DRIFT');
  return {
    evaluationId: randomUUID(),
    faceMatch: face,
    skinContinuity: face === 'PASS' ? 'PASS' : 'FOUNDER_REVIEW_REQUIRED',
    ageContinuity: 'FOUNDER_REVIEW_REQUIRED',
    bodyContinuity: 'FOUNDER_REVIEW_REQUIRED',
    passes: face === 'PASS' || face === 'PASS_WITH_MINOR_VARIATION',
  };
}

export function evaluateBehaviorFidelity(params: {
  gesture?: ContinuityQaResult;
}): CharacterBehaviorFidelityEvaluation {
  const gesture = params.gesture ?? 'FOUNDER_REVIEW_REQUIRED';
  return {
    evaluationId: randomUUID(),
    gestureFit: gesture,
    movementFit: 'FOUNDER_REVIEW_REQUIRED',
    cameraRelationship: 'FOUNDER_REVIEW_REQUIRED',
    expressionFit: 'FOUNDER_REVIEW_REQUIRED',
    passes: gesture === 'PASS',
  };
}

export function evaluateCharacterContinuity(params: {
  identity: IdentityFidelityEvaluation;
  behavior: CharacterBehaviorFidelityEvaluation;
}): CharacterContinuityEvaluation {
  const identityPass = params.identity.passes;
  const behaviorPass = params.behavior.passes;
  let overall: ContinuityQaResult = 'FOUNDER_REVIEW_REQUIRED';
  if (identityPass && behaviorPass) overall = 'PASS';
  else if (identityPass && !behaviorPass) overall = 'FAIL_GESTURE_OUT_OF_CHARACTER';
  else if (!identityPass && behaviorPass) overall = 'FAIL_FACE_DRIFT';

  return {
    evaluationId: randomUUID(),
    identityFidelity: params.identity,
    behaviorFidelity: params.behavior,
    overallResult: overall,
    influencerCollapseRisk: false,
    genericAiHostRisk: false,
    founderReviewRequired: overall === 'FOUNDER_REVIEW_REQUIRED',
  };
}

export function identityAndBehaviorEvaluatedSeparately(evaluation: CharacterContinuityEvaluation): boolean {
  return Boolean(evaluation.identityFidelity) && Boolean(evaluation.behaviorFidelity);
}

export function evaluateVideoContinuity(): CharacterVideoContinuityEvaluation {
  return {
    evaluationId: randomUUID(),
    identityPersistence: 'FOUNDER_REVIEW_REQUIRED',
    faceStability: 'FOUNDER_REVIEW_REQUIRED',
    hairContinuity: 'FOUNDER_REVIEW_REQUIRED',
    wardrobeContinuity: 'FOUNDER_REVIEW_REQUIRED',
    frameDriftDetected: false,
    passes: false,
  };
}

export function mayPassIdentityFailBehavior(): boolean {
  return true;
}

export function mayPassBehaviorFailIdentity(): boolean {
  return true;
}
