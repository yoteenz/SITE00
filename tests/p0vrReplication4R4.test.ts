/**
 * P0.VR.REPLICATION.4R4 — Hero outlier-only geometry convergence.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  P0_VR_REPLICATION_4R4_BUILD,
  MAX_OUTLIER_CONVERGENCE_PASSES,
  buildHeroConvergenceBaseline,
  rankHeroOutliers,
  runHeroOutlierConvergence,
  executeHeroOutlierConvergencePipeline,
  passAllowsObject,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4R4/index.js';
import {
  buildHeroAuthorityGeometryFull,
  buildHeroRenderedGeometryFull,
  computeHeroGeometryDeltas,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4R3/measureHeroGeometry.js';
import { buildHeroObjectContracts } from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4R2/buildHeroObjectContracts.js';
import { HERO_RENDERED_LAYOUT } from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4R3/heroLayoutSpec.js';

const read = (rel: string) => readFileSync(join(import.meta.dirname, '..', rel), 'utf8');

function authorityFromContracts() {
  const contracts = buildHeroObjectContracts();
  const map = {} as Record<string, { x: number; y: number; width: number; height: number; lineCount?: number; z: number }>;
  for (const c of contracts) {
    const layout = HERO_RENDERED_LAYOUT[c.objectId];
    map[c.objectId] = {
      x: layout?.x ?? c.authorityBounds.x,
      y: layout?.y ?? c.authorityBounds.y,
      width: layout?.width ?? c.authorityBounds.width,
      height: layout?.height ?? c.authorityBounds.height,
      lineCount: layout?.lineCount,
      z: c.zIndex,
    };
  }
  return buildHeroAuthorityGeometryFull(map as never);
}

describe('P0.VR.REPLICATION.4R4 hero outlier convergence', () => {
  it('build ref and max passes', () => {
    expect(P0_VR_REPLICATION_4R4_BUILD).toBe('v339');
    expect(MAX_OUTLIER_CONVERGENCE_PASSES).toBe(3);
  });

  it('HeroConvergenceBaseline from live deltas', () => {
    const authority = authorityFromContracts();
    const rendered = buildHeroRenderedGeometryFull();
    const deltas = computeHeroGeometryDeltas(authority, rendered);
    const baseline = buildHeroConvergenceBaseline({
      twinId: 't1',
      authorityId: 'auth',
      measurementSource: 'LIVE_BROWSER_DOM',
      authority,
      deltas,
    });
    expect(baseline.objectCount).toBe(14);
    expect(baseline.measurementSource).toBe('LIVE_BROWSER_DOM');
  });

  it('HeroOutlierRanking sorts outliers by severity', () => {
    const authority = authorityFromContracts();
    const rendered = buildHeroRenderedGeometryFull().map((r) =>
      r.objectId === 'H08' ? { ...r, actualX: r.actualX + 10, actualY: r.actualY + 8 } : r,
    );
    const deltas = computeHeroGeometryDeltas(authority, rendered);
    const ranking = rankHeroOutliers(deltas);
    expect(ranking[0]?.objectId).toBe('H08');
  });

  it('only outlier objects patched in convergence pass focus', () => {
    expect(passAllowsObject(1, 'H14')).toBe(true);
    expect(passAllowsObject(1, 'H08')).toBe(false);
    expect(passAllowsObject(2, 'H08')).toBe(true);
    expect(passAllowsObject(3, 'H12')).toBe(true);
    expect(passAllowsObject(2, 'H07')).toBe(false);
  });

  it('runHeroOutlierConvergence reduces simulated H08 error', () => {
    const authority = authorityFromContracts();
    const rendered = buildHeroRenderedGeometryFull().map((r) =>
      r.objectId === 'H08' ? { ...r, actualX: r.actualX + 6, actualY: r.actualY + 4 } : r,
    );
    const report = runHeroOutlierConvergence({
      sessionId: 's',
      twinId: 's',
      authorityId: 'a',
      measurementSource: 'PLAYWRIGHT_DOM',
      authority,
      rendered,
    });
    expect(report.passes.length).toBeGreaterThan(0);
    expect(report.receipt.objectsChanged).toContain('H08');
    expect(report.receipt.finalMaxError).toBeLessThan(report.receipt.baselineMaxError);
  });

  it('early stop when zero outliers at baseline', () => {
    const authority = authorityFromContracts();
    const rendered = buildHeroRenderedGeometryFull();
    const report = runHeroOutlierConvergence({
      sessionId: 's',
      twinId: 's',
      authorityId: 'a',
      measurementSource: 'LIVE_BROWSER_DOM',
      authority,
      rendered,
    });
    expect(report.passes.length).toBe(0);
    expect(report.receipt.status).toBe('GEOMETRY_CONVERGED');
  });

  it('HeroConvergenceReceipt fields present', () => {
    const authority = authorityFromContracts();
    const rendered = buildHeroRenderedGeometryFull().map((r) =>
      r.objectId === 'H09' ? { ...r, actualWidth: r.actualWidth - 6 } : r,
    );
    const report = runHeroOutlierConvergence({
      sessionId: 's',
      twinId: 's',
      authorityId: 'a',
      measurementSource: 'LIVE_BROWSER_DOM',
      authority,
      rendered,
    });
    expect(report.receipt.baselineOutliers).toContain('H09');
    expect(report.receipt.objectsUntouched.length).toBeGreaterThan(0);
  });

  it('pipeline seeds PENDING_LIVE_CONVERGENCE without live DOM', () => {
    const { report } = executeHeroOutlierConvergencePipeline({ session: { sessionId: 's' } as never });
    expect(report.status).toBe('PENDING_LIVE_CONVERGENCE');
    expect(report.buildRef).toBe('v339');
  });

  it('OUTLIERS ONLY toggle in inspection toolbar', () => {
    expect(read('src/site00/components/reconstruction/HeroInspectionToolbar.tsx')).toContain('OUTLIERS ONLY');
    expect(read('src/site00/components/reconstruction/HeroBlueprintDebugOverlay.tsx')).toContain('outliersOnly');
  });

  it('shell replication chains 4R4 pipeline', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrReplication2/executeShellFirstNdxReplication.ts')).toContain(
      'executeHeroOutlierConvergencePipeline',
    );
  });

  it('H06/H12 crop purity preserved in twin', () => {
    const twin = read('src/site00/components/reconstruction/ForensicBlueprintNdxOverviewTwin.tsx');
    expect(twin).toContain('heroSafeRegionCropUrls');
    expect(twin).toContain('HERO_RIGHT_LOWER_MEDIA');
  });

  it('live DOM capture remains measurement source in inspection', () => {
    expect(read('src/site00/components/reconstruction/captureHeroLiveDomGeometry.ts')).toContain('LIVE_BROWSER_DOM');
    expect(read('src/site00/components/reconstruction/useHeroOutlierLiveConvergence.ts')).toContain('LIVE_BROWSER_DOM');
  });
});
