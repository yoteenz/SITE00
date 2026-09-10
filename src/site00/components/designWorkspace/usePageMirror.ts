/**
 * P0.VR.8 / P0.VR.8R3R2 — Client hook for live page mirror + capture run contract.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PageMirrorInspectorState } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8/client.js';
import {
  CAPTURE_RUN_CONTRACT_VERSION,
  P0_VR_8R3R1_BUILD,
  detectBackendVersionMismatch,
  normalizeProjectCaptureRunResponse,
  type ProjectCaptureRunContract,
  type BuildVersionReceipt,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/browserClient.js';
import type { ProjectCaptureStateSummary } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/projectCaptureStateSummary.js';
import type { CaptureRunPreflight } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/captureRunPreflight.js';
import type { PageVisualIndexRow } from './DesignPagesVisualIndex';

type MirrorResponse = {
  contractVersion?: string;
  projectId: string;
  pages: PageVisualIndexRow[];
  inspector: PageMirrorInspectorState;
  captureRun?: ProjectCaptureRunContract | null;
  captureSummary?: ProjectCaptureStateSummary;
  preflight?: CaptureRunPreflight;
  buildReceipt?: BuildVersionReceipt;
};

export type ProjectCaptureRefreshState = {
  run: ProjectCaptureRunContract | null;
  refreshing: boolean;
  duplicateBlocked: boolean;
  error: string | null;
  errorCode: string | null;
  contractError: string | null;
  buildReceipt: BuildVersionReceipt | null;
  captureSummary: ProjectCaptureStateSummary | null;
  preflight: CaptureRunPreflight | null;
};

function parseCaptureRunPayload(
  data: Record<string, unknown>,
  buildReceipt?: BuildVersionReceipt | null,
): ProjectCaptureRunContract {
  const raw = (data.captureRun ?? data) as Record<string, unknown>;
  return normalizeProjectCaptureRunResponse(raw, {
    buildReceipt: buildReceipt ?? undefined,
    preflight: (data.preflight as CaptureRunPreflight | undefined) ?? null,
  });
}

export function usePageMirror(projectId: string) {
  const [rows, setRows] = useState<PageVisualIndexRow[]>([]);
  const [inspector, setInspector] = useState<PageMirrorInspectorState | null>(null);
  const [captureRefresh, setCaptureRefresh] = useState<ProjectCaptureRefreshState>({
    run: null,
    refreshing: false,
    duplicateBlocked: false,
    error: null,
    errorCode: null,
    contractError: null,
    buildReceipt: null,
    captureSummary: null,
    preflight: null,
  });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [loading, setLoading] = useState(false);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const applyMirrorResponse = useCallback((data: MirrorResponse) => {
    setInspector(data.inspector);
    setRows(data.pages ?? []);

    const receipt = data.buildReceipt ?? null;
    const mismatch = detectBackendVersionMismatch(receipt ?? undefined, P0_VR_8R3R1_BUILD);

    setCaptureRefresh((prev) => {
      const next: ProjectCaptureRefreshState = {
        ...prev,
        captureSummary: data.captureSummary ?? prev.captureSummary,
        preflight: data.preflight ?? prev.preflight,
        buildReceipt: receipt,
      };

      if (data.captureRun) {
        const run = parseCaptureRunPayload({ captureRun: data.captureRun, preflight: data.preflight }, receipt);
        const contractMismatch =
          data.contractVersion && data.contractVersion !== CAPTURE_RUN_CONTRACT_VERSION
            ? 'CAPTURE_RUN_CONTRACT_MISMATCH'
            : mismatch;
        next.run = contractMismatch ? { ...run, contractValid: false, contractError: contractMismatch } : run;
        next.refreshing = run.contractValid && ['PLANNING', 'QUEUING', 'CAPTURING'].includes(run.status);
        next.duplicateBlocked = Boolean(run.duplicateBlocked);
        next.contractError = contractMismatch ?? run.contractError;
        next.error = run.contractValid ? null : run.contractError;
        next.errorCode = run.contractValid ? null : run.contractError;
      }

      return next;
    });
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/site00/page-mirror?projectId=${encodeURIComponent(projectId)}`);
      if (!res.ok) return;
      const data = (await res.json()) as MirrorResponse;
      applyMirrorResponse(data);
    } catch {
      /* dev offline — fallback handled by workspace */
    } finally {
      setLoading(false);
    }
  }, [applyMirrorResponse, projectId]);

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
      setCaptureRefresh((prev) => ({
        ...prev,
        refreshing: true,
        error: null,
        errorCode: null,
        contractError: null,
      }));
      try {
        const res = await fetch('/api/site00/page-mirror', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'refresh_project',
            projectId,
            viewportMode: 'MOBILE_ONLY',
            baseUrl: window.location.origin,
            forceNewRun: options?.forceNewRun ?? true,
            contractVersion: CAPTURE_RUN_CONTRACT_VERSION,
          }),
        });
        const data = (await res.json()) as Record<string, unknown> & { error?: string; errorCode?: string };
        if (!res.ok) {
          setCaptureRefresh((prev) => ({
            ...prev,
            refreshing: false,
            error: data.error ?? 'CAPTURE_REFRESH_FAILED',
            errorCode: data.errorCode ?? data.error ?? 'CAPTURE_REFRESH_FAILED',
            run: data.captureRun ? parseCaptureRunPayload(data) : prev.run,
          }));
          return null;
        }
        const run = parseCaptureRunPayload(data, data.buildReceipt as BuildVersionReceipt | undefined);
        setCaptureRefresh({
          run,
          refreshing: run.contractValid && ['PLANNING', 'QUEUING', 'CAPTURING'].includes(run.status),
          duplicateBlocked: Boolean(run.duplicateBlocked),
          error: run.contractValid ? null : run.contractError,
          errorCode: run.contractValid ? null : run.contractError,
          contractError: run.contractError,
          buildReceipt: (data.buildReceipt as BuildVersionReceipt) ?? null,
          captureSummary: (data.captureSummary as ProjectCaptureStateSummary) ?? null,
          preflight: (data.preflight as CaptureRunPreflight) ?? run.preflight ?? null,
        });
        if (run.contractValid) startPolling();
        await refresh();
        return run;
      } catch {
        setCaptureRefresh((prev) => ({ ...prev, refreshing: false, error: 'NETWORK_ERROR', errorCode: 'NETWORK_ERROR' }));
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
    if (!captureRefresh.refreshing) stopPolling();
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
