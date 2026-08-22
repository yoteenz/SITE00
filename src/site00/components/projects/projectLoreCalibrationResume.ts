import type { ReadinessDomain } from '../../../../shared/site00-brand-lore/types';
import {
  calibrationScopeDomains,
  mergeCanonicalCalibrationStepIds,
  missingDomainsToLoreSteps,
} from '../../../../shared/site00-brand-lore/readiness';
import type { LoreQuestionStep } from '../../../../shared/site00-brand-lore/idnty-lore-questions';
import { getLoreQuestion } from '../../../../shared/site00-brand-lore/idnty-lore-questions';
import { resolveProjectLoreCalibrationStepIndex } from '../../../../shared/site00-brand-lore/adaptivity';

export type ProjectLoreCalibrationResumeState = {
  /** Frozen questionnaire for this calibration session — never shrinks on refresh. */
  stepIds: string[];
  stepId: string;
  answers: Record<string, string | string[]>;
  updatedAt: number;
};

const STORAGE_PREFIX = 'site00_project_lore_calibration_v3_';

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

function loreStepsFromIds(stepIds: string[]): LoreQuestionStep[] {
  return stepIds
    .map((id) => getLoreQuestion(id))
    .filter((step): step is LoreQuestionStep => Boolean(step));
}

function scopeStepIds(
  missingDomains: ReadinessDomain[],
  serverAnswers: Record<string, string | string[]>,
): string[] {
  return missingDomainsToLoreSteps(calibrationScopeDomains(missingDomains, serverAnswers));
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
    if (
      !parsed ||
      typeof parsed.stepId !== 'string' ||
      typeof parsed.answers !== 'object' ||
      !Array.isArray(parsed.stepIds) ||
      parsed.stepIds.length === 0
    ) {
      return null;
    }
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
  const existing = readProjectLoreCalibrationResume(projectSlug);
  const stepIds = mergeCanonicalCalibrationStepIds(existing?.stepIds ?? [], state.stepIds);
  if (stepIds.length === 0) return;
  try {
    const payload: ProjectLoreCalibrationResumeState = {
      ...state,
      stepIds,
      updatedAt: Date.now(),
    };
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

/** Use frozen session steps when resuming; expand if scope grows (e.g. 6 → 8 steps). */
export function resolveCalibrationSessionStepIds(
  projectSlug: string,
  missingDomains: ReadinessDomain[],
  serverAnswers: Record<string, string | string[]> = {},
): string[] {
  const computed = scopeStepIds(missingDomains, serverAnswers);
  const local = readProjectLoreCalibrationResume(projectSlug);

  if (local?.stepIds.length) {
    const merged = mergeCanonicalCalibrationStepIds(local.stepIds, computed);
    if (merged.length > local.stepIds.length) {
      writeProjectLoreCalibrationResume(projectSlug, {
        stepIds: merged,
        stepId: local.stepId,
        answers: local.answers,
      });
    }
    return merged;
  }

  return computed;
}

/** Persist the full step list the first time a calibration session starts. */
export function bootstrapCalibrationSession(
  projectSlug: string,
  sessionStepIds: string[],
  serverAnswers: Record<string, string | string[]>,
): void {
  if (sessionStepIds.length === 0) return;
  if (readProjectLoreCalibrationResume(projectSlug)?.stepIds.length) return;

  const steps = loreStepsFromIds(sessionStepIds);
  const stepIndex = resolveProjectLoreCalibrationStepIndex(steps, serverAnswers);
  writeProjectLoreCalibrationResume(projectSlug, {
    stepIds: sessionStepIds,
    stepId: sessionStepIds[stepIndex] ?? sessionStepIds[0]!,
    answers: { ...serverAnswers },
  });
}

/** Merge server-persisted answers with local draft; pick the correct step index on refresh. */
export function resolveProjectLoreCalibrationResume(
  steps: LoreQuestionStep[],
  serverAnswers: Record<string, string | string[]>,
  projectSlug: string,
): { answers: Record<string, string | string[]>; stepIndex: number } {
  const local = readProjectLoreCalibrationResume(projectSlug);
  const sessionSteps = local?.stepIds.length ? loreStepsFromIds(local.stepIds) : steps;
  const baseIndex = resolveProjectLoreCalibrationStepIndex(sessionSteps, serverAnswers);
  let stepIndex = baseIndex;
  let answers = { ...serverAnswers };

  if (local?.stepId) {
    const localIndex = sessionSteps.findIndex((step) => step.id === local.stepId);
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
