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
import {
  bindCaptureCompletionToClientStore,
  CAPTURE_NOW_SUCCESS_HOLD_MS,
  hydratePageViewportCapturesFromStorage,
  latestUiStepFromMilestones,
  startCaptureProgressAnimation,
  type CaptureCompletionReceipt,
  type CaptureProgressStep,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/index.js';
import type { CaptureCurrentPageResult } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/types.js';
import type { PageVisualIndexRow } from './DesignPagesVisualIndex';
import { formatCaptureTransportError } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/formatCaptureTransportError.js';
import { captureApiFetch, CAPTURE_CURRENT_PAGE_TIMEOUT_MS, PAGE_MIRROR_PATH } from '../../services/captureApiFetch';
import { checkCaptureTransportHealth } from '../../services/checkCaptureTransportHealth';
import { resolveFounderCaptureBaseUrl } from '../../../utils/site00CaptureBase';
import {
  buildLocalPageMirrorVisualRows,
  captureFailureMessage,
  completionBindingFailed,
  logCaptureTelemetry,
  normalizeCaptureScreenId,
  resolveCaptureIndexRow,
  resolveCapturePageId,
} from './captureNowClient';

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
  const [captureNowError, setCaptureNowError] = useState<string | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const applyMirrorResponse = useCallback(
    (data: MirrorResponse) => {
    setInspector(data.inspector);
    const apiRows = data.pages ?? [];
    setRows(apiRows.length ? apiRows : buildLocalPageMirrorVisualRows(projectId));

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
  },
    [projectId],
  );

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
        setRows(buildLocalPageMirrorVisualRows(projectId));
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

  const bindCompletion = useCallback((completion: CaptureCompletionReceipt) => {
    bindCaptureCompletionToClientStore(completion);
    logCaptureTelemetry('capture_bound', {
      jobId: completion.jobId,
      captureId: completion.captureId,
      pageId: completion.pageId,
      viewport: completion.viewport,
      status: completion.status,
    });
  }, []);

  const resolveRowForCapture = useCallback(
    (screenId: string): PageVisualIndexRow | null => {
      const normalizedScreenId = normalizeCaptureScreenId(screenId, projectId);
      const fromMirror = resolveCaptureIndexRow(rows, normalizedScreenId, projectId);
      if (fromMirror) return fromMirror;
      const fallback = buildLocalPageMirrorVisualRows(projectId);
      return resolveCaptureIndexRow(fallback, normalizedScreenId, projectId);
    },
    [projectId, rows],
  );

  const captureNow = useCallback(
    async (screenId: string, viewportClass: DesignViewportClass = 'mobile') => {
      const row = resolveRowForCapture(screenId);
      if (!row) {
        setCaptureNowError(
          `CAPTURE INDEX MISSING FOR "${screenId.toUpperCase()}" — PULL TO REFRESH OR REOPEN DESIGN.`,
        );
        return null;
      }

      const pageId = resolveCapturePageId(projectId, row);
      const lockKey = `${pageId}:${viewportClass}`;
      if (captureNowLockRef.current === lockKey) return null;
      captureNowLockRef.current = lockKey;
      setCaptureNowError(null);
      setCapturingPageId(pageId);
      setCaptureNowProgress('OPENING_PAGE');
      logCaptureTelemetry('capture_button_clicked', { projectId, pageId, screenId, viewportClass });

      const progressAnimation = startCaptureProgressAnimation((step) => {
        setCaptureNowProgress(step);
      });

      try {
        const result = await captureApiFetch<CaptureCurrentPageResult>(PAGE_MIRROR_PATH, {
          method: 'POST',
          timeoutMs: CAPTURE_CURRENT_PAGE_TIMEOUT_MS,
          body: {
            action: 'capture_current_page',
            projectId,
            pageId,
            screenId,
            route: row.route ?? row.normalizedRoute ?? '/',
            viewportClass,
            baseUrl: resolveFounderCaptureBaseUrl(),
          },
        });

        progressAnimation.stop();

        const data = result.data;
        const completion = data?.completion;

        if (completion?.milestones?.length) {
          const uiStep = latestUiStepFromMilestones(completion.milestones);
          if (uiStep) setCaptureNowProgress(uiStep as CaptureProgressStep);
          logCaptureTelemetry('stage_updates', {
            jobId: completion.jobId,
            milestones: completion.milestones.map((m) => m.milestone),
          });
        } else if (result.ok) {
          setCaptureNowProgress('SAVING_CAPTURE');
        }

        if (data) {
          setLastCaptureResult(data);
          logCaptureTelemetry('completion_receipt_received', {
            jobId: data.jobId,
            captureId: data.captureId,
            status: data.status,
          });
        }

        if (completion?.status === 'CAPTURE_READY' && completion.imageRef) {
          bindCompletion(completion);
          setCaptureNowError(completionBindingFailed(completion) ? captureFailureMessage('BINDING_FAILED') : null);
        } else if (completion) {
          setCaptureNowError(captureFailureMessage(completion.errorCode, completion.errorMessage ?? undefined));
        } else if (!result.ok) {
          setCaptureNowError(
            result.errorCode
              ? formatCaptureTransportError(result.errorCode)
              : captureFailureMessage(null, 'CAPTURE_FAILED'),
          );
        }

        if (completion?.status === 'CAPTURE_READY' && completion.imageRef) {
          await new Promise((resolve) => setTimeout(resolve, CAPTURE_NOW_SUCCESS_HOLD_MS));
        }

        return data ?? null;
      } catch (error) {
        progressAnimation.stop();
        const message = error instanceof Error ? error.message : 'CAPTURE_FAILED';
        setCaptureNowError(captureFailureMessage(null, message));
        return null;
      } finally {
        progressAnimation.stop();
        setCaptureNowProgress(null);
        setCapturingPageId(null);
        captureNowLockRef.current = null;
      }
    },
    [bindCompletion, projectId, resolveRowForCapture],
  );

  const refreshPage = useCallback(
    async (screenId: string, viewportClass = 'mobile') => {
      const row = resolveRowForCapture(screenId);
      if (!row) return;
      const pageId = resolveCapturePageId(projectId, row);
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
          baseUrl: resolveFounderCaptureBaseUrl(),
        },
      });
      await refresh();
    },
    [projectId, refresh, resolveRowForCapture],
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
            baseUrl: resolveFounderCaptureBaseUrl(),
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
    hydratePageViewportCapturesFromStorage(projectId);
    void runTransportCheck();
    void refresh();
    return () => stopPolling();
  }, [projectId, refresh, runTransportCheck, stopPolling]);

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
    captureNowError,
    lastCaptureResult,
    refresh,
    captureNow,
    refreshPage,
    refreshProject,
    retryTransportCheck: runTransportCheck,
    testWorker,
  };
}
