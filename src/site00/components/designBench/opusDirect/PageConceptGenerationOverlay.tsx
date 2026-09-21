/**
 * P0.VR.PAGE-CONCEPT-GENERATOR-OPUS-SHELL1 + COMPOSER-INTEGRATION1 —
 * GENERATE PAGE CONCEPTS pop-up: Opus shell bound to the real pipeline.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

import type { PageConceptStageId, PageConceptStageState } from '../../../../../shared/site00-design-workspace-production/designPageConceptGeneratorShell.js';
import {
  buildCgptBriefRows,
  buildNbpSlotPresentations,
  pageConceptCgptManualRetryEligible,
  pageConceptGenerationInFlight,
  pageConceptHasFailedNbpJobs,
  pageConceptReviewReady,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGeneratorBinding.js';
import {
  activeCgptSubstepCopy,
  derivePageConceptLiveProgress,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptLiveProgress.js';
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
import type { PageConceptProgressObservationForensics } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProgressObservationForensics.js';
import type { PageConceptRunHealth } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptRunHealth.js';
import type { PageConceptCgptSubstepId } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptLiveProgress.js';
import type { PageConceptSubstepRunState } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptLiveProgress.js';
import type { DesignWorkspaceArtifactView } from '../../../../../shared/site00-design-workspace-production/types.js';
import { PageConceptGeneratorPanel } from '../pageConceptGenerator/PageConceptGeneratorPanel';
import { PageConceptGeneratorNbpStage } from '../pageConceptGenerator/PageConceptGeneratorNbpStage';
import { CgptBriefResult, Gpt2AuthorityResult } from '../pageConceptGenerator/PageConceptGeneratorResults';
import { PageConceptCgptBriefInspector } from '../pageConceptGenerator/PageConceptCgptBriefInspector';
import { usePageConceptReleaseForensics } from './usePageConceptReleaseForensics';
import {
  buildPageConceptGpt2HandoffViewModel,
  resolveCgptBriefFromGenerationState,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCgptCreativeBrief.js';
import { compilePageFunctionContract } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/functionContract.js';

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
  onRetryCgpt,
  onOpenFullscreen,
  progressForensics,
  presentedSubstepStates,
  runHealth,
  cgptAwaitingFounderReview,
  gpt2AwaitingFounderReview,
  onContinueGpt2,
  onContinueNbp,
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
  onRetryCgpt: () => void;
  onOpenFullscreen: (artifact: DesignWorkspaceArtifactView) => void;
  progressForensics?: PageConceptProgressObservationForensics;
  presentedSubstepStates?: Partial<Record<PageConceptCgptSubstepId, PageConceptSubstepRunState>>;
  runHealth?: PageConceptRunHealth;
  cgptAwaitingFounderReview?: boolean;
  gpt2AwaitingFounderReview?: boolean;
  onContinueGpt2?: () => void;
  onContinueNbp?: () => void;
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

  const liveProgress = useMemo(
    () =>
      derivePageConceptLiveProgress({
        generationStatus: generationState.generationStatus,
        generating,
        activeGenerationStage: generationState.activeGenerationStage,
        panelProgress: generationState.liveProgress,
        cgptFailed:
          Boolean(generationState.pipelineSet?.creativeInjectionError) &&
          !generationState.pipelineSet?.creativeInjection,
      }),
    [generating, generationState],
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
  const functionContract =
    generationState.functionContract ??
    (generationState.projectId && generationState.pageId ?
      compilePageFunctionContract(generationState.projectId, generationState.pageId)
    : null);

  const cgptBrief = useMemo(
    () =>
      resolveCgptBriefFromGenerationState({
        brief: generationState.pipelineSet?.cgptCreativeBrief,
        injection,
        projectContext: generationState.projectContext,
        pageContext: generationState.pageContext,
        functionContract,
        captureSetId: generationState.pipelineSet?.captureSetId,
      }),
    [functionContract, generationState, injection],
  );

  const handoffViewModel = useMemo(() => {
    if (!cgptBrief || !injection || !generationState.projectContext || !generationState.pageContext || !functionContract) {
      return null;
    }
    return buildPageConceptGpt2HandoffViewModel({
      brief: cgptBrief,
      injection,
      projectContext: generationState.projectContext,
      pageContext: generationState.pageContext,
      functionContract,
    });
  }, [cgptBrief, functionContract, generationState, injection]);

  const nbpSlots = useMemo(() => buildNbpSlotPresentations(generationState), [generationState]);

  const results = useMemo(() => {
    const hasAnyOutput =
      injection || gpt2 || nbpSlots.some((s) => s.status !== 'PENDING') || generating;
    if (!hasAnyOutput && mode === 'confirm' && !generating) return {};
    return {
      cgptBrief:
        cgptBrief ?
          <CgptBriefResult
            rows={buildCgptBriefRows(cgptBrief)}
            substepStates={liveProgress.substepStatusById}
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
  }, [cgptBrief, generationState.pageId, generationState.projectId, gpt2, mode, nbpSlots, generating, openImage]);

  const reviewReady = pageConceptReviewReady(generationState.generationStatus);
  const inFlight = pageConceptGenerationInFlight(generationState.generationStatus, generating);
  const failedNbp = pageConceptHasFailedNbpJobs(generationState);
  const cgptRetry = pageConceptCgptManualRetryEligible(generationState);

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

  const cgptStageLine =
    generationState.activeGenerationStage?.includes('CGPT_RETRY_WAIT') ?
      generationState.activeGenerationStage.replace(/ · /g, ' · ').toUpperCase()
    : null;

  const generateBusyLabel =
    generating ?
      generationState.generationStatus === 'CGPT_RATE_LIMITED' && cgptStageLine ?
        cgptStageLine
      : generationState.generationStatus === 'NBP_RUNNING' ?
        'NBP RENDERING…'
      : generationState.generationStatus === 'GPT2_RUNNING' ?
        'GPT2 RUNNING…'
      : generationState.generationStatus === 'CGPT_RATE_LIMITED' ?
        'CGPT · RATE LIMITED · AUTOMATIC RETRY'
      : liveProgress.currentSubstep ?
        activeCgptSubstepCopy(liveProgress.currentSubstep)
      : liveProgress.currentStage === 'GPT2' ?
        'GPT2 AUTHORITY CONCEPT · RUNNING'
      : liveProgress.currentStage === 'NBP' && liveProgress.nbpActiveLabel ?
        `${liveProgress.nbpActiveLabel} · RUNNING`
      : 'GENERATING…'
    : mode === 'review' && reviewReady ?
      'READY FOR REVIEW'
    : null;

  const releaseForensics = usePageConceptReleaseForensics(open);

  const cgptSubstepStatesForPanel = useMemo(() => {
    if (!generating && !generationState.liveProgress) return undefined;
    const base = liveProgress.substepStatusById;
    if (!presentedSubstepStates) return base;
    return { ...base, ...presentedSubstepStates };
  }, [generating, generationState.liveProgress, liveProgress.substepStatusById, presentedSubstepStates]);

  if (!open) return null;

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
          cgptSubstepStates={cgptSubstepStatesForPanel}
          cgptSubstepDigests={
            generating || generationState.cgptSubsteps ?
              generationState.cgptSubsteps?.substepDigest
            : undefined
          }
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
            gpt2AwaitingFounderReview && !generating ?
              'REGENERATE AUTHORITY'
            : cgptAwaitingFounderReview && !generating ?
              'REGENERATE CGPT'
            : !generating && cgptRetry ?
              'RETRY CGPT'
            : !generating && blockingState?.executionError && !failedNbp ?
              'RETRY GENERATION'
            : undefined
          }
          tertiaryAction={
            (cgptAwaitingFounderReview || gpt2AwaitingFounderReview) && !generating && cgptBrief ?
              {
                label: 'RETURN TO CREATIVE DIRECTION',
                onClick: () => setFullBriefOpen(true),
                disabled: generating,
                testId: 'page-concept-return-creative-direction',
              }
            : null
          }
          secondaryAction={
            cgptAwaitingFounderReview && !generating && onContinueGpt2 ?
              {
                label: 'CONTINUE TO GPT2',
                onClick: onContinueGpt2,
                disabled: generating,
                testId: 'page-concept-continue-gpt2',
              }
            : gpt2AwaitingFounderReview && !generating && onContinueNbp ?
              {
                label: 'CONTINUE TO NBP',
                onClick: onContinueNbp,
                disabled: generating,
                testId: 'page-concept-continue-nbp',
              }
            : failedNbp && !generating ?
              {
                label: 'RETRY FAILED ONLY',
                onClick: onRetryFailed,
                disabled: generating,
                testId: 'page-concept-retry-failed',
              }
            : null
          }
          onGenerate={cgptRetry && !generating ? onRetryCgpt : onConfirm}
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
                `CURRENT STAGE ${generationState.activeGenerationStage ?? '—'}`,
                `CGPT CURRENT SUBSTEP ${generationState.cgptSubsteps?.currentCgptSubstep ?? liveProgress.currentSubstep ?? '—'}`,
                `CGPT SUBSTEP STATES ${JSON.stringify(generationState.cgptSubsteps?.substepStatusById ?? liveProgress.substepStatusById)}`,
                `CGPT ATTEMPT ${generationState.cgptSubsteps ? 'see run cgptMeta' : '—'}`,
                `SERVER UPDATED AT ${generationState.liveProgress?.updatedAt ?? '—'}`,
                runHealth ?
                  [
                    '',
                    'RUN HEALTH',
                    `BLOCKING ${runHealth.blockingError ?? '—'}`,
                    `HISTORICAL ${runHealth.historicalEvents.map((e) => e.message).join(' | ') || '—'}`,
                    `PARTIAL ${runHealth.partialFailures.map((e) => e.message).join(' | ') || '—'}`,
                  ].join('\n')
                : '',
                generationState.pipelineSet?.nbpPreDispatchInspector ?
                  [
                    '',
                    'NBP PRE-DISPATCH INSPECTOR',
                    `VISUAL AUTHORITY ${generationState.pipelineSet.nbpPreDispatchInspector.visualAuthorityPresent ? 'PRESENT' : 'MISSING'}`,
                    `SKIN v${generationState.pipelineSet.nbpPreDispatchInspector.skinContractVersion}`,
                    `CGPT ${generationState.pipelineSet.nbpPreDispatchInspector.cgptDirectionId}`,
                    `FUNCTION CONTRACT v${generationState.pipelineSet.nbpPreDispatchInspector.functionContractVersion}`,
                    `CURRENT SCREENSHOT ${generationState.pipelineSet.nbpPreDispatchInspector.currentScreenshotRole}`,
                    `AUTHORITY APPROVAL ${generationState.pipelineSet.nbpPreDispatchInspector.authorityApprovalId ?? 'PENDING'}`,
                    `IMAGE ORDER ${generationState.pipelineSet.nbpPreDispatchInspector.imageInputOrder.join(' → ')}`,
                    `PROMPT ${generationState.pipelineSet.nbpPreDispatchInspector.promptVersion}`,
                  ].join('\n')
                : '',
                progressForensics ?
                  [
                    '',
                    'PROGRESS OBSERVATION',
                    `FOUNDER_START_CONFIRMED ${progressForensics.founderStartConfirmed}`,
                    `RUN ID ${progressForensics.runId ?? '—'}`,
                    `RUN CREATED AT ${progressForensics.runCreatedAt ?? '—'}`,
                    `RUN STATUS ${progressForensics.runStatus ?? '—'}`,
                    `CURRENT STAGE ${progressForensics.currentStage ?? '—'}`,
                    `CURRENT SUBSTEP ${progressForensics.currentSubstep ?? '—'}`,
                    `LATEST EVENT SEQUENCE ${progressForensics.latestEventSequence}`,
                    `CLIENT OBSERVED SEQUENCE ${progressForensics.clientObservedSequence}`,
                    `UNREAD EVENT COUNT ${progressForensics.unreadEventCount}`,
                    `LAST POLL ${progressForensics.lastPollAt ?? '—'}`,
                    `AUTO-START ${progressForensics.autoStart}`,
                  ].join('\n')
                : '',
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
      {fullBriefOpen && cgptBrief ?
        <div className="s00-pcg__briefLayer" role="dialog" aria-label="Full creative brief" data-testid="page-concept-full-brief-layer">
          <button type="button" className="s00-pcg__briefScrim" aria-label="Close brief" onClick={() => setFullBriefOpen(false)} />
          <div className="s00-pcg__briefSheet">
            <header className="s00-pcg__briefSheetHead">
              <h3>CREATIVE DIRECTION BRIEF</h3>
              <button type="button" onClick={() => setFullBriefOpen(false)}>
                CLOSE
              </button>
            </header>
            <div className="s00-pcg__briefSheetBody">
              <PageConceptCgptBriefInspector
                brief={cgptBrief}
                handoff={handoffViewModel?.handoff ?? null}
                diagnostic={handoffViewModel?.diagnostic ?? {
                  identityGrounding: 'MISSING',
                  skinGrounding: 'MISSING',
                  pageFunction: 'MISSING',
                  currentCaptureRole: 'FUNCTION ONLY',
                  gpt2Handoff: 'CONTEXT_LOSS',
                }}
              />
            </div>
          </div>
        </div>
      : null}
    </div>
  );
}
