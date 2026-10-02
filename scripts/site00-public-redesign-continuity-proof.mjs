#!/usr/bin/env node
/**
 * OPUS-SURGICAL-CLEANUP1 proof: captures the two target authorities at 360×740 / 430×932 / 390×844 and
 * builds family-continuity strips (viewport captures side by side, same frame):
 *   02_IDNTY_STATE_00_FOUNDATION/continuity-foundation.jpg = STATE 00 DETAIL | PRIMARY GOAL
 *   02_BUILD_READY_EVIDENCE/continuity-build-ready.jpg     = VERIFICATION | EVIDENCE | AUTHORITY CHECK | REVIEW
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { routeProofFonts } from './lib/site00-proof-fonts.mjs';
import { AUTHORITIES, KEY } from './lib/site00-public-redesign-authorities.mjs';

const BASE = process.env.SITE00_BASE ?? 'http://localhost:5174';
const ROOT = path.resolve('docs/site00/public-redesign/opus-proof');
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium' });

async function shot(id, [w, h], file) {
  const a = AUTHORITIES.find((x) => x.id === id);
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await routeProofFonts(page);
  await page.route('**/api/site00/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"intake":null}' }));
  if (a.seed) await page.addInitScript(([k, v]) => localStorage.setItem(k, JSON.stringify(v)), [KEY, a.seed]);
  await page.goto(BASE + a.route);
  await page.waitForSelector('.s00pr-panel', { timeout: 15000 });
  await page.waitForTimeout(900);
  await page.screenshot({ path: file });
  await ctx.close();
  return file;
}

async function strip(files, out) {
  const metas = await Promise.all(files.map((f) => sharp(f).metadata()));
  const H = Math.max(...metas.map((m) => m.height));
  let x = 0;
  const comps = files.map((f, i) => {
    const c = { input: f, left: x, top: 0 };
    x += metas[i].width + 6;
    return c;
  });
  await sharp({ create: { width: x - 6, height: H, channels: 3, background: '#7a7a7a' } }).composite(comps).jpeg({ quality: 76 }).toFile(out);
}

const tmp = fs.mkdtempSync('/tmp/s00pr-cont-');
for (const id of ['02_IDNTY_STATE_00_FOUNDATION', '02_BUILD_READY_EVIDENCE']) {
  for (const vp of [[360, 740], [430, 932], [390, 844]]) {
    await shot(id, vp, path.join(ROOT, id, `after-${vp.join('x')}.png`));
  }
}
await strip(
  [await shot('02_IDNTY_STATE_00_FOUNDATION', [390, 693], `${tmp}/a.png`), await shot('01_FOUNDATION_PRIMARY_GOAL', [390, 693], `${tmp}/b.png`)],
  path.join(ROOT, '02_IDNTY_STATE_00_FOUNDATION', 'continuity-foundation.jpg'),
);
await strip(
  [await shot('02_IDNTY_STATE_00_FOUNDATION', [390, 844], `${tmp}/c.png`), await shot('01_FOUNDATION_PRIMARY_GOAL', [390, 844], `${tmp}/d.png`)],
  path.join(ROOT, '02_IDNTY_STATE_00_FOUNDATION', 'continuity-foundation-390x844.jpg'),
);
const br = [];
for (const id of ['01_BUILD_READY_VERIFICATION', '02_BUILD_READY_EVIDENCE', '03_BUILD_READY_AUTHORITY_CHECK', '04_BUILD_READY_REVIEW_VERIFICATION']) {
  br.push(await shot(id, [390, 693], `${tmp}/${id}.png`));
}
await strip(br, path.join(ROOT, '02_BUILD_READY_EVIDENCE', 'continuity-build-ready.jpg'));
await browser.close();
console.log('continuity proof written');
