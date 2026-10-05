/**
 * JURNL F01 live runtime capture (P0.JURNL.SITE00-INGEST-F01). Captures every F01 screen (+ optional states /
 * overlays) at the three JURNL viewport targets from the REAL runtime route /production/jurnl/runtime/*.
 * Usage: node scripts/jurnl/capture-f01.mjs <baseUrl> <outDir> [viewports=mobile,tablet,desktop] [filter]
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { qaChromiumPath } from './qa-env.mjs';

export const VIEWPORTS = { mobile: { width: 393, height: 852 }, tablet: { width: 834, height: 1194 }, desktop: { width: 1440, height: 900 } };
export const SCREENS = [
  ['F01.00', 'entry'],
  ['F01.01', 'entry/create'],
  ['F01.02', 'entry/verify-email'],
  ['F01.03', 'entry/sign-in'],
  ['F01.04', 'entry/unlock'],
  ['F01.05', 'entry/forgot-password'],
  ['F01.06', 'entry/reset-sent'],
  ['F01.07', 'entry/new-password'],
  ['F01.08', 'entry/reset-success'],
  ['F01.09', 'entry/biometric'],
  ['F01.10', 'entry/device-trust'],
  ['F01.11', 'entry/privacy'],
  ['F01.12', 'entry/security'],
  ['F01.13', 'entry/complete'],
];

const [base = 'http://127.0.0.1:5174', out = 'artifacts/jurnl-f01-live-qa', vps = 'mobile,tablet,desktop', filter = ''] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: qaChromiumPath() });
const rows = [];
for (const vp of vps.split(',')) {
  const page = await browser.newPage({ viewport: VIEWPORTS[vp], deviceScaleFactor: 1 });
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e)));
  for (const [id, route] of SCREENS) {
    if (filter && !id.includes(filter) && !route.includes(filter)) continue;
    const [path, query] = route.split('?');
    await page.goto(`${base}/production/jurnl/runtime/${path}${query ? `?${query}` : ''}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-jrn-screen]', { timeout: 15000 });
    await page.waitForTimeout(900);
    const file = `${vp}-${id}.png`;
    await page.screenshot({ path: join(out, file) });
    const m = await page.evaluate(() => {
      const root = document.querySelector('.jrn');
      const text = root ? root.innerText : '';
      const lower = (text.match(/[a-z]/g) || []).length;
      const scroll = document.documentElement.scrollWidth > window.innerWidth + 1;
      return { lowercaseChars: lower, horizontalOverflow: scroll, screen: document.querySelector('[data-jrn-screen]')?.getAttribute('data-jrn-screen') };
    });
    rows.push({ viewport: vp, id, route, file, ...m, pageErrors: errs.splice(0) });
  }
  await page.close();
}
await browser.close();
writeFileSync(join(out, 'CAPTURE_REPORT.json'), JSON.stringify(rows, null, 2));
console.log(JSON.stringify(rows.map((r) => [r.viewport, r.id, r.screen, r.lowercaseChars, r.horizontalOverflow, r.pageErrors.length])));
