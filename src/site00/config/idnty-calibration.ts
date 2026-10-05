/**
 * Identity Calibration — step labels and capture-state helpers for mobile onboarding UI.
 */

import type { IdntyAssessmentStep } from './idnty-assessment';
import type { StepFormValue } from '../components/idnty-assessment/IdntyStepForm';

/** Short category labels shown on the progress rail / capture module. */
export const IDNTY_CALIBRATION_STEP_LABELS: Record<string, string> = {
  project: 'BUILD TYPE',
  goal: 'GOAL',
  audience: 'AUDIENCE',
  timeline: 'TIMELINE',
  budget: 'BUDGET',
  assets: 'ASSETS',
  'cohesion-diagnostic': 'COHESION',
  'other-specify': 'SPECIFY',
  gaps: 'GAPS',
  pathways: 'PATHWAYS',
  goals: 'GOALS',
  services: 'SERVICES',
  scope: 'SCOPE',
};

export function getCalibrationStepLabel(stepId: string): string {
  return IDNTY_CALIBRATION_STEP_LABELS[stepId] ?? stepId.replace(/-/g, ' ').toUpperCase();
}

function normalizeMulti(value: StepFormValue): string[] {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return [value];
}

function normalizeText(value: StepFormValue): string {
  return typeof value === 'string' ? value : '';
}

export function isCalibrationInputCaptured(step: IdntyAssessmentStep, value: StepFormValue): boolean {
  if (step.type === 'textarea') return normalizeText(value).trim().length > 0;
  if (step.type === 'single' || step.type === 'multi') return normalizeMulti(value).length > 0;
  return false;
}

export type CalibrationCaptureStatus = {
  captured: boolean;
  primary: string;
  secondary: string;
};

export function getCalibrationCaptureStatus(
  stepIndex: number,
  step: IdntyAssessmentStep,
  value: StepFormValue,
): CalibrationCaptureStatus {
  const inputNum = String(stepIndex + 1).padStart(2, '0');
  const category = getCalibrationStepLabel(step.id);

  if (!isCalibrationInputCaptured(step, value)) {
    return {
      captured: false,
      primary: `INPUT ${inputNum}`,
      secondary: 'AWAITING SELECTION',
    };
  }

  if (step.type === 'textarea') {
    const len = normalizeText(value).trim().length;
    return {
      captured: true,
      primary: `INPUT ${inputNum} CAPTURED`,
      secondary: `${category} / ${len} CHARS`,
    };
  }

  if (step.type === 'single') {
    return {
      captured: true,
      primary: `INPUT ${inputNum} CAPTURED`,
      secondary: `${category} / 01 SELECTION`,
    };
  }

  const count = normalizeMulti(value).length;
  const countLabel = String(count).padStart(2, '0');
  return {
    captured: true,
    primary: `INPUT ${inputNum} CAPTURED`,
    secondary: `${category} / ${countLabel} SELECTION${count === 1 ? '' : 'S'}`,
  };
}
