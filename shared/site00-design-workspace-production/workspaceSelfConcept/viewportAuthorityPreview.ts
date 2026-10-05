import { resolveConceptArtifactRef } from './conceptArtifacts.js';
import { hasPendingAuthorityChange, normalizeReviewUi } from './reviewState.js';
import type { WorkspaceConceptSlotId, WorkspaceSelfWorkflowState } from './types.js';
import { readyConceptJob } from './conceptArtifacts.js';

export type ViewportAuthorityPreviewState =
  | 'EMPTY'
  | 'PREVIEWING'
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
  pendingConceptSlot: WorkspaceConceptSlotId | null;
  pendingConceptName: string | null;
  pendingImageRef: string | null;
  authorityConceptSlot: WorkspaceConceptSlotId | null;
};

function gpt2Lineage(
  state: WorkspaceSelfWorkflowState,
  conceptId: WorkspaceConceptSlotId,
  viewport: 'MOBILE' | 'DESKTOP',
) {
  const job = readyConceptJob(state, conceptId, viewport);
  return {
    gpt2ConceptId: job?.gpt2ConceptId ?? null,
    creativeDirectionId: job?.creativeDirectionId ?? null,
  };
}

function pillForState(previewState: ViewportAuthorityPreviewState): string {
  switch (previewState) {
    case 'EMPTY':
      return 'EMPTY';
    case 'PREVIEWING':
      return 'PREVIEWING';
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
    case 'PREVIEWING':
      return `Previewing ${vp} Concept`;
    default:
      return `${vp} Concept`;
  }
}

export function resolveViewportAuthorityPreview(
  state: WorkspaceSelfWorkflowState,
  viewport: 'MOBILE' | 'DESKTOP',
): ViewportAuthorityPreview {
  const reviewUi = normalizeReviewUi(state.reviewUi);
  const promoted = viewport === 'MOBILE' ? state.promotedMobileConceptId : state.promotedDesktopConceptId;
  const selected = viewport === 'MOBILE' ? state.preferredMobileConceptId : state.preferredDesktopConceptId;
  const active = reviewUi.activeConceptId;
  const pending = hasPendingAuthorityChange(state, viewport);

  if (state.authorityPair) {
    const conceptId = viewport === 'MOBILE' ? state.authorityPair.mobileConceptId : state.authorityPair.desktopConceptId;
    const lockedRef =
      viewport === 'MOBILE' ? state.authorityPair.mobileArtifact : state.authorityPair.desktopArtifact;
    const concept = state.concepts.find((c) => c.conceptId === conceptId);
    const lineage = gpt2Lineage(state, conceptId, viewport);
    return {
      viewport,
      state: 'LOCKED',
      conceptSlot: conceptId,
      conceptName: concept?.conceptName ?? conceptId,
      ...lineage,
      imageRef: lockedRef ?? resolveConceptArtifactRef(state, conceptId, viewport),
      versionLabel: state.conceptSet?.conceptSetId ?? '—',
      titleLabel: titleForState(viewport, 'LOCKED'),
      statePill: pillForState('LOCKED'),
      emptyMessage: null,
      pendingConceptSlot: null,
      pendingConceptName: null,
      pendingImageRef: null,
      authorityConceptSlot: conceptId,
    };
  }

  let conceptId: WorkspaceConceptSlotId | null = null;
  let previewState: ViewportAuthorityPreviewState = 'EMPTY';

  if (promoted && resolveConceptArtifactRef(state, promoted, viewport)) {
    conceptId = promoted;
    previewState =
      state.pairReviewOpenedAt && !state.pairReviewCompletedAt ? 'PAIR_REVIEW'
      : state.pairReviewOpenedAt ? 'PAIR_REVIEW'
      : 'PROMOTED';
  } else if (selected && resolveConceptArtifactRef(state, selected, viewport)) {
    conceptId = selected;
    previewState = 'SELECTED_PENDING_PROMOTION';
  } else if (active && resolveConceptArtifactRef(state, active, viewport)) {
    conceptId = active;
    previewState = 'PREVIEWING';
  }

  const imageRef = conceptId ? resolveConceptArtifactRef(state, conceptId, viewport) : null;
  if (!imageRef) {
    previewState = 'EMPTY';
    conceptId = null;
  }

  const concept = conceptId ? state.concepts.find((c) => c.conceptId === conceptId) : null;
  const lineage = conceptId ? gpt2Lineage(state, conceptId, viewport) : { gpt2ConceptId: null, creativeDirectionId: null };

  let pendingConceptSlot: WorkspaceConceptSlotId | null = null;
  let pendingImageRef: string | null = null;
  if (pending && selected && promoted && selected !== promoted) {
    pendingConceptSlot = selected;
    pendingImageRef = resolveConceptArtifactRef(state, selected, viewport);
  }

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
    pendingConceptSlot,
    pendingConceptName:
      pendingConceptSlot ? state.concepts.find((c) => c.conceptId === pendingConceptSlot)?.conceptName ?? pendingConceptSlot : null,
    pendingImageRef,
    authorityConceptSlot: promoted,
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
