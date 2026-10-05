/**
 * P0.CB.1B — Guided founder creative ingestion workflow (browser-safe logic).
 */

import type { FounderCreativeIngestionState, SlideReconstructionSpec } from './types.js';

function sequenceHasDraftReference(
  ingestion: FounderCreativeIngestionState,
  sequenceId: string,
): boolean {
  const auth = ingestion.activeReferenceAuthority.find((entry) => entry.parentSequenceId === sequenceId);
  return Boolean(auth?.draftReferenceVersionId);
}

export const GUIDED_WORKFLOW_STEPS = [
  'INGEST',
  'DECOMPOSE',
  'SLIDE_REVIEW',
  'SEQUENCE_REVIEW',
  'COMPLETE',
] as const;

export type GuidedWorkflowStep = (typeof GUIDED_WORKFLOW_STEPS)[number];

export type SlideCompareTab = 'REFERENCE' | 'PRODUCTION' | 'COMPARE';

export type SlideReviewDisplayStatus =
  | 'NOT_STARTED'
  | 'DECOMPOSED'
  | 'READY_FOR_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'NEEDS_REVISION'
  | 'HQ_REPLACED'
  | 'REGENERATING'
  | 'BLOCKED';

export type PersistedGuidedWorkflowState = {
  sequenceId: string;
  step: GuidedWorkflowStep;
  slideIndex: number;
  compareTab: SlideCompareTab;
  updatedAt: string;
};

export const GUIDED_WORKFLOW_STEP_LABELS: Record<GuidedWorkflowStep, string> = {
  INGEST: 'Upload Reference Board',
  DECOMPOSE: 'Decomposing Slides',
  SLIDE_REVIEW: 'Review Slide',
  SEQUENCE_REVIEW: 'Sequence Review',
  COMPLETE: 'Complete',
};

export const GUIDED_WORKFLOW_STEP_NUMBERS: Record<GuidedWorkflowStep, number> = {
  INGEST: 1,
  DECOMPOSE: 2,
  SLIDE_REVIEW: 3,
  SEQUENCE_REVIEW: 4,
  COMPLETE: 5,
};

export function getSequenceSpecs(
  ingestion: FounderCreativeIngestionState,
  sequenceId: string,
): SlideReconstructionSpec[] {
  return ingestion.reconstructionSpecs
    .filter((entry) => entry.sequenceId === sequenceId)
    .sort((a, b) => a.slideId.localeCompare(b.slideId));
}

export function deriveSlideDisplayStatus(
  spec: SlideReconstructionSpec,
  generatingSlideId: string | null,
): SlideReviewDisplayStatus {
  if (generatingSlideId === spec.slideId) return 'REGENERATING';
  if (spec.reviewStatus === 'APPROVED') return 'APPROVED';
  if (spec.reviewStatus === 'REVISE') return 'NEEDS_REVISION';
  if (spec.photography.sourceMode === 'UPLOAD_HQ' || spec.photography.sourceMode === 'USE_EXISTING_ASSET') {
    return 'HQ_REPLACED';
  }
  if (spec.reviewStatus === 'RECONSTRUCTION_REVIEW') return 'READY_FOR_REVIEW';
  if (spec.productionMasterUrl || spec.reviewStatus === 'PENDING') return 'DECOMPOSED';
  return 'NOT_STARTED';
}

export function slideDisplayStatusLabel(status: SlideReviewDisplayStatus): string {
  return status.replace(/_/g, ' ');
}

export function countApprovedSlides(specs: SlideReconstructionSpec[]): number {
  return specs.filter((entry) => entry.reviewStatus === 'APPROVED').length;
}

export function countUnresolvedSlides(specs: SlideReconstructionSpec[]): number {
  return specs.filter((entry) => entry.reviewStatus !== 'APPROVED').length;
}

export function sequenceReviewBlocked(specs: SlideReconstructionSpec[]): boolean {
  return specs.length > 0 && specs.some((entry) => entry.reviewStatus !== 'APPROVED');
}

export function sequenceReadyForCompletion(
  ingestion: FounderCreativeIngestionState,
  sequenceId: string,
): boolean {
  const sequence = ingestion.parentSequences.find((entry) => entry.sequenceId === sequenceId);
  const specs = getSequenceSpecs(ingestion, sequenceId);
  return (
    specs.length > 0 &&
    specs.every((entry) => entry.reviewStatus === 'APPROVED') &&
    sequence?.sequenceReviewStatus === 'APPROVED'
  );
}

