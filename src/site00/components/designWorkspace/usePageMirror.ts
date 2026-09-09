/**
 * P0.VR.8 — Client hook for live page mirror API.
 */

import { useCallback, useEffect, useState } from 'react';
import type { PageMirrorInspectorState } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8/client.js';
import type { PageVisualIndexRow } from './DesignPagesVisualIndex';

type MirrorResponse = {
  projectId: string;
  pages: Array<{
    screenId: string;
    displayName: string;
    routeFamily: string;
    page: { route: string; normalizedRoute: string; status: string; lastCapturedAt: string | null; updatedAt: string };
    mobile: PageVisualIndexRow['mobile'];
    tablet: PageVisualIndexRow['tablet'];
    desktop: PageVisualIndexRow['desktop'];
    referenceUrl: string | null;
    freshness: { isStale: boolean; staleReason: string | null };
    historyCount: number;
    missingImplementation: boolean;
    visualMatchStatus: string;
  }>;
  inspector: PageMirrorInspectorState;
};

export function usePageMirror(projectId: string) {
  const [rows, setRows] = useState<PageVisualIndexRow[]>([]);
  const [inspector, setInspector] = useState<PageMirrorInspectorState | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/site00/page-mirror?projectId=${encodeURIComponent(projectId)}`);
      if (!res.ok) return;
      const data = (await res.json()) as MirrorResponse;
      setInspector(data.inspector);
      setRows(
        data.pages.map((p) => ({
          screenId: p.screenId,
          displayName: p.displayName,
          routeFamily: p.routeFamily,
          route: p.page.route,
          normalizedRoute: p.page.normalizedRoute,
          mobile: p.mobile,
          tablet: p.tablet,
          desktop: p.desktop,
          missingImplementation: p.missingImplementation,
          captureStatus: p.page.status,
          lastCapturedAt: p.page.lastCapturedAt,
          lastUpdatedAt: p.page.updatedAt,
          isStale: p.freshness.isStale,
          staleReason: p.freshness.staleReason,
          referenceUrl: p.referenceUrl,
          visualMatchStatus: p.visualMatchStatus,
          historyCount: p.historyCount,
          pagePurpose: p.displayName,
        })),
      );
    } catch {
      /* dev offline — fallback handled by workspace */
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const refreshPage = useCallback(
    async (screenId: string) => {
      const row = rows.find((r) => r.screenId === screenId);
      const pageId = row?.normalizedRoute
        ? `${projectId}:${row.normalizedRoute}`
        : `${projectId}:${(row?.route ?? screenId).replace(/^\//, '').toLowerCase()}`;
      await fetch('/api/site00/page-mirror', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'refresh_page',
          projectId,
          pageId,
          screenId,
          route: row?.route,
          executeCapture: true,
          viewportClass: 'mobile',
          baseUrl: window.location.origin,
        }),
      });
      await refresh();
    },
    [projectId, refresh, rows],
  );

  const refreshProject = useCallback(async () => {
    await fetch('/api/site00/page-mirror', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'refresh_project', projectId }),
    });
    await refresh();
  }, [projectId, refresh]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { rows, inspector, loading, refresh, refreshPage, refreshProject };
}
