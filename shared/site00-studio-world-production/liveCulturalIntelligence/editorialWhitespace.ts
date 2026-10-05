/**
 * Editorial whitespace + flex capacity.
 */

import type { EditorialWhitespaceEvaluation, EditorialWhitespaceOutcome, LiveWorldSignal } from './types.js';
import type { EditorialFlexCapacity } from './types.js';

export function evaluateEditorialWhitespace(params: {
  signal: LiveWorldSignal;
  distinctiveAngleExists?: boolean;
  newEvidenceExists?: boolean;
}): EditorialWhitespaceEvaluation {
  let outcome: EditorialWhitespaceOutcome = 'OPEN';
  if (params.signal.saturation > 0.85) {
    outcome = params.distinctiveAngleExists ? 'SATURATED_BUT_ANGLE_EXISTS' : 'SATURATED_NO_ADDITIONAL_VALUE';
  } else if (params.signal.velocity < 0.3) {
    outcome = 'TOO_EARLY';
  } else if (!params.newEvidenceExists && params.signal.sourceDiversity < 2) {
    outcome = 'WAIT_FOR_MORE_EVIDENCE';
  } else if (params.signal.saturation > 0.5) {
    outcome = 'NARROW';
  }

  return {
    signalId: params.signal.id,
    outcome,
    dominantNarrativeCount: Math.round(params.signal.saturation * 10),
    distinctiveAngleExists: params.distinctiveAngleExists ?? false,
    newEvidenceExists: params.newEvidenceExists ?? false,
    reasoning: outcome,
    evaluatedAt: new Date().toISOString(),
  };
}

export function saturatedWithoutAngleRejected(outcome: EditorialWhitespaceOutcome): boolean {
  return outcome === 'SATURATED_NO_ADDITIONAL_VALUE';
}

export function saturatedWithDistinctiveAngleMaySurvive(outcome: EditorialWhitespaceOutcome): boolean {
  return outcome === 'SATURATED_BUT_ANGLE_EXISTS' || outcome === 'OPEN';
}

export function buildDefaultFlexCapacity(params: {
  plannedPrimaryEvents?: number;
}): EditorialFlexCapacity {
  const planned = params.plannedPrimaryEvents ?? 21;
  const rapid = 2;
  const reserved = 3;
  const unallocated = Math.max(0, planned - reserved - rapid);
  return {
    plannedCapacity: planned,
    reservedCapacity: reserved,
    rapidResponseCapacity: rapid,
    unallocatedCapacity: unallocated,
    replacementRules: ['Empty flex slot is valid — do not fill with weak trends'],
  };
}

export function emptyCapacityDoesNotTriggerFiller(capacity: EditorialFlexCapacity): boolean {
  return capacity.unallocatedCapacity >= 0;
}
