/**
 * On DESIGN workspace mount, pull latest QA-passed implementation snapshots from the API
 * (Supabase-backed registry) into page-scoped localStorage captures.
 */

import { useEffect, useRef } from 'react';

import {
  implementationSnapshotQueryParams,
  syncPageCapturesFromImplementationSnapshots,
} from '../../../../../shared/site00-design-workspace-production/designPageCaptureHydrate.js';
import {
  loadPageAuthorityWorkflow,
  savePageAuthorityWorkflow,
  syncAuthorityRefsFromPageCaptures,
} from '../../../../../shared/site00-design-workspace-production/designPageAuthorityWorkflow.js';
import type { ImplementationSnapshotRecord } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3e/client.js';
import { captureApiFetch } from '../../../services/captureApiFetch.js';

const IMPLEMENTATION_SNAPSHOTS_PATH = '/api/site00/implementation-snapshots';

async function fetchLatestSnapshot(
  projectId: string,
  screenId: string,
  viewport: 'MOBILE' | 'DESKTOP',
): Promise<ImplementationSnapshotRecord | null> {
  const { viewportClass } = implementationSnapshotQueryParams(projectId, screenId, viewport);
  const qs = new URLSearchParams({
    projectId,
    screenId,
    viewportClass,
  });
  const result = await captureApiFetch<{ snapshot: ImplementationSnapshotRecord | null }>(
    `${IMPLEMENTATION_SNAPSHOTS_PATH}?${qs.toString()}`,
  );
  if (!result.ok || !result.data?.snapshot) return null;
  return result.data.snapshot;
}

export function useHydrateDesignPageCaptures(projectId: string, pageId: string, screenId: string) {
  const ranForKey = useRef<string | null>(null);

  useEffect(() => {
    const key = `${projectId}:${pageId}:${screenId}`;
    if (ranForKey.current === key) return;
    ranForKey.current = key;

    let cancelled = false;

    void (async () => {
      try {
        const [mobileSnap, desktopSnap] = await Promise.all([
          fetchLatestSnapshot(projectId, screenId, 'MOBILE'),
          fetchLatestSnapshot(projectId, screenId, 'DESKTOP'),
        ]);
        if (cancelled) return;

        const snapshots = [mobileSnap, desktopSnap].filter(Boolean) as ImplementationSnapshotRecord[];
        if (snapshots.length > 0) {
          syncPageCapturesFromImplementationSnapshots(projectId, pageId, screenId, snapshots);
        }

        const wf = loadPageAuthorityWorkflow(projectId, pageId);
        const syncedWf = syncAuthorityRefsFromPageCaptures(projectId, pageId, wf);
        if (syncedWf !== wf) {
          savePageAuthorityWorkflow(projectId, pageId, syncedWf);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('site00:design-page-authority-hydrated', {
                detail: { projectId, pageId },
              }),
            );
          }
        }
      } catch {
        /* offline / API unavailable — local captures still work */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pageId, projectId, screenId]);
}
