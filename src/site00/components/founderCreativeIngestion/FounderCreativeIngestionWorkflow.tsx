import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { CreativeReferenceDiff, FounderCreativeIngestionState } from '../../../../shared/site00-studio-world-production/founderCreativeIngestion/client.js';
import {
  founderCreativeFalGenerationFailed,
  founderCreativeFalGenerationInProgress,
  getSequenceSpecs,
  hasDraftReferenceVersion,
} from '../../../../shared/site00-studio-world-production/founderCreativeIngestion/client.js';
import { site00ProjectContentOperationsCampaignBoardPath } from '../../config/routes';
import { QuietAction } from '../founderWorkspace/WorkspaceCompositionPrimitives';
import { site00ProjectsApi, Site00ProjectsApiError } from '../../services/site00ProjectsApi';
import { prepareReferenceBoardUpload } from '../../utils/prepareReferenceBoardUpload';
import {
  FounderCreativeInspectDrawer,
  FounderCreativeInspectToggle,
  FounderCreativeWorkflowShell,
} from './FounderCreativeInspectDrawer';
import { FounderCreativeWorkflowStepper } from './FounderCreativeWorkflowShell';
import { useFounderCreativeWorkflow } from './useFounderCreativeWorkflow';
import { FounderCreativeIngestStage } from './stages/FounderCreativeIngestStage';
import { FounderCreativeDecomposeStage } from './stages/FounderCreativeDecomposeStage';
import { FounderCreativeSlideReviewStage } from './stages/FounderCreativeSlideReviewStage';
import {
  FounderCreativeCompletionStage,
  FounderCreativeSequenceReviewStage,
} from './stages/FounderCreativeSequenceReviewStage';
import { FounderCreativeSequencePicker } from './stages/FounderCreativeSequencePicker';

const POLL_MS = 5000;

