/**
 * P0.VR.6R2 — Page visual verification status derivation.
 */

import type { DesignReferenceFidelityContract } from '../p0vr7/types.js';
import type { DesignReferenceComparisonSession, PageVisualVerificationStatus } from './types.js';
import { requiresVisualConvergence } from './convergenceEngine.js';

export function derivePageVisualVerificationStatus(input: {
  hasReference: boolean;
  contract: DesignReferenceFidelityContract | null;
  session: DesignReferenceComparisonSession | null;
  implementationComplete?: boolean;
}): PageVisualVerificationStatus {
  if (!input.hasReference) return 'MISSING_REF';
  if (!input.contract) return 'REFERENCE_READY';

  if (input.contract.status === 'IMPLEMENTING') return 'IMPLEMENTING';
  if (input.contract.status === 'VERIFIED' || input.session?.status === 'VERIFIED') return 'VERIFIED';
  if (input.session?.status === 'HIGH_MATCH') return 'HIGH_MATCH';
  if (input.session?.status === 'DRIFT_FOUND' || input.session?.status === 'CORRECTION_IN_PROGRESS') {
    return 'DRIFT';
  }
  if (
    input.implementationComplete ||
    input.contract.status === 'RENDER_QA_REQUIRED' ||
    input.contract.status === 'VISUAL_DRIFT_FOUND' ||
    input.contract.status === 'CORRECTING' ||
    input.session?.status === 'COMPARISON_PENDING' ||
    input.session?.status === 'CAPTURE_PENDING' ||
    input.session?.status === 'RECAPTURE_PENDING'
  ) {
    return 'VISUAL_QA';
  }
  if (input.session?.status === 'BLOCKED' || input.session?.status === 'FOUNDER_REVIEW_REQUIRED') {
    return 'BLOCKED';
  }
  if (requiresVisualConvergence(input.contract) && input.contract.status === 'REFERENCE_CONFIRMED') {
    return 'REFERENCE_READY';
  }
  return 'REFERENCE_READY';
}

/** Reference existence alone must not imply MATCHED. */
export function pageIsMatchedFromReferenceExistenceOnly(hasReference: boolean): boolean {
  return hasReference;
}

export function pageMatchUsesVisualVerification(status: PageVisualVerificationStatus): boolean {
  return status === 'VERIFIED' || status === 'HIGH_MATCH';
}

export function referenceCardVisualLabel(input: {
  contract: DesignReferenceFidelityContract | null;
  session: DesignReferenceComparisonSession | null;
}): 'EXACT' | 'HIGH MATCH' | 'DRIFT' | 'VERIFIED' | 'VISUAL QA' {
  if (input.session?.status === 'VERIFIED' || input.contract?.latestFidelityStatus === 'VERIFIED') {
    return 'VERIFIED';
  }
  if (input.session?.status === 'HIGH_MATCH') return 'HIGH MATCH';
  if (input.session?.status === 'DRIFT_FOUND' || input.contract?.latestFidelityStatus === 'MAJOR_DRIFT') {
    return 'DRIFT';
  }
  if (
    input.session &&
    ['CAPTURE_PENDING', 'COMPARISON_PENDING', 'CORRECTION_IN_PROGRESS', 'RECAPTURE_PENDING'].includes(
      input.session.status,
    )
  ) {
    return 'VISUAL QA';
  }
  if (input.contract?.fidelityMode === 'EXACT') return 'EXACT';
  return 'EXACT';
}
