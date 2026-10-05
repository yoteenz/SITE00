#!/usr/bin/env node
/**
 * Live WORKSPACE_SELF DESIGN capture (Playwright) — QA / founder pipeline proof.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const OUT = process.argv[2] ?? '/opt/cursor/artifacts/design-workspace-self-capture1';
const BASE = process.argv[3] ?? 'http://127.0.0.1:5174';
const ROUTE = '/projects/design/ndxbook';
const URL = `${BASE}${ROUTE}?goldenDiffCapture=1`;
const SELECTOR = '[data-testid="twin-opus-direct-screen"]';

const VIEWPORTS = {
  MOBILE: { width: 390, height: 844, deviceScaleFactor: 2 },
  DESKTOP: { width: 1440, height: 1024, deviceScaleFactor: 1 },
};

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });

for (const [name, vp] of Object.entries(VIEWPORTS)) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.deviceScaleFactor });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector(SELECTOR, { timeout: 45000 });
  await page.waitForTimeout(2500);
  const path = `${OUT}/workspace-self-${name.toLowerCase()}-current.png`;
  await page.screenshot({ path, fullPage: false });
  await ctx.close();
  console.log('OK', name, path);
}
await browser.close();

await writeFile(
  `${OUT}/capture-meta.json`,
  JSON.stringify({ route: ROUTE, url: URL, viewports: VIEWPORTS, at: new Date().toISOString() }, null, 2),
);
console.log('Wrote', OUT);