export function FounderCreativeIngestionWorkflow({
  projectSlug,
  ingestion,
  onIngestionChange,
  loading,
}: {
  projectSlug: string;
  ingestion: FounderCreativeIngestionState;
  onIngestionChange: (next: FounderCreativeIngestionState) => void;
  loading: boolean;
}) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [inspectOpen, setInspectOpen] = useState(false);
  const [estimate, setEstimate] = useState<{ estimatedCostUsd: number; provider: string; readiness: string } | null>(null);
  const [comparisonDiff, setComparisonDiff] = useState<CreativeReferenceDiff | null>(null);

  const {
    sequenceId,
    step,
    slideIndex,
    compareTab,
    decomposing,
    specs,
    hydrated,
    actions,
  } = useFounderCreativeWorkflow({ projectSlug, ingestion });

  const activeSequence = useMemo(
    () => ingestion.parentSequences.find((entry) => entry.sequenceId === sequenceId) ?? null,
    [ingestion, sequenceId],
  );

  const isGenerating = founderCreativeFalGenerationInProgress(ingestion);
  const generationFailed = founderCreativeFalGenerationFailed(ingestion);
  const generatingSlideId = ingestion.falGenerationTracking?.currentSlideId ?? null;

  const reload = useCallback(async () => {
    const result = await site00ProjectsApi.founderCreativeIngestionGet(projectSlug);
    if (result.ingestion) onIngestionChange(result.ingestion as FounderCreativeIngestionState);
  }, [projectSlug, onIngestionChange]);

  useEffect(() => {
    if (!isGenerating) return undefined;
    const id = window.setInterval(() => void reload(), POLL_MS);
    return () => window.clearInterval(id);
  }, [isGenerating, reload]);

  const act = useCallback(
    async (fn: () => Promise<{ ingestion?: Record<string, unknown> }>) => {
      setBusy(true);
      setActionError(null);
      try {
        const result = await fn();
        if (result.ingestion) onIngestionChange(result.ingestion as FounderCreativeIngestionState);
        else await reload();
      } catch (err) {
        setActionError(err instanceof Site00ProjectsApiError ? err.message : 'Ingestion action failed');
      } finally {
        setBusy(false);
      }
    },
    [onIngestionChange, reload],
  );

  useEffect(() => {
    if (!decomposing || !sequenceId) return;
    const nextSpecs = getSequenceSpecs(ingestion, sequenceId);
    if (nextSpecs.length > 0) {
      actions.markDecomposing(false);
      actions.setStep('SLIDE_REVIEW');
      actions.setSlideIndex(0);
    }
  }, [decomposing, ingestion, sequenceId, actions]);

  if (!activeSequence || !sequenceId || !hydrated) {
    return <p className="site00-fci-gw__help">Loading workflow…</p>;
  }

  const draftVersion = ingestion.referenceVersions.find(
    (entry) => entry.parentSequenceId === sequenceId && entry.status === 'DRAFT',
  );

  const handleUpload = async (file: File) => {
    actions.afterUploadSuccess();
    await act(async () => {
      const imageData = await prepareReferenceBoardUpload(file);
      const result = await site00ProjectsApi.founderCreativeIngestionUploadReference(
        projectSlug,
        sequenceId,
        imageData,
        'Founder-approved notebook-native board',
      );
      setComparisonDiff((result.diff as CreativeReferenceDiff | null) ?? null);
      return result;
    });
  };

  const currentSlide = specs[slideIndex];

  return (
    <FounderCreativeWorkflowShell
      inspect={
        <FounderCreativeInspectDrawer
          open={inspectOpen}
          onClose={() => setInspectOpen(false)}
          ingestion={ingestion}
          sequenceId={sequenceId}
        />
      }
    >
      <FounderCreativeWorkflowStepper
        currentStep={step}
        onSelect={(nextStep) => {
          if (nextStep === 'SEQUENCE_REVIEW' && specs.length === 0) return;
          actions.setStep(nextStep);
        }}
      />

      <FounderCreativeSequencePicker
        sequences={ingestion.parentSequences}
        activeSequenceId={sequenceId}
        onSelect={actions.selectSequence}
      />

      {actionError ? (
        <p className="site00-fci__error" role="alert">
          {actionError}
        </p>
      ) : null}

      {generationFailed && ingestion.falGenerationTracking?.errorMessage ? (
        <section className="site00-fci__error-panel" role="alert">
          <p>{ingestion.falGenerationTracking.errorMessage}</p>
        </section>
      ) : null}

      {step === 'INGEST' ? (
        <FounderCreativeIngestStage
          sequence={activeSequence}
          ingestion={ingestion}
          busy={busy || loading}
          onUpload={handleUpload}
          onInvalidFile={() => setActionError('Reference board must be an image file (PNG, JPG, or WebP).')}
          onDecomposeExisting={
            specs.length === 0
              ? () =>
                  void act(async () => {
                    const result = await site00ProjectsApi.founderCreativeIngestionDecompose(projectSlug, sequenceId);
                    actions.setStep('SLIDE_REVIEW');
                    actions.setSlideIndex(0);
                    return result;
                  })
              : undefined
          }
        />
      ) : null}

      {step === 'DECOMPOSE' ? (
        <FounderCreativeDecomposeStage
          sequenceTitle={activeSequence.title}
          draftVersionLabel={draftVersion ? `Draft reference v${draftVersion.versionNumber}` : 'Draft reference'}
          specs={specs}
          busy={busy || decomposing}
          generatingSlideId={generatingSlideId}
        />
      ) : null}

      {step === 'SLIDE_REVIEW' && currentSlide ? (
        <FounderCreativeSlideReviewStage
          sequence={activeSequence}
          specs={specs}
          slideIndex={slideIndex}
          compareTab={compareTab}
          busy={busy || isGenerating}
          generatingSlideId={generatingSlideId}
          estimate={estimate}
          onCompareTabChange={actions.setCompareTab}
          onPrevSlide={actions.goPrevSlide}
          onNextSlide={actions.goNextSlide}
          onSelectSlide={actions.setSlideIndex}
          onApprove={() =>
            void act(async () => {
              const result = await site00ProjectsApi.founderCreativeIngestionSlideJudgment(
                projectSlug,
                currentSlide.slideId,
                'APPROVE_SLIDE',
              );
              if (slideIndex < specs.length - 1) actions.goNextSlide();
              else actions.setStep('SEQUENCE_REVIEW');
              return result;
            })
          }
          onReject={(reason) =>
            void act(() =>
              site00ProjectsApi.founderCreativeIngestionSlideJudgment(projectSlug, currentSlide.slideId, 'CLOSE_REVISE'),
            ).then(() => setActionError(reason))
          }
          onRegenerate={() =>
            void act(async () => {
              const est = await site00ProjectsApi.founderCreativeIngestionEstimate(projectSlug, currentSlide.slideId);
              setEstimate(est.estimate as typeof estimate);
              return site00ProjectsApi.founderCreativeIngestionGeneratePhoto(projectSlug, currentSlide.slideId);
            })
          }
          onQuickReview={(judgment) =>
            void act(() =>
              site00ProjectsApi.founderCreativeIngestionSlideJudgment(projectSlug, currentSlide.slideId, judgment),
            )
          }
          onEditPrompt={(prompt) =>
            void act(() => site00ProjectsApi.founderCreativeIngestionEditPrompt(projectSlug, currentSlide.slideId, prompt))
          }
          onUploadHq={async (file) => {
            const imageData = await prepareReferenceBoardUpload(file);
            await act(async () => {
              await site00ProjectsApi.founderCreativeIngestionPhotoMode(
                projectSlug,
                currentSlide.slideId,
                'UPLOAD_HQ',
              );
              return site00ProjectsApi.founderCreativeIngestionReplacePhoto(
                projectSlug,
                currentSlide.slideId,
                `hq-upload-${currentSlide.slideId}`,
                imageData,
              );
            });
          }}
          onReplaceCanonicalHq={
            activeSequence.sequenceId.includes('meet-ndx')
              ? () =>
                  void act(() =>
                    site00ProjectsApi.founderCreativeIngestionReplacePhoto(
                      projectSlug,
                      currentSlide.slideId,
                      'ndx-hq-desk-photo-canonical',
                    ),
                  )
              : undefined
          }
          onEstimate={() =>
            void site00ProjectsApi
              .founderCreativeIngestionEstimate(projectSlug, currentSlide.slideId)
              .then((result) => setEstimate(result.estimate as typeof estimate))
          }
        />
      ) : null}

      {step === 'SEQUENCE_REVIEW' ? (
        <FounderCreativeSequenceReviewStage
          sequence={activeSequence}
          specs={specs}
          busy={busy}
          generatingSlideId={generatingSlideId}
          onReturnToSlide={(index) => {
            actions.setSlideIndex(index);
            actions.setStep('SLIDE_REVIEW');
          }}
          onApproveSequence={() =>
            void act(async () => {
              const result = await site00ProjectsApi.founderCreativeIngestionSequenceReview(projectSlug, sequenceId);
              actions.setStep('COMPLETE');
              return result;
            })
          }
          onPromoteReference={() =>
            void act(() => site00ProjectsApi.founderCreativeIngestionPromoteReference(projectSlug, sequenceId))
          }
          onRegisterCampaign={() => void act(() => site00ProjectsApi.founderCreativeIngestionRegisterCampaign(projectSlug))}
          registeredOnCampaignBoard={ingestion.registeredOnCampaignBoard}
        />
      ) : null}

      {step === 'COMPLETE' ? (
        <FounderCreativeCompletionStage
          sequence={activeSequence}
          ingestion={ingestion}
          onViewCampaignBoard={() => navigate(site00ProjectContentOperationsCampaignBoardPath(projectSlug))}
          onReviewSlides={() => {
            actions.setStep('SLIDE_REVIEW');
            actions.setSlideIndex(0);
          }}
          onStartNextSequence={() => {
            const currentIndex = ingestion.parentSequences.findIndex((entry) => entry.sequenceId === sequenceId);
            const next = ingestion.parentSequences[currentIndex + 1];
            if (next) actions.selectSequence(next.sequenceId);
          }}
        />
      ) : null}

      {comparisonDiff ? (
        <p className="site00-fci-gw__help">
          Decomposition detected {comparisonDiff.oldSlideCount} → {comparisonDiff.newSlideCount} slides.
        </p>
      ) : null}

      <div className="site00-fci-gw__global-actions">
        {step !== 'SEQUENCE_REVIEW' && specs.length > 0 ? (
          <QuietAction disabled={busy} onClick={() => actions.setStep('SEQUENCE_REVIEW')}>
            Open sequence review →
          </QuietAction>
        ) : null}
        {hasDraftReferenceVersion(ingestion, sequenceId) && step !== 'INGEST' ? (
          <QuietAction
            disabled={busy}
            onClick={() =>
              void act(() => site00ProjectsApi.founderCreativeIngestionPromoteReference(projectSlug, sequenceId))
            }
          >
            Promote new reference →
          </QuietAction>
        ) : null}
        {ingestion.registeredOnCampaignBoard ? (
          <Link to={site00ProjectContentOperationsCampaignBoardPath(projectSlug)} className="site00-fci__link">
            Open campaign board →
          </Link>
        ) : null}
        <FounderCreativeInspectToggle onClick={() => setInspectOpen(true)} />
      </div>
    </FounderCreativeWorkflowShell>
  );
}
