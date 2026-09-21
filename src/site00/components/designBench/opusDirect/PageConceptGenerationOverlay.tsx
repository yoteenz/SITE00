/**
 * P0.VR.PAGE-CONCEPT-GENERATOR-OPUS-SHELL1 + COMPOSER-INTEGRATION1 —
 * GENERATE PAGE CONCEPTS pop-up: Opus shell bound to the real pipeline.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

import type { PageConceptStageId, PageConceptStageState } from '../../../../../shared/site00-design-workspace-production/designPageConceptGeneratorShell.js';
import {
  buildCgptBriefRows,
  buildCgptFullBriefMarkdown,
  buildNbpSlotPresentations,
  pageConceptGenerationInFlight,
  pageConceptHasFailedNbpJobs,
  pageConceptReviewReady,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGeneratorBinding.js';
import { pageConceptStageStatesForPanel } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptStageStatesForPanel.js';
import type { PageConceptLiveProductionTrace } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptLiveProductionTrace.js';
import type { PageConceptGenerationBlockingState } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGenerationBlockingState.js';
import type { PageConceptGenerateClickTrace } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGenerateClickTelemetry.js';
import type { PageConceptGenerationEligibility } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGenerationEligibility.js';
import type { PageConceptModalGeneratePress } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptModalGeneratePress.js';
import { sanitizePageConceptFounderNotice } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptFounderNotice.js';
import type { PageConceptSourceCaptureLine } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/readiness.js';
import type {
  PageConceptGenerationPlan,
  PageConceptGenerationState,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import type { DesignWorkspaceArtifactView } from '../../../../../shared/site00-design-workspace-production/types.js';
import { PageConceptGeneratorPanel } from '../pageConceptGenerator/PageConceptGeneratorPanel';
import { PageConceptGeneratorNbpStage } from '../pageConceptGenerator/PageConceptGeneratorNbpStage';
import { CgptBriefResult, Gpt2AuthorityResult } from '../pageConceptGenerator/PageConceptGeneratorResults';
import { usePageConceptReleaseForensics } from './usePageConceptReleaseForensics';

export function PageConceptGenerationOverlay({
  open,
  mode,
  plan,
  generationState,
  error: _executionErrorProp,
  confirmNotice: _confirmNoticeProp,
  blockingState,
  generationEligibility,
  generating,
  confirmReady: _confirmReadyLegacy,
  modalGeneratePress,
  generateClickTrace,
  liveProductionTrace,
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
  confirmNotice?: string | null;
  blockingState?: PageConceptGenerationBlockingState;
  generationEligibility?: PageConceptGenerationEligibility;
  generating: boolean;
  confirmReady?: boolean;
  modalGeneratePress?: PageConceptModalGeneratePress;
  generateClickTrace?: PageConceptGenerateClickTrace;
  liveProductionTrace?: PageConceptLiveProductionTrace;
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

  const stageStates: Record<PageConceptStageId, PageConceptStageState> = useMemo(
    () =>
      pageConceptStageStatesForPanel({
        state: generationState,
        generating,
        mode,
      }),
    [generationState, generating, mode],
  );

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

  const founderNotice = sanitizePageConceptFounderNotice({
    notice: blockingState?.founderNotice ?? null,
    sourceCapturesReady: generationEligibility?.sourceCaptureValidation.allRequiredReady === true,
    generationEligibility: generationEligibility ?? null,
  });

  const generateDisabled = modalGeneratePress ? !modalGeneratePress.canPress : inFlight;
  const generateBlockReason =
    modalGeneratePress?.blockReason ??
    (generateDisabled ? founderNotice : null);

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

  const releaseForensics = usePageConceptReleaseForensics(open);

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
        <div className="s00-pcg-layer__main">
        <PageConceptGeneratorPanel
          projectLabel={plan?.projectLabel ?? generationState.projectId}
          pageLabel={plan?.pageLabel ?? generationState.pageId}
          sourceCaptureLines={sourceCaptureLines}
          sourceCapturesReady={generationEligibility?.sourceCaptureValidation.allRequiredReady === true}
          stageStates={stageStates}
          results={results}
          notice={founderNotice}
          noticeTestId={
            founderNotice ?
              blockingState?.executionError ?
                'page-concept-generation-error'
              : 'page-concept-generation-blocked'
            : undefined
          }
          reviewBanner={
            reviewReady && !generating ? 'READY FOR FOUNDER REVIEW — CLOSE TO USE GALLERY & AUTHORITY RAIL.' : null
          }
          footSpendNote={mode === 'confirm' && plan ? spendNote : null}
          generateDisabled={generateDisabled}
          generateDisabledReason={generateBlockReason ?? founderNotice}
          generateBusyLabel={generateBusyLabel}
          generateLabel={
            !generating && blockingState?.executionError && !failedNbp ?
              'RETRY GENERATION'
            : undefined
          }
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
        {generationEligibility && blockingState ?
          <details className="s00-pcg__forensics" data-testid="page-concept-forensics">
            <summary>Technical details</summary>
            <pre>
              {[
                releaseForensics,
                `PAGE ${generationEligibility.canonicalPageId}`,
                `MOBILE ${generationEligibility.mobileCapture?.captureId ?? '—'}`,
                `DESKTOP ${generationEligibility.desktopCapture?.captureId ?? '—'}`,
                `CAPTURES_READY ${generationEligibility.sourceCaptureValidation.allRequiredReady}`,
                `CAN_GENERATE ${generationEligibility.canGenerate}`,
                `BLOCKER ${blockingState.primaryBlockerCode ?? '—'}`,
                `NOTICE ${founderNotice ?? '—'}`,
                [
                  generateClickTrace ?
                    [
                      '',
                      'LIVE GENERATE TRACE',
                      `CLICK_RECEIVED ${generateClickTrace.clickReceived}`,
                      `CAN_PRESS ${generateClickTrace.canPressAtClick ?? '—'}`,
                      `CAN_GENERATE ${generateClickTrace.canGenerateAtClick ?? '—'}`,
                      `SESSION ${generateClickTrace.sessionPresentAtClick ?? '—'}`,
                      `PREFLIGHT ${generateClickTrace.preflightStatus}`,
                      `PREFLIGHT_RESULT ${generateClickTrace.preflightResult ?? '—'}`,
                      `STATE_SET_CGPT_RUNNING ${generateClickTrace.stateSetCgptRunning}`,
                      `RENDERED_STAGE ${generateClickTrace.renderedStageAtClick ?? '—'}`,
                      `RUN ${generateClickTrace.generationRunId ?? generationState.activeGenerationRunId ?? '—'}`,
                      `DISPATCH ${generateClickTrace.dispatchStatus}`,
                      `LAST_ERROR ${generateClickTrace.lastErrorCode ?? '—'}`,
                    ].join('\n')
                  : '',
                  liveProductionTrace ?
                    [
                      '',
                      'NETWORK / API',
                      `REQUEST_SENT ${liveProductionTrace.apiRequestSent}`,
                      `URL ${liveProductionTrace.apiRequestUrl ?? '—'}`,
                      `STATUS ${liveProductionTrace.apiStatus ?? '—'}`,
                      `DURATION_MS ${liveProductionTrace.apiDurationMs ?? '—'}`,
                      `ERROR ${liveProductionTrace.apiErrorCode ?? '—'}`,
                      `RESPONSE ${liveProductionTrace.apiResponseSummary ?? '—'}`,
                      `DRY_RUN ${liveProductionTrace.dryRunUsed}`,
                      `STATE_BEFORE ${liveProductionTrace.stateBefore ?? '—'}`,
                      `STATE_AFTER ${liveProductionTrace.stateAfter ?? '—'}`,
                      ...liveProductionTrace.events.map((e) => `${e.at} ${e.kind}${e.detail ? ` · ${e.detail}` : ''}`),
                    ].join('\n')
                  : '',
                ].join('\n')
              ].join('\n')}
            </pre>
          </details>
        : null}
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
