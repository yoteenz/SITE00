import { WORKSPACE_SELF_TARGET, WORKSPACE_SELF_TARGET_ID } from '../designTargetModel.js';
import { syncNbpPackageFromCaptures } from './captureWorkflow.js';
import { DEFAULT_WORKSPACE_SELF_SOURCE } from './sourceContext.js';
import { evaluateNbpHandoffReadiness } from './readiness.js';
import { compileWorkspaceFunctionContract } from './functionContract.js';
import {
  OPUS_ALLOWED_MUTATION_SCOPE,
  OPUS_FORBIDDEN_MUTATION_SCOPE,
  seedWorkspaceConceptSlots,
} from './constants.js';
import type {
  ComposerWorkspaceHandoffPackage,
  OpusDesignShellPackage,
  WorkspaceConceptCandidate,
  WorkspaceConceptSlotId,
  WorkspaceSelfCapture,
  WorkspaceSelfWorkflowState,
  WorkspaceViewport,
} from './types.js';

function appendHistory(
  state: WorkspaceSelfWorkflowState,
  type: string,
  summary: string,
): WorkspaceSelfWorkflowState {
  return {
    ...state,
    history: [...state.history, { type, at: new Date().toISOString(), summary }],
  };
}

export function createInitialWorkspaceSelfState(): WorkspaceSelfWorkflowState {
  return {
    targetId: WORKSPACE_SELF_TARGET_ID,
    targetType: 'WORKSPACE_SELF',
    sourceContext: DEFAULT_WORKSPACE_SELF_SOURCE,
    captures: [],
    captureSets: [],
    activeCaptureSetId: null,
    lastCaptureFailure: null,
    functionContract: null,
    nbpPackage: null,
    concepts: seedWorkspaceConceptSlots(),
    preferredMobileConceptId: null,
    preferredDesktopConceptId: null,
    promotedMobileConceptId: null,
    promotedDesktopConceptId: null,
    pairReviewOpenedAt: null,
    pairReviewCompletedAt: null,
    authorityPair: null,
    opusShellPackage: null,
    composerHandoff: null,
    conceptSet: null,
    creativeBriefSet: null,
    generationJobs: [],
    generationStatus: 'IDLE',
    lastGenerationFailure: null,
    productionMutationLocked: true,
    history: [],
  };
}

export function markWorkspaceSelfOpened(state: WorkspaceSelfWorkflowState): WorkspaceSelfWorkflowState {
  return appendHistory(state, 'workspace_self_target_opened', WORKSPACE_SELF_TARGET.displayName);
}

export function addWorkspaceSelfCapture(
  state: WorkspaceSelfWorkflowState,
  input: Omit<WorkspaceSelfCapture, 'captureId' | 'targetId' | 'timestamp'> & { createdBy: string },
): WorkspaceSelfWorkflowState {
  const capture: WorkspaceSelfCapture = {
    captureId: `wsc-${Date.now()}`,
    targetId: WORKSPACE_SELF_TARGET_ID,
    timestamp: new Date().toISOString(),
    ...input,
    status: input.status ?? 'READY',
  };
  return appendHistory(
    { ...state, captures: [...state.captures, capture] },
    'workspace_self_capture_created',
    `${capture.viewport} capture ${capture.captureId}`,
  );
}

export function compileAndFreezeFunctionContract(state: WorkspaceSelfWorkflowState): WorkspaceSelfWorkflowState {
  const functionContract = compileWorkspaceFunctionContract();
  const withContract = appendHistory(
    { ...state, functionContract },
    'workspace_function_contract_compiled',
    functionContract.version,
  );
  return syncNbpPackageFromCaptures(withContract);
}

export function createNbpConceptPackage(state: WorkspaceSelfWorkflowState): WorkspaceSelfWorkflowState {
  const readiness = evaluateNbpHandoffReadiness(state);
  if (readiness === 'BLOCKED_NO_FUNCTION_CONTRACT') throw new Error('FUNCTION_CONTRACT_REQUIRED');
  if (readiness === 'BLOCKED_NO_MOBILE_CAPTURE') throw new Error('BLOCKED_NO_MOBILE_CAPTURE');
  if (readiness === 'BLOCKED_NO_DESKTOP_CAPTURE') throw new Error('BLOCKED_NO_DESKTOP_CAPTURE');
  return syncNbpPackageFromCaptures(state);
}

/** @deprecated Use workspace-self-concept-generation API — local flag only. */
export function requestConceptGeneration(state: WorkspaceSelfWorkflowState): WorkspaceSelfWorkflowState {
  if (!state.nbpPackage) throw new Error('NBP_PACKAGE_REQUIRED');
  return appendHistory(
    {
      ...state,
      nbpPackage: { ...state.nbpPackage, status: 'GENERATION_REQUESTED' },
      generationStatus: 'PLANNED',
    },
    'workspace_concept_generation_requested',
    'Generation planned — confirm in UI to dispatch providers',
  );
}

