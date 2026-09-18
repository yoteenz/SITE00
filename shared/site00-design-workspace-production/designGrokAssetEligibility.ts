/**
 * P0.VR.DESIGN-GROK-GATING1 — downstream Grok asset generation gates (page-scoped).
 */

import { loadPageCaptureHistory } from './designPageCapture.js';
import type { PageAuthorityWorkflowState } from './designPageAuthorityWorkflow.js';
import type { DesignProductionState } from './types.js';
import type { PageViewportId } from './designProjectBinding/pageViewportAuthority.js';

export type GrokAssetGenerationEligibility =
  | 'BLOCKED_NO_PAGE_CONCEPT'
  | 'BLOCKED_CONCEPTS_NOT_APPROVED'
  | 'BLOCKED_AUTHORITY_PAIR_NOT_LOCKED'
  | 'BLOCKED_TWIN_NOT_CREATED'
  | 'BLOCKED_TWIN_NOT_REVIEWABLE'
  | 'BLOCKED_NO_CURRENT_CAPTURE'
  | 'BLOCKED_GROK_NOT_NEEDED'
  | 'ELIGIBLE';

export type GrokReadinessGateId =
  | 'page_concepts'
  | 'mobile_promoted'
  | 'desktop_promoted'
  | 'pair_review'
  | 'authority_locked'
  | 'composer_handoff'
  | 'twin_created'
  | 'twin_review'
  | 'current_capture';

export type GrokReadinessGateRow = {
  id: GrokReadinessGateId;
  label: string;
  status: 'PASS' | 'BLOCKED' | 'OPTIONAL';
  detail?: string;
};

export type GrokAssetProductionStatus =
  | 'NOT_REQUIRED'
  | 'BLOCKED'
  | 'READY'
  | 'IN_PROGRESS'
  | 'COMPLETE';

export type GrokEligibilityResult = {
  eligibility: GrokAssetGenerationEligibility;
  canGenerateProductionAssets: boolean;
  shortReason: string;
  nextAction: string | null;
  assetProductionStatus: GrokAssetProductionStatus;
  gates: readonly GrokReadinessGateRow[];
  twinRoute: string | null;
};

export type GrokEligibilityInput = {
  projectId: string;
  pageId: string;
  viewport: PageViewportId;
  production: Pick<
    DesignProductionState,
    | 'promotedMobileConceptId'
    | 'promotedDesktopConceptId'
    | 'pairReviewOpenedAt'
    | 'pairLockedAt'
    | 'twinImplementationStatus'
    | 'twinPageReviewedAt'
  >;
  pageWorkflow: Pick<
    PageAuthorityWorkflowState,
    'promoted' | 'pairReviewOpenedAt' | 'pairLockedAt' | 'twinReviewedAt' | 'composerHandoffPackage' | 'grokOptOut'
  >;
  /** HEAD/fetch probe of current twin route — required for TWIN EXISTS gate. */
  twinRouteReachable: boolean | null;
  twinRoute: string | null;
  hasPageConceptCandidates: boolean;
};

function bothPromoted(input: GrokEligibilityInput): boolean {
  const m = input.production.promotedMobileConceptId ?? input.pageWorkflow.promoted.mobileConceptId;
  const d = input.production.promotedDesktopConceptId ?? input.pageWorkflow.promoted.desktopConceptId;
  return Boolean(m && d);
}

