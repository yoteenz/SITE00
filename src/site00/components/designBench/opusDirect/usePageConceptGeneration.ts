import { useCallback, useEffect, useMemo, useState } from 'react';

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
import { pageConceptReviewReady } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGeneratorBinding.js';
import { buildPageConceptGenerationPlan } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/generationPlan.js';
import {
  evaluatePageConceptReadiness,
  pageConceptBlockedReason,
  pageConceptBlockedResolution,
  pageConceptSourceCaptureBlockMessage,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/readiness.js';
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
    throw new Error(pageConceptSourceCaptureBlockMessage(record.projectId, record.pageId) || 'BLOCKED_NO_SOURCE_CAPTURE');
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

function readinessBlockMessage(projectId: string, pageId: string): string {
  const readiness = evaluatePageConceptReadiness(projectId, pageId);
  if (readiness === 'BLOCKED_NO_SOURCE_CAPTURE') {
    return pageConceptSourceCaptureBlockMessage(projectId, pageId) || pageConceptBlockedReason(readiness);
  }
  return pageConceptBlockedReason(readiness) || readiness;
}

export function usePageConceptGeneration(projectId: string, pageId: string, screenId: string) {
  const [state, setState] = useState<PageConceptGenerationState>(() =>
    loadPageConceptGenerationState(projectId, pageId),
  );
  const [pendingPlan, setPendingPlan] = useState<PageConceptGenerationPlan | null>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [overlayMode, setOverlayMode] = useState<'confirm' | 'progress' | 'review'>('confirm');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captureRevision, setCaptureRevision] = useState(0);
  const [apiSessionReady, setApiSessionReady] = useState<boolean | null>(null);

  useEffect(() => {
    const loaded = loadPageConceptGenerationState(projectId, pageId);
    setState(loaded);
    setPendingPlan(null);
    setOverlayOpen(false);
    setOverlayMode(pageConceptReviewReady(loaded.generationStatus) ? 'review' : 'confirm');
    setError(null);
    setGenerating(false);
  }, [pageId, projectId]);

  useEffect(() => {
    const onUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ projectId?: string; pageId?: string }>).detail;
      if (detail?.projectId !== projectId || detail?.pageId !== pageId) return;
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
    const bump = (event: Event) => {
      const detail = (event as CustomEvent<{ projectId?: string; pageId?: string }>).detail;
      if (detail?.projectId !== projectId || detail?.pageId !== pageId) return;
      setCaptureRevision((v) => v + 1);
    };
    window.addEventListener(DESIGN_PAGE_CAPTURE_UPDATED_EVENT, bump);
    window.addEventListener('site00:page-concept-captures-hydrated', bump);
    return () => {
      window.removeEventListener(DESIGN_PAGE_CAPTURE_UPDATED_EVENT, bump);
      window.removeEventListener('site00:page-concept-captures-hydrated', bump);
    };
  }, [pageId, projectId]);

  const readiness = useMemo(
    () => evaluatePageConceptReadiness(projectId, pageId),
    [projectId, pageId, captureRevision],
  );
  const captureBlockedReason = pageConceptBlockedReason(readiness);
  const blockedResolution = pageConceptBlockedResolution(readiness);
  const blockedReason =
    readiness !== 'READY_FOR_CREATIVE_INJECTION' ?
      readiness === 'BLOCKED_NO_SOURCE_CAPTURE' ?
        pageConceptSourceCaptureBlockMessage(projectId, pageId) || captureBlockedReason
      : captureBlockedReason
    : apiSessionReady === false ?
      PAGE_CONCEPT_SIGN_IN_REQUIRED
    : captureBlockedReason;
  const ready = readiness === 'READY_FOR_CREATIVE_INJECTION' && apiSessionReady === true;

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

  const openGenerationConfirm = useCallback(async () => {
    setError(null);
    await ensurePageConceptSourceCaptures(projectId, pageId, screenId);
    setCaptureRevision((v) => v + 1);

    const token = await getAccessToken();
    setApiSessionReady(!!token);

    const currentReadiness = evaluatePageConceptReadiness(projectId, pageId);
    if (currentReadiness !== 'READY_FOR_CREATIVE_INJECTION' || !token) {
      setError(
        currentReadiness !== 'READY_FOR_CREATIVE_INJECTION' ?
          readinessBlockMessage(projectId, pageId)
        : PAGE_CONCEPT_SIGN_IN_REQUIRED,
      );
      setOverlayOpen(true);
      setOverlayMode('confirm');
      setPendingPlan(null);
      return;
    }
    let localPlan: PageConceptGenerationPlan;
    try {
      localPlan = buildPageConceptGenerationPlan(projectId, pageId);
    } catch (e) {
      setError(e instanceof Error ? e.message : readinessBlockMessage(projectId, pageId));
      setOverlayOpen(true);
      setOverlayMode('confirm');
      setPendingPlan(null);
      return;
    }
    setPendingPlan(localPlan);
    const loadedForMode = loadPageConceptGenerationState(projectId, pageId);
    setOverlayMode(
      pageConceptReviewReady(loadedForMode.generationStatus) || loadedForMode.pipelineSet?.creativeInjection ?
        'review'
      : 'confirm',
    );
    setOverlayOpen(true);
    persist((s) => ({ ...s, generationStatus: s.generationStatus === 'IDLE' ? 'PLANNED' : s.generationStatus }));

    const current = loadPageConceptGenerationState(projectId, pageId);
    try {
      const remotePlan = await planPageConceptGenerationApi(current);
      setPendingPlan(remotePlan);
    } catch {
      /* local plan already shown — no provider spend */
    }
  }, [pageId, persist, projectId, screenId]);

  const cancelGeneration = useCallback(() => {
    if (generating) return;
    setPendingPlan(null);
    setOverlayOpen(false);
    setError(null);
  }, [generating]);

  const confirmGeneration = useCallback(async () => {
    if (generating) return;
    setGenerating(true);
    setError(null);
    try {
      await ensurePageConceptSourceCaptures(projectId, pageId, screenId);
      setCaptureRevision((v) => v + 1);

      const currentReadiness = evaluatePageConceptReadiness(projectId, pageId);
      if (currentReadiness !== 'READY_FOR_CREATIVE_INJECTION') {
        throw new Error(readinessBlockMessage(projectId, pageId));
      }
      await ensurePageConceptApiAccessToken();
      const { mobile, desktop } = getPageConceptSourceCaptures(projectId, pageId);
      if (!mobile?.artifactPath || !desktop?.artifactPath) {
        throw new Error(pageConceptSourceCaptureBlockMessage(projectId, pageId) || 'BLOCKED_NO_SOURCE_CAPTURE');
      }

      setOverlayMode('progress');
      persist((s) => ({ ...s, generationStatus: 'CGPT_RUNNING' }));

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
      setError(
        result.pipelineSet.creativeInjectionError ??
          result.pipelineSet.gpt2AuthorityError ??
          null,
      );
      window.dispatchEvent(new CustomEvent('site00:page-concept-generation-updated', { detail: { projectId, pageId } }));
    } catch (e) {
      const message = e instanceof Error ? e.message : 'GENERATION_FAILED';
      setError(message);
      setOverlayMode('review');
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
  }, [generating, pageId, persist, projectId, screenId]);

  const retryFailedGeneration = useCallback(async () => {
    if (generating) return;
    setGenerating(true);
    setError(null);
    try {
      await ensurePageConceptSourceCaptures(projectId, pageId, screenId);
      await ensurePageConceptApiAccessToken();
      const current = loadPageConceptGenerationState(projectId, pageId);
      const { mobile, desktop } = getPageConceptSourceCaptures(projectId, pageId);
      if (!mobile?.artifactPath || !desktop?.artifactPath) {
        throw new Error(pageConceptSourceCaptureBlockMessage(projectId, pageId) || 'BLOCKED_NO_SOURCE_CAPTURE');
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
      setError(message);
      setOverlayMode('review');
    } finally {
      setGenerating(false);
    }
  }, [generating, pageId, persist, projectId, screenId]);

  return {
    readiness,
    ready,
    blockedReason,
    blockedResolution,
    overlayOpen,
    overlayMode,
    pendingPlan,
    generating,
    error,
    generationStatus: state.generationStatus,
    pipelineSet: state.pipelineSet,
    generationJobs: state.generationJobs,
    generationState: state,
    openGenerationConfirm,
    cancelGeneration,
    confirmGeneration,
    retryFailedGeneration,
  };
}
