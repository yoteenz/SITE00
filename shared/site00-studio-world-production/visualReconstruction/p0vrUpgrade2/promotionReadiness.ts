/**
 * P0.VR.UPGRADE.2 — Promotion readiness gate.
 */

import type {
  PromotionReadiness,
  ReconstructionTwinSession,
  TwinFidelityQaResult,
} from './types.js';
import { criticalFunctionFailures, twinFunctionalQaPassed } from './twinFidelityQa.js';
import type { VisualAuthorityAcceptanceGate } from '../p0vrRebuild1/types.js';

export function evaluatePromotionReadiness(input: {
  session: ReconstructionTwinSession;
  fidelityQa: TwinFidelityQaResult[];
  currentAuthorityVersionId: string;
  founderApproved: boolean;
  visualAuthorityGate?: VisualAuthorityAcceptanceGate | null;
}): PromotionReadiness {
  const { session, fidelityQa, currentAuthorityVersionId, founderApproved, visualAuthorityGate } = input;
  const blockingIssues: string[] = [];
  const warnings: string[] = [];

  if (
    session.visualAuthorityStatus === 'FAILED_VISUAL_AUTHORITY' ||
    session.visualAuthorityStatus === 'VISUAL_AUTHORITY_FAILED'
  ) {
    blockingIssues.push('VISUAL_AUTHORITY_FAILED');
  }
  if (visualAuthorityGate && !visualAuthorityGate.promotionAllowed) {
    visualAuthorityGate.blockingReasons.forEach((r) => {
      if (!blockingIssues.includes(r)) blockingIssues.push(r);
    });
  }

  if (!session.twinVersionId) blockingIssues.push('Twin build missing');
  if (!session.twinCapture || session.twinCapture.status !== 'CAPTURE_READY') {
    blockingIssues.push('Twin capture missing');
  }
  if (session.status === 'SUPERSEDED') blockingIssues.push('Twin session superseded');
  if (session.authorityVersionId !== currentAuthorityVersionId) {
    blockingIssues.push('Design authority updated — refresh comparison');
  }
  if (!twinFunctionalQaPassed(fidelityQa)) {
    blockingIssues.push(...criticalFunctionFailures(fidelityQa));
  }

  const visualFails = fidelityQa.filter((r) => r.dimension === 'VISUAL' && r.status === 'FAIL');
  if (visualFails.length) warnings.push('Visual fidelity incomplete');
  const assetWarns = fidelityQa.filter((r) => r.dimension === 'ASSET' && r.status !== 'PASS');
  assetWarns.forEach((r) => warnings.push(r.summary));

  if (session.responsiveImpact.length) {
    warnings.push(`Affects other viewports: ${session.responsiveImpact.join(', ')}`);
  }

  return {
    visualReady: visualFails.length === 0,
    functionReady: twinFunctionalQaPassed(fidelityQa),
    routeReady: Boolean(session.twinRoute),
    authorityCurrent: session.authorityVersionId === currentAuthorityVersionId,
    captureReady: session.twinCapture?.status === 'CAPTURE_READY',
    founderApproved,
    blockingIssues,
    warnings,
  };
}

export function canPromote(readiness: PromotionReadiness): boolean {
  return (
    readiness.visualReady &&
    readiness.functionReady &&
    readiness.routeReady &&
    readiness.captureReady &&
    readiness.authorityCurrent &&
    readiness.blockingIssues.length === 0 &&
    readiness.founderApproved
  );
}
