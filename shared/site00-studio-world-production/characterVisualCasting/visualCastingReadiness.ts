/**
 * P0.5E.4C — Visual casting readiness evaluation.
 */

import { randomUUID } from 'node:crypto';
import { DEFAULT_CASTING_CANDIDATE_COUNT } from './constants.js';
import type {
  CharacterCastingAuthority,
  CharacterTruthSnapshot,
  VisualCastingReadinessEvaluation,
} from './types.js';
import { recommendStillImageCastingProvider } from './providerSelection.js';

export function evaluateVisualCastingReadiness(params: {
  founderIKnowHerConfirmed: boolean;
  truthSnapshot: CharacterTruthSnapshot | null;
  castingAuthority: CharacterCastingAuthority | null;
  blockingUnresolvedContradiction?: boolean;
  falConfigured: boolean;
}): VisualCastingReadinessEvaluation {
  const blockers: string[] = [];
  if (!params.founderIKnowHerConfirmed) blockers.push('FOUNDER_I_KNOW_HER_NOT_CONFIRMED');
  if (!params.truthSnapshot) blockers.push('CHARACTER_TRUTH_SNAPSHOT_MISSING');
  if (params.truthSnapshot && !params.truthSnapshot.lockedForCasting) {
    blockers.push('CHARACTER_TRUTH_NOT_LOCKED');
  }
  if (params.blockingUnresolvedContradiction) {
    blockers.push('BLOCKING_UNRESOLVED_CONTRADICTION');
  }
  if (!params.truthSnapshot?.founderConfirmedTruths.length) {
    blockers.push('MINIMUM_FOUNDER_TRUTH_COVERAGE');
  }

  const providerRec = recommendStillImageCastingProvider(params.falConfigured);
  if (providerRec.readiness === 'CASTING_BLOCKED_PROVIDER') {
    blockers.push('CASTING_BLOCKED_PROVIDER');
  }

  const ready = blockers.length === 0;

  return {
    evaluationId: randomUUID(),
    ready,
    visualCastingReady: ready,
    blockers,
    providerReadiness: providerRec.readiness,
    estimatedCandidateCount: DEFAULT_CASTING_CANDIDATE_COUNT,
    estimatedCostUsd: providerRec.estimatedCostUsd,
    provider: providerRec.provider,
    model: providerRec.model,
  };
}
