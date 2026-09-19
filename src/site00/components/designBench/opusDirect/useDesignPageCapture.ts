/**
 * P0.VR.DESIGN-VISUAL-COMPARE-GROK1R1 — capture active page implementation (not DESIGN chrome).
 */

import { useCallback, useEffect, useState } from 'react';

import {
  appendPageCapture,
  DESIGN_PAGE_CAPTURE_UPDATED_EVENT,
  loadPageCaptureHistory,
  viewportToDesignViewportClass,
  type PageCaptureRecord,
} from '../../../../../shared/site00-design-workspace-production/designPageCapture.js';
import type { PageViewportId } from '../../../../../shared/site00-design-workspace-production/designProjectBinding/pageViewportAuthority.js';
import type { ImplementationSnapshotRecord } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3e/client.js';
import { resolveFounderCaptureBaseUrl } from '../../../../utils/site00CaptureBase.js';

function snapshotToCapture(
  snap: ImplementationSnapshotRecord,
  pageId: string,
  viewport: PageViewportId,
): PageCaptureRecord {
  return {
    captureId: snap.snapshotId,
    projectId: snap.projectId,
    pageId,
    screenId: snap.designScreenId,
    viewport,
    route: snap.resolvedRoute || snap.route,
    timestamp: snap.capturedAt || new Date().toISOString(),
    buildVersion: snap.sourceBuildId,
    artifactPath: snap.publicUrl || snap.capturedUrl,
    createdBy: 'founder',
    source: 'IMPLEMENTATION_SNAPSHOT_API',
  };
}

function formatCaptureFailure(snapshot: ImplementationSnapshotRecord | null | undefined): string {
  if (!snapshot) return 'CAPTURE_TARGET_UNKNOWN — design screen not registered for this page';
  if (snapshot.error?.trim()) return snapshot.error.trim().slice(0, 120);
  if (snapshot.captureStatus) return `CAPTURE_${snapshot.captureStatus}`;
  return 'CAPTURE_EMPTY';
}

export function useDesignPageCapture(
  projectId: string,
  pageId: string,
  screenId: string,
  viewport: PageViewportId,
  route?: string | null,
) {
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latest, setLatest] = useState<PageCaptureRecord | null>(() =>
    loadPageCaptureHistory(projectId, pageId, viewport).latest,
  );

  const refreshLatest = useCallback(() => {
    setLatest(loadPageCaptureHistory(projectId, pageId, viewport).latest);
  }, [pageId, projectId, viewport]);

  useEffect(() => {
    refreshLatest();
  }, [refreshLatest]);

  useEffect(() => {
    const onUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ projectId?: string; pageId?: string; viewport?: PageViewportId }>).detail;
      if (detail?.projectId !== projectId || detail?.pageId !== pageId || detail?.viewport !== viewport) return;
      refreshLatest();
    };
    window.addEventListener(DESIGN_PAGE_CAPTURE_UPDATED_EVENT, onUpdated);
    return () => window.removeEventListener(DESIGN_PAGE_CAPTURE_UPDATED_EVENT, onUpdated);
  }, [pageId, projectId, refreshLatest, viewport]);

  const captureScreen = useCallback(async () => {
    setCapturing(true);
    setError(null);
    const viewportClass = viewportToDesignViewportClass(viewport);
    const captureRoute = route?.trim() || undefined;
    try {
      const res = await fetch('/api/site00/implementation-snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'capture_screen',
          projectId,
          screenId,
          viewportClass,
          route: captureRoute,
          baseUrl: resolveFounderCaptureBaseUrl(),
        }),
      });
      const data = (await res.json()) as { snapshot?: ImplementationSnapshotRecord | null; error?: string };
      if (!res.ok) {
        throw new Error(data.error?.trim() || `CAPTURE_FAILED_${res.status}`);
      }
      const snapshot = data.snapshot ?? null;
      if (!snapshot?.publicUrl && !snapshot?.capturedUrl) {
        throw new Error(formatCaptureFailure(snapshot));
      }
      const record = appendPageCapture(snapshotToCapture(snapshot, pageId, viewport));
      setLatest(record);
      return record;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'CAPTURE_FAILED';
      setError(message);
      return null;
    } finally {
      setCapturing(false);
    }
  }, [pageId, projectId, route, screenId, viewport]);

  return { latest, capturing, error, captureScreen };
}
