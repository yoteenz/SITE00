/**
 * P0.VR.8R3R5 — Founder-facing capture guidance (presentation layer, browser-safe).
 */

import type { ProjectCaptureRunContract } from './projectCaptureRunContract.js';

export type FounderCaptureWorkflowStage =
  | 'SERVICE_CHECK'
  | 'TEST_WORKER'
  | 'CAPTURE_PROJECT'
  | 'REVIEW_RESULTS';

export type FounderPrimaryAction =
  | 'CHECK_AGAIN'
  | 'TEST_WORKER'
  | 'REFRESH_PROJECT'
  | 'VIEW_PROGRESS'
  | 'REVIEW_ISSUES'
  | 'REVIEW_CAPTURES'
  | 'RETRY_TEST';

export type FounderSecondaryAction = 'VIEW_DETAILS' | 'VIEW_TEST_RESULT' | 'CAPTURE_OPTIONS';

export type CaptureFounderVisualState =
  | 'ready'
  | 'attention'
  | 'progress'
  | 'success'
  | 'partial'
  | 'failed';

export type TestWorkerProgressStep =
  | 'CONNECTING'
  | 'STARTING_BROWSER'
  | 'RUNNING_TEST'
  | 'VERIFYING'
  | 'COMPLETE'
  | 'FAILED';

export const TEST_WORKER_PROGRESS_STEPS: TestWorkerProgressStep[] = [
  'CONNECTING',
  'STARTING_BROWSER',
  'RUNNING_TEST',
  'VERIFYING',
];

export type CaptureFounderGuidance = {
  stage: FounderCaptureWorkflowStage;
  headline: string;
  supportingText: string;
  primaryAction: FounderPrimaryAction | null;
  primaryLabel: string;
  secondaryAction: FounderSecondaryAction | null;
  secondaryLabel: string | null;
  visualState: CaptureFounderVisualState;
  nextSteps: string[];
  serviceReady: boolean;
  captureReady: boolean;
};

export type CaptureFounderGuidanceInput = {
  apiConnected: boolean;
  workerHealthy: boolean;
  browserReady: boolean;
  contractValid: boolean;
  testJobPassed: boolean;
  testingWorker: boolean;
  testWorkerFailed: boolean;
  isRefreshing: boolean;
  run: Pick<
    ProjectCaptureRunContract,
    'status' | 'contractValid' | 'totalTargets' | 'completedCount' | 'failedCount' | 'capturingCount' | 'queuedCount'
  > | null;
  summary: {
    totalPages: number;
    current: number;
    neverCaptured: number;
    queued: number;
    capturing: number;
    failed: number;
    stale: number;
  };
  projectName?: string;
};

export function resolveFounderCaptureWorkflowStage(input: CaptureFounderGuidanceInput): FounderCaptureWorkflowStage {
  const serviceReady =
    input.apiConnected && input.workerHealthy && input.browserReady && input.contractValid;

  if (!serviceReady) return 'SERVICE_CHECK';
  if (!input.testJobPassed && !input.isRefreshing) return 'TEST_WORKER';

  const run = input.run;
  const runActive =
    run?.contractValid &&
    run.totalTargets > 0 &&
    ['PLANNING', 'QUEUING', 'CAPTURING'].includes(run.status);
  const runDone =
    run?.contractValid &&
    run.totalTargets > 0 &&
    ['COMPLETE', 'PARTIAL', 'FAILED'].includes(run.status);

  if (input.isRefreshing || runActive) return 'CAPTURE_PROJECT';
  if (runDone || input.summary.current > 0) return 'REVIEW_RESULTS';
  if (input.testJobPassed) return 'CAPTURE_PROJECT';
  return 'TEST_WORKER';
}

