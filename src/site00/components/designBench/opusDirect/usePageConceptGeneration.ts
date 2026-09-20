import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  DESIGN_PAGE_CAPTURE_UPDATED_EVENT,
  loadPageCaptureHistory,
} from '../../../../../shared/site00-design-workspace-production/designPageCapture.js';
import {
  applyPageConceptPipelineSet,
  mergePageConceptArtifactsIntoGallery,
  registerPageConceptGenerationJobs,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/generationWorkflow.js';
import { buildPageConceptGenerationPlan } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/generationPlan.js';
import {
  evaluatePageConceptReadiness,
  pageConceptBlockedReason,
  pageConceptBlockedResolution,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/readiness.js';
import {
  loadPageConceptGenerationState,
  savePageConceptGenerationState,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/store.js';
import type {
  PageConceptGenerationPlan,
  PageConceptGenerationState,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import {
  planPageConceptGenerationApi,
  runPageConceptGenerationApi,
} from '../../../services/pageConceptGenerationClient.js';

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

export function usePageConceptGeneration(projectId: string, pageId: string) {
  const [state, setState] = useState<PageConceptGenerationState>(() =>
    loadPageConceptGenerationState(projectId, pageId),
  );
  const [pendingPlan, setPendingPlan] = useState<PageConceptGenerationPlan | null>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [overlayMode, setOverlayMode] = useState<'confirm' | 'progress'>('confirm');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captureRevision, setCaptureRevision] = useState(0);

  useEffect(() => {
    const onCapture = (event: Event) => {
      const detail = (event as CustomEvent<{ projectId?: string; pageId?: string }>).detail;
      if (detail?.projectId !== projectId || detail?.pageId !== pageId) return;
      setCaptureRevision((v) => v + 1);
    };
    window.addEventListener(DESIGN_PAGE_CAPTURE_UPDATED_EVENT, onCapture);
    return () => window.removeEventListener(DESIGN_PAGE_CAPTURE_UPDATED_EVENT, onCapture);
  }, [pageId, projectId]);

  const readiness = useMemo(
    () => evaluatePageConceptReadiness(projectId, pageId),
    [projectId, pageId, captureRevision],
  );
  const blockedReason = pageConceptBlockedReason(readiness);
  const blockedResolution = pageConceptBlockedResolution(readiness);
  const ready = readiness === 'READY_FOR_CREATIVE_INJECTION';

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
    let localPlan: PageConceptGenerationPlan;
    try {
      localPlan = buildPageConceptGenerationPlan(projectId, pageId);
    } catch (e) {
      setError(e instanceof Error ? e.message : blockedReason);
      setOverlayOpen(true);
      setOverlayMode('confirm');
      setPendingPlan(null);
      return;
    }
    setPendingPlan(localPlan);
    setOverlayMode('confirm');
    setOverlayOpen(true);
    persist((s) => ({ ...s, generationStatus: 'PLANNED' }));

    const current = loadPageConceptGenerationState(projectId, pageId);
    try {
      const remotePlan = await planPageConceptGenerationApi(current);
      setPendingPlan(remotePlan);
    } catch {
      /* local plan already shown — no provider spend */
    }
  }, [blockedReason, pageId, persist, projectId]);

  const cancelGeneration = useCallback(() => {
    if (generating) return;
    setPendingPlan(null);
    setOverlayOpen(false);
    setError(null);
    persist((s) => ({ ...s, generationStatus: 'IDLE' }));
  }, [generating, persist]);

  const confirmGeneration = useCallback(async () => {
    if (generating) return;
    setGenerating(true);
    setError(null);
    setOverlayMode('progress');
    try {
      const current = loadPageConceptGenerationState(projectId, pageId);
      const mobile = loadPageCaptureHistory(projectId, pageId, 'MOBILE').latest;
      const desktop = loadPageCaptureHistory(projectId, pageId, 'DESKTOP').latest;
      if (!mobile?.artifactPath || !desktop?.artifactPath) throw new Error('BLOCKED_NO_SOURCE_CAPTURE');

      persist((s) => ({ ...s, generationStatus: 'CGPT_RUNNING' }));
      const mobileB64 = await artifactPathToBase64(mobile.artifactPath);
      const desktopB64 = await artifactPathToBase64(desktop.artifactPath);

      persist((s) => ({ ...s, generationStatus: 'GPT2_RUNNING' }));

      const result = await runPageConceptGenerationApi({
        state: current,
        founderConfirmedSpend: true,
        mobileCapture: {
          captureId: mobile.captureId,
          artifactBase64: mobileB64,
          width: 390,
          height: 844,
        },
        desktopCapture: {
          captureId: desktop.captureId,
          artifactBase64: desktopB64,
          width: 1440,
          height: 1024,
        },
      });

      persist((s) => {
        let next = applyPageConceptPipelineSet(s, result.pipelineSet);
        next = registerPageConceptGenerationJobs(next, result.jobs);
        next = mergePageConceptArtifactsIntoGallery(next);
        return next;
      });

      setPendingPlan(null);
      setOverlayOpen(false);
      window.dispatchEvent(new CustomEvent('site00:page-concept-generation-updated', { detail: { projectId, pageId } }));
    } catch (e) {
      const message = e instanceof Error ? e.message : 'GENERATION_FAILED';
      setError(message);
      persist((s) => ({
        ...s,
        generationStatus: 'FAILED',
        lastFailure: { message, at: new Date().toISOString() },
      }));
    } finally {
      setGenerating(false);
    }
  }, [generating, pageId, persist, projectId]);

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
    openGenerationConfirm,
    cancelGeneration,
    confirmGeneration,
  };
}
