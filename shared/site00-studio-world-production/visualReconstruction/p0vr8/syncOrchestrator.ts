/**
 * P0.VR.8 — ProjectPageSyncOrchestrator — event-driven page mirror sync.
 */

import { detectAffectedPageIds } from './changeDetector.js';
import { enqueuePageCapture, coalesceDuplicateCaptures } from './captureQueue.js';
import {
  reconcileProjectPageRegistry,
  markPagesStaleForDeploy,
  listProjectPageRecords,
  getProjectPageRecord,
  upsertProjectPageRecord,
} from './projectPageRegistry.js';
import type { PageSyncEvent, PageSyncEventType } from './types.js';
import { resolveCaptureViewportsForPage } from './capturePolicy.js';

const syncEvents: PageSyncEvent[] = [];

export function emitPageSyncEvent(event: Omit<PageSyncEvent, 'eventId' | 'occurredAt'>): PageSyncEvent {
  const record: PageSyncEvent = {
    ...event,
    eventId: `pse-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    occurredAt: new Date().toISOString(),
  };
  syncEvents.unshift(record);
  if (syncEvents.length > 500) syncEvents.pop();
  return record;
}

export function handlePageSyncEvent(
  event: Omit<PageSyncEvent, 'eventId' | 'occurredAt'>,
  options?: { awaitDeploy?: boolean; screenSetMode?: 'PRIMARY' | 'ALL_DESIGNABLE' },
): {
  event: PageSyncEvent;
  reconciliation: ReturnType<typeof reconcileProjectPageRegistry>;
  enqueued: number;
  affectedPageIds: string[];
} {
  const recorded = emitPageSyncEvent(event);
  const reconciliation = reconcileProjectPageRegistry(event.projectId, {
    screenSetMode: options?.screenSetMode,
  });

  let affectedPageIds: string[] = [];
  const pages = listProjectPageRecords(event.projectId, false);

  switch (event.type) {
    case 'ROUTE_ADDED':
    case 'PAGE_CREATED':
      affectedPageIds = reconciliation.added.map((p) => p.pageId);
      break;
    case 'ROUTE_REMOVED':
      affectedPageIds = reconciliation.removed.map((p) => p.pageId);
      break;
    case 'ROUTE_CHANGED':
    case 'PAGE_UPDATED':
    case 'VISUAL_CHANGE_DETECTED':
      affectedPageIds = event.pageId ? [event.pageId] : reconciliation.changed.map((p) => p.pageId);
      break;
    case 'DEPLOYMENT_COMPLETE':
    case 'BUILD_COMPLETE':
      if (event.changedFiles?.length) {
        affectedPageIds = detectAffectedPageIds({
          projectId: event.projectId,
          changedFiles: event.changedFiles,
          changedRoutes: event.route ? [event.route] : undefined,
          pages,
        });
      } else if (event.pageId) {
        affectedPageIds = [event.pageId];
      } else {
        affectedPageIds = [];
      }
      if (event.deploymentId && options?.awaitDeploy !== false) {
        markPagesStaleForDeploy(event.projectId, event.deploymentId, affectedPageIds.length ? affectedPageIds : undefined);
      }
      break;
    case 'MANUAL_REFRESH':
      affectedPageIds = event.pageId ? [event.pageId] : pages.filter((p) => p.isActive).map((p) => p.pageId);
      break;
    case 'REFERENCE_BOUND':
    case 'SCREEN_AUTHORITY_UPDATED':
      affectedPageIds = event.pageId ? [event.pageId] : [];
      break;
    default:
      affectedPageIds = event.pageId ? [event.pageId] : [];
  }

  let enqueued = 0;

  if (event.type === 'BUILD_COMPLETE') {
    if (event.deploymentId) {
      markPagesStaleForDeploy(event.projectId, event.deploymentId, affectedPageIds.length ? affectedPageIds : undefined);
    }
    return { event: recorded, reconciliation, enqueued: 0, affectedPageIds };
  }

  if (event.type === 'DEPLOYMENT_COMPLETE' && options?.awaitDeploy === false) {
    return { event: recorded, reconciliation, enqueued: 0, affectedPageIds };
  }

  const shouldCapture = [
    'DEPLOYMENT_COMPLETE',
    'VISUAL_CHANGE_DETECTED',
    'MANUAL_REFRESH',
    'PAGE_UPDATED',
    'ROUTE_ADDED',
    'PAGE_CREATED',
  ].includes(event.type);

  if (shouldCapture) {
    for (const pageId of affectedPageIds) {
      const page = getProjectPageRecord(event.projectId, pageId);
      if (!page?.isActive) continue;
      const viewports = resolveCaptureViewportsForPage(page);
      for (const viewport of viewports) {
        enqueuePageCapture({
          projectId: event.projectId,
          pageId: page.pageId,
          route: page.representativeRoute ?? page.route,
          viewport,
          reason: event.type,
          deploymentId: event.deploymentId ?? null,
        });
        enqueued++;
      }
      upsertProjectPageRecord({ ...page, status: 'CAPTURE_PENDING' });
    }
    coalesceDuplicateCaptures(event.projectId);
  }

  return { event: recorded, reconciliation, enqueued, affectedPageIds };
}

export function listPageSyncEvents(projectId?: string, limit = 50): PageSyncEvent[] {
  return syncEvents.filter((e) => !projectId || e.projectId === projectId).slice(0, limit);
}

export function mapSyncEventToHistoryLabel(type: PageSyncEventType): string {
  const labels: Record<PageSyncEventType, string> = {
    PAGE_CREATED: 'PAGE_DISCOVERED',
    PAGE_UPDATED: 'PAGE_ROUTE_CHANGED',
    ROUTE_ADDED: 'PAGE_DISCOVERED',
    ROUTE_REMOVED: 'PAGE_REMOVED',
    ROUTE_CHANGED: 'PAGE_ROUTE_CHANGED',
    DEPLOYMENT_COMPLETE: 'PAGE_CAPTURE_COMPLETE',
    BUILD_COMPLETE: 'PAGE_CAPTURE_STARTED',
    VISUAL_CHANGE_DETECTED: 'PAGE_MARKED_STALE',
    MANUAL_REFRESH: 'PAGE_CAPTURE_STARTED',
    REFERENCE_BOUND: 'PAGE_REFERENCE_UPDATED',
    SCREEN_AUTHORITY_UPDATED: 'PAGE_REFERENCE_UPDATED',
  };
  return labels[type] ?? type;
}

export function clearPageSyncEventsForTest(): void {
  syncEvents.length = 0;
}
