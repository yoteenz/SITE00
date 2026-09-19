#!/usr/bin/env node
/**
 * P0.VR.6R1 — Capture live design workspace baselines + generate overlay composites.
 *
 * Usage:
 *   node scripts/capture-design-workspace-calibration.mjs [baseUrl]
 *
 * Output: /tmp/site00-calibration/{baseline,overlay,delta-report.json}
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { chromium } from 'playwright';

const SCREENS = [
  { id: '01_ASSETS_UPLOAD', query: 'tab=ASSETS&assetStep=UPLOAD&viewport=mobile' },
  { id: '02_ASSETS_INSTRUCT', query: 'tab=ASSETS&assetStep=INSTRUCT&viewport=mobile' },
  { id: '03_ASSETS_DETECT', query: 'tab=ASSETS&assetStep=DETECT&viewport=mobile' },
  { id: '04_ASSETS_CROP', query: 'tab=ASSETS&assetStep=CONFIRM_CROP&viewport=mobile' },
  { id: '05_ASSETS_RECONSTRUCT', query: 'tab=ASSETS&assetStep=RECONSTRUCT&viewport=mobile' },
  { id: '06_ASSETS_APPROVE', query: 'tab=ASSETS&assetStep=APPROVE&viewport=mobile' },
  { id: '07_ASSETS_LIVE', query: 'tab=ASSETS&assetStep=REPLACE&viewport=mobile' },
  { id: '08_REFERENCES', query: 'tab=REFERENCES&viewport=mobile' },
  { id: '09_PAGES', query: 'tab=PAGES&viewport=mobile' },
  { id: '10_HISTORY', query: 'tab=HISTORY&viewport=mobile' },
  { id: '11_MORE', query: 'tab=MORE&viewport=mobile' },
];

const REF_FILES = {
  '01_ASSETS_UPLOAD': '01-assets-upload.jpg',
  '02_ASSETS_INSTRUCT': '02-assets-instruct.jpg',
  '03_ASSETS_DETECT': '03-assets-detect.jpg',
  '04_ASSETS_CROP': '04-assets-crop.jpg',
  '05_ASSETS_RECONSTRUCT': '05-assets-reconstruct.jpg',
  '06_ASSETS_APPROVE': '06-assets-approve.jpg',
  '07_ASSETS_LIVE': '07-assets-live.jpg',
  '08_REFERENCES': '08-references.jpg',
  '09_PAGES': '09-pages.jpg',
  '10_HISTORY': '10-history.jpg',
  '11_MORE': '11-more.jpg',
};

const CANVAS = { width: 390, height: 844 };
const OUT = '/tmp/site00-calibration';
const REF_DIR = join(process.cwd(), 'public/visual-references/founder/site00/calibration-p0vr6r1');

async function main() {
  const baseUrl = process.argv[2] ?? process.env.SITE00_PREVIEW_URL ?? 'http://127.0.0.1:5174';
  await mkdir(join(OUT, 'baseline'), { recursive: true });
  await mkdir(join(OUT, 'overlay'), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: CANVAS,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  const report = [];

  for (const screen of SCREENS) {
    const url = `${baseUrl.replace(/\/$/, '')}/projects/site00/design?${screen.query}`;
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
    await page.waitForTimeout(800);

    const livePath = join(OUT, 'baseline', `${screen.id}.png`);
    await page.screenshot({ path: livePath, fullPage: false });

    const refPath = join(REF_DIR, REF_FILES[screen.id]);
    const refNorm = join(OUT, 'baseline', `${screen.id}-reference-normalized.png`);
    const liveNorm = join(OUT, 'baseline', `${screen.id}-live-normalized.png`);
    const overlayPath = join(OUT, 'overlay', `${screen.id}-overlay.png`);

    await sharp(refPath).resize(CANVAS.width, CANVAS.height, { fit: 'contain', background: '#fff' }).png().toFile(refNorm);
    await sharp(livePath).resize(CANVAS.width, CANVAS.height, { fit: 'contain', background: '#fff' }).png().toFile(liveNorm);

    const refBuf = await sharp(refNorm).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const liveBuf = await sharp(liveNorm).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const pixels = refBuf.info.width * refBuf.info.height;
    let diffSum = 0;
    for (let i = 0; i < pixels; i++) {
      const ri = i * 4;
      diffSum +=
        Math.abs(refBuf.data[ri] - liveBuf.data[ri]) +
        Math.abs(refBuf.data[ri + 1] - liveBuf.data[ri + 1]) +
        Math.abs(refBuf.data[ri + 2] - liveBuf.data[ri + 2]);
    }
    const meanDiff = diffSum / (pixels * 3);
    const status = meanDiff < 18 ? 'HIGH_MATCH' : meanDiff < 40 ? 'PARTIAL_MATCH' : 'MAJOR_DRIFT';

    await sharp(refNorm)
      .composite([{ input: liveNorm, blend: 'overlay', opacity: 0.5 }])
      .png()
      .toFile(overlayPath);

    report.push({
      screenId: screen.id,
      url,
      livePath,
      referencePath: refPath,
      overlayPath,
      normalizedWidth: CANVAS.width,
      normalizedHeight: CANVAS.height,
      meanPixelDiff: Math.round(meanDiff * 10) / 10,
      overallStatus: status,
      numericScore: null,
    });

    console.log(`${screen.id}: ${status} (mean diff ${meanDiff.toFixed(1)})`);
  }

  await writeFile(join(OUT, 'delta-report.json'), JSON.stringify(report, null, 2));
  await browser.close();
  console.log(`Wrote ${OUT}/delta-report.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
