import { useEffect, useState } from 'react';
import type { BrandCharacterFormationRun } from '../../../../shared/site00-brand-lore/brandCharacterTerritory/types';
import {
  computeCharacterFormationProgress,
  CHARACTER_FORMATION_TOTAL,
  type CharacterFormationProgress,
} from './experimentHCharacterFormationProgress';

type CharacterFormationStatusPanelProps = {
  run: BrandCharacterFormationRun | null | undefined;
  forming: boolean;
  lastRefreshedAt: Date | null;
  onRetry: () => void;
  onRefresh: () => void;
};

function statusHeadline(
  status: BrandCharacterFormationRun['status'] | undefined,
  progress: CharacterFormationProgress | null,
): string {
  if (status === 'FORMING') {
    if (progress?.likelyStalled) return 'CHARACTER FORMATION LIKELY STALLED';
    if (progress?.approachingStale) return 'CHARACTER FORMATION TAKING LONGER THAN USUAL';
    return 'FORMING SIX CHARACTER TERRITORIES ON SERVER';
  }
  if (status === 'FAILED') return 'CHARACTER FORMATION FAILED';
  if (status === 'EVALUATIONS_COMPLETE' || status === 'FOUNDER_REVIEWED') {
    return '6 CHARACTER TERRITORIES READY FOR REVIEW';
  }
  return 'CHARACTER FORMATION NOT STARTED';
}

export function CharacterFormationStatusPanel({
  run,
  forming,
  lastRefreshedAt,
  onRetry,
  onRefresh,
}: CharacterFormationStatusPanelProps) {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const status = run?.status;
  const progress =
    status === 'FORMING'
      ? computeCharacterFormationProgress(run?.formationStartedAt ?? run?.startedAt, nowMs)
      : null;

  useEffect(() => {
    if (status !== 'FORMING') return;
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [status]);

  const secondsSinceRefresh = lastRefreshedAt
    ? Math.max(0, Math.floor((nowMs - lastRefreshedAt.getTime()) / 1000))
    : null;

  if (status !== 'FORMING' && status !== 'FAILED') return null;

  return (
    <section
      className={`site00-experiment-g-dir__status site00-experiment-g-dir__status--${status === 'FAILED' ? 'failed' : 'forming'}`}
      aria-live="polite"
      aria-busy={status === 'FORMING' || forming}
    >
      <div className="site00-experiment-g-dir__status-header">
        <p className="site00-experiment-g-dir__status-kicker">CHARACTER FORMATION STATUS</p>
        <h3 className="site00-experiment-g-dir__status-title">{statusHeadline(status, progress)}</h3>
        <p className="site00-experiment-g-dir__status-meta">
          Server status: {status?.replace(/_/g, ' ') ?? 'NOT STARTED'}
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
          >
            <div className="site00-experiment-g-dir__progress-fill" style={{ width: `${progress.progressPercent}%` }} />
          </div>
          <ul className="site00-experiment-g-dir__progress-stats">
            <li><span>ELAPSED</span><strong>{progress.elapsedLabel}</strong></li>
            <li><span>TARGET</span><strong>{CHARACTER_FORMATION_TOTAL} territories</strong></li>
            <li><span>LAST CHECK</span><strong>{secondsSinceRefresh != null ? `${secondsSinceRefresh}s ago` : '—'}</strong></li>
          </ul>
          <p className="site00-experiment-g-dir__progress-copy">
            Anthropic is forming six topic-blind Brand Character Territories. No visual generation. Safe to leave this page.
          </p>
        </div>
      ) : null}
      {status === 'FAILED' && run?.error ? (
        <p className="site00-experiment-g-dir__status-error" role="alert">{run.error}</p>
      ) : null}
      <div className="site00-experiment-g-dir__status-actions">
        {(status === 'FAILED' || status === 'FORMING') ? (
          <button type="button" className="site00-btn site00-btn--primary" disabled={forming} onClick={onRetry}>
            {forming ? 'RETRYING…' : 'RETRY STALLED FORMATION'}
          </button>
        ) : null}
        <button type="button" className="site00-btn" disabled={forming} onClick={onRefresh}>
          REFRESH STATUS NOW
        </button>
      </div>
    </section>
  );
}
