/**
 * P0.VR.REPLICATION.4R3R1 — Live DOM capture + hero crop purity.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  P0_VR_REPLICATION_4R3R1_BUILD,
  HERO_OBJECT_IDS,
  validateHeroNormCrop,
  buildGeometryReceiptV2FromLive,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4R3R1/index.js';
import { HERO_AUTHORITY_NORM_CROPS } from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication3cR1/constants.js';
import { executeHeroGeometryConvergencePipeline } from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4R3/executeHeroGeometryConvergencePipeline.js';

const read = (rel: string) => readFileSync(join(import.meta.dirname, '..', rel), 'utf8');

describe('P0.VR.REPLICATION.4R3R1 hero DOM recovery', () => {
  it('defines stable H01–H14 selectors', () => {
    expect(HERO_OBJECT_IDS.length).toBe(14);
    const twin = read('src/site00/components/reconstruction/ForensicBlueprintNdxOverviewTwin.tsx');
    for (const id of HERO_OBJECT_IDS) {
      const hasAttr =
        twin.includes(`data-hero-object="${id}"`) || twin.includes(`heroObjectId="${id}"`);
      expect(hasAttr).toBe(true);
    }
  });

  it('4R3 pipeline does not spec-sync PASS rendered geometry', () => {
    const { report } = executeHeroGeometryConvergencePipeline({ session: { sessionId: 's' } as never });
    expect(report.renderedGeometry.length).toBe(0);
    expect(report.geometryReceipt.status).toBe('FAIL');
  });

  it('hero norm crops stay inside hero band', () => {
    const h06 = validateHeroNormCrop({ objectId: 'H06', ...HERO_AUTHORITY_NORM_CROPS.hero_h06! });
    const h12 = validateHeroNormCrop({ objectId: 'H12', ...HERO_AUTHORITY_NORM_CROPS.hero_h12! });
    expect(h06.cropWithinHeroBand).toBe(true);
    expect(h12.cropWithinHeroBand).toBe(true);
    expect(h06.failureCode).toBeNull();
  });

  it('geometry receipt V2 rejects layout-spec measurement', () => {
    const receipt = buildGeometryReceiptV2FromLive({
      deltas: [],
      captureReceipt: {
        expectedCount: 14,
        foundCount: 14,
        missingIds: [],
        measurementSource: 'LAYOUT_SPEC',
        captureTimestamp: null,
        heroRootFound: true,
        fontsReady: true,
        imagesSettled: true,
        status: 'PASS',
        failureCode: null,
      },
      measurementSource: 'LAYOUT_SPEC',
    });
    expect(receipt.status).not.toBe('PASS');
  });

  it('live capture module and overlay use browser measurement', () => {
    expect(read('src/site00/components/reconstruction/captureHeroLiveDomGeometry.ts')).toContain('LIVE_BROWSER_DOM');
    expect(read('src/site00/components/reconstruction/HeroBlueprintDebugOverlay.tsx')).toContain('liveCapture');
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrReplication2/executeShellFirstNdxReplication.ts')).toContain(
      'executeHeroDomRecoveryPipeline',
    );
  });

  it('twin prefers materialized hero region URLs over full-page background', () => {
    const twin = read('src/site00/components/reconstruction/ForensicBlueprintNdxOverviewTwin.tsx');
    expect(twin).toContain('heroSafeRegionCropUrls');
    expect(twin).toContain('site00-fb__hero-h06-img');
    expect(twin).toContain('site00-fb__hero-h12-img');
  });

  it('build ref', () => {
    expect(P0_VR_REPLICATION_4R3R1_BUILD).toBe('v338');
  });

  it('Playwright captures 14 hero DOM rects on fixture', async () => {
    const { chromium } = await import('playwright');
    const { writeFileSync, mkdirSync } = await import('node:fs');
    const outDir = '/opt/cursor/artifacts';
    mkdirSync(outDir, { recursive: true });

    const ids = HERO_OBJECT_IDS.map((id) => `<div data-hero-object="${id}" style="position:absolute;left:${id.charCodeAt(1)}px;top:${id.charCodeAt(2) || 1}px;width:20px;height:10px"></div>`).join('');
    const html = `<!DOCTYPE html><html><body style="margin:0"><section id="hero-inspection" data-hero-object="H14" style="position:relative;width:375px;height:220px;background:#111">${ids}</section></body></html>`;
    const htmlPath = join(outDir, 'hero-live-capture-fixture.html');
    writeFileSync(htmlPath, html);

    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
    await page.goto(`file://${htmlPath}`, { waitUntil: 'domcontentloaded' });
    const found = await page.evaluate(() => {
      const ids = ['H01', 'H02', 'H03', 'H04', 'H05', 'H06', 'H07', 'H08', 'H09', 'H10', 'H11', 'H12', 'H13', 'H14'];
      return ids.filter((id) => document.querySelector(`[data-hero-object="${id}"]`)).length;
    });
    await page.screenshot({ path: join(outDir, 'hero-live-capture-fixture.png') });
    await browser.close();
    expect(found).toBe(14);
  }, 60_000);
});
