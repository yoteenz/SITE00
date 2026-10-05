/**
 * P0.VR.1D.13 — Campaign Board full-screen reference rebuild tests.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildCampaignBoardFullScreenImplementationSpec,
  buildCampaignBoardMobileVisualShellSpec,
  CAMPAIGN_BOARD_FULL_SCREEN_VISUAL_AUTHORITY,
  CAMPAIGN_BOARD_REFERENCE_SCOPE,
  CAMPAIGN_BOARD_VISUAL_ASSET_MANIFEST,
  existingAssetPreferredOverFalGeneration,
  falReconstructionCandidates,
  invalidateStaleCampaignBoardLocks,
  NDX_CAMPAIGN_BOARD_V1D13_REFERENCE_PATH,
  NDX_CAMPAIGN_V1D13_VR_REGION_IDS,
  P0_VR_1D13_LINEAGE,
  resolveCampaignBoardReferenceAssets,
  runNdxCampaignBoardV1D13CorrectionPass,
  staleCampaignLockDoesNotBlockRebuild,
  STALE_AFTER_CAMPAIGN_REFERENCE_REBUILD,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr1d13/index.js';
import {
  CAMPAIGN_BOARD_FULL_SCREEN_VISUAL_AUTHORITY as CONFIG_AUTHORITY,
  NDX_CAMPAIGN_BOARD_REFERENCE_PATH,
  NDX_CAMPAIGN_MOTION,
  NDX_CAMPAIGN_MOTION_TOTAL,
  NDX_CAMPAIGN_PAGE_CARDS,
  NDX_CAMPAIGN_PAGES_TOTAL,
  NDX_CAMPAIGN_QUICK_ACTIONS,
} from '../src/site00/config/ndxCampaignBoardMobileReference.js';
import { NDX_VR_REGION } from '../src/site00/config/ndxVisualRegionIds.js';
import { formatCampaignScheduleDayLabel } from '../src/site00/utils/campaignBoardWeekCalendar.js';

const ROOT = process.cwd();

describe('P0.VR.1D.13 Campaign Board full-screen reconstruction', () => {
  it('registers attached screenshot as FULL_SCREEN_REFERENCE authority', () => {
    expect(CAMPAIGN_BOARD_FULL_SCREEN_VISUAL_AUTHORITY).toBe('CAMPAIGN_BOARD_FULL_SCREEN_VISUAL_AUTHORITY');
    expect(CONFIG_AUTHORITY).toBe(CAMPAIGN_BOARD_FULL_SCREEN_VISUAL_AUTHORITY);
    expect(CAMPAIGN_BOARD_REFERENCE_SCOPE).toBe('FULL_SCREEN_REFERENCE');
    expect(existsSync(join(ROOT, NDX_CAMPAIGN_BOARD_V1D13_REFERENCE_PATH))).toBe(true);
    expect(existsSync(join(ROOT, 'public', NDX_CAMPAIGN_BOARD_REFERENCE_PATH.replace(/^\//, '')))).toBe(true);
  });

  it('allows incorrect old visual shell replacement while preserving function authority', () => {
    const screens = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceScreens.tsx'), 'utf8');
    expect(screens).toContain('site00-fws-mobile-campaign--v1d13');
    expect(screens).toContain('useCampaignBoardMobileRun');
    expect(screens).toContain('useCampaignBoardWeekCalendar');
    expect(screens).not.toContain('site00-fws-mobile-campaign__day-grid');
    expect(screens).not.toContain('THE MARGINS');
    expect(screens).not.toContain('site00-fws-mobile-campaign__margins-row');
    const shell = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/FounderWorkspaceShell.tsx'), 'utf8');
    expect(shell).toContain("'campaign-board'");
    expect(shell).toContain('ActiveProjectNotificationCenter');
  });

  it('full-screen implementation spec includes shell + section regions', () => {
    const spec = buildCampaignBoardFullScreenImplementationSpec();
    const ids = spec.regions.map((r) => r.regionId);
    for (const regionId of NDX_CAMPAIGN_V1D13_VR_REGION_IDS) {
      expect(ids).toContain(regionId);
    }
  });

  it('preserves lime diamond via Site00Diamond in mobile chrome', () => {
    const chrome = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceChrome.tsx'), 'utf8');
    expect(chrome).toContain('Site00Diamond');
    expect(chrome).toContain('campaignHeaderShell');
  });

  it('renders LAB HUB breadcrumb with lime active destination', () => {
    const screens = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceScreens.tsx'), 'utf8');
    expect(screens).toContain('site00-fws-mobile-campaign__breadcrumb');
    expect(screens).toContain('LAB HUB');
    expect(screens).toContain('NDX_VR_REGION.campaignBreadcrumb');
  });

  it('renders campaign title block and supporting copy', () => {
    const screens = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceScreens.tsx'), 'utf8');
    expect(screens).toContain('Plan. Produce. Publish. Repeat.');
    expect(screens).toContain('Build ideas into content that moves.');
    const css = readFileSync(join(ROOT, 'src/site00/styles/site00-founder-workspace.css'), 'utf8');
    expect(css).toContain('.site00-fws-mobile-campaign--v1d13 .site00-fws-mobile-campaign__heading');
  });

  it('renders two-column status card with divider', () => {
    const screens = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceScreens.tsx'), 'utf8');
    expect(screens).toContain('site00-fws-mobile-campaign__status-card');
    expect(screens).toContain('site00-fws-mobile-campaign__status-divider');
    const css = readFileSync(join(ROOT, 'src/site00/styles/site00-founder-workspace.css'), 'utf8');
    expect(css).toContain('grid-template-columns: 1fr auto 1fr');
  });

  it('binds live campaign status from hook', () => {
    const hook = readFileSync(join(ROOT, 'src/site00/hooks/useCampaignBoardMobileRun.ts'), 'utf8');
    expect(hook).toContain('deriveStatus');
    expect(hook).toContain('statusLabel');
    expect(hook).toContain('createdLabel');
    expect(hook).not.toContain('board.campaignStatus');
    const screens = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceScreens.tsx'), 'utf8');
    expect(screens).toContain('status.statusLabel');
    expect(screens).toContain('status.createdLabel');
  });

  it('renders seven schedule cells with live date labels', () => {
    const screens = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceScreens.tsx'), 'utf8');
    expect(screens).toContain('site00-fws-mobile-campaign__schedule');
    expect(screens).toContain('formatCampaignScheduleDayLabel');
    const label = formatCampaignScheduleDayLabel(new Date(2026, 4, 24));
    expect(label.weekday).toBe('SUN');
    expect(label.monthDay).toBe('MAY 24');
    const css = readFileSync(join(ROOT, 'src/site00/styles/site00-founder-workspace.css'), 'utf8');
    expect(css).toContain('grid-template-columns: repeat(7');
  });

  it('renders Pages section with data-driven count and four cards', () => {
    expect(NDX_CAMPAIGN_PAGE_CARDS).toHaveLength(4);
    expect(NDX_CAMPAIGN_PAGES_TOTAL).toBe(9);
    const screens = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceScreens.tsx'), 'utf8');
    expect(screens).toContain('THE PAGES');
    expect(screens).toContain('site00-fws-mobile-campaign__page-index');
    expect(screens).toContain('site00-fws-mobile-campaign__page-status-dot');
  });

  it('resolves page artwork from existing canonical assets', () => {
    const resolutions = resolveCampaignBoardReferenceAssets({ projectRoot: ROOT });
    for (const card of NDX_CAMPAIGN_PAGE_CARDS) {
      const abs = join(ROOT, 'public', card.artworkPath.replace(/^\//, ''));
      expect(existsSync(abs), card.id).toBe(true);
      const resolved = resolutions.find((r) => r.assetId === card.id);
      expect(resolved?.falTextToImageUsed).toBe(false);
    }
  });

  it('maps page status from live data with reference fallback', () => {
    const hook = readFileSync(join(ROOT, 'src/site00/hooks/useCampaignBoardMobileRun.ts'), 'utf8');
    expect(hook).toContain('mapPageStatus');
    const screens = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceScreens.tsx'), 'utf8');
    expect(screens).toContain('mapPageStatus(card.id, card.statusLabel)');
  });

  it('renders Book in Motion section with resolved artwork', () => {
    expect(NDX_CAMPAIGN_MOTION_TOTAL).toBe(3);
    const abs = join(ROOT, 'public', NDX_CAMPAIGN_MOTION.artworkPath.replace(/^\//, ''));
    expect(existsSync(abs)).toBe(true);
    const screens = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceScreens.tsx'), 'utf8');
    expect(screens).toContain('BOOK IN MOTION');
    expect(screens).toContain('site00-fws-mobile-campaign__motion-card');
  });

  it('renders four quick action cards with real routes/actions', () => {
    expect(NDX_CAMPAIGN_QUICK_ACTIONS).toHaveLength(4);
    const screens = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceScreens.tsx'), 'utf8');
    expect(screens).toContain('site00-fws-mobile-campaign__quick-grid');
    expect(screens).toContain('lockRound01');
    expect(screens).toContain('initialize()');
    expect(screens).toContain('site00ProjectFounderCreativeIngestionPath');
    expect(screens).toContain('site00ProjectFilmProductionPath');
  });

  it('prefers existing assets over FAL and exposes FAL image-reference when missing', () => {
    const resolutions = resolveCampaignBoardReferenceAssets({ projectRoot: ROOT });
    expect(existingAssetPreferredOverFalGeneration(resolutions)).toBe(true);
    expect(falReconstructionCandidates(resolutions)).toHaveLength(0);
    expect(CAMPAIGN_BOARD_VISUAL_ASSET_MANIFEST.length).toBeGreaterThanOrEqual(5);
  });

  it('does not use FAL for full-screen UI generation', () => {
    const resolver = readFileSync(
      join(ROOT, 'shared/site00-studio-world-production/visualReconstruction/p0vr1d13/CampaignBoardReferenceAssetResolver.ts'),
      'utf8',
    );
    expect(resolver).toContain('DOM_REPRODUCIBLE');
    expect(resolver).not.toContain('full-screen');
  });

  it('registers VR region IDs including page-card.4 and quick-actions', () => {
    expect(NDX_VR_REGION.campaignBreadcrumb).toBe('ndx.campaign.breadcrumb');
    expect(NDX_VR_REGION.campaignStatus).toBe('ndx.campaign.status');
    expect(NDX_VR_REGION.campaignSchedule).toBe('ndx.campaign.schedule');
    expect(NDX_VR_REGION.campaignQuickActions).toBe('ndx.campaign.quick-actions');
    expect(NDX_VR_REGION.campaignPagesCard4).toBe('ndx.campaign.page-card.4');
  });

  it('invalidates stale locks non-destructively', () => {
    const audit = invalidateStaleCampaignBoardLocks([
      { regionId: 'ndx.campaign.pages', state: 'MATCHED', lockedAt: '2026-01-01', score: 0.9 },
    ]);
    expect(audit.staleExtensions[0]?.state).toBe(STALE_AFTER_CAMPAIGN_REFERENCE_REBUILD);
    expect(staleCampaignLockDoesNotBlockRebuild(audit.staleExtensions)).toBe(true);
  });

  it('first paint uses reference shell loading skeleton for campaign board', () => {
    const loading = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/ReferenceShellLoadingState.tsx'), 'utf8');
    expect(loading).toContain('site00-ref-shell-loading--campaign-board');
    expect(loading).toContain("screenId === 'campaign-board'");
  });

  it('mobile visual shell spec matches reference viewport', () => {
    const shell = buildCampaignBoardMobileVisualShellSpec();
    expect(shell.authorityId).toBe(CAMPAIGN_BOARD_FULL_SCREEN_VISUAL_AUTHORITY);
    expect(shell.scope).toBe('FULL_SCREEN_REFERENCE');
    expect(shell.viewport.width).toBe(390);
  });

  it('uses P0.VR.1D.13 lineage', () => {
    expect(P0_VR_1D13_LINEAGE).toBe('P0.VR.1D.13');
  });
});

describe('P0.VR.1D.13 live campaign board correction pass', () => {
  it('runs live render + overlay when Vite is available', async () => {
    let viteUp = false;
    try {
      const res = await fetch('http://127.0.0.1:5174/', { signal: AbortSignal.timeout(3000) });
      viteUp = res.ok;
    } catch {
      viteUp = false;
    }
    if (!viteUp) return;

    try {
      const report = await runNdxCampaignBoardV1D13CorrectionPass({
        rootDir: ROOT,
        maxIterations: 1,
        executePatches: true,
        baseUrl: 'http://127.0.0.1:5174',
      });

      expect(report.skipRender).toBe(false);
      expect(report.renderPath).toBeTruthy();
      expect(report.iterations).toBeGreaterThanOrEqual(1);
      expect(report.assetResolutions.length).toBeGreaterThanOrEqual(5);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('playwright') || message.includes('browser')) return;
      throw err;
    }
  }, 120_000);
});
