/**
 * P0.VR.6R2 — Visual convergence comparison session store.
 */

import type { DesignReferenceComparisonSession } from './types.js';

const sessions = new Map<string, DesignReferenceComparisonSession>();
const byContract = new Map<string, string>();
const byReference = new Map<string, string>();

function now(): string {
  return new Date().toISOString();
}

export function sessionId(): string {
  return `vcs-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function saveComparisonSession(session: DesignReferenceComparisonSession): DesignReferenceComparisonSession {
  sessions.set(session.sessionId, session);
  byContract.set(session.contractId, session.sessionId);
  byReference.set(session.referenceId, session.sessionId);
  return session;
}

export function getComparisonSession(sessionId: string): DesignReferenceComparisonSession | null {
  return sessions.get(sessionId) ?? null;
}

export function getComparisonSessionByContract(contractId: string): DesignReferenceComparisonSession | null {
  const id = byContract.get(contractId);
  return id ? sessions.get(id) ?? null : null;
}

export function getComparisonSessionByReference(referenceId: string): DesignReferenceComparisonSession | null {
  const id = byReference.get(referenceId);
  return id ? sessions.get(id) ?? null : null;
}

export function listComparisonSessions(filter?: {
  projectId?: string;
  pageId?: string;
}): DesignReferenceComparisonSession[] {
  return [...sessions.values()].filter((s) => {
    if (filter?.projectId && s.projectId !== filter.projectId) return false;
    if (filter?.pageId && s.pageId !== filter.pageId) return false;
    return true;
  });
}

export function patchComparisonSession(
  sessionId: string,
  patch: Partial<DesignReferenceComparisonSession>,
): DesignReferenceComparisonSession | null {
  const session = sessions.get(sessionId);
  if (!session) return null;
  Object.assign(session, patch);
  return session;
}

export function appendSessionHistory(
  sessionId: string,
  event: DesignReferenceComparisonSession['historyEvents'][number]['event'],
  detail?: string,
): DesignReferenceComparisonSession | null {
  const session = sessions.get(sessionId);
  if (!session) return null;
  session.historyEvents.push({ event, at: now(), detail });
  return session;
}

export function clearConvergenceSessionStoreForTest(): void {
  sessions.clear();
  byContract.clear();
  byReference.clear();
}
