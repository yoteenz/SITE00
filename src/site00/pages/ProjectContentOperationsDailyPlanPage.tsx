import { hasProjectCapability } from '../../../shared/site00-projects/capabilities.js';
import { useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { NdxFounderWorkspacePage, FounderWorkspacePanel } from '../components/founderWorkspace';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import type { DailyPublishingCadenceRun } from '../../../shared/site00-studio-world-production/dailyPublishingCadence/types';
import { formatSecondReelSlotLabel } from '../../../shared/site00-studio-world-production/dailyPublishingCadence/reelSlotPresentation.js';
import {
  NDX_DAILY_BASELINE_PUBLISHING_UNITS,
  NDX_DAILY_MAX_NORMAL_PUBLISHING_UNITS,
  NDX_WEEKLY_BASELINE_PUBLISHING_UNITS,
  NDX_WEEKLY_MAX_NORMAL_PUBLISHING_UNITS,
} from '../../../shared/site00-brand-lore/dailyPublishingCadence/constants.js';

type ViewMode = 'DAILY' | 'WEEK' | 'BY_EVENT' | 'BY_PLATFORM';

export default function ProjectContentOperationsDailyPlanPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<DailyPublishingCadenceRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('WEEK');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const reload = useCallback(async () => {
    if (!hasProjectCapability(projectSlug, 'CONTENT_OPERATIONS')) return;
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

  if (!hasProjectCapability(projectSlug, 'CONTENT_OPERATIONS')) {
    return (
      <NdxFounderWorkspacePage
        projectSlug={projectSlug}
        title="DAILY PLAN"
        nonNdxFallback={<p>Daily publishing cadence is NDXBOOK-only for this proof.</p>}
        operate={null}
      />
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
  const reelSlots = formatSecondReelSlotLabel(secondReel);
  const fulfillmentEval = run?.cadenceFulfillmentEvaluationsByDate?.[selectedDate];

  return (
    <NdxFounderWorkspacePage
      projectSlug={projectSlug}
      title="DAILY PUBLISHING CADENCE"
      subtitle="P0.5E.1 — DAILY PUBLISHING CADENCE · CROSS-PLATFORM CONTENT DERIVATION"
      loading={loading}
      loadingLabel="LOADING DAILY PUBLISHING CADENCE…"
      operate={
        <>
          <FounderWorkspacePanel title="NDX CADENCE">
            <p>
              {feedTarget} FEED / DAY · {storyTarget} STORY UNITS / DAY · {reelTarget} REEL TARGET / DAY · MAX {reelMax} REELS
            </p>
            <p>
              BASELINE: {NDX_DAILY_BASELINE_PUBLISHING_UNITS}/DAY · {NDX_WEEKLY_BASELINE_PUBLISHING_UNITS}/WEEK (21 FEED + 28 STORIES + 7 REELS)
            </p>
            <p>
              MAX NORMAL: {NDX_DAILY_MAX_NORMAL_PUBLISHING_UNITS}/DAY · {NDX_WEEKLY_MAX_NORMAL_PUBLISHING_UNITS}/WEEK — optional second Reel capacity, not baseline
            </p>
            <p>CADENCE IS AN OPERATING RHYTHM, NOT A CONTENT QUOTA.</p>
            <p>~3 PRIMARY CONTENT EVENTS / DAY → MULTIPLE PLATFORM-NATIVE EXPRESSIONS (planning capacity ~21/week)</p>
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
          </FounderWorkspacePanel>

          <FounderWorkspacePanel title="VIEW">
            {(['WEEK', 'DAILY', 'BY_EVENT', 'BY_PLATFORM'] as ViewMode[]).map((mode) => (
              <button key={mode} type="button" className={viewMode === mode ? 'site00-btn site00-btn--primary' : 'site00-btn'} onClick={() => setViewMode(mode)}>
                {mode.replace('_', ' ')}
              </button>
            ))}
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ marginLeft: '8px' }} />
          </FounderWorkspacePanel>

          {viewMode === 'DAILY' && (
            <FounderWorkspacePanel title={`DAILY PLAN — ${selectedDate}`}>
              {(fulfillmentEval || run?.cadenceFulfillmentByDate[selectedDate]) && (
                <p>
                  CADENCE FULFILLMENT: {fulfillmentEval?.state ?? run?.cadenceFulfillmentByDate[selectedDate]}
                  {fulfillmentEval?.healthy ? ' (HEALTHY)' : ''}
                </p>
              )}
              <p>{reelSlots.reel01}</p>
              <p>{reelSlots.reel02}</p>
              {secondReel && secondReel.eligibility !== 'NOT_JUSTIFIED' && (
                <p>SECOND REEL: {secondReel.eligibility} — {secondReel.reason}</p>
              )}
              {dayEvents.map((event, i) => (
                <div key={event.id} style={{ marginBottom: '16px', borderTop: '1px solid var(--ndx-border)', paddingTop: '8px' }}>
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
            </FounderWorkspacePanel>
          )}

          {viewMode === 'WEEK' && run?.weeklyBoard && (
            <FounderWorkspacePanel title="WEEK OVERVIEW">
              <p>
                {run.primaryEvents.length} PRIMARY EVENTS · {run.platformExpressions.length} PLATFORM EXPRESSIONS ·{' '}
                {run.dailyMatrices.length} DAILY MATRICES
              </p>
              <p>APPROVAL STAGE: {run.weeklyBoard.approvalStage ?? 'NOT STARTED'}</p>
              <p>STATUS: {run.status}</p>
              {run.costBreakdown && (
                <p>
                  BASELINE ESTIMATE: ${run.costBreakdown.baselineWeeklyEstimateUsd.toFixed(0)} · MAX NORMAL CAPACITY: $
                  {run.costBreakdown.maxNormalWeeklyEstimateUsd.toFixed(0)} · ACTUAL PLANNED: $
                  {run.costBreakdown.actualPlannedWeeklyEstimateUsd.toFixed(0)} ({run.costBreakdown.baselineReelsPerWeek} baseline Reels/week)
                </p>
              )}
            </FounderWorkspacePanel>
          )}

          {viewMode === 'BY_EVENT' && (
            <FounderWorkspacePanel title="BY PRIMARY EVENT">
              {run?.primaryEvents.slice(0, 21).map((event) => (
                <p key={event.id}>
                  {event.date} — {event.primarySubject} ({run.platformExpressions.filter((e) => e.primaryContentEventId === event.id).length} expressions)
                </p>
              ))}
            </FounderWorkspacePanel>
          )}

          {viewMode === 'BY_PLATFORM' && (
            <FounderWorkspacePanel title="BY PLATFORM">
              {(['INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'THREADS'] as const).map((platform) => (
                <p key={platform}>
                  {platform}: {run?.platformExpressions.filter((e) => e.platform === platform).length ?? 0} expressions
                </p>
              ))}
            </FounderWorkspacePanel>
          )}
        </>
      }
    />
  );
}
