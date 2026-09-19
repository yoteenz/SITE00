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

const OUT = process.argv[2] ?? '/opt/cursor/artifacts/workspace-system1/before';
const BASE = process.argv[3] ?? 'http://127.0.0.1:5190';
const ROUTE = '/projects/design/ndxbook';

const DESKTOP = { width: 1440, height: 1024 };
const MOBILE = { width: 390, height: 844 };

/**
 * Each overlay is opened by clicking visible text, because that is what the
 * founder does. A selector that reaches past the UI would hide the case where
 * the control is unreachable, which is itself a defect worth seeing.
 */
const OVERLAYS = [
  { id: '01-viewport-authority', open: ['AUTHORITY PAIR', 'MOBILE MASTER'] },
  { id: '02-opus-agent', open: ['OPUS'] },
  { id: '03-grok-agent', open: ['GROK'] },
  { id: '04-page-assets', open: ['VIEW ASSETS'] },
  { id: '05-page-pipeline', open: ['VIEW PIPELINE'] },
  { id: '06-readiness', open: ['VIEW READINESS'] },
  { id: '07-resolve-blocker', open: ['RESOLVE BLOCKER'] },
  { id: '09-pair-review', open: ['PAIR REVIEW'] },
  { id: '10-review-authority', open: ['REVIEW AUTHORITY'] },
  { id: '11-fullscreen', open: ['VIEW FULLSCREEN'] },
  { id: '12-concept-inspector', open: ['INSPECT CANDIDATE'] },
  { id: '14-batch-edit', open: ['BATCH EDIT'] },
  { id: '15-interaction-inspector', open: ['OPEN INTERACTION INSPECTOR'] },
  { id: '16-view-amendment', open: ['VIEW AMENDMENT'] },
  { id: '17-create-framework', open: ['CREATE FRAMEWORK'] },
  { id: '18-composer-handoff', open: ['LOCK MOBILE + DESKTOP'] },
];

async function closeAny(page) {
  for (const selector of ['.tod-dcs__close', '[aria-label="Close"]', '.s00-dad__rail']) {
    const control = page.locator(selector).first();
    if (await control.count().catch(() => 0)) {
      await control.click({ timeout: 2000 }).catch(() => {});
      await page.waitForTimeout(250);
    }
  }
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(250);
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
    let opened = false;
    for (const text of overlay.open) {
      const control = page.getByText(text, { exact: false }).first();
      if (!(await control.count().catch(() => 0))) continue;
      await control.scrollIntoViewIfNeeded().catch(() => {});
      await control.click({ timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(1200);
      opened = true;
      break;
    }
    const shot = path.join(OUT, `${overlay.id}-${label}.png`);
    await page.screenshot({ path: shot });
    report.push({ overlay: overlay.id, viewport: label, opened, shot });
    console.log(`${opened ? 'OPENED ' : 'NOTFOUND'} ${overlay.id} (${label})`);
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
console.log(`\n${report.filter((row) => row.opened).length}/${report.length} controls reached`);
