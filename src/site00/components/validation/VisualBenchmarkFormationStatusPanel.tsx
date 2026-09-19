import { useEffect, useState } from 'react';
import type { BrandPresentationVisualFormulationRun } from '../../../../shared/site00-brand-lore/brandPresentationVisualFormulation/types';
import {
  computeVisualBenchmarkFormationProgress,
  VISUAL_BENCHMARK_FORMATION_TOTAL,
  type VisualBenchmarkFormationProgress,
} from './experimentGVisualBenchmarkFormationProgress';

type VisualBenchmarkFormationStatusPanelProps = {
  run: BrandPresentationVisualFormulationRun | null | undefined;
  forming: boolean;
  lastRefreshedAt: Date | null;
  onRetry: () => void;
  onRefresh: () => void;
};

function statusTone(status: BrandPresentationVisualFormulationRun['status'] | undefined): string {
  switch (status) {
    case 'FORMULATING_BENCHMARKS':
    case 'FORMULATING_EXPRESSIONS':
      return 'forming';
    case 'FAILED':
      return 'failed';
    case 'BENCHMARKS_READY':
    case 'EXPRESSIONS_READY':
    case 'VISUALS_READY':
    case 'FOUNDER_REVIEW':
      return 'complete';
    default:
      return 'idle';
  }
}

function statusHeadline(
  status: BrandPresentationVisualFormulationRun['status'] | undefined,
  progress: VisualBenchmarkFormationProgress | null,
  benchmarkCount: number,
): string {
  if (status === 'FORMULATING_BENCHMARKS' || status === 'FORMULATING_EXPRESSIONS') {
    if (progress?.likelyStalled) return 'BENCHMARK FORMULATION LIKELY STALLED';
    if (progress?.approachingStale) return 'BENCHMARK FORMULATION TAKING LONGER THAN USUAL';
    return 'FORMULATING SIX DIRECTION VISUALS ON SERVER';
  }
  if (status === 'FAILED') return 'BENCHMARK FORMULATION FAILED';
  if (status === 'BENCHMARKS_READY' || benchmarkCount >= VISUAL_BENCHMARK_FORMATION_TOTAL) {
    return '6 BENCHMARK CONTRACTS READY';
  }
  return 'BENCHMARK FORMULATION NOT STARTED';
}

export function VisualBenchmarkFormationStatusPanel({
  run,
  forming,
  lastRefreshedAt,
  onRetry,
  onRefresh,
}: VisualBenchmarkFormationStatusPanelProps) {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const status = run?.status;
  const tone = statusTone(status);
  const benchmarkCount = (run?.directionBenchmarks ?? []).filter((b) => b.revisionNumber === 0).length;
  const isFormulating = status === 'FORMULATING_BENCHMARKS' || status === 'FORMULATING_EXPRESSIONS';
  const progress = isFormulating
    ? computeVisualBenchmarkFormationProgress(run?.formationStartedAt ?? run?.startedAt, benchmarkCount, nowMs)
    : null;

  useEffect(() => {
    if (!isFormulating) return;
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [isFormulating]);

  const secondsSinceRefresh = lastRefreshedAt
    ? Math.max(0, Math.floor((nowMs - lastRefreshedAt.getTime()) / 1000))
    : null;

  const showRetry = status === 'FAILED' || isFormulating || (progress?.likelyStalled ?? false);

  if (!isFormulating && status !== 'FAILED') {
    return null;
  }

  return (
    <section
      className={`site00-experiment-g-dir__status site00-experiment-g-dir__status--${tone}`}
      aria-live="polite"
      aria-busy={isFormulating || forming}
    >
      <div className="site00-experiment-g-dir__status-header">
        <p className="site00-experiment-g-dir__status-kicker">VISUAL FORMULATION STATUS</p>
        <h3 className="site00-experiment-g-dir__status-title">{statusHeadline(status, progress, benchmarkCount)}</h3>
        <p className="site00-experiment-g-dir__status-meta">
          Server status: {status?.replace(/_/g, ' ') ?? 'NOT STARTED'}
          {benchmarkCount > 0
            ? ` · ${benchmarkCount}/${VISUAL_BENCHMARK_FORMATION_TOTAL} benchmark contracts saved`
            : ''}
        </p>
      </div>

      {isFormulating && progress ? (
        <div className="site00-experiment-g-dir__progress-block">
          <div
            className="site00-experiment-g-dir__progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress.progressPercent}
            aria-label="Visual benchmark formulation progress"
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
              <span>EST. BENCHMARK</span>
              <strong>
                {progress.estimatedBenchmarkIndex} / {VISUAL_BENCHMARK_FORMATION_TOTAL}
              </strong>
            </li>
            <li>
              <span>LAST CHECK</span>
              <strong>{secondsSinceRefresh != null ? `${secondsSinceRefresh}s ago` : '—'}</strong>
            </li>
          </ul>
          <p className="site00-experiment-g-dir__progress-copy">
            {progress.likelyStalled
              ? 'No server update for 15+ minutes — formulation probably interrupted (often after API redeploy). Tap RETRY below.'
              : progress.approachingStale
                ? 'Still running but slower than usual (2–4 min typical). Status polls every 5 seconds — safe to leave this page.'
                : 'Anthropic is building one visual benchmark contract per direction (6 total). Runs in the background on the server.'}
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
          <button type="button" className="site00-btn site00-btn--primary" disabled={forming} onClick={onRetry}>
            {forming
              ? 'RETRYING…'
              : status === 'FAILED'
                ? 'RETRY BENCHMARK FORMULATION'
                : 'RETRY STALLED FORMULATION'}
          </button>
        ) : null}
        <button type="button" className="site00-btn" disabled={forming} onClick={onRefresh}>
          REFRESH STATUS NOW
        </button>
      </div>
    </section>
  );
}
