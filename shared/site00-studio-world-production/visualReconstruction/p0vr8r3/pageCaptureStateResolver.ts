/**
 * P0.VR.8R3R2 — Single authority for page capture state.
 */

import type { PageCaptureQueueJob, ProjectPageRecord } from '../p0vr8/types.js';
export type ResolvedPageCaptureState =
  | 'NEVER_CAPTURED'
  | 'QUEUED'
  | 'CAPTURING'
  | 'CURRENT'
  | 'STALE'
  | 'FAILED'
  | 'SKIPPED'
  | 'UNSUPPORTED';

export type PageCaptureStateInput = {
  latestCaptureId?: string | null;
  lastCapturedAt?: string | null;
  latestCaptureSourceVersion?: string | null;
  currentSourceVersion?: string | null;
  activeJob?: PageCaptureQueueJob | null;
  latestAttempt?: { status: string; error?: string | null } | null;
  routeExists?: boolean;
  captureSupported?: boolean;
  legacyPageStatus?: ProjectPageRecord['status'];
};

export function resolvePageCaptureState(input: PageCaptureStateInput): ResolvedPageCaptureState {
  const routeExists = input.routeExists !== false;
  const captureSupported = input.captureSupported !== false;

  if (!routeExists || !captureSupported) return 'UNSUPPORTED';

  if (input.activeJob?.status === 'CAPTURING') return 'CAPTURING';
  if (input.activeJob?.status === 'QUEUED') return 'QUEUED';
  if (input.activeJob?.status === 'FAILED') return 'FAILED';

  if (input.latestAttempt?.status === 'FAILED') return 'FAILED';

  const hasCapture = Boolean(input.lastCapturedAt || input.latestCaptureId);

  if (!hasCapture) {
    return 'NEVER_CAPTURED';
  }

  if (input.legacyPageStatus === 'CAPTURE_FAILED') return 'FAILED';
  if (input.legacyPageStatus === 'CAPTURING') return 'CAPTURING';
  if (input.legacyPageStatus === 'CAPTURE_PENDING') return 'QUEUED';

  if (
    input.latestCaptureSourceVersion &&
    input.currentSourceVersion &&
    input.latestCaptureSourceVersion !== input.currentSourceVersion
  ) {
    return 'STALE';
  }

  if (input.legacyPageStatus === 'STALE') return 'STALE';

  if (input.legacyPageStatus === 'CURRENT' || input.legacyPageStatus === 'DISCOVERED') {
    return hasCapture ? 'CURRENT' : 'NEVER_CAPTURED';
  }

  return hasCapture ? 'CURRENT' : 'NEVER_CAPTURED';
}

export function pageRecordToCaptureStateInput(
  page: ProjectPageRecord,
  queueJob?: PageCaptureQueueJob | null,
): PageCaptureStateInput {
  const routeExists = page.isActive && page.status !== 'ROUTE_MISSING' && page.status !== 'REMOVED';
  const captureSupported = page.status !== 'BLOCKED' && page.status !== 'AUTH_REQUIRED';

  return {
    latestCaptureId: page.lastVisualHash ?? null,
    lastCapturedAt: page.lastCapturedAt,
    latestCaptureSourceVersion: page.lastDeploymentId,
    currentSourceVersion: page.lastDeploymentId,
    activeJob: queueJob ?? null,
    routeExists,
    captureSupported,
    legacyPageStatus: page.status,
  };
}

export function resolvePageCaptureStateFromRecord(
  page: ProjectPageRecord,
  queueJob?: PageCaptureQueueJob | null,
): ResolvedPageCaptureState {
  return resolvePageCaptureState(pageRecordToCaptureStateInput(page, queueJob));
}

export function mapResolvedStateToMirrorFilter(state: ResolvedPageCaptureState): string {
  if (state === 'NEVER_CAPTURED') return 'NEVER CAPTURED';
  if (state === 'UNSUPPORTED') return 'BLOCKED';
  return state;
}
