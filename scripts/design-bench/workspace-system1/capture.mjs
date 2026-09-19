#!/usr/bin/env node
/**
 * P0.VR.DESIGN.OPUS-WORKSPACE-SYSTEM1 — overlay capture harness.
 *
 * Opens the real production DESIGN workspace and photographs every founder
 * facing overlay at desktop and mobile. This exists because the sprint's
 * failure mode is invisible from source: an overlay reads fine as JSX and
 * still renders as a wall of labels. The only way to know is to look.
 *
 * Usage: node scripts/design-bench/workspace-system1/capture.mjs [outDir] [base]
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { chromium } from 'playwright';

const OUT = process.argv[2] ?? '/opt/cursor/artifacts/workspace-system1/after';
const BASE = process.argv[3] ?? 'http://127.0.0.1:5190';
const ROUTE = '/projects/design/ndxbook';

const DESKTOP = { width: 1440, height: 1024 };
const MOBILE = { width: 390, height: 844 };

/** Surfaces that count as "an overlay is on screen". */
const SURFACE = '.tod-dcs, .s00-dad__panel, .s00-grok-dock__panel, .tod-fsv';

/**
 * Each overlay is opened through the control a founder would press. `pre`
 * runs first (expanding a collapsed group, switching a tab) and `css`/`text`
 * name the control itself. A selector that reaches past the UI would hide the
 * case where the control is unreachable, which is itself a defect worth seeing.
 */
const OVERLAYS = [
  {
    id: '01-viewport-authority',
    pre: ['.tod-pair__head'],
    css: ['.tod-pair__thumb--mobile'],
  },
  { id: '02-opus-agent', css: ['[data-interaction-id="view-row-opus"]'] },
  { id: '03-grok-agent', css: ['[data-interaction-id="view-row-grok"]'] },
  { id: '04-page-assets', css: ['[data-interaction-id="page-system-open-assets"]'] },
  { id: '05-page-pipeline', css: ['[data-interaction-id="pipeline-view-pipeline"]'] },
  { id: '06-readiness', css: ['[data-interaction-id="pipeline-view-readiness"]'] },
  { id: '07-resolve-blocker', css: ['[data-interaction-id="pipeline-resolve-blocker"]'] },
  { id: '08-technical-details', css: ['[data-interaction-id="pipeline-technical-details"]'] },
  { id: '09-pair-review', css: ['[data-interaction-id="rail-pair-review"]'] },
  { id: '10-review-authority', css: ['[data-interaction-id="rail-review-authority"]'] },
  { id: '11-fullscreen', css: ['[data-interaction-id="hero-concept-fullscreen"]'] },
  { id: '12-concept-inspector', text: ['INSPECT CANDIDATE'] },
  { id: '13-compare-concepts', css: ['[data-interaction-id="gallery-compare"]'] },
  { id: '14-batch-edit', css: ['[data-interaction-id="page-system-batch-edit"]'] },
  { id: '15-interaction-inspector', css: ['[data-interaction-id="page-system-interactions"]'] },
  {
    id: '16-view-amendment',
    pre: ['.tod-tabs__list [role="tab"]:last-child'],
    css: ['[data-interaction-id="concept-amendment-view"]'],
  },
  { id: '17-create-framework', css: ['[data-interaction-id="hero-create-framework"]'] },
  { id: '18-composer-handoff', css: ['[data-interaction-id="rail-lock-pair"]'] },
  { id: '19-overflow-menu', css: ['.tod-header__more'] },
  { id: '20-grok-asset-production', css: ['[data-interaction-id="hero-generate-assets"]'] },
  { id: '21-inspect-asset', css: ['[data-interaction-id="page-system-inspect-asset"]'] },
  { id: '22-module-nav', css: ['.tod-nav__cell--menu'] },
];

/** Primary-nav sections are routes, not overlays, but share the same grammar. */
const SECTIONS = ['references', 'assets', 'pages', 'skins', 'history', 'more'];

async function closeAny(page) {
  for (let i = 0; i < 3; i += 1) {
    if (!(await page.locator(SURFACE).count().catch(() => 0))) break;
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(200);
    const close = page
      .locator('.tod-dcs__close, .tod-fsv__close, .s00-dad__close, .s00-grok-dock__close')
      .first();
    if (await close.count().catch(() => 0)) {
      await close.click({ timeout: 1500 }).catch(() => {});
      await page.waitForTimeout(200);
    }
  }
}

async function click(page, selectors, byText) {
  for (const selector of selectors ?? []) {
    const control = page.locator(selector).first();
    if (!(await control.count().catch(() => 0))) continue;
    if (await control.isDisabled().catch(() => false)) return 'disabled';
    await control.scrollIntoViewIfNeeded().catch(() => {});
    if (!(await control.click({ timeout: 4000 }).then(() => true).catch(() => false))) continue;
    return 'clicked';
  }
  for (const label of byText ?? []) {
    const control = page.getByText(label, { exact: false }).first();
    if (!(await control.count().catch(() => 0))) continue;
    await control.scrollIntoViewIfNeeded().catch(() => {});
    if (!(await control.click({ timeout: 4000 }).then(() => true).catch(() => false))) continue;
    return 'clicked';
  }
  return 'missing';
}

async function captureViewport(browser, label, viewport) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const report = [];

  await page.goto(`${BASE}${ROUTE}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500);
  await page.screenshot({ path: path.join(OUT, `00-workspace-${label}.png`), fullPage: true });

  for (const overlay of OVERLAYS) {
    await closeAny(page);
    await click(page, overlay.pre, []);
    if (overlay.pre) await page.waitForTimeout(400);
    const outcome = await click(page, overlay.css, overlay.text);
    await page.waitForTimeout(1200);
    const open = Boolean(await page.locator(SURFACE).count().catch(() => 0));
    const shot = path.join(OUT, `${overlay.id}-${label}.png`);
    await page.screenshot({ path: shot });
    report.push({ overlay: overlay.id, viewport: label, outcome, open, shot });
    console.log(`${open ? 'OPEN    ' : outcome.toUpperCase().padEnd(8)} ${overlay.id} (${label})`);
  }

  await closeAny(page);
  for (const section of SECTIONS) {
    await page.goto(`${BASE}${ROUTE}/${section}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const shot = path.join(OUT, `sec-${section}-${label}.png`);
    await page.screenshot({ path: shot, fullPage: true });
    report.push({ overlay: `sec-${section}`, viewport: label, outcome: 'route', open: true, shot });
    console.log(`ROUTE    sec-${section} (${label})`);
  }

  await context.close();
  return report;
}

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const report = [
  ...(await captureViewport(browser, 'desktop', DESKTOP)),
  ...(await captureViewport(browser, 'mobile', MOBILE)),
];
await browser.close();
await writeFile(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2), 'utf8');
console.log(`\n${report.filter((row) => row.open).length}/${report.length} surfaces reached`);
