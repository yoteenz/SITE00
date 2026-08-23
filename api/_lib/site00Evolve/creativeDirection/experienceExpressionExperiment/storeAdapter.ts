/**
 * Experiment E persistence — memory in tests, memory fallback in dev.
 */

import { hasSupabaseServiceRole } from '../../../supabase.js';
import type { ExperienceExpressionRun } from '../../../../../shared/site00-brand-lore/experienceExpression/types.js';
import { EXPERIMENT_E_RUN_ID } from '../../../../../shared/site00-brand-lore/experienceExpression/constants.js';
import * as mem from './memoryStore.js';

export function useExperimentEMemoryStore(): boolean {
  return process.env.SITE00_EXPERIMENT_E_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

let storeModeCache: 'memory' | null = null;

export async function resolveExperimentEStoreMode(): Promise<'memory'> {
  if (useExperimentEMemoryStore()) {
    storeModeCache = 'memory';
    return 'memory';
  }
  if (!hasSupabaseServiceRole()) {
    storeModeCache = 'memory';
    return 'memory';
  }
  storeModeCache = 'memory';
  return 'memory';
}

export function resetExperimentEStoreModeCache(): void {
  storeModeCache = null;
}

async function store() {
  await resolveExperimentEStoreMode();
  return mem;
}

export async function getExperienceExpressionRun(
  runId: string = EXPERIMENT_E_RUN_ID,
): Promise<ExperienceExpressionRun | null> {
  return (await store()).getExperienceExpressionRun(runId);
}

export async function saveExperienceExpressionRun(run: ExperienceExpressionRun): Promise<ExperienceExpressionRun> {
  return (await store()).saveExperienceExpressionRun(run);
}

export { resetExperimentEMemory } from './memoryStore.js';