export function buildCaptureFounderGuidance(input: CaptureFounderGuidanceInput): CaptureFounderGuidance {
  const project = (input.projectName ?? 'PROJECT').toUpperCase();
  const run = input.run;
  const progressDone = run ? run.completedCount + run.failedCount : 0;
  const progressTotal = run?.totalTargets ?? input.summary.totalPages;
  const runActive =
    input.isRefreshing ||
    (run?.contractValid && ['PLANNING', 'QUEUING', 'CAPTURING'].includes(run.status));

  const stage = resolveFounderCaptureWorkflowStage(input);

  if (!input.apiConnected) {
    return {
      stage,
      headline: 'CONNECTION ISSUE',
      supportingText: 'We could not reach the capture service. Check your connection and try again.',
      primaryAction: 'CHECK_AGAIN',
      primaryLabel: 'CHECK AGAIN',
      secondaryAction: 'VIEW_DETAILS',
      secondaryLabel: 'VIEW DETAILS',
      visualState: 'attention',
      nextSteps: ['CHECK CONNECTION', 'TEST CAPTURE WORKER', 'REFRESH PROJECT'],
      serviceReady: false,
      captureReady: false,
    };
  }

  if (!input.workerHealthy || !input.browserReady) {
    return {
      stage: 'SERVICE_CHECK',
      headline: 'CAPTURE SERVICE NEEDS ATTENTION',
      supportingText: input.browserReady
        ? 'The capture worker is not ready yet.'
        : 'The browser could not start. This is required before page captures can run.',
      primaryAction: 'CHECK_AGAIN',
      primaryLabel: 'CHECK AGAIN',
      secondaryAction: 'VIEW_DETAILS',
      secondaryLabel: 'VIEW DETAILS',
      visualState: 'attention',
      nextSteps: ['CHECK CONNECTION', 'TEST CAPTURE WORKER', 'REFRESH PROJECT'],
      serviceReady: false,
      captureReady: false,
    };
  }

  if (input.testingWorker) {
    return {
      stage: 'TEST_WORKER',
      headline: 'TESTING CAPTURE WORKER',
      supportingText: 'Running a quick test capture before refreshing your pages.',
      primaryAction: null,
      primaryLabel: 'TESTING…',
      secondaryAction: null,
      secondaryLabel: null,
      visualState: 'progress',
      nextSteps: ['TEST CAPTURE WORKER', 'REFRESH PROJECT', 'REVIEW YOUR PAGE CAPTURES'],
      serviceReady: true,
      captureReady: false,
    };
  }

  if (input.testWorkerFailed) {
    return {
      stage: 'TEST_WORKER',
      headline: 'WORKER NEEDS ATTENTION',
      supportingText: 'The test capture could not complete. Retry the test or view details.',
      primaryAction: 'RETRY_TEST',
      primaryLabel: 'RETRY TEST',
      secondaryAction: 'VIEW_DETAILS',
      secondaryLabel: 'VIEW DETAILS',
      visualState: 'failed',
      nextSteps: ['TEST CAPTURE WORKER', 'REFRESH PROJECT', 'REVIEW YOUR PAGE CAPTURES'],
      serviceReady: true,
      captureReady: false,
    };
  }

  if (!input.testJobPassed) {
    return {
      stage: 'TEST_WORKER',
      headline: 'TEST THE CAPTURE SYSTEM',
      supportingText: "We'll run one quick check before refreshing your pages.",
      primaryAction: 'TEST_WORKER',
      primaryLabel: 'TEST WORKER',
      secondaryAction: 'VIEW_DETAILS',
      secondaryLabel: 'VIEW DETAILS',
      visualState: 'ready',
      nextSteps: ['TEST CAPTURE WORKER', 'REFRESH PROJECT', 'REVIEW YOUR PAGE CAPTURES'],
      serviceReady: true,
      captureReady: false,
    };
  }

  if (runActive && progressTotal > 0) {
    return {
      stage: 'CAPTURE_PROJECT',
      headline: `REFRESHING ${project}`,
      supportingText: `${progressDone} of ${progressTotal} pages complete.`,
      primaryAction: 'VIEW_PROGRESS',
      primaryLabel: 'VIEW PROGRESS',
      secondaryAction: 'VIEW_DETAILS',
      secondaryLabel: 'VIEW DETAILS',
      visualState: 'progress',
      nextSteps: [`REFRESHING ${progressTotal} PAGES`, 'REVIEW YOUR PAGE CAPTURES'],
      serviceReady: true,
      captureReady: true,
    };
  }

  if (run?.contractValid && run.failedCount > 0 && !runActive) {
    return {
      stage: 'REVIEW_RESULTS',
      headline: `${project} CAPTURE COMPLETE`,
      supportingText: `${run.completedCount} pages are current. ${run.failedCount} need review.`,
      primaryAction: 'REVIEW_ISSUES',
      primaryLabel: `REVIEW ${run.failedCount} ISSUE${run.failedCount === 1 ? '' : 'S'}`,
      secondaryAction: 'VIEW_DETAILS',
      secondaryLabel: 'VIEW ALL CAPTURES',
      visualState: 'partial',
      nextSteps: ['REVIEW ISSUES', 'COMPARE LIVE VS REFERENCE'],
      serviceReady: true,
      captureReady: true,
    };
  }

  if (run?.contractValid && run.status === 'COMPLETE' && run.failedCount === 0 && run.totalTargets > 0) {
    return {
      stage: 'REVIEW_RESULTS',
      headline: `${project} CAPTURE COMPLETE ✓`,
      supportingText: `${run.completedCount} / ${run.totalTargets} pages are current.`,
      primaryAction: 'REVIEW_CAPTURES',
      primaryLabel: 'REVIEW CAPTURES',
      secondaryAction: 'VIEW_DETAILS',
      secondaryLabel: 'SCREEN REPLICATION QA',
      visualState: 'success',
      nextSteps: ['REVIEW CAPTURES', 'COMPARE LIVE VS REFERENCE'],
      serviceReady: true,
      captureReady: true,
    };
  }

  return {
    stage: 'CAPTURE_PROJECT',
    headline: 'READY TO CAPTURE',
    supportingText: `${input.summary.totalPages} ${project} pages are ready to refresh.`,
    primaryAction: 'REFRESH_PROJECT',
    primaryLabel: 'REFRESH PROJECT',
    secondaryAction: 'CAPTURE_OPTIONS',
    secondaryLabel: 'CAPTURE OPTIONS',
    visualState: 'ready',
    nextSteps: ['REFRESH PROJECT', 'REVIEW YOUR PAGE CAPTURES'],
    serviceReady: true,
    captureReady: true,
  };
}

