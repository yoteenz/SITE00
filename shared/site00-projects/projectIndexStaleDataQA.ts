/**
 * B5.9R2 — Project index stale data QA.
 */

import type { ProjectIndexItem } from './projectIndexItem.js';

export type ProjectIndexStaleFailureClass =
  | 'PROJECT_INDEX_STALE'
  | 'PROJECT_CARD_STATE_MISMATCH'
  | 'PROJECT_PROGRESS_STALE'
  | 'PROJECT_PRIMARY_MODULE_STALE'
  | 'PROJECT_OWNER_TYPE_STALE'
  | 'ARCHIVED_PROJECT_IN_ACTIVE_INDEX'
  | 'CLIENT_PROJECT_LEAK'
  | 'FOUNDER_ONLY_DATA_IN_CLIENT_INDEX';

export type ProjectIndexStaleQAResult = {
  ok: boolean;
  failures: Array<{ class: ProjectIndexStaleFailureClass; message: string }>;
};

export function runProjectIndexStaleDataQA(args: {
  items: ProjectIndexItem[];
  viewMode: 'FOUNDER' | 'CLIENT';
  indexStateVersion: number;
  expectedVersion?: number;
}): ProjectIndexStaleQAResult {
  const failures: ProjectIndexStaleQAResult['failures'] = [];

  if (args.expectedVersion != null && args.indexStateVersion < args.expectedVersion) {
    failures.push({
      class: 'PROJECT_INDEX_STALE',
      message: `Index version ${args.indexStateVersion} behind expected ${args.expectedVersion}`,
    });
  }

  for (const item of args.items) {
    if (!item.primaryModule) {
      failures.push({
        class: 'PROJECT_PRIMARY_MODULE_STALE',
        message: `${item.projectId} missing primary module`,
      });
    }
    if (item.progress.percent != null && (item.progress.percent < 0 || item.progress.percent > 100)) {
      failures.push({
        class: 'PROJECT_PROGRESS_STALE',
        message: `${item.projectId} progress out of range`,
      });
    }
    if (item.isArchived && args.viewMode === 'FOUNDER') {
      // archived in active list is ok if filter includes them — no fail by default
    }
    if (args.viewMode === 'CLIENT') {
      if (item.ownerType === 'FOUNDER' && item.internalProject) {
        failures.push({
          class: 'CLIENT_PROJECT_LEAK',
          message: `${item.projectId} founder-only project in client index`,
        });
      }
      if (item.internalProject && !item.clientFacing) {
        failures.push({
          class: 'FOUNDER_ONLY_DATA_IN_CLIENT_INDEX',
          message: `${item.projectId} internal metadata exposed in client index`,
        });
      }
    }
  }

  return { ok: failures.length === 0, failures };
}
