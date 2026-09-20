import { DEFAULT_WORKSPACE_SELF_SOURCE, resolveWorkspaceSelfDesignRoute } from './sourceContext.js';
import { evaluateNbpHandoffReadiness, latestReadyCapture } from './readiness.js';
import type {
  WorkspaceSelfCapture,
  WorkspaceSelfCaptureSet,
  WorkspaceSelfWorkflowState,
} from './types.js';
import { WORKSPACE_SELF_TARGET_ID } from '../designTargetModel.js';
import { WORKSPACE_CONCEPT_GENERATION_COUNT } from './constants.js';

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

export function normalizeWorkspaceSelfState(state: WorkspaceSelfWorkflowState): WorkspaceSelfWorkflowState {
  return {
    ...state,
    sourceContext: state.sourceContext ?? DEFAULT_WORKSPACE_SELF_SOURCE,
    captureSets: state.captureSets ?? [],
    activeCaptureSetId: state.activeCaptureSetId ?? null,
    lastCaptureFailure: state.lastCaptureFailure ?? null,
    conceptSet: state.conceptSet ?? null,
    creativePipelineSet: state.creativePipelineSet ?? null,
    generationJobs: state.generationJobs ?? [],
    generationStatus: state.generationStatus ?? 'IDLE',
    lastGenerationFailure: state.lastGenerationFailure ?? null,
    captures: (state.captures ?? []).map((c) => ({
      ...c,
      status: c.status ?? (c.artifactPath ? 'READY' : 'FAILED'),
    })),
  };
}

