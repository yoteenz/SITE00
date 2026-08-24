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
import { MARKETING_ARTIFACT_FOUNDER_JUDGMENTS, MARKETING_SET_FOUNDER_JUDGMENTS } from '../../../shared/site00-brand-lore/brandMarketingExpression/constants';
import { V2_FOUNDER_JUDGMENTS } from '../../../shared/site00-brand-lore/editorialInformationArchitecture/constants';
import '../styles/site00-replay-execution.css';

const POLL_MS = 5000;

type VersionTab = 'V1' | 'V2';

export default function ProjectBrandMarketingExpressionExperiment01Page() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<BrandMarketingExpressionRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [versionTab, setVersionTab] = useState<VersionTab>('V2');

  const reload = useCallback(async () => {
    if (projectSlug !== 'ndxbook') return;
    try {
      const result = await site00ProjectsApi.marketingExpressionGet(projectSlug);
      const next = (result.run as BrandMarketingExpressionRun | null) ?? null;
      setRun(next);
      const v2 = next?.experiment01V2?.generatedArtifacts ?? [];
      const v1 = next?.experiment01?.artifacts ?? [];
      const list = versionTab === 'V2' && v2.length ? v2 : v1;
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
    if (run?.status !== 'EXPERIMENT_01_FORMULATING') return;
    const id = window.setInterval(() => void reload(), POLL_MS);
    return () => window.clearInterval(id);
  }, [run?.status, reload]);

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

  const generate = async (artifactId: string) => {
    setBusy(true);
    try {
      const fn =
        versionTab === 'V2'
          ? site00ProjectsApi.marketingExpressionExperiment01V2Generate
          : site00ProjectsApi.marketingExpressionExperiment01Generate;
      const result = await fn(projectSlug, artifactId);
      setRun((result.run as BrandMarketingExpressionRun) ?? null);
    } finally {
      setBusy(false);
    }
  };

  const setArtifactJudgment = async (artifactId: string, judgment: string) => {
    setBusy(true);
    try {
      const fn =
        versionTab === 'V2'
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
  const v1Artifacts = exp?.artifacts ?? [];
  const v2Artifacts = expV2?.generatedArtifacts ?? [];
  const showingV2 = versionTab === 'V2' && v2Artifacts.length > 0;
  const selectedV1: BrandMarketingArtifact | undefined = v1Artifacts.find((a) => a.id === selectedId) ?? v1Artifacts[0];
  const selectedV2: Experiment01V2Artifact | undefined = v2Artifacts.find((a) => a.id === selectedId) ?? v2Artifacts[0];
  const selected = showingV2 ? selectedV2 : selectedV1;

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-cd site00-cd--project-calibration">
        <div className="site00-project-lore-calibration">
          <header className="site00-project-lore-calibration__hero">
            <ProjectExperimentsHubNav projectSlug={projectSlug} />
            <p className="site00-project-lore-calibration__kicker">EXPERIMENT 01 — V1 / V2</p>
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
              </section>

              {!v1Artifacts.length && (
                <section className="site00-experiment-g__panel">
                  <p>Formulate nine sibling first-slide artifacts across unrelated topics — behavior-first, not template-first.</p>
                  <button type="button" className="site00-btn site00-btn--primary" disabled={busy || !run?.expressionSystem} onClick={() => void formulate()}>
                    FORMULATE EXPERIMENT 01 V1
                  </button>
                </section>
              )}

              {v1Artifacts.length > 0 && !v2Artifacts.length && (
                <section className="site00-experiment-g__panel">
                  <p>V1 preserved as methodology evidence. Formulate V2 contracts (same nine topics, editorial information governance).</p>
                  <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={() => void formulateV2()}>
                    FORMULATE V2 CONTRACTS
                  </button>
                </section>
              )}

              {(showingV2 ? v2Artifacts : v1Artifacts).length > 0 && (
                <>
                  <section className="site00-experiment-g__panel">
                    <h2>3×3 FEED PREVIEW — {versionTab}</h2>
                    <div className="site00-marketing-exp01-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      {(showingV2 ? v2Artifacts : v1Artifacts).map((a) => {
                        const headline = showingV2 ? (a as Experiment01V2Artifact).contract.primaryHook : (a as BrandMarketingArtifact).headline;
                        const url = a.generatedAssetUrl;
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
                            ) : (
                              <span>{headline}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </section>

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

                      {selectedV2.generationStatus !== 'GENERATED' && (
                        <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={() => void generate(selectedV2.id)}>
                          GENERATE V2 FIRST SLIDE (FAL)
                        </button>
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

                  {!showingV2 && selectedV1 && (
                    <section className="site00-experiment-g__panel">
                      <h2>{selectedV1.headline}</h2>
                      <dl>
                        <dt>TOPIC</dt><dd>{selectedV1.topic}</dd>
                        <dt>BEHAVIORAL MODE</dt><dd>{selectedV1.behavioralModeId}</dd>
                        <dt>EXPRESSION CLASS</dt><dd>{selectedV1.artifactExpressionClass}</dd>
                      </dl>
                      {selectedV1.generationStatus !== 'GENERATED' && (
                        <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={() => void generate(selectedV1.id)}>
                          GENERATE FIRST SLIDE (FAL)
                        </button>
                      )}
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
                </>
              )}
            </>
          )}
        </div>
      </div>
    </EcosystemShell>
  );
}
