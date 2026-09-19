/**
 * P0.VR.8 — Project page mirror rows for Design → PAGES tab.
 */

import { getActiveCanonicalReference } from '../p0vr2/canonicalReferenceRegistry.js';
import { listImplementationSnapshotsForScreen } from '../p0vr3e/implementationSnapshotRegistry.js';
import type { DesignViewportClass } from '../p0vr2/types.js';
import { reconcileProjectPageRegistry, listProjectPageRecords } from './projectPageRegistry.js';
import { computePageSnapshotFreshness } from './snapshotFreshness.js';
import { getCurrentPageSnapshot } from './pageSnapshotStore.js';
import type { PageMirrorRow } from './types.js';
import { derivePageVisualVerificationStatus } from '../p0vr6r2/pageStatus.js';
import { derivePageCaptureStatus } from '../p0vr8r3/pageCaptureStatus.js';
import { resolvePageCaptureStateFromRecord } from '../p0vr8r3/pageCaptureStateResolver.js';
import { buildProjectCaptureStateSummary } from '../p0vr8r3/projectCaptureStateSummary.js';
import { listCaptureQueue } from './captureQueue.js';

function viewportCell(
  projectId: string,
  pageId: string,
  screenId: string,
  viewport: DesignViewportClass,
) {
  const snap = getCurrentPageSnapshot(projectId, pageId, viewport, screenId);
  const impl = snap
    ? null
    : (() => {
        const list = listImplementationSnapshotsForScreen(projectId, screenId, viewport);
        return list[0] ?? null;
      })();
  const url = snap?.imageUrl ?? impl?.publicUrl ?? null;
  const status = snap?.status ?? impl?.captureStatus ?? 'MISSING';
  const capturedAt = snap?.capturedAt ?? impl?.capturedAt ?? null;
  return url || status !== 'MISSING' ? { publicUrl: url, status, capturedAt } : null;
}

export function buildProjectPageMirrorRows(
  projectId: string,
  options?: { screenSetMode?: 'PRIMARY' | 'ALL_DESIGNABLE' },
): PageMirrorRow[] {
  reconcileProjectPageRegistry(projectId, options);
  const pages = listProjectPageRecords(projectId, true);
  const queueJobs = listCaptureQueue(projectId);

  return pages.map((page) => {
    const freshness = computePageSnapshotFreshness(page);
    const queueJob = queueJobs.find(
      (j) =>
        j.pageId === page.pageId &&
        (j.status === 'QUEUED' || j.status === 'CAPTURING' || j.status === 'FAILED'),
    );
    const resolvedCaptureState = resolvePageCaptureStateFromRecord(page, queueJob);
    const pageCaptureStatus = derivePageCaptureStatus(page, queueJob);
    const ref = getActiveCanonicalReference(projectId, page.screenId, 'mobile');
    const liveSnapshot = getCurrentPageSnapshot(projectId, page.pageId, 'mobile', page.screenId);
    const referenceSnapshot = ref
      ? {
          snapshotId: ref.referenceId,
          projectId,
          pageId: page.pageId,
          route: ref.route,
          viewport: 'mobile' as const,
          captureType: 'REFERENCE' as const,
          imageUrl: ref.storagePath,
          storagePath: ref.storagePath,
          width: ref.viewportWidth,
          height: ref.viewportHeight,
          devicePixelRatio: 2,
          capturedAt: ref.createdAt,
          status: 'CURRENT' as const,
          isCurrent: true,
        }
      : null;

    const visualMatchStatus = derivePageVisualVerificationStatus({
      hasReference: Boolean(ref),
      contract: null,
      session: null,
      implementationComplete: liveSnapshot?.status === 'CURRENT',
    });

    return {
      page,
      freshness,
      liveSnapshot,
      referenceSnapshot,
      mobile: viewportCell(projectId, page.pageId, page.screenId, 'mobile'),
      tablet: viewportCell(projectId, page.pageId, page.screenId, 'tablet'),
      desktop: viewportCell(projectId, page.pageId, page.screenId, 'desktop'),
      referenceUrl: ref?.storagePath ?? null,
      visualMatchStatus,
      historyCount: listImplementationSnapshotsForScreen(projectId, page.screenId).length,
      missingImplementation: page.status === 'ROUTE_MISSING',
      screenId: page.screenId,
      displayName: page.pageName,
      routeFamily: page.pageType,
      pageCaptureStatus,
      resolvedCaptureState,
    };
  });
}

export function buildProjectPageMirrorSummary(projectId: string) {
  reconcileProjectPageRegistry(projectId);
  const pages = listProjectPageRecords(projectId, true);
  const queueJobs = listCaptureQueue(projectId);
  return buildProjectCaptureStateSummary(pages, queueJobs);
}

export function pageMirrorRowToVisualIndexRow(row: PageMirrorRow) {
  return {
    screenId: row.screenId,
    displayName: row.displayName,
    routeFamily: row.routeFamily,
    route: row.page.route,
    normalizedRoute: row.page.normalizedRoute,
    mobile: row.mobile,
    tablet: row.tablet,
    desktop: row.desktop,
    missingImplementation: row.missingImplementation,
    captureStatus: row.pageCaptureStatus ?? row.page.status,
    lastCapturedAt: row.page.lastCapturedAt,
    lastUpdatedAt: row.page.updatedAt,
    isStale: row.freshness.isStale,
    staleReason: row.freshness.staleReason,
    neverCaptured: row.resolvedCaptureState === 'NEVER_CAPTURED' || row.pageCaptureStatus === 'NEVER_CAPTURED',
    pageCaptureStatus: row.pageCaptureStatus,
    resolvedCaptureState: row.resolvedCaptureState,
    referenceUrl: row.referenceUrl,
    visualMatchStatus: row.visualMatchStatus,
    historyCount: row.historyCount,
    pagePurpose: row.page.pageName,
  };
}
