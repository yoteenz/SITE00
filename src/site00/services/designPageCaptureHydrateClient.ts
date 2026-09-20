/**
 * Browser: pull Supabase-backed implementation snapshots into page capture localStorage.
 */

import {
  getPageConceptSourceCaptures,
  type PageCaptureRecord,
} from '../../../shared/site00-design-workspace-production/designPageCapture.js';
import {
  implementationSnapshotQueryParams,
  syncPageCapturesFromImplementationSnapshots,
} from '../../../shared/site00-design-workspace-production/designPageCaptureHydrate.js';
import {
  loadPageAuthorityWorkflow,
  savePageAuthorityWorkflow,
  syncAuthorityRefsFromPageCaptures,
} from '../../../shared/site00-design-workspace-production/designPageAuthorityWorkflow.js';
import type { ImplementationSnapshotRecord } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vr3e/client.js';
import { captureApiFetch } from './captureApiFetch.js';

const IMPLEMENTATION_SNAPSHOTS_PATH = '/api/site00/implementation-snapshots';

async function fetchLatestSnapshot(
  projectId: string,
  screenId: string,
  viewport: 'MOBILE' | 'DESKTOP',
): Promise<ImplementationSnapshotRecord | null> {
  const { viewportClass } = implementationSnapshotQueryParams(projectId, screenId, viewport);
  const qs = new URLSearchParams({ projectId, screenId, viewportClass });
  const result = await captureApiFetch<{ snapshot: ImplementationSnapshotRecord | null }>(
    `${IMPLEMENTATION_SNAPSHOTS_PATH}?${qs.toString()}`,
  );
  if (!result.ok || !result.data?.snapshot) return null;
  return result.data.snapshot;
}

export async function fetchLatestImplementationSnapshotsForScreen(
  projectId: string,
  screenId: string,
): Promise<{ mobile: ImplementationSnapshotRecord | null; desktop: ImplementationSnapshotRecord | null }> {
  const [mobile, desktop] = await Promise.all([
    fetchLatestSnapshot(projectId, screenId, 'MOBILE'),
    fetchLatestSnapshot(projectId, screenId, 'DESKTOP'),
  ]);
  return { mobile, desktop };
}

export type EnsurePageConceptCapturesResult = {
  mobile: PageCaptureRecord | null;
  desktop: PageCaptureRecord | null;
  hydratedFromApi: boolean;
};

/** Reconcile localStorage source captures with API registry before GENERATE. */
export async function ensurePageConceptSourceCaptures(
  projectId: string,
  pageId: string,
  screenId: string,
): Promise<EnsurePageConceptCapturesResult> {
  let hydratedFromApi = false;
  try {
    const { mobile, desktop } = await fetchLatestImplementationSnapshotsForScreen(projectId, screenId);
    const snapshots = [mobile, desktop].filter(Boolean) as ImplementationSnapshotRecord[];
    if (snapshots.length > 0) {
      const { merged } = syncPageCapturesFromImplementationSnapshots(projectId, pageId, screenId, snapshots);
      hydratedFromApi = merged > 0 || snapshots.length > 0;

      const wf = loadPageAuthorityWorkflow(projectId, pageId);
      const syncedWf = syncAuthorityRefsFromPageCaptures(projectId, pageId, wf);
      if (syncedWf !== wf) {
        savePageAuthorityWorkflow(projectId, pageId, syncedWf);
        window.dispatchEvent(
          new CustomEvent('site00:design-page-authority-hydrated', { detail: { projectId, pageId } }),
        );
      }
    }
  } catch {
    /* offline */
  }

  const sources = getPageConceptSourceCaptures(projectId, pageId);
  return { ...sources, hydratedFromApi };
}
