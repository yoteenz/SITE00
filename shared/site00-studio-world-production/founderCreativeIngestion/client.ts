/** Browser-safe founder creative ingestion exports */

import type { FounderCreativeParentSequence } from './types.js';
import { INGESTION_WORKFLOW_STEPS } from './constants.js';

export {
  FOUNDER_CREATIVE_INGESTION_VERSION,
  INGESTION_WORKFLOW_STEPS,
  PHOTOGRAPHY_SOURCE_MODES,
  RECONSTRUCTION_REVIEW_JUDGMENTS,
  NDX_LAUNCH_ROW_01_CAMPAIGN_ID,
} from './constants.js';
export type {
  FounderCreativeIngestionState,
  FounderCreativeParentSequence,
  SlideReconstructionSpec,
  PhotographySourceMode,
  ReconstructionReviewJudgment,
  IngestionWorkflowStep,
} from './types.js';

export function workflowStepOrder(): readonly string[] {
  return INGESTION_WORKFLOW_STEPS;
}

export function getParentSequencePresentation(sequences: FounderCreativeParentSequence[]) {
  return sequences.map((s) => ({
    sequenceId: s.sequenceId,
    title: s.title,
    role: s.role,
    slideCount: s.slideIds.length,
    origin: s.provenance.origin,
    status: s.provenance.canonStatus,
  }));
}

export function founderCreativeFalGenerationInProgress(
  state: import('./types.js').FounderCreativeIngestionState,
): boolean {
  return state.falGenerationTracking?.status === 'RUNNING';
}

export function founderCreativeFalGenerationFailed(
  state: import('./types.js').FounderCreativeIngestionState,
): boolean {
  return state.falGenerationTracking?.status === 'FAILED';
}
