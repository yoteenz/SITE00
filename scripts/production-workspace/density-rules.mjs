#!/usr/bin/env node
/**
 * P0.SITE00.PRODUCTION-WORKSPACE.RESPONSIVE-DENSITY-MEDIA-FRAMING-REFINEMENT1 — winning font-size rule forensics.
 *
 * For every text-bearing element in the workspace body, asks Chrome (DevTools protocol, CSS domain) which
 * stylesheet rule wins `font-size` (own rule, else the nearest inherited one) and records selector, source
 * file, line and computed size. This is the map the density layer overrides — no guessed selectors.
 *
 *   BASE=http://127.0.0.1:5174 OUT=<dir> VIEWPORT=mobile node scripts/production-workspace/density-rules.mjs
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { CHILD_PAGES, ROOT_TABS, VIEWPORTS } from './density-routes.mjs';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5174';
const OUT = process.env.OUT ?? 'density-rules';
const VP = process.env.VIEWPORT ?? 'mobile';
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null;
const ROUTES = [...ROOT_TABS, ...CHILD_PAGES];

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/opt/pw-browsers/chromium' });
const vp = VIEWPORTS[VP];
const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, isMobile: vp.isMobile, hasTouch: vp.hasTouch });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
const sheets = new Map();
cdp.on('CSS.styleSheetAdded', ({ header }) => sheets.set(header.styleSheetId, (header.sourceURL || '').split('/').pop().split('?')[0]));
await cdp.send('DOM.enable');
await cdp.send('CSS.enable');
await page.goto(BASE + '/production', { waitUntil: 'load' });
await page.waitForTimeout(2500);

const out = {};
for (const r of ROUTES) {
  if (ONLY && !ONLY.has(r.id)) continue;
  const nav = (path) =>
    page.evaluate((path) => {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }, path);
  await nav('/production/activity?__hop=1');
  await page.waitForTimeout(250);
  await nav(r.route);
  await page.waitForTimeout(1600);
  if (r.click) {
    await page.locator(r.click).first().click({ timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(1000);
  }
  const count = await page.evaluate(() => {
    document.querySelectorAll('[data-dq]').forEach((e) => e.removeAttribute('data-dq'));
    const scroll = document.querySelector('[data-testid="production-authority-scroll"]') ?? document.querySelector('.pw-scroll');
    const root = scroll?.querySelector('.pxa-body') ?? scroll;
    if (!root) return 0;
    let i = 0;
    for (const el of root.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const b = el.getBoundingClientRect();
      if (!b.width || !b.height) continue;
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!own) continue;
      el.setAttribute('data-dq', String(i++));
    }
    return i;
  });
  const { root } = await cdp.send('DOM.getDocument', { depth: 0 });
  const { nodeIds } = await cdp.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: '[data-dq]' });
  const groups = new Map();
  for (const nodeId of nodeIds.slice(0, 400)) {
    const info = await page.evaluate((i) => {
      const el = document.querySelector(`[data-dq="${i}"]`);
      return el ? { fs: parseFloat(getComputedStyle(el).fontSize), text: el.textContent.trim().slice(0, 32), tag: el.tagName.toLowerCase() } : null;
    }, (await cdp.send('DOM.getAttributes', { nodeId })).attributes.reduce((acc, v, k, arr) => (arr[k - 1] === 'data-dq' ? v : acc), null));
    if (!info) continue;
    const m = await cdp.send('CSS.getMatchedStylesForNode', { nodeId });
    const pick = (rules) => {
      for (let k = rules.length - 1; k >= 0; k--) {
        const rule = rules[k].rule;
        if (rule.origin !== 'regular') continue;
        if (rule.style.cssProperties.some((p) => p.name === 'font-size' && !p.disabled && p.value)) {
          const sel = rules[k].matchingSelectors.map((ix) => rule.selectorList.selectors[ix].text).join(', ');
          const media = (rule.media ?? []).map((x) => x.text).join(' ');
          return { sel, file: sheets.get(rule.styleSheetId) ?? '?', line: (rule.style.range?.startLine ?? 0) + 1, media };
        }
      }
      return null;
    };
    let src = pick(m.matchedCSSRules ?? []);
    let inherited = 0;
    for (let d = 0; !src && d < (m.inherited ?? []).length; d++) {
      src = pick(m.inherited[d].matchedCSSRules ?? []);
      inherited = d + 1;
    }
    const key = src ? `${src.file}:${src.line} ${src.sel}` : '(none)';
    const g = groups.get(key) ?? { ...src, inherited, fs: info.fs, n: 0, samples: [] };
    g.n++;
    if (g.samples.length < 3) g.samples.push(`${info.tag}:${info.text}`);
    g.fs = Math.max(g.fs, info.fs);
    groups.set(key, g);
  }
  out[r.id] = [...groups.values()].sort((a, b) => b.fs - a.fs);
  console.log(`${r.id.padEnd(30)} text=${count} rules=${groups.size}`);
}
await browser.close();
writeFileSync(`${OUT}/rules-${VP}.json`, JSON.stringify(out, null, 1));
