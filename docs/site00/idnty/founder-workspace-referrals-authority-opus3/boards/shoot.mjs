#!/usr/bin/env node
// Dev/evidence helper: screenshot specimen states at true viewports.
// node shoot.mjs <outDir> "<query>" WxH [WxH ...]   e.g. node shoot.mjs /tmp/x "page=overview" 1440x900 390x844
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { start, SPECIMEN } from './lib.mjs';

const [out, query, ...sizes] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const { base, data, browser, close } = await start(5251);
try {
  for (const s of sizes) {
    const [w, h] = s.split('x').map(Number);
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const errs = [];
    page.on('pageerror', (e) => errs.push(String(e)));
    page.on('response', (r) => r.status() >= 400 && errs.push(`${r.status()} ${r.url()}`));
    await page.addInitScript(`window.__DF = ${JSON.stringify(data)};`);
    await page.goto(`${base}/${SPECIMEN}?${query}`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 20000 }).catch(() => errs.push('not ready'));
    const f = join(out, `${query.replace(/[^a-z0-9]+/gi, '_')}-${w}x${h}.png`);
    await page.screenshot({ path: f });
    console.log(f, errs.join(' | '));
    await page.close();
  }
} finally {
  await close();
}
