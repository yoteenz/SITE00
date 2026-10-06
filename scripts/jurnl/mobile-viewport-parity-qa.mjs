/**
 * SITE00 VIEWPORT PREVIEW ↔ LIVE RUNTIME PARITY for the JURNL mobile composition frame.
 * Opens SITE 00 → DESIGN → JURNL → VIEWPORT (MOBILE preset, 393×852), reads the runtime INSIDE the viewport iframe,
 * and compares it with the same route opened on its own at 393×852: nav rect + centering, content rect, composition
 * edge, pagination (screens + panels per screen), archetype, nothing under the nav, no body scroll. Then drives
 * NEXT / BACK inside the iframe on a populated device. No preview-only code path exists to pass this.
 * Usage: node scripts/jurnl/mobile-viewport-parity-qa.mjs <siteBase> <outDir>
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { QA_VIEWPORTS, measure, openRoute, seedPopulated } from './mobile-composition-qa.mjs';
import { qaChromiumPath } from './qa-env.mjs';

const FAMILIES = [
  ['F03', 'today'],
  ['F05', 'money'],
  ['F06', 'income'],
  ['F07', 'upcoming'],
  ['F08', 'plan'],
  ['F09', 'safe'],
  ['F10', 'purchases'],
  ['F11', 'trips'],
  ['F12', 'credit'],
  ['F13', 'paydown'],
  ['F14', 'goals'],
  ['F15', 'ahead'],
  ['F16', 'records'],
];
const tid = (t) => `[data-testid="${t}"]`;

const shape = (m) => ({
  viewport: m.viewport_px,
  nav: m.nav,
  plus: m.plus_center_offset,
  content: m.content_rect,
  edge: m.edge,
  screens: m.stack ? m.stack.screen_count : null,
  layout: m.stack ? m.stack.panels.map((p) => `${p.id}@${p.screen}`) : null,
  archetype: m.archetype,
  under_nav: m.under_nav.length,
  column_scroll: m.column_scroll,
});

async function runtimeFrame(page) {
  const el = await page.waitForSelector(`${tid('design-viewport-frame')}[data-project-runtime="jurnl"]`, { timeout: 20000 });
  const frame = await el.contentFrame();
  await frame.waitForSelector('.jrn-screen [data-jrn-stack], .jrn-screen', { timeout: 20000 });
  await frame.evaluate(() => document.fonts?.ready);
  await frame.waitForTimeout(900);
  return frame;
}

async function run() {
  const [site, outDir] = process.argv.slice(2);
  if (!site || !outDir) throw new Error('usage: <siteBase> <outDir>');
  mkdirSync(outDir, { recursive: true });
  const runtimeBase = `${site}/production/jurnl/runtime`;
  const browser = await chromium.launch({ executablePath: qaChromiumPath() });
  const rows = [];

  // A ── empty device, every frame family: preview iframe vs live route.
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(`${site}/production/jurnl/design?mode=viewport&family=F05`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(tid('design-viewport-preset'), { timeout: 30000 });
  await page.selectOption(tid('design-viewport-preset'), 'MOBILE');
  for (const [family, route] of FAMILIES) {
    await page.selectOption(tid('design-viewport-family'), family);
    const frame = await runtimeFrame(page);
    const preview = shape(await measure(frame));
    const live = await openRoute(browser, runtimeBase, route, QA_VIEWPORTS.mobile, 'empty');
    const direct = shape(await measure(live.page));
    await live.context.close();
    const same = JSON.stringify(preview) === JSON.stringify(direct);
    rows.push({ case: `EMPTY_${family}`, pass: same && preview.nav.center_offset === 0 && preview.under_nav === 0, preview, live: direct });
    console.log(`${same ? 'MATCH' : 'DIFF '} ${family} preview=${JSON.stringify(preview.viewport)} screens=${preview.screens} nav_off=${preview.nav?.center_offset}`);
    if (['F05', 'F09', 'F16'].includes(family)) await page.locator(tid('design-viewport-device')).screenshot({ path: join(outDir, `preview_${family}_mobile.jpg`), type: 'jpeg', quality: 78 });
  }

  // B ── populated device: pagination parity + NEXT / BACK inside the preview iframe.
  {
    let frame = await runtimeFrame(page);
    await seedPopulated(frame);
    await page.selectOption(tid('design-viewport-family'), 'F09');
    await runtimeFrame(page);
    await page.selectOption(tid('design-viewport-family'), 'F05');
    frame = await runtimeFrame(page);
    const p1 = shape(await measure(frame));
    await frame.click('[data-jrn-trigger="frame-next"]');
    await frame.waitForTimeout(500);
    const p2 = shape(await measure(frame));
    const label2 = await frame.getAttribute('[data-jrn-stack]', 'aria-label');
    await page.locator(tid('design-viewport-device')).screenshot({ path: join(outDir, 'preview_F05_populated_screen2.jpg'), type: 'jpeg', quality: 78 });
    await frame.click('.jrn-frame .jrn-home__top [data-jrn-trigger$="-back"]');
    await frame.waitForTimeout(500);
    const idxBack = Number(await frame.getAttribute('[data-jrn-stack]', 'data-jrn-screen-index'));

    const live = await openRoute(browser, runtimeBase, 'money', QA_VIEWPORTS.mobile, 'populated');
    const l1 = shape(await measure(live.page));
    await live.page.click('[data-jrn-trigger="frame-next"]');
    await live.page.waitForTimeout(500);
    const l2 = shape(await measure(live.page));
    await live.context.close();
    const same = JSON.stringify(p1) === JSON.stringify(l1) && JSON.stringify(p2) === JSON.stringify(l2);
    rows.push({ case: 'POPULATED_F05_NEXT_BACK_IN_PREVIEW', pass: same && p1.screens === 2 && label2?.endsWith('SCREEN 2 OF 2') && idxBack === 0, preview: { screen1: p1, screen2: p2, region_label_screen2: label2, index_after_back: idxBack }, live: { screen1: l1, screen2: l2 } });
    console.log(`${same ? 'MATCH' : 'DIFF '} F05 populated screens=${p1.screens} back→${idxBack}`);
  }
  await ctx.close();
  await browser.close();
  writeFileSync(join(outDir, 'viewport-parity.json'), `${JSON.stringify(rows, null, 2)}\n`);
  const failed = rows.filter((r) => !r.pass).length;
  console.log(`${rows.length - failed}/${rows.length} PARITY`);
  if (failed) process.exitCode = 1;
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
