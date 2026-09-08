/**
 * Sprint B4.7 — In-memory pre-storyboard authority judgment store.
 */

import type {
  PreStoryboardFounderJudgment,
} from '../../../shared/site00-expression-engine/preStoryboardVisualAuthorityTypes.js';
import type { PreStoryboardAuthorityKey } from './preStoryboardAuthorityGate.js';

export type StoredPreStoryboardAuthorityJudgment = {
  authorityKey: PreStoryboardAuthorityKey;
  authorityId: string;
  founderJudgment: PreStoryboardFounderJudgment;
  notes: string | null;
  updatedAt: string;
};

const judgmentStore = new Map<PreStoryboardAuthorityKey, StoredPreStoryboardAuthorityJudgment>();

export function resetPreStoryboardAuthorityStore(): void {
  judgmentStore.clear();
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
}): StoredPreStoryboardAuthorityJudgment {
  const record: StoredPreStoryboardAuthorityJudgment = {
    authorityKey: params.authorityKey,
    authorityId: params.authorityId,
    founderJudgment: params.founderJudgment,
    notes: params.notes ?? null,
    updatedAt: new Date().toISOString(),
  };
  judgmentStore.set(params.authorityKey, record);
  return record;
}
