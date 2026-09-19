/**
 * P0.VR.3E — Client hook for implementation snapshot API.
 */

import { useCallback, useEffect, useState } from 'react';
import type { ImplementationSnapshotRecord, ImplementationSnapshotCoverage } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3e/client.js';
import type { DesignViewportClass } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2/client.js';

function snapshotKey(projectId: string, screenId: string, viewport: DesignViewportClass) {
  return `${projectId}:${screenId}:${viewport}`;
}

export function useImplementationSnapshots(projectId: string) {
  const [cache, setCache] = useState<Record<string, ImplementationSnapshotRecord>>({});
  const [coverage, setCoverage] = useState<ImplementationSnapshotCoverage | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [batchProgress, setBatchProgress] = useState<string | null>(null);

  const refreshCoverage = useCallback(async () => {
    try {
      const res = await fetch(`/api/site00/implementation-snapshots?projectId=${encodeURIComponent(projectId)}`);
      if (!res.ok) return;
      const data = (await res.json()) as {
        coverage: ImplementationSnapshotCoverage;
        hydration?: { hydrated: number; reused: number };
      };
      setCoverage(data.coverage);
    } catch {
      /* dev offline */
    }
  }, [projectId]);

  const loadComposerDraftReview = useCallback(async () => {
    try {
      const res = await fetch('/api/site00/implementation-snapshots?view=composer_draft_review');
      if (!res.ok) return null;
      return (await res.json()) as {
        queue: Array<{ pageId: string; screenshots: Record<DesignViewportClass, string | null> }>;
        health: { valid: number; expected: number };
      };
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    void refreshCoverage();
    void (async () => {
      const session = await loadComposerDraftReview();
      if (!session) return;
      const next: Record<string, ImplementationSnapshotRecord> = {};
      for (const entry of session.queue) {
        for (const viewport of ['mobile', 'tablet', 'desktop'] as const) {
          const url = entry.screenshots[viewport];
          if (!url) continue;
          const key = snapshotKey(projectId, entry.pageId, viewport);
          next[key] = {
            snapshotId: `hydrated-${entry.pageId}-${viewport}`,
            projectId,
            designScreenId: entry.pageId,
            implementationRouteId: null,
            viewportClass: viewport,
            route: '',
            resolvedRoute: '',
            capturedUrl: url,
            width: 0,
            height: 0,
            deviceScaleFactor: 2,
            storagePath: '',
            publicUrl: url,
            sourceCommit: null,
            sourceBuildId: null,
            capturedAt: '',
            captureStatus: 'CURRENT',
            captureType: 'VIEWPORT',
            authContext: 'PUBLIC',
            routeState: null,
            visualStateId: null,
            stale: false,
            error: null,
            qaPassed: true,
            qaIssues: [],
          };
        }
      }
      if (Object.keys(next).length) setCache((prev) => ({ ...prev, ...next }));
    })();
  }, [loadComposerDraftReview, projectId, refreshCoverage]);

  const getSnapshot = useCallback(
    (screenId: string, viewportClass: DesignViewportClass) =>
      cache[snapshotKey(projectId, screenId, viewportClass)] ?? null,
    [cache, projectId],
  );

  const mergeSnapshot = useCallback((snap: ImplementationSnapshotRecord | null) => {
    if (!snap) return;
    setCache((prev) => ({
      ...prev,
      [snapshotKey(snap.projectId, snap.designScreenId, snap.viewportClass)]: snap,
    }));
  }, []);

  const captureScreen = useCallback(
    async (screenId: string, viewportClass: DesignViewportClass) => {
      setCapturing(true);
      try {
        const res = await fetch('/api/site00/implementation-snapshots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'capture_screen',
            projectId,
            screenId,
            viewportClass,
            baseUrl: window.location.origin,
          }),
        });
        const data = (await res.json()) as { snapshot: ImplementationSnapshotRecord };
        mergeSnapshot(data.snapshot);
        await refreshCoverage();
        return data.snapshot;
      } finally {
        setCapturing(false);
      }
    },
    [mergeSnapshot, projectId, refreshCoverage],
  );

  const captureProject = useCallback(
    async (screenSetMode: 'PRIMARY' | 'ALL_DESIGNABLE' = 'PRIMARY') => {
      setCapturing(true);
      setBatchProgress('CAPTURING…');
      try {
        const res = await fetch('/api/site00/implementation-snapshots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'capture_project',
            projectId,
            screenSetMode,
            baseUrl: window.location.origin,
          }),
        });
        const data = (await res.json()) as {
          batch: { complete: number; failed: number; planned: number };
          snapshots: ImplementationSnapshotRecord[];
        };
        for (const snap of data.snapshots ?? []) mergeSnapshot(snap);
        setBatchProgress(
          `COMPLETE ${data.batch?.complete ?? 0} · FAILED ${data.batch?.failed ?? 0} · PLANNED ${data.batch?.planned ?? 0}`,
        );
        await refreshCoverage();
      } finally {
        setCapturing(false);
      }
    },
    [mergeSnapshot, projectId, refreshCoverage],
  );

  return {
    getSnapshot,
    coverage,
    capturing,
    batchProgress,
    captureScreen,
    captureProject,
    refreshCoverage,
    loadComposerDraftReview,
  };
}
