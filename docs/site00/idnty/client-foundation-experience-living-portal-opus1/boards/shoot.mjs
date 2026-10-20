#!/usr/bin/env node
// Dev helper: render one or more specimens to PNG and print layout-audit findings.
// node shoot.mjs <outDir> "<query>" WxH [full]  (repeat query/size pairs)
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { start, measure, SPECIMEN } from './lib.mjs';

const [out, ...rest] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const jobs = [];
for (let i = 0; i < rest.length; i += 2) jobs.push({ q: rest[i], size: rest[i + 1] });
const { base, data, browser, close } = await start(5262);
try {
  let n = 0;
  for (const j of jobs) {
    const [w, h] = j.size.split('x').map(Number);
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const errs = [];
    page.on('pageerror', (e) => errs.push(String(e)));
    page.on('response', (r) => r.status() >= 400 && errs.push(`${r.status()} ${r.url()}`));
    await page.addInitScript(`window.__DF = ${JSON.stringify(data)};`);
    await page.goto(`${base}/${SPECIMEN}?${j.q}`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 30000 }).catch(() => errs.push('NOT READY'));
    const m = await page.evaluate(measure);
    const file = join(out, `${String(n++).padStart(2, '0')}-${j.q.replace(/[^a-z0-9]+/gi, '_')}-${w}.png`);
    await page.screenshot({ path: file, fullPage: true });
    const hard = Object.entries(m).filter(([k, v]) => k !== 'stretch' && v.length);
    console.log(file, errs.length ? `ERR ${errs.join(' | ')}` : '', hard.length ? JSON.stringify(Object.fromEntries(hard)).slice(0, 900) : 'clean');
    await page.close();
  }
} finally {
  await close();
}
