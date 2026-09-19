/**
 * P0.VR.DESIGN-HERO-ASSEMBLY-ACTIONS1 — Opus page framework handoff package (no live Opus invoke).
 */

import {
  createComposerHandoffPackage,
  type PageAuthorityWorkflowState,
  type TwinImplementationPackage,
} from './designPageAuthorityWorkflow.js';
import { compileDesignPageContext } from './designProjectBinding/pageContext.js';

export type OpusFrameworkWorkflowStage = 'FRAMEWORK_BUILDING' | 'FRAMEWORK_READY';

export type OpusFrameworkHandoffPackage = TwinImplementationPackage & {
  projectContextVersion: string;
  currentImplementationRoute: string;
  targetTwinRoute: string;
  workflowStage: OpusFrameworkWorkflowStage;
  /** Queued for Opus runtime — founder confirmation only; no auto-dispatch. */
  opusDispatchQueued: boolean;
};

export function isOpusFrameworkHandoffPackage(
  pkg: TwinImplementationPackage | null,
): pkg is OpusFrameworkHandoffPackage {
  return Boolean(pkg && 'workflowStage' in pkg && (pkg as OpusFrameworkHandoffPackage).workflowStage);
}

export function createOpusFrameworkHandoffPackage(
  state: PageAuthorityWorkflowState,
  input: {
    projectId: string;
    pageId: string;
    interactionContractVersion: string;
    assetManifestVersion: string;
    pageContextVersion: string;
    projectContextVersion: string;
    tabletPolicy: 'DERIVED' | 'OVERRIDE';
    currentImplementationRoute: string;
    targetTwinRoute: string;
  },
): { state: PageAuthorityWorkflowState; pkg: OpusFrameworkHandoffPackage } {
  const { state: nextState, pkg: base } = createComposerHandoffPackage(state, {
    projectId: input.projectId,
    pageId: input.pageId,
    interactionContractVersion: input.interactionContractVersion,
    assetManifestVersion: input.assetManifestVersion,
    pageContextVersion: input.pageContextVersion,
    tabletPolicy: input.tabletPolicy,
  });
  const pkg: OpusFrameworkHandoffPackage = {
    ...base,
    projectContextVersion: input.projectContextVersion,
    currentImplementationRoute: input.currentImplementationRoute,
    targetTwinRoute: input.targetTwinRoute,
    workflowStage: 'FRAMEWORK_BUILDING',
    opusDispatchQueued: true,
  };
  return {
    state: { ...nextState, composerHandoffPackage: pkg },
    pkg,
  };
}

export function resolveOpusFrameworkRoutes(projectId: string, pageId: string): {
  currentImplementationRoute: string;
  targetTwinRoute: string;
} {
  const ctx = compileDesignPageContext(projectId, pageId);
  const route = ctx?.route ?? `/projects/${projectId}`;
  return {
    currentImplementationRoute: route,
    targetTwinRoute: route,
  };
}

export function markOpusFrameworkReadyForReview(
  state: PageAuthorityWorkflowState,
): PageAuthorityWorkflowState {
  const pkg = state.composerHandoffPackage;
  if (!pkg || !isOpusFrameworkHandoffPackage(pkg)) return state;
  const updated: OpusFrameworkHandoffPackage = {
    ...pkg,
    workflowStage: 'FRAMEWORK_READY',
  };
  return {
    ...state,
    twinImplementationStatus: 'READY_FOR_REVIEW',
    composerHandoffPackage: updated,
  };
}
