import type { WorkspaceConceptSlotId, WorkspaceSelfWorkflowState } from './types.js';
import type { WorkspaceSelfGeneratedArtifact } from './generationTypes.js';

export type ViewportAuthorityPreviewState =
  | 'EMPTY'
  | 'GENERATED_UNSELECTED'
  | 'SELECTED_PENDING_PROMOTION'
  | 'PROMOTED'
  | 'PAIR_REVIEW'
  | 'LOCKED';

export type ViewportAuthorityPreview = {
  viewport: 'MOBILE' | 'DESKTOP';
  state: ViewportAuthorityPreviewState;
  conceptSlot: WorkspaceConceptSlotId | null;
  conceptName: string | null;
  gpt2ConceptId: string | null;
  creativeDirectionId: string | null;
  imageRef: string | null;
  versionLabel: string;
  titleLabel: string;
  statePill: string;
  emptyMessage: string | null;
};

function readyJob(
  state: WorkspaceSelfWorkflowState,
  conceptId: WorkspaceConceptSlotId,
  viewport: 'MOBILE' | 'DESKTOP',
): WorkspaceSelfGeneratedArtifact | null {
  const job = state.generationJobs.find(
    (j) => j.conceptId === conceptId && j.viewport === viewport && j.status === 'READY',
  );
  if (!job) return null;
  if (state.conceptSet && job.captureSetId !== state.conceptSet.captureSetId) return null;
  return job;
}

function artifactRefForConcept(
  state: WorkspaceSelfWorkflowState,
  conceptId: WorkspaceConceptSlotId,
  viewport: 'MOBILE' | 'DESKTOP',
): string | null {
  const job = readyJob(state, conceptId, viewport);
  if (job?.artifactPath) return job.artifactPath;
  if (job?.imageUri) return job.imageUri;

  if (state.conceptSet) {
    return null;
  }

  const concept = state.concepts.find((c) => c.conceptId === conceptId);
  return viewport === 'MOBILE' ? concept?.mobileArtifactPath ?? null : concept?.desktopArtifactPath ?? null;
}

function gpt2Lineage(
  state: WorkspaceSelfWorkflowState,
  conceptId: WorkspaceConceptSlotId,
  viewport: 'MOBILE' | 'DESKTOP',
): { gpt2ConceptId: string | null; creativeDirectionId: string | null } {
  const job = readyJob(state, conceptId, viewport);
  return {
    gpt2ConceptId: job?.gpt2ConceptId ?? null,
    creativeDirectionId: job?.creativeDirectionId ?? null,
  };
}

function resolveActiveConceptId(
  state: WorkspaceSelfWorkflowState,
  viewport: 'MOBILE' | 'DESKTOP',
): WorkspaceConceptSlotId | null {
  if (state.authorityPair) {
    return viewport === 'MOBILE' ?
        state.authorityPair.mobileConceptId
      : state.authorityPair.desktopConceptId;
  }
  const promoted = viewport === 'MOBILE' ? state.promotedMobileConceptId : state.promotedDesktopConceptId;
  if (promoted) return promoted;
  const preferred = viewport === 'MOBILE' ? state.preferredMobileConceptId : state.preferredDesktopConceptId;
  return preferred;
}

function resolvePreviewState(
  state: WorkspaceSelfWorkflowState,
  viewport: 'MOBILE' | 'DESKTOP',
  conceptId: WorkspaceConceptSlotId | null,
  hasImage: boolean,
): ViewportAuthorityPreviewState {
  if (!conceptId || !hasImage) return 'EMPTY';

  if (state.authorityPair) return 'LOCKED';

  const promoted = viewport === 'MOBILE' ? state.promotedMobileConceptId : state.promotedDesktopConceptId;
  const preferred = viewport === 'MOBILE' ? state.preferredMobileConceptId : state.preferredDesktopConceptId;

  if (state.pairReviewOpenedAt && promoted === conceptId) return 'PAIR_REVIEW';
  if (promoted === conceptId) return 'PROMOTED';
  if (preferred === conceptId) return 'SELECTED_PENDING_PROMOTION';
  return 'GENERATED_UNSELECTED';
}

