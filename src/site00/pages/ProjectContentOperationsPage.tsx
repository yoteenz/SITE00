import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { ProjectExperimentsHubNav } from '../components/projects/ProjectExperimentsHubNav';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import {
  site00ProjectBrandMarketingExpressionPath,
  site00ProjectContentOperationsPerformancePath,
  site00ProjectPath,
} from '../config/routes';
import { projectDisplayName } from '../utils/projectDisplayName';
import type { ContentOperationsRun } from '../../../shared/site00-brand-lore/contentOperations/types';
import { LIVE_CULTURAL_INTELLIGENCE_LAYER_IMPLEMENTED } from '../../../shared/site00-brand-lore/contentOperations/constants';
import '../styles/site00-replay-execution.css';

export default function ProjectContentOperationsPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<ContentOperationsRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    if (projectSlug !== 'ndxbook') return;
    try {
      const result = await site00ProjectsApi.contentOperationsGet(projectSlug);
      setRun((result.run as ContentOperationsRun | null) ?? null);
    } catch {
      setRun(null);
    } finally {
      setLoading(false);
    }
  }, [projectSlug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const act = async (fn: () => Promise<{ run: Record<string, unknown> }>) => {
    setBusy(true);
    try {
      const result = await fn();
      setRun((result.run as ContentOperationsRun) ?? null);
    } finally {
      setBusy(false);
    }
  };

  if (projectSlug !== 'ndxbook') {
    return (
      <EcosystemShell hidePageHeader>
        <p>Content Operations is NDXBOOK-only.</p>
      </EcosystemShell>
    );
  }

  const ops = run?.operationsSystem;
  const slate = run?.activeSlate;

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-cd site00-cd--project-calibration">
        <div className="site00-project-lore-calibration">
          <header className="site00-project-lore-calibration__hero">
            <ProjectExperimentsHubNav projectSlug={projectSlug} />
            <p className="site00-project-lore-calibration__kicker">P0.5D — CONTENT OPERATIONS</p>
            <h1 className="site00-project-lore-calibration__project">{projectDisplayName(projectSlug)}</h1>
            <p className="site00-project-lore-calibration__headline">CONTENT OPERATIONS + PERFORMANCE LEARNING</p>
            <Link to={site00ProjectBrandMarketingExpressionPath(projectSlug)}>← MARKETING EXPRESSION</Link>
            <Link to={site00ProjectContentOperationsPerformancePath(projectSlug)}>PERFORMANCE + LEARNING →</Link>
            <Link to={site00ProjectPath(projectSlug)}>← PROJECT</Link>
          </header>

          {loading ? (
            <p>Loading content operations…</p>
          ) : (
            <>
              <section className="site00-experiment-g__panel">
                <h2>OPERATING MODE</h2>
                <p><strong>{ops?.operatingMode ?? 'ASSISTED_AUTONOMY'}</strong> — founder approval required before external publishing</p>
                <p>Status: {run?.status ?? 'NOT_STARTED'}</p>
                {LIVE_CULTURAL_INTELLIGENCE_LAYER_IMPLEMENTED && (
                  <p><em>Live cultural intelligence layer available — manual signals + weekly forecast at Cultural Intelligence</em></p>
                )}
              </section>

              <section className="site00-experiment-g__panel">
                <h2>TODAY / THIS WEEK</h2>
                {!run && (
                  <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={() => void act(() => site00ProjectsApi.contentOperationsPrepare(projectSlug))}>
                    PREPARE + AUDIT
                  </button>
                )}
                {run && !ops && (
                  <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={() => void act(() => site00ProjectsApi.contentOperationsCompile(projectSlug))}>
                    COMPILE CONTENT OPERATIONS
                  </button>
                )}
                {ops && !run.opportunities.length && (
                  <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={() => void act(() => site00ProjectsApi.contentOperationsDiscoverOpportunities(projectSlug))}>
                    DISCOVER OPPORTUNITIES
                  </button>
                )}
                {run?.opportunities.length && !slate && (
                  <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={() => void act(() => site00ProjectsApi.contentOperationsProposeSlate(projectSlug))}>
                    PROPOSE WEEKLY SLATE
                  </button>
                )}
                {slate?.status === 'PROPOSED' && (
                  <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={() => void act(() => site00ProjectsApi.contentOperationsApproveSlate(projectSlug, 'APPROVE_SLATE'))}>
                    APPROVE SLATE
                  </button>
                )}
              </section>

              {run?.opportunities.length ? (
                <section className="site00-experiment-g__panel">
                  <h2>OPPORTUNITIES ({run.opportunities.length})</h2>
                  <ul>
                    {run.opportunities.map((o) => (
                      <li key={o.id}>
                        <strong>{o.subject}</strong> — {o.characterFit} — score {(o.rank?.compositeScore ?? 0).toFixed(2)}
                        <br />
                        <small>{o.rank?.whyHighPriority.join('; ')}</small>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {slate && (
                <section className="site00-experiment-g__panel">
                  <h2>WEEKLY SLATE — CHARACTER RANGE</h2>
                  <p>{slate.contentCandidates.length} candidates · est. ${slate.productionCostEstimate.toFixed(2)}</p>
                  <p>Topics: {Object.keys(slate.topicBalance).join(', ')}</p>
                  <p>Formats: {Object.keys(slate.formatBalance).join(', ')}</p>
                </section>
              )}

              {run?.contentPackages.length ? (
                <section className="site00-experiment-g__panel">
                  <h2>IN PRODUCTION / WAITING FOR YOU ({run.contentPackages.length})</h2>
                  {run.contentPackages.map((p) => (
                    <div key={p.id} style={{ marginBottom: '12px', borderBottom: '1px solid #ccc', paddingBottom: '8px' }}>
                      <strong>{p.altText}</strong> — {p.channel} / {p.format} — {p.status}
                      <br />
                      <button type="button" className="site00-btn" disabled={busy} onClick={() => void act(() => site00ProjectsApi.contentOperationsApprovePackage(projectSlug, p.id))}>
                        APPROVE FOR PUBLISH
                      </button>
                    </div>
                  ))}
                </section>
              ) : null}

              {run?.publishingHandoffs.length ? (
                <section className="site00-experiment-g__panel">
                  <h2>SCHEDULED / READY FOR MANUAL PUBLISH</h2>
                  <ul>
                    {run.publishingHandoffs.map((h) => (
                      <li key={h.handoffId}>{h.status} — {h.channel} — package {h.contentPackageId}</li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {run?.marketTest01 && (
                <section className="site00-experiment-g__panel">
                  <h2>NDXBOOK MARKET TEST 01</h2>
                  <p>Objective: {run.marketTest01.testObjective} · {run.marketTest01.durationDays}-day pilot</p>
                  <p>Targets: {run.marketTest01.feedArtifactTarget} feed · {run.marketTest01.storyUnitTarget} stories · {run.marketTest01.reelConceptTarget} reels</p>
                  <p>Status: {run.marketTest01.status}</p>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </EcosystemShell>
  );
}
