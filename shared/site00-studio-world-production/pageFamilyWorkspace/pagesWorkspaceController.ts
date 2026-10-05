/**
 * P0.PCI.3R1 — PagesWorkspaceController: Page Family Workspace owns root; capture is subflow only.
 */

import type { CaptureFounderGuidanceInput } from '../visualReconstruction/p0vr8r3/captureFounderGuidance.js';
import type { PagesWizardStep } from '../visualReconstruction/p0vr8r3r1/designWizardSteps.js';
import { PAGES_CAPTURE_FLOW_STEPS, normalizePagesWizardStep } from '../visualReconstruction/p0vr8r3r1/designWizardSteps.js';

export const PAGES_WORKSPACE_STATES = [
  'FAMILY_OVERVIEW',
  'FAMILY_MAPPING',
  'FAMILY_CONFIRMATION',
  'DERIVATIVE_REVIEW',
  'DESIGN_APPROVAL',
  'WIRING_REVIEW',
  'FAMILY_COMPLETE',
] as const;

export type PagesWorkspaceState = (typeof PAGES_WORKSPACE_STATES)[number];

export const DEFAULT_PAGES_WIZARD_STEP: PagesWizardStep = 'family';

export function isCaptureSubflowStep(step: PagesWizardStep): boolean {
  return PAGES_CAPTURE_FLOW_STEPS.includes(step) || step === 'landing';
}

export function mapWizardStepToWorkspaceState(step: PagesWizardStep): PagesWorkspaceState {
  switch (step) {
    case 'family':
    case 'library':
      return 'FAMILY_OVERVIEW';
    case 'detail':
    case 'compare':
      return 'DERIVATIVE_REVIEW';
    default:
      if (isCaptureSubflowStep(step)) return 'FAMILY_OVERVIEW';
      return 'FAMILY_OVERVIEW';
  }
}

/**
 * Root pages experience always defaults to family workspace.
 * Capture subflow only when explicitly deep-linked or an active capture run is in progress.
 */
export function resolveDefaultPagesStep(
  urlStep: string | undefined,
  input: CaptureFounderGuidanceInput & { testWorkerJustPassed?: boolean },
): PagesWizardStep {
  const explicit = urlStep ? normalizePagesWizardStep(urlStep) : null;

  if (explicit === 'landing') return DEFAULT_PAGES_WIZARD_STEP;

  const run = input.run;
  const runActive =
    input.isRefreshing ||
    (run?.contractValid && ['PLANNING', 'QUEUING', 'CAPTURING'].includes(run.status));

  if (runActive) {
    if (explicit && isCaptureSubflowStep(explicit)) return explicit;
    return 'capture-running';
  }

  const runDone =
    run?.contractValid &&
    run.totalTargets > 0 &&
    ['COMPLETE', 'PARTIAL', 'FAILED'].includes(run.status);

  if (explicit === 'capture-results' && runDone) return 'capture-results';

  if (explicit && explicit !== DEFAULT_PAGES_WIZARD_STEP) {
    if (isCaptureSubflowStep(explicit)) return explicit;
    return explicit;
  }

  return DEFAULT_PAGES_WIZARD_STEP;
}

/** @deprecated use resolveDefaultPagesStep — kept for import compatibility */
export function resolvePagesWizardResumeStep(
  urlStep: string | undefined,
  input: CaptureFounderGuidanceInput & { testWorkerJustPassed?: boolean },
): PagesWizardStep {
  return resolveDefaultPagesStep(urlStep, input);
}

export function captureSubflowReturnStep(): PagesWizardStep {
  return DEFAULT_PAGES_WIZARD_STEP;
}

export function shouldAutoAdvanceCaptureRunning(activeStep: PagesWizardStep, runActive: boolean): boolean {
  return runActive && isCaptureSubflowStep(activeStep);
}
