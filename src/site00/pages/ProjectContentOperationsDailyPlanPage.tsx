import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { ProjectExperimentsHubNav } from '../components/projects/ProjectExperimentsHubNav';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import {
  site00ProjectContentOperationsCampaignBoardPath,
  site00ProjectContentOperationsPath,
  site00ProjectPath,
} from '../config/routes';
import { projectDisplayName } from '../utils/projectDisplayName';
import type { DailyPublishingCadenceRun } from '../../../shared/site00-studio-world-production/dailyPublishingCadence/types';
import '../styles/site00-replay-execution.css';

type ViewMode = 'DAILY' | 'WEEK' | 'BY_EVENT' | 'BY_PLATFORM';

export default function ProjectContentOperationsDailyPlanPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<DailyPublishingCadenceRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('WEEK');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const reload = useCallback(async () => {
    if (projectSlug !== 'ndxbook') return;
    try {
      const result = await site00ProjectsApi.dailyPublishingGet(projectSlug);
      setRun((result.run as DailyPublishingCadenceRun | null) ?? null);
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
      setRun((result.run as DailyPublishingCadenceRun) ?? null);
    } finally {
      setBusy(false);
    }
  };

  if (projectSlug !== 'ndxbook') {
    return (
      <EcosystemShell hidePageHeader>
        <p>Daily publishing cadence is NDXBOOK-only for this proof.</p>
      </EcosystemShell>
    );
  }

  const policy = run?.publishingCadencePolicy;
  const feedTarget = policy?.channelTargets.find((t) => t.surface === 'FEED')?.targetPerDay ?? 3;
  const storyTarget = policy?.channelTargets.find((t) => t.surface === 'STORY')?.targetPerDay ?? 4;
  const reelTarget = policy?.channelTargets.find((t) => t.surface === 'REEL')?.targetPerDay ?? 1;
  const reelMax = policy?.channelTargets.find((t) => t.surface === 'REEL')?.maxNormalPerDay ?? 2;
  const dayEvents = run?.primaryEvents.filter((e) => e.date === selectedDate) ?? [];
  const dayExpressions = run?.platformExpressions.filter((e) => dayEvents.some((ev) => ev.id === e.primaryContentEventId)) ?? [];
  const secondReel = run?.secondReelEligibilityByDate[selectedDate];

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-cd site00-cd--project-calibration">
        <div className="site00-project-lore-calibration">
          <header className="site00-project-lore-calibration__hero">
            <ProjectExperimentsHubNav projectSlug={projectSlug} />
            <p className="site00-project-lore-calibration__kicker">P0.5E.1 — DAILY PUBLISHING CADENCE</p>
            <h1 className="site00-project-lore-calibration__project">{projectDisplayName(projectSlug)}</h1>
            <p className="site00-project-lore-calibration__headline">CROSS-PLATFORM CONTENT DERIVATION</p>
            <Link to={site00ProjectContentOperationsPath(projectSlug)}>← CONTENT OPERATIONS</Link>
            <Link to={site00ProjectContentOperationsCampaignBoardPath(projectSlug)}>← CAMPAIGN BOARD</Link>
            <Link to={site00ProjectPath(projectSlug)}>← PROJECT</Link>
          </header>

          {loading ? (
            <p>Loading daily publishing cadence…</p>
          ) : (
            <>
              <section className="site00-experiment-g__panel">
                <h2>NDX CADENCE</h2>
                <p>
                  {feedTarget} FEED / DAY · {storyTarget} STORY UNITS / DAY · {reelTarget} REEL TARGET / DAY · MAX {reelMax} REELS
                </p>
                <p>~3 PRIMARY CONTENT EVENTS / DAY → MULTIPLE PLATFORM-NATIVE EXPRESSIONS</p>
                <p>REUSE THE THINKING. RE-DERIVE THE EXPRESSION. DO NOT REUSE THE POST.</p>
                {!run?.publishingCadencePolicy && (
                  <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={() => void act(() => site00ProjectsApi.dailyPublishingConfigure(projectSlug))}>
                    CONFIGURE NDX DAILY CADENCE
                  </button>
                )}
                {run?.publishingCadencePolicy && run.primaryEvents.length === 0 && (
                  <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={() => void act(() => site00ProjectsApi.dailyPublishingPlanWeek(projectSlug, selectedDate))}>
                    PLAN WEEKLY PRIMARY EVENTS (~21)
                  </button>
                )}
                {run?.primaryEvents.length ? (
                  <>
                    <button type="button" className="site00-btn" disabled={busy} onClick={() => void act(() => site00ProjectsApi.dailyPublishingBuildDay(projectSlug, selectedDate))}>
                      DERIVE PLATFORM EXPRESSIONS FOR {selectedDate}
                    </button>
                    <button type="button" className="site00-btn" disabled={busy} onClick={() => void act(() => site00ProjectsApi.dailyPublishingApproveWeeklySlate(projectSlug))}>
                      APPROVE WEEKLY INTELLIGENCE SLATE
                    </button>
                  </>
                ) : null}
              </section>

              <section className="site00-experiment-g__panel">
                <h2>VIEW</h2>
                {(['WEEK', 'DAILY', 'BY_EVENT', 'BY_PLATFORM'] as ViewMode[]).map((mode) => (
                  <button key={mode} type="button" className={viewMode === mode ? 'site00-btn site00-btn--primary' : 'site00-btn'} onClick={() => setViewMode(mode)}>
                    {mode.replace('_', ' ')}
                  </button>
                ))}
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ marginLeft: '8px' }} />
              </section>

              {viewMode === 'DAILY' && (
                <section className="site00-experiment-g__panel">
                  <h2>DAILY PLAN — {selectedDate}</h2>
                  {run?.cadenceFulfillmentByDate[selectedDate] && (
                    <p>CADENCE FULFILLMENT: {run.cadenceFulfillmentByDate[selectedDate]}</p>
                  )}
                  {secondReel && <p>SECOND REEL: {secondReel.eligibility} — {secondReel.reason}</p>}
                  {dayEvents.map((event, i) => (
                    <div key={event.id} style={{ marginBottom: '16px', borderTop: '1px solid #ccc', paddingTop: '8px' }}>
                      <strong>EVENT {String.fromCharCode(65 + i)}</strong> — {event.primarySubject}
                      <ul>
                        {dayExpressions
                          .filter((ex) => ex.primaryContentEventId === event.id)
                          .map((ex) => (
                            <li key={ex.id}>
                              {ex.platform} {ex.surface}: {ex.hook.slice(0, 60)}… [{ex.status}]
                            </li>
                          ))}
                      </ul>
                    </div>
                  ))}
                </section>
              )}

              {viewMode === 'WEEK' && run?.weeklyBoard && (
                <section className="site00-experiment-g__panel">
                  <h2>WEEK OVERVIEW</h2>
                  <p>
                    {run.primaryEvents.length} PRIMARY EVENTS · {run.platformExpressions.length} PLATFORM EXPRESSIONS ·{' '}
                    {run.dailyMatrices.length} DAILY MATRICES
                  </p>
                  <p>APPROVAL STAGE: {run.weeklyBoard.approvalStage ?? 'NOT STARTED'}</p>
                  <p>STATUS: {run.status}</p>
                  {run.costBreakdown && (
                    <p>
                      WEEKLY ESTIMATE: ${run.costBreakdown.weeklyEstimateUsd.toFixed(0)} (SHARED RESEARCH: $
                      {run.costBreakdown.sharedIntelligenceUsd.toFixed(0)})
                    </p>
                  )}
                </section>
              )}

              {viewMode === 'BY_EVENT' && (
                <section className="site00-experiment-g__panel">
                  <h2>BY PRIMARY EVENT</h2>
                  {run?.primaryEvents.slice(0, 21).map((event) => (
                    <p key={event.id}>
                      {event.date} — {event.primarySubject} ({run.platformExpressions.filter((e) => e.primaryContentEventId === event.id).length} expressions)
                    </p>
                  ))}
                </section>
              )}

              {viewMode === 'BY_PLATFORM' && (
                <section className="site00-experiment-g__panel">
                  <h2>BY PLATFORM</h2>
                  {(['INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'THREADS'] as const).map((platform) => (
                    <p key={platform}>
                      {platform}: {run?.platformExpressions.filter((e) => e.platform === platform).length ?? 0} expressions
                    </p>
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
