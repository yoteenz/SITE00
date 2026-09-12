/**
 * P0.VR.DIAG.1R3 — In-memory forensic reports for recalculate-without-recapture.
 */

import type { AuthorityRelativeForensicsReport } from './types.js';

const reports = new Map<string, AuthorityRelativeForensicsReport>();

export function storeForensicReport(report: AuthorityRelativeForensicsReport): void {
  reports.set(report.reportId, report);
}

export function getForensicReport(reportId: string | null | undefined): AuthorityRelativeForensicsReport | null {
  if (!reportId) return null;
  return reports.get(reportId) ?? null;
}

export function resetForensicReportRegistryForTest(): void {
  reports.clear();
}
