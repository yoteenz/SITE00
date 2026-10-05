#!/usr/bin/env node
/** Capture computed nav typography at key viewports for sprint receipt. */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const base = (process.argv[2] ?? 'http://127.0.0.1:5174').replace(/\/$/, '');
const outDir = '/opt/cursor/artifacts/production-nav-typography-qa';
mkdirSync(outDir, { recursive: true });

const viewports = [
  ['desktop', 1672, 941],
  ['tablet-landscape', 1448, 1086],
  ['tablet-portrait', 1086, 1448],
  ['mobile-390', 390, 844],
  ['mobile-360', 360, 844],
  ['mobile-430', 430, 932],
];

async function sample(page) {
  const navLabel = page.locator('[data-testid="nav-experience"] span').last();
  const topBrand = page.locator('[data-testid="production-workspace-header"] .ph-top__brand b');
  const pick = async (loc) => {
    if ((await loc.count()) === 0) return null;
    return loc.evaluate((el) => {
      const cs = getComputedStyle(el);
      let zoom = 1;
      let node = el;
      while (node && node instanceof Element) {
        const z = getComputedStyle(node).zoom;
        if (z && z !== 'normal' && z !== '1') zoom *= Number(z);
        node = node.parentElement;
      }
      return {
        fontSize: cs.fontSize,
        lineHeight: cs.lineHeight,
        letterSpacing: cs.letterSpacing,
        fontWeight: cs.fontWeight,
        transform: cs.transform,
        zoomProduct: zoom,
        width: cs.width,
      };
    });
  };
  return {
    experienceLabel: await pick(navLabel),
    topBrand: await pick(topBrand),
  };
}

const browser = await chromium.launch({ headless: true });
const report = { base, samples: {}, onePxTest: null };

for (const [name, w, h] of viewports) {
  const context = await browser.newContext({ viewport: { width: w, height: h } });
  await context.addInitScript(() => {
    localStorage.setItem('isSignedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify({ email: 'kateenaarmstrong@gmail.com', role: 'admin' }));
  });
  const page = await context.newPage();
  await page.goto(`${base}/production/ndxbook/design`, { waitUntil: 'networkidle', timeout: 120_000 });
  await page.getByTestId('hub-bottom-nav').waitFor({ state: 'visible', timeout: 60_000 });
  report.samples[name] = await sample(page);
  await page.screenshot({ path: join(outDir, `${name}.png`) });
  await context.close();
}

const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await ctx.addInitScript(() => {
  localStorage.setItem('isSignedIn', 'true');
  localStorage.setItem('currentUser', JSON.stringify({ email: 'kateenaarmstrong@gmail.com', role: 'admin' }));
});
const page = await ctx.newPage();
await page.goto(`${base}/production/ndxbook/design`, { waitUntil: 'networkidle', timeout: 120_000 });
await page.getByTestId('nav-design').waitFor({ state: 'visible', timeout: 60_000 });
const before = await page.getByTestId('nav-design').locator('span').last().evaluate((el) => getComputedStyle(el).fontSize);
await page.addStyleTag({ content: `[data-testid="nav-design"] span{font-size:calc(${before} + 1px)!important}` });
const after = await page.getByTestId('nav-design').locator('span').last().evaluate((el) => getComputedStyle(el).fontSize);
report.onePxTest = { before, after, deltaPx: parseFloat(after) - parseFloat(before) };
await ctx.close();
await browser.close();

writeFileSync(join(outDir, 'forensics.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
