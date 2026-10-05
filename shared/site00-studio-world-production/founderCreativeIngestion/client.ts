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
  CreativeReferenceVersion,
  CreativeReferenceDiff,
  PhotographyOverrideCompatibilityEvaluation,
  ParentReferenceStatus,
} from './types.js';

export {
  PARENT_REFERENCE_STATUSES,
} from './referenceReplacement/types.js';

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

export function hasDraftReferenceVersion(
  state: import('./types.js').FounderCreativeIngestionState,
  sequenceId: string,
): boolean {
  const auth = state.activeReferenceAuthority.find((entry) => entry.parentSequenceId === sequenceId);
  return Boolean(auth?.draftReferenceVersionId);
}

export function parentReferenceStatusLabel(status: import('./types.js').ParentReferenceStatus): string {
  return status.replace(/_/g, ' ');
}

/** Draft → active → legacy asset id fallback for sequence reference preview. */
export function resolveSequenceReferencePreviewUrl(
  state: import('./types.js').FounderCreativeIngestionState,
  sequenceId: string,
): string | null {
  const auth = state.activeReferenceAuthority.find((entry) => entry.parentSequenceId === sequenceId);
  const draftVersion = auth?.draftReferenceVersionId
    ? state.referenceVersions.find((entry) => entry.referenceVersionId === auth.draftReferenceVersionId)
    : null;
  if (draftVersion) {
    const draftAsset = state.referenceAssets.find((entry) => entry.assetId === draftVersion.referenceAssetId);
    if (draftAsset?.previewUrl) return draftAsset.previewUrl;
  }

  const activeVersion = auth?.activeReferenceVersionId
    ? state.referenceVersions.find((entry) => entry.referenceVersionId === auth.activeReferenceVersionId)
    : null;
  if (activeVersion) {
    const activeAsset = state.referenceAssets.find((entry) => entry.assetId === activeVersion.referenceAssetId);
    if (activeAsset?.previewUrl) return activeAsset.previewUrl;
  }

  return state.referenceAssets.find((entry) => entry.assetId === `ref-board-${sequenceId}`)?.previewUrl ?? null;
}

export {
  GUIDED_WORKFLOW_STEPS,
  GUIDED_WORKFLOW_STEP_LABELS,
  GUIDED_WORKFLOW_STEP_NUMBERS,
  deriveSlideDisplayStatus,
  slideDisplayStatusLabel,
  countApprovedSlides,
  countUnresolvedSlides,
  sequenceReviewBlocked,
  sequenceReadyForCompletion,
  inferGuidedWorkflowStep,
  resolveWorkflowSlideIndex,
  firstUnresolvedSlideIndex,
  getSequenceSpecs,
  photoModeFounderLabel,
  judgmentFounderLabel,
  slideDerivedLabel,
  loadPersistedGuidedWorkflow,
  savePersistedGuidedWorkflow,
  guidedWorkflowStorageKey,
} from './guidedWorkflow.js';

export type {
  GuidedWorkflowStep,
  SlideCompareTab,
  SlideReviewDisplayStatus,
  PersistedGuidedWorkflowState,
} from './guidedWorkflow.js';
