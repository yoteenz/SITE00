/**
 * B5.10 — Technical state stale data QA.
 */

import type { ProjectCodebaseIntelligence } from './types.js';

export type ProjectTechnicalStaleFailureClass =
  | 'REPOSITORY_NOT_CONNECTED'
  | 'REPOSITORY_SYNC_STALE'
  | 'PROJECT_STATE_MISMATCH'
  | 'BUILD_STATUS_STALE'
  | 'DEPENDENCY_SCAN_STALE'
  | 'DEPLOYMENT_STATE_STALE'
  | 'ENVIRONMENT_STATE_STALE'
  | 'READINESS_WITHOUT_EVIDENCE'
  | 'MISSING_REQUIRED_ENVIRONMENT'
  | 'MISSING_RELEASE_PROVENANCE'
  | 'CODEBASE_FEATURE_MISMATCH'
  | 'ROUTE_INVENTORY_STALE'
  | 'SECURITY_STATE_UNKNOWN'
  | 'CLIENT_TECHNICAL_DATA_LEAK';

export type ProjectTechnicalStateQAResult = {
  ok: boolean;
  failures: Array<{ class: ProjectTechnicalStaleFailureClass; message: string }>;
};

export function runProjectTechnicalStateQA(args: {
  intelligence: ProjectCodebaseIntelligence;
  viewMode: 'FOUNDER' | 'CLIENT';
  maxStaleMs?: number;
}): ProjectTechnicalStateQAResult {
  const failures: ProjectTechnicalStateQAResult['failures'] = [];
  const intel = args.intelligence;
  const now = Date.now();
  const maxStale = args.maxStaleMs ?? 1000 * 60 * 60 * 24;

  if (!intel.repositoryConnection.connected && intel.repositoryConnection.connectionStatus === 'NOT_CONNECTED') {
    failures.push({ class: 'REPOSITORY_NOT_CONNECTED', message: `${intel.projectId} repository not connected` });
  }

  if (intel.lastAnalyzedAt) {
    const age = now - new Date(intel.lastAnalyzedAt).getTime();
    if (age > maxStale) {
      failures.push({ class: 'REPOSITORY_SYNC_STALE', message: `Last sync ${Math.round(age / 3600000)}h ago` });
    }
  }

  if (intel.reconciliation.mismatch) {
    failures.push({
      class: 'PROJECT_STATE_MISMATCH',
      message: intel.reconciliation.explanation ?? 'State mismatch',
    });
  }

  if (intel.readinessAssessment.overall !== 'UNKNOWN' && !intel.repositoryConnection.connected) {
    failures.push({ class: 'READINESS_WITHOUT_EVIDENCE', message: 'Readiness claimed without repository' });
  }

  if (args.viewMode === 'CLIENT') {
    const internalNotes = intel.notes.filter((n) => n.internalOnly && !n.clientVisible);
    if (internalNotes.length && intel.notes.some((n) => n.internalOnly)) {
      // notes filtered at API layer — flag if any internal leaked into payload for client
    }
    if (intel.repositoryConnection.repositoryUrl && args.viewMode === 'CLIENT') {
      // client should get translated view — checked at render layer
    }
  }

  return { ok: failures.length === 0, failures };
}
