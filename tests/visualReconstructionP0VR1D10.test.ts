/**
 * P0.VR.1D.10 — Mobile full-screen shell rollout tests.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  NDX_FUNCTIONAL_SHELL_AUTHORITY,
  NDX_VISUAL_SHELL_AUTHORITY,
  STALE_AFTER_VISUAL_SHELL_REBUILD,
  markStaleShellLocks,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr1d9/index.js';
import {
  P0_VR_1D10_LINEAGE,
  P0_VR_1D10_REFERENCE_PATHS,
  P0_VR_1D10_TARGET_SCREENS,
  runMobileShellRolloutPass,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr1d10/index.js';
import {
  resolveMobileVisualShellSpec,
  NDX_MOBILE_OVERVIEW_VISUAL_SPEC,
} from '../src/site00/config/ndxMobileVisualShellSpecs.js';
import { NDX_VR_REGION } from '../src/site00/config/ndxVisualRegionIds.js';

const ROOT = process.cwd();

describe('P0.VR.1D.9 methodology', () => {
  it('separates functional and visual shell authority', () => {
    expect(NDX_FUNCTIONAL_SHELL_AUTHORITY.preserves).toContain('route');
    expect(NDX_VISUAL_SHELL_AUTHORITY.scope).toBe('FULL_SCREEN_REFERENCE');
    expect(NDX_VISUAL_SHELL_AUTHORITY.controls).toContain('content bounds');
  });

  it('marks stale matched locks non-destructively', () => {
    const marked = markStaleShellLocks([{ regionId: 'ndx.overview.hero', status: 'MATCHED' }]);
    expect(marked[0]?.status).toBe(STALE_AFTER_VISUAL_SHELL_REBUILD);
    expect(marked[0]?.priorStatus).toBe('MATCHED');
  });
});

describe('P0.VR.1D.10 mobile shell rollout', () => {
  it('persists fullscreen references for all targets', () => {
    for (const screen of P0_VR_1D10_TARGET_SCREENS) {
      expect(existsSync(join(ROOT, P0_VR_1D10_REFERENCE_PATHS[screen])), screen).toBe(true);
    }
  });

  it('routes all four targets through dedicated mobile layouts', () => {
    const shell = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/FounderWorkspaceShell.tsx'), 'utf8');
    for (const id of ['overview', 'content-ops', 'cultural-intelligence', 'character-lab']) {
      expect(shell).toContain(`'${id}'`);
    }
  });

  it('uses visual shell specs and flat shell screens', () => {
    expect(resolveMobileVisualShellSpec('overview')).toEqual(NDX_MOBILE_OVERVIEW_VISUAL_SPEC);
    const screens = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceScreens.tsx'), 'utf8');
    expect(screens).toContain('site00-fws-mobile-shell-screen--content-ops');
    expect(screens).toContain('site00-fws-mobile-shell-screen--cultural-intelligence');
    expect(screens).toContain('site00-fws-mobile-shell-screen--character-lab');
    expect(screens).not.toContain('MobileScreenFrame eyebrow="CONTENT OPS DESK"');
  });

  it('MobileFounderWorkspaceChrome accepts visualSpec', () => {
    const chrome = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceChrome.tsx'), 'utf8');
    expect(chrome).toContain('visualSpec');
    expect(chrome).toContain('site00-fws-mobile-chrome--visual-spec');
  });

  it('registers shell VR regions', () => {
    expect(NDX_VR_REGION.overviewContentShell).toBe('ndx.overview.content-shell');
    expect(NDX_VR_REGION.contentOpsContentShell).toBe('ndx.content-ops.content-shell');
    expect(NDX_VR_REGION.intelligenceSignals).toBe('ndx.intelligence.signals');
    expect(NDX_VR_REGION.characterPerformance).toBe('ndx.character.performance');
  });

  it('preserves campaign and lab regression selectors', () => {
    const screens = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceScreens.tsx'), 'utf8');
    expect(screens).toContain('mobile-campaign-board-v1d13');
    expect(screens).toContain('mobile-lab-experiment-01');
  });

  it('lineage constant', () => {
    expect(P0_VR_1D10_LINEAGE).toBe('P0.VR.1D.10');
  });
});

describe('P0.VR.1D.10 live shell rollout pass', () => {
  it('runs live render + overlay for all targets when Vite is available', async () => {
    let viteUp = false;
    try {
      const res = await fetch('http://127.0.0.1:5174/', { signal: AbortSignal.timeout(3000) });
      viteUp = res.ok;
    } catch {
      viteUp = false;
    }
    if (!viteUp) return;

    const report = await runMobileShellRolloutPass({
      rootDir: ROOT,
      baseUrl: 'http://127.0.0.1:5174',
    });

    expect(report.targets).toHaveLength(4);
    for (const target of report.targets) {
      expect(target.renderPath).toBeTruthy();
      expect(target.visualScore).toBeGreaterThan(0);
    }
    expect(report.regression.every((r) => r.selectorPresent)).toBe(true);
    expect(report.staleLocksMarked).toBeGreaterThan(0);
  }, 240_000);
});
