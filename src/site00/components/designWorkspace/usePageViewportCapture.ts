/**
 * P0.VR.CAPTURE.1R2 — Reactive page+viewport capture binding for live preview.
 */

import { useEffect, useSyncExternalStore } from 'react';
import type { DesignViewportClass } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2/types.js';
import {
  hydratePageViewportCapturesFromStorage,
  resolveCurrentPageViewportCapture,
  subscribePageViewportCaptures,
  type PageViewportCaptureRecord,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/index.js';

export function usePageViewportCapture(
  projectId: string,
  pageId: string,
  viewport: DesignViewportClass,
): PageViewportCaptureRecord | null {
  useEffect(() => {
    if (projectId) hydratePageViewportCapturesFromStorage(projectId);
  }, [projectId]);

  return useSyncExternalStore(
    subscribePageViewportCaptures,
    () => (pageId ? resolveCurrentPageViewportCapture(projectId, pageId, viewport) : null),
    () => (pageId ? resolveCurrentPageViewportCapture(projectId, pageId, viewport) : null),
  );
}
