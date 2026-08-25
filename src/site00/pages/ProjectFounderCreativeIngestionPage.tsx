/**
 * P0.CB.1 — Founder creative ingestion workflow page.
 */

import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { FounderWorkspaceShell } from '../components/founderWorkspace/FounderWorkspaceShell';
import { QuietAction, InlineMeta, WorkspaceField } from '../components/founderWorkspace/WorkspaceCompositionPrimitives';
import { site00ProjectsApi, Site00ProjectsApiError } from '../services/site00ProjectsApi';
import {
  site00ProjectContentOperationsCampaignBoardPath,
} from '../config/routes';
import {
  INGESTION_WORKFLOW_STEPS,
  PHOTOGRAPHY_SOURCE_MODES,
  RECONSTRUCTION_REVIEW_JUDGMENTS,
  founderCreativeFalGenerationFailed,
  founderCreativeFalGenerationInProgress,
  hasDraftReferenceVersion,
  parentReferenceStatusLabel,
} from '../../../shared/site00-studio-world-production/founderCreativeIngestion/client.js';
import type {
  FounderCreativeIngestionState,
  FounderCreativeParentSequence,
  SlideReconstructionSpec,
  CreativeReferenceDiff,
} from '../../../shared/site00-studio-world-production/founderCreativeIngestion/client.js';
import { prepareReferenceBoardUpload } from '../utils/prepareReferenceBoardUpload';
import '../styles/site00-founder-creative-ingestion.css';

const POLL_MS = 5000;

export default function ProjectFounderCreativeIngestionPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [ingestion, setIngestion] = useState<FounderCreativeIngestionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeSequenceId, setActiveSequenceId] = useState<string | null>(null);
  const [activeSlideId, setActiveSlideId] = useState<string | null>(null);
  const [comparisonDiff, setComparisonDiff] = useState<CreativeReferenceDiff | null>(null);
  const [estimate, setEstimate] = useState<{ estimatedCostUsd: number; provider: string; readiness: string } | null>(null);

  const reload = useCallback(async () => {
    if (projectSlug !== 'ndxbook') return;
    try {
      const result = await site00ProjectsApi.founderCreativeIngestionGet(projectSlug);
      setIngestion((result.ingestion as FounderCreativeIngestionState | null) ?? null);
    } finally {
      setLoading(false);
    }
  }, [projectSlug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const isGenerating = Boolean(ingestion && founderCreativeFalGenerationInProgress(ingestion));
  const generationFailed = Boolean(ingestion && founderCreativeFalGenerationFailed(ingestion));

  useEffect(() => {
    if (!ingestion || !founderCreativeFalGenerationInProgress(ingestion)) return undefined;
    const id = window.setInterval(() => void reload(), POLL_MS);
    return () => window.clearInterval(id);
  }, [ingestion, reload]);

  useEffect(() => {
    if (!ingestion?.parentSequences.length || activeSequenceId) return;
    setActiveSequenceId(ingestion.parentSequences[0]!.sequenceId);
  }, [ingestion, activeSequenceId]);

  const act = async (fn: () => Promise<{ ingestion?: Record<string, unknown> }>) => {
    setBusy(true);
    setActionError(null);
    try {
      const result = await fn();
      if (result.ingestion) setIngestion(result.ingestion as FounderCreativeIngestionState);
      else await reload();
    } catch (err) {
      setActionError(err instanceof Site00ProjectsApiError ? err.message : 'Ingestion action failed');
    } finally {
      setBusy(false);
    }
  };

  const decomposeAll = () =>
    void act(async () => {
      const result = await site00ProjectsApi.founderCreativeIngestionDecomposeAll(projectSlug);
      const next = result.ingestion as FounderCreativeIngestionState;
      if (next.parentSequences[0]) setActiveSequenceId(next.parentSequences[0].sequenceId);
      setActiveSlideId(null);
      return result;
    });

  const activeSequence = useMemo(
    () => ingestion?.parentSequences.find((s) => s.sequenceId === activeSequenceId) ?? null,
    [ingestion, activeSequenceId],
  );

  const sequenceSpecs = useMemo(
    () => ingestion?.reconstructionSpecs.filter((s) => s.sequenceId === activeSequenceId) ?? [],
    [ingestion, activeSequenceId],
  );

  const activeSlide = useMemo(
    () => ingestion?.reconstructionSpecs.find((s) => s.slideId === activeSlideId) ?? null,
    [ingestion, activeSlideId],
  );

  const referenceUrl = useMemo(() => {
    if (!ingestion || !activeSequenceId) return null;
    return (
      ingestion.referenceAssets.find((a) => a.assetId === `ref-board-${activeSequenceId}`)?.previewUrl ?? null
    );
  }, [ingestion, activeSequenceId]);

  const generationProgress = useMemo(() => {
    const tracking = ingestion?.falGenerationTracking;
    if (!tracking) return null;
    const total = tracking.slideIds.length;
    const done = tracking.completedSlideIds.length;
    return { total, done, currentSlideId: tracking.currentSlideId };
  }, [ingestion]);

  if (projectSlug !== 'ndxbook') {
    return (
      <EcosystemShell hidePageHeader>
        <p>Founder creative ingestion is NDXBOOK-only.</p>
      </EcosystemShell>
    );
  }

  return (
    <EcosystemShell hidePageHeader>
      <FounderWorkspaceShell
        projectSlug={projectSlug}
        title="INGEST FOUNDER CREATIVE"
        subtitle={ingestion?.campaignLabel ?? 'REFERENCE → DECOMPOSE → RECONSTRUCT → REVIEW'}
        hideWorkspaceHeader
        operate={
          <WorkspaceField className="site00-fci">
            <nav className="site00-fci__steps" aria-label="Ingestion workflow">
              {INGESTION_WORKFLOW_STEPS.map((step) => (
                <span
                  key={step}
                  className={`site00-fci__step${ingestion?.workflowStep === step ? ' site00-fci__step--active' : ''}`}
                >
                  {step}
                </span>
              ))}
            </nav>

            {actionError ? (
              <p className="site00-fci__error" role="alert">
                {actionError}
              </p>
            ) : null}

            {!ingestion ? (
              <div className="site00-fci__hero">
                <p className="site00-fci__lead">
                  Bring founder-created carousel direction into Studio World. References are NOT production assets.
                </p>
                <QuietAction
                  disabled={busy || loading}
                  onClick={() => void act(() => site00ProjectsApi.founderCreativeIngestionInitializeRow01(projectSlug))}
                >
                  START LAUNCH ROW 01 →
                </QuietAction>
              </div>
            ) : (
              <>
                <section className="site00-fci__row-preview" aria-label="Instagram Row 01">
                  <h2 className="site00-fci__section-title">ROW 01</h2>
                  <div className="site00-fci__row-grid">
                    {ingestion.parentSequences.map((seq) => (
                      <button
                        key={seq.sequenceId}
                        type="button"
                        className={`site00-fci__row-tile${activeSequenceId === seq.sequenceId ? ' site00-fci__row-tile--active' : ''}`}
                        onClick={() => {
                          setActiveSequenceId(seq.sequenceId);
                          setActiveSlideId(null);
                        }}
                      >
                        <span className="site00-fci__row-num">{String(seq.rowIndex + 1).padStart(2, '0')}</span>
                        <span className="site00-fci__row-title">{seq.title}</span>
                        <span className="site00-fci__row-meta">
                          {seq.slideIds.length || '—'} slides · {seq.role}
                          {seq.referenceStatus ? ` · ${parentReferenceStatusLabel(seq.referenceStatus)}` : ''}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>

                {isGenerating ? (
                  <section className="site00-fci__progress" aria-live="polite">
                    <h2 className="site00-fci__section-title">RECONSTRUCTING SLIDES</h2>
                    <p>
                      Calling FAL for slide photography in the background — safe to refresh or leave this page.
                    </p>
                    {generationProgress ? (
                      <p className="site00-fci__progress-meta">
                        {generationProgress.done} / {generationProgress.total} slides complete
                        {generationProgress.currentSlideId ? ` · working ${generationProgress.currentSlideId}` : ''}
                      </p>
                    ) : null}
                  </section>
                ) : null}

                {generationFailed && ingestion.falGenerationTracking?.errorMessage ? (
                  <section className="site00-fci__error-panel" role="alert">
                    <p>{ingestion.falGenerationTracking.errorMessage}</p>
                    <QuietAction disabled={busy} onClick={decomposeAll}>
                      RETRY DECOMPOSE + RECONSTRUCT →
                    </QuietAction>
                  </section>
                ) : null}

                <div className="site00-fci__actions">
                  <QuietAction disabled={busy || isGenerating} onClick={decomposeAll}>
                    {ingestion.reconstructionSpecs.length > 0 ? 'RE-DECOMPOSE ALL REFERENCES →' : 'DECOMPOSE ALL REFERENCES →'}
                  </QuietAction>
                  <QuietAction
                    disabled={busy}
                    onClick={() =>
                      void act(async () => {
                        const uploads = ingestion.parentSequences.map((seq) => ({
                          sequenceId: seq.sequenceId,
                          previewUrl: `/api/placeholder/founder-creative/reference-v2/${seq.sequenceId}`,
                          notes: 'Founder-approved notebook-native board v2',
                        }));
                        return site00ProjectsApi.founderCreativeIngestionBulkReplaceReferences(projectSlug, uploads);
                      })
                    }
                  >
                    REPLACE MULTIPLE REFERENCES →
                  </QuietAction>
                  {ingestion.registeredOnCampaignBoard ? (
                    <Link to={site00ProjectContentOperationsCampaignBoardPath(projectSlug)} className="site00-fci__link">
                      OPEN CAMPAIGN BOARD →
                    </Link>
                  ) : (
                    <QuietAction
                      disabled={busy || ingestion.reconstructionSpecs.length === 0}
                      onClick={() => void act(() => site00ProjectsApi.founderCreativeIngestionRegisterCampaign(projectSlug))}
                    >
                      REGISTER ON CAMPAIGN BOARD →
                    </QuietAction>
                  )}
                </div>

                {activeSequence ? (
                  <>
                    <ReferenceReplacementPanel
                      sequence={activeSequence}
                      ingestion={ingestion}
                      busy={busy}
                      diff={comparisonDiff}
                      onUploadFile={(file) =>
                        void act(async () => {
                          const imageData = await prepareReferenceBoardUpload(file);
                          const result = await site00ProjectsApi.founderCreativeIngestionUploadReference(
                            projectSlug,
                            activeSequence.sequenceId,
                            imageData,
                            'Founder-approved notebook-native board',
                          );
                          setComparisonDiff(null);
                          return result;
                        })
                      }
                      onReplace={() =>
                        void act(async () => {
                          const result = await site00ProjectsApi.founderCreativeIngestionReplaceReference(
                            projectSlug,
                            activeSequence.sequenceId,
                            `/api/placeholder/founder-creative/reference-v2/${activeSequence.sequenceId}`,
                            'Founder-approved notebook-native board',
                          );
                          setComparisonDiff(null);
                          return result;
                        })
                      }
                      onRedecompose={() =>
                        void act(async () => {
                          const result = await site00ProjectsApi.founderCreativeIngestionRedecomposeDraft(
                            projectSlug,
                            activeSequence.sequenceId,
                          );
                          setComparisonDiff((result.diff as CreativeReferenceDiff | null) ?? null);
                          return result;
                        })
                      }
                      onPromote={() =>
                        void act(() =>
                          site00ProjectsApi.founderCreativeIngestionPromoteReference(projectSlug, activeSequence.sequenceId),
                        )
                      }
                      onCompare={async () => {
                        const result = await site00ProjectsApi.founderCreativeIngestionReferenceComparison(
                          projectSlug,
                          activeSequence.sequenceId,
                        );
                        setComparisonDiff((result.comparison.diff as CreativeReferenceDiff | null) ?? null);
                      }}
                    />
                    <SequencePanel
                    sequence={activeSequence}
                    specs={sequenceSpecs}
                    referenceUrl={referenceUrl}
                    activeSlideId={activeSlideId}
                    generatingSlideId={ingestion.falGenerationTracking?.currentSlideId ?? null}
                    onSelectSlide={setActiveSlideId}
                    busy={busy || isGenerating}
                    onSlideAction={async (action, slideId, extra) => {
                      if (action === 'estimate') {
                        const est = await site00ProjectsApi.founderCreativeIngestionEstimate(projectSlug, slideId);
                        setEstimate(est.estimate as typeof estimate);
                        return;
                      }
                      if (action === 'generate') {
                        await act(() => site00ProjectsApi.founderCreativeIngestionGeneratePhoto(projectSlug, slideId));
                        return;
                      }
                      if (action === 'approve') {
                        await act(() =>
                          site00ProjectsApi.founderCreativeIngestionSlideJudgment(projectSlug, slideId, 'APPROVE_SLIDE'),
                        );
                        return;
                      }
                      if (action === 'photo_mode' && extra?.mode) {
                        await act(() =>
                          site00ProjectsApi.founderCreativeIngestionPhotoMode(
                            projectSlug,
                            slideId,
                            extra.mode!,
                            extra.assetId,
                          ),
                        );
                        return;
                      }
                      if (action === 'replace_hq' && extra?.assetId) {
                        await act(() =>
                          site00ProjectsApi.founderCreativeIngestionReplacePhoto(projectSlug, slideId, extra.assetId!),
                        );
                      }
                    }}
                  />
                  </>
                ) : null}

                {activeSlide ? (
                  <SlideReviewPanel
                    slide={activeSlide}
                    estimate={estimate}
                    busy={busy}
                    onEditPrompt={(prompt) =>
                      void act(() => site00ProjectsApi.founderCreativeIngestionEditPrompt(projectSlug, activeSlide.slideId, prompt))
                    }
                    onJudgment={(judgment) =>
                      void act(() =>
                        site00ProjectsApi.founderCreativeIngestionSlideJudgment(projectSlug, activeSlide.slideId, judgment),
                      )
                    }
                  />
                ) : null}

                <aside className="site00-fci__inspect">
                  <InlineMeta label="Character" value={ingestion.characterIdentity.message} />
                  <InlineMeta label="FAL still requests" value={String(ingestion.falImageRequests)} />
                  <InlineMeta label="FAL video requests" value={String(ingestion.falVideoRequests)} />
                  <InlineMeta label="Photo modes" value={PHOTOGRAPHY_SOURCE_MODES.join(' · ')} />
                </aside>
              </>
            )}
          </WorkspaceField>
        }
        understand={
          <p style={{ margin: 0, fontSize: 11, color: '#999' }}>
            Decompose splits reference boards into slide specs, then queues FAL reconstruction for photography slides.
          </p>
        }
        inspect={
          <p style={{ margin: 0, fontSize: 11, color: '#999' }}>
            Provenance: FOUNDER_CREATED · EXTERNAL_CHATGPT_CREATIVE_SESSION · CAMPAIGN_APPROVED_CREATIVE
          </p>
        }
      />
    </EcosystemShell>
  );
}

function ReferenceReplacementPanel({
  sequence,
  ingestion,
  busy,
  diff,
  onUploadFile,
  onReplace,
  onRedecompose,
  onPromote,
  onCompare,
}: {
  sequence: FounderCreativeParentSequence;
  ingestion: FounderCreativeIngestionState;
  busy: boolean;
  diff: CreativeReferenceDiff | null;
  onUploadFile: (file: File) => void;
  onReplace: () => void;
  onRedecompose: () => void;
  onPromote: () => void;
  onCompare: () => Promise<void>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasDraft = hasDraftReferenceVersion(ingestion, sequence.sequenceId);
  const draftVersion = ingestion.referenceVersions.find(
    (entry) =>
      entry.parentSequenceId === sequence.sequenceId &&
      entry.status === 'DRAFT',
  );
  const activeVersion = ingestion.referenceVersions.find(
    (entry) =>
      entry.parentSequenceId === sequence.sequenceId &&
      entry.status === 'ACTIVE',
  );
  const draftAsset = draftVersion
    ? ingestion.referenceAssets.find((entry) => entry.assetId === draftVersion.referenceAssetId)
    : null;
  const activeAsset = activeVersion
    ? ingestion.referenceAssets.find((entry) => entry.assetId === activeVersion.referenceAssetId)
    : null;

  return (
    <section className="site00-fci__replacement">
      <h2 className="site00-fci__section-title">REFERENCE VERSION</h2>
      <div className="site00-fci__compare site00-fci__compare--triple">
        <div className="site00-fci__compare-col">
          <p className="site00-fci__compare-label">OLD (ACTIVE v{activeVersion?.versionNumber ?? 1})</p>
          {activeAsset?.previewUrl ? (
            <img src={activeAsset.previewUrl} alt="Active reference" className="site00-fci__reference-img" />
          ) : (
            <div className="site00-fci__compare-placeholder">No active reference</div>
          )}
        </div>
        <div className="site00-fci__compare-col">
          <p className="site00-fci__compare-label">NEW (DRAFT v{draftVersion?.versionNumber ?? '—'})</p>
          {draftAsset?.previewUrl ? (
            <img src={draftAsset.previewUrl} alt="Draft reference" className="site00-fci__reference-img" />
          ) : (
            <div className="site00-fci__compare-placeholder">Upload replacement to compare</div>
          )}
        </div>
        <div className="site00-fci__compare-col">
          <p className="site00-fci__compare-label">CURRENT PRODUCTION</p>
          <div className="site00-fci__compare-placeholder">
            {ingestion.reconstructionSpecs.filter((entry) => entry.sequenceId === sequence.sequenceId && entry.productionMasterUrl).length}{' '}
            slides with production masters
          </div>
        </div>
      </div>
      <div className="site00-fci__sequence-actions">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="site00-fci__file-input"
          aria-hidden
          tabIndex={-1}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onUploadFile(file);
            event.target.value = '';
          }}
        />
        <QuietAction disabled={busy} onClick={() => fileInputRef.current?.click()}>
          UPLOAD REFERENCE BOARD →
        </QuietAction>
        <QuietAction disabled={busy} onClick={onReplace}>
          USE PLACEHOLDER REFERENCE (DEV) →
        </QuietAction>
        {hasDraft ? (
          <>
            <QuietAction disabled={busy} onClick={onRedecompose}>
              RE-DECOMPOSE DRAFT →
            </QuietAction>
            <QuietAction disabled={busy} onClick={() => void onCompare()}>
              REFRESH COMPARISON
            </QuietAction>
            <QuietAction disabled={busy} onClick={onPromote}>
              USE THIS REFERENCE (PROMOTE) →
            </QuietAction>
          </>
        ) : null}
      </div>
      {diff ? (
        <div className="site00-fci__diff">
          <InlineMeta label="Slide count" value={`${diff.oldSlideCount} → ${diff.newSlideCount}`} />
          {diff.addedSlides.length > 0 ? <InlineMeta label="Added" value={diff.addedSlides.join(', ')} /> : null}
          {diff.removedSlides.length > 0 ? <InlineMeta label="Removed" value={diff.removedSlides.join(', ')} /> : null}
          {diff.reorderedSlides.length > 0 ? <InlineMeta label="Reordered" value={diff.reorderedSlides.join(', ')} /> : null}
          <InlineMeta
            label="Changes"
            value={`copy ${diff.changes.filter((entry) => entry.copyChanged).length} · photo ${diff.changes.filter((entry) => entry.photoChanged).length} · material ${diff.changes.filter((entry) => entry.materialChanged).length}`}
          />
        </div>
      ) : null}
    </section>
  );
}

function SequencePanel({
  sequence,
  specs,
  referenceUrl,
  activeSlideId,
  generatingSlideId,
  onSelectSlide,
  busy,
  onSlideAction,
}: {
  sequence: FounderCreativeParentSequence;
  specs: SlideReconstructionSpec[];
  referenceUrl: string | null | undefined;
  activeSlideId: string | null;
  generatingSlideId: string | null;
  onSelectSlide: (id: string) => void;
  busy: boolean;
  onSlideAction: (
    action: 'estimate' | 'generate' | 'approve' | 'photo_mode' | 'replace_hq',
    slideId: string,
    extra?: { mode?: string; assetId?: string },
  ) => Promise<void>;
}) {
  const firstPhotoSlide = specs.find((spec) => spec.photography.required) ?? specs[0];

  return (
    <section className="site00-fci__sequence">
      <h2 className="site00-fci__section-title">{sequence.title}</h2>
      {referenceUrl ? (
        <div className="site00-fci__reference-art">
          <img src={referenceUrl} alt="Reference board" className="site00-fci__reference-img" />
          <p className="site00-fci__reference-label">REFERENCE — not production</p>
        </div>
      ) : null}
      <div className="site00-fci__slide-strip">
        {specs.map((spec, i) => (
          <button
            key={spec.slideId}
            type="button"
            className={`site00-fci__slide-chip${activeSlideId === spec.slideId ? ' site00-fci__slide-chip--active' : ''}${generatingSlideId === spec.slideId ? ' site00-fci__slide-chip--generating' : ''}`}
            onClick={() => onSelectSlide(spec.slideId)}
          >
            {String(i + 1).padStart(2, '0')} · {generatingSlideId === spec.slideId ? 'GENERATING' : spec.reviewStatus}
          </button>
        ))}
      </div>
      {firstPhotoSlide ? (
        <div className="site00-fci__sequence-actions">
          <QuietAction disabled={busy} onClick={() => void onSlideAction('estimate', firstPhotoSlide.slideId)}>
            ESTIMATE COST
          </QuietAction>
          <QuietAction disabled={busy} onClick={() => void onSlideAction('generate', firstPhotoSlide.slideId)}>
            GENERATE PHOTO (founder trigger)
          </QuietAction>
          {sequence.sequenceId.includes('meet-ndx') ? (
            <QuietAction
              disabled={busy}
              onClick={() =>
                void onSlideAction('replace_hq', firstPhotoSlide.slideId, { assetId: 'ndx-hq-desk-photo-canonical' })
              }
            >
              USE EXISTING HQ
            </QuietAction>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function SlideReviewPanel({
  slide,
  estimate,
  busy,
  onEditPrompt,
  onJudgment,
}: {
  slide: SlideReconstructionSpec;
  estimate: { estimatedCostUsd: number; provider: string; readiness: string } | null;
  busy: boolean;
  onEditPrompt: (prompt: string) => void;
  onJudgment: (judgment: string) => void;
}) {
  const [promptDraft, setPromptDraft] = useState(slide.photography.reconstructionPrompt);

  useEffect(() => {
    setPromptDraft(slide.photography.reconstructionPrompt);
  }, [slide.slideId, slide.photography.reconstructionPrompt]);

  return (
    <section className="site00-fci__review">
      <h2 className="site00-fci__section-title">RECONSTRUCTION REVIEW</h2>
      <div className="site00-fci__compare">
        <div className="site00-fci__compare-col">
          <p className="site00-fci__compare-label">REFERENCE</p>
          <div className="site00-fci__compare-placeholder">Reference evidence</div>
        </div>
        <div className="site00-fci__compare-col">
          <p className="site00-fci__compare-label">PRODUCTION</p>
          {slide.productionMasterUrl && slide.productionMasterUrl.startsWith('http') ? (
            <img src={slide.productionMasterUrl} alt="Production reconstruction" className="site00-fci__production-img" />
          ) : (
            <div className="site00-fci__compare-placeholder">
              {slide.productionMasterUrl ?? 'Pending reconstruction'}
            </div>
          )}
        </div>
      </div>

      {slide.photography.required ? (
        <div className="site00-fci__prompt">
          <label className="site00-fci__prompt-label" htmlFor="photo-prompt">
            Photography reconstruction prompt
          </label>
          <textarea
            id="photo-prompt"
            className="site00-fci__prompt-input"
            value={promptDraft}
            onChange={(e) => setPromptDraft(e.target.value)}
            rows={8}
          />
          <QuietAction disabled={busy} onClick={() => onEditPrompt(promptDraft)}>
            SAVE PROMPT
          </QuietAction>
          {estimate ? (
            <InlineMeta
              label="Estimate"
              value={`${estimate.provider} · $${estimate.estimatedCostUsd.toFixed(2)} · ${estimate.readiness}`}
            />
          ) : null}
        </div>
      ) : null}

      <div className="site00-fci__judgments">
        {RECONSTRUCTION_REVIEW_JUDGMENTS.map((j) => (
          <button
            key={j}
            type="button"
            className="site00-fci__judgment-btn"
            disabled={busy}
            onClick={() => onJudgment(j)}
          >
            {j.replace(/_/g, ' ')}
          </button>
        ))}
      </div>
    </section>
  );
}
