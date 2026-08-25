/**
 * P0.CB.1 — Founder creative ingestion workflow page.
 */

import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { FounderWorkspaceShell } from '../components/founderWorkspace/FounderWorkspaceShell';
import { QuietAction, InlineMeta, WorkspaceField } from '../components/founderWorkspace/WorkspaceCompositionPrimitives';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import {
  site00ProjectContentOperationsCampaignBoardPath,
} from '../config/routes';
import {
  INGESTION_WORKFLOW_STEPS,
  PHOTOGRAPHY_SOURCE_MODES,
  RECONSTRUCTION_REVIEW_JUDGMENTS,
} from '../../../shared/site00-studio-world-production/founderCreativeIngestion/client.js';
import type {
  FounderCreativeIngestionState,
  FounderCreativeParentSequence,
  SlideReconstructionSpec,
} from '../../../shared/site00-studio-world-production/founderCreativeIngestion/client.js';
import '../styles/site00-founder-creative-ingestion.css';

export default function ProjectFounderCreativeIngestionPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [ingestion, setIngestion] = useState<FounderCreativeIngestionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [activeSequenceId, setActiveSequenceId] = useState<string | null>(null);
  const [activeSlideId, setActiveSlideId] = useState<string | null>(null);
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

  const act = async (fn: () => Promise<Record<string, unknown>>) => {
    setBusy(true);
    try {
      const result = await fn();
      setIngestion(result.ingestion as FounderCreativeIngestionState);
    } finally {
      setBusy(false);
    }
  };

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
                        <span className="site00-fci__row-meta">{seq.slideIds.length || '—'} slides · {seq.role}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <div className="site00-fci__actions">
                  <QuietAction
                    disabled={busy}
                    onClick={() => void act(() => site00ProjectsApi.founderCreativeIngestionDecomposeAll(projectSlug))}
                  >
                    DECOMPOSE ALL REFERENCES →
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
                  <SequencePanel
                    sequence={activeSequence}
                    specs={sequenceSpecs}
                    referenceUrl={
                      ingestion.referenceAssets.find((a) => a.assetId.includes(activeSequence.sequenceId) || true)?.previewUrl
                    }
                    activeSlideId={activeSlideId}
                    onSelectSlide={setActiveSlideId}
                    busy={busy}
                    onSlideAction={async (action, slideId, extra) => {
                      if (action === 'estimate') {
                        const est = await site00ProjectsApi.founderCreativeIngestionEstimate(projectSlug, slideId);
                        setEstimate(est.estimate as typeof estimate);
                        return;
                      }
                      if (action === 'generate') {
                        await act(() => site00ProjectsApi.founderCreativeIngestionGeneratePhoto(projectSlug, slideId, false));
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
            Reference boards decompose into slide specs — never uploaded as finished production. Generation is founder-triggered only.
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

function SequencePanel({
  sequence,
  specs,
  referenceUrl,
  activeSlideId,
  onSelectSlide,
  busy,
  onSlideAction,
}: {
  sequence: FounderCreativeParentSequence;
  specs: SlideReconstructionSpec[];
  referenceUrl: string | null | undefined;
  activeSlideId: string | null;
  onSelectSlide: (id: string) => void;
  busy: boolean;
  onSlideAction: (
    action: 'estimate' | 'generate' | 'approve' | 'photo_mode' | 'replace_hq',
    slideId: string,
    extra?: { mode?: string; assetId?: string },
  ) => Promise<void>;
}) {
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
            className={`site00-fci__slide-chip${activeSlideId === spec.slideId ? ' site00-fci__slide-chip--active' : ''}`}
            onClick={() => onSelectSlide(spec.slideId)}
          >
            {String(i + 1).padStart(2, '0')} · {spec.reviewStatus}
          </button>
        ))}
      </div>
      {specs[0] ? (
        <div className="site00-fci__sequence-actions">
          <QuietAction disabled={busy} onClick={() => void onSlideAction('estimate', specs[0]!.slideId)}>
            ESTIMATE COST
          </QuietAction>
          <QuietAction disabled={busy} onClick={() => void onSlideAction('generate', specs[0]!.slideId)}>
            GENERATE PHOTO (founder trigger)
          </QuietAction>
          {sequence.sequenceId.includes('meet-ndx') ? (
            <QuietAction
              disabled={busy}
              onClick={() =>
                void onSlideAction('replace_hq', specs[0]!.slideId, { assetId: 'ndx-hq-desk-photo-canonical' })
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
          <div className="site00-fci__compare-placeholder">
            {slide.productionMasterUrl ?? 'Pending reconstruction'}
          </div>
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
