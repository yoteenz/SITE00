#!/usr/bin/env node
/**
 * P0.STUDIOOS.PRODUCTION.AUTHORITY-ALIGNMENT.SONNET1R1 — live browser QA.
 *
 * Opens the RUNNING app, visits all 36 states (12 screens x mobile/tablet/desktop) at the exact authority
 * artboard viewports, saves a screenshot per state and records DOM geometry assertions.
 *
 *   BASE=http://localhost:5190 OUT=/opt/cursor/artifacts/production-authority node scripts/production-authority/capture-matrix.mjs
 *
 * Authority images are QA inputs only; this script never ships them. Output: screenshots + matrix.json.
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const BASE = process.env.BASE ?? 'http://localhost:5190';
const OUT = process.env.OUT ?? '/opt/cursor/artifacts/production-authority';
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null;
const CHROME = process.env.CHROME ?? '/usr/local/bin/google-chrome';

const VIEWPORTS = {
  mobile: { width: 360, height: 640, deviceScaleFactor: 2 },
  tablet: { width: 1024, height: 768, deviceScaleFactor: 1 },
  desktop: { width: 1280, height: 720, deviceScaleFactor: 1 },
};

const SCREENS = [
  { id: 'hub', route: '/production', nav: 'hub', files: ['5922', '6004', '5981'] },
  { id: 'inbox', route: '/production/queue', nav: 'inbox', files: ['5924', '6005', '5982'] },
  { id: 'experience', route: '/production/ndxbook/experience', nav: 'experience', files: ['5925', '6006', '5988'] },
  { id: 'expression', route: '/production/ndxbook/expression', nav: 'expression', files: ['5957', '6007', '5989'] },
  { id: 'library', route: '/production/libraries', nav: 'library', files: ['5979', '6008', '5990'] },
  { id: 'activity', route: '/production/activity', nav: 'activity', files: ['5936', '6009', '5991'] },
  { id: 'design-brand', route: '/production/ndxbook/design?mode=brand', nav: 'design', mode: 'brand', files: ['5968', '6010', '5983'] },
  { id: 'design-experience', route: '/production/ndxbook/design?mode=experience', nav: 'design', mode: 'experience', files: ['5963', '6019', '5992'] },
  { id: 'design-surfaces', route: '/production/ndxbook/design?mode=surfaces', nav: 'design', mode: 'surfaces', files: ['5969', '6011', '5984'] },
  { id: 'design-compiler', route: '/production/ndxbook/design?mode=compiler', nav: 'design', mode: 'compiler', files: ['5970', '6012', '5985'] },
  { id: 'design-assets', route: '/production/ndxbook/design?mode=assets', nav: 'design', mode: 'assets', files: ['5974', '6013', '5986'] },
  { id: 'design-viewport', route: '/production/ndxbook/design?mode=viewport', nav: 'design', mode: 'viewport', files: ['5975', '6014', '5987'] },
];
const FAMILIES = ['mobile', 'tablet', 'desktop'];
const NAV_ORDER = ['hub', 'inbox', 'experience', 'design', 'expression', 'library', 'activity'];

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
const rows = [];

for (const family of FAMILIES) {
  mkdirSync(`${OUT}/${family}`, { recursive: true });
  const ctx = await browser.newContext({ viewport: VIEWPORTS[family], deviceScaleFactor: VIEWPORTS[family].deviceScaleFactor, isMobile: family === 'mobile', hasTouch: family === 'mobile' });
  await ctx.addInitScript(() => {
    try {
      sessionStorage.setItem('site00-immersive-complete', '1');
    } catch {
      /* ignore */
    }
  });
  for (const [i, s] of SCREENS.entries()) {
    const key = `${family}-${s.id}`;
    if (ONLY && !ONLY.has(key) && !ONLY.has(family) && !ONLY.has(s.id)) continue;
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
    await page.goto(BASE + s.route, { waitUntil: 'load' });
    await page.waitForSelector('[data-testid="production-authority-frame"]', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1800);
    const m = await page.evaluate(
      ({ nav }) => {
        const r = (el) => {
          if (!el) return null;
          const b = el.getBoundingClientRect();
          return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) };
        };
        const q = (sel) => document.querySelector(sel);
        const frame = q('[data-testid="production-authority-frame"]');
        const top = q('[data-testid="production-workspace-header"]');
        const bottom = q('[data-testid="hub-bottom-nav"]');
        const items = [...document.querySelectorAll('[data-testid="hub-bottom-nav"] a')];
        const active = items.find((a) => a.getAttribute('aria-current') === 'page');
        const hostTop = q('.pxh-top');
        const cluster = q('.pxh-top__cluster');
        const menu = q('.pxh-top__menu');
        const first = items[0];
        const icon0 = first?.querySelector('.pxh-nav__icon, .ph-nav__icon');
        const label0 = first?.lastElementChild;
        const scroll = q('[data-testid="production-authority-scroll"]');
        const comp = (el, prop) => (el ? getComputedStyle(el)[prop] : null);
        const chromeNodes = [...document.querySelectorAll('.pxh-strip, .pxh-strip *')];
        const scaleViolations = chromeNodes.filter((n) => {
          const cs = getComputedStyle(n);
          return (cs.zoom && cs.zoom !== '1') || (cs.transform && cs.transform !== 'none');
        }).length;
        return {
          hasFrame: !!frame,
          bodyOverflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
          scrollOverflowX: scroll ? scroll.scrollWidth > scroll.clientWidth + 1 : null,
          scrollH: scroll ? { client: scroll.clientHeight, scroll: scroll.scrollHeight } : null,
          top: r(top),
          bottom: r(bottom),
          navLabels: items.map((a) => a.lastElementChild.textContent.trim()),
          navActive: active?.getAttribute('data-testid')?.replace('nav-', '') ?? null,
          hostTop: !!hostTop,
          clusterRect: r(cluster),
          menuRect: r(menu),
          navLayout: bottom?.getAttribute('data-nav-layout') ?? 'stacked',
          iconLeftOfLabel: icon0 && label0 ? icon0.getBoundingClientRect().right <= label0.getBoundingClientRect().left + 1 : null,
          iconAboveLabel: icon0 && label0 ? icon0.getBoundingClientRect().bottom <= label0.getBoundingClientRect().top + 2 : null,
          scaleViolations,
          projectText: q('.pxh-top__project')?.textContent?.trim() ?? top?.textContent?.trim().slice(0, 80) ?? null,
          modes: [...document.querySelectorAll('[data-testid="design-modes"] a')].map((a) => a.textContent.trim()),
          activeMode: q('[data-testid="design-modes"] a.is-active')?.textContent?.trim() ?? null,
          bodyText: (scroll?.innerText ?? '').replace(/\s+/g, ' ').slice(0, 140),
          navFixedBottom: bottom ? Math.abs(bottom.getBoundingClientRect().bottom - window.innerHeight) < 2 : null,
        };
      },
      { nav: s.nav },
    );
    const file = `${String(i + 1).padStart(2, '0')}-${s.id}-${family}.png`;
    await page.screenshot({ path: `${OUT}/${family}/${file}`, fullPage: false });
    rows.push({ family, screen: s.id, order: i + 1, authority: `IMG_${s.files[FAMILIES.indexOf(family)]}`, screenshot: `${family}/${file}`, errors, ...m });
    await page.close();
  }
  await ctx.close();
}
await browser.close();

