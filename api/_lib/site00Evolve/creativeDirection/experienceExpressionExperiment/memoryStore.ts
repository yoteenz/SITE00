/**
 * In-memory store for Experiment E experience expression runs (tests).
 */

import type { ExperienceExpressionRun } from '../../../../../shared/site00-brand-lore/experienceExpression/types.js';

const memory = new Map<string, ExperienceExpressionRun>();

export function resetExperimentEMemory(): void {
  memory.clear();
}

export async function getExperienceExpressionRun(runId: string): Promise<ExperienceExpressionRun | null> {
  return memory.get(runId) ?? null;
}

export async function saveExperienceExpressionRun(run: ExperienceExpressionRun): Promise<ExperienceExpressionRun> {
  memory.set(run.runId, run);
  return run;
}
