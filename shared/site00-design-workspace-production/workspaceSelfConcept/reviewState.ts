import { WORKSPACE_CONCEPT_SLOT_IDS } from './constants.js';
import { resolveConceptArtifactId, resolveConceptArtifactRef, readyConceptJob } from './conceptArtifacts.js';
import type {
  WorkspaceConceptSlotId,
  WorkspaceSelfPairReviewStatus,
  WorkspaceSelfReviewUiState,
  WorkspaceSelfWorkflowState,
} from './types.js';

export function defaultReviewUiState(): WorkspaceSelfReviewUiState {
  return {
    activeConceptId: null,
    activeViewport: 'MOBILE',
    inspectedConceptId: null,
    compareOpen: false,
    compareViewport: 'MOBILE',
    fullscreenOpen: false,
    selectedMobileArtifactId: null,
    selectedDesktopArtifactId: null,
  };
}

export function normalizeReviewUi(raw: WorkspaceSelfReviewUiState | undefined): WorkspaceSelfReviewUiState {
  const base = defaultReviewUiState();
  if (!raw) return base;
  return {
    ...base,
    ...raw,
    activeViewport: raw.activeViewport === 'DESKTOP' ? 'DESKTOP' : 'MOBILE',
    compareViewport: raw.compareViewport === 'DESKTOP' ? 'DESKTOP' : 'MOBILE',
  };
}

export function derivePairReviewStatus(state: WorkspaceSelfWorkflowState): WorkspaceSelfPairReviewStatus {
  if (state.authorityPair) return 'COMPLETE';
  if (state.pairReviewCompletedAt) return 'COMPLETE';
  if (state.pairReviewOpenedAt) return 'IN_REVIEW';
  if (state.promotedMobileConceptId && state.promotedDesktopConceptId) return 'READY';
  return 'NOT_READY';
}

export function deriveWorkspaceSelfReviewState(state: WorkspaceSelfWorkflowState) {
  const reviewUi = normalizeReviewUi(state.reviewUi);
  return {
    activeConceptSetId: state.conceptSet?.conceptSetId ?? null,
    activeConceptId: reviewUi.activeConceptId,
    activeViewport: reviewUi.activeViewport,
    inspectedConceptId: reviewUi.inspectedConceptId,
    selectedMobileConceptId: state.preferredMobileConceptId,
    selectedDesktopConceptId: state.preferredDesktopConceptId,
    promotedMobileConceptId: state.promotedMobileConceptId,
    promotedDesktopConceptId: state.promotedDesktopConceptId,
    pairReviewStatus: derivePairReviewStatus(state),
    lockedAuthorityPairId: state.authorityPair?.authorityPairId ?? null,
    compareOpen: reviewUi.compareOpen,
    compareViewport: reviewUi.compareViewport,
    fullscreenOpen: reviewUi.fullscreenOpen,
  };
}

export type ConceptViewportBadge = '—' | 'SELECTED' | 'PROMOTED';

export function conceptViewportBadge(
  state: WorkspaceSelfWorkflowState,
  conceptId: WorkspaceConceptSlotId,
  viewport: 'MOBILE' | 'DESKTOP',
): ConceptViewportBadge {
  const promoted = viewport === 'MOBILE' ? state.promotedMobileConceptId : state.promotedDesktopConceptId;
  if (promoted === conceptId) return 'PROMOTED';
  const selected = viewport === 'MOBILE' ? state.preferredMobileConceptId : state.preferredDesktopConceptId;
  if (selected === conceptId) return 'SELECTED';
  return '—';
}

export function hasPendingAuthorityChange(state: WorkspaceSelfWorkflowState, viewport: 'MOBILE' | 'DESKTOP'): boolean {
  const promoted = viewport === 'MOBILE' ? state.promotedMobileConceptId : state.promotedDesktopConceptId;
  const selected = viewport === 'MOBILE' ? state.preferredMobileConceptId : state.preferredDesktopConceptId;
  if (!promoted || !selected) return false;
  return promoted !== selected;
}

