/**
 * P0.VR.CONVERGE.1R1 — Twin preview tab must resolve session (localStorage + sessionStorage handoff).
 */

import type { ReconstructionTwinSession } from './types.js';
import { getTwinSession, importTwinSessionForPreview } from './reconstructionTwinSession.js';
import {
  listPersistedTwinSessionsForProject,
  readPersistedActiveTwinSessionId,
} from './twinSessionPersistence.js';
import { decodePageScopeToPageId, encodePageScope } from './twinRoute.js';
import { enrichSessionVisualAuthority } from '../p0vrRebuild1/sessionVisualAuthority.js';

const HANDOFF_PREFIX = 'site00:twin-preview-handoff:v1:';

/** Smaller JSON for sessionStorage / quota-sensitive mobile handoff. */
export function slimTwinSessionForPreviewHandoff(session: ReconstructionTwinSession): ReconstructionTwinSession {
  return {
    ...session,
    fidelityQa: session.fidelityQa.slice(0, 6),
    revisions: session.revisions.slice(-3),
    twinVersions: session.twinVersions.slice(-2),
    buildSteps: session.buildSteps,
  };
}

function writeHandoff(sessionId: string, json: string): void {
  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.setItem(`${HANDOFF_PREFIX}${sessionId}`, json);
      return;
    } catch {
      // fall through
    }
  }
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(`${HANDOFF_PREFIX}${sessionId}`, json);
    } catch {
      // ignore
    }
  }
}

function readHandoffRaw(sessionId: string): string | null {
  if (typeof sessionStorage !== 'undefined') {
    try {
      const raw = sessionStorage.getItem(`${HANDOFF_PREFIX}${sessionId}`);
      if (raw) return raw;
    } catch {
      // fall through
    }
  }
  if (typeof localStorage !== 'undefined') {
    try {
      return localStorage.getItem(`${HANDOFF_PREFIX}${sessionId}`);
    } catch {
      return null;
    }
  }
  return null;
}

export function stashTwinSessionForPreview(session: ReconstructionTwinSession): void {
  const slim = slimTwinSessionForPreviewHandoff(session);
  try {
    writeHandoff(session.sessionId, JSON.stringify(slim));
  } catch {
    try {
      writeHandoff(
        session.sessionId,
        JSON.stringify({
          sessionId: slim.sessionId,
          projectId: slim.projectId,
          pageId: slim.pageId,
          canonicalRoute: slim.canonicalRoute,
          twinRoute: slim.twinRoute,
          status: slim.status,
          viewport: slim.viewport,
          authorityVersionId: slim.authorityVersionId,
          reconstructionPlanId: slim.reconstructionPlanId,
          twinCssPatch: slim.twinCssPatch,
          reconstructionPlan: slim.reconstructionPlan,
          regionExecutionDecisions: slim.regionExecutionDecisions,
          functionContract: slim.functionContract,
          buildSteps: slim.buildSteps,
          sourceLiveVersionId: slim.sourceLiveVersionId,
          beforeCaptureId: slim.beforeCaptureId,
          twinVersionId: slim.twinVersionId,
          mutationPolicy: slim.mutationPolicy,
          createdAt: slim.createdAt,
          updatedAt: slim.updatedAt,
          twinCapture: slim.twinCapture,
          responsiveImpact: slim.responsiveImpact,
          approvedForPromotionAt: slim.approvedForPromotionAt,
          promotedAt: slim.promotedAt,
          fidelityQa: [],
          revisions: [],
          twinVersions: [],
          promotionReadiness: slim.promotionReadiness,
        } as ReconstructionTwinSession),
      );
    } catch {
      // persistence layer may still have the session
    }
  }
}

export function readTwinSessionHandoff(sessionId: string): ReconstructionTwinSession | null {
  try {
    const raw = readHandoffRaw(sessionId);
    if (!raw) return null;
    return JSON.parse(raw) as ReconstructionTwinSession;
  } catch {
    return null;
  }
}

export function resolveTwinSessionForPreview(sessionId: string): ReconstructionTwinSession | null {
  const fromRegistry = getTwinSession(sessionId);
  if (fromRegistry) return fromRegistry;
  const handoff = readTwinSessionHandoff(sessionId);
  if (!handoff) return null;
  return enrichSessionVisualAuthority(importTwinSessionForPreview(handoff));
}

/**
 * Resolve twin for debug URL — session id in path may be stale; fall back to active session for page scope.
 */
export function resolveTwinSessionForPreviewRoute(input: {
  projectSlug: string;
  pageScope: string;
  sessionId: string;
}): ReconstructionTwinSession | null {
  const direct = resolveTwinSessionForPreview(input.sessionId);
  if (direct && direct.projectId === input.projectSlug) return direct;

  const pageId = decodePageScopeToPageId(input.projectSlug, input.pageScope);
  const activeId = readPersistedActiveTwinSessionId(input.projectSlug, pageId);
  if (activeId) {
    const active = resolveTwinSessionForPreview(activeId);
    if (active) return active;
  }

  const candidates = listPersistedTwinSessionsForProject(input.projectSlug).filter(
    (s) =>
      encodePageScope(s.pageId) === input.pageScope &&
      s.status !== 'PROMOTED' &&
      s.status !== 'SUPERSEDED',
  );
  candidates.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const latest = candidates[0];
  if (latest) return enrichSessionVisualAuthority(importTwinSessionForPreview(latest));

  return null;
}
