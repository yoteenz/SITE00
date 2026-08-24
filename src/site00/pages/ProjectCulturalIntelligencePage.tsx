import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FounderWorkspaceShell,
  CulturalRadarRoom,
  InspectorKeyValue,
} from '../components/founderWorkspace';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import {
  site00ProjectCulturalIntelligenceSourcesPath,
  site00ProjectCulturalIntelligenceWeeklyForecastPath,
} from '../config/routes';
import type { LiveCulturalIntelligenceRun } from '../../../shared/site00-studio-world-production/liveCulturalIntelligence/types';
import {
  buildLiveSignalsPresentation,
  culturalIntelligenceInspectPayload,
} from '../../../shared/site00-brand-lore/founderWorkspace/culturalIntelligenceRadarAdapter';
import '../styles/site00-founder-workspace.css';

type RadarView = 'LIVE' | 'FORECAST' | 'ARCHIVE';

export default function ProjectCulturalIntelligencePage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<LiveCulturalIntelligenceRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<RadarView>('LIVE');

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

  const signals = useMemo(() => buildLiveSignalsPresentation(run), [run]);
  const opportunities = run?.brandInterpretations.filter(
    (i) => i.decision === 'STRONG_OPPORTUNITY' || i.decision === 'CALLBACK_OPPORTUNITY',
  ) ?? [];
  const skip = run?.brandInterpretations.filter(
    (i) => i.decision === 'TOO_SATURATED' || i.decision === 'FORCED_PARTICIPATION',
  ) ?? [];

  if (projectSlug !== 'ndxbook') {
    return <p>Cultural intelligence is NDXBOOK-only for this proof.</p>;
  }

  const inspectContent = (
    <>
      <InspectorKeyValue data={culturalIntelligenceInspectPayload(run)} />
      <details className="site00-fws-review__inspect">
        <summary>SOURCE CONNECTORS</summary>
        <ul>
          {run?.sourceAdapters.map((a) => (
            <li key={a.adapterId}>{a.provider} — {a.status} ({a.sourceFamily})</li>
          )) ?? <li>Not configured.</li>}
        </ul>
      </details>
      <details className="site00-fws-review__inspect">
        <summary>INTELLIGENCE PIPELINE</summary>
        <p>WORLD → SIGNALS → FORECAST → BRAND RELEVANCE → CONTENT OPPORTUNITY</p>
        <p>Status: {run?.status ?? 'NOT_STARTED'} · FAL: 0</p>
      </details>
    </>
  );

  return (
    <FounderWorkspaceShell
      projectSlug={projectSlug}
      workspaceTitle="CULTURAL INTELLIGENCE"
      inspectTitle="CULTURAL INTELLIGENCE — SYSTEM"
      inspectContent={inspectContent}
    >
      <div className="site00-fws-desk">
        <header className="site00-fws-desk__hero">
          <p className="site00-fws-campaign__kicker">RADAR ROOM</p>
          <h1 className="site00-fws-campaign__title">ON NDX&apos;S RADAR</h1>
          <p className="site00-fws-desk__subtitle">
            What would this brand notice, connect, question, or remember?
          </p>
        </header>

        {loading ? (
          <p className="site00-fws-empty">Loading cultural intelligence…</p>
        ) : (
          <>
            <div className="site00-fws-desk__actions">
              {!run?.sourceAdapters.length ? (
                <button
                  type="button"
                  className="site00-fws-btn site00-fws-btn--primary"
                  disabled={busy}
                  onClick={() => void act(() => site00ProjectsApi.culturalIntelligenceConfigure(projectSlug))}
                >
                  CONFIGURE INTELLIGENCE LAYER
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="site00-fws-btn"
                    disabled={busy}
                    onClick={() => void act(() => site00ProjectsApi.culturalIntelligenceRefresh(projectSlug))}
                  >
                    REFRESH LIVE INTELLIGENCE
                  </button>
                  <button
                    type="button"
                    className="site00-fws-btn site00-fws-btn--primary"
                    disabled={busy}
                    onClick={() => void act(() => site00ProjectsApi.culturalIntelligencePromoteOpportunities(projectSlug))}
                  >
                    PROMOTE OPPORTUNITIES → CONTENT OPS
                  </button>
                </>
              )}
              <Link to={site00ProjectCulturalIntelligenceWeeklyForecastPath(projectSlug)} className="site00-fws-journey__all">
                WEEKLY FORECAST →
              </Link>
              <Link to={site00ProjectCulturalIntelligenceSourcesPath(projectSlug)} className="site00-fws-journey__all">
                SOURCE HEALTH →
              </Link>
            </div>

            <CulturalRadarRoom
              signals={signals}
              view={view}
              onViewChange={setView}
              forecastContent={
                <div className="site00-fws-radar__signals">
                  {run?.upcomingMoments.map((m) => (
                    <article key={m.id} className="site00-fws-signal">
                      <p className="site00-fws-signal__category">UPCOMING</p>
                      <h3 className="site00-fws-signal__headline">{m.name}</h3>
                      <p className="site00-fws-signal__lead">{m.startAt} · {m.expectedAttention} attention</p>
                    </article>
                  )) ?? <p className="site00-fws-empty">No forecast loaded.</p>}
                  {run?.weeklyForecast ? (
                    <p className="site00-fws-desk__subtitle">
                      {run.weeklyForecast.acceleratingConversations.length} accelerating ·{' '}
                      {run.weeklyForecast.brandOpportunities.length} opportunities
                    </p>
                  ) : null}
                </div>
              }
              archiveContent={
                <div className="site00-fws-radar__signals">
                  {skip.map((i) => (
                    <article key={i.id} className="site00-fws-signal">
                      <p className="site00-fws-signal__category">SATURATED / SKIP</p>
                      <h3 className="site00-fws-signal__headline">{i.rejectionReason ?? i.reasoning}</h3>
                    </article>
                  ))}
                  {opportunities.map((i) => (
                    <article key={i.id} className="site00-fws-signal">
                      <p className="site00-fws-signal__category">{i.decision.replace(/_/g, ' ')}</p>
                      <h3 className="site00-fws-signal__headline">{i.reasoning}</h3>
                      <button
                        type="button"
                        className="site00-fws-btn site00-fws-btn--primary"
                        disabled={busy}
                        onClick={() => void act(() => site00ProjectsApi.culturalIntelligencePromoteItem(projectSlug, i.id))}
                      >
                        PROMOTE TO CONTENT OPPORTUNITY
                      </button>
                    </article>
                  ))}
                </div>
              }
            />

            <details className="site00-fws-review__inspect">
              <summary>INSPECT — watch queue + accelerating signals</summary>
              <section>
                <h3>ACCELERATING</h3>
                {(run?.signals.filter((s) => s.velocity >= 0.6 && s.saturation < 0.7) ?? []).map((s) => (
                  <p key={s.id}>{s.title} — velocity {s.velocity.toFixed(2)}</p>
                ))}
              </section>
              <section>
                <h3>WATCHING</h3>
                {run?.watchQueue?.entries.map((e) => (
                  <p key={e.entryId}>{e.subject} — {e.watchState}</p>
                )) ?? <p>Watch queue empty.</p>}
              </section>
            </details>
          </>
        )}
      </div>
    </FounderWorkspaceShell>
  );
}
