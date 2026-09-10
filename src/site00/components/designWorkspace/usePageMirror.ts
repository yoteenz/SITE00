/**
 * P0.VR.8 / P0.VR.8R3 — Client hook for live page mirror + capture run progress.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PageMirrorInspectorState } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8/client.js';
import type { ProjectCaptureRun } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/browserClient.js';
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
    freshness: { isStale: boolean; staleReason: string | null; neverCaptured?: boolean };
    pageCaptureStatus?: string;
    historyCount: number;
    missingImplementation: boolean;
    visualMatchStatus: string;
  }>;
  inspector: PageMirrorInspectorState;
  captureRun?: ProjectCaptureRun | null;
};

export type ProjectCaptureRefreshState = {
  run: ProjectCaptureRun | null;
  refreshing: boolean;
  duplicateBlocked: boolean;
  error: string | null;
};

export function usePageMirror(projectId: string) {
  const [rows, setRows] = useState<PageVisualIndexRow[]>([]);
  const [inspector, setInspector] = useState<PageMirrorInspectorState | null>(null);
  const [loading, setLoading] = useState(false);
  const [captureRefresh, setCaptureRefresh] = useState<ProjectCaptureRefreshState>({
    run: null,
    refreshing: false,
    duplicateBlocked: false,
    error: null,
  });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

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
          captureStatus: p.pageCaptureStatus ?? p.page.status,
          pageCaptureStatus: p.pageCaptureStatus,
          lastCapturedAt: p.page.lastCapturedAt,
          lastUpdatedAt: p.page.updatedAt,
          isStale: p.freshness.isStale,
          staleReason: p.freshness.staleReason,
          neverCaptured: p.freshness.neverCaptured ?? false,
          referenceUrl: p.referenceUrl,
          visualMatchStatus: p.visualMatchStatus,
          historyCount: p.historyCount,
          pagePurpose: p.displayName,
        })),
      );
      if (data.captureRun) {
        setCaptureRefresh((prev) => ({
          ...prev,
          run: data.captureRun ?? null,
          refreshing: ['PLANNING', 'QUEUING', 'CAPTURING'].includes(data.captureRun?.status ?? ''),
        }));
      }
    } catch {
      /* dev offline — fallback handled by workspace */
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const startPolling = useCallback(() => {
    stopPolling();
    pollRef.current = setInterval(() => {
      void refresh();
    }, 2500);
  }, [refresh, stopPolling]);

  const refreshPage = useCallback(
    async (screenId: string, viewportClass = 'mobile') => {
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
          viewportClass,
          baseUrl: window.location.origin,
        }),
      });
      await refresh();
    },
    [projectId, refresh, rows],
  );

  const refreshProject = useCallback(
    async (options?: { forceNewRun?: boolean }) => {
      setCaptureRefresh((prev) => ({ ...prev, refreshing: true, error: null }));
      try {
        const res = await fetch('/api/site00/page-mirror', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'refresh_project',
            projectId,
            skipRouteReconciliation: true,
            viewportMode: 'MOBILE_ONLY',
            baseUrl: window.location.origin,
            forceNewRun: options?.forceNewRun,
          }),
        });
        if (!res.ok) {
          const err = (await res.json()) as { error?: string };
          setCaptureRefresh((prev) => ({
            ...prev,
            refreshing: false,
            error: err.error ?? 'CAPTURE_REFRESH_FAILED',
          }));
          return null;
        }
        const run = (await res.json()) as ProjectCaptureRun & { duplicateBlocked?: boolean };
        setCaptureRefresh({
          run,
          refreshing: run.duplicateBlocked
            ? ['PLANNING', 'QUEUING', 'CAPTURING'].includes(run.status)
            : true,
          duplicateBlocked: Boolean(run.duplicateBlocked),
          error: null,
        });
        startPolling();
        await refresh();
        return run;
      } catch {
        setCaptureRefresh((prev) => ({ ...prev, refreshing: false, error: 'NETWORK_ERROR' }));
        return null;
      }
    },
    [projectId, refresh, startPolling],
  );

  useEffect(() => {
    void refresh();
    return () => stopPolling();
  }, [refresh, stopPolling]);

  useEffect(() => {
    if (!captureRefresh.refreshing) {
      stopPolling();
    }
  }, [captureRefresh.refreshing, stopPolling]);

  return {
    rows,
    inspector,
    loading,
    captureRefresh,
    refresh,
    refreshPage,
    refreshProject,
  };
}
