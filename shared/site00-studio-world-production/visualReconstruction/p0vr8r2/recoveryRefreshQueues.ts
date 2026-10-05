/**
 * P0.VR.8R2 — Capture + completion refresh queues after recovery.
 */

import { enqueuePageCapture, listCaptureQueue } from '../p0vr8/captureQueue.js';
import { screenToPageRecord } from '../p0vr8/routeDiscoveryService.js';
import { resolveCaptureViewportsForPage } from '../p0vr8/capturePolicy.js';
import type { DesignScreenDefinition } from '../p0vr2/types.js';
import type { RecoveredRouteRecord } from './types.js';

export function queueCaptureRefreshForRecoveredRoutes(
  projectId: string,
  routes: RecoveredRouteRecord[],
  screens: DesignScreenDefinition[],
): { capturesQueued: number; capturesMarkedStale: number } {
  let capturesQueued = 0;
  let capturesMarkedStale = 0;

  for (const route of routes) {
    if (route.routeCurrentness === 'ROUTE_REMOVED') continue;
    if (route.captureCurrentness !== 'CAPTURE_STALE' && route.captureCurrentness !== 'CAPTURE_MISSING') continue;

    capturesMarkedStale++;
    const screen = screens.find((s) => s.screenId === route.screenId);
    if (!screen) continue;

    const page = screenToPageRecord(screen, projectId, 'ROUTE_DISCOVERY');
    const viewports = resolveCaptureViewportsForPage(page);

    for (const viewport of viewports) {
      enqueuePageCapture({
        projectId,
        pageId: page.pageId,
        route: route.path,
        viewport,
        reason: 'ROUTE_RECOVERY',
        deploymentId: null,
      });
      capturesQueued++;
    }
  }

  return { capturesQueued, capturesMarkedStale };
}

export function queueCompletionRefreshForRecoveredRoutes(routes: RecoveredRouteRecord[]): number {
  return routes.filter(
    (r) =>
      r.routeCurrentness !== 'ROUTE_REMOVED' &&
      (r.completionCurrentness === 'COMPLETION_STALE' || r.completionCurrentness === 'COMPLETION_CURRENT'),
  ).length;
}

export function listRecoveryCaptureQueue(projectId: string) {
  return listCaptureQueue(projectId).filter((j) => j.reason === 'ROUTE_RECOVERY');
}
