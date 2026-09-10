/**
 * P0.VR.MOF.R2 — Shared MORE hub / child-page status helpers.
 */

import type { ProjectCaptureRefreshState } from '../usePageMirror';

export type MoreVisualState = 'ready' | 'attention' | 'progress' | 'success' | 'offline' | 'neutral' | 'unknown';

export type MoreSummaryTone = 'ready' | 'attention' | 'neutral' | 'offline' | 'active';

export function captureNeedsAttention(captureRefresh?: ProjectCaptureRefreshState): boolean {
  const transport = captureRefresh?.transportHealth;
  if (!transport) return true;
  if (!transport.apiReachable) return true;
  if (transport.workerStatus !== 'HEALTHY') return true;
  if (!transport.browserReady || !transport.playwrightReady) return true;
  if (!transport.testJobPassed && !captureRefresh?.testJobPassed) return true;
  return false;
}

export function captureHeadline(captureRefresh?: ProjectCaptureRefreshState): string {
  if (captureRefresh?.testingWorker) return 'TESTING CAPTURE WORKER';
  if (captureRefresh?.testWorkerProgress === 'COMPLETE' && captureRefresh.testJobPassed) return 'WORKER READY ✓';
  if (captureRefresh?.testWorkerFailed) return 'WORKER NEEDS ATTENTION';
  if (captureNeedsAttention(captureRefresh)) return 'NEEDS ATTENTION';
  return 'READY';
}

export function captureSupportText(captureRefresh?: ProjectCaptureRefreshState): string {
  const transport = captureRefresh?.transportHealth;
  if (captureRefresh?.testingWorker) return 'Running a quick test before page captures can run.';
  if (captureRefresh?.testWorkerFailed) {
    if (transport?.browserBootErrorCode === 'SHARED_LIBRARY_MISSING') {
      return 'Chromium is installed, but a required system library is missing.';
    }
    return transport?.browserReady === false
      ? 'The worker is online, but the browser could not start.'
      : 'The test capture could not complete. Retry the test or view details.';
  }
  if (!transport?.apiReachable) return 'We could not reach the capture API. Check your connection and try again.';
  if (transport.workerStatus !== 'HEALTHY') return 'The capture worker is not responding. Test the worker or retry connection.';
  if (!transport.browserReady) return 'The worker is online, but the browser is not ready to capture pages.';
  if (!transport.playwrightReady) return 'Playwright is not ready yet. Test the worker to verify the stack.';
  if (!transport.testJobPassed && !captureRefresh?.testJobPassed) return 'Run a quick worker test before refreshing project pages.';
  return 'The capture system is ready to run.';
}

export function captureVisualState(captureRefresh?: ProjectCaptureRefreshState): MoreVisualState {
  if (captureRefresh?.testingWorker) return 'progress';
  if (captureRefresh?.testWorkerProgress === 'COMPLETE' && captureRefresh.testJobPassed) return 'success';
  if (captureRefresh?.testWorkerFailed || captureNeedsAttention(captureRefresh)) return 'attention';
  return 'ready';
}

export function humanWorkerStatus(raw: string | undefined | null): string {
  if (!raw) return 'UNKNOWN';
  const key = raw.toUpperCase();
  if (key === 'HEALTHY') return 'ONLINE';
  if (key === 'DEGRADED') return 'NEEDS ATTENTION';
  if (key === 'UNAVAILABLE' || key === 'OFFLINE') return 'OFFLINE';
  return raw.replace(/_/g, ' ');
}

export function humanBoolReady(value: boolean | undefined, readyLabel = 'READY', notLabel = 'NOT READY'): string {
  if (value === undefined) return 'UNKNOWN';
  return value ? readyLabel : notLabel;
}

export function humanConnection(reachable: boolean | undefined): string {
  if (reachable === undefined) return 'CHECKING';
  return reachable ? 'CONNECTED' : 'OFFLINE';
}
