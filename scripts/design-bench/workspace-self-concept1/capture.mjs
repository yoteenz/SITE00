#!/usr/bin/env node
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const OUT = process.argv[2] ?? '/opt/cursor/artifacts/design-workspace-self-concept1';
await mkdir(OUT, { recursive: true });

const b = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
for (const [name, url, vp] of [
  ['design-unchanged-mobile', '/projects/design/ndxbook', { width: 390, height: 844 }],
  ['workspace-self-route-mobile', '/system/design/workspace-concepts', { width: 390, height: 844 }],
]) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.goto(`http://127.0.0.1:5174${url}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await p.waitForTimeout(2500);
  await p.screenshot({ path: `${OUT}/${name}.png` });
  await ctx.close();
  console.log('OK', name);
}
await b.close();