export function computeGrokAssetEligibility(input: GrokEligibilityInput): GrokEligibilityResult {
  const capture = loadPageCaptureHistory(input.projectId, input.pageId, input.viewport);
  const hasCapture = Boolean(capture.latest?.artifactPath);
  const pairReview =
    Boolean(input.production.pairReviewOpenedAt) || Boolean(input.pageWorkflow.pairReviewOpenedAt);
  const pairLocked = Boolean(input.production.pairLockedAt) || Boolean(input.pageWorkflow.pairLockedAt);
  const handoff = Boolean(input.pageWorkflow.composerHandoffPackage) || Boolean(input.production.pairLockedAt);
  const twinStatus = input.production.twinImplementationStatus;
  const twinCreated =
    twinStatus !== 'NONE' &&
    input.twinRouteReachable === true &&
    Boolean(input.twinRoute);
  const twinReviewed =
    Boolean(input.pageWorkflow.twinReviewedAt) || Boolean(input.production.twinPageReviewedAt);
  const twinReviewable = twinCreated && (twinStatus === 'READY_FOR_REVIEW' || twinReviewed);

  const gates: GrokReadinessGateRow[] = [
    {
      id: 'page_concepts',
      label: 'Page concept process',
      status: input.hasPageConceptCandidates || bothPromoted(input) ? 'PASS' : 'BLOCKED',
    },
    {
      id: 'mobile_promoted',
      label: 'Mobile design promoted',
      status:
        input.production.promotedMobileConceptId || input.pageWorkflow.promoted.mobileConceptId ?
          'PASS'
        : 'BLOCKED',
    },
    {
      id: 'desktop_promoted',
      label: 'Desktop design promoted',
      status:
        input.production.promotedDesktopConceptId || input.pageWorkflow.promoted.desktopConceptId ?
          'PASS'
        : 'BLOCKED',
    },
    {
      id: 'pair_review',
      label: 'Pair review',
      status: pairReview ? 'PASS' : 'BLOCKED',
    },
    {
      id: 'authority_locked',
      label: 'Authority pair locked',
      status: pairLocked ? 'PASS' : 'BLOCKED',
    },
    {
      id: 'composer_handoff',
      label: 'Composer handoff',
      status: handoff ? 'PASS' : 'BLOCKED',
    },
    {
      id: 'twin_created',
      label: 'Twin page created',
      status:
        input.twinRouteReachable === null ? 'BLOCKED'
        : twinCreated ? 'PASS'
        : 'BLOCKED',
      detail: input.twinRouteReachable === false ? 'Route not reachable' : undefined,
    },
    {
      id: 'twin_review',
      label: 'Twin reviewable',
      status: twinReviewable ? 'PASS' : 'BLOCKED',
    },
    {
      id: 'current_capture',
      label: 'Current page capture',
      status: hasCapture ? 'PASS' : 'BLOCKED',
    },
  ];

  let eligibility: GrokAssetGenerationEligibility = 'ELIGIBLE';
  let shortReason = 'Asset generation optional — confirm spend when ready.';
  let nextAction: string | null = null;

  if (input.pageWorkflow.grokOptOut) {
    eligibility = 'BLOCKED_GROK_NOT_NEEDED';
    shortReason = 'NO GROK ASSETS NEEDED for this page';
    nextAction = 'Re-enable Grok asset production if requirements change';
  } else if (!input.hasPageConceptCandidates && !bothPromoted(input)) {
    eligibility = 'BLOCKED_NO_PAGE_CONCEPT';
    shortReason = 'Complete page concept workflow first';
    nextAction = 'Generate and promote page concepts';
  } else if (!bothPromoted(input)) {
    eligibility = 'BLOCKED_CONCEPTS_NOT_APPROVED';
    shortReason = 'Promote mobile and desktop designs';
    nextAction = 'PROMOTE MOBILE · PROMOTE DESKTOP';
  } else if (!pairLocked || !handoff) {
    eligibility = 'BLOCKED_AUTHORITY_PAIR_NOT_LOCKED';
    shortReason = 'Complete authority pair lock and Composer handoff';
    nextAction = 'LOCK AUTHORITY PAIR';
  } else if (!twinCreated) {
    eligibility = 'BLOCKED_TWIN_NOT_CREATED';
    shortReason = 'TWIN PAGE REQUIRED';
    nextAction = 'Wait for Composer twin implementation';
  } else if (!twinReviewable) {
    eligibility = 'BLOCKED_TWIN_NOT_REVIEWABLE';
    shortReason = 'Review twin page before asset production';
    nextAction = 'REVIEW TWIN PAGE';
  } else if (!hasCapture) {
    eligibility = 'BLOCKED_NO_CURRENT_CAPTURE';
    shortReason = 'Capture current page first';
    nextAction = 'CAPTURE SCREEN';
  }

  const canGenerateProductionAssets = eligibility === 'ELIGIBLE';

  let assetProductionStatus: GrokAssetProductionStatus = 'BLOCKED';
  if (input.pageWorkflow.grokOptOut) assetProductionStatus = 'NOT_REQUIRED';
  else if (canGenerateProductionAssets) assetProductionStatus = 'READY';
  else if (pairLocked && twinCreated) assetProductionStatus = 'IN_PROGRESS';

  return {
    eligibility,
    canGenerateProductionAssets,
    shortReason,
    nextAction,
    assetProductionStatus,
    gates,
    twinRoute: input.twinRoute,
  };
}

/** All production Grok modes require full eligibility in this sprint. */
export function modeAllowedForEligibility(
  _mode: string,
  result: GrokEligibilityResult,
): { allowed: boolean; reason: string | null } {
  if (result.canGenerateProductionAssets) return { allowed: true, reason: null };
  return { allowed: false, reason: result.shortReason };
}
