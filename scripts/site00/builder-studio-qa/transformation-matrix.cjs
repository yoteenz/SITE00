/**
 * SITE 00 Builder studio — transformation matrix evidence.
 * Captures the live Build Object stage for every selection in every room (and reversal), plus a pixel-difference
 * score between options so "every major selection creates a perceivable change" is measured, not asserted.
 *
 *   node scripts/site00/builder-studio-qa/transformation-matrix.cjs <outDir>
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { chromium } = require('playwright');
const sharp = require('sharp');

const BASE = process.env.BASE || 'http://127.0.0.1:5174';
const OUT = path.resolve(process.argv[2] || 'docs/site00/builder-experience/hybrid-spatial-studio/creative-refinement-qa/matrix');
fs.mkdirSync(OUT, { recursive: true });
const rows = [];

async function stage(page) {
  return page.locator('.bs-stage canvas').screenshot();
}
async function grab(page, name) {
  await page.waitForSelector('.bs-object__host[data-env]', { timeout: 30000 }).catch(() => undefined);
  await page.waitForTimeout(1100);
  const buf = await stage(page);
  fs.writeFileSync(path.join(OUT, `${name}.png`), buf);
  return buf;
}
/** Mean absolute per-channel difference between two stage captures, 0–255. */
async function diff(a, b) {
  const [ra, rb] = await Promise.all([sharp(a).resize(195, 160).raw().toBuffer(), sharp(b).resize(195, 160).raw().toBuffer()]);
  let sum = 0;
  for (let i = 0; i < ra.length; i += 1) sum += Math.abs(ra[i] - rb[i]);
  return sum / ra.length;
}
async function sheet(names, file, cols) {
  const tiles = await Promise.all(names.map((n) => sharp(path.join(OUT, `${n}.png`)).resize(390, 320, { fit: 'cover' }).toBuffer()));
  const rowsN = Math.ceil(tiles.length / cols);
  const composite = tiles.map((input, i) => ({ input, left: (i % cols) * 390, top: Math.floor(i / cols) * 320 }));
  await sharp({ create: { width: cols * 390, height: rowsN * 320, channels: 3, background: '#f4f4f6' } }).composite(composite).jpeg({ quality: 84 }).toFile(path.join(OUT, file));
}

