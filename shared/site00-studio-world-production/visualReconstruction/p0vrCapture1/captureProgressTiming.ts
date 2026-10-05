/**
 * P0.VR.CAPTURE.1R2 — Client-side staged progress while capture API runs.
 */

import { PAGE_CAPTURE_TIMEOUT_MS } from './constants.js';
import { CAPTURE_NOW_PROGRESS_STEPS, type CaptureProgressStep } from './types.js';

/** Spread four UI steps across most of the server capture window. */
export const CAPTURE_NOW_PROGRESS_STAGE_MS = Math.floor(PAGE_CAPTURE_TIMEOUT_MS / CAPTURE_NOW_PROGRESS_STEPS.length);

export const CAPTURE_NOW_SUCCESS_HOLD_MS = 650;

export function captureProgressStepIndex(step: CaptureProgressStep | string | null | undefined): number {
  if (!step) return -1;
  return CAPTURE_NOW_PROGRESS_STEPS.indexOf(step as CaptureProgressStep);
}

export function isCaptureProgressStepComplete(
  step: CaptureProgressStep,
  activeStep: CaptureProgressStep | string | null | undefined,
): boolean {
  const activeIndex = captureProgressStepIndex(activeStep);
  const stepIndex = captureProgressStepIndex(step);
  if (activeIndex < 0 || stepIndex < 0) return false;
  return stepIndex < activeIndex;
}

export type CaptureProgressController = {
  stop: () => void;
};

/** Advance founder-facing steps on a timer until the API responds. */
export function startCaptureProgressAnimation(
  setProgress: (step: CaptureProgressStep) => void,
): CaptureProgressController {
  let index = 0;
  setProgress(CAPTURE_NOW_PROGRESS_STEPS[0]!);
  const timer = setInterval(() => {
    index += 1;
    if (index < CAPTURE_NOW_PROGRESS_STEPS.length) {
      setProgress(CAPTURE_NOW_PROGRESS_STEPS[index]!);
    }
  }, CAPTURE_NOW_PROGRESS_STAGE_MS);

  return {
    stop: () => clearInterval(timer),
  };
}
