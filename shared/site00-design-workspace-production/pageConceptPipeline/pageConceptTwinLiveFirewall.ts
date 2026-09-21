/**
 * P0.VR.PAGE-CONCEPT-GPT2-CANONICAL-VIEWPORT-FAMILY1R1 — hard twin/live separation.
 */

export type PageConceptImplementationSurface = 'TWIN' | 'LIVE';

export const LIVE_PROMOTION_REQUIRES_FOUNDER_APPROVAL = true as const;

export function assertOpusShellTargetSurface(surface: PageConceptImplementationSurface): void {
  if (surface !== 'TWIN') {
    throw new Error('OPUS_SHELL_BLOCKED: TARGET_MUST_BE_TWIN');
  }
}

export function assertComposerPreFinalTargetSurface(surface: PageConceptImplementationSurface): void {
  if (surface !== 'TWIN') {
    throw new Error('COMPOSER_IMPLEMENTATION_BLOCKED: PRE_FINAL_TARGET_MUST_BE_TWIN');
  }
}

export function assertGrokAssetTargetSurface(surface: PageConceptImplementationSurface): void {
  if (surface !== 'TWIN') {
    throw new Error('GROK_ASSET_BLOCKED: TARGET_MUST_BE_TWIN');
  }
}

export function liveWriteAllowed(input: {
  founderLivePromotionApprovalId: string | null;
  explicitLivePromotionAction: boolean;
}): boolean {
  if (!LIVE_PROMOTION_REQUIRES_FOUNDER_APPROVAL) return false;
  return Boolean(input.founderLivePromotionApprovalId?.trim()) && input.explicitLivePromotionAction === true;
}

export function assertLiveWriteAllowed(input: {
  founderLivePromotionApprovalId: string | null;
  explicitLivePromotionAction: boolean;
}): void {
  if (!liveWriteAllowed(input)) {
    throw new Error('LIVE_WRITE_BLOCKED: FOUNDER_LIVE_PROMOTION_APPROVAL_REQUIRED');
  }
}