function appendHistory(state: WorkspaceSelfWorkflowState, type: string, summary: string): WorkspaceSelfWorkflowState {
  return {
    ...state,
    history: [...state.history, { type, at: new Date().toISOString(), summary }],
  };
}

export function activateWorkspaceConcept(
  state: WorkspaceSelfWorkflowState,
  conceptId: WorkspaceConceptSlotId,
): WorkspaceSelfWorkflowState {
  const concept = state.concepts.find((c) => c.conceptId === conceptId);
  if (!concept || concept.status === 'EMPTY') throw new Error('CONCEPT_NOT_STAGED');
  const reviewUi = normalizeReviewUi(state.reviewUi);
  return appendHistory(
    {
      ...state,
      reviewUi: { ...reviewUi, activeConceptId: conceptId, inspectedConceptId: conceptId },
    },
    'workspace_self_concept_activated',
    conceptId,
  );
}

export function setWorkspaceReviewViewport(
  state: WorkspaceSelfWorkflowState,
  viewport: 'MOBILE' | 'DESKTOP',
): WorkspaceSelfWorkflowState {
  const reviewUi = normalizeReviewUi(state.reviewUi);
  let activeConceptId = reviewUi.activeConceptId;
  if (activeConceptId && !resolveConceptArtifactRef(state, activeConceptId, viewport)) {
    const fallback = WORKSPACE_CONCEPT_SLOT_IDS.find((id) => resolveConceptArtifactRef(state, id, viewport));
    activeConceptId = fallback ?? activeConceptId;
  }
  return appendHistory(
    {
      ...state,
      reviewUi: { ...reviewUi, activeViewport: viewport, activeConceptId, inspectedConceptId: activeConceptId },
    },
    'workspace_self_viewport_changed',
    viewport,
  );
}

export function openWorkspaceCompare(
  state: WorkspaceSelfWorkflowState,
  viewport: 'MOBILE' | 'DESKTOP',
): WorkspaceSelfWorkflowState {
  const reviewUi = normalizeReviewUi(state.reviewUi);
  return appendHistory(
    {
      ...state,
      reviewUi: { ...reviewUi, compareOpen: true, compareViewport: viewport, activeViewport: viewport },
    },
    'workspace_self_compare_opened',
    viewport,
  );
}

export function closeWorkspaceCompare(state: WorkspaceSelfWorkflowState): WorkspaceSelfWorkflowState {
  const reviewUi = normalizeReviewUi(state.reviewUi);
  return { ...state, reviewUi: { ...reviewUi, compareOpen: false } };
}

export function inspectWorkspaceConcept(
  state: WorkspaceSelfWorkflowState,
  conceptId: WorkspaceConceptSlotId,
): WorkspaceSelfWorkflowState {
  let next = activateWorkspaceConcept(state, conceptId);
  const reviewUi = normalizeReviewUi(next.reviewUi);
  next = { ...next, reviewUi: { ...reviewUi, inspectedConceptId: conceptId } };
  return appendHistory(next, 'workspace_self_candidate_inspected', conceptId);
}

export function closeWorkspaceInspect(state: WorkspaceSelfWorkflowState): WorkspaceSelfWorkflowState {
  const reviewUi = normalizeReviewUi(state.reviewUi);
  return { ...state, reviewUi: { ...reviewUi, inspectedConceptId: null } };
}

export function setWorkspaceFullscreenOpen(state: WorkspaceSelfWorkflowState, open: boolean): WorkspaceSelfWorkflowState {
  const reviewUi = normalizeReviewUi(state.reviewUi);
  return { ...state, reviewUi: { ...reviewUi, fullscreenOpen: open } };
}

