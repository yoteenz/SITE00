/**
 * P0.VR.DESIGN-VISUAL-COMPARE-GROK1R1 — capture active page implementation (not DESIGN chrome).
 */

import { useCallback, useEffect, useState } from 'react';

import {
  appendPageCapture,
  loadPageCaptureHistory,
  viewportToDesignViewportClass,
  type PageCaptureRecord,
} from '../../../../../shared/site00-design-workspace-production/designPageCapture.js';
import type { PageViewportId } from '../../../../../shared/site00-design-workspace-production/designProjectBinding/pageViewportAuthority.js';
import type { ImplementationSnapshotRecord } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3e/client.js';

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

export function useDesignPageCapture(projectId: string, pageId: string, screenId: string, viewport: PageViewportId) {
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latest, setLatest] = useState<PageCaptureRecord | null>(() =>
    loadPageCaptureHistory(projectId, pageId, viewport).latest,
  );

  useEffect(() => {
    setLatest(loadPageCaptureHistory(projectId, pageId, viewport).latest);
  }, [pageId, projectId, viewport]);

  const captureScreen = useCallback(async () => {
    setCapturing(true);
    setError(null);
    const viewportClass = viewportToDesignViewportClass(viewport);
    try {
      const res = await fetch('/api/site00/implementation-snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'capture_screen',
          projectId,
          screenId,
          viewportClass,
          baseUrl: typeof window !== 'undefined' ? window.location.origin : undefined,
        }),
      });
      if (!res.ok) {
        throw new Error(`CAPTURE_FAILED_${res.status}`);
      }
      const data = (await res.json()) as { snapshot?: ImplementationSnapshotRecord };
      if (!data.snapshot?.publicUrl && !data.snapshot?.capturedUrl) {
        throw new Error('CAPTURE_EMPTY');
      }
      const record = appendPageCapture(snapshotToCapture(data.snapshot, pageId, viewport));
      setLatest(record);
      return record;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'CAPTURE_FAILED';
      setError(message);
      return null;
    } finally {
      setCapturing(false);
    }
  }, [pageId, projectId, screenId, viewport]);

  return { latest, capturing, error, captureScreen };
}
