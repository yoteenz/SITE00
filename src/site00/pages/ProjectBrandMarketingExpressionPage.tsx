import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { ProjectExperimentsHubNav } from '../components/projects/ProjectExperimentsHubNav';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import {
  site00ProjectBrandMarketingExpressionExperiment01Path,
  site00ProjectBrandCharacterArtifactProofsPath,
  site00ProjectPath,
} from '../config/routes';
import { projectDisplayName } from '../utils/projectDisplayName';
import type { BrandMarketingExpressionRun } from '../../../shared/site00-brand-lore/brandMarketingExpression/types';
import { NDX_PUBLIC_BEHAVIOR_THESIS } from '../../../shared/site00-brand-lore/brandMarketingExpression/constants';
import '../styles/site00-replay-execution.css';

const POLL_MS = 5000;

export default function ProjectBrandMarketingExpressionPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<BrandMarketingExpressionRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    if (projectSlug !== 'ndxbook') return;
    try {
      const result = await site00ProjectsApi.marketingExpressionGet(projectSlug);
      setRun((result.run as BrandMarketingExpressionRun | null) ?? null);
    } catch {
      setRun(null);
    } finally {
      setLoading(false);
    }
  }, [projectSlug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (run?.status !== 'EXPERIMENT_01_FORMULATING') return;
    const id = window.setInterval(() => void reload(), POLL_MS);
    return () => window.clearInterval(id);
  }, [run?.status, reload]);

  const prepare = async () => {
    setBusy(true);
    try {
      const result = await site00ProjectsApi.marketingExpressionPrepare(projectSlug);
      setRun((result.run as BrandMarketingExpressionRun) ?? null);
    } finally {
      setBusy(false);
    }
  };

  const compile = async () => {
    setBusy(true);
    try {
      const result = await site00ProjectsApi.marketingExpressionCompile(projectSlug);
      setRun((result.run as BrandMarketingExpressionRun) ?? null);
    } finally {
      setBusy(false);
    }
  };

  if (projectSlug !== 'ndxbook') {
    return (
      <EcosystemShell hidePageHeader>
        <p>Marketing Expression is NDXBOOK-only.</p>
      </EcosystemShell>
    );
  }

  const sys = run?.expressionSystem;
  const northStar = run?.northStarArtifact;

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-cd site00-cd--project-calibration">
        <div className="site00-project-lore-calibration">
          <header className="site00-project-lore-calibration__hero">
            <ProjectExperimentsHubNav projectSlug={projectSlug} />
            <p className="site00-project-lore-calibration__kicker">P0.5C — MARKETING EXPRESSION</p>
            <h1 className="site00-project-lore-calibration__project">{projectDisplayName(projectSlug)}</h1>
            <p className="site00-project-lore-calibration__headline">CHARACTER-LED MARKETING EXPRESSION</p>
            <Link to={site00ProjectBrandCharacterArtifactProofsPath(projectSlug)}>← ARTIFACT PROOFS</Link>
            <Link to={site00ProjectPath(projectSlug)}>← PROJECT</Link>
          </header>

          {loading ? (
            <p>Loading marketing expression…</p>
          ) : (
            <>
              <section className="site00-experiment-g__panel">
                <h2>PUBLIC BEHAVIOR THESIS</h2>
                <p>{sys?.publicBehaviorThesis ?? NDX_PUBLIC_BEHAVIOR_THESIS}</p>
                <ul>
                  <li><strong>How NDX enters a topic:</strong> {sys?.contentInitiationRules[0] ?? 'Character Event precedes artifact'}</li>
                  <li><strong>How NDX reacts:</strong> {sys?.reactionBehavior}</li>
                  <li><strong>How NDX investigates:</strong> {sys?.investigationBehavior}</li>
                  <li><strong>How NDX connects:</strong> {sys?.connectionBehavior}</li>
                  <li><strong>How NDX judges:</strong> {sys?.judgmentBehavior}</li>
                  <li><strong>How NDX remembers:</strong> {sys?.memoryBehavior}</li>
                  <li><strong>How NDX jokes:</strong> {sys?.humorBehavior}</li>
                  <li><strong>How NDX corrects itself:</strong> {sys?.correctionBehavior}</li>
                  <li><strong>How NDX uses evidence:</strong> {sys?.evidenceBehavior}</li>
                  <li><strong>How NDX becomes visual:</strong> {sys?.makerBehavior}</li>
                  <li><strong>Must never become template:</strong> {sys?.mustNeverBecome.join('; ') ?? 'Social template library'}</li>
                </ul>
              </section>

              {northStar && (
                <section className="site00-experiment-g__panel">
                  <h2>FOUNDER NORTH STAR — CHARACTER EXPRESSION CALIBRATION</h2>
                  <p><strong>Classification:</strong> {northStar.classification} — NOT FINAL IDENTITY</p>
                  <p><strong>Founder judgment:</strong> {northStar.founderJudgment ?? 'Pending'}</p>
                  <p><strong>Character authority:</strong> {northStar.characterExpressionAuthority} | <strong>Identity authority:</strong> {northStar.identityAuthority}</p>
                  <h3>WHY THIS FEELS LIKE NDX</h3>
                  <ul>
                    {northStar.panels.map((p) => (
                      <li key={p.panelCode}>{p.panelCode}: {p.whyFeelsLikeNdx}</li>
                    ))}
                  </ul>
                  <h3>WHAT WE ARE NOT AUTOMATICALLY COPYING</h3>
                  <p>{sys?.mustNotRequire.join(', ') ?? 'lime, cream paper, collage, handwriting, receipts'}</p>
                </section>
              )}

              <section className="site00-experiment-g__panel">
                <p>Status: {run?.status ?? 'NOT_STARTED'}</p>
                {!run && (
                  <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={() => void prepare()}>
                    RUN FORENSIC AUDIT + PREPARE
                  </button>
                )}
                {run && !sys && (
                  <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={() => void compile()}>
                    COMPILE MARKETING EXPRESSION SYSTEM
                  </button>
                )}
                {sys && (
                  <Link className="site00-btn site00-btn--primary" to={site00ProjectBrandMarketingExpressionExperiment01Path(projectSlug)}>
                    OPEN EXPERIMENT 01 →
                  </Link>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </EcosystemShell>
  );
}
