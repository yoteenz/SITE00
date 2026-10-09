/**
 * SITE 00 Builder studio — creative refinement capture set (the sprint's required screens).
 *
 *   SITE00_INTAKES_USE_MEMORY=1 VITE_SITE00_TEMPLATE_SYSTEM_V1=1 VITE_SITE00_CLIENT_ESTIMATE_PREVIEW_V1=1 \
 *     npx vite --port 5174 --host 127.0.0.1
 *   node scripts/site00/builder-studio-qa/creative-captures.cjs <outDir> [mobile,desktop,tablet]
 *
 * Real dev server, real in-process intake API on the memory store (as the founder tunnel runs in dev mode).
 * Every capture is the live browser render; nothing is composited.
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const BASE = process.env.BASE || 'http://127.0.0.1:5174';
const OUT = path.resolve(process.argv[2] || 'docs/site00/builder-experience/hybrid-spatial-studio/creative-refinement-qa/after');
const SETS = (process.argv[3] || 'mobile,desktop,tablet').split(',');
fs.mkdirSync(OUT, { recursive: true });

const VP = {
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  mobile393: { viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  tablet: { viewport: { width: 834, height: 1194 }, deviceScaleFactor: 1 },
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};
const log = [];
const note = (s) => {
  log.push(s);
  console.log(s);
};

async function newPage(browser, vp) {
  // Reduced motion: still frames for deterministic captures (motion is reviewed separately).
  const ctx = await browser.newContext({ ...VP[vp], reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  page.setDefaultTimeout(90000);
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
  return { ctx, page, errors };
}
const settle = (page, ms = 1200) => page.waitForTimeout(ms);
async function waitSync(page, list = ['saved'], timeout = 20000) {
  await page.waitForFunction((l) => l.includes(document.querySelector('.bs-root')?.getAttribute('data-sync')), list, { timeout });
}
async function shot(page, name, { full = false } = {}) {
  await page.evaluate(() => document.fonts.ready);
  if (!full) await page.evaluate(() => window.scrollTo(0, 0));
  await settle(page, 350);
  await page.screenshot({ path: path.join(OUT, `${name}.jpg`), type: 'jpeg', quality: 86, fullPage: full });
  note(`captured ${name}`);
}
async function room(page, id) {
  await page.waitForSelector(`.bs-room--${id}`);
  // Captures show the stage's final look: wait until its reflections are applied.
  await page.waitForSelector('.bs-object__host[data-env]', { timeout: 30000 }).catch(() => undefined);
  await settle(page, 900);
}
async function scrollTo(page, selector) {
  await page.locator(selector).first().scrollIntoViewIfNeeded();
  await settle(page, 300);
}

async function journey(browser, vp, prefix, full) {
  const { ctx, page, errors } = await newPage(browser, vp);
  await page.goto(BASE + '/bldr/studio', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.bs-root');
  await waitSync(page);
  await room(page, 'place');
  if (full) await shot(page, `${prefix}-01a-place-default`);
  await page.getByRole('radio', { name: /^SIMPLE/ }).click();
  await waitSync(page);
  await settle(page, 900);
  await shot(page, `${prefix}-01b-place-simple`);
  await page.getByRole('radio', { name: /^ADVANCED/ }).click();
  await waitSync(page);
  await settle(page, 900);
  if (full) {
    await shot(page, `${prefix}-01c-place-advanced`);
    await page.getByRole('radio', { name: /^WORLD/ }).click();
    await settle(page, 900);
    await shot(page, `${prefix}-01d-place-world`);
    await page.getByRole('radio', { name: /^CUSTOM/ }).click();
    await settle(page, 900);
    await shot(page, `${prefix}-01e-place-custom`);
    await page.getByRole('radio', { name: /^ADVANCED/ }).click();
    await waitSync(page);
  }
  await page.getByRole('button', { name: /^CONTINUE/ }).click();
  await room(page, 'feel');
  for (const [i, feel] of ['MODERN', 'BOLD', 'EDITORIAL', 'IMMERSIVE'].entries()) {
    if (!full && feel !== 'MODERN') continue;
    await page.getByRole('radio', { name: new RegExp(`^${feel}`) }).click();
    await settle(page, 900);
    await shot(page, `${prefix}-02${'abcd'[i]}-feel-${feel.toLowerCase()}`);
  }
  await page.getByRole('radio', { name: /^MODERN/ }).click();
  await waitSync(page);
  await page.getByRole('button', { name: /^CONTINUE/ }).click();
  await room(page, 'work');
  // The contract opens WORK with PAGES (core content) already on: that is the "no additional features" state.
  if (full) await shot(page, `${prefix}-03a-work-default-pages-only`);
  for (const id of ['SHOP', 'BOOKING', 'MEMBER AREA']) {
    await page.getByRole('button', { name: id, exact: true }).click();
    await settle(page, 500);
    if (full && id === 'SHOP') await shot(page, `${prefix}-03b-work-shop-added`);
  }
  await waitSync(page);
  await settle(page, 900);
  await shot(page, `${prefix}-03c-work-multiple`);
  await page.getByRole('button', { name: /^CONTINUE/ }).click();
  await room(page, 'pace');
  await page.getByRole('radio', { name: /^STANDARD/ }).click();
  await waitSync(page);
  await settle(page, 900);
  if (full) {
    await shot(page, `${prefix}-04a-pace-standard`);
    await page.getByRole('radio', { name: /^FLEXIBLE/ }).click();
    await settle(page, 900);
    await shot(page, `${prefix}-04b-pace-flexible`);
    const expedited = page.getByRole('radio', { name: /^EXPEDITED/ });
    if ((await expedited.getAttribute('aria-disabled')) !== 'true') {
      await expedited.click();
      await settle(page, 900);
      await shot(page, `${prefix}-04c-pace-expedited`);
    }
    await page.getByRole('radio', { name: /^STANDARD/ }).click();
    await waitSync(page);
  }
  await page.getByRole('button', { name: /REVIEW MY BLUEPRINT/ }).click();
  await room(page, 'blueprint');
  await waitSync(page);
  await settle(page, 1200);
  await shot(page, `${prefix}-05a-blueprint-overview`);
  if (full) {
    await shot(page, `${prefix}-05a-blueprint-overview-full`, { full: true });
    for (const [i, tab] of ['STRUCTURE', 'PAGES', 'FEATURES', 'TIMELINE'].entries()) {
      await page.getByRole('tab', { name: new RegExp(tab) }).click();
      await settle(page, 700);
      await scrollTo(page, '.bs-tabs');
      await page.screenshot({ path: path.join(OUT, `${prefix}-05${'bcde'[i]}-blueprint-${tab.toLowerCase()}.jpg`), type: 'jpeg', quality: 86 });
      note(`captured ${prefix}-05${'bcde'[i]}-blueprint-${tab.toLowerCase()}`);
    }
    await page.getByRole('tab', { name: /OVERVIEW/ }).click();
    await settle(page, 500);
    // Rotate (inspect) then fullscreen.
    await page.getByRole('button', { name: 'TURN THE STRUCTURE IN 3D' }).click();
    const box = await page.locator('.bs-stage canvas').boundingBox();
    await page.mouse.move(box.x + box.width * 0.55, box.y + box.height * 0.5);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.18, box.y + box.height * 0.42, { steps: 14 });
    await page.mouse.up();
    await settle(page, 900);
    await shot(page, `${prefix}-05f-blueprint-rotated`);
    await page.getByRole('button', { name: 'VIEW FULL SCREEN' }).click();
    await settle(page, 1400);
    await page.screenshot({ path: path.join(OUT, `${prefix}-05g-blueprint-fullscreen.jpg`), type: 'jpeg', quality: 86 });
    note(`captured ${prefix}-05g-blueprint-fullscreen`);
    await page.evaluate(async () => {
      if (document.fullscreenElement) await document.exitFullscreen();
      document.querySelectorAll('.is-expanded').forEach((el) => el.classList.remove('is-expanded'));
    });
    await settle(page, 600);
    await page.getByRole('button', { name: 'TURN THE STRUCTURE IN 3D' }).click().catch(() => undefined);
  }
  await page.getByRole('button', { name: /CONFIRM & SUBMIT/ }).click();
  await page.waitForSelector('.bs-dialog');
  await settle(page, 600);
  await page.screenshot({ path: path.join(OUT, `${prefix}-05h-blueprint-confirmation.jpg`), type: 'jpeg', quality: 86 });
  note(`captured ${prefix}-05h-blueprint-confirmation`);
  if (full) {
    await page.getByLabel('Email for secure intake access').fill('founder-creative-qa@example.com');
    await page.getByRole('button', { name: /SAVE MY ACCESS/ }).click();
    await page.waitForFunction(() => !document.querySelector('.bs-dialog .bs-cta')?.hasAttribute('disabled'), null, { timeout: 15000 });
    await settle(page, 400);
    await page.screenshot({ path: path.join(OUT, `${prefix}-05i-blueprint-confirmation-ready.jpg`), type: 'jpeg', quality: 86 });
    note(`captured ${prefix}-05i-blueprint-confirmation-ready`);
    await page.locator('.bs-dialog .bs-cta').click();
    await page.waitForSelector('text=SUBMISSION RECEIVED', { timeout: 20000 });
    await settle(page, 500);
    await page.screenshot({ path: path.join(OUT, `${prefix}-05j-blueprint-submission-received.jpg`), type: 'jpeg', quality: 86 });
    note(`captured ${prefix}-05j-blueprint-submission-received`);
    await page.getByRole('button', { name: /VIEW MY BLUEPRINT/ }).click();
    await settle(page, 1500);
    await shot(page, `${prefix}-05k-blueprint-submitted-state`);
  }
  const real = errors.filter((e) => !/ERR_TUNNEL_CONNECTION_FAILED|Failed to load resource/.test(e));
  note(`${prefix}: console errors ${real.length}${real.length ? ' ' + JSON.stringify(real.slice(0, 3)) : ''}`);
  await ctx.close();
}

(async () => {
  const args = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
  const browser = await chromium.launch({ args, ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}) });
  if (SETS.includes('mobile')) await journey(browser, 'mobile', 'mobile', true);
  if (SETS.includes('mobile393')) await journey(browser, 'mobile393', 'm393', false);
  if (SETS.includes('desktop')) await journey(browser, 'desktop', 'desktop', false);
  if (SETS.includes('tablet')) await journey(browser, 'tablet', 'tablet', false);
  fs.writeFileSync(path.join(OUT, 'capture-log.txt'), log.join('\n') + '\n');
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
