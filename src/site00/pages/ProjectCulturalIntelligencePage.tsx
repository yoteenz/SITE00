import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { ProjectExperimentsHubNav } from '../components/projects/ProjectExperimentsHubNav';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import {
  site00ProjectContentOperationsPath,
  site00ProjectCulturalIntelligenceWeeklyForecastPath,
  site00ProjectPath,
} from '../config/routes';
import { projectDisplayName } from '../utils/projectDisplayName';
import type { LiveCulturalIntelligenceRun } from '../../../shared/site00-studio-world-production/liveCulturalIntelligence/types';
import '../styles/site00-replay-execution.css';

type ViewSection = 'LIVE_NOW' | 'COMING' | 'ACCELERATING' | 'WATCHING' | 'OPPORTUNITIES' | 'SKIP' | 'SOURCES';

export default function ProjectCulturalIntelligencePage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<LiveCulturalIntelligenceRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<ViewSection>('LIVE_NOW');

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

  const act = async (fn: () => Promise<{ run?: Record<string, unknown>; intelRun?: Record<string, unknown> }>) => {
    setBusy(true);
    try {
      const result = await fn();
      const next = (result.run ?? result.intelRun) as LiveCulturalIntelligenceRun | undefined;
      if (next) setRun(next);
      else await reload();
    } finally {
      setBusy(false);
    }
  };

  if (projectSlug !== 'ndxbook') {
    return (
      <EcosystemShell hidePageHeader>
        <p>Cultural intelligence is NDXBOOK-only for this proof.</p>
      </EcosystemShell>
    );
  }

  const accelerating = run?.signals.filter((s) => s.velocity >= 0.6 && s.saturation < 0.7) ?? [];
  const opportunities = run?.brandInterpretations.filter((i) => i.decision === 'STRONG_OPPORTUNITY' || i.decision === 'CALLBACK_OPPORTUNITY') ?? [];
  const skip = run?.brandInterpretations.filter((i) => i.decision === 'TOO_SATURATED' || i.decision === 'FORCED_PARTICIPATION') ?? [];

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-cd site00-cd--project-calibration">
        <div className="site00-project-lore-calibration">
          <header className="site00-project-lore-calibration__hero">
            <ProjectExperimentsHubNav projectSlug={projectSlug} />
            <p className="site00-project-lore-calibration__kicker">P0.5D.1 — LIVE CULTURAL INTELLIGENCE</p>
            <h1 className="site00-project-lore-calibration__project">{projectDisplayName(projectSlug)}</h1>
            <p className="site00-project-lore-calibration__headline">TREND FORECASTING + TEMPORAL RELEVANCE</p>
            <Link to={site00ProjectContentOperationsPath(projectSlug)}>← CONTENT OPERATIONS</Link>
            <Link to={site00ProjectCulturalIntelligenceWeeklyForecastPath(projectSlug)}>WEEKLY FORECAST →</Link>
            <Link to={site00ProjectPath(projectSlug)}>← PROJECT</Link>
          </header>

          {loading ? (
            <p>Loading cultural intelligence…</p>
          ) : (
            <>
              <section className="site00-experiment-g__panel">
                <h2>INTELLIGENCE PIPELINE</h2>
                <p>WORLD → SIGNALS → FORECAST → BRAND RELEVANCE → CONTENT OPPORTUNITY</p>
                <p>Not: what is trending? — What would this brand notice, connect, question, or remember?</p>
                <p>Status: {run?.status ?? 'NOT_STARTED'} · FAL for forecasting: 0</p>
                {!run?.sourceAdapters.length && (
                  <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={() => void act(() => site00ProjectsApi.culturalIntelligenceConfigure(projectSlug))}>
                    CONFIGURE INTELLIGENCE LAYER
                  </button>
                )}
                {run?.sourceAdapters.length ? (
                  <>
                    <button type="button" className="site00-btn" disabled={busy} onClick={() => void act(() => site00ProjectsApi.culturalIntelligenceRefresh(projectSlug))}>
                      REFRESH LIVE SIGNALS (MANUAL)
                    </button>
                    <button type="button" className="site00-btn" disabled={busy} onClick={() => void act(() => site00ProjectsApi.culturalIntelligencePromoteOpportunities(projectSlug))}>
                      PROMOTE NDX OPPORTUNITIES → CONTENT OPS
                    </button>
                  </>
                ) : null}
              </section>

              <section className="site00-experiment-g__panel">
                <h2>VIEW</h2>
                {(['LIVE_NOW', 'COMING', 'ACCELERATING', 'WATCHING', 'OPPORTUNITIES', 'SKIP', 'SOURCES'] as ViewSection[]).map((mode) => (
                  <button key={mode} type="button" className={view === mode ? 'site00-btn site00-btn--primary' : 'site00-btn'} onClick={() => setView(mode)}>
                    {mode.replace('_', ' ')}
                  </button>
                ))}
              </section>

              {view === 'LIVE_NOW' && (
                <section className="site00-experiment-g__panel">
                  <h2>LIVE NOW</h2>
                  {run?.signals.map((s) => (
                    <p key={s.id}>{s.title} — {s.lifecycleState} · {s.freshnessState}</p>
                  )) ?? <p>No signals loaded.</p>}
                </section>
              )}

              {view === 'COMING' && (
                <section className="site00-experiment-g__panel">
                  <h2>WHAT&apos;S COMING</h2>
                  {run?.upcomingMoments.map((m) => (
                    <p key={m.id}>{m.name} — {m.startAt} · {m.expectedAttention} attention · {m.certainty}</p>
                  )) ?? <p>No known moments.</p>}
                </section>
              )}

              {view === 'ACCELERATING' && (
                <section className="site00-experiment-g__panel">
                  <h2>ACCELERATING</h2>
                  {accelerating.map((s) => (
                    <p key={s.id}>{s.title} — velocity {s.velocity.toFixed(2)}</p>
                  ))}
                </section>
              )}

              {view === 'WATCHING' && (
                <section className="site00-experiment-g__panel">
                  <h2>WATCHING</h2>
                  {run?.watchQueue?.entries.map((e) => (
                    <p key={e.entryId}>{e.subject} — {e.watchState}</p>
                  )) ?? <p>Watch queue empty.</p>}
                </section>
              )}

              {view === 'OPPORTUNITIES' && (
                <section className="site00-experiment-g__panel">
                  <h2>NDX OPPORTUNITIES</h2>
                  {opportunities.map((i) => (
                    <p key={i.id}>{i.reasoning} — {i.decision}</p>
                  ))}
                </section>
              )}

              {view === 'SKIP' && (
                <section className="site00-experiment-g__panel">
                  <h2>SATURATED / SKIP</h2>
                  {skip.map((i) => (
                    <p key={i.id}>{i.rejectionReason ?? i.reasoning}</p>
                  ))}
                </section>
              )}

              {view === 'SOURCES' && (
                <section className="site00-experiment-g__panel">
                  <h2>SOURCE CONNECTORS</h2>
                  {run?.sourceAdapters.map((a) => (
                    <p key={a.adapterId}>{a.provider} — {a.status} ({a.sourceFamily})</p>
                  )) ?? <p>Not configured.</p>}
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </EcosystemShell>
  );
}
