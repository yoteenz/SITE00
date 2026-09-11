/**
 * P0.VR.CAPTURE.1R2 — Client-side capture now helpers (pageId, errors, telemetry).
 */

import {
  buildPageId,
  migrateHistoricalRootCapturePageId,
} from '../../../../shared/site00-studio-world-production/pageFamilyWorkspace/pageFamilyRootTarget.js';
import type { CaptureCompletionReceipt, CaptureErrorCode } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/captureReceipts.js';
import {
  isSite00WebsiteProject,
  SITE00_WEBSITE_ROOT_ROUTE,
  SITE00_WEBSITE_ROOT_SCREEN_ID,
} from '../../../../shared/site00-studio-world-production/pageFamilyWorkspace/pageFamilyRootTarget.js';
import type { PageVisualIndexRow } from './DesignPagesVisualIndex';

const OVERVIEW_SCREEN_ALIASES = ['overview', 'desktop-overview', 'mobile-overview'] as const;
const SITE00_ROOT_SCREEN_ALIASES = [
  SITE00_WEBSITE_ROOT_SCREEN_ID,
  ...OVERVIEW_SCREEN_ALIASES,
] as const;

function normalizeCaptureRoute(route: string | undefined | null): string {
  return (route ?? '').split('?')[0]?.replace(/\/$/, '').toLowerCase() ?? '';
}

function isSite00RootCaptureTarget(screenId: string, projectId?: string): boolean {
  if (!projectId || !isSite00WebsiteProject(projectId)) return false;
  const normalized = screenId.toLowerCase();
  return SITE00_ROOT_SCREEN_ALIASES.includes(normalized as (typeof SITE00_ROOT_SCREEN_ALIASES)[number]);
}

function resolveSite00HomepageRow(rows: PageVisualIndexRow[]): PageVisualIndexRow | null {
  const byScreen = rows.find((r) => r.screenId === SITE00_WEBSITE_ROOT_SCREEN_ID);
  if (byScreen) return byScreen;
  return (
    rows.find((r) => normalizeCaptureRoute(r.normalizedRoute ?? r.route) === SITE00_WEBSITE_ROOT_ROUTE) ?? null
  );
}

export function resolveCaptureIndexRow(
  rows: PageVisualIndexRow[],
  screenId: string,
  projectId?: string,
): PageVisualIndexRow | null {
  const direct = rows.find((r) => r.screenId === screenId);
  if (direct) return direct;

  const normalizedTarget = screenId.toLowerCase();

  if (isSite00RootCaptureTarget(normalizedTarget, projectId)) {
    const homepage = resolveSite00HomepageRow(rows);
    if (homepage) return homepage;
  }

  if (OVERVIEW_SCREEN_ALIASES.includes(normalizedTarget as (typeof OVERVIEW_SCREEN_ALIASES)[number])) {
    for (const alias of OVERVIEW_SCREEN_ALIASES) {
      const match = rows.find((r) => r.screenId === alias);
      if (match) return match;
    }
    if (projectId) {
      const rootPrefix = `/projects/${projectId}`.toLowerCase();
      const overviewRoute = `${rootPrefix}/overview`;
      const rootMatch = rows.find((r) => {
        const route = normalizeCaptureRoute(r.normalizedRoute ?? r.route);
        return route === rootPrefix || route === overviewRoute || route.endsWith('/overview');
      });
      if (rootMatch) return rootMatch;
    }
  }

  return null;
}

export function resolveCapturePageId(projectId: string, row: PageVisualIndexRow): string {
  const route = row.normalizedRoute ?? row.route ?? '/';
  const raw = buildPageId(projectId, route);
  return migrateHistoricalRootCapturePageId(projectId, raw);
}

export function captureFailureMessage(errorCode: CaptureErrorCode | null | undefined, fallback?: string): string {
  switch (errorCode) {
    case 'PAGE_OPEN_FAILED':
      return 'CAPTURE FAILED — THE PAGE COULD NOT BE OPENED.';
    case 'SCREENSHOT_FAILED':
    case 'RENDER_FAILED':
      return 'CAPTURE FAILED — THE PAGE OPENED, BUT THE SCREENSHOT COULD NOT BE CREATED.';
    case 'STORAGE_FAILED':
      return 'CAPTURE FAILED — WE TOOK THE SCREENSHOT, BUT COULD NOT SAVE IT.';
    case 'PERSISTENCE_FAILED':
      return 'CAPTURE FAILED — THE SCREENSHOT WAS CREATED, BUT THE CAPTURE RECORD COULD NOT BE SAVED.';
    case 'BINDING_FAILED':
      return 'CAPTURE SAVED — PREVIEW COULD NOT REFRESH.';
    case 'TIMEOUT':
      return 'CAPTURE TOOK TOO LONG.';
    default:
      if (fallback?.includes('CAPTURE_SCREENSHOT_TOO_SMALL') || fallback?.includes('PAGE_NOT_FOUND')) {
        return 'CAPTURE FAILED — PAGE DID NOT RENDER (404 OR BLANK). RECAPTURE AFTER HARD REFRESH.';
      }
      if (fallback?.includes('CAPTURE_ANCHOR_MISSING')) {
        return 'CAPTURE FAILED — PAGE OPENED BUT NDX HEADER DID NOT RENDER. TRY AGAIN IN A MOMENT.';
      }
      return fallback ?? 'CAPTURE FAILED';
  }
}

export function logCaptureTelemetry(event: string, payload: Record<string, unknown>): void {
  if (typeof console === 'undefined' || !console.info) return;
  console.info(`[capture-now] ${event}`, payload);
}

export function completionBindingFailed(completion: CaptureCompletionReceipt): boolean {
  return (
    completion.status === 'CAPTURE_READY' &&
    completion.persistenceStatus === 'SUCCESS' &&
    completion.storageStatus === 'SUCCESS' &&
    completion.bindingStatus === 'FAILED'
  );
}
