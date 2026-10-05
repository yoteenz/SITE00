/**
 * Durable sync for founder viewport-family progress (mobile select/confirm, experience review).
 */

import type { PageConceptGenerationState } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import { patchPageConceptServerRunDurable } from './pageConceptGenerationRunStore.js';

export async function persistPageConceptStateToActiveServerRun(
  state: PageConceptGenerationState,
): Promise<void> {
  const runId = state.activeGenerationRunId ?? state.activeReviewRunId ?? null;
  if (!runId || !state.pipelineSet) return;
  if (process.env.VITEST === 'true') return;

  await patchPageConceptServerRunDurable(runId, {
    pipelineSet: state.pipelineSet,
    generationStatus: state.generationStatus,
    jobs: state.generationJobs,
    updatedAt: new Date().toISOString(),
  });
}
