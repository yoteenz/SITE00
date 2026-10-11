/**
 * SITE 00 Builder studio — reference stage comparison (Reference Fidelity 2).
 *
 *   node scripts/site00/builder-studio-qa/reference-stages.cjs <outDir> [place,feel,work,pace,blueprint]
 *
 * For each room: the approved reference's stage region (scaled to CSS px of a 393px phone) beside the live stage
 * captured at 393×852 in the reference's selection state. Reference pixels appear only in these sheets.
 */
const fs = require('fs');
const path = require('path'); const sharp = require('sharp'); const { chromium } = require('playwright');
const OUT = process.argv[2] || 'docs/site00/builder-experience/hybrid-spatial-studio/reference-fidelity-qa/stages'; fs.mkdirSync(OUT, { recursive: true }); const ONLY = (process.argv[3] || 'place,feel,work,pace,blueprint').split(',');
const WF = path.join(__dirname, '../../../docs/site00/builder-experience/wireframes') + '/';
const BASE = process.env.BASE || 'http://127.0.0.1:5174';
// reference stage boxes in CSS px of the 393-wide screen (top, height)
const REF = { place: ['BUILDER_APPROVED_SPATIAL_FOUR_ROOMS.jpg', [33, 140, 269, 745], 360, 270], feel: ['BUILDER_APPROVED_SPATIAL_FOUR_ROOMS.jpg', [339, 143, 263, 720], 330, 400], work: ['BUILDER_APPROVED_SPATIAL_FOUR_ROOMS.jpg', [637, 143, 263, 749], 370, 500], pace: ['BUILDER_APPROVED_SPATIAL_FOUR_ROOMS.jpg', [933, 141, 262, 748], 360, 360], blueprint: ['BUILDER_APPROVED_BLUEPRINT_REVEAL.jpg', [196, 64, 634, 1305], 280, 240] };
async function ref(room) { const [f, [l, t, w, h], top, hh] = REF[room]; const k = w / 393; return sharp(WF + f).extract({ left: l, top: Math.round(t + top * k), width: w, height: Math.round(hh * k) }).resize({ width: 786 }).toBuffer(); }
(async () => {
  const b = await chromium.launch({ ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}), args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const p = await ctx.newPage(); p.setDefaultTimeout(60000);
  const sync = () => p.waitForFunction(() => document.querySelector('.bs-root')?.getAttribute('data-sync') === 'saved', null, { timeout: 30000 });
  const grab = async (room) => { await p.waitForSelector('.bs-object__host[data-env]', { timeout: 30000 }).catch(() => undefined); await p.waitForTimeout(1600); const live = await p.locator('.bs-stage').screenshot(); const r = await ref(room);
    const [ml, mr] = await Promise.all([sharp(live).metadata(), sharp(r).metadata()]); const H = Math.max(ml.height, mr.height);
    await sharp({ create: { width: 786 * 2 + 12, height: H, channels: 3, background: '#222' } }).composite([{ input: r, left: 0, top: 0 }, { input: live, left: 798, top: 0 }]).jpeg({ quality: 84 }).toFile(path.join(OUT, `stage-${room}.jpg`)); console.log('stage', room, ml.width / 2, 'x', ml.height / 2); };
  await p.goto(BASE + '/bldr/studio', { waitUntil: 'domcontentloaded' }); await p.waitForSelector('.bs-room--place'); await sync();
  await p.getByRole('radio', { name: /^SIMPLE/ }).click(); await sync(); if (ONLY.includes('place')) await grab('place');
  await p.getByRole('radio', { name: /^ADVANCED/ }).click(); await sync(); await p.getByRole('button', { name: /^CONTINUE/ }).click(); await p.waitForSelector('.bs-room--feel');
  await p.getByRole('radio', { name: /^MODERN/ }).click(); await sync(); if (ONLY.includes('feel')) await grab('feel');
  await p.getByRole('button', { name: /^CONTINUE/ }).click(); await p.waitForSelector('.bs-room--work'); await sync(); if (ONLY.includes('work')) await grab('work');
  await p.getByRole('button', { name: /^CONTINUE/ }).click(); await p.waitForSelector('.bs-room--pace'); await p.getByRole('radio', { name: /^STANDARD/ }).click(); await sync(); if (ONLY.includes('pace')) await grab('pace');
  if (ONLY.includes('blueprint')) { await p.getByRole('button', { name: /REVIEW MY BLUEPRINT/ }).click(); await p.waitForSelector('.bs-room--blueprint'); await sync(); await grab('blueprint'); }
  await b.close();
})();
