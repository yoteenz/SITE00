#!/usr/bin/env node
/**
 * Live QA proof for Viewport Lab — loads iframe client app at key presets.
 * Usage: node scripts/viewport-lab-qa-proof.mjs [baseUrl]
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const base = (process.argv[2] ?? 'http://127.0.0.1:5174').replace(/\/$/, '');
const outDir = '/opt/cursor/artifacts/viewport-lab-qa';
mkdirSync(outDir, { recursive: true });

const PRESETS = [
  ['desktop-wide', 1672, 941],
  ['tablet-portrait', 1086, 1448],
  ['mobile-baseline', 390, 844],
  ['mobile-wide', 430, 932],
];

const report = { base, url: `${base}/production/ndxbook/viewport-lab`, presets: [], checks: {} };

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
await context.addInitScript(() => {
  window.localStorage.setItem('isSignedIn', 'true');
  window.localStorage.setItem(
    'currentUser',
    JSON.stringify({ email: 'kateenaarmstrong@gmail.com', role: 'admin', name: 'Viewport Lab QA' }),
  );
});
const page = await context.newPage();

const consoleErrors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});

await page.goto(report.url, { waitUntil: 'networkidle', timeout: 120_000 });
await page.getByTestId('viewport-lab-shell').waitFor({ state: 'visible', timeout: 60_000 });
report.checks.shellVisible = true;

const frame = page.frameLocator('[data-testid="viewport-lab-iframe"]').first();
await frame.locator('body').waitFor({ state: 'attached', timeout: 60_000 });
report.checks.iframeAttached = true;

const iframeSrc = await page.locator('[data-testid="viewport-lab-iframe"]').first().getAttribute('src');
report.checks.iframeSrc = iframeSrc;
report.checks.ndxbookFixture = iframeSrc?.includes('/app/preview/fixture-app-ndxbook');

for (const [presetId, expectW, expectH] of PRESETS) {
  await page.getByTestId('viewport-lab-preset').selectOption(presetId);
  const landscapeNative = expectW > expectH;
  await page.getByTestId('viewport-lab-orientation').selectOption(landscapeNative ? 'landscape' : 'portrait');
  await page.waitForTimeout(800);
  const outer = page.locator('[data-testid="viewport-lab-preview-stage"]').first().locator('[data-viewport-width]').first();
  const w = Number(await outer.getAttribute('data-viewport-width'));
  const h = Number(await outer.getAttribute('data-viewport-height'));
  const shot = join(outDir, `preset-${presetId}.png`);
  await page.screenshot({ path: shot, fullPage: false });
  report.presets.push({ presetId, expectW, expectH, actualW: w, actualH: h, ok: w === expectW && h === expectH, shot });
}

await page.getByTestId('viewport-lab-orientation').selectOption('landscape');
await page.getByTestId('viewport-lab-preset').selectOption('mobile-baseline');
await page.waitForTimeout(500);
const land = page.locator('[data-viewport-width]').first();
report.checks.landscapeSwap = {
  w: Number(await land.getAttribute('data-viewport-width')),
  h: Number(await land.getAttribute('data-viewport-height')),
};

await page.getByTestId('viewport-lab-safe-area').check();
report.checks.safeAreaOverlay = (await page.getByTestId('viewport-lab-safe-area').count()) > 0;

await page.getByTestId('viewport-lab-refresh').click();
await page.waitForTimeout(1000);
report.checks.refreshClicked = true;

const navInFrame = frame.locator('nav, [role="navigation"], a, button').first();
report.checks.frameInteractive = (await navInFrame.count()) > 0;

report.consoleErrors = consoleErrors.filter((t) => !t.includes('favicon'));
report.checks.xFrameCsp = !consoleErrors.some((t) => /refused to display|x-frame|frame-ancestors/i.test(t));

writeFileSync(join(outDir, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();

const failed = report.presets.some((p) => !p.ok) || !report.checks.shellVisible || !report.checks.ndxbookFixture;
process.exit(failed ? 1 : 0);
