/**
 * P0.VR.PAGE-CONCEPT-LIVE-PRODUCTION-TRACE1 — panel stage chips from hook state + generating flag.
 */

import {
  PAGE_CONCEPT_DEFAULT_STAGE_STATE,
  type PageConceptStageId,
  type PageConceptStageState,
} from '../designPageConceptGeneratorShell.js';
import { pageConceptStageStatesFromPipeline } from './pageConceptGeneratorBinding.js';
import type { PageConceptGenerationState } from './types.js';

export function pageConceptStageStatesForPanel(input: {
  state: PageConceptGenerationState;
  generating: boolean;
  mode: 'confirm' | 'progress' | 'review';
}): Record<PageConceptStageId, PageConceptStageState> {
  const { state, generating, mode } = input;

  if (generating) {
    const status = state.generationStatus;
    if (status === 'GPT2_RUNNING') {
      return { CGPT: 'COMPLETE', GPT2: 'ACTIVE', NBP: 'PENDING' };
    }
    if (status === 'NBP_RUNNING') {
      return { CGPT: 'COMPLETE', GPT2: 'COMPLETE', NBP: 'ACTIVE' };
    }
    return { CGPT: 'ACTIVE', GPT2: 'PENDING', NBP: 'PENDING' };
  }

  const hasPipeline =
    state.pipelineSet?.creativeInjection ||
    state.generationJobs.length > 0 ||
    state.generationStatus !== 'IDLE';
  if (!hasPipeline && mode === 'confirm') {
    return PAGE_CONCEPT_DEFAULT_STAGE_STATE;
  }
  return pageConceptStageStatesFromPipeline(state);
}
