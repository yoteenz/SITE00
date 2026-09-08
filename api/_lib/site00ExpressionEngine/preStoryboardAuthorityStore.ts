/**
 * Sprint B4.7 — In-memory pre-storyboard authority judgment store.
 */

import type {
  PreStoryboardFounderJudgment,
} from '../../../shared/site00-expression-engine/preStoryboardVisualAuthorityTypes.js';
import type { PreStoryboardAuthorityKey } from './preStoryboardAuthorityGate.js';
import {
  ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS,
  isEntry002PreStoryboardFounderApprovalComplete,
} from './entry002PreStoryboardFounderApproval.js';

export type StoredPreStoryboardAuthorityJudgment = {
  authorityKey: PreStoryboardAuthorityKey;
  authorityId: string;
  founderJudgment: PreStoryboardFounderJudgment;
  notes: string | null;
  updatedAt: string;
  version?: string;
  approvedAt?: string | null;
};

const judgmentStore = new Map<PreStoryboardAuthorityKey, StoredPreStoryboardAuthorityJudgment>();

let canonicalApprovalsLoaded = false;

export function resetPreStoryboardAuthorityStore(): void {
  judgmentStore.clear();
  canonicalApprovalsLoaded = false;
}

export function getPreStoryboardAuthorityJudgment(
  key: PreStoryboardAuthorityKey,
): StoredPreStoryboardAuthorityJudgment | null {
  return judgmentStore.get(key) ?? null;
}

export function getAllPreStoryboardAuthorityJudgments(): StoredPreStoryboardAuthorityJudgment[] {
  return [...judgmentStore.values()];
}

export function recordPreStoryboardAuthorityJudgment(params: {
  authorityKey: PreStoryboardAuthorityKey;
  authorityId: string;
  founderJudgment: PreStoryboardFounderJudgment;
  notes?: string | null;
  version?: string;
  approvedAt?: string | null;
}): StoredPreStoryboardAuthorityJudgment {
  const record: StoredPreStoryboardAuthorityJudgment = {
    authorityKey: params.authorityKey,
    authorityId: params.authorityId,
    founderJudgment: params.founderJudgment,
    notes: params.notes ?? null,
    updatedAt: new Date().toISOString(),
    version: params.version,
    approvedAt: params.approvedAt ?? (params.founderJudgment === 'LOVE_IT' ? new Date().toISOString() : null),
  };
  judgmentStore.set(params.authorityKey, record);
  return record;
}

/** Load canonical B4.8 founder approvals into the judgment store (idempotent). */
export function persistEntry002PreStoryboardFounderApprovals(): {
  persisted: number;
  gateSatisfied: boolean;
} {
  for (const approval of ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS) {
    recordPreStoryboardAuthorityJudgment({
      authorityKey: approval.authorityKey,
      authorityId: approval.authorityId,
      founderJudgment: approval.founderJudgment,
      notes: 'Founder explicit LOVE_IT — B4.8 gate satisfaction',
      version: approval.version,
      approvedAt: approval.approvedAt,
    });
  }
  canonicalApprovalsLoaded = true;
  return {
    persisted: ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS.length,
    gateSatisfied: isEntry002PreStoryboardFounderApprovalComplete(getAllPreStoryboardAuthorityJudgments()),
  };
}

export function ensureEntry002PreStoryboardFounderApprovalsLoaded(): boolean {
  if (
    canonicalApprovalsLoaded &&
    isEntry002PreStoryboardFounderApprovalComplete(getAllPreStoryboardAuthorityJudgments())
  ) {
    return true;
  }
  if (isEntry002PreStoryboardFounderApprovalComplete(getAllPreStoryboardAuthorityJudgments())) {
    canonicalApprovalsLoaded = true;
    return true;
  }
  persistEntry002PreStoryboardFounderApprovals();
  return true;
}

export function isEntry002PreStoryboardGatePersistentlySatisfied(): boolean {
  return isEntry002PreStoryboardFounderApprovalComplete(getAllPreStoryboardAuthorityJudgments());
}
