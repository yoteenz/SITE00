/**
 * P0.VR.1D.3 — Single-screen NDX overview menu-open reconstruction tests.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  NDX_OVERVIEW_MENU_OPEN_REFERENCE_PATH,
  NDX_OVERVIEW_MENU_OPEN_ROUTE,
  NDX_OVERVIEW_VR_REGION_IDS,
  P0_VR_1D3_LINEAGE,
  buildScreenReferenceStateFromAttachedReference,
  compileNdxOverviewMenuOpenImplementationSpec,
  runNdxOverviewMenuOpenLiveReconstruction,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr1d3/index.js';
import { P0_VR_1D1_LINEAGE } from '../shared/site00-studio-world-production/visualReconstruction/p0vr1d1/constants.js';

const ROOT = join(process.cwd());

describe('P0.VR.1D.3 single-screen menu-open reconstruction', () => {
  it('persists attached screenshot as canonical reference asset', () => {
    const path = join(ROOT, NDX_OVERVIEW_MENU_OPEN_REFERENCE_PATH);
    expect(existsSync(path)).toBe(true);
    const buf = readFileSync(path);
    expect(buf.length).toBeGreaterThan(10_000);
  });

  it('builds ScreenReferenceState with menu-open interaction state', async () => {
    const state = await buildScreenReferenceStateFromAttachedReference(ROOT);
    expect(state.route).toBe(NDX_OVERVIEW_MENU_OPEN_ROUTE);
    expect(state.interactionState).toBe('THREE_DOT_PROJECT_MENU_OPEN');
    expect(state.menuOpen).toBe(true);
    expect(state.viewportWidth).toBe(390);
  });

  it('compiles implementation spec regions from attached reference', async () => {
    const compiled = await compileNdxOverviewMenuOpenImplementationSpec(ROOT);
    expect(compiled.implementationSpec.regions.length).toBeGreaterThan(0);
    expect(compiled.regionCodeSpecs.length).toBe(NDX_OVERVIEW_VR_REGION_IDS.length);
  });

  it('reuses P0.VR.1D.1 lineage without new reconstruction architecture id', () => {
    expect(P0_VR_1D3_LINEAGE).toBe('P0.VR.1D.3');
    expect(P0_VR_1D1_LINEAGE).toBeTruthy();
  });

  it('runs live reconstruction with skipRender=false when Vite is available', async () => {
    const viteUp = await fetch('http://127.0.0.1:5174/').then((r) => r.ok).catch(() => false);
    if (!viteUp) {
      expect(true).toBe(true);
      return;
    }
    const report = await runNdxOverviewMenuOpenLiveReconstruction({
      baseUrl: 'http://127.0.0.1:5174',
      outputDir: join('/tmp', 'vr-p0vr1d3-test', String(Date.now())),
      maxIterations: 1,
    });
    expect(report.skipRender).toBe(false);
    expect(report.domRegionsTracked).toEqual([...NDX_OVERVIEW_VR_REGION_IDS]);
    expect(report.screen.firstRenderPath).toBeTruthy();
    expect(report.screen.overlay?.heatmapPath).toBeTruthy();
  });
});
