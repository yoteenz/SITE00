import { hasProjectCapability } from '../../../../shared/site00-projects/capabilities.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  REPLAY_EXECUTION_PROGRESS_PHASES,
  replayExecutionPhaseLabel,
  type ReplayExecutionPhase,
} from '../../../../shared/site00-brand-lore/replayExecutionPhases';
import type { SixDirectionConsistencyRun } from '../../../../shared/site00-brand-lore/sixDirectionConsistencyTypes';
import type { ReplayConvergenceReport } from '../../../../shared/site00-brand-lore/personalityReplayTypes';
import { projectPersonalityReplayConsistencyPath } from '../../config/personalityReplayRoutes';
import { site00ProjectsApi } from '../../services/site00ProjectsApi';
import { isPersonalityReplayIntakeSubmitted } from '../../utils/personalityReplaySubmit';
import { PersonalityReplayComparisonPanel } from './PersonalityReplayComparisonPanel';

type ReplaySnapshot = {
  status?: string;
  executionPhase?: ReplayExecutionPhase | null;
  executionError?: string | null;
  executionJobId?: string | null;
  heroAsset?: { storagePath?: string; assetId?: string } | null;
  nativeProofFormat?: string | null;
  comparisonReport?: ReplayConvergenceReport | null;
  sixDirectionConsistency?: SixDirectionConsistencyRun | null;
};

function sixDirectionHeroesButtonLabel(run: SixDirectionConsistencyRun | null | undefined): string {
  if (!run || run.status === 'NOT_STARTED') return 'SIX-DIRECTION CONSISTENCY REVIEW';
  if (run.status === 'COMPLETE') {
    const heroCount = run.directions.filter((d) => d.heroAsset?.storagePath).length;
    return heroCount > 0 ? `VIEW ${heroCount} GENERATED HEROES` : 'VIEW SIX-DIRECTION HEROES';
  }
  if (run.status === 'FAILED') return 'VIEW SIX-DIRECTION VALIDATION';
  return 'VIEW SIX-DIRECTION PROGRESS';
}

const TERMINAL_STATUSES = new Set([
  'COMPARISON_READY',
  'FOUNDER_REVIEW',
  'APPROVED_AS_PIPELINE_VALIDATION',
  'FAILED_VALIDATION',
]);

function phaseIndex(phase: ReplayExecutionPhase | null | undefined): number {
  if (!phase) return -1;
  return REPLAY_EXECUTION_PROGRESS_PHASES.indexOf(
    phase as (typeof REPLAY_EXECUTION_PROGRESS_PHASES)[number],
  );
}

function isExecutionInProgress(replay: ReplaySnapshot): boolean {
  if (replay.executionPhase === 'EXECUTION_FAILED') return false;
  if (replay.executionPhase === 'REPLAY_COMPLETE') return false;
  if (TERMINAL_STATUSES.has(replay.status ?? '')) return false;
  return isPersonalityReplayIntakeSubmitted(replay.status);
}

type PersonalityReplayExecutionProgressProps = {
  projectSlug: string;
  replayId: string | null;
  replay: ReplaySnapshot | null;
  onReplayUpdate?: (replay: ReplaySnapshot) => void;
};

