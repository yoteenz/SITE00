import { useCallback, useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';

import {
  DESIGN_PAGE_CAPTURE_UPDATED_EVENT,
  getPageConceptSourceCaptures,
  isPageCaptureDisplayableArtifact,
} from '../../../../../shared/site00-design-workspace-production/designPageCapture.js';
import {
  applyPageConceptPipelineSet,
  mergePageConceptArtifactsIntoGallery,
  mergePageConceptGenerationJobs,
  registerPageConceptGenerationJobs,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/generationWorkflow.js';
import {
  pageConceptHasFailedNbpJobs,
  pageConceptReviewReady,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGeneratorBinding.js';
import {
  createPageConceptGenerationRunId,
  emitPageConceptGenerateTelemetry,
  PAGE_CONCEPT_GENERATE_CLICK_TRACE_INITIAL,
  type PageConceptGenerateClickTrace,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGenerateClickTelemetry.js';
import { computePageConceptModalGeneratePress } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptModalGeneratePress.js';
import { buildPageConceptGenerationPlan } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/generationPlan.js';
import { designPageCaptureEventMatches } from '../../../../../shared/site00-design-workspace-production/designPageIdentity.js';
import {
  derivePageConceptGenerationBlockingState,
  sanitizePageConceptExecutionError,
  type PageConceptGenerationBlockingState,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGenerationBlockingState.js';
import { isPageConceptStaleCaptureEligibilityNotice } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptFounderNotice.js';
import { recordPageConceptGenerationAttemptForensics } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGenerationAttemptForensics.js';
import {
  buildPageConceptGenerationEligibility,
  type PageConceptCaptureHydrationStatus,
  type PageConceptGenerationEligibility,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGenerationEligibility.js';
import { pageConceptCaptureConfirmBlockMessage } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/readiness.js';
import {
  loadPageConceptGenerationState,
  savePageConceptGenerationState,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/store.js';
import type { PageCaptureRecord } from '../../../../../shared/site00-design-workspace-production/designPageCapture.js';
import type {
  PageConceptGenerationPlan,
  PageConceptGenerationState,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import { ensurePageConceptSourceCaptures } from '../../../services/designPageCaptureHydrateClient.js';
import type { PageConceptCapturePayload } from '../../../services/pageConceptGenerationClient.js';
import {
  ensurePageConceptApiAccessToken,
  PAGE_CONCEPT_SIGN_IN_REQUIRED,
} from '../../../services/pageConceptApiSession.js';
import {
  planPageConceptGenerationApi,
  runPageConceptGenerationApi,
} from '../../../services/pageConceptGenerationClient.js';
import { getAccessToken } from '../../../../utils/api.js';

async function artifactPathToBase64(path: string): Promise<string> {
  if (path.startsWith('data:')) {
    const comma = path.indexOf(',');
    return comma >= 0 ? path.slice(comma + 1) : path;
  }
  const res = await fetch(path);
  if (!res.ok) throw new Error(`CAPTURE_FETCH_${res.status}`);
  const buf = await res.arrayBuffer();
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function resolveCaptureArtifactUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://site00.com';
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}

async function buildPageConceptCapturePayload(
  record: PageCaptureRecord,
  viewport: 'MOBILE' | 'DESKTOP',
): Promise<PageConceptCapturePayload> {
  const dims =
    viewport === 'MOBILE' ?
      { width: 390, height: 844 }
    : { width: 1440, height: 900 };
  const path = record.artifactPath;
  if (!isPageCaptureDisplayableArtifact(path)) {
    throw new Error(
      pageConceptCaptureConfirmBlockMessage(record.projectId, record.pageId) ||
        'Implementation source capture is not a displayable image for this viewport.',
    );
  }
  if (path.startsWith('data:') || path.startsWith('blob:')) {
    return {
      captureId: record.captureId,
      ...dims,
      artifactBase64: await artifactPathToBase64(path),
    };
  }
  return {
    captureId: record.captureId,
    ...dims,
    artifactUrl: resolveCaptureArtifactUrl(path),
  };
}

export function usePageConceptGeneration(
  projectId: string,
  pageId: string,
  screenId: string,
  route?: string | null,
) {
  const [state, setState] = useState<PageConceptGenerationState>(() =>
    loadPageConceptGenerationState(projectId, pageId),
  );
  const [pendingPlan, setPendingPlan] = useState<PageConceptGenerationPlan | null>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [overlayMode, setOverlayMode] = useState<'confirm' | 'progress' | 'review'>('confirm');
  const [generating, setGenerating] = useState(false);
  /** Provider/runtime failures only — never eligibility gate copy (see blockingState). */
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [captureRevision, setCaptureRevision] = useState(0);
  const [apiSessionReady, setApiSessionReady] = useState<boolean | null>(null);
  const [captureHydrationStatus, setCaptureHydrationStatus] =
    useState<PageConceptCaptureHydrationStatus>('checking');
  const [generateClickTrace, setGenerateClickTrace] = useState<PageConceptGenerateClickTrace>(
    PAGE_CONCEPT_GENERATE_CLICK_TRACE_INITIAL,
  );

  useEffect(() => {
    const loaded = loadPageConceptGenerationState(projectId, pageId);
    setState(loaded);
    setPendingPlan(null);
    setOverlayOpen(false);
    setOverlayMode(pageConceptReviewReady(loaded.generationStatus) ? 'review' : 'confirm');
    setExecutionError(
      sanitizePageConceptExecutionError(
        buildPageConceptGenerationEligibility({
          projectSlug: projectId,
          pageId,
          screenId,
          route,
          sessionReady: null,
          hydrationStatus: 'ready',
        }),
        loaded.lastFailure?.message ?? null,
      ),
    );
    setGenerating(false);
    setCaptureHydrationStatus('checking');
  }, [pageId, projectId, route, screenId]);

  useEffect(() => {
    const onUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ projectId?: string; pageId?: string }>).detail;
      if (!designPageCaptureEventMatches(projectId, pageId, detail)) return;
      const loaded = loadPageConceptGenerationState(projectId, pageId);
      setState(loaded);
      if (pageConceptReviewReady(loaded.generationStatus)) setOverlayMode('review');
    };
    window.addEventListener('site00:page-concept-generation-updated', onUpdated);
    return () => window.removeEventListener('site00:page-concept-generation-updated', onUpdated);
  }, [pageId, projectId]);

  useEffect(() => {
    let cancelled = false;
    void getAccessToken().then((token) => {
      if (!cancelled) setApiSessionReady(!!token);
    });
    return () => {
      cancelled = true;
    };
  }, [captureRevision, pageId, projectId]);

  useEffect(() => {
    let cancelled = false;
    setCaptureHydrationStatus('checking');
    void ensurePageConceptSourceCaptures(projectId, pageId, screenId).then(() => {
      if (cancelled) return;
      setCaptureHydrationStatus('ready');
      setCaptureRevision((v) => v + 1);
    });
    return () => {
      cancelled = true;
    };
  }, [pageId, projectId, screenId]);

  useEffect(() => {
    const bump = (event: Event) => {
      const detail = (event as CustomEvent<{ projectId?: string; pageId?: string }>).detail;
      if (!designPageCaptureEventMatches(projectId, pageId, detail)) return;
      setCaptureHydrationStatus('ready');
      setCaptureRevision((v) => v + 1);
    };
    const onHydrated = (event: Event) => {
      const detail = (event as CustomEvent<{ projectId?: string; pageId?: string }>).detail;
      if (!designPageCaptureEventMatches(projectId, pageId, detail)) return;
      setCaptureHydrationStatus('ready');
      setCaptureRevision((v) => v + 1);
    };
    window.addEventListener(DESIGN_PAGE_CAPTURE_UPDATED_EVENT, bump);
    window.addEventListener('site00:page-concept-captures-hydrated', onHydrated);
    return () => {
      window.removeEventListener(DESIGN_PAGE_CAPTURE_UPDATED_EVENT, bump);
      window.removeEventListener('site00:page-concept-captures-hydrated', onHydrated);
    };
  }, [pageId, projectId]);

  const generationEligibility: PageConceptGenerationEligibility = useMemo(
    () =>
      buildPageConceptGenerationEligibility({
        projectSlug: projectId,
        pageId,
        screenId,
        route,
        sessionReady: apiSessionReady,
        hydrationStatus: captureHydrationStatus,
      }),
    [apiSessionReady, captureHydrationStatus, captureRevision, pageId, projectId, route, screenId],
  );

  useEffect(() => {
    setExecutionError((prev) => sanitizePageConceptExecutionError(generationEligibility, prev));
  }, [generationEligibility]);

  const blockingState: PageConceptGenerationBlockingState = useMemo(
    () =>
      derivePageConceptGenerationBlockingState({
        eligibility: generationEligibility,
        executionError,
        mode: overlayMode,
      }),
    [executionError, generationEligibility, overlayMode],
  );

  const failedNbp = pageConceptHasFailedNbpJobs(state);

  const modalGeneratePress = useMemo(
    () =>
      computePageConceptModalGeneratePress({
        eligibility: generationEligibility,
        mode: overlayMode,
        generating,
        generationStatus: state.generationStatus,
        executionError,
        failedNbp,
      }),
    [executionError, failedNbp, generationEligibility, generating, overlayMode, state.generationStatus],
  );

  const persist = useCallback(
    (fn: (s: PageConceptGenerationState) => PageConceptGenerationState) => {
      setState((prev) => {
        const next = fn(prev);
        savePageConceptGenerationState(next);
        return next;
      });
    },
    [],
  );

  useEffect(() => {
    if (!generationEligibility.sourceCaptureValidation.allRequiredReady) return;
    setExecutionError((prev) => sanitizePageConceptExecutionError(generationEligibility, prev));
    persist((s) => {
      if (!s.lastFailure?.message || !isPageConceptStaleCaptureEligibilityNotice(s.lastFailure.message)) {
        return s;
      }
      return { ...s, lastFailure: null };
    });
  }, [generationEligibility, persist]);

  const openGenerationConfirm = useCallback(async () => {
    setOverlayOpen(true);
    setOverlayMode('confirm');
    setPendingPlan(null);
    setCaptureHydrationStatus('checking');

    await ensurePageConceptSourceCaptures(projectId, pageId, screenId);
    setCaptureHydrationStatus('ready');
    setCaptureRevision((v) => v + 1);

    const token = await getAccessToken();
    setApiSessionReady(!!token);

    const eligibility = buildPageConceptGenerationEligibility({
      projectSlug: projectId,
      pageId,
      screenId,
      route,
      sessionReady: !!token,
      hydrationStatus: 'ready',
    });

    const loadedForError = loadPageConceptGenerationState(projectId, pageId);
    setExecutionError((prev) =>
      sanitizePageConceptExecutionError(
        eligibility,
        prev ?? loadedForError.lastFailure?.message ?? null,
      ),
    );

    if (!eligibility.canGenerate) {
      return;
    }

    let localPlan: PageConceptGenerationPlan;
    try {
      localPlan = buildPageConceptGenerationPlan(projectId, pageId);
    } catch (e) {
      setExecutionError(e instanceof Error ? e.message : 'PLAN_FAILED');
      return;
    }
    setPendingPlan(localPlan);
    const loadedForMode = loadPageConceptGenerationState(projectId, pageId);
    setOverlayMode(
      pageConceptReviewReady(loadedForMode.generationStatus) || loadedForMode.pipelineSet?.creativeInjection ?
        'review'
      : 'confirm',
    );
    persist((s) => ({ ...s, generationStatus: s.generationStatus === 'IDLE' ? 'PLANNED' : s.generationStatus }));

    const current = loadPageConceptGenerationState(projectId, pageId);
    try {
      const remotePlan = await planPageConceptGenerationApi(current);
      setPendingPlan(remotePlan);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'PLAN_FAILED';
      setExecutionError(message);
      recordPageConceptGenerationAttemptForensics({
        requestId: `plan-${Date.now()}`,
        generationRunId: `${projectId}:${pageId}`,
        stage: 'PLAN',
        endpoint: '/api/page-concept-generation/plan',
        httpStatus: null,
        errorCode: message,
        founderMessage: message,
        retryable: true,
      });
    }
  }, [pageId, persist, projectId, route, screenId]);

  const cancelGeneration = useCallback(() => {
    if (generating) return;
    setPendingPlan(null);
    setOverlayOpen(false);
    setExecutionError(null);
  }, [generating]);

  const handleGenerateClick = useCallback(async () => {
    const clickAt = new Date().toISOString();
    emitPageConceptGenerateTelemetry('page_concept_generate_clicked', {
      projectId,
      pageId,
      generationRunId: state.activeGenerationRunId,
      timestamp: clickAt,
    });
    setGenerateClickTrace((prev) => ({
      ...prev,
      clickReceived: true,
      clickAt,
      canGenerateAtClick: generationEligibility.canGenerate,
      canPressAtClick: modalGeneratePress.canPress,
    }));

    if (generating) {
      const message = 'GENERATION ALREADY IN PROGRESS';
      setExecutionError(message);
      setGenerateClickTrace((prev) => ({
        ...prev,
        preflightStatus: 'failed',
        lastErrorCode: message,
      }));
      emitPageConceptGenerateTelemetry('page_concept_generate_preflight_failed', {
        projectId,
        pageId,
        errorCode: message,
      });
      return;
    }

    emitPageConceptGenerateTelemetry('page_concept_generate_preflight_started', { projectId, pageId });
    setGenerateClickTrace((prev) => ({ ...prev, preflightStatus: 'started' }));

    const press = computePageConceptModalGeneratePress({
      eligibility: generationEligibility,
      mode: overlayMode,
      generating,
      generationStatus: state.generationStatus,
      executionError,
      failedNbp,
    });

    if (!press.canPress) {
      const message = press.blockReason ?? 'GENERATION BLOCKED';
      setExecutionError(message);
      setGenerateClickTrace((prev) => ({
        ...prev,
        preflightStatus: 'failed',
        lastErrorCode: message,
        canPressAtClick: false,
      }));
      emitPageConceptGenerateTelemetry('page_concept_generate_preflight_failed', {
        projectId,
        pageId,
        errorCode: message,
      });
      return;
    }

    emitPageConceptGenerateTelemetry('page_concept_generate_preflight_passed', { projectId, pageId });
    setGenerateClickTrace((prev) => ({ ...prev, preflightStatus: 'passed' }));

    const generationRunId = createPageConceptGenerationRunId(projectId, pageId);
    const startedAt = new Date().toISOString();
    flushSync(() => {
      setGenerating(true);
      setExecutionError(null);
      setOverlayMode('progress');
      setGenerateClickTrace((prev) => ({
        ...prev,
        generationRunId,
        dispatchStatus: 'started',
        lastErrorCode: null,
      }));
      persist((s) => ({
        ...s,
        generationStatus: 'CGPT_RUNNING',
        activeGenerationRunId: generationRunId,
        activeGenerationRunStartedAt: startedAt,
        activeGenerationStage: 'CGPT_STARTING',
      }));
    });
    emitPageConceptGenerateTelemetry('page_concept_generation_run_created', {
      projectId,
      pageId,
      generationRunId,
    });
    emitPageConceptGenerateTelemetry('page_concept_generation_dispatch_started', {
      projectId,
      pageId,
      generationRunId,
    });

    try {
      setCaptureHydrationStatus('checking');
      await ensurePageConceptSourceCaptures(projectId, pageId, screenId);
      setCaptureHydrationStatus('ready');
      setCaptureRevision((v) => v + 1);

      const eligibility = buildPageConceptGenerationEligibility({
        projectSlug: projectId,
        pageId,
        screenId,
        route,
        sessionReady: true,
        hydrationStatus: 'ready',
      });
      if (!eligibility.canGenerate) {
        throw new Error(eligibility.confirmNotice ?? PAGE_CONCEPT_SIGN_IN_REQUIRED);
      }
      await ensurePageConceptApiAccessToken();
      const { mobile, desktop } = getPageConceptSourceCaptures(projectId, pageId);
      if (
        !mobile?.artifactPath ||
        !desktop?.artifactPath ||
        !isPageCaptureDisplayableArtifact(mobile.artifactPath) ||
        !isPageCaptureDisplayableArtifact(desktop.artifactPath)
      ) {
        throw new Error(pageConceptCaptureConfirmBlockMessage(projectId, pageId));
      }

      const mobileCapture = await buildPageConceptCapturePayload(mobile, 'MOBILE');
      const desktopCapture = await buildPageConceptCapturePayload(desktop, 'DESKTOP');

      const result = await runPageConceptGenerationApi({
        state: loadPageConceptGenerationState(projectId, pageId),
        founderConfirmedSpend: true,
        mobileCapture,
        desktopCapture,
      });

      persist((s) => {
        let next = applyPageConceptPipelineSet(s, result.pipelineSet);
        next = registerPageConceptGenerationJobs(next, result.jobs);
        next = mergePageConceptArtifactsIntoGallery(next);
        if (next.pipelineSet?.creativeInjectionError && !next.pipelineSet.creativeInjection) {
          next = { ...next, generationStatus: 'FAILED' };
        } else if (next.pipelineSet?.gpt2AuthorityError && !next.pipelineSet.gpt2AuthorityConcept) {
          next = { ...next, generationStatus: 'FAILED' };
        }
        return next;
      });

      setOverlayMode('review');
      setExecutionError(
        result.pipelineSet.creativeInjectionError ??
          result.pipelineSet.gpt2AuthorityError ??
          null,
      );
      setGenerateClickTrace((prev) => ({ ...prev, dispatchStatus: 'complete' }));
      persist((s) => ({
        ...s,
        activeGenerationStage: 'COMPLETE',
      }));
      window.dispatchEvent(new CustomEvent('site00:page-concept-generation-updated', { detail: { projectId, pageId } }));
    } catch (e) {
      const message = e instanceof Error ? e.message : 'GENERATION_FAILED';
      setExecutionError(message);
      setOverlayMode('review');
      setGenerateClickTrace((prev) => ({
        ...prev,
        dispatchStatus: 'failed',
        lastErrorCode: message,
      }));
      emitPageConceptGenerateTelemetry('page_concept_generation_dispatch_failed', {
        projectId,
        pageId,
        generationRunId,
        errorCode: message,
      });
      recordPageConceptGenerationAttemptForensics({
        requestId: `run-${Date.now()}`,
        generationRunId,
        stage: 'GENERATION',
        endpoint: '/api/site00/page-concept-generation',
        httpStatus: null,
        errorCode: message,
        founderMessage: message,
        retryable: true,
      });
      if (message.includes('UNAUTHORIZED') || message.includes('SIGN IN')) {
        setApiSessionReady(false);
      }
      persist((s) => ({
        ...s,
        generationStatus: 'IDLE',
        lastFailure: { message, at: new Date().toISOString() },
      }));
    } finally {
      setGenerating(false);
    }
  }, [
    executionError,
    failedNbp,
    generationEligibility,
    generating,
    modalGeneratePress.canPress,
    overlayMode,
    pageId,
    persist,
    projectId,
    route,
    screenId,
    state.activeGenerationRunId,
    state.generationStatus,
  ]);

  const retryFailedGeneration = useCallback(async () => {
    if (generating) {
      setExecutionError('GENERATION ALREADY IN PROGRESS');
      return;
    }
    setGenerating(true);
    setExecutionError(null);
    try {
      await ensurePageConceptSourceCaptures(projectId, pageId, screenId);
      setCaptureHydrationStatus('ready');
      setCaptureRevision((v) => v + 1);
      await ensurePageConceptApiAccessToken();
      const current = loadPageConceptGenerationState(projectId, pageId);
      const { mobile, desktop } = getPageConceptSourceCaptures(projectId, pageId);
      if (
        !mobile?.artifactPath ||
        !desktop?.artifactPath ||
        !isPageCaptureDisplayableArtifact(mobile.artifactPath) ||
        !isPageCaptureDisplayableArtifact(desktop.artifactPath)
      ) {
        throw new Error(pageConceptCaptureConfirmBlockMessage(projectId, pageId));
      }
      setOverlayMode('progress');
      persist((s) => ({ ...s, generationStatus: 'NBP_RUNNING' }));

      const mobileCapture = await buildPageConceptCapturePayload(mobile, 'MOBILE');
      const desktopCapture = await buildPageConceptCapturePayload(desktop, 'DESKTOP');

      const result = await runPageConceptGenerationApi({
        state: current,
        founderConfirmedSpend: true,
        retryFailedOnly: true,
        mobileCapture,
        desktopCapture,
      });

      persist((s) => {
        let next = applyPageConceptPipelineSet(s, result.pipelineSet);
        next = mergePageConceptGenerationJobs(next, result.jobs);
        next = mergePageConceptArtifactsIntoGallery(next);
        return next;
      });
      setOverlayMode('review');
      window.dispatchEvent(new CustomEvent('site00:page-concept-generation-updated', { detail: { projectId, pageId } }));
    } catch (e) {
      const message = e instanceof Error ? e.message : 'RETRY_FAILED';
      setExecutionError(message);
      setOverlayMode('review');
    } finally {
      setGenerating(false);
    }
  }, [generating, pageId, persist, projectId, screenId]);

  return {
    readiness: generationEligibility.readiness,
    ready: generationEligibility.canGenerate,
    blockedReason: generationEligibility.blockerMessage,
    blockedResolution: generationEligibility.resolutionAction,
    generationEligibility,
    blockingState,
    overlayOpen,
    overlayMode,
    pendingPlan,
    generating,
    error: executionError,
    confirmNotice: blockingState.founderNotice,
    executionError,
    generationStatus: state.generationStatus,
    pipelineSet: state.pipelineSet,
    generationJobs: state.generationJobs,
    generationState: state,
    openGenerationConfirm,
    cancelGeneration,
    handleGenerateClick,
    confirmGeneration: handleGenerateClick,
    retryFailedGeneration,
    modalGeneratePress,
    generateClickTrace,
    sourceCaptureLines: generationEligibility.sourceCaptureLines,
  };
}
