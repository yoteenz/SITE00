/**
 * P0.VR.PAGE-CONCEPT-GENERATOR-OPUS-SHELL1 + COMPOSER-INTEGRATION1 —
 * GENERATE PAGE CONCEPTS pop-up: Opus shell bound to the real pipeline.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  PAGE_CONCEPT_DEFAULT_STAGE_STATE,
  type PageConceptStageId,
  type PageConceptStageState,
} from '../../../../../shared/site00-design-workspace-production/designPageConceptGeneratorShell.js';
import {
  buildCgptBriefRows,
  buildCgptFullBriefMarkdown,
  buildNbpSlotPresentations,
  pageConceptGenerationInFlight,
  pageConceptHasFailedNbpJobs,
  pageConceptReviewReady,
  pageConceptStageStatesFromPipeline,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGeneratorBinding.js';
import type { PageConceptSourceCaptureLine } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/readiness.js';
import type {
  PageConceptGenerationPlan,
  PageConceptGenerationState,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import type { DesignWorkspaceArtifactView } from '../../../../../shared/site00-design-workspace-production/types.js';
import { PageConceptGeneratorPanel } from '../pageConceptGenerator/PageConceptGeneratorPanel';
import { PageConceptGeneratorNbpStage } from '../pageConceptGenerator/PageConceptGeneratorNbpStage';
import { CgptBriefResult, Gpt2AuthorityResult } from '../pageConceptGenerator/PageConceptGeneratorResults';

export function PageConceptGenerationOverlay({
  open,
  mode,
  plan,
  generationState,
  error,
  generating,
  confirmReady,
  sourceCaptureLines,
  onCancel,
  onConfirm,
  onRetryFailed,
  onOpenFullscreen,
}: {
  open: boolean;
  mode: 'confirm' | 'progress' | 'review';
  plan: PageConceptGenerationPlan | null;
  generationState: PageConceptGenerationState;
  error: string | null;
  generating: boolean;
  confirmReady: boolean;
  sourceCaptureLines?: readonly PageConceptSourceCaptureLine[];
  onCancel: () => void;
  onConfirm: () => void;
  onRetryFailed: () => void;
  onOpenFullscreen: (artifact: DesignWorkspaceArtifactView) => void;
}) {
  const [fullBriefOpen, setFullBriefOpen] = useState(false);

  useEffect(() => {
    if (!open) setFullBriefOpen(false);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !generating) onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [generating, onCancel, open]);

  const openImage = useCallback(
    (src: string, title: string, subtitle?: string) => {
      onOpenFullscreen({
        src,
        title: title.toUpperCase(),
        subtitle,
        role: 'page-concept-output',
      });
    },
    [onOpenFullscreen],
  );

  const stageStates: Record<PageConceptStageId, PageConceptStageState> = useMemo(() => {
    const hasPipeline =
      generationState.pipelineSet?.creativeInjection ||
      generationState.generationJobs.length > 0 ||
      generationState.generationStatus !== 'IDLE';
    if (!hasPipeline && mode === 'confirm' && !generating) {
      return PAGE_CONCEPT_DEFAULT_STAGE_STATE;
    }
    return pageConceptStageStatesFromPipeline(generationState);
  }, [generationState, generating, mode]);

  const injection = generationState.pipelineSet?.creativeInjection ?? null;
  const gpt2 = generationState.pipelineSet?.gpt2AuthorityConcept ?? null;
  const nbpSlots = useMemo(() => buildNbpSlotPresentations(generationState), [generationState]);

  const results = useMemo(() => {
    const hasAnyOutput = injection || gpt2 || nbpSlots.some((s) => s.status !== 'PENDING');
    if (!hasAnyOutput && mode === 'confirm' && !generating) return {};
    return {
      cgptBrief:
        injection ?
          <CgptBriefResult
            rows={buildCgptBriefRows(injection)}
            onViewFull={() => setFullBriefOpen(true)}
          />
        : undefined,
      authorityImage:
        gpt2 ?
          <Gpt2AuthorityResult
            concept={gpt2}
            onInspect={(src, title, subtitle) => openImage(src, title, subtitle)}
          />
        : undefined,
      nbpStageOverride:
        hasAnyOutput || mode !== 'confirm' ?
          <PageConceptGeneratorNbpStage
            slots={nbpSlots}
            projectId={generationState.projectId}
            pageId={generationState.pageId}
            onInspect={(src, title) => openImage(src, title)}
          />
        : undefined,
    };
  }, [generationState.pageId, generationState.projectId, gpt2, injection, mode, nbpSlots, generating, openImage]);

  const reviewReady = pageConceptReviewReady(generationState.generationStatus);
  const inFlight = pageConceptGenerationInFlight(generationState.generationStatus, generating);
  const failedNbp = pageConceptHasFailedNbpJobs(generationState);

  const spendNote = useMemo(() => {
    if (!plan?.estimatedCostNote) return null;
    return `${plan.estimatedCostNote.toUpperCase()} · CONFIRM BEFORE SEND.`;
  }, [plan?.estimatedCostNote]);

  const generateDisabled =
    inFlight ||
    (mode === 'review' && reviewReady && !failedNbp) ||
    (mode !== 'review' && !confirmReady);

  const generateBusyLabel =
    generating ?
      generationState.generationStatus === 'NBP_RUNNING' ?
        'NBP RENDERING…'
      : generationState.generationStatus === 'GPT2_RUNNING' ?
        'GPT2 RUNNING…'
      : 'GENERATING…'
    : mode === 'review' && reviewReady ?
      'READY FOR REVIEW'
    : null;

  if (!open) return null;

  const fullBriefMarkdown = injection ? buildCgptFullBriefMarkdown(injection) : '';

  return (
    <div className="s00-pcg-layer" role="dialog" data-testid="page-concept-generation-overlay">
      <button
        type="button"
        className="s00-pcg__scrim"
        aria-label="Close generate page concepts"
        onClick={() => !generating && onCancel()}
      />
      <div className="s00-pcg-layer__box">
        <PageConceptGeneratorPanel
          projectLabel={plan?.projectLabel ?? generationState.projectId}
          pageLabel={plan?.pageLabel ?? generationState.pageId}
          sourceCaptureLines={sourceCaptureLines}
          stageStates={stageStates}
          results={results}
          notice={error}
          noticeTestId={mode === 'confirm' && !plan && error ? 'page-concept-generation-blocked' : undefined}
          reviewBanner={
            reviewReady && !generating ? 'READY FOR FOUNDER REVIEW — CLOSE TO USE GALLERY & AUTHORITY RAIL.' : null
          }
          footSpendNote={mode === 'confirm' && plan ? spendNote : null}
          generateDisabled={generateDisabled}
          generateDisabledReason={error}
          generateBusyLabel={generateBusyLabel}
          secondaryAction={
            failedNbp && !generating ?
              {
                label: 'RETRY FAILED ONLY',
                onClick: onRetryFailed,
                disabled: generating,
                testId: 'page-concept-retry-failed',
              }
            : null
          }
          onGenerate={onConfirm}
          onCancel={onCancel}
          onClose={onCancel}
        />
      </div>
      {fullBriefOpen && injection ?
        <div className="s00-pcg__briefLayer" role="dialog" aria-label="Full creative brief">
          <button type="button" className="s00-pcg__briefScrim" aria-label="Close brief" onClick={() => setFullBriefOpen(false)} />
          <div className="s00-pcg__briefSheet">
            <header className="s00-pcg__briefSheetHead">
              <h3>FULL CREATIVE BRIEF</h3>
              <button type="button" onClick={() => setFullBriefOpen(false)}>
                CLOSE
              </button>
            </header>
            <pre className="s00-pcg__briefSheetBody">{fullBriefMarkdown}</pre>
          </div>
        </div>
      : null}
    </div>
  );
}
