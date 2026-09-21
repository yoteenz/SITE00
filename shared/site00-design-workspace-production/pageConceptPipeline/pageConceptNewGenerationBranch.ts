/**
 * P0.VR.PAGE-CONCEPT-NEW-GENERATION-BLANK-NAVIGATION-FIX1
 */

import { archivePageConceptRunBranch } from './pageConceptRunArchive.js';
import type { PageConceptGenerationState } from './types.js';

/** Archive completed run and reset active branch for a fresh CGPT start (jobs live in archive entry). */
export function applyPageConceptNewGenerationBranchReset(
  state: PageConceptGenerationState,
): PageConceptGenerationState {
  const archived = archivePageConceptRunBranch(state, { reason: 'new_generation' });
  return {
    ...archived,
    pipelineSet: null,
    generationJobs: [],
    dualRenderTestRun: null,
    generationStatus: 'PLANNED',
    activeGenerationRunId: null,
    activeGenerationRunStartedAt: null,
    activeGenerationStage: null,
    liveProgress: null,
    cgptSubsteps: null,
    lastFailure: null,
  };
}
