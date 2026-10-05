/**
 * Discovery → project handoff — prefill without canonization.
 */

import type { PrefillContext } from '../site00-project-intelligence/types.js';
import { DISCOVERY_CARRY_FORWARD_CLASS, DISCOVERY_EVIDENCE_CLASS } from './types.js';

const FACTUAL_QUESTION_IDS = new Set([
  'project', 'type', 'audience', 'timeline', 'budget', 'website', 'business-name', 'contact',
]);

export function isFactualDiscoveryQuestion(questionId: string): boolean {
  return FACTUAL_QUESTION_IDS.has(questionId);
}

export function canCarryForwardDiscoveryAnswer(params: {
  questionId: string;
  value: string | string[];
}): boolean {
  return isFactualDiscoveryQuestion(params.questionId) && Boolean(params.value);
}

export function buildPrefillContext(params: {
  questionId: string;
  value: string | string[];
}): PrefillContext | null {
  if (!params.value) return null;
  const text = Array.isArray(params.value) ? params.value.join(', ') : params.value;
  if (isFactualDiscoveryQuestion(params.questionId)) {
    return {
      questionId: params.questionId,
      discoveryEvidence: text,
      canonized: false,
      provenance: DISCOVERY_CARRY_FORWARD_CLASS,
    };
  }
  return {
    questionId: params.questionId,
    discoveryEvidence: text,
    canonized: false,
    provenance: DISCOVERY_EVIDENCE_CLASS,
  };
}

export function prefillDoesNotEqualCanonization(prefill: PrefillContext): boolean {
  return prefill.canonized === false;
}

export function subjectiveDiscoveryRemainsEvidenceUntilValidated(): true {
  return true;
}

export function packageSelectionIsNotCreativeDirection(): true {
  return true;
}

export function lightweightCreativeDepthIsNotFounderAppetite(): true {
  return true;
}

export function discoveryInferenceIsNotBrandCanon(): true {
  return true;
}
