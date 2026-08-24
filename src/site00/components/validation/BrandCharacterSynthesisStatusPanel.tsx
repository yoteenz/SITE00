import { useEffect, useState } from 'react';
import type { BrandCharacterSynthesisRun } from '../../../../shared/site00-brand-lore/brandCharacterSynthesis/types';
import {
  computeBrandCharacterSynthesisProgress,
  type BrandCharacterSynthesisProgress,
} from './brandCharacterSynthesisProgress';

type BrandCharacterSynthesisStatusPanelProps = {
  run: BrandCharacterSynthesisRun | null | undefined;
  starting: boolean;
  lastRefreshedAt: Date | null;
  onRetry: () => void;
  onRefresh: () => void;
};

function statusTone(status: BrandCharacterSynthesisRun['status'] | undefined): string {
  switch (status) {
    case 'SYNTHESIZING':
      return 'forming';
    case 'FAILED':
      return 'failed';
    case 'SYNTHESIZED':
    case 'SYSTEM_COMPILED':
    case 'PROOFS_FORMULATED':
    case 'PROOFS_GENERATED':
      return 'complete';
    default:
      return 'idle';
  }
}

function statusHeadline(
  status: BrandCharacterSynthesisRun['status'] | undefined,
  progress: BrandCharacterSynthesisProgress | null,
): string {
  if (status === 'SYNTHESIZING') {
    if (progress?.likelyStalled) return 'COMPOSITE SYNTHESIS LIKELY STALLED';
    if (progress?.approachingStale) return 'COMPOSITE SYNTHESIS TAKING LONGER THAN USUAL';
    return 'RUNNING COMPOSITE SYNTHESIS ON SERVER';
  }
  if (status === 'FAILED') return 'COMPOSITE SYNTHESIS FAILED';
  if (status === 'SYNTHESIZED') return 'COMPOSITE CHARACTER SYNTHESIZED';
  return 'COMPOSITE SYNTHESIS NOT STARTED';
}

export function BrandCharacterSynthesisStatusPanel({
  run,
  starting,
  lastRefreshedAt,
  onRetry,
  onRefresh,
}: BrandCharacterSynthesisStatusPanelProps) {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const status = run?.status;
  const tone = statusTone(status);
  const isSynthesizing = status === 'SYNTHESIZING';
  const progress = isSynthesizing
    ? computeBrandCharacterSynthesisProgress(run?.synthesisStartedAt, nowMs)
    : null;

  useEffect(() => {
    if (!isSynthesizing) return;
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [isSynthesizing]);

  const secondsSinceRefresh = lastRefreshedAt
    ? Math.max(0, Math.floor((nowMs - lastRefreshedAt.getTime()) / 1000))
    : null;

  const showRetry = status === 'FAILED' || isSynthesizing || (progress?.likelyStalled ?? false);

  if (!isSynthesizing && status !== 'FAILED') {
    return null;
  }

  return (
    <section
      className={`site00-experiment-g-dir__status site00-experiment-g-dir__status--${tone}`}
      aria-live="polite"
      aria-busy={isSynthesizing || starting}
    >
      <div className="site00-experiment-g-dir__status-header">
        <p className="site00-experiment-g-dir__status-kicker">COMPOSITE SYNTHESIS STATUS</p>
        <h3 className="site00-experiment-g-dir__status-title">{statusHeadline(status, progress)}</h3>
        <p className="site00-experiment-g-dir__status-meta">
          Server status: {status?.replace(/_/g, ' ') ?? 'NOT STARTED'}
          {run?.readinessRefresh
            ? ` · Synthesis gate: ${(run.readinessRefresh.synthesisEligibleState ?? run.readinessRefresh.newState).replace(/_/g, ' ')}`
            : ''}
        </p>
      </div>

      {isSynthesizing && progress ? (
        <div className="site00-experiment-g-dir__progress-block">
          <div
            className="site00-experiment-g-dir__progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress.progressPercent}
            aria-label="Composite character synthesis progress"
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
              <span>EST. COMPLETE</span>
              <strong>1–2 MIN</strong>
            </li>
            <li>
              <span>LAST CHECK</span>
              <strong>{secondsSinceRefresh != null ? `${secondsSinceRefresh}s ago` : '—'}</strong>
            </li>
          </ul>
          <p className="site00-experiment-g-dir__progress-copy">
            {progress.likelyStalled
              ? 'No server update for 15+ minutes — synthesis probably interrupted (often after API redeploy). Tap RETRY below.'
              : progress.approachingStale
                ? 'Still running but slower than usual. Status polls every 5 seconds — safe to leave this page.'
                : 'Anthropic is synthesizing Cultural Accomplice + Committed Contrarian + Relentless Synthesizer into one NDX character. Runs in the background on the server.'}
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
          <button type="button" className="site00-btn site00-btn--primary" disabled={starting} onClick={onRetry}>
            {starting
              ? 'RETRYING…'
              : status === 'FAILED'
                ? 'RETRY COMPOSITE SYNTHESIS'
                : 'RETRY STALLED SYNTHESIS'}
          </button>
        ) : null}
        <button type="button" className="site00-btn" disabled={starting} onClick={onRefresh}>
          REFRESH STATUS NOW
        </button>
      </div>
    </section>
  );
}
