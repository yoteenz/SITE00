import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  PAGE_CONCEPT_MOBILE_SELECTION_MADE_EVENT,
  type PageConceptMobileSelectionMadeDetail,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGalleryEvents.js';
import { listPageConceptCandidates } from '../../../../../shared/site00-design-workspace-production/designProjectBinding/designPageConceptModel.js';
import { refreshPageConceptGalleryFromPersistedState } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGalleryHydration.js';
import {
  pageConceptCgptManualRetryEligible,
  pageConceptHasFailedNbpJobs,
  pageConceptReviewReady,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGeneratorBinding.js';
import {
  buildPageConceptPostRunActions,
  pageConceptPostRunConfirmMessage,
  pageConceptPostRunMoreActions,
  pageConceptPostRunPrimaryAction,
  pageConceptPostRunSecondaryAction,
  resolvePageConceptNewGenerationConfirmAction,
  type PageConceptPostRunActionId,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPostRunControls.js';
import {
  archivePageConceptRunBranch,
  pageConceptRunHistoryLines,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptRunArchive.js';
import { applyPageConceptNewGenerationBranchReset } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptNewGenerationBranch.js';
import type { PageConceptViewportFamilyAction } from '../../../../../api/_lib/site00PageConcept/runPageConceptViewportFamilyAction.js';
import { pageConceptViewportFamilyActionApi } from '../../../services/pageConceptViewportFamilyClient.js';
import {
  createPageConceptGenerationRunId,
  emitPageConceptGenerateTelemetry,
  PAGE_CONCEPT_GENERATE_CLICK_TRACE_INITIAL,
  type PageConceptGenerateClickTrace,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGenerateClickTelemetry.js';
import {
  appendPageConceptLiveTraceEvent,
  formatPageConceptGenerationStatusSnapshot,
  PAGE_CONCEPT_LIVE_TRACE_INITIAL,
  type PageConceptLiveProductionTrace,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptLiveProductionTrace.js';
import { computePageConceptModalGeneratePress } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptModalGeneratePress.js';
import { pageConceptStageStatesForPanel } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptStageStatesForPanel.js';
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
import {
  loadPageConceptActiveServerRunIdForDesignPage,
  loadPageConceptGenerationStateForDesignPage,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGenerationStateDiscovery.js';
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
  tracePageConceptGenerationApi,
} from '../../../services/pageConceptGenerationClient.js';
import {
  clearPageConceptActiveServerRunId,
  fetchPageConceptGenerationRunApi,
  loadPageConceptActiveServerRunId,
  pollPageConceptGenerationRunUntilTerminal,
  savePageConceptActiveServerRunId,
  startPageConceptGenerationRunApi,
  type PageConceptGenerationRunPollUpdate,
} from '../../../services/pageConceptGenerationRunClient.js';
import {
  emptyPresentedSubstepState,
  mergeSnapshotSubstepsWithPresented,
  presentPageConceptProgressEvents,
  type PageConceptPresentedSubstepState,
} from '../../../services/pageConceptProgressEventPresentation.js';
import { mergeCgptSubstepDetailIntoEventMap } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProgressEvents.js';
import {
  clearPageConceptFounderRunSession,
  loadPageConceptFounderRunSession,
  markPageConceptFounderRunSession,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptFounderRunSession.js';
import { normalizePageConceptStateOnPanelMount } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptHydrationNormalize.js';
import {
  derivePageConceptRunHealth,
  isPageConceptPipelineExecutionActive,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptRunHealth.js';
import {
  PAGE_CONCEPT_PROGRESS_OBSERVATION_FORENSICS_INITIAL,
  type PageConceptProgressObservationForensics,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProgressObservationForensics.js';
import type { PageConceptServerRunSnapshot } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptServerRun.js';
import { pageConceptServerRunIsTerminal } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptServerRun.js';
import { pageConceptServerRunToResult } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptServerRun.js';
import { pageConceptChainGpt2MobileAfterCgptReviewGate } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCanonicalPipeline.js';
import type { PageConceptGenerationRunResult } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import { site00ApiUrl } from '../../../../utils/site00ApiBase.js';
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
  const snapshotBacked =
    record.source === 'IMPLEMENTATION_SNAPSHOT_API' ||
    record.captureId.startsWith('snap-') ||
    (path.startsWith('http') && !path.includes('blob:'));
  if (snapshotBacked && !path.startsWith('data:') && !path.startsWith('blob:')) {
    return {
      captureId: record.captureId,
      snapshotId: record.captureId,
      viewport,
      ...dims,
      ...(path.startsWith('http') || path.startsWith('/') ?
        { artifactUrl: resolveCaptureArtifactUrl(path) }
      : {}),
    };
  }
  if (path.startsWith('data:') || path.startsWith('blob:')) {
    return {
      captureId: record.captureId,
      viewport,
      ...dims,
      artifactBase64: await artifactPathToBase64(path),
    };
  }
  return {
    captureId: record.captureId,
    viewport,
    ...dims,
    artifactUrl: resolveCaptureArtifactUrl(path),
  };
}

function mergeTerminalRunResultIntoState(
  state: PageConceptGenerationState,
  terminalRun: PageConceptServerRunSnapshot,
  result: PageConceptGenerationRunResult,
  options?: { mergeJobsOnly?: boolean },
): PageConceptGenerationState {
  let next = applyPageConceptPipelineSet(state, result.pipelineSet);
  next =
    options?.mergeJobsOnly ?
      mergePageConceptGenerationJobs(next, result.jobs)
    : registerPageConceptGenerationJobs(next, result.jobs);
  next = mergePageConceptArtifactsIntoGallery(next);
  if (terminalRun.generationStatus === 'GPT2_AWAITING_FOUNDER_REVIEW') {
    next = { ...next, generationStatus: 'GPT2_AWAITING_FOUNDER_REVIEW' };
  } else if (terminalRun.generationStatus === 'CGPT_AWAITING_FOUNDER_REVIEW') {
    next = { ...next, generationStatus: 'CGPT_AWAITING_FOUNDER_REVIEW' };
  } else if (terminalRun.generationStatus === 'GPT2_MOBILE_AWAITING_SELECTION') {
    next = { ...next, generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION' };
  } else if (next.pipelineSet?.creativeInjectionError && !next.pipelineSet.creativeInjection) {
    next = { ...next, generationStatus: 'FAILED' };
  } else if (next.pipelineSet?.gpt2AuthorityError && !next.pipelineSet.gpt2AuthorityConcept) {
    next = { ...next, generationStatus: 'FAILED' };
  }
  return next;
}

function applyServerRunSnapshotToState(
  run: PageConceptServerRunSnapshot,
  persist: (fn: (s: PageConceptGenerationState) => PageConceptGenerationState) => void,
  presentedSubsteps?: PageConceptPresentedSubstepState | null,
): void {
  persist((s) => {
    let next = s;
    if (run.pipelineSet) {
      next = applyPageConceptPipelineSet(next, run.pipelineSet);
    }
    if (run.jobs.length > 0) {
      next = mergePageConceptGenerationJobs(next, run.jobs);
      next = mergePageConceptArtifactsIntoGallery(next);
    }
    if (run.pipelineSet?.mobileConcepts?.length) {
      next = {
        ...next,
        pipelineSet: next.pipelineSet ?
          {
            ...next.pipelineSet,
            ...run.pipelineSet,
            mobileConcepts: run.pipelineSet.mobileConcepts,
          }
        : run.pipelineSet,
      };
      next = mergePageConceptArtifactsIntoGallery(next);
    }
    const snapshotMap =
      run.panelProgress?.substepStatusById ??
      mergeCgptSubstepDetailIntoEventMap(run.cgptSubsteps);
    const substepStatusById =
      presentedSubsteps && run.panelProgress ?
        mergeSnapshotSubstepsWithPresented(snapshotMap, presentedSubsteps)
      : run.panelProgress?.substepStatusById ?? next.liveProgress?.substepStatusById;
    const liveProgress =
      run.panelProgress ?
        { ...run.panelProgress, substepStatusById: substepStatusById ?? run.panelProgress.substepStatusById }
      : next.liveProgress;
    return {
      ...next,
      generationStatus: run.generationStatus,
      activeGenerationRunId: run.runId,
      activeGenerationStage: run.currentStage,
      liveProgress,
      cgptSubsteps: run.cgptSubsteps ?? next.cgptSubsteps,
    };
  });
}

export function usePageConceptGeneration(
  projectId: string,
  pageId: string,
  screenId: string,
  route?: string | null,
) {
  const [state, setState] = useState<PageConceptGenerationState>(() =>
    loadPageConceptGenerationStateForDesignPage({
      projectSlug: projectId,
      pageId,
      screenId,
      route: route ?? null,
    }),
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
  const [liveProductionTrace, setLiveProductionTrace] = useState<PageConceptLiveProductionTrace>(
    PAGE_CONCEPT_LIVE_TRACE_INITIAL,
  );
  const [progressForensics, setProgressForensics] = useState<PageConceptProgressObservationForensics>(
    PAGE_CONCEPT_PROGRESS_OBSERVATION_FORENSICS_INITIAL,
  );
  const [presentedSubstepStates, setPresentedSubstepStates] =
    useState<PageConceptPresentedSubstepState>(() => emptyPresentedSubstepState());
  const [consoleFocusViewport, setConsoleFocusViewport] = useState<'MOBILE' | 'TABLET' | 'DESKTOP' | null>(
    null,
  );
  const lastObservedSequenceRef = useRef(0);
  const presentationEpochRef = useRef(0);
  const presentedSubstepStatesRef = useRef<PageConceptPresentedSubstepState>(emptyPresentedSubstepState());

  useEffect(() => {
    const founderSession = loadPageConceptFounderRunSession(projectId, pageId);
    const rawLoaded = loadPageConceptGenerationStateForDesignPage({
      projectSlug: projectId,
      pageId,
      screenId,
      route: route ?? null,
    });
    if (!founderSession) {
      const hasPersistedMobileArtifacts =
        rawLoaded.generationJobs.some((j) => j.provider === 'GPT2_MOBILE') ||
        (rawLoaded.pipelineSet?.mobileConcepts?.length ?? 0) > 0;
      if (!hasPersistedMobileArtifacts) {
        clearPageConceptActiveServerRunId(projectId, pageId);
      }
    }
    const loaded = normalizePageConceptStateOnPanelMount(rawLoaded, Boolean(founderSession));
    if (loaded !== rawLoaded) {
      savePageConceptGenerationState(loaded);
    }
    setState(loaded);
    setPendingPlan(null);
    setOverlayOpen(false);
    setOverlayMode(pageConceptReviewReady(loaded.generationStatus) ? 'review' : 'confirm');
    setExecutionError(null);
    setGenerating(false);
    setCaptureHydrationStatus('checking');
    const emptyPresented = emptyPresentedSubstepState();
    setPresentedSubstepStates(emptyPresented);
    presentedSubstepStatesRef.current = emptyPresented;
    lastObservedSequenceRef.current = 0;
    setProgressForensics({
      ...PAGE_CONCEPT_PROGRESS_OBSERVATION_FORENSICS_INITIAL,
      founderStartConfirmed: Boolean(founderSession),
      runId: founderSession?.runId ?? loaded.activeGenerationRunId,
      autoStart: false,
    });
    refreshPageConceptGalleryFromPersistedState(projectId, pageId, { screenId, route: route ?? null });
    window.dispatchEvent(
      new CustomEvent('site00:page-concept-generation-updated', { detail: { projectId, pageId } }),
    );
  }, [pageId, projectId, route, screenId]);

  useEffect(() => {
    const onUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ projectId?: string; pageId?: string }>).detail;
      if (!designPageCaptureEventMatches(projectId, pageId, detail)) return;
      const loaded = loadPageConceptGenerationStateForDesignPage({
        projectSlug: projectId,
        pageId,
        screenId,
        route: route ?? null,
      });
      setState(loaded);
      refreshPageConceptGalleryFromPersistedState(projectId, pageId, { screenId, route: route ?? null });
      if (pageConceptReviewReady(loaded.generationStatus)) setOverlayMode('review');
    };
    window.addEventListener('site00:page-concept-generation-updated', onUpdated);
    return () => window.removeEventListener('site00:page-concept-generation-updated', onUpdated);
  }, [pageId, projectId, route, screenId]);

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
    if (captureHydrationStatus !== 'ready') return;
    const loaded = loadPageConceptGenerationState(projectId, pageId);
    setExecutionError((prev) =>
      sanitizePageConceptExecutionError(
        generationEligibility,
        prev ?? loaded.lastFailure?.message ?? null,
      ),
    );
  }, [captureHydrationStatus, generationEligibility, pageId, projectId]);

  const blockingState: PageConceptGenerationBlockingState = useMemo(
    () =>
      derivePageConceptGenerationBlockingState({
        eligibility: generationEligibility,
        executionError,
        mode: overlayMode,
        generationState: state,
        generating,
      }),
    [executionError, generationEligibility, generating, overlayMode, state],
  );

  const failedNbp = pageConceptHasFailedNbpJobs(state);
  const cgptRetryEligible = pageConceptCgptManualRetryEligible(state);
  const requestNewPageConceptGenerationRef = useRef<(() => Promise<void>) | null>(null);

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
        refreshPageConceptGalleryFromPersistedState(projectId, pageId, { screenId, route: route ?? null });
        window.dispatchEvent(
          new CustomEvent('site00:page-concept-generation-updated', { detail: { projectId, pageId } }),
        );
        return next;
      });
    },
    [pageId, projectId, route, screenId],
  );

  useEffect(() => {
    let cancelled = false;
    const loaded = loadPageConceptGenerationStateForDesignPage({
      projectSlug: projectId,
      pageId,
      screenId,
      route: route ?? null,
    });
    const hasReadyMobile =
      (loaded.pipelineSet?.mobileConcepts?.some((c) => c.status === 'READY') ?? false) ||
      loaded.generationJobs.some((j) => j.provider === 'GPT2_MOBILE' && j.status === 'READY');
    if (hasReadyMobile) return;

    const runId = loadPageConceptActiveServerRunIdForDesignPage({
      projectSlug: projectId,
      pageId,
      screenId,
      route: route ?? null,
    });
    if (!runId) return;

    void (async () => {
      try {
        await ensurePageConceptApiAccessToken();
        const first = await fetchPageConceptGenerationRunApi(runId, 0, { projectId, pageId });
        if (cancelled) return;
        applyServerRunSnapshotToState(first.run, persist);
        savePageConceptGenerationState(
          loadPageConceptGenerationStateForDesignPage({
            projectSlug: projectId,
            pageId,
            screenId,
            route: route ?? null,
          }),
        );
        refreshPageConceptGalleryFromPersistedState(projectId, pageId, { screenId, route: route ?? null });
        window.dispatchEvent(
          new CustomEvent('site00:page-concept-generation-updated', { detail: { projectId, pageId } }),
        );
      } catch {
        /* gallery remains empty until founder opens generator */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pageId, persist, projectId, route, screenId]);

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

  const applyPollUpdate = useCallback(
    async (update: PageConceptGenerationRunPollUpdate, cancelled: () => boolean) => {
      const epoch = ++presentationEpochRef.current;
      setProgressForensics((prev) => ({
        ...prev,
        runId: update.run.runId,
        runCreatedAt: update.run.createdAt ?? prev.runCreatedAt,
        runStatus: update.run.status,
        currentStage: update.run.currentStage,
        currentSubstep:
          update.run.currentCgptSubstep ??
          update.run.panelProgress?.currentSubstep ??
          null,
        latestEventSequence: update.latestSequence,
        clientObservedSequence: lastObservedSequenceRef.current,
        unreadEventCount: update.progressEvents.length,
        lastPollAt: new Date().toISOString(),
        autoStart: false,
      }));

      let presented = presentedSubstepStatesRef.current;
      if (update.progressEvents.length > 0) {
        presented = await presentPageConceptProgressEvents({
          events: update.progressEvents,
          initialMap: presentedSubstepStatesRef.current,
          onMapUpdate: (map) => {
            if (cancelled() || presentationEpochRef.current !== epoch) return;
            presentedSubstepStatesRef.current = map;
            setPresentedSubstepStates(map);
          },
          isCancelled: () => cancelled() || presentationEpochRef.current !== epoch,
        });
        if (!cancelled() && presentationEpochRef.current === epoch) {
          presentedSubstepStatesRef.current = presented;
          setPresentedSubstepStates(presented);
          lastObservedSequenceRef.current = Math.max(
            lastObservedSequenceRef.current,
            update.latestSequence,
          );
        }
      }

      if (!cancelled()) {
        applyServerRunSnapshotToState(update.run, persist, presented);
        window.dispatchEvent(
          new CustomEvent('site00:page-concept-generation-updated', { detail: { projectId, pageId } }),
        );
        if (
          isPageConceptPipelineExecutionActive({
            generationStatus: update.run.generationStatus,
            generating: true,
          })
        ) {
          setExecutionError(null);
          persist((s) =>
            s.lastFailure?.message && s.generationStatus !== 'IDLE' ?
              { ...s, lastFailure: null }
            : s,
          );
        }
        if (
          update.run.generationStatus === 'GPT2_AWAITING_FOUNDER_REVIEW' ||
          update.run.generationStatus === 'CGPT_AWAITING_FOUNDER_REVIEW' ||
          update.run.generationStatus === 'GPT2_MOBILE_AWAITING_SELECTION'
        ) {
          setGenerating(false);
          setOverlayMode('review');
        }
      }
    },
    [pageId, persist, projectId],
  );

  useEffect(() => {
    const founderSession = loadPageConceptFounderRunSession(projectId, pageId);
    const runId = founderSession?.runId ?? null;
    if (!founderSession || !runId || generating) return;

    let cancelled = false;
    const isCancelled = () => cancelled;

    void (async () => {
      try {
        await ensurePageConceptApiAccessToken();
        const first = await fetchPageConceptGenerationRunApi(runId, lastObservedSequenceRef.current);
        if (cancelled) return;
        if (pageConceptServerRunIsTerminal(first.run.status)) {
          clearPageConceptActiveServerRunId(projectId, pageId);
          clearPageConceptFounderRunSession(projectId, pageId);
          await applyPollUpdate(first, isCancelled);
          setOverlayMode('review');
          return;
        }
        setGenerating(true);
        setOverlayMode('progress');
        setProgressForensics((prev) => ({
          ...prev,
          founderStartConfirmed: true,
          runId,
          autoStart: false,
        }));
        await applyPollUpdate(first, isCancelled);
        const terminalRun = await pollPageConceptGenerationRunUntilTerminal({
          runId,
          projectId,
          pageId,
          afterSequence: lastObservedSequenceRef.current,
          onUpdate: (update) => {
            void applyPollUpdate(update, isCancelled);
          },
        });
        if (!cancelled) {
          clearPageConceptActiveServerRunId(projectId, pageId);
          clearPageConceptFounderRunSession(projectId, pageId);
          setOverlayMode(pageConceptServerRunIsTerminal(terminalRun.status) ? 'review' : 'confirm');
        }
      } catch {
        if (!cancelled) clearPageConceptActiveServerRunId(projectId, pageId);
      } finally {
        if (!cancelled) setGenerating(false);
      }
    })();
    return () => {
      cancelled = true;
      presentationEpochRef.current += 1;
    };
  }, [applyPollUpdate, generating, pageId, projectId]);

  const openGenerationReview = useCallback(() => {
    setOverlayOpen(true);
    setOverlayMode('review');
  }, []);

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

  const openGenerationConsole = useCallback(
    async (focusViewport: 'MOBILE' | 'TABLET' | 'DESKTOP' = 'MOBILE') => {
      setConsoleFocusViewport(focusViewport);
      if (generating) {
        setOverlayOpen(true);
        setOverlayMode('progress');
        return;
      }
      const loaded = loadPageConceptGenerationStateForDesignPage({
        projectSlug: projectId,
        pageId,
        screenId,
        route: route ?? null,
      });
      const hasMobileConcepts = (loaded.pipelineSet?.mobileConcepts?.length ?? 0) > 0;
      const hasInterpretations = loaded.generationJobs.some(
        (j) => j.provider === 'GPT2_TABLET' || j.provider === 'GPT2_DESKTOP',
      );
      if (
        focusViewport !== 'MOBILE' ||
        pageConceptReviewReady(loaded.generationStatus) ||
        hasMobileConcepts ||
        hasInterpretations
      ) {
        openGenerationReview();
        return;
      }
      await openGenerationConfirm();
    },
    [generating, openGenerationConfirm, openGenerationReview, pageId, projectId, route, screenId],
  );

  const cancelGeneration = useCallback(() => {
    if (generating) return;
    setPendingPlan(null);
    setOverlayOpen(false);
    setExecutionError(null);
  }, [generating]);

  const handleGenerateClick = useCallback(async () => {
    const clickAt = new Date().toISOString();
    const sessionToken = await getAccessToken();
    const sessionPresent = Boolean(sessionToken);
    const stateBefore = formatPageConceptGenerationStatusSnapshot(state.generationStatus, generating);

    setLiveProductionTrace((prev) =>
      appendPageConceptLiveTraceEvent(
        { ...prev, sessionPresent, stateBefore, apiRequestUrl: site00ApiUrl('/api/site00/page-concept-generation') },
        'CLICK_RECEIVED',
        `canPress=${modalGeneratePress.canPress} canGenerate=${generationEligibility.canGenerate}`,
      ),
    );

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
      sessionPresentAtClick: sessionPresent,
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
    setLiveProductionTrace((prev) => appendPageConceptLiveTraceEvent(prev, 'PREFLIGHT_STARTED'));
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

    if (press.intendedAction === 'new_branch') {
      if (press.blockReason) {
        setExecutionError(press.blockReason);
        setGenerateClickTrace((prev) => ({
          ...prev,
          preflightStatus: 'failed',
          lastErrorCode: press.blockReason,
        }));
        emitPageConceptGenerateTelemetry('page_concept_generate_preflight_failed', {
          projectId,
          pageId,
          errorCode: press.blockReason ?? 'NEW_BRANCH_BLOCKED',
        });
        return;
      }
      await requestNewPageConceptGenerationRef.current?.();
      return;
    }

    if (press.blockReason) {
      setExecutionError(press.blockReason);
      setGenerateClickTrace((prev) => ({
        ...prev,
        preflightStatus: 'failed',
        lastErrorCode: press.blockReason,
      }));
      emitPageConceptGenerateTelemetry('page_concept_generate_preflight_failed', {
        projectId,
        pageId,
        errorCode: press.blockReason ?? 'PREFLIGHT_BLOCKED',
      });
      return;
    }

    emitPageConceptGenerateTelemetry('page_concept_generate_preflight_passed', { projectId, pageId });
    setLiveProductionTrace((prev) =>
      appendPageConceptLiveTraceEvent(prev, 'PREFLIGHT_PASSED', press.intendedAction),
    );
    setGenerateClickTrace((prev) => ({
      ...prev,
      preflightStatus: 'passed',
      preflightResult: press.intendedAction,
    }));

    const generationRunId = createPageConceptGenerationRunId(projectId, pageId);
    const startedAt = new Date().toISOString();
    let stateAfterFlush = stateBefore;
    let renderedStage = 'CGPT=PENDING';
    flushSync(() => {
      setGenerating(true);
      setExecutionError(null);
      setOverlayMode('progress');
      setGenerateClickTrace((prev) => ({
        ...prev,
        generationRunId,
        dispatchStatus: 'started',
        lastErrorCode: null,
        stateSetCgptRunning: true,
      }));
      persist((s) => {
        stateAfterFlush = formatPageConceptGenerationStatusSnapshot('CGPT_RUNNING', true);
        const next = {
          ...s,
          generationStatus: 'CGPT_RUNNING' as const,
          activeGenerationRunId: generationRunId,
          activeGenerationRunStartedAt: startedAt,
          activeGenerationStage: 'CGPT_STARTING',
        };
        const chips = pageConceptStageStatesForPanel({ state: next, generating: true, mode: 'progress' });
        renderedStage = `CGPT=${chips.CGPT} GPT2=${chips.GPT2} NBP=${chips.NBP}`;
        return next;
      });
    });
    setGenerateClickTrace((prev) => ({ ...prev, renderedStageAtClick: renderedStage }));
    setLiveProductionTrace((prev) =>
      appendPageConceptLiveTraceEvent(
        {
          ...prev,
          stateAfter: stateAfterFlush,
          renderedStage,
        },
        'STATE_SET_CGPT_RUNNING',
        renderedStage,
      ),
    );
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

      setLiveProductionTrace((prev) => appendPageConceptLiveTraceEvent(prev, 'API_TRACE_STARTED'));
      const traceResult = await tracePageConceptGenerationApi({
        state: loadPageConceptGenerationState(projectId, pageId),
        mobileCapture,
        desktopCapture,
      });
      const tracePayload =
        traceResult.receipt.data && typeof traceResult.receipt.data === 'object' ?
          (traceResult.receipt.data as {
            readiness?: string;
            error?: string;
            mobileCaptureId?: string;
            desktopCaptureId?: string;
            serverCaptureValidation?: string;
          })
        : null;
      setLiveProductionTrace((prev) => ({
        ...appendPageConceptLiveTraceEvent(
          prev,
          'API_TRACE_COMPLETE',
          `status=${traceResult.receipt.status}`,
        ),
        apiRequestSent: true,
        apiStatus: traceResult.receipt.status,
        apiDurationMs: traceResult.receipt.receipt.requestDurationMs,
        apiErrorCode: traceResult.receipt.errorCode,
        apiResponseSummary:
          traceResult.receipt.data && typeof traceResult.receipt.data === 'object' ?
            [
              String((traceResult.receipt.data as { readiness?: string }).readiness ?? 'trace_ok'),
              tracePayload?.mobileCaptureId ? `mobile=${tracePayload.mobileCaptureId}` : null,
              tracePayload?.desktopCaptureId ? `desktop=${tracePayload.desktopCaptureId}` : null,
              tracePayload?.serverCaptureValidation ?
                `capture_validation=${tracePayload.serverCaptureValidation}`
              : null,
            ]
              .filter(Boolean)
              .join(' · ')
          : traceResult.receipt.receipt.errorMessage ?? null,
        dryRunUsed: true,
      }));
      emitPageConceptGenerateTelemetry('page_concept_generation_trace_api_complete', {
        projectId,
        pageId,
        generationRunId,
        errorCode: traceResult.receipt.errorCode,
      });
      if (!traceResult.ok) {
        throw new Error(
          traceResult.receipt.receipt.errorMessage ??
            traceResult.receipt.errorCode ??
            'GENERATION COULD NOT START · API TRACE FAILED',
        );
      }
      if (tracePayload?.readiness && tracePayload.readiness !== 'READY_FOR_PROVIDER_DISPATCH') {
        throw new Error(`GENERATION COULD NOT START · ${tracePayload.error ?? tracePayload.readiness}`);
      }
      if (tracePayload?.error) {
        throw new Error(`GENERATION COULD NOT START · ${tracePayload.error}`);
      }

      emitPageConceptGenerateTelemetry('page_concept_founder_generation_confirmed', {
        projectId,
        pageId,
        generationRunId,
      });
      setProgressForensics((prev) => ({
        ...prev,
        founderStartConfirmed: true,
        runId: generationRunId,
        autoStart: false,
      }));

      setLiveProductionTrace((prev) => appendPageConceptLiveTraceEvent(prev, 'API_START_REQUEST'));
      const startResult = await startPageConceptGenerationRunApi({
        state: loadPageConceptGenerationState(projectId, pageId),
        founderConfirmedSpend: true,
        mobileCapture,
        desktopCapture,
      });
      savePageConceptActiveServerRunId(projectId, pageId, startResult.runId);
      markPageConceptFounderRunSession(projectId, pageId, startResult.runId);
      setLiveProductionTrace((prev) =>
        appendPageConceptLiveTraceEvent(
          { ...prev, apiRequestSent: true, apiStatus: 202, apiResponseSummary: `runId=${startResult.runId}` },
          'API_START_ACCEPTED',
          startResult.runId,
        ),
      );

      let terminalRun = await pollPageConceptGenerationRunUntilTerminal({
        runId: startResult.runId,
        projectId,
        pageId,
        afterSequence: lastObservedSequenceRef.current,
        onUpdate: (update) => {
          void applyPollUpdate(update, () => false);
          setLiveProductionTrace((prev) =>
            appendPageConceptLiveTraceEvent(
              prev,
              'RUN_STATUS',
              `${update.run.status} · ${update.run.currentStage ?? '—'}`,
            ),
          );
        },
      });

      if (
        terminalRun.generationStatus === 'CGPT_AWAITING_FOUNDER_REVIEW' &&
        pageConceptChainGpt2MobileAfterCgptReviewGate()
      ) {
        persist((s) => ({ ...s, generationStatus: 'GPT2_RUNNING' }));
        const { runId: gpt2RunId } = await startPageConceptGenerationRunApi({
          state: loadPageConceptGenerationState(projectId, pageId),
          founderConfirmedSpend: true,
          continueGpt2AfterCgptReview: true,
          resumeRunId: startResult.runId,
          mobileCapture,
          desktopCapture,
        });
        savePageConceptActiveServerRunId(projectId, pageId, gpt2RunId);
        markPageConceptFounderRunSession(projectId, pageId, gpt2RunId);
        terminalRun = await pollPageConceptGenerationRunUntilTerminal({
          runId: gpt2RunId,
          projectId,
          pageId,
          afterSequence: lastObservedSequenceRef.current,
          onUpdate: (update) => {
            void applyPollUpdate(update, () => false);
            setLiveProductionTrace((prev) =>
              appendPageConceptLiveTraceEvent(
                prev,
                'RUN_STATUS',
                `${update.run.status} · ${update.run.currentStage ?? '—'}`,
              ),
            );
          },
        });
      }

      const result = pageConceptServerRunToResult(terminalRun);
      if (!result) {
        throw new Error(terminalRun.error ?? `GENERATION ${terminalRun.status}`);
      }

      persist((s) => mergeTerminalRunResultIntoState(s, terminalRun, result));

      if (terminalRun.generationStatus === 'GPT2_AWAITING_FOUNDER_REVIEW') {
        setOverlayMode('review');
        setExecutionError(null);
        setGenerateClickTrace((prev) => ({ ...prev, dispatchStatus: 'complete' }));
        window.dispatchEvent(
          new CustomEvent('site00:page-concept-generation-updated', { detail: { projectId, pageId } }),
        );
        return;
      }

      if (terminalRun.generationStatus === 'CGPT_AWAITING_FOUNDER_REVIEW') {
        savePageConceptActiveServerRunId(projectId, pageId, startResult.runId);
        markPageConceptFounderRunSession(projectId, pageId, startResult.runId);
        setOverlayMode('review');
        setExecutionError(null);
        setGenerateClickTrace((prev) => ({ ...prev, dispatchStatus: 'complete' }));
        window.dispatchEvent(
          new CustomEvent('site00:page-concept-generation-updated', { detail: { projectId, pageId } }),
        );
        return;
      }

      clearPageConceptActiveServerRunId(projectId, pageId);
      clearPageConceptFounderRunSession(projectId, pageId);

      setOverlayMode('review');
      setExecutionError(
        result.pipelineSet.creativeInjectionError ??
          result.pipelineSet.gpt2AuthorityError ??
          null,
      );
      setGenerateClickTrace((prev) => ({ ...prev, dispatchStatus: 'complete' }));
      setLiveProductionTrace((prev) =>
        appendPageConceptLiveTraceEvent(
          { ...prev, apiRequestSent: true, apiStatus: 200, apiResponseSummary: 'generate_ok' },
          'API_DISPATCH_COMPLETE',
        ),
      );
      persist((s) => ({
        ...s,
        activeGenerationStage: 'COMPLETE',
      }));
      window.dispatchEvent(new CustomEvent('site00:page-concept-generation-updated', { detail: { projectId, pageId } }));
    } catch (e) {
      const raw = e instanceof Error ? e.message : 'GENERATION_FAILED';
      const message = raw.startsWith('GENERATION COULD NOT START') ? raw : `GENERATION COULD NOT START · ${raw}`;
      setExecutionError(message);
      setLiveProductionTrace((prev) =>
        appendPageConceptLiveTraceEvent(
          {
            ...prev,
            apiRequestSent: prev.apiRequestSent || true,
            apiErrorCode: raw,
            apiResponseSummary: message,
          },
          'API_DISPATCH_FAILED',
          raw,
        ),
      );
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

  const retryCgptGeneration = useCallback(async () => {
    if (generating) {
      setExecutionError('GENERATION ALREADY IN PROGRESS');
      return;
    }
    const resumeRunId = state.activeGenerationRunId ?? loadPageConceptActiveServerRunId(projectId, pageId);
    if (!resumeRunId) {
      setExecutionError('CGPT RETRY REQUIRES ACTIVE GENERATION RUN');
      return;
    }
    setGenerating(true);
    setExecutionError(null);
    setOverlayMode('progress');
    try {
      await ensurePageConceptSourceCaptures(projectId, pageId, screenId);
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
      const mobileCapture = await buildPageConceptCapturePayload(mobile, 'MOBILE');
      const desktopCapture = await buildPageConceptCapturePayload(desktop, 'DESKTOP');
      persist((s) => ({ ...s, generationStatus: 'CGPT_RUNNING' }));

      const { runId } = await startPageConceptGenerationRunApi({
        state: current,
        founderConfirmedSpend: true,
        retryCgptOnly: true,
        resumeRunId,
        mobileCapture,
        desktopCapture,
      });
      savePageConceptActiveServerRunId(projectId, pageId, runId);
      markPageConceptFounderRunSession(projectId, pageId, runId);
      emitPageConceptGenerateTelemetry('page_concept_founder_generation_confirmed', {
        projectId,
        pageId,
        generationRunId: runId,
      });
      const terminalRun = await pollPageConceptGenerationRunUntilTerminal({
        runId,
        projectId,
        pageId,
        afterSequence: lastObservedSequenceRef.current,
        onUpdate: (update) => {
          void applyPollUpdate(update, () => false);
        },
      });
      clearPageConceptActiveServerRunId(projectId, pageId);
      clearPageConceptFounderRunSession(projectId, pageId);
      const result = pageConceptServerRunToResult(terminalRun);
      if (!result) throw new Error(terminalRun.error ?? 'CGPT_RETRY_FAILED');

      persist((s) => {
        let next = applyPageConceptPipelineSet(s, result.pipelineSet);
        next = registerPageConceptGenerationJobs(next, result.jobs);
        next = mergePageConceptArtifactsIntoGallery(next);
        return next;
      });
      setOverlayMode('review');
      setExecutionError(result.pipelineSet.creativeInjectionError ?? null);
      window.dispatchEvent(new CustomEvent('site00:page-concept-generation-updated', { detail: { projectId, pageId } }));
    } catch (e) {
      const message = e instanceof Error ? e.message : 'CGPT_RETRY_FAILED';
      setExecutionError(message);
      setOverlayMode('review');
    } finally {
      setGenerating(false);
    }
  }, [generating, pageId, persist, projectId, screenId, state.activeGenerationRunId]);

  const continueGpt2AfterCgptReview = useCallback(async () => {
    if (generating) {
      setExecutionError('GENERATION ALREADY IN PROGRESS');
      return;
    }
    const resumeRunId =
      state.activeGenerationRunId ?? loadPageConceptActiveServerRunId(projectId, pageId);
    if (!resumeRunId) {
      setExecutionError('CONTINUE TO GPT2 REQUIRES ACTIVE GENERATION RUN');
      return;
    }
    setGenerating(true);
    setExecutionError(null);
    setOverlayMode('progress');
    try {
      await ensurePageConceptSourceCaptures(projectId, pageId, screenId);
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
      const mobileCapture = await buildPageConceptCapturePayload(mobile, 'MOBILE');
      const desktopCapture = await buildPageConceptCapturePayload(desktop, 'DESKTOP');
      persist((s) => ({ ...s, generationStatus: 'GPT2_RUNNING' }));

      emitPageConceptGenerateTelemetry('page_concept_founder_generation_confirmed', {
        projectId,
        pageId,
        generationRunId: resumeRunId,
      });

      const { runId } = await startPageConceptGenerationRunApi({
        state: current,
        founderConfirmedSpend: true,
        continueGpt2AfterCgptReview: true,
        resumeRunId,
        mobileCapture,
        desktopCapture,
      });
      savePageConceptActiveServerRunId(projectId, pageId, runId);
      markPageConceptFounderRunSession(projectId, pageId, runId);

      const terminalRun = await pollPageConceptGenerationRunUntilTerminal({
        runId,
        projectId,
        pageId,
        afterSequence: lastObservedSequenceRef.current,
        onUpdate: (update) => {
          void applyPollUpdate(update, () => false);
        },
      });
      clearPageConceptActiveServerRunId(projectId, pageId);
      clearPageConceptFounderRunSession(projectId, pageId);
      const result = pageConceptServerRunToResult(terminalRun);
      if (!result) throw new Error(terminalRun.error ?? 'GPT2_CONTINUE_FAILED');

      persist((s) => {
        let next = applyPageConceptPipelineSet(s, result.pipelineSet);
        next = registerPageConceptGenerationJobs(next, result.jobs);
        next = mergePageConceptArtifactsIntoGallery(next);
        return next;
      });
      setOverlayMode('review');
      window.dispatchEvent(
        new CustomEvent('site00:page-concept-generation-updated', { detail: { projectId, pageId } }),
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : 'GPT2_CONTINUE_FAILED';
      setExecutionError(message);
      setOverlayMode('review');
    } finally {
      setGenerating(false);
    }
  }, [applyPollUpdate, generating, pageId, persist, projectId, screenId, state.activeGenerationRunId]);

  const continueNbpAfterGpt2Review = useCallback(async () => {
    if (generating) {
      setExecutionError('GENERATION ALREADY IN PROGRESS');
      return;
    }
    const resumeRunId =
      state.activeGenerationRunId ?? loadPageConceptActiveServerRunId(projectId, pageId);
    if (!resumeRunId) {
      setExecutionError('CONTINUE TO NBP REQUIRES ACTIVE GENERATION RUN');
      return;
    }
    setGenerating(true);
    setExecutionError(null);
    setOverlayMode('progress');
    try {
      await ensurePageConceptSourceCaptures(projectId, pageId, screenId);
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
      const mobileCapture = await buildPageConceptCapturePayload(mobile, 'MOBILE');
      const desktopCapture = await buildPageConceptCapturePayload(desktop, 'DESKTOP');
      persist((s) => ({ ...s, generationStatus: 'NBP_RUNNING' }));

      emitPageConceptGenerateTelemetry('page_concept_founder_generation_confirmed', {
        projectId,
        pageId,
        generationRunId: resumeRunId,
      });

      const { runId } = await startPageConceptGenerationRunApi({
        state: current,
        founderConfirmedSpend: true,
        continueNbpAfterGpt2Review: true,
        resumeRunId,
        mobileCapture,
        desktopCapture,
      });
      savePageConceptActiveServerRunId(projectId, pageId, runId);
      markPageConceptFounderRunSession(projectId, pageId, runId);

      const terminalRun = await pollPageConceptGenerationRunUntilTerminal({
        runId,
        projectId,
        pageId,
        afterSequence: lastObservedSequenceRef.current,
        onUpdate: (update) => {
          void applyPollUpdate(update, () => false);
        },
      });
      clearPageConceptActiveServerRunId(projectId, pageId);
      clearPageConceptFounderRunSession(projectId, pageId);
      const result = pageConceptServerRunToResult(terminalRun);
      if (!result) throw new Error(terminalRun.error ?? 'NBP_CONTINUE_FAILED');

      persist((s) => {
        let next = applyPageConceptPipelineSet(s, result.pipelineSet);
        next = registerPageConceptGenerationJobs(next, result.jobs);
        next = mergePageConceptArtifactsIntoGallery(next);
        return next;
      });
      setOverlayMode('review');
      window.dispatchEvent(
        new CustomEvent('site00:page-concept-generation-updated', { detail: { projectId, pageId } }),
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : 'NBP_CONTINUE_FAILED';
      setExecutionError(message);
      setOverlayMode('review');
    } finally {
      setGenerating(false);
    }
  }, [applyPollUpdate, generating, pageId, persist, projectId, screenId, state.activeGenerationRunId]);

  const runHealth = useMemo(
    () =>
      derivePageConceptRunHealth({
        state,
        generating,
        executionError,
      }),
    [executionError, generating, state],
  );

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

      const { runId } = await startPageConceptGenerationRunApi({
        state: current,
        founderConfirmedSpend: true,
        retryFailedOnly: true,
        mobileCapture,
        desktopCapture,
      });
      savePageConceptActiveServerRunId(projectId, pageId, runId);
      markPageConceptFounderRunSession(projectId, pageId, runId);
      emitPageConceptGenerateTelemetry('page_concept_founder_generation_confirmed', {
        projectId,
        pageId,
        generationRunId: runId,
      });
      const terminalRun = await pollPageConceptGenerationRunUntilTerminal({
        runId,
        projectId,
        pageId,
        afterSequence: lastObservedSequenceRef.current,
        onUpdate: (update) => {
          void applyPollUpdate(update, () => false);
        },
      });
      clearPageConceptActiveServerRunId(projectId, pageId);
      clearPageConceptFounderRunSession(projectId, pageId);
      const result = pageConceptServerRunToResult(terminalRun);
      if (!result) throw new Error(terminalRun.error ?? 'RETRY_FAILED');

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

  const postRunReviewReady =
    pageConceptReviewReady(state.generationStatus) &&
    state.generationStatus !== 'CGPT_AWAITING_FOUNDER_REVIEW' &&
    state.generationStatus !== 'GPT2_AWAITING_FOUNDER_REVIEW' &&
    state.generationStatus !== 'GPT2_MOBILE_AWAITING_SELECTION';

  const postRunActions = useMemo(
    () => (postRunReviewReady ? buildPageConceptPostRunActions(state) : []),
    [postRunReviewReady, state],
  );

  const runPostSpendDispatch = useCallback(
    async (flags: {
      retryCgptOnly?: boolean;
      retryGpt2Only?: boolean;
      regenerateNbpOnly?: boolean;
      retryFailedOnly?: boolean;
      resumeRunId?: string | null;
      continueGpt2AfterCgptReview?: boolean;
      continueNbpAfterGpt2Review?: boolean;
    }) => {
      await ensurePageConceptSourceCaptures(projectId, pageId, screenId);
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
      const mobileCapture = await buildPageConceptCapturePayload(mobile, 'MOBILE');
      const desktopCapture = await buildPageConceptCapturePayload(desktop, 'DESKTOP');
      const { runId } = await startPageConceptGenerationRunApi({
        state: current,
        founderConfirmedSpend: true,
        mobileCapture,
        desktopCapture,
        retryCgptOnly: flags.retryCgptOnly === true,
        retryGpt2Only: flags.retryGpt2Only === true,
        regenerateNbpOnly: flags.regenerateNbpOnly === true,
        retryFailedOnly: flags.retryFailedOnly === true,
        resumeRunId: flags.resumeRunId ?? undefined,
        continueGpt2AfterCgptReview: flags.continueGpt2AfterCgptReview === true,
        continueNbpAfterGpt2Review: flags.continueNbpAfterGpt2Review === true,
      });
      savePageConceptActiveServerRunId(projectId, pageId, runId);
      markPageConceptFounderRunSession(projectId, pageId, runId);
      emitPageConceptGenerateTelemetry('page_concept_founder_generation_confirmed', {
        projectId,
        pageId,
        generationRunId: runId,
      });
      const terminalRun = await pollPageConceptGenerationRunUntilTerminal({
        runId,
        projectId,
        pageId,
        afterSequence: lastObservedSequenceRef.current,
        onUpdate: (update) => {
          void applyPollUpdate(update, () => false);
        },
      });
      clearPageConceptActiveServerRunId(projectId, pageId);
      clearPageConceptFounderRunSession(projectId, pageId);
      const result = pageConceptServerRunToResult(terminalRun);
      if (!result) throw new Error(terminalRun.error ?? 'GENERATION_FAILED');
      persist((s) =>
        mergeTerminalRunResultIntoState(s, terminalRun, result, {
          mergeJobsOnly: flags.retryFailedOnly || flags.regenerateNbpOnly,
        }),
      );
      setOverlayMode('review');
      window.dispatchEvent(
        new CustomEvent('site00:page-concept-generation-updated', { detail: { projectId, pageId } }),
      );
    },
    [applyPollUpdate, pageId, persist, projectId, screenId],
  );

  const regenerateGpt2AuthorityFromReview = useCallback(async () => {
    if (generating || !window.confirm('Regenerate GPT2 authority concept?\n\nExpected spend: 1 GPT2 call')) return;
    setGenerating(true);
    setExecutionError(null);
    setOverlayMode('progress');
    try {
      persist((s) => ({ ...s, generationStatus: 'GPT2_RUNNING' }));
      await runPostSpendDispatch({ retryGpt2Only: true });
    } catch (e) {
      setExecutionError(e instanceof Error ? e.message : 'GPT2_REGEN_FAILED');
      setOverlayMode('review');
    } finally {
      setGenerating(false);
    }
  }, [generating, persist, runPostSpendDispatch]);

  const confirmPostRunAction = useCallback((actionId: PageConceptPostRunActionId) => {
    const action = postRunActions.find((a) => a.id === actionId);
    if (!action) return false;
    if (!action.spendNote) return true;
    return window.confirm(pageConceptPostRunConfirmMessage(action));
  }, [postRunActions]);

  const confirmNewGenerationSpend = useCallback(() => {
    const action = resolvePageConceptNewGenerationConfirmAction(postRunActions);
    return window.confirm(pageConceptPostRunConfirmMessage(action));
  }, [postRunActions]);

  const viewPageConceptRenditions = useCallback(() => {
    emitPageConceptGenerateTelemetry('page_concept_review_opened', { projectId, pageId });
    setOverlayOpen(false);
    window.dispatchEvent(
      new CustomEvent('site00:page-concept-focus-gallery', { detail: { projectId, pageId } }),
    );
  }, [pageId, projectId]);

  const requestNewPageConceptGeneration = useCallback(async () => {
    if (generating) return;
    if (!confirmNewGenerationSpend()) return;

    emitPageConceptGenerateTelemetry('page_concept_new_generation_requested', { projectId, pageId });
    setExecutionError(null);
    setGenerating(true);
    setOverlayOpen(true);
    setOverlayMode('progress');

    try {
      clearPageConceptActiveServerRunId(projectId, pageId);
      clearPageConceptFounderRunSession(projectId, pageId);

      persist((s) => applyPageConceptNewGenerationBranchReset(s));

      await ensurePageConceptSourceCaptures(projectId, pageId, screenId);
      await ensurePageConceptApiAccessToken();

      persist((s) => ({ ...s, generationStatus: 'CGPT_RUNNING' }));

      await runPostSpendDispatch({});
    } catch (e) {
      const message = e instanceof Error ? e.message : 'NEW_GENERATION_FAILED';
      setExecutionError(`NEW GENERATION COULD NOT START · ${message}`);
      setOverlayMode('review');
      setOverlayOpen(true);
    } finally {
      setGenerating(false);
    }
  }, [
    confirmNewGenerationSpend,
    generating,
    pageId,
    persist,
    projectId,
    runPostSpendDispatch,
    screenId,
  ]);

  requestNewPageConceptGenerationRef.current = requestNewPageConceptGeneration;

  const requestRegenerateCgpt = useCallback(async () => {
    if (generating || !confirmPostRunAction('regenerate_cgpt')) return;
    emitPageConceptGenerateTelemetry('page_concept_cgpt_regeneration_requested', { projectId, pageId });
    setGenerating(true);
    setExecutionError(null);
    setOverlayMode('progress');
    try {
      persist((s) => {
        const archived = archivePageConceptRunBranch(s, { reason: 'regenerate_cgpt' });
        return { ...archived, pipelineSet: null, generationStatus: 'CGPT_RUNNING' };
      });
      await runPostSpendDispatch({});
    } catch (e) {
      setExecutionError(e instanceof Error ? e.message : 'CGPT_REGEN_FAILED');
      setOverlayMode('review');
    } finally {
      setGenerating(false);
    }
  }, [confirmPostRunAction, generating, pageId, persist, projectId, runPostSpendDispatch]);

  const requestRegenerateGpt2 = useCallback(async () => {
    if (generating || !confirmPostRunAction('regenerate_gpt2')) return;
    emitPageConceptGenerateTelemetry('page_concept_gpt2_regeneration_requested', { projectId, pageId });
    setGenerating(true);
    setExecutionError(null);
    setOverlayMode('progress');
    try {
      persist((s) => {
        const archived = archivePageConceptRunBranch(s, { reason: 'regenerate_gpt2' });
        if (!archived.pipelineSet) return archived;
        return {
          ...archived,
          pipelineSet: {
            ...archived.pipelineSet,
            gpt2AuthorityConcept: null,
            gpt2AuthorityError: undefined,
          },
          generationStatus: 'GPT2_RUNNING',
        };
      });
      await runPostSpendDispatch({ retryGpt2Only: true });
    } catch (e) {
      setExecutionError(e instanceof Error ? e.message : 'GPT2_REGEN_FAILED');
      setOverlayMode('review');
    } finally {
      setGenerating(false);
    }
  }, [confirmPostRunAction, generating, pageId, persist, projectId, runPostSpendDispatch]);

  const requestRegenerateNbp = useCallback(async () => {
    if (generating || !confirmPostRunAction('regenerate_nbp')) return;
    emitPageConceptGenerateTelemetry('page_concept_nbp_regeneration_requested', { projectId, pageId });
    setGenerating(true);
    setExecutionError(null);
    setOverlayMode('progress');
    try {
      persist((s) => archivePageConceptRunBranch(s, { reason: 'regenerate_nbp' }));
      await runPostSpendDispatch({ regenerateNbpOnly: true });
    } catch (e) {
      setExecutionError(e instanceof Error ? e.message : 'NBP_REGEN_FAILED');
      setOverlayMode('review');
    } finally {
      setGenerating(false);
    }
  }, [confirmPostRunAction, generating, pageId, persist, projectId, runPostSpendDispatch]);

  const viewPageConceptRunHistory = useCallback(() => {
    const lines = pageConceptRunHistoryLines(state);
    window.alert(lines.length ? lines.join('\n') : 'No archived runs yet.');
  }, [state]);

  const resolveMobileCaptureBase64ForRegeneration = useCallback(async (): Promise<string> => {
    const captures = getPageConceptSourceCaptures(projectId, pageId);
    const mobile = captures.mobile;
    if (!mobile || !isPageCaptureDisplayableArtifact(mobile.artifactPath)) {
      throw new Error('RUN RECOVERY REQUIRED');
    }
    const payload = await buildPageConceptCapturePayload(mobile, 'MOBILE');
    if (payload.artifactBase64?.trim()) return payload.artifactBase64.trim();
    if (payload.artifactUrl) return artifactPathToBase64(payload.artifactUrl);
    throw new Error('ARTIFACT SOURCE MISSING');
  }, [pageId, projectId, screenId]);

  const dispatchViewportFamilyAction = useCallback(
    async (action: PageConceptViewportFamilyAction) => {
      setGenerating(true);
      setExecutionError(null);
      try {
        await ensurePageConceptApiAccessToken();
        const current = loadPageConceptGenerationStateForDesignPage({
          projectSlug: projectId,
          pageId,
          screenId,
          route: route ?? null,
        });
        let mobileCaptureBase64: string | undefined;
        if (action.type === 'regenerateMobileConcept' || action.type === 'regenerateAllMobileConcepts') {
          if (!current.pipelineSet?.cgptCreativeBrief && !current.pipelineSet?.creativeInjection) {
            throw new Error('NO VALID CGPT BRIEF');
          }
          mobileCaptureBase64 = await resolveMobileCaptureBase64ForRegeneration();
        }
        const result = await pageConceptViewportFamilyActionApi({
          action: action.type,
          state: current,
          conceptId:
            action.type === 'selectMobileConcept' || action.type === 'regenerateMobileConcept' ?
              action.conceptId
            : undefined,
          viewport: action.type === 'captureTwinViewport' ? action.viewport : undefined,
          imageUri: action.type === 'captureTwinViewport' ? action.imageUri : undefined,
          mobileCaptureBase64,
          dryRun: 'dryRun' in action ? action.dryRun : undefined,
        });
        persist(() => {
          let next = result.state;
          if (result.jobs?.length) {
            next = mergePageConceptGenerationJobs(next, result.jobs);
            next = mergePageConceptArtifactsIntoGallery(next);
          }
          savePageConceptGenerationState(next);
          return next;
        });
        window.dispatchEvent(
          new CustomEvent('site00:page-concept-generation-updated', { detail: { projectId, pageId } }),
        );
        if (action.type === 'selectMobileConcept') {
          const row = listPageConceptCandidates(projectId, pageId).find((c) => c.conceptId === action.conceptId);
          window.dispatchEvent(
            new CustomEvent<PageConceptMobileSelectionMadeDetail>(PAGE_CONCEPT_MOBILE_SELECTION_MADE_EVENT, {
              detail: {
                projectId,
                pageId,
                conceptId: action.conceptId,
                artifactId: row?.artifactId ?? null,
                runId: row?.runId ?? null,
              },
            }),
          );
        }
      } catch (e) {
        setExecutionError(e instanceof Error ? e.message : 'VIEWPORT_FAMILY_ACTION_FAILED');
      } finally {
        setGenerating(false);
      }
    },
    [pageId, persist, projectId, resolveMobileCaptureBase64ForRegeneration, route, screenId],
  );

  const viewportFamilyHandlers = useMemo(
    () => ({
      selectMobile: (conceptId: string) => void dispatchViewportFamilyAction({ type: 'selectMobileConcept', conceptId }),
      regenerateMobileConcept: (conceptId: string) =>
        void dispatchViewportFamilyAction({ type: 'regenerateMobileConcept', conceptId, mobileCaptureBase64: '' }),
      regenerateAllMobileConcepts: () =>
        void dispatchViewportFamilyAction({ type: 'regenerateAllMobileConcepts', mobileCaptureBase64: '' }),
      approveExperience: () => void dispatchViewportFamilyAction({ type: 'approveExperienceExpression' }),
      runTablet: () => void dispatchViewportFamilyAction({ type: 'runTabletInterpretation' }),
      runDesktop: () => void dispatchViewportFamilyAction({ type: 'runDesktopInterpretation' }),
      regenerateTablet: () => void dispatchViewportFamilyAction({ type: 'regenerateTablet' }),
      regenerateDesktop: () => void dispatchViewportFamilyAction({ type: 'regenerateDesktop' }),
      approveFamily: () => void dispatchViewportFamilyAction({ type: 'approveViewportFamily' }),
      approvePageFamily: () => void dispatchViewportFamilyAction({ type: 'approvePageFamilySkinBehavior' }),
      markOpusShellsReady: () => void dispatchViewportFamilyAction({ type: 'markOpusRepresentativeShellsReady' }),
      lockFamily: () => void dispatchViewportFamilyAction({ type: 'lockViewportFamily' }),
      createTwinPackage: () => void dispatchViewportFamilyAction({ type: 'createTwinImplementationPackage' }),
    }),
    [dispatchViewportFamilyAction],
  );

  const postRunControlHandlers = useMemo(
    () => ({
      view_renditions: viewPageConceptRenditions,
      new_generation: () => {
        void requestNewPageConceptGeneration();
      },
      regenerate_cgpt: () => void requestRegenerateCgpt(),
      regenerate_gpt2: () => void requestRegenerateGpt2(),
      regenerate_nbp: () => void requestRegenerateNbp(),
      retry_failed_only: () => void retryFailedGeneration(),
      view_run_history: viewPageConceptRunHistory,
    }),
    [
      requestNewPageConceptGeneration,
      requestRegenerateCgpt,
      requestRegenerateGpt2,
      requestRegenerateNbp,
      retryFailedGeneration,
      viewPageConceptRenditions,
      viewPageConceptRunHistory,
    ],
  );

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
    openGenerationConsole,
    consoleFocusViewport,
    openGenerationReview,
    cancelGeneration,
    handleGenerateClick,
    confirmGeneration: handleGenerateClick,
    retryFailedGeneration,
    retryCgptGeneration,
    cgptRetryEligible,
    modalGeneratePress,
    generateClickTrace,
    liveProductionTrace,
    sourceCaptureLines: generationEligibility.sourceCaptureLines,
    progressForensics,
    presentedSubstepStates,
    runHealth,
    continueNbpAfterGpt2Review,
    continueGpt2AfterCgptReview,
    regenerateGpt2AuthorityFromReview,
    gpt2MobileAwaitingSelection: state.generationStatus === 'GPT2_MOBILE_AWAITING_SELECTION',
    cgptAwaitingFounderReview: state.generationStatus === 'CGPT_AWAITING_FOUNDER_REVIEW',
    gpt2AwaitingFounderReview: state.generationStatus === 'GPT2_AWAITING_FOUNDER_REVIEW',
    postRunReviewReady,
    postRunActions,
    postRunPrimaryAction: pageConceptPostRunPrimaryAction(postRunActions),
    postRunSecondaryAction: pageConceptPostRunSecondaryAction(postRunActions),
    postRunMoreActions: pageConceptPostRunMoreActions(postRunActions),
    postRunControlHandlers,
    viewportFamilyHandlers,
    dispatchViewportFamilyAction,
  };
}
