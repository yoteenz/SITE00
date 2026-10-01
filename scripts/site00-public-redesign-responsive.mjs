#!/usr/bin/env node
/**
 * SITE 00 public redesign — responsive QA (SONNET-STRUCTURE1).
 * For every covered route × viewport: horizontal overflow, elements poking past the viewport,
 * and whether the last piece of content can be scrolled clear of the fixed bottom navigation.
 *
 *   node scripts/site00-public-redesign-responsive.mjs [--base http://localhost:5174] [--out docs/site00/public-redesign/responsive-qa.json]
 */
import fs from 'node:fs';
import { chromium } from 'playwright';
import { routeProofFonts } from './lib/site00-proof-fonts.mjs';

const arg = (k, d) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : d);
const BASE = arg('--base', 'http://localhost:5174');
const OUT = arg('--out', 'docs/site00/public-redesign/responsive-qa.json');

const ROUTES = [
  '/', '/idnty/state', '/idnty/starting-at-zero', '/idnty/starting-at-zero/goal', '/idnty/starting-at-zero/budget',
  '/idnty/starting-at-zero/review', '/idnty/some-pieces-exist/assets', '/idnty/some-pieces-exist/review',
  '/idnty/ready-for-evolution/timeline', '/idnty/build-ready/evidence', '/idnty/build-ready/review',
  '/bldr/state', '/bldr/state?path=world', '/evolve/state', '/evolve/state?path=transform', '/origin/locations',
];
const PHONES = [[360, 740], [390, 693], [390, 844], [430, 932]];
const WIDE = [[768, 1024], [1024, 768], [1440, 900]];

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium' });
const rows = [];

async function probe(page) {
  return page.evaluate(() => {
    const vw = innerWidth;
    const root = document.querySelector('.s00pr');
    if (!root) return { redesign: false, url: location.pathname + location.search };
    const inArtboard = root.closest('.site00-mobile-artboard, .site00-desktop-artboard');
    const scroller = inArtboard ? root : document.scrollingElement;
    const bounds = root.closest('.site00-mobile-artboard, .site00-desktop-artboard')?.getBoundingClientRect() ?? { left: 0, right: vw };
    const wide = [...root.querySelectorAll('*')].filter((el) => {
      const r = el.getBoundingClientRect();
      // Machine stages intentionally bleed past the frame on tall phones (clipped by .s00pr overflow-x: clip).
      if (!r.width || el.closest('[aria-hidden="true"]') || el.closest('.s00pr-env') || el.closest('.s00pr-stage, .s00pr-svcstage')) return false;
      return r.right > bounds.right + 1 || r.left < bounds.left - 1;
    }).map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 30)}`).slice(0, 4);
    const clipped = [...root.querySelectorAll('button, a, h1, h2, h3, p, span, li')].filter((el) => {
      if (el.closest('[aria-hidden="true"]') || el.closest('.s00pr-env')) return false;
      const cs = getComputedStyle(el);
      return el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0 && (cs.overflow === 'hidden' || cs.textOverflow === 'ellipsis') && cs.textOverflow !== 'ellipsis';
    }).map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 30)}`).slice(0, 4);
    // can the last content be scrolled clear of the nav?
    scroller.scrollTo?.(0, 999999);
    const nav = root.querySelector('.site00-mobile-nav');
    const last = root.querySelector('.s00pr-shell__main')?.lastElementChild;
    let navClear = true;
    if (nav && last) {
      const n = nav.getBoundingClientRect();
      const l = last.getBoundingClientRect();
      navClear = l.bottom <= n.top + 1;
    }
    return {
      redesign: true,
      url: location.pathname + location.search,
      overflowX: document.documentElement.scrollWidth > vw + 1,
      pokesOut: wide,
      clippedText: clipped,
      navClear,
      artboard: Boolean(inArtboard),
    };
  });
}

for (const [w, h] of [...PHONES, ...WIDE]) {
  const isWide = w >= 768;
  for (const route of ROUTES) {
    for (const mode of isWide ? ['default', 'mobile-preview'] : ['default']) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: !isWide, isMobile: !isWide });
      if (mode === 'mobile-preview') await ctx.addInitScript(() => sessionStorage.setItem('site00_preview_device_mode', 'mobile'));
      const page = await ctx.newPage();
      await routeProofFonts(page);
      await page.route('**/api/site00/**', (r) => r.fulfill({ status: 404, body: '{}', contentType: 'application/json' }));
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e).slice(0, 100)));
      await page.goto(BASE + route, { waitUntil: 'load' });
      // Dev servers compile on demand: wait for the shell (or the legacy page) instead of a fixed delay.
      await page.waitForSelector('.s00pr, #root > *', { timeout: 10000 }).catch(() => {});
      await page.waitForSelector('.s00pr', { timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(500);
      const res = await probe(page);
      rows.push({ viewport: `${w}x${h}`, mode, route, ...res, errors });
      await ctx.close();
    }
  }
}
await browser.close();

fs.mkdirSync(OUT.replace(/[^/]+$/, ''), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(rows, null, 2));
const redesign = rows.filter((r) => r.redesign);
const bad = redesign.filter((r) => r.overflowX || (r.pokesOut && r.pokesOut.length) || !r.navClear || r.errors.length);
console.log(`${rows.length} probes · ${redesign.length} rendered the redesign shell · ${bad.length} with issues`);
for (const r of bad) console.log(r.viewport, r.mode, r.route, JSON.stringify({ overflowX: r.overflowX, pokesOut: r.pokesOut, navClear: r.navClear, errors: r.errors }));
