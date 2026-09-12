/**
 * P0.VR.DIAG.1R4 — Recovery plan / receipt history per report.
 */

import type { RegionEvidenceRecoveryHistoryEntry } from './types.js';

const history = new Map<string, RegionEvidenceRecoveryHistoryEntry[]>();

export function appendRecoveryHistory(reportId: string, entry: RegionEvidenceRecoveryHistoryEntry): void {
  const list = history.get(reportId) ?? [];
  list.push(entry);
  history.set(reportId, list);
}

export function listRecoveryHistory(reportId: string): RegionEvidenceRecoveryHistoryEntry[] {
  return history.get(reportId) ?? [];
}

export function resetRecoveryHistoryForTest(): void {
  history.clear();
}
