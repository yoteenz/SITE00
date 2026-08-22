import type { LoreQuestionStep } from '../../../../shared/site00-brand-lore/idnty-lore-questions';
import { resolveProjectLoreCalibrationStepIndex } from '../../../../shared/site00-brand-lore/adaptivity';

export type ProjectLoreCalibrationResumeState = {
  stepId: string;
  answers: Record<string, string | string[]>;
  updatedAt: number;
};

const STORAGE_PREFIX = 'site00_project_lore_calibration_v1_';

function storageKey(projectSlug: string): string {
  return `${STORAGE_PREFIX}${projectSlug}`;
}

function getStorage(): Storage | null {
  if (typeof globalThis === 'undefined') return null;
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function readProjectLoreCalibrationResume(
  projectSlug: string,
): ProjectLoreCalibrationResumeState | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(storageKey(projectSlug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProjectLoreCalibrationResumeState;
    if (!parsed || typeof parsed.stepId !== 'string' || typeof parsed.answers !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeProjectLoreCalibrationResume(
  projectSlug: string,
  state: Omit<ProjectLoreCalibrationResumeState, 'updatedAt'>,
): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    const payload: ProjectLoreCalibrationResumeState = { ...state, updatedAt: Date.now() };
    storage.setItem(storageKey(projectSlug), JSON.stringify(payload));
  } catch {
    // localStorage may be unavailable in private mode — resume still works from server answers.
  }
}

export function clearProjectLoreCalibrationResume(projectSlug: string): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(storageKey(projectSlug));
  } catch {
    // ignore
  }
}

/** Merge server-persisted answers with local draft; pick the correct step index on refresh. */
export function resolveProjectLoreCalibrationResume(
  steps: LoreQuestionStep[],
  serverAnswers: Record<string, string | string[]>,
  projectSlug: string,
): { answers: Record<string, string | string[]>; stepIndex: number } {
  const baseIndex = resolveProjectLoreCalibrationStepIndex(steps, serverAnswers);
  const local = readProjectLoreCalibrationResume(projectSlug);
  let stepIndex = baseIndex;
  let answers = { ...serverAnswers };

  if (local?.stepId) {
    const localIndex = steps.findIndex((step) => step.id === local.stepId);
    if (localIndex >= 0 && localIndex >= baseIndex) {
      stepIndex = localIndex;
      const draft = local.answers[local.stepId];
      if (draft !== undefined) {
        answers = { ...answers, [local.stepId]: draft };
      }
    }
  }

  return { answers, stepIndex };
}
