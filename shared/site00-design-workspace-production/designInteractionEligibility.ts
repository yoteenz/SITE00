import type { DesignProductionState, FounderActor } from './types.js';
import { computeDesignReadiness } from './designReadinessEngine.js';
import { projectDesignProductionProjection } from './designProductionProjection.js';

export type ContextualNextAction = {
  label: string;
  lines: readonly string[];
  handler:
    | 'selectForMobile'
    | 'selectForDesktop'
    | 'promoteMobile'
    | 'promoteDesktop'
    | 'runPairReview'
    | 'openReviewAuthority'
    | 'runLockAuthorityPair'
    | 'openReadinessReceipt'
    | 'runMoveToBuild';
  disabledReason?: string;
};

export function railActionDisabledReason(
  actionId: string,
  state: DesignProductionState,
  actor: FounderActor,
): string | null {
  if (state.pairLockedAt) return 'Disabled: authority pair is locked';
  if (!actor.isFounder && ['promote-mobile', 'promote-desktop', 'lock-pair', 'review-authority'].includes(actionId)) {
    return 'Disabled: founder-only action';
  }
  if (actionId === 'promote-mobile') {
    if (state.mobileAuthority !== 'SELECTED') return 'Disabled: mobile master not selected for promotion';
  }
  if (actionId === 'promote-desktop') {
    if (state.desktopAuthority !== 'SELECTED') return 'Disabled: no desktop candidate selected';
  }
  if (actionId === 'lock-pair') {
    if (state.authorityReviewDecision !== 'APPROVE') return 'Disabled: authority review not approved';
  }
  if (actionId === 'review-authority') {
    if (!state.pairReviewOpenedAt) return 'Disabled: open pair review first';
  }
  return null;
}

export function selectViewportDisabledReason(
  viewport: 'MOBILE' | 'TABLET' | 'DESKTOP',
  state: DesignProductionState,
): string | null {
  if (viewport === 'TABLET' && state.tabletMode === 'DERIVED' && !state.tabletDerivedOk) {
    return 'Disabled: tablet derivation needs attention';
  }
  return null;
}

export function computeContextualNextAction(
  state: DesignProductionState,
  actor: FounderActor,
): ContextualNextAction {
  const projection = projectDesignProductionProjection(state);
  const receipt = computeDesignReadiness(state);

  if (projection.buildEligible && actor.isFounder) {
    return {
      label: 'NEXT ACTION',
      lines: ['MOVE TO BUILD', 'PACKAGE READY'],
      handler: 'runMoveToBuild',
    };
  }
  if (receipt.blockers.length > 0) {
    return {
      label: 'NEXT ACTION',
      lines: ['RESOLVE BLOCKER', receipt.blockers[0]?.label ?? 'READINESS'],
      handler: 'openReadinessReceipt',
    };
  }
  if (state.authorityReviewDecision === 'APPROVE' && !state.pairLockedAt && actor.isFounder) {
    return {
      label: 'NEXT ACTION',
      lines: ['LOCK AUTHORITY PAIR', state.designAuthorityVersion],
      handler: 'runLockAuthorityPair',
    };
  }
  if (state.pairReviewOpenedAt && !state.authorityReviewedAt && actor.isFounder) {
    return {
      label: 'NEXT ACTION',
      lines: ['REVIEW AUTHORITY', 'FORMAL DECISION'],
      handler: 'openReviewAuthority',
    };
  }
  if (!state.pairReviewOpenedAt) {
    return {
      label: 'NEXT ACTION',
      lines: ['OPEN PAIR REVIEW', 'VISUAL INSPECTION'],
      handler: 'runPairReview',
    };
  }
  if (state.desktopAuthority !== 'SELECTED' && state.desktopAuthority !== 'PROMOTED') {
    return {
      label: 'NEXT ACTION',
      lines: ['SELECT DESKTOP MASTER', 'FROM GALLERY'],
      handler: 'selectForDesktop',
    };
  }
  if (state.mobileAuthority !== 'SELECTED') {
    return {
      label: 'NEXT ACTION',
      lines: ['SELECT MOBILE MASTER', 'FROM GALLERY'],
      handler: 'selectForMobile',
    };
  }
  return {
    label: 'NEXT ACTION',
    lines: ['PROMOTE MOBILE MASTER', 'TO AUTHORITY PAIR'],
    handler: 'promoteMobile' as ContextualNextAction['handler'],
    disabledReason: railActionDisabledReason('promote-mobile', state, actor) ?? undefined,
  };
}
