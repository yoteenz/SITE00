import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { ProjectExperimentsHubNav } from '../components/projects/ProjectExperimentsHubNav';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import {
  site00ProjectCulturalIntelligencePath,
  site00ProjectCulturalIntelligenceWeeklyForecastPath,
  site00ProjectPath,
} from '../config/routes';
import { projectDisplayName } from '../utils/projectDisplayName';
import type { LiveCulturalIntelligenceRun } from '../../../shared/site00-studio-world-production/liveCulturalIntelligence/types';
import '../styles/site00-replay-execution.css';

export default function ProjectCulturalIntelligenceSourcesPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<LiveCulturalIntelligenceRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [manualNote, setManualNote] = useState('');
  const [manualAttention, setManualAttention] = useState('');

  const reload = useCallback(async () => {
    if (projectSlug !== 'ndxbook') return;
    try {
      const result = await site00ProjectsApi.culturalIntelligenceGet(projectSlug);
      setRun((result.run as LiveCulturalIntelligenceRun | null) ?? null);
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
        <p>Source health is NDXBOOK-only for this proof.</p>
      </EcosystemShell>
    );
  }

  const lastRefresh = run?.refreshRuns?.[run.refreshRuns.length - 1];

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-cd site00-cd--project-calibration">
        <div className="site00-project-lore-calibration">
          <header className="site00-project-lore-calibration__hero">
            <ProjectExperimentsHubNav projectSlug={projectSlug} />
            <p className="site00-project-lore-calibration__kicker">P0.5D.2 — SOURCE HEALTH</p>
            <h1 className="site00-project-lore-calibration__project">{projectDisplayName(projectSlug)}</h1>
            <Link to={site00ProjectCulturalIntelligencePath(projectSlug)}>← CULTURAL INTELLIGENCE</Link>
            <Link to={site00ProjectCulturalIntelligenceWeeklyForecastPath(projectSlug)}>WEEKLY FORECAST →</Link>
            <Link to={site00ProjectPath(projectSlug)}>← PROJECT</Link>
          </header>

          {loading ? (
            <p>Loading source health…</p>
          ) : (
            <>
              <section className="site00-experiment-g__panel">
                <h2>SOURCE FAMILIES</h2>
                <p>The world as seen through the current source stack — not the entire internet.</p>
                {run?.sourceAdapters.map((a) => (
                  <div key={a.adapterId}>
                    <strong>{a.sourceFamily}</strong> · {a.provider} · {a.status}
                    {a.lastSuccessAt ? ` · last success ${a.lastSuccessAt.slice(0, 16)}` : ''}
                    {a.signalsFound != null ? ` · signals ${a.signalsFound}` : ''}
                    {a.limitations?.length ? ` · ${a.limitations.join('; ')}` : ''}
                  </div>
                )) ?? <p>Not configured.</p>}
              </section>

              {lastRefresh ? (
                <section className="site00-experiment-g__panel">
                  <h2>LAST REFRESH</h2>
                  <p>Status: {lastRefresh.status} · Raw: {lastRefresh.rawRecordsFound} · Accepted: {lastRefresh.signalsAccepted} · Deduped: {lastRefresh.signalsDeduplicated} · Clusters: {lastRefresh.clustersUpdated}</p>
                  <p>Cost: ${lastRefresh.costUsd.toFixed(4)} · FAL: {lastRefresh.falRequests}</p>
                  {lastRefresh.errors.length ? <p>Errors: {lastRefresh.errors.join('; ')}</p> : null}
                </section>
              ) : null}

              {run?.sourceCoverage ? (
                <section className="site00-experiment-g__panel">
                  <h2>COVERAGE / BLIND SPOTS</h2>
                  <p>Covered: {run.sourceCoverage.coveredDomains.join(', ') || '—'}</p>
                  <p>Weak: {run.sourceCoverage.weakDomains.join(', ') || '—'}</p>
                  <p>Uncovered: {run.sourceCoverage.uncoveredDomains.join(', ') || '—'}</p>
                  <p>{run.sourceCoverage.knownBlindSpots.join(' · ')}</p>
                </section>
              ) : null}

              <section className="site00-experiment-g__panel">
                <h2>REFRESH LIVE INTELLIGENCE</h2>
                <button
                  type="button"
                  className="site00-btn site00-btn--primary"
                  disabled={busy}
                  onClick={() => {
                    setBusy(true);
                    void site00ProjectsApi
                      .culturalIntelligenceRefresh(projectSlug)
                      .then((r) => setRun(r.run as LiveCulturalIntelligenceRun))
                      .finally(() => setBusy(false));
                  }}
                >
                  REFRESH LIVE INTELLIGENCE
                </button>
              </section>

              <section className="site00-experiment-g__panel">
                <h2>ADD SOMETHING NDX SHOULD LOOK AT</h2>
                <input type="text" placeholder="What caught attention" value={manualAttention} onChange={(e) => setManualAttention(e.target.value)} />
                <textarea placeholder="Founder note" value={manualNote} onChange={(e) => setManualNote(e.target.value)} rows={3} />
                <button
                  type="button"
                  className="site00-btn"
                  disabled={busy || !manualNote.trim() || !manualAttention.trim()}
                  onClick={() => {
                    setBusy(true);
                    void site00ProjectsApi
                      .culturalIntelligenceAddManualSignal(projectSlug, { founderNote: manualNote, whatCaughtAttention: manualAttention })
                      .then((r) => {
                        setRun(r.run as LiveCulturalIntelligenceRun);
                        setManualNote('');
                        setManualAttention('');
                      })
                      .finally(() => setBusy(false));
                  }}
                >
                  SUBMIT MANUAL SIGNAL
                </button>
              </section>
            </>
          )}
        </div>
      </div>
    </EcosystemShell>
  );
}
