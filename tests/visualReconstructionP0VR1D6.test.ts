/**
 * P0.VR.1D.6 — Mobile Campaign Board design correction tests (updated for P0.VR.1D.13 shell).
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildCampaignBoardReferenceDetailAudit,
  resolveCampaignBoardArtwork,
  runNdxCampaignBoardCorrectionPass,
  FAIL_CAMPAIGN_LIME_DIAMOND_MISSING,
  P0_VR_1D6_LINEAGE,
  NDX_CAMPAIGN_BOARD_REFERENCE_PATH,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr1d6/index.js';
import {
  NDX_CAMPAIGN_PAGE_CARDS,
  NDX_CAMPAIGN_MOTION,
  NDX_CAMPAIGN_PAGES_TOTAL,
  NDX_CAMPAIGN_MARGINS_PER_DAY,
} from '../src/site00/config/ndxCampaignBoardMobileReference.js';
import { NDX_VR_REGION } from '../src/site00/config/ndxVisualRegionIds.js';

const ROOT = process.cwd();

describe('P0.VR.1D.6 Campaign Board reference correction', () => {
  it('persists campaign board reference screenshot', () => {
    expect(existsSync(join(ROOT, NDX_CAMPAIGN_BOARD_REFERENCE_PATH))).toBe(true);
  });

  it('uses Site00Diamond for NDX lime project accent in mobile header', () => {
    const chrome = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceChrome.tsx'),
      'utf8',
    );
    expect(chrome).toContain('Site00Diamond');
    expect(chrome).toContain('mode="PROJECT_CONTEXT"');
    expect(chrome).not.toContain('name="origin"');
  });

  it('mobile campaign screen uses v1d13 dedicated layout and VR regions', () => {
    const src = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceScreens.tsx'), 'utf8');
    expect(src).toContain('site00-fws-mobile-campaign--v1d13');
    expect(src).toContain('site00-fws-mobile-campaign__schedule');
    expect(src).toContain('NDX_VR_REGION.campaignPages');
    expect(src).toContain('NDX_VR_REGION.campaignMotion');
    expect(src).toContain('NDX_VR_REGION.campaignQuickActions');
    expect(src).toContain('VIEW ALL');
    expect(src).toContain('site00-fws-mobile-campaign__page-card--peek');
    expect(src).not.toContain('NDX_VR_REGION.campaignMargins');
  });

  it('FounderWorkspaceShell routes campaign-board to mobile dedicated screen', () => {
    const shell = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/FounderWorkspaceShell.tsx'), 'utf8');
    expect(shell).toContain('mobileDedicatedScreens');
    expect(shell).toContain("'campaign-board'");
  });

  it('binds reference-approved artwork crops for pages and motion', () => {
    const resolutions = resolveCampaignBoardArtwork({
      projectRoot: ROOT,
      cards: [
        ...NDX_CAMPAIGN_PAGE_CARDS.map((c) => ({ id: c.id, artworkPath: c.artworkPath })),
        { id: 'book-in-motion', artworkPath: NDX_CAMPAIGN_MOTION.artworkPath },
      ],
    });
    expect(resolutions.every((r) => r.source === 'REFERENCE_APPROVED_CROP')).toBe(true);
    for (const card of NDX_CAMPAIGN_PAGE_CARDS) {
      const abs = join(ROOT, 'public', card.artworkPath.replace(/^\//, ''));
      expect(existsSync(abs), card.id).toBe(true);
    }
  });

  it('audits lime diamond missing when not using Site00Diamond', () => {
    const audit = buildCampaignBoardReferenceDetailAudit({ limeDiamondPresent: false });
    const diamond = audit.entries.find((e) => e.detailId === 'lime-diamond');
    expect(diamond?.status).toBe('MISSING');
    expect(FAIL_CAMPAIGN_LIME_DIAMOND_MISSING).toBe('FAIL_CAMPAIGN_LIME_DIAMOND_MISSING');
  });

  it('reference section counts updated for v1d13 (no margins lane)', () => {
    expect(NDX_CAMPAIGN_PAGES_TOTAL).toBe(9);
    expect(NDX_CAMPAIGN_MARGINS_PER_DAY).toBe(0);
  });

  it('lineage constant set', () => {
    expect(P0_VR_1D6_LINEAGE).toBe('P0.VR.1D.6');
    expect(NDX_VR_REGION.campaignDaySelector).toBe('ndx.campaign.day-selector');
  });
});

describe('P0.VR.1D.6 live campaign board correction pass', () => {
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
      const report = await runNdxCampaignBoardCorrectionPass({
        rootDir: ROOT,
        maxIterations: 1,
        executePatches: true,
        baseUrl: 'http://127.0.0.1:5174',
      });

      expect(report.renderPath).toBeTruthy();
      expect(report.iterations).toBeGreaterThanOrEqual(1);
      expect(report.detailAudit.matched).toBeGreaterThan(0);
      expect(report.artworkResolutions.length).toBeGreaterThanOrEqual(5);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('playwright') || message.includes('browser')) return;
      throw err;
    }
  }, 120_000);
});