export function selectViewportConceptForReview(
  state: WorkspaceSelfWorkflowState,
  viewport: 'MOBILE' | 'DESKTOP',
  conceptId: WorkspaceConceptSlotId,
): WorkspaceSelfWorkflowState {
  const concept = state.concepts.find((c) => c.conceptId === conceptId);
  if (!concept || concept.status === 'EMPTY') throw new Error('CONCEPT_NOT_STAGED');

  const artifactId = resolveConceptArtifactId(state, conceptId, viewport);
  const reviewUi = normalizeReviewUi(state.reviewUi);

  let next: WorkspaceSelfWorkflowState =
    viewport === 'MOBILE' ?
      { ...state, preferredMobileConceptId: conceptId }
    : { ...state, preferredDesktopConceptId: conceptId };

  next = {
    ...next,
    reviewUi: {
      ...reviewUi,
      activeViewport: viewport,
      ...(viewport === 'MOBILE' ?
        { selectedMobileArtifactId: artifactId }
      : { selectedDesktopArtifactId: artifactId }),
    },
  };

  const promoted = viewport === 'MOBILE' ? next.promotedMobileConceptId : next.promotedDesktopConceptId;
  if (promoted && promoted !== conceptId) {
    next = appendHistory(
      next,
      'workspace_self_pending_authority_change_created',
      `${viewport} promoted ${promoted} pending ${conceptId}`,
    );
  }

  return appendHistory(
    next,
    viewport === 'MOBILE' ? 'workspace_self_mobile_selected' : 'workspace_self_desktop_selected',
    `${conceptId}${artifactId ? ` · ${artifactId}` : ''}`,
  );
}

export function promoteViewportConceptForReview(
  state: WorkspaceSelfWorkflowState,
  viewport: 'MOBILE' | 'DESKTOP',
): WorkspaceSelfWorkflowState {
  if (viewport === 'MOBILE') {
    if (!state.preferredMobileConceptId) throw new Error('NO_MOBILE_SELECTION');
    return appendHistory(
      { ...state, promotedMobileConceptId: state.preferredMobileConceptId },
      'workspace_self_mobile_promoted',
      state.preferredMobileConceptId,
    );
  }
  if (!state.preferredDesktopConceptId) throw new Error('NO_DESKTOP_SELECTION');
  return appendHistory(
    { ...state, promotedDesktopConceptId: state.preferredDesktopConceptId },
    'workspace_self_desktop_promoted',
    state.preferredDesktopConceptId,
  );
}

export type CompareConceptColumn = {
  conceptId: WorkspaceConceptSlotId;
  conceptName: string;
  premise: string;
  imageRef: string | null;
  artifactId: string | null;
  badge: ConceptViewportBadge;
  isActive: boolean;
};

export function buildCompareConceptColumns(
  state: WorkspaceSelfWorkflowState,
  viewport: 'MOBILE' | 'DESKTOP',
): CompareConceptColumn[] {
  const reviewUi = normalizeReviewUi(state.reviewUi);
  return WORKSPACE_CONCEPT_SLOT_IDS.map((conceptId) => {
    const concept = state.concepts.find((c) => c.conceptId === conceptId);
    return {
      conceptId,
      conceptName: concept?.conceptName ?? conceptId,
      premise: concept?.conceptTerritory?.slice(0, 160) ?? '',
      imageRef: resolveConceptArtifactRef(state, conceptId, viewport),
      artifactId: resolveConceptArtifactId(state, conceptId, viewport),
      badge: conceptViewportBadge(state, conceptId, viewport),
      isActive: reviewUi.activeConceptId === conceptId,
    };
  });
}

export function resolveInspectLineage(state: WorkspaceSelfWorkflowState, conceptId: WorkspaceConceptSlotId) {
  const slot = state.creativePipelineSet?.slots.find((s) => s.conceptSlot === conceptId);
  const mobileJob = readyConceptJob(state, conceptId, 'MOBILE');
  const desktopJob = readyConceptJob(state, conceptId, 'DESKTOP');
  return {
    cgptDirection: slot?.direction ?? null,
    gpt2Concept: slot?.concept ?? null,
    mobileJob,
    desktopJob,
  };
}
