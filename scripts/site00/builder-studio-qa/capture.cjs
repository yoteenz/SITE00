/**
 * SITE 00 Builder studio — screenshot capture for all five screens.
 * Run against a dev server started with VITE_SITE00_TEMPLATE_SYSTEM_V1=1 VITE_SITE00_CLIENT_ESTIMATE_PREVIEW_V1=1.
 * Usage: node scripts/site00/builder-studio-qa/capture.cjs <outDir> mobile,tablet,desktop
 * Set PW_CHROMIUM to a Chromium binary if Playwright's own browser is not installed.
 */
const { chromium } = require('playwright');
const path = require('path');
const OUT = process.argv[2] || 'docs/site00/builder-experience/hybrid-spatial-studio/screenshots-raw';
const BASE = process.env.BASE || 'http://127.0.0.1:5174';
const fs = require('fs'); fs.mkdirSync(OUT, { recursive: true });
const viewports = (process.argv[3] || 'mobile').split(',');
const VP = { mobile: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, tablet: { width: 834, height: 1194, deviceScaleFactor: 1 }, desktop: { width: 1440, height: 900, deviceScaleFactor: 1 } };
(async () => {
  let browser;
  const args = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
  browser = await chromium.launch({ args, ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}) });
  for (const vp of viewports) {
    const ctx = await browser.newContext({ viewport: { width: VP[vp].width, height: VP[vp].height }, deviceScaleFactor: VP[vp].deviceScaleFactor, isMobile: !!VP[vp].isMobile, hasTouch: !!VP[vp].hasTouch });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
    const settle = (ms = 1600) => page.waitForTimeout(ms);
    await page.goto(BASE + '/bldr/builder', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.bs-root', { timeout: 60000 });
    await page.evaluate(() => localStorage.removeItem('site00.builderStudio.draft.v1'));
    await page.goto(BASE + '/bldr/builder/place', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.bs-root', { timeout: 60000 });
    await settle(2500);
    await page.screenshot({ path: path.join(OUT, `${vp}-01-place-empty.png`) });
    await page.getByRole('radio', { name: /SIMPLE/ }).click();
    await settle();
    await page.screenshot({ path: path.join(OUT, `${vp}-01-place.png`) });
    await page.getByRole('radio', { name: /ADVANCED/ }).click();
    await settle(900);
    await page.getByRole('button', { name: /^CONTINUE/ }).click();
    await page.waitForSelector('.bs-room--feel');
    await page.getByRole('radio', { name: /MODERN/ }).click();
    await settle();
    await page.screenshot({ path: path.join(OUT, `${vp}-02-feel.png`) });
    await page.getByRole('button', { name: /^CONTINUE/ }).click();
    await page.waitForSelector('.bs-room--work');
    await settle();
    await page.screenshot({ path: path.join(OUT, `${vp}-03-work.png`) });
    await page.getByRole('button', { name: 'SHOP' }).click();
    await page.getByRole('button', { name: 'BOOKING' }).click();
    await settle();
    await page.screenshot({ path: path.join(OUT, `${vp}-03-work-selected.png`) });
    await page.getByRole('button', { name: /^CONTINUE/ }).click();
    await page.waitForSelector('.bs-room--pace');
    await settle();
    await page.screenshot({ path: path.join(OUT, `${vp}-04-pace.png`) });
    await page.getByRole('button', { name: /REVIEW MY BLUEPRINT/ }).click();
    await page.waitForSelector('.bs-room--blueprint');
    await settle(2200);
    await page.screenshot({ path: path.join(OUT, `${vp}-05-blueprint.png`) });
    console.log(vp, 'errors:', JSON.stringify(errors.slice(0, 8)));
    await ctx.close();
  }
  await browser.close();
})().catch((e) => { console.error('FAILED', e); process.exit(1); });
