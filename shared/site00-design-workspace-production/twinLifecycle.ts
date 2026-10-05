/**
 * P0.VR.DESIGN-TWIN-FUNCTIONALITY1 — twin lifecycle before/after founder approval.
 */

export const TWIN_LIFECYCLE_STATUSES = [
  'INCEPTION',
  'IMPLEMENTING',
  'FUNCTIONAL_REVIEW',
  'FOUNDER_APPROVED',
  'PROMOTED',
  'REFERENCE',
] as const;

export type TwinLifecycleStatus = (typeof TWIN_LIFECYCLE_STATUSES)[number];

/** Current repo posture: production promoted early; twin remains review authority. */
export const TWIN_REVIEW_AUTHORITY_STATUS: TwinLifecycleStatus = 'FUNCTIONAL_REVIEW';

export const PRODUCTION_DESIGN_POSTURE = 'PROVISIONAL_IMPLEMENTATION' as const;

export function founderReviewModeActive(twinStatus: TwinLifecycleStatus): boolean {
  return twinStatus === 'FUNCTIONAL_REVIEW' || twinStatus === 'IMPLEMENTING';
}

/** Production promotion from twin requires explicit founder approval — not mid-review. */
export function canPromoteTwinToProduction(input: {
  twinStatus: TwinLifecycleStatus;
  founderApproved: boolean;
}): boolean {
  if (!input.founderApproved) return false;
  return input.twinStatus === 'FOUNDER_APPROVED' || input.twinStatus === 'PROMOTED';
}

export function twinFunctionalStatusBeforeApproval(twinStatus: TwinLifecycleStatus): 'FULL' | 'REFERENCE_ONLY' {
  if (twinStatus === 'FOUNDER_APPROVED' || twinStatus === 'PROMOTED' || twinStatus === 'REFERENCE') {
    return 'REFERENCE_ONLY';
  }
  return 'FULL';
}
