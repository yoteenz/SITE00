import { useEffect, useState } from 'react';
import type { BrandPresentationDirectionFormationRun } from '../../../../shared/site00-brand-lore/brandPresentationDirectionTerritory/types';
import {
  computeDirectionFormationProgress,
  DIRECTION_FORMATION_PARENT_COUNT,
  DIRECTION_FORMATION_TOTAL_DIRECTIONS,
  type DirectionFormationProgress,
} from './experimentGDirectionFormationProgress';

type DirectionFormationStatusPanelProps = {
  run: BrandPresentationDirectionFormationRun | null | undefined;
  forming: boolean;
  lastRefreshedAt: Date | null;
  onRetry: () => void;
  onRefresh: () => void;
};

function statusTone(status: BrandPresentationDirectionFormationRun['status'] | undefined): string {
  switch (status) {
    case 'FORMING':
      return 'forming';
    case 'FAILED':
      return 'failed';
    case 'EVALUATIONS_COMPLETE':
    case 'DIRECTIONS_FORMED':
    case 'FOUNDER_REVIEW':
      return 'complete';
    default:
      return 'idle';
  }
}

function statusHeadline(
  status: BrandPresentationDirectionFormationRun['status'] | undefined,
  progress: DirectionFormationProgress | null,
): string {
  if (status === 'FORMING') {
    if (progress?.likelyStalled) return 'FORMATION LIKELY STALLED';
    if (progress?.approachingStale) return 'FORMATION TAKING LONGER THAN USUAL';
    return 'FORMING DIRECTIONS ON SERVER';
  }
  if (status === 'FAILED') return 'DIRECTION FORMATION FAILED';
  if (status === 'EVALUATIONS_COMPLETE' || status === 'DIRECTIONS_FORMED' || status === 'FOUNDER_REVIEW') {
    return '9 DIRECTIONS READY FOR REVIEW';
  }
  if (status === 'PARENTS_READY') return 'READY TO FORM DIRECTIONS';
  return 'DIRECTION FORMATION NOT STARTED';
}

export function DirectionFormationStatusPanel({
  run,
  forming,
  lastRefreshedAt,
  onRetry,
  onRefresh,
}: DirectionFormationStatusPanelProps) {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const status = run?.status;
  const tone = statusTone(status);
  const progress =
    status === 'FORMING'
      ? computeDirectionFormationProgress(run?.formationStartedAt ?? run?.startedAt, nowMs)
      : null;

  useEffect(() => {
    if (status !== 'FORMING') return;
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [status]);

  const secondsSinceRefresh = lastRefreshedAt
    ? Math.max(0, Math.floor((nowMs - lastRefreshedAt.getTime()) / 1000))
    : null;

  const showRetry =
    status === 'FAILED' ||
    status === 'FORMING' ||
    (progress?.likelyStalled ?? false);

  const directionCount = run?.directions?.length ?? 0;

  return (
    <section
      className={`site00-experiment-g-dir__status site00-experiment-g-dir__status--${tone}`}
      aria-live="polite"
      aria-busy={status === 'FORMING' || forming}
    >
      <div className="site00-experiment-g-dir__status-header">
        <p className="site00-experiment-g-dir__status-kicker">FORMATION STATUS</p>
        <h3 className="site00-experiment-g-dir__status-title">{statusHeadline(status, progress)}</h3>
        <p className="site00-experiment-g-dir__status-meta">
          Server status: {status?.replace(/_/g, ' ') ?? 'NOT STARTED'}
          {directionCount > 0 ? ` · ${directionCount}/${DIRECTION_FORMATION_TOTAL_DIRECTIONS} directions saved` : ''}
        </p>
      </div>

      {status === 'FORMING' && progress ? (
        <div className="site00-experiment-g-dir__progress-block">
          <div
            className="site00-experiment-g-dir__progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress.progressPercent}
            aria-label="Direction formation progress estimate"
          >
            <div
              className={`site00-experiment-g-dir__progress-fill${progress.likelyStalled ? ' site00-experiment-g-dir__progress-fill--stalled' : ''}`}
              style={{ width: `${progress.progressPercent}%` }}
            />
          </div>
          <ul className="site00-experiment-g-dir__progress-stats">
            <li>
              <span>ELAPSED</span>
              <strong>{progress.elapsedLabel}</strong>
            </li>
            <li>
              <span>EST. PARENT</span>
              <strong>
                {progress.estimatedParentIndex} / {DIRECTION_FORMATION_PARENT_COUNT}
              </strong>
            </li>
            <li>
              <span>LAST CHECK</span>
              <strong>{secondsSinceRefresh != null ? `${secondsSinceRefresh}s ago` : '—'}</strong>
            </li>
          </ul>
          <p className="site00-experiment-g-dir__progress-copy">
            {progress.likelyStalled
              ? 'No server update for 15+ minutes — formation probably interrupted (often after API redeploy). Tap RETRY below.'
              : progress.approachingStale
                ? 'Still running but slower than usual (2–5 min typical). Status polls every 5 seconds.'
                : 'Anthropic is forming 3 directions per parent concept (9 total). Directions appear all at once when complete.'}
          </p>
        </div>
      ) : null}

      {status === 'FAILED' && run?.error ? (
        <p className="site00-experiment-g-dir__status-error" role="alert">
          {run.error}
        </p>
      ) : null}

      <div className="site00-experiment-g-dir__status-actions">
        {showRetry ? (
          <button
            type="button"
            className="site00-btn site00-btn--primary"
            disabled={forming}
            onClick={onRetry}
          >
            {forming
              ? 'RETRYING…'
              : status === 'FAILED'
                ? 'RETRY DIRECTION FORMATION'
                : 'RETRY STALLED FORMATION'}
          </button>
        ) : null}
        <button type="button" className="site00-btn" disabled={forming} onClick={onRefresh}>
          REFRESH STATUS NOW
        </button>
      </div>
    </section>
  );
}