(async () => {
  const args = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
  const browser = await chromium.launch({ args, ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}) });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  page.setDefaultTimeout(90000);
  await page.goto(BASE + '/bldr/studio', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.bs-room--place');
  await page.waitForFunction(() => document.querySelector('.bs-root')?.getAttribute('data-sync') === 'saved', null, { timeout: 30000 });

  const record = async (room, a, b, bufA, bufB) => {
    const d = await diff(bufA, bufB);
    rows.push({ room, from: a, to: b, meanDiff: Number(d.toFixed(2)) });
  };

  // PLACE
  const place = {};
  for (const id of ['SIMPLE', 'ADVANCED', 'CUSTOM', 'WORLD']) {
    await page.getByRole('radio', { name: new RegExp(`^${id}`) }).click();
    place[id] = await grab(page, `place-${id.toLowerCase()}`);
  }
  await page.getByRole('radio', { name: /^SIMPLE/ }).click();
  const placeBack = await grab(page, 'place-simple-reversed');
  for (const [a, b] of [['SIMPLE', 'ADVANCED'], ['ADVANCED', 'CUSTOM'], ['CUSTOM', 'WORLD'], ['SIMPLE', 'WORLD']]) await record('PLACE', a, b, place[a], place[b]);
  rows.push({ room: 'PLACE', from: 'SIMPLE', to: 'SIMPLE (reversed)', identical: crypto.createHash('sha1').update(place.SIMPLE).digest('hex') === crypto.createHash('sha1').update(placeBack).digest('hex'), meanDiff: Number((await diff(place.SIMPLE, placeBack)).toFixed(2)) });
  await page.getByRole('radio', { name: /^ADVANCED/ }).click();
  await page.waitForFunction(() => document.querySelector('.bs-root')?.getAttribute('data-sync') === 'saved', null, { timeout: 30000 });
  await page.getByRole('button', { name: /^CONTINUE/ }).click();
  await page.waitForSelector('.bs-room--feel');

  // FEEL
  const feel = {};
  for (const id of ['MODERN', 'BOLD', 'EDITORIAL', 'IMMERSIVE']) {
    await page.getByRole('radio', { name: new RegExp(`^${id}`) }).click();
    feel[id] = await grab(page, `feel-${id.toLowerCase()}`);
  }
  const fe = ['MODERN', 'BOLD', 'EDITORIAL', 'IMMERSIVE'];
  for (let i = 0; i < fe.length; i += 1) for (let j = i + 1; j < fe.length; j += 1) await record('FEEL', fe[i], fe[j], feel[fe[i]], feel[fe[j]]);
  await page.getByRole('radio', { name: /^MODERN/ }).click();
  await page.waitForFunction(() => document.querySelector('.bs-root')?.getAttribute('data-sync') === 'saved', null, { timeout: 30000 });
  await page.getByRole('button', { name: /^CONTINUE/ }).click();
  await page.waitForSelector('.bs-room--work');

  // WORK: the contract opens with PAGES (core content) on. Each other capability is added alone and removed again;
  // PAGES is measured by taking it away and putting it back.
  const work = { DEFAULT: await grab(page, 'work-default') };
  const others = ['BLOG', 'SHOP', 'MEMBER AREA', 'BOOKING', 'PORTAL'];
  for (const id of others) {
    const slug = id.toLowerCase().replace(' ', '-');
    await page.getByRole('button', { name: id, exact: true }).click();
    work[id] = await grab(page, `work-${slug}`);
    await record('WORK', 'DEFAULT (PAGES)', `+${id}`, work.DEFAULT, work[id]);
    await page.getByRole('button', { name: id, exact: true }).click();
    const back = await grab(page, `work-${slug}-removed`);
    rows.push({ room: 'WORK', from: `+${id}`, to: 'removed', meanDiffToDefault: Number((await diff(work.DEFAULT, back)).toFixed(2)) });
  }
  await page.getByRole('button', { name: 'PAGES', exact: true }).click();
  await page.getByRole('button', { name: 'BLOG', exact: true }).click();
  const noPages = await grab(page, 'work-blog-without-pages');
  await page.getByRole('button', { name: 'PAGES', exact: true }).click();
  const withPages = await grab(page, 'work-blog-with-pages');
  await record('WORK', 'BLOG without PAGES', 'BLOG + PAGES', noPages, withPages);
  await page.getByRole('button', { name: 'BLOG', exact: true }).click();
  for (const id of others) await page.getByRole('button', { name: id, exact: true }).click();
  work.ALL = await grab(page, 'work-all');
  for (const id of others) await page.getByRole('button', { name: id, exact: true }).click();
  // PACE is measured on a scope where the estimator offers priority (ADVANCED + PAGES + SHOP + PORTAL), so all three
  // paces can be shown. Availability itself is the estimator's call; nothing here forces it.
  for (const id of ['SHOP', 'PORTAL']) await page.getByRole('button', { name: id, exact: true }).click();
  await page.waitForFunction(() => document.querySelector('.bs-root')?.getAttribute('data-sync') === 'saved', null, { timeout: 30000 });
  await page.getByRole('button', { name: /^CONTINUE/ }).click();
  await page.waitForSelector('.bs-room--pace');

  // PACE
  const pace = {};
  for (const id of ['STANDARD', 'FLEXIBLE', 'EXPEDITED']) {
    const radio = page.getByRole('radio', { name: new RegExp(`^${id}`) });
    if ((await radio.getAttribute('aria-disabled')) === 'true') {
      rows.push({ room: 'PACE', option: id, note: 'not available for this scope (estimator)' });
      continue;
    }
    await radio.click();
    pace[id] = await grab(page, `pace-${id.toLowerCase()}`);
  }
  if (pace.FLEXIBLE) await record('PACE', 'STANDARD', 'FLEXIBLE', pace.STANDARD, pace.FLEXIBLE);
  if (pace.EXPEDITED) await record('PACE', 'STANDARD', 'EXPEDITED', pace.STANDARD, pace.EXPEDITED);
  if (pace.EXPEDITED && pace.FLEXIBLE) await record('PACE', 'EXPEDITED', 'FLEXIBLE', pace.EXPEDITED, pace.FLEXIBLE);
  await page.getByRole('radio', { name: /^STANDARD/ }).click();
  await page.waitForFunction(() => document.querySelector('.bs-root')?.getAttribute('data-sync') === 'saved', null, { timeout: 30000 });
  await page.getByRole('button', { name: /REVIEW MY BLUEPRINT/ }).click();
  await page.waitForSelector('.bs-room--blueprint');

  // BLUEPRINT inspection focus per section.
  const bp = {};
  for (const tab of ['OVERVIEW', 'STRUCTURE', 'PAGES', 'FEATURES', 'TIMELINE']) {
    await page.getByRole('tab', { name: new RegExp(tab) }).click();
    bp[tab] = await grab(page, `blueprint-${tab.toLowerCase()}`);
  }
  for (const tab of ['STRUCTURE', 'PAGES', 'FEATURES']) await record('BLUEPRINT', 'OVERVIEW', tab, bp.OVERVIEW, bp[tab]);

  // PACE motion evidence: the same structure mid-assembly at each pace (motion on), 180 ms and 520 ms after choosing.
  // Rows: FLEXIBLE, EXPEDITED, STANDARD (EXPEDITED is skipped if the estimator does not offer it for this scope).
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, reducedMotion: 'no-preference' });
  const mp = await mctx.newPage();
  mp.setDefaultTimeout(90000);
  const intakeId = await page.evaluate(() => localStorage.getItem('site00-bldr-spatial-server-intake-id'));
  await mp.goto(`${BASE}/bldr/studio/pace?intakeId=${encodeURIComponent(intakeId)}`, { waitUntil: 'domcontentloaded' });
  await mp.waitForSelector('.bs-room--pace');
  await mp.waitForTimeout(2500);
  const motionNames = [];
  for (const id of ['FLEXIBLE', 'EXPEDITED', 'STANDARD']) {
    const radio = mp.getByRole('radio', { name: new RegExp(`^${id}`) });
    if ((await radio.getAttribute('aria-disabled')) === 'true') continue;
    await radio.click();
    for (const ms of [180, 520]) {
      await mp.waitForTimeout(ms === 180 ? 180 : 340);
      fs.writeFileSync(path.join(OUT, `pace-motion-${id.toLowerCase()}-${ms}ms.png`), await mp.locator('.bs-stage canvas').screenshot());
      motionNames.push(`pace-motion-${id.toLowerCase()}-${ms}ms`);
    }
    await mp.waitForTimeout(1600);
  }
  await mctx.close();
  await sheet(motionNames, 'matrix-pace-motion.jpg', 2);

  await sheet(['place-simple', 'place-advanced', 'place-custom', 'place-world'], 'matrix-place.jpg', 4);
  await sheet(['feel-modern', 'feel-bold', 'feel-editorial', 'feel-immersive'], 'matrix-feel.jpg', 4);
  await sheet(['work-default', 'work-blog', 'work-shop', 'work-member-area', 'work-booking', 'work-portal', 'work-blog-without-pages', 'work-all'], 'matrix-work.jpg', 4);
  await sheet(Object.keys(pace).map((k) => `pace-${k.toLowerCase()}`), 'matrix-pace.jpg', 3);
  await sheet(['blueprint-overview', 'blueprint-structure', 'blueprint-pages', 'blueprint-features', 'blueprint-timeline'], 'matrix-blueprint.jpg', 5);
  fs.writeFileSync(path.join(OUT, 'matrix-diff.json'), JSON.stringify(rows, null, 2));
  console.log(JSON.stringify(rows));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
