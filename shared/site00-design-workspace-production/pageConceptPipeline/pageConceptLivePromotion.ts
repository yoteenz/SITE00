/**
 * P0.VR.PAGE-CONCEPT-GPT2-CANONICAL-VIEWPORT-FAMILY1R1 — live merge validation (no silent promotion).
 */

import type { LivePromotionPackage } from './pageConceptViewportAuthorityFamily.js';
import { liveWriteAllowed } from './pageConceptTwinLiveFirewall.js';

export function validateLivePromotionPackage(pkg: LivePromotionPackage): { ok: true } | { ok: false; reason: string } {
  if (!pkg.twinLivePromotionApprovalId?.trim()) {
    return { ok: false, reason: 'MISSING_TWIN_LIVE_PROMOTION_APPROVAL' };
  }
  if (!pkg.twinBuildId?.trim()) return { ok: false, reason: 'MISSING_TWIN_BUILD' };
  if (!pkg.liveRoute?.trim()) return { ok: false, reason: 'MISSING_LIVE_ROUTE' };
  if (!pkg.twinRoute?.trim()) return { ok: false, reason: 'MISSING_TWIN_ROUTE' };
  if (!pkg.rollbackSnapshotId?.trim()) return { ok: false, reason: 'MISSING_ROLLBACK' };
  return { ok: true };
}

export function canExecuteLivePromotion(input: {
  founderLivePromotionApprovalId: string | null;
  explicitLivePromotionAction: boolean;
  packageValid: boolean;
  twinBuildMatchesApproval: boolean;
}): boolean {
  return (
    input.packageValid &&
    input.twinBuildMatchesApproval &&
    liveWriteAllowed({
      founderLivePromotionApprovalId: input.founderLivePromotionApprovalId,
      explicitLivePromotionAction: input.explicitLivePromotionAction,
    })
  );
}
