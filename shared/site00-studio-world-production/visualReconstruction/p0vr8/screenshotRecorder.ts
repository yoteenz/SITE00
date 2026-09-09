/**
 * P0.VR.8 — ProjectPageScreenshotRecorder — wraps P0.VR.3E capture engine.
 */

import { captureImplementationSnapshot as captureImpl } from '../p0vr3e/implementationSnapshotCaptureEngine.js';
import type { DesignViewportClass } from '../p0vr2/types.js';
import { evaluatePageCaptureReady, isRouteCaptureError } from './captureReadyContract.js';
import { registerProjectPageSnapshot, implementationToPageSnapshot } from './pageSnapshotStore.js';
import { getProjectPageRecord, upsertProjectPageRecord } from './projectPageRegistry.js';
import { completeCaptureJob, startCaptureJob, enqueuePageCapture } from './captureQueue.js';
import { resolveProjectLiveBaseUrl } from './projectBaseUrl.js';
import type { ProjectPageSnapshotCaptureType } from './types.js';

export async function captureImplementationSnapshot(input: {
  projectId: string;
  screenId: string;
  pageId: string;
  viewportClass: DesignViewportClass;
  baseUrl?: string | null;
  repoRoot?: string;
  captureType?: ProjectPageSnapshotCaptureType;
  jobId?: string;
  deploymentId?: string | null;
}) {
  const page = getProjectPageRecord(input.projectId, input.pageId);
  if (page) {
    upsertProjectPageRecord({ ...page, status: 'CAPTURING' });
  }

  if (input.jobId) startCaptureJob(input.jobId);

  const ready = evaluatePageCaptureReady({});
  if (!ready.ready) {
    if (input.jobId) completeCaptureJob(input.jobId, false);
    throw new Error(ready.blockReason ?? 'PAGE_HALF_RENDER_CAPTURED');
  }

  try {
    const impl = await captureImpl({
      projectId: input.projectId,
      screenId: input.screenId,
      viewportClass: input.viewportClass,
      baseUrl: input.baseUrl ?? resolveProjectLiveBaseUrl(input.projectId),
    });

    if (!impl) {
      if (input.jobId) completeCaptureJob(input.jobId, false);
      if (page) upsertProjectPageRecord({ ...page, status: 'CAPTURE_FAILED' });
      throw new Error('PAGE_SCREENSHOT_CAPTURE_FAILED');
    }

    if (isRouteCaptureError({ httpStatus: impl.qaPassed ? 200 : 500, is404: impl.captureStatus === 'MISSING' })) {
      if (input.jobId) completeCaptureJob(input.jobId, false);
      if (page) upsertProjectPageRecord({ ...page, status: 'CAPTURE_FAILED' });
      return impl;
    }

    const pageSnap = registerProjectPageSnapshot(
      implementationToPageSnapshot(impl, input.pageId, input.captureType ?? 'LIVE_CURRENT'),
    );

    if (page) {
      upsertProjectPageRecord({
        ...page,
        status: 'CURRENT',
        lastCapturedAt: impl.capturedAt,
        lastVisualHash: impl.snapshotId,
        lastDeploymentId: input.deploymentId ?? page.lastDeploymentId,
      });
    }

    if (input.jobId) completeCaptureJob(input.jobId, true);
    return { ...impl, pageSnapshot: pageSnap };
  } catch (err) {
    if (input.jobId) completeCaptureJob(input.jobId, false);
    if (page) upsertProjectPageRecord({ ...page, status: 'CAPTURE_FAILED' });
    throw err;
  }
}

export function queuePageScreenshotCapture(input: {
  projectId: string;
  pageId: string;
  route: string;
  viewport: DesignViewportClass;
  reason: string;
  deploymentId?: string | null;
}) {
  return enqueuePageCapture(input);
}
