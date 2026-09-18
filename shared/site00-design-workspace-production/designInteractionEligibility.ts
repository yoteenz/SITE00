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
    if (!state.preferredMobileConceptId) return 'Disabled: select a mobile preferred concept first';
    if (state.mobileAuthority !== 'SELECTED') return 'Disabled: mobile has no preferred concept';
  }
  if (actionId === 'promote-desktop') {
    if (!state.preferredDesktopConceptId) return 'Disabled: select a desktop preferred concept first';
    if (state.desktopAuthority !== 'SELECTED') return 'Disabled: desktop has no preferred concept';
  }
  if (actionId === 'pair-review') {
    if (state.mobileAuthority !== 'PROMOTED' || state.desktopAuthority !== 'PROMOTED') {
      return 'Disabled: promote mobile and desktop designs first';
    }
  }
  if (actionId === 'lock-pair') {
    if (state.mobileAuthority !== 'PROMOTED' || state.desktopAuthority !== 'PROMOTED') {
      return 'Disabled: both viewport designs must be promoted';
    }
    if (!state.pairReviewOpenedAt) return 'Disabled: complete pair review first';
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
  if (
    state.mobileAuthority === 'PROMOTED' &&
    state.desktopAuthority === 'PROMOTED' &&
    state.pairReviewOpenedAt &&
    !state.pairLockedAt &&
    actor.isFounder
  ) {
    return {
      label: 'NEXT ACTION',
      lines: ['LOCK DESIGN PAIR', 'SEND TO COMPOSER'],
      handler: 'runLockAuthorityPair',
    };
  }
  if (state.pairReviewOpenedAt && !state.pairLockedAt && actor.isFounder) {
    return {
      label: 'NEXT ACTION',
      lines: ['REVIEW TWIN PAGE', 'ACTUAL IMPLEMENTATION'],
      handler: 'openReviewAuthority',
    };
  }
  if (
    state.mobileAuthority === 'PROMOTED' &&
    state.desktopAuthority === 'PROMOTED' &&
    !state.pairReviewOpenedAt
  ) {
    return {
      label: 'NEXT ACTION',
      lines: ['OPEN PAIR REVIEW', 'PROMOTED DESIGNS'],
      handler: 'runPairReview',
    };
  }
  if (state.mobileAuthority === 'SELECTED') {
    const reason = railActionDisabledReason('promote-mobile', state, actor);
    if (!reason) {
      return {
        label: 'NEXT ACTION',
        lines: ['PROMOTE MOBILE', 'FINAL VIEWPORT APPROVAL'],
        handler: 'promoteMobile',
      };
    }
  }
  if (state.desktopAuthority === 'SELECTED') {
    const reason = railActionDisabledReason('promote-desktop', state, actor);
    if (!reason) {
      return {
        label: 'NEXT ACTION',
        lines: ['PROMOTE DESKTOP', 'FINAL VIEWPORT APPROVAL'],
        handler: 'promoteDesktop',
      };
    }
  }
  if (!state.preferredDesktopConceptId) {
    return {
      label: 'NEXT ACTION',
      lines: ['SELECT FOR DESKTOP', 'PREFERRED CONCEPT'],
      handler: 'selectForDesktop',
    };
  }
  if (!state.preferredMobileConceptId) {
    return {
      label: 'NEXT ACTION',
      lines: ['SELECT FOR MOBILE', 'PREFERRED CONCEPT'],
      handler: 'selectForMobile',
    };
  }
  return {
    label: 'NEXT ACTION',
    lines: ['PROMOTE VIEWPORT', 'FINAL APPROVAL'],
    handler: 'promoteMobile',
    disabledReason: railActionDisabledReason('promote-mobile', state, actor) ?? undefined,
  };
}