export function founderPageStatusLabel(technical: string): string {
  const key = technical.toUpperCase().replace(/\s+/g, '_');
  const map: Record<string, string> = {
    NEVER_CAPTURED: 'NOT CAPTURED YET',
    QUEUED: 'WAITING',
    CAPTURE_PENDING: 'WAITING',
    FAILED: 'NEED REVIEW',
    CAPTURE_FAILED: 'NEED REVIEW',
    CURRENT: 'CURRENT',
    CAPTURING: 'CAPTURING',
    STALE: 'NEEDS REFRESH',
    UNSUPPORTED: 'UNSUPPORTED',
    BLOCKED: 'BLOCKED',
    'MISSING REF': 'MISSING REF',
    'REFERENCE READY': 'REFERENCE READY',
  };
  return map[key] ?? technical.replace(/_/g, ' ');
}

export type FounderSummaryChip = {
  label: string;
  value: number;
  key: string;
};

export function founderSummaryChips(
  summary: CaptureFounderGuidanceInput['summary'],
  runActive: boolean,
): FounderSummaryChip[] {
  const chips: FounderSummaryChip[] = [{ label: 'PAGES', value: summary.totalPages, key: 'total' }];

  if (runActive) {
    if (summary.current > 0) chips.push({ label: 'CURRENT', value: summary.current, key: 'current' });
    if (summary.capturing > 0) chips.push({ label: 'CAPTURING', value: summary.capturing, key: 'capturing' });
    const waiting = summary.queued + summary.neverCaptured;
    if (waiting > 0) chips.push({ label: 'WAITING', value: waiting, key: 'waiting' });
    if (summary.failed > 0) chips.push({ label: 'NEED REVIEW', value: summary.failed, key: 'failed' });
    return chips;
  }

  if (summary.neverCaptured > 0) chips.push({ label: 'NOT CAPTURED', value: summary.neverCaptured, key: 'never' });
  if (summary.current > 0) chips.push({ label: 'CURRENT', value: summary.current, key: 'current' });
  if (summary.failed > 0) chips.push({ label: 'NEED REVIEW', value: summary.failed, key: 'failed' });
  if (summary.stale > 0) chips.push({ label: 'NEEDS REFRESH', value: summary.stale, key: 'stale' });
  return chips;
}

export function founderPageFilterLabels(runActive: boolean): string[] {
  const base = ['ALL', 'CURRENT', 'NOT CAPTURED', 'NEEDS REFRESH', 'NEED REVIEW'];
  if (runActive) return [...base.slice(0, 1), 'CAPTURING', 'WAITING', ...base.slice(1)];
  return base;
}

export function mapFounderFilterToMirror(filter: string): string {
  const map: Record<string, string> = {
    'NOT CAPTURED': 'NEVER CAPTURED',
    'NEEDS REFRESH': 'STALE',
    'NEED REVIEW': 'FAILED',
    WAITING: 'QUEUED',
  };
  return map[filter] ?? filter;
}

export function testWorkerStepLabel(step: TestWorkerProgressStep): string {
  const labels: Record<TestWorkerProgressStep, string> = {
    CONNECTING: 'CONNECTING',
    STARTING_BROWSER: 'STARTING BROWSER',
    RUNNING_TEST: 'RUNNING TEST CAPTURE',
    VERIFYING: 'VERIFYING OUTPUT',
    COMPLETE: 'COMPLETE',
    FAILED: 'FAILED',
  };
  return labels[step];
}

export function mapWorkerEventToTestStep(eventType: string): TestWorkerProgressStep | null {
  switch (eventType) {
    case 'WORKER_REGISTERED':
    case 'WORKER_BOOTING':
      return 'CONNECTING';
    case 'BROWSER_READY':
    case 'PLAYWRIGHT_READY':
      return 'STARTING_BROWSER';
    case 'CAPTURE_STARTED':
    case 'JOB_ACKNOWLEDGED':
      return 'RUNNING_TEST';
    case 'CAPTURE_COMPLETED':
    case 'TEST_JOB_COMPLETE':
      return 'VERIFYING';
    default:
      return null;
  }
}
