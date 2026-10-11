/**
 * SITE 00 Builder studio — reference overlay (Reference Fidelity 2).
 *
 *   node scripts/site00/builder-studio-qa/reference-overlay.cjs <outDir> [393x852|390x844]
 *
 * For each room: the approved reference screen (bezel and status bar removed, scaled to CSS px of a 393px phone),
 * the live studio captured in the reference's selection state, and a 50% blend of the two. Horizontal geometry is
 * expected to coincide; vertical rhythm is intentionally redistributed to fit one real screen (rooms 01–04).
 * Reference pixels appear only in these comparison sheets, never in the product.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { chromium } = require('playwright');

const BASE = process.env.BASE || 'http://127.0.0.1:5174';
const OUT = path.resolve(process.argv[2] || 'docs/site00/builder-experience/hybrid-spatial-studio/reference-fidelity-qa/overlays');
const [VW, VH] = (process.argv[3] || '393x852').split('x').map(Number);
const S = 2;
fs.mkdirSync(OUT, { recursive: true });

const WF = path.join(__dirname, '../../../docs/site00/builder-experience/wireframes');
// Native screen boxes in the reference files (left, top, width, height) — measured by bezel detection — and the
// status-bar height to drop, in CSS px.
const REFS = {
  place: ['BUILDER_APPROVED_SPATIAL_FOUR_ROOMS.jpg', [33, 140, 269, 745], 54],
  feel: ['BUILDER_APPROVED_SPATIAL_FOUR_ROOMS.jpg', [339, 143, 263, 720], 54],
  work: ['BUILDER_APPROVED_SPATIAL_FOUR_ROOMS.jpg', [637, 143, 263, 749], 54],
  pace: ['BUILDER_APPROVED_SPATIAL_FOUR_ROOMS.jpg', [933, 141, 262, 748], 54],
  blueprint: ['BUILDER_APPROVED_BLUEPRINT_REVEAL.jpg', [196, 64, 634, 1305], 50],
};

async function refScreen(room) {
  const [file, [l, t, w, h], bar] = REFS[room];
  const cssH = Math.round((h * VW) / w);
  const full = await sharp(path.join(WF, file)).extract({ left: l, top: t, width: w, height: h }).resize(VW * S, cssH * S).toBuffer();
  return sharp(full).extract({ left: 0, top: bar * S, width: VW * S, height: (cssH - bar) * S }).toBuffer();
}

const label = (text, width, color = '#111') =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="44"><rect width="100%" height="100%" fill="#fff"/><text x="12" y="29" font-family="sans-serif" font-size="22" font-weight="700" fill="${color}">${text}</text></svg>`);

async function sheet(room, live) {
  const ref = await refScreen(room);
  const [mr, ml] = await Promise.all([sharp(ref).metadata(), sharp(live).metadata()]);
  const H = Math.max(mr.height, ml.height);
  // Blend over the shared height (top-aligned): reference at 50% over live.
  const bh = Math.min(mr.height, ml.height);
  const refHalf = await sharp(ref).extract({ left: 0, top: 0, width: VW * S, height: bh }).ensureAlpha(0.5).png().toBuffer();
  const blend = await sharp(live).extract({ left: 0, top: 0, width: VW * S, height: bh }).composite([{ input: refHalf }]).png().toBuffer();
  const W = VW * S;
  await sharp({ create: { width: W * 3 + 40, height: H + 44, channels: 3, background: '#2a2a2e' } })
    .composite([
      { input: label('REFERENCE', W), left: 0, top: 0 },
      { input: ref, left: 0, top: 44 },
      { input: label(`LIVE ${VW}×${VH}`, W, '#e50107'), left: W + 20, top: 0 },
      { input: live, left: W + 20, top: 44 },
      { input: label('50% OVERLAY', W), left: 2 * W + 40, top: 0 },
      { input: blend, left: 2 * W + 40, top: 44 },
    ])
    .jpeg({ quality: 84 })
    .toFile(path.join(OUT, `overlay-${room}.jpg`));
  console.log('wrote', `overlay-${room}.jpg`);
}

(async () => {
  const args = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
  const browser = await chromium.launch({ args, ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}) });
  const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: S, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  page.setDefaultTimeout(90000);
  const sync = () => page.waitForFunction(() => document.querySelector('.bs-root')?.getAttribute('data-sync') === 'saved', null, { timeout: 30000 });
  const shot = async () => {
    await page.waitForSelector('.bs-object__host[data-env]', { timeout: 30000 }).catch(() => undefined);
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1300);
    return page.screenshot({ type: 'png' });
  };
  await page.goto(BASE + '/bldr/studio', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.bs-room--place');
  await sync();
  await page.getByRole('radio', { name: /^SIMPLE/ }).click();
  await sync();
  await sheet('place', await shot());
  await page.getByRole('radio', { name: /^ADVANCED/ }).click();
  await sync();
  await page.getByRole('button', { name: /^CONTINUE/ }).click();
  await page.waitForSelector('.bs-room--feel');
  await page.getByRole('radio', { name: /^MODERN/ }).click();
  await sync();
  await sheet('feel', await shot());
  await page.getByRole('button', { name: /^CONTINUE/ }).click();
  await page.waitForSelector('.bs-room--work');
  await sync();
  await sheet('work', await shot());
  await page.getByRole('button', { name: /^CONTINUE/ }).click();
  await page.waitForSelector('.bs-room--pace');
  await page.getByRole('radio', { name: /^STANDARD/ }).click();
  await sync();
  await sheet('pace', await shot());
  await page.getByRole('button', { name: /REVIEW MY BLUEPRINT/ }).click();
  await page.waitForSelector('.bs-room--blueprint');
  await sync();
  await sheet('blueprint', await shot());
  // Fit check: is the CTA fully on the first screen in each room? (recorded for the report)
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
