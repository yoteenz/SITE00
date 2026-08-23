/**
 * Identity discovery diagnosis from public operational answers.
 */

import type { IdentityNeedClassification, ProjectDiscoveryAnswer } from './types.js';
import { DISCOVERY_PROVENANCE } from './types.js';

export function wrapDiscoveryAnswers(
  answers: Record<string, string | string[]>,
  questionIds: string[],
): ProjectDiscoveryAnswer[] {
  const now = new Date().toISOString();
  return questionIds
    .filter((id) => answers[id] !== undefined && answers[id] !== '')
    .map((questionId) => ({
      questionId,
      value: answers[questionId]!,
      provenance: DISCOVERY_PROVENANCE,
      capturedAt: now,
    }));
}

export function diagnoseIdentityNeed(params: {
  stateSlug: string;
  answers: Record<string, string | string[]>;
}): IdentityNeedClassification {
  const { stateSlug, answers } = params;

  if (stateSlug === 'starting-at-zero') {
    return 'IDENTITY_FOUNDATION_RECOMMENDED';
  }

  if (stateSlug === 'some-pieces-exist') {
    const diagnostic = String(answers['cohesion-diagnostic'] ?? '');
    if (diagnostic === 'scattered-pieces' || diagnostic === 'missing-key-pieces') {
      return 'IDENTITY_DEEP_DEVELOPMENT_RECOMMENDED';
    }
    const gaps = answers['gaps'];
    const gapList = Array.isArray(gaps) ? gaps : gaps ? [gaps] : [];
    if (gapList.length >= 3) return 'IDENTITY_DEEP_DEVELOPMENT_RECOMMENDED';
    return 'IDENTITY_REFINEMENT_RECOMMENDED';
  }

  if (stateSlug === 'ready-for-evolution') {
    return 'IDENTITY_REFINEMENT_RECOMMENDED';
  }

  if (stateSlug === 'build-ready') {
    const services = answers['services'];
    const serviceList = Array.isArray(services) ? services : services ? [services] : [];
    if (serviceList.some((s) => String(s).includes('identity') || String(s).includes('brand'))) {
      return 'IDENTITY_REFINEMENT_RECOMMENDED';
    }
    return 'IDENTITY_NOT_REQUIRED';
  }

  return 'IDENTITY_REFINEMENT_RECOMMENDED';
}

export function discoveryPreferenceCannotBecomeBrandCanon(): true {
  return true;
}

export function discoveryPreferenceCannotBecomeBrandPersonality(): true {
  return true;
}
