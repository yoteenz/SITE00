/**
 * P0.VR.CAPTURE.1R2 — Live page capture UI state derivation.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import { resolveCurrentPageViewportCapture } from './currentPageViewportCaptureResolver.js';
import { derivePageViewportCaptureStatus } from './pageViewportCapture.js';
import type { PageViewportCapture } from './types.js';

export const LIVE_PAGE_CAPTURE_STATES = [
  'NONE',
  'CAPTURING',
  'SAVED',
  'VERIFYING_PREVIEW',
  'READY',
  'OUTDATED',
  'FAILED',
  'PREVIEW_UNAVAILABLE',
  'PAGE_MISMATCH',
] as const;

export type LivePageCaptureState = (typeof LIVE_PAGE_CAPTURE_STATES)[number];

export function deriveLivePageCaptureState(options: {
  projectId: string;
  pageId: string;
  viewport: DesignViewportClass;
  isCapturing?: boolean;
  previewLoadSucceeded?: boolean;
  previewLoadFailed?: boolean;
  previewVerifying?: boolean;
  pageIdentityMismatch?: boolean;
  currentBuildVersion?: string;
  boundCapture?: PageViewportCapture | null;
}): LivePageCaptureState {
  if (options.isCapturing) return 'CAPTURING';

  const capture =
    options.boundCapture ??
    resolveCurrentPageViewportCapture(options.projectId, options.pageId, options.viewport);
  const status = derivePageViewportCaptureStatus(capture, {
    currentBuildVersion: options.currentBuildVersion,
  });

  if (options.pageIdentityMismatch || capture?.artifactProof?.status === 'PAGE_MISMATCH') {
    return 'PAGE_MISMATCH';
  }
  if (status === 'CAPTURE_FAILED') return 'FAILED';
  if (status === 'CAPTURE_OUTDATED') return 'OUTDATED';
  if (status === 'CAPTURE_READY') {
    if (options.previewLoadFailed) return 'PREVIEW_UNAVAILABLE';
    if (options.previewLoadSucceeded) return 'READY';
    if (options.previewVerifying) return 'VERIFYING_PREVIEW';
    return 'SAVED';
  }
  return 'NONE';
}

export function livePageCaptureStatusLabel(state: LivePageCaptureState): string {
  switch (state) {
    case 'CAPTURING':
      return 'CAPTURING';
    case 'SAVED':
      return 'CAPTURE SAVED ✓';
    case 'VERIFYING_PREVIEW':
      return 'CAPTURE SAVED · VERIFYING PREVIEW';
    case 'READY':
      return 'CAPTURE READY ✓';
    case 'PAGE_MISMATCH':
      return 'CAPTURE FAILED · PAGE MISMATCH';
    case 'OUTDATED':
      return 'CAPTURE MAY BE OUTDATED';
    case 'FAILED':
      return 'CAPTURE FAILED';
    case 'PREVIEW_UNAVAILABLE':
      return 'CAPTURE SAVED · PREVIEW UNAVAILABLE';
    default:
      return 'NO LIVE CAPTURE YET';
  }
}
