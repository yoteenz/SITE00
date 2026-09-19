/**
 * P0.VR.8R3R5 — Founder capture workflow stage helpers.
 */

import type { FounderCaptureWorkflowStage } from './captureFounderGuidance.js';

export type FounderCaptureWorkflowStageId =
  | '01_SERVICE_CHECK'
  | '02_TEST_WORKER'
  | '03_CAPTURE_PROJECT'
  | '04_REVIEW_RESULTS';

export const FOUNDER_CAPTURE_WORKFLOW_STAGES: Array<{
  id: FounderCaptureWorkflowStageId;
  label: string;
  shortLabel: string;
}> = [
  { id: '01_SERVICE_CHECK', label: 'SERVICE CHECK', shortLabel: 'CHECK' },
  { id: '02_TEST_WORKER', label: 'TEST WORKER', shortLabel: 'TEST' },
  { id: '03_CAPTURE_PROJECT', label: 'CAPTURE PROJECT', shortLabel: 'CAPTURE' },
  { id: '04_REVIEW_RESULTS', label: 'REVIEW RESULTS', shortLabel: 'REVIEW' },
];

export function workflowStageToId(stage: FounderCaptureWorkflowStage): FounderCaptureWorkflowStageId {
  switch (stage) {
    case 'SERVICE_CHECK':
      return '01_SERVICE_CHECK';
    case 'TEST_WORKER':
      return '02_TEST_WORKER';
    case 'CAPTURE_PROJECT':
      return '03_CAPTURE_PROJECT';
    case 'REVIEW_RESULTS':
      return '04_REVIEW_RESULTS';
  }
}

export function isWorkflowStageComplete(
  current: FounderCaptureWorkflowStage,
  target: FounderCaptureWorkflowStage,
  opts: { testPassed: boolean; runComplete: boolean },
): boolean {
  const order: FounderCaptureWorkflowStage[] = [
    'SERVICE_CHECK',
    'TEST_WORKER',
    'CAPTURE_PROJECT',
    'REVIEW_RESULTS',
  ];
  const currentIdx = order.indexOf(current);
  const targetIdx = order.indexOf(target);
  if (targetIdx < currentIdx) return true;
  if (target === 'TEST_WORKER' && opts.testPassed) return true;
  if (target === 'CAPTURE_PROJECT' && opts.runComplete) return true;
  return false;
}
