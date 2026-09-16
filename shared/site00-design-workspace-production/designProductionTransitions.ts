import { computeDesignReadiness } from './designReadinessEngine.js';
import type {
  AuthorityReviewDecision,
  DesignProductionHistoryEntry,
  DesignProductionState,
  SpendConfirmationRecord,
} from './types.js';
import type { FounderActor } from './types.js';

export function withHistoryEntry(
  state: DesignProductionState,
  entry: Omit<DesignProductionHistoryEntry, 'id'>,
): DesignProductionState {
  const row: DesignProductionHistoryEntry = {
    id: `dph-${Date.now()}-${state.history.length}`,
    ...entry,
  };
  return { ...state, history: [...state.history, row].slice(-200) };
}

function requireFounder(actor: FounderActor, action: string): void {
  if (!actor.isFounder) {
    throw new Error(`FOUNDER_ONLY:${action}`);
  }
}

export function transitionOpenPairReview(state: DesignProductionState, actor: FounderActor): DesignProductionState {
  const now = new Date().toISOString();
  let next = withHistoryEntry(state, {
    type: 'PAIR_REVIEW_OPENED',
    at: now,
    actorEmail: actor.email,
    summary: 'Pair review opened (inspection only)',
  });
  next = { ...next, pairReviewOpenedAt: next.pairReviewOpenedAt ?? now, updatedAt: now };
  return { ...next, sessionVersion: next.sessionVersion + 1 };
}

export function transitionSubmitAuthorityReview(
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
    updatedAt: now,
    sessionVersion: state.sessionVersion + 1,
  };
  next = withHistoryEntry(next, {
    type: 'AUTHORITY_REVIEWED',
    at: now,
    actorEmail: actor.email,
    summary: `Authority review: ${decision}`,
    payload: { decision },
  });
  return next;
}

export function transitionLockAuthorityPair(state: DesignProductionState, actor: FounderActor): DesignProductionState {
  requireFounder(actor, 'LOCK_AUTHORITY_PAIR');
  if (state.authorityReviewDecision !== 'APPROVE') {
    throw new Error('AUTHORITY_NOT_APPROVED');
  }
  const now = new Date().toISOString();
  const nextVersion = `design-authority-v${state.sessionVersion + 1}`;
  let next: DesignProductionState = {
    ...state,
    pairLockedAt: now,
    authorityLockedBy: actor.email,
    mobileAuthority: 'LOCKED',
    desktopAuthority: 'LOCKED',
    designAuthorityVersion: nextVersion,
    packageStatus: 'BUILD_REVIEW_READY',
    translationApproved: true,
    updatedAt: now,
    sessionVersion: state.sessionVersion + 1,
  };
  next = withHistoryEntry(next, {
    type: 'PAIR_LOCKED',
    at: now,
    actorEmail: actor.email,
    summary: 'Mobile + Desktop authority pair locked',
  });
  return next;
}

export function transitionMoveToBuild(state: DesignProductionState, actor: FounderActor): DesignProductionState {
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
    updatedAt: now,
    sessionVersion: state.sessionVersion + 1,
  };
  next = withHistoryEntry(next, {
    type: 'MOVED_TO_BUILD',
    at: now,
    actorEmail: actor.email,
    summary: 'Design package moved to BUILD',
    payload: { buildPackageId: buildPackage.id },
  });
  return next;
}

export function transitionRecordSpendConfirmation(
  state: DesignProductionState,
  record: Omit<SpendConfirmationRecord, 'confirmedAt'> & { confirmedAt?: string },
): DesignProductionState {
  const row: SpendConfirmationRecord = {
    ...record,
    confirmedAt: record.confirmedAt ?? new Date().toISOString(),
  };
  return {
    ...state,
    spendConfirmations: [...state.spendConfirmations, row],
    updatedAt: row.confirmedAt,
    sessionVersion: state.sessionVersion + 1,
  };
}

export function transitionRefineConcept(
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
  let next = withHistoryEntry(state, {
    type: 'CANDIDATE_REFINED',
    at: now,
    actorEmail: actor.email,
    summary: `Refined concept ${newId} from ${input.parentCandidateId}`,
    payload: { candidateId: newId, parentCandidateId: input.parentCandidateId },
  });
  return {
    ...next,
    selectedCandidateId: newId,
    updatedAt: now,
    sessionVersion: next.sessionVersion + 1,
  };
}

