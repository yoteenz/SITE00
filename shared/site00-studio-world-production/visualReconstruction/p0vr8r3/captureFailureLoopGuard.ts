/**
 * P0.VR.8R3 — Stop retrying when same page/viewport fails with same error repeatedly.
 */

const failureCounts = new Map<string, { errorCode: string; count: number }>();

function guardKey(projectId: string, pageId: string, viewport: string): string {
  return `${projectId}:${pageId}:${viewport}`;
}

export const CAPTURE_FAILURE_LOOP_MAX = 3;

export function recordCaptureFailure(
  projectId: string,
  pageId: string,
  viewport: string,
  errorCode: string,
): void {
  const key = guardKey(projectId, pageId, viewport);
  const prev = failureCounts.get(key);
  if (prev?.errorCode === errorCode) {
    failureCounts.set(key, { errorCode, count: prev.count + 1 });
  } else {
    failureCounts.set(key, { errorCode, count: 1 });
  }
}

export function shouldBlockCaptureRetry(
  projectId: string,
  pageId: string,
  viewport: string,
  errorCode: string,
): boolean {
  const key = guardKey(projectId, pageId, viewport);
  const prev = failureCounts.get(key);
  return Boolean(prev && prev.errorCode === errorCode && prev.count >= CAPTURE_FAILURE_LOOP_MAX);
}

export function clearCaptureFailureLoopGuardForTest(): void {
  failureCounts.clear();
}