export function beginWorkspaceSelfCaptureSet(
  state: WorkspaceSelfWorkflowState,
  input: { build: string; createdBy: string },
): WorkspaceSelfWorkflowState {
  const ctx = state.sourceContext ?? DEFAULT_WORKSPACE_SELF_SOURCE;
  const captureSetId = `wscs-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const route = resolveWorkspaceSelfDesignRoute(ctx);
  const set: WorkspaceSelfCaptureSet = {
    captureSetId,
    targetId: WORKSPACE_SELF_TARGET_ID,
    mobileCaptureId: null,
    desktopCaptureId: null,
    sourceBuild: input.build,
    sourceRoute: route,
    sourceProjectId: ctx.projectSlug,
    sourcePageId: ctx.pageId,
    createdAt: new Date().toISOString(),
    createdBy: input.createdBy,
    status: 'CAPTURING',
  };
  return appendHistory(
    { ...state, captureSets: [...state.captureSets, set], activeCaptureSetId: captureSetId, lastCaptureFailure: null },
    'workspace_capture_created',
    captureSetId,
  );
}

export function applyWorkspaceSelfCapturePair(
  state: WorkspaceSelfWorkflowState,
  input: {
    captureSetId: string;
    build: string;
    createdBy: string;
    route: string;
    mobile: { captureId: string; artifactPath: string };
    desktop: { captureId: string; artifactPath: string };
  },
): WorkspaceSelfWorkflowState {
  const ctx = state.sourceContext ?? DEFAULT_WORKSPACE_SELF_SOURCE;
  const now = new Date().toISOString();

  const makeCapture = (
    viewport: 'MOBILE' | 'DESKTOP',
    row: { captureId: string; artifactPath: string },
  ): WorkspaceSelfCapture => ({
    captureId: row.captureId,
    targetId: WORKSPACE_SELF_TARGET_ID,
    viewport,
    route: input.route,
    projectId: ctx.projectSlug,
    pageId: ctx.pageId,
    build: input.build,
    artifactPath: row.artifactPath,
    timestamp: now,
    createdBy: input.createdBy,
    status: 'READY',
    captureSetId: input.captureSetId,
  });

  const mobileCapture = makeCapture('MOBILE', input.mobile);
  const desktopCapture = makeCapture('DESKTOP', input.desktop);

  const supersededCaptures = state.captures.map((c) =>
    c.status === 'READY' && (c.viewport === 'MOBILE' || c.viewport === 'DESKTOP') ?
      { ...c, status: 'SUPERSEDED' as const }
    : c,
  );

  const captureSets = state.captureSets.map((set) => {
    if (set.captureSetId === input.captureSetId) {
      return {
        ...set,
        status: 'READY' as const,
        mobileCaptureId: mobileCapture.captureId,
        desktopCaptureId: desktopCapture.captureId,
      };
    }
    if (set.status === 'READY') return { ...set, status: 'SUPERSEDED' as const };
    return set;
  });

  let next: WorkspaceSelfWorkflowState = {
    ...state,
    captures: [...supersededCaptures, mobileCapture, desktopCapture],
    captureSets,
    activeCaptureSetId: input.captureSetId,
    lastCaptureFailure: null,
  };

  next = appendHistory(next, 'workspace_self_capture_created', `${mobileCapture.captureId}+${desktopCapture.captureId}`);
  return syncNbpPackageFromCaptures(next);
}

export function failWorkspaceSelfCaptureSet(
  state: WorkspaceSelfWorkflowState,
  input: { captureSetId: string; reason: string },
): WorkspaceSelfWorkflowState {
  const captureSets = state.captureSets.map((set) =>
    set.captureSetId === input.captureSetId ?
      { ...set, status: 'FAILED' as const, failureReason: input.reason }
    : set,
  );
  const prevActive = state.activeCaptureSetId;
  const rollbackActive =
    prevActive === input.captureSetId ?
      [...captureSets].reverse().find((s) => s.status === 'READY')?.captureSetId ?? null
    : state.activeCaptureSetId;

  return appendHistory(
    {
      ...state,
      captureSets,
      activeCaptureSetId: rollbackActive,
      lastCaptureFailure: { message: input.reason, at: new Date().toISOString(), captureSetId: input.captureSetId },
    },
    'workspace_capture_failed',
    input.reason,
  );
}

export function activeReadyCaptureSet(state: WorkspaceSelfWorkflowState): WorkspaceSelfCaptureSet | null {
  const id = state.activeCaptureSetId;
  if (id) {
    const active = state.captureSets.find((s) => s.captureSetId === id && s.status === 'READY');
    if (active) return active;
  }
  return [...state.captureSets].reverse().find((s) => s.status === 'READY') ?? null;
}

export function syncNbpPackageFromCaptures(state: WorkspaceSelfWorkflowState): WorkspaceSelfWorkflowState {
  const readiness = evaluateNbpHandoffReadiness(state);
  if (readiness !== 'READY_FOR_NBP' || !state.functionContract) {
    return {
      ...state,
      nbpPackage: state.nbpPackage ?
        {
          ...state.nbpPackage,
          status: 'BLOCKED',
          readiness,
          currentMobileCaptureId: latestReadyCapture(state, 'MOBILE')?.captureId ?? null,
          currentDesktopCaptureId: latestReadyCapture(state, 'DESKTOP')?.captureId ?? null,
        }
      : null,
    };
  }

  const mobile = latestReadyCapture(state, 'MOBILE')!;
  const desktop = latestReadyCapture(state, 'DESKTOP')!;

  const nbpPackage = {
    packageId: state.nbpPackage?.packageId ?? `wsgp-${Date.now()}`,
    targetId: WORKSPACE_SELF_TARGET_ID,
    currentMobileCaptureId: mobile.captureId,
    currentDesktopCaptureId: desktop.captureId,
    functionContractId: state.functionContract.contractId,
    hostDesignSystemVersion: 'site00-host-v1',
    workspaceArchitectureVersion: 'twin-opus-direct-v1',
    generationCount: WORKSPACE_CONCEPT_GENERATION_COUNT as 3,
    status: 'READY_FOR_NBP' as const,
    readiness: 'READY_FOR_NBP' as const,
    createdAt: state.nbpPackage?.createdAt ?? new Date().toISOString(),
  };

  return appendHistory({ ...state, nbpPackage }, 'workspace_concept_package_created', nbpPackage.packageId);
}
