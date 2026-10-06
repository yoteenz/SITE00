#!/usr/bin/env node
/** Founder review board — three final composite authorities only (rerun1). */
import { chromium } from 'playwright';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = join(ROOT, 'JURNL/F09_SAFE/THREE_DISTINCT_COMPOSITE_AUTHORITY_RERUN1');
const COMP = join(OUT, 'COMPOSITES');
const META = [
  ['T01', '01 THE SURVEYED COURTYARD', 'THE OPEN FLOOR', 'Courtyard object · floor inlay ratio'],
  ['T02', '02 THE ANSWER IN RAKING LIGHT', 'THE PLAIN ANSWER', 'Editorial answer · raking light'],
  ['T03', '03 THE SORTING RACK', 'THE OPEN ENVELOPE', 'Sorting rack · sealed categories'],
];
const files = [
  'F09_T01_SURVEYED_COURTYARD_393x852.png',
  'F09_T02_ANSWER_IN_RAKING_LIGHT_393x852.png',
  'F09_T03_SORTING_RACK_393x852.png',
];
const uri = (f) => `data:image/png;base64,${readFileSync(f).toString('base64')}`;
const exe = [process.env.JURNL_QA_CHROMIUM, '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].filter(Boolean).find((p) => existsSync(p));
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const page = await (await browser.newContext({ viewport: { width: 1320, height: 980 }, deviceScaleFactor: 2 })).newPage();
const cards = META.map(([t, title, structural, idea], i) => {
  const img = join(COMP, files[i]);
  return `<figure style="margin:0;width:393px"><img src="${uri(img)}" style="width:393px;height:852px;display:block;box-shadow:0 2px 12px rgba(0,0,0,.08)"/><figcaption style="padding:12px 4px 0;font:600 11px/1.35 Helvetica,sans-serif;letter-spacing:.14em;color:#6E1F2D">${title}</figcaption><p style="margin:6px 0 0;font:400 9px/1.4 Helvetica,sans-serif;letter-spacing:.08em;color:#3b342d;text-transform:uppercase">FINAL COMPOSITE · STRUCTURAL: ${structural}<br/>IDEA: ${idea}</p><p style="margin:4px 0 0;font:400 8px/1.3 Helvetica,sans-serif;color:#8a7a68">NOT A RAW PLATE · PRODUCT CANVAS 393×852</p></figure>`;
}).join('');
await page.setContent(`<body style="margin:0;background:#EDE7DC;display:flex;gap:28px;padding:28px 24px 40px;align-items:flex-start">${cards}</body>`);
await page.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0));
const out = join(OUT, 'FOUNDER_REVIEW_BOARD.png');
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log(out.slice(ROOT.length + 1));
