/**
 * P0.DEPLOY.1 — Rollback policy (manual; no auto-rollback on smoke warnings).
 */

import type { ReleaseHistoryEntry, RollbackReceipt } from './types.js';

export type ReleaseRollbackPolicy = {
  autoRollbackOnSmokeWarning: boolean;
  autoRollbackOnCriticalFrontendFailure: boolean;
  requireKnownGoodRelease: boolean;
};

export const DEFAULT_ROLLBACK_POLICY: ReleaseRollbackPolicy = {
  autoRollbackOnSmokeWarning: false,
  autoRollbackOnCriticalFrontendFailure: false,
  requireKnownGoodRelease: true,
};

export function resolveLastKnownGoodRelease(history: ReleaseHistoryEntry[]): string | null {
  const good = history.filter((h) => h.status === 'READY');
  return good.length ? good[good.length - 1]!.releaseId : null;
}

export function buildRollbackReceipt(options: {
  fromRelease: string;
  toRelease: string;
  reason: string;
}): RollbackReceipt {
  return {
    fromRelease: options.fromRelease,
    toRelease: options.toRelease,
    reason: options.reason,
    frontendStatus: 'ROLLED_BACK',
    backendStatus: 'READY',
    completedAt: new Date().toISOString(),
  };
}
