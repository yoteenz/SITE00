/**
 * SITE 00 Builder studio — Blueprint forensic capture (Immersive Blueprint sprint).
 *
 *   node scripts/site00/builder-studio-qa/blueprint-forensics.cjs <outDir> [label]
 *
 * Opens the live Blueprint at the review viewports, walks every section, and records what actually happens:
 * the object key the stage is showing, how much of the stage changes against OVERVIEW (pixels), how long the
 * page becomes, how many interactive targets the section offers and whether any of them drive the object.
 * Writes one viewport capture per section and viewport, a stage crop per section, and `forensics-<label>.json`.
 * The same script runs before and after a change so both sides are captured at identical viewports and states.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { chromium } = require('playwright');

const BASE = process.env.BASE || 'http://127.0.0.1:5174';
const OUT = path.resolve(process.argv[2] || 'docs/site00/builder-experience/hybrid-spatial-studio/immersive-blueprint-qa/before');
const LABEL = process.argv[3] || 'before';
fs.mkdirSync(OUT, { recursive: true });

const VIEWPORTS = {
  '390x844': { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  '393x852': { viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  '834x1194': { viewport: { width: 834, height: 1194 }, deviceScaleFactor: 1 },
  '1440x900': { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};
const ONLY = process.env.VIEWPORTS ? process.env.VIEWPORTS.split(',') : Object.keys(VIEWPORTS);
const TABS = ['OVERVIEW', 'STRUCTURE', 'PAGES', 'FEATURES', 'TIMELINE'];

const waitSync = (page) =>
  page.waitForFunction(() => document.querySelector('.bs-root')?.getAttribute('data-sync') === 'saved', null, { timeout: 30000 });

/** The reference state: ADVANCED · MODERN · PAGES + SHOP + PORTAL · STANDARD (a scope with several pages and features). */
async function toBlueprint(page) {
  await page.goto(BASE + '/bldr/studio', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.bs-room--place');
  await waitSync(page);
  await page.getByRole('radio', { name: /^ADVANCED/ }).click();
  await waitSync(page);
  await page.getByRole('button', { name: /^CONTINUE/ }).click();
  await page.waitForSelector('.bs-room--feel');
  await page.getByRole('radio', { name: /^MODERN/ }).click();
  await waitSync(page);
  await page.getByRole('button', { name: /^CONTINUE/ }).click();
  await page.waitForSelector('.bs-room--work');
  for (const m of ['SHOP', 'PORTAL']) {
    await page.getByRole('button', { name: m, exact: true }).click();
    await waitSync(page);
  }
  await page.getByRole('button', { name: /^CONTINUE/ }).click();
  await page.waitForSelector('.bs-room--pace');
  await page.getByRole('radio', { name: /^STANDARD/ }).click();
  await waitSync(page);
  await page.getByRole('button', { name: /REVIEW MY BLUEPRINT/ }).click();
  await page.waitForSelector('.bs-room--blueprint');
  await waitSync(page);
  await page.waitForSelector('.bs-object__host[data-env]', { timeout: 30000 }).catch(() => undefined);
  await page.evaluate(() => document.fonts.ready);
}

async function stageShot(page) {
  const box = await page.locator('.bs-object.bs-stage').boundingBox();
  return page.screenshot({ type: 'png', clip: box });
}

/** Share of stage pixels that differ from a reference crop by more than a small tolerance. */
async function changed(a, b) {
  const [ra, rb] = await Promise.all([sharp(a).raw().toBuffer({ resolveWithObject: true }), sharp(b).raw().toBuffer({ resolveWithObject: true })]);
  if (ra.info.width !== rb.info.width || ra.info.height !== rb.info.height) return 1;
  const n = ra.info.width * ra.info.height;
  const c = ra.info.channels;
  let moved = 0;
  for (let i = 0; i < n; i += 1) {
    let d = 0;
    for (let k = 0; k < 3; k += 1) d = Math.max(d, Math.abs(ra.data[i * c + k] - rb.data[i * c + k]));
    if (d > 12) moved += 1;
  }
  return moved / n;
}

(async () => {
  const args = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
  const browser = await chromium.launch({ args, ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}) });
  const report = { label: LABEL, base: BASE, state: 'ADVANCED · MODERN · PAGES + SHOP + PORTAL · STANDARD', viewports: {} };
  for (const name of ONLY) {
    const ctx = await browser.newContext({ ...VIEWPORTS[name], reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    page.setDefaultTimeout(90000);
    const errors = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 160)));
    await toBlueprint(page);
    const rows = [];
    let overviewStage = null;
    for (const [i, tab] of TABS.entries()) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.getByRole('tab', { name: new RegExp(tab) }).click();
      await page.waitForTimeout(1400);
      const stage = await stageShot(page);
      if (!overviewStage) overviewStage = stage;
      const facts = await page.evaluate(() => {
        const panel = document.querySelector('.bs-tabpanel');
        const stageEl = document.querySelector('.bs-object.bs-stage');
        const interactive = panel ? [...panel.querySelectorAll('button, a, [role="option"], [role="button"]')] : [];
        return {
          objectKey: stageEl?.getAttribute('data-object-key') ?? null,
          inspect: stageEl?.getAttribute('data-inspect') ?? null,
          pageHeight: document.documentElement.scrollHeight,
          viewportHeight: innerHeight,
          panelHeight: panel ? Math.round(panel.getBoundingClientRect().height) : 0,
          panelTop: panel ? Math.round(panel.getBoundingClientRect().top + scrollY) : 0,
          stageHeight: stageEl ? Math.round(stageEl.getBoundingClientRect().height) : 0,
          textBlocks: panel ? panel.querySelectorAll('p, li, h3, dt, dd').length : 0,
          interactive: interactive.length,
          interactiveLabels: interactive.map((el) => (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40)).slice(0, 12),
          words: panel ? (panel.textContent || '').trim().split(/\s+/).length : 0,
        };
      });
      const share = i === 0 ? 0 : await changed(overviewStage, stage);
      const n = String(i + 1).padStart(2, '0');
      fs.writeFileSync(path.join(OUT, `${name}-${n}-${tab.toLowerCase()}-stage.jpg`), await sharp(stage).jpeg({ quality: 82, mozjpeg: true }).toBuffer());
      await page.screenshot({ path: path.join(OUT, `${name}-${n}-${tab.toLowerCase()}.jpg`), type: 'jpeg', quality: 82 });
      if (name.startsWith('390')) await page.screenshot({ path: path.join(OUT, `${name}-${n}-${tab.toLowerCase()}-full.jpg`), fullPage: true, type: 'jpeg', quality: 82 });
      rows.push({ tab, ...facts, stageChangedVsOverview: Number(share.toFixed(4)) });
      console.log(`${name} ${tab}: key=${facts.objectKey} stageΔ=${(share * 100).toFixed(1)}% page=${facts.pageHeight}px panel=${facts.panelHeight}px items=${facts.textBlocks} targets=${facts.interactive}`);
    }
    report.viewports[name] = { rows, consoleErrors: errors };
    await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, `forensics-${LABEL}.json`), JSON.stringify(report, null, 2));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
