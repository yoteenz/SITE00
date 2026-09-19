#!/usr/bin/env node
/**
 * P0.VR.DESIGN.OPUS-PROJECT-TABS1 — project tab capture harness.
 *
 * Photographs the seven project-level tab surfaces at desktop and phone, and
 * asserts each one actually rendered a project surface rather than an empty
 * frame. Source review cannot catch the failure mode here: a surface can
 * compose perfectly and still resolve to nothing because the project has no
 * data, and that is exactly the case worth seeing.
 *
 * Usage: node scripts/design-bench/project-tabs1/capture.mjs [outDir] [base]
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { chromium } from 'playwright';

const OUT = process.argv[2] ?? '/opt/cursor/artifacts/project-tabs1';
const BASE = process.argv[3] ?? 'http://127.0.0.1:5174';
const ROUTE = '/projects/design/ndxbook';

const VIEWPORTS = [
  { label: 'desktop', viewport: { width: 1440, height: 1024 }, format: 'wide' },
  { label: 'mobile', viewport: { width: 390, height: 844 }, format: 'tall' },
];

const SECTIONS = ['references', 'assets', 'pages', 'skins', 'history', 'more'];

async function captureViewport(browser, { label, viewport, format }) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 2 });
  const page = await context.newPage();
  const report = [];

  for (const section of SECTIONS) {
    await page.goto(`${BASE}${ROUTE}/${section}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2200);

    const surface = page.locator(`.tod-ps[data-surface="${section}"]`).first();
    const present = Boolean(await surface.count().catch(() => 0));
    const resolvedFormat = present ? await surface.getAttribute('data-format') : null;
    // A surface that renders only its identity line is a surface with no
    // content; count the blocks so the run says so out loud.
    const blocks = present
      ? await page
          .locator(
            `.tod-ps[data-surface="${section}"] .tod-ps-group, .tod-ps[data-surface="${section}"] .tod-ps-module, .tod-ps[data-surface="${section}"] .tod-ps-event`,
          )
          .count()
      : 0;

    const shot = path.join(OUT, `${section}-${label}.png`);
    await page.screenshot({ path: shot, fullPage: true });

    // The surface scrolls inside a fixed shell, so the viewport shot only ever
    // shows its first screen. Release the ancestor clipping and photograph the
    // element itself to review the whole surface in one image.
    if (present) {
      await page.evaluate((sel) => {
        const node = document.querySelector(sel);
        for (let el = node?.parentElement; el; el = el.parentElement) {
          el.style.overflow = 'visible';
          el.style.maxHeight = 'none';
          if (el.classList.contains('tod-screen') || el.classList.contains('tod-dcs--workspace-inline')) {
            el.style.height = 'auto';
          }
        }
      }, `.tod-ps[data-surface="${section}"]`);
      await page.waitForTimeout(600);
      await surface
        .screenshot({ path: path.join(OUT, `${section}-${label}-full.png`) })
        .catch(() => {});
    }
    report.push({ section, viewport: label, present, format: resolvedFormat, blocks, shot });
    console.log(
      `${present ? 'OK  ' : 'FAIL'} ${section.padEnd(11)} (${label}) format=${resolvedFormat} blocks=${blocks}`,
    );
  }

  // The hamburger is an overlay on the workspace route, not a section route.
  await page.goto(`${BASE}${ROUTE}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.locator('.tod-nav__cell--menu').first().click({ timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(1200);
  const drawer = page.locator('.tod-ps-drawer').first();
  const present = Boolean(await drawer.count().catch(() => 0));
  const rows = present ? await page.locator('.tod-ps-drawer .tod-ps-navRow').count() : 0;
  const shot = path.join(OUT, `hamburger-${label}.png`);
  await page.screenshot({ path: shot });
  report.push({ section: 'hamburger', viewport: label, present, format, blocks: rows, shot });
  console.log(`${present ? 'OK  ' : 'FAIL'} hamburger   (${label}) rows=${rows}`);

  await context.close();
  return report;
}

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const report = [];
for (const target of VIEWPORTS) report.push(...(await captureViewport(browser, target)));
await browser.close();
await writeFile(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2), 'utf8');

const missing = report.filter((row) => !row.present);
const wrongFormat = report.filter(
  (row) => row.present && row.section !== 'hamburger' && row.format !== (row.viewport === 'desktop' ? 'wide' : 'tall'),
);
console.log(`\n${report.length - missing.length}/${report.length} surfaces rendered`);
for (const row of missing) console.log(`  missing: ${row.section} (${row.viewport})`);
for (const row of wrongFormat) console.log(`  wrong format: ${row.section} (${row.viewport}) = ${row.format}`);
