/**
 * P0.VR.PAGE-CONCEPT-GENERATOR-OPUS-SHELL1 + COMPOSER-INTEGRATION1 —
 * GENERATE PAGE CONCEPTS pop-up: Opus shell bound to the real pipeline.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

import type { PageConceptStageId, PageConceptStageState } from '../../../../../shared/site00-design-workspace-production/designPageConceptGeneratorShell.js';
import {
  buildGpt2MobileSlotPresentations,
  buildNbpSlotPresentations,
  pageConceptCanonicalGpt2MobileActive,
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
import { PageConceptPageFamilyContractPanel } from '../pageConceptGenerator/PageConceptPageFamilyContractPanel';
import { PageConceptViewportFamilyPanel } from '../pageConceptGenerator/PageConceptViewportFamilyPanel';
import { PageConceptGeneratorNbpStage } from '../pageConceptGenerator/PageConceptGeneratorNbpStage';
import {
  buildFounderJourneyRail,
  buildFounderSummaryMetrics,
  buildCgptBriefDigest,
  resolveFounderFooterCtaHint,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptFounderReviewPresentation.js';
import { CgptBriefDigestCard, Gpt2AuthorityResult } from '../pageConceptGenerator/PageConceptGeneratorResults';
import { PageConceptFounderTwinLifecyclePanel } from '../pageConceptGenerator/PageConceptFounderTwinLifecyclePanel';
import { PageConceptCgptBriefInspector } from '../pageConceptGenerator/PageConceptCgptBriefInspector';
import { PageConceptConceptInspectDrawer } from '../pageConceptGenerator/PageConceptConceptInspectDrawer';
import {
  PAGE_CONCEPT_GALLERY_INSPECT_EVENT,
  type PageConceptGalleryInspectDetail,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGalleryEvents.js';
import { listPageConceptCandidates } from '../../../../../shared/site00-design-workspace-production/designProjectBinding/designPageConceptModel.js';
import type { NbpSlotPresentation } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGeneratorBinding.js';
import { usePageConceptReleaseForensics } from './usePageConceptReleaseForensics';
import {
  buildPageConceptGpt2HandoffViewModel,
  resolveCgptBriefFromGenerationState,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCgptCreativeBrief.js';
import { compilePageFunctionContract } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/functionContract.js';
import type { PageConceptPostRunActionId } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPostRunControls.js';

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
  onRegenerateGpt2Authority,
  gpt2MobileAwaitingSelection,
  viewportFamilyHandlers,
  postRunReviewReady,
  postRunPrimaryAction,
  postRunSecondaryAction,
  postRunMoreActions,
  postRunControlHandlers,
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
  onRegenerateGpt2Authority?: () => void;
  gpt2MobileAwaitingSelection?: boolean;
  viewportFamilyHandlers?: {
    selectMobile: (conceptId: string) => void;
    approveExperience: () => void;
    runTablet: () => void;
    runDesktop: () => void;
    regenerateTablet: () => void;
    regenerateDesktop: () => void;
    approveFamily: () => void;
    approvePageFamily: () => void;
    markOpusShellsReady: () => void;
    lockFamily: () => void;
    createTwinPackage: () => void;
    regenerateMobileConcept: (conceptId: string) => void;
    regenerateAllMobileConcepts: () => void;
  };
  postRunReviewReady?: boolean;
  postRunPrimaryAction?: { label: string; testId: string } | null;
  postRunSecondaryAction?: { label: string; testId: string } | null;
  postRunMoreActions?: readonly { id: PageConceptPostRunActionId; label: string; testId: string }[];
  postRunControlHandlers?: Partial<Record<string, () => void>>;
}) {
  const [fullBriefOpen, setFullBriefOpen] = useState(false);
  const [galleryInspectSlot, setGalleryInspectSlot] = useState<NbpSlotPresentation | null>(null);

  useEffect(() => {
    if (!open) setFullBriefOpen(false);
  }, [open]);

  useEffect(() => {
    const onGalleryInspect = (event: Event) => {
      const detail = (event as CustomEvent<PageConceptGalleryInspectDetail>).detail;
      if (!detail?.conceptId) return;
      if (detail.projectId !== generationState.projectId || detail.pageId !== generationState.pageId) return;
      const row = listPageConceptCandidates(detail.projectId, detail.pageId).find(
        (c) => c.conceptId === detail.conceptId,
      );
      const letter =
        row?.conceptSlot === 'MOBILE_CONCEPT_A' ? 'A'
        : row?.conceptSlot === 'MOBILE_CONCEPT_B' ? 'B'
        : row?.conceptSlot === 'MOBILE_CONCEPT_C' ? 'C'
        : null;
      const slots = buildGpt2MobileSlotPresentations(generationState);
      const slot = letter ? slots.find((s) => s.label === letter) ?? null : null;
      if (slot) setGalleryInspectSlot(slot);
    };
    window.addEventListener(PAGE_CONCEPT_GALLERY_INSPECT_EVENT, onGalleryInspect);
    return () => window.removeEventListener(PAGE_CONCEPT_GALLERY_INSPECT_EVENT, onGalleryInspect);
  }, [generationState]);

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

  const gpt2MobileStage = pageConceptCanonicalGpt2MobileActive(generationState);
  const founderSummaryMetrics = useMemo(
    () => (gpt2MobileStage ? buildFounderSummaryMetrics(generationState) : undefined),
    [generationState, gpt2MobileStage],
  );
  const founderJourneyRail = useMemo(
    () => (gpt2MobileStage ? buildFounderJourneyRail(generationState) : undefined),
    [generationState, gpt2MobileStage],
  );
  const founderFooterHint = useMemo(
    () => (gpt2MobileStage ? resolveFounderFooterCtaHint(generationState) : null),
    [generationState, gpt2MobileStage],
  );
  const nbpSlots = useMemo(() => buildNbpSlotPresentations(generationState), [generationState]);
  const gpt2MobileDebugLines = useMemo(() => {
    const jobs = generationState.generationJobs.filter((j) => j.provider === 'GPT2_MOBILE');
    return jobs.flatMap((j) => {
      const d = j.gpt2MobileDebug;
      if (!d) return [];
      const archLines = d.pageArchitectureDebugLines ?? [];
      const previewLine =
        d.compiledProviderPromptPreview ?
          `COMPILED PROMPT PREVIEW: ${d.compiledProviderPromptPreview.slice(0, 280).replace(/\s+/g, ' ').trim()}…`
        : null;
      return [
        `${j.displayTitle ?? j.artifactId}: PROVIDER ${d.provider} · ${d.transport}`,
        `CAPTURE ${d.captureInfluenceMode} · BOTTOM CONTINUITY ${d.bottomContinuityApplied ? 'YES' : 'NO'}`,
        `PAGE VALIDITY ${d.pageValidityPass ? 'PASS' : 'FAIL'} · POSTER WARN ${d.posterDriftWarning ? 'YES' : 'NO'} · SCREENSHOT OVERREACH ${d.screenshotOverreachWarning ? 'YES' : 'NO'}`,
        `TERRITORY ${d.territoryLabel}`,
        ...(d.compiledPromptCharCount != null ?
          [
            `PROVIDER PROMPT CHAR COUNT: ${d.compiledPromptCharCount} · SAFE LIMIT: ${d.providerPromptSafeLimit ?? 24000}`,
          ]
        : []),
        ...(previewLine ? [previewLine] : []),
        ...archLines,
      ];
    });
  }, [generationState.generationJobs]);

  const results = useMemo(() => {
    const hasAnyOutput =
      injection || gpt2 || nbpSlots.some((s) => s.status !== 'PENDING') || generating;
    if (!hasAnyOutput && mode === 'confirm' && !generating) return {};
    return {
      cgptBrief:
        cgptBrief ?
          gpt2MobileStage || cgptAwaitingFounderReview ?
            <CgptBriefDigestCard
              digest={buildCgptBriefDigest(cgptBrief)}
              onViewFull={() => setFullBriefOpen(true)}
              onContinueGpt2={cgptAwaitingFounderReview && onContinueGpt2 ? onContinueGpt2 : undefined}
            />
          : <CgptBriefDigestCard
              digest={buildCgptBriefDigest(cgptBrief)}
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
            stageMode={gpt2MobileStage ? 'GPT2_MOBILE' : 'NBP'}
            onInspect={(src, title) => openImage(src, title)}
            onSelectMobile={
              viewportFamilyHandlers ?
                (slot) => {
                  const concept = generationState.pipelineSet?.mobileConcepts?.find(
                    (c) => c.slot === `MOBILE_CONCEPT_${slot.label}`,
                  );
                  if (concept) viewportFamilyHandlers.selectMobile(concept.conceptId);
                }
              : undefined
            }
            onRegenerateMobile={
              viewportFamilyHandlers ?
                (slot) => {
                  const concept = generationState.pipelineSet?.mobileConcepts?.find(
                    (c) => c.slot === `MOBILE_CONCEPT_${slot.label}`,
                  );
                  if (concept) viewportFamilyHandlers.regenerateMobileConcept(concept.conceptId);
                }
              : undefined
            }
            selectedMobileLabel={
              generationState.pipelineSet?.viewportAuthorityFamily?.selectedMobileConceptId ?
                (generationState.pipelineSet.mobileConcepts?.find(
                  (c) => c.conceptId === generationState.pipelineSet?.viewportAuthorityFamily?.selectedMobileConceptId,
                )?.slot.replace('MOBILE_CONCEPT_', '') as 'A' | 'B' | 'C' | undefined) ?? null
              : null
            }
          />
        : undefined,
    };
  }, [
    cgptAwaitingFounderReview,
    cgptBrief,
    generationState,
    gpt2,
    gpt2MobileStage,
    mode,
    nbpSlots,
    generating,
    onContinueGpt2,
    openImage,
    viewportFamilyHandlers,
  ]);

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
        gpt2MobileStage ?
          'GPT2 MOBILE PAGE CONCEPTS · RUNNING'
        : 'GPT2 AUTHORITY CONCEPT · RUNNING'
      : liveProgress.currentStage === 'NBP' && liveProgress.nbpActiveLabel ?
        `${liveProgress.nbpActiveLabel} · RUNNING`
      : 'GENERATING…'
    : mode === 'review' && reviewReady && !postRunReviewReady ?
      'READY FOR REVIEW'
    : null;

  const showPostRunFooter =
    Boolean(postRunReviewReady) &&
    !generating &&
    !cgptAwaitingFounderReview &&
    !gpt2AwaitingFounderReview &&
    Boolean(postRunPrimaryAction);

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
        <div className="s00-pcg-layer__scrollBody">
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
            reviewReady && !generating ?
              showPostRunFooter ?
                gpt2MobileStage ?
                  'RUN COMPLETE — REVIEW OUTPUTS OR START A NEW GENERATION BRANCH.'
                : 'RUN COMPLETE — REVIEW OUTPUTS OR START A NEW GENERATION BRANCH.'
              : 'READY FOR FOUNDER REVIEW — STAGE-AWARE CONTROLS BELOW.'
            : null
          }
          footSpendNote={mode === 'confirm' && plan ? spendNote : null}
          generateDisabled={generateDisabled}
          generateDisabledReason={generateBlockReason ?? founderNotice}
          generateBusyLabel={generateBusyLabel}
          generateLabel={
            gpt2MobileAwaitingSelection && !generating ?
              'NEW GENERATION'
            : gpt2AwaitingFounderReview && !generating && !gpt2MobileStage ?
              'CONTINUE (LEGACY NBP)'
            : cgptAwaitingFounderReview && !generating ?
              'REGENERATE CGPT'
            : !generating && cgptRetry ?
              'RETRY CGPT'
            : !generating && blockingState?.executionError && !failedNbp ?
              'RETRY GENERATION'
            : undefined
          }
          tertiaryAction={
            gpt2AwaitingFounderReview && !generating ?
              {
                label: 'REGENERATE AUTHORITY',
                onClick: () => onRegenerateGpt2Authority?.(),
                disabled: generating,
                testId: 'page-concept-regenerate-gpt2-authority',
              }
            : (cgptAwaitingFounderReview || gpt2AwaitingFounderReview) && !generating && cgptBrief ?
              {
                label: 'RETURN TO CREATIVE DIRECTION',
                onClick: () => setFullBriefOpen(true),
                disabled: generating,
                testId: 'page-concept-return-creative-direction',
              }
            : null
          }
          postRunPrimaryAction={
            showPostRunFooter && postRunPrimaryAction ?
              {
                label: postRunPrimaryAction.label,
                testId: postRunPrimaryAction.testId,
                onClick: () => postRunControlHandlers?.view_renditions?.(),
              }
            : null
          }
          postRunSecondaryAction={
            showPostRunFooter && postRunSecondaryAction ?
              {
                label: postRunSecondaryAction.label,
                testId: postRunSecondaryAction.testId,
                onClick: () => postRunControlHandlers?.new_generation?.(),
              }
            : null
          }
          postRunMoreActions={
            showPostRunFooter && postRunMoreActions ?
              postRunMoreActions.map((action) => ({
                label: action.label,
                testId: action.testId,
                onClick: () => postRunControlHandlers?.[action.id]?.(),
              }))
            : undefined
          }
          secondaryAction={
            showPostRunFooter ?
              null
            : cgptAwaitingFounderReview && !generating && onContinueGpt2 ?
              {
                label: 'CONTINUE TO GPT2',
                onClick: onContinueGpt2,
                disabled: generating,
                testId: 'page-concept-continue-gpt2',
              }
            : gpt2AwaitingFounderReview && !generating && onContinueNbp && !gpt2MobileStage ?
              {
                label: 'CONTINUE (LEGACY NBP)',
                onClick: onContinueNbp,
                disabled: generating,
                testId: 'page-concept-continue-nbp',
              }
            : gpt2MobileAwaitingSelection && !generating ?
              {
                label: 'SELECT MOBILE CONCEPT',
                onClick: onCancel,
                disabled: generating,
                testId: 'page-concept-mobile-selection',
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
          onGenerate={
            gpt2AwaitingFounderReview && !generating && onContinueNbp && !gpt2MobileStage ?
              () => onContinueNbp?.()
            : cgptRetry && !generating ?
              onRetryCgpt
            : onConfirm
          }
          onCancel={onCancel}
          founderSummaryMetrics={founderSummaryMetrics}
          founderJourneyRail={founderJourneyRail}
          founderFooterHint={founderFooterHint}
          useFounderJourneyRail={gpt2MobileStage}
          mobileStageAccordion={gpt2MobileStage}
          singleActiveStageOnly={gpt2MobileStage && (mode === 'review' || gpt2MobileAwaitingSelection)}
          onClose={onCancel}
        />
        </div>
        {gpt2MobileStage && !gpt2MobileAwaitingSelection ?
          <PageConceptFounderTwinLifecyclePanel state={generationState} busy={generating} />
        : null}
        {(!gpt2MobileAwaitingSelection &&
          (generationState.generationStatus === 'VIEWPORT_FAMILY_REVIEW' ||
            generationState.generationStatus === 'PAGE_FAMILY_CONTRACT_REVIEW' ||
            generationState.generationStatus === 'VIEWPORT_FAMILY_LOCKED' ||
            generationState.generationStatus === 'TWIN_IMPLEMENTATION_PACKAGE_READY')) &&
        viewportFamilyHandlers ?
          <>
            <PageConceptViewportFamilyPanel
              state={generationState}
              busy={generating}
              onSelectMobile={viewportFamilyHandlers.selectMobile}
              onContinueExperience={viewportFamilyHandlers.approveExperience}
              onRunTablet={viewportFamilyHandlers.runTablet}
              onRunDesktop={viewportFamilyHandlers.runDesktop}
              onRegenerateTablet={viewportFamilyHandlers.regenerateTablet}
              onRegenerateDesktop={viewportFamilyHandlers.regenerateDesktop}
              onApproveFamily={viewportFamilyHandlers.approveFamily}
              onLockFamily={viewportFamilyHandlers.lockFamily}
              onCreateTwinPackage={viewportFamilyHandlers.createTwinPackage}
              onOpenImage={(src, title) => openImage(src, title)}
            />
            <PageConceptPageFamilyContractPanel
              state={generationState}
              busy={generating}
              onApprovePageFamily={viewportFamilyHandlers.approvePageFamily}
              onMarkOpusShellsReady={viewportFamilyHandlers.markOpusShellsReady}
            />
          </>
        : null}
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
                gpt2MobileDebugLines.length > 0 ?
                  ['', 'GPT2 MOBILE PAGE AUTHORITY (STEP 2)', ...gpt2MobileDebugLines].join('\n')
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
                projectPageLabel={`${plan?.projectLabel ?? generationState.projectId} / ${plan?.pageLabel ?? generationState.pageId}`.toUpperCase()}
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
      {galleryInspectSlot ?
        <PageConceptConceptInspectDrawer slot={galleryInspectSlot} onClose={() => setGalleryInspectSlot(null)} />
      : null}
    </div>
  );
}
