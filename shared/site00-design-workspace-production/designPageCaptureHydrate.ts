/**
 * Restore page-scoped implementation captures from Railway/Supabase registry into localStorage
 * so page concept GENERATE works after refresh and across tunnel vs production origins.
 */

import type { PageViewportId } from './designProjectBinding/pageViewportAuthority.js';
import {
  appendPageCapture,
  isPageCaptureDisplayableArtifact,
  loadPageCaptureHistory,
  viewportToDesignViewportClass,
  type PageCaptureRecord,
} from './designPageCapture.js';
import type { ImplementationSnapshotRecord } from '../site00-studio-world-production/visualReconstruction/p0vr3e/types.js';
import type { DesignViewportClass } from '../site00-studio-world-production/visualReconstruction/p0vr2/types.js';

function snapshotToCaptureRecord(
  snapshot: ImplementationSnapshotRecord,
  pageId: string,
  viewport: PageViewportId,
): PageCaptureRecord | null {
  const publicUrl = snapshot.publicUrl?.trim() ?? '';
  if (!snapshot.qaPassed || !publicUrl || !isPageCaptureDisplayableArtifact(publicUrl)) return null;
  return {
    captureId: snapshot.snapshotId,
    projectId: snapshot.projectId,
    pageId,
    screenId: snapshot.designScreenId,
    viewport,
    route: snapshot.resolvedRoute || snapshot.route,
    timestamp: snapshot.capturedAt || new Date().toISOString(),
    buildVersion: snapshot.sourceBuildId,
    artifactPath: publicUrl,
    createdBy: 'hydrate',
    source: 'IMPLEMENTATION_SNAPSHOT_API',
  };
}

function viewportFromClass(viewportClass: DesignViewportClass): PageViewportId {
  if (viewportClass === 'desktop') return 'DESKTOP';
  if (viewportClass === 'tablet') return 'TABLET';
  return 'MOBILE';
}

/** Prefer newer QA-passed snapshot when local bucket is empty or older. */
export function mergeImplementationSnapshotIntoPageCapture(
  snapshot: ImplementationSnapshotRecord,
  pageId: string,
): PageCaptureRecord | null {
  const viewport = viewportFromClass(snapshot.viewportClass);
  const incoming = snapshotToCaptureRecord(snapshot, pageId, viewport);
  if (!incoming) return null;

  const existing = loadPageCaptureHistory(incoming.projectId, pageId, viewport).latest;
  if (existing?.captureId === incoming.captureId && existing.artifactPath === incoming.artifactPath) {
    return existing;
  }
  if (
    existing?.artifactPath &&
    isPageCaptureDisplayableArtifact(existing.artifactPath) &&
    existing.timestamp >= incoming.timestamp
  ) {
    return existing;
  }
  return appendPageCapture(incoming);
}

export function syncPageCapturesFromImplementationSnapshots(
  projectId: string,
  pageId: string,
  screenId: string,
  snapshots: readonly ImplementationSnapshotRecord[],
): { merged: number; viewports: PageViewportId[] } {
  const forScreen = snapshots.filter(
    (s) =>
      s.projectId === projectId &&
      s.designScreenId === screenId &&
      (s.viewportClass === 'mobile' || s.viewportClass === 'desktop'),
  );
  const viewports: PageViewportId[] = [];
  let merged = 0;
  for (const snap of forScreen) {
    const before = loadPageCaptureHistory(projectId, pageId, viewportFromClass(snap.viewportClass)).latest
      ?.captureId;
    const record = mergeImplementationSnapshotIntoPageCapture(snap, pageId);
    if (record && record.captureId !== before) {
      merged += 1;
      viewports.push(record.viewport);
    }
  }
  return { merged, viewports };
}

export function implementationSnapshotQueryParams(
  projectId: string,
  screenId: string,
  viewport: PageViewportId,
): { projectId: string; screenId: string; viewportClass: DesignViewportClass } {
  return {
    projectId,
    screenId,
    viewportClass: viewportToDesignViewportClass(viewport),
  };
}
