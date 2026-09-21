/**
 * P0.VR.PAGE-CONCEPT-LIVE-PRODUCTION-TRACE1 + LIVE-STAGE-PROGRESSION1 — panel stage chips.
 */

import {
  PAGE_CONCEPT_DEFAULT_STAGE_STATE,
  type PageConceptStageId,
  type PageConceptStageState,
} from '../designPageConceptGeneratorShell.js';
import { pageConceptStageStatesFromPipeline } from './pageConceptGeneratorBinding.js';
import {
  derivePageConceptLiveProgress,
  pageConceptPanelProgressToStageStates,
} from './pageConceptLiveProgress.js';
import type { PageConceptGenerationState } from './types.js';

export function pageConceptStageStatesForPanel(input: {
  state: PageConceptGenerationState;
  generating: boolean;
  mode: 'confirm' | 'progress' | 'review';
}): Record<PageConceptStageId, PageConceptStageState> {
  const { state, generating, mode } = input;

  const cgptFailed =
    Boolean(state.pipelineSet?.creativeInjectionError) && !state.pipelineSet?.creativeInjection;

  const progress = derivePageConceptLiveProgress({
    generationStatus: state.generationStatus,
    generating,
    activeGenerationStage: state.activeGenerationStage,
    panelProgress: state.liveProgress,
    cgptFailed,
  });

  if (
    generating ||
    state.liveProgress ||
    state.generationStatus === 'CGPT_RUNNING' ||
    state.generationStatus === 'CGPT_RATE_LIMITED' ||
    state.generationStatus === 'GPT2_RUNNING' ||
    state.generationStatus === 'NBP_RUNNING'
  ) {
    return pageConceptPanelProgressToStageStates(progress);
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
