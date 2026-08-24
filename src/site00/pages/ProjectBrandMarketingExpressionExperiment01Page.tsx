import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { ProjectExperimentsHubNav } from '../components/projects/ProjectExperimentsHubNav';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import { site00ProjectBrandMarketingExpressionPath, site00ProjectPath } from '../config/routes';
import { projectDisplayName } from '../utils/projectDisplayName';
import type {
  BrandMarketingArtifact,
  BrandMarketingExpressionRun,
} from '../../../shared/site00-brand-lore/brandMarketingExpression/types';
import type {
  Experiment01V2Artifact,
  MarketingExpressionExperiment01V2,
} from '../../../shared/site00-brand-lore/editorialInformationArchitecture/types';
import type {
  Experiment01V21Artifact,
  MarketingExpressionExperiment01V21,
} from '../../../shared/site00-brand-lore/culturalVisualParticipation/types';
import type {
  Experiment01V22Artifact,
  MarketingExpressionExperiment01V22,
} from '../../../shared/site00-brand-lore/characterRetention/types';
import { MARKETING_ARTIFACT_FOUNDER_JUDGMENTS, MARKETING_SET_FOUNDER_JUDGMENTS } from '../../../shared/site00-brand-lore/brandMarketingExpression/constants';
import { V2_FOUNDER_JUDGMENTS } from '../../../shared/site00-brand-lore/editorialInformationArchitecture/constants';
import { V21_FOUNDER_JUDGMENTS } from '../../../shared/site00-brand-lore/culturalVisualParticipation/constants';
import type {
  Experiment01V23Artifact,
  MarketingExpressionExperiment01V23,
} from '../../../shared/site00-brand-lore/artBoardMateriality/types';
import { V22_FOUNDER_JUDGMENTS } from '../../../shared/site00-brand-lore/characterRetention/constants';
import { V23_FOUNDER_JUDGMENTS, V23A_FOUNDER_JUDGMENTS, V23B_FOUNDER_JUDGMENTS } from '../../../shared/site00-brand-lore/artBoardMateriality/constants';
import {
  isV23ApprovalJudgment,
  judgmentRequiresRevisionNote,
  revisionNotePlaceholder,
} from '../../../shared/site00-brand-lore/artBoardMateriality/v23FounderRevisionLabels';
import {
  v23BoardNeedsReformulation,
  v23BoardSignatureLimeReadyCount,
  v23BoardCurrentLineageReadyCount,
  v23ArtifactHasSignatureLimeInPrompt,
  v23ArtifactGenerationReadiness,
  v23ArtifactIsLegacyGeneration,
  v23ArtifactMethodologyStatus,
  v23ArtifactPromptFreshnessState,
  v23FounderLimeReview,
  v23GenerationJobStatusLabel,
} from '../../../shared/site00-brand-lore/artBoardMateriality/v23BoardReadinessClient';
import { Site00ImageInspectLightbox } from '../components/common/Site00ImageInspectLightbox';
import '../styles/site00-replay-execution.css';

const POLL_MS = 5000;

type VersionTab = 'V1' | 'V2' | 'V21' | 'V22' | 'V23';

type VersionArtifactLists = {
  v1: BrandMarketingArtifact[];
  v2: Experiment01V2Artifact[];
  v21: Experiment01V21Artifact[];
  v22: Experiment01V22Artifact[];
  v23: Experiment01V23Artifact[];
};

/** Strict version board — never fall back to another version's artifacts for display. */
function artifactsForVersionTab(tab: VersionTab, lists: VersionArtifactLists) {
  switch (tab) {
    case 'V23':
      return lists.v23;
    case 'V22':
      return lists.v22;
    case 'V21':
      return lists.v21;
    case 'V2':
      return lists.v2;
    default:
      return lists.v1;
  }
}

function listsFromRun(run: BrandMarketingExpressionRun | null): VersionArtifactLists {
  return {
    v1: run?.experiment01?.artifacts ?? [],
    v2: (run?.experiment01V2 as MarketingExpressionExperiment01V2 | null | undefined)?.generatedArtifacts ?? [],
    v21: (run?.experiment01V21 as MarketingExpressionExperiment01V21 | null | undefined)?.generatedArtifacts ?? [],
    v22: (run?.experiment01V22 as MarketingExpressionExperiment01V22 | null | undefined)?.generatedArtifacts ?? [],
    v23: (run?.experiment01V23 as MarketingExpressionExperiment01V23 | null | undefined)?.generatedArtifacts ?? [],
  };
}

