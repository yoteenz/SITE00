#!/usr/bin/env node
/**
 * SITE 00 public redesign — geometry probe (OPUS-CONVERGENCE1).
 *
 * Measures the key layout landmarks of every active authority's live route at the authority frame and
 * writes them as JSON, so the forensic map / delta report compare NUMBERS (y of the panel top, rail
 * centre, title size …) instead of impressions. Run it against two servers (e.g. the Sonnet HEAD
 * worktree and the current branch) and diff the files.
 *
 *   node scripts/site00-public-redesign-geometry.mjs --base http://localhost:5174 --out /tmp/geometry-after.json
 */
import fs from 'node:fs';
import { chromium } from 'playwright';
import { routeProofFonts } from './lib/site00-proof-fonts.mjs';
import { AUTHORITIES, KEY, SIZES } from './lib/site00-public-redesign-authorities.mjs';

const arg = (k, d) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : d);
const BASE = arg('--base', 'http://localhost:5174');
const OUT = arg('--out', '/tmp/site00-public-redesign-geometry.json');

const LANDMARKS = {
  header: '.s00pr-header',
  wordmark: '.s00pr-header__wordmark, .s00pr-header__mark',
  heroTitle: '.s00pr-idhero__title, .s00pr-svchero__title, .s00pr-pathhero__title, .s00pr-originhero__title, .s00pr-locations__title',
  machine: '.s00pr-stage svg, .s00pr-svcstage svg',
  rail: '.s00pr-progression__rail',
  railActive: '.s00pr-progression__node--active',
  panel: '.s00pr-panel, .s00pr-pathpanel, .s00pr-opanel',
  panelHead: '.s00pr-panel__head, .s00pr-pathpanel__head, .s00pr-opanel__head',
  panelCode: '.s00pr-panel__code, .s00pr-pathpanel__code, .s00pr-opanel__number',
  panelTitle: '.s00pr-panel__title, .s00pr-pathpanel__title, .s00pr-opanel__title',
  questionTitle: '.s00pr-question__title',
  firstOption: '.s00pr-tile, .s00pr-card, .s00pr-row, .s00pr-vrow, .s00pr-field, .s00pr-review__row, .s00pr-review__split, .s00pr-vtile',
  actions: '.s00pr-actions, .s00pr-opanel__foot, .s00pr-btn--wide',
  cards: '.s00pr-statecards, .s00pr-svccards, .s00pr-origincards__row, .s00pr-locations__list',
  firstCard: '.s00pr-statecard, .s00pr-svccard, .s00pr-origincard, .s00pr-locrow',
  notSure: '.s00pr-svcnotsure',
  nav: '.s00pr .site00-mobile-nav',
};

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium' });
const out = {};
for (const a of AUTHORITIES) {
  const [w, h] = SIZES[a.size];
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await routeProofFonts(page);
  await page.route('**/api/site00/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"intake":null}' }));
  if (a.seed) await page.addInitScript(([k, v]) => localStorage.setItem(k, JSON.stringify(v)), [KEY, a.seed]);
  await page.goto(BASE + a.route, { waitUntil: 'load' });
  await page.waitForTimeout(1600);
  if (a.action) await a.action(page);
  await page.addStyleTag({ content: '.site00-origin-layout-switch{display:none !important}' });
  out[a.id] = await page.evaluate((landmarks) => {
    const res = { docHeight: document.documentElement.scrollHeight };
    for (const [name, sel] of Object.entries(landmarks)) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      res[name] = { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height), fs: parseFloat(cs.fontSize) };
    }
    return res;
  }, LANDMARKS);
  process.stdout.write('.');
  await ctx.close();
}
await browser.close();
fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log(`\nwrote ${Object.keys(out).length} authorities → ${OUT}`);
