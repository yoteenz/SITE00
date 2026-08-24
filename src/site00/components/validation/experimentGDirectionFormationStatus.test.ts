import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  computeDirectionFormationProgress,
  formatElapsedMs,
} from './experimentGDirectionFormationProgress';

const DIR_REVIEW = readFileSync(
  join(process.cwd(), 'src/site00/components/validation/ExperimentGBrandPresentationDirectionReview.tsx'),
  'utf8',
);
const STATUS_PANEL = readFileSync(
  join(process.cwd(), 'src/site00/components/validation/DirectionFormationStatusPanel.tsx'),
  'utf8',
);

describe('Direction formation status UI', () => {
  it('shows live progress panel and retry while FORMING', () => {
    expect(DIR_REVIEW).toContain('DirectionFormationStatusPanel');
    expect(STATUS_PANEL).toContain('RETRY STALLED FORMATION');
    expect(STATUS_PANEL).toContain('role="progressbar"');
    expect(STATUS_PANEL).toContain('REFRESH STATUS NOW');
  });

  it('computes elapsed and progress from formationStartedAt', () => {
    const start = Date.now() - 90_000;
    const progress = computeDirectionFormationProgress(new Date(start).toISOString(), Date.now());
    expect(progress).not.toBeNull();
    expect(progress!.elapsedLabel).toBe(formatElapsedMs(90_000));
    expect(progress!.progressPercent).toBeGreaterThan(0);
    expect(progress!.estimatedParentIndex).toBeGreaterThanOrEqual(1);
  });

  it('flags likely stalled after 15 minutes', () => {
    const start = Date.now() - 16 * 60 * 1000;
    const progress = computeDirectionFormationProgress(new Date(start).toISOString(), Date.now());
    expect(progress!.likelyStalled).toBe(true);
  });
});
