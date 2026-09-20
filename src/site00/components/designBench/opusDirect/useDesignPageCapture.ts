/**
 * P0.VR.DESIGN-VISUAL-COMPARE-GROK1R1 — capture active page implementation (not DESIGN chrome).
 */

import { useCallback, useEffect, useState } from 'react';

import {
  appendPageCapture,
  DESIGN_PAGE_CAPTURE_UPDATED_EVENT,
  isPageCaptureDisplayableArtifact,
  loadPageCaptureHistory,
  viewportToDesignViewportClass,
  type PageCaptureRecord,
} from '../../../../../shared/site00-design-workspace-production/designPageCapture.js';
import { designPageCaptureEventMatches } from '../../../../../shared/site00-design-workspace-production/designPageIdentity.js';
import type { PageViewportId } from '../../../../../shared/site00-design-workspace-production/designProjectBinding/pageViewportAuthority.js';
import type { ImplementationSnapshotRecord } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3e/client.js';
import { formatCaptureTransportError } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/formatCaptureTransportError.js';
import { resolveFounderCaptureBaseUrl } from '../../../../utils/site00CaptureBase.js';
import {
  captureApiFetch,
  CAPTURE_CURRENT_PAGE_TIMEOUT_MS,
} from '../../../services/captureApiFetch.js';

const IMPLEMENTATION_SNAPSHOTS_PATH = '/api/site00/implementation-snapshots';

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
    artifactPath: snap.publicUrl?.trim() || '',
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
      if (!designPageCaptureEventMatches(projectId, pageId, detail) || detail?.viewport !== viewport) return;
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
      const result = await captureApiFetch<{
        snapshot?: ImplementationSnapshotRecord | null;
        error?: string;
      }>(IMPLEMENTATION_SNAPSHOTS_PATH, {
        method: 'POST',
        timeoutMs: CAPTURE_CURRENT_PAGE_TIMEOUT_MS,
        body: {
          action: 'capture_screen',
          projectId,
          screenId,
          viewportClass,
          route: captureRoute,
          baseUrl: resolveFounderCaptureBaseUrl(),
        },
      });
      if (!result.ok) {
        const apiMessage = result.data?.error?.trim();
        throw new Error(
          apiMessage ||
            (result.errorCode ? formatCaptureTransportError(result.errorCode) : `CAPTURE_FAILED_${result.status}`),
        );
      }
      const snapshot = result.data?.snapshot ?? null;
      const publicUrl = snapshot?.publicUrl?.trim() ?? '';
      if (!publicUrl || !isPageCaptureDisplayableArtifact(publicUrl)) {
        throw new Error(formatCaptureFailure(snapshot ?? undefined));
      }
      const record = appendPageCapture(snapshotToCapture(snapshot!, pageId, viewport));
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
