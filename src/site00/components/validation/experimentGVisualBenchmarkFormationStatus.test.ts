import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  computeVisualBenchmarkFormationProgress,
  formatElapsedMs,
} from './experimentGVisualBenchmarkFormationProgress';

const FINALIST_REVIEW = readFileSync(
  join(process.cwd(), 'src/site00/components/validation/ExperimentGBrandPresentationFinalistReview.tsx'),
  'utf8',
);
const STATUS_PANEL = readFileSync(
  join(process.cwd(), 'src/site00/components/validation/VisualBenchmarkFormationStatusPanel.tsx'),
  'utf8',
);

describe('Visual benchmark formation status UI', () => {
  it('shows live progress panel and retry while FORMULATING_BENCHMARKS', () => {
    expect(FINALIST_REVIEW).toContain('VisualBenchmarkFormationStatusPanel');
    expect(FINALIST_REVIEW).toContain('STARTING BACKGROUND FORMULATION');
    expect(STATUS_PANEL).toContain('RETRY STALLED FORMULATION');
    expect(STATUS_PANEL).toContain('role="progressbar"');
    expect(STATUS_PANEL).toContain('REFRESH STATUS NOW');
    expect(STATUS_PANEL).toContain('safe to leave this page');
  });

  it('computes elapsed and progress from formationStartedAt', () => {
    const start = Date.now() - 90_000;
    const progress = computeVisualBenchmarkFormationProgress(new Date(start).toISOString(), 2, Date.now());
    expect(progress).not.toBeNull();
    expect(progress!.elapsedLabel).toBe(formatElapsedMs(90_000));
    expect(progress!.progressPercent).toBeGreaterThan(0);
    expect(progress!.estimatedBenchmarkIndex).toBeGreaterThanOrEqual(2);
  });

  it('flags likely stalled after 15 minutes', () => {
    const start = Date.now() - 16 * 60 * 1000;
    const progress = computeVisualBenchmarkFormationProgress(new Date(start).toISOString(), 0, Date.now());
    expect(progress!.likelyStalled).toBe(true);
  });
});