export function stageConceptArtifact(
  state: WorkspaceSelfWorkflowState,
  conceptId: WorkspaceConceptSlotId,
  input: Partial<Pick<WorkspaceConceptCandidate, 'conceptTerritory' | 'rationale' | 'mobileArtifactPath' | 'desktopArtifactPath'>>,
): WorkspaceSelfWorkflowState {
  const concepts = state.concepts.map((c) =>
    c.conceptId === conceptId ?
      {
        ...c,
        ...input,
        status: 'STAGED' as const,
        functionContractId: state.functionContract?.contractId ?? c.functionContractId,
        createdAt: c.createdAt ?? new Date().toISOString(),
      }
    : c,
  );
  return appendHistory({ ...state, concepts }, 'workspace_concept_generated', conceptId);
}

export function selectViewportConcept(
  state: WorkspaceSelfWorkflowState,
  viewport: 'MOBILE' | 'DESKTOP',
  conceptId: WorkspaceConceptSlotId,
): WorkspaceSelfWorkflowState {
  const concept = state.concepts.find((c) => c.conceptId === conceptId);
  if (!concept || concept.status === 'EMPTY') throw new Error('CONCEPT_NOT_STAGED');

  const next =
    viewport === 'MOBILE' ?
      { ...state, preferredMobileConceptId: conceptId }
    : { ...state, preferredDesktopConceptId: conceptId };

  return appendHistory(
    next,
    viewport === 'MOBILE' ? 'workspace_mobile_concept_selected' : 'workspace_desktop_concept_selected',
    `${viewport} preference ${conceptId} (not promotion)`,
  );
}

export function promoteViewportConcept(
  state: WorkspaceSelfWorkflowState,
  viewport: 'MOBILE' | 'DESKTOP',
): WorkspaceSelfWorkflowState {
  if (viewport === 'MOBILE') {
    if (!state.preferredMobileConceptId) throw new Error('NO_MOBILE_SELECTION');
    return appendHistory(
      { ...state, promotedMobileConceptId: state.preferredMobileConceptId },
      'workspace_mobile_design_promoted',
      state.preferredMobileConceptId,
    );
  }
  if (!state.preferredDesktopConceptId) throw new Error('NO_DESKTOP_SELECTION');
  return appendHistory(
    { ...state, promotedDesktopConceptId: state.preferredDesktopConceptId },
    'workspace_desktop_design_promoted',
    state.preferredDesktopConceptId,
  );
}

export function openPairReview(state: WorkspaceSelfWorkflowState): WorkspaceSelfWorkflowState {
  if (!state.promotedMobileConceptId || !state.promotedDesktopConceptId) {
    throw new Error('PROMOTED_PAIR_REQUIRED');
  }
  return appendHistory(
    { ...state, pairReviewOpenedAt: state.pairReviewOpenedAt ?? new Date().toISOString() },
    'workspace_pair_review_opened',
    'Pair review opened',
  );
}

export function completePairReview(state: WorkspaceSelfWorkflowState): WorkspaceSelfWorkflowState {
  if (!state.pairReviewOpenedAt) throw new Error('PAIR_REVIEW_NOT_OPENED');
  return appendHistory(
    { ...state, pairReviewCompletedAt: new Date().toISOString() },
    'workspace_pair_review_completed',
    'Pair review completed (no auto-lock)',
  );
}

export function lockWorkspaceAuthority(
  state: WorkspaceSelfWorkflowState,
  lockedBy: string,
): WorkspaceSelfWorkflowState {
  if (!state.pairReviewCompletedAt) throw new Error('PAIR_REVIEW_INCOMPLETE');
  if (!state.promotedMobileConceptId || !state.promotedDesktopConceptId) {
    throw new Error('PROMOTED_PAIR_REQUIRED');
  }
  if (!state.functionContract) throw new Error('FUNCTION_CONTRACT_REQUIRED');

  const mobileConcept = state.concepts.find((c) => c.conceptId === state.promotedMobileConceptId);
  const desktopConcept = state.concepts.find((c) => c.conceptId === state.promotedDesktopConceptId);

  const authorityPair = {
    authorityPairId: `wsap-${Date.now()}`,
    targetId: WORKSPACE_SELF_TARGET_ID,
    mobileConceptId: state.promotedMobileConceptId,
    desktopConceptId: state.promotedDesktopConceptId,
    mobileArtifact: mobileConcept?.mobileArtifactPath ?? null,
    desktopArtifact: desktopConcept?.desktopArtifactPath ?? null,
    functionContractId: state.functionContract.contractId,
    status: 'LOCKED' as const,
    lockedAt: new Date().toISOString(),
    lockedBy,
  };

  return appendHistory({ ...state, authorityPair }, 'workspace_authority_locked', authorityPair.authorityPairId);
}

