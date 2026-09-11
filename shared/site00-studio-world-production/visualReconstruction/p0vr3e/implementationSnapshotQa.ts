/**
 * P0.VR.3E — Implementation snapshot QA.
 */

import type { ImplementationSnapshotRecord } from './types.js';
import { IMPLEMENTATION_SNAPSHOT_MIN_WEBP_BYTES, IMPLEMENTATION_SNAPSHOT_QA_FAILURES } from './constants.js';

export type ImplementationSnapshotQaResult = {
  passed: boolean;
  issues: string[];
};

export function runImplementationSnapshotQa(input: {
  record: Partial<ImplementationSnapshotRecord>;
  bufferSize: number;
  finalUrl: string;
  requestedRoute: string;
  expectedWidth: number;
  expectedHeight: number;
  hasAuthRedirect: boolean;
  hasLoadingShell: boolean;
  brokenImageCount: number;
  fontsReady: boolean;
  hasRuntimeError: boolean;
  httpStatus?: number | null;
  pageNotFound?: boolean;
  anchorFound?: boolean;
  minCaptureBytes?: number;
}): ImplementationSnapshotQaResult {
  const issues: string[] = [];
  const minBytes = input.minCaptureBytes ?? IMPLEMENTATION_SNAPSHOT_MIN_WEBP_BYTES;

  if (input.bufferSize < 512) issues.push('BLANK_PAGE');
  if (input.pageNotFound || input.httpStatus === 404) issues.push('PAGE_NOT_FOUND');
  if (input.anchorFound === false) issues.push('CAPTURE_ANCHOR_MISSING');
  if (input.bufferSize > 0 && input.bufferSize < minBytes && !input.hasRuntimeError) issues.push('ZERO_CONTENT');
  if (!input.finalUrl.includes(input.requestedRoute.split('?')[0] ?? '')) issues.push('WRONG_ROUTE');
  if (input.hasAuthRedirect) issues.push('AUTH_REDIRECT');
  if (input.hasLoadingShell) issues.push('LEGACY_LOADING_SHELL');
  if (input.brokenImageCount > 0) issues.push('BROKEN_IMAGES');
  if (!input.fontsReady) issues.push('FONT_NOT_READY');
  if (input.hasRuntimeError) issues.push('RUNTIME_ERROR');
  if (input.record.width && input.record.width !== input.expectedWidth) issues.push('WRONG_VIEWPORT');

  return {
    passed: issues.length === 0,
    issues: issues.filter((i) => IMPLEMENTATION_SNAPSHOT_QA_FAILURES.includes(i as (typeof IMPLEMENTATION_SNAPSHOT_QA_FAILURES)[number])),
  };
}

export function classifyCaptureFailure(issues: string[]): ImplementationSnapshotRecord['captureStatus'] {
  if (issues.includes('AUTH_REDIRECT')) return 'AUTH_BLOCKED';
  if (issues.includes('WRONG_ROUTE') || issues.includes('RUNTIME_ERROR')) return 'FAILED';
  return 'FAILED';
}
