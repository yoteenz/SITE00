import { computeDesignReadiness } from './designReadinessEngine.js';
import type {
  AuthorityReviewDecision,
  DesignProductionState,
  SpendConfirmationRecord,
} from './types.js';
import { saveDesignProductionState, withHistory } from './designProductionStore.js';

export type FounderActor = { email: string | null; isFounder: boolean };

function requireFounder(actor: FounderActor, action: string): void {
  if (!actor.isFounder) {
    throw new Error(`FOUNDER_ONLY:${action}`);
  }
}

export function openPairReview(state: DesignProductionState, actor: FounderActor): DesignProductionState {
  const now = new Date().toISOString();
  let next = withHistory(state, {
    type: 'PAIR_REVIEW_OPENED',
    at: now,
    actorEmail: actor.email,
    summary: 'Pair review opened (inspection only)',
  });
  next = { ...next, pairReviewOpenedAt: next.pairReviewOpenedAt ?? now };
  return saveDesignProductionState(next);
}

export function submitAuthorityReview(
  state: DesignProductionState,
  actor: FounderActor,
  decision: AuthorityReviewDecision,
): DesignProductionState {
  requireFounder(actor, 'REVIEW_AUTHORITY');
  if (!state.pairReviewOpenedAt) throw new Error('PAIR_REVIEW_REQUIRED');
  const now = new Date().toISOString();
  let next: DesignProductionState = {
    ...state,
    authorityReviewDecision: decision,
    authorityReviewedAt: now,
    mobileAuthority: decision === 'APPROVE' ? 'APPROVED' : 'UNDER_REVIEW',
    desktopAuthority: decision === 'APPROVE' ? 'APPROVED' : 'UNDER_REVIEW',
  };
  next = withHistory(next, {
    type: 'AUTHORITY_REVIEWED',
    at: now,
    actorEmail: actor.email,
    summary: `Authority review: ${decision}`,
    payload: { decision },
  });
  return saveDesignProductionState(next);
}

export function lockAuthorityPair(state: DesignProductionState, actor: FounderActor): DesignProductionState {
  requireFounder(actor, 'LOCK_AUTHORITY_PAIR');
  if (state.authorityReviewDecision !== 'APPROVE') {
    throw new Error('AUTHORITY_NOT_APPROVED');
  }
  const now = new Date().toISOString();
  let next: DesignProductionState = {
    ...state,
    pairLockedAt: now,
    mobileAuthority: 'LOCKED',
    desktopAuthority: 'LOCKED',
    designAuthorityVersion: `design-authority-v${state.sessionVersion + 1}`,
    packageStatus: 'BUILD_REVIEW_READY',
    translationApproved: true,
  };
  next = withHistory(next, {
    type: 'PAIR_LOCKED',
    at: now,
    actorEmail: actor.email,
    summary: 'Mobile + Desktop authority pair locked',
  });
  return saveDesignProductionState(next);
}

export function moveToBuild(state: DesignProductionState, actor: FounderActor): DesignProductionState {
  requireFounder(actor, 'MOVE_TO_BUILD');
  const receipt = computeDesignReadiness(state);
  if (!receipt.buildEligible) {
    throw new Error(`MOVE_TO_BUILD_BLOCKED:${receipt.blockers.map((b) => b.id).join(',')}`);
  }
  const now = new Date().toISOString();
  const buildPackage = {
    id: `bp-${Date.now()}`,
    projectId: state.projectId,
    pageId: state.pageId,
    designAuthorityVersion: state.designAuthorityVersion,
    interactionContractVersion: state.contractFreeze.contractVersion,
    assetManifestVersion: 'twin-opus-direct-assets-v1',
    provenanceVersion: 'entry001-campaign-archive-v1',
    readinessReceiptId: receipt.id,
    createdAt: now,
    createdBy: actor.email,
  };
  let next: DesignProductionState = {
    ...state,
    workflowStage: 'BUILD',
    packageStatus: 'READY_FOR_PRODUCTIONIZATION',
    buildPackage,
  };
  next = withHistory(next, {
    type: 'MOVED_TO_BUILD',
    at: now,
    actorEmail: actor.email,
    summary: 'Design package moved to BUILD',
    payload: { buildPackageId: buildPackage.id },
  });
  return saveDesignProductionState(next);
}

export function recordSpendConfirmation(
  state: DesignProductionState,
  record: Omit<SpendConfirmationRecord, 'confirmedAt'> & { confirmedAt?: string },
): DesignProductionState {
  const row: SpendConfirmationRecord = {
    ...record,
    confirmedAt: record.confirmedAt ?? new Date().toISOString(),
  };
  return saveDesignProductionState({
    ...state,
    spendConfirmations: [...state.spendConfirmations, row],
  });
}

export function refineConcept(
  state: DesignProductionState,
  actor: FounderActor,
  input: { parentCandidateId: string; spendConfirmationId: string; estimatedUsd: number },
): DesignProductionState {
  requireFounder(actor, 'REFINE_CONCEPT');
  if (!state.spendConfirmations.some((s) => s.id === input.spendConfirmationId)) {
    throw new Error('SPEND_CONFIRMATION_REQUIRED');
  }
  const now = new Date().toISOString();
  const newId = `${input.parentCandidateId}-ref-${Date.now()}`;
  let next = withHistory(state, {
    type: 'CANDIDATE_REFINED',
    at: now,
    actorEmail: actor.email,
    summary: `Refined concept ${newId} from ${input.parentCandidateId}`,
    payload: { candidateId: newId, parentCandidateId: input.parentCandidateId },
  });
  next = { ...next, selectedCandidateId: newId };
  return saveDesignProductionState(next);
}

export function regenerateConcept(
  state: DesignProductionState,
  actor: FounderActor,
  input: { siblingOfCandidateId: string; spendConfirmationId: string; estimatedUsd: number },
): DesignProductionState {
  requireFounder(actor, 'REGENERATE_CONCEPT');
  if (!state.spendConfirmations.some((s) => s.id === input.spendConfirmationId)) {
    throw new Error('SPEND_CONFIRMATION_REQUIRED');
  }
  const now = new Date().toISOString();
  const newId = `${input.siblingOfCandidateId}-reg-${Date.now()}`;
  let next = withHistory(state, {
    type: 'CANDIDATE_REGENERATED',
    at: now,
    actorEmail: actor.email,
    summary: `Regenerated sibling concept ${newId}`,
    payload: { candidateId: newId, siblingOfCandidateId: input.siblingOfCandidateId },
  });
  next = { ...next, selectedCandidateId: newId };
  return saveDesignProductionState(next);
}

export function createTabletOverride(
  state: DesignProductionState,
  actor: FounderActor,
  reason: string,
): DesignProductionState {
  requireFounder(actor, 'TABLET_OVERRIDE');
  const now = new Date().toISOString();
  let next: DesignProductionState = {
    ...state,
    tabletMode: 'OVERRIDE',
    tabletDerivedOk: false,
    tabletOverrideReason: reason,
    tabletOverrideApprovedAt: now,
  };
  next = withHistory(next, {
    type: 'TABLET_OVERRIDE_CREATED',
    at: now,
    actorEmail: actor.email,
    summary: `Tablet override: ${reason}`,
  });
  return saveDesignProductionState(next);
}