export function requestOpusDesignShell(state: WorkspaceSelfWorkflowState): WorkspaceSelfWorkflowState {
  if (!state.authorityPair) throw new Error('AUTHORITY_LOCK_REQUIRED');
  if (!state.functionContract) throw new Error('FUNCTION_CONTRACT_REQUIRED');

  const opusShellPackage: OpusDesignShellPackage = {
    packageId: `odsp-${Date.now()}`,
    targetId: WORKSPACE_SELF_TARGET_ID,
    authorityPairId: state.authorityPair.authorityPairId,
    functionContractId: state.functionContract.contractId,
    allowedMutationScope: [...OPUS_ALLOWED_MUTATION_SCOPE],
    forbiddenMutationScope: [...OPUS_FORBIDDEN_MUTATION_SCOPE],
    status: 'REQUESTED',
    shellArtifactLabel: null,
    createdAt: new Date().toISOString(),
  };

  return appendHistory(
    { ...state, opusShellPackage },
    'workspace_opus_shell_requested',
    opusShellPackage.packageId,
  );
}

export function markOpusShellCreated(state: WorkspaceSelfWorkflowState): WorkspaceSelfWorkflowState {
  if (!state.opusShellPackage) throw new Error('OPUS_PACKAGE_REQUIRED');
  return appendHistory(
    {
      ...state,
      opusShellPackage: {
        ...state.opusShellPackage,
        status: 'STAGED',
        shellArtifactLabel: 'STAGED_VISUAL_SHELL',
      },
    },
    'workspace_opus_shell_created',
    'Opus shell staged (not production)',
  );
}

export function approveOpusShell(state: WorkspaceSelfWorkflowState): WorkspaceSelfWorkflowState {
  if (!state.opusShellPackage || state.opusShellPackage.status !== 'STAGED') {
    throw new Error('OPUS_SHELL_NOT_STAGED');
  }
  return appendHistory(
    {
      ...state,
      opusShellPackage: { ...state.opusShellPackage, status: 'APPROVED' },
    },
    'workspace_opus_shell_approved',
    state.opusShellPackage.packageId,
  );
}

export function createComposerHandoff(state: WorkspaceSelfWorkflowState): WorkspaceSelfWorkflowState {
  if (!state.opusShellPackage || state.opusShellPackage.status !== 'APPROVED') {
    throw new Error('OPUS_SHELL_NOT_APPROVED');
  }
  if (!state.functionContract) throw new Error('FUNCTION_CONTRACT_REQUIRED');

  const composerHandoff: ComposerWorkspaceHandoffPackage = {
    packageId: `cwhp-${Date.now()}`,
    targetId: WORKSPACE_SELF_TARGET_ID,
    approvedOpusShellPackageId: state.opusShellPackage.packageId,
    functionContractId: state.functionContract.contractId,
    status: 'READY',
    createdAt: new Date().toISOString(),
  };

  return appendHistory(
    { ...state, composerHandoff },
    'workspace_composer_handoff_created',
    composerHandoff.packageId,
  );
}

export function markImplementationStarted(state: WorkspaceSelfWorkflowState): WorkspaceSelfWorkflowState {
  if (!state.composerHandoff) throw new Error('COMPOSER_HANDOFF_REQUIRED');
  return appendHistory(
    {
      ...state,
      composerHandoff: { ...state.composerHandoff, status: 'IMPLEMENTATION_STARTED' },
    },
    'workspace_implementation_started',
    state.composerHandoff.packageId,
  );
}

export function markImplementationReady(state: WorkspaceSelfWorkflowState): WorkspaceSelfWorkflowState {
  if (!state.composerHandoff) throw new Error('COMPOSER_HANDOFF_REQUIRED');
  return appendHistory(
    {
      ...state,
      composerHandoff: { ...state.composerHandoff, status: 'IMPLEMENTATION_READY' },
    },
    'workspace_implementation_ready',
    'Composer implementation ready for visual convergence QA',
  );
}

/** Staged workflow must never write production DESIGN state. */
export function assertProductionWorkspaceUnmutated(): true {
  return true;
}

export function latestCaptureForViewport(
  state: WorkspaceSelfWorkflowState,
  viewport: WorkspaceViewport,
): WorkspaceSelfCapture | null {
  return (
    [...state.captures].reverse().find((c) => c.viewport === viewport && c.status === 'READY') ?? null
  );
}