export default function ProjectBrandMarketingExpressionExperiment01Page() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<BrandMarketingExpressionRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [versionTab, setVersionTab] = useState<VersionTab>('V23');
  const [v23RevisionDraft, setV23RevisionDraft] = useState<{ artifactId: string; judgment: string } | null>(null);
  const [v23RevisionNote, setV23RevisionNote] = useState('');
  const [inspectImage, setInspectImage] = useState<{ url: string; alt: string } | null>(null);

  const reload = useCallback(async () => {
    if (projectSlug !== 'ndxbook') return;
    try {
      const result = await site00ProjectsApi.marketingExpressionGet(projectSlug);
      const next = (result.run as BrandMarketingExpressionRun | null) ?? null;
      setRun(next);
      const lists = listsFromRun(next);
      const board = artifactsForVersionTab(versionTab, lists);
      if (board.length > 0) {
        setSelectedId((prev) => (prev && board.some((a) => a.id === prev) ? prev : board[0]!.id));
      }
    } catch {
      setRun(null);
    } finally {
      setLoading(false);
    }
  }, [projectSlug, versionTab]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    const lists = listsFromRun(run);
    const board = artifactsForVersionTab(versionTab, lists);
    if (!board.length) {
      setSelectedId(null);
      return;
    }
    setSelectedId((prev) => (prev && board.some((a) => a.id === prev) ? prev : board[0]!.id));
  }, [versionTab, run]);

  useEffect(() => {
    const generating =
      run?.status === 'EXPERIMENT_01_FORMULATING' ||
      run?.status === 'EXPERIMENT_01_GENERATING' ||
      run?.status === 'EXPERIMENT_01_V2_GENERATING' ||
      run?.status === 'EXPERIMENT_01_V21_GENERATING' ||
      run?.status === 'EXPERIMENT_01_V22_GENERATING' ||
      run?.status === 'EXPERIMENT_01_V23_GENERATING' ||
      run?.experiment01?.artifacts.some((artifact) => artifact.generationStatus === 'GENERATING') ||
      run?.experiment01V2?.generatedArtifacts.some((artifact) => artifact.generationStatus === 'GENERATING') ||
      run?.experiment01V21?.generatedArtifacts.some((artifact) => artifact.generationStatus === 'GENERATING') ||
      run?.experiment01V22?.generatedArtifacts.some((artifact) => artifact.generationStatus === 'GENERATING') ||
      run?.experiment01V23?.generatedArtifacts.some((artifact) => artifact.generationStatus === 'GENERATING');
    if (!generating) return;
    const id = window.setInterval(() => void reload(), POLL_MS);
    return () => window.clearInterval(id);
  }, [run, reload]);

  const formulate = async () => {
    setBusy(true);
    try {
      const result = await site00ProjectsApi.marketingExpressionExperiment01Formulate(projectSlug);
      setRun((result.run as BrandMarketingExpressionRun) ?? null);
      await reload();
    } finally {
      setBusy(false);
    }
  };

  const formulateV2 = async () => {
    setBusy(true);
    try {
      const result = await site00ProjectsApi.marketingExpressionExperiment01V2Formulate(projectSlug);
      setRun((result.run as BrandMarketingExpressionRun) ?? null);
      setVersionTab('V2');
      await reload();
    } finally {
      setBusy(false);
    }
  };

  const formulateV21 = async () => {
    setBusy(true);
    try {
      const result = await site00ProjectsApi.marketingExpressionExperiment01V21Formulate(projectSlug);
      setRun((result.run as BrandMarketingExpressionRun) ?? null);
      setVersionTab('V21');
      await reload();
    } finally {
      setBusy(false);
    }
  };

  const formulateV22 = async () => {
    setBusy(true);
    try {
      const result = await site00ProjectsApi.marketingExpressionExperiment01V22Formulate(projectSlug);
      setRun((result.run as BrandMarketingExpressionRun) ?? null);
      setVersionTab('V22');
      await reload();
    } finally {
      setBusy(false);
    }
  };

  const formulateV23 = async (options?: { force?: boolean }) => {
    const existingV23Count = run?.experiment01V23?.generatedArtifacts?.length ?? 0;
    if (
      options?.force &&
      existingV23Count > 0 &&
      !window.confirm(
        'Re-formulate V2.3 contracts? This replaces all nine V2.3 contracts and clears generated images. You will need to generate again.',
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await site00ProjectsApi.marketingExpressionExperiment01V23Formulate(projectSlug);
      const nextRun = (result.run as BrandMarketingExpressionRun) ?? null;
      setRun(nextRun);
      setVersionTab('V23');
      const firstV23 = nextRun?.experiment01V23?.generatedArtifacts[0]?.id ?? null;
      setSelectedId(firstV23);
      setV23RevisionDraft(null);
      setV23RevisionNote('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'V2.3 formulation failed');
    } finally {
      setBusy(false);
    }
  };

  const selectVersionTab = (tab: VersionTab) => {
    setVersionTab(tab);
    const lists = listsFromRun(run);
    const board = artifactsForVersionTab(tab, lists);
    setSelectedId(board[0]?.id ?? null);
  };

  const regenerateCurrentV23 = async (artifactId: string) => {
    setBusy(true);
    setError(null);
    try {
      const result = await site00ProjectsApi.marketingExpressionExperiment01V23Generate(
        projectSlug,
        artifactId,
        'REGENERATE_CURRENT',
      );
      setRun(result.run as BrandMarketingExpressionRun);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Regeneration failed');
    } finally {
      setBusy(false);
    }
  };

  const regenerateAllV23 = async () => {
    if (
      !window.confirm(
        'Regenerate all nine V2.3 slides from current contracts? Prior images stay in lineage — this runs nine new FAL generations.',
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await site00ProjectsApi.marketingExpressionExperiment01V23RegenerateAll(projectSlug);
      setRun((result.run as BrandMarketingExpressionRun) ?? null);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Regenerate all failed');
    } finally {
      setBusy(false);
    }
  };

  const generateAll = async () => {
    setBusy(true);
    try {
      const fn =
        versionTab === 'V23'
          ? site00ProjectsApi.marketingExpressionExperiment01V23GenerateAll
          : versionTab === 'V22'
            ? site00ProjectsApi.marketingExpressionExperiment01V22GenerateAll
          : versionTab === 'V21'
            ? site00ProjectsApi.marketingExpressionExperiment01V21GenerateAll
            : versionTab === 'V2'
              ? site00ProjectsApi.marketingExpressionExperiment01V2GenerateAll
              : site00ProjectsApi.marketingExpressionExperiment01GenerateAll;
      const result = await fn(projectSlug);
      setRun((result.run as BrandMarketingExpressionRun) ?? null);
      await reload();
    } finally {
      setBusy(false);
    }
  };

  const setArtifactJudgment = async (artifactId: string, judgment: string) => {
    setBusy(true);
    try {
      const fn =
        versionTab === 'V23'
          ? site00ProjectsApi.marketingExpressionExperiment01V23ArtifactJudgment
          : versionTab === 'V22'
            ? site00ProjectsApi.marketingExpressionExperiment01V22ArtifactJudgment
          : versionTab === 'V21'
            ? site00ProjectsApi.marketingExpressionExperiment01V21ArtifactJudgment
            : versionTab === 'V2'
              ? site00ProjectsApi.marketingExpressionExperiment01V2ArtifactJudgment
              : site00ProjectsApi.marketingExpressionExperiment01ArtifactJudgment;
      const result = await fn(projectSlug, artifactId, judgment);
      setRun((result.run as BrandMarketingExpressionRun) ?? null);
    } finally {
      setBusy(false);
    }
  };

  const onV23JudgmentTap = (artifactId: string, judgment: string) => {
    if (isV23ApprovalJudgment(judgment)) {
      void setArtifactJudgment(artifactId, judgment);
      return;
    }
    if (judgmentRequiresRevisionNote(judgment)) {
      setV23RevisionNote('');
      setV23RevisionDraft({ artifactId, judgment });
      return;
    }
    void setArtifactJudgment(artifactId, judgment);
  };

  const cancelV23RevisionDraft = () => {
    setV23RevisionDraft(null);
    setV23RevisionNote('');
  };

  useEffect(() => {
    if (!v23RevisionDraft) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) cancelV23RevisionDraft();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [v23RevisionDraft, busy]);

  const submitV23FounderRevision = async () => {
    if (!v23RevisionDraft) return;
    const note = v23RevisionNote.trim();
    if (!note) {
      setError('Add a revision note describing what should change before confirming.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await site00ProjectsApi.marketingExpressionExperiment01V23FounderRevision(
        projectSlug,
        v23RevisionDraft.artifactId,
        v23RevisionDraft.judgment,
        note,
      );
      setRun((result.run as BrandMarketingExpressionRun) ?? null);
      cancelV23RevisionDraft();
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Founder revision failed');
    } finally {
      setBusy(false);
    }
  };

  const setSetJudgment = async (judgment: string) => {
    setBusy(true);
    try {
      const result = await site00ProjectsApi.marketingExpressionExperiment01SetJudgment(projectSlug, judgment);
      setRun((result.run as BrandMarketingExpressionRun) ?? null);
    } finally {
      setBusy(false);
    }
  };

  if (projectSlug !== 'ndxbook') {
    return (
      <EcosystemShell hidePageHeader>
        <p>Experiment 01 is NDXBOOK-only.</p>
      </EcosystemShell>
    );
  }

  const exp = run?.experiment01;
  const expV2 = run?.experiment01V2 as MarketingExpressionExperiment01V2 | null | undefined;
  const expV21 = run?.experiment01V21 as MarketingExpressionExperiment01V21 | null | undefined;
  const expV22 = run?.experiment01V22 as MarketingExpressionExperiment01V22 | null | undefined;
  const v1Artifacts = exp?.artifacts ?? [];
  const v2Artifacts = expV2?.generatedArtifacts ?? [];
  const v21Artifacts = expV21?.generatedArtifacts ?? [];
  const v22Artifacts = expV22?.generatedArtifacts ?? [];
  const expV23 = run?.experiment01V23 as MarketingExpressionExperiment01V23 | null | undefined;
  const v23Artifacts = expV23?.generatedArtifacts ?? [];
  const v23NeedsLimeReformulation = v23BoardNeedsReformulation(v23Artifacts);
  const v23LimeReadyCount = v23BoardSignatureLimeReadyCount(v23Artifacts);
  const v23CurrentLineageCount = v23BoardCurrentLineageReadyCount(v23Artifacts);
  const selectedV23Artifact = v23Artifacts.find((a) => a.id === selectedId);
  const selectedV23: Experiment01V23Artifact | undefined = selectedV23Artifact ?? v23Artifacts[0];
  const artifactLists: VersionArtifactLists = { v1: v1Artifacts, v2: v2Artifacts, v21: v21Artifacts, v22: v22Artifacts, v23: v23Artifacts };
  const activeArtifacts = artifactsForVersionTab(versionTab, artifactLists);
  const boardReady = activeArtifacts.length > 0;
  const selectedV22: Experiment01V22Artifact | undefined = v22Artifacts.find((a) => a.id === selectedId) ?? v22Artifacts[0];
  const selectedV21: Experiment01V21Artifact | undefined = v21Artifacts.find((a) => a.id === selectedId) ?? v21Artifacts[0];
  const selectedV1: BrandMarketingArtifact | undefined = v1Artifacts.find((a) => a.id === selectedId) ?? v1Artifacts[0];
  const selectedV2: Experiment01V2Artifact | undefined = v2Artifacts.find((a) => a.id === selectedId) ?? v2Artifacts[0];
  const generatedCount = activeArtifacts.filter((a) => a.generationStatus === 'GENERATED' && a.generatedAssetUrl).length;
  const pendingCount = activeArtifacts.filter((a) => a.generationStatus !== 'GENERATED' || !a.generatedAssetUrl).length;
  const generatingCount = activeArtifacts.filter((a) => a.generationStatus === 'GENERATING').length;
  const isRunStatusGenerating =
    run?.status === 'EXPERIMENT_01_GENERATING' ||
    run?.status === 'EXPERIMENT_01_V2_GENERATING' ||
    run?.status === 'EXPERIMENT_01_V21_GENERATING' ||
    run?.status === 'EXPERIMENT_01_V22_GENERATING' ||
    run?.status === 'EXPERIMENT_01_V23_GENERATING';
  const isGeneratingBoard = isRunStatusGenerating || generatingCount > 0;
  const allGenerated = activeArtifacts.length > 0 && generatedCount === activeArtifacts.length;
  const v23Superseded = expV23?.generationRunStatus === 'SUPERSEDED_BY_METHODOLOGY';
  const canRegenerateAllV23 =
    versionTab === 'V23' &&
    allGenerated &&
    !isGeneratingBoard &&
    generatedCount > 0;
  const canGenerateRemaining = pendingCount > 0 && !isGeneratingBoard && !(versionTab === 'V23' && v23Superseded);

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-cd site00-cd--project-calibration">
        <div className="site00-project-lore-calibration">
          <header className="site00-project-lore-calibration__hero">
            <ProjectExperimentsHubNav projectSlug={projectSlug} />
            <p className="site00-project-lore-calibration__kicker">EXPERIMENT 01 — V1 / V2 / V2.1 / V2.2 / V2.3</p>
            <h1 className="site00-project-lore-calibration__project">{projectDisplayName(projectSlug)}</h1>
            <p className="site00-project-lore-calibration__headline">NDX FEED — NINE FIRST SLIDES</p>
            <Link to={site00ProjectBrandMarketingExpressionPath(projectSlug)}>← MARKETING EXPRESSION</Link>
            <Link to={site00ProjectPath(projectSlug)}>← PROJECT</Link>
          </header>

          {loading ? (
            <p>Loading Experiment 01…</p>
          ) : (
            <>
              {error ? <p className="site00-cd__error" role="alert">{error}</p> : null}
              <section className="site00-experiment-g__panel">
                <h2>VERSION</h2>
                <button type="button" className={versionTab === 'V1' ? 'site00-btn site00-btn--primary' : 'site00-btn'} disabled={busy} onClick={() => selectVersionTab('V1')}>
                  V1 — ORIGINAL EXPRESSION TEST
                </button>
                <button type="button" className={versionTab === 'V2' ? 'site00-btn site00-btn--primary' : 'site00-btn'} disabled={busy} onClick={() => selectVersionTab('V2')}>
                  V2 — EDITORIAL DIRECTION TEST
                </button>
                <button type="button" className={versionTab === 'V21' ? 'site00-btn site00-btn--primary' : 'site00-btn'} disabled={busy} onClick={() => selectVersionTab('V21')}>
                  V2.1 — CULTURAL IMAGE PARTICIPATION
                </button>
                <button type="button" className={versionTab === 'V22' ? 'site00-btn site00-btn--primary' : 'site00-btn'} disabled={busy} onClick={() => selectVersionTab('V22')}>
                  V2.2 — CHARACTER RETENTION
                </button>
                <button type="button" className={versionTab === 'V23' ? 'site00-btn site00-btn--primary' : 'site00-btn'} disabled={busy} onClick={() => selectVersionTab('V23')}>
                  V2.3 — ART-BOARD MATERIALITY
                </button>
              </section>

              {v1Artifacts.length > 0 && !v2Artifacts.length && (
                <section className="site00-experiment-g__panel">
                  <p>V1 preserved as methodology evidence. Formulate V2 contracts (same nine topics, editorial information governance).</p>
                  <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={() => void formulateV2()}>
                    FORMULATE V2 CONTRACTS
                  </button>
                </section>
              )}

              {(v2Artifacts.length > 0 || v1Artifacts.length > 0) && !v21Artifacts.length && (
                <section className="site00-experiment-g__panel">
                  <p>P0.5C.1 hierarchy preserved. Formulate V2.1 cultural-image participation contracts (same nine topics — visual subject matter governance).</p>
                  <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={() => void formulateV21()}>
                    FORMULATE V2.1 CONTRACTS
                  </button>
                </section>
              )}

              {v21Artifacts.length > 0 && !v22Artifacts.length && (
                <section className="site00-experiment-g__panel">
                  <p>P0.5C.1 + P0.5C.2 preserved. Formulate V2.2 character retention contracts (same nine topics — low information, high character).</p>
                  <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={() => void formulateV22()}>
                    FORMULATE V2.2 CONTRACTS
                  </button>
                </section>
              )}

              {v22Artifacts.length > 0 && !v23Artifacts.length && (
                <section className="site00-experiment-g__panel">
                  <p>P0.5C.3 preserved. Formulate V2.3 art-board materiality contracts (canvas-as-object, signature lime required on every artifact).</p>
                  <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={() => void formulateV23()}>
                    FORMULATE V2.3 CONTRACTS
                  </button>
                </section>
              )}

              {versionTab === 'V23' && v23Artifacts.length > 0 && expV23?.generationSupersessionForensic && (
                <section className="site00-experiment-g__panel">
                  <h2>V2.3 GENERATION SUPERSEDED (P0.5C.4B.1)</h2>
                  <p>
                    Methodology supersession — not a generation failure. Stale pre-C4B.1 queue cancelled; completed assets preserved.
                  </p>
                  <dl>
                    <dt>PENDING CANCELLED</dt><dd>{expV23.generationSupersessionForensic.pendingJobsCancelled}</dd>
                    <dt>IN FLIGHT AT BOUNDARY</dt><dd>{expV23.generationSupersessionForensic.inFlightRequestsAtBoundary}</dd>
                    <dt>COMPLETED PRESERVED</dt><dd>{expV23.generationSupersessionForensic.completedAssetsPreserved}</dd>
                    <dt>EST. SPEND PREVENTED</dt><dd>${expV23.generationSupersessionForensic.estimatedSpendPrevented.toFixed(2)}</dd>
                  </dl>
                  <p style={{ fontSize: '0.85rem' }}>Use REGENERATE CURRENT per slide after governance passes — no automatic batch restart.</p>
                </section>
              )}

                  {versionTab === 'V23' && v23Artifacts.length > 0 && (
                <section className="site00-experiment-g__panel">
                  <h2>V2.3 GENERATION AUTHORITY (P0.5C.5A)</h2>
                  <p>Structured contract = current authority · Prompt snapshot = immutable receipt</p>
                  <p>Current lineage ready: {v23CurrentLineageCount}/9 · Prompt stale does not auto-trigger FAL</p>
                </section>
              )}

              {versionTab === 'V23' && v23Artifacts.length > 0 && (
                <section className="site00-experiment-g__panel">
                  <h2>V2.3 BOARD — SIGNATURE LIME CONTRACTS</h2>
                  {v23NeedsLimeReformulation ? (
                    <>
                      <p style={{ marginBottom: '8px' }}>
                        This board was formulated before signature-lime requirements ({v23LimeReadyCount}/9 contracts ready).
                        FAL prompts may not include “must contain signature lime (#D6FF3B)”. Re-formulate V2.3 to refresh all contracts, then re-generate — or use NEEDS LIME revision per slide on existing images.
                      </p>
                      <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={() => void formulateV23({ force: true })}>
                        RE-FORMULATE V2.3 CONTRACTS (SIGNATURE LIME)
                      </button>
                    </>
                  ) : (
                    <p>
                      All nine V2.3 contracts include signature-lime + restraint governance in FAL prompts ({v23LimeReadyCount}/9). P0.5C.4B.1 — lime presence required, prominence prohibited. Use REGENERATE CURRENT for fresh lineage.
                    </p>
                  )}
                </section>
              )}

              {boardReady && (
                <>
                  <section className="site00-experiment-g__panel">
                    <h2>3×3 FEED PREVIEW — {versionTab}</h2>
                    {isGeneratingBoard && (
                      <p>GENERATING FIRST SLIDES IN BACKGROUND… {generatedCount}/{activeArtifacts.length} COMPLETE</p>
                    )}
                    {!isGeneratingBoard && pendingCount > 0 && generatedCount > 0 && (
                      <p>{generatedCount}/{activeArtifacts.length} COMPLETE — REMAINING SLIDES READY TO GENERATE</p>
                    )}
                    {!isGeneratingBoard && pendingCount > 0 && versionTab === 'V23' && v23Superseded && (
                      <p style={{ marginBottom: '12px' }}>
                        Batch generation paused after methodology supersession. Select a pending slide below and tap GENERATE CURRENT.
                      </p>
                    )}
                    {canGenerateRemaining && (
                      <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={() => void generateAll()} style={{ marginBottom: '12px' }}>
                        {versionTab === 'V23'
                          ? generatedCount > 0
                            ? `GENERATE CURRENT V2.3 — REMAINING ${pendingCount}`
                            : 'GENERATE CURRENT V2.3 — ALL NINE'
                          : generatedCount > 0
                            ? `GENERATE REMAINING ${pendingCount} FIRST SLIDES (FAL)`
                            : 'GENERATE ALL NINE FIRST SLIDES (FAL)'}
                      </button>
                    )}
                    {canRegenerateAllV23 && (
                      <button
                        type="button"
                        className="site00-btn site00-btn--primary"
                        disabled={busy}
                        onClick={() => void regenerateAllV23()}
                        style={{ marginBottom: '12px', width: '100%' }}
                      >
                        REGENERATE ALL V2.3 — NINE NEW TAKES (FAL)
                      </button>
                    )}
                    {allGenerated && !v23RevisionDraft && (
                      <p style={{ marginBottom: '12px' }}>ALL NINE FIRST SLIDES GENERATED — TAP ANY CELL TO REVIEW AND JUDGE</p>
                    )}
                    {v23RevisionDraft && versionTab === 'V23' && (
                      <p style={{ marginBottom: '12px' }}>Revision note open — cancel or confirm to select another slide.</p>
                    )}
                    {versionTab === 'V23' && selectedV23 && selectedId && (
                      <p style={{ marginBottom: '12px', fontSize: '0.9rem' }}>
                        SELECTED: {selectedV23.contract.primaryHook}
                        {selectedV23Artifact && v23ArtifactHasSignatureLimeInPrompt(selectedV23Artifact)
                          ? ' · FAL prompt includes signature lime'
                          : ' · FAL prompt missing signature lime (re-formulate or revise)'}
                      </p>
                    )}
                    <div className="site00-marketing-exp01-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      {activeArtifacts.map((a) => {
                        const headline =
                          versionTab === 'V23'
                            ? (a as Experiment01V23Artifact).contract.primaryHook
                            : versionTab === 'V22'
                              ? (a as Experiment01V22Artifact).contract.primaryHook
                              : versionTab === 'V21'
                                ? (a as Experiment01V21Artifact).contract.primaryHook
                                : versionTab === 'V2'
                                  ? (a as Experiment01V2Artifact).contract.primaryHook
                                  : (a as BrandMarketingArtifact).headline;
                        const url = a.generatedAssetUrl;
                        const pending = a.generationStatus === 'GENERATING';
                        const isSelected = selectedId === a.id;
                        return (
                          <button
                            key={a.id}
                            type="button"
                            aria-pressed={isSelected}
                            className={`site00-marketing-exp01-grid__slide ${isSelected ? 'site00-btn site00-btn--primary' : 'site00-btn'}`}
                            disabled={Boolean(v23RevisionDraft && versionTab === 'V23')}
                            onClick={() => {
                              setSelectedId(a.id);
                              if (versionTab === 'V23') cancelV23RevisionDraft();
                              if (url) setInspectImage({ url, alt: headline });
                            }}
                          >
                            {url ? (
                              <img
                                src={url}
                                alt={headline}
                                draggable={false}
                                style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', pointerEvents: 'none', userSelect: 'none' }}
                              />
                            ) : pending ? (
                              <span>GENERATING…</span>
                            ) : (
                              <span>{headline}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  {versionTab === 'V23' && activeArtifacts.length > 0 && (
                    <section className="site00-experiment-g__panel">
                      <h2>VISUAL AUTHORITY REVIEW — P0.5C.6</h2>
                      <p style={{ fontSize: '0.85rem', marginBottom: '12px' }}>
                        Bespoke art direction leads · editorial logic supports · V2.1 visual appetite restored inside V2.3.
                      </p>
                      <ul style={{ fontSize: '0.85rem', marginBottom: '12px' }}>
                        {(activeArtifacts as Experiment01V23Artifact[]).map((a) => {
                          const va = a.contract.visualAuthorityEvaluation;
                          return (
                            <li key={a.id} style={{ marginBottom: '6px' }}>
                              <strong>{a.contract.primaryHook.slice(0, 48)}…</strong>
                              {' · '}
                              STOP: {va?.wouldIStopBeforeReading.passes ? 'YES' : 'NO'}
                              {' · '}
                              RICH+SIMPLE: {va?.visualAppetiteGatePasses ? 'YES' : 'NO'}
                              {' · '}
                              NO-TEXT: {va?.textRemovalIntegrity.result}
                              {' · '}
                              EVIDENCE: {va?.evidenceCompositionRole.role.replace(/_/g, ' ')}
                            </li>
                          );
                        })}
                      </ul>
                      <p style={{ fontSize: '0.8rem' }}>
                        ARTISTIC PREMISE (selected):{' '}
                        {(activeArtifacts as Experiment01V23Artifact[]).find((a) => a.id === selectedId)?.contract.visualAuthorityEvaluation?.bespokeArtDirection.artisticPremise ?? '—'}
                      </p>
                    </section>
                  )}

                  {versionTab === 'V23' && selectedV23 && (
                    <section key={selectedId ?? selectedV23.id} className="site00-experiment-g__panel">
                      <h2>V2.3 ART-BOARD REVIEW — {selectedV23.contract.primaryHook}</h2>
                      <p style={{ fontSize: '0.9rem', marginBottom: '12px' }}>
                        CONTRACT: CURRENT · PROMPT: {v23ArtifactPromptFreshnessState(selectedV23) === 'CURRENT' ? 'CURRENT' : 'STALE'} ·
                        READINESS: {v23ArtifactGenerationReadiness(selectedV23)}
                        {v23ArtifactIsLegacyGeneration(selectedV23) ? ' · LEGACY GENERATION — CURRENT METHODOLOGY NOT FULLY APPLIED' : ''}
                      </p>
                      <p style={{ fontSize: '0.85rem', marginBottom: '12px' }}>
                        METHODOLOGY: C.4A {v23ArtifactMethodologyStatus(selectedV23).c4a ? '✓' : '✗'} · C.4B{' '}
                        {v23ArtifactMethodologyStatus(selectedV23).c4b ? '✓' : '✗'} · C.4B.1{' '}
                        {v23ArtifactMethodologyStatus(selectedV23).c4b1 ? '✓' : '✗'} · C.5{' '}
                        {v23ArtifactMethodologyStatus(selectedV23).c5 ? '✓' : '✗'} · C.6{' '}
                        {selectedV23.contract.visualAuthorityEvaluation?.visualAppetiteGatePasses ? '✓' : '✗'}
                      </p>
                      {(() => {
                        const limeReview = v23FounderLimeReview(selectedV23);
                        const jobLabel = v23GenerationJobStatusLabel(selectedV23);
                        return (
                          <div style={{ marginBottom: '12px' }}>
                            {jobLabel && <p style={{ fontSize: '0.85rem' }}>GENERATION JOB: {jobLabel}</p>}
                            <dl>
                              <dt>SIGNATURE LIME</dt><dd>{limeReview.signatureLime}</dd>
                              <dt>LIME ROLE</dt><dd>{limeReview.limeRole}</dd>
                              <dt>ATTENTION TARGET</dt><dd>{limeReview.attentionTarget}</dd>
                              <dt>RESTRAINT MODE</dt><dd>{limeReview.restraintMode}</dd>
                              <dt>PROMINENCE</dt><dd>{limeReview.prominence}</dd>
                              <dt>HUMAN TRACE COLOR</dt><dd>{limeReview.humanTraceColor}</dd>
                              <dt>CURRENT LINEAGE</dt><dd>{limeReview.currentLineage}</dd>
                            </dl>
                          </div>
                        );
                      })()}
                      {selectedV23.generatedAssetUrl ? (
                        <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="site00-btn site00-btn--primary"
                            disabled={busy}
                            onClick={() => void regenerateCurrentV23(selectedV23.id)}
                          >
                            REGENERATE CURRENT
                          </button>
                          <button
                            type="button"
                            className="site00-btn"
                            disabled={busy}
                            onClick={() =>
                              void site00ProjectsApi
                                .marketingExpressionExperiment01V23Replay(projectSlug, selectedV23.id)
                                .then((r) => setRun(r.run as BrandMarketingExpressionRun))
                            }
                          >
                            REPLAY HISTORICAL PROMPT
                          </button>
                        </div>
                      ) : (
                        <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="site00-btn site00-btn--primary"
                            disabled={busy}
                            onClick={() => void regenerateCurrentV23(selectedV23.id)}
                          >
                            GENERATE CURRENT
                          </button>
                          {selectedV23.generationJobStatus === 'CANCELLED_SUPERSEDED' && (
                            <p style={{ fontSize: '0.85rem', margin: 0 }}>
                              Prior queue job cancelled at methodology supersession — current contract is ready.
                            </p>
                          )}
                        </div>
                      )}
                      <dl>
                        <dt>PRIMARY IDEA</dt><dd>{selectedV23.contract.primaryHook}</dd>
                        <dt>CHARACTER BEAT</dt><dd>{selectedV23.contract.characterRetention.primaryCharacterBeat.text ?? '—'}</dd>
                        <dt>ARTIFACT FORM</dt><dd>{selectedV23.contract.artBoardDirection.artifactForm}</dd>
                        <dt>BASE SURFACE</dt><dd>{selectedV23.contract.artBoardDirection.materialitySystem.baseSurface}</dd>
                        <dt>PAGE CONSTRUCTION</dt><dd>{selectedV23.contract.artBoardDirection.pageConstructionMode.replace(/_/g, ' ')}</dd>
                        <dt>EDGE BEHAVIOR</dt><dd>{selectedV23.contract.artBoardDirection.edgeBehavior.replace(/_/g, ' ')}</dd>
                        <dt>LAYERS</dt><dd>{selectedV23.contract.artBoardDirection.secondaryLayers.map((l) => l.layerType).join(', ') || 'base only'}</dd>
                        <dt>ATTACHMENT</dt><dd>{selectedV23.contract.artBoardDirection.attachmentLogic.map((a) => a.mechanism).join(', ') || 'integrated'}</dd>
                        <dt>CONSTRUCTION HISTORY</dt><dd>{selectedV23.contract.artBoardDirection.constructionHistory.firstPresent}</dd>
                        <dt>MATERIAL DEPTH</dt><dd>{selectedV23.contract.artBoardDirection.depthBehavior.replace(/_/g, ' ')}</dd>
                        <dt>PRINT / SCAN</dt><dd>{selectedV23.contract.artBoardDirection.materialitySystem.printingBehavior.replace(/_/g, ' ')}</dd>
                        <dt>MATERIAL DENSITY</dt><dd>{selectedV23.materialityEvaluation.materialDensity.level}</dd>
                        <dt>ART-BOARD QUALITY</dt><dd>{selectedV23.materialityEvaluation.artBoardQuality.result}</dd>
                        <dt>WHY NOT TEMPLATE</dt><dd>{selectedV23.contract.artBoardDirection.whyNotCleanTemplate}</dd>
                        <dt>LIME DENSITY</dt><dd>{selectedV23.humanMadeEvaluation?.limeIntervention.density ?? '—'}</dd>
                        <dt>LIME MODES</dt><dd>{selectedV23.humanMadeEvaluation?.limeIntervention.applicationModes.join(', ') ?? '—'}</dd>
                        <dt>MAKER EVIDENCE</dt><dd>{selectedV23.humanMadeEvaluation?.makerEvidenceStrength ?? '—'}</dd>
                        <dt>ANTI-AI</dt><dd>{selectedV23.humanMadeEvaluation?.antiAi.result ?? '—'}</dd>
                        <dt>HAND-DRAWN ICONS</dt><dd>{selectedV23.humanMadeEvaluation?.markSystem.handDrawnIcons.length ?? 0}</dd>
                        <dt>LIME @ FEED</dt><dd>{selectedV23.humanMadeEvaluation?.limeFeedDistance.result ?? '—'}</dd>
                        <dt>HUMAN-MADE GATE</dt><dd>{selectedV23.humanMadeEvaluation?.passesHumanMadeGate ? 'PASS' : 'REVIEW'}</dd>
                        <dt>SIGNATURE LIME</dt><dd>{selectedV23.signatureLimeEvaluation?.accentSelection.targetText ?? '—'} ({selectedV23.signatureLimeEvaluation?.accentSelection.targetType ?? '—'})</dd>
                        <dt>LIME PRESENCE</dt><dd>{selectedV23.signatureLimeEvaluation?.presence.result ?? '—'}</dd>
                        <dt>SIGNATURE LIME GATE</dt><dd>{selectedV23.signatureLimeEvaluation?.passesSignatureLimeGate ? 'PASS' : 'BLOCKED'}</dd>
                        <dt>MIGRATION</dt><dd>{selectedV23.signatureLimeMigration?.revisionClass.replace(/_/g, ' ') ?? '—'}</dd>
                        <dt>APPROVAL GATE</dt><dd>{selectedV23.materialityEvaluation.passesApprovalGate && selectedV23.humanMadeEvaluation?.passesHumanMadeGate && selectedV23.signatureLimeEvaluation?.passesSignatureLimeGate ? 'PASS' : 'BLOCKED'}</dd>
                        {selectedV23.parentFingerprint && (
                          <>
                            <dt>PARENT FP</dt><dd style={{ fontSize: '0.75rem' }}>{selectedV23.parentFingerprint}</dd>
                          </>
                        )}
                        {selectedV23.founderJudgment && (
                          <>
                            <dt>FOUNDER JUDGMENT</dt><dd>{selectedV23.founderJudgment.replace(/_/g, ' ')}</dd>
                          </>
                        )}
                        {selectedV23.founderJudgmentNote && (
                          <>
                            <dt>FOUNDER NOTE</dt><dd>{selectedV23.founderJudgmentNote}</dd>
                          </>
                        )}
                        {(selectedV23.revisionHistory?.length ?? 0) > 0 && (
                          <>
                            <dt>REVISIONS</dt>
                            <dd>
                              {(selectedV23.revisionHistory ?? []).map((rev) => (
                                <div key={rev.revisionId} style={{ marginBottom: '6px', fontSize: '0.85rem' }}>
                                  {rev.judgment?.replace(/_/g, ' ') ?? 'REVISION'} — {rev.status}
                                  {rev.founderNote ? `: ${rev.founderNote}` : ''}
                                </div>
                              ))}
                            </dd>
                          </>
                        )}
                        {selectedV23.generationStatus === 'GENERATING' && (
                          <>
                            <dt>RE-RENDER</dt><dd>Generating revised artifact via FAL…</dd>
                          </>
                        )}
                      </dl>
                      <div style={{ marginTop: '12px' }}>
                        <p>V2.3 artifact judgment:</p>
                        {[...V23_FOUNDER_JUDGMENTS, ...V23A_FOUNDER_JUDGMENTS, ...V23B_FOUNDER_JUDGMENTS].map((j) => (
                          <button
                            key={j}
                            type="button"
                            className={selectedV23.founderJudgment === j ? 'site00-btn site00-btn--primary' : 'site00-btn'}
                            disabled={busy || selectedV23.generationStatus === 'GENERATING'}
                            style={{ margin: '2px' }}
                            onClick={() => onV23JudgmentTap(selectedV23.id, j)}
                          >
                            {j.replace(/_/g, ' ')}
                          </button>
                        ))}
                        <p style={{ marginTop: '8px', fontSize: '0.85rem', opacity: 0.85 }}>
                          Approval labels save immediately. Revision labels open a note — confirm to re-render via FAL.
                        </p>
                      </div>
                    </section>
                  )}

                  {versionTab === 'V22' && selectedV22 && (
                    <section className="site00-experiment-g__panel">
                      <h2>V2.2 CONTRACT REVIEW — {selectedV22.contract.primaryHook}</h2>
                      <dl>
                        <dt>PRIMARY IDEA</dt><dd>{selectedV22.contract.primaryHook}</dd>
                        <dt>VIEWER NOTICES FIRST</dt><dd>{selectedV22.contract.viewerShouldNoticeFirst}</dd>
                        <dt>VISUAL SUBJECT</dt><dd>{selectedV22.contract.culturalParticipation.visualSubjectMatterDecision.culturalVisualSubject}</dd>
                        <dt>INFORMATION REMOVED</dt><dd>{selectedV22.contract.characterRetention.informationRemoved.slice(0, 4).join('; ')}</dd>
                        <dt>CHARACTER FACULTIES</dt><dd>{selectedV22.contract.characterRetention.characterFacultiesRequired.join(', ')}</dd>
                        <dt>PRIMARY CHARACTER BEAT</dt><dd>{selectedV22.contract.characterRetention.primaryCharacterBeat.text ?? 'visual punchline'}</dd>
                        <dt>HUMOR ELIGIBILITY</dt><dd>{selectedV22.contract.characterRetention.humorEligibility.replace(/_/g, ' ')}</dd>
                        <dt>HUMOR MECHANISM</dt><dd>{selectedV22.contract.characterRetention.humorMechanism?.replace(/_/g, ' ') ?? '—'}</dd>
                        <dt>PUNCHLINE / REACTION</dt><dd>{selectedV22.contract.characterRetention.primaryCharacterBeat.text ?? '—'}</dd>
                        <dt>HUMAN TRACE STRENGTH</dt><dd>{selectedV22.contract.characterRetention.humanTraceStrength}</dd>
                        <dt>CONTROLLED MISBEHAVIOR</dt><dd>{selectedV22.contract.characterRetention.controlledMisbehavior.map((m) => m.mode).join(', ') || 'none'}</dd>
                        <dt>CHARACTER DENSITY</dt><dd>{selectedV22.characterEvaluation.characterDensity.characterDensity}</dd>
                        <dt>INFORMATION DENSITY</dt><dd>{selectedV22.contract.textDensity.level}</dd>
                        <dt>STERILITY RISK</dt><dd>{selectedV22.characterEvaluation.sterility.level}</dd>
                        <dt>LOGO-REMOVAL CHARACTER</dt><dd>{selectedV22.characterEvaluation.logoRemovalCharacter.result}</dd>
                        <dt>APPROVAL GATE</dt><dd>{selectedV22.characterEvaluation.passesApprovalGate ? 'PASS' : 'BLOCKED'}</dd>
                      </dl>
                      <div style={{ marginTop: '12px' }}>
                        <p>V2.2 artifact judgment:</p>
                        {V22_FOUNDER_JUDGMENTS.map((j) => (
                          <button key={j} type="button" className="site00-btn" disabled={busy} style={{ margin: '2px' }} onClick={() => void setArtifactJudgment(selectedV22.id, j)}>
                            {j.replace(/_/g, ' ')}
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  {versionTab === 'V21' && selectedV21 && (
                    <section className="site00-experiment-g__panel">
                      <h2>V2.1 CONTRACT REVIEW — {selectedV21.contract.primaryHook}</h2>
                      <dl>
                        <dt>TOPIC</dt><dd>{selectedV21.topic}</dd>
                        <dt>PRIMARY IDEA</dt><dd>{selectedV21.contract.primaryHook}</dd>
                        <dt>VIEWER NOTICES FIRST</dt><dd>{selectedV21.contract.viewerShouldNoticeFirst}</dd>
                        <dt>VISUAL PARTICIPATION MODE</dt><dd>{selectedV21.contract.culturalParticipation.visualParticipationMode.replace(/_/g, ' ')}</dd>
                        <dt>IMAGE REQUIRED?</dt><dd>{selectedV21.contract.culturalParticipation.imageParticipationRequired.replace(/_/g, ' ')}</dd>
                        <dt>CULTURAL / HUMAN / ARTISTIC SUBJECT</dt><dd>{selectedV21.contract.culturalParticipation.visualSubjectMatterDecision.culturalVisualSubject}</dd>
                        <dt>WHY IT BELONGS</dt><dd>{selectedV21.contract.culturalParticipation.whyImageBelongs ?? selectedV21.contract.culturalParticipation.whyImageDoesNotBelong ?? '—'}</dd>
                        <dt>IMAGE ROLE</dt><dd>{selectedV21.contract.culturalParticipation.culturalVisualEvidence[0]?.visualRole ?? '—'}</dd>
                        <dt>TYPOGRAPHIC ROLES</dt><dd>{selectedV21.contract.typographyAssignments.map((t) => `${t.role}: ${t.text.slice(0, 40)}`).join(' · ')}</dd>
                        <dt>EVIDENCE ROLE</dt><dd>{selectedV21.contract.primaryEvidence.join('; ') || 'minimal — deferred to later slides'}</dd>
                        <dt>NDX TRACE</dt><dd>{selectedV21.contract.primaryTrace}</dd>
                        <dt>PLAYFULNESS</dt><dd>{selectedV21.contract.culturalParticipation.playfulnessTarget}</dd>
                        <dt>EMOTIONAL TEMPERATURE</dt><dd>{expV21?.feedEmotionalRhythm?.temperatures[parseInt(selectedV21.id.replace('bma-exp01-v21-', ''), 10) - 1] ?? '—'}</dd>
                        <dt>DENSITY</dt><dd>{selectedV21.contract.textDensity.level}</dd>
                        <dt>READING PATH</dt>
                        <dd>
                          1: {selectedV21.contract.readingPath.firstLook}<br />
                          2: {selectedV21.contract.readingPath.secondLook}<br />
                          3: {selectedV21.contract.readingPath.thirdLook}
                        </dd>
                        <dt>DEFERRED INFORMATION</dt><dd>{selectedV21.contract.deferredEvidence.slice(0, 4).join('; ')}</dd>
                        <dt>VISUAL APPETITE</dt><dd>{selectedV21.contract.culturalParticipation.visualAppetiteEvaluation.overall}</dd>
                        <dt>PARTICIPATION BALANCE</dt><dd>{selectedV21.contract.culturalParticipation.visualParticipationBalance.replace(/_/g, ' ')}</dd>
                      </dl>

                      {selectedV2 && (
                        <div style={{ marginTop: '16px', padding: '12px', border: '1px solid #ccc' }}>
                          <h3>V2 COMPARISON</h3>
                          <p>Mode: {selectedV2.contract.semanticRole} · Density: {selectedV2.contract.textDensity.level}</p>
                        </div>
                      )}

                      <div style={{ marginTop: '12px' }}>
                        <p>V2.1 artifact judgment:</p>
                        {V21_FOUNDER_JUDGMENTS.slice(0, 12).map((j) => (
                          <button key={j} type="button" className="site00-btn" disabled={busy} style={{ margin: '2px' }} onClick={() => void setArtifactJudgment(selectedV21.id, j)}>
                            {j.replace(/_/g, ' ')}
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  {versionTab === 'V2' && selectedV2 && (
                    <section className="site00-experiment-g__panel">
                      <h2>V2 CONTRACT — {selectedV2.contract.primaryHook}</h2>
                      <dl>
                        <dt>TOPIC</dt><dd>{selectedV2.topic}</dd>
                        <dt>SEMANTIC ROLE</dt><dd>{selectedV2.contract.semanticRole}</dd>
                        <dt>VIEWER NOTICES FIRST</dt><dd>{selectedV2.contract.viewerShouldNoticeFirst}</dd>
                        <dt>SECONDARY REVEAL</dt><dd>{selectedV2.contract.secondaryReveal ?? '—'}</dd>
                        <dt>PRIMARY EVIDENCE</dt><dd>{selectedV2.contract.primaryEvidence.join('; ') || 'minimal'}</dd>
                        <dt>DEFERRED TO LATER SLIDES</dt><dd>{selectedV2.contract.deferredEvidence.slice(0, 4).join('; ')}</dd>
                        <dt>NDX TRACE</dt><dd>{selectedV2.contract.primaryTrace}</dd>
                        <dt>TYPOGRAPHIC ROLES</dt><dd>{selectedV2.contract.typographyAssignments.map((t) => `${t.role}: ${t.text.slice(0, 40)}`).join(' · ')}</dd>
                        <dt>DENSITY</dt><dd>{selectedV2.contract.textDensity.level}</dd>
                        <dt>READING PATH</dt>
                        <dd>
                          1: {selectedV2.contract.readingPath.firstLook}<br />
                          2: {selectedV2.contract.readingPath.secondLook}<br />
                          3: {selectedV2.contract.readingPath.thirdLook}
                        </dd>
                        <dt>LIME FUNCTION</dt><dd>{selectedV2.contract.limeFunction ?? 'optional / restrained'}</dd>
                        <dt>SEQUENCE ARC</dt><dd>{selectedV2.carouselArchitecture.sequenceArc}</dd>
                      </dl>

                      {selectedV1 && (
                        <div style={{ marginTop: '16px', padding: '12px', border: '1px solid #ccc' }}>
                          <h3>V1 COMPARISON</h3>
                          {selectedV1.generatedAssetUrl ? (
                            <img src={selectedV1.generatedAssetUrl} alt={selectedV1.headline} style={{ maxWidth: '200px' }} />
                          ) : (
                            <p>{selectedV1.headline}</p>
                          )}
                        </div>
                      )}

                      <div style={{ marginTop: '12px' }}>
                        <p>V2 artifact judgment:</p>
                        {V2_FOUNDER_JUDGMENTS.slice(0, 10).map((j) => (
                          <button key={j} type="button" className="site00-btn" disabled={busy} style={{ margin: '2px' }} onClick={() => void setArtifactJudgment(selectedV2.id, j)}>
                            {j.replace(/_/g, ' ')}
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  {versionTab === 'V1' && selectedV1 && (
                    <section className="site00-experiment-g__panel">
                      <h2>{selectedV1.headline}</h2>
                      <dl>
                        <dt>TOPIC</dt><dd>{selectedV1.topic}</dd>
                        <dt>BEHAVIORAL MODE</dt><dd>{selectedV1.behavioralModeId}</dd>
                        <dt>EXPRESSION CLASS</dt><dd>{selectedV1.artifactExpressionClass}</dd>
                      </dl>
                      <div style={{ marginTop: '12px' }}>
                        {MARKETING_ARTIFACT_FOUNDER_JUDGMENTS.slice(0, 6).map((j) => (
                          <button key={j} type="button" className="site00-btn" disabled={busy} style={{ margin: '2px' }} onClick={() => void setArtifactJudgment(selectedV1.id, j)}>
                            {j.replace(/_/g, ' ')}
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  {exp?.setEvaluation && versionTab === 'V1' && (
                    <section className="site00-experiment-g__panel">
                      <h2>V1 SET EVALUATION</h2>
                      <ul>
                        <li>Same character across topics: {exp.setEvaluation.sameCharacterAcrossTopics}</li>
                        <li>Meaningful visual range: {exp.setEvaluation.meaningfulVisualRange}</li>
                      </ul>
                      {MARKETING_SET_FOUNDER_JUDGMENTS.slice(0, 4).map((j) => (
                        <button key={j} type="button" className="site00-btn" disabled={busy} style={{ margin: '2px' }} onClick={() => void setSetJudgment(j)}>
                          {j.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </section>
                  )}

                  {expV2?.boardEvaluation && versionTab === 'V2' && (
                    <section className="site00-experiment-g__panel">
                      <h2>V1 → V2 BOARD EVALUATION</h2>
                      <ul>
                        <li>Character changed: {String(expV2.boardEvaluation.characterChanged)}</li>
                        <li>Expression world changed: {String(expV2.boardEvaluation.expressionWorldChanged)}</li>
                        <li>Information architecture changed: {String(expV2.boardEvaluation.informationArchitectureChanged)}</li>
                        <li>Typography governance changed: {String(expV2.boardEvaluation.typographyGovernanceChanged)}</li>
                        <li>Density rhythm: {expV2.boardEvaluation.boardEvaluation.densityRhythm}</li>
                      </ul>
                    </section>
                  )}
                  {expV23?.feedMaterialRhythm && versionTab === 'V23' && (
                    <section className="site00-experiment-g__panel">
                      <h2>V2.3 BOARD EVALUATION — MATERIAL + MAKER RHYTHM</h2>
                      <ul>
                        <li>Surface variation adequate: {expV23.feedMaterialRhythm.variationAdequate ? 'yes' : 'review'}</li>
                        <li>All same canvas: {expV23.feedMaterialRhythm.allSameCanvas ? 'FAIL' : 'no'}</li>
                        <li>All torn paper: {expV23.feedMaterialRhythm.allTornPaper ? 'FAIL' : 'no'}</li>
                        <li>All notebook: {expV23.feedMaterialRhythm.allNotebook ? 'FAIL' : 'no'}</li>
                        {expV23.feedMakerRhythm && (
                          <>
                            <li>Hand-drawn icon posts: {expV23.feedMakerRhythm.handDrawnIconPosts}</li>
                            <li>Same doodle on all posts: {expV23.feedMakerRhythm.allSameDoodleBehavior ? 'FAIL' : 'no'}</li>
                            <li>Same maker, different behaviors: {expV23.feedMakerRhythm.sameMakerDifferentBehaviors ? 'yes' : 'review'}</li>
                          </>
                        )}
                      </ul>
                    </section>
                  )}
                  {expV22?.feedCharacterRhythm && versionTab === 'V22' && (
                    <section className="site00-experiment-g__panel">
                      <h2>V2.2 BOARD EVALUATION — CHARACTER + HUMOR RHYTHM</h2>
                      <ul>
                        <li>Character variation adequate: {expV22.feedCharacterRhythm.variationAdequate ? 'yes' : 'review'}</li>
                        <li>Every post is a joke: {expV22.feedHumorRhythm?.everyPostIsJoke ? 'FAIL' : 'no'}</li>
                        <li>No humor where required: {expV22.feedHumorRhythm?.noHumorWhereRequired ? 'FAIL' : 'no'}</li>
                      </ul>
                    </section>
                  )}
                  {expV21?.boardEvaluation && versionTab === 'V21' && (
                    <section className="site00-experiment-g__panel">
                      <h2>V2.1 BOARD EVALUATION — CULTURAL VISUAL DIVERSITY</h2>
                      <ul>
                        <li>Image/type balance: {expV21.boardEvaluation.imageTypeBalance}</li>
                        <li>Human presence: {expV21.boardEvaluation.humanPresence}</li>
                        <li>Artistic range: {expV21.boardEvaluation.artisticRange}</li>
                        <li>Cultural range: {expV21.boardEvaluation.culturalRange}</li>
                        <li>Feed cultural variation: {expV21.feedCulturalRhythm?.variationAdequate ? 'adequate' : 'needs review'}</li>
                        <li>Feed emotional variation: {expV21.feedEmotionalRhythm?.variationAdequate ? 'adequate' : 'flat'}</li>
                        {expV21.boardEvaluation.failureStates.length > 0 && (
                          <li>Failure states: {expV21.boardEvaluation.failureStates.join(', ')}</li>
                        )}
                      </ul>
                    </section>
                  )}
                </>
              )}

              {!v1Artifacts.length && (
                <section className="site00-experiment-g__panel">
                  <p>Formulate nine sibling first-slide artifacts across unrelated topics — behavior-first, not template-first.</p>
                  <button type="button" className="site00-btn site00-btn--primary" disabled={busy || !run?.expressionSystem} onClick={() => void formulate()}>
                    FORMULATE EXPERIMENT 01 V1
                  </button>
                </section>
              )}
            </>
          )}
        </div>
      </div>

      {v23RevisionDraft && (
        <div
          role="presentation"
          onClick={() => !busy && cancelV23RevisionDraft()}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            role="dialog"
            aria-labelledby="v23-revision-title"
            onClick={(e) => e.stopPropagation()}
            className="site00-experiment-g__panel"
            style={{ width: '100%', maxWidth: '520px', margin: 0 }}
          >
            <h2 id="v23-revision-title" style={{ marginTop: 0 }}>
              {v23RevisionDraft.judgment.replace(/_/g, ' ')} — REVISION NOTE
            </h2>
            <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              Describe exactly what should change. On confirm, the contract updates and FAL re-renders this artifact using your note.
            </p>
            <label style={{ display: 'block', marginTop: '12px' }}>
              Founder revision note
              <textarea
                value={v23RevisionNote}
                onChange={(e) => setV23RevisionNote(e.target.value)}
                rows={4}
                placeholder={revisionNotePlaceholder(v23RevisionDraft.judgment)}
                autoFocus
                style={{ width: '100%', marginTop: '6px', boxSizing: 'border-box' }}
              />
            </label>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
              <button type="button" className="site00-btn" onClick={cancelV23RevisionDraft} disabled={busy}>
                CANCEL
              </button>
              <button
                type="button"
                className="site00-btn site00-btn--primary"
                disabled={busy || !v23RevisionNote.trim()}
                onClick={() => void submitV23FounderRevision()}
              >
                CONFIRM &amp; RE-RENDER
              </button>
            </div>
          </div>
        </div>
      )}
      <Site00ImageInspectLightbox
        imageUrl={inspectImage?.url ?? null}
        alt={inspectImage?.alt}
        caption={inspectImage?.alt}
        onClose={() => setInspectImage(null)}
      />
    </EcosystemShell>
  );
}
