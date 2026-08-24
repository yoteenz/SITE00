import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { ProjectExperimentsHubNav } from '../components/projects/ProjectExperimentsHubNav';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import { site00ProjectContentOperationsPath, site00ProjectPath } from '../config/routes';
import { projectDisplayName } from '../utils/projectDisplayName';
import type { ContentOperationsRun } from '../../../shared/site00-brand-lore/contentOperations/types';
import '../styles/site00-replay-execution.css';

export default function ProjectContentOperationsPerformancePage() {
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

  if (projectSlug !== 'ndxbook') {
    return (
      <EcosystemShell hidePageHeader>
        <p>Performance review is NDXBOOK-only.</p>
      </EcosystemShell>
    );
  }

  const learning = run?.performanceLearning ?? [];

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-cd site00-cd--project-calibration">
        <div className="site00-project-lore-calibration">
          <header className="site00-project-lore-calibration__hero">
            <ProjectExperimentsHubNav projectSlug={projectSlug} />
            <p className="site00-project-lore-calibration__kicker">PERFORMANCE + LEARNING</p>
            <h1 className="site00-project-lore-calibration__project">{projectDisplayName(projectSlug)}</h1>
            <Link to={site00ProjectContentOperationsPath(projectSlug)}>← CONTENT OPERATIONS</Link>
            <Link to={site00ProjectPath(projectSlug)}>← PROJECT</Link>
          </header>

          {loading ? (
            <p>Loading performance data…</p>
          ) : (
            <>
              <section className="site00-experiment-g__panel">
                <h2>WHAT WE PUBLISHED</h2>
                {run?.contentPackages.filter((p) => p.status === 'APPROVED' || p.status === 'PUBLISHED').length === 0 && (
                  <p>No published packages yet — approve and publish manually first.</p>
                )}
                <ul>
                  {run?.contentPackages.filter((p) => p.status === 'APPROVED').map((p) => (
                    <li key={p.id}>{p.altText} — {p.channel}</li>
                  ))}
                </ul>
              </section>

              <section className="site00-experiment-g__panel">
                <h2>WHAT HAPPENED (METRICS)</h2>
                {run?.performanceRecords.length === 0 && <p>No performance records ingested yet.</p>}
                <ul>
                  {run?.performanceRecords.map((r) => (
                    <li key={r.recordId}>
                      Package {r.contentPackageId}: impressions {r.impressions ?? 'N/A'} · saves {r.saves ?? 'N/A'}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="site00-experiment-g__panel">
                <h2>WHAT PEOPLE SAID</h2>
                <ul>
                  {run?.audienceResponses.map((a) => (
                    <li key={a.evidenceId}>{a.text} — {a.classifications.join(', ')}</li>
                  ))}
                </ul>
              </section>

              <section className="site00-experiment-g__panel">
                <h2>WHAT THE SYSTEM THINKS MAY BE HAPPENING</h2>
                {learning.map((l) => (
                  <div key={l.learningId} style={{ marginBottom: '16px' }}>
                    <p><strong>Confidence:</strong> {l.confidence} (n={l.sampleSize})</p>
                    <p><strong>Patterns:</strong> {l.observedPatterns.join('; ')}</p>
                    <p><strong>Do NOT infer:</strong> {l.doNotInfer.join('; ')}</p>
                    <p><strong>Recommended adjustments:</strong> {l.recommendedProductionAdjustments.join('; ') || 'None yet'}</p>
                    {!l.founderAccepted && (
                      <button
                        type="button"
                        className="site00-btn site00-btn--primary"
                        disabled={busy}
                        onClick={async () => {
                          setBusy(true);
                          try {
                            const result = await site00ProjectsApi.contentOperationsAcceptLearning(projectSlug, l.learningId);
                            setRun((result.run as ContentOperationsRun) ?? null);
                          } finally {
                            setBusy(false);
                          }
                        }}
                      >
                        FOUNDER ACCEPTS LEARNING
                      </button>
                    )}
                    {l.founderAccepted && <p><em>Founder accepted — may influence future opportunity ranking</em></p>}
                  </div>
                ))}
              </section>

              <section className="site00-experiment-g__panel">
                <h2>WHAT NOT TO CONCLUDE</h2>
                <ul>
                  <li>PERFORMANCE ≠ CHARACTER AUTHORITY</li>
                  <li>One viral post does not rewrite editorial strategy</li>
                  <li>Do not increase snark because snark performed</li>
                  <li>Do not turn NDX into a nostalgia brand because callbacks performed</li>
                </ul>
              </section>

              {run?.contentPackages.some((p) => p.status === 'APPROVED') && (
                <section className="site00-experiment-g__panel">
                  <h2>RECORD PERFORMANCE (MANUAL)</h2>
                  {run.contentPackages.filter((p) => p.status === 'APPROVED').map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="site00-btn"
                      disabled={busy}
                      style={{ margin: '4px' }}
                      onClick={async () => {
                        setBusy(true);
                        try {
                          const result = await site00ProjectsApi.contentOperationsRecordPerformance(projectSlug, p.id, {
                            impressions: 1200,
                            saves: 45,
                            likes: 89,
                          });
                          setRun((result.run as ContentOperationsRun) ?? null);
                        } finally {
                          setBusy(false);
                        }
                      }}
                    >
                      INGEST METRICS — {p.altText}
                    </button>
                  ))}
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </EcosystemShell>
  );
}
