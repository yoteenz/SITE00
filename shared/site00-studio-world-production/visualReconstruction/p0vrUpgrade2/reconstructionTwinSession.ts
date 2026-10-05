/**
 * P0.VR.UPGRADE.2 — Reconstruction twin session lifecycle.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import type { ReconstructionPlan } from '../p0vrCapture1/reconstructionPlan.js';
import { buildPageFunctionContract } from './pageFunctionContract.js';
import {
  ensureLivePageVersion,
  registerImplementationVersion,
  setActiveTwinSession,
} from './pageImplementationRegistry.js';
import { buildTwinRoute } from './twinRoute.js';
import type {
  ReconstructionTwinSession,
  TwinBuildStepReceipt,
  TwinImplementationVersion,
  TwinMutationPolicy,
  TwinRevision,
} from './types.js';
import { TWIN_BUILD_STEPS } from './constants.js';
import { runTwinBuildPipeline } from './twinBuildPipeline.js';
import { evaluatePromotionReadiness } from './promotionReadiness.js';
import { runTwinFidelityQa } from './twinFidelityQa.js';
import {
  mergePersistedTwinSessionsIntoRuntime,
  resetTwinSessionPersistenceForTest,
  writePersistedTwinSession,
} from './twinSessionPersistence.js';
import { enrichSessionVisualAuthority } from '../p0vrRebuild1/sessionVisualAuthority.js';

const sessions = new Map<string, ReconstructionTwinSession>();

function sessionKey(sessionId: string): string {
  return sessionId;
}

function pageSessionsKey(projectId: string, pageId: string): string {
  return `${projectId}::${pageId}`;
}

const pageSessionIndex = new Map<string, string>();

function syncRuntimeFromPersistence(): void {
  mergePersistedTwinSessionsIntoRuntime(sessions, pageSessionIndex);
}

function persistSession(session: ReconstructionTwinSession): void {
  writePersistedTwinSession(session);
}

export function createTwinSessionFromApprovedDirection(input: {
  projectId: string;
  pageId: string;
  viewport: DesignViewportClass;
  canonicalRoute: string;
  authorityVersionId: string;
  beforeCaptureId: string;
  captureAssetRef: string | null;
  designAuthorityAssetRef?: string | null;
  plan: ReconstructionPlan;
  measuredSpecId?: string | null;
  forensicsReportId?: string | null;
  isRootPage?: boolean;
  mutationPolicy?: TwinMutationPolicy;
}): ReconstructionTwinSession {
  syncRuntimeFromPersistence();
  const liveVersion = ensureLivePageVersion({
    projectId: input.projectId,
    pageId: input.pageId,
    route: input.canonicalRoute,
  });

  // Supersede prior unpromoted twin for same page
  const priorSessionId = pageSessionIndex.get(pageSessionsKey(input.projectId, input.pageId));
  if (priorSessionId) {
    const prior = sessions.get(priorSessionId);
    if (prior && prior.status !== 'PROMOTED' && prior.status !== 'ARCHIVED') {
      sessions.set(priorSessionId, { ...prior, status: 'SUPERSEDED', updatedAt: new Date().toISOString() });
    }
  }

  const sessionId = `twin_${input.projectId}_${Date.now()}`;
  const twinRoute = buildTwinRoute({ projectId: input.projectId, pageId: input.pageId, sessionId });
  const functionContract = buildPageFunctionContract({
    route: input.canonicalRoute,
    isRootPage: input.isRootPage,
    pagePurpose: input.plan.pagePurpose,
  });

  const buildSteps: TwinBuildStepReceipt[] = TWIN_BUILD_STEPS.map((step) => ({
    step,
    status: 'PENDING',
    completedAt: null,
    detail: null,
  }));

  const session: ReconstructionTwinSession = {
    sessionId,
    projectId: input.projectId,
    pageId: input.pageId,
    viewport: input.viewport,
    canonicalRoute: input.canonicalRoute,
    twinRoute,
    authorityVersionId: input.authorityVersionId,
    beforeCaptureId: input.beforeCaptureId,
    reconstructionPlanId: input.plan.planId,
    sourceLiveVersionId: liveVersion.versionId,
    twinVersionId: null,
    mutationPolicy: input.mutationPolicy ?? 'READ_ONLY',
    functionContract,
    reconstructionPlan: input.plan,
    measuredSpecId: input.measuredSpecId ?? input.plan.measuredSpecId ?? null,
    forensicsReportId: input.forensicsReportId ?? input.plan.forensicsReportId ?? null,
    postTwinForensicsReportId: null,
    convergenceBefore: null,
    convergenceAfter: null,
    status: 'PLANNED',
    buildSteps,
    twinCapture: null,
    revisions: [],
    twinVersions: [],
    fidelityQa: [],
    promotionReadiness: null,
    responsiveImpact: input.viewport === 'mobile' ? [] : ['TABLET', 'DESKTOP'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    approvedForPromotionAt: null,
    promotedAt: null,
    designAuthorityAssetRef: input.designAuthorityAssetRef ?? null,
  };

  sessions.set(sessionKey(sessionId), session);
  pageSessionIndex.set(pageSessionsKey(input.projectId, input.pageId), sessionId);
  setActiveTwinSession(input.projectId, input.pageId, sessionId);
  persistSession(session);
  return session;
}

export function getTwinSession(sessionId: string): ReconstructionTwinSession | null {
  syncRuntimeFromPersistence();
  const raw = sessions.get(sessionKey(sessionId));
  if (!raw) return null;
  return enrichSessionVisualAuthority(raw);
}

/** Register a twin session from preview handoff (sessionStorage) into runtime + localStorage. */
export function importTwinSessionForPreview(session: ReconstructionTwinSession): ReconstructionTwinSession {
  syncRuntimeFromPersistence();
  sessions.set(sessionKey(session.sessionId), session);
  if (session.status !== 'PROMOTED' && session.status !== 'SUPERSEDED') {
    pageSessionIndex.set(pageSessionsKey(session.projectId, session.pageId), session.sessionId);
    setActiveTwinSession(session.projectId, session.pageId, session.sessionId);
  }
  persistSession(session);
  return enrichSessionVisualAuthority(session);
}

