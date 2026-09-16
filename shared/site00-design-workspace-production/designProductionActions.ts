import type {
  AuthorityReviewDecision,
  DesignProductionState,
  FounderActor,
  SpendConfirmationRecord,
} from './types.js';
import { saveDesignProductionState } from './designProductionStore.js';
import {
  transitionCreateTabletOverride,
  transitionLockAuthorityPair,
  transitionMoveToBuild,
  transitionOpenPairReview,
  transitionRecordSpendConfirmation,
  transitionRefineConcept,
  transitionRegenerateConcept,
  transitionSubmitAuthorityReview,
} from './designProductionTransitions.js';

export type { FounderActor };

export function openPairReview(state: DesignProductionState, actor: FounderActor): DesignProductionState {
  return saveDesignProductionState(transitionOpenPairReview(state, actor));
}

export function submitAuthorityReview(
  state: DesignProductionState,
  actor: FounderActor,
  decision: AuthorityReviewDecision,
): DesignProductionState {
  return saveDesignProductionState(transitionSubmitAuthorityReview(state, actor, decision));
}

export function lockAuthorityPair(state: DesignProductionState, actor: FounderActor): DesignProductionState {
  return saveDesignProductionState(transitionLockAuthorityPair(state, actor));
}

export function moveToBuild(state: DesignProductionState, actor: FounderActor): DesignProductionState {
  return saveDesignProductionState(transitionMoveToBuild(state, actor));
}

export function recordSpendConfirmation(
  state: DesignProductionState,
  record: Omit<SpendConfirmationRecord, 'confirmedAt'> & { confirmedAt?: string },
): DesignProductionState {
  return saveDesignProductionState(transitionRecordSpendConfirmation(state, record));
}

export function refineConcept(
  state: DesignProductionState,
  actor: FounderActor,
  input: { parentCandidateId: string; spendConfirmationId: string; estimatedUsd: number },
): DesignProductionState {
  return saveDesignProductionState(transitionRefineConcept(state, actor, input));
}

export function regenerateConcept(
  state: DesignProductionState,
  actor: FounderActor,
  input: { siblingOfCandidateId: string; spendConfirmationId: string; estimatedUsd: number },
): DesignProductionState {
  return saveDesignProductionState(transitionRegenerateConcept(state, actor, input));
}

export function createTabletOverride(
  state: DesignProductionState,
  actor: FounderActor,
  reason: string,
): DesignProductionState {
  return saveDesignProductionState(transitionCreateTabletOverride(state, actor, reason));
}
