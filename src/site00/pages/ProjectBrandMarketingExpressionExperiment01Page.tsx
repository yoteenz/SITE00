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
import { MARKETING_ARTIFACT_FOUNDER_JUDGMENTS, MARKETING_SET_FOUNDER_JUDGMENTS } from '../../../shared/site00-brand-lore/brandMarketingExpression/constants';
import '../styles/site00-replay-execution.css';

const POLL_MS = 5000;

export default function ProjectBrandMarketingExpressionExperiment01Page() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<BrandMarketingExpressionRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (projectSlug !== 'ndxbook') return;
    try {
      const result = await site00ProjectsApi.marketingExpressionGet(projectSlug);
      const next = (result.run as BrandMarketingExpressionRun | null) ?? null;
      setRun(next);
      const artifacts = next?.experiment01?.artifacts ?? [];
      if (!selectedId && artifacts.length > 0) setSelectedId(artifacts[0]!.id);
    } catch {
      setRun(null);
    } finally {
      setLoading(false);
    }
  }, [projectSlug, selectedId]);

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

  const generate = async (artifactId: string) => {
    setBusy(true);
    try {
      const result = await site00ProjectsApi.marketingExpressionExperiment01Generate(projectSlug, artifactId);
      setRun((result.run as BrandMarketingExpressionRun) ?? null);
    } finally {
      setBusy(false);
    }
  };

  const setArtifactJudgment = async (artifactId: string, judgment: string) => {
    setBusy(true);
    try {
      const result = await site00ProjectsApi.marketingExpressionExperiment01ArtifactJudgment(
        projectSlug,
        artifactId,
        judgment,
      );
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
  const artifacts = exp?.artifacts ?? [];
  const selected: BrandMarketingArtifact | undefined = artifacts.find((a) => a.id === selectedId) ?? artifacts[0];

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-cd site00-cd--project-calibration">
        <div className="site00-project-lore-calibration">
          <header className="site00-project-lore-calibration__hero">
            <ProjectExperimentsHubNav projectSlug={projectSlug} />
            <p className="site00-project-lore-calibration__kicker">EXPERIMENT 01</p>
            <h1 className="site00-project-lore-calibration__project">{projectDisplayName(projectSlug)}</h1>
            <p className="site00-project-lore-calibration__headline">NDX FEED — NINE FIRST SLIDES</p>
            <Link to={site00ProjectBrandMarketingExpressionPath(projectSlug)}>← MARKETING EXPRESSION</Link>
            <Link to={site00ProjectPath(projectSlug)}>← PROJECT</Link>
          </header>

          {loading ? (
            <p>Loading Experiment 01…</p>
          ) : (
            <>
              {!exp?.artifacts.length && (
                <section className="site00-experiment-g__panel">
                  <p>Formulate nine sibling first-slide artifacts across unrelated topics — behavior-first, not template-first.</p>
                  <button type="button" className="site00-btn site00-btn--primary" disabled={busy || !run?.expressionSystem} onClick={() => void formulate()}>
                    FORMULATE EXPERIMENT 01
                  </button>
                </section>
              )}

              {artifacts.length > 0 && (
                <>
                  <section className="site00-experiment-g__panel">
                    <h2>3×3 FEED PREVIEW</h2>
                    <div className="site00-marketing-exp01-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      {artifacts.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          className={selected?.id === a.id ? 'site00-btn site00-btn--primary' : 'site00-btn'}
                          onClick={() => setSelectedId(a.id)}
                          style={{ minHeight: '80px', textAlign: 'left', padding: '8px' }}
                        >
                          {a.generatedAssetUrl ? (
                            <img src={a.generatedAssetUrl} alt={a.headline} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
                          ) : (
                            <span>{a.headline}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </section>

                  {selected && (
                    <section className="site00-experiment-g__panel">
                      <h2>{selected.headline}</h2>
                      <dl>
                        <dt>TOPIC</dt><dd>{selected.topic}</dd>
                        <dt>SUBJECT</dt><dd>{selected.subject}</dd>
                        <dt>BEHAVIORAL MODE</dt><dd>{selected.behavioralModeId}</dd>
                        <dt>TEMPERATURE</dt><dd>{selected.characterTemperature}</dd>
                        <dt>RESOLUTION</dt><dd>{selected.resolutionState}</dd>
                        <dt>EXPRESSION CLASS</dt><dd>{selected.artifactExpressionClass}</dd>
                        <dt>NDX NOTICED</dt><dd>{selected.supportingLanguage[0]}</dd>
                        <dt>JUDGMENT STATE</dt><dd>{selected.judgmentState}</dd>
                        <dt>EVIDENCE</dt><dd>{selected.evidenceObjects.join('; ')}</dd>
                        <dt>TRACES LEFT</dt><dd>{selected.makerTraces.join('; ')}</dd>
                        <dt>VISUAL CAUSALITY</dt>
                        <dd>
                          <ul>
                            {selected.visualCausalityRecords.map((r) => (
                              <li key={r.visualElement}>{r.visualElement}: {r.reasonForExistence}</li>
                            ))}
                          </ul>
                        </dd>
                        <dt>WHY THIS SHOULD FEEL LIKE NDX</dt>
                        <dd>Behavior + judgment visible without logo, lime, or template dependency.</dd>
                      </dl>

                      {selected.generationStatus !== 'GENERATED' && (
                        <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={() => void generate(selected.id)}>
                          GENERATE FIRST SLIDE (FAL)
                        </button>
                      )}

                      <div style={{ marginTop: '12px' }}>
                        <p>Artifact judgment:</p>
                        {MARKETING_ARTIFACT_FOUNDER_JUDGMENTS.slice(0, 8).map((j) => (
                          <button key={j} type="button" className="site00-btn" disabled={busy} style={{ margin: '2px' }} onClick={() => void setArtifactJudgment(selected.id, j)}>
                            {j.replace(/_/g, ' ')}
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  {exp?.setEvaluation && (
                    <section className="site00-experiment-g__panel">
                      <h2>SET EVALUATION</h2>
                      <ul>
                        <li>Same character across topics: {exp.setEvaluation.sameCharacterAcrossTopics}</li>
                        <li>Meaningful visual range: {exp.setEvaluation.meaningfulVisualRange}</li>
                        <li>Feed coherence without template: {exp.setEvaluation.feedCoherenceWithoutTemplate}</li>
                        <li>Behavioral range: {exp.setEvaluation.behavioralRange}</li>
                      </ul>
                      <p>Set-level judgment:</p>
                      {MARKETING_SET_FOUNDER_JUDGMENTS.slice(0, 4).map((j) => (
                        <button key={j} type="button" className="site00-btn" disabled={busy} style={{ margin: '2px' }} onClick={() => void setSetJudgment(j)}>
                          {j.replace(/_/g, ' ')}
                        </button>
                      ))}
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