export function transitionRegenerateConcept(
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
  let next = withHistoryEntry(state, {
    type: 'CANDIDATE_REGENERATED',
    at: now,
    actorEmail: actor.email,
    summary: `Regenerated sibling concept ${newId}`,
    payload: { candidateId: newId, siblingOfCandidateId: input.siblingOfCandidateId },
  });
  return {
    ...next,
    selectedCandidateId: newId,
    updatedAt: now,
    sessionVersion: next.sessionVersion + 1,
  };
}

export function transitionSelectGalleryCandidate(
  state: DesignProductionState,
  candidateId: string,
): DesignProductionState {
  const now = new Date().toISOString();
  return {
    ...state,
    selectedCandidateId: candidateId,
    updatedAt: now,
    sessionVersion: state.sessionVersion + 1,
  };
}

export function transitionSelectViewportCandidate(
  state: DesignProductionState,
  actor: FounderActor,
  input: { viewport: 'MOBILE' | 'DESKTOP'; candidateId: string; candidateVersion: string },
): DesignProductionState {
  requireFounder(actor, 'SELECT_VIEWPORT_CANDIDATE');
  if (state.pairLockedAt) throw new Error('PAIR_LOCKED');
  const now = new Date().toISOString();
  const base = {
    ...state,
    selectedCandidateId: input.candidateId,
    updatedAt: now,
    sessionVersion: state.sessionVersion + 1,
  };
  if (input.viewport === 'MOBILE') {
    let next: DesignProductionState = {
      ...base,
      mobileVersion: input.candidateVersion,
      mobileAuthority: 'SELECTED',
    };
    next = withHistoryEntry(next, {
      type: 'VIEWPORT_SELECTED',
      at: now,
      actorEmail: actor.email,
      summary: `Mobile candidate ${input.candidateId} selected`,
      payload: { viewport: 'MOBILE', candidateId: input.candidateId },
    });
    return next;
  }
  let next: DesignProductionState = {
    ...base,
    desktopVersion: input.candidateVersion,
    desktopAuthority: 'SELECTED',
  };
  next = withHistoryEntry(next, {
    type: 'VIEWPORT_SELECTED',
    at: now,
    actorEmail: actor.email,
    summary: `Desktop candidate ${input.candidateId} selected`,
    payload: { viewport: 'DESKTOP', candidateId: input.candidateId },
  });
  return next;
}

export function transitionPromoteViewportMaster(
  state: DesignProductionState,
  actor: FounderActor,
  viewport: 'MOBILE' | 'DESKTOP',
): DesignProductionState {
  requireFounder(actor, 'PROMOTE_VIEWPORT_MASTER');
  if (state.pairLockedAt) throw new Error('PAIR_LOCKED');
  const now = new Date().toISOString();
  if (viewport === 'MOBILE' && state.mobileAuthority !== 'SELECTED') {
    throw new Error('MOBILE_NOT_SELECTED');
  }
  if (viewport === 'DESKTOP' && state.desktopAuthority !== 'SELECTED') {
    throw new Error('DESKTOP_NOT_SELECTED');
  }
  let next: DesignProductionState = {
    ...state,
    updatedAt: now,
    sessionVersion: state.sessionVersion + 1,
    mobileAuthority: viewport === 'MOBILE' ? 'PROMOTED' : state.mobileAuthority,
    desktopAuthority: viewport === 'DESKTOP' ? 'PROMOTED' : state.desktopAuthority,
  };
  next = withHistoryEntry(next, {
    type: 'VIEWPORT_MASTER_PROMOTED',
    at: now,
    actorEmail: actor.email,
    summary: `${viewport} master promoted to authority review path`,
    payload: { viewport },
  });
  return next;
}

export function transitionCreateTabletOverride(
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
    updatedAt: now,
    sessionVersion: state.sessionVersion + 1,
  };
  next = withHistoryEntry(next, {
    type: 'TABLET_OVERRIDE_CREATED',
    at: now,
    actorEmail: actor.email,
    summary: `Tablet override: ${reason}`,
  });
  return next;
}