export function PersonalityReplayExecutionProgress({
  projectSlug,
  replayId,
  replay,
  onReplayUpdate,
}: PersonalityReplayExecutionProgressProps) {
  const [resuming, setResuming] = useState(false);
  const [pollError, setPollError] = useState<string | null>(null);

  const activePhase = replay?.executionPhase ?? null;
  const activeIndex = phaseIndex(activePhase);
  const failed = activePhase === 'EXECUTION_FAILED';
  const complete =
    activePhase === 'REPLAY_COMPLETE' ||
    replay?.status === 'COMPARISON_READY' ||
    Boolean(replay?.comparisonReport);

  const poll = useCallback(async () => {
    if (!replayId || !hasProjectCapability(projectSlug, 'PROJECT_CORE')) return;
    try {
      const result = await site00ProjectsApi.personalityReplayGet(projectSlug, replayId);
      const next = result.replay as ReplaySnapshot;
      onReplayUpdate?.(next);
      setPollError(null);
    } catch (err) {
      setPollError(err instanceof Error ? err.message : 'Unable to refresh replay status');
    }
  }, [onReplayUpdate, projectSlug, replayId]);

  useEffect(() => {
    if (!replayId || !replay) return;
    if (!complete && !isExecutionInProgress(replay)) return;
    const id = window.setInterval(() => {
      void poll();
    }, complete ? 12000 : 4000);
    return () => window.clearInterval(id);
  }, [poll, replay, replayId, complete]);

  const resumeExecution = useCallback(async () => {
    if (!replayId) return;
    setResuming(true);
    setPollError(null);
    try {
      await site00ProjectsApi.personalityReplayExecute(projectSlug, replayId);
      await poll();
    } catch (err) {
      setPollError(err instanceof Error ? err.message : 'Resume failed');
    } finally {
      setResuming(false);
    }
  }, [poll, projectSlug, replayId]);

  const showPanel = useMemo(() => {
    if (!replay) return false;
    return isPersonalityReplayIntakeSubmitted(replay.status) || Boolean(replay.executionJobId);
  }, [replay]);

  if (!showPanel) return null;

  return (
    <div className="site00-replay-execution" aria-live="polite">
      <h3 className="site00-replay-execution__title">BLIND REPLAY EXECUTION</h3>
      <ol className="site00-replay-execution__phases">
        {REPLAY_EXECUTION_PROGRESS_PHASES.map((phase, idx) => {
          const done = complete || (activeIndex >= 0 && idx < activeIndex);
          const current = !complete && !failed && activeIndex === idx;
          return (
            <li
              key={phase}
              className={[
                'site00-replay-execution__phase',
                done ? 'site00-replay-execution__phase--done' : '',
                current ? 'site00-replay-execution__phase--current' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {done ? '✓ ' : current ? '→ ' : '· '}
              {replayExecutionPhaseLabel(phase)}
            </li>
          );
        })}
      </ol>
      {replay?.nativeProofFormat ? (
        <p className="site00-replay-execution__meta">NATIVE PROOF FORMAT: {replay.nativeProofFormat}</p>
      ) : null}
      {replay?.heroAsset?.assetId ? (
        <p className="site00-replay-execution__meta">HERO ASSET: {replay.heroAsset.assetId}</p>
      ) : null}
      {failed && replay?.executionError ? (
        <p className="site00-replay-execution__error" role="alert">
          {replay.executionError}
        </p>
      ) : null}
      {pollError ? (
        <p className="site00-replay-execution__error" role="alert">
          {pollError}
        </p>
      ) : null}
      {(failed || (isExecutionInProgress(replay ?? {}) && !complete)) && replayId ? (
        <button
          type="button"
          className="site00-btn site00-btn--primary site00-replay-execution__resume"
          disabled={resuming}
          onClick={() => void resumeExecution()}
        >
          {resuming ? 'RESUMING…' : failed ? 'RETRY EXECUTION' : 'REFRESH STATUS'}
        </button>
      ) : null}
      {complete ? (
        <>
          <p className="site00-replay-execution__complete">REPLAY COMPLETE — METHODOLOGY COMPARISON READY.</p>
          <PersonalityReplayComparisonPanel
            heroAsset={replay?.heroAsset}
            nativeProofFormat={replay?.nativeProofFormat}
            comparisonReport={replay?.comparisonReport}
          />
          {projectSlug === 'ndxbook' ? (
            <Link
              to={projectPersonalityReplayConsistencyPath(projectSlug)}
              className="site00-btn site00-btn--primary site00-replay-execution__six-direction"
            >
              {sixDirectionHeroesButtonLabel(replay?.sixDirectionConsistency)} →
            </Link>
          ) : null}
        </>
      ) : isExecutionInProgress(replay ?? {}) ? (
        <p className="site00-replay-execution__pending">DOWNSTREAM CREATIVE WORK IN PROGRESS…</p>
      ) : null}
    </div>
  );
}