export function inferGuidedWorkflowStep(
  ingestion: FounderCreativeIngestionState,
  sequenceId: string,
  options?: { decomposing?: boolean; preferredStep?: GuidedWorkflowStep | null },
): GuidedWorkflowStep {
  if (options?.decomposing) return 'DECOMPOSE';

  const specs = getSequenceSpecs(ingestion, sequenceId);
  const sequence = ingestion.parentSequences.find((entry) => entry.sequenceId === sequenceId);

  if (sequenceReadyForCompletion(ingestion, sequenceId)) return 'COMPLETE';

  if (options?.preferredStep === 'SEQUENCE_REVIEW' || options?.preferredStep === 'COMPLETE') {
    if (options.preferredStep === 'COMPLETE' && sequenceReadyForCompletion(ingestion, sequenceId)) {
      return 'COMPLETE';
    }
    if (options.preferredStep === 'SEQUENCE_REVIEW' && specs.length > 0) return 'SEQUENCE_REVIEW';
  }

  if (specs.length === 0) {
    return sequenceHasDraftReference(ingestion, sequenceId) ? 'DECOMPOSE' : 'INGEST';
  }

  if (specs.every((entry) => entry.reviewStatus === 'APPROVED')) {
    return sequence?.sequenceReviewStatus === 'APPROVED' ? 'COMPLETE' : 'SEQUENCE_REVIEW';
  }

  return 'SLIDE_REVIEW';
}

export function resolveWorkflowSlideIndex(
  specs: SlideReconstructionSpec[],
  persistedIndex: number,
): number {
  if (specs.length === 0) return 0;
  const firstUnresolved = specs.findIndex((entry) => entry.reviewStatus !== 'APPROVED');
  if (firstUnresolved >= 0 && persistedIndex < 0) return firstUnresolved;
  return Math.min(Math.max(0, persistedIndex), specs.length - 1);
}

export function firstUnresolvedSlideIndex(specs: SlideReconstructionSpec[]): number {
  const index = specs.findIndex((entry) => entry.reviewStatus !== 'APPROVED');
  return index >= 0 ? index : 0;
}

export function photoModeFounderLabel(mode: string): string {
  switch (mode) {
    case 'REFERENCE_ONLY':
      return 'Use Reference As-Is';
    case 'GENERATE_FROM_REFERENCE':
      return 'Generate New Photo';
    case 'UPLOAD_HQ':
      return 'Upload HQ Photo';
    case 'USE_EXISTING_ASSET':
      return 'Keep Existing Approved Photo';
    case 'REPLACE':
      return 'Replace Current Photo';
    case 'LOCK_CANONICAL':
      return 'Use Canonical Photo';
    default:
      return mode.replace(/_/g, ' ');
  }
}

export function judgmentFounderLabel(judgment: string): string {
  switch (judgment) {
    case 'APPROVE_SLIDE':
      return 'Approve Slide';
    case 'MATCH':
      return 'Match';
    case 'CLOSE_REVISE':
      return 'Close — Revise';
    case 'WRONG_INTERPRETATION':
      return 'Wrong Interpretation';
    case 'REPLACE_PHOTO':
      return 'Replace Photo';
    case 'EDIT_COPY':
      return 'Edit Copy';
    case 'EDIT_PROMPT':
      return 'Edit Prompt';
    case 'REGENERATE_PHOTO':
      return 'Regenerate Slide';
    default:
      return judgment.replace(/_/g, ' ');
  }
}

export function slideDerivedLabel(spec: SlideReconstructionSpec, index: number): string {
  const copyLead = spec.copy.exactText[0] ?? spec.copy.hierarchy[0];
  if (copyLead) return copyLead.slice(0, 48);
  if (spec.photography.required) return `Photo slide ${index + 1}`;
  return `Slide ${index + 1}`;
}

export function guidedWorkflowStorageKey(projectSlug: string): string {
  return `site00_fci_guided_workflow_v1_${projectSlug}`;
}

export function loadPersistedGuidedWorkflow(projectSlug: string): PersistedGuidedWorkflowState | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(guidedWorkflowStorageKey(projectSlug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedGuidedWorkflowState;
    if (!parsed.sequenceId || !parsed.step) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function savePersistedGuidedWorkflow(
  projectSlug: string,
  state: PersistedGuidedWorkflowState,
): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(guidedWorkflowStorageKey(projectSlug), JSON.stringify(state));
}
