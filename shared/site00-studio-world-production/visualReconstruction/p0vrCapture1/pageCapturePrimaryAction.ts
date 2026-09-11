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

export function shouldOfferPageUpgrade(input: {
  upgradeAllowed: boolean;
  liveState: LivePageCaptureState;
  designPreviewStatus: string;
  livePreviewStatus: string;
  hasStoredCapture: boolean;
}): boolean {
  return (
    input.upgradeAllowed &&
    input.liveState === 'READY' &&
    input.designPreviewStatus === 'PASS' &&
    input.livePreviewStatus === 'PASS' &&
    input.hasStoredCapture
  );
}
