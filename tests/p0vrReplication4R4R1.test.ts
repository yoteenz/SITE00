/**
 * P0.VR.REPLICATION.4R4R1 — 8-outlier factual hero convergence.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  P0_VR_REPLICATION_4R4R1_BUILD,
  HERO_OUTLIER_SNAPSHOT_4R4R1_BASELINE,
  buildHeroOutlierSnapshot,
  executeHeroOutlierConvergenceR4R1Pipeline,
  buildHeroLockGuard,
  HERO_OUTLIER_PASS1_MAX,
  HERO_OUTLIER_PASS2_MAX,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4R4R1/index.js';
const read = (rel: string) => readFileSync(join(import.meta.dirname, '..', rel), 'utf8');

describe('P0.VR.REPLICATION.4R4R1 eight-outlier convergence', () => {
  it('build ref v340', () => {
    expect(P0_VR_REPLICATION_4R4R1_BUILD).toBe('v340');
  });

  it('baseline snapshot lists exactly 8 initial outliers', () => {
    expect(HERO_OUTLIER_SNAPSHOT_4R4R1_BASELINE.outlierCount).toBe(8);
    expect(HERO_OUTLIER_SNAPSHOT_4R4R1_BASELINE.outliers.map((o) => o.objectId).sort().join(',')).toBe(
      'H01,H02,H03,H04,H05,H08,H11,H12',
    );
    expect(HERO_OUTLIER_SNAPSHOT_4R4R1_BASELINE.measurementSource).toBe('PLAYWRIGHT_DOM');
  });

  it('pass caps 3+3+remainder', () => {
    expect(HERO_OUTLIER_PASS1_MAX).toBe(3);
    expect(HERO_OUTLIER_PASS2_MAX).toBe(3);
  });

  it('HeroLockGuard blocks CSS when LOCKED', () => {
    const guard = buildHeroLockGuard('LOCKED');
    expect(guard.allowsHeroCssMutation).toBe(false);
  });

  it('pipeline applies factual CSS patch and converged receipt', () => {
    const { report, sessionPatch } = executeHeroOutlierConvergenceR4R1Pipeline({ session: { sessionId: 's' } as never });
    expect(report.initialSnapshot.outlierCount).toBe(8);
    expect(report.status).toBe('GEOMETRY_CONVERGED');
    expect(report.heroLockGuard.heroState).toBe('LOCKED');
    expect(sessionPatch.twinForensicCssPatch?.['--hero-h08-font-size']).toBe('46px');
  });

  it('OUTLIERS ONLY delta UI shows width/height', () => {
    expect(read('src/site00/components/reconstruction/HeroBlueprintDebugOverlay.tsx')).toContain('Δw');
    expect(read('src/site00/components/reconstruction/HeroInspectionToolbar.tsx')).toContain('LOCKED');
  });

  it('playwright harness + snapshot script exist', () => {
    expect(read('scripts/playwright-hero-outlier-snapshot.mjs')).toContain('PLAYWRIGHT_DOM');
    expect(read('src/site00/pages/HeroOutlierMeasureHarnessPage.tsx')).toContain('heroMeasureBaselineOnly');
  });

  it('H06/H12 purity preserved in twin markup', () => {
    const twin = read('src/site00/components/reconstruction/ForensicBlueprintNdxOverviewTwin.tsx');
    expect(twin).toContain('HERO_RIGHT_LOWER_MEDIA');
    expect(twin).toContain('heroSafeRegionCropUrls');
  });

  it('shell chains 4R4R1 pipeline', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrReplication2/executeShellFirstNdxReplication.ts')).toContain(
      'executeHeroOutlierConvergenceR4R1Pipeline',
    );
  });

  it('buildHeroOutlierSnapshot from deltas', () => {
    const snap = buildHeroOutlierSnapshot({
      twinId: 't',
      measurementSource: 'LIVE_BROWSER_DOM',
      measuredCount: 14,
      renderedCount: 14,
      deltas: HERO_OUTLIER_SNAPSHOT_4R4R1_BASELINE.outliers.map((o) => ({
        objectId: o.objectId,
        deltaX: o.deltaX,
        deltaY: o.deltaY,
        deltaWidth: o.deltaWidth,
        deltaHeight: o.deltaHeight,
        leftError: o.leftError,
        rightError: o.rightError,
        topError: o.topError,
        bottomError: o.bottomError,
        baselineError: 0,
        lineCountMatch: true,
        centerXError: 0,
        centerYError: 0,
        severity: o.severity,
        status: 'OUT_OF_TOLERANCE' as const,
      })),
    });
    expect(snap.outlierCount).toBe(8);
  });
});
