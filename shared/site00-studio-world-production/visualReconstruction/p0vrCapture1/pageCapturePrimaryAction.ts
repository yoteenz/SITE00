/**
 * P0.VR.CAPTURE.1R3A — Page-scoped capture CTA labels (never masquerade as upgrade).
 */

import type { LivePageCaptureState } from './livePageCaptureState.js';

export function resolvePageCapturePrimaryLabel(input: {
  upgradeAllowed: boolean;
  liveState: LivePageCaptureState;
  nextActionLabel: string;
  hasStoredCapture: boolean;
}): string {
  if (input.upgradeAllowed) return input.nextActionLabel;

  if (input.liveState === 'FAILED' || input.liveState === 'PAGE_MISMATCH') return 'RETRY';
  if (
    input.liveState === 'PREVIEW_UNAVAILABLE' ||
    input.liveState === 'VERIFYING_PREVIEW' ||
    input.liveState === 'SAVED' ||
    input.liveState === 'OUTDATED'
  ) {
    return input.hasStoredCapture ? 'RECAPTURE' : 'CAPTURE NOW';
  }

  if (input.nextActionLabel === 'UPGRADE THIS PAGE' || input.nextActionLabel === 'FIX CAPTURE SERVICE') {
    return input.hasStoredCapture ? 'RECAPTURE' : 'CAPTURE NOW';
  }

  if (input.nextActionLabel === 'CAPTURE NOW' || input.nextActionLabel === 'RECAPTURE' || input.nextActionLabel === 'RETRY') {
    return input.nextActionLabel;
  }

  return input.hasStoredCapture ? 'RECAPTURE' : 'CAPTURE NOW';
}

export function isLiveCaptureReadyForUpgrade(liveState: LivePageCaptureState, livePreviewStatus: string): boolean {
  if (liveState === 'READY') return true;
  return liveState === 'OUTDATED' && livePreviewStatus === 'PASS';
}

export function shouldOfferPageUpgrade(input: {
  upgradeAllowed: boolean;
  liveState: LivePageCaptureState;
  designPreviewStatus: string;
  livePreviewStatus: string;
  hasStoredCapture: boolean;
  authorityApproved?: boolean;
  designPreviewUrlResolved?: boolean;
  livePreviewUrlResolved?: boolean;
}): boolean {
  if (!input.upgradeAllowed || !input.hasStoredCapture || input.authorityApproved === false) {
    return false;
  }

  const captureReady =
    isLiveCaptureReadyForUpgrade(input.liveState, input.livePreviewStatus) ||
    input.liveState === 'SAVED' ||
    input.liveState === 'VERIFYING_PREVIEW' ||
    input.liveState === 'OUTDATED';

  const previewsVerified =
    input.designPreviewStatus === 'PASS' && input.livePreviewStatus === 'PASS';

  const previewsDegraded =
    Boolean(input.designPreviewUrlResolved && input.livePreviewUrlResolved) &&
    input.designPreviewStatus !== 'FAIL' &&
    input.livePreviewStatus !== 'FAIL';

  return captureReady && (previewsVerified || previewsDegraded);
}

export function resolvePageUpgradeBlockReasons(input: {
  upgradeAllowed: boolean;
  upgradeBlockReason: string | null;
  liveState: LivePageCaptureState;
  designPreviewStatus: string;
  livePreviewStatus: string;
  hasStoredCapture: boolean;
  authorityApproved: boolean;
  authorityStatus: string;
}): string[] {
  const reasons: string[] = [];

  if (!input.hasStoredCapture) {
    reasons.push('NO LIVE CAPTURE YET');
    return reasons;
  }

  if (!input.authorityApproved) {
    if (input.authorityStatus === 'MISSING' || input.authorityStatus === 'MAPPED') {
      reasons.push('SET OR APPROVE DESIGN AUTHORITY FIRST');
    } else {
      reasons.push('DESIGN AUTHORITY APPROVAL REQUIRED');
    }
  }

  if (input.designPreviewStatus !== 'PASS') {
    reasons.push(
      input.designPreviewStatus === 'FAIL'
        ? 'DESIGN AUTHORITY PREVIEW FAILED'
        : 'DESIGN AUTHORITY PREVIEW CHECKING',
    );
  }

  if (input.livePreviewStatus !== 'PASS') {
    reasons.push(
      input.livePreviewStatus === 'FAIL' ? 'LIVE CAPTURE PREVIEW FAILED' : 'LIVE CAPTURE PREVIEW CHECKING',
    );
  }

  if (
    input.hasStoredCapture &&
    !isLiveCaptureReadyForUpgrade(input.liveState, input.livePreviewStatus) &&
    input.liveState !== 'CAPTURING'
  ) {
    if (input.liveState === 'PAGE_MISMATCH') reasons.push('CAPTURED PAGE DOES NOT MATCH TARGET');
    else if (input.liveState === 'FAILED') reasons.push('LAST CAPTURE FAILED');
    else if (input.liveState === 'PREVIEW_UNAVAILABLE') reasons.push('LIVE CAPTURE PREVIEW UNAVAILABLE');
    else if (input.liveState === 'VERIFYING_PREVIEW' || input.liveState === 'SAVED') {
      reasons.push('WAITING FOR LIVE PREVIEW CONFIRMATION');
    }
  }

  if (input.upgradeBlockReason && !reasons.includes(input.upgradeBlockReason)) {
    reasons.push(input.upgradeBlockReason);
  }

  return reasons;
}
