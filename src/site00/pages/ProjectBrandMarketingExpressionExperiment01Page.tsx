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
import { V22_FOUNDER_JUDGMENTS } from '../../../shared/site00-brand-lore/characterRetention/constants';
import '../styles/site00-replay-execution.css';

const POLL_MS = 5000;

type VersionTab = 'V1' | 'V2' | 'V21' | 'V22';

export default function ProjectBrandMarketingExpressionExperiment01Page() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<BrandMarketingExpressionRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [versionTab, setVersionTab] = useState<VersionTab>('V22');

  const reload = useCallback(async () => {
    if (projectSlug !== 'ndxbook') return;
    try {
      const result = await site00ProjectsApi.marketingExpressionGet(projectSlug);
      const next = (result.run as BrandMarketingExpressionRun | null) ?? null;
      setRun(next);
      const v22 = next?.experiment01V22?.generatedArtifacts ?? [];
      const v21 = next?.experiment01V21?.generatedArtifacts ?? [];
      const v2 = next?.experiment01V2?.generatedArtifacts ?? [];
      const v1 = next?.experiment01?.artifacts ?? [];
      const list =
        versionTab === 'V22' && v22.length
          ? v22
          : versionTab === 'V21' && v21.length
            ? v21
            : versionTab === 'V2' && v2.length
              ? v2
              : v1;
      if (!selectedId && list.length > 0) setSelectedId(list[0]!.id);
    } catch {
      setRun(null);
    } finally {
      setLoading(false);
    }
  }, [projectSlug, selectedId, versionTab]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    const generating =
      run?.status === 'EXPERIMENT_01_FORMULATING' ||
      run?.status === 'EXPERIMENT_01_GENERATING' ||
      run?.status === 'EXPERIMENT_01_V2_GENERATING' ||
      run?.status === 'EXPERIMENT_01_V21_GENERATING' ||
      run?.status === 'EXPERIMENT_01_V22_GENERATING' ||
      run?.experiment01?.artifacts.some((artifact) => artifact.generationStatus === 'GENERATING') ||
      run?.experiment01V2?.generatedArtifacts.some((artifact) => artifact.generationStatus === 'GENERATING') ||
      run?.experiment01V21?.generatedArtifacts.some((artifact) => artifact.generationStatus === 'GENERATING') ||
      run?.experiment01V22?.generatedArtifacts.some((artifact) => artifact.generationStatus === 'GENERATING');
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

  const generateAll = async () => {
    setBusy(true);
    try {
      const fn =
        versionTab === 'V22'
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
        versionTab === 'V22'
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
  const showingV22 = versionTab === 'V22' && v22Artifacts.length > 0;
  const showingV21 = versionTab === 'V21' && v21Artifacts.length > 0 && !showingV22;
  const showingV2 = versionTab === 'V2' && v2Artifacts.length > 0 && !showingV21 && !showingV22;
  const selectedV22: Experiment01V22Artifact | undefined = v22Artifacts.find((a) => a.id === selectedId) ?? v22Artifacts[0];
  const selectedV21: Experiment01V21Artifact | undefined = v21Artifacts.find((a) => a.id === selectedId) ?? v21Artifacts[0];
  const selectedV1: BrandMarketingArtifact | undefined = v1Artifacts.find((a) => a.id === selectedId) ?? v1Artifacts[0];
  const selectedV2: Experiment01V2Artifact | undefined = v2Artifacts.find((a) => a.id === selectedId) ?? v2Artifacts[0];
  const selected = showingV22 ? selectedV22 : showingV21 ? selectedV21 : showingV2 ? selectedV2 : selectedV1;
  const activeArtifacts = showingV22 ? v22Artifacts : showingV21 ? v21Artifacts : showingV2 ? v2Artifacts : v1Artifacts;
  const generatedCount = activeArtifacts.filter((a) => a.generationStatus === 'GENERATED' && a.generatedAssetUrl).length;
  const pendingCount = activeArtifacts.filter((a) => a.generationStatus !== 'GENERATED' || !a.generatedAssetUrl).length;
  const generatingCount = activeArtifacts.filter((a) => a.generationStatus === 'GENERATING').length;
  const isRunStatusGenerating =
    run?.status === 'EXPERIMENT_01_GENERATING' ||
    run?.status === 'EXPERIMENT_01_V2_GENERATING' ||
    run?.status === 'EXPERIMENT_01_V21_GENERATING' ||
    run?.status === 'EXPERIMENT_01_V22_GENERATING';
  const isGeneratingBoard = isRunStatusGenerating || generatingCount > 0;
  const allGenerated = activeArtifacts.length > 0 && generatedCount === activeArtifacts.length;
  const canGenerateRemaining = pendingCount > 0 && !isGeneratingBoard;

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-cd site00-cd--project-calibration">
        <div className="site00-project-lore-calibration">
          <header className="site00-project-lore-calibration__hero">
            <ProjectExperimentsHubNav projectSlug={projectSlug} />
            <p className="site00-project-lore-calibration__kicker">EXPERIMENT 01 — V1 / V2 / V2.1 / V2.2</p>
            <h1 className="site00-project-lore-calibration__project">{projectDisplayName(projectSlug)}</h1>
            <p className="site00-project-lore-calibration__headline">NDX FEED — NINE FIRST SLIDES</p>
            <Link to={site00ProjectBrandMarketingExpressionPath(projectSlug)}>← MARKETING EXPRESSION</Link>
            <Link to={site00ProjectPath(projectSlug)}>← PROJECT</Link>
          </header>

          {loading ? (
            <p>Loading Experiment 01…</p>
          ) : (
            <>
              <section className="site00-experiment-g__panel">
                <h2>VERSION</h2>
                <button type="button" className={versionTab === 'V1' ? 'site00-btn site00-btn--primary' : 'site00-btn'} disabled={busy} onClick={() => { setVersionTab('V1'); setSelectedId(v1Artifacts[0]?.id ?? null); }}>
                  V1 — ORIGINAL EXPRESSION TEST
                </button>
                <button type="button" className={versionTab === 'V2' ? 'site00-btn site00-btn--primary' : 'site00-btn'} disabled={busy} onClick={() => { setVersionTab('V2'); setSelectedId(v2Artifacts[0]?.id ?? null); }}>
                  V2 — EDITORIAL DIRECTION TEST
                </button>
                <button type="button" className={versionTab === 'V21' ? 'site00-btn site00-btn--primary' : 'site00-btn'} disabled={busy} onClick={() => { setVersionTab('V21'); setSelectedId(v21Artifacts[0]?.id ?? v2Artifacts[0]?.id ?? v1Artifacts[0]?.id ?? null); }}>
                  V2.1 — CULTURAL IMAGE PARTICIPATION
                </button>
                <button type="button" className={versionTab === 'V22' ? 'site00-btn site00-btn--primary' : 'site00-btn'} disabled={busy} onClick={() => { setVersionTab('V22'); setSelectedId(v22Artifacts[0]?.id ?? v21Artifacts[0]?.id ?? null); }}>
                  V2.2 — CHARACTER RETENTION
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

              {(showingV22 ? v22Artifacts : showingV21 ? v21Artifacts : showingV2 ? v2Artifacts : v1Artifacts).length > 0 && (
                <>
                  <section className="site00-experiment-g__panel">
                    <h2>3×3 FEED PREVIEW — {versionTab}</h2>
                    {isGeneratingBoard && (
                      <p>GENERATING FIRST SLIDES IN BACKGROUND… {generatedCount}/{activeArtifacts.length} COMPLETE</p>
                    )}
                    {!isGeneratingBoard && pendingCount > 0 && generatedCount > 0 && (
                      <p>{generatedCount}/{activeArtifacts.length} COMPLETE — REMAINING SLIDES READY TO GENERATE</p>
                    )}
                    {canGenerateRemaining && (
                      <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={() => void generateAll()} style={{ marginBottom: '12px' }}>
                        {generatedCount > 0
                          ? `GENERATE REMAINING ${pendingCount} FIRST SLIDES (FAL)`
                          : 'GENERATE ALL NINE FIRST SLIDES (FAL)'}
                      </button>
                    )}
                    {allGenerated && (
                      <p style={{ marginBottom: '12px' }}>ALL NINE FIRST SLIDES GENERATED — SELECT ANY CELL TO REVIEW AND JUDGE</p>
                    )}
                    <div className="site00-marketing-exp01-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      {(showingV22 ? v22Artifacts : showingV21 ? v21Artifacts : showingV2 ? v2Artifacts : v1Artifacts).map((a) => {
                        const headline = showingV22
                          ? (a as Experiment01V22Artifact).contract.primaryHook
                          : showingV21
                            ? (a as Experiment01V21Artifact).contract.primaryHook
                            : showingV2
                              ? (a as Experiment01V2Artifact).contract.primaryHook
                              : (a as BrandMarketingArtifact).headline;
                        const url = a.generatedAssetUrl;
                        const pending = a.generationStatus === 'GENERATING';
                        return (
                          <button
                            key={a.id}
                            type="button"
                            className={selected?.id === a.id ? 'site00-btn site00-btn--primary' : 'site00-btn'}
                            onClick={() => setSelectedId(a.id)}
                            style={{ minHeight: '80px', textAlign: 'left', padding: '8px' }}
                          >
                            {url ? (
                              <img src={url} alt={headline} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
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

                  {showingV22 && selectedV22 && (
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

                  {showingV21 && selectedV21 && (
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

                  {showingV2 && selectedV2 && (
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

                  {!showingV2 && !showingV21 && !showingV22 && selectedV1 && (
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
    </EcosystemShell>
  );
}