export function getActiveTwinSessionForPage(
  projectId: string,
  pageId: string,
): ReconstructionTwinSession | null {
  syncRuntimeFromPersistence();
  const id = pageSessionIndex.get(pageSessionsKey(projectId, pageId));
  if (!id) return null;
  const session = sessions.get(id);
  if (!session || session.status === 'SUPERSEDED' || session.status === 'PROMOTED') return null;
  return enrichSessionVisualAuthority(session);
}

export function updateTwinSession(
  sessionId: string,
  patch: Partial<ReconstructionTwinSession>,
): ReconstructionTwinSession | null {
  const existing = getTwinSession(sessionId);
  if (!existing) return null;
  const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
  sessions.set(sessionKey(sessionId), updated);
  persistSession(updated);
  return updated;
}

export async function buildTwin(sessionId: string): Promise<ReconstructionTwinSession | null> {
  const session = getTwinSession(sessionId);
  if (!session || session.status !== 'PLANNED' && session.status !== 'FAILED') return null;

  updateTwinSession(sessionId, { status: 'BUILDING' });
  const result = await runTwinBuildPipeline(session);
  return updateTwinSession(sessionId, result);
}

export function addTwinRevision(
  sessionId: string,
  instruction: string,
  materialDirectionChange = false,
): TwinRevision | null {
  const session = getTwinSession(sessionId);
  if (!session) return null;
  const revision: TwinRevision = {
    revisionId: `rev_${sessionId}_${session.revisions.length + 1}`,
    sessionId,
    instruction: instruction.trim(),
    source: 'FOUNDER',
    createdAt: new Date().toISOString(),
    status: 'PENDING',
    resultVersionId: null,
    materialDirectionChange,
  };
  updateTwinSession(sessionId, {
    revisions: [...session.revisions, revision],
    status: materialDirectionChange ? session.status : 'REVISION_REQUESTED',
  });
  return revision;
}

