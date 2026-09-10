/**
 * P0.VR.8 / P0.VR.8R3R3 — Client hook for live page mirror + capture transport + run contract.
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
import type { CaptureTransportHealth } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/captureTransportReceipt.js';
import {
  TEST_WORKER_PROGRESS_STEPS,
  type TestWorkerProgressStep,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/captureFounderGuidance.js';
import type { DesignViewportClass } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2/types.js';
import type { CaptureCurrentPageResult } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/types.js';
import type { PageVisualIndexRow } from './DesignPagesVisualIndex';
import { captureApiFetch, PAGE_MIRROR_PATH } from '../../services/captureApiFetch';
import { checkCaptureTransportHealth } from '../../services/checkCaptureTransportHealth';

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
  transportHealth: CaptureTransportHealth | null;
  transportChecking: boolean;
  testingWorker: boolean;
  testJobPassed: boolean;
  testWorkerProgress: TestWorkerProgressStep | null;
  testWorkerFailed: boolean;
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

function mirrorPath(projectId: string, view?: string): string {
  const params = new URLSearchParams({ projectId });
  if (view) params.set('view', view);
  return `${PAGE_MIRROR_PATH}?${params.toString()}`;
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
    transportHealth: null,
    transportChecking: false,
    testingWorker: false,
    testJobPassed: false,
    testWorkerProgress: null,
    testWorkerFailed: false,
  });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const captureNowLockRef = useRef<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [capturingPageId, setCapturingPageId] = useState<string | null>(null);
  const [captureNowProgress, setCaptureNowProgress] = useState<string | null>(null);
  const [lastCaptureResult, setLastCaptureResult] = useState<CaptureCurrentPageResult | null>(null);

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

  const runTransportCheck = useCallback(async () => {
    setCaptureRefresh((prev) => ({ ...prev, transportChecking: true }));
    try {
      const result = await checkCaptureTransportHealth(projectId);
      setCaptureRefresh((prev) => ({
        ...prev,
        transportHealth: result.health,
        transportChecking: false,
        testJobPassed: result.health.testJobPassed ?? prev.testJobPassed,
        error:
          result.health.status === 'HEALTHY' && result.health.workerStatus === 'HEALTHY'
            ? prev.error && prev.errorCode?.includes('TRANSPORT') ? null : prev.error
            : result.health.errors[0] ?? 'CAPTURE_SERVICE_NOT_READY',
        errorCode:
          result.health.status === 'HEALTHY' && result.health.workerStatus === 'HEALTHY'
            ? prev.errorCode && prev.errorCode.includes('API_') ? prev.errorCode : null
            : result.health.errors[0] ?? 'CAPTURE_SERVICE_NOT_READY',
      }));
      return result.health;
    } catch {
      setCaptureRefresh((prev) => ({ ...prev, transportChecking: false }));
      return null;
    }
  }, [projectId]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await captureApiFetch<MirrorResponse>(mirrorPath(projectId));
      if (!result.ok || !result.data) {
        if (result.errorCode) {
          setCaptureRefresh((prev) => ({
            ...prev,
            error: result.errorCode,
            errorCode: result.errorCode,
          }));
        }
        return;
      }
      applyMirrorResponse(result.data);
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

  const captureNow = useCallback(
    async (screenId: string, viewportClass: DesignViewportClass = 'mobile') => {
      const row = rows.find((r) => r.screenId === screenId);
      const pageId = row?.normalizedRoute
        ? `${projectId}:${row.normalizedRoute}`
        : `${projectId}:${(row?.route ?? screenId).replace(/^\//, '').toLowerCase()}`;
      const lockKey = `${pageId}:${viewportClass}`;
      if (captureNowLockRef.current === lockKey) return null;
      captureNowLockRef.current = lockKey;
      setCapturingPageId(pageId);
      setCaptureNowProgress('OPENING_PAGE');

      const steps = ['OPENING_PAGE', 'RENDERING_VIEWPORT', 'TAKING_SCREENSHOT', 'SAVING_CAPTURE'] as const;
      let stepIdx = 0;
      const progressTimer = setInterval(() => {
        stepIdx = Math.min(stepIdx + 1, steps.length - 1);
        setCaptureNowProgress(steps[stepIdx] ?? 'SAVING_CAPTURE');
      }, 900);

      try {
        const result = await captureApiFetch<CaptureCurrentPageResult>(PAGE_MIRROR_PATH, {
          method: 'POST',
          body: {
            action: 'capture_current_page',
            projectId,
            pageId,
            screenId,
            route: row?.route ?? row?.normalizedRoute ?? '/',
            viewportClass,
            baseUrl: window.location.origin,
          },
        });
        clearInterval(progressTimer);
        setCaptureNowProgress(null);
        setCapturingPageId(null);
        captureNowLockRef.current = null;
        if (result.data) setLastCaptureResult(result.data);
        await refresh();
        return result.data ?? null;
      } catch {
        clearInterval(progressTimer);
        setCaptureNowProgress(null);
        setCapturingPageId(null);
        captureNowLockRef.current = null;
        return null;
      }
    },
    [projectId, refresh, rows],
  );

  const refreshPage = useCallback(
    async (screenId: string, viewportClass = 'mobile') => {
      const row = rows.find((r) => r.screenId === screenId);
      const pageId = row?.normalizedRoute
        ? `${projectId}:${row.normalizedRoute}`
        : `${projectId}:${(row?.route ?? screenId).replace(/^\//, '').toLowerCase()}`;
      await captureApiFetch(PAGE_MIRROR_PATH, {
        method: 'POST',
        body: {
          action: 'refresh_page',
          projectId,
          pageId,
          screenId,
          route: row?.route,
          executeCapture: true,
          viewportClass,
          baseUrl: window.location.origin,
        },
      });
      await refresh();
    },
    [projectId, refresh, rows],
  );

  const refreshProject = useCallback(
    async (options?: { forceNewRun?: boolean; skipTransportCheck?: boolean }) => {
      setCaptureRefresh((prev) => ({
        ...prev,
        refreshing: true,
        error: null,
        errorCode: null,
        contractError: null,
      }));

      if (!options?.skipTransportCheck) {
        const transport = await runTransportCheck();
        const workerReady =
          transport?.workerStatus === 'HEALTHY' &&
          transport.playwrightReady &&
          transport.browserReady;
        if (!transport || transport.status !== 'HEALTHY' || !workerReady) {
          setCaptureRefresh((prev) => ({
            ...prev,
            refreshing: false,
            error: transport?.errors[0] ?? 'WORKER_UNAVAILABLE',
            errorCode: transport?.errors[0] ?? 'WORKER_UNAVAILABLE',
          }));
          return null;
        }
        if (!transport.testJobPassed) {
          setCaptureRefresh((prev) => ({
            ...prev,
            refreshing: false,
            error: 'WORKER_TEST_REQUIRED',
            errorCode: 'WORKER_TEST_REQUIRED',
          }));
          return null;
        }
      }

      try {
        const result = await captureApiFetch<Record<string, unknown>>(PAGE_MIRROR_PATH, {
          method: 'POST',
          body: {
            action: 'refresh_project',
            projectId,
            viewportMode: 'MOBILE_ONLY',
            baseUrl: window.location.origin,
            forceNewRun: options?.forceNewRun ?? true,
            contractVersion: CAPTURE_RUN_CONTRACT_VERSION,
          },
        });

        const data = result.data ?? {};
        if (!result.ok) {
          setCaptureRefresh((prev) => ({
            ...prev,
            refreshing: false,
            error: result.errorCode ?? String(data.error ?? 'CAPTURE_REFRESH_FAILED'),
            errorCode: result.errorCode ?? String(data.errorCode ?? data.error ?? 'CAPTURE_REFRESH_FAILED'),
            run: data.captureRun ? parseCaptureRunPayload(data) : prev.run,
          }));
          return null;
        }

        const run = parseCaptureRunPayload(data, data.buildReceipt as BuildVersionReceipt | undefined);
        setCaptureRefresh((prev) => ({
          run,
          refreshing: run.contractValid && ['PLANNING', 'QUEUING', 'CAPTURING'].includes(run.status),
          duplicateBlocked: Boolean(run.duplicateBlocked),
          error: run.contractValid ? null : run.contractError,
          errorCode: run.contractValid ? null : run.contractError,
          contractError: run.contractError,
          buildReceipt: (data.buildReceipt as BuildVersionReceipt) ?? null,
          captureSummary: (data.captureSummary as ProjectCaptureStateSummary) ?? null,
          preflight: (data.preflight as CaptureRunPreflight) ?? run.preflight ?? null,
          transportHealth: prev.transportHealth,
          transportChecking: false,
          testingWorker: prev.testingWorker,
          testJobPassed: prev.testJobPassed,
          testWorkerProgress: prev.testWorkerProgress,
          testWorkerFailed: prev.testWorkerFailed,
        }));
        if (run.contractValid) startPolling();
        await refresh();
        return run;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'UNKNOWN_TRANSPORT_ERROR';
        setCaptureRefresh((prev) => ({
          ...prev,
          refreshing: false,
          error: message,
          errorCode: 'UNKNOWN_TRANSPORT_ERROR',
        }));
        return null;
      }
    },
    [projectId, refresh, runTransportCheck, startPolling],
  );

  const testWorker = useCallback(async () => {
    setCaptureRefresh((prev) => ({
      ...prev,
      testingWorker: true,
      testWorkerProgress: 'CONNECTING',
      testWorkerFailed: false,
      error: null,
      errorCode: null,
    }));

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    try {
      for (const step of TEST_WORKER_PROGRESS_STEPS) {
        setCaptureRefresh((prev) => ({ ...prev, testWorkerProgress: step }));
        await sleep(350);
      }

      const result = await captureApiFetch<{
        testJob?: { status: string; jobId: string };
        workerHealth?: { workerStatus?: string; testJobPassed?: boolean };
      }>(PAGE_MIRROR_PATH, {
        method: 'POST',
        body: { action: 'test_worker', projectId },
      });
      await runTransportCheck();
      const passed = result.data?.testJob?.status === 'COMPLETE';
      setCaptureRefresh((prev) => ({
        ...prev,
        testingWorker: false,
        testWorkerProgress: passed ? 'COMPLETE' : 'FAILED',
        testWorkerFailed: !passed,
        testJobPassed: passed || prev.testJobPassed,
        error: passed ? null : 'WORKER_TEST_FAILED',
        errorCode: passed ? null : 'WORKER_TEST_FAILED',
      }));
      return passed;
    } catch {
      setCaptureRefresh((prev) => ({
        ...prev,
        testingWorker: false,
        testWorkerProgress: 'FAILED',
        testWorkerFailed: true,
        error: 'WORKER_TEST_FAILED',
        errorCode: 'WORKER_TEST_FAILED',
      }));
      return false;
    }
  }, [projectId, runTransportCheck]);

  useEffect(() => {
    void runTransportCheck();
    void refresh();
    return () => stopPolling();
  }, [refresh, runTransportCheck, stopPolling]);

  useEffect(() => {
    if (!captureRefresh.refreshing) stopPolling();
  }, [captureRefresh.refreshing, stopPolling]);

  return {
    rows,
    inspector,
    loading,
    captureRefresh,
    capturingPageId,
    captureNowProgress,
    lastCaptureResult,
    refresh,
    captureNow,
    refreshPage,
    refreshProject,
    retryTransportCheck: runTransportCheck,
    testWorker,
  };
}
