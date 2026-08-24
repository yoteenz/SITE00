/**
 * P0.5E.3 — Humanity evaluation — did she exist before the camera?
 */

import { randomId } from './id.js';
import type {
  EmbodiedCharacterContradictionSystem,
  EmbodiedCharacterEmotionalRange,
  EmbodiedCharacterEverydayLife,
  EmbodiedCharacterHumanityEvaluation,
  EmbodiedCharacterPsychology,
} from './types.js';
import { contradictionsMeetMinimumRequirements } from './contradictionSystem.js';
import { emotionalRangeRequired } from './emotionalRange.js';

export function evaluateEmbodiedCharacterHumanity(params: {
  psychology: EmbodiedCharacterPsychology;
  contradictions: EmbodiedCharacterContradictionSystem;
  emotionalRange: EmbodiedCharacterEmotionalRange;
  everydayLife: EmbodiedCharacterEverydayLife;
}): EmbodiedCharacterHumanityEvaluation {
  const contradictionPresent = contradictionsMeetMinimumRequirements(params.contradictions);
  const emotionalRangeAdequate = emotionalRangeRequired(params.emotionalRange);
  const imperfectionPresent =
    params.contradictions.behaviorsSheRegrets.length >= 2 &&
    params.contradictions.recurringBlindSpots.length >= 2;
  const privateLifePlausible =
    params.everydayLife.phoneBehavior !== 'TBD — discovery' ||
    params.everydayLife.guiltyPleasures.length > 0;
  const psychologicalCoherence = params.psychology.whatSheNotices.length > 0 ? 0.7 : 0.3;
  const existedBeforeCamera = contradictionPresent && emotionalRangeAdequate && privateLifePlausible;
  const passes = existedBeforeCamera && imperfectionPresent;

  return {
    evaluationId: randomId('hum'),
    psychologicalCoherence,
    contradictionPresent,
    emotionalRangeAdequate,
    imperfectionPresent,
    existedBeforeCamera,
    passes,
    failureReason: passes ? null : 'CHARACTER_INSUFFICIENT — discovery evidence incomplete',
  };
}

export function characterInsufficient(evaluation: EmbodiedCharacterHumanityEvaluation): boolean {
  return !evaluation.passes;
}
