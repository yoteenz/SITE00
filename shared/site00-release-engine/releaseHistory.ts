/**
 * P0.DEPLOY.1 — In-memory release history (CI artifact / future persistence).
 */

import type { ReleaseHistoryEntry, ReleaseStatus } from './types.js';

let history: ReleaseHistoryEntry[] = [];

export function appendReleaseHistory(entry: ReleaseHistoryEntry): void {
  history = [...history, entry];
}

export function listReleaseHistory(limit = 20): ReleaseHistoryEntry[] {
  return history.slice(-limit);
}

export function recordReleaseFromReceipt(options: {
  releaseId: string;
  version: string;
  commitSha: string;
  status: ReleaseStatus;
  rollbackFrom?: string | null;
  notes?: string | null;
}): ReleaseHistoryEntry {
  const entry: ReleaseHistoryEntry = {
    releaseId: options.releaseId,
    version: options.version,
    commitSha: options.commitSha,
    status: options.status,
    deployedAt: new Date().toISOString(),
    rollbackFrom: options.rollbackFrom ?? null,
    notes: options.notes ?? null,
  };
  appendReleaseHistory(entry);
  return entry;
}

export function resetReleaseHistoryForTest(): void {
  history = [];
}
