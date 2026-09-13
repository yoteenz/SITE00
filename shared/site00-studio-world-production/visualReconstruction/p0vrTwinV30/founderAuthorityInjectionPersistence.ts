import { DESIGN_PAGE_V3_PILOT_PROJECT_ID } from './constants.js';
import { applyOneTimeFounderAuthorityInjection } from './founderAuthorityInjection.js';
import type { DesignPageAuthorityReviewSession } from './types.js';

const STORAGE_KEY = 'site00:design-authority:founder-r5f2-injection:v1';

function storageKey(projectId: string): string {
  return `${STORAGE_KEY}:${projectId.toLowerCase()}`;
}

export function readFounderR5F2InjectionMarker(projectId: string): string | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    return localStorage.getItem(storageKey(projectId));
  } catch {
    return null;
  }
}

export function markFounderR5F2InjectionApplied(projectId: string): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(storageKey(projectId), 'applied');
  } catch {
    /* ignore quota */
  }
}

/** One-time R5F2 recovery — skips when pair already locked with receipt. */
export function applyFounderR5F2RecoveryIfNeeded(
  session: DesignPageAuthorityReviewSession,
): DesignPageAuthorityReviewSession {
  if (session.projectId.toLowerCase() !== DESIGN_PAGE_V3_PILOT_PROJECT_ID) {
    return session;
  }
  const pipeline = session.authorityPipeline;
  if (pipeline?.founderAuthorityInjectionReceipt?.status === 'PASS') {
    return session;
  }
  if (pipeline?.authorityPair?.status === 'PAIR_LOCKED' && pipeline.authorityPair.sourceType !== 'FOUNDER_AUTHORITY_INJECTION') {
    return session;
  }
  const next = applyOneTimeFounderAuthorityInjection(session);
  markFounderR5F2InjectionApplied(session.projectId);
  return next;
}
