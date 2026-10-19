#!/usr/bin/env node
// Dev/evidence helper: many specimen states in one browser session, plus the layout measure() per shot.
// node batch-shoot.mjs <outDir> <listFile>   (list lines: "<query> WxH [WxH ...]")
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { start, SPECIMEN, measure } from './lib.mjs';

const [out, list] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const jobs = readFileSync(list, 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
const { base, data, browser, close } = await start(5252);
try {
  for (const line of jobs) {
    const [query, ...sizes] = line.split(/\s+/);
    for (const s of sizes) {
      const [w, h] = s.split('x').map(Number);
      const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
      const errs = [];
      page.on('pageerror', (e) => errs.push(String(e)));
      page.on('response', (r) => r.status() >= 400 && errs.push(`${r.status()} ${r.url()}`));
      await page.addInitScript(`window.__DF = ${JSON.stringify(data)};`);
      await page.goto(`${base}/${SPECIMEN}?${query}`, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 20000 }).catch(() => errs.push('not ready'));
      const m = await page.evaluate(measure).catch((e) => ({ err: String(e) }));
      const hard = Object.entries(m).filter(([k, v]) => Array.isArray(v) && v.length && k !== 'stretch').map(([k, v]) => `${k}:${JSON.stringify(v.slice(0, 2)).slice(0, 160)}`);
      const f = join(out, `${query.replace(/[^a-z0-9]+/gi, '_')}-${w}x${h}.png`);
      await page.screenshot({ path: f });
      console.log(`${query} ${s} ${errs.join(' | ')} ${hard.join(' ; ')}`);
      await page.close();
    }
  }
} finally {
  await close();
}
