import { computeDesignReadiness } from '../../../shared/site00-design-workspace-production/designReadinessEngine.js';
import { createInitialDesignProductionState } from '../../../shared/site00-design-workspace-production/designProductionStore.js';
import {
  transitionCreateTabletOverride,
  transitionLockAuthorityPair,
  transitionMoveToBuild,
  transitionOpenPairReview,
  transitionRecordSpendConfirmation,
  transitionRefineConcept,
  transitionRegenerateConcept,
  transitionPromoteViewportMaster,
  transitionSelectGalleryCandidate,
  transitionSelectViewportCandidate,
  transitionSubmitAuthorityReview,
} from '../../../shared/site00-design-workspace-production/designProductionTransitions.js';
import type { DesignProductionState, FounderActor } from '../../../shared/site00-design-workspace-production/types.js';
import { designWorkspaceProductionStore } from './storeAdapter.js';
import type {
  ApplyDesignWorkspaceCommandInput,
  ApplyDesignWorkspaceCommandResult,
  DesignWorkspaceAuthoritySessionRow,
} from './types.js';
import { DESIGN_WORKSPACE_PRODUCTION_PAGE_ID } from './types.js';

function actor(input: ApplyDesignWorkspaceCommandInput): FounderActor {
  return { email: input.actorEmail, isFounder: input.actorIsFounder };
}

function diffNewHistory(before: DesignProductionState, after: DesignProductionState) {
  if (after.history.length <= before.history.length) return [];
  return after.history.slice(before.history.length);
}

async function applyTransition(
  current: DesignProductionState,
  input: ApplyDesignWorkspaceCommandInput,
): Promise<DesignProductionState> {
  const act = actor(input);
  const payload = input.payload ?? {};
  switch (input.command) {
    case 'START_PAIR_REVIEW':
      return transitionOpenPairReview(current, act);
    case 'APPROVE_AUTHORITY':
      return transitionSubmitAuthorityReview(current, act, (payload.decision as 'APPROVE') ?? 'APPROVE');
    case 'LOCK_AUTHORITY_PAIR':
      return transitionLockAuthorityPair(current, act);
    case 'CREATE_TABLET_OVERRIDE':
      return transitionCreateTabletOverride(current, act, String(payload.reason ?? ''));
    case 'MOVE_TO_BUILD':
      return transitionMoveToBuild(current, act);
    case 'RECORD_SPEND_CONFIRMATION':
      return transitionRecordSpendConfirmation(current, payload.record as Parameters<typeof transitionRecordSpendConfirmation>[1]);
    case 'REFINE_CONCEPT':
      return transitionRefineConcept(current, act, payload as Parameters<typeof transitionRefineConcept>[2]);
    case 'REGENERATE_CONCEPT':
      return transitionRegenerateConcept(current, act, payload as Parameters<typeof transitionRegenerateConcept>[2]);
    case 'SELECT_GALLERY_CANDIDATE':
      return transitionSelectGalleryCandidate(current, String(payload.candidateId ?? ''));
    case 'SELECT_VIEWPORT_CANDIDATE':
      return transitionSelectViewportCandidate(current, act, payload as Parameters<typeof transitionSelectViewportCandidate>[2]);
    case 'PROMOTE_VIEWPORT_MASTER':
      return transitionPromoteViewportMaster(current, act, payload.viewport as 'MOBILE' | 'DESKTOP');
    case 'MIGRATE_FROM_LOCAL': {
      if (!act.isFounder) throw new Error('FOUNDER_ONLY:MIGRATE_FROM_LOCAL');
      const local = payload.localState as DesignProductionState | undefined;
      if (!local?.projectId) throw new Error('INVALID_MIGRATION_PAYLOAD');
      return { ...local, projectId: local.projectId.toLowerCase(), pageId: DESIGN_WORKSPACE_PRODUCTION_PAGE_ID };
    }
    default:
      throw new Error('INVALID_COMMAND');
  }
}

function founderOnlyCommands(): Set<ApplyDesignWorkspaceCommandInput['command']> {
  return new Set([
    'APPROVE_AUTHORITY',
    'LOCK_AUTHORITY_PAIR',
    'CREATE_TABLET_OVERRIDE',
    'MOVE_TO_BUILD',
    'RECORD_SPEND_CONFIRMATION',
    'REFINE_CONCEPT',
    'REGENERATE_CONCEPT',
    'SELECT_VIEWPORT_CANDIDATE',
    'PROMOTE_VIEWPORT_MASTER',
    'MIGRATE_FROM_LOCAL',
  ]);
}

export async function getDesignWorkspaceProductionSession(
  projectId: string,
  pageId: string = DESIGN_WORKSPACE_PRODUCTION_PAGE_ID,
): Promise<DesignWorkspaceAuthoritySessionRow | null> {
  const row = await designWorkspaceProductionStore.getSession(projectId, pageId);
  if (!row) return null;
  const receipt = computeDesignReadiness(row.state);
  return {
    ...row,
    state: {
      ...row.state,
      history: row.state.history,
    },
    latestBuildPackageId: row.state.buildPackage?.id ?? row.latestBuildPackageId,
  };
}

export async function applyDesignWorkspaceProductionCommand(
  input: ApplyDesignWorkspaceCommandInput,
): Promise<ApplyDesignWorkspaceCommandResult> {
  if (founderOnlyCommands().has(input.command) && !input.actorIsFounder) {
    throw new Error(`FOUNDER_ONLY:${input.command}`);
  }

  const pageId = input.pageId || DESIGN_WORKSPACE_PRODUCTION_PAGE_ID;
  let existing = await designWorkspaceProductionStore.getSession(input.projectId, pageId);

  if (input.command === 'MIGRATE_FROM_LOCAL') {
    if (existing) throw new Error('SERVER_SESSION_EXISTS');
    const migrated = await applyTransition(createInitialDesignProductionState(input.projectId), input);
    const row = await designWorkspaceProductionStore.upsertSession({
      projectId: input.projectId,
      pageId,
      expectedSessionVersion: null,
      state: migrated,
      latestBuildPackageId: migrated.buildPackage?.id ?? null,
      newEvents: migrated.history.map((h) => ({
        type: h.type,
        payload: h.payload,
        actorEmail: h.actorEmail,
        at: h.at,
      })),
    });
    return { session: row, state: row.state };
  }

  if (!existing) {
    existing = await designWorkspaceProductionStore.createInitialSession(input.projectId, pageId);
  }

  const before = existing.state;
  const after = await applyTransition(before, input);
  const newEvents = diffNewHistory(before, after).map((h) => ({
    type: h.type,
    payload: h.payload,
    actorEmail: h.actorEmail,
    at: h.at,
  }));

  const row = await designWorkspaceProductionStore.upsertSession({
    projectId: input.projectId,
    pageId,
    expectedSessionVersion: input.expectedSessionVersion ?? existing.sessionVersion,
    state: after,
    latestBuildPackageId: after.buildPackage?.id ?? existing.latestBuildPackageId,
    newEvents,
  });

  if (after.buildPackage && input.command === 'MOVE_TO_BUILD') {
    await designWorkspaceProductionStore.persistBuildPackage({
      sessionId: row.id,
      projectId: input.projectId,
      pageId,
      buildPackage: after.buildPackage,
      readinessReceipt: computeDesignReadiness(after),
    });
  }

  return { session: row, state: row.state };
}
