/**
 * P0.VR.8R2 — Route audit versioning (historical + current snapshots).
 */

import type { RouteAuditVersion } from './types.js';
import { buildPriorRouteAuditRecoveryReport } from './priorAuditDiscovery.js';
import { P0_VR_8R2_LINEAGE } from './constants.js';

const historicalAudits: RouteAuditVersion[] = [];
const currentAudits: RouteAuditVersion[] = [];

export function registerHistoricalAuditVersion(version: RouteAuditVersion): void {
  if (!historicalAudits.some((a) => a.auditId === version.auditId)) {
    historicalAudits.push({ ...version, status: 'HISTORICAL' });
  }
}

export function createCurrentAuditSnapshot(
  projectCounts: Record<string, number>,
  repositoryId: string,
): RouteAuditVersion {
  const report = buildPriorRouteAuditRecoveryReport();
  const version: RouteAuditVersion = {
    auditId: `current-audit:${repositoryId}:${Date.now()}`,
    repositoryId,
    commit: null,
    createdAt: new Date().toISOString(),
    routeCount: Object.values(projectCounts).reduce((a, b) => a + b, 0),
    projectCounts,
    schemaVersion: P0_VR_8R2_LINEAGE,
    status: 'CURRENT',
  };
  currentAudits.push(version);
  void report;
  return version;
}

export function listHistoricalAuditVersions(): RouteAuditVersion[] {
  return [...historicalAudits];
}

export function listCurrentAuditVersions(): RouteAuditVersion[] {
  return [...currentAudits];
}

export function clearRouteAuditVersionsForTest(): void {
  historicalAudits.length = 0;
  currentAudits.length = 0;
}

export function seedHistoricalAuditsFromDiscovery(): void {
  const report = buildPriorRouteAuditRecoveryReport();
  for (const audit of report.audits) {
    registerHistoricalAuditVersion({
      auditId: audit.auditId,
      repositoryId: audit.repositoryId,
      commit: audit.sourceCommit,
      createdAt: audit.lastKnownCompleteAt ?? report.compiledAt,
      routeCount: audit.routeCount,
      projectCounts: Object.fromEntries(audit.projectIds.map((p) => [p, audit.routeCount])),
      schemaVersion: audit.schemaVersion,
      status: 'HISTORICAL',
    });
  }
}
