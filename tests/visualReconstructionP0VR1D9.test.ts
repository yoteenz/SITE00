/**
 * P0.VR.1D.9 — Mobile page shell reconstruction tests.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildCampaignFullScreenImplementationSpec,
  buildLabFullScreenImplementationSpec,
  CAMPAIGN_MOBILE_VISUAL_SHELL_SPEC,
  CAMPAIGN_VISUAL_SHELL_AUTHORITY,
  FAIL_CHILD_LOCKED_BEFORE_PARENT_GEOMETRY,
  FAIL_GIANT_CONTAINER_NOT_IN_REFERENCE,
  FUNCTIONAL_SHELL_AUTHORITY,
  LAB_MOBILE_VISUAL_SHELL_SPEC,
  LAB_VISUAL_SHELL_AUTHORITY,
  NDX_CAMPAIGN_SHELL_VR_REGION_IDS,
  NDX_LAB_SHELL_VR_REGION_IDS,
  PARENT_GEOMETRY_FIRST,
  PARENT_SHELL_REGION_ORDER,
  P0_VR_1D9_LINEAGE,
  evaluateVisualShellMatch,
  filterChildLocksUntilParentGeometryPasses,
  functionalAndVisualShellAuthoritySeparated,
  markStaleLocksAfterShellReconstruction,
  mobileVisualShellSpecToCssVars,
  parentGeometryFirstViolation,
  resolveMobileVisualShellSpec,
  shellGeometryPassesBeforeChildLocks,
  staleLockDoesNotBlockRebuild,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr1d9/index.js';
import { createInitialImplementationRegionLocks } from '../shared/site00-studio-world-production/visualReconstruction/p0vr1d1/implementationRegionLock.js';
import { NDX_VR_REGION } from '../src/site00/config/ndxVisualRegionIds.js';
import { NDX_CAMPAIGN_BOARD_REFERENCE_PATH } from '../shared/site00-studio-world-production/visualReconstruction/p0vr1d6/constants.js';
import { NDX_EXPERIMENT_01_REFERENCE_PATH } from '../shared/site00-studio-world-production/visualReconstruction/p0vr1d8/constants.js';

const ROOT = process.cwd();

describe('P0.VR.1D.9 mobile shell reconstruction', () => {
  it('separates functional and visual shell authority', () => {
    expect(functionalAndVisualShellAuthoritySeparated()).toBe(true);
    expect(FUNCTIONAL_SHELL_AUTHORITY.preservesRouting).toBe(true);
    expect(CAMPAIGN_VISUAL_SHELL_AUTHORITY.source).toBe('FULL_SCREEN_REFERENCE');
    expect(LAB_VISUAL_SHELL_AUTHORITY.source).toBe('FULL_SCREEN_REFERENCE');
  });

  it('resolves reference-driven visual shell variants without mutating routes', () => {
    const campaign = resolveMobileVisualShellSpec('campaign-board');
    const lab = resolveMobileVisualShellSpec('experiment-01');
    expect(campaign?.screenId).toBe('MOBILE_CAMPAIGN_BOARD');
    expect(lab?.screenId).toBe('MOBILE_LAB_EXPERIMENT_01');
    expect(campaign?.contentPaddingX).toBe(20);
    expect(lab?.contentPaddingX).toBe(20);
  });

  it('Campaign full-screen spec includes shell regions', () => {
    const spec = buildCampaignFullScreenImplementationSpec();
    const ids = spec.regions.map((r) => r.regionId);
    for (const regionId of NDX_CAMPAIGN_SHELL_VR_REGION_IDS) {
      expect(ids).toContain(regionId);
    }
  });

  it('Lab full-screen spec includes shell regions', () => {
    const spec = buildLabFullScreenImplementationSpec();
    const ids = spec.regions.map((r) => r.regionId);
    for (const regionId of NDX_LAB_SHELL_VR_REGION_IDS) {
      expect(ids).toContain(regionId);
    }
  });

  it('MobileFounderWorkspaceChrome accepts visualSpec prop and shell VR regions', () => {
    const chrome = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceChrome.tsx'),
      'utf8',
    );
    expect(chrome).toContain('visualSpec');
    expect(chrome).toContain('mobileVisualShellSpecToCssVars');
    expect(chrome).toContain('campaignHeaderShell');
    expect(chrome).toContain('labBottomNavShell');
    expect(chrome).toContain('campaignScreen');
  });

  it('tracks header, content bounds, and bottom-nav shell in DOM', () => {
    const screens = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceScreens.tsx'),
      'utf8',
    );
    expect(screens).toContain('NDX_VR_REGION.campaignContentShell');
    expect(screens).toContain('NDX_VR_REGION.labContentShell');
    expect(screens).toContain('setActiveDayId');
    expect(screens).toContain('setSelectedCardId');

    const css = readFileSync(join(ROOT, 'src/site00/styles/site00-founder-workspace.css'), 'utf8');
    expect(css).toContain('site00-fws-mobile-chrome--visual-spec');
    expect(css).toContain('site00-fws-mobile-content-shell');
    expect(css).not.toMatch(/site00-fws-mobile-campaign\s*\{[^}]*border-radius:\s*1[2-9]/s);
  });

  it('removes incorrect giant master container patterns for Campaign/Lab', () => {
    const screens = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceScreens.tsx'),
      'utf8',
    );
    expect(screens).toContain('site00-fws-mobile-content-shell');
    expect(screens).not.toContain('<MobileScreenFrame eyebrow="CAMPAIGN BOARD"');
    expect(screens).toContain('site00-fws-mobile-lab');
    const css = readFileSync(join(ROOT, 'src/site00/styles/site00-founder-workspace.css'), 'utf8');
    expect(css).toContain('.site00-fws-mobile-content-shell');
    expect(css).toContain('box-shadow: none');
  });

  it('invalidates stale locks non-destructively after shell reconstruction', () => {
    const locks = createInitialImplementationRegionLocks(['ndx.campaign.pages.card.1']).map((l) => ({
      ...l,
      state: 'MATCHED' as const,
      lockedAt: new Date().toISOString(),
    }));
    const { staleExtensions, refreshedLocks } = markStaleLocksAfterShellReconstruction(locks, P0_VR_1D9_LINEAGE);
    expect(staleExtensions[0]?.state).toBe('STALE_AFTER_SHELL_RECONSTRUCTION');
    expect(refreshedLocks[0]?.state).toBe('UNMEASURED');
    expect(staleLockDoesNotBlockRebuild(staleExtensions)).toBe(true);
  });

  it('implements PARENT_GEOMETRY_FIRST before child locks', () => {
    expect(PARENT_GEOMETRY_FIRST).toBe(true);
    expect(PARENT_SHELL_REGION_ORDER).toContain('ndx.campaign.content-shell');

    const failingEval = evaluateVisualShellMatch({
      spec: CAMPAIGN_MOBILE_VISUAL_SHELL_SPEC,
      domMeasurement: null,
    });
    expect(shellGeometryPassesBeforeChildLocks(failingEval)).toBe(false);

    const locks = createInitialImplementationRegionLocks(['ndx.campaign.pages.card.1']).map((l) => ({
      ...l,
      state: 'LOCKED' as const,
      lockedAt: new Date().toISOString(),
    }));
    const { blockedRegionIds } = filterChildLocksUntilParentGeometryPasses({
      locks,
      shellEvaluation: failingEval,
    });
    expect(blockedRegionIds.length).toBeGreaterThan(0);
    expect(parentGeometryFirstViolation(blockedRegionIds)).toBe(FAIL_CHILD_LOCKED_BEFORE_PARENT_GEOMETRY);
  });

  it('preserves Campaign/Lab functionality wiring', () => {
    const shell = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/FounderWorkspaceShell.tsx'), 'utf8');
    expect(shell).toContain('resolveMobileVisualShellSpec');
    expect(shell).toContain('ActiveProjectNotificationCenter');
    expect(shell).toContain('FounderWorkspaceProjectMenu');
    expect(shell).toContain("'campaign-board'");
    expect(shell).toContain("'experiment-01'");
  });

  it('compiles CSS variables from MobileScreenVisualShellSpec', () => {
    const vars = mobileVisualShellSpecToCssVars(CAMPAIGN_MOBILE_VISUAL_SHELL_SPEC);
    expect(vars['--ndx-mobile-shell-content-px']).toBe('20px');
    expect(vars['--ndx-mobile-shell-header-h']).toBe('52px');
    expect(vars['--ndx-mobile-shell-nav-h']).toBe('56px');
  });

  it('persists reference screenshots for shell QA', () => {
    expect(existsSync(join(ROOT, NDX_CAMPAIGN_BOARD_REFERENCE_PATH))).toBe(true);
    expect(existsSync(join(ROOT, NDX_EXPERIMENT_01_REFERENCE_PATH))).toBe(true);
  });

  it('registers shell VR region IDs in ndxVisualRegionIds', () => {
    expect(NDX_VR_REGION.campaignScreen).toBe('ndx.campaign.screen');
    expect(NDX_VR_REGION.campaignHeaderShell).toBe('ndx.campaign.header-shell');
    expect(NDX_VR_REGION.campaignContentShell).toBe('ndx.campaign.content-shell');
    expect(NDX_VR_REGION.campaignBottomNavShell).toBe('ndx.campaign.bottom-nav-shell');
    expect(NDX_VR_REGION.labScreen).toBe('ndx.lab.screen');
    expect(NDX_VR_REGION.labContentShell).toBe('ndx.lab.content-shell');
  });

  it('evaluates VisualShellMatchEvaluation metrics', () => {
    const evaluation = evaluateVisualShellMatch({
      spec: LAB_MOBILE_VISUAL_SHELL_SPEC,
      domMeasurement: {
        mapId: 'test',
        route: '/test',
        renderAssetId: 'test',
        capturedAt: new Date().toISOString(),
        measurements: [
          {
            regionId: 'ndx.lab.screen',
            actualX: 0,
            actualY: 0,
            actualWidth: 390,
            actualHeight: 844,
            computedPadding: '0',
            computedMargin: '0',
            computedGap: '0',
            computedFontSize: '12px',
            computedLineHeight: '1.2',
            computedPosition: 'relative',
            computedDisplay: 'flex',
            computedGrid: null,
            computedFlex: null,
            computedZIndex: '1',
          },
          {
            regionId: 'ndx.lab.header-shell',
            actualX: 0,
            actualY: 0,
            actualWidth: 390,
            actualHeight: 52,
            computedPadding: '12px 20px',
            computedMargin: '0',
            computedGap: '0',
            computedFontSize: '12px',
            computedLineHeight: '1.2',
            computedPosition: 'sticky',
            computedDisplay: 'flex',
            computedGrid: null,
            computedFlex: null,
            computedZIndex: '20',
          },
          {
            regionId: 'ndx.lab.content-shell',
            actualX: 20,
            actualY: 53,
            actualWidth: 350,
            actualHeight: 735,
            computedPadding: '12px 20px',
            computedMargin: '0',
            computedGap: '0',
            computedFontSize: '12px',
            computedLineHeight: '1.2',
            computedPosition: 'relative',
            computedDisplay: 'block',
            computedGrid: null,
            computedFlex: null,
            computedZIndex: '1',
          },
          {
            regionId: 'ndx.lab.bottom-nav-shell',
            actualX: 0,
            actualY: 788,
            actualWidth: 390,
            actualHeight: 56,
            computedPadding: '0',
            computedMargin: '0',
            computedGap: '0',
            computedFontSize: '8px',
            computedLineHeight: '1.2',
            computedPosition: 'fixed',
            computedDisplay: 'grid',
            computedGrid: null,
            computedFlex: null,
            computedZIndex: '120',
          },
        ],
      },
    });
    expect(evaluation.metrics.VIEWPORT_MATCH).toBe(true);
    expect(evaluation.metrics.CONTENT_X_MATCH).toBe(true);
    expect(evaluation.score).toBeGreaterThan(0.8);
  });
});
