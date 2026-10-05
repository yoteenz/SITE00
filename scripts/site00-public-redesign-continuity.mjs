#!/usr/bin/env node
/**
 * SITE 00 public redesign — family continuity probe (OPUS-SURGICAL-CLEANUP1).
 * Loads two routes of the same family at the same viewport and diffs the shared landmarks (header,
 * hero, machine, 00–03 rail, panel top/head). Continuity = every shared landmark at the same box.
 *
 *   node scripts/site00-public-redesign-continuity.mjs [--base http://localhost:5174] [--out file.json]
 */
import fs from 'node:fs';
import { chromium } from 'playwright';
import { routeProofFonts } from './lib/site00-proof-fonts.mjs';
import { AUTHORITIES, KEY } from './lib/site00-public-redesign-authorities.mjs';

const arg = (k, d) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : d);
const BASE = arg('--base', 'http://localhost:5174');
const OUT = arg('--out', null);
// [a, b, allowed differences]. AUTHORITY CHECK / REVIEW carry one more head line (AUTHORITY CHECK 03 /
// REVIEW VERIFICATION) exactly as their authorities draw it: the head grows 3–6px, the code re-centres 2–3px.
const PAIRS = [
  ['02_IDNTY_STATE_00_FOUNDATION', '01_FOUNDATION_PRIMARY_GOAL', []],
  ['02_BUILD_READY_EVIDENCE', '01_BUILD_READY_VERIFICATION', []],
  ['02_BUILD_READY_EVIDENCE', '03_BUILD_READY_AUTHORITY_CHECK', ['panelHead', 'panelCode']],
  ['02_BUILD_READY_EVIDENCE', '04_BUILD_READY_REVIEW_VERIFICATION', ['panelHead', 'panelCode']],
];
const VIEWPORTS = [[390, 693], [360, 740], [430, 932], [390, 844]];
const SHARED = {
  header: '.s00pr-header',
  heroTitle: '.s00pr-idhero__title',
  sideNote: '.s00pr-sidenote',
  machine: '.s00pr-stage svg',
  rail: '.s00pr-progression__rail',
  railActive: '.s00pr-progression__node--active',
  panelTop: '.s00pr-panel',
  panelHead: '.s00pr-panel__head',
  panelCode: '.s00pr-panel__code',
  nav: '.s00pr .site00-mobile-nav',
};

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium' });
async function measure(id, [w, h]) {
  const a = AUTHORITIES.find((x) => x.id === id);
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await routeProofFonts(page);
  await page.route('**/api/site00/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"intake":null}' }));
  if (a.seed) await page.addInitScript(([k, v]) => localStorage.setItem(k, JSON.stringify(v)), [KEY, a.seed]);
  await page.goto(BASE + a.route);
  await page.waitForSelector('.s00pr-panel', { timeout: 15000 });
  await page.waitForTimeout(700);
  const res = await page.evaluate((shared) => {
    const out = {};
    for (const [k, sel] of Object.entries(shared)) {
      const r = document.querySelector(sel)?.getBoundingClientRect();
      if (r) out[k] = [Math.round(r.x), Math.round(r.y), Math.round(r.width), k === 'panelTop' ? null : Math.round(r.height)];
    }
    const actions = document.querySelector('.s00pr-actions .s00pr-btn--primary, .s00pr-btn--wide')?.getBoundingClientRect();
    const nav = document.querySelector('.s00pr .site00-mobile-nav')?.getBoundingClientRect();
    out.primaryBottom = actions ? Math.round(actions.bottom) : null;
    out.navTop = nav ? Math.round(nav.top) : null;
    return out;
  }, SHARED);
  await ctx.close();
  return res;
}

const report = [];
let diffs = 0;
for (const vp of VIEWPORTS) {
  for (const [a, b, allowed] of PAIRS) {
    const ma = await measure(a, vp);
    const mb = await measure(b, vp);
    const mismatched = Object.keys(SHARED).filter((k) => JSON.stringify(ma[k]) !== JSON.stringify(mb[k]));
    diffs += mismatched.filter((k) => !allowed.includes(k)).length;
    report.push({ viewport: vp.join('x'), pair: [a, b], allowed, mismatched, a_primaryBottom: ma.primaryBottom, b_primaryBottom: mb.primaryBottom, navTop: ma.navTop, measuredA: ma, measuredB: mb });
    console.log(`${vp.join('x').padEnd(8)} ${a} ↔ ${b}: ${mismatched.length ? `DIFF ${mismatched.join(',')}${mismatched.every((k) => allowed.includes(k)) ? ' (expected: extra head line)' : ' (UNEXPECTED)'}` : 'IDENTICAL shared landmarks'} · primary bottom ${ma.primaryBottom}/${mb.primaryBottom} · nav ${ma.navTop}`);
  }
}
await browser.close();
if (OUT) fs.writeFileSync(OUT, JSON.stringify(report, null, 2));
process.exit(diffs ? 1 : 0);
