/**
 * Derived effective readiness — considers lifecycle, dependency validity, verification.
 */

import type { InvalidationPolicy } from './dependencyTypes.js';

export const EFFECTIVE_READINESS_STATES = [
  'READY',
  'STALE',
  'REVIEW_REQUIRED',
  'BLOCKED',
  'NOT_READY',
  'NOT_EVALUATED',
] as const;

export type EffectiveReadinessState = (typeof EFFECTIVE_READINESS_STATES)[number];

export type LocalReadinessInput = {
  recordId: string;
  localLifecycleReady: boolean;
  localStatus?: string;
  dependencyInvalidated?: boolean;
  dependencyPolicy?: InvalidationPolicy | null;
  liveVerificationPassed?: boolean;
  requiredApprovalsMet?: boolean;
  blockedReason?: string | null;
};

export type EffectiveReadinessResult = {
  recordId: string;
  effectiveState: EffectiveReadinessState;
  localLifecycleReady: boolean;
  dependencyValid: boolean;
  liveVerificationPassed: boolean;
  requiredApprovalsMet: boolean;
  blockers: string[];
  downgradeReason: string | null;
};

const BLOCKING_POLICIES: InvalidationPolicy[] = [
  'HARD_INVALIDATION',
  'BLOCK_DOWNSTREAM_EXECUTION',
  'SUPERSEDE_REQUIRED',
];

const REVIEW_POLICIES: InvalidationPolicy[] = [
  'SOFT_REVIEW_REQUIRED',
  'EVIDENCE_STALE',
  'FOUNDER_REVIEW_REQUIRED',
  'REGENERATION_REQUIRED',
];

export function computeEffectiveReadiness(input: LocalReadinessInput): EffectiveReadinessResult {
  const blockers: string[] = [];
  const dependencyValid = !input.dependencyInvalidated;
  const liveVerificationPassed = input.liveVerificationPassed ?? true;
  const requiredApprovalsMet = input.requiredApprovalsMet ?? true;

  if (!input.localLifecycleReady) {
    blockers.push('Local lifecycle not ready');
  }
  if (input.dependencyInvalidated) {
    blockers.push(`Dependency invalidated: ${input.dependencyPolicy ?? 'UNKNOWN'}`);
  }
  if (!liveVerificationPassed) {
    blockers.push('Live verification not passed');
  }
  if (!requiredApprovalsMet) {
    blockers.push('Required approvals not met');
  }
  if (input.blockedReason) {
    blockers.push(input.blockedReason);
  }

  let effectiveState: EffectiveReadinessState = 'NOT_EVALUATED';

  if (input.blockedReason || (input.dependencyInvalidated && input.dependencyPolicy && BLOCKING_POLICIES.includes(input.dependencyPolicy))) {
    effectiveState = 'BLOCKED';
  } else if (input.dependencyInvalidated && input.dependencyPolicy && REVIEW_POLICIES.includes(input.dependencyPolicy)) {
    effectiveState = 'REVIEW_REQUIRED';
  } else if (input.dependencyInvalidated) {
    effectiveState = 'STALE';
  } else if (
    input.localLifecycleReady &&
    dependencyValid &&
    liveVerificationPassed &&
    requiredApprovalsMet
  ) {
    effectiveState = 'READY';
  } else if (input.localLifecycleReady) {
    effectiveState = 'NOT_READY';
  }

  const downgradeReason =
    input.localLifecycleReady && effectiveState !== 'READY'
      ? `Downgraded from local READY to ${effectiveState}`
      : null;

  return {
    recordId: input.recordId,
    effectiveState,
    localLifecycleReady: input.localLifecycleReady,
    dependencyValid,
    liveVerificationPassed,
    requiredApprovalsMet,
    blockers,
    downgradeReason,
  };
}

export function readyForImplementationBlockedByStaleDependency(
  localReady: boolean,
  dependencyInvalidated: boolean,
): boolean {
  return localReady && dependencyInvalidated;
}