function titleForState(viewport: 'MOBILE' | 'DESKTOP', previewState: ViewportAuthorityPreviewState): string {
  const vp = viewport === 'MOBILE' ? 'Mobile' : 'Desktop';
  switch (previewState) {
    case 'LOCKED':
      return `${vp} Authority (Locked)`;
    case 'PROMOTED':
    case 'PAIR_REVIEW':
      return `${vp} Authority`;
    case 'SELECTED_PENDING_PROMOTION':
      return `Selected ${vp} Concept`;
    case 'GENERATED_UNSELECTED':
      return `${vp} Concept`;
    default:
      return `${vp} Concept`;
  }
}

function pillForState(previewState: ViewportAuthorityPreviewState): string {
  switch (previewState) {
    case 'EMPTY':
      return 'EMPTY';
    case 'GENERATED_UNSELECTED':
      return 'GENERATED';
    case 'SELECTED_PENDING_PROMOTION':
      return 'SELECTED';
    case 'PROMOTED':
      return 'PROMOTED';
    case 'PAIR_REVIEW':
      return 'PAIR REVIEW';
    case 'LOCKED':
      return 'LOCKED';
  }
}

export function resolveViewportAuthorityPreview(
  state: WorkspaceSelfWorkflowState,
  viewport: 'MOBILE' | 'DESKTOP',
): ViewportAuthorityPreview {
  let conceptId = resolveActiveConceptId(state, viewport);

  if (state.authorityPair) {
    const lockedRef =
      viewport === 'MOBILE' ? state.authorityPair.mobileArtifact : state.authorityPair.desktopArtifact;
    const lineage = conceptId ? gpt2Lineage(state, conceptId, viewport) : { gpt2ConceptId: null, creativeDirectionId: null };
    const concept = conceptId ? state.concepts.find((c) => c.conceptId === conceptId) : null;
    return {
      viewport,
      state: 'LOCKED',
      conceptSlot: conceptId,
      conceptName: concept?.conceptName ?? conceptId,
      ...lineage,
      imageRef: lockedRef ?? (conceptId ? artifactRefForConcept(state, conceptId, viewport) : null),
      versionLabel: state.conceptSet?.conceptSetId ?? '—',
      titleLabel: titleForState(viewport, 'LOCKED'),
      statePill: pillForState('LOCKED'),
      emptyMessage: null,
    };
  }

  if (conceptId) {
    const imageRef = artifactRefForConcept(state, conceptId, viewport);
    if (!imageRef) {
      const preferred = viewport === 'MOBILE' ? state.preferredMobileConceptId : state.preferredDesktopConceptId;
      const promoted = viewport === 'MOBILE' ? state.promotedMobileConceptId : state.promotedDesktopConceptId;
      if (promoted && artifactRefForConcept(state, promoted, viewport)) conceptId = promoted;
      else if (preferred && artifactRefForConcept(state, preferred, viewport)) conceptId = preferred;
      else conceptId = null;
    }
  }

  const imageRef = conceptId ? artifactRefForConcept(state, conceptId, viewport) : null;
  const previewState = resolvePreviewState(state, viewport, conceptId, Boolean(imageRef));
  const concept = conceptId ? state.concepts.find((c) => c.conceptId === conceptId) : null;
  const lineage = conceptId ? gpt2Lineage(state, conceptId, viewport) : { gpt2ConceptId: null, creativeDirectionId: null };

  return {
    viewport,
    state: previewState,
    conceptSlot: conceptId,
    conceptName: concept?.conceptName ?? conceptId,
    ...lineage,
    imageRef,
    versionLabel: conceptId ? (state.conceptSet?.conceptSetId ?? conceptId) : '—',
    titleLabel: titleForState(viewport, previewState),
    statePill: pillForState(previewState),
    emptyMessage:
      previewState === 'EMPTY' ?
        viewport === 'MOBILE' ?
          'No mobile concept generated yet'
        : 'No desktop concept generated yet'
      : null,
  };
}

export function resolveWorkspaceSelfAuthorityPairPresentation(state: WorkspaceSelfWorkflowState): {
  mobile: ViewportAuthorityPreview;
  desktop: ViewportAuthorityPreview;
} {
  return {
    mobile: resolveViewportAuthorityPreview(state, 'MOBILE'),
    desktop: resolveViewportAuthorityPreview(state, 'DESKTOP'),
  };
}