const checks = rows.map((r) => {
  const fails = [];
  if (!r.hasFrame) fails.push('no authority frame');
  if (r.bodyOverflowX) fails.push('page horizontal overflow');
  if (r.scrollOverflowX) fails.push('body horizontal overflow');
  if (r.navLabels.join('|') !== NAV_ORDER.map((x) => x.toUpperCase()).join('|')) fails.push(`nav order ${r.navLabels.join(',')}`);
  if (r.navActive !== SCREENS.find((s) => s.id === r.screen).nav) fails.push(`active nav ${r.navActive}`);
  if (r.family !== 'mobile') {
    if (!r.hostTop) fails.push('no host top');
    if (r.navLayout !== 'horizontal' || !r.iconLeftOfLabel) fails.push('nav not icon-left');
    if (r.menuRect && Math.abs(r.menuRect.x + r.menuRect.w - VIEWPORTS[r.family].width) > 2) fails.push('menu not at far right');
    if (r.clusterRect && r.menuRect && r.clusterRect.x + r.clusterRect.w > r.menuRect.x) fails.push('cluster overlaps menu');
    if (r.scaleViolations) fails.push(`host chrome scale violations ${r.scaleViolations}`);
    if (!r.navFixedBottom) fails.push('nav not anchored bottom');
  } else if (!r.iconAboveLabel) fails.push('mobile nav icon not above label');
  if (r.screen.startsWith('design-') && r.modes.join('|') !== 'BRAND|EXPERIENCE|SURFACES|COMPILER|ASSETS|VIEWPORT') fails.push(`modes ${r.modes.join(',')}`);
  if (r.screen.startsWith('design-') && r.activeMode !== r.screen.replace('design-', '').toUpperCase()) fails.push(`active mode ${r.activeMode}`);
  if (r.errors.length) fails.push(`page errors ${r.errors.length}`);
  return { ...r, fails, pass: fails.length === 0 };
});
writeFileSync(`${OUT}/matrix.json`, JSON.stringify(checks, null, 2));
const pass = checks.filter((c) => c.pass).length;
for (const c of checks) console.log(`${c.pass ? 'PASS' : 'FAIL'} ${c.family.padEnd(7)} ${c.screen.padEnd(18)} ${c.authority} ${c.fails.join('; ')}`);
console.log(`\n${pass}/${checks.length} structural checks passing`);