export async function applyTwinRevision(sessionId: string, revisionId: string): Promise<ReconstructionTwinSession | null> {
  const session = getTwinSession(sessionId);
  if (!session) return null;
  updateTwinSession(sessionId, { status: 'REVISING' });
  const rev = session.revisions.find((r) => r.revisionId === revisionId);
  if (!rev) return null;

  const nextRevision = session.twinVersions.length + 1;
  const version: TwinImplementationVersion = {
    versionId: `twin_v${sessionId}_${nextRevision}`,
    sessionId,
    revisionNumber: nextRevision,
    buildRef: `TWIN_REVISION_${nextRevision}`,
    commitSha: null,
    createdAt: new Date().toISOString(),
    status: 'READY',
  };
  registerImplementationVersion({
    versionId: version.versionId,
    commitSha: null,
    patchId: `patch_${revisionId}`,
    buildRef: version.buildRef,
    pageId: session.pageId,
    route: session.canonicalRoute,
    sourceSessionId: sessionId,
    authorityVersionId: session.authorityVersionId,
    captureId: session.beforeCaptureId,
    reconstructionPlanId: session.reconstructionPlanId,
    status: 'TWIN',
    createdAt: version.createdAt,
  });

  const updatedRevisions = session.revisions.map((r) =>
    r.revisionId === revisionId
      ? { ...r, status: 'APPLIED' as const, resultVersionId: version.versionId }
      : r,
  );

  const fidelityQa = runTwinFidelityQa({
    plan: session.reconstructionPlan,
    functionContract: session.functionContract,
    twinCapture: session.twinCapture,
    authorityVersionId: session.authorityVersionId,
    sessionAuthorityVersionId: session.authorityVersionId,
  });

  return updateTwinSession(sessionId, {
    twinVersionId: version.versionId,
    twinVersions: [...session.twinVersions, version],
    revisions: updatedRevisions,
    fidelityQa,
    status: 'READY_FOR_REVIEW',
    promotionReadiness: evaluatePromotionReadiness({
      session: { ...session, twinVersionId: version.versionId },
      fidelityQa,
      currentAuthorityVersionId: session.authorityVersionId,
      founderApproved: false,
    }),
  });
}

export function approveTwinForPromotion(sessionId: string): ReconstructionTwinSession | null {
  const session = getTwinSession(sessionId);
  if (!session) return null;
  const fidelityQa =
    session.fidelityQa.length > 0
      ? session.fidelityQa
      : runTwinFidelityQa({
          plan: session.reconstructionPlan,
          functionContract: session.functionContract,
          twinCapture: session.twinCapture,
          authorityVersionId: session.authorityVersionId,
          sessionAuthorityVersionId: session.authorityVersionId,
        });
  const readiness = evaluatePromotionReadiness({
    session,
    fidelityQa,
    currentAuthorityVersionId: session.authorityVersionId,
    founderApproved: true,
  });
  return updateTwinSession(sessionId, {
    status: 'APPROVED_FOR_PROMOTION',
    approvedForPromotionAt: new Date().toISOString(),
    fidelityQa,
    promotionReadiness: readiness,
  });
}

export function resumeTwinSession(sessionId: string): ReconstructionTwinSession | null {
  const session = getTwinSession(sessionId);
  if (!session || session.status === 'PROMOTED') return null;
  if (session.status === 'SUPERSEDED') return null;
  pageSessionIndex.set(pageSessionsKey(session.projectId, session.pageId), sessionId);
  setActiveTwinSession(session.projectId, session.pageId, sessionId);
  return session;
}

export function clearReconstructionTwinSessionsRuntimeOnlyForTest(): void {
  sessions.clear();
  pageSessionIndex.clear();
}

export function resetReconstructionTwinSessionsForTest(): void {
  clearReconstructionTwinSessionsRuntimeOnlyForTest();
  resetTwinSessionPersistenceForTest();
}
