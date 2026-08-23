import type { AppetiteQuestionStep } from '../../../../shared/site00-brand-lore/founderCreativeAppetite/questions';
import { FOUNDER_CREATIVE_APPETITE_QUESTIONS } from '../../../../shared/site00-brand-lore/founderCreativeAppetite/questions';
import { resolveProjectLoreCalibrationStepIndex } from '../../../../shared/site00-brand-lore/adaptivity';

export type ProjectCreativeAppetiteResumeState = {
  stepIds: string[];
  stepId: string;
  answers: Record<string, string | string[]>;
  updatedAt: number;
};

const STORAGE_PREFIX = 'site00_project_creative_appetite_v1_';

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

export function readProjectCreativeAppetiteResume(projectSlug: string): ProjectCreativeAppetiteResumeState | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(storageKey(projectSlug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProjectCreativeAppetiteResumeState;
    if (!parsed?.stepId || !parsed.answers || !Array.isArray(parsed.stepIds)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeProjectCreativeAppetiteResume(
  projectSlug: string,
  state: Omit<ProjectCreativeAppetiteResumeState, 'updatedAt'>,
): void {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(
    storageKey(projectSlug),
    JSON.stringify({ ...state, updatedAt: Date.now() } satisfies ProjectCreativeAppetiteResumeState),
  );
}

export function clearProjectCreativeAppetiteResume(projectSlug: string): void {
  getStorage()?.removeItem(storageKey(projectSlug));
}

export function resolveProjectCreativeAppetiteResume(
  steps: AppetiteQuestionStep[],
  serverAnswers: Record<string, string | string[]>,
  projectSlug: string,
): { answers: Record<string, string | string[]>; stepIndex: number } {
  const stepIds = steps.map((s) => s.id);
  const mergedAnswers = { ...serverAnswers };
  const saved = readProjectCreativeAppetiteResume(projectSlug);
  if (saved?.stepIds?.join('|') === stepIds.join('|')) {
    Object.assign(mergedAnswers, saved.answers);
  }
  const stepIndex = resolveProjectLoreCalibrationStepIndex(steps, mergedAnswers);
  return { answers: mergedAnswers, stepIndex };
}

export const CREATIVE_APPETITE_STEPS = FOUNDER_CREATIVE_APPETITE_QUESTIONS;
